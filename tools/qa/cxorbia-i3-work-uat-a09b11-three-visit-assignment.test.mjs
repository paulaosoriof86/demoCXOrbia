import test from 'node:test';
import assert from 'node:assert/strict';
import {createOperationalCommandProvider} from '../../backend/runtime/cxorbia-operational-command-provider-v1.mjs';

// I3 A09/B11: isolated in-memory regression, never touches real HR, Firebase or Auth.
const copy=v=>v===undefined?undefined:structuredClone(v);
class Snap {
  constructor(id,v){this.id=id;this.value=copy(v);this.exists=v!==undefined;}
  data(){return copy(this.value);}
}
class Doc {
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(name){return new Collection(this.db,this.path+'/'+name);}
}
class Collection {
  constructor(db,path){this.db=db;this.path=path;}
  doc(id){return new Doc(this.db,this.path+'/'+id);}
}
class MemoryDb {
  constructor(){this.store=new Map();}
  collection(name){return new Collection(this,name);}
  seed(path,record){this.store.set(path,copy(record));}
  get(path){return copy(this.store.get(path));}
  async runTransaction(fn){
    const working=new Map([...this.store].map(([k,v])=>[k,copy(v)]));
    const tx={
      get:async ref=>new Snap(ref.id,working.get(ref.path)),
      create:(ref,value)=>{if(working.has(ref.path))throw Error('ALREADY_EXISTS');working.set(ref.path,copy(value));},
      set:(ref,value,opts={})=>{const old=working.get(ref.path);working.set(ref.path,opts.merge&&old?{...copy(old),...copy(value)}:copy(value));},
      delete:ref=>working.delete(ref.path)
    };
    const result=await fn(tx);
    this.store=working;
    return result;
  }
}
const policy={
  schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,
  allowedTenantIds:['qa-tenant'],allowedProjectIds:['qa-project'],
  conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,
  geminiCalls:false,storageWrites:false,paymentWrites:false
};
const visitPath=id=>'tenants/qa-tenant/projects/qa-project/visits/'+id;
const shopperId='qa-stable-exact-shopper';
const hrRows=['OCTUBRE 26!5','OCTUBRE 26!19','OCTUBRE 26!20'];
const hrVisits=()=>hrRows.map((hrRowId,i)=>({
  id:'source-safe-'+String(i+1),visitId:'source-safe-'+String(i+1),hrRowId,
  sourceTab:'OCTUBRE 26',sourceRow:i===0?5:i===1?19:20,
  tenantId:'qa-tenant',projectId:'qa-project',periodId:'qa-project-2026-10',
  periodKey:'2026-10',pais:'GT',shopperId,hasShopper:true,assignmentState:'assigned',
  estado:i===2?'submitida':'asignada',status:i===2?'submitida':'asignada',
  canonicalState:i===2?'submitted_complete':'pending_schedule',
  operationalState:i===2?'submitted_complete':'pending_schedule',
  availabilityState:'not_applicable_assigned',
  canonicalFacets:{available:false,assigned:true,scheduled:false,submitted:i===2,realized:i===2}
}));
const snapshot=visits=>({
  sourceSafe:true,imported:false,firestoreWrites:0,
  tenantId:'qa-tenant',projectId:'qa-project',currentPeriodId:'qa-project-2026-10',
  visits
});
const getProvider=db=>createOperationalCommandProvider({db,
  auth:{verifyIdToken:async()=>{throw Error('NO_AUTH_CALLS_EXPECTED');}},policy});

test('A09/B11 existing three assigned GT visits reconcile every HR-owned assignment representation',async()=>{
  const visits=hrVisits(),db=new MemoryDb();
  for(const row of visits){
    db.seed(visitPath(row.hrRowId),{
      id:row.hrRowId,visitId:row.hrRowId,hrRowId:row.hrRowId,
      tenantId:'qa-tenant',projectId:'qa-project',periodId:'qa-project-2026-09',
      shopperId,estado:'asignada',status:'asignada',hasShopper:false,
      assignmentState:'unassigned',canonicalState:'available',
      operationalState:'available',availabilityState:'eligible_unassigned',
      canonicalFacets:{available:true,assigned:false},
      hrManaged:{...copy(row),shopperId:null,hasShopper:false,
        assignmentState:'unassigned',canonicalFacets:{available:true,assigned:false}},
      version:2
    });
  }
  const before=copy(visits),prevConcurrency=process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY;
  process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY='1';
  try{
    const provider=getProvider(db);
    const changed=await provider.reconcileSnapshot(snapshot(visits),{sourceRevision:'qa-current-hr-revision'});
    assert.equal(changed.ok,true);
    assert.equal(changed.providerWrites,3,'reconcile every stale visit, no mass reimport');
    for(const row of visits){
      const stored=db.get(visitPath(row.hrRowId));
      assert.equal(stored.periodId,'qa-project-2026-10');
      assert.equal(stored.shopperId,shopperId);
      assert.equal(stored.assignmentState,'assigned','outer operational assignment must match HR');
      assert.equal(stored.hasShopper,true,'outer hasShopper must match HR');
      assert.equal(stored.canonicalState,row.canonicalState);
      assert.equal(stored.operationalState,row.operationalState);
      assert.equal(stored.availabilityState,'not_applicable_assigned');
      assert.equal(stored.canonicalFacets.assigned,true);
      assert.equal(stored.canonicalFacets.available,false);
      assert.equal(stored.hrManaged.shopperId,shopperId,'nested HR origin must be refreshed');
      assert.equal(stored.hrManaged.assignmentState,'assigned');
      assert.equal(stored.hrManaged.canonicalFacets.assigned,true);
      assert.equal(stored.hrSourceRevision,'qa-current-hr-revision');
    }
    assert.deepEqual(visits,before,'external HR snapshot is never mutated');
    const replay=await provider.reconcileSnapshot(snapshot(visits),{sourceRevision:'qa-current-hr-revision'});
    assert.equal(replay.providerWrites,0,'same revision and content must be idempotent');
    assert.equal(replay.idempotentReplays,3);
  }finally{
    if(prevConcurrency===undefined)delete process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY;
    else process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY=prevConcurrency;
  }
});

test('A09/B11 unassignment clears both nested and outer stale shopper state',async()=>{
  const row={...hrVisits()[0],shopperId:null,hasShopper:false,assignmentState:'unassigned',
    estado:'disponible',status:'disponible',canonicalState:'available',
    operationalState:'available',availabilityState:'eligible_unassigned',
    canonicalFacets:{available:true,assigned:false}};
  const db=new MemoryDb();
  db.seed(visitPath(row.hrRowId),{
    id:row.hrRowId,visitId:row.hrRowId,hrRowId:row.hrRowId,
    tenantId:'qa-tenant',projectId:'qa-project',periodId:'qa-project-2026-10',
    shopperId:'old-incorrect-shopper',hasShopper:true,assignmentState:'assigned',
    estado:'asignada',status:'asignada',canonicalState:'pending_schedule',
    operationalState:'pending_schedule',availabilityState:'not_applicable_assigned',
    canonicalFacets:{available:false,assigned:true},
    hrManaged:{shopperId:'old-incorrect-shopper',assignmentState:'assigned'}
  });
  const p=getProvider(db);
  await p.reconcileSnapshot(snapshot([row]),{sourceRevision:'qa-next-hr-revision'});
  const stored=db.get(visitPath(row.hrRowId));
  assert.equal(stored.shopperId,null);
  assert.equal(stored.hasShopper,false);
  assert.equal(stored.assignmentState,'unassigned');
  assert.equal(stored.canonicalFacets.available,true);
  assert.equal(stored.hrManaged.shopperId,null);
  assert.equal(stored.hrManaged.assignmentState,'unassigned');
});

test('I3 HR-owned visit execution dates remain coherent in durable Firestore read path',async()=>{
  const row={...hrVisits()[2],executionState:'realized',realizada:'2026-10-08',submittedAt:'2026-10-13'};
  const db=new MemoryDb();
  db.seed(visitPath(row.hrRowId),{
    id:row.hrRowId,visitId:row.hrRowId,hrRowId:row.hrRowId,
    tenantId:'qa-tenant',projectId:'qa-project',periodId:row.periodId,
    shopperId,estado:'asignada',status:'asignada',
    executionState:'not_realized',realizada:null,submittedAt:null,
    canonicalFacets:{assigned:true,available:false,realized:false,submitted:false},
    hrManaged:{executionState:'not_realized',realizada:null,submittedAt:null},
    platformInternalMemo:'preserve-non-hr-managed',version:8
  });
  const p=getProvider(db);
  const first=await p.reconcileSnapshot(snapshot([row]),{sourceRevision:'qa-hr-execution-rev1'});
  assert.equal(first.providerWrites,1);
  const fixed=db.get(visitPath(row.hrRowId));
  assert.equal(fixed.executionState,'realized');
  assert.equal(fixed.realizada,'2026-10-08');
  assert.equal(fixed.submittedAt,'2026-10-13');
  assert.equal(fixed.hrManaged.executionState,'realized');
  assert.equal(fixed.platformInternalMemo,'preserve-non-hr-managed');
  const replay=await p.reconcileSnapshot(snapshot([row]),{sourceRevision:'qa-hr-execution-rev1'});
  assert.equal(replay.providerWrites,0);

  const correction={...row,estado:'agendada',status:'agendada',executionState:'pending_realization',realizada:null,submittedAt:null,
    canonicalFacets:{assigned:true,available:false,realized:false,submitted:false}};
  const next=await p.reconcileSnapshot(snapshot([correction]),{sourceRevision:'qa-hr-execution-rev2'});
  assert.equal(next.providerWrites,1);
  const corrected=db.get(visitPath(row.hrRowId));
  assert.equal(corrected.executionState,'pending_realization');
  assert.equal(corrected.realizada,null,'explicit HR null must clear stale realized date');
  assert.equal(corrected.submittedAt,null,'explicit HR null must clear stale submit date');
  assert.equal(corrected.platformInternalMemo,'preserve-non-hr-managed');
});

test('I3 A09/B11 all three existing visits mirror HR schedule and questionnaire state without rewriting finances',async()=>{
  const db=new MemoryDb();
  const three=hrVisits().map((row,i)=>{
    const operational=i===0
      ?{controlDia:'OK',agendada:'2026-10-08',executionState:'realized',realizada:'2026-10-08',
        cuestFecha:'2026-10-12',questionnaireState:'completed',submissionState:'confirmed_hr',
        submit:true,submittedAt:'2026-10-13',schedulingState:'scheduled',
        sourceSnapshotAt:'2026-10-24T16:54:00Z',boleto:52,comboAmt:118}
      :{controlDia:'OK',agendada:i===1?'2026-10-24':'2026-10-25',executionState:'pending_realization',
        realizada:null,cuestFecha:null,questionnaireState:'not_available',submissionState:'not_submitted',
        submit:false,submittedAt:null,schedulingState:'scheduled',
        sourceSnapshotAt:'2026-10-24T16:54:00Z',boleto:null,comboAmt:null};
    const state=i===0?{estado:'submitida',status:'submitida',canonicalState:'submitted_complete',
      operationalState:'submitted_complete',canonicalFacets:{...row.canonicalFacets,submitted:true,realized:true}}:{};
    const candidate={...row,...state,hrManaged:{...row,...state,...operational},...operational};
    db.seed(visitPath(row.hrRowId),{
      tenantId:'qa-tenant',projectId:'qa-project',periodId:row.periodId,hrRowId:row.hrRowId,
      shopperId,assignmentState:'assigned',hasShopper:true,
      controlDia:'P x Asignar',executionState:'not_realized',realizada:null,
      cuestFecha:null,questionnaireState:'not_available',submissionState:'not_submitted',
      submit:false,submittedAt:null,schedulingState:'not_applicable',
      sourceSnapshotAt:'2026-10-01T00:00:00Z',boleto:null,comboAmt:null,
      paymentConfirmed:false,paymentState:'platform_not_paid',
      liquidationState:'platform_not_liquidated',financeRecordId:'keep-platform-finance',
      hrManaged:{...row,...operational},version:5
    });
    return candidate;
  });
  const provider=getProvider(db);
  const previousConcurrency=process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY;
  process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY='1';
  try{
  const receipt=await provider.reconcileSnapshot(snapshot(three),{sourceRevision:'qa-hr-run1848-full-operational-parity'});
  assert.equal(receipt.ok,true);
  assert.equal(receipt.providerWrites,3);
  for(const candidate of three){
    const persisted=db.get(visitPath(candidate.hrRowId));
    for(const key of ['agendada','controlDia','cuestFecha','executionState','realizada',
      'questionnaireState','schedulingState','submissionState','submit','submittedAt',
      'sourceSnapshotAt','boleto','comboAmt']){
      assert.deepEqual(persisted[key],candidate.hrManaged[key],`${candidate.hrRowId}:${key} must mirror HR`);
    }
    assert.equal(persisted.paymentState,'platform_not_paid');
    assert.equal(persisted.liquidationState,'platform_not_liquidated');
    assert.equal(persisted.financeRecordId,'keep-platform-finance');
    assert.equal(persisted.paymentConfirmed,false);
  }
  const replay=await provider.reconcileSnapshot(snapshot(three),{sourceRevision:'qa-hr-run1848-full-operational-parity'});
  assert.equal(replay.providerWrites,0,'idempotent replay must not duplicate writes');
  assert.equal(replay.idempotentReplays,3);

  const clearFields={executionState:'pending_realization',realizada:null,cuestFecha:null,
    questionnaireState:'not_available',submissionState:'not_submitted',submit:false,submittedAt:null};
  const cleared={...three[0],...clearFields,hrManaged:{...three[0].hrManaged,...clearFields}};
  const correction=await provider.reconcileSnapshot(snapshot([cleared]),{sourceRevision:'qa-next-hr-null-correction'});
  assert.equal(correction.providerWrites,1);
  const doc=db.get(visitPath(cleared.hrRowId));
  for(const key of ['realizada','cuestFecha','submittedAt'])assert.equal(doc[key],null);
  assert.equal(doc.submit,false);
  assert.equal(doc.paymentState,'platform_not_paid');
  }finally{
    if(previousConcurrency===undefined)delete process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY;
    else process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY=previousConcurrency;
  }
});

