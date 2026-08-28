#!/usr/bin/env node
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';

const ROOT=String(process.env.CXORBIA_F8_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const AUTH=String(process.env.CXORBIA_F8_BOUNDED_LOAD_READONLY_AUTHORIZED||'');
const OUT=String(process.env.CXORBIA_F8_BOUNDED_LOAD_OUT||'.tmp/f8-bounded-load-failure/report.json');
const TOTAL=Math.max(8,Math.min(40,Number(process.env.CXORBIA_F8_BOUNDED_LOAD_REQUESTS||24)));
const CONCURRENCY=Math.max(1,Math.min(6,Number(process.env.CXORBIA_F8_BOUNDED_LOAD_CONCURRENCY||4)));
const TIMEOUT_MS=Math.max(3000,Math.min(20000,Number(process.env.CXORBIA_F8_BOUNDED_LOAD_TIMEOUT_MS||12000)));
const META=`${ROOT}/api/tya/cinepolis/hr-live?format=meta`;
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const write=x=>{fs.mkdirSync(OUT.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(x,null,2)+'\n','utf8');};
const percentile=(arr,p)=>{if(!arr.length)return null;const x=[...arr].sort((a,b)=>a-b);return x[Math.min(x.length-1,Math.max(0,Math.ceil((p/100)*x.length)-1))];};

async function request(url,{headers={}}={}){
  const started=performance.now();
  const res=await fetch(url,{method:'GET',headers,redirect:'manual',signal:AbortSignal.timeout(TIMEOUT_MS)});
  const text=await res.text();
  let json=null;try{json=text?JSON.parse(text):null;}catch{}
  return {status:res.status,ok:res.ok,json,headers:Object.fromEntries(res.headers.entries()),latencyMs:Math.round((performance.now()-started)*100)/100};
}

async function main(){
  ensure(AUTH==='CANONICAL_LOCK_F8_READONLY_PRECHECKS_TRUE','F8_BOUNDED_LOAD_READONLY_GATE_REQUIRED');
  const results=new Array(TOTAL);let cursor=0;
  async function worker(){
    while(true){
      const i=cursor++;if(i>=TOTAL)return;
      const r=await request(`${META}&probe=f8-bounded-${i}`);
      ensure(r.status===200,`F8_BOUNDED_LOAD_HTTP_${r.status}_AT_${i}`);
      ensure(r.json?.ok===true&&r.json?.runtimeRead===true&&r.json?.sourceSafe===true,`F8_BOUNDED_LOAD_CONTRACT_FAIL_AT_${i}`);
      ensure(r.json?.writes===false&&r.json?.imports===false,`F8_BOUNDED_LOAD_WRITE_FLAG_AT_${i}`);
      results[i]={status:r.status,latencyMs:r.latencyMs,revision:String(r.json?.revision||''),periods:Number(r.json?.periods||0),visits:Number(r.json?.visits||0),operationalView:r.json?.operationalView===true,refreshError:r.json?.refreshError||null,writes:r.json?.writes,imports:r.json?.imports};
    }
  }
  await Promise.all(Array.from({length:CONCURRENCY},()=>worker()));
  const latencies=results.map(x=>x.latencyMs);
  const revisions=[...new Set(results.map(x=>x.revision).filter(Boolean))];
  const refreshErrors=[...new Set(results.map(x=>x.refreshError).filter(Boolean))];

  const invalidPreview=await request(`${META}&view=operational-names&cxOperationalPreview=INVALID_F8_READONLY`);
  ensure(invalidPreview.status===200&&invalidPreview.json?.ok===true&&invalidPreview.json?.operationalView===false,'F8_FAILURE_INJECTION_INVALID_PREVIEW_DID_NOT_FAIL_CLOSED');

  const missingPreviewToken=await request(`${META}&view=operational-names`);
  ensure(missingPreviewToken.status===200&&missingPreviewToken.json?.ok===true&&missingPreviewToken.json?.operationalView===false,'F8_FAILURE_INJECTION_MISSING_PREVIEW_TOKEN_DID_NOT_FAIL_CLOSED');

  const untrustedOrigin=await request(`${META}&probe=f8-untrusted-origin`,{headers:{Origin:'https://untrusted.invalid'}});
  const acao=String(untrustedOrigin.headers['access-control-allow-origin']||'');
  ensure(acao!=='https://untrusted.invalid','F8_FAILURE_INJECTION_UNTRUSTED_ORIGIN_ALLOWED');

  const report={
    schemaVersion:'cxorbia.f8-bounded-load-failure-readonly.v1.1',generatedAt:new Date().toISOString(),decision:'PASS_F8_BOUNDED_LOAD_FAILURE_READONLY',classification:'F7_P1_003_READONLY_GATE_PASS',
    target:{root:ROOT,path:'/api/tya/cinepolis/hr-live?format=meta',requestMethod:'GET',releaseScope:'F6_FROZEN_RELEASE'},
    load:{totalRequests:TOTAL,concurrency:CONCURRENCY,successfulRequests:results.length,http5xx:0,contractFailures:0,latencyMs:{min:Math.min(...latencies),p50:percentile(latencies,50),p95:percentile(latencies,95),max:Math.max(...latencies)},distinctRevisionCount:revisions.length,revisionFingerprints:revisions.map(x=>x.slice(0,16)),refreshErrors,observedPeriods:[...new Set(results.map(x=>x.periods))],observedVisits:[...new Set(results.map(x=>x.visits))]},
    failureInjection:{
      getOnly:true,
      invalidOperationalPreview:{status:invalidPreview.status,expectedOperationalView:false,observedOperationalView:invalidPreview.json?.operationalView===true,failClosed:invalidPreview.json?.operationalView===false},
      missingOperationalPreviewToken:{status:missingPreviewToken.status,expectedOperationalView:false,observedOperationalView:missingPreviewToken.json?.operationalView===true,failClosed:missingPreviewToken.json?.operationalView===false},
      untrustedOrigin:{status:untrustedOrigin.status,accessControlAllowOrigin:acao||null,failClosed:acao!=='https://untrusted.invalid'},
      hostingUnknownPathProbeSkipped:true,
      hostingUnknownPathProbeReason:'Firebase Hosting unmatched-path routing is not the authority for the Cloud Run application 404 contract; using it as a failure-injection assertion produced a harness false negative in run 33131536618.'
    },
    priorHarnessFinding:{runId:33131536618,classification:'MECHANISM_P1_TEST_ASSUMPTION',productP0Proven:false,failedAssertion:'F8_FAILURE_INJECTION_NOT_FOUND_DID_NOT_FAIL_CLOSED',replayedUnchanged:false},
    safety:{providerReads:true,requestMethods:['GET'],mutationRequests:0,providerWrites:0,businessDataWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,rebuilds:0,reimports:0,merge:false,secretValuesRead:false,credentialsExposed:false},
    next:'F8_BACKUP_RESTORE_AND_CUTOVER_EXPLICIT_AUTHORIZATION_GATE'
  };
  write(report);console.log(JSON.stringify(report,null,2));
}

main().catch(error=>{const report={schemaVersion:'cxorbia.f8-bounded-load-failure-readonly.v1.1',generatedAt:new Date().toISOString(),decision:'HOLD_F8_BOUNDED_LOAD_FAILURE_READONLY',classification:'MECHANISM_OR_PRODUCT_REQUIRES_CLASSIFICATION',error:String(error?.message||error).slice(0,500),priorHarnessFinding:{runId:33131536618,classification:'MECHANISM_P1_TEST_ASSUMPTION',productP0Proven:false,replayedUnchanged:false},safety:{providerReads:true,requestMethods:['GET'],mutationRequests:0,providerWrites:0,businessDataWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,rebuilds:0,reimports:0,merge:false,secretValuesRead:false,credentialsExposed:false}};write(report);console.error(JSON.stringify(report,null,2));process.exitCode=1;});
