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
const assigned=v=>typeof v.hasShopper==='boolean'?v.hasShopper:Boolean(v.shopperId||v.shopperCode||v.shopper);
const performed=v=>Boolean(v.performed===true||v.realizada||['realizada','cuestionario','submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase()));
const questionnaire=v=>Boolean(v.questionnaireCompleted===true||v.cuestFecha||v.questionnaireAt||['cuestionario','submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase()));
const submitted=v=>Boolean(v.submit===true||v.submittedAt||['submitido','submitted','liquidada','pagada'].includes(String(v.estado||v.visitState||'').toLowerCase()));
const paid=v=>String(v.paymentState||v.estadoPago||'').toLowerCase()==='confirmado';

const snapshot=parsePayload(payloadFile);
const contract=JSON.parse(fs.readFileSync(contractFile,'utf8'));
if(snapshot.tenantId!==contract.tenantId||snapshot.projectId!==contract.projectId) throw new Error('tenant/project mismatch');
if(snapshot.sourceSafe!==true||snapshot.production===true||snapshot.imported===true) throw new Error('unsafe snapshot state');

const rowsMap=new Map();
for(const v of snapshot.visits||[]){
  const periodKey=String(v.periodKey||'').trim();
  const c=country(v);
  const key=`${periodKey}::${c}`;
  if(!rowsMap.has(key)) rowsMap.set(key,{tenantId:snapshot.tenantId,projectId:snapshot.projectId,periodKey,country:c,visits:0,assigned:0,unassigned:0,performed:0,questionnaire:0,submitted:0,paymentConfirmed:0});
  const r=rowsMap.get(key);r.visits++;
  if(assigned(v))r.assigned++;else r.unassigned++;
  if(performed(v))r.performed++;
  if(questionnaire(v))r.questionnaire++;
  if(submitted(v))r.submitted++;
  if(paid(v))r.paymentConfirmed++;
}
const rows=[...rowsMap.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey)||a.country.localeCompare(b.country));
const periods=[...new Set(rows.map(r=>r.periodKey))].sort();
if(periods.length!==contract.sourceScope.expectedPeriods) throw new Error(`period count mismatch ${periods.length}`);
if(rows.reduce((n,r)=>n+r.visits,0)!==contract.sourceScope.expectedVisits) throw new Error('visit total mismatch');

const projection={
  schemaVersion:'1.0.0',contractId:contract.id,generatedAt:snapshot.generatedAt||null,
  tenantId:snapshot.tenantId,projectId:snapshot.projectId,projectName:snapshot.projectName||'Cinépolis',
  source:{title:snapshot.source?.title||null,type:snapshot.source?.type||null,sourceSafe:true,production:false,imported:false},
  periods,countries:[...new Set(rows.map(r=>r.country))].sort(),latestPeriod:periods.at(-1)||null,
  rows,
  totals:{
    visits:rows.reduce((n,r)=>n+r.visits,0),assigned:rows.reduce((n,r)=>n+r.assigned,0),unassigned:rows.reduce((n,r)=>n+r.unassigned,0),
    performed:rows.reduce((n,r)=>n+r.performed,0),questionnaire:rows.reduce((n,r)=>n+r.questionnaire,0),submitted:rows.reduce((n,r)=>n+r.submitted,0),paymentConfirmed:rows.reduce((n,r)=>n+r.paymentConfirmed,0)
  },
  frontend:{formatsReady:['json','csv'],formatsPending:['pdf','xlsx','pptx']}
};
const serialized=JSON.stringify(projection).replaceAll('</','<\\/');
const adapter=`/* Generated Corte 1 source-safe report projection. No PII, writes or production. */\n(function(){\n  const projection=${serialized};\n  const headers=['tenantId','projectId','periodKey','country','visits','assigned','unassigned','performed','questionnaire','submitted','paymentConfirmed'];\n  const filter=(scope={})=>projection.rows.filter(r=>(!scope.periodKey||r.periodKey===scope.periodKey)&&(!scope.country||r.country===scope.country));\n  const toCSV=(scope={})=>{const rows=filter(scope);return [headers,...rows.map(r=>headers.map(k=>r[k]))].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\\n');};\n  window.CX_TYA_CORTE1_REPORTS=Object.freeze({\n    ...projection,filter,toCSV,toJSON:(scope={})=>JSON.stringify({schemaVersion:projection.schemaVersion,tenantId:projection.tenantId,projectId:projection.projectId,scope,rows:filter(scope)},null,2)\n  });\n})();\n`;
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
const report={ok:true,decision:'PASS_CORTE1_REPORT_PROJECTION_BUILD',payloadFile,contractFile,outputFile,htmlFile,scriptPath,periods:periods.length,rows:rows.length,totals:projection.totals};
fs.writeFileSync(path.join(reportDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(reportDir,'report.md'),`# Corte 1 report projection build\n\n- Decision: \`${report.decision}\`\n- Periods: ${report.periods}\n- Rows: ${report.rows}\n- Visits: ${report.totals.visits}\n- Output: \`${outputFile}\`\n`,'utf8');
console.log(JSON.stringify(report,null,2));
