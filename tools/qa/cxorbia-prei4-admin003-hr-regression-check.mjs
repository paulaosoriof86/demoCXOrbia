#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const [file,baselineRevision,expectedAllRowsHash,expectedSeptemberRowsHash]=process.argv.slice(2);
const outDir=String(process.env.PREI4_003_LIVE_OUT||'.tmp/prei4-admin-003-live');
if(!file||!baselineRevision||!expectedAllRowsHash||!expectedSeptemberRowsHash)throw new Error('ENVIRONMENT_FAILURE:ADMIN003_HR_REGRESSION_ARGS');
const d=JSON.parse(fs.readFileSync(file,'utf8'));
const runtime=d._runtime||{};
const revision=String(runtime.revision||d.revision||d.sourceRevision||'');
const refreshError=runtime.refreshError??runtime.lastRefreshError??d.refreshError??d.lastRefreshError??null;
const summary=Array.isArray(d.periodOperationalSummary)?d.periodOperationalSummary:[];
const sep=summary.find(x=>String(x.periodKey)==='2026-09');
const aug=summary.find(x=>String(x.periodKey)==='2026-08');
const visits=Array.isArray(d.visits)?d.visits:[];
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const rowHash=rows=>sha(rows.map(v=>String(v.hrRowId||'')).sort().join('\n')+'\n');
const allRowsHash=rowHash(visits);
const septemberVisits=visits.filter(v=>String(v.periodKey)==='2026-09');
const septemberRowsHash=rowHash(septemberVisits);
const uniqueStableRows=new Set(visits.map(v=>String(v.hrRowId||''))).size===visits.length;
const pass=/^[0-9a-f]{64}$/.test(revision)&&refreshError==null&&d.sourceSafe===true&&d.production===false&&uniqueStableRows&&allRowsHash===expectedAllRowsHash&&septemberRowsHash===expectedSeptemberRowsHash&&Number(sep?.total)===44&&Number(sep?.byCountry?.GT)===34&&Number(sep?.byCountry?.HN)===10&&Number(aug?.total)===44;
const out={decision:pass?'PASS_PREI4_008_CUMULATIVE_LIVE_CURRENT_AUTHORITY':'HOLD_PREI4_008_CUMULATIVE_LIVE_CURRENT_AUTHORITY',baselineRevision,currentRevision:revision,dataEvolutionDetected:revision!==baselineRevision,refreshError,sourceSafe:d.sourceSafe===true,production:d.production===true,stableIdentity:{authority:'hrRowId',allRowsHash,septemberRowsHash,uniqueStableRows,allVisitCount:visits.length,septemberVisitCount:septemberVisits.length},september:sep||null,august:aug||null};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(outDir+'/hr-regression.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
if(!pass)process.exit(1);
