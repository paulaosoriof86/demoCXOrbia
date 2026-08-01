import fs from 'node:fs';
import vm from 'node:vm';

const indexPath=process.argv[2]||'app/index-backend-dev.html';
const adapterPath=process.argv[3]||'app/adapters/tya-dev-entry-auth-gate-v1.js';
const authorityPath=process.argv[4]||'app/adapters/tya-protected-auth-hr-authority-bridge-v1.js';
const appPath=process.argv[5]||'app/app.js';
const watcherPath=process.argv[6]||'app/adapters/tya-live-source-refresh-watch-v2.js';
const index=fs.readFileSync(indexPath,'utf8');
const adapter=fs.readFileSync(adapterPath,'utf8');
const authority=fs.readFileSync(authorityPath,'utf8');
const app=fs.readFileSync(appPath,'utf8');
const watcher=fs.readFileSync(watcherPath,'utf8');

function assert(condition,message){ if(!condition) throw new Error(message); }

const order=[
  'core/backend-browser-auth.js',
  'adapters/tya-dev-entry-auth-gate-v1.js',
  'core/backend-firebase.js',
  'adapters/tya-protected-auth-hr-authority-bridge-v1.js',
  'core/backend-cxdata-read-guard.js',
  'app.js'
].map(marker=>({marker,pos:index.indexOf(marker)}));
for(const item of order) assert(item.pos>=0,'missing_index_marker:'+item.marker);
for(let i=1;i<order.length;i++) assert(order[i-1].pos<order[i].pos,'invalid_script_order:'+order[i-1].marker+':'+order[i].marker);

for(const marker of [
  'cxDevEntryCanonicalBootstrap','YES_PAULA_20260628_PREVIEW_DEV','YES_PAULA_20260730_PROTECTED_DEV',
  'YES_PAULA_20260731_FULL_PROFILE_DEV','YES_PAULA_20260801_REAL_USERS_E2E','cxProjectId',
  "lane:technical?'protected-technical-e2e':'source-safe-human-visual'",
  'canonicalDataRequired:{periods:14,visits:616,shoppers:208}'
]) assert(index.includes(marker),'missing_entry_bootstrap_marker:'+marker);

for(const marker of [
  "mode:'native-direct-role-entry'","visibleRoleSelector:true","usernamePasswordVisible:false","technicalAuthEnabled:false",
  'integratedFirebaseLoginDisabled:true','backendFirebaseDisabledForHumanVisual:true','hrCanonicalAuthorityPreserved:true',
  'backendCfg.enabled = false','backendCfg.humanVisualSourceSafe = true','preserveHumanDataSource',
  'validCanonicalBaseline','CX_BACKEND_PREVIEW_LANE = \'source-safe-human-visual\'',
  'YES_PAULA_20260801_REAL_USERS_E2E','cxTechnicalAuthE2E','cxTechnicalAuthNamespace',
  "mode:'technical-auth-e2e-isolated'","namespaceUserSelectable:false",'CX.backendAuth.authenticate',
  'credentialsEmbedded:false','writes:false','production:false'
]) assert(adapter.includes(marker),'missing_lane_split_marker:'+marker);

for(const forbidden of [
  'localStorage.setItem(','sessionStorage.setItem(','FIREBASE_SERVICE_ACCOUNT','console.log(password','console.log(login'
]) assert(!adapter.includes(forbidden),'forbidden_adapter_pattern:'+forbidden);

for(const marker of [
  "technicalAuthE2E=protectedRuntime&&params.get('cxTechnicalAuthE2E')==='YES_PAULA_20260801_REAL_USERS_E2E'",
  'if(technicalAuthE2E)','canonicalBaselineReady()',"CX.dataSource.status='ready'"
]) assert(watcher.includes(marker),'missing_watcher_lane_marker:'+marker);
assert(!watcher.includes("if(protectedRuntime){const reason='protected-runtime-owns-cxdata'"),'obsolete_watcher_blanket_disable_present');

for(const marker of [
  'Selecciona un perfil para entrar','data-role="admin"','data-role="cliente"','data-role="shopper"',
  'Administración / Coordinación','Portal del Cliente','Shopper / Evaluador','this.selectRole(b.dataset.role)'
]) assert(app.includes(marker),'approved_native_role_contract_missing:'+marker);

for(const marker of [
  'CX_TYA_CUMULATIVE_READ_MODEL','CX_TYA_APPLY_LIVE_SNAPSHOT','backend-ready','protected_auth_hr_restore',
  'hr-live-authority+firestore-authenticated-overlay','hrAuthority:true','protectedOverlay:true',
  'd.outputVisits !== 616','d.protectedVisitsAppended !== 0','CX_PROTECTED_AUTH_HR_AUTHORITY',
  'providerWrites:0','authWrites:0','rulesDeploys:0','production:false'
]) assert(authority.includes(marker),'missing_hr_authority_marker:'+marker);
for(const forbidden of ['setDoc(','addDoc(','updateDoc(','deleteDoc(','createUser(','setCustomUserClaims(','updateUser(','setPassword(']){
  assert(!authority.includes(forbidden),'forbidden_hr_authority_write_pattern:'+forbidden);
}

const bootstrapMatch=index.match(/<script id="cxDevEntryCanonicalBootstrap">([\s\S]*?)<\/script>/);
assert(bootstrapMatch,'entry_bootstrap_script_not_found');
const bootstrap=bootstrapMatch[1];
function runBootstrap(search,hash='',storedToken=''){
  let replaced='';
  const location={pathname:'/index-backend-dev.html',search,hash,origin:'https://cxorbia-backend-dev.web.app'};
  const history={replaceState(_a,_b,next){replaced=next;const hashAt=next.indexOf('#');const noHash=hashAt>=0?next.slice(0,hashAt):next;location.hash=hashAt>=0?next.slice(hashAt):location.hash;const q=noHash.indexOf('?');location.search=q>=0?noHash.slice(q):'';}};
  const sessionStorage={getItem(key){return key==='CXORBIA_C6_FULL_VISUAL_TOKEN'?storedToken:null;}};
  const window={};
  vm.runInNewContext(bootstrap,{window,location,history,URLSearchParams,Date,sessionStorage});
  return {location,replaced,state:window.CX_DEV_ENTRY_CANONICAL};
}

const bare=runBootstrap('');
assert(bare.location.search.includes('cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'),'bare_entry_missing_preview_token');
assert(bare.location.search.includes('cxProjectId=cinepolis'),'bare_entry_missing_project');
assert(!bare.location.search.includes('cxProtectedRuntime='),'bare_human_entry_received_protected_runtime');
assert(!bare.location.search.includes('cxTechnicalAuthE2E='),'bare_human_entry_received_technical_auth');
assert(!bare.location.search.includes('cxHumanFullVisual='),'bare_entry_full_visual_without_session');
assert(bare.state?.lane==='source-safe-human-visual'&&bare.state?.protectedRuntime===false,'bare_entry_not_canonical_human_lane');

const staleProtected=runBootstrap('?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV');
assert(!staleProtected.location.search.includes('cxProtectedRuntime='),'stale_protected_human_url_not_normalized');
assert(!staleProtected.location.search.includes('cxHumanFullVisual='),'stale_full_visual_without_session_not_removed');
assert(staleProtected.state?.lane==='source-safe-human-visual','stale_url_not_human_lane');

const visual=runBootstrap('?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV','#cxVisualSession=temporary');
assert(visual.location.search.includes('cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV'),'authorized_visual_session_not_enabled');
assert(!visual.location.search.includes('cxProtectedRuntime='),'visual_session_received_protected_runtime');

const technical=runBootstrap('?cxTechnicalAuthE2E=YES_PAULA_20260801_REAL_USERS_E2E&cxTechnicalAuthNamespace=shopper&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV');
assert(technical.location.search.includes('cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'),'technical_lane_missing_protected_runtime');
assert(technical.location.search.includes('cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'),'technical_lane_missing_preview');
assert(!technical.location.search.includes('cxHumanFullVisual='),'technical_lane_full_visual_not_removed');
assert(technical.state?.lane==='protected-technical-e2e'&&technical.state?.technicalAuth===true,'technical_lane_state_invalid');

if(indexPath.includes('/remote/')&&process.env.DEV_ROOT_URL){
  const base=String(process.env.DEV_ROOT_URL).replace(/\/$/,'');
  for(const [asset,local] of [
    ['adapters/tya-protected-auth-hr-authority-bridge-v1.js',authority],
    ['adapters/tya-live-source-refresh-watch-v2.js',watcher],
    ['app.js',app]
  ]){
    const response=await fetch(base+'/'+asset,{headers:{'cache-control':'no-cache'}});
    assert(response.ok,'remote_asset_http_'+response.status+':'+asset);
    assert(await response.text()===local,'remote_asset_mismatch:'+asset);
  }
}

console.log('PASS_C6_SEPARATED_HUMAN_DATA_AND_TECHNICAL_AUTH_LANES');
