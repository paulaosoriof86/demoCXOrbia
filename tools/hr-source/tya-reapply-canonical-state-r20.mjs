#!/usr/bin/env node
/*
  Reaplica la máquina canónica R20/R21 después de normalización R18A y overlays
  R18B. Preserva evidencias/review queues y evita que capas anteriores vuelvan
  a escribir estados incompatibles.

  Un control financiero R14C enlazado es evidencia de cruce pendiente, no pago.
  Se conserva como candidato financiero aunque la HR no tenga submitido; la
  contradicción pasa a revisión y nunca confirma liquidación/pago.

  R21 normaliza franja y ventana de medición antes de reaplicar la máquina:
  - RH WK / WK se expone como Semana;
  - RH WKND / WKND se expone como Fin de semana;
  - Quincena 1 y 2 reciben límites de fecha canónicos del periodo;
  - sin shopper no equivale automáticamente a visita disponible.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import {
  applyCanonicalVisitState,
  summarizeCanonicalPeriods,
  validateCanonicalHistory,
  normalizedText
} from './tya-canonical-visit-state-r20.mjs';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const input=path.resolve(valueOf('--input','app/data/tya-hr-source-safe-periods.js'));
const output=path.resolve(valueOf('--out',valueOf('--input','app/data/tya-hr-source-safe-periods.js')));
const reportDir=path.resolve(valueOf('--report-dir','.tmp/r20-final-canonical-pass'));
const globalName=valueOf('--global','CX_TYA_HR_SOURCE_SAFE');

function readPayload(file){
  const sandbox={window:{}};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:5000});
  const payload=sandbox.window[globalName];
  if(!payload)throw new Error(`Missing window.${globalName}`);
  return JSON.parse(JSON.stringify(payload));
}
function writePayload(file,payload){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,[
    '/* CXOrbia TyA source-safe payload — R20/R21 final canonical pass. */',
    `window.${globalName} = `,
    JSON.stringify(payload,null,2),
    ';'
  ].join(''),'utf8');
}
function exactFinancialControl(visit){
  return visit?.financialControl?.matchStatus==='exact_protected_operational_linked';
}
function pad(value){return String(value).padStart(2,'0');}
function normalizedFranja(raw){
  const text=normalizedText(raw);
  const code=text.includes('wknd')||text.includes('fin de semana')?'WKND':'WK';
  return {raw:raw??null,code,label:code==='WKND'?'Fin de semana':'Semana'};
}
function measurementBounds(periodKey,rawWindow){
  const match=String(periodKey||'').match(/^(20\d{2})-([01]\d)$/);
  if(!match)return {id:null,label:rawWindow||null,start:null,end:null};
  const year=Number(match[1]),month=Number(match[2]);
  const text=normalizedText(rawWindow);
  const q=text.includes('2')?'q2':text.includes('1')?'q1':null;
  if(!q)return {id:null,label:rawWindow||null,start:null,end:null};
  const last=new Date(Date.UTC(year,month,0)).getUTCDate();
  return {
    id:q,
    label:q==='q1'?'QUINCENA 1':'QUINCENA 2',
    start:`${year}-${pad(month)}-${q==='q1'?'01':'16'}`,
    end:`${year}-${pad(month)}-${q==='q1'?'15':pad(last)}`
  };
}

const payload=readPayload(input);
if(payload.sourceSafe!==true||payload.imported===true||payload.production===true)throw new Error('R20/R21 final pass requires source-safe non-production input.');

const previousShoppers=new Map((payload.shoppers||[]).map(s=>[String(s.id||s.shopperId||''),s]));
payload.visits=(payload.visits||[]).map(raw=>{
  const franja=normalizedFranja(raw.franjaRaw??raw.franja??raw.franjaCode);
  const window=measurementBounds(raw.periodKey,raw.measurementWindowLabel??raw.quincena);
  const normalized={
    ...raw,
    franjaRaw:franja.raw,
    franjaCode:franja.code,
    franja:franja.label,
    measurementWindowId:raw.measurementWindowId||window.id,
    measurementWindowLabel:raw.measurementWindowLabel||window.label,
    measurementWindowStart:raw.measurementWindowStart||window.start,
    measurementWindowEnd:raw.measurementWindowEnd||window.end,
    availableFromRaw:raw.availableFromRaw??raw.disponibleDesde??null
  };
  const visit=applyCanonicalVisitState(normalized);
  const financialLinked=exactFinancialControl(raw);
  if(financialLinked){
    visit.liquidationCandidate=true;
    visit.liquidationState='candidate_pending_financial_match';
    visit.paymentState='pending_financial_source';
    visit.paymentControlOnly=true;
    visit.paymentConfirmed=false;
    visit.paid=false;
    visit.lotEligible=false;
    visit.canonicalFacets={...(visit.canonicalFacets||{}),liquidationCandidate:true,liquidationConfirmed:false,paymentConfirmed:false};
    if(visit.canonicalFacets.submitted!==true){
      const reasons=new Set(Array.isArray(visit.reviewReasons)?visit.reviewReasons:[]);
      reasons.add('financial_control_without_hr_submission');
      visit.reviewReasons=[...reasons].sort();
      visit.reviewRequired=true;
    }
  }
  visit.submit=visit.canonicalFacets?.submitted===true;
  visit.stateModelVersion='phase-a-canonical-visit-state-r21-v1';
  visit.domainMappingVersion='phase-a-source-safe-domain-mapping-r21';
  return visit;
});

const shopperMap=new Map();
for(const visit of payload.visits){
  if(!visit.canonicalFacets?.assigned||!visit.shopperId)continue;
  const key=String(visit.shopperId);
  const old=previousShoppers.get(key)||{};
  const current=shopperMap.get(key)||{
    ...old,
    id:key,
    shopperId:key,
    code:visit.shopperCode||old.code||null,
    nombre:'Shopper protegido',
    pais:visit.country||visit.pais||old.pais||null,
    ciudad:visit.ciudad||old.ciudad||'',
    estado:null,
    status:null,
    rating:null,
    completion:null,
    preference:null,
    honorario:null,
    perfilCompleto:false,
    dataLevel:'protected_reference',
    operationalProfileAvailable:false,
    fullAuthorizedProfileAvailable:false,
    visitas:0,
    realizadas:0,
    submitidas:0,
    liquidationCandidates:0,
    liquidadas:0,
    pagadas:0,
    sourceSafe:true,
    piiProtected:true
  };
  current.visitas+=1;
  current.realizadas+=visit.canonicalFacets.realized?1:0;
  current.submitidas+=visit.canonicalFacets.submitted?1:0;
  current.liquidationCandidates+=visit.canonicalFacets.liquidationCandidate?1:0;
  current.liquidadas+=visit.canonicalFacets.liquidationConfirmed?1:0;
  current.pagadas+=visit.canonicalFacets.paymentConfirmed?1:0;
  shopperMap.set(key,current);
}
payload.shoppers=[...shopperMap.values()].sort((a,b)=>String(a.code||'').localeCompare(String(b.code||'')));

const summaries=summarizeCanonicalPeriods(payload.visits);
const validation=validateCanonicalHistory(payload.visits,payload.periods||[]);
if(validation.decision!=='PASS_CANONICAL_HISTORY')throw new Error(`R20/R21 final history HOLD: ${JSON.stringify(validation.issues).slice(0,3000)}`);

const byStatus={};
for(const visit of payload.visits)byStatus[visit.estado]=(byStatus[visit.estado]||0)+1;
payload.periodOperationalSummary=summaries;
payload.counts={
  ...(payload.counts||{}),
  periods:(payload.periods||[]).length,
  visits:payload.visits.length,
  shoppers:payload.shoppers.length,
  byStatus,
  available:payload.visits.filter(v=>v.canonicalFacets?.available).length,
  eligibilityBlocked:payload.visits.filter(v=>v.canonicalFacets?.eligibilityBlocked).length,
  assigned:payload.visits.filter(v=>v.canonicalFacets?.assigned).length,
  unassigned:payload.visits.filter(v=>!v.canonicalFacets?.assigned).length,
  scheduled:payload.visits.filter(v=>v.canonicalFacets?.scheduled).length,
  realized:payload.visits.filter(v=>v.canonicalFacets?.realized).length,
  questionnaireCompleted:payload.visits.filter(v=>v.canonicalFacets?.questionnaire).length,
  submitted:payload.visits.filter(v=>v.canonicalFacets?.submitted).length,
  liquidationCandidatesPendingFinancialMatch:payload.visits.filter(v=>v.liquidationState==='candidate_pending_financial_match').length,
  liquidationConfirmed:payload.visits.filter(v=>v.liquidationState==='confirmed').length,
  paymentConfirmed:payload.visits.filter(v=>v.paymentState==='confirmed').length,
  reviewRequired:payload.visits.filter(v=>v.reviewRequired===true).length,
  financialExactLinks:payload.visits.filter(exactFinancialControl).length,
  financialExactLinksWithoutHrSubmission:payload.visits.filter(v=>exactFinancialControl(v)&&v.canonicalFacets?.submitted!==true).length
};
payload.source={
  ...(payload.source||{}),
  semanticNormalizer:'r15g+r20+r21-eligibility',
  finalCanonicalPass:'after_r18a_r18b',
  canonicalStateAcrossAllDetectedPeriods:true,
  assignmentAndAvailabilitySeparated:true,
  normalizedFranjaAndMeasurementWindow:true,
  financialControlsPreservedAsPendingReview:true,
  runtimeLiveSync:false
};
payload.normalization={
  ...(payload.normalization||{}),
  version:'R21-eligibility-final',
  historyScope:payload.normalization?.historyScope||'all_verified_hr_periods',
  finalCanonicalPass:true,
  periodCount:summaries.length,
  periodKeys:summaries.map(row=>row.periodKey),
  rules:[...(payload.normalization?.rules||[]),'unassigned_is_not_automatically_available','recognized_previous_window_dependency_blocks_offer','franja_code_normalized','measurement_window_bounds_explicit']
};

writePayload(output,payload);
fs.mkdirSync(reportDir,{recursive:true});
const report={
  schemaVersion:'1.2.0',
  decision:'PASS_R21_ELIGIBILITY_FINAL_CANONICAL_PASS',
  input:path.relative(process.cwd(),input).replaceAll('\\','/'),
  output:path.relative(process.cwd(),output).replaceAll('\\','/'),
  counts:payload.counts,
  summaries,
  safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false,piiIncluded:false}
};
fs.writeFileSync(path.join(reportDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(reportDir,'report.md'),[
  '# R21 eligibility final canonical pass','',
  `Decision: **${report.decision}**`,
  `Periods: ${summaries.length}`,
  `Visits: ${payload.visits.length}`,
  `Available: ${payload.counts.available}`,
  `Eligibility blocked: ${payload.counts.eligibilityBlocked}`,
  `Assigned: ${payload.counts.assigned}`,
  `Unassigned: ${payload.counts.unassigned}`,
  `Submitted: ${payload.counts.submitted}`,
  `Financial exact links: ${payload.counts.financialExactLinks}`,
  `Financial links without HR submission: ${payload.counts.financialExactLinksWithoutHrSubmission}`,
  `Payments confirmed: ${payload.counts.paymentConfirmed}`
].join('\n'),'utf8');
console.log(JSON.stringify(report,null,2));
