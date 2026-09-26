import fs from 'node:fs';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const OUT=process.env.V28_OUT||'.tmp/i3-v28',ROOT=String(process.env.V28_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc('tya');
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const str=v=>String(v??'').trim();
async function authExists(m){try{await auth.getUser(m.id);return true;}catch(e){return false;}}
let admin=null,shopper=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper'))if(await authExists(m)){admin=m;break;}
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio'))if(await authExists(m)){shopper=m;break;}
if(!admin||!shopper)throw new Error('AUTH_FAILURE:V28_PRINCIPAL_MISSING');

const browser=await chromium.launch({headless:true});
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
async function signed(member,kind){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  const token=await auth.createCustomToken(member.id);
  let signedIn=false,lastSignInError=null;
  for(let i=0;i<8&&!signedIn;i++){
    try{
      await page.evaluate(async t=>{
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        await firebase.auth().signInWithCustomToken(t);
      },token);
    }catch(e){
      const msg=str(e?.message||e);
      if(!/Execution context was destroyed|navigation|auth\/network-request-failed|network|timeout|interrupted|unreachable/i.test(msg))throw e;
      lastSignInError=e;
    }
    await page.waitForLoadState('domcontentloaded',{timeout:30000}).catch(()=>{});
    await page.waitForTimeout(900*(i+1));
    const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=> '');
    if(uid===member.id)signedIn=true;
  }
  if(!signedIn)throw new Error('ENVIRONMENT_FAILURE:V28_CUSTOM_TOKEN_AUTH_RETRY_EXHAUSTED:'+str(lastSignInError?.message||lastSignInError||''));
  await page.goto('about:blank');const t0=Date.now();await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,member.id,{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(kind=>{const c=CX.backendAuth.context()||{},r=String(c.role||'').toLowerCase();return c.authenticated===true&&(kind==='shopper'?r==='shopper':r!=='shopper'&&r!=='cliente');},kind,{timeout:120000});
  await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_C6_HR_AUTHORITY_GATE?.ready===true&&window.CX_C6_HR_AUTHORITY_GATE?.blocked!==true,null,{timeout:120000});
  return {ctx,page,readyMs:Date.now()-t0};
}
const evidence={schemaVersion:'cxorbia.i3.v28.live-reproof.v1',decision:'HOLD',production:false,writes:0};
try{
  const sp=await signed(shopper,'shopper'),p=sp.page;
  const self=await p.evaluate(async()=>{
    const c=CX.backendAuth.context()||{},d=CX.data,profile=d.__sessionShopperProfile||d.getShopper?.(c.shopperId)||{};
    const target=String(profile.id||profile.shopperId||c.shopperId||'');
    const period=String(d.currentPeriodId||'');
    const periodOf=v=>d.recordPeriodId?d.recordPeriodId(v):(v.periodId||v.projectId);
    const mine=(d.visitsForShopper?d.visitsForShopper(target):[]).filter(v=>String(periodOf(v)||'')===period);
    const patch={depto:String(profile.depto||''),__commandMeta:{ackAware:true,reason:'v28-self-profile-noop-reproof'}};
    const result=await d.updateShopper(target,patch);
    return{target,period,currentVisitCount:mine.length,profileResult:{ok:result?.ok,status:result?.status,providerAck:result?.providerAck,successUiAllowed:result?.successUiAllowed,entityId:result?.entityId},sourceRevision:String(d.previewMeta?.sourceRevision||'')};
  });
  if(!(self.profileResult.ok===true&&self.profileResult.status==='committed'&&self.profileResult.providerAck===true&&self.profileResult.successUiAllowed===true))throw new Error('FUNCTIONAL_DEFECT:V28_PROFILE_SAVE_NOT_COMMITTED');
  await p.evaluate(()=>CX.router.nav('mireportes',{history:false}));await p.waitForTimeout(400);
  const reports=await p.evaluate(()=>({text:String(document.body?.innerText||''),period:String(CX.data.currentPeriodId||'')}));
  if(/7 fila\(s\).*fuente real/i.test(reports.text))throw new Error('FUNCTIONAL_DEFECT:V28_REPORT_HISTORY_STILL_CURRENT');
  await p.evaluate(()=>CX.router.nav('midia',{history:false}));await p.waitForTimeout(300);
  const notif=await p.evaluate(()=>{
    const sid=String(CX.backendAuth.context()?.shopperId||'');
    const approvals=(CX.notif?.for?.('shopper')||[]).filter(n=>n.tipo==='aprobada');
    const invalid=approvals.filter(n=>{
      const post=(CX.data._posts||[]).find(x=>String(x.shopperId||'')===sid&&String(x.estado||x.status||'').toLowerCase()==='aprobada'&&(!x.sucursal||String(n.txt||'').includes(String(x.sucursal))));
      if(!post)return true;
      const v=(CX.data._visitas||[]).find(x=>String(x.id||x.visitId||'')===String(post.visitaId||post.visitId||''));
      return !(v&&String(v.shopperId||'')===sid&&v.assignmentReviewRequired!==true&&v.assignmentSyncStatus!=='pending_hr');
    });
    return{approvalCount:approvals.length,invalidApprovalCount:invalid.length};
  });
  evidence.shopper={readyMs:sp.readyMs,...self,reportsCurrentCount:self.currentVisitCount,notifications:notif};
  await sp.ctx.close();

  const ap=await signed(admin,'admin'),a=ap.page;
  const adminData=await a.evaluate(()=>{
    const d=CX.data,period=String(d.currentPeriodId||''),periodOf=v=>d.recordPeriodId?d.recordPeriodId(v):(v.periodId||v.projectId);
    const current=(d._visitas||[]).filter(v=>String(periodOf(v)||'')===period);
    const invalid=current.filter(v=>String(v.shopperId||'')==='shopper_gt_018ca3e794');
    const src=(window.CX_TYA_HR_SOURCE_SAFE?.visits||[]).find(v=>String(v.hrRowId||'')==='SEPTIEMBRE 26 HN!5');
    const row=current.find(v=>String(v.hrRowId||'')==='SEPTIEMBRE 26 HN!5');
    return{
      currentCount:current.length,uniqueHrRows:new Set(current.map(v=>String(v.hrRowId||'')).filter(Boolean)).size,
      invalidVisitCount:invalid.length,invalidShopperVisible:(d.shoppers||[]).some(s=>String(s.id||s.shopperId||'')==='shopper_gt_018ca3e794'||/mishael de paz/i.test(String(s.nombre||''))),
      hn5SourceShopper:String(src?.shopperId||''),hn5UiShopper:String(row?.shopperId||''),
      knownHonorariumCount:current.filter(v=>Number.isFinite(v.honorario)).length,
      honorariumExamples:current.filter(v=>Number.isFinite(v.honorario)).slice(0,12).map(v=>{
        const src=(window.CX_TYA_HR_SOURCE_SAFE?.visits||[]).find(x=>String(x.hrRowId||'')===String(v.hrRowId||''));
        return{hrRowId:String(v.hrRowId||''),sucursal:String(v.sucursal||''),uiHonorario:v.honorario,uiHonorarioSource:String(v.honorarioSource||''),hrHonorario:src?.honorario??null,hrHonorarioSource:String(src?.honorarioSource||''),exactProtectedVisitOverlay:v.__exactProtectedVisitOverlay===true};
      }),
      sourceRevision:String(d.previewMeta?.sourceRevision||'')
    };
  });
  evidence.admin={readyMs:ap.readyMs,...adminData,rawShopperIdVisible:null,q60Visible:null};
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/live-reproof.json',JSON.stringify(evidence,null,2)+'\n');
  if(adminData.currentCount!==44||adminData.uniqueHrRows!==44)throw new Error('PERSISTENCE_FAILURE:V28_ADMIN_CURRENT_VISIT_PARITY');
  if(adminData.invalidVisitCount||adminData.invalidShopperVisible)throw new Error('MAPPING_FAILURE:V28_INVALID_IDENTITY_VISIBLE');
  if(adminData.hn5SourceShopper!==adminData.hn5UiShopper)throw new Error('MAPPING_FAILURE:V28_HN5_ASSIGNMENT_NOT_HR');
  if(adminData.knownHonorariumCount!==0)throw new Error('MAPPING_FAILURE:V28_HONORARIUM_FABRICATED');
  await a.evaluate(()=>CX.router.nav('postulaciones',{history:false}));await a.waitForTimeout(400);
  const postText=await a.evaluate(()=>String(document.body?.innerText||''));
  if(/shopper_gt_[0-9a-f]+/i.test(postText))throw new Error('VISUAL_DEFECT:V28_RAW_SHOPPER_ID_VISIBLE');
  if(/Mishael De Paz/i.test(postText))throw new Error('MAPPING_FAILURE:V28_INVALID_IDENTITY_POSTULATION_VISIBLE');
  await a.evaluate(()=>CX.router.nav('visitas',{history:false}));await a.waitForTimeout(400);
  const visitText=await a.evaluate(()=>String(document.body?.innerText||''));
  if(/\bQ\s*60\b/.test(visitText))throw new Error('MAPPING_FAILURE:V28_Q60_STILL_VISIBLE');
  evidence.admin={readyMs:ap.readyMs,...adminData,rawShopperIdVisible:false,q60Visible:false};
  evidence.writes=1;
  evidence.decision='PASS_I3_V28_LIVE_REPROOF';
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/live-reproof.json',JSON.stringify(evidence,null,2)+'\n');
  await ap.ctx.close();
}catch(error){
  evidence.decision='FAIL_I3_V28_LIVE_REPROOF';evidence.error=String(error?.stack||error);
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/live-reproof.json',JSON.stringify(evidence,null,2)+'\n');throw error;
}finally{await browser.close();}
console.log(JSON.stringify(evidence,null,2));
