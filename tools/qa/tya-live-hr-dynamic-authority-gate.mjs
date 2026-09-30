#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=String(process.argv[2]||process.env.CXORBIA_DEV_ROOT_URL||'').replace(/\/$/,'');
const output=String(process.env.CXORBIA_LIVE_AUTHORITY_OUTPUT||'.tmp/phase-a-runtime-multirole/live-hr-authority.json');
if(!root.startsWith('https://'))throw new Error('DEV_ROOT_URL_REQUIRED');

const endpoint=root+'/api/tya/cinepolis/hr-live?view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&fresh=1&ts='+Date.now();
const response=await fetch(endpoint,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});
if(!response.ok)throw new Error('LIVE_HR_HTTP_'+response.status);
const json=await response.json();
const snapshot=json?.snapshot||json?.data||json;
const visits=Array.isArray(snapshot?.visits)?snapshot.visits:[];
const shoppers=Array.isArray(snapshot?.shoppers)?snapshot.shoppers:[];
if(visits.length<1)throw new Error('LIVE_HR_VISITS_EMPTY');

const periodOf=v=>{
  const candidates=[v?.periodKey,v?.periodId,v?.projectPeriodId,v?.period,v?.mes,v?.monthKey];
  for(const raw of candidates){
    const match=String(raw||'').match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);
    if(match)return `${match[1]}-${match[2]}`;
  }
  return '';
};
const stableKeyOf=v=>{
  for(const raw of [v?.visitId,v?.id,v?.hrRowId]){const value=String(raw||'').trim();if(value)return value;}
  const tab=String(v?.sourceTab||'').trim(),row=String(v?.sourceRow||'').trim();
  return tab&&row?`${tab}::${row}`:'';
};
const periodCounts={};
const missingPeriod=[];
const keys=new Map();
const missingStableKey=[];
for(let i=0;i<visits.length;i++){
  const visit=visits[i];
  const period=periodOf(visit);
  if(period)periodCounts[period]=(periodCounts[period]||0)+1;else missingPeriod.push(i);
  const key=stableKeyOf(visit);
  if(!key)missingStableKey.push(i);
  else keys.set(key,(keys.get(key)||0)+1);
}
const duplicateStableKeys=[...keys.entries()].filter(([,count])=>count>1).map(([key,count])=>({key,count}));
const periods=Object.keys(periodCounts).sort();
if(!periods.length)throw new Error('LIVE_HR_PERIODS_EMPTY');
if(missingPeriod.length)throw new Error('LIVE_HR_VISITS_WITHOUT_PERIOD_'+missingPeriod.length);
if(missingStableKey.length)throw new Error('LIVE_HR_VISITS_WITHOUT_STABLE_KEY_'+missingStableKey.length);
if(duplicateStableKeys.length)throw new Error('LIVE_HR_DUPLICATE_STABLE_KEYS_'+duplicateStableKeys.length);
const sum=Object.values(periodCounts).reduce((a,b)=>a+b,0);
if(sum!==visits.length)throw new Error('LIVE_HR_PERIOD_SUM_MISMATCH');

const evidence={
  schemaVersion:'cxorbia.tya.live-hr-dynamic-authority.v1',
  generatedAt:new Date().toISOString(),
  decision:'PASS_TYA_LIVE_HR_DYNAMIC_AUTHORITY',
  source:{endpoint:'DEV_HR_LIVE_OPERATIONAL_NAMES',revision:json?.revision||json?.meta?.revision||snapshot?.revision||null},
  visits:visits.length,
  shoppers:shoppers.length,
  periods:periods.length,
  firstPeriod:periods[0],
  latestPeriod:periods.at(-1),
  periodCounts,
  duplicateStableKeys:0,
  missingStableKeys:0,
  missingPeriods:0,
  frozenVisitCountAssumed:false,
  frozenLatestPeriodAssumed:false,
  safety:{providerReads:true,providerWrites:false,dataWrites:false,authWrites:0,firestoreWrites:0,hrWrites:0,deploys:0,merge:false,production:false}
};
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(evidence,null,2)+'\n','utf8');
console.log(JSON.stringify(evidence));
