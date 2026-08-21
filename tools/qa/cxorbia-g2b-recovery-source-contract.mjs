#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const sourceDir=path.resolve(process.argv[2]||'.');
const out=process.env.CXORBIA_G2B_SOURCE_CONTRACT_OUT||'';
const read=rel=>fs.readFileSync(path.join(sourceDir,rel),'utf8').replace(/^\uFEFF/,'');
const fail=code=>{throw new Error(code);};

const runtime=read('backend/runtime/hr-live-service/g2b-synthetic-runtime.mjs');
const server=read('backend/runtime/hr-live-service/server.mjs');
const firewall=read('app/adapters/cxorbia-canonical-write-firewall-v1.js');
const cloudbuild=read('backend/runtime/hr-live-service/cloudbuild.yaml');
const firebase=JSON.parse(read('firebase.json'));

if(!runtime.includes('g2b-synthetic\\/commands')&&!runtime.includes('g2b-synthetic/commands'))fail('G2B_SOURCE_ENDPOINT_PATTERN_MISSING');
for(const token of [
  "const EXPECTED_PROJECT='cxorbia-backend-dev'",
  "const EXPECTED_TENANT='tya'",
  "const EXPECTED_PROJECT_SCOPE='cinepolis'",
  "const EXPECTED_GATE='PAULA_I5_G2B_SYNTHETIC_CANONICAL_WRITE_PATH'",
  "const EXPECTED_REQUEST='i5-g2b-live-synthetic-acceptance-20260820-01'",
  "G2B_SYNTHETIC_AUTHORIZATION_REQUIRED",
  "G2B_SYNTHETIC_WRITE_GATE_DISABLED"
]) if(!runtime.includes(token))fail('G2B_SOURCE_RUNTIME_CONTRACT_MISSING:'+token);

if(!/import\s*\{\s*isG2BSyntheticRuntimePath\s*,\s*maybeHandleG2BSyntheticRuntimeRequest\s*\}\s*from\s*['"]\.\/g2b-synthetic-runtime\.mjs['"]/.test(server))fail('G2B_SOURCE_SERVER_IMPORT_MISSING');
if(!/if\s*\(isG2BSyntheticRuntimePath\(url\.pathname\)\)\s*\{\s*await\s+maybeHandleG2BSyntheticRuntimeRequest\(req,res,url\);\s*return;\s*\}/.test(server))fail('G2B_SOURCE_SERVER_DELEGATION_MISSING');
if(!server.includes('g2bSyntheticCommandSourceReady:true'))fail('G2B_SOURCE_HEALTH_CAPABILITY_MISSING');
if(!firewall.includes('YES_PAULA_20260820_G2B_SYNTHETIC'))fail('G2B_SOURCE_FIREWALL_TOKEN_MISSING');
if(!firewall.includes('PAULA_I5_G2B_SYNTHETIC_CANONICAL_WRITE_PATH'))fail('G2B_SOURCE_FIREWALL_GATE_MISSING');

if(!cloudbuild.includes('gcr.io/cloud-builders/docker')||!cloudbuild.includes('${_IMAGE}'))fail('G2B_SOURCE_CLOUDBUILD_IMAGE_CONTRACT_MISSING');
const hosting=firebase?.hosting;
if(!hosting||hosting.target!=='cxorbia-dev'||hosting.public!=='app')fail('G2B_SOURCE_HOSTING_TARGET_INVALID');
const tenantRewrite=(hosting.rewrites||[]).find(x=>x?.source==='/api/tenants/**');
if(!tenantRewrite||tenantRewrite.run?.serviceId!=='cxorbia-live-hr-dev'||tenantRewrite.run?.region!=='us-central1')fail('G2B_SOURCE_HOSTING_TENANT_REWRITE_INVALID');
const hrRewrite=(hosting.rewrites||[]).find(x=>x?.source==='/api/tya/cinepolis/hr-live');
if(!hrRewrite||hrRewrite.run?.serviceId!=='cxorbia-live-hr-dev'||hrRewrite.run?.region!=='us-central1')fail('G2B_SOURCE_HOSTING_HR_REWRITE_INVALID');

const result={
  schemaVersion:'cxorbia.g2b.recovery-source-contract.v1',
  decision:'PASS_G2B_RECOVERY_SOURCE_CONTRACT',
  sourceDir:path.basename(sourceDir),
  target:{projectId:'cxorbia-backend-dev',cloudRunService:'cxorbia-live-hr-dev',hostingTarget:'cxorbia-dev',hostingSite:'cxorbia-backend-dev',tenantId:'tya',projectIdScope:'cinepolis'},
  contracts:{runtimeEndpoint:true,serverDelegation:true,healthCapability:true,firewallSyntheticGate:true,cloudBuildImage:true,hostingTenantRewrite:true,hostingHrRewrite:true},
  safety:{providerReads:0,providerWrites:0,cloudBuildExecutions:0,cloudRunDeploys:0,hostingDeploys:0,firestoreWrites:0,authWrites:0,storageWrites:0,externalHrWrites:0,realDataWrites:0,realCredentialWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,merge:false}
};
if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');}
console.log(JSON.stringify(result));
