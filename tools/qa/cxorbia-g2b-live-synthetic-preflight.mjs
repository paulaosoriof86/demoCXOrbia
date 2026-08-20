#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';

const requestPath=process.env.G2B_REQUEST_FILE||'backend/config/cxorbia-g2b-live-synthetic-acceptance-request.json';
const outDir=process.env.G2B_OUT_DIR||'.tmp/g2b-live-synthetic-preflight';
const outFile=path.join(outDir,'evidence.json');
const exactUrl='https://cxorbia-backend-dev.web.app';
const exactProject='cxorbia-backend-dev';
const exactPrefix='CXORBIA_E2E_SYNTH_';
const now=()=>new Date().toISOString();
const save=x=>{fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(outFile,JSON.stringify(x,null,2)+'\n','utf8');};
const git=args=>execFileSync('git',args,{encoding:'utf8'}).trim();
const safeError=e=>String(e?.message||e||'unknown').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').slice(0,500);

const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
const evidence={
  schemaVersion:'cxorbia.g2b.live-synthetic-preflight.evidence.v1',
  generatedAt:now(),requestId:request.requestId||null,gateId:request.gateId||null,
  workflowRunId:Number(process.env.GITHUB_RUN_ID||0),workflowRunAttempt:Number(process.env.GITHUB_RUN_ATTEMPT||0),
  workflowCommitSha:process.env.GITHUB_SHA||git(['rev-parse','HEAD']),functionalSourceLock:request.functionalSourceLock||null,
  productionUrl:exactUrl,productionProjectId:exactProject,decision:'HOLD_G2B_PREFLIGHT_NOT_COMPLETED',productP0Proven:false,
  requestValidation:{pass:false,sourceHeadAncestor:false,exactTarget:false,syntheticBoundary:false,forbiddenBudgetsZero:false},
  remote:{reached:false,originExact:false,finalUrl:null,canonicalEntry:false,protectedRuntime:false,backendProjectId:null,backendEnabled:null,readOnly:null,writeMode:null,enableDataWrites:null,enableOperationalWrites:null,enableCommandWrites:null,commandEndpointConfigured:null,commandAdapterLoaded:false,commandAdapterStatus:null,httpTransportGlobalLoaded:false,httpTransportScriptLoaded:false,httpTransportAssetAvailable:false,httpTransportAssetStatus:null,cxDataBoundaryLoaded:false},
  acceptance:{phaseAOperationalMutationPathReady:false,stageWritesExecuted:false,syntheticScenarioCreated:false,paulaVisibleScenarioReady:false,cleanupRequiredNow:false},
  safety:{repositoryWrites:false,providerWrites:0,firestoreWrites:0,authWrites:0,storageWrites:0,externalHrWrites:0,realUserWrites:0,passwordChanges:0,passwordResets:0,paymentWrites:0,makeCalls:0,geminiCalls:0,hostingDeploys:0,cloudRunDeploys:0,rebuild:false,merge:false},
  blockers:[],notes:[]
};
const block=code=>{if(!evidence.blockers.includes(code))evidence.blockers.push(code);};

try{
  const zeroBudgetKeys=['realAuthCreates','realAuthUpdates','realAuthPasswordResets','realDataWrites','externalHrWrites','realPaymentWrites','makeCalls','geminiCalls','rulesWrites','hostingDeploys','cloudRunDeploys','rebuilds','merges'];
  const exactRequest=request.schemaVersion==='cxorbia.g2b.live-synthetic-acceptance-request.v1'&&request.gateId==='I5_G2_B_LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE'&&request.requestId==='i5-g2b-live-synthetic-acceptance-20260820-01'&&request.repository==='paulaosoriof86/demoCXOrbia'&&request.branch==='docs-tya-v6-v71-audit'&&Number(request.pullRequest)===7&&request.enabled===true&&request.consumed===false&&request.status==='authorized_stage_pending_execution'&&request.authorizedBy==='Paula'&&request.mode==='STAGE_AND_TEST'&&request.productionProjectId===exactProject&&request.productionUrl===exactUrl&&request.tenantId==='tya'&&request.projectId==='cinepolis'&&request.syntheticTagPrefix===exactPrefix&&request.syntheticDataOnly===true&&request.sameProductionUrlOnly===true&&request.alternatePlatformAllowed===false&&request.localCloneOrEmulatorAllowed===false&&request.leaveSyntheticScenarioForObservation===true&&request.cleanupRequiredAfterObservation===true&&request.postCleanupReadbackRequired===true&&request.allowedExecutions===1&&request.executionsConsumed===0&&request.automaticRetryAllowed===false;
  evidence.requestValidation.exactTarget=request.productionProjectId===exactProject&&request.productionUrl===exactUrl&&request.tenantId==='tya'&&request.projectId==='cinepolis';
  evidence.requestValidation.syntheticBoundary=request.syntheticTagPrefix===exactPrefix&&request.syntheticDataOnly===true&&request.leaveSyntheticScenarioForObservation===true&&request.cleanupRequiredAfterObservation===true;
  evidence.requestValidation.forbiddenBudgetsZero=zeroBudgetKeys.every(k=>Number(request.budgets?.[k]||0)===0);
  try{execFileSync('git',['merge-base','--is-ancestor',request.sourceHeadSha,'HEAD']);evidence.requestValidation.sourceHeadAncestor=true;}catch{}
  evidence.requestValidation.pass=exactRequest&&evidence.requestValidation.sourceHeadAncestor&&evidence.requestValidation.forbiddenBudgetsZero;
  if(!evidence.requestValidation.pass)throw new Error('G2B_REQUEST_OR_LINEAGE_INVALID');

  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
    const page=await context.newPage();
    await page.goto(exactUrl+'/?g2bPreflight='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
    evidence.remote.reached=true;
    await page.waitForFunction(()=>Boolean(window.CX?.commandAdapter)&&Boolean(window.CX_DEV_ENTRY_CANONICAL),null,{timeout:60000});
    const state=await page.evaluate(async()=>{
      const adapter=window.CX?.commandAdapter||null;
      let status=null;try{status=adapter?.status?.()||null;}catch{}
      const scripts=[...document.scripts].map(s=>String(s.src||''));
      let assetStatus=null,assetAvailable=false;
      try{const r=await fetch('/adapters/cxorbia-command-http-transport-v1.js',{cache:'no-store'});assetStatus=r.status;assetAvailable=r.ok;}catch{}
      return {
        href:location.href,origin:location.origin,
        canonicalEntry:window.CX_DEV_ENTRY_CANONICAL?.canonical===true,
        protectedRuntime:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,
        backendProjectId:window.CX?.BACKEND?.canonicalBackendProjectId||window.firebase?.app?.()?.options?.projectId||null,
        backendEnabled:window.CX?.BACKEND?.enabled===true,
        readOnly:window.CX?.BACKEND?.readOnly===true,
        writeMode:window.CX?.BACKEND?.writeMode??null,
        enableDataWrites:window.CX?.BACKEND?.enableDataWrites===true,
        enableOperationalWrites:window.CX?.BACKEND?.enableOperationalWrites===true,
        enableCommandWrites:window.CX?.BACKEND?.enableCommandWrites===true,
        commandEndpointConfigured:Boolean(String(window.CX?.BACKEND?.commandEndpoint||'').trim()),
        commandAdapterLoaded:Boolean(adapter),commandAdapterStatus:status,
        httpTransportGlobalLoaded:Boolean(window.CX?.commandHttpTransport||window.CX_COMMAND_HTTP_TRANSPORT),
        httpTransportScriptLoaded:scripts.some(s=>s.includes('cxorbia-command-http-transport-v1.js')),
        httpTransportAssetAvailable:assetAvailable,httpTransportAssetStatus:assetStatus,
        cxDataBoundaryLoaded:Boolean(window.CX?.data?.__cxCommandBoundaryVersion||window.CX_CXDATA_COMMAND_BOUNDARY?.ready)
      };
    });
    evidence.remote.finalUrl=state.href;
    evidence.remote.originExact=state.origin===exactUrl;
    Object.assign(evidence.remote,state);
    evidence.remote.finalUrl=state.href;
    const status=state.commandAdapterStatus||{};
    const transportReady=Array.isArray(status.registeredTransports)&&status.registeredTransports.length>0&&Boolean(status.activeTransport)&&state.httpTransportGlobalLoaded===true&&state.httpTransportScriptLoaded===true&&state.commandEndpointConfigured===true;
    const writesReady=status.writesEnabled===true&&state.enableCommandWrites===true&&state.enableDataWrites===true&&state.enableOperationalWrites===true&&state.readOnly===false&&String(state.writeMode||'').toLowerCase()!=='disabled';
    const exactRuntime=state.origin===exactUrl&&state.canonicalEntry===true&&state.protectedRuntime===true&&state.backendProjectId===exactProject&&state.backendEnabled===true&&state.commandAdapterLoaded===true&&state.cxDataBoundaryLoaded===true;
    evidence.acceptance.phaseAOperationalMutationPathReady=exactRuntime&&transportReady&&writesReady;
    if(!exactRuntime)block('G2B_CANONICAL_PRODUCTION_RUNTIME_NOT_EXACT');
    if(status.writesEnabled!==true||state.enableCommandWrites!==true)block('G2B_COMMAND_WRITES_DISABLED');
    if(state.enableDataWrites!==true)block('G2B_DATA_WRITES_DISABLED');
    if(state.enableOperationalWrites!==true)block('G2B_OPERATIONAL_WRITES_DISABLED');
    if(state.readOnly===true||String(state.writeMode||'').toLowerCase()==='disabled')block('G2B_PROTECTED_RUNTIME_READONLY');
    if(!state.httpTransportScriptLoaded)block('G2B_COMMAND_HTTP_TRANSPORT_NOT_LOADED');
    if(!state.httpTransportGlobalLoaded)block('G2B_COMMAND_HTTP_TRANSPORT_NOT_ACTIVE');
    if(!state.commandEndpointConfigured)block('G2B_COMMAND_ENDPOINT_NOT_CONFIGURED');
    if(!Array.isArray(status.registeredTransports)||status.registeredTransports.length===0||!status.activeTransport)block('G2B_COMMAND_TRANSPORT_UNREGISTERED');
    if(!evidence.acceptance.phaseAOperationalMutationPathReady){
      evidence.productP0Proven=true;
      evidence.decision='P0_PROVEN_G2B_PRODUCTION_OPERATIONAL_WRITE_PATH_DISABLED';
      evidence.notes.push('Remote browser proof on the canonical production origin shows Phase A mutation plumbing is not armed. No synthetic/provider write was attempted because the pre-write gate failed closed.');
    }else{
      evidence.decision='PASS_G2B_PREWRITE_RUNTIME_READY_FOR_SYNTHETIC_STAGE';
      evidence.productP0Proven=false;
      evidence.notes.push('Canonical production mutation plumbing is remotely armed; the separate synthetic stage may proceed under the existing authorization.');
    }
    await context.close();
  }finally{await browser.close();}
}catch(error){
  block(safeError(error));
  if(!String(evidence.decision).startsWith('P0_PROVEN_'))evidence.decision='HOLD_G2B_PREFLIGHT_TECHNICAL_OR_CONTRACT';
  evidence.notes.push(safeError(error));
}
save(evidence);
console.log(JSON.stringify({decision:evidence.decision,productP0Proven:evidence.productP0Proven,phaseAOperationalMutationPathReady:evidence.acceptance.phaseAOperationalMutationPathReady,providerWrites:evidence.safety.providerWrites,firestoreWrites:evidence.safety.firestoreWrites,authWrites:evidence.safety.authWrites,blockers:evidence.blockers}));
if(evidence.decision!=='PASS_G2B_PREWRITE_RUNTIME_READY_FOR_SYNTHETIC_STAGE')process.exit(2);
