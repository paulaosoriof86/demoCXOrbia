#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const exactAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const outputFile=String(process.env.CXORBIA_C6_STAFF_PREFLIGHT_OUTPUT||'').trim();
const files={
  workflow:'.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml',
  selectorWrapper:'tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs',
  staffSelector:'tools/qa/cxorbia-c6-existing-staff-admin-e2e-credential.mjs',
  runtimeWrapper:'tools/qa/tya-c6-dev-root-runtime-wrapper.mjs',
  staffSmoke:'tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs',
  browserAuth:'app/core/backend-browser-auth.js'
};

const read=p=>{
  if(!fs.existsSync(p))throw new Error('PREFLIGHT_REQUIRED_FILE_MISSING_'+p.replace(/[^A-Za-z0-9]+/g,'_'));
  return fs.readFileSync(p,'utf8');
};
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const count=(source,needle)=>source.split(needle).length-1;
const sources=Object.fromEntries(Object.entries(files).map(([k,p])=>[k,read(p)]));

ensure(sources.workflow.includes("const action=String(x.action||'').trim();"),'WORKFLOW_ACTION_NOT_EXPLICIT_FIELD');
ensure(!sources.workflow.includes('endsWith(exactAction)'),'WORKFLOW_ACTION_STILL_SUFFIX_DERIVED');
ensure(sources.workflow.includes("if(x.action!==exactAction)throw new Error('staff_action_not_exact');"),'WORKFLOW_AUTHORIZATION_DOES_NOT_FAIL_CLOSED_ON_ACTION');
ensure(sources.workflow.includes('Run Staff lane source preflight before provider'),'WORKFLOW_SOURCE_PREFLIGHT_STEP_MISSING');
const preflightIndex=sources.workflow.indexOf('Run Staff lane source preflight before provider');
const providerIndex=sources.workflow.indexOf('uses: google-github-actions/auth@v2');
ensure(preflightIndex>=0&&providerIndex>=0&&preflightIndex<providerIndex,'WORKFLOW_PREFLIGHT_NOT_BEFORE_PROVIDER');
ensure(sources.workflow.includes(`if [[ "$CXORBIA_C6_ACTION" != "${exactAction}" ]]; then`),'WORKFLOW_SELECTOR_NOT_FAIL_CLOSED');

ensure(sources.selectorWrapper.includes("./cxorbia-c6-existing-staff-admin-e2e-credential.mjs"),'SELECTOR_WRAPPER_NOT_DEDICATED_STAFF');
ensure(sources.selectorWrapper.includes('const script=staffOnly?staffScript:genericScript;'),'SELECTOR_WRAPPER_STAFF_ROUTE_NOT_EXPLICIT');
ensure(sources.staffSelector.includes("if(action!==exactAction)stageFail('STAFF_ACTION_NOT_EXACT');"),'STAFF_SELECTOR_ACTION_NOT_FAIL_CLOSED');
ensure(!sources.staffSelector.includes('HOLD_SHOPPER'),'STAFF_SELECTOR_CONTAINS_SHOPPER_HOLD');
ensure(!sources.staffSelector.includes('fetchLiveHrWithRetry'),'STAFF_SELECTOR_CONTAINS_HR_SELECTOR_DEPENDENCY');
ensure(!sources.staffSelector.includes("admin.firestore()"),'STAFF_SELECTOR_CONTAINS_FIRESTORE_DEPENDENCY');
ensure(sources.staffSelector.includes('shopperSelection:false'),'STAFF_SELECTOR_SCOPE_FLAG_MISSING');
ensure(sources.staffSelector.includes('clientSelection:false'),'STAFF_SELECTOR_CLIENT_SCOPE_FLAG_MISSING');

ensure(sources.runtimeWrapper.includes("const staffHumanSourcePath='tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs';"),'RUNTIME_WRAPPER_STAFF_SMOKE_NOT_DEDICATED');
ensure(!sources.runtimeWrapper.includes('STAFF_SINGLE_FORM_OVERLAY_GUARD_SCOPE_INVALID'),'RUNTIME_WRAPPER_STAFF_TEXT_PATCH_REMAINS');
ensure(!sources.runtimeWrapper.includes('STAFF_SINGLE_FORM_LOGIN_PATCH_SCOPE_INVALID'),'RUNTIME_WRAPPER_STAFF_LOGIN_TEXT_PATCH_REMAINS');
ensure(sources.runtimeWrapper.includes("ensure(human.staff?.canonicalForm===true,'ROOT_STAFF_CANONICAL_FORM_NOT_PASS');"),'RUNTIME_WRAPPER_CANONICAL_FORM_ASSERTION_MISSING');

for(const selector of ['#loginForm','#lgUser','#lgPass','#lgSubmit']){
  ensure(sources.staffSmoke.includes(selector),'STAFF_SMOKE_SELECTOR_MISSING_'+selector.replace(/[^A-Za-z0-9]+/g,'_'));
}
ensure(sources.staffSmoke.includes("if(action!==exactAction)throw new Error('STAFF_ACTION_NOT_EXACT');"),'STAFF_SMOKE_ACTION_NOT_FAIL_CLOSED');
ensure(sources.staffSmoke.includes("await page.goto(root+'/'"),'STAFF_SMOKE_ROOT_ENTRY_NOT_DIRECT');
ensure(!sources.staffSmoke.includes('#cxIntegratedAuthLogin'),'STAFF_SMOKE_LEGACY_LOGIN_SELECTOR_REINTRODUCED');
ensure(!sources.staffSmoke.includes('#cxIntegratedAuthPassword'),'STAFF_SMOKE_LEGACY_PASSWORD_SELECTOR_REINTRODUCED');

for(const id of ['loginForm','lgUser','lgPass','lgSubmit']){
  ensure(sources.browserAuth.includes(`getElementById('${id}')`),'PRODUCT_CANONICAL_SELECTOR_MISSING_'+id);
}
ensure(sources.browserAuth.includes('removeLegacyCredentialOverlay'),'PRODUCT_LEGACY_OVERLAY_REMOVAL_MISSING');

const result={
  schemaVersion:'cxorbia.c6.staff-lane-source-preflight.v1',
  generatedAt:new Date().toISOString(),
  decision:'PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT',
  action:exactAction,
  checks:{
    actionExplicitAndFailClosed:true,
    suffixDerivationRemoved:true,
    preflightBeforeProvider:true,
    staffSelectorDedicated:true,
    staffSelectorNoShopperHrFirestoreDependency:true,
    staffRuntimeNoTextPatching:true,
    staffCanonicalFormSelectors:true,
    productCanonicalSelectorsPresent:true
  },
  safety:{
    providerCalls:0,
    hostingDeploys:0,
    firestoreWrites:0,
    authWrites:0,
    hrReads:0,
    hrWrites:0,
    rulesWrites:0,
    storageWrites:0,
    makeCalls:0,
    geminiCalls:0,
    paymentWrites:0,
    merge:false,
    production:false
  },
  files
};
if(outputFile){
  fs.mkdirSync(path.dirname(outputFile),{recursive:true});
  fs.writeFileSync(outputFile,JSON.stringify(result,null,2)+'\n','utf8');
}
console.log(JSON.stringify(result));
