#!/usr/bin/env node
import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');
const shopper=read('app/adapters/tya-canonical-shopper-portal-v2.js');
const auth=read('app/core/backend-browser-auth.js');
const authority=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
const status=read('app/core/backend-preview-status.js');

const checks=[];
const check=(id,pass,detail='')=>checks.push({id,pass:!!pass,detail});

check('canonical_auth_api_exists',/CX\.backendAuth\s*=\s*\{/.test(auth)&&/context:\s*function\(\)\{\s*return currentContext;\s*\}/.test(auth));
check('shopper_uses_canonical_auth_context',/CX\.backendAuth\?\.context\?\.\(\)/.test(shopper));
check('shopper_rejects_obsolete_window_auth_api',!shopper.includes('window.CX_BACKEND_AUTH'));
check('shopper_waits_for_hr_authority',/CX_PROTECTED_AUTH_HR_AUTHORITY\?\.applied!==true/.test(shopper));
check('shopper_schedules_hr_reconcile',shopper.includes('CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE'));
check('shopper_rerenders_on_authority_ready',shopper.includes('cx:protected-auth-hr-authority-ready'));
check('authority_sets_canonical_source',authority.includes("sourceRef='hr-live-all-periods+firestore-authenticated-exact-overlay'"));
check('authority_replaces_runtime_with_hr',authority.includes('CX.data._visitas=clone(result.visits)')&&authority.includes('CX.data.shoppers=clone(result.shoppers)'));
check('authority_emits_ready_event',authority.includes("cx:protected-auth-hr-authority-ready"));

const statusListensFinal=status.includes('cx:protected-auth-hr-authority-ready');
const statusCallsProjects=/Proyectos:\s*['"+]?\+?c\.projects/.test(status)||status.includes('Proyectos: '+"'+c.projects+");
check('dev_status_listens_final_authority',statusListensFinal,'must rerender after HR authority handoff');
check('dev_status_does_not_mislabel_period_rows_as_projects',!statusCallsProjects,'period rows in CX.data.projects must not be presented as project count');

const failed=checks.filter(x=>!x.pass);
const report={
  schemaVersion:'cxorbia.p0.shopper-hr-authority-source-gate.v1',
  generatedAt:new Date().toISOString(),
  decision:failed.length?'FAIL_P0_SHOPPER_HR_AUTHORITY_SOURCE_GATE':'PASS_P0_SHOPPER_HR_AUTHORITY_SOURCE_GATE',
  checks,hardFails:failed.map(x=>x.id),
  safety:{providerReads:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,deploys:0,merge:false,production:false}
};
console.log(JSON.stringify(report,null,2));
if(failed.length)process.exitCode=1;
