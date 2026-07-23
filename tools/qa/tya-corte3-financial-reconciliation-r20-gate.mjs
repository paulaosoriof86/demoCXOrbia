#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function arg(name, fallback){ const i=args.indexOf(name); return i>=0 ? args[i+1] : fallback; }
const currentPath = arg('--current', '.tmp/phase-a-financial-r14c-live-hr/financial-live-hr-reconciliation-r14c.source-safe.json');
const baselinePath = arg('--baseline', 'backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json');
const outDir = arg('--out', '.tmp/tya-corte3-financial-reconciliation-r20');

const blockers=[];
const reviewRequired=[];
const warnings=[];
const add=(arr,code,detail='')=>arr.push(detail?`${code}:${detail}`:code);
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const isAccepted=x=>['exact_full_composite_linked','exact_protected_operational_linked'].includes(x?.matchStatus);
const stableIdentity=x=>[x?.sourceRecordId,x?.periodKey,x?.country,x?.currency].map(v=>String(v??'')).join('|');

let current=null;
let baseline=null;
try{ current=readJson(currentPath); }catch(e){ add(blockers,'current_report_unreadable',e.message); }
try{ baseline=readJson(baselinePath); }catch(e){ add(blockers,'baseline_report_unreadable',e.message); }

const expectedPeriods=['2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'];

if(current&&baseline){
  if(current.reportId!=='phase-a-financial-live-hr-reconciliation-r14c') add(blockers,'report_id_invalid',String(current.reportId||''));
  if(current.tenantId!=='tya'||current.projectId!=='cinepolis') add(blockers,'scope_invalid',`${current.tenantId}/${current.projectId}`);
  if(current.sourceWorkbookSha256!==baseline.sourceWorkbookSha256) add(blockers,'financial_source_sha_changed',`${current.sourceWorkbookSha256}/${baseline.sourceWorkbookSha256}`);

  const safe=current.safeState||{};
  if(safe.sourceSafe!==true) add(blockers,'source_safe_required');
  if(safe.piiOutput!==false) add(blockers,'pii_output_must_be_false');
  for(const key of ['rawWorkbookRead','rawWorkbookCommitted','providerReads','providerWrites','imports','paymentsExecuted','deploy','production']){
    if(safe[key]!==false) add(blockers,'unsafe_state',`${key}=${String(safe[key])}`);
  }

  const cs=current.summary||{};
  const bs=baseline.summary||{};
  if(cs.hrVisits!==616) add(blockers,'hr_visit_count_invalid',String(cs.hrVisits));
  if(cs.financialLiquidationRows!==bs.financialLiquidationRows) add(blockers,'financial_row_count_changed',`${cs.financialLiquidationRows}/${bs.financialLiquidationRows}`);
  if(cs.financialLiquidationRows!==247) add(blockers,'financial_row_count_not_247',String(cs.financialLiquidationRows));
  if(cs.reviewLiquidationRows!==cs.financialLiquidationRows-cs.exactAcceptedLinks) add(blockers,'review_count_inconsistent');
  const statusSum=Object.values(cs.statusCounts||{}).reduce((n,v)=>n+Number(v||0),0);
  if(statusSum!==cs.financialLiquidationRows) add(blockers,'status_count_sum_invalid',`${statusSum}/${cs.financialLiquidationRows}`);

  const coverage=current.coverageByPeriodCountry||{};
  for(const period of expectedPeriods){
    if(!coverage[period]){ add(blockers,'period_coverage_missing',period); continue; }
    for(const [country,expected] of [['GT',34],['HN',10]]){
      const row=coverage[period]?.[country];
      if(!row) add(blockers,'country_coverage_missing',`${period}/${country}`);
      else if(Number(row.hrVisits)!==expected) add(blockers,'hr_country_count_invalid',`${period}/${country}/${row.hrVisits}`);
    }
  }
  for(const period of Object.keys(coverage)) if(!expectedPeriods.includes(period)) add(blockers,'unexpected_period_in_coverage',period);

  const currentRows=Array.isArray(current.liquidationCandidates)?current.liquidationCandidates:[];
  const baselineRows=Array.isArray(baseline.liquidationCandidates)?baseline.liquidationCandidates:[];
  if(currentRows.length!==cs.financialLiquidationRows) add(blockers,'current_candidate_count_invalid',`${currentRows.length}/${cs.financialLiquidationRows}`);
  if(baselineRows.length!==bs.financialLiquidationRows) add(blockers,'baseline_candidate_count_invalid',`${baselineRows.length}/${bs.financialLiquidationRows}`);

  const currentMap=new Map();
  const baselineMap=new Map();
  for(const row of currentRows){
    if(!row?.sourceRecordId){ add(blockers,'current_source_record_id_missing'); continue; }
    if(currentMap.has(row.sourceRecordId)) add(blockers,'current_source_record_duplicate',row.sourceRecordId);
    currentMap.set(row.sourceRecordId,row);
  }
  for(const row of baselineRows){
    if(!row?.sourceRecordId){ add(blockers,'baseline_source_record_id_missing'); continue; }
    if(baselineMap.has(row.sourceRecordId)) add(blockers,'baseline_source_record_duplicate',row.sourceRecordId);
    baselineMap.set(row.sourceRecordId,row);
  }

  const acceptedVisitIds=new Map();
  for(const [id,row] of currentMap){
    const prior=baselineMap.get(id);
    if(!prior){ add(reviewRequired,'new_financial_record',id); continue; }
    if(stableIdentity(row)!==stableIdentity(prior)) add(blockers,'financial_record_identity_changed',id);
    const beforeAccepted=isAccepted(prior);
    const nowAccepted=isAccepted(row);
    if(beforeAccepted&&!nowAccepted) add(blockers,'accepted_link_lost',id);
    if(beforeAccepted&&nowAccepted){
      for(const field of ['visitId','hrRowId','paymentItemId']) if(String(row[field]??'')!==String(prior[field]??'')) add(blockers,'accepted_link_identity_changed',`${id}/${field}`);
    }
    if(!beforeAccepted&&nowAccepted) add(reviewRequired,'new_exact_acceptance_requires_human_review',id);
    if(!beforeAccepted&&!nowAccepted&&String(row.matchStatus||'')!==String(prior.matchStatus||'')) add(reviewRequired,'review_status_changed',`${id}/${prior.matchStatus}->${row.matchStatus}`);
    if(nowAccepted){
      if(!row.visitId||!row.hrRowId||!row.paymentItemId) add(blockers,'accepted_link_missing_keys',id);
      const existing=acceptedVisitIds.get(row.visitId);
      if(existing&&existing!==id) add(blockers,'duplicate_visit_linked_to_multiple_financial_rows',`${row.visitId}/${existing}/${id}`);
      acceptedVisitIds.set(row.visitId,id);
    }
  }
  for(const id of baselineMap.keys()) if(!currentMap.has(id)) add(blockers,'financial_record_missing',id);

  const ledger=Array.isArray(current.ledgerPaymentEvidenceCandidates)?current.ledgerPaymentEvidenceCandidates:[];
  if(ledger.length!==Number(cs.itemizedLedgerRows||0)) add(blockers,'ledger_candidate_count_invalid',`${ledger.length}/${cs.itemizedLedgerRows}`);
  for(const row of ledger){
    if(row.reviewRequired!==true) add(blockers,'ledger_must_remain_review_required',String(row.sourceRecordId||''));
    if(row.paymentBatchId!==null||row.confirmedBy!==null) add(blockers,'ledger_unverified_confirmation_present',String(row.sourceRecordId||''));
  }

  if(cs.exactAcceptedLinks<bs.exactAcceptedLinks) add(blockers,'exact_acceptance_regressed',`${cs.exactAcceptedLinks}/${bs.exactAcceptedLinks}`);
  if(cs.exactAcceptedLinks>bs.exactAcceptedLinks) add(reviewRequired,'exact_acceptance_increased',`${cs.exactAcceptedLinks}/${bs.exactAcceptedLinks}`);
  if(cs.reviewQueue!==bs.reviewQueue) add(reviewRequired,'review_queue_count_changed',`${cs.reviewQueue}/${bs.reviewQueue}`);
  if(current.hrGeneratedAt===baseline.hrGeneratedAt) add(warnings,'hr_generated_at_unchanged');
}

const decision=blockers.length
  ? 'HOLD_CORTE3_FINANCIAL_RECONCILIATION_R20'
  : reviewRequired.length
    ? 'HOLD_CORTE3_FINANCIAL_DELTA_REQUIRES_HUMAN_REVIEW'
    : 'PASS_CORTE3_FINANCIAL_RECONCILIATION_R20_STABLE';

const report={
  schemaVersion:'1.0.0',
  gate:'tya-corte3-financial-reconciliation-r20',
  generatedAt:new Date().toISOString(),
  decision,
  ok:blockers.length===0&&reviewRequired.length===0,
  currentPath,
  baselinePath,
  summary:current?.summary||null,
  baselineSummary:baseline?.summary||null,
  blockers,
  reviewRequired,
  warnings,
  safeState:{sourceSafe:true,piiOutput:false,repositoryWrites:false,dataWrites:false,imports:false,payments:false,deploy:false,production:false}
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),[
  '# Corte 3 — conciliación financiera R20',
  '',
  `Decisión: **${decision}**`,
  '',
  `- Exactos actuales: ${report.summary?.exactAcceptedLinks??'n/a'}`,
  `- Exactos baseline: ${report.baselineSummary?.exactAcceptedLinks??'n/a'}`,
  `- Filas financieras: ${report.summary?.financialLiquidationRows??'n/a'}`,
  `- Review queue: ${report.summary?.reviewQueue??'n/a'}`,
  '',
  '## Bloqueos',
  ...(blockers.length?blockers.map(x=>`- ${x}`):['- none']),
  '',
  '## Revisión humana requerida',
  ...(reviewRequired.length?reviewRequired.map(x=>`- ${x}`):['- none']),
  '',
  '## Advertencias',
  ...(warnings.length?warnings.map(x=>`- ${x}`):['- none']),
  '',
  'Sin importaciones, pagos, deploy, producción ni writes.'
].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(!report.ok) process.exit(1);
