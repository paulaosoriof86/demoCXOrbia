#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const payloadFile=arg('--payload','app/data/tya-hr-source-safe-periods.js');
const contractFile=arg('--contract','backend/contracts/phase-a-corte1-context-history-reports-v1.json');
const frontendFile=arg('--frontend','app/modules/cliente-extra.js');
const outDir=arg('--out','.tmp/tya-corte1-context-history-reports');
fs.mkdirSync(outDir,{recursive:true});

const blockers=[];
const warnings=[];
const note=(arr,code,observed,expected)=>arr.push({code,observed,expected});

function parsePayload(file){
  const raw=fs.readFileSync(file,'utf8');
  const marker='window.CX_TYA_HR_SOURCE_SAFE =';
  const at=raw.indexOf(marker);
  if(at<0) throw new Error('source-safe assignment marker missing');
  const start=raw.indexOf('{',at+marker.length);
  const end=raw.lastIndexOf('};');
  if(start<0||end<start) throw new Error('source-safe JSON object boundary missing');
  return JSON.parse(raw.slice(start,end+1));
}

function countryOf(v){return String(v.pais||v.country||'').trim().toUpperCase();}
function assignedOf(v){
  if(typeof v.hasShopper==='boolean') return v.hasShopper;
  if(typeof v.assignmentState==='string') return ['assigned','asignada','asignado'].includes(v.assignmentState.toLowerCase());
  return Boolean(v.shopperId||v.shopperCode||v.shopper);
}
function performedOf(v){
  if(v.performed===true||v.realizada) return true;
  return ['realizada','cuestionario','submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase());
}
function questionnaireOf(v){
  if(v.questionnaireCompleted===true||v.cuestFecha||v.questionnaireAt) return true;
  return ['cuestionario','submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase());
}
function submittedOf(v){
  if(v.submit===true||v.submittedAt) return true;
  return ['submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase());
}
function paymentConfirmedOf(v){return String(v.paymentState||v.estadoPago||'').toLowerCase()==='confirmado';}

function summarize(visits,tenantId,projectId){
  const map=new Map();
  for(const v of visits){
    const periodKey=String(v.periodKey||'').trim();
    const country=countryOf(v);
    const key=`${periodKey}::${country}`;
    if(!map.has(key)) map.set(key,{tenantId,projectId,periodKey,country,visits:0,assigned:0,unassigned:0,performed:0,questionnaire:0,submitted:0,paymentConfirmed:0});
    const r=map.get(key);
    r.visits++;
    if(assignedOf(v)) r.assigned++; else r.unassigned++;
    if(performedOf(v)) r.performed++;
    if(questionnaireOf(v)) r.questionnaire++;
    if(submittedOf(v)) r.submitted++;
    if(paymentConfirmedOf(v)) r.paymentConfirmed++;
  }
  return [...map.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey)||a.country.localeCompare(b.country));
}

let snapshot,contract;
try{snapshot=parsePayload(payloadFile);}catch(error){note(blockers,'payload_parse_failed',error.message,'valid source-safe payload');}
try{contract=JSON.parse(fs.readFileSync(contractFile,'utf8'));}catch(error){note(blockers,'contract_parse_failed',error.message,'valid JSON contract');}

let reportRows=[];
let summary={};
if(snapshot&&contract){
  const scope=contract.sourceScope||{};
  const periods=Array.isArray(snapshot.periods)?snapshot.periods:[];
  const visits=Array.isArray(snapshot.visits)?snapshot.visits:[];
  const periodKeys=periods.map(p=>String(p.key||p.periodKey||'').trim()).filter(Boolean);
  const uniquePeriods=new Set(periodKeys);
  const visitIds=new Set();
  const countries=new Set(scope.countries||[]);

  if(snapshot.tenantId!==contract.tenantId) note(blockers,'tenant_mismatch',snapshot.tenantId,contract.tenantId);
  if(snapshot.projectId!==contract.projectId) note(blockers,'project_mismatch',snapshot.projectId,contract.projectId);
  if(snapshot.sourceSafe!==true) note(blockers,'source_safe_missing',snapshot.sourceSafe,true);
  if(snapshot.production===true) note(blockers,'production_payload_forbidden',true,false);
  if(snapshot.imported===true) note(blockers,'imported_payload_forbidden',true,false);
  if(periods.length!==scope.expectedPeriods) note(blockers,'period_count_mismatch',periods.length,scope.expectedPeriods);
  if(visits.length!==scope.expectedVisits) note(blockers,'visit_count_mismatch',visits.length,scope.expectedVisits);
  if(uniquePeriods.size!==periodKeys.length) note(blockers,'duplicate_period_keys',periodKeys.length-uniquePeriods.size,0);
  const sorted=[...uniquePeriods].sort();
  if(sorted[0]!==scope.periodStart) note(blockers,'period_start_mismatch',sorted[0]||null,scope.periodStart);
  if(sorted.at(-1)!==scope.periodEnd) note(blockers,'period_end_mismatch',sorted.at(-1)||null,scope.periodEnd);

  const forbidden=new Set((contract.forbiddenRecordFields||[]).map(x=>String(x).toLowerCase()));
  let missingHrIdentity=0;
  for(const [index,v] of visits.entries()){
    const id=String(v.id||'').trim();
    const periodKey=String(v.periodKey||'').trim();
    const country=countryOf(v);
    if(!id) note(blockers,'visit_id_missing',index,'non-empty id');
    else if(visitIds.has(id)) note(blockers,'duplicate_visit_id',id,'unique id');
    else visitIds.add(id);
    if(!uniquePeriods.has(periodKey)) note(blockers,'visit_period_out_of_scope',{id,periodKey},'verified period key');
    if(!countries.has(country)) note(blockers,'visit_country_out_of_scope',{id,country},[...countries]);
    if(!(v.hrRowId||v.sourceTab||v.sourceRow)) missingHrIdentity++;
    for(const key of Object.keys(v)) if(forbidden.has(key.toLowerCase())&&v[key]!=null&&String(v[key]).trim()!=='') note(blockers,'pii_field_in_visit_record',{id,key},'absent');
  }
  if(missingHrIdentity) note(warnings,'hr_row_identity_partial',missingHrIdentity,0);

  const shoppers=Array.isArray(snapshot.shoppers)?snapshot.shoppers:[];
  for(const s of shoppers){
    for(const key of Object.keys(s)) if(forbidden.has(key.toLowerCase())&&s[key]!=null&&String(s[key]).trim()!=='') note(blockers,'pii_field_in_shopper_record',{id:s.id||s.code||null,key},'absent');
  }

  reportRows=summarize(visits,contract.tenantId,contract.projectId);
  const projected=reportRows.reduce((n,r)=>n+r.visits,0);
  if(projected!==visits.length) note(blockers,'report_projection_total_mismatch',projected,visits.length);
  const assigned=reportRows.reduce((n,r)=>n+r.assigned,0);
  const unassigned=reportRows.reduce((n,r)=>n+r.unassigned,0);
  if(assigned+unassigned!==visits.length) note(blockers,'assignment_partition_mismatch',assigned+unassigned,visits.length);
  const paid=reportRows.reduce((n,r)=>n+r.paymentConfirmed,0);
  if(paid>0) note(warnings,'payment_confirmed_requires_source_review',paid,0);

  const latest=sorted.at(-1)||null;
  const historyRows=reportRows.filter(r=>r.periodKey!==latest);
  if(contract.history?.defaultExcludesLatestActivePeriod&&historyRows.some(r=>r.periodKey===latest)) note(blockers,'history_active_period_leak',latest,'excluded by default');
  if(new Set(historyRows.map(r=>r.periodKey)).size!==Math.max(0,sorted.length-1)) note(blockers,'history_period_coverage_mismatch',new Set(historyRows.map(r=>r.periodKey)).size,Math.max(0,sorted.length-1));

  const june=reportRows.filter(r=>r.periodKey==='2026-06');
  if(!june.length) note(blockers,'june_2026_missing',0,'period present');
  else {
    const juneVisits=june.reduce((n,r)=>n+r.visits,0);
    const junePerformed=june.reduce((n,r)=>n+r.performed,0);
    if(junePerformed<juneVisits) note(warnings,'june_execution_requires_visual_review',{visits:juneVisits,performed:junePerformed},'June represented as executed, not pending visits');
  }

  if(fs.existsSync(frontendFile)){
    const frontend=fs.readFileSync(frontendFile,'utf8');
    if(frontend.includes("Generando “")&&frontend.includes("— demo")) note(warnings,'frontend_report_buttons_still_demo',path.normalize(frontendFile),'Claude/prototype consumer pending');
  }

  summary={
    tenantId:snapshot.tenantId,projectId:snapshot.projectId,generatedAt:snapshot.generatedAt||null,
    periods:periods.length,visits:visits.length,countries:[...new Set(visits.map(countryOf))].sort(),
    reportRows:reportRows.length,latestPeriod:latest,historyPeriods:new Set(historyRows.map(r=>r.periodKey)).size,
    assigned,unassigned,performed:reportRows.reduce((n,r)=>n+r.performed,0),questionnaire:reportRows.reduce((n,r)=>n+r.questionnaire,0),submitted:reportRows.reduce((n,r)=>n+r.submitted,0),paymentConfirmed:paid
  };
}

const csvHeader=['tenantId','projectId','periodKey','country','visits','assigned','unassigned','performed','questionnaire','submitted','paymentConfirmed'];
const csv=[csvHeader,...reportRows.map(r=>csvHeader.map(k=>r[k]))].map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n');
const decision=blockers.length?'HOLD_CORTE1_CONTEXT_HISTORY_REPORTS':warnings.length?'PASS_WITH_REVIEW_CORTE1_CONTEXT_HISTORY_REPORTS':'PASS_CORTE1_CONTEXT_HISTORY_REPORTS';
const result={ok:blockers.length===0,decision,contractId:contract?.id||null,payloadFile,summary,blockers,warnings,reportRows};
fs.writeFileSync(path.join(outDir,'report-projection.source-safe.json'),JSON.stringify(result,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report-projection.source-safe.csv'),'\ufeff'+csv+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),`# Corte 1 context/history/reports gate\n\n- Decision: \`${decision}\`\n- Periods: ${summary.periods??0}\n- Visits: ${summary.visits??0}\n- Report rows: ${summary.reportRows??0}\n- Blockers: ${blockers.length}\n- Warnings: ${warnings.length}\n\n## Blockers\n\n${blockers.length?blockers.map(x=>`- ${x.code}: observed=${JSON.stringify(x.observed)} expected=${JSON.stringify(x.expected)}`).join('\n'):'- None'}\n\n## Warnings\n\n${warnings.length?warnings.map(x=>`- ${x.code}: observed=${JSON.stringify(x.observed)} expected=${JSON.stringify(x.expected)}`).join('\n'):'- None'}\n`,'utf8');
console.log(JSON.stringify(result,null,2));
if(blockers.length) process.exit(1);
