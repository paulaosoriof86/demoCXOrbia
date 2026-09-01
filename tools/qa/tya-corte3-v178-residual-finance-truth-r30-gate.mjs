#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 V178 residual finance-truth gate R30.
   Added after V178 passed R26-R29 but retained unresolved-currency,
   export, budget-editor and financing/lote currency leaks. Source-only,
   fail-closed; runtime/mobile/export gates remain mandatory after apply. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=path.resolve(process.argv[2]||'.');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src={
  fin:read('app/modules/finanzas.js'),
  core:read('app/core/finanzas-core.js'),
  ben:read('app/modules/beneficios.js')
};
const results=[];
const check=(condition,id,detail='')=>{const pass=Boolean(condition);results.push({id,pass,detail});if(!pass)process.exitCode=1;};

// Missing-currency records must enter review before monetary aggregation.
check(/movs\.forEach\(m=>\{const cu=curOf\(m\);\s*if\(cu===PENDING_CURRENCY\)\{pendingCurrencyRows\.push\(\{kind:'mov'/.test(src.fin),
  'movement_without_currency_is_reviewed_before_bump',
  'A movement with pending_currency still reaches bump() and becomes a monetary bucket.');
check(/pendingCurrencyRows\.(length|map|forEach)/.test(src.fin),
  'pending_currency_rows_are_visible_or_counted',
  'pendingCurrencyRows is populated but never surfaced to a human review queue.');
check(/pendingCurrencyRows\.length[\s\S]{0,800}(movExport|Sin filas|export)/.test(src.fin) ||
      /rows:movs\.filter\([\s\S]{0,180}currencyOf/.test(src.fin),
  'movement_export_blocks_or_excludes_unresolved_currency',
  'The export still includes rows whose currency is unresolved.');

// Export analytics must remain grouped by real currency.
check(!/const\s+byCat=\{\};\s*movs\.forEach\(m=>\{const key=\(m\.monto<0\?'Egreso':'Ingreso'\);byCat\[key\]=\(byCat\[key\]\|\|0\)\+Math\.abs\(m\.monto\)/.test(src.fin),
  'movement_export_chart_is_not_cross_currency',
  'The chart sums GTQ and HNL into one Ingreso/Egreso series.');

// Unassigned budget must not be labelled with the first project currency.
check(!/Presupuesto mensual[\s\S]{0,900}\$\{cur\}\s+\$\{\(\+store\[k\]\)/.test(src.fin),
  'monthly_budget_rows_have_no_first_currency_label');
check(!/Monto mensual \(\$\{cur\}\)/.test(src.fin),
  'monthly_budget_editor_has_no_first_currency_label');
check(!/Con <b>＋ Mes siguiente<\/b>/.test(src.fin),
  'budget_copy_does_not_reference_removed_parallel_month');

// Financing and CxP/CxC editors must resolve currency from selected/recorded country.
check(!/p\.currency\[f\.pais\]\|\|cur/.test(src.fin),
  'financing_views_have_no_first_currency_fallback');
check(!/Monto \(\$\{cur\}\)[\s\S]{0,240}?id="fnP"/.test(src.fin),
  'financing_editor_currency_follows_selected_country');
check(!/Saldo \(\$\{cur\}\)/.test(src.fin) && !/id="ctMonto"[\s\S]{0,220}?id="ctPais"/.test(src.fin),
  'cxp_cxc_editors_do_not_use_first_currency');
check(!/cur:ls\[0\]\.moneda\|\|cur/.test(src.fin),
  'payment_lot_without_currency_is_not_labelled_with_first_currency');

// Dashboard budget must use the module data context, not a global period.
check(!/CX\.finStore\.pres\(p\.id,\s*CX\.data\.currentPeriodId\)/.test(src.fin),
  'dashboard_budget_uses_module_data_context_period');

const report={
  gateId:'tya-corte3-v178-residual-finance-truth-r30',
  generatedAt:new Date().toISOString(),
  root,
  status:process.exitCode?'HOLD':'PASS',
  results,
  safeState:{sourceOnly:true,deploy:false,production:false,merge:false,writes:false,paymentsExecuted:0,batchesImported:0}
};
const out=path.join(root,'.tmp/tya-corte3-v178-residual-finance-truth-r30');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
if(process.exitCode){
  console.error('HOLD_TYA_CORTE3_V178_RESIDUAL_FINANCE_TRUTH_R30');
  for(const x of results.filter(x=>!x.pass))console.error(`${x.id}${x.detail?`: ${x.detail}`:''}`);
}else console.log('PASS_TYA_CORTE3_V178_RESIDUAL_FINANCE_TRUTH_R30');
