#!/usr/bin/env node
/* CXOrbia TyA · historical payment source-safe gate.
   Functional gate name only; this is not an R33 gate. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root=resolve(new URL('../../',import.meta.url).pathname);
const dataPath=resolve(root,'app/data/tya-payment-history-source-safe.js');
const adapterPath=resolve(root,'app/adapters/tya-financial-canonical-source-safe-adapter.js');
const contractPath=resolve(root,'backend/contracts/tya-payment-history-source-safe-v1.json');

const fail=(msg)=>{console.error('HOLD_TYA_PAYMENT_HISTORY_SOURCE_SAFE_GATE: '+msg);process.exit(1);};
const assert=(cond,msg)=>{if(!cond)fail(msg);};

const source=readFileSync(dataPath,'utf8');
const sandbox={window:{}};
vm.runInNewContext(source,sandbox,{filename:dataPath});
const H=sandbox.window.CX_TYA_PAYMENT_HISTORY_SOURCE_SAFE;
assert(H&&H.sourceSafe===true,'history_projection_missing_or_not_source_safe');
assert(H.executionAllowed===false,'payment_execution_must_be_disabled');
assert(H.source&&H.source.workbookSha256==='b8e753ade03286caf3ff19e119a9b21b4dde7d5bd21d61fba70ab32719afea89','workbook_sha_mismatch');
assert(H.source.sheetRef==='Liquidación May 26','sheet_ref_mismatch');
assert(H.source.rawWorkbookIncluded===false&&H.source.piiIncluded===false,'raw_or_pii_projection_forbidden');

const may=H.periodPolicies&&H.periodPolicies['2026-05'];
assert(may&&may.paymentConfirmed===true,'may_complete_policy_missing');
assert(may.visitCount===44,'may_visit_count_must_be_44');
assert(may.countryTotals.GT.visitCount===34,'may_gt_visit_count_must_be_34');
assert(may.countryTotals.HN.visitCount===10,'may_hn_visit_count_must_be_10');
assert(may.countryTotals.GT.honorarioPaid===2040,'may_gt_honorario_paid_mismatch');
assert(may.countryTotals.GT.reimbursementPaid===5448,'may_gt_reimbursement_paid_mismatch');
assert(may.countryTotals.GT.totalPaid===7488,'may_gt_total_paid_mismatch');
assert(may.countryTotals.HN.honorarioPaid===2000,'may_hn_honorario_paid_mismatch');
assert(may.countryTotals.HN.reimbursementPaid===3861,'may_hn_reimbursement_paid_mismatch');
assert(may.countryTotals.HN.totalPaid===5861,'may_hn_total_paid_mismatch');

assert(Array.isArray(H.paidItems)&&H.paidItems.length===2,'june_paid_items_must_be_exactly_2');
const juneIds=H.paidItems.map(x=>x.hrRowId).sort();
assert(JSON.stringify(juneIds)===JSON.stringify(['JUNIO 26!2','JUNIO 26!6']),'june_paid_hrrowids_mismatch');
assert(H.paidItems.reduce((a,x)=>a+x.totalPaid,0)===451,'june_paid_gt_total_must_be_451');
assert(H.paidItems.every(x=>x.country==='GT'&&x.currency==='Q'),'june_paid_items_currency_or_country_mismatch');
assert(H.paidItems.every(x=>x.paymentConfirmed===true&&x.executionAllowed===false&&x.immutable===true),'historical_items_must_be_confirmed_immutable_non_executable');
assert(H.summary.mayPaid===44&&H.summary.mayPending===0,'may_summary_mismatch');
assert(H.summary.junePaid===2&&H.summary.junePending===42,'june_summary_mismatch');
assert(H.summary.executableBatchesCreated===0,'executable_batches_must_be_zero');
assert(H.historicalPaymentGroups.every(x=>x.groupType==='historical_payment_evidence'&&x.executionAllowed===false&&x.immutable===true),'historical_group_contract_mismatch');

const contract=JSON.parse(readFileSync(contractPath,'utf8'));
assert(contract.sourceSafe===true&&contract.executionAllowed===false,'contract_safe_state_mismatch');
assert(contract.semantics.paymentConfirmedMayCoexistWithFinancialReview===true,'payment_review_independence_contract_missing');
assert(contract.identity.forbiddenMatching.includes('shopperNameOnly'),'name_only_match_must_be_forbidden');

const adapter=readFileSync(adapterPath,'utf8');
[
  "paymentHistoryMode:'historical_source_safe'",
  "paymentExecutionAllowed:false",
  "historicalPaymentGroupId",
  "paymentState:'payment_confirmed'",
  "CX.data.historicalPaymentGroups",
  "sameTruthForFinanzasAndBeneficios:true"
].forEach(token=>assert(adapter.includes(token),'adapter_contract_missing:'+token));

const forbiddenProjectionTerms=['Johanna Salgado','Freddy Hernández','cuenta bancaria','DPI','telefono','correo@'];
for(const term of forbiddenProjectionTerms)assert(!source.toLowerCase().includes(term.toLowerCase()),'pii_or_raw_term_found:'+term);

console.log(JSON.stringify({
  decision:'PASS_TYA_PAYMENT_HISTORY_SOURCE_SAFE_GATE',
  sourceSha:H.source.workbookSha256,
  may:{visits:44,paid:44,pending:0,financialReviewsPreserved:2,GT:H.periodPolicies['2026-05'].countryTotals.GT,HN:H.periodPolicies['2026-05'].countryTotals.HN},
  june:{visits:44,paid:2,pending:42,paidHrRowIds:juneIds,paidGT:451,paidHN:0},
  historicalGroups:H.historicalPaymentGroups.length,
  executableBatchesCreated:0,
  sourceSafe:true
},null,2));
