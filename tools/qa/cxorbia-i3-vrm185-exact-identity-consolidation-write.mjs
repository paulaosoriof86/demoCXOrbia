#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.SOURCE_SHA||'').trim();
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const OUT=String(process.env.OUT||'.tmp/vrm185-admin-live-adjudication').trim();
const CURRENT='shopper_gt_1440137b73';
const LEGACY='s3';
const KEEPER_LOGIN='paula.osorio';
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const activeState=v=>v===true||['active','confirmed','approved','materialized'].includes(str(v).toLowerCase());
const result={
  schemaVersion:'cxorbia.i3.vrm185.admin-live-adjudication.v2',
  decision:'HOLD',
  classification:'MAPPING_FAILURE',
  sourceSha:SOURCE,
  expectedHrRevision:EXPECTED_HR,
  tenantId:TENANT,
  projectId:PROGRAM,
  canonicalShopperId:CURRENT,
  exactAliasShopperId:LEGACY,
  adminOwner:'Admin > Shoppers > Perfil',
  shopperPortalAdjudication:false,
  fuzzyOrNameMerge:false,
  providerAck:false,
  durableReadback:false,
  hrWrites:0,
  externalWrites:0,
  production:false
};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();

if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('SOURCE_FAILURE:VRM185_SOURCE_REQUIRED');
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('SOURCE_FAILURE:VRM185_EXPECTED_HR_REVISION_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const users=tenant.collection('users'),profiles=tenant.collection('shoppers'),cross=tenant.collection('shopperIdentityCrosswalk'),links=tenant.collection('shopperIdentityLinks');

async function activeMembers(shopperId){
  const snap=await users.where('shopperId','==',shopperId).get();
  return snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>x.active===true&&str(x.role)==='shopper'&&str(x.authNamespace)==='shopper');
}
function exactLinkTokens(x){
  return uniq([
    x?.sourceIdentityKey,x?.canonicalShopperId,x?.shopperId,
    ...arr(x?.exactAliases),...arr(x?.sourceAliases),...arr(x?.identityAliases)
  ]);
}
async function exactAuthorityEvidence(){
  const [cp,lp,cx,lx,allLinks]=await Promise.all([
    profiles.doc(CURRENT).get(),profiles.doc(LEGACY).get(),cross.doc(CURRENT).get(),cross.doc(LEGACY).get(),links.get()
  ]);
  if(!cp.exists||!lp.exists||!cx.exists)throw new Error('MAPPING_FAILURE:VRM185_REQUIRED_IDENTITY_RECORD_MISSING');
  const current=cp.data()||{},legacy=lp.data()||{},currentCross=cx.data()||{},legacyCross=lx.exists?(lx.data()||{}):{};
  const profileTokens=uniq([
    ...arr(legacy.exactAliases),...arr(legacy.sourceShopperIds),...arr(legacy.identityAliases),...arr(legacy.legacyLiveShopperIds)
  ]);
  const authorityLinks=allLinks.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(x=>{
    const status=str(x.status||x.state).toLowerCase();
    const authority=str(x.authorityType||x.authority?.type).toLowerCase();
    return activeState(status)&&authority==='tenant_adjudication'&&x.humanConfirmed===true&&
      str(x.canonicalShopperId||x.canonicalId||x.shopperId)===LEGACY&&exactLinkTokens(x).includes(CURRENT);
  });
  if(!profileTokens.includes(CURRENT))throw new Error('MAPPING_FAILURE:VRM185_EXACT_PROFILE_ALIAS_EVIDENCE_MISSING');
  if(authorityLinks.length!==1)throw new Error('MAPPING_FAILURE:VRM185_EXACT_HUMAN_AUTHORITY_COUNT_'+authorityLinks.length);
  if(str(currentCross.shopperId)!==CURRENT)throw new Error('MAPPING_FAILURE:VRM185_CURRENT_SELF_CROSSWALK_MISSING');
  return {
    currentProfile:current,legacyProfile:legacy,currentCross,legacyCross,
    authorityLinkId:authorityLinks[0].id,
    exactProfileAlias:true,
    humanConfirmedAuthority:true
  };
}
async function exactHrRevision(){
  const response=await fetch(ROOT+'/api/'+encodeURIComponent(TENANT)+'/'+encodeURIComponent(PROGRAM)+'/hr-live?format=meta&vrm185adjudication='+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'}});
  if(!response.ok)throw new Error('PROVIDER_FAILURE:VRM185_HR_META_HTTP_'+response.status);
  const meta=await response.json();
  const revision=str(meta.revision);
  if(revision!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:VRM185_HR_REVISION_DRIFT_'+revision);
  if(meta.ok!==true||meta.revisionStable!==true||meta.sourceSafe!==true||meta.hrWrites!==false||meta.production!==false)throw new Error('SOURCE_FAILURE:VRM185_HR_META_NOT_SOURCE_SAFE');
  return meta;
}
async function superActor(){
  const snap=await users.get();
  const candidates=snap.docs.map(d=>({uid:d.id,...(d.data()||{})}))
    .filter(x=>x.active===true&&str(x.role).toLowerCase()==='super'&&str(x.authNamespace).toLowerCase()==='staff')
    .sort((a,b)=>a.uid.localeCompare(b.uid));
  for(const row of candidates){
    try{
      const user=await auth.getUser(row.uid);
      const c=user.customClaims||{};
      if(user.disabled!==true&&str(c.tenantId)===TENANT&&str(c.role).toLowerCase()==='super'&&str(c.authNamespace).toLowerCase()==='staff')return {row,user};
    }catch{}
  }
  throw new Error('AUTH_FAILURE:VRM185_ACTIVE_SUPER_ACTOR_MISSING');
}
async function domainResidual(){
  const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
  const defs=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
  const rows=[];
  for(const [scope,name] of defs){
    const col=scope==='tenant'?tenant.collection(name):tenant.collection('projects').doc(PROGRAM).collection(name);
    const snap=await col.get();
    for(const doc of snap.docs){
      const d=doc.data()||{};
      const fields=ownerFields.filter(k=>str(d[k])===LEGACY);
      if(arr(d.shopperIds).some(x=>str(x)===LEGACY))fields.push('shopperIds');
      if(fields.length)rows.push({collection:name,id:doc.id,fields});
    }
  }
  return rows;
}
async function durableReadback(before){
  const [currentActive,legacyActive,currentProfile,legacyProfile,currentCross,legacyCross,allLinks,residual]=await Promise.all([
    activeMembers(CURRENT),activeMembers(LEGACY),profiles.doc(CURRENT).get(),profiles.doc(LEGACY).get(),cross.doc(CURRENT).get(),cross.doc(LEGACY).get(),links.get(),domainResidual()
  ]);
  if(currentActive.length!==1)throw new Error('PERSISTENCE_FAILURE:VRM185_CANONICAL_ACTIVE_MEMBERSHIP_COUNT_'+currentActive.length);
  if(legacyActive.length!==0)throw new Error('PERSISTENCE_FAILURE:VRM185_ALIAS_ACTIVE_MEMBERSHIP_REMAINS_'+legacyActive.length);
  if(before?.keeperUid&&currentActive[0].uid!==before.keeperUid)throw new Error('AUTH_FAILURE:VRM185_KEEPER_UID_CHANGED');
  const keeper=await auth.getUser(currentActive[0].uid);
  if(keeper.disabled===true||str(keeper.customClaims?.shopperId)!==CURRENT)throw new Error('AUTH_FAILURE:VRM185_KEEPER_CLAIMS_READBACK');
  if(before?.retiredUid){
    const retired=await auth.getUser(before.retiredUid);
    if(retired.disabled!==true)throw new Error('AUTH_FAILURE:VRM185_DUPLICATE_AUTH_NOT_RETIRED');
  }
  if(!currentProfile.exists||str((currentProfile.data()||{}).shopperId)!==CURRENT)throw new Error('PERSISTENCE_FAILURE:VRM185_CANONICAL_PROFILE_READBACK');
  const cp=currentProfile.data()||{},lp=legacyProfile.exists?(legacyProfile.data()||{}):{};
  if(str(cp.visibleLogin).toLowerCase()!==KEEPER_LOGIN)throw new Error('AUTH_FAILURE:VRM185_VISIBLE_LOGIN_NOT_PRESERVED');
  if(str(cp.hrSourceRevision)!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:VRM185_CANONICAL_HR_REVISION_CHANGED');
  if(str(lp.identityState)!=='superseded_exact_alias'||str(lp.supersededByShopperId)!==CURRENT)throw new Error('PERSISTENCE_FAILURE:VRM185_LEGACY_PROFILE_AUDIT_STATE');
  if(!currentCross.exists||str((currentCross.data()||{}).shopperId)!==CURRENT)throw new Error('MAPPING_FAILURE:VRM185_CANONICAL_CROSSWALK_READBACK');
  if(!legacyCross.exists||str((legacyCross.data()||{}).shopperId)!==CURRENT)throw new Error('MAPPING_FAILURE:VRM185_ALIAS_CROSSWALK_READBACK');
  const activeLinks=allLinks.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(x=>{
    const st=str(x.status||x.state).toLowerCase(),authority=str(x.authorityType||x.authority?.type).toLowerCase();
    return activeState(st)&&authority==='tenant_adjudication'&&x.humanConfirmed===true&&str(x.canonicalShopperId)===CURRENT&&exactLinkTokens(x).includes(LEGACY);
  });
  if(activeLinks.length<1)throw new Error('MAPPING_FAILURE:VRM185_CANONICAL_IDENTITY_LINK_READBACK');
  if(residual.length)throw new Error('PERSISTENCE_FAILURE:VRM185_LEGACY_OPERATIONAL_REFERENCE_RESIDUAL_'+residual.length);
  return {
    canonicalActiveMemberships:currentActive.length,
    aliasActiveMemberships:legacyActive.length,
    keeperUidFingerprint:sha('cxorbia-provider-uid-v1\0'+currentActive[0].uid),
    canonicalVisibleLogin:cp.visibleLogin,
    canonicalHrRevision:cp.hrSourceRevision,
    aliasProfileSuperseded:true,
    canonicalCrosswalk:true,
    aliasCrosswalkToCanonical:true,
    activeCanonicalIdentityLinks:activeLinks.length,
    legacyOperationalReferences:0
  };
}

let browser=null;
try{
  const hrMeta=await exactHrRevision();
  const exact=await exactAuthorityEvidence();
  const [beforeCurrent,beforeLegacy]=await Promise.all([activeMembers(CURRENT),activeMembers(LEGACY)]);
  const alreadyConverged=beforeCurrent.length===1&&beforeLegacy.length===0&&str(exact.currentCross.shopperId)===CURRENT&&str(exact.legacyCross.shopperId)===CURRENT;
  result.before={canonicalActive:beforeCurrent.length,aliasActive:beforeLegacy.length,exactProfileAlias:exact.exactProfileAlias,humanConfirmedAuthority:exact.humanConfirmedAuthority,hrRevision:str(hrMeta.revision)};
  if(alreadyConverged){
    result.readback=await durableReadback(null);
    result.decision='PASS_VRM185_ADMIN_PROVIDER_ADJUDICATION';
    result.providerAck=true;
    result.durableReadback=true;
    result.idempotentReplay=true;
    result.noWriteNeeded=true;
    save();
    console.log(JSON.stringify(result,null,2));
    process.exit(0);
  }
  if(beforeCurrent.length!==1||beforeLegacy.length!==1)throw new Error('MAPPING_FAILURE:VRM185_EXPECTED_DUAL_PRINCIPAL_TOPOLOGY_CHANGED');
  const currentProof=str(beforeCurrent[0].credentialPasswordProofVersion||exact.currentProfile.credentialPasswordProofVersion);
  const legacyProof=str(beforeLegacy[0].credentialPasswordProofVersion||exact.legacyProfile.credentialPasswordProofVersion);
  if(legacyProof!=='cxorbia-shopper-password-proof-v2'||currentProof==='cxorbia-shopper-password-proof-v2')throw new Error('AUTH_FAILURE:VRM185_UNIQUE_KEEPER_PASSWORD_PROOF_CHANGED');
  const before={keeperUid:beforeLegacy[0].uid,retiredUid:beforeCurrent[0].uid};

  const {row:actor}=await superActor();
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:60000});
  const custom=await auth.createCustomToken(actor.uid);
  await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await window.firebase.auth().signInWithCustomToken(token);},custom);
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&typeof window.CX?.data?.adjudicateShopperIdentity==='function',null,{timeout:120000});
  await page.evaluate(()=>window.CX.router.nav('shoppers',{history:false}));
  await page.waitForTimeout(500);
  const ownerProof=await page.evaluate(({current,legacy})=>({
    role:window.CX?.backendAuth?.context?.()?.role||null,
    namespace:window.CX?.backendAuth?.context?.()?.authNamespace||null,
    currentFound:!!window.CX?.data?.getShopper?.(current),
    aliasFound:!!window.CX?.data?.getShopper?.(legacy),
    adjudicationFunction:typeof window.CX?.data?.adjudicateShopperIdentity==='function',
    commandBoundary:String(window.CX?.data?.__cxCommandBoundaryVersion||'')
  }),{current:CURRENT,legacy:LEGACY});
  if(ownerProof.role!=='super'||ownerProof.namespace!=='staff'||!ownerProof.currentFound||!ownerProof.aliasFound||!ownerProof.adjudicationFunction)throw new Error('AUTH_FAILURE:VRM185_ADMIN_OWNER_UI_CONTEXT_INVALID');

  const ack=await page.evaluate(async({current,legacy})=>await window.CX.data.adjudicateShopperIdentity(current,[legacy],{ackAware:true,reason:'admin_exact_identity_human_adjudication_vrm185'}),{current:CURRENT,legacy:LEGACY});
  result.commandAck={
    ok:ack?.ok===true,status:ack?.status||null,providerAck:ack?.providerAck===true,
    commandType:ack?.commandType||null,canonicalShopperId:ack?.canonicalShopperId||ack?.entityId||null,
    identityConsolidated:ack?.identityConsolidated===true,idempotentReplay:ack?.idempotentReplay===true,
    retiredPrincipalCount:Number(ack?.retiredPrincipalCount||0),providerWrites:Number(ack?.providerWrites||0),
    hrWrites:Number(ack?.hrWrites||0),externalWrites:Number(ack?.externalWrites||0),
    idempotencyKey:ack?.idempotencyKey||null,periodId:ack?.periodId||null
  };
  if(ack?.ok!==true||ack?.providerAck!==true||ack?.commandType!=='shopper.identity.adjudicate'||ack?.identityConsolidated!==true)throw new Error('PERSISTENCE_FAILURE:VRM185_PROVIDER_ADJUDICATION_ACK_MISSING_'+str(ack?.code||ack?.status));
  if(Number(ack?.hrWrites||0)!==0||Number(ack?.externalWrites||0)!==0)throw new Error('PERSISTENCE_FAILURE:VRM185_EXTERNAL_WRITE_FORBIDDEN');

  result.readback=await durableReadback(before);
  const receiptId=sha(TENANT+'\0'+PROGRAM+'\0'+str(ack.periodId)+'\0'+str(ack.idempotencyKey)).slice(0,40);
  const receipt=await tenant.collection('commandReceipts').doc(receiptId).get();
  if(!receipt.exists)throw new Error('PERSISTENCE_FAILURE:VRM185_COMMAND_RECEIPT_MISSING');
  const rd=receipt.data()||{};
  if(rd.status!=='committed'||rd.providerAck!==true||rd.commandType!=='shopper.identity.adjudicate'||rd.identityConsolidated!==true)throw new Error('PERSISTENCE_FAILURE:VRM185_COMMAND_RECEIPT_INVALID');
  result.receipt={id:receiptId,status:rd.status,providerAck:rd.providerAck,identityConsolidated:rd.identityConsolidated,retiredPrincipalCount:Number(rd.retiredPrincipalCount||0)};
  result.adminSession={role:'super',namespace:'staff',commandBoundary:ownerProof.commandBoundary};
  result.decision='PASS_VRM185_ADMIN_PROVIDER_ADJUDICATION';
  result.providerAck=true;
  result.durableReadback=true;
  result.idempotentReplay=true;
  result.hrWrites=0;
  result.externalWrites=0;
  save();
  console.log(JSON.stringify(result,null,2));
}catch(error){
  result.decision='FAIL_VRM185_ADMIN_PROVIDER_ADJUDICATION';
  result.error=str(error?.stack||error);
  save();
  console.error(result.error);
  process.exitCode=2;
}finally{
  try{if(browser)await browser.close();}catch{}
}
