#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const requestFile=process.argv[2]||'backend/config/phase-a-hosting-dev-execution-request-v1.json';
const request=JSON.parse(fs.readFileSync(requestFile,'utf8'));
const registry=JSON.parse(fs.readFileSync('backend/contracts/prototype-baseline-registry-v1.json','utf8'));
const runtime=registry.currentRuntime||{};
const fail=message=>{throw new Error(message);};
if(request.schemaVersion!=='1.1.0'||request.status!=='authorized_once'||request.authorizedBy!=='Paula')fail('authorization mismatch');
if(request.authorizationSource!=='current_conversation_2026-07-19'||request.confirm!=='DEPLOY_DEV_ROOT_R21'||request.scope!=='hosting_dev_only')fail('authorization scope mismatch');
if(request.baseHead!==process.env.CXORBIA_EVENT_BEFORE)fail('request is not bound to previous HEAD');
if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||request.targetProject!=='cxorbia-backend-dev'||request.hostingTarget!=='cxorbia-dev')fail('target mismatch');
if(runtime.version!=='V161C'||runtime.status!=='technical_pass_pending_dev_authorization'||runtime.postGatesPassed!==true||runtime.hostingDevPassed!==false||runtime.remoteSmokePassed!==false||runtime.visualValidated!==false)fail('runtime state mismatch');
for(const key of ['runtimeVersion','sourceZipSha256','manifestFile','aggregateSha256','empalmeCommit'])if(request[key]!==runtime[key==='runtimeVersion'?'version':key])fail(`runtime identity mismatch: ${key}`);
if(request.authorizedTechnicalGateRun!==29712762494||request.authorizedTechnicalGateCommit!=='7acc4e6c18355827df6ed649c3a537db07eec196'||request.runtimeCodeEquivalentToTechnicalGateCommit!==true)fail('technical evidence mismatch');
for(const key of ['production','firestoreWrites','authWrites','storageWrites','hrWrites','imports','make','gemini','payments'])if(request[key]!==false)fail(`unsafe flag: ${key}`);
console.log(JSON.stringify({ok:true,decision:'PASS_R21_HOSTING_DEV_EXECUTION_AUTHORIZATION',runtimeVersion:runtime.version,targetProject:request.targetProject,hostingTarget:request.hostingTarget,production:false,dataWrites:false},null,2));
