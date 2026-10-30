import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {collection,doc,getDocFromServer as getDoc,getDocsFromServer as getDocs,query,setDoc,updateDoc,deleteDoc,where} from 'firebase/firestore';

// Isolated emulator fixtures only. No real identities, project or provider access.
const PROJECT='demo-cxorbia-c04-rules';
const TENANT='tya';
const COLS=['financialMovements','financeAccounts'];
const FILE=process.env.C04_RULES_FILE||'firestore.rules';
const EMULATOR=String(process.env.FIRESTORE_EMULATOR_HOST||'').match(/^(127\.0\.0\.1|localhost):([1-9]\d{0,4})$/);
let env;
const principals=[
  {id:'complete',role:'admin',member:{entitlementMode:'TYA_COMPLETE'},allow:true},
  {id:'complete-no-ns-claim',role:'admin',member:{entitlementMode:'TYA_COMPLETE'},claim:{authNamespace:undefined},allow:true},
  {id:'super',role:'super',member:{},allow:true},
  {id:'specific',role:'admin',member:{entitlementMode:'SPECIFIC_PROJECTS'}},
  {id:'missing-entitlement',role:'admin',member:{}},
  {id:'ops',role:'ops',member:{entitlementMode:'TYA_COMPLETE'}},
  {id:'coordinator',role:'coordinador',member:{entitlementMode:'TYA_COMPLETE'}},
  {id:'client',role:'cliente',member:{entitlementMode:'TYA_COMPLETE'}},
  {id:'shopper',role:'shopper',member:{entitlementMode:'TYA_COMPLETE'}},
  {id:'no-member',role:'admin',noMember:true},
  {id:'inactive',role:'admin',member:{entitlementMode:'TYA_COMPLETE',active:false}},
  {id:'member-tenant-mismatch',role:'admin',member:{entitlementMode:'TYA_COMPLETE',tenantId:'other'}},
  {id:'member-role-mismatch',role:'admin',member:{entitlementMode:'TYA_COMPLETE',role:'super'}},
  {id:'member-namespace-mismatch',role:'admin',member:{entitlementMode:'TYA_COMPLETE',authNamespace:'shopper'}},
  {id:'claim-namespace-mismatch',role:'admin',member:{entitlementMode:'TYA_COMPLETE'},claim:{authNamespace:'shopper'}},
  {id:'other-tenant',role:'admin',member:{entitlementMode:'TYA_COMPLETE'},claim:{tenantId:'other'}},
  {id:'other-tenant-list',role:'admin',member:{entitlementMode:'TYA_COMPLETE'},claim:{tenantId:'other',tenants:['tya']}},
  {id:'super-no-member',role:'super',noMember:true},
  {id:'super-other-tenant',role:'super',member:{},claim:{tenantId:'other'}}
];
function dbFor(id){
  if(id==='anonymous')return env.unauthenticatedContext().firestore();
  const p=principals.find(x=>x.id===id);
  const claims={role:p.role,tenantId:TENANT,authNamespace:'staff',projectIds:['cinepolis'],...(p.claim||{})};
  for(const key of Object.keys(claims))if(claims[key]===undefined)delete claims[key];
  return env.authenticatedContext(p.id,claims).firestore();
}
const root=(db,col,id)=>doc(db,'tenants',TENANT,col,id);
const globalQuery=(db,col)=>query(collection(db,'tenants',TENANT,col),where('global','==',true),where('projectId','==',null),where('periodId','==','2026-10'));
const projectQuery=(db,col)=>query(collection(db,'tenants',TENANT,col),where('projectId','==','cinepolis'),where('periodId','==','cinepolis-2026-10'));
before(async()=>{
  assert.ok(EMULATOR&&Number(EMULATOR[2])<=65535,'EMULATOR_ONLY');
  env=await initializeTestEnvironment({projectId:PROJECT,firestore:{host:EMULATOR[1],port:Number(EMULATOR[2]),rules:readFileSync(FILE,'utf8')}});
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=ctx.firestore();
    for(const p of principals){
      if(!p.noMember)await setDoc(root(db,'users',p.id),{active:true,tenantId:TENANT,role:p.role,authNamespace:'staff',projectIds:['cinepolis'],...(p.member||{})});
    }
    for(const col of COLS){
      await setDoc(root(db,col,'global-gtq'),{id:'global-gtq',global:true,projectId:null,tenantId:TENANT,periodId:'2026-10',country:'GT',currency:'GTQ',amount:1});
      await setDoc(root(db,col,'project-legacy'),{id:'project-legacy',projectId:'cinepolis',tenantId:TENANT,periodId:'cinepolis-2026-10',country:'GT',currency:'GTQ',status:'open',kind:'cxc',amount:1});
      await setDoc(root(db,col,'project-false'),{id:'project-false',global:false,projectId:'cinepolis',tenantId:TENANT,periodId:'cinepolis-2026-10',country:'GT',currency:'GTQ',status:'open',kind:'cxc',amount:1});
      await setDoc(root(db,col,'legacy-no-project'),{id:'legacy-no-project',tenantId:TENANT,currency:'GTQ',amount:1});
    }
    await setDoc(root(db,'entityAuditTrail','global-audit'),{tenantId:TENANT,global:true,projectId:null,periodId:'2026-10',entityType:'financeAccount',entityId:'global-gtq',commandType:'finance.account.apply',amount:0.4,balanceBefore:1,balanceAfter:0.6});
    await setDoc(root(db,'entityAuditTrail','project-audit'),{tenantId:TENANT,projectId:'cinepolis',periodId:'cinepolis-2026-10',entityType:'financeAccount',entityId:'project-legacy',amount:1});
    await setDoc(root(db,'entityAuditTrail','operational-audit'),{tenantId:TENANT,projectId:null,entityType:'visit',entityId:'visit-local-fixture',actionType:'visit.state'});
    await setDoc(root(db,'commandReceipts','global-receipt'),{status:'committed',commandType:'finance.movement.create',entityId:'global-gtq',providerAck:true,entity:{id:'global-gtq',tenantId:TENANT,global:true,projectId:null,periodId:'2026-10',amount:1},linkedAccount:{id:'global-linked',tenantId:TENANT,global:true,projectId:null,periodId:'2026-10',originalAmount:1,balance:1}});
  });
});
after(async()=>{if(env)await env.cleanup();});

for(const p of principals){
  test(`Global exact get and catalog query: ${p.id} ${p.allow?'allowed':'denied'}`,async()=>{
    const db=dbFor(p.id);
    for(const col of COLS){
      if(p.allow){
        assert.equal((await assertSucceeds(getDoc(root(db,col,'global-gtq')))).exists(),true);
        assert.deepEqual((await assertSucceeds(getDocs(globalQuery(db,col)))).docs.map(d=>d.id),['global-gtq']);
      }else{
        await assertFails(getDoc(root(db,col,'global-gtq')));
        await assertFails(getDocs(globalQuery(db,col)));
      }
    }
  });
}
test('Anonymous Global get and query denied',async()=>{
  const db=dbFor('anonymous');
  for(const col of COLS){await assertFails(getDoc(root(db,col,'global-gtq')));await assertFails(getDocs(globalQuery(db,col)));}
});
for(const id of ['specific','missing-entitlement','ops','coordinator']){
  test(`Preserve exact legacy and project reads: ${id}`,async()=>{
    const db=dbFor(id);
    for(const col of COLS)for(const name of ['project-legacy','project-false','legacy-no-project'])await assertSucceeds(getDoc(root(db,col,name)));
  });
  test(`Preserve current project catalog query: ${id}`,async()=>{
    const db=dbFor(id);
    for(const col of COLS)assert.deepEqual((await assertSucceeds(getDocs(projectQuery(db,col)))).docs.map(d=>d.id).sort(),['project-false','project-legacy']);
  });
  test(`Preserve project+period+country/status/kind queries: ${id}`,async()=>{
    const db=dbFor(id);
    for(const col of COLS){
      const common=[where('projectId','==','cinepolis'),where('periodId','==','cinepolis-2026-10')];
      for(const extra of [[],[where('country','==','GT')],[where('country','==','GT'),where('status','==','open')],...(col==='financeAccounts'?[[where('kind','==','cxc')]]:[])]){
        const snap=await assertSucceeds(getDocs(query(collection(db,'tenants',TENANT,col),...common,...extra)));
        assert.equal(snap.metadata.fromCache,false);
        assert.deepEqual(snap.docs.map(d=>d.id).sort(),['project-false','project-legacy']);
      }
    }
  });
  test(`Unfiltered collection never serves Global to ${id}`,async()=>{
    const db=dbFor(id);for(const col of COLS)await assertFails(getDocs(collection(db,'tenants',TENANT,col)));
  });
}
test('Client SDK Global writes stay denied even to exact complete Admin and Super',async()=>{
  for(const id of ['complete','super']){
    const db=dbFor(id);
    for(const col of COLS){
      await assertFails(setDoc(root(db,col,'client-create'),{global:true,projectId:null,tenantId:TENANT,periodId:'2026-10'}));
      await assertFails(updateDoc(root(db,col,'global-gtq'),{amount:99}));
      await assertFails(deleteDoc(root(db,col,'global-gtq')));
    }
  }
});

for(const id of ['complete','super','specific','missing-entitlement','ops','coordinator']){
  test(`Global audit values obey same entitlement: ${id}`,async()=>{
    const db=dbFor(id),allow=['complete','super'].includes(id),check=allow?assertSucceeds:assertFails;
    await check(getDoc(root(db,'entityAuditTrail','global-audit')));
    await check(getDocs(query(collection(db,'tenants',TENANT,'entityAuditTrail'),where('global','==',true),where('projectId','==',null),where('periodId','==','2026-10'))));
    await check(getDocs(query(collection(db,'tenants',TENANT,'entityAuditTrail'),where('entityType','==','financeAccount'),where('entityId','==','global-gtq'))));
    if(!allow)await assertFails(getDocs(collection(db,'tenants',TENANT,'entityAuditTrail')));
  });
  test(`Preserve project audit and operational entity query: ${id}`,async()=>{
    const db=dbFor(id);
    await assertSucceeds(getDoc(root(db,'entityAuditTrail','project-audit')));
    const project=await assertSucceeds(getDocs(query(collection(db,'tenants',TENANT,'entityAuditTrail'),where('projectId','==','cinepolis'),where('entityType','==','financeAccount'),where('entityId','==','project-legacy'))));
    assert.deepEqual(project.docs.map(d=>d.id),['project-audit']);
    const operational=await assertSucceeds(getDocs(query(collection(db,'tenants',TENANT,'entityAuditTrail'),where('entityType','==','visit'),where('entityId','==','visit-local-fixture'))));
    assert.deepEqual(operational.docs.map(d=>d.id),['operational-audit']);
  });
  test(`Receipts containing Global entity/linkedAccount remain SDK-denied: ${id}`,async()=>{
    const db=dbFor(id);
    await assertFails(getDoc(root(db,'commandReceipts','global-receipt')));
    await assertFails(getDocs(collection(db,'tenants',TENANT,'commandReceipts')));
  });
}

test('Global finance audit creation is provider-only; legacy operational creation stays allowed',async()=>{
  for(const id of ['complete','super','specific','ops']){
    const db=dbFor(id);
    await assertFails(setDoc(root(db,'entityAuditTrail','client-global-'+id),{tenantId:TENANT,global:true,projectId:null,entityType:'financeAccount',entityId:'global-gtq',amount:99}));
    await assertSucceeds(setDoc(root(db,'entityAuditTrail','client-operational-'+id),{tenantId:TENANT,projectId:'cinepolis',entityType:'visit',entityId:'visit-local-fixture',actionType:'visit.state'}));
  }
});

for(const id of ['specific','complete']){
  test(`Admin cannot mutate membership authority or delete/recreate: ${id}`,async()=>{
    const db=dbFor(id),ref=root(db,'users',id);
    const patches=[
      {entitlementMode:id==='specific'?'TYA_COMPLETE':'SPECIFIC_PROJECTS'},
      {active:false},{tenantId:'other'},{role:'super'},{authNamespace:'shopper'},
      {projectIds:['other-project']},{countries:['HN']}
    ];
    for(const patch of patches)await assertFails(updateDoc(ref,patch));
    await assertFails(deleteDoc(ref));
    await assertFails(setDoc(root(db,'users','admin-created-'+id),{active:true,tenantId:TENANT,role:'admin',authNamespace:'staff',entitlementMode:'TYA_COMPLETE',projectIds:[]}));
    await assertSucceeds(updateDoc(ref,{displayName:'Profile edit '+id,contactEmail:'local-fixture@example.invalid'}));
    assert.equal((await getDoc(ref)).data().entitlementMode,id==='specific'?'SPECIFIC_PROJECTS':'TYA_COMPLETE');
  });
}
test('Existing Super user administration can create, change scope and delete synthetic member',async()=>{
  const db=dbFor('super'),ref=root(db,'users','super-managed-fixture');
  await assertSucceeds(setDoc(ref,{active:true,tenantId:TENANT,role:'admin',authNamespace:'staff',entitlementMode:'SPECIFIC_PROJECTS',projectIds:['cinepolis'],countries:['GT']}));
  await assertSucceeds(updateDoc(ref,{entitlementMode:'TYA_COMPLETE',projectIds:['cinepolis','other-project'],countries:['GT','HN']}));
  assert.equal((await getDoc(ref)).data().entitlementMode,'TYA_COMPLETE');
  await assertSucceeds(deleteDoc(ref));
});

test('Super provider Admin SDK write mechanism is unaffected by client Rules',async()=>{
  await env.withSecurityRulesDisabled(async ctx=>{
    const ref=root(ctx.firestore(),'users','provider-managed-fixture');
    await setDoc(ref,{active:true,tenantId:TENANT,role:'admin',authNamespace:'staff',entitlementMode:'SPECIFIC_PROJECTS',projectIds:['cinepolis']});
    await updateDoc(ref,{entitlementMode:'TYA_COMPLETE'});
    assert.equal((await getDoc(ref)).data().entitlementMode,'TYA_COMPLETE');
    await deleteDoc(ref);
  });
});
