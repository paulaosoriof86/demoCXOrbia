#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const file=process.argv[2];
if(!file)throw new Error('remote proof file missing');
const proof=JSON.parse(fs.readFileSync(file,'utf8'));
const fail=message=>{throw new Error(message);};
if(proof.environment!=='dev'||proof.runtimeVersion!=='V164'||proof.commit!==process.env.GITHUB_SHA)fail('remote identity mismatch');
if(proof.sourceZipSha256!=='b62a9df4f5e9a20580502e7e971c553af0d2ccac83c82ab8431c509f6a3d8128'||proof.empalmeCommit!=='f708515a637a3998eefdbe39ef66d37a3f130fb6'||proof.authorizedTechnicalGateRun!==29768206645)fail('remote source lock mismatch');
if(proof.tenantId!=='tya'||proof.projectId!=='cinepolis'||proof.periods!==14||proof.visits!==616)fail('remote source scope mismatch');
if(proof.assigned!==611||proof.unassigned!==5||proof.performed!==592||proof.questionnaire!==590||proof.submitted!==527||proof.paymentConfirmed!==0)fail('remote Corte 1 totals mismatch');
if(proof.currentPeriodVisits!==44||proof.currentPeriodAssigned!==39||proof.currentPeriodUnassigned!==5||proof.currentPeriodAvailable!==4||proof.currentPeriodEligibilityBlocked!==1)fail('remote July R21 mismatch');
if(proof.availableReports!==4||proof.pendingSourceReports!==3)fail('remote report capability mismatch');
if(proof.hostingOnly!==true)fail('remote build is not Hosting-only');
for(const key of ['firestoreWrites','authWrites','storageWrites','hrWrites','imports','make','gemini','payments','production'])if(proof[key]!==false)fail(`unsafe remote flag: ${key}`);
console.log(JSON.stringify({ok:true,decision:'PASS_V164_CORTE1_REMOTE_BUILD_PROOF',runtimeVersion:proof.runtimeVersion,build:proof.build,commit:proof.commit},null,2));
