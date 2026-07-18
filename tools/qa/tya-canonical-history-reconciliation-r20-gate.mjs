#!/usr/bin/env node
/*
  Gate R20 — comprueba que toda la HR detectada use una sola verdad canónica.
  No se limita a MAY/JUN/JUL: valida todos los periodos presentes en el payload.
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
fs.mkdirSync(outDir,{recursive:true});

function fail(message){throw new Error(message);}
function readSnapshot(){
  if(!fs.existsSync(input)) fail(`Missing input: ${input}`);
  const sandbox={window:{}};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(input,'utf8'),sandbox,{filename:input,timeout:5000});
  const value=sandbox.window.CX_TYA_HR_SOURCE_SAFE;
  if(!value) fail('Missing window.CX_TYA_HR_SOURCE_SAFE.');
  return JSON.parse(JSON.stringify(value));
}

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
if(snapshot.source?.semanticNormalizer!=='r15g+r20')block('semantic_normalizer_not_r20',String(snapshot.source?.semanticNormalizer));
if(snapshot.source?.canonicalStateAcrossAllDetectedPeriods!==true)block('canonical_history_scope_missing');
if(snapshot.normalization?.historyScope!=='all_detected_hr_periods')block('history_scope_not_all_detected');

const recalculated=visits.map(v=>({...v,_derived:deriveCanonicalVisitState(v)}));
for(const item of recalculated){
  const v=item;
  const d=item._derived;
  const c=v.canonicalFacets||{};
  const fields=[
    ['assigned',c.assigned,d.assigned],['scheduled',c.scheduled,d.scheduled],['realized',c.realized,d.realized],
    ['questionnaire',c.questionnaire,d.questionnaireCompleted],['submitted',c.submitted,d.submitted],
    ['liquidationCandidate',c.liquidationCandidate,d.liquidationCandidate],
    ['liquidationConfirmed',c.liquidationConfirmed,d.liquidationConfirmed],['paymentConfirmed',c.paymentConfirmed,d.paymentConfirmed]
  ];
  for(const [name,actual,expected] of fields){
    if(actual!==expected)block('canonical_facet_mismatch',`${v.hrRowId||v.id}:${name}:${actual}/${expected}`);
  }
  if(v.estado!==d.presentationState)block('presentation_state_mismatch',`${v.hrRowId||v.id}:${v.estado}/${d.presentationState}`);
  if(v.operationalState!==d.operationalStage)block('operational_state_mismatch',`${v.hrRowId||v.id}:${v.operationalState}/${d.operationalStage}`);
  if(d.submitted && (!d.questionnaireCompleted || !d.realized))block('submitted_chain_not_closed',v.hrRowId||v.id);
  if(d.paymentConfirmed && !d.liquidationCandidate)block('payment_without_candidate',v.hrRowId||v.id);
  if(d.controlPendingAssignment && d.assigned && !v.reviewReasons?.includes('control_pending_assignment_but_shopper_present'))block('assignment_control_conflict_hidden',v.hrRowId||v.id);
}

const history=validateCanonicalHistory(visits,periods);
for(const issue of history.issues||[])(issue.severity==='blocker'?block:warn)(issue.code,issue.periodKey||'');
const summaries=summarizeCanonicalPeriods(visits);
const payloadSummaries=Array.isArray(snapshot.periodOperationalSummary)?snapshot.periodOperationalSummary:[];
if(payloadSummaries.length!==summaries.length)block('period_summary_count_mismatch',`${payloadSummaries.length}/${summaries.length}`);
for(const expected of summaries){
  const actual=payloadSummaries.find(row=>row.periodKey===expected.periodKey);
  if(!actual){block('period_summary_missing',expected.periodKey);continue;}
  for(const key of ['total','assigned','unassigned','scheduled','pendingSchedule','realized','pendingQuestionnaire','questionnaireCompleted','pendingSubmission','submitted','liquidationCandidates','liquidationConfirmed','paymentConfirmed','reviewRequired']){
    if(Number(actual[key])!==Number(expected[key]))block('period_summary_value_mismatch',`${expected.periodKey}:${key}:${actual[key]}/${expected[key]}`);
  }
}

const currentYear=new Date().getUTCFullYear();
const currentYearPeriods=summaries.filter(row=>row.periodKey.startsWith(`${currentYear}-`));
if(!currentYearPeriods.length)warn('current_year_not_present_in_hr',String(currentYear));
const oldest=summaries[0]?.periodKey||null;
const newest=summaries.at(-1)?.periodKey||null;

const report={
  schemaVersion:'1.0.0',
  gate:'tya-canonical-history-reconciliation-r20',
  generatedAt:new Date().toISOString(),
  input:path.relative(process.cwd(),input).replaceAll('\\','/'),
  historyScope:'all_detected_hr_periods',
  observed:{periods:periods.length,visits:visits.length,oldestPeriod:oldest,newestPeriod:newest,currentYearPeriods:currentYearPeriods.map(row=>row.periodKey),reviewRequired:visits.filter(v=>v.reviewRequired===true).length},
  summaries,
  blockers:[...new Set(blockers)],
  warnings:[...new Set(warnings)],
  safeState:{readsSourceSafeFile:true,writes:false,imports:false,deploy:false,production:false,providers:false,payments:false}
};
report.ok=report.blockers.length===0;
report.decision=report.ok?(report.warnings.length?'PASS_WITH_WARNING_R20_CANONICAL_HISTORY':'PASS_R20_CANONICAL_HISTORY'):'HOLD_R20_CANONICAL_HISTORY';
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),[
  '# TyA canonical historical state gate R20','',
  `Decision: **${report.decision}**`,'',
  `Scope: ${report.historyScope}`,
  `Periods: ${report.observed.periods} (${oldest} → ${newest})`,
  `Visits: ${report.observed.visits}`,
  `Review required: ${report.observed.reviewRequired}`,'',
  '## Blockers',...(report.blockers.length?report.blockers.map(x=>`- ${x}`):['- none']),'',
  '## Warnings',...(report.warnings.length?report.warnings.map(x=>`- ${x}`):['- none'])
].join('\n'),'utf8');
console.log(JSON.stringify(report,null,2));
if(!report.ok)process.exit(1);
