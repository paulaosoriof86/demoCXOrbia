#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { maybeHandleDevVisualRequest } from './dev-visual.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../../..');
const PORT=Number(process.env.PORT||8080);
const CACHE_MS=Math.max(15000,Number(process.env.CXORBIA_LIVE_HR_CACHE_MS||55000));
const BOOTSTRAP_FILE=path.join(ROOT,'app/data/tya-hr-source-safe-periods.js');
const REGISTRY_FILE=path.join(ROOT,'backend/config/tya-live-hr-tab-registry.source-safe.json');
const DEV_OPERATIONAL_NAMES=process.env.CXORBIA_DEV_OPERATIONAL_NAMES==='true';
const DEV_OPERATIONAL_TOKEN='YES_PAULA_20260731_NAMES_DEV';
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
const VOLATILE_REVISION_KEYS=new Set(['generatedAt','lastSnapshotAt','sourceSnapshotAt']);

let cache=null;
let inFlight=null;
let lastRefreshError=null;
let lastRefreshStartedAt=null;
let lastRefreshFinishedAt=null;
let lastRefreshDurationMs=null;

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
  const match=text.match(/window\.CX_TYA_HR_SOURCE_SAFE\s*=\s*([\s\S]*?);\s*(?:window\.CX_TYA_HR_VIVA_SOURCE_SAFE\s*=\s*true\s*;\s*)?$/);
  if(!match)throw new Error('Source-safe payload wrapper invalid.');
  const snapshot=JSON.parse(match[1]);
  if(snapshot?.sourceSafe!==true||snapshot?.imported===true||Number(snapshot?.firestoreWrites||0)!==0)throw new Error('Unsafe snapshot state.');
  if(!Array.isArray(snapshot?.periods)||!snapshot.periods.length||!Array.isArray(snapshot?.visits)||!snapshot.visits.length)throw new Error('Live snapshot empty.');
  return snapshot;
}

function parseIdentity(file){
  if(!file||!fs.existsSync(file))return new Map();
  const x=JSON.parse(fs.readFileSync(file,'utf8'));
  if(x?.schemaVersion!=='cxorbia.tya-dev-operational-display-identity.v1'||x?.displayIdentityOnly!==true||x?.containsContactData!==false||x?.containsGovernmentId!==false||x?.containsBankData!==false||x?.containsCredentials!==false)throw new Error('Operational display identity overlay invalid.');
  return new Map((x.identities||[]).filter(i=>i?.shopperId&&i?.displayName).map(i=>[String(i.shopperId),String(i.displayName)]));
}

function stableRevisionValue(value){
  if(Array.isArray(value))return value.map(stableRevisionValue);
  if(value&&typeof value==='object'){
    const out={};
    for(const key of Object.keys(value).sort()){
      if(VOLATILE_REVISION_KEYS.has(key))continue;
      out[key]=stableRevisionValue(value[key]);
    }
    return out;
  }
  return value;
}

function materialize(snapshot,origin,identity=new Map()){
  const json=JSON.stringify(snapshot);
  const stableJson=JSON.stringify(stableRevisionValue(snapshot));
  const revision=crypto.createHash('sha256').update(stableJson).digest('hex');
  return {snapshot,json,revision,loadedAt:Date.now(),origin,identity};
}

function operationalSnapshot(current){
  const snapshot=JSON.parse(JSON.stringify(current.snapshot));
  const identity=current.identity||new Map();
  for(const shopper of snapshot.shoppers||[]){
    const name=identity.get(String(shopper.shopperId||shopper.id||''));
    if(name){shopper.nombre=name;shopper.operationalDisplayName=true;shopper.dataLevel=shopper.dataLevel||'protected_reference';}
  }
  for(const visit of snapshot.visits||[]){
    const name=identity.get(String(visit.shopperId||''));
    if(name){visit.shopper=name;visit.operationalDisplayName=true;}
  }
  snapshot.operationalIdentityPreview=true;
  snapshot.operationalIdentityScope='display_name_only';
  snapshot.source={...(snapshot.source||{}),operationalIdentityPreview:true,operationalIdentityScope:'display_name_only',sensitivePiiExcluded:['telefono','mail','dpi','banco','direccion_shopper','observaciones','hr_url_privada','workbook_crudo','credenciales']};
  return snapshot;
}

function loadBootstrap(){
  try{
    if(!fs.existsSync(BOOTSTRAP_FILE))return;
    cache=materialize(parseSnapshot(BOOTSTRAP_FILE),'build_bootstrap');
    console.log(`CXOrbia live HR bootstrap ready ${cache.revision.slice(0,12)}`);
  }catch(error){
    console.warn(`CXOrbia live HR bootstrap unavailable: ${String(error?.message||error)}`);
  }
}

async function refreshSnapshot(){
  if(inFlight)return inFlight;
  lastRefreshStartedAt=new Date().toISOString();
  const started=Date.now();
  inFlight=(async()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-hr-live-'));
    const payload=path.join(dir,'snapshot.js');
    const runtimeRegistry=path.join(dir,'tab-registry.source-safe.json');
    const registryEvidence=path.join(dir,'tab-registry-evidence.source-safe.json');
    const identityFile=path.join(dir,'operational-display-identity.dev.json');
    if(fs.existsSync(REGISTRY_FILE))fs.copyFileSync(REGISTRY_FILE,runtimeRegistry);
    const env={
      CXORBIA_HR_SOURCE_SAFE_OUT:payload,
      CXORBIA_HR_LIVE_MAX_ROW:process.env.CXORBIA_HR_LIVE_MAX_ROW||'140',
      CXORBIA_HR_LIVE_MAX_COL:process.env.CXORBIA_HR_LIVE_MAX_COL||'AI',
      CXORBIA_HR_EARLIEST_PERIOD:process.env.CXORBIA_HR_EARLIEST_PERIOD||'2025-06',
      CXORBIA_GATE_OUT:path.join(dir,'source-gates'),
      CXORBIA_HR_TAB_REGISTRY:runtimeRegistry,
      CXORBIA_HR_TAB_REGISTRY_EVIDENCE:registryEvidence,
      CXORBIA_HR_OPERATIONAL_IDENTITY_OUT:identityFile
    };
    try{
      /* Provider metadata is refreshed first. In GitHub gates this uses the
         explicit DEV service-account secret; in Cloud Run it uses the runtime
         service-account metadata token. This is what makes new monthly tabs
         discoverable without chat/manual configuration. */
      await runNode(['tools/hr-source/tya-live-provider-registry-identity-dev.mjs'],env);
      await runNode(['tools/hr-source/tya-build-live-hr-source-safe-r20.mjs'],env);
      await runNode(['tools/hr-source/tya-enforce-live-tab-registry.mjs'],env);
      await runNode(['tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs','--input',payload,'--out',payload,'--report-dir',path.join(dir,'canonical')],env);
      await runNode(['tools/hr-source/tya-reapply-canonical-state-r20.mjs','--input',payload,'--out',payload,'--report-dir',path.join(dir,'state')],env);
      await runNode(['tools/qa/tya-live-hr-read-probe-gate.mjs','--payload',payload,'--out',path.join(dir,'probe'),'--max-age-seconds','600'],env);
      cache=materialize(parseSnapshot(payload),'runtime_refresh',parseIdentity(identityFile));
      lastRefreshError=null;
      lastRefreshFinishedAt=new Date().toISOString();
      lastRefreshDurationMs=Date.now()-started;
      return cache;
    } finally {
      fs.rmSync(dir,{recursive:true,force:true});
    }
  })();
  try{
    return await inFlight;
  }catch(error){
    lastRefreshError=String(error?.message||error).slice(0,500);
    lastRefreshFinishedAt=new Date().toISOString();
    lastRefreshDurationMs=Date.now()-started;
    throw error;
  }finally{
    inFlight=null;
  }
}

async function buildSnapshot({forceFresh=false}={}){
  if(forceFresh)return inFlight||refreshSnapshot();
  const age=cache?Date.now()-cache.loadedAt:Infinity;
  if(cache&&age<CACHE_MS)return cache;
  if(inFlight)return cache||inFlight;
  if(cache){
    refreshSnapshot().catch(error=>console.error(`CXOrbia live HR background refresh failed: ${String(error?.message||error)}`));
    return cache;
  }
  return refreshSnapshot();
}

function runtimeMeta(current){
  return {
    revision:current.revision,
    revisionStable:true,
    generatedAt:current.snapshot.generatedAt,
    sourceReadAt:new Date(current.loadedAt).toISOString(),
    runtimeRead:true,
    sourceSafe:true,
    sourceAccessMode:current.snapshot.source?.accessMode||null,
    tabRegistryMode:current.snapshot.source?.tabRegistryMode||null,
    tabRegistryAutoDiscovery:current.snapshot.source?.tabRegistryAutoDiscovery===true,
    tabRegistryObservedAt:current.snapshot.source?.tabRegistryObservedAt||null,
    operationalDisplayIdentityReady:DEV_OPERATIONAL_NAMES&&Number(current.identity?.size||0)>0,
    operationalDisplayIdentityCount:DEV_OPERATIONAL_NAMES?Number(current.identity?.size||0):0,
    cacheOrigin:current.origin||null,
    cacheAgeMs:Math.max(0,Date.now()-current.loadedAt),
    cacheMs:CACHE_MS,
    refreshStartedAt:lastRefreshStartedAt,
    refreshFinishedAt:lastRefreshFinishedAt,
    refreshDurationMs:lastRefreshDurationMs,
    refreshError:lastRefreshError,
    writes:false,
    imports:false,
    production:false
  };
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

loadBootstrap();

const server=http.createServer(async(req,res)=>{
  const origin=String(req.headers.origin||'');
  setCommonHeaders(res,origin);
  if(req.method==='OPTIONS'){
    res.statusCode=204;
    res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
    return res.end();
  }
  if(req.method!=='GET')return sendJson(res,405,{ok:false,error:'method_not_allowed'});
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(url.pathname==='/health')return sendJson(res,200,{ok:true,service:'cxorbia-live-hr-source-safe',cacheMs:CACHE_MS,bootstrapReady:Boolean(cache),revisionStable:true,autoMonthProviderRegistry:true,operationalDisplayIdentityDev:DEV_OPERATIONAL_NAMES,devFullVisualEndpoint:true,lastRefreshError,writes:false,production:false});
  if(!ENDPOINT_PATHS.has(url.pathname))return sendJson(res,404,{ok:false,error:'not_found'});
  if(await maybeHandleDevVisualRequest(req,res,url,{sendJson}))return;
  try{
    const forceFresh=url.searchParams.get('fresh')==='1';
    const current=await buildSnapshot({forceFresh});
    const format=url.searchParams.get('format')||'json';
    const operational=DEV_OPERATIONAL_NAMES&&url.searchParams.get('view')==='operational-names'&&url.searchParams.get('cxOperationalPreview')===DEV_OPERATIONAL_TOKEN;
    const meta=runtimeMeta(current);
    const snapshot=operational?operationalSnapshot(current):current.snapshot;
    const json=operational?JSON.stringify(snapshot):current.json;
    res.setHeader('ETag',`"${current.revision}"`);
    res.setHeader('X-CXOrbia-Source-Revision',current.revision);
    res.setHeader('X-CXOrbia-Generated-At',current.snapshot.generatedAt||'');
    res.setHeader('X-CXOrbia-Source-Read-At',meta.sourceReadAt||'');
    res.setHeader('X-CXOrbia-Cache-Origin',current.origin||'unknown');
    res.setHeader('X-CXOrbia-Operational-Identity',operational?'display-name-only':'masked');
    if(format==='meta'){
      return sendJson(res,200,{
        ok:true,
        ...meta,
        operationalView:operational,
        periods:current.snapshot.counts?.periods??current.snapshot.periods.length,
        visits:current.snapshot.counts?.visits??current.snapshot.visits.length,
        latestPeriodKey:[...(current.snapshot.periods||[])].map(p=>p.key).filter(Boolean).sort().at(-1)||null
      });
    }
    if(format==='js'){
      res.statusCode=200;
      res.setHeader('Content-Type','application/javascript; charset=utf-8');
      return res.end(`window.CX_TYA_HR_SOURCE_SAFE=${json};window.CX_TYA_HR_LIVE_META=${JSON.stringify({...meta,operationalView:operational})};`);
    }
    return sendJson(res,200,{...snapshot,_runtime:{...meta,operationalView:operational}});
  }catch(error){
    console.error(error.stack||error.message||String(error));
    return sendJson(res,503,{ok:false,error:'live_hr_read_failed',message:String(error.message||error).slice(0,500),sourceSafe:true,lastRefreshError,writes:false,production:false});
  }
});

server.listen(PORT,'0.0.0.0',()=>console.log(`CXOrbia live HR source-safe service listening on ${PORT}`));
