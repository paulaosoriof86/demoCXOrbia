#!/usr/bin/env node
import fs from 'node:fs';

const [file,expected]=process.argv.slice(2);
const outDir=String(process.env.PREI4_003_LIVE_OUT||'.tmp/prei4-admin-003-live');
if(!file||!expected)throw new Error('ENVIRONMENT_FAILURE:ADMIN003_HR_REGRESSION_ARGS');
const d=JSON.parse(fs.readFileSync(file,'utf8'));
const runtime=d._runtime||{};
const revision=String(runtime.revision||d.revision||d.sourceRevision||'');
const refreshError=runtime.refreshError??runtime.lastRefreshError??d.refreshError??d.lastRefreshError??null;
const summary=Array.isArray(d.periodOperationalSummary)?d.periodOperationalSummary:[];
const sep=summary.find(x=>String(x.periodKey)==='2026-09');
const aug=summary.find(x=>String(x.periodKey)==='2026-08');
const visits=Array.isArray(d.visits)?d.visits:[];
const uniqueIds=new Set(visits.map(v=>String(v.id||v.visitId||''))).size===visits.length;
const pass=
  revision===expected&&
  refreshError==null&&
  Number(sep?.total)===44&&
  Number(sep?.byCountry?.GT)===34&&
  Number(sep?.byCountry?.HN)===10&&
  Number(aug?.total)===44&&
  uniqueIds;
const out={
  decision:pass?'PASS_PREI4_008_REGRESSION_LIVE':'HOLD_PREI4_008_REGRESSION_LIVE',
  revision,refreshError,september:sep||null,august:aug||null,visitCount:visits.length,uniqueIds
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(outDir+'/hr-regression.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
if(!pass)process.exit(1);
