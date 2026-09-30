#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 V176 semantic residual P0 gate R28.
   Fail-closed source gate added after auditing V176. It avoids token-only
   false positives and blocks the remaining functional leaks before direct apply. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.argv[2] || '.');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const src = {
  fin: read('app/modules/finanzas.js'),
  core: read('app/core/finanzas-core.js'),
  ben: read('app/modules/beneficios.js'),
  app: read('app/app.js'),
  css: read('app/styles/layout.css')
};
const results=[];
const check=(condition,id,detail='')=>{const pass=Boolean(condition);results.push({id,pass,detail});if(!pass)process.exitCode=1;};

// DEV selector: no generic Firebase suffix and an explicit exact-host/build guard.
check(/_isDevAccess\(\)/.test(src.app)&&/return false/.test(src.app),'dev_access_guard_found');
check(!/hostname[^\n]{0,160}(includes|endsWith)\([^\n]{0,80}(web\.app|firebaseapp)/.test(src.app),
  'dev_access_no_generic_firebase_suffix');
check(/CX_DEV_BUILD/.test(src.app)&&/_DEV_HOST_ALLOWLIST|devHostAllowlist/.test(src.app),
  'dev_access_explicit_build_or_exact_allowlist');

// Review queue: canonical pending contracts must drive inclusion and be visible.
check(/isReviewByContract/.test(src.fin)&&/reviewRequired===true/.test(src.fin)&&/financialSourceStatus==='pending_or_review'/.test(src.fin)&&/liquidationState==='pending_financial_source'/.test(src.fin)&&/paymentState==='pending_source_confirmation'/.test(src.fin),
  'review_queue_uses_canonical_pending_contracts');
check(/financialSourceStatus<\/th>/.test(src.fin)&&/r\.financialSourceStatus/.test(src.fin),
  'review_queue_displays_real_financial_source_status');

// Single canonical period: no parallel local month creation or reading in Finance UI.
check(!/CX\.finStore\.curPeriod\(\)/.test(src.fin),
  'finance_ui_does_not_read_parallel_fin_period');
check(!/CX\.finStore\.crearMesSiguiente/.test(src.fin),
  'finance_ui_does_not_create_parallel_fin_period',
  'The + Mes siguiente action must create/select a canonical CX.data period or remain disabled.');
check(/currentPeriodId|canonMonth|canonCurrentId/.test(src.fin),
  'finance_ui_references_canonical_period');

// Every visible monetary surface must retain row currency.
check(!/ui\.money\(cur,Math\.abs\(m\.monto\)\)/.test(src.fin),
  'movement_drill_uses_row_currency');
check(!/ui\.money\(cur,val\)/.test(src.fin),
  'income_type_rows_are_not_cross_currency_aggregates');
check(!/ui\.money\(cur,r\.saldo/.test(src.fin),
  'cxp_rows_use_row_country_currency');
check(!/const\s+cur\s*=\s*_benCurSet\[0\]/.test(src.ben),
  'benefits_has_no_project_first_currency_fallback');
check(!/ui\.bar\([\s\S]{0,180}?ui\.money\(cur,(hon|reemb)\)/.test(src.ben),
  'benefits_comparison_is_grouped_by_real_currency');

// Budget must use one canonical key and must not replicate an unassigned total in every country.
check(!/CX\.finStore\.pres\(p\.id\)\)/.test(src.core),
  'finance_core_budget_read_includes_canonical_period');
check(!/fijosPendienteAsignacion:fijosPresupuestoTotal/.test(src.core),
  'unassigned_budget_is_not_attached_to_every_country_record');
check(!/p\.countries\.reduce\(\(a,c\)=>a\+\(fp\[c\]\.fijos\|\|0\),0\)/.test(src.fin),
  'dashboard_does_not_reaggregate_country_budget_placeholders');

// Export and mobile surfaces.
check(/hasRows|canExport/.test(src.fin)&&/Sin filas financieras reales/.test(src.fin),
  'dashboard_export_fails_closed_without_financial_rows');
check(/scroll-hint/.test(src.fin)&&/scroll-hint/.test(src.ben)&&/Desliza/.test(src.css),
  'mobile_scroll_hint_contract_is_complete');

const report={gateId:'tya-corte3-v176-semantic-residual-p0-r28',generatedAt:new Date().toISOString(),root,status:process.exitCode?'HOLD':'PASS',results,safeState:{sourceOnly:true,deploy:false,production:false,merge:false,writes:false,paymentsExecuted:0,batchesImported:0}};
const out=path.join(root,'.tmp/tya-corte3-v176-semantic-residual-p0-r28');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
if(process.exitCode){
  console.error('HOLD_TYA_CORTE3_V176_SEMANTIC_RESIDUAL_P0_R28');
  for(const item of results.filter(x=>!x.pass)) console.error(`${item.id}${item.detail?`: ${item.detail}`:''}`);
}else console.log('PASS_TYA_CORTE3_V176_SEMANTIC_RESIDUAL_P0_R28');
