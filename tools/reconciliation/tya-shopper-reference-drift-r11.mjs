#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

function arg(name, fallback=''){
  const i=process.argv.indexOf(name);
  return i>=0 && process.argv[i+1] ? process.argv[i+1] : fallback;
}

const currentFile=arg('--current');
const outJson=arg('--out-json', '.tmp/r11/shopper-reference-drift.source-safe.json');
const outMd=arg('--out-md', '.tmp/r11/shopper-reference-drift.source-safe.md');
const targetHistorical=Number(arg('--target-historical','213'));
const sourcePath='app/data/tya-hr-source-safe-periods.js';
if(!currentFile || !fs.existsSync(currentFile)) throw new Error('missing --current source-safe payload');

function parsePayload(text, label){
  const marker='window.CX_TYA_HR_SOURCE_SAFE';
  const markerAt=text.indexOf(marker);
  if(markerAt<0) throw new Error(`payload marker missing: ${label}`);
  const start=text.indexOf('{', markerAt);
  const end=text.lastIndexOf('}');
  if(start<0 || end<start) throw new Error(`payload JSON missing: ${label}`);
  const payload=JSON.parse(text.slice(start,end+1));
  if(payload?.sourceSafe!==true) throw new Error(`payload is not source-safe: ${label}`);
  return payload;
}

function readPayload(file){
  return parsePayload(fs.readFileSync(file,'utf8'),file);
}

function safeGit(args){
  try{return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:64*1024*1024});}
  catch{return '';}
}

function findHistoricalPayload(){
  const commits=safeGit(['log','--all','--format=%H','--',sourcePath]).split(/\r?\n/).filter(Boolean);
  const checked=[];
  for(const commit of [...new Set(commits)]){
    const text=safeGit(['show',`${commit}:${sourcePath}`]);
    if(!text) continue;
    try{
      const payload=parsePayload(text,`${commit}:${sourcePath}`);
      const count=Number(payload?.counts?.shoppers ?? payload?.shoppers?.length ?? 0);
      checked.push({commit,count,generatedAt:payload.generatedAt||null});
      if(count===targetHistorical && Array.isArray(payload.shoppers) && payload.shoppers.length===targetHistorical){
        return {payload,commit,checked};
      }
    }catch{}
  }
  return {payload:null,commit:null,checked};
}

function refView(s){
  return {
    shopperRefId:String(s?.id||''),
    shopperCode:String(s?.code||''),
    country:String(s?.pais||s?.country||'UNKNOWN').toUpperCase(),
    visits:Number(s?.visitas||0),
    completedVisits:Number(s?.realizadas||0),
    liquidatedVisits:Number(s?.liquidadas||0),
    sourceSafe:s?.sourceSafe===true
  };
}

function mapRefs(payload){
  const map=new Map();
  for(const shopper of payload.shoppers||[]){
    const ref=refView(shopper);
    if(!ref.shopperRefId) continue;
    if(map.has(ref.shopperRefId)) throw new Error(`duplicate shopperRefId in source-safe payload: ${ref.shopperRefId}`);
    map.set(ref.shopperRefId,ref);
  }
  return map;
}

function shaJson(value){
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

const current=readPayload(currentFile);
const historicalSearch=findHistoricalPayload();
const currentMap=mapRefs(current);
let decision='HOLD_REFERENCE_SET_UNAVAILABLE';
let historicalMap=new Map();
let stable=[];
let missingFromCurrent=[];
let newInCurrent=[];
let changedCountry=[];

if(historicalSearch.payload){
  historicalMap=mapRefs(historicalSearch.payload);
  for(const [id,oldRef] of historicalMap){
    const now=currentMap.get(id);
    if(!now) missingFromCurrent.push(oldRef);
    else {
      stable.push(id);
      if(now.country!==oldRef.country) changedCountry.push({shopperRefId:id,historicalCountry:oldRef.country,currentCountry:now.country});
    }
  }
  for(const [id,now] of currentMap){ if(!historicalMap.has(id)) newInCurrent.push(now); }
  if(!missingFromCurrent.length && !newInCurrent.length && !changedCountry.length) decision='PASS_NO_REFERENCE_DRIFT';
  else if(currentMap.size===210 && historicalMap.size===213 && missingFromCurrent.length===3 && newInCurrent.length===0 && changedCountry.length===0) decision='REVIEW_REQUIRED_THREE_HISTORICAL_ONLY_REFS';
  else decision='REVIEW_REQUIRED_UNEXPECTED_REFERENCE_DRIFT';
}

const report={
  schemaVersion:'1.0.0',
  reportId:'tya-shopper-reference-drift-r11',
  generatedAt:new Date().toISOString(),
  tenantId:'tya',
  projectId:'cinepolis',
  decision,
  current:{
    generatedAt:current.generatedAt||null,
    shopperCount:currentMap.size,
    visitCount:Number(current?.counts?.visits||0),
    periodCount:Number(current?.counts?.periods||0),
    referenceSetSha256:shaJson([...currentMap.keys()].sort())
  },
  historical: historicalSearch.payload ? {
    commit:historicalSearch.commit,
    generatedAt:historicalSearch.payload.generatedAt||null,
    shopperCount:historicalMap.size,
    visitCount:Number(historicalSearch.payload?.counts?.visits||0),
    periodCount:Number(historicalSearch.payload?.counts?.periods||0),
    referenceSetSha256:shaJson([...historicalMap.keys()].sort())
  } : null,
  comparison:{
    stableCount:stable.length,
    missingFromCurrentCount:missingFromCurrent.length,
    newInCurrentCount:newInCurrent.length,
    changedCountryCount:changedCountry.length,
    missingFromCurrent,
    newInCurrent,
    changedCountry
  },
  historySearch:{
    sourcePath,
    commitsChecked:historicalSearch.checked.length,
    targetHistoricalCount:targetHistorical,
    candidates:historicalSearch.checked.slice(0,25)
  },
  policy:{
    noRawNames:true,
    noNameMatching:true,
    noAutomaticDelete:true,
    noAutomaticMerge:true,
    noFixtureBackfill:true,
    stableKeysRequired:true,
    humanReviewRequired:decision.startsWith('REVIEW_REQUIRED')||decision.startsWith('HOLD')
  },
  nextAction: historicalSearch.payload
    ? 'Create reviewQueue candidates for historical-only/new/current-country conflicts; do not materialize identities until reviewed.'
    : 'Recover an approved source-safe historical reference set or protected materialization candidate list; do not infer three identities from counts.',
  safeState:{sourceSafe:true,writes:false,imported:false,production:false,providers:false,paymentsExecuted:false}
};

fs.mkdirSync(path.dirname(outJson),{recursive:true});
fs.writeFileSync(outJson,JSON.stringify(report,null,2)+'\n','utf8');
const md=`# R11 — Shopper reference drift TyA\n\n- Decision: \`${decision}\`\n- Current: ${report.current.shopperCount} shoppers / ${report.current.visitCount} visits / ${report.current.periodCount} periods.\n- Historical reference: ${report.historical?`${report.historical.shopperCount} shoppers at ${report.historical.commit}`:'not found in Git history'}.\n- Stable: ${report.comparison.stableCount}.\n- Historical-only: ${report.comparison.missingFromCurrentCount}.\n- Current-only: ${report.comparison.newInCurrentCount}.\n- Country changes: ${report.comparison.changedCountryCount}.\n\nNo names, emails, phones, bank data, DPI, raw HR rows or private URLs are emitted. No match by name and no automatic materialization.\n`;
fs.writeFileSync(outMd,md,'utf8');
console.log(JSON.stringify(report,null,2));
