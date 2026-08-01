import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
if(!root) throw new Error('DEV_ROOT_URL_REQUIRED');
const isLocal=/127\.0\.0\.1|localhost/i.test(root);
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const stageFile=process.env.OUT_DIR?process.env.OUT_DIR+'/stage':'';
const outputFile=String(process.env.CXORBIA_HUMAN_GATE_OUTPUT||'').trim();
let checkpoint='bootstrap';
let browser=null;

const mark=name=>{checkpoint=name;};
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const safe=value=>String(value||'unknown').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').replace(/_+/g,'_').slice(0,700);
function persist(error){if(!stageFile)return;try{fs.writeFileSync(stageFile,'human_data__'+safe(checkpoint)+'__'+safe(error?.message||error)+'\n','utf8');}catch{}}
function writeOutput(payload){if(!outputFile)return;fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,JSON.stringify(payload,null,2)+'\n','utf8');}

async function snapshot(page,label){
  return page.evaluate(label=>{
    const d=window.CX?.data,ds=window.CX?.dataSource,body=document.body?.innerText||'';
    let stored=null;try{stored=JSON.parse(localStorage.getItem('cx_session')||'null');}catch{}
    return {
      label,url:location.href,readyState:document.readyState,
      role:window.CX?.session?.role||null,storedRole:stored?.role||null,
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
      periods:Array.isArray(d?.projects)?d.projects.length:-1,
      visits:Array.isArray(d?._visitas)?d._visitas.length:-1,
      shoppers:Array.isArray(d?.shoppers)?d.shoppers.length:-1,
      currentProjectId:d?.currentProjectId||null,currentPeriodId:d?.currentPeriodId||null,
      dataMode:ds?.mode||null,dataStatus:ds?.status||null,sourceRef:ds?.sourceRef||null,
      emptyShell:window.CX_C4_EMPTY_SHELL_STATE?.active===true,
      backendEmpty:window.CX_BACKEND_LAST_STATE?.empty===true,
      blocked:body.includes('Fuente de datos no disponible'),
      noProjects:body.includes('Sin proyectos disponibles'),noPeriods:body.includes('Sin periodos disponibles'),
      gate:window.CX_DEV_ENTRY_AUTH_GATE||null,
      canonical:window.CX_DEV_ENTRY_CANONICAL||null,
      continuity:window.CX_HUMAN_SESSION_CONTINUITY||null
    };
  },label);
}

function validateCanonical(s,label){
  assert(s.periods===14,label+':periods='+s.periods);
  assert(s.visits===616,label+':visits='+s.visits);
  assert(s.shoppers===208,label+':shoppers='+s.shoppers);
  assert(Boolean(s.currentProjectId),label+':project_missing');
  assert(Boolean(s.currentPeriodId),label+':period_missing');
  assert(s.dataStatus==='ready',label+':datasource='+s.dataStatus);
  assert(s.emptyShell===false,label+':empty_shell');
  assert(s.backendEmpty===false,label+':backend_empty');
  assert(s.blocked===false,label+':datasource_block');
  assert(s.noProjects===false,label+':no_projects');
  assert(s.noPeriods===false,label+':no_periods');
}

async function waitCanonical(page,label){
  try{
    await page.waitForFunction(()=>{
      const d=window.CX?.data,ds=window.CX?.dataSource;
      return d?.projects?.length===14&&d?._visitas?.length===616&&d?.shoppers?.length===208&&d.currentProjectId&&d.currentPeriodId&&ds?.status==='ready';
    },{timeout:60000});
  }catch(error){
    const s=await snapshot(page,label+'_canonical_timeout');
    throw new Error(label+':canonical_timeout:'+JSON.stringify(s));
  }
}

async function waitAppOn(page,label){
  try{
    await page.waitForFunction(()=>document.getElementById('app')?.classList.contains('on')===true,{timeout:60000});
  }catch(error){
    const s=await snapshot(page,label+'_app_timeout');
    throw new Error(label+':app_timeout:'+JSON.stringify(s));
  }
}

try{
  mark('launch');
  const executablePath=chromium.executablePath();
  assert(executablePath&&fs.existsSync(executablePath),'chromium_missing:'+executablePath);
  browser=await chromium.launch({headless:true,executablePath,chromiumSandbox:false,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();

  if(isLocal){
    await page.route('**/__/firebase/init.js',route=>route.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:"window.firebase&&firebase.apps&&!firebase.apps.length&&firebase.initializeApp({apiKey:'local-human-entry',authDomain:'localhost',projectId:'cxorbia-backend-dev',appId:'1:1:web:local'});"}));
    await page.route('**/api/tya/cinepolis/hr-live**',async route=>{
      const incoming=new URL(route.request().url());
      const response=await fetch(remoteRoot+'/api/tya/cinepolis/hr-live'+incoming.search,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});
      await route.fulfill({status:response.status,headers:{'content-type':response.headers.get('content-type')||'application/json; charset=utf-8','cache-control':'no-store'},body:Buffer.from(await response.arrayBuffer())});
    });
  }

  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
  mark('goto');
  await page.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
  await page.waitForSelector('.role-btn[data-role="cliente"]',{state:'visible',timeout:30000});
  await page.waitForSelector('.role-btn[data-role="shopper"]',{state:'visible',timeout:30000});
  await waitCanonical(page,'before_entry');
  const before=await snapshot(page,'before_entry');validateCanonical(before,'before_entry');

  const url=new URL(page.url());
  assert(url.searchParams.get('cxBackendPreview')==='YES_PAULA_20260628_PREVIEW_DEV','preview_token_missing');
  assert(url.searchParams.get('cxProjectId')==='cinepolis','project_missing');
  assert(!url.searchParams.has('cxProtectedRuntime'),'protected_runtime_in_human');
  assert(!url.searchParams.has('cxTechnicalAuthE2E'),'technical_auth_in_human');
  const text=await page.locator('body').innerText();
  assert(text.includes('Selecciona un perfil para entrar'),'role_copy_missing');
  assert(text.includes('Administración / Coordinación')&&text.includes('Portal del Cliente')&&text.includes('Shopper / Evaluador'),'role_labels_missing');
  assert(await page.locator('#cxDevEntryAuth,#cxIntegratedAuthStep,#cxIntegratedAuthLogin,#cxIntegratedAuthPassword').count()===0,'credentials_visible');
  assert(before.gate?.mode==='native-direct-role-entry'&&before.gate?.technicalAuthEnabled===false,'human_gate_invalid');
  assert(before.canonical?.lane==='source-safe-human-visual'&&before.canonical?.protectedRuntime===false,'canonical_lane_invalid');

  mark('click_admin');
  await page.click('.role-btn[data-role="admin"]');
  await waitAppOn(page,'entry');
  await waitCanonical(page,'entry');
  const first=await snapshot(page,'entry');validateCanonical(first,'entry');
  assert(first.role==='admin'&&first.storedRole==='admin','admin_session_not_saved:'+JSON.stringify(first));

  const reloads=[];
  for(let i=1;i<=3;i++){
    mark('reload_'+i);
    await page.reload({waitUntil:'domcontentloaded',timeout:60000});
    await waitCanonical(page,'reload_'+i);
    await waitAppOn(page,'reload_'+i);
    const state=await snapshot(page,'reload_'+i);validateCanonical(state,'reload_'+i);
    assert(state.role==='admin'&&state.storedRole==='admin','reload_'+i+':session_not_preserved:'+JSON.stringify(state));
    assert(state.currentPeriodId===first.currentPeriodId,'reload_'+i+':period_changed');
    reloads.push(state);
  }

  const relevantErrors=pageErrors.filter(m=>/tya-dev-entry|cxDevEntry|native-direct-role-entry|empty shell|CX_DATA|source-safe-human/i.test(m));
  assert(relevantErrors.length===0,'runtime_errors:'+relevantErrors.join('|'));
  const result={schemaVersion:'cxorbia.corte6.human-data-preservation-browser-gate.v1',generatedAt:new Date().toISOString(),decision:'PASS_C6_HUMAN_DIRECT_ROLE_AND_CANONICAL_DATA_14_616_208',root,local:isLocal,directRoleEntry:true,credentialsVisible:false,canonical:{periods:first.periods,visits:first.visits,shoppers:first.shoppers,currentProjectId:first.currentProjectId,currentPeriodId:first.currentPeriodId},reloads:reloads.map(s=>({periods:s.periods,visits:s.visits,shoppers:s.shoppers,currentProjectId:s.currentProjectId,currentPeriodId:s.currentPeriodId,dataStatus:s.dataStatus,emptyShell:s.emptyShell,role:s.role})),emptyShell:false,dataSourceBlocked:false,protectedRuntimeInHumanLane:false,technicalAuthInHumanLane:false,writes:false,production:false};
  writeOutput(result);
  mark('pass');await browser.close();browser=null;
  console.log('PASS_C6_HUMAN_DIRECT_ROLE_AND_CANONICAL_DATA_14_616_208');
}catch(error){
  persist(error);try{if(browser)await browser.close();}catch{}
  console.error('FAIL_C6_HUMAN_DATA_PRESERVATION checkpoint='+checkpoint+' error='+(error?.message||String(error)));throw error;
}
