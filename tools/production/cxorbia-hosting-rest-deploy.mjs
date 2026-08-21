#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const argv=process.argv.slice(2);
const arg=name=>{const i=argv.indexOf(name);return i>=0?argv[i+1]:null;};
const has=name=>argv.includes(name);
const sourceDir=path.resolve(arg('--source-dir')||'.');
const out=path.resolve(arg('--out')||'.tmp/cxorbia-hosting-rest-deploy.json');
const dryRun=has('--dry-run');
const site='cxorbia-backend-dev';
const project='cxorbia-backend-dev';
const executeGate='YES_PAULA_I5_G2B_RECOVERY_HOSTING_REST';
const token=process.env.CXORBIA_HOSTING_ACCESS_TOKEN||'';
const requestedGate=process.env.CXORBIA_HOSTING_REST_EXECUTE||'';

const sha256=v=>crypto.createHash('sha256').update(v).digest('hex');
const writeReceipt=value=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(value,null,2)+'\n','utf8');};
const safeError=e=>String(e?.message||e||'HOSTING_REST_FAILED').replace(/https?:\/\/[^\s]+/g,'<url>').slice(0,500);

function walk(root){
  const files=[];
  const visit=(dir,rel='')=>{
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      if(entry.name==='node_modules'||entry.name.startsWith('.'))continue;
      const nextRel=rel?`${rel}/${entry.name}`:entry.name;
      const full=path.join(dir,entry.name);
      if(entry.isSymbolicLink())throw new Error('HOSTING_REST_SYMLINK_FORBIDDEN:'+nextRel);
      if(entry.isDirectory())visit(full,nextRel);
      else if(entry.isFile())files.push({rel:nextRel.replace(/\\/g,'/'),full});
    }
  };
  visit(root);
  return files.sort((a,b)=>a.rel.localeCompare(b.rel));
}

function transformConfig(firebase){
  const h=firebase?.hosting;
  if(!h||h.target!=='cxorbia-dev'||h.public!=='app')throw new Error('HOSTING_REST_TARGET_CONTRACT_INVALID');
  const headers=(h.headers||[]).map(x=>({glob:x.source,headers:Object.fromEntries((x.headers||[]).map(v=>[v.key,v.value]))}));
  const redirects=(h.redirects||[]).map(x=>({glob:x.source,location:x.destination,statusCode:Number(x.type)}));
  const rewrites=(h.rewrites||[]).map(x=>{
    const base={glob:x.source};
    if(x.destination)return {...base,path:x.destination};
    if(x.run)return {...base,run:{serviceId:x.run.serviceId,region:x.run.region,...(x.run.tag?{tag:x.run.tag}:{}),...(typeof x.run.pinTag==='boolean'?{pinTag:x.run.pinTag}:{})}};
    if(x.function)return {...base,function:x.function.functionId||x.function};
    throw new Error('HOSTING_REST_REWRITE_UNSUPPORTED:'+String(x.source||''));
  });
  return {headers,redirects,rewrites,...(typeof h.cleanUrls==='boolean'?{cleanUrls:h.cleanUrls}:{}),...(typeof h.trailingSlash==='boolean'?{trailingSlashBehavior:h.trailingSlash?'ADD':'REMOVE'}:{})};
}

async function request(url,{method='GET',headers={},body=null,ok=[200]}={}){
  const r=await fetch(url,{method,headers,body});
  let json=null;try{json=await r.json();}catch{}
  if(!ok.includes(r.status))throw new Error(`HOSTING_REST_HTTP_${r.status}:${json?.error?.status||'UNKNOWN'}`);
  return {status:r.status,body:json};
}

const firebase=JSON.parse(fs.readFileSync(path.join(sourceDir,'firebase.json'),'utf8').replace(/^\uFEFF/,''));
const config=transformConfig(firebase);
const publicDir=path.join(sourceDir,'app');
if(!fs.existsSync(publicDir)||!fs.statSync(publicDir).isDirectory())throw new Error('HOSTING_REST_PUBLIC_DIR_MISSING');
const sourceFiles=walk(publicDir);
if(!sourceFiles.length)throw new Error('HOSTING_REST_EMPTY_PUBLIC_DIR');
const artifacts=sourceFiles.map(f=>{
  const raw=fs.readFileSync(f.full);
  const gzip=zlib.gzipSync(raw,{level:9,mtime:0});
  const digest=sha256(gzip);
  return {path:`/${f.rel}`,rawBytes:raw.length,gzipBytes:gzip.length,hash:digest,gzip};
});
const files=Object.fromEntries(artifacts.map(x=>[x.path,x.hash]));
const byHash=new Map();for(const a of artifacts)if(!byHash.has(a.hash))byHash.set(a.hash,a);
const manifest={fileCount:artifacts.length,rawBytes:artifacts.reduce((n,x)=>n+x.rawBytes,0),gzipBytes:artifacts.reduce((n,x)=>n+x.gzipBytes,0),uniqueHashes:byHash.size,configSha256:sha256(Buffer.from(JSON.stringify(config))),filesSha256:sha256(Buffer.from(JSON.stringify(files)))};
const baseReceipt={schemaVersion:'cxorbia.hosting-rest-deploy.v1',site,project,sourceDir:path.basename(sourceDir),mode:dryRun?'DRY_RUN':'EXECUTE',manifest,configContract:{target:'cxorbia-dev',public:'app',tenantRewrite:true,hrRewrite:true},provider:{versionCreated:false,populateCalls:0,uploads:0,finalized:false,releaseCreated:false,versionName:null,releaseName:null},safety:{firestoreWrites:0,authWrites:0,storageWrites:0,externalHrWrites:0,realDataWrites:0,realCredentialWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,rulesWrites:0,cloudRunDeploys:0,merge:false}};

if(dryRun){
  const receipt={...baseReceipt,decision:'PASS_HOSTING_REST_DRY_RUN_SOURCE_READY',providerWrites:0,hostingDeployExecutions:0};
  writeReceipt(receipt);console.log(JSON.stringify(receipt));process.exit(0);
}
if(requestedGate!==executeGate)throw new Error('HOSTING_REST_EXECUTION_GATE_NOT_AUTHORIZED');
if(!token)throw new Error('HOSTING_REST_ACCESS_TOKEN_MISSING');

const receipt={...baseReceipt,decision:'HOSTING_REST_EXECUTION_STARTED',providerWrites:0,hostingDeployExecutions:1,stage:'PREPARED'};
writeReceipt(receipt);
const authHeaders={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
try{
  receipt.stage='CREATE_VERSION';writeReceipt(receipt);
  const created=await request(`https://firebasehosting.googleapis.com/v1beta1/sites/${site}/versions`,{method:'POST',headers:authHeaders,body:JSON.stringify({config}),ok:[200]});
  const versionName=created.body?.name;
  if(!versionName||!versionName.startsWith(`sites/${site}/versions/`))throw new Error('HOSTING_REST_VERSION_IDENTITY_INVALID');
  receipt.provider.versionCreated=true;receipt.provider.versionName=versionName;receipt.providerWrites++;writeReceipt(receipt);

  const entries=Object.entries(files);
  const uploadTasks=new Map();
  for(let i=0;i<entries.length;i+=1000){
    const chunk=Object.fromEntries(entries.slice(i,i+1000));
    receipt.stage='POPULATE_FILES';writeReceipt(receipt);
    const populated=await request(`https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`,{method:'POST',headers:authHeaders,body:JSON.stringify({files:chunk}),ok:[200]});
    receipt.provider.populateCalls++;receipt.providerWrites++;writeReceipt(receipt);
    const uploadUrl=String(populated.body?.uploadUrl||'').replace(/\/$/,'');
    for(const h of populated.body?.uploadRequiredHashes||[]){
      if(!byHash.has(h)||!uploadUrl)throw new Error('HOSTING_REST_UPLOAD_PLAN_INVALID');
      if(!uploadTasks.has(h))uploadTasks.set(h,uploadUrl);
    }
  }

  for(const [hash,uploadUrl] of uploadTasks){
    receipt.stage='UPLOAD_FILE';writeReceipt(receipt);
    const r=await fetch(`${uploadUrl}/${hash}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/octet-stream'},body:byHash.get(hash).gzip});
    if(r.status!==200)throw new Error(`HOSTING_REST_UPLOAD_HTTP_${r.status}`);
    receipt.provider.uploads++;receipt.providerWrites++;writeReceipt(receipt);
  }

  receipt.stage='FINALIZE_VERSION';writeReceipt(receipt);
  const finalized=await request(`https://firebasehosting.googleapis.com/v1beta1/${versionName}?update_mask=status`,{method:'PATCH',headers:authHeaders,body:JSON.stringify({status:'FINALIZED'}),ok:[200]});
  if(finalized.body?.status!=='FINALIZED')throw new Error('HOSTING_REST_VERSION_NOT_FINALIZED');
  receipt.provider.finalized=true;receipt.providerWrites++;writeReceipt(receipt);

  receipt.stage='CREATE_RELEASE';writeReceipt(receipt);
  const released=await request(`https://firebasehosting.googleapis.com/v1beta1/sites/${site}/releases?versionName=${encodeURIComponent(versionName)}`,{method:'POST',headers:{Authorization:`Bearer ${token}`},ok:[200]});
  if(!released.body?.name||released.body?.version?.name!==versionName)throw new Error('HOSTING_REST_RELEASE_IDENTITY_INVALID');
  receipt.provider.releaseCreated=true;receipt.provider.releaseName=released.body.name;receipt.providerWrites++;receipt.stage='COMPLETE';receipt.decision='PASS_HOSTING_REST_DEPLOY';writeReceipt(receipt);
  console.log(JSON.stringify({...receipt,accessTokenExported:false}));
}catch(error){
  receipt.decision=receipt.provider.releaseCreated?'HOSTING_REST_POST_RELEASE_FAILURE':'HOSTING_REST_PARTIAL_FAILURE';
  receipt.error=safeError(error);receipt.stage=receipt.stage||'UNKNOWN';writeReceipt(receipt);throw error;
}
