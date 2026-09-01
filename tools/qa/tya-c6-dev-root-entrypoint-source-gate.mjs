#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const configPath=path.join(root,'firebase.json');
const canonicalPath=path.join(root,'app/index-backend-dev.html');
const demoPath=path.join(root,'app/index.html');
const outputFile=String(process.env.CXORBIA_ROOT_ENTRY_SOURCE_OUTPUT||'').trim();
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

let config=null;
try{config=JSON.parse(fs.readFileSync(configPath,'utf8'));}catch(error){
  blockers.push({code:'FIREBASE_CONFIG_INVALID',detail:String(error?.message||error)});
}
const canonical=fs.existsSync(canonicalPath)?fs.readFileSync(canonicalPath,'utf8'):'';
const demo=fs.existsSync(demoPath)?fs.readFileSync(demoPath,'utf8'):'';
const hosting=config?.hosting||{};
const redirects=Array.isArray(hosting.redirects)?hosting.redirects:[];
const rewrites=Array.isArray(hosting.rewrites)?hosting.rewrites:[];
const rootRedirects=redirects.filter(item=>item?.source==='/');
const rootRedirect=rootRedirects[0]||null;
const apiRewrite=rewrites.find(item=>item?.source==='/api/tya/cinepolis/hr-live')||null;
const fallback=rewrites.find(item=>item?.source==='**')||null;

check(hosting.target==='cxorbia-dev','HOSTING_TARGET_EXACT',hosting.target||null);
check(hosting.public==='app','HOSTING_PUBLIC_EXACT',hosting.public||null);
check(rootRedirects.length===1,'ROOT_REDIRECT_SINGLE',rootRedirects.length);
check(rootRedirect?.destination==='/index-backend-dev.html','ROOT_REDIRECT_DESTINATION_EXACT',rootRedirect?.destination||null);
check(Number(rootRedirect?.type)===302,'ROOT_REDIRECT_TEMPORARY_302',rootRedirect?.type??null);
check(apiRewrite?.run?.serviceId==='cxorbia-live-hr-dev'&&apiRewrite?.run?.region==='us-central1','LIVE_HR_REWRITE_PRESERVED',apiRewrite||null);
check(fallback?.destination==='/index.html','DEMO_FALLBACK_PRESERVED',fallback||null);
check(Boolean(canonical),'CANONICAL_ENTRY_PRESENT');
check(Boolean(demo),'DEMO_ENTRY_PRESENT');

const canonicalMarkers=[
  'id="cxDevEntryCanonicalBootstrap"',
  '<title>CXOrbia · Preview Backend DEV</title>',
  'firebase-app-compat.js',
  '/__/firebase/init.js',
  'core/backend-browser-auth.js',
  'adapters/tya-protected-auth-hr-authority-bridge-v2.js',
  'adapters/tya-c6-unified-human-runtime-v1.js',
  'window.CX_DEV_ENTRY_CANONICAL'
];
for(const marker of canonicalMarkers){
  check(canonical.includes(marker),'CANONICAL_ENTRY_MARKER_PRESENT',marker);
}
check(!demo.includes('id="cxDevEntryCanonicalBootstrap"'),'DEMO_ENTRY_REMAINS_DISTINCT');
check(!demo.includes('adapters/tya-c6-unified-human-runtime-v1.js'),'DEMO_ENTRY_NOT_MASQUERADING_AS_BACKEND');

const report={
  schemaVersion:'cxorbia.c6.dev-root-entrypoint-source-parity.v1',
  generatedAt:new Date().toISOString(),
  decision:blockers.length?'FAIL_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY':'PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY',
  hosting:{
    target:hosting.target||null,
    public:hosting.public||null,
    rootRedirect,
    apiRewrite,
    fallback
  },
  canonicalEntry:{
    path:'app/index-backend-dev.html',
    markerCount:canonicalMarkers.length,
    protectedHumanRuntime:true
  },
  demoEntry:{
    path:'app/index.html',
    preservedAsExplicitFallback:true
  },
  checks,
  blockers,
  safety:{
    providerReads:0,
    providerWrites:0,
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
