#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(path,'utf8');
const expected=[
  'shopperId','legacyShopperId','legacyId','externalShopperId','externalId',
  'sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'
];
const checks=[];
const check=(id,pass,detail='')=>checks.push({id,pass:Boolean(pass),detail});

const contractSource=read('app/adapters/cxorbia-exact-identity-contract-v1.js');
const sandbox={};
vm.runInNewContext(contractSource,sandbox,{timeout:2000});
const contract=sandbox.CX_EXACT_IDENTITY_CONTRACT;
check('contract_loads',Boolean(contract&&contract.version==='cxorbia-exact-identity-contract-v1'));
check('contract_exact_technical_keys',JSON.stringify(contract?.technicalKeys||[])===JSON.stringify(expected));
check('contract_forbids_similarity_keys',Array.isArray(contract?.forbiddenMatchKeys)&&['nombre','email','phone','username'].every(k=>contract.forbiddenMatchKeys.includes(k)));

const activation=read('tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v1.mjs');
const techMatch=activation.match(/const TECH_KEYS=(\[[^;]+\]);/);
let activationKeys=[];
if(techMatch){try{activationKeys=vm.runInNewContext(techMatch[1],{}, {timeout:1000});}catch{}}
check('auth_activation_same_key_universe',JSON.stringify(activationKeys)===JSON.stringify(expected));
check('auth_claim_uses_canonical_profile_id',activation.includes('desiredClaims:canonicalClaims(profile.id)')&&activation.includes("const canonicalClaims=(shopperId"));

const composer=read('app/adapters/tya-cumulative-read-model-v2.js');
check('runtime_composer_consumes_shared_contract',composer.includes('CX_EXACT_IDENTITY_CONTRACT')&&composer.includes('buildCanonicalProfileIndex'));
check('runtime_composer_surfaces_contract_diagnostics',composer.includes('identityContractVersion')&&composer.includes('canonicalProfileIndexConflicts'));

const portal=read('app/adapters/tya-canonical-shopper-portal-v2.js');
check('shopper_portal_consumes_shared_contract',portal.includes('CX_EXACT_IDENTITY_CONTRACT')&&portal.includes('collectExactValues'));
check('shopper_portal_no_name_email_match',!portal.includes("aliases.some(a=>tokens.has(a))&&s.nombre")&&!portal.includes('row.email===')&&!portal.includes('row.nombre==='));

const entry=read('app/index-backend-dev.html');
check('human_entry_loads_contract_before_composer',entry.indexOf('adapters/cxorbia-exact-identity-contract-v1.js')>=0&&entry.indexOf('adapters/cxorbia-exact-identity-contract-v1.js')<entry.indexOf('adapters/tya-cumulative-read-model-v2.js'));
check('human_entry_no_bundled_hr_snapshot',!entry.includes('data/tya-hr-source-safe-periods.js'));
check('human_entry_no_source_safe_preview_mutator',!entry.includes('core/tya-phase-a-source-safe-preview.js'));
check('human_entry_declares_no_preauth_operational_data',entry.includes("preAuthOperationalData:'none'"));

const watcher=read('app/adapters/tya-live-source-refresh-watch-v2.js');
check('human_live_hr_waits_for_auth',watcher.includes('authenticated_human_context_required')&&watcher.includes('canonicalHumanAuthReady'));
check('human_live_hr_restarts_after_auth',watcher.includes("CX.bus.on('backend-auth-ready'"));

const realE2E=read('tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs');
const realBranchMarker="}else{\n  ensure(authorization==='YES_SOURCE_APPROVED_REAL_READONLY_E2E'";
const realMarkerIndex=realE2E.indexOf(realBranchMarker);
const realExecution=realMarkerIndex>=0?realE2E.slice(realMarkerIndex):'';
check('real_e2e_executable_branch_detected',Boolean(realExecution));
check('real_e2e_does_not_use_select_role',!realExecution.includes('CX.app.selectRole(')&&!realExecution.includes('window.CX.app.selectRole('));
check('real_e2e_requires_auth_hr_identity_history',realExecution.includes('backendAuth?.context?.()')&&realExecution.includes('CX_PROTECTED_AUTH_HR_AUTHORITY')&&realExecution.includes('__identityMap')&&realExecution.includes('visitsForShopper'));
check('real_e2e_explicit_execution_gate',realExecution.includes('YES_SOURCE_APPROVED_REAL_READONLY_E2E')&&realExecution.includes('PRIVATE_E2E_CREDENTIALS_REQUIRED'));

if(contract?.buildCanonicalProfileIndex){
  const index=contract.buildCanonicalProfileIndex(
    [{id:'profile-1',shopperId:'profile-1'},{id:'profile-2',shopperId:'profile-2',externalId:'shared'}],
    [{shopperId:'profile-1',sourceKey:'hr-anchor-1'}]
  );
  const linked=index.resolve({sourceKey:'hr-anchor-1'});
  const ambiguousIndex=contract.buildCanonicalProfileIndex([
    {id:'a',shopperId:'a',externalId:'collision'},{id:'b',shopperId:'b',externalId:'collision'}
  ],[]);
  const ambiguous=ambiguousIndex.resolve({externalId:'collision'});
  check('contract_propagates_exact_linked_anchor',linked.ok&&linked.canonicalId==='profile-1');
  check('contract_fails_closed_on_ambiguous_anchor',!ambiguous.ok&&ambiguous.reason==='ambiguous_exact_technical_anchor'&&ambiguous.candidates.length===2);
}

const failed=checks.filter(x=>!x.pass);
const result={
  schemaVersion:'cxorbia.p0.exact-identity-contract-source-gate.v1',
  generatedAt:new Date().toISOString(),
  decision:failed.length?'FAIL_P0_EXACT_IDENTITY_CONTRACT_SOURCE':'PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE',
  checks,hardFails:failed.map(x=>x.id),
  safety:{providerReads:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,deploys:0,merge:false,production:false}
};
console.log(JSON.stringify(result,null,2));
if(failed.length)process.exitCode=1;
