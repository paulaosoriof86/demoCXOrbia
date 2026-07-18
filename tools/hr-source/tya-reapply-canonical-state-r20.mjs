#!/usr/bin/env node
/*
  Reaplica la máquina canónica R20 después de normalización R18A y overlays
  R18B. Preserva evidencias/review queues y evita que capas anteriores vuelvan
  a escribir estados incompatibles.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import {
  applyCanonicalVisitState,
  summarizeCanonicalPeriods,
  validateCanonicalHistory
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
    '/* CXOrbia TyA source-safe payload — R20 final canonical pass. */',
    `window.${globalName} = `,
    JSON.stringify(payload,null,2),
    ';'
  ].join(''),'utf8');
}

const payload=readPayload(input);
if(payload.sourceSafe!==true||payload.imported===true||payload.production===true)throw new Error('R20 final pass requires source-safe non-production input.');

const previousShoppers=new Map((payload.shoppers||[]).map(s=>[String(s.id||s.shopperId||''),s]));
payload.visits=(payload.visits||[]).map(raw=>{
  const visit=applyCanonicalVisitState(raw);
  visit.submit=visit.canonicalFacets?.submitted===true;
  visit.stateModelVersion='phase-a-canonical-visit-state-r20-v1';
  visit.domainMappingVersion='phase-a-source-safe-domain-mapping-r20';
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
if(validation.decision!=='PASS_CANONICAL_HISTORY')throw new Error(`R20 final history HOLD: ${JSON.stringify(validation.issues).slice(0,3000)}`);

const byStatus={};
for(const visit of payload.visits)byStatus[visit.estado]=(byStatus[visit.estado]||0)+1;
payload.periodOperationalSummary=summaries;
payload.counts={
  ...(payload.counts||{}),
  periods:(payload.periods||[]).length,
  visits:payload.visits.length,
  shoppers:payload.shoppers.length,
  byStatus,
  assigned:payload.visits.filter(v=>v.canonicalFacets?.assigned).length,
  unassigned:payload.visits.filter(v=>!v.canonicalFacets?.assigned).length,
  scheduled:payload.visits.filter(v=>v.canonicalFacets?.scheduled).length,
  realized:payload.visits.filter(v=>v.canonicalFacets?.realized).length,
  questionnaireCompleted:payload.visits.filter(v=>v.canonicalFacets?.questionnaire).length,
  submitted:payload.visits.filter(v=>v.canonicalFacets?.submitted).length,
  liquidationCandidatesPendingFinancialMatch:payload.visits.filter(v=>v.liquidationState==='candidate_pending_financial_match').length,
  liquidationConfirmed:payload.visits.filter(v=>v.liquidationState==='confirmed').length,
  paymentConfirmed:payload.visits.filter(v=>v.paymentState==='confirmed').length,
  reviewRequired:payload.visits.filter(v=>v.reviewRequired===true).length
};
payload.source={
  ...(payload.source||{}),
  semanticNormalizer:'r15g+r20',
  finalCanonicalPass:'after_r18a_r18b',
  canonicalStateAcrossAllDetectedPeriods:true,
  runtimeLiveSync:false
};
payload.normalization={
  ...(payload.normalization||{}),
  version:'R20-final',
  historyScope:'all_detected_hr_periods',
  finalCanonicalPass:true,
  periodCount:summaries.length,
  periodKeys:summaries.map(row=>row.periodKey)
};

writePayload(output,payload);
fs.mkdirSync(reportDir,{recursive:true});
const report={
  schemaVersion:'1.0.0',
  decision:'PASS_R20_FINAL_CANONICAL_PASS',
  input:path.relative(process.cwd(),input).replaceAll('\\','/'),
  output:path.relative(process.cwd(),output).replaceAll('\\','/'),
  counts:payload.counts,
  summaries,
  safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false,piiIncluded:false}
};
fs.writeFileSync(path.join(reportDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(reportDir,'report.md'),[
  '# R20 final canonical pass','',
  `Decision: **${report.decision}**`,
  `Periods: ${summaries.length}`,
  `Visits: ${payload.visits.length}`,
  `Assigned: ${payload.counts.assigned}`,
  `Unassigned: ${payload.counts.unassigned}`,
  `Submitted: ${payload.counts.submitted}`,
  `Payments confirmed: ${payload.counts.paymentConfirmed}`
].join('\n'),'utf8');
console.log(JSON.stringify(report,null,2));
