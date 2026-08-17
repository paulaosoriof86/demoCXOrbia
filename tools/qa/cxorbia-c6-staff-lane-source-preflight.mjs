#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const exactAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const outputFile=String(process.env.CXORBIA_C6_STAFF_PREFLIGHT_OUTPUT||'').trim();
const files={
  workflow:'.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml',
  selectorWrapper:'tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs',
  staffSelector:'tools/qa/cxorbia-c6-canonical-staff-admin-e2e-credential.mjs',
  runtimeWrapper:'tools/qa/tya-c6-dev-root-runtime-wrapper.mjs',
  staffSmoke:'tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs',
  browserAuth:'app/core/backend-browser-auth.js',
  membershipWiring:'app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js',
  authorityCompat:'app/adapters/tya-phase-a-authority-compat-v1.js'
};

const read=p=>{
  if(!fs.existsSync(p))throw new Error('PREFLIGHT_REQUIRED_FILE_MISSING_'+p.replace(/[^A-Za-z0-9]+/g,'_'));
  return fs.readFileSync(p,'utf8');
};
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const sources=Object.fromEntries(Object.entries(files).map(([k,p])=>[k,read(p)]));

function workflowRunScript(workflow,stepName){
  const lines=workflow.split(/\r?\n/);
  const marker=`      - name: ${stepName}`;
  const start=lines.findIndex(line=>line===marker);
  ensure(start>=0,'WORKFLOW_STEP_MISSING_'+stepName.replace(/[^A-Za-z0-9]+/g,'_'));
  let end=lines.length;
  for(let i=start+1;i<lines.length;i++){
    if(lines[i].startsWith('      - name: ')){end=i;break;}
  }
  const step=lines.slice(start,end);
  const runIndex=step.findIndex(line=>line==='        run: |');
  ensure(runIndex>=0,'WORKFLOW_STEP_RUN_BLOCK_MISSING_'+stepName.replace(/[^A-Za-z0-9]+/g,'_'));
  const runLines=[];
  for(const line of step.slice(runIndex+1)){
    if(line.startsWith('          ')) runLines.push(line.slice(10));
    else if(line.trim()==='') runLines.push('');
    else break;
  }
  ensure(runLines.length>0,'WORKFLOW_STEP_RUN_BLOCK_EMPTY_'+stepName.replace(/[^A-Za-z0-9]+/g,'_'));
  return runLines.join('\n')+'\n';
}

ensure(sources.workflow.includes("const action=String(x.action||'').trim();"),'WORKFLOW_ACTION_NOT_EXPLICIT_FIELD');
ensure(!sources.workflow.includes('endsWith(exactAction)'),'WORKFLOW_ACTION_STILL_SUFFIX_DERIVED');
ensure(sources.workflow.includes("if(x.action!==exactAction)throw new Error('staff_action_not_exact');"),'WORKFLOW_AUTHORIZATION_DOES_NOT_FAIL_CLOSED_ON_ACTION');
ensure(sources.workflow.includes('Run Staff lane source preflight before provider'),'WORKFLOW_SOURCE_PREFLIGHT_STEP_MISSING');
const preflightIndex=sources.workflow.indexOf('Run Staff lane source preflight before provider');
const providerIndex=sources.workflow.indexOf('uses: google-github-actions/auth@v2');
ensure(preflightIndex>=0&&providerIndex>=0&&preflightIndex<providerIndex,'WORKFLOW_PREFLIGHT_NOT_BEFORE_PROVIDER');
ensure(sources.workflow.includes(`if [[ "$CXORBIA_C6_ACTION" != "${exactAction}" ]]; then`),'WORKFLOW_SELECTOR_NOT_FAIL_CLOSED');

const executeScript=workflowRunScript(sources.workflow,'Execute one Hosting deploy and Staff-only runtime gates');
const bashCheck=spawnSync('bash',['-n'],{input:executeScript,encoding:'utf8'});
ensure(bashCheck.status===0,'WORKFLOW_HOSTING_EXECUTE_BASH_SYNTAX_INVALID_'+String(bashCheck.stderr||'').replace(/[^A-Za-z0-9]+/g,'_').slice(0,160));
ensure(!executeScript.includes("node <<'NODE'"),'WORKFLOW_HOSTING_EXECUTE_NESTED_HEREDOC_REINTRODUCED');
ensure(executeScript.includes("node -e \"const r=require('./'+process.env.OUT_DIR+'/root-entrypoint-source.json')"),'WORKFLOW_HOSTING_SOURCE_ASSERT_NOT_INLINE');
ensure(executeScript.includes("node -e \"const fs=require('fs');const r=JSON.parse(fs.readFileSync(process.env.OUT_DIR+'/runtime/report.json'"),'WORKFLOW_HOSTING_RUNTIME_ASSERT_NOT_INLINE');

ensure(sources.selectorWrapper.includes("./cxorbia-c6-canonical-staff-admin-e2e-credential.mjs"),'SELECTOR_WRAPPER_NOT_EXACT_WRITE_CANONICAL_STAFF');
ensure(sources.selectorWrapper.includes('const script=staffOnly?staffScript:genericScript;'),'SELECTOR_WRAPPER_STAFF_ROUTE_NOT_EXPLICIT');
ensure(sources.selectorWrapper.includes("result.canonicalTargetAlias!=='B'"),'SELECTOR_WRAPPER_CANONICAL_ALIAS_B_ASSERTION_MISSING');
ensure(sources.selectorWrapper.includes("result.staffRole!=='admin'"),'SELECTOR_WRAPPER_CANONICAL_ADMIN_ASSERTION_MISSING');
ensure(sources.staffSelector.includes("const TARGET_ALIAS='B';"),'STAFF_SELECTOR_CANONICAL_ALIAS_B_MISSING');
ensure(sources.staffSelector.includes("const TARGET_ROLE='admin';"),'STAFF_SELECTOR_CANONICAL_ADMIN_ROLE_MISSING');
ensure(sources.staffSelector.includes('loadStaffPrivateExecutionHandoff'),'STAFF_SELECTOR_PRIVATE_HANDOFF_MISSING');
ensure(sources.staffSelector.includes('cxorbia-c6-staff-v2-private-handoff-ephemeral-password'),'STAFF_SELECTOR_EXACT_WRITE_V2_DERIVATION_MISSING');
ensure(sources.staffSelector.includes('exactWriteCanonical:true'),'STAFF_SELECTOR_CANONICAL_FLAG_MISSING');
ensure(sources.staffSelector.includes('legacyCredentialBundleUsed:false'),'STAFF_SELECTOR_LEGACY_BUNDLE_GUARD_MISSING');
ensure(!sources.staffSelector.includes('corte6-credential-bundle.enc.json'),'STAFF_SELECTOR_LEGACY_CREDENTIAL_BUNDLE_REINTRODUCED');
ensure(!sources.staffSelector.includes('staffPasswordCandidates'),'STAFF_SELECTOR_LEGACY_PASSWORD_GUESSING_REINTRODUCED');
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
ensure(!sources.staffSmoke.includes("await page.click('#lgSubmit')"),'STAFF_SMOKE_POINTER_SUBMIT_REINTRODUCED');
ensure(sources.staffSmoke.includes("await page.press('#lgPass','Enter')"),'STAFF_SMOKE_CANONICAL_KEYBOARD_SUBMIT_MISSING');
ensure(sources.staffSmoke.includes('membershipVerified:window.CX?.session?.user?.membershipVerified===true'),'STAFF_SMOKE_MEMBERSHIP_ASSERTION_MISSING');
ensure(sources.staffSmoke.includes("handoff?.status==='entered'"),'STAFF_SMOKE_FRONTEND_HANDOFF_ASSERTION_MISSING');
ensure(sources.staffSmoke.includes('window.CX_BACKEND_LAST_STATE?.empty!==true'),'STAFF_SMOKE_BACKEND_EMPTY_RECONCILE_ASSERTION_MISSING');
ensure(sources.staffSmoke.includes('window.CX_CORTE4_READONLY?.empty!==true'),'STAFF_SMOKE_CORTE4_EMPTY_RECONCILE_ASSERTION_MISSING');
ensure(sources.staffSmoke.includes("assert(!state.noPeriodsVisible,label+'_NO_PERIODS_VISIBLE');"),'STAFF_SMOKE_GRANULAR_NO_PERIODS_ASSERTION_MISSING');
ensure(sources.staffSmoke.includes("assert(state.railPeriodSelect,label+'_PERIOD_SELECTOR_NOT_MOUNTED');"),'STAFF_SMOKE_PERIOD_SELECTOR_ASSERTION_MISSING');

for(const id of ['loginForm','lgUser','lgPass','lgSubmit']){
  ensure(sources.browserAuth.includes(`getElementById('${id}')`),'PRODUCT_CANONICAL_SELECTOR_MISSING_'+id);
}
ensure(sources.browserAuth.includes('removeLegacyCredentialOverlay'),'PRODUCT_LEGACY_OVERLAY_REMOVAL_MISSING');
ensure(sources.browserAuth.includes("visible.form.addEventListener('submit'"),'PRODUCT_CANONICAL_FORM_SUBMIT_BINDING_MISSING');

ensure(sources.membershipWiring.includes("window.addEventListener('cx:protected-auth-hr-authority-ready'"),'MEMBERSHIP_WIRING_AUTHORITY_HANDOFF_LISTENER_MISSING');
ensure(sources.membershipWiring.includes("await reconcile(ctx)"),'MEMBERSHIP_WIRING_FINAL_MEMBERSHIP_RECONCILE_MISSING');
ensure(sources.membershipWiring.includes("CX.session?.user?.membershipVerified!==true"),'MEMBERSHIP_WIRING_MEMBERSHIP_FAIL_CLOSED_MISSING');
ensure(sources.membershipWiring.includes("window.CX_BACKEND_LAST_STATE=Object.assign"),'MEMBERSHIP_WIRING_BACKEND_EMPTY_RECONCILE_MISSING');
ensure(sources.membershipWiring.includes("window.CX_CORTE4_READONLY=Object.assign"),'MEMBERSHIP_WIRING_CORTE4_EMPTY_RECONCILE_MISSING');
ensure(sources.membershipWiring.includes("CX.app.enter();"),'MEMBERSHIP_WIRING_CANONICAL_APP_ENTER_MISSING');
ensure(sources.membershipWiring.includes("const postEnterCtx=await reconcile(verifiedCtx);"),'MEMBERSHIP_WIRING_POST_ENTER_SESSION_REPUBLISH_MISSING');
ensure(sources.membershipWiring.includes("FRONTEND_HANDOFF_MEMBERSHIP_LOST_AFTER_APP_ENTER"),'MEMBERSHIP_WIRING_POST_ENTER_FAIL_CLOSED_MISSING');
const appEnterIndex=sources.membershipWiring.indexOf("CX.app.enter();");
const postEnterRepublishIndex=sources.membershipWiring.indexOf("const postEnterCtx=await reconcile(verifiedCtx);");
ensure(appEnterIndex>=0&&postEnterRepublishIndex>appEnterIndex,'MEMBERSHIP_WIRING_POST_ENTER_REPUBLISH_ORDER_INVALID');
ensure(sources.membershipWiring.includes("sessionMembershipRepublishedAfterAppEnter:true"),'MEMBERSHIP_WIRING_POST_ENTER_EVIDENCE_MISSING');
ensure(sources.membershipWiring.includes("publishFrontendHandoff('entered'"),'MEMBERSHIP_WIRING_HANDOFF_EVIDENCE_MISSING');
ensure(!sources.membershipWiring.includes("document.getElementById('app').classList.add"),'MEMBERSHIP_WIRING_DIRECT_UI_MUTATION_FORBIDDEN');

const authoritySyntax=spawnSync(process.execPath,['--check',files.authorityCompat],{encoding:'utf8'});
ensure(authoritySyntax.status===0,'AUTHORITY_COMPAT_SYNTAX_INVALID_'+String(authoritySyntax.stderr||'').replace(/[^A-Za-z0-9]+/g,'_').slice(0,160));
ensure(sources.authorityCompat.includes('function verifiedTransitionScope()'),'AUTHORITY_COMPAT_VERIFIED_TRANSITION_SCOPE_MISSING');
ensure(sources.authorityCompat.includes("wiring.status!=='verified'"),'AUTHORITY_COMPAT_WIRING_VERIFIED_GUARD_MISSING');
ensure(sources.authorityCompat.includes('wiring.membershipVerified!==true'),'AUTHORITY_COMPAT_MEMBERSHIP_VERIFIED_GUARD_MISSING');
ensure(sources.authorityCompat.includes("lower(ctx.tenantId)!=='tya'"),'AUTHORITY_COMPAT_TENANT_GUARD_MISSING');
ensure(sources.authorityCompat.includes("lower(ctx.authNamespace||'staff')!=='staff'"),'AUTHORITY_COMPAT_NAMESPACE_GUARD_MISSING');
ensure(sources.authorityCompat.includes('lower(ctx.role)!==lower(wiring.role)'),'AUTHORITY_COMPAT_ROLE_MATCH_MISSING');
ensure(sources.authorityCompat.includes('!sameList(ctx.projectIds,wiring.projectScope)'),'AUTHORITY_COMPAT_PROJECT_SCOPE_EXACT_MATCH_MISSING');
ensure(sources.authorityCompat.includes('return verifiedTransitionScope();'),'AUTHORITY_COMPAT_TRANSITION_FALLBACK_NOT_USED');
ensure(!sources.authorityCompat.includes('return uniq([user.scopeProjectId'), 'AUTHORITY_COMPAT_RAW_SCOPEPROJECTID_TRUST_FORBIDDEN');
ensure(!sources.authorityCompat.includes("document.getElementById('rail')"),'AUTHORITY_COMPAT_DIRECT_RAIL_PATCH_FORBIDDEN');

const result={
  schemaVersion:'cxorbia.c6.staff-lane-source-preflight.v5',
  generatedAt:new Date().toISOString(),
  decision:'PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT',
  action:exactAction,
  checks:{
    actionExplicitAndFailClosed:true,
    suffixDerivationRemoved:true,
    preflightBeforeProvider:true,
    hostingExecuteBashSyntax:true,
    hostingExecuteNestedHeredocAbsent:true,
    staffSelectorDedicated:true,
    staffSelectorExactWriteCanonicalAliasB:true,
    staffSelectorPrivateHandoffDerived:true,
    staffSelectorLegacyBundleForbidden:true,
    staffSelectorNoShopperHrFirestoreDependency:true,
    staffRuntimeNoTextPatching:true,
    staffCanonicalFormSelectors:true,
    staffCanonicalKeyboardSubmit:true,
    staffPointerSubmitCollisionAvoided:true,
    staffGranularNoPeriodsAssertion:true,
    productCanonicalSelectorsPresent:true,
    productCanonicalSubmitBindingPresent:true,
    membershipAuthorityFrontendHandoff:true,
    membershipVerifiedBeforeFrontendEntry:true,
    membershipRepublishedAfterCanonicalAppEnter:true,
    staleBackendEmptyStateReconciled:true,
    canonicalAppEnterReused:true,
    authorityCompatSyntax:true,
    authorityCompatVerifiedTransitionScope:true,
    authorityCompatExactTenantRoleProjectMatch:true,
    authorityCompatNoRawScopeProjectTrust:true,
    directUiMutationAbsent:true
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
