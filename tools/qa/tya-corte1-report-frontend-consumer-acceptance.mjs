#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const contractFile=arg('--contract','backend/contracts/phase-a-corte1-report-frontend-consumer-v1.json');
const targetFile=arg('--file','app/modules/cliente-extra.js');
const indexFile=arg('--index','app/index.html');
const outDir=arg('--out','.tmp/tya-corte1-report-frontend-consumer');
fs.mkdirSync(outDir,{recursive:true});

const contract=JSON.parse(fs.readFileSync(contractFile,'utf8'));
const source=fs.readFileSync(targetFile,'utf8');
const start=source.indexOf("CX.module('cli_reportes'");
const end=source.indexOf('/* ============== Mi Programa',start);
const block=start>=0?source.slice(start,end>start?end:source.length):'';
const blockers=[];
const warnings=[];
const add=(arr,code,observed,expected)=>arr.push({code,observed,expected});

if(!block)add(blockers,'cli_reportes_module_missing',false,true);
if(block&&!block.includes('CX_TYA_CORTE1_REPORTS'))add(blockers,'approved_projection_not_consumed',false,true);
for(const fragment of contract.honestStates?.forbiddenTextFragments||[]){
  if(block.includes(fragment))add(blockers,'forbidden_demo_copy_present',fragment,'absent');
}
for(const card of contract.reportCards||[]){
  if(block&&!block.includes(card.reportId))add(blockers,'report_id_missing',card.reportId,'present in cli_reportes');
}
if(block&&!block.includes(contract.honestStates?.pendingSourceLabel||'Pendiente de fuente'))add(blockers,'pending_source_copy_missing',false,true);
if(block&&!block.includes(contract.honestStates?.pendingScopeLabel||'Pendiente de alcance autorizado'))add(blockers,'pending_scope_copy_missing',false,true);
if(block&&!/window\.print\s*\(|\.print\s*\(/.test(block))add(blockers,'pdf_print_flow_missing',false,true);
if(block&&!/\bXLSX\b/.test(block))add(blockers,'xlsx_export_missing',false,true);
if(block&&!/PptxGenJS|pptxgen/i.test(block))add(blockers,'pptx_export_missing',false,true);
if(block&&!/periodKey/.test(block))add(blockers,'period_scope_missing',false,true);
if(block&&!/country/.test(block))add(blockers,'country_scope_missing',false,true);
if(block&&!/pending_source/.test(block))add(warnings,'pending_source_code_not_explicit',false,true);

const pptContract=contract.exportFormats?.PPT;
if(pptContract?.required){
  const vendor='app/vendor/pptxgenjs.min.js';
  if(!fs.existsSync(vendor))add(blockers,'local_pptx_dependency_missing',vendor,'present');
  const html=fs.existsSync(indexFile)?fs.readFileSync(indexFile,'utf8'):'';
  if(!html.includes('vendor/pptxgenjs.min.js'))add(blockers,'pptx_dependency_not_loaded',false,true);
  if(/https?:\/\/[^"']*pptx/i.test(html))add(blockers,'remote_pptx_cdn_forbidden',true,false);
}

const protectedFiles=contract.protectedFiles||[];
const result={
  ok:blockers.length===0,
  decision:blockers.length?'HOLD_CORTE1_REPORT_FRONTEND_CONSUMER':warnings.length?'PASS_WITH_REVIEW_CORTE1_REPORT_FRONTEND_CONSUMER':'PASS_CORTE1_REPORT_FRONTEND_CONSUMER',
  contractId:contract.id,
  targetFile,
  protectedFiles,
  blockers,
  warnings
};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(result,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),`# Corte 1 report frontend consumer acceptance\n\n- Decision: \`${result.decision}\`\n- Target: \`${targetFile}\`\n- Blockers: ${blockers.length}\n- Warnings: ${warnings.length}\n\n## Blockers\n${blockers.length?blockers.map(x=>`- ${x.code}: observed=${JSON.stringify(x.observed)} expected=${JSON.stringify(x.expected)}`).join('\n'):'- None'}\n\n## Warnings\n${warnings.length?warnings.map(x=>`- ${x.code}: observed=${JSON.stringify(x.observed)} expected=${JSON.stringify(x.expected)}`).join('\n'):'- None'}\n`,'utf8');
console.log(JSON.stringify(result,null,2));
if(blockers.length)process.exit(1);
