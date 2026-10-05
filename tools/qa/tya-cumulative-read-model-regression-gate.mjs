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

let vrm168Focal=null;
if(/tya-cumulative-read-model-v2\.js$/.test(engineFile)){
  const focalHr={
    projects:[{id:'cinepolis-2026-10',periodKey:'2026-10',projectId:'cinepolis'}],
    currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-10',sourceRevision:'vrm168-rev',
    shoppers:[],
    visits:[{
      id:'hr_2026-10_gt_6_7cf9d422f8',visitId:'hr_2026-10_gt_6_7cf9d422f8',hrRowId:'OCTUBRE 26!6',
      sourceTab:'OCTUBRE 26',sourceRow:6,projectId:'cinepolis',periodId:'cinepolis-2026-10',periodKey:'2026-10',
      shopperId:'s3',estado:'asignada',canonicalFacets:{assigned:true,available:false,scheduled:false,realized:false,questionnaire:false,submitted:false,cancelled:false}
    }],
    posts:[]
  };
  const focalProtected={
    shoppers:[{id:'shopper_gt_1440137b73',shopperId:'shopper_gt_1440137b73',nombre:'Shopper focal',projectIds:['cinepolis']}],
    visits:[{
      id:'OCTUBRE 26!6',visitId:'OCTUBRE 26!6',hrRowId:'OCTUBRE 26!6',sourceTab:'OCTUBRE 26',sourceRow:6,
      projectId:'cinepolis',periodId:'cinepolis-2026-10',shopperId:'shopper_gt_1440137b73',estado:'asignada',version:3,
      assignmentSource:'platform',assignmentSyncStatus:'pending_hr',canonicalFacets:{assigned:true,available:false}
    }],
    postulations:[],applications:[],certifications:[],liquidations:[]
  };
  const focalResult=engine.compose({hr:focalHr,protectedPayload:focalProtected});
  const focalVisit=focalResult.visits.find(v=>v.hrRowId==='OCTUBRE 26!6');

  const conflictHr=JSON.parse(JSON.stringify(focalHr));
  conflictHr.shoppers=[{id:'s3',shopperId:'s3',nombre:'Existing HR shopper'}];
  const conflictResult=engine.compose({hr:conflictHr,protectedPayload:focalProtected});
  const conflictVisit=conflictResult.visits.find(v=>v.hrRowId==='OCTUBRE 26!6');

  vrm168Focal={
    canonicalProjectedShopperId:focalVisit?.shopperId||null,
    canonicalReviewRequired:focalVisit?.assignmentReviewRequired===true,
    canonicalIdentityMap:focalResult.identityMap||{},
    conflictProjectedShopperId:conflictVisit?.shopperId||null,
    conflictReviewRequired:conflictVisit?.assignmentReviewRequired===true,
    conflictReason:conflictVisit?.assignmentReviewReason||null
  };
  assert('vrm168_missing_transient_identity_promotes_exact_visit_crosswalk',
    vrm168Focal.canonicalProjectedShopperId==='shopper_gt_1440137b73'&&vrm168Focal.canonicalReviewRequired===false,
    vrm168Focal);
  assert('vrm168_existing_hr_identity_preserves_conflict_review',
    vrm168Focal.conflictProjectedShopperId==='s3'&&vrm168Focal.conflictReviewRequired===true&&vrm168Focal.conflictReason==='hr_platform_assignment_conflict',
    vrm168Focal);

  const flores='shopper_gt_0c198c1055',illescas='shopper_gt_86254c4228';
  const vrm258Hr={
    currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-10',sourceRevision:'vrm258-live-hr',
    projects:[
      {id:'cinepolis-2026-08',periodKey:'2026-08',projectId:'cinepolis'},
      {id:'cinepolis-2026-10',periodKey:'2026-10',projectId:'cinepolis'}
    ],
    shoppers:[
      {id:flores,shopperId:flores,nombre:'Julissa Flores',pais:'GT'},
      {id:illescas,shopperId:illescas,nombre:'Julissa Illescas',pais:'GT'}
    ],
    visits:[
      {id:'hr-aug-29',visitId:'hr-aug-29',hrRowId:'AGOSTO 26!29',sourceTab:'AGOSTO 26',sourceRow:29,projectId:'cinepolis',periodId:'cinepolis-2026-08',periodKey:'2026-08',shopperId:illescas,shopper:'Julissa Illescas',estado:'realizada',canonicalFacets:{assigned:true,realized:true}},
      {id:'hr-oct-2',visitId:'hr-oct-2',hrRowId:'OCTUBRE 26!2',sourceTab:'OCTUBRE 26',sourceRow:2,projectId:'cinepolis',periodId:'cinepolis-2026-10',periodKey:'2026-10',shopperId:flores,shopper:'Julissa Flores',estado:'asignada',canonicalFacets:{assigned:true,available:false,realized:false}}
    ],
    posts:[]
  };
  const vrm258Protected={
    shoppers:[
      {id:flores,shopperId:flores,nombre:'Julissa Flores',projectIds:['cinepolis']},
      {id:illescas,shopperId:illescas,nombre:'Julissa Illescas',projectIds:['cinepolis']}
    ],
    visits:[
      {id:'AGOSTO 26!29',visitId:'AGOSTO 26!29',hrRowId:'AGOSTO 26!29',sourceTab:'AGOSTO 26',sourceRow:29,projectId:'cinepolis',periodId:'cinepolis-2026-08',shopperId:flores,canonicalFacets:{assigned:true,realized:true}},
      {id:'OCTUBRE 26!2',visitId:'OCTUBRE 26!2',hrRowId:'OCTUBRE 26!2',sourceTab:'OCTUBRE 26',sourceRow:2,projectId:'cinepolis',periodId:'cinepolis-2026-10',shopperId:flores,canonicalFacets:{assigned:true,available:false,realized:false}}
    ],
    postulations:[],applications:[],certifications:[],liquidations:[]
  };
  const vrm258Result=engine.compose({hr:vrm258Hr,protectedPayload:vrm258Protected});
  const vrm258Flores=vrm258Result.shoppers.find(s=>s.id===flores);
  const vrm258Illescas=vrm258Result.shoppers.find(s=>s.id===illescas);
  const vrm258Aug=vrm258Result.visits.find(v=>v.hrRowId==='AGOSTO 26!29');
  const vrm258Oct=vrm258Result.visits.find(v=>v.hrRowId==='OCTUBRE 26!2');
  const vrm258Suppressed=(vrm258Result.diagnostics.suppressedDistinctHrIdentityCrosswalks||[])
    .some(x=>x.liveShopperId===illescas&&x.durableShopperId===flores&&x.reason==='distinct_live_hr_identities_must_not_crosswalk');
  assert('vrm258_distinct_live_hr_identities_resist_stale_durable_crosswalk',
    vrm258Result.identityMap?.[illescas]!==flores&&
    vrm258Flores?.nombre==='Julissa Flores'&&vrm258Illescas?.nombre==='Julissa Illescas'&&
    vrm258Aug?.shopperId===illescas&&vrm258Oct?.shopperId===flores&&vrm258Suppressed,
    {identityMap:vrm258Result.identityMap,shoppers:vrm258Result.shoppers.map(s=>({id:s.id,nombre:s.nombre})),augShopperId:vrm258Aug?.shopperId,octShopperId:vrm258Oct?.shopperId,suppressed:vrm258Result.diagnostics.suppressedDistinctHrIdentityCrosswalks});
}

const report={
  schemaVersion:'cxorbia.c6.stability-regression-gate.v1',
  decision:assertions.every(a=>a.ok)?'PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE':'FAIL_C6_STABLE_COMPOSER_3X_IDEMPOTENCE',
  engineVersion:engine.version,
  baseline:{periods:14,visits:616,shoppers:208,protectedProfiles:120,protectedVisits:616},
  r1:r1.diagnostics,r2:r2.diagnostics,r3:r3.diagnostics,vrm168Focal,assertions,
  safety:{providerWrites:0,firestoreWrites:0,authWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,deploys:0,production:false,merge:false}
};
console.log(JSON.stringify(report,null,2));
if(process.exitCode)throw new Error(report.decision);
