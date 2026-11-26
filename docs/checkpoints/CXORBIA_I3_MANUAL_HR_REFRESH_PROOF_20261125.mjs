import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto,createHash} from 'node:crypto';

const checkpointDir=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(process.argv[2]||'.');
const base=process.argv[3]||'fb7f80287f81691338fd868fc36881fc84781e0e';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-manual-hr-'));
process.on('exit',()=>fs.rmSync(root,{recursive:true,force:true}));
const owner='app/modules/visitas.js';
const testOwner='tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs';
const bridgeOwner='app/adapters/tya-protected-auth-hr-authority-bridge-v2.js';
const REV='d19eb12ad8c1c5140b5711ea390deaae50b0edd35ff4f982a69bfdcabbc86dd2';
for(const file of [owner,testOwner,bridgeOwner]){
  const bytes=execFileSync('git',['show',base+':'+file],{cwd:repo});
  for(const variant of ['before','after']){
    const dest=path.join(root,variant,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);
  }
}
const patchPath=path.join(checkpointDir,'CXORBIA_I3_MANUAL_HR_REFRESH_PATCH_20261125.patch');
execFileSync('git',['apply','--check',patchPath],{cwd:path.join(root,'after')});
execFileSync('git',['apply',patchPath],{cwd:path.join(root,'after')});
const regression=execFileSync(process.execPath,['--test','--test-reporter=tap',testOwner],{cwd:path.join(root,'after'),encoding:'utf8'});
assert.match(regression,/# tests 14\b/);assert.match(regression,/# pass 14\b/);assert.match(regression,/# fail 0\b/);
const source=(variant,file)=>fs.readFileSync(path.join(root,variant,file),'utf8');
const tests=source('before',testOwner),bridge=source('before',bridgeOwner);
const body=tests.slice(tests.indexOf('class Node {'),tests.indexOf("\ntest('"));
const queryBody=bridge.slice(bridge.indexOf('function queryUrl('),bridge.indexOf('\nasync function fetchHr('));
const query=new Function('endpointFor',queryBody+'\nreturn queryUrl;')(()=>'/api/tenants/tya/projects/cinepolis/hr-live');
let networkAttempts=0;
globalThis.fetch=()=>{networkAttempts++;throw Error('OFFLINE_NETWORK_FORBIDDEN');};
async function observe(variant,{fresh=false,selectedPeriod=null,internal=false}={}){
  const harness=new Function('script','REV','assert','vm','webcrypto',body+'\nreturn harness;')(source(variant,owner),REV,assert,vm,webcrypto);
  const h=harness(),requests=[];
  h.window.CX_PROTECTED_AUTH_HR_AUTHORITY={applied:true,externalReadCurrent:false,sourceRevision:REV,
    ...(selectedPeriod?{readScope:{mode:'explicit_period',requestedPeriodId:selectedPeriod}}:{})};
  h.window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY=async(reason,options={})=>{
    const url=query({},options);requests.push({reason,options,url});
    const authority={applied:true,externalReadCurrent:fresh,sourceRevision:REV,sourceReadAt:'2026-11-25T12:00:00Z',
      ...(options.periodId?{readScope:{mode:'explicit_period',requestedPeriodId:options.periodId}}:{}),
      ...(internal?{internalProjectAuthority:true,hrAuthority:false,sourceRevision:null,externalReadCurrent:false}:{})};
    h.window.CX_PROTECTED_AUTH_HR_AUTHORITY=authority;return {ok:true,result:authority};
  };
  await h.node('vRefreshHR').fire('click');
  return {variant,requests,toasts:h.toasts,returnedExternalReadCurrent:fresh,navigation:h.navs,commandWrites:h.calls.length,buttonReenabled:h.node('vRefreshHR').disabled===false};
}
const before=await observe('before'),afterDurable=await observe('after'),afterFreshSameRevision=await observe('after',{fresh:true});
const afterHistorical=await observe('after',{fresh:true,selectedPeriod:'cinepolis-2026-05'});
const afterInternal=await observe('after',{internal:true});
const params=x=>new URL(x.requests[0].url,'https://example.invalid').searchParams;
const success=x=>x.toasts.some(t=>t.kind==='ok');
assert.equal(params(before).has('fresh'),false);assert.equal(success(before),true);
assert.equal(params(afterDurable).get('fresh'),'1');assert.equal(success(afterDurable),false);
assert.equal(success(afterFreshSameRevision),true);
assert.equal(params(afterHistorical).get('hrPeriodId'),'cinepolis-2026-05');assert.equal(success(afterHistorical),true);
assert.equal(success(afterInternal),true);assert.equal(afterInternal.toasts[0].message,'Vista interna actualizada');
for(const item of [before,afterDurable,afterFreshSameRevision,afterHistorical,afterInternal])assert.equal(item.commandWrites,0);
assert.equal(networkAttempts,0);
console.log(JSON.stringify({schemaVersion:'cxorbia.manual-hr-refresh.before-after.v1',observedAt:new Date().toISOString(),
  decision:'PROVEN_FALSE_FRESH_SUCCESS_FIXED_OFFLINE_ONLY',baseControlHead:base,
  regression:{pass:14,fail:0,command:'node --test --test-reporter=tap '+testOwner,transcriptSha256:createHash('sha256').update(regression).digest('hex')},
  patchSha256:createHash('sha256').update(fs.readFileSync(patchPath)).digest('hex'),
  actualHandlerAndBridgeQuery:true,sourceSha256:Object.fromEntries(['before','after'].map(v=>[v,createHash('sha256').update(source(v,owner)).digest('hex')])),
  before,afterDurable,afterFreshSameRevision,afterHistorical,afterInternal,
  networkAttempts,providerWrites:0,repositoryWrites:0,
  scope:'No new authorization, no command changes, no provider scenarios; actual handler + actual query constructor with simulated authority responses.'},null,2));
