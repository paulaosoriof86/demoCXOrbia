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
const safeRecord=x=>({
  sourceRecordId:x?.sourceRecordId||null,
  periodKey:x?.periodKey||null,
  country:x?.country||null,
  currency:x?.currency||null,
  hrRowId:x?.hrRowId||null,
  visitId:x?.visitId||null,
  paymentItemId:x?.paymentItemId||null,
  matchStatus:x?.matchStatus||null,
  matchMethod:x?.matchMethod||null,
  candidateCount:Number(x?.candidateCount||0),
  honorario:x?.honorario??null,
  boleto:x?.boleto??null,
  combo:x?.combo??null,
  total:x?.total??null
});

let current=null;
let baseline=null;
try{ current=readJson(currentPath); }catch(e){ add(blockers,'current_report_unreadable',e.message); }
try{ baseline=readJson(baselinePath); }catch(e){ add(blockers,'baseline_report_unreadable',e.message); }

const expectedPeriods=['2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'];
const diagnostics={
  stableAcceptedLinks:0,
  derivedVisitIdDrift:[],
  canonicalHrRowIdentityChanges:[],
  lostAcceptedLinks:[],
  newExactAcceptances:[],
  reviewStatusChanges:[],
  newFinancialRecords:[],
  missingFinancialRecords:[],
  exactAcceptedDelta:0,
  reviewQueueDelta:0,
  byPeriodCountry:{newExact:{},lostExact:{},statusChanged:{}}
};
function bump(bucket,row){
  const key=`${row?.periodKey||'unknown'}|${row?.country||'unknown'}`;
  bucket[key]=(bucket[key]||0)+1;
}

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
  diagnostics.exactAcceptedDelta=Number(cs.exactAcceptedLinks||0)-Number(bs.exactAcceptedLinks||0);
  diagnostics.reviewQueueDelta=Number(cs.reviewQueue||0)-Number(bs.reviewQueue||0);
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
  const acceptedHrRows=new Map();
  for(const [id,row] of currentMap){
    const prior=baselineMap.get(id);
    if(!prior){
      diagnostics.newFinancialRecords.push(safeRecord(row));
      add(reviewRequired,'new_financial_record',id);
      continue;
    }
    if(stableIdentity(row)!==stableIdentity(prior)) add(blockers,'financial_record_identity_changed',id);
    const beforeAccepted=isAccepted(prior);
    const nowAccepted=isAccepted(row);

    if(beforeAccepted&&!nowAccepted){
      const item={sourceRecordId:id,before:safeRecord(prior),after:safeRecord(row)};
      diagnostics.lostAcceptedLinks.push(item);
      bump(diagnostics.byPeriodCountry.lostExact,row);
      add(reviewRequired,'accepted_link_lost_requires_human_review',id);
    }

    if(beforeAccepted&&nowAccepted){
      if(String(row.hrRowId||'')!==String(prior.hrRowId||'')){
        const item={sourceRecordId:id,before:safeRecord(prior),after:safeRecord(row)};
        diagnostics.canonicalHrRowIdentityChanges.push(item);
        add(blockers,'accepted_canonical_hr_row_changed',id);
      }else{
        diagnostics.stableAcceptedLinks++;
        if(String(row.visitId||'')!==String(prior.visitId||'')||String(row.paymentItemId||'')!==String(prior.paymentItemId||'')){
          diagnostics.derivedVisitIdDrift.push({sourceRecordId:id,hrRowId:row.hrRowId,beforeVisitId:prior.visitId||null,afterVisitId:row.visitId||null,beforePaymentItemId:prior.paymentItemId||null,afterPaymentItemId:row.paymentItemId||null});
        }
      }
    }

    if(!beforeAccepted&&nowAccepted){
      const item={sourceRecordId:id,before:safeRecord(prior),after:safeRecord(row)};
      diagnostics.newExactAcceptances.push(item);
      bump(diagnostics.byPeriodCountry.newExact,row);
      add(reviewRequired,'new_exact_acceptance_requires_human_review',id);
    }
    if(!beforeAccepted&&!nowAccepted&&String(row.matchStatus||'')!==String(prior.matchStatus||'')){
      const item={sourceRecordId:id,before:safeRecord(prior),after:safeRecord(row)};
      diagnostics.reviewStatusChanges.push(item);
      bump(diagnostics.byPeriodCountry.statusChanged,row);
      add(reviewRequired,'review_status_changed',`${id}/${prior.matchStatus}->${row.matchStatus}`);
    }
    if(nowAccepted){
      if(!row.visitId||!row.hrRowId||!row.paymentItemId) add(blockers,'accepted_link_missing_keys',id);
      const existingVisit=acceptedVisitIds.get(row.visitId);
      if(existingVisit&&existingVisit!==id) add(blockers,'duplicate_visit_linked_to_multiple_financial_rows',`${row.visitId}/${existingVisit}/${id}`);
      acceptedVisitIds.set(row.visitId,id);
      const existingRow=acceptedHrRows.get(row.hrRowId);
      if(existingRow&&existingRow!==id) add(blockers,'duplicate_hr_row_linked_to_multiple_financial_rows',`${row.hrRowId}/${existingRow}/${id}`);
      acceptedHrRows.set(row.hrRowId,id);
    }
  }
  for(const [id,row] of baselineMap){
    if(!currentMap.has(id)){
      diagnostics.missingFinancialRecords.push(safeRecord(row));
      add(blockers,'financial_record_missing',id);
    }
  }

  const ledger=Array.isArray(current.ledgerPaymentEvidenceCandidates)?current.ledgerPaymentEvidenceCandidates:[];
  if(ledger.length!==Number(cs.itemizedLedgerRows||0)) add(blockers,'ledger_candidate_count_invalid',`${ledger.length}/${cs.itemizedLedgerRows}`);
  for(const row of ledger){
    if(row.reviewRequired!==true) add(blockers,'ledger_must_remain_review_required',String(row.sourceRecordId||''));
    if(row.paymentBatchId!==null||row.confirmedBy!==null) add(blockers,'ledger_unverified_confirmation_present',String(row.sourceRecordId||''));
  }

  if(diagnostics.derivedVisitIdDrift.length) add(warnings,'derived_visit_id_drift_with_stable_hr_row',String(diagnostics.derivedVisitIdDrift.length));
  if(cs.exactAcceptedLinks!==bs.exactAcceptedLinks) add(reviewRequired,'exact_acceptance_count_changed',`${cs.exactAcceptedLinks}/${bs.exactAcceptedLinks}`);
  if(cs.reviewQueue!==bs.reviewQueue) add(reviewRequired,'review_queue_count_changed',`${cs.reviewQueue}/${bs.reviewQueue}`);
  if(current.hrGeneratedAt===baseline.hrGeneratedAt) add(warnings,'hr_generated_at_unchanged');
}

const decision=blockers.length
  ? 'HOLD_CORTE3_FINANCIAL_RECONCILIATION_R20'
  : reviewRequired.length
    ? 'HOLD_CORTE3_FINANCIAL_DELTA_REQUIRES_HUMAN_REVIEW'
    : 'PASS_CORTE3_FINANCIAL_RECONCILIATION_R20_STABLE';

const report={
  schemaVersion:'1.1.0',
  gate:'tya-corte3-financial-reconciliation-r20',
  generatedAt:new Date().toISOString(),
  decision,
  ok:blockers.length===0&&reviewRequired.length===0,
  currentPath,
  baselinePath,
  summary:current?.summary||null,
  baselineSummary:baseline?.summary||null,
  diagnostics,
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
  `- Enlaces aceptados con hrRowId estable: ${diagnostics.stableAcceptedLinks}`,
  `- Drift solo de IDs derivados: ${diagnostics.derivedVisitIdDrift.length}`,
  `- Cambios de hrRowId canónico: ${diagnostics.canonicalHrRowIdentityChanges.length}`,
  `- Enlaces exactos nuevos: ${diagnostics.newExactAcceptances.length}`,
  `- Enlaces exactos perdidos: ${diagnostics.lostAcceptedLinks.length}`,
  `- Cambios de estado en revisión: ${diagnostics.reviewStatusChanges.length}`,
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
