#!/usr/bin/env node
/**
 * CXOrbia TyA — Corte 6 unified cumulative runtime gate.
 * Static/read-only. No provider calls, no deploys, no writes.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const must = (ok, code, detail='') => {
  if (!ok) {
    console.error(`FAIL ${code}${detail ? ` · ${detail}` : ''}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${code}${detail ? ` · ${detail}` : ''}`);
  }
};

const index = read('app/index-backend-dev.html');
const preview = read('app/core/backend-config-preview-dev.js');
const protectedMode = read('app/core/backend-protected-dev-mode.js');
const auth = read('app/core/backend-browser-auth.js');
const technical = read('app/adapters/tya-dev-technical-auth-e2e-v1.js');
const hrBridge = read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
const projectModel = read('app/adapters/tya-project-financial-model-contract-v1.js');
const domain = read('app/adapters/tya-c6-domain-consistency-bridge.js');
const shopperPortal = read('app/adapters/tya-canonical-shopper-portal-v2.js');
const unified = read('app/adapters/tya-c6-unified-human-runtime-v1.js');
const projectConfig = read('app/core/tya-phase-a-source-safe-preview.js');
const projectWizard = read('app/modules/proyecto-wizard.js');
const financeCore = read('app/core/finanzas-core.js');
const sourceData = read('app/data/tya-hr-source-safe-periods.js');

must(index.includes("lane:technical?'protected-technical-e2e':'authenticated-human-canonical'"),
  'C6_UNIFIED_NORMAL_ENTRY');
must(index.includes("params.set('cxProtectedRuntime',PROTECTED)") &&
     index.includes("params.set('cxHumanFullVisual',FULL_VISUAL)"),
  'C6_NORMAL_ENTRY_CANONICAL_FLAGS');
must(index.includes("canonicalDataRequired:{source:'live-hr',allDetectedPeriods:true,uniqueVisitKeys:true,shopperIdentity:'exact-crosswalk'}"),
  'C6_NO_FROZEN_RUNTIME_COUNTS');
must(!index.includes('src="adapters/tya-dev-entry-auth-gate-v1.js"'),
  'C6_NO_DIRECT_ROLE_OVERRIDE');
must(!index.includes('src="adapters/tya-dev-full-visual-bridge.js"'),
  'C6_NO_HIDDEN_VISUAL_SESSION_OVERLAY');
must(index.includes('src="core/backend-browser-auth.js"') &&
     index.includes('src="adapters/tya-protected-auth-hr-authority-bridge-v2.js"'),
  'C6_PRODUCT_LOGIN_AND_HR_AUTHORITY');
must(index.includes('src="adapters/tya-dev-technical-auth-e2e-v1.js"') &&
     technical.includes("params.get('cxTechnicalAuthE2E')===TECHNICAL") &&
     technical.includes('humanRouteAffected:false'),
  'C6_TECHNICAL_E2E_PRESERVED_HUMAN_UNAFFECTED');
must(index.includes('src="adapters/tya-c6-domain-consistency-bridge.js"') &&
     index.includes('src="adapters/tya-canonical-shopper-portal-v2.js"') &&
     index.includes('src="adapters/tya-canonical-finance-read-model-v2.js"') &&
     index.includes('src="adapters/tya-c6-unified-human-runtime-v1.js"'),
  'C6_CANONICAL_DOMAIN_SHOPPER_FINANCE');

const previewPos=index.indexOf('src="core/tya-phase-a-source-safe-preview.js"');
const modelPos=index.indexOf('src="adapters/tya-project-financial-model-contract-v1.js"');
const financePos=index.indexOf('src="core/finanzas-core.js"');
must(previewPos>=0 && modelPos>previewPos && financePos>modelPos,
  'C6_PROJECT_FINANCIAL_MODEL_LOAD_ORDER');

must(preview.includes('if(protectedRequested)') &&
     protectedMode.includes("mode:'integrated-product-login-protected-dev'"),
  'C6_AUTHENTICATED_PREVIEW_CONFIG');
must(auth.includes('NO crea un gate/pantalla de autenticación separada') &&
     auth.includes('Usuario + Contraseña'),
  'C6_SINGLE_VISIBLE_PRODUCT_LOGIN');
must(hrBridge.includes('No historical count is hardcoded as a runtime invariant') &&
     hrBridge.includes('d.outputVisits!==hrState.visits.length') &&
     hrBridge.includes('d.duplicateShopperIds!==0') &&
     hrBridge.includes('d.protectedVisitsAppended!==0') &&
     hrBridge.includes('result.projects.length!==hrState.projects.length'),
  'C6_HR_AUTHORITY_DYNAMIC_EXACT_COMPOSITION');
must(domain.includes('periodOperationalSummary') &&
     domain.includes('CX.data.phaseFlow') &&
     domain.includes('certificationForShopper'),
  'C6_LIVE_KPI_PHASE_HISTORY_CERTIFICATION');
must(shopperPortal.includes('exact identity') &&
     shopperPortal.includes('certification') &&
     shopperPortal.includes('fullHistory:true'),
  'C6_SHOPPER_PROFILE_HISTORY_CONTRACT');
must(unified.includes("role==='cliente'") &&
     unified.includes("authenticate(user,pass,'staff')") &&
     unified.includes('Comparativo histórico — todos los periodos HR') &&
     unified.includes('honorarium:{GT:60,HN:200}'),
  'C6_UNIFIED_CLIENT_HISTORY_PROJECT_CONFIG');

must(projectWizard.includes('value="directo"') &&
     projectWizard.includes('value="delegado"') &&
     projectWizard.includes("st.modelo==='directo'") &&
     projectWizard.includes('Regalías (%)'),
  'C6_PROJECT_CREATION_MODEL_SELECTABLE');
must(projectModel.includes("project.modelo='delegado'") &&
     projectModel.includes('project.regalias=0') &&
     projectModel.includes("project.compensationModel='coordination_commission_shared'") &&
     projectModel.includes('wrapAddProject') &&
     projectModel.includes('splitValuesInvented:false'),
  'C6_DELEGATED_PROJECT_CONTRACT_ENFORCED');
must(financeCore.includes("const regal=p.modelo==='directo'?") &&
     financeCore.includes("const isr=p.modelo==='directo'?"),
  'C6_ROYALTIES_AND_LOCAL_TAX_DIRECT_ONLY');
must(projectConfig.includes('honorario:{GT:60,HN:200}') &&
     projectConfig.includes("modelo:'delegado'") &&
     projectConfig.includes("billingModel:'delegated_coordination'") &&
     projectConfig.includes('localBilling:false') &&
     projectConfig.includes('regalias:0') &&
     projectConfig.includes('royaltyApplicable:false') &&
     projectConfig.includes("compensationModel:'coordination_commission_shared'"),
  'C6_CINEPOLIS_DELEGATED_CONFIGURATION');
must(!projectConfig.includes("modelo:'directo'") &&
     !projectConfig.includes('regalias:10'),
  'C6_CINEPOLIS_NO_LOCAL_ROYALTY_REGRESSION');
must(unified.includes("model:'delegado'") &&
     unified.includes("billingModel:'delegated_coordination'") &&
     unified.includes('royaltyApplicable:false') &&
     unified.includes('royalty:0') &&
     unified.includes("compensationModel:'coordination_commission_shared'") &&
     unified.includes('valuesInvented:false'),
  'C6_UNIFIED_RUNTIME_DELEGATED_COMMISSION_MODEL');
must(!unified.includes("model:'directo'") && !unified.includes('royalty:10'),
  'C6_NO_DELEGATED_ROYALTY_IN_RUNTIME_METADATA');
must(!projectConfig.includes('honorario:{GT:0,HN:0}'),
  'C6_NO_ZERO_HONORARIO_CONFIG');

const periodKeys = [...sourceData.matchAll(/"key":\s*"(\d{4}-\d{2})"/g)].map(m => m[1]);
const uniquePeriods = [...new Set(periodKeys)];
must(uniquePeriods.length >= 14, 'C6_CURRENT_HR_PERIOD_SNAPSHOT', `${uniquePeriods.length}`);
must(uniquePeriods[0] === '2025-06' && uniquePeriods.at(-1) === '2026-07',
  'C6_CURRENT_HR_RANGE_2025_06_TO_2026_07',
  `${uniquePeriods[0] || 'none'}..${uniquePeriods.at(-1) || 'none'}`);
must(!uniquePeriods.includes('2026-08'), 'C6_NO_AUGUST_WITHOUT_SOURCE');

const forbiddenWriteSignals = [
  /enableDataWrites\s*:\s*true/,
  /enableOperationalWrites\s*:\s*true/,
  /production\s*:\s*true/,
  /paymentsWrites\s*:\s*[1-9]/,
  /hrWrites\s*:\s*[1-9]/
];
const touched = [
  index,preview,protectedMode,auth,technical,hrBridge,projectModel,
  domain,shopperPortal,unified,projectConfig,projectWizard,financeCore
].join('\n');
must(forbiddenWriteSignals.every(re => !re.test(touched)), 'C6_READONLY_NO_PRODUCTION');

if (process.exitCode) {
  console.error('DECISION FAIL_C6_UNIFIED_CUMULATIVE_RUNTIME_STATIC_GATE');
  process.exit(process.exitCode);
}
console.log('DECISION PASS_C6_UNIFIED_CUMULATIVE_RUNTIME_STATIC_GATE');
