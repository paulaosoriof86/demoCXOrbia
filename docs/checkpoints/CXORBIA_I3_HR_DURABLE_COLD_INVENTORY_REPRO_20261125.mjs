import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {syncBuiltinESMExports} from 'node:module';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';

// Offline evidence only. All filesystem operations below are reads. JSON is
// emitted on stdout so the caller chooses whether and where to preserve it.
const repo=path.resolve(process.argv[2]||process.cwd());
const servedSource='d727f3be67a4430f08216dbb37cccba790f934f5';
const RealDate=globalThis.Date,observedAt=new RealDate().toISOString();
const fixedAt=RealDate.parse('2026-11-26T02:00:00Z');
let blockedNetworkAttempts=0;
const denyNetwork=()=>{blockedNetworkAttempts++;throw Error('OFFLINE_NETWORK_FORBIDDEN');};
globalThis.fetch=denyNetwork;
http.request=http.get=https.request=https.get=denyNetwork;
net.connect=net.createConnection=tls.connect=denyNetwork;
syncBuiltinESMExports();
globalThis.Date=class extends RealDate{
  constructor(...args){super(...(args.length?args:[fixedAt]));}
  static now(){return fixedAt;}
};
const read=p=>fs.readFileSync(path.join(repo,p),'utf8');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const git=(...args)=>execFileSync('git',['-C',repo,...args],{encoding:'utf8',maxBuffer:20*1024*1024}).trim();
const moduleFrom=relative=>import(pathToFileURL(path.join(repo,relative)).href);
const {resolveExcelOriginalProjectPlan}=await moduleFrom('backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs');
const {f3FixtureDocuments,F3_QA}=await moduleFrom('tools/qa/cxorbia-i3-b14-isolated-provider-writer-qa.mjs');
const server=read('backend/runtime/hr-live-service/server.mjs');
function section(from,to){
  const start=server.indexOf(from),end=server.indexOf(to,start+from.length);
  assert.ok(start>=0&&end>start,'Expected source function boundaries must exist');
  return server.slice(start,end);
}
const selector=section('async function buildSnapshot(','\nasync function resolveHrAndProtectedPrincipal(');
const mapping=section('function loadExcelMappingLibrary(','\n// VRM-358:');
const resolver=section('async function resolveProjectHrReadBinding(','\nfunction canonicalProtectedAuthNamespace(');
const cacheDeclaration=server.match(/^const CACHE_MS=.*$/m)?.[0];
assert.ok(cacheDeclaration,'Actual CACHE_MS declaration must exist');
const manifestPath='docs/checkpoints/CXORBIA_I3_F3_REMOTE_FIXTURE_20261124.json';
const manifest=JSON.parse(read(manifestPath));
const rows=new Map(f3FixtureDocuments(manifest,'f3-qa-offline-capacity-1').map(x=>[x.path,x.data]));
let firestoreReads=0;
const db={doc:documentPath=>({get:async()=>{
  firestoreReads++;
  return {exists:rows.has(documentPath),data:()=>rows.get(documentPath),updateTime:{seconds:1795653000,nanoseconds:0}};
}})};
const scope={tenantId:'tya',projectId:F3_QA.projectId};

async function runCase(warmInventory){
  const calls=[],inventoryCache=new Map();let inventoryHealthy=warmInventory;
  const providerInventory=async()=>{
    calls.push(inventoryHealthy?'stub_inventory_success':'stub_inventory_failure');
    if(!inventoryHealthy)throw Error('PROVIDER_FAILURE:OFFLINE_INVENTORY_UNAVAILABLE');
    return {complete:true,worksheets:[],inventoryHash:'a'.repeat(64)};
  };
  const recover=async binding=>{
    calls.push('durable_model_read');
    return {origin:'durable_internal_snapshot',externalReadCurrent:false,revision:'b'.repeat(64),bindingProof:binding.proof};
  };
  const api=new Function('fs','path','crypto','ROOT','ensureAdmin','resolveExcelOriginalProjectPlan','hrInventoryCache',
    'withOriginalToolboxReader','readExcelWorksheetInventoryThroughMake','refreshSnapshot','recoverHrReadModel',
    `const process={env:{}};let cache=null,inFlight=null,inFlightBinding=null,lastReadModelError=null;const scopedHrCache=new Map();${cacheDeclaration}\n${mapping}\n${resolver}\n${selector}\nreturn {buildSnapshot,resolveProjectHrReadBinding};`)
    (fs,path,crypto,repo,()=>({db}),resolveExcelOriginalProjectPlan,inventoryCache,
      async consume=>consume(denyNetwork),providerInventory,
      async()=>{calls.push('unexpected_external_row_read');throw Error('UNEXPECTED_EXTERNAL_ROWS');},recover);
  if(warmInventory)await api.resolveProjectHrReadBinding(scope);
  const prewarmedCountryEntries=inventoryCache.size;
  calls.length=0;inventoryHealthy=false;firestoreReads=0;
  let result,error;
  try{result=await api.buildSnapshot({forceFresh:false,scope,allowDurableRead:true});}
  catch(e){error=e.message;}
  return {warmInventory,prewarmedCountryEntries,availableDurableModelStub:true,
    calls,error:error||null,resultOrigin:result?.origin||null,firestoreReads,
    durableModelReached:calls.includes('durable_model_read'),externalRowsRead:calls.includes('unexpected_external_row_read')};
}
const cold=await runCase(false),warm=await runCase(true);
assert.deepEqual(cold.calls,['stub_inventory_failure']);
assert.equal(cold.resultOrigin,null);
assert.equal(cold.durableModelReached,false);
assert.deepEqual(warm.calls,['durable_model_read']);
assert.equal(warm.resultOrigin,'durable_internal_snapshot');
assert.equal(warm.prewarmedCountryEntries,2);
assert.equal(blockedNetworkAttempts,0);
const files=[
  'backend/runtime/hr-live-service/server.mjs',
  'backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs',
  'backend/runtime/cxorbia-country-hr-binding-v1.mjs',
  'backend/runtime/hr-live-service/hr-read-model.mjs',
  'backend/runtime/hr-live-service/test/hr-read-model-integration.test.mjs',
  'tools/qa/cxorbia-i3-b14-isolated-provider-writer-qa.mjs',
  manifestPath
];
const sources=files.map(file=>{
  const bytes=fs.readFileSync(path.join(repo,file));let servedBytes=null;
  try{servedBytes=execFileSync('git',['-C',repo,'show',servedSource+':'+file],{maxBuffer:20*1024*1024,stdio:['ignore','pipe','pipe']});}catch{}
  return {file,sha256:sha(bytes),matchesServedSource:servedBytes?bytes.equals(servedBytes):null};
});
globalThis.Date=RealDate;
console.log(JSON.stringify({
  schemaVersion:'cxorbia.hr-durable-cold-inventory-offline-proof.v1',
  observedAt,repository:repo,head:git('rev-parse','HEAD'),servedSource,
  decision:'P0_REPRODUCED_COLD_INVENTORY_BLOCKS_DURABLE_PRESENTATION',
  failureClass:'FUNCTIONAL_DEFECT',
  clock:{fixedAt:'2026-11-26T02:00:00Z',reason:'Deterministic existing November fixture; no external clock needed'},
  method:{realFunctions:['server.buildSnapshot','server.resolveProjectHrReadBinding','server.loadExcelMappingLibrary','resolveExcelOriginalProjectPlan','resolveCountryHrPeriodBinding','f3FixtureDocuments'],
    mockedBoundaries:['Firestore document reads from actual synthetic fixture documents','provider inventory success/unavailable','final durable model read returns available valid-origin sentinel'],
    limit:'Proves the real resolver prevents reaching durable recovery. Does not claim a fresh live outage or re-test persisted chunk/hash validation.'},
  assertionsPassed:7,cold,warm,sources,
  blockedNetworkAttempts,networkCalls:0,providerWrites:0,repositoryWrites:0,credentialReads:0,
  exactOwners:[
    {file:'backend/runtime/hr-live-service/server.mjs',function:'buildSnapshot',lines:[719,727,734]},
    {file:'backend/runtime/hr-live-service/server.mjs',function:'resolveProjectHrReadBinding',lines:[280,281]},
    {file:'backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs',function:'resolveExcelOriginalProjectPlan',lines:[210,214,215,228,232]}
  ],
  coverageGap:{file:'backend/runtime/hr-live-service/test/hr-read-model-integration.test.mjs',line:27,description:'The existing cold-presentation test replaces the whole binding resolver with a constant binding, hiding its external inventory dependency.'}
},null,2));
