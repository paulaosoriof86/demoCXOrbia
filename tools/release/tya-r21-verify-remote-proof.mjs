#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const file=process.argv[2];
if(!file)throw new Error('remote proof file missing');
const proof=JSON.parse(fs.readFileSync(file,'utf8'));
const fail=message=>{throw new Error(message);};
if(proof.environment!=='dev'||proof.runtimeVersion!=='V161C'||proof.commit!==process.env.GITHUB_SHA)fail('remote identity mismatch');
if(proof.aggregateSha256!=='7075f70822e3fed8442d62b56e1467fa643facd756aa88258ae2d6d6bdc95cdf'||proof.authorizedTechnicalGateRun!==29712762494)fail('remote source lock mismatch');
if(proof.tenantId!=='tya'||proof.projectId!=='cinepolis'||proof.periods!==14||proof.visits!==616)fail('remote source scope mismatch');
if(proof.currentPeriodVisits!==44||proof.currentPeriodAssigned!==39||proof.currentPeriodUnassigned!==5||proof.currentPeriodAvailable!==4||proof.currentPeriodEligibilityBlocked!==1)fail('remote July R21 mismatch');
if(proof.hostingOnly!==true)fail('remote build is not Hosting-only');
for(const key of ['firestoreWrites','authWrites','storageWrites','hrWrites','imports','make','gemini','payments','production'])if(proof[key]!==false)fail(`unsafe remote flag: ${key}`);
console.log(JSON.stringify({ok:true,decision:'PASS_R21_REMOTE_BUILD_PROOF',runtimeVersion:proof.runtimeVersion,build:proof.build,commit:proof.commit},null,2));
