#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import process from 'node:process';

const requestFile=process.argv[2]||'backend/config/phase-a-hosting-dev-execution-request-v1.json';
const request=JSON.parse(fs.readFileSync(requestFile,'utf8'));
const manifest=JSON.parse(fs.readFileSync(request.manifestFile,'utf8'));
const fail=message=>{throw new Error(message);};

if(request.schemaVersion!=='2.0.0'||request.status!=='authorized_once'||request.authorizedBy!=='Paula')fail('authorization mismatch');
if(request.authorizationSource!=='current_conversation_2026-07-20'||request.confirm!=='DEPLOY_DEV_ROOT_V164_CORTE1'||request.scope!=='hosting_dev_only')fail('authorization scope mismatch');
if(process.env.CXORBIA_EVENT_NAME==='push'&&request.baseHead!==process.env.CXORBIA_EVENT_BEFORE)fail('request is not bound to previous HEAD');
if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||request.targetProject!=='cxorbia-backend-dev'||request.hostingTarget!=='cxorbia-dev')fail('target mismatch');
if(request.runtimeVersion!=='V164'||request.sourceZipSha256!=='b62a9df4f5e9a20580502e7e971c553af0d2ccac83c82ab8431c509f6a3d8128')fail('runtime identity mismatch');
if(request.manifestFile!=='app/docs/MANIFEST-V164-CORTE1-REPORTES-EMPALME-DIRECTO-20260720.json'||manifest.candidate?.sha256!==request.sourceZipSha256||manifest.empalmeCommit!==request.empalmeCommit)fail('manifest identity mismatch');
if(request.empalmeCommit!=='f708515a637a3998eefdbe39ef66d37a3f130fb6'||request.authorizedTechnicalGateCommit!=='cf0dbf735522f5ae2ed67d865dfb97d1a37335f2'||request.authorizedTechnicalGateRun!==29768206645)fail('technical evidence mismatch');
for(const [file,want] of Object.entries(request.runtimeFileSha256||{})){
  if(!fs.existsSync(file))fail(`runtime file missing: ${file}`);
  const got=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(got!==want)fail(`runtime file mismatch: ${file}`);
}
for(const key of ['production','firestoreWrites','authWrites','storageWrites','hrWrites','imports','make','gemini','payments'])if(request[key]!==false)fail(`unsafe flag: ${key}`);
console.log(JSON.stringify({ok:true,decision:'PASS_V164_CORTE1_HOSTING_DEV_EXECUTION_AUTHORIZATION',runtimeVersion:request.runtimeVersion,targetProject:request.targetProject,hostingTarget:request.hostingTarget,production:false,dataWrites:false},null,2));
