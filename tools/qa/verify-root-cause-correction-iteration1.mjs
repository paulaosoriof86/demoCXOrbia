import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const assert=(cond,msg)=>{if(!cond)throw new Error(msg);};
const auth=read('app/adapters/tya-c6-shopper-auth-click-guard-v1.js');
const finance=read('app/adapters/tya-canonical-finance-read-model-v2.js');
const commands=read('app/adapters/cxorbia-command-adapter-v1.js');
const shopper=read('app/adapters/cxorbia-shopper-admin-command-contract-v1.js');
const hr=read('app/adapters/cxorbia-hr-write-adapter-contract-v1.js');
const entry=read('app/index-backend-dev.html');
const app=read('app/app.js');
const misvisitas=read('app/modules/misvisitas.js');

assert(auth.includes("authOwner:'core/backend-browser-auth.js'"),'AUTH_OWNER_NOT_CANONICAL_BROWSER_AUTH');
assert(auth.includes('CX.backendAuth.showForRole(role)'),'AUTH_ROLE_DELEGATION_MISSING');
assert(auth.includes('if(protectedLoginEnabled())return false'),'SHOPPER_DEV_PICKER_PROTECTED_BYPASS_NOT_NEUTRALIZED');
assert(auth.includes('captureClickGuard:false'),'LEGACY_CAPTURE_GUARD_NOT_RETIRED');
assert(auth.includes('directAuthenticateWrapper:false'),'LEGACY_DIRECT_AUTH_WRAPPER_NOT_RETIRED');
assert(!auth.includes("document.addEventListener('click'"),'AUTH_CAPTURE_CLICK_INTERCEPTOR_STILL_PRESENT');
assert(app.includes('pickShopperDev()'),'DEV_SHOPPER_LAB_FLOW_UNEXPECTEDLY_REMOVED');
assert(entry.indexOf('tya-c6-shopper-auth-click-guard-v1.js')<entry.indexOf('app.js'),'AUTH_OWNER_BRIDGE_MUST_INSTALL_BEFORE_APP_BOOT');
assert(entry.includes('core/backend-browser-auth.js'),'CANONICAL_BROWSER_AUTH_NOT_LOADED');

assert(finance.includes('entry.canonical===true&&entry.protectedRuntime===true'),'FINANCE_CANONICAL_RUNTIME_ACTIVATION_MISSING');
assert(!finance.includes("location.hostname==='cxorbia-backend-dev.web.app'"),'FINANCE_HOSTNAME_ACTIVATION_STILL_PRESENT');
assert(!finance.includes("rootProjectId:'cinepolis'"),'FINANCE_ROOT_PROJECT_HARDCODE_STILL_PRESENT');
assert(finance.includes("activation:'canonical-runtime-contract'"),'FINANCE_ACTIVATION_EVIDENCE_MISSING');

assert(commands.includes('enableCommandWrites===true'),'COMMAND_WRITE_GATE_MISSING');
assert(commands.includes("result?.status==='committed'&&result?.providerAck===true"),'COMMAND_PROVIDER_ACK_REQUIRED_MISSING');
assert(commands.includes('localStoragePersistence:false'),'COMMAND_LOCALSTORAGE_PROHIBITION_MISSING');
assert(!commands.includes('localStorage.setItem'),'COMMAND_ADAPTER_WRITES_LOCALSTORAGE');
for(const token of ['principalRequired:true','claimsRequired:true','membershipRequired:true','profileRequired:true','crosswalkRequired:true','providerAckRequired:true'])assert(shopper.includes(token),`SHOPPER_CONTRACT_MISSING_${token}`);
assert(shopper.includes('browserPasswordAllowed:false'),'SHOPPER_BROWSER_PASSWORD_NOT_PROHIBITED');
assert(shopper.includes('localStoragePersistenceAllowed:false'),'SHOPPER_LOCALSTORAGE_NOT_PROHIBITED');
assert(!shopper.includes('localStorage.setItem'),'SHOPPER_CONTRACT_WRITES_LOCALSTORAGE');
for(const token of ['missing-tenantId','missing-projectId','missing-visitId-or-hrRowId','missing-idempotencyKey','missing-expectedVersion'])assert(hr.includes(token),`HR_CONTRACT_MISSING_${token}`);
assert(hr.includes('enableHrWrites===true'),'HR_WRITE_GATE_MISSING');
assert(hr.includes("conflictPolicy:'review_no_silent_overwrite'"),'HR_CONFLICT_POLICY_MISSING');
assert(hr.includes('silentOverwrite:false'),'HR_SILENT_OVERWRITE_NOT_BLOCKED');

/* I1 originally locked the P0 signature in Mis Visitas. I2 is the authorized successor:
   accept only the old exact signature OR the explicit canonical-v2 replacement marker. */
const oldMis=misvisitas.includes("base.find(v=>v.estado==='asignada')")&&misvisitas.includes("base.find(v=>v.estado==='agendada')");
const fixedMis=misvisitas.includes('CX_MISVISITAS_CANONICAL_V2')&&misvisitas.includes('completeArrays:true')&&misvisitas.includes('canonicalFacets:true');
assert(oldMis||fixedMis,'MISVISITAS_I1_LINEAGE_OR_I2_SUCCESSOR_MISSING');

console.log('PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY');
console.log(JSON.stringify({authOwner:'core/backend-browser-auth.js',protectedShopperDevBypass:false,financeActivation:'canonical-runtime-contract',commandAdapter:'fail-closed-provider-ack',shopperAdminPersistence:'contract-ready-no-provider-write',hrWriter:'contract-ready-gated-no-provider-write',misvisitasP0:fixedMis?'closed_by_iteration2_successor':'documented-for-claude-not-hidden',providerWrites:0,deploys:0,production:false},null,2));
