#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — stabilize source-safe visit identifiers.

  Canonical visit identity is derived only from tenant/project/period/country/sourceRow.
  Mutable operational values such as shopping, cinemaId, quincena and franja never
  participate in the identifier. The tool rewrites only a source-safe snapshot file;
  it performs no provider, database, HR, payment, deploy or production writes.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { buildStableVisitId, stableVisitIdentityVersion } from './tya-stable-visit-id-r20.mjs';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const input=path.resolve(valueOf('--input','app/data/tya-hr-source-safe-periods.js'));
const output=path.resolve(valueOf('--out',valueOf('--input','app/data/tya-hr-source-safe-periods.js')));
const reportDir=path.resolve(valueOf('--report-dir','.tmp/tya-stable-visit-id-r20'));
const globalName=valueOf('--global','CX_TYA_HR_SOURCE_SAFE');

function fail(message){throw new Error(`TYA_STABLE_VISIT_ID_R20_HOLD: ${message}`);}
function readPayload(file){
  if(!fs.existsSync(file))fail(`missing input ${file}`);
  const sandbox={window:{}};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''),sandbox,{filename:file,timeout:10000});
  const payload=sandbox.window[globalName];
  if(!payload||typeof payload!=='object')fail(`missing window.${globalName}`);
  return JSON.parse(JSON.stringify(payload));
}
function writePayload(file,payload){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,[
    '/* CXOrbia TyA source-safe R20 payload with canonical stable visit identifiers. */',
    `window.${globalName} = `,
    JSON.stringify(payload,null,2),
    ';'
  ].join(''),'utf8');
}

const payload=readPayload(input);
if(payload.sourceSafe!==true||payload.imported===true||payload.production===true)fail('input is not source-safe non-production');
if(payload.tenantId!=='tya'||payload.projectId!=='cinepolis')fail(`scope mismatch ${payload.tenantId}/${payload.projectId}`);
if(!Array.isArray(payload.visits)||!payload.visits.length)fail('visits missing');

const version=stableVisitIdentityVersion();
const seenIds=new Map();
const seenRows=new Map();
const changes=[];
const issues=[];

for(const visit of payload.visits){
  const tenantId=String(visit.tenantId||payload.tenantId||'').trim();
  const projectId=String(visit.projectId||payload.projectId||'').trim();
  const periodKey=String(visit.periodKey||'').trim();
  const country=String(visit.country||visit.pais||'').trim().toUpperCase();
  const sourceRow=Number(visit.sourceRow);
  const sourceTab=String(visit.sourceTab||'').trim();
  const hrRowId=String(visit.hrRowId||'').trim();
  if(!sourceTab||!Number.isInteger(sourceRow)||sourceRow<1){issues.push(`source_identity_missing:${hrRowId||visit.id||'unknown'}`);continue;}
  const expectedHrRowId=`${sourceTab}!${sourceRow}`;
  if(hrRowId!==expectedHrRowId){issues.push(`hr_row_identity_mismatch:${hrRowId}/${expectedHrRowId}`);continue;}
  const stableId=buildStableVisitId({tenantId,projectId,periodKey,country,sourceRow});
  const priorId=String(visit.id||visit.visitId||'').trim();
  const duplicateId=seenIds.get(stableId);
  if(duplicateId&&duplicateId!==hrRowId)issues.push(`stable_id_collision:${stableId}/${duplicateId}/${hrRowId}`);
  seenIds.set(stableId,hrRowId);
  const duplicateRow=seenRows.get(hrRowId);
  if(duplicateRow&&duplicateRow!==stableId)issues.push(`hr_row_duplicate:${hrRowId}/${duplicateRow}/${stableId}`);
  seenRows.set(hrRowId,stableId);
  if(priorId!==stableId)changes.push({hrRowId,priorId:priorId||null,stableId});
  visit.id=stableId;
  if(Object.prototype.hasOwnProperty.call(visit,'visitId'))visit.visitId=stableId;
  visit.visitIdentityVersion=version;
}

if(issues.length)fail(issues.slice(0,50).join('|'));
if(seenIds.size!==payload.visits.length)fail(`stable id count ${seenIds.size}/${payload.visits.length}`);
if(seenRows.size!==payload.visits.length)fail(`hr row count ${seenRows.size}/${payload.visits.length}`);

payload.source={
  ...(payload.source||{}),
  visitIdentityVersion:version,
  visitIdentityFields:['tenantId','projectId','periodKey','country','sourceRow'],
  visitIdentityMutableFieldsExcluded:['cinemaId','shopping','quincena','franja','shopper','dates','amounts'],
  stableVisitIdentityApplied:true
};
payload.normalization={
  ...(payload.normalization||{}),
  visitIdentityVersion:version,
  rules:[...new Set([...(payload.normalization?.rules||[]),'stable_visit_identity_from_protected_row_key'])]
};
payload.counts={...(payload.counts||{}),visits:payload.visits.length};

writePayload(output,payload);
fs.mkdirSync(reportDir,{recursive:true});
const report={
  schemaVersion:'1.0.0',
  decision:'PASS_TYA_STABLE_VISIT_ID_R20_APPLY',
  version,
  input:path.relative(process.cwd(),input).replaceAll('\\','/'),
  output:path.relative(process.cwd(),output).replaceAll('\\','/'),
  visits:payload.visits.length,
  changedIds:changes.length,
  unchangedIds:payload.visits.length-changes.length,
  uniqueStableIds:seenIds.size,
  uniqueHrRowIds:seenRows.size,
  sampleChanges:changes.slice(0,20),
  issues,
  safeState:{sourceSafe:true,piiOutput:false,repositoryWrites:false,dataWrites:false,providerWrites:false,hrWrites:false,imports:false,payments:false,deploy:false,production:false}
};
fs.writeFileSync(path.join(reportDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(reportDir,'report.md'),[
  '# TyA stable visit identity R20','',
  `Decision: **${report.decision}**`,
  `Version: \`${version}\``,
  `Visits: ${report.visits}`,
  `Changed IDs: ${report.changedIds}`,
  `Unique stable IDs: ${report.uniqueStableIds}`,
  `Unique HR row IDs: ${report.uniqueHrRowIds}`,'',
  'Identity excludes mutable operational fields. No provider, database, HR, payment, deploy or production writes.'
].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
