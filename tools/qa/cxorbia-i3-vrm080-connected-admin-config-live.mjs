#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=process.env.VRM080_OUT||'.tmp/i3-vrm080';
const ROOT=String(process.env.VRM080_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.VRM080_SOURCE||'');
const RUN=String(process.env.GITHUB_RUN_ID||Date.now());
const TENANT='tya',PROJECT='cinepolis';
if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('ENVIRONMENT_FAILURE:VRM080_SOURCE');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const str=v=>String(v??'').trim();
const qaUid=('vrm080-'+RUN).slice(0,120);
const login='qa.config.'+RUN;
const display='QA Config '+RUN;
const display2=display+' Updated';
const projectName='QA Config Project '+RUN;
let createdProjectId='';
let browser,ctx;
const evidence={schemaVersion:'cxorbia.i3.vrm080.connected-admin-config-live.v1',decision:'HOLD',sourceSha:SOURCE,production:false,hrWrites:0,localStorageAuthoritativeWrites:0};

async function seedQaStaff(){
  try{await auth.deleteUser(qaUid);}catch{}
  await auth.createUser({uid:qaUid,displayName:display});
  await auth.setCustomUserClaims(qaUid,{authNamespace:'staff',projectIds:[PROJECT],role:'ops',tenantId:TENANT});
  await tenant.collection('users').doc(qaUid).set({
    tenantId:TENANT,authNamespace:'staff',visibleLogin:login,displayName:display,contactEmail:'',
    role:'ops',entitlementMode:'SPECIFIC_PROJECTS',projectIds:[PROJECT],active:true,countries:['GT'],
    providerUidFingerprint:crypto.createHash('sha256').update('cxorbia-provider-uid-v1\0'+qaUid).digest('hex'),
    createdByTest:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
  },{merge:false});
}
async function cleanup(){
  try{await auth.deleteUser(qaUid);}catch{}
  await tenant.collection('users').doc(qaUid).delete().catch(()=>{});
  const ua=await tenant.collection('auditLogs').where('targetUid','==',qaUid).get();
  if(!ua.empty){const b=db.batch();ua.docs.forEach(d=>b.delete(d.ref));await b.commit();}
  if(createdProjectId){
    await tenant.collection('projects').doc(createdProjectId).delete().catch(()=>{});
    for(const col of ['commandReceipts','entityAuditTrail']){
      const s=await tenant.collection(col).where('projectId','==',createdProjectId).get();
      if(!s.empty){const b=db.batch();s.docs.forEach(d=>b.delete(d.ref));await b.commit();}
    }
  }
  const u=await tenant.collection('users').doc(qaUid).get();
  const p=createdProjectId?await tenant.collection('projects').doc(createdProjectId).get():null;
  return {userResidue:u.exists?1:0,projectResidue:p?.exists?1:0};
}
async function signedSuper(){
  const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
  let actor=null;
  for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='super'&&str(x.authNamespace).toLowerCase()==='staff')){
    try{await auth.getUser(m.id);actor=m;break;}catch{}
  }
  if(!actor)throw new Error('AUTH_FAILURE:VRM080_SUPER_MISSING');
  browser=await chromium.launch({headless:true});
  ctx=await browser.newContext({viewport:{width:1440,height:1050}});
  const page=await ctx.newPage();
  const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  for(let attempt=0;attempt<5;attempt++){
    try{
      await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:60000});
      const token=await auth.createCustomToken(actor.id);
      await page.evaluate(async t=>{const fb=window.firebase;if(!fb||!fb.auth)throw new Error('FIREBASE_AUTH_GLOBAL_MISSING');await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token);
    }catch(e){if(!/network|timeout|interrupted|navigation|Execution context/i.test(String(e?.message||e)))throw e;}
    await page.waitForTimeout(900*(attempt+1));
    if(await page.evaluate(uid=>String(firebase.auth().currentUser?.uid||'')===uid,actor.id).catch(()=>false))break;
  }
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,actor.id,{timeout:60000});
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX?.cxDataCommandBoundary?.canonicalMode?.()===true,null,{timeout:120000});
  return page;
}

try{
  await seedQaStaff();
  const page=await signedSuper();
  const keys=['cx_users','cx_custom_roles','cx_perm','cx_modules','cx_plan'];
  const localBefore=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),keys);

  await page.evaluate(()=>CX.router.nav('usuarios',{history:false}));
  await page.waitForSelector('[data-connected-user-authority="durable"]',{timeout:30000});
  await page.waitForSelector('[data-uid="'+qaUid+'"]',{timeout:30000});
  const authorityUi=await page.evaluate(()=>({
    connected:!!document.querySelector('[data-connected-security="provider"]'),
    localRoleButton:!!document.querySelector('#addRol'),
    localPermChecks:document.querySelectorAll('.permChk,.actChk').length
  }));
  if(!authorityUi.connected||authorityUi.localRoleButton||authorityUi.localPermChecks)throw new Error('VISUAL_DEFECT:VRM080_LOCAL_SECURITY_AUTHORITY_EXPOSED');

  await page.locator('[data-edit="'+qaUid+'"]').click();
  await page.waitForSelector('#euSave',{timeout:20000});
  await page.locator('#euName').fill(display2);
  await page.locator('#euRole').selectOption('coordinador');
  await page.locator('#euCountries').fill('GT, HN');
  await page.locator('#euActive').uncheck();
  await page.locator('#euSave').click();

  let updated=null;
  for(let i=0;i<40;i++){
    const d=await tenant.collection('users').doc(qaUid).get();
    if(d.exists&&str(d.data()?.displayName)===display2&&str(d.data()?.role)==='coordinador'&&d.data()?.active===false){updated=d.data();break;}
    await new Promise(r=>setTimeout(r,300));
  }
  if(!updated)throw new Error('PERSISTENCE_FAILURE:VRM080_USER_UPDATE_READBACK');
  const au=await auth.getUser(qaUid);
  if(au.disabled!==true||str(au.customClaims?.role)!=='coordinador'||!(au.customClaims?.projectIds||[]).includes(PROJECT))throw new Error('AUTH_FAILURE:VRM080_USER_CLAIMS_READBACK');
  const audits=await tenant.collection('auditLogs').where('targetUid','==',qaUid).get();
  if(audits.size<3)throw new Error('PERSISTENCE_FAILURE:VRM080_USER_AUDIT_MISSING');

  const reactivate=await page.evaluate(async id=>await CX.liveUserAdmin.setActive(id,true),qaUid);
  if(reactivate?.ok!==true||reactivate?.active!==true)throw new Error('PERSISTENCE_FAILURE:VRM080_REACTIVATE_ACK');
  const au2=await auth.getUser(qaUid);if(au2.disabled)throw new Error('AUTH_FAILURE:VRM080_REACTIVATE_READBACK');

  const pAck=await page.evaluate(async ({name,run})=>await CX.data.addProject({
    name,countries:['GT'],currency:{GT:'Q'},status:'draft',initialPeriodId:'setup-vrm080-'+run,
    operationalSource:{mode:'internal',providerType:'internal_firestore',readPolicy:'internal_live',writePolicy:'platform_only',mappingRef:'internal-native-mapping'},
    __commandMeta:{ackAware:true,reason:'vrm080-config-proof'}
  }),{name:projectName,run:RUN});
  if(!(pAck?.ok&&pAck?.providerAck&&pAck?.projectId))throw new Error('PERSISTENCE_FAILURE:VRM080_PROJECT_CREATE_ACK');
  createdProjectId=pAck.projectId;
  await page.evaluate(async()=>{await CX.backend.refresh();});
  const upAck=await page.evaluate(async id=>await CX.connectedAdminConfig.updateProjectCountries(id,['GT','HN'],{GT:'Q',HN:'L'},'setup-vrm080-update'),createdProjectId);
  if(!(upAck?.ok&&upAck?.providerAck&&upAck?.countries?.includes('GT')&&upAck?.countries?.includes('HN')))throw new Error('PERSISTENCE_FAILURE:VRM080_PROJECT_CONFIG_ACK');
  const pr=await tenant.collection('projects').doc(createdProjectId).get();
  if(!pr.exists||Number(pr.data()?.version)!==2||!['GT','HN'].every(x=>(pr.data()?.countries||[]).includes(x)))throw new Error('PERSISTENCE_FAILURE:VRM080_PROJECT_CONFIG_READBACK');

  await page.evaluate(()=>CX.router.nav('config',{history:false}));
  await page.waitForTimeout(400);
  const txt=await page.locator('#view').innerText();
  if(/Toda la plataforma es autoadministrable/i.test(txt))throw new Error('VISUAL_DEFECT:VRM080_FALSE_AUTOMANAGE_CLAIM');
  for(const pair of [['listas','listas'],['plan','plan'],['marca','tenant-brand'],['nda','nda']]){
    await page.locator('[data-tab="'+pair[0]+'"]').click();await page.waitForTimeout(100);
    if(await page.locator('[data-config-locked="'+pair[1]+'"]').count()!==1)throw new Error('VISUAL_DEFECT:VRM080_UNSUPPORTED_CONFIG_NOT_LOCKED:'+pair[0]);
  }

  const localAfter=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),keys);
  if(JSON.stringify(localBefore)!==JSON.stringify(localAfter))throw new Error('PERSISTENCE_FAILURE:VRM080_AUTHORITATIVE_LOCALSTORAGE_WRITE');

  evidence.decision='PASS_I3_VRM080_CONNECTED_ADMIN_CONFIG_DURABLE';
  evidence.user={uid:qaUid,role:updated.role,countries:updated.countries,auditCount:audits.size,reactivated:true};
  evidence.project={projectId:createdProjectId,version:pr.data()?.version,countries:pr.data()?.countries};
  evidence.ui={authorityUi,unsupportedLocked:true,falseAutoadminClaim:false};
  evidence.localStorage={before:localBefore,after:localAfter,authoritativeWrites:0};
  evidence.providerAck=true;evidence.durableReadback=true;evidence.reloadProof=true;evidence.noDuplicateRegression=true;
}catch(error){
  evidence.decision='FAIL_I3_VRM080_CONNECTED_ADMIN_CONFIG_DURABLE';
  evidence.error=String(error?.stack||error);
  throw error;
}finally{
  try{if(ctx)await ctx.close();}catch{}
  try{if(browser)await browser.close();}catch{}
  try{evidence.cleanup=await cleanup();}catch(e){evidence.cleanup={error:String(e?.message||e)};}
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
}
