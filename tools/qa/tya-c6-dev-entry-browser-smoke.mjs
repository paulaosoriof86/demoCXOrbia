import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
const isLocal=/127\.0\.0\.1|localhost/i.test(root);
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const stageFile=process.env.OUT_DIR?process.env.OUT_DIR+'/stage':'';
const outputFile=String(process.env.CXORBIA_HUMAN_GATE_OUTPUT||'').trim();
let checkpoint='bootstrap',browser=null;

const mark=x=>{checkpoint=x;};
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const safe=v=>String(v||'unknown').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').replace(/_+/g,'_').slice(0,1400);
function persist(error){if(stageFile)try{fs.writeFileSync(stageFile,'human_data__'+safe(checkpoint)+'__'+safe(error?.message||error)+'\n','utf8');}catch{}}
function output(value){if(outputFile){fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');}}

async function state(page,label){
  return page.evaluate(label=>{
    const d=window.CX?.data,ds=window.CX?.dataSource;
    const view=document.getElementById('view')?.innerText||'';
    const rail=document.getElementById('rail')?.innerText||'';
    const app=document.getElementById('app'),login=document.getElementById('login');
    let stored=null;try{stored=JSON.parse(localStorage.getItem('cx_session')||'null');}catch{}
    let programs=-1,periodsForCurrent=-1,visibleProjects=-1;
    try{programs=window.CX?.data?.programs?.().length??-1;}catch{}
    try{periodsForCurrent=window.CX?.data?.periodsForProgram?.(window.CX?.data?.currentProjectId)?.length??-1;}catch{}
    try{visibleProjects=window.CX?.router?.resolveVisibleProjects?.(window.CX?.session?.role)?.length??-1;}catch{}
    return {
      label,url:location.href,role:window.CX?.session?.role||null,storedRole:stored?.role||null,
      appOn:app?.classList.contains('on')===true,loginHidden:login?.classList.contains('hidden')===true,
      periods:Array.isArray(d?.projects)?d.projects.length:-1,visits:Array.isArray(d?._visitas)?d._visitas.length:-1,
      shoppers:Array.isArray(d?.shoppers)?d.shoppers.length:-1,currentProjectId:d?.currentProjectId||null,currentPeriodId:d?.currentPeriodId||null,
      programs,periodsForCurrent,visibleProjects,
      dataStatus:ds?.status||null,dataMode:ds?.mode||null,sourceRef:ds?.sourceRef||null,
      emptyShell:window.CX_C4_EMPTY_SHELL_STATE?.active===true,backendEmpty:window.CX_BACKEND_LAST_STATE?.empty===true,
      blockedVisible:view.includes('Fuente de datos no disponible'),
      noProjectsVisible:view.includes('Sin proyectos disponibles')||rail.includes('Sin proyectos disponibles'),
      noPeriodsVisible:rail.includes('Sin periodos disponibles'),
      viewExcerpt:view.replace(/\s+/g,' ').trim().slice(0,260),
      railExcerpt:rail.replace(/\s+/g,' ').trim().slice(0,420),
      gateVersion:window.CX_DEV_ENTRY_AUTH_GATE?.version||null,
      continuity:window.CX_HUMAN_SESSION_CONTINUITY||null,
      primed:window.CX_HUMAN_SESSION_PRIMED||null,
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      canonicalProtected:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true
    };
  },label);
}
function validate(s,label){
  assert(s.periods===14,label+':periods='+s.periods);assert(s.visits===616,label+':visits='+s.visits);assert(s.shoppers===208,label+':shoppers='+s.shoppers);
  assert(s.currentProjectId&&s.currentPeriodId,label+':context_missing');assert(s.dataStatus==='ready',label+':status='+s.dataStatus);
  assert(!s.emptyShell,label+':empty_shell');assert(!s.backendEmpty,label+':backend_empty');assert(!s.blockedVisible,label+':blocked_visible');
  assert(!s.noProjectsVisible,label+':no_projects_visible');assert(!s.noPeriodsVisible,label+':no_periods_visible');
}
async function waitCanonical(page,label){try{await page.waitForFunction(()=>{const d=window.CX?.data,ds=window.CX?.dataSource;return d?.projects?.length===14&&d?._visitas?.length===616&&d?.shoppers?.length===208&&d.currentProjectId&&d.currentPeriodId&&ds?.status==='ready';},{timeout:60000});}catch{throw new Error(label+':canonical_timeout:'+JSON.stringify(await state(page,label)));}}
async function waitApp(page,label){try{await page.waitForFunction(()=>document.getElementById('app')?.classList.contains('on')===true,{timeout:60000});}catch{throw new Error(label+':app_timeout:'+JSON.stringify(await state(page,label)));}}
async function diagnoseVisibleShell(page,label,before){
  if(!before.noProjectsVisible&&!before.noPeriodsVisible)return;
  const mountResult=await page.evaluate(()=>{try{window.CX?.router?.mount?.();return {ok:true};}catch(error){return {ok:false,error:String(error?.message||error)};}});
  await page.waitForTimeout(150);
  const after=await state(page,label+'_manual_mount_probe');
  const compact=s=>({role:s.role,storedRole:s.storedRole,periods:s.periods,visits:s.visits,shoppers:s.shoppers,currentProjectId:s.currentProjectId,currentPeriodId:s.currentPeriodId,programs:s.programs,periodsForCurrent:s.periodsForCurrent,visibleProjects:s.visibleProjects,dataStatus:s.dataStatus,emptyShell:s.emptyShell,backendEmpty:s.backendEmpty,noProjectsVisible:s.noProjectsVisible,noPeriodsVisible:s.noPeriodsVisible,view:s.viewExcerpt,rail:s.railExcerpt,gateVersion:s.gateVersion,continuity:s.continuity,primed:s.primed});
  throw new Error(label+':visible_shell_probe:'+JSON.stringify({before:compact(before),mountResult,after:compact(after)}));
}

try{
  mark('launch');const executablePath=chromium.executablePath();assert(executablePath&&fs.existsSync(executablePath),'chromium_missing');
  browser=await chromium.launch({headless:true,executablePath,chromiumSandbox:false,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});const page=await context.newPage();
  if(isLocal){
    await page.route('**/__/firebase/init.js',r=>r.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:"window.firebase&&firebase.apps&&!firebase.apps.length&&firebase.initializeApp({apiKey:'local-human-entry',authDomain:'localhost',projectId:'cxorbia-backend-dev',appId:'1:1:web:local'});"}));
    await page.route('**/api/tya/cinepolis/hr-live**',async r=>{const u=new URL(r.request().url());const res=await fetch(remoteRoot+'/api/tya/cinepolis/hr-live'+u.search,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});await r.fulfill({status:res.status,headers:{'content-type':res.headers.get('content-type')||'application/json; charset=utf-8','cache-control':'no-store'},body:Buffer.from(await res.arrayBuffer())});});
  }
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
  mark('goto');await page.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  for(const role of ['admin','cliente','shopper'])await page.waitForSelector(`.role-btn[data-role="${role}"]`,{state:'visible',timeout:30000});
  await waitCanonical(page,'before_entry');const before=await state(page,'before_entry');await diagnoseVisibleShell(page,'before_entry',before);validate(before,'before_entry');
  const url=new URL(page.url());assert(url.searchParams.get('cxBackendPreview')==='YES_PAULA_20260628_PREVIEW_DEV','preview_missing');assert(url.searchParams.get('cxProjectId')==='cinepolis','project_missing');
  assert(!url.searchParams.has('cxProtectedRuntime')&&!url.searchParams.has('cxTechnicalAuthE2E'),'technical_lane_leaked');
  const body=await page.locator('body').innerText();assert(body.includes('Selecciona un perfil para entrar'),'role_copy_missing');assert(body.includes('Administración / Coordinación')&&body.includes('Portal del Cliente')&&body.includes('Shopper / Evaluador'),'role_labels_missing');
  assert(await page.locator('#cxDevEntryAuth,#cxIntegratedAuthStep,#cxIntegratedAuthLogin,#cxIntegratedAuthPassword').count()===0,'credentials_visible');
  assert(before.canonicalLane==='source-safe-human-visual'&&!before.canonicalProtected,'canonical_lane_invalid');

  mark('click_admin');await page.click('.role-btn[data-role="admin"]');await waitApp(page,'entry');await waitCanonical(page,'entry');const first=await state(page,'entry');await diagnoseVisibleShell(page,'entry',first);validate(first,'entry');
  assert(first.role==='admin'&&first.storedRole==='admin','admin_session_not_saved:'+JSON.stringify(first));
  const reloads=[];
  for(let i=1;i<=3;i++){
    mark('reload_'+i);await page.reload({waitUntil:'domcontentloaded',timeout:60000});await waitCanonical(page,'reload_'+i);await waitApp(page,'reload_'+i);
    const s=await state(page,'reload_'+i);await diagnoseVisibleShell(page,'reload_'+i,s);validate(s,'reload_'+i);assert(s.role==='admin'&&s.storedRole==='admin','reload_'+i+':session_not_preserved:'+JSON.stringify(s));assert(s.currentPeriodId===first.currentPeriodId,'reload_'+i+':period_changed');reloads.push(s);
  }
  const relevant=errors.filter(m=>/tya-dev-entry|cxDevEntry|native-direct-role-entry|empty shell|CX_DATA|source-safe-human/i.test(m));assert(!relevant.length,'runtime_errors:'+relevant.join('|'));
  const result={schemaVersion:'cxorbia.corte6.human-data-preservation-browser-gate.v1',generatedAt:new Date().toISOString(),decision:'PASS_C6_HUMAN_DIRECT_ROLE_AND_CANONICAL_DATA_14_616_208',root,local:isLocal,directRoleEntry:true,credentialsVisible:false,canonical:{periods:first.periods,visits:first.visits,shoppers:first.shoppers,currentProjectId:first.currentProjectId,currentPeriodId:first.currentPeriodId},reloads:reloads.map(s=>({periods:s.periods,visits:s.visits,shoppers:s.shoppers,currentProjectId:s.currentProjectId,currentPeriodId:s.currentPeriodId,dataStatus:s.dataStatus,emptyShell:s.emptyShell,role:s.role})),emptyShell:false,dataSourceBlocked:false,protectedRuntimeInHumanLane:false,technicalAuthInHumanLane:false,writes:false,production:false};
  output(result);mark('pass');await browser.close();browser=null;console.log('PASS_C6_HUMAN_DIRECT_ROLE_AND_CANONICAL_DATA_14_616_208');
}catch(error){persist(error);try{if(browser)await browser.close();}catch{}console.error('FAIL_C6_HUMAN_DATA_PRESERVATION checkpoint='+checkpoint+' error='+(error?.message||String(error)));throw error;}
