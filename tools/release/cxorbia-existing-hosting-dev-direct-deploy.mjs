import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const expectedSite = process.env.CXORBIA_EXPECTED_SITE || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outDir = path.resolve(process.env.CXORBIA_HOSTING_OUT_DIR || '.tmp/corte6-existing-hosting-dev');
const siteDir = path.resolve(process.env.CXORBIA_HOSTING_SITE_DIR || path.join(outDir,'site'));
const configPath = path.resolve(process.env.CXORBIA_HOSTING_CONFIG || path.join(outDir,'firebase.hosting.json'));
const preflightPath = path.resolve(process.env.CXORBIA_HOSTING_PREFLIGHT || path.join(outDir,'preflight.source-safe.json'));
const reportPath = path.resolve(process.env.CXORBIA_HOSTING_DEPLOY_REPORT || path.join(outDir,'direct-deploy.source-safe.json'));
const execute = process.env.CXORBIA_EXECUTE_HOSTING === 'true';

function fail(label, response){
  const code=response?.payload?.error?.status || response?.status || 'unknown';
  const msg=String(response?.payload?.error?.message || label).replace(/[\r\n]+/g,' ').slice(0,260);
  throw new Error(`${label}:${code}:${msg}`);
}
if(!execute) throw new Error('direct_hosting_execute_flag_required');
if(!credentialPath||!fs.existsSync(credentialPath)) throw new Error('credential_missing');
if(!fs.existsSync(siteDir)||!fs.existsSync(configPath)||!fs.existsSync(preflightPath)) throw new Error('prepared_site_missing');
const preflight=JSON.parse(fs.readFileSync(preflightPath,'utf8'));
if(preflight.decision!=='PASS_READY_FOR_EXISTING_HOSTING_HUMAN_VISUAL_REDEPLOY'||preflight.target?.projectId!==expectedProject||preflight.target?.hostingSite!==expectedSite||preflight.safety?.hostingDeployMax!==1) throw new Error('preflight_not_authorized');
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject) throw new Error(`wrong_service_account_project:${sa.project_id||'missing'}`);
const credential=admin.credential.cert(sa);
const token=await credential.getAccessToken();
if(!token?.access_token) throw new Error('oauth_token_unavailable');

async function request(method,url,body,contentType='application/json'){
  const binary=Buffer.isBuffer(body)||body instanceof Uint8Array;
  const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token.access_token}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':binary?'application/octet-stream':contentType})},body:body===undefined?undefined:(binary?body:JSON.stringify(body))});
  const text=await r.text();let payload={};try{payload=text?JSON.parse(text):{};}catch{}
  return{ok:r.ok,status:r.status,payload,textLength:text.length};
}

function walk(dir,base=dir,out=[]){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ent.name==='node_modules'||ent.name.startsWith('.')) continue;
    const full=path.join(dir,ent.name);
    if(ent.isDirectory()) walk(full,base,out);
    else if(ent.isFile()) out.push(full);
  }
  return out;
}
function restServingConfig(firebaseConfig){
  const h=firebaseConfig?.hosting||{};
  const headers=(h.headers||[]).map(rule=>({
    ...(rule.regex?{regex:String(rule.regex)}:{glob:String(rule.source||'**')}),
    headers:Object.fromEntries((rule.headers||[]).map(x=>[String(x.key),String(x.value)]))
  }));
  const rewrites=(h.rewrites||[]).map(rule=>({
    ...(rule.regex?{regex:String(rule.regex)}:{glob:String(rule.source||'**')}),
    ...(rule.destination?{path:String(rule.destination)}:{})
  }));
  for(const r of rewrites) if(!r.path) throw new Error('unsupported_nonstatic_rewrite');
  return {headers,rewrites};
}

const firebaseConfig=JSON.parse(fs.readFileSync(configPath,'utf8'));
const servingConfig=restServingConfig(firebaseConfig);
if(!servingConfig.rewrites.some(r=>r.glob==='**'&&r.path==='/index-backend-dev.html')) throw new Error('required_entrypoint_rewrite_missing');

const files=walk(siteDir);
if(!files.length) throw new Error('empty_hosting_site');
const fileMap={};
const hashToCompressed=new Map();
let totalRawBytes=0,totalGzipBytes=0;
for(const full of files){
  const rel=path.relative(siteDir,full).split(path.sep).join('/');
  if(!rel||rel.includes('..')) throw new Error('unsafe_relative_path');
  const raw=fs.readFileSync(full);
  totalRawBytes+=raw.length;
  const gz=zlib.gzipSync(raw,{level:9,mtime:0});
  totalGzipBytes+=gz.length;
  const hash=crypto.createHash('sha256').update(gz).digest('hex');
  fileMap['/'+rel]=hash;
  if(!hashToCompressed.has(hash)) hashToCompressed.set(hash,gz);
}

const startedAt=new Date().toISOString();
let mutationCalls=0;
const created=await request('POST',`https://firebasehosting.googleapis.com/v1beta1/sites/${encodeURIComponent(expectedSite)}/versions`,{config:servingConfig});
if(!created.ok||!created.payload?.name||created.payload?.status!=='CREATED') fail('hosting_version_create_failed',created);
mutationCalls++;
const versionName=String(created.payload.name);
const versionId=versionName.split('/').pop();
if(!versionId) throw new Error('version_id_missing');

const entries=Object.entries(fileMap);
const requiredHashes=new Set();
let uploadUrl='';
for(let i=0;i<entries.length;i+=1000){
  const batch=Object.fromEntries(entries.slice(i,i+1000));
  const pop=await request('POST',`https://firebasehosting.googleapis.com/v1beta1/sites/${encodeURIComponent(expectedSite)}/versions/${encodeURIComponent(versionId)}:populateFiles`,{files:batch});
  if(!pop.ok||!pop.payload?.uploadUrl) fail('hosting_populate_files_failed',pop);
  mutationCalls++;
  uploadUrl=String(pop.payload.uploadUrl);
  for(const hash of Array.isArray(pop.payload.uploadRequiredHashes)?pop.payload.uploadRequiredHashes:[]) requiredHashes.add(String(hash));
}
if(!uploadUrl) throw new Error('upload_url_missing');

let uploaded=0;
for(const hash of requiredHashes){
  const body=hashToCompressed.get(hash);
  if(!body) throw new Error(`required_hash_not_found:${hash}`);
  const up=await request('POST',`${uploadUrl.replace(/\/$/,'')}/${encodeURIComponent(hash)}`,body,'application/octet-stream');
  if(!up.ok) fail('hosting_file_upload_failed',up);
  mutationCalls++;uploaded++;
}

const finalized=await request('PATCH',`https://firebasehosting.googleapis.com/v1beta1/sites/${encodeURIComponent(expectedSite)}/versions/${encodeURIComponent(versionId)}?update_mask=status`,{status:'FINALIZED'});
if(!finalized.ok||finalized.payload?.status!=='FINALIZED') fail('hosting_finalize_failed',finalized);
mutationCalls++;

const release=await request('POST',`https://firebasehosting.googleapis.com/v1beta1/sites/${encodeURIComponent(expectedSite)}/releases?versionName=${encodeURIComponent(versionName)}`,undefined);
if(!release.ok||!release.payload?.name||String(release.payload?.version?.name||'')!==versionName) fail('hosting_release_failed',release);
mutationCalls++;

const readRelease=await request('GET',`https://firebasehosting.googleapis.com/v1beta1/${String(release.payload.name)}`);
if(!readRelease.ok||String(readRelease.payload?.version?.name||'')!==versionName||String(readRelease.payload?.version?.status||'')!=='FINALIZED') fail('hosting_release_readback_failed',readRelease);
const readVersion=await request('GET',`https://firebasehosting.googleapis.com/v1beta1/${versionName}`);
if(!readVersion.ok||readVersion.payload?.status!=='FINALIZED') fail('hosting_version_readback_failed',readVersion);

const report={
  schemaVersion:'cxorbia.corte6-existing-hosting-direct-deploy.v1',
  generatedAt:new Date().toISOString(),
  startedAt,
  decision:'PASS_DIRECT_HOSTING_REST_API_RELEASE_VERIFIED',
  projectId:expectedProject,
  siteId:expectedSite,
  hostingTarget:'cxorbia-dev',
  versionName,
  releaseName:String(release.payload.name),
  releaseType:String(release.payload.type||'DEPLOY'),
  versionStatus:String(readVersion.payload.status),
  fileCount:files.length,
  uniqueHashes:hashToCompressed.size,
  uploadRequiredHashes:requiredHashes.size,
  uploadedFiles:uploaded,
  rawBytes:totalRawBytes,
  gzipBytes:totalGzipBytes,
  populateBatches:Math.ceil(entries.length/1000),
  hostingDeployExecutions:1,
  hostingApiMutationCalls:mutationCalls,
  remoteReleaseReadback:true,
  config:{entrypointRewrite:'/index-backend-dev.html',noStoreHeader:true},
  safety:{firebaseProjectCreates:0,hostingSiteCreates:0,authWrites:0,firestoreDataWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,legacyWrites:0,payments:0,functionsDeploys:0,merge:false,production:false,piiExported:false,secretsExported:false}
};
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:report.decision,projectId:expectedProject,siteId:expectedSite,versionName,releaseName:report.releaseName,fileCount:report.fileCount,uniqueHashes:report.uniqueHashes,uploadedFiles:report.uploadedFiles,populateBatches:report.populateBatches,hostingDeployExecutions:1,hostingApiMutationCalls:mutationCalls,production:false,firestoreDataWrites:0,authWrites:0}));
