#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_003_LIVE_OUT||'.tmp/prei4-admin-003-live');
const ROOT=String(process.env.PREI4_003_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.PREI4_003_SOURCE||'');
const TREE=String(process.env.PREI4_003_TREE||'');
const EXPECTED_HR=String(process.env.PREI4_003_HR_REVISION||'');
const TENANT='tya',PROJECT='cinepolis';
const CANONICAL='shopper_gt_bd74ace936',INVALID='shopper_gt_018ca3e794',MILTON_PAZ='shopper_gt_81de8fb0a2';
const PATRICIA=['shopper_gt_0757b1eeb4','shopper_gt_7c8b7cbdbf','shopper_gt_c342b8c62e'];
const JARY=['shopper_gt_0a363269ad','shopper_gt_f726f2eb34'];
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const fp=v=>sha(v).slice(0,16);
const write=(name,v)=>fs.writeFileSync(OUT+'/'+name,JSON.stringify(v,null,2)+'\n');
fs.mkdirSync(OUT,{recursive:true});
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{40}$/.test(TREE)||!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('ENVIRONMENT_FAILURE:PREI4_003_LIVE_ENV');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);

const profile=async id=>{const s=await tenant.collection('shoppers').doc(id).get();return s.exists?{id:s.id,...(s.data()||{})}:null;};
const cross=async id=>{const s=await tenant.collection('shopperIdentityCrosswalk').doc(id).get();return s.exists?{id:s.id,...(s.data()||{})}:null;};
const users=(await tenant.collection('users').get()).docs.map(d=>({uid:d.id,...(d.data()||{})}));
const links=(await tenant.collection('shopperIdentityLinks').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));

let admin=null,canonicalAuth=null,pageToken=undefined;
for(let page=0;page<10&&(!admin||!canonicalAuth);page++){
  const listed=await auth.listUsers(1000,pageToken);
  for(const u of listed.users){
    const c=u.customClaims||{},role=str(c.role).toLowerCase(),namespace=str(c.authNamespace).toLowerCase(),tenantId=str(c.tenantId),projects=arr(c.projectIds).map(str),sid=str(c.shopperId);
    if(!admin&&tenantId===TENANT&&namespace==='staff'&&['super','admin','ops','coordinador'].includes(role)&&(role==='super'||projects.includes(PROJECT)))admin={uid:u.uid,role};
    if(!canonicalAuth&&u.disabled!==true&&tenantId===TENANT&&namespace==='shopper'&&role==='shopper'&&sid===CANONICAL&&projects.includes(PROJECT))canonicalAuth={uid:u.uid,role,shopperId:sid};
  }
  pageToken=listed.pageToken;if(!pageToken)break;
}
if(!admin)throw new Error('AUTH_FAILURE:PREI4_003_ADMIN_MISSING');
if(!canonicalAuth)throw new Error('AUTH_FAILURE:PREI4_003_CANONICAL_SHOPPER_MISSING');

const meta=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=meta&fresh=1&prei4003='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)}).then(async r=>{if(!r.ok)throw new Error('PROVIDER_FAILURE:PREI4_003_HR_HTTP_'+r.status);return r.json();});
const revision=str(meta?.revision||meta?._runtime?.revision||meta?.sourceRevision);
if(revision!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:PREI4_003_HR_REVISION:'+revision);

const canonical=await profile(CANONICAL),invalid=await profile(INVALID),miltonPaz=await profile(MILTON_PAZ);
if(!canonical||str(canonical.nombre)!=='Milton De Paz'||str(canonical.firstName)!=='Milton'||str(canonical.lastName)!=='De Paz'||str(canonical.identityAuthority).toLowerCase()!=='tenant_adjudication'||!str(canonical.identityAuthorityRef))throw new Error('MAPPING_FAILURE:PREI4_003_CANONICAL_DURABLE:'+JSON.stringify(canonical));
if(!invalid||invalid.identityQuarantined!==true||invalid.excludedFromCanonicalReadModel!==true||str(invalid.canonicalShopperId)!==CANONICAL)throw new Error('MAPPING_FAILURE:PREI4_003_INVALID_ALIAS_STATE');
if(!miltonPaz||str(miltonPaz.id)!==MILTON_PAZ)throw new Error('MAPPING_FAILURE:PREI4_003_DISTINCT_MILTON_PAZ');

for(const id of [...PATRICIA,...JARY]){
  const p=await profile(id);if(!p)throw new Error('PERSISTENCE_FAILURE:PREI4_003_PROFILE_MISSING:'+id);
  const cw=await cross(id);if(!cw||str(cw.shopperId||cw.canonicalShopperId)!==id)throw new Error('MAPPING_FAILURE:PREI4_003_SELF_CROSSWALK:'+id);
}
for(const l of links){
  const sourceTokens=[str(l.sourceShopperId),str(l.sourceIdentity?.legacyId),...arr(l.sourceShopperIds).map(str),...arr(l.sourceIdentityAliases).map(str)].filter(Boolean);
  const canonicalId=str(l.canonicalShopperId||l.canonicalId||l.shopperId);
  for(const group of [PATRICIA,JARY]){
    if(sourceTokens.some(x=>group.includes(x))&&canonicalId&&group.includes(canonicalId)===true){
      const sources=sourceTokens.filter(x=>group.includes(x));
      if(sources.some(x=>x!==canonicalId))throw new Error('MAPPING_FAILURE:PREI4_003_UNAUTHORIZED_GROUP_MERGE:'+l.id);
    }
  }
}
const canonicalMember=users.find(x=>str(x.shopperId)===CANONICAL&&x.active===true);
const invalidMember=users.find(x=>str(x.shopperId)===INVALID);
if(!canonicalMember||str(canonicalMember.visibleLogin).toLowerCase()!=='milton.depaz')throw new Error('AUTH_FAILURE:PREI4_003_CANONICAL_MEMBERSHIP');
if(!invalidMember||invalidMember.active!==false)throw new Error('AUTH_FAILURE:PREI4_003_INVALID_MEMBERSHIP_NOT_RETIRED');

const browser=await chromium.launch({headless:true});
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';

async function signed(principal,kind){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  try{
    let ok=false;
    for(let attempt=1;attempt<=5&&!ok;attempt++){
      await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
      const token=await auth.createCustomToken(principal.uid);
      try{await page.evaluate(async t=>{const fb=window.firebase;if(!fb?.auth)throw new Error('FIREBASE_NOT_READY');await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token);}catch(e){if(!/FIREBASE_NOT_READY|firebase is not defined|auth\/network-request-failed|Execution context was destroyed|navigation|network|timeout|interrupted/i.test(String(e?.message||e)))throw e;}
      await page.waitForTimeout(700*attempt);
      ok=await page.evaluate(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,principal.uid).catch(()=>false);
    }
    if(!ok)throw new Error('AUTH_FAILURE:PREI4_003_'+kind.toUpperCase()+'_SIGNIN');
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,principal.uid,{timeout:90000});
    await page.waitForFunction(({kind,rev})=>{
      const c=window.CX?.backendAuth?.context?.()||{},role=String(c.role||'').toLowerCase(),d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
      return c.authenticated===true&&(kind==='shopper'?role==='shopper':role!=='shopper'&&role!=='cliente')&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(d.previewMeta?.sourceRevision||'')===rev;
    },{kind,rev:EXPECTED_HR},{timeout:150000});
    return {ctx,page};
  }catch(e){await ctx.close().catch(()=>{});throw e;}
}
const evidence={schemaVersion:'cxorbia.prei4.admin003.cumulative-live.v1',decision:'HOLD',sourceSha:SOURCE,sourceTree:TREE,hrRevision:EXPECTED_HR,admin:null,shopper:null,durable:{canonicalFp:fp(CANONICAL),invalidFp:fp(INVALID),miltonPazFp:fp(MILTON_PAZ)},production:false,hrWrites:0};
try{
  const a=await signed(admin,'admin');
  await a.page.evaluate(()=>CX.router.nav('shoppers',{history:false}));await a.page.waitForTimeout(900);
  const adminProof=await a.page.evaluate(({canonical,invalid,patricia,jary,rev})=>{
    const d=window.CX?.data||{},row=id=>document.querySelector('#shBody [data-sid="'+CSS.escape(id)+'"]'),text=el=>String(el?.innerText||'');
    const canonicalRow=row(canonical),invalidRow=row(invalid);
    const pat=patricia.map(id=>({id,found:!!row(id),review:String(row(id)?.getAttribute('data-identity-review')||''),text:text(row(id))}));
    const jr=jary.map(id=>({id,found:!!row(id),text:text(row(id))}));
    return {sourceRevision:String(d.previewMeta?.sourceRevision||''),canonicalFound:!!canonicalRow,canonicalText:text(canonicalRow),invalidFound:!!invalidRow,patricia:pat,jary:jr,reviewQueueCount:Array.isArray(d.__identityReviewQueue)?d.__identityReviewQueue.length:0};
  },{canonical:CANONICAL,invalid:INVALID,patricia:PATRICIA,jary:JARY,rev:EXPECTED_HR});
  if(adminProof.sourceRevision!==EXPECTED_HR||!adminProof.canonicalFound||!/Milton De Paz/i.test(adminProof.canonicalText)||/Mishael De Paz/i.test(adminProof.canonicalText)||adminProof.invalidFound)throw new Error('FUNCTIONAL_DEFECT:PREI4_003_ADMIN_CANONICAL:'+JSON.stringify(adminProof));
  if(adminProof.patricia.some(x=>!x.found||x.review!=='required'||!/Revisar identidad/i.test(x.text)))throw new Error('FUNCTIONAL_DEFECT:PREI4_003_PATRICIA_REVIEW:'+JSON.stringify(adminProof.patricia));
  if(adminProof.jary.some(x=>!x.found))throw new Error('FUNCTIONAL_DEFECT:PREI4_003_JARY_SEPARATE:'+JSON.stringify(adminProof.jary));
  evidence.admin=adminProof;await a.ctx.close();

  const s=await signed(canonicalAuth,'shopper');
  await s.page.evaluate(()=>CX.router.nav('miperfil',{history:false}));await s.page.waitForTimeout(700);
  const profileProof=await s.page.evaluate(({sid,rev})=>{
    const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},p=d.__sessionShopperProfile||null,body=String(document.body?.innerText||'');
    const stats=typeof d.shopperStats==='function'?d.shopperStats(sid):null;
    return {sourceRevision:String(d.previewMeta?.sourceRevision||''),contextShopperId:String(c.shopperId||''),profileId:String(p?.id||p?.shopperId||''),profileName:String(p?.nombre||p?.name||''),bodyHasMilton:/Milton De Paz/i.test(body),bodyHasMishael:/Mishael De Paz/i.test(body),stats};
  },{sid:CANONICAL,rev:EXPECTED_HR});
  if(profileProof.sourceRevision!==EXPECTED_HR||profileProof.contextShopperId!==CANONICAL||profileProof.profileId!==CANONICAL||profileProof.profileName!=='Milton De Paz'||!profileProof.bodyHasMilton||profileProof.bodyHasMishael||Number(profileProof.stats?.total||0)<1)throw new Error('FUNCTIONAL_DEFECT:PREI4_003_SHOPPER_PROFILE:'+JSON.stringify(profileProof));
  await s.page.evaluate(()=>CX.router.nav('misvisitas',{history:false}));await s.page.waitForTimeout(700);
  const historyProof=await s.page.evaluate(({sid,rev})=>{const d=window.CX?.data||{},v=typeof d.visitsForShopper==='function'?d.visitsForShopper(sid):[];return{sourceRevision:String(d.previewMeta?.sourceRevision||''),visitCount:v.length,blocked:String(document.body?.innerText||'').includes('Identidad de evaluador no verificable')};},{sid:CANONICAL,rev:EXPECTED_HR});
  if(historyProof.sourceRevision!==EXPECTED_HR||historyProof.visitCount<1||historyProof.blocked)throw new Error('FUNCTIONAL_DEFECT:PREI4_003_SHOPPER_HISTORY:'+JSON.stringify(historyProof));
  evidence.shopper={profile:profileProof,history:historyProof};await s.ctx.close();

  evidence.decision='PASS_PREI4_ADMIN_003_CUMULATIVE_LIVE';
  write('result.json',evidence);
  console.log(JSON.stringify({decision:evidence.decision,admin:{canonicalFound:evidence.admin.canonicalFound,patricia:evidence.admin.patricia.length,jary:evidence.admin.jary.length},shopper:{profileName:evidence.shopper.profile.profileName,visitCount:evidence.shopper.history.visitCount}},null,2));
}catch(error){
  evidence.decision='FAIL_PREI4_ADMIN_003_CUMULATIVE_LIVE';evidence.error=String(error?.stack||error);write('result.json',evidence);throw error;
}finally{await browser.close();}
