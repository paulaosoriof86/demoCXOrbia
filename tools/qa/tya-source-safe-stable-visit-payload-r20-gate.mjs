#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { buildStableVisitId, stableVisitIdentityVersion } from '../hr-source/tya-stable-visit-id-r20.mjs';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const input=path.resolve(arg('--input','app/data/tya-hr-source-safe-periods.js'));
const globalName=arg('--global','CX_TYA_HR_SOURCE_SAFE');
const blockers=[];
const add=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);

let payload=null;
try{
  const sandbox={window:{}};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''),sandbox,{filename:input,timeout:10000});
  payload=sandbox.window[globalName];
}catch(error){add('payload_unreadable',error.message);}

const version=stableVisitIdentityVersion();
const ids=new Set(),rows=new Set();
let checked=0;
if(payload){
  if(payload.sourceSafe!==true)add('source_safe_required');
  if(payload.source?.stableVisitIdentityApplied!==true)add('stable_identity_marker_missing');
  if(payload.source?.visitIdentityVersion!==version)add('source_identity_version_mismatch',String(payload.source?.visitIdentityVersion||''));
  if(payload.normalization?.visitIdentityVersion!==version)add('normalization_identity_version_mismatch',String(payload.normalization?.visitIdentityVersion||''));
  for(const visit of Array.isArray(payload.visits)?payload.visits:[]){
    checked++;
    const expected=buildStableVisitId({
      tenantId:visit.tenantId||payload.tenantId,
      projectId:visit.projectId||payload.projectId,
      periodKey:visit.periodKey,
      country:visit.country||visit.pais,
      sourceRow:visit.sourceRow
    });
    const observed=String(visit.id||visit.visitId||'');
    const hrRowId=String(visit.hrRowId||'');
    const expectedHrRowId=`${String(visit.sourceTab||'').trim()}!${Number(visit.sourceRow)}`;
    if(observed!==expected)add('visit_id_not_stable',`${hrRowId||checked}/${observed}/${expected}`);
    if(visit.visitIdentityVersion!==version)add('visit_identity_version_missing',hrRowId||String(checked));
    if(hrRowId!==expectedHrRowId)add('hr_row_identity_mismatch',`${hrRowId}/${expectedHrRowId}`);
    if(ids.has(observed))add('duplicate_stable_visit_id',observed);
    if(rows.has(hrRowId))add('duplicate_hr_row_id',hrRowId);
    ids.add(observed);rows.add(hrRowId);
  }
  if(!checked)add('visits_missing');
  if(Number(payload.counts?.visits)!==checked)add('visit_count_mismatch',`${payload.counts?.visits}/${checked}`);
}

const report={
  ok:blockers.length===0,
  decision:blockers.length?'HOLD_TYA_SOURCE_SAFE_STABLE_VISIT_PAYLOAD_R20':'PASS_TYA_SOURCE_SAFE_STABLE_VISIT_PAYLOAD_R20',
  input:path.relative(process.cwd(),input).replaceAll('\\','/'),
  version,
  checked,
  uniqueVisitIds:ids.size,
  uniqueHrRowIds:rows.size,
  blockers,
  safeState:{sourceSafe:true,repositoryWrites:false,dataWrites:false,providerWrites:false,hrWrites:false,imports:false,payments:false,deploy:false,production:false}
};
console.log(JSON.stringify(report,null,2));
if(blockers.length)process.exit(1);
