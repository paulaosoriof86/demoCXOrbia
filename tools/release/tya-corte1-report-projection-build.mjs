#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const payloadFile=arg('--payload','app/data/tya-hr-source-safe-periods.js');
const contractFile=arg('--contract','backend/contracts/phase-a-corte1-context-history-reports-v1.json');
const htmlFile=arg('--html','app/index.html');
const outputFile=arg('--out','app/adapters/tya-corte1-report-projection.js');
const reportDir=arg('--report-dir','.tmp/tya-corte1-report-projection-build');
fs.mkdirSync(path.dirname(outputFile),{recursive:true});
fs.mkdirSync(reportDir,{recursive:true});

function parsePayload(file){
  const raw=fs.readFileSync(file,'utf8');
  const marker='window.CX_TYA_HR_SOURCE_SAFE =';
  const at=raw.indexOf(marker);
  const start=raw.indexOf('{',at+marker.length);
  const end=raw.lastIndexOf('};');
  if(at<0||start<0||end<start) throw new Error('source-safe payload boundary missing');
  return JSON.parse(raw.slice(start,end+1));
}
const country=v=>String(v.pais||v.country||'').trim().toUpperCase();
const branchName=v=>String(v.sucursal||v.branchName||'').trim()||'Sucursal pendiente de fuente';
const city=v=>String(v.ciudad||v.city||'').trim();
const assigned=v=>typeof v.hasShopper==='boolean'?v.hasShopper:Boolean(v.shopperId||v.shopperCode||v.shopper);
const performed=v=>Boolean(v.performed===true||v.realizada||['realizada','cuestionario','submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase()));
const questionnaire=v=>Boolean(v.questionnaireCompleted===true||v.cuestFecha||v.questionnaireAt||['cuestionario','submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase()));
const submitted=v=>Boolean(v.submit===true||v.submittedAt||['submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase()));
const paid=v=>String(v.paymentState||v.estadoPago||'').toLowerCase()==='confirmado';
const seedMeasures=()=>({visits:0,assigned:0,unassigned:0,performed:0,questionnaire:0,submitted:0,paymentConfirmed:0});
const applyMeasures=(row,v)=>{
  row.visits++;
  if(assigned(v))row.assigned++;else row.unassigned++;
  if(performed(v))row.performed++;
  if(questionnaire(v))row.questionnaire++;
  if(submitted(v))row.submitted++;
  if(paid(v))row.paymentConfirmed++;
};

const snapshot=parsePayload(payloadFile);
const contract=JSON.parse(fs.readFileSync(contractFile,'utf8'));
if(snapshot.tenantId!==contract.tenantId||snapshot.projectId!==contract.projectId) throw new Error('tenant/project mismatch');
if(snapshot.sourceSafe!==true||snapshot.production===true||snapshot.imported===true) throw new Error('unsafe snapshot state');

const rowsMap=new Map();
const branchMap=new Map();
for(const v of snapshot.visits||[]){
  const periodKey=String(v.periodKey||'').trim();
  const c=country(v);
  const b=branchName(v);
  const ct=city(v);
  const key=`${periodKey}::${c}`;
  if(!rowsMap.has(key)) rowsMap.set(key,{tenantId:snapshot.tenantId,projectId:snapshot.projectId,periodKey,country:c,...seedMeasures()});
  applyMeasures(rowsMap.get(key),v);

  const branchKey=`${periodKey}::${c}::${b}`;
  if(!branchMap.has(branchKey)) branchMap.set(branchKey,{tenantId:snapshot.tenantId,projectId:snapshot.projectId,periodKey,country:c,branchName:b,city:ct,...seedMeasures()});
  applyMeasures(branchMap.get(branchKey),v);
}
const rows=[...rowsMap.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey)||a.country.localeCompare(b.country));
const branchRows=[...branchMap.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey)||a.country.localeCompare(b.country)||a.branchName.localeCompare(b.branchName));
const periods=[...new Set(rows.map(r=>r.periodKey))].sort();
if(periods.length!==contract.sourceScope.expectedPeriods) throw new Error(`period count mismatch ${periods.length}`);
if(rows.reduce((n,r)=>n+r.visits,0)!==contract.sourceScope.expectedVisits) throw new Error('period-country visit total mismatch');
if(branchRows.reduce((n,r)=>n+r.visits,0)!==contract.sourceScope.expectedVisits) throw new Error('branch visit total mismatch');

const catalog=(contract.reportCatalog||[]).map(item=>({
  id:item.id,
  label:item.label,
  projectionLevel:item.projectionLevel||null,
  availability:item.availability,
  requiredSource:item.requiredSource||null,
  forbiddenClaims:item.forbiddenClaims||[]
}));
const sanitizedFormats=Array.isArray(contract.exports?.sanitizedFormats)?contract.exports.sanitizedFormats:[];
const frontendFormatsReady=Array.isArray(contract.exports?.frontendFormatsReady)?contract.exports.frontendFormatsReady:[];
const frontendFormatsPending=Array.isArray(contract.exports?.frontendFormatsPending)?contract.exports.frontendFormatsPending:[];
const projection={
  schemaVersion:contract.schemaVersion,contractId:contract.id,generatedAt:snapshot.generatedAt||null,
  tenantId:snapshot.tenantId,projectId:snapshot.projectId,projectName:snapshot.projectName||'Cinépolis',
  source:{title:snapshot.source?.title||null,type:snapshot.source?.type||null,sourceSafe:true,production:false,imported:false},
  periods,countries:[...new Set(rows.map(r=>r.country))].sort(),latestPeriod:periods.at(-1)||null,
  rows,branchRows,catalog,
  totals:{
    visits:rows.reduce((n,r)=>n+r.visits,0),assigned:rows.reduce((n,r)=>n+r.assigned,0),unassigned:rows.reduce((n,r)=>n+r.unassigned,0),
    performed:rows.reduce((n,r)=>n+r.performed,0),questionnaire:rows.reduce((n,r)=>n+r.questionnaire,0),submitted:rows.reduce((n,r)=>n+r.submitted,0),paymentConfirmed:rows.reduce((n,r)=>n+r.paymentConfirmed,0)
  },
  frontend:{
    formatsReady:[...new Set([...sanitizedFormats,...frontendFormatsReady])],
    formatsPending:frontendFormatsPending,
    pendingSourceBehavior:contract.exports?.pendingSourceBehavior||'disable_export_and_show_pending_source'
  }
};
const serialized=JSON.stringify(projection).replaceAll('</','<\/');
const adapter=`/* Generated Corte 1 source-safe report projection. No PII, writes or production. */\n(function(){\n  const projection=${serialized};\n  const headers={\n    periodCountry:['tenantId','projectId','periodKey','country','visits','assigned','unassigned','performed','questionnaire','submitted','paymentConfirmed'],\n    branch:['tenantId','projectId','periodKey','country','branchName','city','visits','assigned','unassigned','performed','questionnaire','submitted','paymentConfirmed']\n  };\n  const rowsFor=(level='periodCountry')=>level==='branch'?projection.branchRows:projection.rows;\n  const filter=(scope={},level='periodCountry')=>rowsFor(level).filter(r=>(!scope.periodKey||r.periodKey===scope.periodKey)&&(!scope.country||r.country===scope.country)&&(!scope.branchName||r.branchName===scope.branchName)&&(!scope.city||r.city===scope.city));\n  const toCSV=(scope={},level='periodCountry')=>{const cols=headers[level]||headers.periodCountry;const rows=filter(scope,level);return [cols,...rows.map(r=>cols.map(k=>r[k]))].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\\n');};\n  const toJSON=(scope={},level='periodCountry')=>JSON.stringify({schemaVersion:projection.schemaVersion,tenantId:projection.tenantId,projectId:projection.projectId,level,scope,rows:filter(scope,level)},null,2);\n  const report=(reportId,scope={})=>{const definition=projection.catalog.find(x=>x.id===reportId)||null;if(!definition)return {available:false,reason:'unknown_report',definition:null,rows:[]};if(definition.availability!=='available')return {available:false,reason:'pending_source',definition,rows:[]};return {available:true,reason:null,definition,rows:filter(scope,definition.projectionLevel||'periodCountry')};};\n  window.CX_TYA_CORTE1_REPORTS=Object.freeze({\n    ...projection,rowsFor,filter,toCSV,toJSON,report\n  });\n})();\n`;
fs.writeFileSync(outputFile,adapter,'utf8');

const scriptPath=path.relative(path.dirname(htmlFile),outputFile).replaceAll('\\','/');
let html=fs.readFileSync(htmlFile,'utf8');
const tag=`<script src="${scriptPath}"></script>`;
if(!html.includes(tag)){
  const anchor='<script src="core/router.js"></script>';
  if(!html.includes(anchor)) throw new Error('router anchor missing');
  html=html.replace(anchor,`${tag}\n${anchor}`);
  fs.writeFileSync(htmlFile,html,'utf8');
}
const report={
  ok:true,
  decision:'PASS_CORTE1_REPORT_PROJECTION_BUILD',
  payloadFile,contractFile,outputFile,htmlFile,scriptPath,
  periods:periods.length,
  periodCountryRows:rows.length,
  branchRows:branchRows.length,
  availableReports:catalog.filter(x=>x.availability==='available').map(x=>x.id),
  pendingReports:catalog.filter(x=>x.availability!=='available').map(x=>x.id),
  frontendFormatsReady:projection.frontend.formatsReady,
  frontendFormatsPending:projection.frontend.formatsPending,
  totals:projection.totals
};
fs.writeFileSync(path.join(reportDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(reportDir,'report.md'),`# Corte 1 report projection build\n\n- Decision: \`${report.decision}\`\n- Periods: ${report.periods}\n- Period/country rows: ${report.periodCountryRows}\n- Branch rows: ${report.branchRows}\n- Visits: ${report.totals.visits}\n- Available reports: ${report.availableReports.join(', ')}\n- Pending-source reports: ${report.pendingReports.join(', ')}\n- Frontend formats ready: ${report.frontendFormatsReady.join(', ')}\n- Frontend formats pending: ${report.frontendFormatsPending.join(', ')||'none'}\n- Output: \`${outputFile}\`\n`,'utf8');
console.log(JSON.stringify(report,null,2));
