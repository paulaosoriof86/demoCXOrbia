#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=String(process.argv[2]||process.env.CXORBIA_DEV_ROOT_URL||'').replace(/\/$/,'');
const outputFile=String(process.env.CXORBIA_ROOT_ENTRY_REMOTE_OUTPUT||'').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
const blockers=[];
const checks=[];
const check=(ok,code,detail=null)=>{
  if(!ok)blockers.push({code,detail});
  else checks.push(detail==null?code:{code,detail});
};
const persist=value=>{
  if(!outputFile)return;
  fs.mkdirSync(path.dirname(outputFile),{recursive:true});
  fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');
};
const sha256=text=>crypto.createHash('sha256').update(text,'utf8').digest('hex');

let manual=null;
let followed=null;
let direct=null;
let locationUrl=null;
let rootBody='';
let directBody='';
try{
  const token=Date.now();
  manual=await fetch(`${root}/?cxRootParity=${token}`,{
    redirect:'manual',
    headers:{'cache-control':'no-cache','pragma':'no-cache'}
  });
  const location=manual.headers.get('location')||'';
  try{locationUrl=new URL(location,root);}catch{}
  followed=await fetch(`${root}/?cxRootParity=${token}`,{
    redirect:'follow',
    headers:{'cache-control':'no-cache','pragma':'no-cache'}
  });
  direct=await fetch(`${root}/index-backend-dev.html?cxRootParity=${token}`,{
    redirect:'follow',
    headers:{'cache-control':'no-cache','pragma':'no-cache'}
  });
  rootBody=await followed.text();
  directBody=await direct.text();
}catch(error){
  blockers.push({code:'REMOTE_FETCH_FAILED',detail:String(error?.message||error)});
}

const rootSha=rootBody?sha256(rootBody):null;
const directSha=directBody?sha256(directBody):null;
const finalUrl=followed?.url?new URL(followed.url):null;
const markers=[
  'id="cxDevEntryCanonicalBootstrap"',
  '<title>CXOrbia · Preview Backend DEV</title>',
  'core/backend-browser-auth.js',
  'adapters/tya-c6-unified-human-runtime-v1.js'
];

check(manual?.status===302,'ROOT_HTTP_302',manual?.status??null);
check(locationUrl?.pathname==='/index-backend-dev.html','ROOT_LOCATION_CANONICAL',locationUrl?.pathname||null);
check(followed?.ok===true,'ROOT_FOLLOW_RESPONSE_OK',followed?.status??null);
check(direct?.ok===true,'DIRECT_CANONICAL_RESPONSE_OK',direct?.status??null);
check(finalUrl?.pathname==='/index-backend-dev.html','ROOT_FINAL_URL_CANONICAL',finalUrl?.pathname||null);
check(Boolean(rootSha)&&rootSha===directSha,'ROOT_BODY_EQUALS_DIRECT_CANONICAL',{rootSha,directSha});
for(const marker of markers){
  check(rootBody.includes(marker),'ROOT_CANONICAL_MARKER_PRESENT',marker);
  check(directBody.includes(marker),'DIRECT_CANONICAL_MARKER_PRESENT',marker);
}
check(!/Fuente de datos no disponible/.test(rootBody),'ROOT_NOT_STATIC_BLOCKED_SHELL');
check(!/No hay un adapter backend autorizado conectado/.test(rootBody),'ROOT_NOT_DEMO_CONNECTED_BLOCK');

const report={
  schemaVersion:'cxorbia.c6.dev-root-entrypoint-remote-parity.v1',
  generatedAt:new Date().toISOString(),
  decision:blockers.length?'FAIL_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY':'PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY',
  root,
  redirect:{
    status:manual?.status??null,
    location:manual?.headers?.get('location')||null,
    locationPath:locationUrl?.pathname||null,
    finalUrl:followed?.url||null,
    finalPath:finalUrl?.pathname||null
  },
  parity:{
    rootSha256:rootSha,
    directCanonicalSha256:directSha,
    exact:rootSha!=null&&rootSha===directSha
  },
  checks,
  blockers,
  safety:{
    providerReads:true,
    providerWrites:false,
    deploys:0,
    firestoreWrites:0,
    authWrites:0,
    rulesWrites:0,
    storageWrites:0,
    hrWrites:0,
    makeCalls:0,
    geminiCalls:0,
    paymentWrites:0,
    merge:false,
    production:false
  }
};
persist(report);
console.log(JSON.stringify(report));
if(blockers.length)process.exitCode=1;
