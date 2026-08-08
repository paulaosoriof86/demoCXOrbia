#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const payloadFile=path.resolve(valueOf('--payload','app/data/tya-hr-source-safe-periods.js'));
const outDir=path.resolve(valueOf('--out','.tmp/live-hr-read-probe'));
const maxAgeSeconds=Number(valueOf('--max-age-seconds','600'));
const fail=(message,detail={})=>{
  fs.mkdirSync(outDir,{recursive:true});
  const report={ok:false,decision:'HOLD_LIVE_HR_READ_PROBE',message,detail,checkedAt:new Date().toISOString(),writes:false,deploy:false,production:false};
  fs.writeFileSync(path.join(outDir,'live-hr-read-probe.json'),JSON.stringify(report,null,2),'utf8');
  console.error(JSON.stringify(report,null,2));
  process.exit(2);
};

if(!fs.existsSync(payloadFile))fail('payload_missing',{payloadFile});
const text=fs.readFileSync(payloadFile,'utf8').replace(/^\uFEFF/,'');
const match=text.match(/window\.CX_TYA_HR_SOURCE_SAFE\s*=\s*([\s\S]*);\s*$/);
if(!match)fail('payload_wrapper_invalid');
let snapshot;
try{snapshot=JSON.parse(match[1]);}catch(error){fail('payload_json_invalid',{error:String(error.message||error)});}

const visits=Array.isArray(snapshot.visits)?snapshot.visits:[];
const periods=Array.isArray(snapshot.periods)?snapshot.periods:[];
if(snapshot.sourceSafe!==true)fail('snapshot_not_source_safe');
if(snapshot.imported===true||Number(snapshot.firestoreWrites||0)!==0)fail('unsafe_materialization_state',{imported:snapshot.imported,firestoreWrites:snapshot.firestoreWrites});
if(!visits.length||!periods.length)fail('empty_live_source',{visits:visits.length,periods:periods.length});

const generatedMs=Date.parse(snapshot.generatedAt||'');
if(!Number.isFinite(generatedMs))fail('generated_at_invalid',{generatedAt:snapshot.generatedAt});
const ageSeconds=Math.max(0,Math.round((Date.now()-generatedMs)/1000));
if(ageSeconds>maxAgeSeconds)fail('live_source_stale',{generatedAt:snapshot.generatedAt,ageSeconds,maxAgeSeconds});

const periodKeys=new Set();
for(const period of periods){
  if(!period?.key)fail('period_key_missing',{period});
  if(periodKeys.has(period.key))fail('period_key_duplicate',{periodKey:period.key});
  periodKeys.add(period.key);
}

const piiKeys=['telefono','phone','whatsapp','email','mail','dpi','banco','ctaNum','direccion','address'];
const violations=[];
const byPeriod={};
const bucket=(v)=>{
  const c=v?.canonicalFacets||{};
  const assigned=c.assigned===true||v?.assignmentState==='assigned'||!!v?.shopperId;
  const scheduled=c.scheduled===true||v?.schedulingState==='scheduled'||!!v?.agendada;
  const realized=c.realized===true||v?.executionState==='realized'||!!v?.realizada;
  const questionnaire=c.questionnaire===true||v?.questionnaireState==='completed'||!!v?.cuestFecha;
  const submitted=c.submitted===true||v?.submissionState==='confirmed_hr'||!!v?.submittedAt||v?.submit===true;
  return {assigned,scheduled,realized,questionnaire,submitted};
};

for(const v of visits){
  if(!v?.periodKey||!periodKeys.has(v.periodKey))violations.push({code:'visit_period_invalid',id:v?.id||null,periodKey:v?.periodKey||null});
  if(!v?.hrRowId)violations.push({code:'visit_hr_row_missing',id:v?.id||null});
  if(v?.sourceSafe!==true)violations.push({code:'visit_not_source_safe',id:v?.id||null});
  for(const key of piiKeys)if(v&&Object.prototype.hasOwnProperty.call(v,key)&&String(v[key]??'').trim())violations.push({code:'pii_field_present',id:v?.id||null,key});
  const f=bucket(v);
  if(f.submitted&&!f.questionnaire)violations.push({code:'submitted_without_questionnaire',id:v?.id||null,hrRowId:v?.hrRowId||null});
  if(f.questionnaire&&!f.realized)violations.push({code:'questionnaire_without_realized',id:v?.id||null,hrRowId:v?.hrRowId||null});
  const row=byPeriod[v.periodKey]||(byPeriod[v.periodKey]={total:0,assigned:0,scheduled:0,realized:0,questionnaire:0,submitted:0,sinSubmitir:0,cuestionarioPendiente:0});
  row.total++;
  for(const key of ['assigned','scheduled','realized','questionnaire','submitted'])if(f[key])row[key]++;
  if(f.questionnaire&&!f.submitted)row.sinSubmitir++;
  if(f.realized&&!f.questionnaire)row.cuestionarioPendiente++;
}
if(violations.length)fail('semantic_or_privacy_violations',{count:violations.length,violations:violations.slice(0,100)});

const latestPeriodKey=[...periodKeys].sort().at(-1);
const report={
  ok:true,
  decision:'PASS_LIVE_HR_READ_ONLY_FRESH_SOURCE',
  checkedAt:new Date().toISOString(),
  generatedAt:snapshot.generatedAt,
  ageSeconds,
  sourceType:snapshot.source?.type||null,
  accessMode:snapshot.source?.accessMode||null,
  periods:periods.length,
  visits:visits.length,
  shoppers:Array.isArray(snapshot.shoppers)?snapshot.shoppers.length:null,
  latestPeriodKey,
  latestPeriod:byPeriod[latestPeriodKey]||null,
  byPeriod,
  invariants:{fixedOperationalCounts:false,kpiDetailSameFacetDefinition:true,sourceSafe:true,piiExcluded:true},
  safeState:{writes:false,imports:false,deploy:false,production:false,payments:false}
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'live-hr-read-probe.json'),JSON.stringify(report,null,2),'utf8');
fs.writeFileSync(path.join(outDir,'live-hr-read-probe.md'),[
  '# TyA live HR read-only probe',
  '',
  `Decision: ${report.decision}`,
  `Generated at source read: ${report.generatedAt}`,
  `Age at gate: ${report.ageSeconds}s`,
  `Periods: ${report.periods}`,
  `Visits: ${report.visits}`,
  `Protected shopper references: ${report.shoppers}`,
  `Latest period: ${report.latestPeriodKey}`,
  `Latest period live counts: ${JSON.stringify(report.latestPeriod)}`,
  '',
  'Counts are observations from this read, never frozen acceptance constants.',
  'No writes, imports, deploy, production or payments.'
].join('\n'),'utf8');
console.log(JSON.stringify(report,null,2));
