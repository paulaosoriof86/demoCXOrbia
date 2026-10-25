#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 V177 finance truth gate R29.
   Fail-closed source gate created after V177 passed R26/R27/R28 but retained
   canonical-period, currency and budget semantic leaks. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=path.resolve(process.argv[2]||'.');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src={fin:read('app/modules/finanzas.js'),core:read('app/core/finanzas-core.js'),ben:read('app/modules/beneficios.js')};
const results=[];
const check=(condition,id,detail='')=>{const pass=Boolean(condition);results.push({id,pass,detail});if(!pass)process.exitCode=1;};

// Every budget read/write in Finance UI must receive the canonical period explicitly.
check(!/CX\.finStore\.pres\(p\.id\)/.test(src.fin),
  'finance_ui_budget_has_no_implicit_local_period',
  'Dashboard still calls pres(p.id) and falls back to finStore.curPeriod(), reopening the parallel local period.');
check(!/const\s+defaults\s*=\s*\{[^}]*Coordinaci[oó]n[^}]*\}[\s\S]{0,160}?Object\.assign\(store,defaults\)/.test(src.fin),
  'finance_ui_does_not_seed_invented_budget_values',
  'Canonical finance UI must not create synthetic budget amounts when source data is absent.');

// Missing country/currency must fail closed, never inherit the first/project currency.
check(!/const\s+curOf\s*=\s*\(m\)=>[^;]*\|\|cur/.test(src.fin),
  'movement_currency_resolver_has_no_primary_currency_fallback',
  'Rows without country/currency must be pending_currency, not assigned the first project currency.');
check(!/const\s+curOfRow\s*=\s*\(r\)=>[^;]*\|\|cur/.test(src.fin),
  'account_currency_resolver_has_no_primary_currency_fallback');
check(!/bump\([^\n]*(\|\|cur)[^\n]*,'(cxp|cxc)'/.test(src.fin),
  'currency_grouping_does_not_bucket_unknown_rows_into_primary_currency');
check(!/l\.moneda\|\|cur/.test(src.fin),
  'liquidations_without_currency_are_not_bucketed_into_primary_currency');

// Cross-country financing and budget must not be summed and labelled with defCur0/first currency.
check(!/const\s+cur0=defCur0\(p\)[\s\S]{0,260}?CX\.finStore\.cxp\(p\.id\)[\s\S]{0,180}?M\(cur0,fin\)/.test(src.fin),
  'financial_analysis_does_not_label_cross_currency_financing_with_first_currency');
check(!/const\s+cur=defCur0\(p\)[\s\S]{0,2200}?Total fijo[\s\S]{0,180}?\$\{cur\}/.test(src.fin),
  'unassigned_budget_is_not_labelled_with_first_project_currency');

// Unassigned budget is budget, never actual/ejecutado and never a country metric.
check(!/const\s+fijReal=\(fp\.__unassignedBudget\?fp\.__unassignedBudget\.total:0\)/.test(src.fin),
  'unassigned_budget_is_not_reclassified_as_actual_spend',
  '__unassignedBudget.total is planned/unassigned, not real executed spend.');
check(!/d\.fijosPendienteAsignacion/.test(src.fin),
  'dashboard_does_not_reference_removed_country_budget_placeholder');

// Core budget key must use the context supplied by data, not global CX.data, and must stay explicit.
check(/CX\.finStore\.pres\(p\.id,\s*canonicalPeriodId\)/.test(src.core),
  'finance_core_budget_read_is_period_explicit');
check(!/const\s+canonicalPeriodId=CX\.data\.currentPeriodId/.test(src.core),
  'finance_core_uses_supplied_data_context_for_period',
  'Reusable CX.fin.porPais(data) must use data context, not global CX.data, including serieMensual adapters.');

const report={gateId:'tya-corte3-v177-finance-truth-r29',generatedAt:new Date().toISOString(),root,status:process.exitCode?'HOLD':'PASS',results,safeState:{sourceOnly:true,deploy:false,production:false,merge:false,writes:false,paymentsExecuted:0,batchesImported:0}};
const out=path.join(root,'.tmp/tya-corte3-v177-finance-truth-r29');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
if(process.exitCode){console.error('HOLD_TYA_CORTE3_V177_FINANCE_TRUTH_R29');for(const x of results.filter(x=>!x.pass))console.error(`${x.id}${x.detail?`: ${x.detail}`:''}`);}else console.log('PASS_TYA_CORTE3_V177_FINANCE_TRUTH_R29');
