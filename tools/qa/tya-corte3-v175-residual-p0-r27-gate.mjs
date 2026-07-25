#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 residual P0 gate R27.
   Protects against partial fixes found in candidate V175.
   Source-only and fail-closed; runtime/mobile/export gates remain mandatory. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.argv[2] || '.');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const src = {
  fin: read('app/modules/finanzas.js'),
  core: read('app/core/finanzas-core.js'),
  ben: read('app/modules/beneficios.js'),
  app: read('app/app.js')
};
const results = [];
const check = (condition, id, detail = '') => {
  const pass = Boolean(condition);
  results.push({ id, pass, detail });
  if (!pass) process.exitCode = 1;
};

const devBlock = (src.app.match(/_isDevAccess\(\)[\s\S]{0,700}?return false;[\s\S]{0,20}?\}/) || [''])[0];
check(!/web\\?\.app|firebaseapp/.test(devBlock),
  'dev_shopper_access_uses_exact_allowlist_not_generic_firebase_host',
  'Generic web.app/firebaseapp matching can expose the DEV identity selector on production Firebase Hosting.');

const reviewBlock = (src.fin.match(/Revisiones financieras[\s\S]{0,3500}?Análisis crítico determinístico/) || [''])[0];
check(/reviewRequired/.test(reviewBlock), 'review_queue_filters_review_required');
check(/financialSourceStatus/.test(reviewBlock), 'review_queue_filters_and_displays_financial_source_status');
check(/pending_financial_source|pending_source_confirmation|pending_or_review/.test(reviewBlock),
  'review_queue_recognizes_canonical_pending_contract');

check(!/const\s+per\s*=\s*CX\.finStore\.curPeriod\(\)/.test(src.fin),
  'movements_do_not_read_parallel_fin_store_period');
check(!/meta:\{[^}]*period:per/.test(src.fin),
  'exports_do_not_label_with_parallel_period');
check(!/CX\.finStore\.crearMesSiguiente/.test(src.fin),
  'financial_ui_does_not_create_parallel_local_month');

check(!/const\s+cur\s*=\s*p\.currency\[p\.countries\[0\]\]/.test(src.fin),
  'finance_has_no_first_country_primary_currency');
check(!/const\s+cur\s*=\s*p\.currency\[p\.countries\[0\]\]/.test(src.ben),
  'benefits_has_no_first_country_primary_currency');
check(!/ui\.money\(cur,Math\.abs\(m\.monto\)\)/.test(src.fin),
  'movement_rows_use_each_row_currency');

check(!/const\s+fijos\s*=\s*Object\.values\(CX\.finStore\.pres\(p\.id\)\)/.test(src.core),
  'budget_uses_canonical_period_key_and_allocation');
check(!/p\.countries\.reduce\(\(a,c\)=>a\+\(fp\[c\]\.fijos\|\|0\),0\)/.test(src.fin),
  'fixed_budget_not_duplicated_across_countries');

check(!/if\(!p\.countries\.length\).*Sin filas para exportar/.test(src.fin),
  'dashboard_export_guard_uses_real_financial_rows');

const report = {
  gateId: 'tya-corte3-v175-residual-p0-r27',
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
    paymentsExecuted: 0,
    batchesImported: 0
  }
};
const out = path.join(root, '.tmp/tya-corte3-v175-residual-p0-r27');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
if (process.exitCode) {
  console.error('HOLD_TYA_CORTE3_V175_RESIDUAL_P0_R27');
  for (const item of results.filter(item => !item.pass)) console.error(`${item.id}: ${item.detail}`);
} else {
  console.log('PASS_TYA_CORTE3_V175_RESIDUAL_P0_R27');
}
