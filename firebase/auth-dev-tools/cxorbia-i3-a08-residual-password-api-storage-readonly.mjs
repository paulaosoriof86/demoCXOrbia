#!/usr/bin/env node
/* I3 A08 residual QA on existing DEV only. No census, reset, write, fixture creation,
 * command POST, or full-domain promotion. Passwords use the existing sealed R20 helper.
 * API/Storage ACL sessions use existing real principals; they do not count as password proof.
 * Never export tokens, logins, UIDs, paths, private bytes, or provider error bodies. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {A08_USER_ADMIN_PATH,A08_PROVENANCE_TARGETS,publicA08ProvenanceDiagnostic,A08_GT_CURRENT_PROVIDER_MODE,validA08GtCurrentPasswordChild,validA08GtPasswordScope} from '../../tools/qa/cxorbia-i3-a08-exact-password-proof.mjs';
import {assertA08AssetSeal} from '../../tools/qa/cxorbia-i3-a08-current-artifact-pin.mjs';

export const EXCEPTION_IDS=Object.freeze(['shopper_gt_a092a0647f','shopper_hn_3b3c2f5cc1','shp-3669abbb015a']);
const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
const ROOT='https://cxorbia-backend-dev.web.app',BUCKET=PROJECT+'.firebasestorage.app';
const OUT='.tmp/cxorbia-i3-two-keepers-role-e2e-readonly';
const str=x=>String(x??'').trim(),arr=x=>Array.isArray(x)?x:[];
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const fp=x=>sha(str(x)).slice(0,20);
const need=(ok,code)=>{if(!ok)throw Error(code);};
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const save=result=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
export function safeFailure(error){
  const raw=str(error?.message||error);
  const m=raw.match(/(?:SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE):[A-Z0-9_]+/);
  return m?.[0]||(/timeout|abort/i.test(raw)?'ENVIRONMENT_FAILURE:A08_TIMEOUT':'ENVIRONMENT_FAILURE:A08_PROBE_FAILED');
}
export function apiDenial(status,body,anonymous=false){
  if(status!==(anonymous?401:403)||!body||typeof body!=='object'||Array.isArray(body))return false;
  if(Object.keys(body).some(k=>!['ok','error','details'].includes(k)))return false;
  const reasons=anonymous?['authorization_required']:['tenant_or_namespace_mismatch','user_admin_super_required'];
  return body.ok===false&&reasons.includes(body.error)&&(body.details===undefined||body.details===null);
}
export function storageDenial(status,body,anonymous=false){
  if(!(anonymous?[401,403]:[403]).includes(status)||!body||typeof body!=='object'||Array.isArray(body))return false;
  if(Object.keys(body).some(k=>k!=='error')||!body.error||typeof body.error!=='object')return false;
  return Number(body.error.code)===status&&typeof body.error.message==='string'&&
    Object.keys(body.error).every(k=>['code','message'].includes(k));
}
export function evidenceTuple(item,id){
  if(item?.tenantId!==TENANT||item?.projectId!==PROGRAM||item?.providerAck!==true||str(item.evidenceId)!==id)return null;
  const periodId=str(item.periodId),visitId=str(item.visitId),shopperId=str(item.shopperId),storagePath=str(item.storagePath);
  if(![periodId,visitId,shopperId,id].every(v=>/^[A-Za-z0-9_.-]{1,180}$/.test(v)))return null;
  const prefix=`tenants/${TENANT}/projects/${PROGRAM}/periods/${periodId}/visits/${visitId}/evidence/${id}/`;
  if(!storagePath.startsWith(prefix)||!/^[-A-Za-z0-9_.]+$/.test(storagePath.slice(prefix.length))||storagePath.includes('..'))return null;
  if(!/^[a-f0-9]{64}$/.test(str(item.checksum))||!/^image\//.test(str(item.mimeType))||
    !Number.isInteger(Number(item.size))||Number(item.size)<=0||Number(item.size)>=15*1024*1024)return null;
  return {periodId,visitId,shopperId,storagePath,evidenceId:id,checksum:item.checksum,mimeType:item.mimeType,size:Number(item.size)};
}
export function finalDecision(result,before,after,pin){
  const same=['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','firestoreRuleset','storageRuleset','receiptPath','receiptGitBlob','controlHead'];
  let inventoryExact=false;
  try{assertA08AssetSeal(pin,before);assertA08AssetSeal(pin,after);inventoryExact=true;}catch{}
  const seal=inventoryExact&&before.phase==='before'&&after.phase==='after'&&
    same.every(k=>str(before[k])&&before[k]===after[k]&&(k==='storageRuleset'||before[k]===pin[k]))&&before.sourceSha===result.sourceSha;
  const passwords=result.passwordProofs?.length===3&&EXCEPTION_IDS.every(id=>result.passwordProofs.some(x=>x.shopperId===id&&x.pass===true));
  const apis=result.apiProofs?.length===4&&result.apiProofs.every(x=>x.pass===true);
  const storage=result.storageProof?.pass===true&&result.storageProof?.objectStable===true;
  const errorFree=result.errors?.length===0;
  const diagnosticOnly=result.scope?.executionMode==='PROVENANCE_ONLY',diagnostics=arr(result.provenanceDiagnostics);
  const gtOnly=result.scope?.executionMode===A08_GT_CURRENT_PROVIDER_MODE;
  const diagnosticComplete=diagnosticOnly&&seal&&errorFree&&diagnostics.length===2&&Object.keys(A08_PROVENANCE_TARGETS).every(id=>diagnostics.filter(x=>x.caseId===id).length===1)&&
    diagnostics.every(x=>x.diagnosticOnly===true&&x.diagnosticComplete===true&&x.loginAttempts===0&&x.browserLaunches===0&&x.customTokensUsed===0&&x.historicalSameUidProof?.recipeUsedForLogin===false)&&
    result.passwordProofs?.length===0&&result.apiProofs?.length===0&&result.storageDiscovery?.executed===false;
  const gtPassword=gtOnly&&validA08GtPasswordScope(result);
  const requestedScopePass=Boolean(!diagnosticOnly&&seal&&errorFree&&(gtOnly?gtPassword:passwords&&(result.scope?.executionMode==='PASSWORD_ONLY'||(apis&&(result.scope?.executionMode==='PASSWORD_API_ONLY'||storage)))));
  return {seal,expectedAssetCount:pin?.verifiedServedAssetCount??null,servedAssetCount:seal?before.servedAssetsMatch:0,passwords,apis,storage,requestedScopePass,pass:Boolean(!diagnosticOnly&&!gtOnly&&seal&&passwords&&apis&&storage&&errorFree),...(diagnosticOnly?{diagnosticComplete:Boolean(diagnosticComplete)}:{}),...(gtOnly?{gtPassword:Boolean(gtPassword)}:{})};
}

export function validateA08ProvenanceChild(proof,{caseId,shopperId,sourceSha}){
  need(proof?.schemaVersion==='cxorbia.i3.r20.one-proven-credential-readonly.v2'&&proof.sourceSha===sourceSha&&proof.decision==='HOLD_R20_PROVENANCE_ONLY'&&proof.diagnosticOnly===true&&proof.diagnosticComplete===true,'MAPPING_FAILURE:A08_PROVENANCE_CHILD_INCOMPLETE');
  need(proof.selection?.boundedShopperIdQuery===true&&proof.selection.requestedShopperId===shopperId&&proof.selection.selected===false,'MAPPING_FAILURE:A08_PROVENANCE_CHILD_SCOPE');
  need(['attemptedAccounts','loginAttempts','browserLaunches','customTokensUsed','authWrites','passwordChanges','passwordResets','firestoreWrites','hrWrites','financeWrites','providerWrites','deploys'].every(k=>proof[k]===0)&&proof.production===false,'AUTH_FAILURE:A08_PROVENANCE_UNEXPECTED_ACTION');
  need(proof.provenanceDiagnostics?.length===1&&proof.provenanceDiagnostics[0].caseId===caseId,'MAPPING_FAILURE:A08_PROVENANCE_CHILD_CASE');
  const diagnostic=publicA08ProvenanceDiagnostic(proof.provenanceDiagnostics[0]);
  need(diagnostic.diagnosticOnly&&diagnostic.diagnosticComplete&&diagnostic.primaryReason&&diagnostic.historicalSameUidProof.recipeUsedForLogin===false,'MAPPING_FAILURE:A08_PROVENANCE_CHILD_DIAGNOSTIC');
  return diagnostic;
}
// Keep the existing password-only job contract in code instead of duplicating
// its long jq expression for every mode in the size-bounded workflow.
export function assertA08ExecutionResult(result){
  need(result?.gate==='HOLD'&&result.fullA08Certified===false&&result.newDomainMatches===0,'MAPPING_FAILURE:A08_RESULT_SCOPE');
  if(result.scope?.executionMode==='PROVENANCE_ONLY')need(result.decision==='HOLD_I3_A08_RESIDUAL_READONLY'&&result.diagnosticComplete===true&&result.finalChecks?.diagnosticComplete===true&&result.finalChecks.requestedScopePass===false&&result.finalChecks.pass===false&&result.passwordProofs?.length===0&&result.apiProofs?.length===0&&result.storageDiscovery?.executed===false,'MAPPING_FAILURE:A08_PROVENANCE_RESULT_INCOMPLETE');
  else if(result.scope?.executionMode==='PASSWORD_ONLY')need(result.decision==='HOLD_I3_A08_STORAGE_PENDING'&&result.passwordProofs?.length===3&&result.apiProofs?.length===0&&result.scopeDecision==='PASS_I3_A08_PASSWORD3_SCOPED_READONLY'&&result.finalChecks?.requestedScopePass===true&&result.storageDiscovery?.executed===false,'MAPPING_FAILURE:A08_PASSWORD_RESULT_INCOMPLETE');
  else if(result.scope?.executionMode===A08_GT_CURRENT_PROVIDER_MODE)need(result.decision==='HOLD_I3_A08_RESIDUAL_READONLY'&&result.scopeDecision==='PASS_I3_A08_GT_PASSWORD_CURRENT_PROVIDER'&&result.sameArtifactAfter===true&&result.finalChecks?.seal===true&&result.finalChecks.gtPassword===true&&result.finalChecks.requestedScopePass===true&&result.finalChecks.pass===false&&validA08GtPasswordScope(result),'MAPPING_FAILURE:A08_GT_PASSWORD_RESULT_INCOMPLETE');
  return true;
}

async function boundedBytes(response,max){
  const reader=response.body?.getReader();
  if(!reader)return Buffer.alloc(0);
  const chunks=[];let length=0;
  try{
    for(;;){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;
      need(length<=max,'PROVIDER_FAILURE:A08_RESPONSE_TOO_LARGE');chunks.push(Buffer.from(value));}
    return Buffer.concat(chunks,length);
  }finally{await reader.cancel().catch(()=>{});}
}
async function safeJson(response,max=65536){
  const bytes=await boundedBytes(response,max);
  try{return JSON.parse(bytes.toString('utf8'));}catch{return null;}
}
async function run(){
  fs.mkdirSync(OUT,{recursive:true});
  const provenanceOnly=process.argv.includes('--provenance-only');
  const gtCurrentProvider=process.argv.includes('--gt-current-provider-password-only');
  need(!gtCurrentProvider||!['--provenance-only','--password-only','--password-api-only'].some(x=>process.argv.includes(x)),'SOURCE_FAILURE:A08_GT_PASSWORD_MODE_CONFLICT');
  if(process.argv.includes('--execute-and-seal')){
    need(process.env.CXORBIA_A08_RESIDUAL_READONLY==='PAULA_I3_EXISTING_DEV_RESIDUAL_READONLY','SOURCE_FAILURE:A08_READONLY_GATE_REQUIRED');
    fs.rmSync(OUT+'/same-artifact-after.json',{force:true});
    const self=fileURLToPath(import.meta.url);
    const proof=spawnSync(process.execPath,[self,...(gtCurrentProvider?['--gt-current-provider-password-only']:provenanceOnly?['--provenance-only']:process.argv.includes('--password-only')?['--password-only']:process.argv.includes('--password-api-only')?['--password-api-only']:[])],{env:process.env,stdio:'ignore',timeout:30*60*1000});
    const after=spawnSync('bash',['tools/qa/cxorbia-i3-a08-same-artifact-readonly.sh'],{
      env:{...process.env,CXORBIA_A08_PREFLIGHT_PHASE:'after'},stdio:'ignore',timeout:5*60*1000});
    const final=spawnSync(process.execPath,[self,'--finalize'],{env:process.env,stdio:'ignore',timeout:30000});
    let summary=null;try{summary=read(OUT+'/result.json');}catch{}
    try{assertA08ExecutionResult(summary);}catch(error){console.error(safeFailure(error));process.exitCode=1;}
    console.log(JSON.stringify({decision:summary?.decision||'HOLD_I3_A08_RESIDUAL_READONLY',
      passwordPassCount:summary?.passwordProofs?.filter(x=>x.pass).length||0,
      apiDenialPassCount:summary?.apiProofs?.filter(x=>x.pass).length||0,
      storagePass:summary?.storageProof?.pass===true,artifactAfterPass:summary?.sameArtifactAfter===true,scopeDecision:summary?.scopeDecision||null,
      diagnosticComplete:summary?.diagnosticComplete===true,provenanceCaseCount:summary?.provenanceDiagnostics?.length||0,
      failureCodes:summary?.errors?.map(x=>x.code)||[],
      executionExitCodes:{proof:proof.status,after:after.status,final:final.status},fullA08Certified:false,newDomainMatches:0}));
    if(proof.status!==0||after.status!==0||final.status!==0)process.exitCode=1;
    return;
  }
  if(process.argv.includes('--finalize')){
    let result;
    try{
      result=read(OUT+'/result.json');
      const before=read(OUT+'/same-artifact-preflight.json'),after=read(OUT+'/same-artifact-after.json');
      const pin=read(process.env.CXORBIA_A08_PIN_PATH||OUT+'/current-artifact-pin.json');
      result.finalChecks=finalDecision(result,before,after,pin);
      result.sameArtifactAfter=result.finalChecks.seal;
      if(result.scope.executionMode==='PROVENANCE_ONLY')result.diagnosticComplete=result.finalChecks.diagnosticComplete;
      result.decision=result.scope.executionMode===A08_GT_CURRENT_PROVIDER_MODE?'HOLD_I3_A08_RESIDUAL_READONLY':result.finalChecks.pass?'PASS_I3_A08_SCOPED_PASSWORD3_API_STORAGE_READONLY':result.finalChecks.requestedScopePass?'HOLD_I3_A08_STORAGE_PENDING':'HOLD_I3_A08_RESIDUAL_READONLY';
      result.scopeDecision=result.finalChecks.requestedScopePass?(result.scope.executionMode===A08_GT_CURRENT_PROVIDER_MODE?'PASS_I3_A08_GT_PASSWORD_CURRENT_PROVIDER':result.scope.executionMode==='PASSWORD_ONLY'?'PASS_I3_A08_PASSWORD3_SCOPED_READONLY':result.scope.executionMode==='PASSWORD_API_ONLY'?'PASS_I3_A08_PASSWORD3_API_SCOPED_READONLY':'PASS_I3_A08_SCOPED_PASSWORD3_API_STORAGE_READONLY'):'HOLD_I3_A08_REQUESTED_SCOPE_UNPROVEN';
      result.gate='HOLD';result.fullA08Certified=false;result.newDomainMatches=0;
      save(result);console.log(JSON.stringify({decision:result.decision,checks:result.finalChecks,fullA08Certified:false,newDomainMatches:0}));
      if(!(result.scope.executionMode==='PROVENANCE_ONLY'?result.finalChecks.diagnosticComplete:result.finalChecks.requestedScopePass))process.exitCode=1;
    }catch(error){
      if(result){result.errors??=[];result.errors.push({stage:'artifact-after',code:safeFailure(error)});result.decision='HOLD_I3_A08_RESIDUAL_READONLY';save(result);}
      console.error('RELEASE_COMPOSITION_FAILURE:A08_FINAL_ARTIFACT_READBACK_MISSING');process.exitCode=1;
    }
    return;
  }
  const result={schemaVersion:'cxorbia.i3.a08.password3-api-storage.residual.readonly.v1',iteration:'I3',gate:'HOLD',
    decision:'HOLD_I3_A08_RESIDUAL_READONLY',environment:PROJECT,fullA08Certified:false,newDomainMatches:0,
    sourceSha:null,sourceTree:null,runtimeRevision:null,runtimeDigest:null,hostingVersion:null,
    scope:{tenantId:TENANT,projectId:PROGRAM,exceptionShopperIds:gtCurrentProvider?[A08_PROVENANCE_TARGETS.GT_EXCEPTION]:provenanceOnly?Object.values(A08_PROVENANCE_TARGETS):EXCEPTION_IDS,executionMode:gtCurrentProvider?A08_GT_CURRENT_PROVIDER_MODE:provenanceOnly?'PROVENANCE_ONLY':process.argv.includes('--password-only')?'PASSWORD_ONLY':process.argv.includes('--password-api-only')?'PASSWORD_API_ONLY':'PASSWORD_API_STORAGE',
      apiOperation:provenanceOnly||gtCurrentProvider?null:'GET /api/tenants/{tenant}/users',storageOperation:provenanceOnly||gtCurrentProvider?null:'GET existing private visit evidence',
      rolesRequiredForIntegralA08:['super','admin','ops','coordinador','shopper','cliente'],
      rolesNewlyProbed:provenanceOnly?[]:gtCurrentProvider?['shopper']:['shopper','anonymous'],repeatsAcceptedFirestoreProof:false,requiresProtectedHrAuthority:!provenanceOnly,
      passwordProofBoundary:provenanceOnly?'PROVENANCE_ONLY_NO_PASSWORD_ATTEMPT':'EXACT_PASSWORD_PLUS_HR_IDENTITY_RESTORE_LOGOUT_RELOGIN'},
    passwordProofs:[],apiProofs:[],storageProof:null,preservedEvidence:[],errors:[],
    ...(provenanceOnly?{provenanceDiagnostics:[],diagnosticComplete:false}:{}),
    remainingIntegralA08:['Uncovered UI/claims/membership/API/Firestore/Storage cells for all six roles; retain exact accepted cells.'],
    safety:{providerCommands:0,directAuthWrites:0,directFirestoreWrites:0,storageWrites:0,hrWrites:0,
      passwordChanges:0,passwordResets:0,fixtureCreates:0,builds:0,deploys:0,production:false,
      credentialsExported:false,tokensExported:false,privateBytesExported:false,privatePathsExported:false,
      ...(provenanceOnly||gtCurrentProvider?{loginAttempts:0,browserLaunches:0,customTokensUsed:0}:{}),...(gtCurrentProvider?{hnLoginAttempts:0,legacyLoginAttempts:0}:{})}};
  save(result);
  const capture=async(stage,fn)=>{try{await fn();}catch(error){result.errors.push({stage,code:safeFailure(error)});}finally{save(result);}};
  try{
    need(process.env.CXORBIA_A08_RESIDUAL_READONLY==='PAULA_I3_EXISTING_DEV_RESIDUAL_READONLY',
      'SOURCE_FAILURE:A08_READONLY_GATE_REQUIRED');
    const pin=read(process.env.CXORBIA_A08_PIN_PATH||OUT+'/current-artifact-pin.json');
    const pre=read(OUT+'/same-artifact-preflight.json');
    need(pin.decision==='PASS_A08_CURRENT_ARTIFACT_PIN'&&pre.decision==='PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT'&&
      pre.sourceSha===pin.sourceSha&&pre.phase==='before','RELEASE_COMPOSITION_FAILURE:A08_EXACT_PREFLIGHT_REQUIRED');
    assertA08AssetSeal(pin,pre);
    for(const key of ['sourceTree','runtimeRevision','runtimeDigest','hostingVersion','firestoreRuleset','receiptPath','receiptGitBlob','controlHead'])
      need(pre[key]===pin[key],'RELEASE_COMPOSITION_FAILURE:A08_PREFLIGHT_TUPLE_DESYNC');
    result.artifactInventory={verifiedServedAssetCount:pin.verifiedServedAssetCount,servedInventorySha256:pin.servedInventorySha256};
    for(const key of ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'])result[key]=pin[key];
    result.receiptAuthority={path:pin.receiptPath,gitBlob:pin.receiptGitBlob};
    if(!gtCurrentProvider){
      const sa=read(str(process.env.GOOGLE_APPLICATION_CREDENTIALS));
      need(sa.project_id===PROJECT&&typeof sa.private_key==='string','ENVIRONMENT_FAILURE:A08_DEV_SERVICE_ACCOUNT_REQUIRED');
    }
    for(const file of [
      'docs/checkpoints/CXORBIA_I3_RUN2610_A08_AUTH_EXCEPTIONS_AND_NEGATIVE_FIRESTORE_DEV_20261118.json',
      'docs/checkpoints/CXORBIA_I3_A08_AUTH_ROLE_LIVE_E2E_HISTORICAL_DISABLED_CLASSIFICATION_20261119.json',
      'docs/checkpoints/CXORBIA_I3_A08_NEGATIVE_RUN2643_READBACK_20261119.json']){
      const content=execFileSync('git',['show','HEAD:'+file],{encoding:'utf8',maxBuffer:2*1024*1024,stdio:['ignore','pipe','ignore']});
      const evidence=JSON.parse(content);
      need(/^PASS_/.test(str(evidence.scopeDecision||evidence.decision)),'SOURCE_FAILURE:A08_ACCEPTED_RECEIPT_UNAVAILABLE');
      result.preservedEvidence.push({path:file,gitBlob:execFileSync('git',['rev-parse','HEAD:'+file],{encoding:'utf8'}).trim(),
        sha256:sha(content),credit:'HISTORICAL_ACCEPTED_SCOPE_PRESERVED_NOT_REEXECUTED'});
    }
    if(provenanceOnly){
      result.provenanceDiagnostics=[];result.diagnosticComplete=false;
      result.storageDiscovery={executed:false,reason:'PROVENANCE_ONLY_NOT_REQUESTED'};
      result.storageProof={pass:false,skipped:true,reason:'PROVENANCE_ONLY_NOT_REQUESTED'};
      Object.assign(result.safety,{loginAttempts:0,browserLaunches:0,customTokensUsed:0});
      result.preservedEvidence.push({runId:45514816284,runAttempt:1,jobId:138871930190,artifactId:14976459189,
        artifactSha256:'3531e310a17d435f6b4b5eebcd3c55b245939c4fdbdf96ab02d5c894b3ed3dbb',
        entry:'r20-shopper_hn_3b3c2f5cc1/result.json',entrySha256:'f901d42c1ff1ec0dd6538324b076021731da154f08b7d34e72a987939c76f2da',
        credit:'HISTORICAL_HN_PASSWORD_LIFECYCLE_PASS_PRESERVED_NOT_REEXECUTED',currentRunLoginAttempts:0},
        {runNumber:2760,artifactId:14906482096,artifactSha256:'ec78e422057ff95e8d062c58df9c57aff9e30ddec505303461b2e95daf700dfa',credit:'HISTORICAL_API_DENIALS_4_OF_4_PRESERVED_NOT_REEXECUTED',currentRunApiCalls:0});
      for(const [caseId,id]of Object.entries(A08_PROVENANCE_TARGETS))await capture('provenance-'+caseId,async()=>{
        const output=OUT+'/r20-'+id;
        const proc=spawnSync(process.execPath,['tools/qa/cxorbia-i3-r20-ordinary-password-single-readonly.mjs','--provenance-only'],{
          env:{...process.env,R20_CREDENTIAL_AUTHORITY:'CURRENT_PROVIDER_VERIFIED_RULE_V1',R20_AUTHORIZED_TEST_SHOPPER_ID:id,R20_AUTHORIZED_TEST_LOGIN:'',R20_SOURCE_SHA:pin.sourceSha,R20_HOSTING_URL:ROOT,R20_SAFE_OUT:output},
          encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024,stdio:['ignore','pipe','pipe']});
        let proof=null;try{proof=read(output+'/result.json');}catch{}
        need(proc.status===0,'ENVIRONMENT_FAILURE:A08_PROVENANCE_CHILD_FAILED');
        result.provenanceDiagnostics.push(validateA08ProvenanceChild(proof,{caseId,shopperId:id,sourceSha:pin.sourceSha}));
      });
      result.decision='PENDING_A08_FINAL_SAME_ARTIFACT_READBACK';
      if(result.errors.length)process.exitCode=1;
      return;
    }
    const [{applicationDefault,getApps,initializeApp},{getAuth},{getFirestore},{getStorage}]=await Promise.all([
      import('firebase-admin/app'),import('firebase-admin/auth'),import('firebase-admin/firestore'),import('firebase-admin/storage')]);
    if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT,storageBucket:BUCKET});
    const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
    const bucket=getStorage().bucket(BUCKET),members=new Map(),sessions=new Map();
    const configResponse=await fetch(ROOT+'/__/firebase/init.json',{redirect:'error',signal:AbortSignal.timeout(30000)});
    const config=await safeJson(configResponse);
    need(configResponse.ok&&config?.projectId===PROJECT&&str(config.apiKey),'ENVIRONMENT_FAILURE:A08_FIREBASE_CONFIG_MISMATCH');
    async function memberFor(shopperId){
      if(members.has(shopperId))return members.get(shopperId);
      const [profile,snap]=await Promise.all([tenant.collection('shoppers').doc(shopperId).get(),tenant.collection('users').where('shopperId','==',shopperId).limit(9).get()]);
      need(profile.exists&&snap.size<9,'MAPPING_FAILURE:A08_EXACT_SHOPPER_PROFILE_OR_QUERY_UNAVAILABLE');
      const eligible=[];
      for(const doc of snap.docs){const m=doc.data()||{};
        if(m.active!==true||m.role!=='shopper'||m.authNamespace!=='shopper'||!arr(m.projectIds).includes(PROGRAM))continue;
        let user;try{user=await auth.getUser(doc.id);}catch(error){if(error?.code==='auth/user-not-found')continue;throw error;}
        const c=user.customClaims||{};
        if(user.disabled||c.role!=='shopper'||c.authNamespace!=='shopper'||c.tenantId!==TENANT||c.shopperId!==shopperId||!arr(c.projectIds).includes(PROGRAM))continue;
        eligible.push({uid:doc.id,shopperId});
      }
      need(eligible.length===1,'AUTH_FAILURE:A08_EXACT_ACTIVE_PRINCIPAL_NOT_UNIQUE');
      members.set(shopperId,eligible[0]);return eligible[0];
    }
    async function tokenFor(shopperId){
      if(sessions.has(shopperId))return sessions.get(shopperId);
      const member=await memberFor(shopperId),custom=await auth.createCustomToken(member.uid);
      const response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(config.apiKey),{
        method:'POST',redirect:'error',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true}),signal:AbortSignal.timeout(45000)});
      const value=await safeJson(response);
      need(response.ok&&str(value?.idToken),'AUTH_FAILURE:A08_ACL_SESSION_UNAVAILABLE');
      const claims=await auth.verifyIdToken(value.idToken,true);
      need(claims.uid===member.uid&&claims.tenantId===TENANT&&claims.role==='shopper'&&claims.authNamespace==='shopper'&&
        claims.shopperId===shopperId&&arr(claims.projectIds).includes(PROGRAM),'AUTH_FAILURE:A08_ACL_SESSION_SCOPE_MISMATCH');
      sessions.set(shopperId,value.idToken);return value.idToken;
    }
    // One exact proven credential per ID. The helper never tries guessed variants or resets.
    for(const id of gtCurrentProvider?[A08_PROVENANCE_TARGETS.GT_EXCEPTION]:EXCEPTION_IDS)await capture('password-'+id,async()=>{
      const output=OUT+'/r20-'+id;
      const proc=spawnSync(process.execPath,['tools/qa/cxorbia-i3-r20-ordinary-password-single-readonly.mjs',...(gtCurrentProvider?['--gt-current-provider-adc']:[])],{
        env:{...process.env,...(gtCurrentProvider||result.scope.executionMode==='PASSWORD_ONLY'?{R20_CREDENTIAL_AUTHORITY:'CURRENT_PROVIDER_VERIFIED_RULE_V1'}:{}),R20_AUTHORIZED_TEST_SHOPPER_ID:id,R20_AUTHORIZED_TEST_LOGIN:'',R20_SOURCE_SHA:pin.sourceSha,
          R20_HOSTING_URL:ROOT,R20_SAFE_OUT:output},encoding:'utf8',timeout:345000,maxBuffer:2*1024*1024,stdio:['ignore','pipe','pipe']});
      let proof=null;try{proof=read(output+'/result.json');}catch{}
      const pass=proc.status===0&&(!gtCurrentProvider||validA08GtCurrentPasswordChild(proof,pin.sourceSha))&&proof?.sourceSha===pin.sourceSha&&proof?.decision==='PASS_R20_ORDINARY_PASSWORD_FULL_SESSION_LIFECYCLE'&&
        ['EXACT_SEALED_HASH_CANONICAL_RULE_AND_AUTH_CLAIMS','EXACT_SEALED_HASH_EXISTING_LOGIN_ALIAS_AND_AUTH_CLAIMS','CURRENT_DURABLE_PROVIDER_RULE_AND_EXACT_KEEPER_AUTH'].includes(proof.credentialProvenance)&&proof.attemptedAccounts===1&&
        proof.selection?.boundedShopperIdQuery===true&&proof.selection?.requestedShopperId===id&&proof.selection?.selectedShopperMatchesRequested===true&&
        (proof.credentialProvenance!=='CURRENT_DURABLE_PROVIDER_RULE_AND_EXACT_KEEPER_AUTH'||proof.selection?.durableProviderProof===true)&&proof.identityPreservedAfter===true&&
        proof.sessionLifecycle?.restore===true&&proof.sessionLifecycle?.logout===true&&proof.sessionLifecycle?.relogin===true&&
        proof.authWrites===0&&proof.passwordChanges===0&&proof.passwordResets===0&&proof.firestoreWrites===0&&proof.production===false;
      result.passwordProofs.push({shopperId:id,pass,decision:str(proof?.decision)||'HOLD_R20_RESULT_UNAVAILABLE',
        credentialProvenance:str(proof?.credentialProvenance)||'NOT_PROVEN',loginAttempts:Number(proof?.loginAttempts)||0,
        evidencePath:output+'/result.json',evidenceSha256:proof?sha(fs.readFileSync(output+'/result.json')):null,
        customTokenCountsAsPasswordProof:false,exactExistingAliasProven:proof?.selection?.exactExistingAliasProven===true,
        usernameCanonizationProven:false,...(gtCurrentProvider?{caseId:'GT_EXCEPTION',currentProviderProofVerified:validA08GtCurrentPasswordChild(proof,pin.sourceSha),
          sealCheck:['NOT_READ','READ'].includes(proof?.sealCheck)?proof.sealCheck:null,historicalSealUsedAsAuthority:false,
          identityAndHr:proof?.identityAndHr===true,identityPreservedAfter:proof?.identityPreservedAfter===true,
          sessionLifecycle:Object.fromEntries(['restore','logout','relogin'].map(k=>[k,proof?.sessionLifecycle?.[k]===true])),
          authorityPreflight:proof?.currentProviderDiagnostic?publicA08ProvenanceDiagnostic(proof.currentProviderDiagnostic):null}: {})});
      if(gtCurrentProvider){result.safety.loginAttempts=Number(proof?.loginAttempts)||0;result.safety.browserLaunches=Number(proof?.browserLaunches)||0;result.safety.customTokensUsed=Number(proof?.customTokensUsed)||0;}
      need(pass,'AUTH_FAILURE:A08_EXACT_ORDINARY_PASSWORD_UNPROVEN');
    });
    if(gtCurrentProvider)result.preservedEvidence.push({runId:45514816284,runAttempt:1,jobId:138871930190,artifactId:14976459189,
      artifactSha256:'3531e310a17d435f6b4b5eebcd3c55b245939c4fdbdf96ab02d5c894b3ed3dbb',entry:'r20-shopper_hn_3b3c2f5cc1/result.json',
      entrySha256:'f901d42c1ff1ec0dd6538324b076021731da154f08b7d34e72a987939c76f2da',credit:'HISTORICAL_HN_PASSWORD_LIFECYCLE_PASS_PRESERVED_NOT_REEXECUTED',currentRunLoginAttempts:0});
    if(gtCurrentProvider||result.scope.executionMode==='PASSWORD_ONLY')result.preservedEvidence.push({runNumber:2760,artifactId:14906482096,
      artifactSha256:'ec78e422057ff95e8d062c58df9c57aff9e30ddec505303461b2e95daf700dfa',credit:'HISTORICAL_API_DENIALS_4_OF_4_PRESERVED_NOT_REEXECUTED',currentRunApiCalls:0});
    else for(const id of [null,...EXCEPTION_IDS])await capture('api-'+(id||'anonymous'),async()=>{
      const token=id?await tokenFor(id):null;
      const response=await fetch(ROOT+A08_USER_ADMIN_PATH,{
        method:'GET',redirect:'error',headers:token?{authorization:'Bearer '+token,'cache-control':'no-store'}:{'cache-control':'no-store'},signal:AbortSignal.timeout(45000)});
      let body=null;
      if([401,403].includes(response.status))body=await safeJson(response);
      else await response.body?.cancel().catch(()=>{});
      const pass=apiDenial(response.status,body,id===null);
      result.apiProofs.push({caseId:id||'anonymous',role:id?'shopper':'anonymous',httpStatus:response.status,
        pass,denialResponseHasOnlyExpectedErrorFields:pass,principalVerified:id!==null,customTokenCountsAsPasswordProof:false,
        hostingHtmlFallback:response.status===200&&/text\/html/i.test(response.headers.get('content-type')||'')});
      need(pass,response.status===200&&/text\/html/i.test(response.headers.get('content-type')||'')?'ENVIRONMENT_FAILURE:A08_API_PROBE_ROUTE_NOT_REWRITTEN':'AUTH_FAILURE:A08_API_ACCESS_NOT_EXACTLY_DENIED');
    });
    if([A08_GT_CURRENT_PROVIDER_MODE,'PASSWORD_ONLY','PASSWORD_API_ONLY'].includes(result.scope.executionMode)){
      result.storageDiscovery={executed:false,reason:'RUN2759_EMPTY_DISCOVERY_PRESERVED_NOT_REPEATED',priorRunId:45362203267,priorArtifactId:14904544042,priorArtifactSha256:'3fcedce58418ad9132a87be9fc0514ef41b87194cbff3c448662cc2e244cf1ac',priorDocumentsObserved:0,historicalDiscoveryOnly:true,notCurrentStorageDenial:true};
      result.storageProof={pass:false,skipped:true,reason:'ISOLATED_EXISTING_OBJECT_FIXTURE_REQUIRED_BEFORE_ACL_PROOF'};
    }else await capture('storage-existing-object',async()=>{
      const snap=await project.collection('visitEvidence').limit(30).get();
      result.storageDiscovery={boundedMetadataQuery:30,documentsObserved:snap.size,objectsCreated:0,object404CountsAsDenial:false};
      let chosen=null;
      for(const doc of snap.docs){
        const tuple=evidenceTuple(doc.data(),doc.id);if(!tuple)continue;
        let meta;try{[meta]=await bucket.file(tuple.storagePath).getMetadata();}catch(error){if(Number(error?.code)===404)continue;throw error;}
        const custom=meta.metadata||{};
        if(str(meta.bucket)!==BUCKET||Number(meta.size)!==tuple.size||str(meta.contentType)!==tuple.mimeType||
          str(custom.tenantId)!==TENANT||str(custom.projectId)!==PROGRAM||str(custom.periodId)!==tuple.periodId||
          str(custom.visitId)!==tuple.visitId||str(custom.evidenceId)!==tuple.evidenceId||
          str(custom.shopperId)!==tuple.shopperId||str(custom.kind)!=='geo_checkin'||str(custom.checksum)!==tuple.checksum)continue;
        const visit=await project.collection('visits').doc(tuple.visitId).get();
        if(!visit.exists||str(visit.data()?.periodId)!==tuple.periodId)continue;
        try{await memberFor(tuple.shopperId);}catch(error){
          if(/A08_EXACT_ACTIVE_PRINCIPAL_NOT_UNIQUE|A08_EXACT_SHOPPER_PROFILE_OR_QUERY_UNAVAILABLE/.test(str(error.message)))continue;
          throw error;
        }
        const cross=await tenant.collection('shopperIdentityCrosswalk').doc(tuple.shopperId).get();
        const ownerCanonical=str(cross.exists?(cross.data()?.canonicalShopperId||cross.data()?.shopperId):tuple.shopperId)||tuple.shopperId;
        let otherId=null;
        for(const id of EXCEPTION_IDS){if(id===tuple.shopperId)continue;
          const other=await tenant.collection('shopperIdentityCrosswalk').doc(id).get();
          const canonical=str(other.exists?(other.data()?.canonicalShopperId||other.data()?.shopperId):id)||id;
          if(canonical===ownerCanonical)continue;
          await memberFor(id);otherId=id;break;
        }
        if(!otherId)continue;
        chosen={tuple,meta,doc,otherId};break;
      }
      need(chosen,'PROVIDER_FAILURE:A08_EXISTING_PRIVATE_STORAGE_OBJECT_UNAVAILABLE');
      const {tuple,meta,doc,otherId}=chosen;
      const url='https://firebasestorage.googleapis.com/v0/b/'+encodeURIComponent(BUCKET)+'/o/'+encodeURIComponent(tuple.storagePath)+'?alt=media';
      const ownerToken=await tokenFor(tuple.shopperId),otherToken=await tokenFor(otherId);
      const own=await fetch(url,{method:'GET',redirect:'error',headers:{Authorization:'Firebase '+ownerToken,'cache-control':'no-store'},signal:AbortSignal.timeout(45000)});
      if(!own.ok){await own.body?.cancel().catch(()=>{});throw Error('AUTH_FAILURE:A08_STORAGE_OWNER_READ_NOT_ALLOWED');}
      const bytes=await boundedBytes(own,15*1024*1024);
      const checksumMatches=bytes.length===tuple.size&&sha(bytes)===tuple.checksum;
      bytes.fill(0);
      need(checksumMatches,'PERSISTENCE_FAILURE:A08_STORAGE_OWNER_BYTES_MISMATCH');
      const probes=[];
      for(const [label,token] of [['other-shopper',otherToken],['anonymous',null]]){
        const response=await fetch(url,{method:'GET',redirect:'error',headers:token?{Authorization:'Firebase '+token,'cache-control':'no-store'}:{'cache-control':'no-store'},signal:AbortSignal.timeout(45000)});
        let body=null;
        if([401,403].includes(response.status))body=await safeJson(response);
        else await response.body?.cancel().catch(()=>{});
        const pass=storageDenial(response.status,body,token===null);
        probes.push({caseId:label,httpStatus:response.status,pass,errorOnlyResponse:pass});
      }
      const [[afterMeta],afterDoc]=await Promise.all([bucket.file(tuple.storagePath).getMetadata(),doc.ref.get()]);
      const objectStable=str(meta.generation)!==''&&str(meta.generation)===str(afterMeta.generation)&&
        str(meta.metageneration)===str(afterMeta.metageneration)&&Number(afterMeta.size)===tuple.size&&
        afterDoc.exists&&doc.updateTime.isEqual(afterDoc.updateTime);
      result.storageProof={objectFingerprint:fp(tuple.storagePath),ownerFingerprint:fp(tuple.shopperId),
        otherShopperFingerprint:fp(otherId),existingObjectProven:true,metadataOwnerMatched:true,ownerReadStatus:own.status,
        ownerBytesChecksumMatches:true,objectStable,probes,pass:objectStable&&probes.every(x=>x.pass),
        providerWrites:0,object404CountsAsDenial:false,privateBytesExported:false,privatePathsExported:false};
      need(result.storageProof.pass,'AUTH_FAILURE:A08_STORAGE_DENIAL_OR_STABILITY_UNPROVEN');
    });
    result.decision='PENDING_A08_FINAL_SAME_ARTIFACT_READBACK';
  }catch(error){result.errors.push({stage:'preflight-or-setup',code:safeFailure(error)});}
  finally{save(result);console.log(JSON.stringify({decision:result.decision,passwordsProven:result.passwordProofs.filter(x=>x.pass).length,
    apiDenialsProven:result.apiProofs.filter(x=>x.pass).length,storageProven:result.storageProof?.pass===true,
    failureCodes:result.errors.map(x=>x.code),fullA08Certified:false,newDomainMatches:0}));}
  // The existing job always runs the after seal and --finalize, retaining partial proof.
  if(result.errors.length)process.exitCode=1;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await run();
