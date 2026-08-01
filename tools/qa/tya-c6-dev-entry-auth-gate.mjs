import fs from 'node:fs';
import vm from 'node:vm';

const indexPath = process.argv[2] || 'app/index-backend-dev.html';
const adapterPath = process.argv[3] || 'app/adapters/tya-dev-entry-auth-gate-v1.js';
const index = fs.readFileSync(indexPath, 'utf8');
const adapter = fs.readFileSync(adapterPath, 'utf8');

function assert(condition, message){ if(!condition) throw new Error(message); }

const order = [
  'core/backend-browser-auth.js',
  'adapters/tya-dev-entry-auth-gate-v1.js',
  'core/backend-firebase.js',
  'app.js'
].map(marker => ({marker, pos:index.indexOf(marker)}));
for(const item of order) assert(item.pos >= 0, 'missing_index_marker:'+item.marker);
for(let i=1;i<order.length;i++) assert(order[i-1].pos < order[i].pos, 'invalid_script_order:'+order[i-1].marker+':'+order[i].marker);

for(const marker of [
  'cxDevEntryCanonicalBootstrap',
  'YES_PAULA_20260628_PREVIEW_DEV',
  'YES_PAULA_20260730_PROTECTED_DEV',
  'cxProjectId',
  'cinepolis'
]) assert(index.includes(marker), 'missing_entry_bootstrap_marker:'+marker);

for(const marker of [
  'cxDevEntryLogin',
  'cxDevEntryPassword',
  'cxDevEntrySubmit',
  'resolveNamespaces',
  'probeNamespace',
  'claimsMatch',
  'CX.backendAuth.authenticate',
  "mode:'username-password-claims-derived'",
  'visibleRoleSelector:false',
  'namespaceAutoResolution:true',
  'dualChoiceOnlyAfterCredentialValidation:true',
  'technicalStatusVisible:false',
  'firebaseAuthAuthorityPreserved:true',
  'credentialsEmbedded:false',
  'writes:false',
  'production:false'
]) assert(adapter.includes(marker), 'missing_adapter_marker:'+marker);

for(const forbidden of [
  'cxDevEntryAccessType',
  'Tipo de acceso',
  '<option value="staff"',
  '<option value="shopper"',
  'localStorage.setItem(',
  'sessionStorage.setItem(',
  'passwordStorageKey',
  'FIREBASE_SERVICE_ACCOUNT',
  'console.log(password',
  'console.log(login'
]) assert(!adapter.includes(forbidden), 'forbidden_adapter_pattern:'+forbidden);

assert(adapter.includes("document.getElementById('cxBackendPreviewStatus')"), 'technical_status_suppression_missing');
assert(adapter.includes("card.querySelectorAll('.role-btn,#goReg')"), 'generic_role_removal_missing');
assert(adapter.includes("matches.length > 1"), 'dual_identity_post_auth_branch_missing');

const bootstrapMatch = index.match(/<script id="cxDevEntryCanonicalBootstrap">([\s\S]*?)<\/script>/);
assert(bootstrapMatch, 'entry_bootstrap_script_not_found');
const bootstrap = bootstrapMatch[1];

function runBootstrap(search){
  let replaced = '';
  const location = {pathname:'/index-backend-dev.html',search,hash:'',origin:'https://cxorbia-backend-dev.web.app'};
  const history = {replaceState(_a,_b,next){replaced=next;const q=next.indexOf('?');location.search=q>=0?next.slice(q):'';}};
  const window = {};
  vm.runInNewContext(bootstrap, {window, location, history, URLSearchParams, Date});
  return {location,replaced,state:window.CX_DEV_ENTRY_CANONICAL};
}

const bare = runBootstrap('');
assert(bare.location.search.includes('cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'), 'bare_entry_missing_preview_token');
assert(bare.location.search.includes('cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'), 'bare_entry_missing_protected_token');
assert(bare.location.search.includes('cxProjectId=cinepolis'), 'bare_entry_missing_project');
assert(bare.state && bare.state.canonical === true, 'bare_entry_not_canonical');

const sourceSafe = runBootstrap('?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV');
assert(!sourceSafe.location.search.includes('cxProtectedRuntime='), 'explicit_source_safe_lane_was_overridden');

const protectedOnly = runBootstrap('?cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV');
assert(protectedOnly.location.search.includes('cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'), 'protected_entry_missing_preview_companion');
assert(protectedOnly.location.search.includes('cxProjectId=cinepolis'), 'protected_entry_missing_project');

console.log('PASS_C6_DEV_ENTRY_USERNAME_PASSWORD_CLAIMS_DERIVED_GATE');
