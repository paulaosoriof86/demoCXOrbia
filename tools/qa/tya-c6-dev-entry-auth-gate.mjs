import fs from 'node:fs';
import vm from 'node:vm';

const indexPath=process.argv[2]||'app/index-backend-dev.html';
const adapterPath=process.argv[3]||'app/adapters/tya-dev-entry-auth-gate-v1.js';
const authorityPath=process.argv[4]||'app/adapters/tya-protected-auth-hr-authority-bridge-v1.js';
const appPath=process.argv[5]||'app/app.js';
const index=fs.readFileSync(indexPath,'utf8');
const adapter=fs.readFileSync(adapterPath,'utf8');
const authority=fs.readFileSync(authorityPath,'utf8');
const app=fs.readFileSync(appPath,'utf8');

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
  'YES_PAULA_20260731_FULL_PROFILE_DEV','cxProjectId','cxHumanFullVisual','cinepolis'
]) assert(index.includes(marker),'missing_entry_bootstrap_marker:'+marker);

for(const marker of [
  "mode:'native-direct-role-entry'","visibleRoleSelector:true","usernamePasswordVisible:false","technicalAuthEnabled:false",
  'YES_PAULA_20260801_REAL_USERS_E2E','cxTechnicalAuthE2E','cxTechnicalAuthNamespace',
  "mode:'technical-auth-e2e-isolated'","namespaceUserSelectable:false",'CX.backendAuth.authenticate',
  'credentialsEmbedded:false','writes:false','production:false'
]) assert(adapter.includes(marker),'missing_lane_split_marker:'+marker);

for(const forbidden of [
  'localStorage.setItem(','sessionStorage.setItem(','FIREBASE_SERVICE_ACCOUNT','console.log(password','console.log(login'
]) assert(!adapter.includes(forbidden),'forbidden_adapter_pattern:'+forbidden);

for(const marker of [
  'Selecciona un perfil para entrar','data-role="admin"','data-role="cliente"','data-role="shopper"',
  'Administración / Coordinación','Portal del Cliente','Shopper / Evaluador','this.selectRole(b.dataset.role)'
]) assert(app.includes(marker),'approved_native_role_contract_missing:'+marker);

assert(!adapter.includes("mode:'username-password-claims-derived'"),'obsolete_default_credential_mode_present');
assert(adapter.includes("if(!technicalAuthEnabled)"),'human_lane_guard_missing');
assert(adapter.includes('setHumanLaneState();'),'human_lane_state_missing');
assert(adapter.includes('patchTechnicalLane'),'technical_lane_patch_missing');

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
function runBootstrap(search){
  let replaced='';
  const location={pathname:'/index-backend-dev.html',search,hash:'',origin:'https://cxorbia-backend-dev.web.app'};
  const history={replaceState(_a,_b,next){replaced=next;const q=next.indexOf('?');location.search=q>=0?next.slice(q):'';}};
  const window={};
  vm.runInNewContext(bootstrap,{window,location,history,URLSearchParams,Date});
  return {location,replaced,state:window.CX_DEV_ENTRY_CANONICAL};
}

const bare=runBootstrap('');
assert(bare.location.search.includes('cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'),'bare_entry_missing_preview_token');
assert(bare.location.search.includes('cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'),'bare_entry_missing_protected_token');
assert(bare.location.search.includes('cxProjectId=cinepolis'),'bare_entry_missing_project');
assert(bare.location.search.includes('cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV'),'bare_entry_missing_full_visual');
assert(!bare.location.search.includes('cxTechnicalAuthE2E='),'bare_human_entry_received_technical_auth_token');
assert(bare.state?.canonical===true&&bare.state?.fullVisual===true,'bare_entry_not_canonical_full_visual');

const sourceSafe=runBootstrap('?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV');
assert(!sourceSafe.location.search.includes('cxProtectedRuntime='),'explicit_source_safe_lane_overridden');

if(indexPath.includes('/remote/')&&process.env.DEV_ROOT_URL){
  const base=String(process.env.DEV_ROOT_URL).replace(/\/$/,'');
  for(const [asset,local] of [
    ['adapters/tya-protected-auth-hr-authority-bridge-v1.js',authority],
    ['app.js',app]
  ]){
    const response=await fetch(base+'/'+asset,{headers:{'cache-control':'no-cache'}});
    assert(response.ok,'remote_asset_http_'+response.status+':'+asset);
    assert(await response.text()===local,'remote_asset_mismatch:'+asset);
  }
}

console.log('PASS_C6_SPLIT_HUMAN_ROLE_AND_TECHNICAL_AUTH_ENTRY_GATE');
