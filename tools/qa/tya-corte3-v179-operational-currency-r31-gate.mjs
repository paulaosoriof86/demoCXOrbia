#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 V179 operational currency gate R31.
   Added after V179 passed R26-R30 but retained period-key drift, unresolved-currency
   actions and unverified export semantics. Source-only and fail-closed. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=path.resolve(process.argv[2]||'.');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src={fin:read('app/modules/finanzas.js'),core:read('app/core/finanzas-core.js')};
const results=[];
const check=(condition,id,detail='')=>{const pass=Boolean(condition);results.push({id,pass,detail});if(!pass)process.exitCode=1;};
const block=(start,end)=>{const a=src.fin.indexOf(start);const b=a>=0?src.fin.indexOf(end,a+start.length):-1;return a>=0?src.fin.slice(a,b>=0?b:Math.min(src.fin.length,a+7000)):'';};
const financingBlock=block("const af=host.querySelector('#addFin')","const cxpF=");
const movementFormBlock=block("host.querySelectorAll('[data-new]')","const acx=");
const accountFormBlock=block("host.querySelectorAll('[data-cuenta]')","host.querySelectorAll('[data-abono]')");
const accountEditBlock=block("host.querySelectorAll('[data-cxdet]')","host.querySelectorAll('[data-drill]')");
const exportBlock=block("const mx=host.querySelector('#movExport')","const ps=host.querySelector('#perSel')");
const lotesBlock=block('const lotesReales=','const html=`');

const budgetArgs=[...src.fin.matchAll(/CX\.finStore\.pres\(p\.id,\s*([^\)]+)\)/g)].map(m=>m[1].trim());
check(new Set(budgetArgs).size<=1 && budgetArgs.every(x=>/canonicalPeriodId/.test(x)),
  'finance_budget_uses_one_canonical_period_identity',
  `Budget callers use mixed keys: ${[...new Set(budgetArgs)].join(', ')||'none'}.`);
check(!/CX\.finStore\.pres\(p\.id,\s*CX\.data\.currentPeriodId\)/.test(src.fin),
  'dashboard_budget_does_not_use_global_period');

for(const [id,pattern] of [
  ['no_raw_cross_currency_income_total',/const\s+ing=movs\.filter\(m=>m\.monto>0\)\.reduce/],
  ['no_raw_cross_currency_expense_total',/const\s+egr=movs\.filter\(m=>m\.monto<0\)\.reduce/],
  ['no_raw_cross_currency_operating_income_total',/const\s+ingOper=movs\.filter/],
  ['no_raw_cross_currency_remittance_total',/const\s+remesas=movs\.filter/],
  ['no_raw_cross_currency_manual_payable_total',/const\s+cxpManual=CX\.finStore\.cxp\([^\)]*\)\.reduce/],
  ['no_raw_cross_currency_receivable_total',/const\s+cxc=CX\.finStore\.cxc\([^\)]*\)\.reduce/]
]) check(!pattern.test(src.fin),id,'Use aggByCur after pending_currency exclusion.');
check(!/const\s+porTipoIng=\{\};\s*movs\.filter\(m=>m\.monto>0\)/.test(src.fin),
  'income_type_raw_total_does_not_include_unresolved_currency');
check(/movs\.filter\(m=>m\.monto>0\s*&&\s*curOf\(m\)!==PENDING_CURRENCY\)/.test(src.fin),
  'income_type_grouping_excludes_pending_currency_before_sum');
check(!/ui\.money\(curOf\(m\),/.test(src.fin),
  'visible_movement_rows_do_not_render_pending_currency_as_money',
  'Tables/drills still call ui.money(curOf(m), ...) without a fail-closed branch.');

check(/#fnP['"]\)\.addEventListener\(['"]change/.test(financingBlock) || /id=['"]fnP['"][\s\S]{0,900}?addEventListener\(['"]change/.test(financingBlock),
  'financing_form_updates_currency_from_country_selection');
check(/if\s*\(\s*!\s*(pais|fnP|country)|PENDING_CURRENCY[\s\S]{0,200}?return|Selecciona.*pa[ií]s[\s\S]{0,120}?return/i.test(financingBlock),
  'financing_form_blocks_save_without_country_or_currency');
check(/#mvPais['"]\)\.addEventListener\(['"]change/.test(movementFormBlock) || /id=['"]mvPais['"][\s\S]{0,1200}?addEventListener\(['"]change/.test(movementFormBlock),
  'movement_form_updates_currency_from_country_selection');
check(/if\s*\(\s*!\s*(pais|mvPais|country)|PENDING_CURRENCY[\s\S]{0,200}?return|Selecciona.*pa[ií]s[\s\S]{0,120}?return/i.test(movementFormBlock),
  'movement_form_blocks_save_without_country_or_currency');
check(/#ctPais['"]\)\.addEventListener\(['"]change/.test(accountFormBlock) || /id=['"]ctPais['"][\s\S]{0,1000}?addEventListener\(['"]change/.test(accountFormBlock),
  'account_form_updates_currency_from_country_selection');
check(/if\s*\(\s*!\s*(pais|ctPais|country)|PENDING_CURRENCY[\s\S]{0,200}?return|Selecciona.*pa[ií]s[\s\S]{0,120}?return/i.test(accountFormBlock),
  'account_form_blocks_save_without_country_or_currency');

check(/id="cxPais"|id="cxMoneda"/.test(accountEditBlock),
  'account_edit_modal_can_resolve_country_or_currency');
check(!/data-abono="\$\{r\.id\}"/.test(src.fin) || /currencyOf\(r\)!==PENDING_CURRENCY[\s\S]{0,220}?data-abono/.test(src.fin),
  'account_payment_action_is_hidden_or_blocked_for_pending_currency');
check(!/\?`<button[^`]*data-devfin[\s\S]{0,120}?:ui\.bdg\('saldado','g'\)/.test(src.fin),
  'unresolved_active_financing_is_not_labelled_settled');
check(/Pendiente de moneda[\s\S]{0,260}(Bloqueado|Revisi[oó]n|sin moneda)/.test(financingBlock),
  'unresolved_financing_has_explicit_review_state');

check(/pendingCurrencyRows\.length[\s\S]{0,500}(payLote|Pagar lote)|(payLote|Pagar lote)[\s\S]{0,500}pendingCurrencyRows\.length/.test(src.fin),
  'payment_lot_is_blocked_when_currency_review_exists');
check(/pending_currency|PENDING_CURRENCY/.test(lotesBlock) && /Revisi[oó]n|Bloqueado/.test(lotesBlock),
  'lot_with_pending_currency_has_review_state');
check(!/_m\(r\.cur,r\.monto\)/.test(src.fin) || /r\.cur===PENDING_CURRENCY[\s\S]{0,220}?Pendiente de moneda/.test(src.fin),
  'lot_card_does_not_render_pending_currency_as_money');

check(/if\s*\(\s*pendingCurrencyRows\.length\s*\)[\s\S]{0,220}?return/.test(exportBlock),
  'export_blocks_when_currency_review_rows_exist',
  'Custom reviewSection is not an established reportKit contract; block export until no unresolved rows.');
check(/Movimientos:\s*['"]?\s*\+?exportMovs\.length/.test(src.fin),
  'export_summary_count_matches_exported_rows');
check(!/<\/div>y queda editable\.<\/div>/.test(src.fin),
  'finance_budget_copy_has_balanced_visible_markup');

const report={gateId:'tya-corte3-v179-operational-currency-r31',generatedAt:new Date().toISOString(),root,status:process.exitCode?'HOLD':'PASS',results,safeState:{sourceOnly:true,deploy:false,production:false,merge:false,writes:false,paymentsExecuted:0,batchesImported:0}};
const out=path.join(root,'.tmp/tya-corte3-v179-operational-currency-r31');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
if(process.exitCode){console.error('HOLD_TYA_CORTE3_V179_OPERATIONAL_CURRENCY_R31');for(const x of results.filter(x=>!x.pass))console.error(`${x.id}${x.detail?`: ${x.detail}`:''}`);}else console.log('PASS_TYA_CORTE3_V179_OPERATIONAL_CURRENCY_R31');
