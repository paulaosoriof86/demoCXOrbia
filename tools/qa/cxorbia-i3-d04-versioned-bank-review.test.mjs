import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';

const source=fs.readFileSync('app/modules/cert.js','utf8');
const resourcesSource=fs.readFileSync('app/core/backend-resources.js','utf8');
const questions=Array.from({length:15},(_,i)=>({q:'Pregunta '+(i+1),ops:['Uno','Dos','Tres','Cuatro'],correcta:'Uno',exp:'Explicación '+(i+1),fuente:'[Página '+((i%7)+1)+']'}));
const clone=x=>JSON.parse(JSON.stringify(x));
function setup(){
  const project='cinepolis',period='cinepolis-2026-09',cid='ai-3654d624896f';
  const id='certbank-'+project+'-'+period+'-'+cid;
  const bank={certificationId:cid,certificationName:'Banco IA pendiente de revisión',
    estado:'pending_review',contentRevision:'old-revision',preguntas:clone(questions),
    generadoPorUid:'qa-author',documentSource:{name:'Instructivo Shopper.pdf',source_sha256:'a'.repeat(64),extraction_quality:{pageCount:7,sufficient:true}}};
  const record={id,projectId:project,periodId:period,version:3,bank:clone(bank)};
  const resources={
    items:[record],list(){return this.items;},async saveMetadata(payload,options){
      assert.equal(options.projectId,project);assert.equal(options.periodId,period);
      assert.equal(payload.id,id);
      if(String(this.items[0]?.version)!==String(options.expectedVersion))throw Error('RESOURCE_EXPECTED_VERSION_CONFLICT');
      const updated={...clone(payload),version:this.items[0].version+1};
      this.items=[updated];
      return {ok:true,status:'committed',committed:true,providerAck:true,item:updated,
        ...(options.requireReadback===true?{readback:{confirmed:true,source:'firestore-server',item:clone(updated)}}:{})};
    }
  };
  const CX={BACKEND:{enabled:true},data:{currentProjectId:project},backendResources:resources,
    session:{role:'admin',user:{role:'admin'}},backendCertifications:{currentUid:()=> 'qa-reviewer'},bus:{emit(){}},module(){}};
  vm.runInNewContext(source,{CX,window:{CX},crypto:webcrypto,TextEncoder,console,Date,setTimeout});
  return {CX,bank:{...bank,__resourceId:id,__resourceVersion:3},resources,period};
}
test('D04 reviews fifteen questions with version guard, source provenance and durable readback',async()=>{
  const {CX,bank,resources,period}=setup();
  const next=clone(bank.preguntas);
  next[0].q='Pregunta revisada número uno';
  const result=await CX.certStore.reviewDraft(period,bank,next,'maker_checker');
  assert.equal(result.committed,true);
  assert.equal(resources.items[0].version,4);
  assert.equal(resources.items[0].bank.estado,'pending_review');
  assert.equal(resources.items[0].bank.preguntas.length,15);
  assert.equal(resources.items[0].bank.preguntas[0].q,next[0].q);
  assert.equal(resources.items[0].bank.documentSource.source_sha256,bank.documentSource.source_sha256);
  assert.equal(resources.items[0].bank.reviewHistory.length,1);
  assert.equal(resources.items[0].bank.reviewHistory[0].changes.length,1);
  assert.equal(resources.items[0].bank.reviewHistory[0].fromVersion,3);
  assert.equal(resources.items[0].bank.reviewHistory[0].toVersion,4);
  assert.equal(resources.items[0].bank.__resourceId,undefined);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,next),/RESOURCE_EXPECTED_VERSION_CONFLICT/);
});
test('D04 rejects invalid source, same-author maker-checker, missing version and empty edits',async()=>{
  const {CX,bank,resources,period}=setup();
  const bad=clone(bank.preguntas);bad[1].fuente='[Página 99]';
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,bad),/CERT_REVIEW_SOURCE_PAGE_INVALID_/);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,{...bank,generadoPorUid:'qa-reviewer'},clone(bank.preguntas),'maker_checker'),/CERT_REVIEW_DISTINCT_REVIEWER_REQUIRED/);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,{...bank,__resourceVersion:undefined},bad),/CERT_REVIEW_EXPECTED_VERSION_REQUIRED/);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,clone(bank.preguntas)),/CERT_REVIEW_NO_CHANGES/);
  assert.equal(resources.items[0].version,3);
});
test('D04 role gate and complete question validation fail closed',async()=>{
  const {CX,bank,resources,period}=setup();
  CX.session.role='ops';
  const next=clone(bank.preguntas);next[0].q='Nueva pregunta';
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,next),/CERT_REVIEW_AUTHORIZED_ADMIN_REQUIRED/);
  CX.session.role='admin';next[0].ops=['Igual','Igual','Otra','Cuatro'];next[0].correcta='Igual';
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,next),/CERT_REVIEW_INVALID_QUESTION_0/);
  assert.equal(resources.items[0].version,3);
});
test('D04 modal edit button, diff preview and CAS-backed save exist without auto-publication',()=>{
 assert.match(source,/certReviewEdit/);
 assert.match(source,/certReviewPreview/);
 assert.match(source,/certReviewSave/);
 assert.match(source,/CX\.certStore\.reviewDraft\(p\.id,bank,read\(\),policy,readName\(\)\)/);
 assert.match(source,/expectedVersion:version,expectedResourceId:original\.__resourceId,requireReadback:true/);
 const method=source.slice(source.indexOf('  async reviewDraft('),source.indexOf('  async clear(',source.indexOf('  async reviewDraft(')));
 assert.ok(method.length>0);
 assert.doesNotMatch(method,/estado\s*:\s*['"]published['"]/);
});

test('D04 name-only review keeps bank identity and question content, with versioned durable metadata ACK',async()=>{
  const {CX,bank,resources,period}=setup();
  const originalQuestions=clone(bank.preguntas);
  const result=await CX.certStore.reviewDraft(period,bank,originalQuestions,'maker_checker','Protocolo Sala VIP · Octubre 2026');
  assert.equal(result.providerAck,true);
  assert.equal(result.committed,true);
  const stored=resources.items[0];
  assert.equal(stored.id,bank.__resourceId);
  assert.equal(stored.version,4);
  assert.equal(stored.n,'Protocolo Sala VIP · Octubre 2026');
  assert.equal(stored.bank.certificationName,'Protocolo Sala VIP · Octubre 2026');
  assert.equal(stored.bank.certificationId,bank.certificationId);
  assert.equal(stored.bank.estado,'pending_review');
  assert.deepEqual(JSON.parse(JSON.stringify(stored.bank.preguntas)),originalQuestions);
  assert.equal(stored.bank.reviewHistory.length,1);
  assert.equal(stored.bank.reviewHistory[0].changes.length,0);
  assert.deepEqual(JSON.parse(JSON.stringify(stored.bank.reviewHistory[0].nameChange)),{before:'Banco IA pendiente de revisión',after:'Protocolo Sala VIP · Octubre 2026'});
  assert.equal(stored.bank.reviewHistory[0].fromVersion,3);
  assert.equal(stored.bank.reviewHistory[0].toVersion,4);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,originalQuestions,'maker_checker','Nombre tardío'),/RESOURCE_EXPECTED_VERSION_CONFLICT/);
});
test('D04 rejects blank, unsafe and overly long names without writing provider',async()=>{
  const {CX,bank,resources,period}=setup();
  for(const name of ['','  ','a','a'.repeat(121),'<img onerror=alert(1)>','Valor\ninválido']){
    await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,clone(bank.preguntas),'authorized_admin',name),/CERT_BANK_NAME_INVALID/);
  }
  assert.equal(resources.items[0].version,3);
});
test('D04 generation and pending-review both expose editable names with full ACK readback',()=>{
  assert.match(source,/id="ciAiName"/);
  assert.match(source,/certificationName=CX\.certStore\.normalizeName\(ov\.querySelector\('#ciAiName'\)\?\.value\)/);
  assert.match(source,/certificationName,sourceSha256:documentSource\.source_sha256/);
  assert.match(source,/CERT_BANK_NAME_PROVIDER_READBACK_MISMATCH/);
  assert.match(source,/id="certReviewName"/);
  assert.match(source,/nameField\.addEventListener\('input',invalidate\)/);
  assert.match(source,/nameChange:nameChanged\?/);
  assert.match(source,/expectedVersion:version,expectedResourceId:original\.__resourceId,requireReadback:true/);
});


// R4 regression: execute both product owners against an in-memory Firestore-shaped
// provider. The durable document, server snapshot and presentation cache are separate.
// No Firebase service, credentials, network, Auth identities or external writes.
const reorderMaps=value=>Array.isArray(value)?value.map(reorderMaps):
  value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([k,v])=>[k,reorderMaps(v)])):value;
function exactReadbackSetup(options={}){
  const project='cinepolis',period='cinepolis-2026-09',tenant='tya',cid='qa-exact-readback';
  const id='certbank-'+project+'-'+period+'-'+cid;
  const bank={certificationId:cid,certificationName:'Banco QA lectura exacta',
    estado:'pending_review',contentRevision:'old-revision',preguntas:clone(questions),
    generadoPorUid:'qa-author',documentSource:{name:'Fixture QA',source_sha256:'a'.repeat(64),
      extraction_quality:{pageCount:7,sufficient:true}}};
  if(options.nestedMaps)bank.preguntas[0].reference={page:1,span:{start:4,end:28},tags:['uno','dos']};
  const record={id,tenantId:tenant,projectId:project,periodId:period,status:'active',
    resourceType:'certification_bank',tipo:'certification_bank',n:bank.certificationName,
    visibleRoles:['admin','shopper'],version:3,bank:clone(bank)};
  const path='tenants/'+tenant+'/resources/'+id,documents=new Map([[path,clone(record)]]);
  const stats={transactions:0,writes:0,exactReads:[],queryReads:0};
  const snapshot=(ref,value,metadata={fromCache:false,hasPendingWrites:false})=>({
    id:ref.id,ref,exists:value!==undefined,data:()=>clone(value),metadata
  });
  class Reference{
    constructor(path){this.path=path;this.id=path.split('/').at(-1);}
    collection(name){return new Collection(this.path+'/'+name);}
    async get(readOptions){
      stats.exactReads.push({path:this.path,options:clone(readOptions)});
      if(options.readError)throw new Error('MOCK_SERVER_READ_FAILED');
      const raw=documents.get(this.path);
      const actual=options.missingDocument?undefined:options.readTransform?options.readTransform(clone(raw)):clone(raw);
      const result=snapshot(this,actual,options.metadata||{fromCache:false,hasPendingWrites:false});
      if(options.snapshotId)result.id=options.snapshotId;
      if(options.afterRead)options.afterRead(CX);
      return result;
    }
  }
  class Collection{
    constructor(path,conditions=[]){this.path=path;this.conditions=conditions;}
    doc(id){return new Reference(this.path+'/'+id);}
    where(field,op,value){return new Collection(this.path,[...this.conditions,[field,op,value]]);}
    async get(){
      stats.queryReads++;
      let rows=options.cacheOld?[clone(record)]:[clone(documents.get(path))];
      if(options.cacheTransform)rows=rows.map(options.cacheTransform);
      rows=rows.filter(row=>this.conditions.every(([field,op,value])=>op==='=='?row[field]===value:row[field]?.includes(value)));
      return {docs:rows.map(row=>snapshot(new Reference(this.path+'/'+row.id),row))};
    }
  }
  const db={
    collection:name=>new Collection(name),
    async runTransaction(callback){
      stats.transactions++;
      return callback({
        get:async ref=>snapshot(ref,documents.get(ref.path)),
        set(ref,value){stats.writes++;documents.set(ref.path,clone(value));}
      });
    }
  };
  const firebase={apps:[{}],auth:()=>({currentUser:{uid:'qa-reviewer'}}),firestore:()=>db};
  const CX={BACKEND:{enabled:true,tenantId:tenant},
    data:{currentProjectId:project,currentPeriodId:period,ctx(){return{projectId:this.currentProjectId,periodId:this.currentPeriodId};}},
    session:{role:'admin',user:{role:'admin'},effectiveRole(){return this.role;}},
    backendResources:{items:[clone(record)]},backendCertifications:{currentUid:()=> 'qa-reviewer'},
    bus:{emit(){},on(){}},module(){}};
  const window={CX,firebase,addEventListener(){}};
  const context={CX,window,firebase,document:{readyState:'loading',addEventListener(){}},
    crypto:webcrypto,TextEncoder,console,Date,setTimeout};
  vm.runInNewContext(resourcesSource,context);
  vm.runInNewContext(source,context);
  const original={...clone(bank),__resourceId:id,__resourceVersion:3};
  const next=clone(bank.preguntas);next[0].q='Pregunta revisada con fuente exacta';
  return {CX,bank:original,period,id,path,stats,next,
    stored:()=>clone(documents.get(path)),
    review:()=>CX.certStore.reviewDraft(period,original,next,'maker_checker')};
}

test('D04 exact server document confirms edit while presentation cache remains old',async()=>{
  const h=exactReadbackSetup({cacheOld:true});
  const result=await h.review();
  assert.equal(result.providerAck,true);assert.equal(result.committed,true);
  assert.equal(result.readback.confirmed,true);assert.equal(result.readback.source,'firestore-server');
  assert.equal(result.readback.item.version,4);
  assert.equal(result.readback.item.bank.preguntas[0].q,h.next[0].q);
  assert.equal(h.CX.backendResources.items[0].version,3);
  assert.equal(h.stored().version,4);
  assert.deepEqual(h.stats.exactReads,[{path:h.path,options:{source:'server'}}]);
  assert.equal(h.stats.transactions,1);assert.equal(h.stats.writes,1);
});

test('D04 accepts reordered map keys at every depth without changing arrays',async()=>{
  const h=exactReadbackSetup({nestedMaps:true,readTransform:reorderMaps,cacheTransform:reorderMaps});
  const result=await h.review();
  assert.equal(result.providerAck,true);assert.equal(result.readback.confirmed,true);
  assert.notDeepEqual(Object.keys(result.readback.item.bank.preguntas[0]),Object.keys(h.next[0]));
  assert.deepEqual(clone(result.readback.item.bank.preguntas),h.next);
  assert.deepEqual(result.readback.item.bank.preguntas[0].reference.tags,['uno','dos']);
  assert.equal(h.stats.writes,1);
});

test('D04 rejects incorrect exact document even when presentation cache appears correct',async t=>{
  const cases=[
    ['content revision',row=>{row.bank.contentRevision='wrong-revision';}],
    ['publication state',row=>{row.bank.estado='published';}],
    ['question value',row=>{row.bank.preguntas[0].q='Otra pregunta';}],
    ['bank name',row=>{row.bank.certificationName='Otro banco';}],
    ['metadata name',row=>{row.n='Otro título';}],
    ['option order',row=>{row.bank.preguntas[0].ops.reverse();}],
    ['question order',row=>{row.bank.preguntas.reverse();}],
    ['missing question field',row=>{delete row.bank.preguntas[0].exp;}],
    ['additional question field',row=>{row.bank.preguntas[0].unexpected=true;}],
    ['question field type',row=>{row.bank.preguntas[0].exp=7;}]
  ];
  for(const [label,change] of cases)await t.test(label,async()=>{
    const h=exactReadbackSetup({readTransform:row=>{change(row);return row;}});
    await assert.rejects(h.review,/CERT_REVIEW_REMOTE_READBACK_MISMATCH/);
    assert.equal(h.CX.backendResources.items[0].version,4);
    assert.equal(h.CX.backendResources.items[0].bank.preguntas[0].q,h.next[0].q);
    assert.equal(h.stats.transactions,1);assert.equal(h.stats.writes,1);
    assert.equal(h.stats.exactReads.length,1);
  });
});

test('D04 rejects missing, cached, pending or out-of-scope exact reads after one commit',async t=>{
  const cases=[
    ['missing document',{missingDocument:true},/RESOURCE_READBACK_MISSING/],
    ['cached snapshot',{metadata:{fromCache:true,hasPendingWrites:false}},/RESOURCE_READBACK_NOT_SERVER_CONFIRMED/],
    ['pending writes',{metadata:{fromCache:false,hasPendingWrites:true}},/RESOURCE_READBACK_NOT_SERVER_CONFIRMED/],
    ['unconfirmed metadata',{metadata:{}},/RESOURCE_READBACK_NOT_SERVER_CONFIRMED/],
    ['wrong snapshot id',{snapshotId:'another-document'},/RESOURCE_READBACK_SCOPE_MISMATCH/],
    ...['id','tenantId','projectId','periodId','status'].map(field=>[
      'wrong '+field,{readTransform:row=>({...row,[field]:'other'})},/RESOURCE_READBACK_SCOPE_MISMATCH/]),
    ['later version',{readTransform:row=>({...row,version:row.version+1})},/RESOURCE_READBACK_VERSION_MISMATCH/],
    ['other operation',{readTransform:row=>({...row,lastIdempotencyKey:'other-operation'})},/RESOURCE_READBACK_VERSION_MISMATCH/]
  ];
  for(const [label,options,expected] of cases)await t.test(label,async()=>{
    const h=exactReadbackSetup(options);
    await assert.rejects(h.review,expected);
    assert.equal(h.stored().version,4);
    assert.equal(h.stats.transactions,1);assert.equal(h.stats.writes,1);
    assert.equal(h.stats.exactReads.length,1);
  });
});

test('D04 server-read error does not fall back to payload/cache or repeat the commit',async()=>{
  const h=exactReadbackSetup({readError:true});
  await assert.rejects(h.review,/MOCK_SERVER_READ_FAILED/);
  assert.equal(h.stored().version,4);
  assert.equal(h.stored().bank.preguntas[0].q,h.next[0].q);
  assert.equal(h.stats.transactions,1);assert.equal(h.stats.writes,1);
  assert.deepEqual(h.stats.exactReads,[{path:h.path,options:{source:'server'}}]);
});

test('D04 preserves project guard when active context changes during exact readback',async()=>{
  const h=exactReadbackSetup({afterRead:CX=>{CX.data.currentProjectId='other-project';}});
  await assert.rejects(h.review,/CERT_REVIEW_REMOTE_READBACK_MISMATCH/);
  assert.equal(h.stored().projectId,'cinepolis');assert.equal(h.stored().version,4);
  assert.equal(h.stats.transactions,1);assert.equal(h.stats.writes,1);
  assert.equal(h.stats.exactReads.length,1);
});

test('D04 does not accept ACK payload or cache without explicit confirmed server readback',async()=>{
  const h=setup(),save=h.resources.saveMetadata.bind(h.resources);
  h.resources.saveMetadata=async(payload,options)=>{
    const result=await save(payload,options);delete result.readback;return result;
  };
  const next=clone(h.bank.preguntas);next[0].q='Cambio que requiere lectura exacta';
  await assert.rejects(()=>h.CX.certStore.reviewDraft(h.period,h.bank,next),/CERT_REVIEW_REMOTE_READBACK_MISMATCH/);
  assert.equal(h.resources.items[0].version,4);
});

test('D04 map comparison does not equate opaque objects or sparse arrays to valid values',()=>{
  const {CX}=setup();
  assert.equal(CX.certStore.equalReviewValue({nested:{b:2,a:1}},{nested:{a:1,b:2}}),true);
  assert.equal(CX.certStore.equalReviewValue(new Date(0),{}),false);
  assert.equal(CX.certStore.equalReviewValue(new (class Empty {})(),{}),false);
  assert.equal(CX.certStore.equalReviewValue([1,2],[2,1]),false);
  assert.equal(CX.certStore.equalReviewValue(new Array(1),[1]),false);
  assert.equal(CX.certStore.equalReviewValue({value:'1'},{value:1}),false);
});

test('Resource writes without opt-in keep the existing flow and do not add an exact server read',async()=>{
  const h=exactReadbackSetup();
  const result=await h.CX.backendResources.saveMetadata({
    id:h.id,resourceType:'project_resource',tipo:'text',projectId:'cinepolis',periodId:h.period,
    n:'Metadatos ordinarios QA',visibleRoles:['admin']
  },{expectedVersion:3,idempotencyKey:'qa-ordinary-no-readback'});
  assert.equal(result.providerAck,true);assert.equal(result.item.version,4);
  assert.equal(result.readback,undefined);
  assert.equal(h.stats.exactReads.length,0);assert.equal(h.stats.queryReads,1);
  assert.equal(h.stats.transactions,1);assert.equal(h.stats.writes,1);
});
