#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 P0 source contract gate R26.
   This gate is intentionally fail-closed. It validates that a corrective
   frontend candidate removes the seven P0 patterns proven during Paula's
   mobile review before the candidate can be declared GO for direct apply.

   Scope: source-level contract only. Remote/mobile/export gates remain
   mandatory after empalme and Hosting DEV deployment. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.argv[2] || '.');
const files = {
  finanzas: path.join(root, 'app/modules/finanzas.js'),
  finCore: path.join(root, 'app/core/finanzas-core.js'),
  beneficios: path.join(root, 'app/modules/beneficios.js'),
  app: path.join(root, 'app/app.js')
};

const read = (file) => {
  if (!fs.existsSync(file)) throw new Error(`required_file_missing:${path.relative(root, file)}`);
  return fs.readFileSync(file, 'utf8');
};

const source = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, read(file)]));
const results = [];
const check = (condition, id, detail = '') => {
  const pass = Boolean(condition);
  results.push({ id, pass, detail });
  if (!pass) process.exitCode = 1;
};

// P0-1: never sum different currencies and label the aggregate with the first currency.
check(!/const\s+cur\s*=\s*p\.currency\[p\.countries\[0\]\]/.test(source.finanzas),
  'no_first_country_currency_for_cross_country_movements',
  'Movimientos must aggregate by currency/country or require an explicit FX conversion source.');
check(!/const\s+cur\s*=\s*p\.currency\[p\.countries\[0\]\]/.test(source.beneficios),
  'no_first_country_currency_for_shopper_benefits',
  'Shopper totals must remain grouped by the currency of each liquidation/visit.');
check(/groupByCurrency|porMoneda|currencyGroups|totalsByCurrency/.test(source.finanzas),
  'finance_declares_currency_grouping_contract',
  'Expected an explicit per-currency grouping implementation in Finanzas/Movimientos.');
check(/groupByCurrency|porMoneda|currencyGroups|totalsByCurrency/.test(source.beneficios),
  'benefits_declares_currency_grouping_contract',
  'Expected an explicit per-currency grouping implementation in Beneficios.');

// P0-2: liquidation/devengado/por pagar are not paid until a confirmed payment source exists.
check(!/Honorarios pagados/i.test(source.finanzas),
  'no_false_paid_honoraria_copy');
check(!/honPaga/.test(source.finCore),
  'no_honpaga_variable_for_unconfirmed_liquidations',
  'Use honorarioDevengado/honorarioPorPagar/honorarioPagado with paymentConfirmed semantics.');
check(/honorarioDevengado/.test(source.finCore) && /honorarioPorPagar/.test(source.finCore) && /honorarioPagado/.test(source.finCore),
  'explicit_honoraria_state_fields');
check(/paymentConfirmed/.test(source.finCore),
  'payment_confirmed_drives_paid_amount');

// P0-3: no invented reimbursement reconciliation.
check(!/reemb\s*\*\s*0\.85|0\.85\s*\*\s*[^;\n]*reemb/.test(source.finanzas),
  'no_inferred_85_percent_reimbursement');
check(/Pendiente de fuente/.test(source.finanzas),
  'reimbursement_uses_pending_source_state');
check(/reimbursementSource|reintegroSource|reembolsoConfirmado|reimbursementConfirmed/.test(source.finanzas),
  'reimbursement_requires_confirmed_source_contract');

// P0-4: financial period must consume the canonical project/period context.
check(!/finDashPer[\s\S]{0,500}CX\.finStore\.periods\(p\.id\)/.test(source.finanzas),
  'dashboard_period_not_bound_to_local_fin_store_only');
check(!/id="perSel"[\s\S]{0,500}CX\.finStore\.periods\(pid\(\)\)/.test(source.finanzas),
  'movements_period_not_bound_to_local_fin_store_only');
check(/currentPeriodId|periodKey|canonicalPeriod|setProject/.test(source.finanzas),
  'financial_views_reference_canonical_period_context');

// P0-5: export needs real rows/download guards, not only a report specification.
check(/disabled|canExport|hasRows|rows\.length/.test(source.finanzas),
  'empty_export_is_blocked');
check(/xlsx|excel/i.test(source.finanzas),
  'excel_export_path_is_explicit');
check(/pdf/i.test(source.finanzas),
  'pdf_export_path_is_explicit');

// P0-6: the fail-closed rows need a visible human-review surface.
check(/reviewRequired/.test(source.finanzas),
  'finance_review_queue_filters_review_required');
for (const token of ['visitId', 'hrRowId', 'financialSourceStatus']) {
  check(source.finanzas.includes(token), `finance_review_queue_exposes_${token}`);
}
check(/Pendiente de revisión|Bandeja de revisión|Revisión financiera/.test(source.finanzas),
  'finance_review_queue_has_visible_label');

// P0-7: live DEV shopper validation may be controlled, but it must be visible and selectable.
check(/shopperId/.test(source.app), 'shopper_session_uses_shopper_id');
check(/devShopper|shopperValidation|validationShopper|shopperIdentitySelector/.test(source.app),
  'visible_dev_shopper_identity_selector_exists',
  'The R25 hidden session injection cannot be the only Shopper validation path.');

// P1/P0 support: honest deterministic analysis copy and mobile-operable surfaces.
check(!/Con IA conectada \(Gemini\)|IA · hallazgos & estrategias/.test(source.finanzas),
  'no_false_gemini_live_copy');
check(/Análisis determinístico|Reglas locales|Sin IA conectada|IA no conectada/.test(source.finanzas),
  'honest_analysis_engine_label');
check(/overflow-x:auto/.test(source.finanzas) && /aria-label|table-scroll-hint|Desliza/.test(source.finanzas),
  'finance_tables_expose_mobile_scroll_hint');
check(/overflow-x:auto/.test(source.beneficios) && /aria-label|table-scroll-hint|Desliza/.test(source.beneficios),
  'benefits_table_mobile_wrapper');

const report = {
  gateId: 'tya-corte3-p0-source-contract-r26',
  generatedAt: new Date().toISOString(),
  root,
  status: process.exitCode ? 'HOLD' : 'PASS',
  results,
  safeState: {
    sourceOnly: true,
    deploy: false,
    production: false,
    merge: false,
    writes: false,
    paymentsExecuted: 0
  }
};

const out = path.join(root, '.tmp/tya-corte3-p0-source-contract-r26');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');

if (process.exitCode) {
  console.error('HOLD_TYA_CORTE3_P0_SOURCE_CONTRACT_R26');
  for (const item of results.filter(item => !item.pass)) console.error(`${item.id}${item.detail ? `: ${item.detail}` : ''}`);
} else {
  console.log('PASS_TYA_CORTE3_P0_SOURCE_CONTRACT_R26');
}
