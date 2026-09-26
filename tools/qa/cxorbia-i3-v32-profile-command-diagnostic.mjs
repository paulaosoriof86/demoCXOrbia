import fs from 'node:fs';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const OUT=process.env.V32_OUT||'.tmp/i3-v32-profile-command-diagnostic';
const ROOT=String(process.env.V32_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc('tya');
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const str=v=>String(v??'').trim();
async function authExists(m){try{await auth.getUser(m.id);return true;}catch{return false;}}
let shopper=null;
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio'))if(await authExists(m)){shopper=m;break;}
if(!shopper)throw new Error('AUTH_FAILURE:V32_PAULA_MISSING');
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
const evidence={schemaVersion:'cxorbia.i3.v32.profile-command-diagnostic.v1',decision:'HOLD',production:false,writesAttempted:1};
try{
  let settled=false,lastAuthError='';
  for(let attempt=1;attempt<=5&&!settled;attempt++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(shopper.id);
    try{await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);}
    catch(e){
      lastAuthError=str(e?.message||e);
      if(!/Execution context was destroyed|navigation|auth\/network-request-failed|network|timeout|interrupted|unreachable|FIREBASE_SDK_NOT_READY/i.test(lastAuthError))throw e;
    }
    await page.waitForLoadState('domcontentloaded',{timeout:90000}).catch(()=>{});
    const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=> '');
    if(uid===shopper.id)settled=true; else await page.waitForTimeout(1500*attempt);
  }
  if(!settled)throw new Error('ENVIRONMENT_FAILURE:V32_AUTH_NOT_SETTLED:'+lastAuthError);
  await page.goto('about:blank');await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,shopper.id,{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(()=>CX.backendAuth?.context?.()?.authenticated===true&&String(CX.backendAuth.context()?.role||'').toLowerCase()==='shopper',null,{timeout:120000});
  await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:120000});

  const diagnostic=await page.evaluate(async()=>{
    const authCtx=CX.backendAuth.context()||{},d=CX.data||{};
    const sessionProfile=d.__sessionShopperProfile||null;
    const authShopperId=String(authCtx.shopperId||'');
    const profileId=String(sessionProfile?.id||sessionProfile?.shopperId||'');
    const identityMap=Object.assign({},d.__identityMap||{});
    const canonicalFromMap=String(identityMap[authShopperId]||authShopperId);
    const chosenTarget=profileId||canonicalFromMap||authShopperId;
    const adapterStatus=CX.commandAdapter?.status?.()||null;
    const current=typeof d.getShopper==='function'?d.getShopper(chosenTarget):null;
    const patch={depto:String((sessionProfile||current||{}).depto||''),__commandMeta:{ackAware:true,reason:'v32-profile-command-diagnostic-noop'}};
    let result=null,thrown=null;
    try{result=await d.updateShopper(chosenTarget,patch);}
    catch(e){thrown={name:String(e?.name||''),message:String(e?.message||e),code:String(e?.result?.code||e?.code||''),result:e?.result||null};}
    return {
      authContext:{shopperId:authShopperId,role:String(authCtx.role||''),authNamespace:String(authCtx.authNamespace||''),projectIds:Array.isArray(authCtx.projectIds)?authCtx.projectIds:[]},
      sessionProfile:{id:profileId,shopperId:String(sessionProfile?.shopperId||''),nombre:String(sessionProfile?.nombre||'')},
      identityMap,canonicalFromMap,chosenTarget,
      adapterStatus,
      currentShopper:{id:String(current?.id||current?.shopperId||''),sourceType:String(current?.sourceType||''),version:current?.version??null,updatedAt:String(current?.updatedAt||'')},
      result,thrown
    };
  });
  evidence.diagnostic=diagnostic;
  evidence.decision='PASS_DIAGNOSTIC_CAPTURED';
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/profile-command-diagnostic.json',JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence,null,2));
}catch(error){
  evidence.decision='FAIL_DIAGNOSTIC_HARNESS';evidence.error=String(error?.stack||error);
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/profile-command-diagnostic.json',JSON.stringify(evidence,null,2)+'\n');
  throw error;
}finally{await ctx.close().catch(()=>{});await browser.close().catch(()=>{});}
