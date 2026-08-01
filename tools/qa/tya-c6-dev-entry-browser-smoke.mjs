import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
if(!root) throw new Error('DEV_ROOT_URL_REQUIRED');
const isLocal=/127\.0\.0\.1|localhost/i.test(root);
const stageFile=process.env.OUT_DIR?process.env.OUT_DIR+'/stage':'';
const outputFile=String(process.env.CXORBIA_HUMAN_GATE_OUTPUT||'').trim();
let checkpoint='bootstrap';
let browser=null;

function mark(name){ checkpoint=name; }
function assert(condition,message){ if(!condition) throw new Error(message); }
function safe(value){return String(value||'unknown').replace(/[^A-Za-z0-9_.:/-]+/g,'_').replace(/_+/g,'_').slice(0,220);}
function persist(error){ if(!stageFile)return; try{fs.writeFileSync(stageFile,'human_data__'+String(checkpoint).replace(/[^a-z0-9_-]+/gi,'_')+'__'+safe(error?.message||error)+'\n','utf8');}catch{} }
function writeOutput(payload){ if(!outputFile)return; fs.mkdirSync(path.dirname(outputFile),{recursive:true}); fs.writeFileSync(outputFile,JSON.stringify(payload,null,2)+'\n','utf8'); }

function loadLocalSnapshot(){
  const source=fs.readFileSync('app/data/tya-hr-source-safe-periods.js','utf8');
  const sandbox={window:{}};
  vm.runInNewContext(source,sandbox,{filename:'tya-hr-source-safe-periods.js'});
  const snapshot=sandbox.window.CX_TYA_HR_SOURCE_SAFE;
  assert(snapshot&&snapshot.sourceSafe===true,'local_snapshot_missing');
  assert(snapshot.periods?.length===14,'local_snapshot_periods_mismatch');
  assert(snapshot.visits?.length===616,'local_snapshot_visits_mismatch');
  assert(snapshot.shoppers?.length===208,'local_snapshot_shoppers_mismatch');
  return snapshot;
}

async function waitCanonical(page){
  await page.waitForFunction(()=>{
    const d=window.CX&&window.CX.data;
    const ds=window.CX&&window.CX.dataSource;
    return !!(d&&Array.isArray(d.projects)&&d.projects.length===14&&Array.isArray(d._visitas)&&d._visitas.length===616&&Array.isArray(d.shoppers)&&d.shoppers.length===208&&d.currentPeriodId&&d.currentProjectId&&ds&&ds.status==='ready');
  },{timeout:45000});
}

async function readState(page,label){
  const state=await page.evaluate((label)=>{
    const d=window.CX?.data;
    const ds=window.CX?.dataSource;
    const body=document.body?.innerText||'';
    return {
      label,
      url:location.href,
      role:window.CX?.session?.role||null,
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      periods:Array.isArray(d?.projects)?d.projects.length:-1,
      visits:Array.isArray(d?._visitas)?d._visitas.length:-1,
      shoppers:Array.isArray(d?.shoppers)?d.shoppers.length:-1,
      currentProjectId:d?.currentProjectId||null,
      currentPeriodId:d?.currentPeriodId||null,
      dataMode:ds?.mode||null,
      dataStatus:ds?.status||null,
      sourceRef:ds?.sourceRef||null,
      emptyShell:window.CX_C4_EMPTY_SHELL_STATE?.active===true,
      backendEmpty:window.CX_BACKEND_LAST_STATE?.empty===true,
      dataSourceBlocked:body.includes('Fuente de datos no disponible'),
      noProjects:body.includes('Sin proyectos disponibles'),
      noPeriods:body.includes('Sin periodos disponibles'),
      gate:window.CX_DEV_ENTRY_AUTH_GATE||null,
      canonical:window.CX_DEV_ENTRY_CANONICAL||null
    };
  },label);
  assert(state.periods===14,label+':periods_not_14');
  assert(state.visits===616,label+':visits_not_616');
  assert(state.shoppers===208,label+':shoppers_not_208');
  assert(Boolean(state.currentProjectId),label+':project_missing');
  assert(Boolean(state.currentPeriodId),label+':period_missing');
  assert(state.dataStatus==='ready',label+':datasource_not_ready:'+state.dataStatus);
  assert(state.emptyShell===false,label+':empty_shell_active');
  assert(state.backendEmpty===false,label+':backend_marked_empty');
  assert(state.dataSourceBlocked===false,label+':datasource_block_visible');
  assert(state.noProjects===false,label+':no_projects_visible');
  assert(state.noPeriods===false,label+':no_periods_visible');
  return state;
}

try{
  mark('launch');
  const executablePath=chromium.executablePath();
  assert(Boolean(executablePath)&&fs.existsSync(executablePath),'chromium_executable_missing:'+safe(executablePath));
  browser=await chromium.launch({headless:true,executablePath,chromiumSandbox:false,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();

  if(isLocal){
    const snapshot=loadLocalSnapshot();
    const revision='local-c6-14-616-208';
    await page.route('**/__/firebase/init.js',route=>route.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:"window.firebase&&firebase.apps&&!firebase.apps.length&&firebase.initializeApp({apiKey:'local-human-entry',authDomain:'localhost',projectId:'cxorbia-backend-dev',appId:'1:1:web:local'});"}));
    await page.route('**/api/tya/cinepolis/hr-live**',route=>{
      const url=new URL(route.request().url());
      const format=url.searchParams.get('format');
      if(format==='meta'){
        return route.fulfill({status:200,contentType:'application/json; charset=utf-8',body:JSON.stringify({runtimeRead:true,sourceSafe:true,revision,revisionStable:true,visits:616,periods:14,shoppers:208,tabRegistryAutoDiscovery:true,generatedAt:snapshot.generatedAt,sourceReadAt:new Date().toISOString()})});
      }
      const payload=JSON.parse(JSON.stringify(snapshot));
      payload._runtime={runtimeRead:true,sourceSafe:true,revision,revisionStable:true,sourceReadAt:new Date().toISOString()};
      return route.fulfill({status:200,contentType:'application/json; charset=utf-8',body:JSON.stringify(payload)});
    });
  }

  const errors=[];
  page.on('pageerror',error=>errors.push(String(error?.message||error)));

  mark('goto_bare');
  await page.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  mark('wait_roles');
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
  await page.waitForSelector('.role-btn[data-role="cliente"]',{state:'visible',timeout:30000});
  await page.waitForSelector('.role-btn[data-role="shopper"]',{state:'visible',timeout:30000});
  await waitCanonical(page);

  const url=new URL(page.url());
  assert(url.searchParams.get('cxBackendPreview')==='YES_PAULA_20260628_PREVIEW_DEV','canonical_preview_token_missing');
  assert(url.searchParams.get('cxProjectId')==='cinepolis','canonical_project_missing');
  assert(!url.searchParams.has('cxProtectedRuntime'),'protected_runtime_leaked_into_human_entry');
  assert(!url.searchParams.has('cxTechnicalAuthE2E'),'technical_auth_lane_leaked_into_human_entry');

  const bodyText=await page.locator('body').innerText();
  mark('assert_copy');
  assert(bodyText.includes('Selecciona un perfil para entrar'),'approved_direct_role_copy_missing');
  assert(bodyText.includes('Administración / Coordinación'),'admin_role_label_missing');
  assert(bodyText.includes('Portal del Cliente'),'client_role_label_missing');
  assert(bodyText.includes('Shopper / Evaluador'),'shopper_role_label_missing');

  mark('assert_no_credentials');
  assert(await page.locator('#cxDevEntryAuth,#cxDevEntryLogin,#cxDevEntryPassword,#cxDevEntrySubmit,#cxIntegratedAuthStep,#cxIntegratedAuthLogin,#cxIntegratedAuthPassword').count()===0,'credential_form_visible_in_human_entry');
  assert(!bodyText.includes('Ingresa con tu usuario y contraseña'),'credential_copy_visible_in_human_entry');
  assert(!bodyText.includes('Fuente de datos no disponible'),'blocked_data_source_card_visible');
  assert(await page.locator('#cxBackendPreviewStatus').count()===0,'technical_status_visible');

  mark('assert_human_lane');
  const pre=await readState(page,'before_entry');
  assert(pre.gate?.mode==='native-direct-role-entry','human_entry_gate_wrong_mode');
  assert(pre.gate?.visibleRoleSelector===true,'human_role_selector_not_preserved');
  assert(pre.gate?.usernamePasswordVisible===false,'human_entry_credentials_contract_invalid');
  assert(pre.gate?.technicalAuthEnabled===false,'technical_auth_enabled_in_human_lane');
  assert(pre.gate?.integratedFirebaseLoginDisabled===true,'integrated_firebase_login_not_disabled');
  assert(pre.gate?.backendFirebaseDisabledForHumanVisual===true,'backend_firebase_not_disabled_for_human_lane');
  assert(pre.canonical?.lane==='source-safe-human-visual','canonical_human_lane_missing');
  assert(pre.canonical?.protectedRuntime===false,'canonical_human_lane_marked_protected');

  mark('click_admin');
  await page.click('.role-btn[data-role="admin"]');
  await page.waitForFunction(()=>document.getElementById('app')?.classList.contains('on')===true,{timeout:30000});
  await waitCanonical(page);
  const first=await readState(page,'entry');
  assert(first.role==='admin','admin_direct_entry_role_mismatch');
  assert(first.appOn===true,'admin_direct_entry_failed');

  const reloads=[];
  for(let i=1;i<=3;i++){
    mark('reload_'+i);
    await page.reload({waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>document.getElementById('app')?.classList.contains('on')===true,{timeout:30000});
    await waitCanonical(page);
    const state=await readState(page,'reload_'+i);
    assert(state.role==='admin','reload_'+i+':role_not_preserved');
    assert(state.periods===first.periods&&state.visits===first.visits&&state.shoppers===first.shoppers,'reload_'+i+':canonical_counts_changed');
    assert(state.currentPeriodId===first.currentPeriodId,'reload_'+i+':period_changed');
    reloads.push(state);
  }

  const entryErrors=errors.filter(message=>/tya-dev-entry|cxDevEntry|native-direct-role-entry|empty shell|CX_DATA|source-safe-human/i.test(message));
  assert(entryErrors.length===0,'human_entry_runtime_error:'+entryErrors.join(' | '));

  const result={
    schemaVersion:'cxorbia.corte6.human-data-preservation-browser-gate.v1',
    generatedAt:new Date().toISOString(),
    decision:'PASS_C6_HUMAN_DIRECT_ROLE_AND_CANONICAL_DATA_14_616_208',
    root,
    local:isLocal,
    directRoleEntry:true,
    credentialsVisible:false,
    canonical:{periods:first.periods,visits:first.visits,shoppers:first.shoppers,currentProjectId:first.currentProjectId,currentPeriodId:first.currentPeriodId},
    reloads:reloads.map(s=>({periods:s.periods,visits:s.visits,shoppers:s.shoppers,currentProjectId:s.currentProjectId,currentPeriodId:s.currentPeriodId,dataStatus:s.dataStatus,emptyShell:s.emptyShell})),
    emptyShell:false,
    dataSourceBlocked:false,
    protectedRuntimeInHumanLane:false,
    technicalAuthInHumanLane:false,
    writes:false,
    production:false
  };
  writeOutput(result);
  mark('pass');
  await browser.close();
  browser=null;
  console.log('PASS_C6_HUMAN_DIRECT_ROLE_AND_CANONICAL_DATA_14_616_208');
}catch(error){
  persist(error);
  try{if(browser)await browser.close();}catch{}
  console.error('FAIL_C6_HUMAN_DATA_PRESERVATION checkpoint='+checkpoint+' error='+(error?.message||String(error)));
  throw error;
}
