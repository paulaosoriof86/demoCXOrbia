#!/usr/bin/env node
/**
 * CXOrbia TyA — C6 Shopper new-tab protected authority root-fix gate.
 * Static/read-only. No provider calls, deploys or writes.
 */
import fs from 'node:fs';

const bridgePath='app/adapters/tya-protected-auth-hr-authority-bridge-v2.js';
const bridge=fs.readFileSync(bridgePath,'utf8');
const checks=[
  ['RESTORED_SESSION_CONTRACT',bridge.includes('Restored authenticated sessions in reloads/new tabs reconcile automatically')],
  ['BOUNDED_HR_RETRY',bridge.includes('const HR_MAX_ATTEMPTS=6')&&bridge.includes('retryableStatus(status)')&&bridge.includes('await sleep(Math.min(10000,1200*attempt))')],
  ['BOOT_RECONCILE_SCHEDULER',bridge.includes('function scheduleBootReconcile(reason,reset)')&&bridge.includes('const BOOT_MAX_ATTEMPTS=180')],
  ['AUTH_READY_RECONCILE',bridge.includes("CX.bus.on('backend-auth-ready'")&&bridge.includes('backend_auth_ready_restored_session')],
  ['BACKEND_READY_RECONCILE',bridge.includes("CX.bus.on('backend-ready'")&&bridge.includes('backend_ready_firestore_dynamic')],
  ['DOM_READY_RECONCILE',bridge.includes('dom_ready_authenticated_context_restore')&&bridge.includes('script_ready_authenticated_context_restore')],
  ['FOCUS_VISIBILITY_RECOVERY',bridge.includes('window_focus_restored_session')&&bridge.includes('visibility_restored_session')],
  ['PROTECTED_BACKEND_GUARD',bridge.includes('function protectedBackendReady()')&&bridge.includes("source==='firestore'")],
  ['RUNTIME_DEPENDENCY_GUARD',bridge.includes('function runtimeDependenciesReady()')&&bridge.includes("typeof window.CX_TYA_APPLY_LIVE_SNAPSHOT==='function'")],
  ['IDEMPOTENT_RECONCILE_GUARD',bridge.includes("if(reconciling)return {ok:true,skipped:true,reason:'reconcile_in_progress'}")&&bridge.includes('if(bootTimer)return')],
  ['NEW_TAB_RECOVERY_METADATA',bridge.includes("version:'v2-dynamic-live-source-new-tab-recovery'")&&bridge.includes('restoredSessionRecovery:true')],
  ['ZERO_PROVIDER_WRITES',bridge.includes('providerWrites:0')&&bridge.includes('authWrites:0')&&bridge.includes('rulesDeploys:0')&&bridge.includes('production:false')],
  ['NO_WRITE_APIS',!/[.]set\s*\(|[.]add\s*\(|[.]update\s*\(|[.]delete\s*\(|signInWithEmailAndPassword\s*\(/.test(bridge)]
];
let failed=false;
for(const [code,ok] of checks){
  console.log(`${ok?'PASS':'FAIL'} C6_SHOPPER_NEW_TAB_${code}`);
  if(!ok)failed=true;
}
if(failed){
  console.error('DECISION FAIL_C6_SHOPPER_NEW_TAB_AUTHORITY_ROOT_FIX_STATIC_GATE');
  process.exit(2);
}
console.log('DECISION PASS_C6_SHOPPER_NEW_TAB_AUTHORITY_ROOT_FIX_STATIC_GATE');
