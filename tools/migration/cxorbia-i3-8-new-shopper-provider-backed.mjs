#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const argv=process.argv.slice(2);
const arg=(name,fallback=null)=>{const i=argv.indexOf(name);return i>=0?argv[i+1]:fallback;};
const requestPath=path.resolve(arg('--request',path.join(repo,'backend/requests/i3-8-new-shopper-provider-backed.json')));
const outPath=path.resolve(arg('--out',path.join(repo,'.tmp/i3-8/result.json')));
const credentialPath=path.resolve(arg('--credential-out',path.join(repo,'.tmp/i3-8/runtime-credential.json')));
const stable=value=>JSON.stringify(value,null,2)+'\n';
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const str=v=>String(v==null?'':v).trim();
const sha256=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const head=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
const gitOk=args=>spawnSync('git',args,{cwd:repo,encoding:'utf8'}).status===0;
const canonicalClaims=(tenantId,projectIds,shopperId)=>({authNamespace:'shopper',projectIds:[...new Set(projectIds)].sort(),role:'shopper',shopperId,tenantId});
const claimsDigest=x=>sha256(JSON.stringify(canonicalClaims(x.tenantId,x.projectIds,x.shopperId)));
const uidFingerprint=uid=>sha256('cxorbia-provider-uid-v1\0'+uid);
const internalEmail=(tenantId,login)=>sha256(tenantId+'\0shopper\0'+String(login).trim().toLowerCase().normalize('NFC')).slice(0,48)+'@auth.cxorbia.invalid';
const identityLinkId=x=>'irl_'+sha256([x.tenantId,x.sourceSystem,x.projectScope,x.sourceIdentityKey,x.shopperId].join('\0')).slice(0,32);

const result={
  schemaVersion:'cxorbia.i3.8.new-shopper-provider-backed-result.v1',
  requestId:null,gateId:'I3.8_ADMIN_CREATE_UPDATE_ONE_NEW_SHOPPER_PROVIDER_BACKED_PERIOD_INDEPENDENT_IDENTITY',
  productTargetHeadSha:null,executorHeadSha:head(),targetProject:'cxorbia-backend-dev',
  status:'NOT_STARTED',decision:'NOT_STARTED',providerAttempted:false,providerAck:false,readbackReady:false,
  shopperId:null,identityLinkId:null,visibleLoginFingerprint:null,providerUidFingerprint:null,providerEmailFingerprint:null,
  authCreates:0,claimWrites:0,firestoreWrites:0,membershipWrites:0,profileWrites:0,shopperIdentityLinkWrites:0,
  exactReadback:{auth:false,claims:false,membership:false,profile:false,crosswalk:false,periodIndependent:false,platformCreatedAuthority:false},
  safety:{historicalShopperAccess:0,historicalShopperLogin:0,historicalShopperRecovery:0,historicalShopperReset:0,otherIdentityReads:0,otherIdentityWrites:0,hrWrites:0,financeWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,deploys:0,merge:false,production:false,passwordResets:0,passwordChanges:0},
  blockers:[],notes:[]
};
const block=code=>{if(!result.blockers.includes(code))result.blockers.push(code);};
const save=()=>{fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,stable(result),'utf8');};

let request,createdUser=null;
try{
  request=readJson(requestPath);
  result.requestId=str(request.requestId)||null;
  result.productTargetHeadSha=str(request.productTargetHeadSha)||null;
  result.shopperId=str(request.shopperId)||null;
  result.visibleLoginFingerprint=sha256('visible-login\0'+str(request.visibleLogin));
  const valid=request.schemaVersion==='cxorbia.i3.8.new-shopper-provider-backed-request.v1'
    && request.enabled===true&&request.consumed===false&&request.gateId===result.gateId
    && request.targetProject==='cxorbia-backend-dev'&&request.tenantId==='tya'
    && Array.isArray(request.projectIds)&&request.projectIds.length===1&&request.projectIds[0]==='cinepolis'
    && request.authNamespace==='shopper'&&request.authorityType==='platform_created'&&request.periodIndependent===true
    && request.sourceSystem==='platform'&&request.projectScope==='*'
    && request.maxNewShoppers===1&&request.expectedWriteBudget?.authCreates===1&&request.expectedWriteBudget?.claimWrites===1
    && request.expectedWriteBudget?.firestoreWrites===3&&request.expectedWriteBudget?.membershipWrites===1
    && request.expectedWriteBudget?.profileWrites===1&&request.expectedWriteBudget?.shopperIdentityLinkWrites===1
    && request.expectedWriteBudget?.historicalShopperAccess===0&&request.expectedWriteBudget?.hrWrites===0
    && request.expectedWriteBudget?.financeWrites===0&&request.expectedWriteBudget?.rulesWrites===0
    && request.expectedWriteBudget?.storageWrites===0&&request.expectedWriteBudget?.makeCalls===0
    && request.expectedWriteBudget?.geminiCalls===0&&request.expectedWriteBudget?.paymentWrites===0
    && request.expectedWriteBudget?.deploys===0&&/^[a-f0-9]{40}$/.test(str(request.productTargetHeadSha))
    && /^TYA_[A-Z]{2}_[A-F0-9]+$/.test(str(request.shopperId))&&str(request.visibleLogin)&&str(request.sourceIdentityKey);
  if(!valid)block('REQUEST_CONTRACT_INVALID');
  if(!gitOk(['cat-file','-e',`${request.productTargetHeadSha}^{commit}`]))block('PRODUCT_TARGET_HEAD_NOT_RESOLVABLE');
  if(!gitOk(['merge-base','--is-ancestor',request.productTargetHeadSha,result.executorHeadSha]))block('PRODUCT_TARGET_NOT_ANCESTOR');
  if(gitOk(['cat-file','-e',`${request.productTargetHeadSha}^{commit}`])){
    const diff=execFileSync('git',['diff','--name-only',`${request.productTargetHeadSha}..${result.executorHeadSha}`],{cwd:repo,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
    const allowed=new Set([
      'tools/migration/cxorbia-i3-8-new-shopper-provider-backed.mjs',
      'tools/migration/cxorbia-i3-8-request-control.mjs',
      'tools/qa/cxorbia-i3-9-new-shopper-e2e.mjs',
      'backend/requests/i3-8-new-shopper-provider-backed.json',
      '.github/workflows/cxorbia-phase-a-firestore-materialization-executor.yml'
    ]);
    const unexpected=diff.filter(f=>!allowed.has(f));
    if(unexpected.length)block('UNEXPECTED_DELTA_AFTER_PRODUCT_TARGET');
  }
  if(result.blockers.length){result.status='BLOCKED_PRE_PROVIDER';result.decision='HOLD_I3_8_PRE_PROVIDER_CONTRACT';save();process.exit(0);}

  result.providerAttempted=true;
  const app=getApps()[0]||initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
  const auth=getAuth(app),db=getFirestore(app);
  const email=internalEmail(request.tenantId,request.visibleLogin);
  result.providerEmailFingerprint=sha256('provider-email\0'+email);
  const linkId=identityLinkId(request);result.identityLinkId=linkId;
  const profileRef=db.doc(`tenants/${request.tenantId}/shoppers/${request.shopperId}`);
  const linkRef=db.doc(`tenants/${request.tenantId}/shopperIdentityLinks/${linkId}`);
  const [profileBefore,linkBefore]=await Promise.all([profileRef.get(),linkRef.get()]);
  if(profileBefore.exists)block('SHOPPER_PROFILE_ALREADY_EXISTS');
  if(linkBefore.exists)block('IDENTITY_LINK_ALREADY_EXISTS');
  try{await auth.getUserByEmail(email);block('AUTH_PRINCIPAL_ALREADY_EXISTS');}catch(e){if(e?.code!=='auth/user-not-found')throw e;}
  if(result.blockers.length){result.status='SAFE_HOLD_ZERO_WRITES';result.decision='HOLD_I3_8_TARGET_NOT_NEW';save();process.exit(0);}

  const password=crypto.randomBytes(30).toString('base64url')+'A9!';
  createdUser=await auth.createUser({email,password,disabled:false,emailVerified:false,displayName:'Shopper I3.8 DEV Validation'});
  result.authCreates=1;result.providerUidFingerprint=uidFingerprint(createdUser.uid);
  const claims=canonicalClaims(request.tenantId,request.projectIds,request.shopperId);
  await auth.setCustomUserClaims(createdUser.uid,claims);result.claimWrites=1;
  const membershipRef=db.doc(`tenants/${request.tenantId}/users/${createdUser.uid}`);
  const membership={active:true,tenantId:request.tenantId,role:'shopper',authNamespace:'shopper',shopperId:request.shopperId,projectIds:[...request.projectIds],providerUidFingerprint:uidFingerprint(createdUser.uid),claimsDigest:claimsDigest(request),source:'admin-shopper-flow',createdByGate:result.gateId,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()};
  const profile={id:request.shopperId,shopperId:request.shopperId,tenantId:request.tenantId,projectIds:[...request.projectIds],nombre:'Shopper I3.8 DEV Validation',firstName:'Shopper I3.8',lastName:'DEV Validation',estado:'Activo',active:true,sourceType:'platform',sourceRef:request.requestId,sourceIdentityKey:request.sourceIdentityKey,authNamespace:'shopper',providerUidFingerprint:uidFingerprint(createdUser.uid),testSynthetic:true,piiProtected:true,createdByGate:result.gateId,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()};
  const link={identityLinkId:linkId,tenantId:request.tenantId,canonicalShopperId:request.shopperId,sourceSystem:'platform',projectScope:'*',sourceIdentityKey:request.sourceIdentityKey,sourceAliases:[request.sourceIdentityKey,request.shopperId],status:'active',authorityType:'platform_created',authorityRef:request.requestId,periodIndependent:true,providerAck:true,providerUidFingerprint:uidFingerprint(createdUser.uid),createdByGate:result.gateId,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()};
  const batch=db.batch();batch.create(membershipRef,membership);batch.create(profileRef,profile);batch.create(linkRef,link);await batch.commit();
  result.firestoreWrites=3;result.membershipWrites=1;result.profileWrites=1;result.shopperIdentityLinkWrites=1;

  const [authRead,membershipRead,profileRead,linkRead]=await Promise.all([auth.getUser(createdUser.uid),membershipRef.get(),profileRef.get(),linkRef.get()]);
  const authClaims=authRead.customClaims||{};const m=membershipRead.data()||{},p=profileRead.data()||{},l=linkRead.data()||{};
  result.exactReadback.auth=authRead.disabled===false&&authRead.uid===createdUser.uid;
  result.exactReadback.claims=authClaims.role==='shopper'&&authClaims.tenantId===request.tenantId&&authClaims.shopperId===request.shopperId&&authClaims.authNamespace==='shopper'&&JSON.stringify([...(authClaims.projectIds||[])].sort())===JSON.stringify([...request.projectIds].sort());
  result.exactReadback.membership=membershipRead.exists&&m.active===true&&m.role==='shopper'&&m.tenantId===request.tenantId&&m.shopperId===request.shopperId&&m.authNamespace==='shopper'&&m.providerUidFingerprint===uidFingerprint(createdUser.uid)&&m.claimsDigest===claimsDigest(request);
  result.exactReadback.profile=profileRead.exists&&p.shopperId===request.shopperId&&p.tenantId===request.tenantId&&p.sourceType==='platform'&&p.testSynthetic===true;
  result.exactReadback.crosswalk=linkRead.exists&&l.canonicalShopperId===request.shopperId&&l.sourceSystem==='platform'&&l.sourceIdentityKey===request.sourceIdentityKey;
  result.exactReadback.periodIndependent=l.periodIndependent===true&&l.projectScope==='*';
  result.exactReadback.platformCreatedAuthority=l.authorityType==='platform_created'&&l.authorityRef===request.requestId&&l.providerAck===true;
  const all=Object.values(result.exactReadback).every(Boolean);
  if(!all)block('EXACT_PROVIDER_READBACK_MISMATCH');
  if(result.blockers.length){result.status='HOLD_AFTER_PROVIDER_WRITE';result.decision='HOLD_I3_8_READBACK_MISMATCH';save();process.exit(0);}

  fs.mkdirSync(path.dirname(credentialPath),{recursive:true});
  fs.writeFileSync(credentialPath,stable({visibleLogin:request.visibleLogin,password,shopperId:request.shopperId,tenantId:request.tenantId,projectIds:request.projectIds}),{encoding:'utf8',mode:0o600});
  result.providerAck=true;result.readbackReady=true;result.status='PASS_COMMITTED_READBACK';result.decision='PASS_I3_8_NEW_SHOPPER_PROVIDER_BACKED_PERIOD_INDEPENDENT_IDENTITY';
  result.notes.push('Credential exists only in runner temp for immediate I3.9 E2E and is never persisted as evidence.');save();
}catch(error){
  block('EXECUTOR_TECHNICAL_ERROR');result.status=result.authCreates?'HOLD_PARTIAL_PROVIDER_STATE':'HOLD_ZERO_WRITES';result.decision='HOLD_I3_8_TECHNICAL_ERROR';result.notes.push(str(error?.code||error?.message||error).slice(0,180));save();process.exitCode=1;
}
