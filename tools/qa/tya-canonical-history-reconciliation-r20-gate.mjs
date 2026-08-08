#!/usr/bin/env node
/*
  Gate R20/R21 — comprueba que toda la HR use una sola verdad canónica.

  R21 extiende la verdad operativa con disponibilidad independiente de la
  asignación. Un control financiero R14C exacto solo convierte la visita en
  candidata de cruce pendiente; nunca en liquidada o pagada.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import {
  deriveCanonicalVisitState,
  summarizeCanonicalPeriods,
  validateCanonicalHistory
} from '../hr-source/tya-canonical-visit-state-r20.mjs';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const input=path.resolve(valueOf('--input','app/data/tya-hr-source-safe-periods.js'));
const outDir=path.resolve(valueOf('--out','.tmp/tya-canonical-history-r20'));
const expectedPeriods=Number(process.env.CXORBIA_EXPECT_PERIODS||14);
const expectedVisits=Number(process.env.CXORBIA_EXPECT_VISITS||616);
const expectedNormalizer=process.env.CXORBIA_EXPECT_SEMANTIC_NORMALIZER||'r15g+r20+r21-eligibility';
fs.mkdirSync(outDir,{recursive:true});

function fail(message){throw new Error(message);}
function readSnapshot(){
  if(!fs.existsSync(input))fail(`Missing input: ${input}`);
  const sandbox={window:{}};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(input,'utf8'),sandbox,{filename:input,timeout:5000});
  const value=sandbox.window.CX_TYA_HR_SOURCE_SAFE;
  if(!value)fail('Missing window.CX_TYA_HR_SOURCE_SAFE.');
  return JSON.parse(JSON.stringify(value));
}
function exactFinancialControl(visit){return visit?.financialControl?.matchStatus==='exact_protected_operational_linked';}

const snapshot=readSnapshot();
const visits=Array.isArray(snapshot.visits)?snapshot.visits:[];
const periods=Array.isArray(snapshot.periods)?snapshot.periods:[];
const blockers=[];
const warnings=[];
const block=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);
const warn=(code,detail='')=>warnings.push(detail?`${code}:${detail}`:code);

if(snapshot.tenantId!=='tya')block('tenant_mismatch',String(snapshot.tenantId));
if(snapshot.projectId!=='cinepolis')block('project_mismatch',String(snapshot.projectId));
if(periods.length!==expectedPeriods)block('period_count_mismatch',`${periods.length}/${expectedPeriods}`);
if(visits.length!==expectedVisits)block('visit_count_mismatch',`${visits.length}/${expectedVisits}`);
if(snapshot.source?.semanticNormalizer!==expectedNormalizer)block('semantic_normalizer_mismatch',`${snapshot.source?.semanticNormalizer}/${expectedNormalizer}`);
if(snapshot.source?.canonicalStateAcrossAllDetectedPeriods!==true)block('canonical_history_scope_missing');
if(snapshot.source?.assignmentAndAvailabilitySeparated!==true)block('assignment_availability_separation_missing');
if(snapshot.source?.normalizedFranjaAndMeasurementWindow!==true)block('franja_measurement_window_normalization_missing');
if(!['all_detected_hr_periods','all_verified_hr_periods'].includes(snapshot.normalization?.historyScope))block('history_scope_not_verified',String(snapshot.normalization?.historyScope));

const recalculated=visits.map(v=>({...v,_derived:deriveCanonicalVisitState(v)}));
for(const item of recalculated){
  const v=item,d=item._derived,c=v.canonicalFacets||{};
  const financialLinked=exactFinancialControl(v);
  const expectedFacets={
    available:d.available,
    eligibilityBlocked:!d.available&&!d.assigned,
    assigned:d.assigned,
    scheduled:d.scheduled,
    realized:d.realized,
    questionnaire:d.questionnaireCompleted,
    submitted:d.submitted,
    liquidationCandidate:d.liquidationCandidate||financialLinked,
    liquidationConfirmed:d.liquidationConfirmed,
    paymentConfirmed:d.paymentConfirmed
  };
  for(const [name,expected] of Object.entries(expectedFacets)){
    if(c[name]!==expected)block('canonical_facet_mismatch',`${v.hrRowId||v.id}:${name}:${c[name]}/${expected}`);
  }
  if(v.estado!==d.presentationState)block('presentation_state_mismatch',`${v.hrRowId||v.id}:${v.estado}/${d.presentationState}`);
  if(v.operationalState!==d.operationalStage)block('operational_state_mismatch',`${v.hrRowId||v.id}:${v.operationalState}/${d.operationalStage}`);
  if(v.availabilityState!==d.availabilityState)block('availability_state_mismatch',`${v.hrRowId||v.id}:${v.availabilityState}/${d.availabilityState}`);
  if((v.availabilityDependency||null)!==(d.availabilityDependency||null))block('availability_dependency_mismatch',v.hrRowId||v.id);
  if(d.submitted&&(!d.questionnaireCompleted||!d.realized))block('submitted_chain_not_closed',v.hrRowId||v.id);
  if(c.paymentConfirmed&&!c.liquidationCandidate)block('payment_without_candidate',v.hrRowId||v.id);
  if(financialLinked){
    if(v.paymentState!=='pending_financial_source'||v.paymentControlOnly!==true)block('financial_control_not_pending_source',v.hrRowId||v.id);
    if(v.paymentConfirmed===true||v.paid===true||v.lotEligible===true)block('financial_control_inferred_payment_or_lot',v.hrRowId||v.id);
    if(!d.submitted&&!v.reviewReasons?.includes('financial_control_without_hr_submission'))block('financial_control_without_submission_not_reviewed',v.hrRowId||v.id);
  }
  if(d.controlPendingAssignment&&d.assigned&&!v.reviewReasons?.includes('control_pending_assignment_but_shopper_present'))block('assignment_control_conflict_hidden',v.hrRowId||v.id);
}

const history=validateCanonicalHistory(visits,periods);
for(const issue of history.issues||[])(issue.severity==='blocker'?block:warn)(issue.code,issue.periodKey||'');
const summaries=summarizeCanonicalPeriods(visits);
const payloadSummaries=Array.isArray(snapshot.periodOperationalSummary)?snapshot.periodOperationalSummary:[];
if(payloadSummaries.length!==summaries.length)block('period_summary_count_mismatch',`${payloadSummaries.length}/${summaries.length}`);
for(const expected of summaries){
  const actual=payloadSummaries.find(row=>row.periodKey===expected.periodKey);
  if(!actual){block('period_summary_missing',expected.periodKey);continue;}
  for(const key of ['total','available','eligibilityBlocked','assigned','unassigned','scheduled','pendingSchedule','realized','pendingQuestionnaire','questionnaireCompleted','pendingSubmission','submitted','liquidationCandidates','liquidationConfirmed','paymentConfirmed','reviewRequired']){
    if(Number(actual[key])!==Number(expected[key]))block('period_summary_value_mismatch',`${expected.periodKey}:${key}:${actual[key]}/${expected[key]}`);
  }
}

const currentYear=new Date().getUTCFullYear();
const currentYearPeriods=summaries.filter(row=>row.periodKey.startsWith(`${currentYear}-`));
if(!currentYearPeriods.length)warn('current_year_not_present_in_hr',String(currentYear));
const oldest=summaries[0]?.periodKey||null,newest=summaries.at(-1)?.periodKey||null;
const exactControls=visits.filter(exactFinancialControl);
const exactWithoutSubmission=exactControls.filter(v=>v.canonicalFacets?.submitted!==true);
const latest=summaries.at(-1)||null;

const report={
  schemaVersion:'1.2.0',
  gate:'tya-canonical-history-reconciliation-r21',
  generatedAt:new Date().toISOString(),
  input:path.relative(process.cwd(),input).replaceAll('\\','/'),
  historyScope:snapshot.normalization?.historyScope||'unknown',
  observed:{periods:periods.length,visits:visits.length,oldestPeriod:oldest,newestPeriod:newest,currentYearPeriods:currentYearPeriods.map(row=>row.periodKey),latestPeriod:latest,reviewRequired:visits.filter(v=>v.reviewRequired===true).length,financialExactLinks:exactControls.length,financialExactLinksWithoutHrSubmission:exactWithoutSubmission.length},
  summaries,
  blockers:[...new Set(blockers)],
  warnings:[...new Set(warnings)],
  safeState:{readsSourceSafeFile:true,writes:false,imports:false,deploy:false,production:false,providers:false,payments:false}
};
report.ok=report.blockers.length===0;
report.decision=report.ok?(report.warnings.length?'PASS_WITH_WARNING_R21_CANONICAL_HISTORY':'PASS_R21_CANONICAL_HISTORY'):'HOLD_R21_CANONICAL_HISTORY';
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),[
  '# TyA canonical historical state gate R21','',
  `Decision: **${report.decision}**`,'',
  `Scope: ${report.historyScope}`,
  `Periods: ${report.observed.periods} (${oldest} → ${newest})`,
  `Visits: ${report.observed.visits}`,
  `Latest available/blocked: ${latest?.available??'n/a'}/${latest?.eligibilityBlocked??'n/a'}`,
  `Review required: ${report.observed.reviewRequired}`,
  `Financial exact links: ${report.observed.financialExactLinks}`,
  `Financial links without HR submit: ${report.observed.financialExactLinksWithoutHrSubmission}`,'',
  '## Blockers',...(report.blockers.length?report.blockers.map(x=>`- ${x}`):['- none']),'',
  '## Warnings',...(report.warnings.length?report.warnings.map(x=>`- ${x}`):['- none'])
].join('\n'),'utf8');
console.log(JSON.stringify(report,null,2));
if(!report.ok)process.exit(1);
