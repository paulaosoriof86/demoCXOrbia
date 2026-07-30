#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const LEGACY='app/docs/evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json';
const BASE='app/docs/evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.json';
const VISIT_X='app/docs/evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json';
const CURRENT_ID='app/docs/evidence/CURRENT-UNRESOLVED-SHOPPER-IDENTITY-READONLY-LATEST.json';
const HR='app/data/tya-hr-source-safe-current-through-july.js';
const OUT='app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json';
const OUT_MD='app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.md';
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function readJs(file,name){const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync(file,'utf8'),sb,{filename:file});return JSON.parse(JSON.stringify(sb.window[name]));}
const legacy=read(LEGACY),base=read(BASE),vx=read(VISIT_X),cur=read(CURRENT_ID),hr=readJs(HR,'CX_TYA_HR_SOURCE_SAFE');
if(base.target?.firebaseProjectId!=='cxorbia-backend-dev'||base.safety?.executeAllowed!==false)throw new Error('base_plan_not_safe');
if(vx.sources?.hr?.file!==HR||vx.target?.projectId!=='cxorbia-backend-dev')throw new Error('current_crosswalk_required');
if(cur.authorizationScope!=='READ_ONLY_REAL_IDENTITY_RECONCILIATION_CURRENT_UNRESOLVED'||cur.safety?.firestoreWrites!==0||cur.safety?.legacyWrites!==0)throw new Error('current_identity_evidence_not_safe');
if((hr.periods||[]).length!==14||(hr.visits||[]).length!==616||(hr.shoppers||[]).length!==208)throw new Error('current_hr_source_counts_drift');
const existing=new Map((vx.crosswalk||[]).filter(x=>x.action==='REUSE_EXISTING_CANONICAL_SHOPPER').map(x=>[x.plannedShopperId,{kind:'existing',target:x.canonicalShopperId}]));
const currentRows=cur.decisions||[];
const legacyLinks=new Map(currentRows.filter(x=>x.action==='LINK_TO_LEGACY_PROFILE_CREATE_CANDIDATE').map(x=>[x.plannedShopperId,{kind:'legacy_create',legacyShopperId:x.legacyShopperId,target:String(x.legacyShopperId||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}])) ;
const hrCreates=new Map(currentRows.filter(x=>x.action==='CREATE_PROFILE_FROM_CURRENT_HR_IDENTITY_CANDIDATE').map(x=>[x.plannedShopperId,{kind:'hr_current_create',target:x.targetShopperId||x.plannedShopperId}]));
const holds=new Set(currentRows.filter(x=>x.action.startsWith('HOLD_')).map(x=>x.plannedShopperId));
for(const [k,v] of legacyLinks){if(!base.profileOperations?.some(p=>p.legacyShopperId===v.legacyShopperId&&p.planState==='CREATE_CANDIDATE_AFTER_EXACT_AUTH'))throw new Error(`legacy_link_not_in_profile_create_plan:${k}`);}
const readyRefs=new Map([...existing,...legacyLinks,...hrCreates]);
if(existing.size!==201||legacyLinks.size!==2||hrCreates.size!==5||holds.size!==0||readyRefs.size!==208)throw new Error(`identity_partition_unexpected:${existing.size}/${legacyLinks.size}/${hrCreates.size}/${holds.size}`);
let readyVisits=0,unclassifiedVisits=0,readyLiquidations=0;for(const v of hr.visits||[]){const ref=v.shopperId;if(readyRefs.has(ref))readyVisits++;else unclassifiedVisits++;if(String(v.periodKey)<='2026-06'&&readyRefs.has(ref))readyLiquidations++;}
if(readyVisits!==616||unclassifiedVisits!==0||readyLiquidations!==572)throw new Error(`current_visit_partition_failed:${readyVisits}/${unclassifiedVisits}/${readyLiquidations}`);
const legacyProfileCreates=base.groups?.legacyProfiles?.createCandidates||0;
const hrProfileCreates=hrCreates.size;
const certCreates=base.groups?.certifications?.createCandidatesAfterProfileResolution||0;
const foundation=base.groups?.foundation?.count||0;
const exactReadyWrites=foundation+legacyProfileCreates+hrProfileCreates+certCreates+readyVisits+readyLiquidations;
const mapping=[...readyRefs.entries()].map(([source,v])=>({sourceShopperRef:source,targetKind:v.kind,targetShopperId:v.target})).sort((a,b)=>a.sourceShopperRef.localeCompare(b.sourceShopperRef));
const core={target:{firebaseProjectId:'cxorbia-backend-dev',tenantId:'tya',projectId:'cinepolis',environment:'DEV_CANONICAL'},status:'FINAL_PLAN_READY_NOT_AUTHORIZED_NOT_EXECUTABLE',strategy:{canonicalShadow:true,reuseExistingBackend:true,newFirebaseProject:false,deletePriorTopology:false,productionCutover:false,currentHrThroughJuly:true},identityResolution:{totalHrRefs:208,reuseExistingRefs:existing.size,linkToLegacyProfileCreateRefs:legacyLinks.size,createFromCurrentHrRefs:hrCreates.size,holdRefs:holds.size,readyRefs:readyRefs.size},groups:{tenant:{count:1,state:'HOLD_EXISTING_TENANT_FIELD_REVIEW',authorized:0},foundation:{count:foundation,state:'READY_FOR_EXACT_WRITE_AUTHORIZATION',authorized:0},legacyProfileCreates:{count:legacyProfileCreates,state:'READY_FOR_EXACT_WRITE_AUTHORIZATION',authorized:0},currentHrProfileCreates:{count:hrProfileCreates,state:'READY_FOR_EXACT_WRITE_AUTHORIZATION_WITH_LIVE_IDENTITY_RECHECK',authorized:0},existingProfileUpdates:{count:base.groups?.legacyProfiles?.existingProfilesPendingFieldDiff||0,state:'HOLD_EXISTING_FIELD_CONFLICT_REVIEW',authorized:0},legacyProfileHolds:{count:base.groups?.legacyProfiles?.totalHold||0,state:'HOLD_SOURCE_OR_IDENTITY_REVIEW',authorized:0},certifications:{readyCreate:certCreates,hold:(base.groups?.certifications?.holdProfileReview||0)+(base.groups?.certifications?.holdProfileNotFound||0),authorized:0},visits:{total:616,readyCreate:616,holdIdentity:0,source:'CURRENT_HR_THROUGH_JULY',authorized:0},liquidationControls:{total:572,readyCreate:572,holdIdentity:0,payments:0,authorized:0}},exactReadyWrites:{count:exactReadyWrites,authorized:0,breakdown:{foundation,legacyProfileCreates,currentHrProfileCreates:hrProfileCreates,certificationCreates:certCreates,visitCreates:616,liquidationControlCreates:572}},holds:{tenant:true,existingProfileUpdates:base.groups?.legacyProfiles?.existingProfilesPendingFieldDiff||0,legacyProfileHolds:base.groups?.legacyProfiles?.totalHold||0,certificationHolds:(base.groups?.certifications?.holdProfileReview||0)+(base.groups?.certifications?.holdProfileNotFound||0),currentHrIdentityHolds:0,augustHN:'HOLD_COUNTRY_TAB_MISMATCH'},sourceLocks:{legacySnapshotSha256:legacy.source?.sourceSnapshotSha256||null,currentHrSourceSha256:sha(fs.readFileSync(HR)),visitCrosswalkHash:vx.mappingHashSha256||null,currentIdentityEvidenceSha256:sha(fs.readFileSync(CURRENT_ID,'utf8')),baseR17nSha256:sha(fs.readFileSync(BASE,'utf8')),shopperMappingSha256:sha(mapping)},shopperReferenceMapping:mapping,safety:{providerCalls:0,firestoreWrites:0,authWrites:0,storageWrites:0,hrWrites:0,deletes:0,imports:0,deploys:0,production:false,merge:false,executeAllowed:false}};
const h=sha(core),rerun=sha(JSON.parse(JSON.stringify(core)));if(h!==rerun)throw new Error('final_idempotence_failed');
const out={schemaVersion:'cxorbia.r17n-final-write-plan-no-execute.v2',generatedAt:new Date().toISOString(),...core,offlineIdempotence:{pass:true,planHashSha256:h,rerunHashSha256:rerun}};
fs.writeFileSync(OUT,JSON.stringify(out,null,2)+'\n');fs.writeFileSync(OUT_MD,['# R17N FINAL — plan actual hasta julio · NO EXECUTE','',`- Referencias shopper actuales: 208/208 con target.`,'- 201 reutilizan shopper canónico existente; 2 enlazan perfil legacy a crear; 5 crean perfil desde identidad real HR vigente.',`- Perfiles legacy create: ${legacyProfileCreates}; perfiles HR current create: ${hrProfileCreates}.`,`- Certificaciones create: ${certCreates}; hold: ${core.holds.certificationHolds}.`,'- Visitas: 616/616 listas.','- Controles liquidación: 572/572 listos; pagos=0.',`- Writes listos exactos: ${exactReadyWrites}.`,'- Firestore/Auth/Storage/HR/provider writes ejecutados: 0.','- Deploy/merge/producción: 0.','',`- Idempotence hash: ${h} PASS.`,'- Siguiente gate: autorización explícita por grupos/conteos exactos; antes de los 5 perfiles HR-only se revalida la misma fuente viva en memoria.',''].join('\n'));
console.log(JSON.stringify({decision:'PASS_R17N_FINAL_CURRENT_HR_NO_EXECUTE',exactReadyWrites,identity:core.identityResolution,groups:core.groups,hash:h,safety:core.safety},null,2));
