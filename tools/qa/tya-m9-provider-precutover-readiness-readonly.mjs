#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { GoogleAuth } from 'google-auth-library';

const ACTION='M9_PROVIDER_PRECUTOVER_READINESS_READONLY';
const contractPath=process.env.CXORBIA_M9_CONTRACT||'backend/contracts/m9-provider-precutover-readiness-v1.json';
const promotionPath=process.env.CXORBIA_PRODUCTION_PROMOTION_CONTRACT||'backend/config/cxorbia-production-promotion-contract.json';
const outPath=process.env.CXORBIA_M9_OUTPUT||'.tmp/m9-provider-precutover/report.json';
const action=String(process.env.CXORBIA_M9_ACTION||'');
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=v=>crypto.createHash('sha256').update(String(v||''),'utf8').digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const persist=v=>{fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(v,null,2)+'\n','utf8');};
const liveReleaseName=(site,name)=>new RegExp(`^sites/${site.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/releases/[^/]+$`).test(String(name||''));
const sanitizeUser=u=>u?.email?{emailSha256:sha(String(u.email).toLowerCase())}:null;

const safety={authenticatedProviderGets:0,publicCapabilityGets:0,providerWrites:0,hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,productionMutation:false,credentialsExposed:false,tokensExposed:false};
let report={schemaVersion:'cxorbia.m9.provider-precutover-readiness.failure.v1',generatedAt:new Date().toISOString(),decision:'FAIL_M9_PROVIDER_PRECUTOVER_READINESS_READONLY',action,safety};

try{
  ensure(action===ACTION,'M9_ACTION_NOT_EXACT');
  ensure(fs.existsSync(contractPath),'M9_CONTRACT_MISSING');
  ensure(fs.existsSync(promotionPath),'PRODUCTION_PROMOTION_CONTRACT_MISSING');
  const c=read(contractPath),p=read(promotionPath);
  ensure(c.schemaVersion==='cxorbia.m9.provider-precutover-readiness.v1'&&c.milestone==='M9'&&Number(c.points)===3,'M9_CONTRACT_INVALID');
  ensure(p.schemaVersion==='cxorbia.production-promotion-contract.v1'&&p.authorized===true&&p.strategy==='PROMOTE_EXISTING_CLEAN_PROJECT','PRODUCTION_PROMOTION_STRATEGY_INVALID');
  ensure(p.productionProjectId===c.production.firebaseProjectId&&p.productionHostingSite===c.production.hostingSite&&p.productionHostingTarget===c.production.hostingTarget,'M9_PRODUCTION_TARGET_MISMATCH');
  ensure(p.writesAuthorizedByThisContract===false&&p.deployAuthorizedByThisContract===false&&p.productionCutoverAuthorizedByThisContract===false,'M9_BASE_CONTRACT_UNSAFE');
  ensure(c.safety?.hostingDeploys===0&&c.safety?.cloudRunDeploys===0&&c.safety?.productionMutation===false,'M9_SAFETY_CONTRACT_INVALID');

  const m8=read(c.m8Evidence.path);
  ensure(m8.decision===c.m8Evidence.decision,'M8_EVIDENCE_DECISION_INVALID');
  ensure(m8.execution?.targetHeadSha===c.m8Evidence.testedTargetHeadSha,'M8_TESTED_HEAD_MISMATCH');
  ensure(m8.sourceLock?.buildId===c.m8Evidence.buildId&&m8.sourceLock?.aggregateSha256===c.m8Evidence.aggregateSha256,'M8_BUILD_LOCK_MISMATCH');
  const head=git('rev-parse','HEAD');
  const changedAfterM8=git('diff','--name-only',`${c.m8Evidence.testedTargetHeadSha}..HEAD`,'--','app').split(/\r?\n/).filter(Boolean);
  const runtimeChanges=changedAfterM8.filter(x=>!x.startsWith('app/docs/'));
  ensure(runtimeChanges.length===0,'M9_RUNTIME_APP_DRIFT_AFTER_M8:'+runtimeChanges.join(','));

  const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS||'';
  ensure(credentialPath&&fs.existsSync(credentialPath),'M9_GOOGLE_CREDENTIAL_MISSING');
  const credential=read(credentialPath);
  ensure(credential.type==='service_account'&&credential.project_id===c.production.firebaseProjectId,'M9_GOOGLE_CREDENTIAL_PROJECT_INVALID');
  const auth=new GoogleAuth({keyFile:credentialPath,scopes:['https://www.googleapis.com/auth/firebase.hosting']});
  const client=await auth.getClient();
  const site=c.production.hostingSite;
  const base='https://firebasehosting.googleapis.com/v1beta1';

  const listResp=await client.request({url:`${base}/sites/${encodeURIComponent(site)}/releases?pageSize=100`,method:'GET'});
  safety.authenticatedProviderGets++;
  const releases=Array.isArray(listResp.data?.releases)?listResp.data.releases:[];
  const live=releases.filter(r=>liveReleaseName(site,r?.name)&&r?.releaseTime).sort((a,b)=>Date.parse(b.releaseTime)-Date.parse(a.releaseTime));
  ensure(live.length>0,'M9_NO_LIVE_HOSTING_RELEASE_FOUND');
  const current=live[0];
  const versionName=String(current?.version?.name||'');
  ensure(new RegExp(`^sites/${site.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/versions/[^/]+$`).test(versionName),'M9_CURRENT_RELEASE_VERSION_INVALID');

  const versionResp=await client.request({url:`https://firebasehosting.googleapis.com/v1beta1/${versionName}`,method:'GET'});
  safety.authenticatedProviderGets++;
  const version=versionResp.data||{};
  ensure(version.name===versionName&&version.status==='FINALIZED','M9_PRECUTOVER_VERSION_NOT_FINALIZED');

  const discovery=await fetch('https://firebasehosting.googleapis.com/$discovery/rest?version=v1beta1');
  safety.publicCapabilityGets++;
  ensure(discovery.ok,'M9_FIREBASE_DISCOVERY_READ_FAILED');
  const disc=await discovery.json();
  const create=disc?.resources?.sites?.resources?.releases?.methods?.create;
  ensure(create?.httpMethod==='POST'&&typeof create?.path==='string'&&create.path.includes('releases')&&create?.parameters?.versionName,'M9_PROVIDER_ROLLBACK_RELEASE_CREATE_CAPABILITY_NOT_FOUND');

  const captured={
    site,
    releaseName:current.name,
    releaseId:String(current.name).split('/').pop(),
    releaseTime:current.releaseTime,
    releaseType:current.type||null,
    releaseMessageSha256:current.message?sha(current.message):null,
    releaseUser:sanitizeUser(current.releaseUser),
    versionName,
    versionId:versionName.split('/').pop(),
    versionStatus:version.status,
    versionCreateTime:version.createTime||null,
    versionFinalizeTime:version.finalizeTime||null,
    versionFileCount:String(version.fileCount||''),
    versionBytes:String(version.versionBytes||''),
    versionLabels:version.labels||{}
  };

  const rollback={
    status:'READY_CAPTURED_FINALIZED_VERSION_PROVIDER_METHOD_VERIFIED',
    provider:'Firebase Hosting REST v1beta1',
    mechanism:'create a new live-site release referring to the captured same-site finalized version',
    method:create.httpMethod,
    discoveryPathTemplate:create.path,
    versionNameParameterRequired:Boolean(create.parameters.versionName?.required),
    capturedRollbackVersionName:versionName,
    capturedPreCutoverReleaseName:current.name,
    executionAuthorized:false,
    executed:false,
    guessedCommandUsed:false
  };

  report={
    schemaVersion:'cxorbia.m9.provider-precutover-readiness.v1',
    generatedAt:new Date().toISOString(),
    decision:'PASS_M9_PROVIDER_PRECUTOVER_READINESS_READONLY',
    action:ACTION,
    repository:c.repository,
    branch:c.branch,
    pullRequest:c.pullRequest,
    headSha:head,
    promotionStrategy:c.promotionStrategy,
    productionTarget:{firebaseProjectId:c.production.firebaseProjectId,hostingTarget:c.production.hostingTarget,hostingSite:site,cloudRunService:c.production.cloudRunService,cloudRunRegion:c.production.cloudRunRegion},
    sourceBinding:{m8Decision:m8.decision,m8TargetHeadSha:c.m8Evidence.testedTargetHeadSha,buildId:c.m8Evidence.buildId,aggregateSha256:c.m8Evidence.aggregateSha256,runtimeChangesAfterM8:runtimeChanges,documentationOnlyAppDrift:changedAfterM8.filter(x=>x.startsWith('app/docs/'))},
    preCutoverRelease:captured,
    rollbackReadiness:rollback,
    phaseA:{entryPercent:96,m9PointsCertifiedNow:0,certifiedPercent:96,remainingPercent:4,reason:'M9 remains open until the explicitly gated production promotion passes'},
    next:'M9_EXPLICIT_CUTOVER_ONE_PRODUCTION_PROMOTION_REQUIRES_NEW_EXPLICIT_GATE',
    safety
  };
  persist(report);
  console.log(JSON.stringify(report));
}catch(error){
  report={...report,generatedAt:new Date().toISOString(),error:String(error?.stack||error?.message||error).slice(0,4000),safety};
  persist(report);
  console.error(JSON.stringify(report));
  process.exitCode=1;
}
