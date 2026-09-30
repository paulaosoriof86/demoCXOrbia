import fs from 'node:fs';
import vm from 'node:vm';

const engineFile=process.argv[2]||'app/adapters/tya-cumulative-read-model.js';
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(engineFile,'utf8'),sandbox,{filename:engineFile});
const engine=sandbox.window.CX_TYA_CUMULATIVE_READ_MODEL;
if(!engine?.compose)throw new Error('composer_missing');

const periods=Array.from({length:14},(_,i)=>({id:`cinepolis-2025-${String(i+6).padStart(2,'0')}`,periodKey:`2025-${String(i+6).padStart(2,'0')}`}));
const shoppers=Array.from({length:208},(_,i)=>({id:`hr-s-${i+1}`,shopperId:`hr-s-${i+1}`,nombre:`Shopper ${i+1}`,sourceSafe:true,piiProtected:true}));
const visits=Array.from({length:616},(_,i)=>{
  const shopper=shoppers[i%shoppers.length];
  return {
    id:`hr-v-${i+1}`,visitId:`hr-v-${i+1}`,hrRowId:`TAB${Math.floor(i/44)+1}!${(i%44)+2}`,sourceTab:`TAB${Math.floor(i/44)+1}`,sourceRow:(i%44)+2,
    shopperId:shopper.id,shopper:shopper.nombre,projectId:`cinepolis-${i<572?'2026-06':'2026-07'}`,rootProjectId:'cinepolis',periodKey:i<572?'2026-06':'2026-07',
    estado:i%5===0?'submitida':'realizada',canonicalFacets:{assigned:true,scheduled:true,realized:true,questionnaire:true,submitted:i%5===0,liquidationCandidate:i%5===0,liquidationConfirmed:false,paymentConfirmed:false}
  };
});
const protectedProfiles=shoppers.slice(0,120).map((s,i)=>({id:`canon-${i+1}`,shopperId:`canon-${i+1}`,legacyShopperId:i%11===0?`legacy-${i+1}`:'',nombre:s.nombre,username:`user${i+1}`,password:`pass${i+1}`}));
const liveToProtected=new Map(shoppers.slice(0,120).map((s,i)=>[s.id,protectedProfiles[i].id]));
const protectedVisits=visits.map((v,i)=>({id:`fs-${i+1}`,visitId:`fs-${i+1}`,hrRowId:v.hrRowId,sourceTab:v.sourceTab,sourceRow:v.sourceRow,shopperId:liveToProtected.get(v.shopperId)||v.shopperId,canonicalFacets:{liquidationCandidate:i%5===0,liquidationConfirmed:i%7===0,paymentConfirmed:i%11===0}}));
const protectedPayload={shoppers:protectedProfiles,visits:protectedVisits,postulations:[],applications:[],certifications:[],liquidations:[]};
const hr={projects:periods,visits,shoppers,posts:[],currentPeriodId:'cinepolis-2026-07',currentProjectId:'cinepolis',sourceRevision:'rev-1'};

const r1=engine.compose({hr,protectedPayload});
const r2=engine.compose({hr:{...r1,_visitas:r1.visits,visits:r1.visits,_posts:r1.posts,posts:r1.posts,sourceRevision:'rev-1'},protectedPayload});
const r3=engine.compose({hr:{...r2,_visitas:r2.visits,visits:r2.visits,_posts:r2.posts,posts:r2.posts,sourceRevision:'rev-1'},protectedPayload});

const assertions=[];
const assert=(name,ok,detail)=>{assertions.push({name,ok,detail});if(!ok)process.exitCode=1;};
assert('visit_count_preserved_r1',r1.visits.length===616,r1.visits.length);
assert('visit_count_preserved_r2',r2.visits.length===616,r2.visits.length);
assert('visit_count_preserved_r3',r3.visits.length===616,r3.visits.length);
assert('zero_duplicate_visit_keys',r3.diagnostics.duplicateVisitKeys===0,r3.diagnostics.duplicateVisitKeys);
assert('zero_protected_visit_append',r3.diagnostics.protectedVisitsAppended===0,r3.diagnostics.protectedVisitsAppended);
assert('shopper_ids_unique',r3.diagnostics.duplicateShopperIds===0,r3.diagnostics.duplicateShopperIds);
assert('exact_crosswalk_created',r1.diagnostics.crosswalkLiveToCanonical>=120,r1.diagnostics.crosswalkLiveToCanonical);
assert('three_reapply_stable_visit_ids',JSON.stringify(r1.visits.map(v=>v.id))===JSON.stringify(r3.visits.map(v=>v.id)),null);
assert('three_reapply_stable_shopper_ids',JSON.stringify(r1.shoppers.map(v=>v.id).sort())===JSON.stringify(r3.shoppers.map(v=>v.id).sort()),null);
assert('hr_operational_state_preserved',r1.visits.every((v,i)=>v.estado===visits[i].estado),null);
assert('profile_overlay_visible',r1.shoppers.some(s=>s.username==='user1'&&s.password==='pass1'),null);

const report={
  schemaVersion:'cxorbia.c6.stability-regression-gate.v1',
  decision:assertions.every(a=>a.ok)?'PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE':'FAIL_C6_STABLE_COMPOSER_3X_IDEMPOTENCE',
  engineVersion:engine.version,
  baseline:{periods:14,visits:616,shoppers:208,protectedProfiles:120,protectedVisits:616},
  r1:r1.diagnostics,r2:r2.diagnostics,r3:r3.diagnostics,assertions,
  safety:{providerWrites:0,firestoreWrites:0,authWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,deploys:0,production:false,merge:false}
};
console.log(JSON.stringify(report,null,2));
if(process.exitCode)throw new Error(report.decision);
