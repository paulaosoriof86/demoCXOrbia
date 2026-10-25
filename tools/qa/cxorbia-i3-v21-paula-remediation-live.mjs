import fs from 'node:fs';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const OUT=process.env.V21_OUT,ROOT=String(process.env.V21_ROOT||'').replace(/\/$/,''),SOURCE=String(process.env.V21_SOURCE||'');
if(!OUT||!ROOT||!SOURCE)throw new Error('ENVIRONMENT_FAILURE:V21_BROWSER_ENV');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc('tya');
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const str=v=>String(v??'').trim();
async function authExists(m){try{await auth.getUser(m.id);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}}
let admin=null,shopper=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper'))if(await authExists(m)){admin=m;break;}
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio'))if(await authExists(m)){shopper=m;break;}
if(!admin)throw new Error('AUTH_FAILURE:V21_ADMIN_MISSING');
if(!shopper)throw new Error('AUTH_FAILURE:V21_PAULA_MISSING');

const browser=await chromium.launch({headless:true});
const evidence={schemaVersion:'cxorbia.i3.v21.paula-remediation-live.v1',decision:'HOLD',sourceSha:SOURCE,admin:null,shopper:null,production:false,writes:0};
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';

async function signedPage(member,kind){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}});
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(str(e?.message||e)));
  await page.addInitScript(()=>{
    window.__cxV21AuthFrames=[];
    addEventListener('DOMContentLoaded',()=>{
      const started=performance.now();
      const tick=()=>{
        const el=document.getElementById('login'),rest=document.getElementById('cxAuthRestoring');
        const visible=!!(el&&!el.classList.contains('hidden')&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden');
        window.__cxV21AuthFrames.push({t:Math.round(performance.now()-started),loginVisible:visible,restoring:!!rest});
        if(performance.now()-started<5000)requestAnimationFrame(tick);
      };requestAnimationFrame(tick);
    },{once:true});
  });
  let authSettled=false,lastAuthError=null;
  for(let attempt=1;attempt<=5&&!authSettled;attempt++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(member.id);
    try{
      await page.evaluate(async t=>{const fb=window.firebase;if(!fb?.auth)throw new Error('FIREBASE_SDK_NOT_READY');await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token);
    }catch(error){
      const msg=String(error&&error.message||error||'');
      if(!/Execution context was destroyed|navigation|FIREBASE_SDK_NOT_READY|No Firebase App|auth\/network-request-failed|network|timeout|interrupted/i.test(msg))throw error;
      lastAuthError=error;
    }
    await page.waitForLoadState('domcontentloaded',{timeout:90000}).catch(()=>{});
    const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=> '');
    if(uid===String(member.id)){authSettled=true;break;}
    if(attempt<5)await page.waitForTimeout(1200*attempt);
  }
  if(!authSettled)throw new Error('ENVIRONMENT_FAILURE:V21_FIREBASE_AUTH_SESSION_NOT_PERSISTED:'+String(lastAuthError&&lastAuthError.message||lastAuthError||'no-current-user'));
  await page.goto('about:blank');
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(kind=>{const c=window.CX?.backendAuth?.context?.()||{},r=String(c.role||'').toLowerCase();return c.authenticated===true&&(kind==='shopper'?r==='shopper':r!=='shopper'&&r!=='cliente');},kind,{timeout:120000});
  await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_C6_HR_AUTHORITY_GATE?.ready===true&&window.CX_C6_HR_AUTHORITY_GATE?.blocked!==true,null,{timeout:120000});
  if(errors.length)throw new Error('FUNCTIONAL_DEFECT:PAGEERROR:'+kind+':'+errors.join('|'));
  return {ctx,page};
}

try{
  const sp=await signedPage(shopper,'shopper'),page=sp.page;
  await page.evaluate(()=>window.CX.router.nav('miperfil',{history:false}));await page.waitForTimeout(600);
  const profile=await page.evaluate(()=>{
    const d=CX.data,c=CX.backendAuth.context(),sid=String(c.shopperId||''),hist=d.shopperHistoryVisits(sid,false),current=String(d.currentPeriodId||'');
    const periodOf=v=>d.recordPeriodId?d.recordPeriodId(v):(v.periodId||v.projectId);
    const active=hist.filter(v=>{const f=d.visitFacets(v);return String(periodOf(v)||'')===current&&f.assigned&&!f.liquidationConfirmed&&!f.paymentConfirmed&&!f.cancelled;});
    const badActive=active.filter(v=>String(periodOf(v)||'')!==current);
    const body=String(document.body?.innerText||'');
    const banned=/localStorage|Firestore|\bACK\b|\bprovider\b|\bruntime\b|\bgate\b|read model|hist[oó]rico can[oó]nico|identidad can[oó]nica/i.test(body);
    const btn=document.querySelector('[data-profile-edit]');
    const frames=window.__cxV21AuthFrames||[];
    const falseLogout=frames.some(x=>x.loginVisible===true&&x.restoring!==true);
    return{sid,historyCount:hist.length,currentPeriodId:current,activeCount:active.length,historicalInActive:badActive.length,profileEditVisible:!!btn,bannedTechnicalLanguage:banned,falseLogout,sourceRevision:String(d.previewMeta?.sourceRevision||''),scope:d.scopePaises?.()||null};
  });
  if(profile.historyCount!==7)throw new Error('MAPPING_FAILURE:V21_PAULA_HISTORY_'+profile.historyCount);
  if(profile.historicalInActive!==0)throw new Error('FUNCTIONAL_DEFECT:V21_HISTORICAL_ACTIVE');
  if(!profile.profileEditVisible)throw new Error('FUNCTIONAL_DEFECT:V21_PROFILE_EDIT_MISSING');
  if(profile.bannedTechnicalLanguage)throw new Error('VISUAL_DEFECT:V21_PROFILE_TECH_LANGUAGE');
  if(profile.falseLogout)throw new Error('VISUAL_DEFECT:V21_AUTH_REFRESH_FLICKER');
  if(JSON.stringify(profile.scope)!==JSON.stringify(['GT']))throw new Error('MAPPING_FAILURE:V21_COUNTRY_SCOPE:'+JSON.stringify(profile.scope));

  await page.evaluate(()=>window.CX.router.nav('visitas',{history:false}));await page.waitForTimeout(500);
  const market=await page.evaluate(()=>{
    const d=CX.data,rows=d.visitas(),available=rows.filter(v=>{const f=d.visitFacets(v);return f.available===true&&f.assigned!==true&&f.cancelled!==true;});
    return{countries:[...new Set(available.map(v=>String(v.pais||'')))],altaraVisible:/Altara/i.test(String(document.body?.innerText||'')),availableCount:available.length};
  });
  if(market.countries.some(c=>c&&c!=='GT')||market.altaraVisible)throw new Error('MAPPING_FAILURE:V21_CROSS_COUNTRY_MARKET:'+JSON.stringify(market));

  const benefits=await page.evaluate(()=>{window.CX.router.nav('beneficios',{history:false});const n=document.getElementById('nav-beneficios'),w=n?.closest('.nav-sec-wrap');return{route:String(CX.session.view||''),navVisible:!!(n&&getComputedStyle(n).display!=='none'&&w&&getComputedStyle(w.querySelector('.nav-sec-items')).display!=='none'),alwaysOpen:w?.dataset?.alwaysOpen||''};});
  if(benefits.route!=='beneficios'||!benefits.navVisible||benefits.alwaysOpen!=='1')throw new Error('VISUAL_DEFECT:V21_BENEFITS_DISCOVERABILITY:'+JSON.stringify(benefits));

  await page.evaluate(()=>window.CX.router.nav('novedades',{history:false}));await page.waitForTimeout(400);
  const newsTech=await page.evaluate(()=>/localStorage|Firestore|\bACK\b|\bprovider\b|\bruntime\b|\bgate\b|Add-ons funcionales por rol|admin\s*·\s*shopper/i.test(String(document.body?.innerText||'')));
  if(newsTech)throw new Error('VISUAL_DEFECT:V21_NEWS_TECH_LANGUAGE');
  evidence.shopper={...profile,market,benefits};
  await sp.ctx.close();

  const ap=await signedPage(admin,'admin'),adminPage=ap.page;
  await adminPage.evaluate(()=>window.CX.router.nav('reservas',{history:false}));await adminPage.waitForTimeout(500);
  const adminProof=await adminPage.evaluate(()=>{
    const d=CX.data,raw=d._visitas||[];
    const zac=raw.find(v=>String(v.hrRowId||v.sourceRowId||v.rowId||'')==='SEPTIEMBRE 26!35')||raw.find(v=>/Zacapa/i.test(String(v.sucursal||''))&&String(v.agendada||'')==='2026-09-26');
    const zf=zac?d.visitFacets(zac):null;
    const reservationSource=Array.isArray(d.__protectedReservations);
    const localAuthority=/localStorage|cx_reservas_/i.test(String(CX.reservas?.list||'')+String(CX.reservas?.reservar||'')+String(CX.reservas?.setEstado||'')+String(CX.reservas?.remove||''));
    return{sourceRevision:String(d.previewMeta?.sourceRevision||''),zacapaFound:!!zac,zacapaAvailable:zf?.available===true,zacapaAssigned:zf?.assigned===true,reservationSource,localAuthority};
  });
  if(!adminProof.zacapaFound||adminProof.zacapaAvailable!==false)throw new Error('PROVIDER_FAILURE:V21_ZACAPA_STALE:'+JSON.stringify(adminProof));
  if(!adminProof.reservationSource||adminProof.localAuthority)throw new Error('PERSISTENCE_FAILURE:V21_RESERVATION_AUTHORITY:'+JSON.stringify(adminProof));
  if(adminProof.sourceRevision!==evidence.shopper.sourceRevision)throw new Error('PROVIDER_FAILURE:V21_REVISION_DESYNC');
  evidence.admin=adminProof;
  evidence.decision='PASS_I3_V21_PAULA_REMEDIATION_LIVE';
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/v21-paula-remediation-live.json',JSON.stringify(evidence,null,2)+'\n');
  await ap.ctx.close();
}catch(error){
  evidence.decision='FAIL_I3_V21_PAULA_REMEDIATION_LIVE';evidence.error=String(error?.stack||error);
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/v21-paula-remediation-live.json',JSON.stringify(evidence,null,2)+'\n');
  throw error;
}finally{await browser.close();}
