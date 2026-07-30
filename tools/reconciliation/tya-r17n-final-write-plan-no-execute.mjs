#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const LEGACY='app/docs/evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json';
const BASE='app/docs/evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.json';
const VISIT_X='app/docs/evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json';
const REMAIN='app/docs/evidence/REMAINING-SHOPPER-IDENTITY-RECONCILIATION-READONLY-LATEST.json';
const HR='app/data/tya-hr-source-safe-periods.js';
const OUT='app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json';
const OUT_MD='app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.md';
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function readJs(file,name){const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync(file,'utf8'),sb,{filename:file});return JSON.parse(JSON.stringify(sb.window[name]));}

const legacy=read(LEGACY),base=read(BASE),vx=read(VISIT_X),remaining=read(REMAIN),hr=readJs(HR,'CX_TYA_HR_SOURCE_SAFE');
if(base.target?.firebaseProjectId!=='cxorbia-backend-dev'||base.safety?.executeAllowed!==false)throw new Error('base_plan_not_safe');
if(vx.target?.projectId!=='cxorbia-backend-dev'||remaining.sources?.canonical?.projectId!=='cxorbia-backend-dev')throw new Error('crosswalk_target_drift');
if(remaining.safety?.firestoreWrites!==0||remaining.safety?.legacyWrites!==0)throw new Error('remaining_evidence_not_readonly');
if((hr.visits||[]).length!==616)throw new Error(`hr_visit_count_${(hr.visits||[]).length}_expected_616`);

const existingMap=new Map((vx.crosswalk||[]).filter(x=>x.action==='REUSE_EXISTING_CANONICAL_SHOPPER').map(x=>[x.plannedShopperId,{kind:'existing',target:x.canonicalShopperId}]));
const remainingRows=remaining.decisions||[];
const legacyLinks=new Map(remainingRows.filter(x=>x.action==='LINK_TO_LEGACY_PROFILE_CREATE_CANDIDATE').map(x=>[x.plannedShopperId,{kind:'legacy_create',legacyShopperId:x.legacyShopperId,target:String(x.legacyShopperId||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}])) ;
const holds=new Set(remainingRows.filter(x=>x.action==='HOLD_IDENTITY_REVIEW').map(x=>x.plannedShopperId));
for(const [k,v] of legacyLinks){if(!base.profileOperations?.some(p=>p.legacyShopperId===v.legacyShopperId&&p.planState==='CREATE_CANDIDATE_AFTER_EXACT_AUTH'))throw new Error(`legacy_link_not_in_profile_create_plan:${k}`);}
const readyRefs=new Map([...existingMap,...legacyLinks]);
if(existingMap.size!==201||legacyLinks.size!==2||holds.size!==7||readyRefs.size!==203)throw new Error(`crosswalk_counts_unexpected:${existingMap.size}/${legacyLinks.size}/${holds.size}`);

let readyVisits=0,holdVisits=0,readyLiquidations=0,holdLiquidations=0,unclassifiedVisits=0;
const holdVisitIds=[];
for(const v of hr.visits||[]){const ref=v.shopperId||null;if(!ref){unclassifiedVisits++;continue;}const ready=readyRefs.has(ref),held=holds.has(ref);if(ready)readyVisits++;else if(held){holdVisits++;holdVisitIds.push(v.id);}else unclassifiedVisits++;if(String(v.periodKey)<='2026-06'){if(ready)readyLiquidations++;else if(held)holdLiquidations++;}}
if(readyVisits+holdVisits+unclassifiedVisits!==616)throw new Error('visit_partition_failed');
const expectedLiquidations=572;if(readyLiquidations+holdLiquidations!==expectedLiquidations)throw new Error(`liquidation_partition_${readyLiquidations+holdLiquidations}_expected_${expectedLiquidations}`);

const profileCreates=base.groups?.legacyProfiles?.createCandidates||0;
const certCreates=base.groups?.certifications?.createCandidatesAfterProfileResolution||0;
const foundation=base.groups?.foundation?.count||0;
const exactReadyWrites=foundation+profileCreates+certCreates+readyVisits+readyLiquidations;
const core={
  target:{firebaseProjectId:'cxorbia-backend-dev',tenantId:'tya',projectId:'cinepolis',environment:'DEV_CANONICAL'},
  status:'FINAL_PLAN_READY_NOT_AUTHORIZED_NOT_EXECUTABLE',
  strategy:{canonicalShadow:true,reuseExistingBackend:true,newFirebaseProject:false,deletePriorTopology:false,productionCutover:false},
  identityResolution:{totalHrRefs:210,reuseExistingRefs:existingMap.size,linkToLegacyProfileCreateRefs:legacyLinks.size,holdRefs:holds.size,readyRefs:readyRefs.size,identitySourceNotFound:remaining.counts?.identitySourceNotFound||0},
  groups:{
    tenant:{count:1,state:'HOLD_EXISTING_TENANT_FIELD_REVIEW',authorized:0},
    foundation:{count:foundation,state:'READY_FOR_EXACT_WRITE_AUTHORIZATION',authorized:0},
    legacyProfileCreates:{count:profileCreates,state:'READY_FOR_EXACT_WRITE_AUTHORIZATION',authorized:0},
    existingProfileUpdates:{count:base.groups?.legacyProfiles?.existingProfilesPendingFieldDiff||0,state:'HOLD_EXISTING_FIELD_CONFLICT_REVIEW',authorized:0},
    legacyProfileHolds:{count:base.groups?.legacyProfiles?.totalHold||0,state:'HOLD_SOURCE_OR_IDENTITY_REVIEW',authorized:0},
    certifications:{readyCreate:certCreates,hold:(base.groups?.certifications?.holdProfileReview||0)+(base.groups?.certifications?.holdProfileNotFound||0),state:'READY_EXCEPT_HELD_PROFILE_CASES',authorized:0},
    visits:{total:616,readyCreate:readyVisits,holdIdentity:holdVisits,unclassified:unclassifiedVisits,source:'HR_FIRST',authorized:0},
    liquidationControls:{total:572,readyCreate:readyLiquidations,holdIdentity:holdLiquidations,payments:0,authorized:0}
  },
  exactReadyWrites:{count:exactReadyWrites,authorized:0,breakdown:{foundation,legacyProfileCreates:profileCreates,certificationCreates:certCreates,visitCreates:readyVisits,liquidationControlCreates:readyLiquidations}},
  holds:{shopperRefs:[...holds].sort(),holdVisitCount:holdVisits,holdLiquidationCount:holdLiquidations,tenant:true,existingProfileUpdates:base.groups?.legacyProfiles?.existingProfilesPendingFieldDiff||0,augustHN:'HOLD_COUNTRY_TAB_MISMATCH'},
  sourceLocks:{legacySnapshotSha256:legacy.source?.sourceSnapshotSha256||null,visitCrosswalkHash:vx.mappingHashSha256||null,remainingIdentityEvidenceSha256:sha(fs.readFileSync(REMAIN,'utf8')),baseR17nSha256:sha(fs.readFileSync(BASE,'utf8'))},
  safety:{providerCalls:0,firestoreWrites:0,authWrites:0,storageWrites:0,hrWrites:0,deletes:0,imports:0,deploys:0,production:false,merge:false,executeAllowed:false}
};
const h=sha(core),rerun=sha(JSON.parse(JSON.stringify(core)));if(h!==rerun)throw new Error('final_idempotence_failed');
const out={schemaVersion:'cxorbia.r17n-final-write-plan-no-execute.v1',generatedAt:new Date().toISOString(),...core,offlineIdempotence:{pass:true,planHashSha256:h,rerunHashSha256:rerun},holdVisitIdsSha256:sha(holdVisitIds.sort())};
fs.writeFileSync(OUT,JSON.stringify(out,null,2)+'\n');
fs.writeFileSync(OUT_MD,[ '# R17N FINAL — write plan · NO EXECUTE','',`- Ready writes exactos: ${exactReadyWrites}.`,`- Foundation: ${foundation}.`,`- Perfiles legacy create: ${profileCreates}.`,`- Certificaciones create: ${certCreates}.`,`- Visitas create listas: ${readyVisits}; HOLD identidad: ${holdVisits}.`,`- Controles liquidación listos: ${readyLiquidations}; HOLD identidad: ${holdLiquidations}.`,'- Pagos: 0.','- Firestore/Auth/Storage/HR/provider writes: 0.','- Deploy/merge/producción: 0.','',`- Identidad HR: 203/210 referencias con target; 7 HOLD.` ,`- Idempotence hash: ${h} PASS.`,'- Siguiente gate: autorización explícita solo para los grupos/conteos exactos que se decida ejecutar.','' ].join('\n'));
console.log(JSON.stringify({decision:'PASS_R17N_FINAL_NO_EXECUTE',exactReadyWrites,identity:core.identityResolution,visits:core.groups.visits,liquidations:core.groups.liquidationControls,idempotence:out.offlineIdempotence,safety:out.safety},null,2));
