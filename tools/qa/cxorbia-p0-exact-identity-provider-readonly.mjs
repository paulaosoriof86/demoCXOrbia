#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import admin from 'firebase-admin';

const root=process.cwd();
const requestPath=process.argv[2]||'backend/config/corte6-human-login-shopper-identity-audit.json';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS||'';
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const outPath=process.env.CXORBIA_P0_PROVIDER_AUDIT_OUTPUT||'.tmp/c6-human-login-shopper-identity-audit/p0-provider-universe.source-safe.json';
const tenantId='tya';
const projectId='cinepolis';
const expectedProject='cxorbia-backend-dev';
const contractPath='app/adapters/cxorbia-exact-identity-contract-v1.js';
const composerPath='app/adapters/tya-cumulative-read-model-v2.js';
const str=v=>String(v==null?'':v).trim();
const list=v=>Array.isArray(v)?v.map(str).filter(Boolean):(typeof v==='string'?v.split(',').map(str).filter(Boolean):[]);
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex').slice(0,16);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const docData=d=>({id:d.id,...(d.data()||{})});

function fail(code,detail=''){
  const error=new Error(detail?`${code}:${detail}`:code);
  error.code=code;
  throw error;
}
function safeClaims(claims={}){
  const role=str(claims.role).toLowerCase();
  const ns=str(claims.authNamespace||(role==='shopper'?'shopper':'staff')).toLowerCase();
  const tenantOk=claims.tenantId===tenantId||list(claims.tenants).includes(tenantId);
  const projectOk=claims.projectId===projectId||list(claims.projectIds).includes(projectId);
  return {role,ns,tenantOk,projectOk,shopperId:str(claims.shopperId)};
}
async function allAuthUsers(auth){
  const rows=[];let token;
  do{const page=await auth.listUsers(1000,token);rows.push(...page.users);token=page.pageToken;}while(token);
  return rows;
}
async function allDocs(ref){const snap=await ref.get();return snap.docs.map(docData);}
async function liveHr(){
  const url=remoteRoot+'/api/tya/cinepolis/hr-live?view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&format=json&fresh=1&ts='+Date.now();
  const response=await fetch(url,{headers:{'cache-control':'no-cache, no-store','pragma':'no-cache'}});
  if(!response.ok)fail('HR_LIVE_HTTP_'+response.status);
  const payload=await response.json();
  const snapshot=payload?.snapshot||payload?.data||payload;
  const periods=Array.isArray(snapshot?.periods)?snapshot.periods:[];
  const visits=Array.isArray(snapshot?.visits)?snapshot.visits:[];
  const shoppers=Array.isArray(snapshot?.shoppers)?snapshot.shoppers:[];
  if(!periods.length||!visits.length||!shoppers.length)fail('HR_LIVE_REQUIRED_ARRAYS_EMPTY');
  const visitKeys=visits.map(v=>str(v.hrRowId)||(str(v.sourceTab)&&str(v.sourceRow)?`${str(v.sourceTab)}::${str(v.sourceRow)}`:str(v.visitId||v.id))).filter(Boolean);
  if(visitKeys.length!==visits.length||new Set(visitKeys).size!==visitKeys.length)fail('HR_LIVE_VISIT_KEY_INVARIANT');
  return {snapshot,periods,visits,shoppers,posts:Array.isArray(snapshot.posts)?snapshot.posts:(Array.isArray(snapshot._posts)?snapshot._posts:[]),runtime:payload?._runtime||snapshot?._runtime||{}};
}
function loadRuntime(){
  const sandbox={console:{log(){},warn(){},error(){}},setTimeout,clearTimeout};
  sandbox.window=sandbox;sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(contractPath,'utf8'),sandbox,{filename:contractPath,timeout:3000});
  vm.runInContext(fs.readFileSync(composerPath,'utf8'),sandbox,{filename:composerPath,timeout:3000});
  const contract=sandbox.CX_EXACT_IDENTITY_CONTRACT;
  const composer=sandbox.CX_TYA_CUMULATIVE_READ_MODEL;
  if(!contract||contract.version!=='cxorbia-exact-identity-contract-v1'||typeof contract.buildCanonicalProfileIndex!=='function')fail('IDENTITY_CONTRACT_NOT_LOADED');
  if(!composer||typeof composer.compose!=='function')fail('COMPOSER_NOT_LOADED');
  return {contract,composer};
}
function ownedBy(contract,row,claim){
  if(!row||!claim)return false;
  if([row.shopperId,row.profileId,row.shopperDocId].map(str).includes(claim))return true;
  return contract.collectExactValues(row).includes(claim);
}
function relevantReview(review,claim){
  return (Array.isArray(review)?review:[]).some(item=>{
    if(!item||typeof item!=='object')return false;
    return str(item.liveShopperId)===claim||str(item.profileId)===claim||str(item.shopperId)===claim||
      (Array.isArray(item.candidates)&&item.candidates.map(str).includes(claim))||
      (Array.isArray(item.shopperIds)&&item.shopperIds.map(str).includes(claim));
  });
}

async function main(){
  const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
  if(request.mode!=='p0_exact_identity_provider_readonly_and_real_e2e')fail('REQUEST_MODE_INVALID');
  if(request.enabled!==true||request.consumed!==false||Number(request.allowedExecutions)!==1)fail('REQUEST_NOT_ONE_SHOT_ENABLED');
  if(request.providerReads!==true||request.providerWrites!==false)fail('REQUEST_NOT_READONLY');
  if(request.canonicalIdentityContract!==contractPath)fail('REQUEST_CONTRACT_MISMATCH');
  if(!credentialPath||!fs.existsSync(credentialPath))fail('SERVICE_ACCOUNT_FILE_MISSING');
  const serviceAccount=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
  if(serviceAccount.project_id!==expectedProject||!serviceAccount.private_key)fail('SERVICE_ACCOUNT_TARGET_MISMATCH');
  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(serviceAccount),projectId:expectedProject});
  const auth=admin.auth();const db=admin.firestore();
  const {contract,composer}=loadRuntime();
  const [users,profiles,protectedVisits,postulations,applications,liquidations,certifications,hr]=await Promise.all([
    allAuthUsers(auth),
    allDocs(db.collection('tenants').doc(tenantId).collection('shoppers')),
    allDocs(db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('visits')),
    allDocs(db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('postulations')),
    allDocs(db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('applications')),
    allDocs(db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('liquidations')),
    allDocs(db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('certifications')),
    liveHr()
  ]);
  const profileById=new Map(profiles.map(p=>[str(p.id||p.shopperId),p]).filter(([id])=>id));
  const effective=[];
  for(const user of users){
    const c=safeClaims(user.customClaims||{});
    if(c.role==='shopper'&&c.ns==='shopper'&&c.tenantOk&&c.projectOk&&c.shopperId)effective.push({uid:user.uid,claim:c.shopperId});
  }
  if(!effective.length)fail('NO_EFFECTIVE_SHOPPER_PRINCIPALS');
  const outcome={unique:0,missingProfile:0,unmapped:0,ambiguousOrReview:0,withHistory:0,withoutHistory:0};
  const issues=[];
  for(const principal of effective){
    const profile=profileById.get(principal.claim);
    if(!profile){outcome.missingProfile++;issues.push({fingerprint:hash(principal.uid),code:'CLAIM_PROFILE_MISSING'});continue;}
    const ownVisits=protectedVisits.filter(row=>ownedBy(contract,row,principal.claim));
    const ownPosts=[...postulations,...applications].filter(row=>ownedBy(contract,row,principal.claim));
    const ownLiquidations=liquidations.filter(row=>ownedBy(contract,row,principal.claim));
    const ownCertifications=certifications.filter(row=>ownedBy(contract,row,principal.claim));
    const result=composer.compose({
      hr:{projects:clone(hr.snapshot.projects||hr.periods),visits:clone(hr.visits),shoppers:clone(hr.shoppers),posts:clone(hr.posts),currentProjectId:projectId,currentPeriodId:str(hr.snapshot.currentPeriodId||hr.snapshot.currentProjectId||''),sourceRevision:str(hr.runtime.revision||hr.snapshot.sourceRevision||'')},
      protectedPayload:{visits:clone(ownVisits),shoppers:[clone(profile)],posts:clone(ownPosts),certifications:clone(ownCertifications),liquidations:clone(ownLiquidations)}
    });
    const ownRows=(Array.isArray(result.shoppers)?result.shoppers:[]).filter(row=>str(row.id||row.shopperId)===principal.claim);
    const ownHistory=(Array.isArray(result.visits)?result.visits:[]).filter(row=>str(row.shopperId)===principal.claim).length;
    const inReview=relevantReview(result.identityReviewQueue,principal.claim);
    if(ownRows.length===1&&!inReview){
      outcome.unique++;
      if(ownHistory>0)outcome.withHistory++;else outcome.withoutHistory++;
    }else if(inReview||ownRows.length>1){
      outcome.ambiguousOrReview++;issues.push({fingerprint:hash(principal.uid),code:'AMBIGUOUS_OR_REVIEW'});
    }else{
      outcome.unmapped++;issues.push({fingerprint:hash(principal.uid),code:'NO_EXACT_CANONICAL_ROW'});
    }
  }
  const pass=outcome.unique===effective.length&&outcome.missingProfile===0&&outcome.unmapped===0&&outcome.ambiguousOrReview===0;
  const report={
    schemaVersion:'cxorbia.p0.exact-identity-provider-readonly.result.v1',
    generatedAt:new Date().toISOString(),
    decision:pass?'PASS_P0_EXACT_IDENTITY_PROVIDER_UNIVERSE':'HOLD_P0_EXACT_IDENTITY_PROVIDER_UNIVERSE',
    contractVersion:contract.version,technicalKeyCount:contract.technicalKeys.length,
    universe:{authUsersReviewed:users.length,effectiveShopperPrincipals:effective.length,firestoreProfiles:profiles.length,protectedVisits:protectedVisits.length,postulations:postulations.length,applications:applications.length,liquidations:liquidations.length,certifications:certifications.length,hrPeriods:hr.periods.length,hrVisits:hr.visits.length,hrShoppers:hr.shoppers.length},
    mapping:outcome,
    issueCount:issues.length,
    issues:issues.slice(0,50),
    piiExported:false,secretsExported:false,
    safety:{providerReads:true,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,passwordChanges:0,passwordResets:0,deploys:0,merge:false,production:false}
  };
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n','utf8');
  console.log(JSON.stringify(report,null,2));
  if(!pass)process.exitCode=2;
}

main().catch(error=>{
  const report={schemaVersion:'cxorbia.p0.exact-identity-provider-readonly.result.v1',generatedAt:new Date().toISOString(),decision:'FAIL_P0_EXACT_IDENTITY_PROVIDER_UNIVERSE_EXECUTION',errorCode:str(error?.code||error?.message||'UNKNOWN').replace(/[^A-Za-z0-9_.:-]+/g,'_').slice(0,180),piiExported:false,secretsExported:false,safety:{providerReads:true,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,passwordChanges:0,passwordResets:0,deploys:0,merge:false,production:false}};
  fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n','utf8');console.log(JSON.stringify(report,null,2));process.exitCode=3;
});
