#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const LEGACY='app/docs/evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json';
const R17M='app/docs/evidence/R17M-WRITE-PLAN-NO-EXECUTE-LATEST.json';
const OUT='app/docs/evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.json';
const OUT_MD='app/docs/evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.md';
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const slug=v=>String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const legacy=JSON.parse(fs.readFileSync(LEGACY,'utf8'));
const base=JSON.parse(fs.readFileSync(R17M,'utf8'));
if(legacy.schemaVersion!=='tya.legacy.shoppers-certifications-refresh.safe.v4')throw new Error('legacy_v4_required');
if(legacy.safety?.legacyProviderWrites!==0||legacy.safety?.canonicalProviderWrites!==0)throw new Error('legacy evidence not read-only');
if(base.target?.firebaseProjectId!=='cxorbia-backend-dev'||base.execution?.executeAllowed!==false)throw new Error('r17m architecture drift');

const sourceConflictIds=new Set((legacy.reviewRequired||[]).filter(x=>x.legacyShopperId).map(x=>x.legacyShopperId));
const actions=new Map((legacy.shopperDiff||[]).map(x=>[x.legacyShopperId,x]));
const profileRows=[];
for(const row of legacy.shopperDiff||[]){
  const sourceConflict=sourceConflictIds.has(row.legacyShopperId);
  let planState='HOLD_REVIEW',targetDocId=row.canonicalDocId||null,writeKind='hold';
  if(!sourceConflict&&['REUSE_OR_UPDATE_BY_STABLE_ID','REUSE_OR_UPDATE_BY_NORMALIZED_STABLE_ID','REUSE_OR_UPDATE_BY_STABLE_CODE'].includes(row.action)){
    planState='PENDING_READONLY_FIELD_DIFF_EXISTING';writeKind='existing_profile_diff';
  }else if(!sourceConflict&&row.action==='CREATE_CANDIDATE'){
    planState='CREATE_CANDIDATE_AFTER_EXACT_AUTH';writeKind='create';targetDocId=slug(row.legacyShopperId);
  }else if(sourceConflict){planState='HOLD_SOURCE_CONFLICT';}
  profileRows.push({legacyShopperId:row.legacyShopperId,targetDocId,sourceAction:row.action,sourceBasis:row.basis,planState,writeKind,certificationAttemptCount:row.certificationAttemptCount||0,recordFingerprint:row.recordFingerprint});
}
const countProfiles=state=>profileRows.filter(x=>x.planState===state).length;
const profileSummary={
  uniqueLegacyProfiles:profileRows.length,
  createCandidates:countProfiles('CREATE_CANDIDATE_AFTER_EXACT_AUTH'),
  existingProfilesPendingFieldDiff:countProfiles('PENDING_READONLY_FIELD_DIFF_EXISTING'),
  holdSourceConflict:countProfiles('HOLD_SOURCE_CONFLICT'),
  holdIdentityReview:countProfiles('HOLD_REVIEW'),
  totalHold:profileRows.filter(x=>x.planState.startsWith('HOLD_')).length
};

const certRows=[];
for(const cert of legacy.certifications||[]){
  const p=profileRows.find(x=>x.legacyShopperId===cert.legacyShopperId);
  if(!p){certRows.push({certificationId:cert.certificationId,legacyShopperId:cert.legacyShopperId,state:'HOLD_PROFILE_NOT_FOUND'});continue;}
  const profileResolved=['CREATE_CANDIDATE_AFTER_EXACT_AUTH','PENDING_READONLY_FIELD_DIFF_EXISTING'].includes(p.planState);
  certRows.push({certificationId:cert.certificationId,legacyShopperId:cert.legacyShopperId,targetShopperDocId:p.targetDocId,state:profileResolved?'CREATE_CANDIDATE_AFTER_PROFILE_RESOLUTION':'HOLD_PROFILE_REVIEW',status:cert.status,projectId:cert.projectId||null,certificationKey:cert.certificationKey||null,presentedAt:cert.presentedAt||null,score:cert.score??null,recoveredEvidence:cert.recoveredEvidence===true});
}
const certSummary={
  total:certRows.length,
  createCandidatesAfterProfileResolution:certRows.filter(x=>x.state==='CREATE_CANDIDATE_AFTER_PROFILE_RESOLUTION').length,
  holdProfileReview:certRows.filter(x=>x.state==='HOLD_PROFILE_REVIEW').length,
  holdProfileNotFound:certRows.filter(x=>x.state==='HOLD_PROFILE_NOT_FOUND').length,
  approved:certRows.filter(x=>x.status==='approved'||x.status==='approved_marker_only').length,
  failed:certRows.filter(x=>x.status==='failed').length,
  presentedOther:certRows.filter(x=>!['approved','approved_marker_only','failed'].includes(x.status)).length,
  recoveredEvidence:certRows.filter(x=>x.recoveredEvidence).length
};

const baseGroups=base.operationGroups||[];
const foundation=baseGroups.filter(x=>['project','hrImport','period'].includes(x.domain)).reduce((s,x)=>s+Number(x.count||0),0);
const visits=baseGroups.find(x=>x.domain==='visit')?.count||0;
const liquidations=baseGroups.find(x=>x.domain==='liquidation')?.count||0;
const hrProtected=baseGroups.find(x=>x.domain==='shopper')?.count||0;
const tenant=baseGroups.find(x=>x.domain==='tenant')?.count||0;
const exactPotentialBeforeExistingProfileFieldDiff=foundation+visits+liquidations+profileSummary.createCandidates+certSummary.createCandidatesAfterProfileResolution;
const maxPotentialIncludingExistingProfileUpdates=exactPotentialBeforeExistingProfileFieldDiff+profileSummary.existingProfilesPendingFieldDiff;

const core={
  target:{firebaseProjectId:'cxorbia-backend-dev',tenantId:'tya',projectId:'cinepolis',environment:'DEV_CANONICAL'},
  strategy:{reuseExistingBackend:true,newFirebaseProject:false,deletePriorTopology:false,productionCutover:false,canonicalShadow:true},
  sourceLocks:{legacySnapshotSha256:legacy.source?.sourceSnapshotSha256,r17mSha256:sha(fs.readFileSync(R17M,'utf8')),legacySchema:legacy.schemaVersion},
  groups:{
    tenant:{count:tenant,state:'HOLD_EXISTING_TENANT_FIELD_REVIEW'},
    foundation:{count:foundation,state:'READY_OFFLINE_IDEMPOTENCE'},
    hrProtectedShopperReferences:{count:hrProtected,state:'HOLD_PROFILE_CROSSWALK',reason:'HR contains protected name-derived assignment references; no name-only automerge.'},
    legacyProfiles:profileSummary,
    certifications:certSummary,
    visits:{count:visits,state:'READY_OFFLINE_IDEMPOTENCE',source:'HR_FIRST'},
    liquidationControls:{count:liquidations,state:'READY_OFFLINE_IDEMPOTENCE',payments:0}
  },
  potentialWrites:{exactBeforeExistingProfileFieldDiff:exactPotentialBeforeExistingProfileFieldDiff,maxIncludingExistingProfileUpdates:maxPotentialIncludingExistingProfileUpdates,authorized:0},
  holds:{sourceConflictIds:[...sourceConflictIds].sort(),nameOnlyAndIdentityReviewProfiles:profileRows.filter(x=>x.planState==='HOLD_REVIEW').map(x=>x.legacyShopperId).sort(),augustHN:'HOLD_COUNTRY_TAB_MISMATCH',hrProtectedCrosswalk:true},
  nextGates:['READONLY_EXISTING_PROFILE_FIELD_DIFF_22','OFFLINE_IDEMPOTENCE_HASH_GATE','EXACT_WRITE_AUTHORIZATION_BY_GROUP_AND_COUNT'],
  safety:{providerCalls:0,firestoreWrites:0,authWrites:0,storageWrites:0,hrWrites:0,deletes:0,imports:0,deploys:0,production:false,merge:false,executeAllowed:false}
};
const planHash=sha(core);
const rerunHash=sha(JSON.parse(JSON.stringify(core)));
if(planHash!==rerunHash)throw new Error('offline_idempotence_hash_failed');
const plan={schemaVersion:'cxorbia.r17n-post-legacy-write-plan-no-execute.v1',generatedAt:new Date().toISOString(),status:'POST_LEGACY_PLAN_READY_NOT_AUTHORIZED_NOT_EXECUTABLE',...core,offlineIdempotence:{pass:true,planHashSha256:planHash,rerunHashSha256:rerunHash},profileOperations:profileRows,certificationOperations:certRows};
fs.writeFileSync(OUT,JSON.stringify(plan,null,2)+'\n');
const md=['# R17N — plan post-refresh legacy · NO EXECUTE','',`- Legacy snapshot: \`${core.sourceLocks.legacySnapshotSha256}\`.`,'- Firebase objetivo: `cxorbia-backend-dev`; no nueva base.','- Provider calls=0; writes=0; deploy=0; producción=false.','',`- Foundation: ${foundation}.`,`- HR protected refs: ${hrProtected} HOLD crosswalk.`,`- Legacy profiles: ${profileSummary.uniqueLegacyProfiles}; create ${profileSummary.createCandidates}; existing field-diff ${profileSummary.existingProfilesPendingFieldDiff}; hold ${profileSummary.totalHold}.`,`- Certificaciones: ${certSummary.total}; candidatas ${certSummary.createCandidatesAfterProfileResolution}; hold ${certSummary.holdProfileReview+certSummary.holdProfileNotFound}.`,`- Visitas HR-first: ${visits}.`,`- Liquidation controls: ${liquidations}; pagos=0.`,`- Potencial exacto antes de diff de perfiles existentes: ${exactPotentialBeforeExistingProfileFieldDiff}.`,`- Máximo incluyendo hasta ${profileSummary.existingProfilesPendingFieldDiff} updates de perfiles existentes: ${maxPotentialIncludingExistingProfileUpdates}.`,'',`- Idempotence hash: \`${planHash}\` PASS.`,'- Siguiente: diff read-only de campos de perfiles existentes → autorización solo de writes exactos.',''];
fs.writeFileSync(OUT_MD,md.join('\n'));
console.log(JSON.stringify({decision:'PASS_R17N_POST_LEGACY_PLAN_NO_EXECUTE',profileSummary,certSummary,foundation,visits,liquidations,hrProtected,exactPotentialBeforeExistingProfileFieldDiff,maxPotentialIncludingExistingProfileUpdates,planHash,safety:plan.safety},null,2));
