// Exact partial evidence updates existing residual text. It never issues owner
// receipts, changes MATCH, certifies a domain, or executes product operations.
import {createHash} from 'node:crypto';
import {A08_GT_CURRENT_PROVIDER_MODE,validA08GtPasswordScope} from './cxorbia-i3-a08-exact-password-proof.mjs';
export const FINANCE_METADATA_SCOPE_PATH='docs/checkpoints/CXORBIA_I3_NOVEMBER_ADVANCE_METADATA_SCOPE_20261124.json';
const HN='shopper_hn_3b3c2f5cc1',GT='shopper_gt_a092a0647f',SHP='shp-3669abbb015a';
const PASSWORD_ID='A08.password.'+HN;
const GT_PASSWORD_ID='A08.password.'+GT;
const API_CASES=['anonymous',GT,HN,SHP];
const HN_PROOF=Object.freeze({runId:'45514816284',runAttempt:'1',jobId:'138871930190',artifactId:'14976459189',artifactDigest:'sha256:3531e310a17d435f6b4b5eebcd3c55b245939c4fdbdf96ab02d5c894b3ed3dbb',entry:'r20-shopper_hn_3b3c2f5cc1/result.json',entrySha256:'f901d42c1ff1ec0dd6538324b076021731da154f08b7d34e72a987939c76f2da'});
const API_PROOF=Object.freeze({runId:'45364936404',runAttempt:'1',runNumber:2760,artifactId:'14906482096',artifactDigest:'sha256:ec78e422057ff95e8d062c58df9c57aff9e30ddec505303461b2e95daf700dfa'});
const must=(ok,code)=>{if(!ok)throw Error('MAPPING_FAILURE:SCOPED_CLAUSES_'+code);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export const canonicalSha256=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const passwordRef=()=>({clauseId:PASSWORD_ID,caseId:HN,acceptedScope:'ORDINARY_PASSWORD_HR_RESTORE_LOGOUT_RELOGIN',evidence:{...HN_PROOF}});
const apiRef=caseId=>({clauseId:'A08.api.users.denial.'+caseId,caseId,acceptedScope:'GET_USERS_EXPECTED_401_403_ERROR_ONLY',evidence:{...API_PROOF}});
const validRef=ref=>same(ref,passwordRef())||API_CASES.some(id=>same(ref,apiRef(id)));
const identityKeys=['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'];
function exactGtIdentity(identity){
 return /^[a-f0-9]{40}$/.test(identity?.sourceSha||'')&&/^[a-f0-9]{40}$/.test(identity?.sourceTree||'')&&
  /^cxorbia-live-hr-dev-\d{5}-[a-z0-9]+$/.test(identity?.runtimeRevision||'')&&/^sha256:[a-f0-9]{64}$/.test(identity?.runtimeDigest||'')&&
  /^sites\/cxorbia-backend-dev\/versions\/[a-z0-9]+$/.test(identity?.hostingVersion||'');
}
function gtPasswordRef(proof,transport,identity){
 if(transport?.provider||!['runId','runAttempt','jobId','artifactId'].every(k=>/^[1-9][0-9]*$/.test(String(transport?.[k]||'')))||
  !/^sha256:[a-f0-9]{64}$/.test(transport?.artifactDigest||'')||!/^[a-f0-9]{40}$/.test(transport?.controlHead||'')||
  transport.entry!=='result.json'||typeof proof?.evidenceSha256!=='string'||!/^[a-f0-9]{64}$/.test(proof.evidenceSha256)||!exactGtIdentity(identity))return null;
 return {clauseId:GT_PASSWORD_ID,caseId:GT,acceptedScope:'ORDINARY_PASSWORD_HR_RESTORE_LOGOUT_RELOGIN',evidence:{
  kind:'VERIFIED_CURRENT_GT_PASSWORD_TYPED_RESULT',...Object.fromEntries(['runId','runAttempt','jobId','artifactId'].map(k=>[k,String(transport[k])])),
  artifactDigest:transport.artifactDigest,controlHead:transport.controlHead,entry:'result.json',
  childEntry:'r20-'+GT+'/result.json',entrySha256:proof.evidenceSha256,...Object.fromEntries(identityKeys.map(k=>[k,identity[k]]))}};
}
function gtTypedPasswordAccepted(result){
 const o=result.observations||{},p=o.gtPasswordProofs?.[0],s=o.safety||{};
 return result.decision==='RECORDED_A08_GT_PASSWORD_CURRENT_PROVIDER'&&result.producer?.jobName==='i3-keeper-role-e2e-readonly'&&
  result.producer?.jobConclusion==='success'&&result.producer?.decision==='HOLD_I3_A08_RESIDUAL_READONLY'&&
  result.identity?.complete===true&&exactGtIdentity(result.identity.observed)&&result.failureCodes?.length===0&&result.unclassifiedFailureCount===0&&
  o.executionMode===A08_GT_CURRENT_PROVIDER_MODE&&o.scopeDecision==='PASS_I3_A08_GT_PASSWORD_CURRENT_PROVIDER'&&
  o.gtPasswordVerified===true&&o.passwordProofCount===1&&o.passwordPassCount===1&&o.apiProofCount===0&&o.storageDiscoveryExecuted===false&&
  o.sameArtifactAfter===true&&o.finalChecks?.seal===true&&o.finalChecks.requestedScopePass===true&&o.finalChecks.pass===false&&
  o.finalChecks.passwords===false&&o.storageProof?.pass===false&&o.gtPasswordProofs?.length===1&&p?.caseId==='GT_EXCEPTION'&&p.pass===true&&
  p.currentProviderProofVerified===true&&p.historicalSealUsedAsAuthority===false&&['READ','NOT_READ'].includes(p.sealCheck)&&
  p.identityAndHr===true&&p.identityPreservedAfter===true&&p.loginAttempts===2&&['restore','logout','relogin'].every(k=>p.sessionLifecycle?.[k]===true)&&
  p.authorityPreflight?.caseId==='GT_EXCEPTION'&&p.authorityPreflight?.identityAuthority==='TENANT_ADJUDICATION'&&
  p.authorityPreflight?.provenanceAllowed===true&&p.authorityPreflight?.diagnosticComplete===true&&p.authorityPreflight?.failedChecks?.length===0&&
  s.loginAttempts===2&&s.browserLaunches===1&&s.hnLoginAttempts===0&&s.legacyLoginAttempts===0&&s.production===false&&
  ['customTokensUsed','providerCommands','directAuthWrites','directFirestoreWrites','storageWrites','hrWrites','passwordChanges','passwordResets','fixtureCreates','builds','deploys'].every(k=>s[k]===0);
}
function validGtRef(ref,{result,entry}){
 if(!gtTypedPasswordAccepted(result))return false;
 const provenance=result.provenance;
 if(!provenance||!['runId','runAttempt','jobId','artifactId'].every(k=>String(provenance[k])===String(entry[k]))||
  provenance.artifactDigest!==entry.artifactDigest||provenance.controlHead!==entry.controlHead||entry.ownerReceiptCount!==0)return false;
 const expected=gtPasswordRef(result.observations.gtPasswordProofs[0],provenance,result.identity.observed);
 return !!expected&&same(ref,expected);
}

// Allowlisted evidence identifiers and artifact hashes only. A diagnostic does
// not become a password proof; it can preserve an already accepted exact proof.
export function publicA08ClauseRefs(raw,transport){
 const preserved=Array.isArray(raw.preservedEvidence)?raw.preservedEvidence:[];
 const passwords=Array.isArray(raw.passwordProofs)?raw.passwordProofs:[];
 const directHn=String(transport.runId)===HN_PROOF.runId&&String(transport.runAttempt)===HN_PROOF.runAttempt&&String(transport.jobId)===HN_PROOF.jobId&&String(transport.artifactId)===HN_PROOF.artifactId&&transport.artifactDigest===HN_PROOF.artifactDigest&&passwords.some(x=>x?.shopperId===HN&&x.pass===true&&x.decision==='PASS_R20_ORDINARY_PASSWORD_FULL_SESSION_LIFECYCLE'&&x.evidenceSha256===HN_PROOF.entrySha256&&x.customTokenCountsAsPasswordProof===false);
 const preservedHn=preserved.some(x=>x?.credit==='HISTORICAL_HN_PASSWORD_LIFECYCLE_PASS_PRESERVED_NOT_REEXECUTED'&&['runId','runAttempt','jobId','artifactId'].every(k=>String(x[k])===HN_PROOF[k])&&'sha256:'+x.artifactSha256===HN_PROOF.artifactDigest&&x.entry===HN_PROOF.entry&&x.entrySha256===HN_PROOF.entrySha256&&x.currentRunLoginAttempts===0);
 const preservedApi=preserved.some(x=>x?.credit==='HISTORICAL_API_DENIALS_4_OF_4_PRESERVED_NOT_REEXECUTED'&&Number(x.runNumber)===API_PROOF.runNumber&&String(x.artifactId)===API_PROOF.artifactId&&'sha256:'+x.artifactSha256===API_PROOF.artifactDigest&&x.currentRunApiCalls===0);
 const gt=raw.gate==='HOLD'&&raw.fullA08Certified===false&&raw.newDomainMatches===0&&raw.decision==='HOLD_I3_A08_RESIDUAL_READONLY'&&
  raw.failure===undefined&&raw.error===undefined&&
  raw.scopeDecision==='PASS_I3_A08_GT_PASSWORD_CURRENT_PROVIDER'&&raw.sameArtifactAfter===true&&raw.finalChecks?.seal===true&&
  raw.finalChecks.gtPassword===true&&raw.finalChecks.requestedScopePass===true&&raw.finalChecks.pass===false&&
  transport.jobName==='i3-keeper-role-e2e-readonly'&&transport.jobConclusion==='success'&&transport.verifiedArchiveDigest===transport.artifactDigest&&
  validA08GtPasswordScope(raw)?gtPasswordRef(passwords[0],transport,raw):null;
 return [...(directHn||preservedHn?[passwordRef()]:[]),...(preservedApi?API_CASES.map(apiRef):[]),...(gt?[gt]:[])];
}

export function verifiedTypedReceipt(entry,bytes,{gitBlob,sha256}){
 must(gitBlob(bytes)===entry.gitBlob&&sha256(bytes)===entry.sha256,'INDEX_RECEIPT_HASH');
 const result=JSON.parse(bytes),proof=result.provenance||result.evidence;
 must(proof&&['runId','runAttempt','jobId','artifactId'].every(k=>String(proof[k])===String(entry[k]))&&proof.controlHead===entry.controlHead&&proof.artifactDigest===entry.artifactDigest,'INDEX_RECEIPT_IDENTITY');
 must(result.production===false&&Array.isArray(result.ownerSpecificReceipts)&&result.ownerSpecificReceipts.length===entry.ownerReceiptCount,'INDEX_RECEIPT_SCOPE');
 return {entry,result};
}

function metadataAccepted(result,scopeSha256){
 const o=result.observations||{},s=o.safety||{},decision=result.producer?.decision;
 if(!/^[a-f0-9]{64}$/.test(String(scopeSha256||''))||result.kind!=='FINANCE_METADATA'||result.producer?.jobConclusion!=='success'||!['PASS_FINANCE_METADATA_SECOND_ADVANCE','PASS_FINANCE_METADATA_ALREADY_APPLIED'].includes(decision)||o.scopeSha256!==scopeSha256)return false;
 if(!['readbackExact','firstUnchanged','financialFactsUnchanged','sameLedgerTotal'].every(k=>o[k]===true)||o.advanceCount!==2||o.newMovements!==0||o.allocationOrPayoutWrites!==0||s.production!==false||!['hrWrites','bankWrites','externalPaymentWrites','directFirestoreWrites','financialFactWrites'].every(k=>s[k]===0))return false;
 return decision==='PASS_FINANCE_METADATA_SECOND_ADVANCE'?o.providerCommandsExecuted===2&&o.providerWrites===3&&o.idempotentReplay===true:o.providerCommandsExecuted===0&&o.providerWrites===0&&o.idempotentNoop===true;
}

// These IDs already exist in nextPlannedBlock. A completed diagnostic never
// claims that the still-open F3 remote-write contract has passed.
export function completedExecutionTaskIds(verified){
 const completed=new Set();
 for(const {result:r}of verified){
  const o=r.observations||{},s=o.safety||{},p=o.writerProbe||{};
  if(r.kind!=='F3_RUN2782_RECOVERY'||r.state!=='HOLD'||r.production!==false||r.fullDomain!==false||r.newDomainMatches!==0||r.ownerSpecificReceipts?.length!==0||r.producer?.jobConclusion!=='success'||r.producer?.decision!=='PASS_F3_RUN2782_EXACT_OWNED_RECOVERY_ONLY')continue;
  if(o.firestoreDeletes!==29||o.authDeletes!==1||o.cleanup?.firestore!==true||o.cleanup?.auth!==true||o.cleanup?.remoteMake!=='INDEPENDENT_ABSENCE_ALREADY_PROVEN_NO_DELETE'||s.production!==false||!['hrWrites','remoteMakeWrites','productionWrites'].every(k=>s[k]===0))continue;
  completed.add('F3_RUN2782_RECOVERY');
  if(p.decision==='HOLD_F3_WRITER_TOOL_CONTRACT'&&p.stage==='contract'&&p.contractExact===false&&p.providerWrites===0&&p.callToolCount===0&&p.toolCount===1)completed.add('F3_TRANSPORT_DIAGNOSIS');
 }
 return [...completed];
}

export function projectCurrentScopedClauses({matrix,verified,financeScopeSha256}){
 const credit=new Map();
 for(const {entry,result}of [...verified].sort((a,b)=>Number(a.entry.runId)-Number(b.entry.runId)||Number(a.entry.jobId)-Number(b.entry.jobId))){
  if(result.state!=='HOLD'||result.fullDomain!==false||result.newDomainMatches!==0||result.production!==false||result.ownerSpecificReceipts.length!==0)continue;
  if(result.kind==='A08_RESIDUAL')for(const ref of result.observations?.acceptedClauseRefs||[]){
   must(validRef(ref)||validGtRef(ref,{result,entry}),'A08_REFERENCE_NOT_EXACT');
   if(!credit.has(ref.clauseId))credit.set(ref.clauseId,{clauseId:ref.clauseId,evidenceIndexKey:entry.key});
  }
  if(metadataAccepted(result,financeScopeSha256)){
   const id='FINANCE.NOVEMBER_SECOND_ADVANCE_METADATA';
   if(!credit.has(id))credit.set(id,{clauseId:id,evidenceIndexKey:entry.key,scopeSha256:financeScopeSha256});
  }
 }
 if(!credit.size)return {matrix:structuredClone(matrix),changedDomains:[],changed:false};
 const out=structuredClone(matrix),changedDomains=[];
 const hn=credit.get(PASSWORD_ID),gt=credit.get(GT_PASSWORD_ID),apis=API_CASES.map(id=>credit.get('A08.api.users.denial.'+id)),api=apis.every(Boolean),finance=credit.get('FINANCE.NOVEMBER_SECOND_ADVANCE_METADATA');
 const update=(domain,proofs,change)=>{
  if(!proofs.length)return;
  const mod=out.modules.find(m=>m.domain===domain);must(mod,'MODULE_MISSING_'+domain);
  if(mod.classification==='MATCH')return;
  const before=JSON.stringify(mod),r=mod.currentResidualClauses;
  must(r&&typeof r.pending==='string'&&typeof r.preserved==='string','RESIDUAL_SHAPE_'+domain);
  change(r);
  const refs=new Map((r.creditedClauseRefs||[]).map(x=>[x.clauseId,x]));
  for(const proof of proofs)if(!refs.has(proof.clauseId))refs.set(proof.clauseId,proof);
  r.creditedClauseRefs=[...refs.values()];
  mod.actionRequired=r.pending+(r.preserved?' PRESERVE: '+r.preserved:'');
  if(JSON.stringify(mod)!==before)changedDomains.push(domain);
 };
 const preserve=(r,text)=>{if(!r.preserved.includes(text))r.preserved+=(r.preserved?' ':'')+text;};
 const hnText='RUN2783 exact HN ordinary password, protected HR identity and restore/logout/relogin PASS preserved.';
 const gtText='GT exact ordinary password, protected HR identity and restore/logout/relogin PASS preserved from its verified same-artifact typed receipt.';
 const apiText='RUN2760 four GET users denials for anonymous and the three exact exception shoppers PASS preserved; remaining API cells stay pending.';
 update('auth-protected-data-runtime',[...(hn?[hn]:[]),...(gt?[gt]:[]),...(api?apis:[])],r=>{
  if(hn){
   const old=GT+','+HN+','+SHP;
   if(r.pending.includes(HN)){
    if(r.pending.includes(old))r.pending=r.pending.replace(old,GT+','+SHP);
    else{must(r.pending.includes(HN+','+SHP),'AUTH_PENDING_INVENTORY');r.pending=r.pending.replace(HN+','+SHP,SHP);}
   }
   preserve(r,hnText);
  }
  if(gt){
   if(r.pending.includes(GT)){
    if(r.pending.includes(GT+','+HN+','+SHP))r.pending=r.pending.replace(GT+','+HN+','+SHP,HN+','+SHP);
    else{must(r.pending.includes(GT+','+SHP),'AUTH_PENDING_INVENTORY');r.pending=r.pending.replace(GT+','+SHP,SHP);}
   }
   preserve(r,gtText);
  }
  if(api)preserve(r,apiText);
 });
 update('shoppers-mi-visitas-profile',[...(hn?[hn]:[]),...(gt?[gt]:[])],r=>{
  const patterns=[['three exactAuth exceptions',[GT,HN,SHP]],['two exact Auth exceptions ('+GT+', '+SHP+')',[GT,SHP]],['two exact Auth exceptions ('+HN+', '+SHP+')',[HN,SHP]],['one exact Auth exception ('+SHP+')',[SHP]]];
  const found=patterns.filter(([text])=>r.pending.includes(text));must(found.length===1,'SHOPPER_PENDING_INVENTORY');
  const [before,ids]=found[0],remaining=ids.filter(id=>!(id===HN&&hn)&&!(id===GT&&gt));
  const after=remaining.length===1?'one exact Auth exception ('+remaining[0]+')':'two exact Auth exceptions ('+remaining.join(', ')+')';
  r.pending=r.pending.replace(before,after);
  if(hn)preserve(r,hnText);if(gt)preserve(r,gtText);
 });
 update('core-config-data-router-permissions',api?apis:[],r=>preserve(r,apiText));
 update('finance-core-liquidation-costs',finance?[finance]:[],r=>{
  if(r.pending.includes(' and safe November metadata edit'))r.pending=r.pending.replace(' and safe November metadata edit','');
  else must(!r.pending.includes('November metadata edit'),'FINANCE_PENDING_INVENTORY');
  preserve(r,'RUN2783 exact second November advance metadata correction, committed readback and replay PASS; first advance and financial facts unchanged. Financial UI, payability and settlement residuals remain pending.');
 });
 must(same(matrix.classificationCounts,out.classificationCounts)&&same(matrix.modules.map(m=>[m.domain,m.classification]),out.modules.map(m=>[m.domain,m.classification])),'CLASSIFICATION_CHANGED');
 return {matrix:out,changedDomains,changed:changedDomains.length>0};
}
