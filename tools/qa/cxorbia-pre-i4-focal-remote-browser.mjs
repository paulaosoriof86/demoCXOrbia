import fs from 'node:fs';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const OUT=process.env.PREI4_OUT;
const ROOT=String(process.env.CXORBIA_PREI4_ROOT||'').replace(/\/$/,'');
const sourceSha=String(process.env.CXORBIA_PREI4_SOURCE_SHA||'');
if(!OUT||!ROOT||!sourceSha)throw new Error('ENVIRONMENT_FAILURE:PREI4_BROWSER_ENV_MISSING');
const hr=JSON.parse(fs.readFileSync(OUT+'/hr-contrast.json','utf8'));
const tenantId='tya',projectId='cinepolis',periodId=String(hr.currentPeriodId||''),hrRevision=String(hr.sourceRevision||''),reference=hr.reference||{};
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime='+PROTECTED+'&cxHumanFullVisual='+FULL;
const str=v=>String(v??'').trim(), arr=v=>Array.isArray(v)?v:[], fp=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,16);
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const authExists=async m=>{try{await auth.getUser(m.id);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}};
let admin=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){if(await authExists(m)){admin=m;break;}}
let shopper=null;
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.authNamespace).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio')){if(await authExists(m)){shopper=m;break;}}
if(!admin)throw new Error('AUTH_FAILURE:FOCAL_ADMIN_PRINCIPAL_MISSING');
if(!shopper)throw new Error('AUTH_FAILURE:FOCAL_PAULA_SHOPPER_PRINCIPAL_MISSING');

const browser=await chromium.launch({headless:true});
const evidence={schemaVersion:'cxorbia.pre-i4.focal-human-browser.v2',decision:'HOLD',sourceSha,hrRevision,periodId,preAuth:null,admin:null,shopper:null,mobile:null,adminMobile:null,shopperMobile:null,production:false,authWrites:0,hrWrites:0,providerWrites:0};

async function assertClean(page,label){
  await page.waitForTimeout(1200);
  const d=await page.evaluate(()=>{const body=String(document.body?.innerText||'');const logo=[...document.querySelectorAll('img')].find(x=>/tyaconsultores\.com\/wp-content\/uploads\/2023\/05\/logo\.png/.test(String(x.src||'')));return{
    debug:!!document.getElementById('cxBackendPreviewStatus'),
    lab:!!document.getElementById('cx-dev-lab'),
    blocked:body.includes('Fuente de datos no disponible')||body.includes('No hay un adapter backend autorizado conectado'),
    staleRetail:/proyecto retail|periodo activo:\s*retail|visitas:\s*108|shoppers:\s*18|postulaciones:\s*48/i.test(body),
    gravicentra:/Gravicentra\s*CX/i.test(body),
    brandId:String(window.CX?.BRAND?.id||''),
    brandName:String(window.CX?.BRAND?.clientName||window.CX?.BRAND?.name||''),
    logoSrc:logo?String(logo.src):'',
    logoLoaded:!!(logo&&logo.complete&&logo.naturalWidth>0),
    dataMode:String(window.CX?.dataSource?.mode||''),
    dataStatus:String(window.CX?.dataSource?.status||''),
    blockers:Array.isArray(window.CX?.dataSource?.blockers)?window.CX.dataSource.blockers.slice():[],
    lane:String(window.CX_DEV_ENTRY_CANONICAL?.lane||'')
  };});
  if(d.debug||d.lab||d.blocked||d.staleRetail||d.gravicentra||d.brandId!=='tya'||d.brandName!=='T&A Consultores'||!d.logoLoaded||d.dataStatus==='blocked'||d.blockers.length||d.lane!=='authenticated-human-canonical')throw new Error('RELEASE_COMPOSITION_FAILURE:'+label+':'+JSON.stringify(d));
  return d;
}

async function signInMember(member,kind,route,options={}){
  const viewport=options.viewport||{width:1440,height:980};
  const ctx=await browser.newContext({viewport,isMobile:options.isMobile===true});
  const page=await ctx.newPage(),pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e)));
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
  if(!authSettled)throw new Error('ENVIRONMENT_FAILURE:FIREBASE_AUTH_SESSION_NOT_PERSISTED:'+String(lastAuthError&&lastAuthError.message||lastAuthError||'no-current-user'));
  await page.goto('about:blank');
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({kind,tenantId})=>{const c=window.CX?.backendAuth?.context?.()||{},role=String(c.role||'').toLowerCase();return c.authenticated===true&&c.tenantId===tenantId&&(kind==='shopper'?role==='shopper':role!=='shopper'&&role!=='cliente');},{kind,tenantId},{timeout:120000});
  await page.waitForFunction(({projectId,periodId,hrRevision})=>{const d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};return window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(d.currentProjectId||'')===projectId&&String(d.currentPeriodId||'')===periodId&&String(d.previewMeta?.sourceRevision||'')===hrRevision;},{projectId,periodId,hrRevision},{timeout:120000});
  await page.evaluate(r=>{window.CX.router.nav(r);},route);
  await page.waitForTimeout(700);
  const one=await page.evaluate(({kind,route})=>{const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},body=String(document.body?.innerText||'');const stats=kind==='shopper'&&c.shopperId&&typeof d.shopperStats==='function'?d.shopperStats(c.shopperId):null;return{
    role:String(c.role||''),route:String(window.CX?.session?.view||route),projectId:String(d.currentProjectId||''),periodId:String(d.currentPeriodId||''),sourceRevision:String(d.previewMeta?.sourceRevision||''),authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,debug:!!document.getElementById('cxBackendPreviewStatus'),lab:!!document.getElementById('cx-dev-lab'),blocked:body.includes('Fuente de datos no disponible'),stats
  };},{kind,route});
  if(pageErrors.length||one.debug||one.lab||one.blocked||!one.authority||one.projectId!==projectId||one.periodId!==periodId||one.sourceRevision!==hrRevision||one.route!==route)throw new Error('FUNCTIONAL_DEFECT:'+kind+'_FOCAL_ROUTE:'+JSON.stringify({pageErrors,one}));
  if(kind==='shopper'&&Number(one.stats?.total||0)!==7)throw new Error('MAPPING_FAILURE:PAULA_HISTORY_REGRESSION:'+JSON.stringify(one.stats));

  const routes=options.routes||(kind==='admin'
    ? ['midia','dashboard','visitas','postulaciones','shoppers','financiero','liquidaciones','documentos','cert']
    : ['midia','miperfil','visitas','reservas','misvisitas','beneficios','mireportes','documentos','cert','tablon']);
  const routeEvidence={};
  for(const r of routes){
    await page.evaluate(async r=>{
      window.CX.router.nav(r,{history:false});
      if(r==='documentos'&&window.CX?.backendResources?.load)await window.CX.backendResources.load({projectId:window.CX.data.currentProjectId,periodId:window.CX.data.currentPeriodId});
    },r);
    await page.waitForTimeout(550);
    const info=await page.evaluate(({kind,r})=>{
      const d=window.CX?.data||{},c=window.CX?.backendAuth?.context?.()||{},body=String(document.body?.innerText||'');
      const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
      const phase=code=>typeof d.phaseFlow==='function'?d.phaseFlow(code):null;
      const ranking=typeof d.shopperRankingRows==='function'?d.shopperRankingRows():[];
      const population=typeof d.shoppersFor==='function'?d.shoppersFor().filter(s=>typeof d.shopperDataLevel!=='function'||d.shopperDataLevel(s)!=='protected_reference'):[];
      const findShopper=name=>(d.shoppers||[]).find(s=>norm(s.nombre||s.name)===norm(name))||null;
      const jf=findShopper('Julissa Flores'),ji=findShopper('Julissa Illescas');
      const stats=s=>s&&typeof d.shopperStats==='function'?d.shopperStats(s.id||s.shopperId):null;
      const finance=r==='financiero'&&window.CX?.fin?.porPais?window.CX.fin.porPais(d):null;
      const liqs=r==='liquidaciones'&&window.CX?.liq?.forProject?window.CX.liq.forProject(d):null;
      const sid=String(c.shopperId||'');
      const own=kind==='shopper'&&sid&&typeof d.visitsForShopper==='function'?d.visitsForShopper(sid):[];
      const posts=kind==='shopper'&&sid?(d._posts||[]).filter(x=>String(x.shopperId||'')===sid&&String(d.recordPeriodId?d.recordPeriodId(x):(x.periodId||x.projectId)||'')===String(d.currentPeriodId||'')):[];
      const resources=window.CX?.backendResources?.list?.({projectId:d.currentProjectId,periodId:d.currentPeriodId})||[];
      const certEvidence=window.CX_TYA_CERTIFICATION_CARRYOVER_SOURCE_SAFE||{};
      return {
        route:String(window.CX?.session?.view||''),projectId:String(d.currentProjectId||''),periodId:String(d.currentPeriodId||''),sourceRevision:String(d.previewMeta?.sourceRevision||''),
        debug:!!document.getElementById('cxBackendPreviewStatus'),lab:!!document.getElementById('cx-dev-lab'),blocked:body.includes('Fuente de datos no disponible'),
        technicalVisible:/AUTH_READY|CLAIMS_READY|VISITID|HRROWID|FINANCIALSOURCESTATUS|pending_or_review|pending_source_confirmation|CXORBIA DEV\s*·\s*LABORATORIO/i.test(body),
        bodyHasDemoApproval:/Aprobado \(demo\)|Certificados \(demo\)|En progreso \(demo\)/i.test(body),
        bodyHasStaticSeed:/Escenario de evaluación|Video de inducción|Checklist/i.test(body),
        phaseGT:r==='dashboard'?phase('GT'):null,phaseHN:r==='dashboard'?phase('HN'):null,
        ranking:r==='dashboard'?{rows:ranking.length,population:population.length,missingRating:ranking.filter(x=>x.ratingAvailable===false).length}:null,
        julissa:r==='shoppers'?{flores:jf?{id:String(jf.id||jf.shopperId||''),stats:stats(jf)}:null,illescas:ji?{id:String(ji.id||ji.shopperId||''),stats:stats(ji)}:null}:null,
        finance:finance?{GT:finance.GT||null,HN:finance.HN||null}:null,
        liquidations:Array.isArray(liqs)?{count:liqs.length,GT:liqs.filter(x=>x.pais==='GT').length,HN:liqs.filter(x=>x.pais==='HN').length,paymentsConfirmed:liqs.filter(x=>x.paymentConfirmed===true).length,liquidationsConfirmed:liqs.filter(x=>x.liquidationConfirmed===true).length}:null,
        shopper:kind==='shopper'?{stats:typeof d.shopperStats==='function'?d.shopperStats(sid):null,ownCount:own.length,duplicateVisits:own.length-new Set(own.map(v=>String(v.id||v.visitId))).size,pendingPosts:posts.filter(x=>String(x.estado||x.status).toLowerCase()==='pendiente').length,paseoCayala:posts.some(x=>/paseo cayal/i.test(norm(x.sucursal||x.branch||'')))}:null,
        resources:r==='documentos'?{count:resources.length,names:resources.map(x=>String(x.n||x.name||'')),status:window.CX_BACKEND_RESOURCES_STATUS||null,storage:window.CX?.backendResources?.storageStatus?.()||null}:null,
        certification:r==='cert'?{sourceStatus:String(certEvidence.sourceStatus||''),evidenceCandidateCount:Number(certEvidence.evidenceCandidateCount||0),carryoverConfirmed:Number(certEvidence.carryoverConfirmed||0),eligibilityGranted:Number(certEvidence.eligibilityGranted||0),bank:window.CX?.certStore?.bank?.(d.currentPeriodId)||null}:null,
        mobileIdentity:(()=>{const el=document.getElementById('tbRoleIdentity');return el?{text:String(el.innerText||''),visible:getComputedStyle(el).display!=='none'}:null;})(),
        scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth
      };
    },{kind,r});
    if(pageErrors.length||info.debug||info.lab||info.blocked||info.technicalVisible||info.projectId!==projectId||info.periodId!==periodId||info.sourceRevision!==hrRevision||info.route!==r)throw new Error('FUNCTIONAL_DEFECT:'+kind+'_ROUTE_'+r+':'+JSON.stringify({pageErrors,info}));
    if(options.isMobile===true&&(info.scrollWidth>info.innerWidth+2||!info.mobileIdentity?.visible))throw new Error('VISUAL_DEFECT:'+kind+'_MOBILE_'+r+':'+JSON.stringify(info));
    if(r==='dashboard'){
      for(const [code,p] of [['GT',info.phaseGT],['HN',info.phaseHN]]){
        const e=reference?.countries?.[code];
        if(!e)throw new Error('SOURCE_FAILURE:DASHBOARD_REFERENCE_MISSING_'+code);
        if(!p||p.total!==e.total||p.asign?.[0]!==e.assigned||p.agend?.[0]!==e.scheduled||p.real?.[0]!==e.realized||p.cuest?.[0]!==e.questionnaire||p.submit?.[0]!==e.submitted||p.liq?.[0]!==e.liquidationConfirmed)throw new Error('MAPPING_FAILURE:DASHBOARD_'+code+':'+JSON.stringify({observed:p,expected:e,hrRevision}));
      }
      if(info.ranking.rows!==info.ranking.population)throw new Error('MAPPING_FAILURE:TOP_SHOPPER_SILENT_EXCLUSION:'+JSON.stringify(info.ranking));
    }
    if(r==='shoppers'){
      if(!info.julissa?.flores||!info.julissa?.illescas||info.julissa.flores.id===info.julissa.illescas.id)throw new Error('MAPPING_FAILURE:JULISSA_IDENTITY_COLLISION:'+JSON.stringify(info.julissa));
      if(Number(info.julissa.flores.stats?.total)!==6||Number(info.julissa.flores.stats?.realizadas)!==6)throw new Error('MAPPING_FAILURE:JULISSA_FLORES_STATS:'+JSON.stringify(info.julissa.flores));
    }
    if(r==='financiero'){
      for(const [code,o] of [['GT',info.finance?.GT],['HN',info.finance?.HN]]){
        const e=reference?.finance?.[code];
        if(!o||!e||Number(o.visRe)!==e.realizedCount||Number(o.honorarioDevengado)!==e.honorarioDevengado||Number(o.reemb)!==e.knownReimbursements||o.reimbursementPartial!==e.reimbursementPartial||o.margenPct!==null)throw new Error('MAPPING_FAILURE:FINANCE_'+code+':'+JSON.stringify({observed:o,expected:e,hrRevision}));
      }
    }
    if(r==='liquidaciones'){
      const e=reference?.liquidations;
      if(!e||!info.liquidations||info.liquidations.count!==e.total||info.liquidations.GT!==e.GT||info.liquidations.HN!==e.HN||info.liquidations.paymentsConfirmed!==e.paymentsConfirmed||info.liquidations.liquidationsConfirmed!==e.liquidationsConfirmed)throw new Error('MAPPING_FAILURE:LIQUIDATION_REFERENCE:'+JSON.stringify({observed:info.liquidations,expected:e,hrRevision}));
    }
    if(r==='documentos'){
      if(info.bodyHasStaticSeed)throw new Error('PERSISTENCE_FAILURE:STATIC_RESOURCE_SEED_VISIBLE');
      if(kind==='shopper'&&info.resources?.status?.status!=='ready')throw new Error('AUTH_FAILURE:SHOPPER_RESOURCE_READ_NOT_READY:'+JSON.stringify(info.resources));
    }
    if(r==='cert'){
      if(info.bodyHasDemoApproval||info.certification?.evidenceCandidateCount!==42||info.certification?.carryoverConfirmed!==0||info.certification?.eligibilityGranted!==0)throw new Error('MAPPING_FAILURE:CERTIFICATION_FALSE_AUTHORITY:'+JSON.stringify(info.certification));
    }
    if(kind==='shopper'){
      if(Number(info.shopper?.stats?.total)!==7||info.shopper?.ownCount!==7||info.shopper?.duplicateVisits!==0)throw new Error('MAPPING_FAILURE:SHOPPER_UNIVERSE:'+JSON.stringify(info.shopper));
      if(r==='misvisitas'&&(info.shopper.pendingPosts<1||info.shopper.paseoCayala!==true))throw new Error('MAPPING_FAILURE:PENDING_POSTULATION_VISIBILITY:'+JSON.stringify(info.shopper));
    }
    routeEvidence[r]=info;
  }

  if(routes.length>=2){
    await page.evaluate(r=>window.CX.router.nav(r),routes[0]);await page.waitForTimeout(200);
    await page.evaluate(r=>window.CX.router.nav(r),routes[1]);await page.waitForTimeout(200);
    await page.goBack({waitUntil:'domcontentloaded',timeout:15000}).catch(()=>{});
    await page.waitForTimeout(400);
    const backView=await page.evaluate(()=>String(window.CX?.session?.view||''));
    if(backView!==routes[0])throw new Error('FUNCTIONAL_DEFECT:BROWSER_BACK_HISTORY:'+JSON.stringify({expected:routes[0],observed:backView}));
  }

  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({projectId,periodId,hrRevision})=>{const d=window.CX?.data||{};return window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&String(d.currentProjectId||'')===projectId&&String(d.currentPeriodId||'')===periodId&&String(d.previewMeta?.sourceRevision||'')===hrRevision;},{projectId,periodId,hrRevision},{timeout:120000});
  const refresh=await page.evaluate(()=>({debug:!!document.getElementById('cxBackendPreviewStatus'),lab:!!document.getElementById('cx-dev-lab'),blocked:String(document.body?.innerText||'').includes('Fuente de datos no disponible'),view:String(window.CX?.session?.view||''),source:String(window.CX?.dataSource?.sourceRef||'')}));
  if(refresh.debug||refresh.lab||refresh.blocked)throw new Error('RELEASE_COMPOSITION_FAILURE:'+kind+'_REFRESH_REGRESSION:'+JSON.stringify(refresh));
  const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,roleIdentity:(()=>{const el=document.getElementById('tbRoleIdentity');return el?{text:String(el.innerText||''),visible:getComputedStyle(el).display!=='none'}:null;})()}));
  await ctx.close();
  return {principalFingerprint:fp(member.id),route,projectId:one.projectId,periodId:one.periodId,sourceRevision:one.sourceRevision,historyTotal:kind==='shopper'?Number(one.stats?.total||0):null,refreshPreserved:true,routes:routeEvidence,layout};
}

try{
  const preCtx=await browser.newContext({viewport:{width:1440,height:980}});
  const pre=await preCtx.newPage();
  await pre.goto(ROOT+'/?prei4='+Date.now(),{waitUntil:'networkidle',timeout:90000});
  evidence.preAuth=await assertClean(pre,'PREAUTH_DESKTOP');
  await preCtx.close();

  evidence.admin=await signInMember(admin,'admin','dashboard');
  evidence.shopper=await signInMember(shopper,'shopper','miperfil');

  const mctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const mobile=await mctx.newPage();
  await mobile.goto(ROOT+'/?prei4mobile='+Date.now(),{waitUntil:'networkidle',timeout:90000});
  const clean=await assertClean(mobile,'PREAUTH_MOBILE');
  const layout=await mobile.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,logoVisible:!![...document.querySelectorAll('img')].find(x=>/tyaconsultores\.com\/wp-content\/uploads\/2023\/05\/logo\.png/.test(String(x.src||''))&&x.getBoundingClientRect().width>0&&x.getBoundingClientRect().height>0)}));
  if(layout.scrollWidth>layout.innerWidth+2||!layout.logoVisible)throw new Error('VISUAL_DEFECT:MOBILE_LOGIN_LAYOUT:'+JSON.stringify(layout));
  evidence.mobile={...clean,layout};
  await mctx.close();

  evidence.adminMobile=await signInMember(admin,'admin','dashboard',{viewport:{width:390,height:844},isMobile:true,routes:['dashboard','postulaciones','financiero','documentos']});
  evidence.shopperMobile=await signInMember(shopper,'shopper','miperfil',{viewport:{width:390,height:844},isMobile:true,routes:['miperfil','misvisitas','documentos','cert']});

  evidence.decision='PASS_PRE_I4_FOCAL_HUMAN_BROWSER';
  fs.writeFileSync(OUT+'/browser-focal.json',JSON.stringify(evidence,null,2)+'\n');
} catch(error) {
  evidence.decision='FAIL_PRE_I4_FOCAL_HUMAN_BROWSER';
  evidence.error=String(error&&error.message||error||'unknown').slice(0,1200);
  fs.writeFileSync(OUT+'/browser-focal.json',JSON.stringify(evidence,null,2)+'\n');
  throw error;
} finally {
  await browser.close();
}
