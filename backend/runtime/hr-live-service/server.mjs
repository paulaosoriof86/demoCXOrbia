#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../../..');
const PORT=Number(process.env.PORT||8080);
const CACHE_MS=Math.max(0,Number(process.env.CXORBIA_LIVE_HR_CACHE_MS||15000));
const ENDPOINT_PATHS=new Set([
  '/v1/tenants/tya/projects/cinepolis/hr-live',
  '/api/tya/cinepolis/hr-live'
]);
const ALLOWED_ORIGINS=new Set([
  'https://cxorbia-backend-dev.web.app',
  'https://cxorbia-backend-dev.firebaseapp.com',
  'http://127.0.0.1:4173',
  'http://localhost:4173'
]);

let cache=null;
let inFlight=null;

function runNode(args,env){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:ROOT,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});
    let out='',err='';
    child.stdout.on('data',chunk=>{out+=chunk;});
    child.stderr.on('data',chunk=>{err+=chunk;});
    child.on('error',reject);
    child.on('close',code=>{
      if(code===0)return resolve({out,err});
      reject(new Error(`Command failed (${code}): node ${args.join(' ')}\n${err.slice(-3000)}\n${out.slice(-1000)}`));
    });
  });
}

function parseSnapshot(file){
  const text=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  const match=text.match(/window\.CX_TYA_HR_SOURCE_SAFE\s*=\s*([\s\S]*);\s*$/);
  if(!match)throw new Error('Source-safe payload wrapper invalid.');
  const snapshot=JSON.parse(match[1]);
  if(snapshot?.sourceSafe!==true||snapshot?.imported===true||Number(snapshot?.firestoreWrites||0)!==0)throw new Error('Unsafe snapshot state.');
  if(!Array.isArray(snapshot?.periods)||!snapshot.periods.length||!Array.isArray(snapshot?.visits)||!snapshot.visits.length)throw new Error('Live snapshot empty.');
  return snapshot;
}

async function buildSnapshot(){
  const now=Date.now();
  if(cache&&now-cache.loadedAt<CACHE_MS)return cache;
  if(inFlight)return inFlight;
  inFlight=(async()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-hr-live-'));
    const payload=path.join(dir,'snapshot.js');
    const env={
      CXORBIA_HR_SOURCE_SAFE_OUT:payload,
      CXORBIA_HR_LIVE_MAX_ROW:process.env.CXORBIA_HR_LIVE_MAX_ROW||'140',
      CXORBIA_HR_LIVE_MAX_COL:process.env.CXORBIA_HR_LIVE_MAX_COL||'AI',
      CXORBIA_HR_EARLIEST_PERIOD:process.env.CXORBIA_HR_EARLIEST_PERIOD||'2025-06',
      CXORBIA_GATE_OUT:path.join(dir,'source-gates')
    };
    try{
      await runNode(['tools/hr-source/tya-build-live-hr-source-safe-r20.mjs'],env);
      await runNode(['tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs','--input',payload,'--out',payload,'--inventory','backend/contracts/tya-hr-tab-inventory-r20-v1.json','--report-dir',path.join(dir,'inventory')],env);
      await runNode(['tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs','--input',payload,'--out',payload,'--report-dir',path.join(dir,'canonical')],env);
      await runNode(['tools/hr-source/tya-reapply-canonical-state-r20.mjs','--input',payload,'--out',payload,'--report-dir',path.join(dir,'state')],env);
      await runNode(['tools/qa/tya-live-hr-read-probe-gate.mjs','--payload',payload,'--out',path.join(dir,'probe'),'--max-age-seconds','600'],env);
      const snapshot=parseSnapshot(payload);
      const json=JSON.stringify(snapshot);
      const revision=crypto.createHash('sha256').update(json).digest('hex');
      cache={snapshot,json,revision,loadedAt:Date.now()};
      return cache;
    } finally {
      fs.rmSync(dir,{recursive:true,force:true});
      inFlight=null;
    }
  })();
  return inFlight;
}

function setCommonHeaders(res,origin){
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma','no-cache');
  res.setHeader('Expires','0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Vary','Origin');
  if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
}

function sendJson(res,status,value){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(value));
}

const server=http.createServer(async(req,res)=>{
  const origin=String(req.headers.origin||'');
  setCommonHeaders(res,origin);
  if(req.method==='OPTIONS'){
    res.statusCode=204;
    res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    return res.end();
  }
  if(req.method!=='GET')return sendJson(res,405,{ok:false,error:'method_not_allowed'});
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(url.pathname==='/health')return sendJson(res,200,{ok:true,service:'cxorbia-live-hr-source-safe',cacheMs:CACHE_MS,writes:false,production:false});
  if(!ENDPOINT_PATHS.has(url.pathname))return sendJson(res,404,{ok:false,error:'not_found'});
  try{
    const current=await buildSnapshot();
    const format=url.searchParams.get('format')||'json';
    res.setHeader('ETag',`"${current.revision}"`);
    res.setHeader('X-CXOrbia-Source-Revision',current.revision);
    res.setHeader('X-CXOrbia-Generated-At',current.snapshot.generatedAt||'');
    if(format==='meta'){
      return sendJson(res,200,{
        ok:true,
        revision:current.revision,
        generatedAt:current.snapshot.generatedAt,
        periods:current.snapshot.counts?.periods??current.snapshot.periods.length,
        visits:current.snapshot.counts?.visits??current.snapshot.visits.length,
        latestPeriodKey:[...(current.snapshot.periods||[])].map(p=>p.key).filter(Boolean).sort().at(-1)||null,
        sourceSafe:true,
        runtimeRead:true,
        cacheMs:CACHE_MS,
        writes:false,
        imports:false,
        production:false
      });
    }
    if(format==='js'){
      res.statusCode=200;
      res.setHeader('Content-Type','application/javascript; charset=utf-8');
      return res.end(`window.CX_TYA_HR_SOURCE_SAFE=${current.json};window.CX_TYA_HR_LIVE_META=${JSON.stringify({revision:current.revision,generatedAt:current.snapshot.generatedAt,runtimeRead:true,sourceSafe:true})};`);
    }
    return sendJson(res,200,{...current.snapshot,_runtime:{revision:current.revision,runtimeRead:true,cacheMs:CACHE_MS}});
  }catch(error){
    console.error(error.stack||error.message||String(error));
    return sendJson(res,503,{ok:false,error:'live_hr_read_failed',message:String(error.message||error).slice(0,500),sourceSafe:true,writes:false,production:false});
  }
});

server.listen(PORT,'0.0.0.0',()=>console.log(`CXOrbia live HR source-safe service listening on ${PORT}`));
