/* CXOrbia B1 — scoped authenticated visual/read-only proof on exact DEV.
   Never submit forms, trigger command writes, mutate providers, or call ?fresh=1.
   This probe only signs into an existing DEV test context and inspects UI. */
import fs from 'node:fs';
import path from 'node:path';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=String(process.env.B1_VISUAL_OUT||'.tmp/b1-oct07-readonly');
const SOURCE=String(process.env.FOCAL_SOURCE||'');
const TREE=String(process.env.FOCAL_TREE||'');
const HR=String(process.env.EXPECTED_HR_REVISION||'');
const targets=[
  {name:'Paula Osorio',sid:'shopper_gt_1440137b73',branch:'C. Paseo Cayalá'},
  {name:'Julissa Flores',sid:'shopper_gt_0c198c1055',branch:'C. Miraflores'}
];
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{40}$/.test(TREE))throw Error('SOURCE_SHA_REQUIRED');
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth();
const db=getFirestore();
const tenant=db.collection('tenants').doc('tya');
const userDocs=(await tenant.collection('users').get()).docs.map(d=>({uid:d.id,...d.data()}));
const result={schemaVersion:'cxorbia.i3.b1.oct07.live-auth-readonly.v1',decision:'HOLD',sourceSha:SOURCE,sourceTree:TREE,expectedHrRevision:HR,scope:'B1_ONLY',testInitiatedWrites:0,externalActions:0,production:false,targets:[],errors:[],screenshots:[],tinyFish:'ENVIRONMENT_FAILURE_SESSION_RESTORE_B1_EXCEPTION'};
const normalize=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV';
const browser=await chromium.launch({headless:true});
try{
for(const t of targets){
  const matches=userDocs.filter(u=>u.active===true&&String(u.role||'').toLowerCase()==='shopper'&&String(u.authNamespace||'').toLowerCase()==='shopper'&&String(u.shopperId||'')===t.sid);
  if(matches.length!==1)throw Error('B1_EXACT_ACTIVE_MEMBERSHIP_EXPECTED_'+t.name.replace(/\s/g,'_')+':'+matches.length);
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));
  let signed=false;
  for(let n=0;n<3&&!signed;n++){
    await page.goto(url+'&b1boot='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth?.(),null,{timeout:90000});
    const token=await auth.createCustomToken(matches[0].uid);
    await page.evaluate(async token=>{const fb=window.firebase;await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(token);},token);
    signed=await page.evaluate(uid=>window.firebase.auth().currentUser?.uid===uid,matches[0].uid);
  }
  if(!signed)throw Error('B1_AUTHENTICATED_DEV_BROWSER_NOT_READY_'+t.name);
  await page.goto('about:blank');
  const start=Date.now();
  await page.goto(url+'&b1vis='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>window.firebase?.auth?.().currentUser?.uid===uid,matches[0].uid,{timeout:90000});
  await page.waitForFunction(expected=>{
    const d=window.CX?.data||{},a=window.CX?.backendAuth?.context?.()||{};
    return a.authenticated===true&&String(a.shopperId||window.CX?.session?.user?.shopperId||'')===expected&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&String(d.currentPeriodId||'')==='cinepolis-2026-10';
  },t.sid,{timeout:120000});
  const syncMs=Date.now()-start;
  await page.evaluate(()=>window.CX.router.nav('midia',{history:false}));
  await page.locator('.cx-shopper-visit-card').first().waitFor({timeout:30000});
  const view=await page.evaluate(({branch,sid})=>{
    const d=window.CX.data, profile=window.CX.session?.user||{},current=d.visitasForShopper?.(sid)||d.visitsForShopper?.(sid,false)||[];
    const active=current.find(v=>v.sucursal===branch&&String(v.periodKey||'')==='2026-10')||null;
    const facets=active?d.visitFacets?.(active)||{}:{};
    const loc=document.querySelector('.cx-shopper-visit-card .cx-visit-location');
    const step=document.querySelector('.cx-day-progress-card .cx-day-progress-step span');
    const label=document.querySelector('.cx-shopper-visit-card .bdg');
    const buttons=[...document.querySelectorAll('[data-visit-action]')].map(b=>({action:b.dataset.visitAction,visitId:b.dataset.visitId||'',visible:b.getBoundingClientRect().width>0}));
    return {role:window.CX.session.role,name:profile.name,period:d.currentPeriodId,branchVisible:document.body.innerText.includes(branch),liveHrRevision:d.previewMeta?.sourceRevision||null,visit:active?{key:active.hrRowId||active.id,hrDate:active.agendada||null,pendingDate:active.platformSchedulePendingHr?.date||null,pendingHR:active.platformSchedulePendingHr?.status==='pending_hr',facetsScheduled:facets.scheduled===true}:null,
      locationFontPx:loc?parseFloat(getComputedStyle(loc).fontSize):null,stepFontPx:step?parseFloat(getComputedStyle(step).fontSize):null,
      modalCount:document.querySelectorAll('.cx-ov').length,badge:label?.innerText||'',buttons};
  },{branch:t.branch,sid:t.sid});
  if(view.role!=='shopper'||!normalize(view.name).includes(normalize(t.name))||!view.branchVisible)throw Error('B1_WRONG_SHOPPER_OR_BRANCH:'+t.name+':'+JSON.stringify(view));
  if(!view.visit||view.modalCount!==0)throw Error('B1_VISIT_OR_MODAL_INVARIANT:'+t.name+':'+JSON.stringify(view));
  if(view.locationFontPx<14||view.stepFontPx<13)throw Error('B1_MICROTYPOGRAPHY:'+t.name+':'+JSON.stringify(view));
  if(HR&&view.liveHrRevision!==HR)throw Error('B1_HR_REVISION_DRIFT_FAIL_CLOSED:'+JSON.stringify({expected:HR,observed:view.liveHrRevision}));
  const expectReschedule=view.visit.facetsScheduled||view.visit.pendingHR;
  const acts=new Set(view.buttons.map(b=>b.action));
  if(expectReschedule&&(!acts.has('reschedule')||acts.has('schedule')))throw Error('B1_PENDING_OR_CONFIRMED_SCHEDULE_BAD_CTA:'+t.name+':'+JSON.stringify(view));
  if(!expectReschedule&&(!acts.has('schedule')||acts.has('reschedule')))throw Error('B1_UNSCHEDULED_BAD_CTA:'+t.name+':'+JSON.stringify(view));
  if(view.visit.pendingHR&&(!view.badge.includes('pendiente HR')||!view.visit.pendingDate))throw Error('B1_PROVIDER_SCHEDULE_NOT_EXPLAINED:'+t.name+':'+JSON.stringify(view));
  const imageName='b1-'+t.name.toLowerCase().replace(/\s+/g,'-')+'-midia.png';
  await page.screenshot({path:path.join(OUT,imageName),fullPage:false});
  result.screenshots.push(imageName);
  const action=expectReschedule?'reschedule':'schedule';
  const ctl=page.locator('[data-visit-action="'+action+'"]').first();
  await ctl.click();
  await page.waitForFunction(()=>window.CX?.session?.view==='misvisitas',null,{timeout:20000});
  await page.waitForTimeout(700);
  const modal=await page.evaluate(()=>{
    const ovs=[...document.querySelectorAll('.cx-ov')].filter(x=>{const b=x.getBoundingClientRect();return b.width>0&&b.height>0;});
    const e=ovs.at(-1),dialog=e?.querySelector('.cx-modal')||null,r=dialog?.getBoundingClientRect();
    return {count:ovs.length,title:dialog?.querySelector('.cx-modal-h')?.innerText||'',premium:!!dialog?.classList.contains('cx-modal-premium-workflow'),
      inViewport:!dialog||!!r&&(r.left>=0&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2),height:r?.height||null};
  });
  if(modal.count>1||!modal.inViewport)throw Error('B1_MODAL_STACK_OR_VIEWPORT:'+t.name+':'+JSON.stringify(modal));
  if(modal.count===1){
    await page.locator('.cx-ov:visible [data-x]').last().click();
    await page.waitForFunction(()=>document.querySelectorAll('.cx-ov').length===0,null,{timeout:10000});
  }
  await page.evaluate(()=>window.CX.router.nav('midia',{history:false}));
  if(await page.locator('.cx-ov').count()!==0)throw Error('B1_ROUTE_LEAKS_MODAL:'+t.name);
  if(errors.length)throw Error('B1_CLIENT_JS_ERRORS:'+t.name+':'+JSON.stringify(errors.slice(0,3)));
  result.targets.push({name:t.name,syncMs,view,modal,actionExercised:action+' NON_MUTATING_ONLY',activeOwnerStable:true});
  await ctx.close();
}
result.decision='PASS_B1_AUTHENTICATED_READONLY_UI_FOCAL';
}catch(e){result.decision='HOLD_B1_AUTHENTICATED_READONLY_UI_FOCAL';result.errors.push(String(e?.message||e));}
finally{await browser.close();fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({decision:result.decision,sourceSha:SOURCE,sourceTree:TREE,scope:result.scope,targets:result.targets.map(t=>({name:t.name,syncMs:t.syncMs,scheduled:t.view.visit?.facetsScheduled,pendingHR:t.view.visit?.pendingHR,modal:t.modal})),errors:result.errors,screenshots:result.screenshots,testInitiatedWrites:0,production:false}));
if(!result.decision.startsWith('PASS_'))process.exitCode=2;
