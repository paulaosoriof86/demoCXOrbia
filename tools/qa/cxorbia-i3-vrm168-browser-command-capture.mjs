#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const E=process.env;
const PROJECT=E.PROJECT||'cxorbia-backend-dev';
const ROOT=String(E.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT=E.TENANT_ID||'tya',PROJECT_ID=E.PROJECT_ID||'cinepolis';
const PERIOD_ID=E.VRM168_PERIOD_ID||'cinepolis-2026-10';
const UID=E.VRM168_UID||'cx-sh-d56787c101878e81c94fc7637f66';
const SHOPPER_ID=E.VRM168_SHOPPER_ID||'shopper_gt_1440137b73';
const VISIT_ID=E.VRM168_VISIT_ID||'OCTUBRE 26!6';
const HR_REVISION=E.VRM168_HR_REVISION||'27996d9caa7ee95be1fed935143e89c442e7abe54423392ad2b29971ac6b4732';
const OUT=E.OUT||'.tmp/vrm168-browser-command-capture';
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const tenant=db.collection('tenants').doc(TENANT),visitRef=tenant.collection('projects').doc(PROJECT_ID).collection('visits').doc(VISIT_ID);
const beforeSnap=await visitRef.get();
if(!beforeSnap.exists)throw new Error('SOURCE_FAILURE:VRM168_REAL_VISIT_MISSING');
const before=beforeSnap.data()||{};
if(String(before.estado||before.status)!=='asignada'||String(before.shopperId||'')!==SHOPPER_ID||String(before.periodId||'')!==PERIOD_ID)throw new Error('SOURCE_FAILURE:VRM168_REAL_VISIT_PRECONDITION:'+JSON.stringify({estado:before.estado,shopperId:before.shopperId,periodId:before.periodId}));
const user=await auth.getUser(UID);
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const url=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(PROJECT_ID)+'&cxProtectedRuntime='+PROTECTED+'&cxHumanFullVisual='+FULL+'&vrm168capture='+Date.now();
const browser=await chromium.launch({headless:true});
let result={decision:'HOLD',production:false,writes:0,hrWrites:0};
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await ctx.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
  let authSettled=false,lastAuthError=null;
  for(let attempt=1;attempt<=5&&!authSettled;attempt++){
    await page.goto(url+'&authAttempt='+attempt+'-'+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const customToken=await auth.createCustomToken(UID,user.customClaims||{});
    try{
      await page.evaluate(async t=>{const fb=window.firebase;if(!fb?.auth)throw new Error('FIREBASE_SDK_NOT_READY');await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},customToken);
    }catch(error){
      const msg=String(error?.message||error||'');
      if(!/Execution context was destroyed|navigation|FIREBASE_SDK_NOT_READY|No Firebase App|auth\/network-request-failed|network|timeout|interrupted/i.test(msg))throw error;
      lastAuthError=error;
    }
    await page.waitForLoadState('domcontentloaded',{timeout:90000}).catch(()=>{});
    const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=> '');
    if(uid===UID){authSettled=true;break;}
    if(attempt<5)await page.waitForTimeout(1200*attempt);
  }
  if(!authSettled)throw new Error('ENVIRONMENT_FAILURE:VRM168_FIREBASE_SESSION_NOT_PERSISTED:'+String(lastAuthError?.message||lastAuthError||'no-current-user'));
  await page.goto('about:blank');
  await page.goto(url+'&settled=1',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(firebase.auth().currentUser?.uid||'')===uid,UID,{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({tenant,project,period,shopper,rev})=>{
    const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{};
    return c.authenticated===true&&String(c.tenantId||'')===tenant&&String(c.role||'')==='shopper'&&String(c.shopperId||'')===shopper
      &&Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(project)
      &&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true
      &&String(d.currentProjectId||'')===project&&String(d.currentPeriodId||'')===period
      &&String(d.previewMeta?.sourceRevision||'')===rev;
  },{tenant:TENANT,project:PROJECT_ID,period:PERIOD_ID,shopper:SHOPPER_ID,rev:HR_REVISION},{timeout:150000});
  await page.evaluate(()=>CX.router.nav('misvisitas',{history:false}));
  await page.waitForFunction(()=>String(window.CX?.session?.view||'')==='misvisitas',null,{timeout:30000});
  await page.waitForTimeout(700);
  const pre=await page.evaluate(({visitId})=>{
    const d=window.CX?.data||{},v=(Array.isArray(d._visitas)?d._visitas:[]).find(x=>String(x.id||x.visitId||'')===visitId||String(x.hrRowId||'')===visitId);
    const pv=(Array.isArray(d.__protectedVisits)?d.__protectedVisits:[]).find(x=>String(x.id||x.visitId||'')===visitId||String(x.hrRowId||'')===visitId);
    const hv=(Array.isArray(d.__liveHrVisits)?d.__liveHrVisits:[]).find(x=>String(x.id||x.visitId||'')===visitId||String(x.hrRowId||'')===visitId);
    const raw=(Array.isArray(window.CX_TYA_HR_SOURCE_SAFE?.visits)?window.CX_TYA_HR_SOURCE_SAFE.visits:[]).find(x=>String(x.id||x.visitId||'')===visitId||String(x.hrRowId||'')===visitId);
    const focalIds=new Set(['s3',String(window.CX?.backendAuth?.context?.()?.shopperId||''),String(v?.shopperId||''),String(pv?.shopperId||'')]);
    const shopperSlim=s=>({id:s?.id||null,shopperId:s?.shopperId||null,canonicalShopperId:s?.canonicalShopperId||null,legacyShopperId:s?.legacyShopperId||null,exactAliases:Array.isArray(s?.exactAliases)?s.exactAliases:[],sourceShopperIds:Array.isArray(s?.sourceShopperIds)?s.sourceShopperIds:[],legacyLiveShopperIds:Array.isArray(s?.legacyLiveShopperIds)?s.legacyLiveShopperIds:[],dataLevel:s?.dataLevel||null});
    const shopperMatch=s=>{
      const vals=[s?.id,s?.shopperId,s?.canonicalShopperId,s?.legacyShopperId,...(Array.isArray(s?.exactAliases)?s.exactAliases:[]),...(Array.isArray(s?.sourceShopperIds)?s.sourceShopperIds:[]),...(Array.isArray(s?.legacyLiveShopperIds)?s.legacyLiveShopperIds:[])].map(x=>String(x||''));
      return vals.some(x=>focalIds.has(x));
    };
    const focalShoppers=(Array.isArray(d.shoppers)?d.shoppers:[]).filter(shopperMatch).map(shopperSlim);
    const rawHrFocalShoppers=(Array.isArray(window.CX_TYA_HR_SOURCE_SAFE?.shoppers)?window.CX_TYA_HR_SOURCE_SAFE.shoppers:[]).filter(shopperMatch).map(shopperSlim);
    const authorizedFocalShoppers=(Array.isArray(window.CX_BACKEND_AUTHORIZED_STATE?.shoppers)?window.CX_BACKEND_AUTHORIZED_STATE.shoppers:[]).filter(shopperMatch).map(shopperSlim);
    const sessionShopperProfile=d.__sessionShopperProfile?shopperSlim(d.__sessionShopperProfile):null;
    const card=[...document.querySelectorAll('[data-visit-card]')].find(x=>String(x.getAttribute('data-visit-card')||'')===String(v?.id||v?.visitId||''));
    const sched=card?.querySelector('[data-sched]');
    const slim=x=>x?{id:x.id||x.visitId||null,visitId:x.visitId||null,hrRowId:x.hrRowId||null,periodId:x.periodId||null,projectId:x.projectId||null,estado:x.estado||x.status||null,shopperId:x.shopperId||null,assignmentSource:x.assignmentSource||null,assignmentSyncStatus:x.assignmentSyncStatus||null,version:x.version??null,disponibleDesde:x.disponibleDesde||null}:null;
    return {
      dataCtx:typeof d.ctx==='function'?d.ctx():null,currentProjectId:d.currentProjectId||null,currentPeriodId:d.currentPeriodId||null,
      sourceRevision:d.previewMeta?.sourceRevision||null,
      authContext:window.CX?.backendAuth?.context?.()||null,
      commandStatus:window.CX?.commandAdapter?.status?.()||null,
      rawSnapshot:slim(raw),
      liveHrBeforeOverlay:slim(hv),
      projected:slim(v),
      protected:slim(pv),
      identityMap:d.__identityMap||null,
      identityReviewQueue:Array.isArray(d.__identityReviewQueue)?d.__identityReviewQueue.filter(x=>String(x?.liveShopperId||'')==='s3'||String(x?.entityId||'')===visitId).slice(0,20):[],
      focalShoppers,
      rawHrFocalShoppers,
      authorizedFocalShoppers,
      sessionShopperProfile,
      authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,
      cardFound:!!card,scheduleButtonFound:!!sched,scheduleButtonText:String(sched?.innerText||'')
    };
  },{visitId:VISIT_ID});
  if(!pre.projected||!pre.cardFound||!pre.scheduleButtonFound)throw new Error('MAPPING_FAILURE:VRM168_BROWSER_VISIT_OR_ACTION_MISSING:'+JSON.stringify(pre));
  await page.evaluate(()=>{
    window.__VRM168_CAPTURED_COMMAND=null;
    window.__VRM168_CAPTURE_EXECUTIONS=0;
    const transport={version:'vrm168-capture-only',execute:async command=>{
      window.__VRM168_CAPTURE_EXECUTIONS++;
      window.__VRM168_CAPTURED_COMMAND=JSON.parse(JSON.stringify(command));
      return {ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,code:'VRM168_CAPTURE_ONLY',production:false};
    }};
    CX.commandAdapter.registerTransport('vrm168-capture-only',transport);
    CX.commandAdapter.useTransport('vrm168-capture-only');
  });
  const card=page.locator('[data-visit-card]').filter({has:page.locator('[data-sched]')}).filter({hasText:'Paseo Cayalá'}).first();
  await card.locator('[data-sched]').click({timeout:15000});
  await page.waitForSelector('#schOk',{timeout:15000});
  const modal=await page.evaluate(()=>({value:document.querySelector('#schD')?.value||null,min:document.querySelector('#schD')?.min||null,text:String(document.querySelector('.cx-ov')?.innerText||'').slice(0,700)}));
  await page.locator('#schOk').click();
  await page.waitForFunction(()=>window.__VRM168_CAPTURE_EXECUTIONS===1,null,{timeout:15000});
  const capture=await page.evaluate(()=>({
    command:window.__VRM168_CAPTURED_COMMAND,
    executions:window.__VRM168_CAPTURE_EXECUTIONS,
    commandStatus:window.CX?.commandAdapter?.status?.()||null,
    currentPeriodId:window.CX?.data?.currentPeriodId||null,
    currentProjectId:window.CX?.data?.currentProjectId||null,
    toastText:[...document.querySelectorAll('.toast,.cx-toast,[role="status"]')].map(x=>String(x.innerText||'')).filter(Boolean).slice(-5)
  }));
  const afterSnap=await visitRef.get(),after=afterSnap.data()||{};
  const command=capture.command||{},payload=command.payload||{},patch=payload.patch||{};
  const expected={
    tenantId:TENANT,projectId:PROJECT_ID,periodId:PERIOD_ID,entityId:VISIT_ID,
    visitId:VISIT_ID,hrRowId:VISIT_ID,shopperId:SHOPPER_ID,estado:'agendada',agendada:'2026-10-05'
  };
  const observed={tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,entityId:command.entityId,expectedVersion:command.expectedVersion,
    actor:command.actor||null,authorization:command.authorization||null,visitId:payload.visitId,hrRowId:payload.hrRowId,shopperId:payload.shopperId,estado:patch.estado,agendada:patch.agendada};
  const mismatch=[];
  for(const k of ['tenantId','projectId','periodId','entityId'])if(String(observed[k]??'')!==String(expected[k]))mismatch.push(k);
  for(const k of ['visitId','hrRowId','shopperId','estado','agendada'])if(String(observed[k]??'')!==String(expected[k]))mismatch.push(k);
  const durableUnchanged=String(after.estado||after.status)==='asignada'&&Number(after.version)===Number(before.version)&&String(after.agendada||'')===String(before.agendada||'');
  result={schemaVersion:'cxorbia.i3.vrm168.browser-command-capture.v1',
    decision:mismatch.length?'FAIL_VRM168_BROWSER_COMMAND_MAPPING':'PASS_VRM168_BROWSER_COMMAND_MAPPING',
    expected,observed,mismatch,modal,pre,capture,durableBefore:{estado:before.estado||before.status,version:before.version,agendada:before.agendada||null,periodId:before.periodId,shopperId:before.shopperId},
    durableAfter:{estado:after.estado||after.status,version:after.version,agendada:after.agendada||null,periodId:after.periodId,shopperId:after.shopperId},
    durableUnchanged,pageErrors,writes:0,hrWrites:0,providerWrites:0,production:false};
  if(!durableUnchanged)throw new Error('PERSISTENCE_FAILURE:VRM168_CAPTURE_MUTATED_REAL_VISIT:'+JSON.stringify(result.durableAfter));
  await ctx.close();
}finally{await browser.close();}
fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(result.decision!=='PASS_VRM168_BROWSER_COMMAND_MAPPING'||result.durableUnchanged!==true)process.exitCode=2;
