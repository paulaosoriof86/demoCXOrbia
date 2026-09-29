#!/usr/bin/env node
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const SOURCE=String(process.env.CUM_SOURCE||'').trim();
const TREE=String(process.env.CUM_TREE||'').trim();
const BASE=String(process.env.CUM_BASE||'').trim();
const LEDGER=String(process.env.CUM_LEDGER||'').trim();
const MATRIX=String(process.env.CUM_MATRIX||'RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json');
const OUT=String(process.env.CUM_OUT||'.tmp/prei4-cumulative-regression');
const HR_SOURCE='5c472e089e6d8492b184a7cb24e78816d347c2de';
const POST_SOURCE='deb58669ea44b484716b9e0d83656310398ed54c';
const expectedDelta=[
  'app/modules/shoppers.js',
  'backend/runtime/cxorbia-shopper-command-provider-v1.mjs',
  'backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs'
];
const hrOwners=[
  'backend/contracts/tya-hr-column-map-r20-v1.json',
  'backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json',
  'tools/hr-source/tya-build-live-hr-source-safe-r20.mjs'
];
const postOwners=[
  'app/core/tya-phase-a-source-safe-preview.js',
  'app/adapters/tya-cumulative-read-model-v2.js',
  'app/core/data.js',
  'app/modules/postulaciones.js',
  'app/modules/misvisitas.js'
];
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const run=(cmd,args,env={})=>execFileSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],env:{...process.env,...env}});
const fail=m=>{throw new Error('RELEASE_COMPOSITION_FAILURE:CUMULATIVE_GUARD:'+m);};
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{40}$/.test(BASE))fail('SOURCE_ENV');
if(TREE&&git('rev-parse',SOURCE+'^{tree}')!==TREE)fail('TREE_MISMATCH');
fs.mkdirSync(OUT,{recursive:true});

const diff=git('diff','--name-only',BASE,SOURCE,'--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source').split('\n').filter(Boolean).sort();
if(JSON.stringify(diff)!==JSON.stringify([...expectedDelta].sort()))fail('UNDECLARED_PRODUCT_DELTA:'+JSON.stringify(diff));

const parity=(ref,paths,label)=>{
  const bad=[];
  for(const p of paths){
    let a='',b='';
    try{a=git('rev-parse',ref+':'+p);}catch{bad.push({path:p,reason:'APPROVED_MISSING'});continue;}
    try{b=git('rev-parse',SOURCE+':'+p);}catch{bad.push({path:p,reason:'CURRENT_MISSING'});continue;}
    if(a!==b)bad.push({path:p,approved:a,current:b});
  }
  if(bad.length)fail(label+'_BYTE_DRIFT:'+JSON.stringify(bad));
  return paths.length;
};
const hrParity=parity(HR_SOURCE,hrOwners,'HR008');
const postParity=parity(POST_SOURCE,postOwners,'POST002');

const ledger=JSON.parse(fs.readFileSync(LEDGER,'utf8'));
ledger.findings=ledger.findings||{};
const inject=(id,entry,owners,state,sourceSha)=>{
  ledger.findings[id]={
    ...(ledger.findings[id]||{}),
    ...(entry||{}),
    severity:'P0',
    state,
    owners,
    sourceFixFiles:owners,
    sourceSha,
    sourceFix:{...((entry||{}).sourceFix||{}),sourceSha,owners,productOwners:owners}
  };
};
inject('PREI4-ADMIN-008',ledger.preI4Admin008Fix,hrOwners,'FIXED_PROVEN_RUN594',HR_SOURCE);
inject('PREI4-ADMIN-002',ledger.preI4Admin002,postOwners,'FIXED_PROVEN_RUN601',POST_SOURCE);
const id3Owners=['app/modules/shoppers.js','backend/runtime/cxorbia-shopper-command-provider-v1.mjs'];
inject('PREI4-ADMIN-003',ledger.preI4Admin003,id3Owners,'PASS_PREI4_ADMIN_003_SOURCE',SOURCE);
const normalized=OUT+'/ledger-normalized.json';
fs.writeFileSync(normalized,JSON.stringify(ledger,null,2)+'\n');

const moduleOut=OUT+'/module-truth-preterminal.json';
run('node',['tools/qa/cxorbia-i3-c3-preterminal-module-truth.mjs'],{
  TEMPLATE:MATRIX,LEDGER:normalized,SOURCE,TREE,LAST_SERVED:BASE,OUT_FILE:moduleOut
});
const mt=JSON.parse(fs.readFileSync(moduleOut,'utf8'));
if(mt?.preTerminalComposition?.decision!=='PASS_C3_PRETERMINAL_COMPOSITION')fail('MODULE_TRUTH_DECISION');
if(Number(mt?.preTerminalComposition?.moduleCount)!==20)fail('MODULE_COUNT');
if(Number(mt?.preTerminalComposition?.unauthorizedFileCount)!==0)fail('UNAUTHORIZED_MODULE_DRIFT');
if(mt?.entrypointClosure?.allApprovedOwnersLoaded!==true)fail('APPROVED_OWNER_NOT_LOADED');
if((mt?.entrypointClosure?.duplicateSrc||[]).length)fail('DUPLICATE_SCRIPT');
const pendingModules=[...(mt?.preTerminalComposition?.composedNotDeployedModules||[])].sort();
const allowedPending=['persistence-command-ack-boundary','shoppers-mi-visitas-profile'].sort();
if(JSON.stringify(pendingModules)!==JSON.stringify(allowedPending))fail('UNEXPECTED_PENDING_MODULES:'+JSON.stringify(pendingModules));
const pendingFiles=(mt.sourceFiles||[]).filter(x=>x.classification==='COMPOSED_NOT_DEPLOYED').map(x=>x.path).sort();
const expectedPending=['app/modules/shoppers.js','backend/runtime/cxorbia-shopper-command-provider-v1.mjs'].sort();
if(JSON.stringify(pendingFiles)!==JSON.stringify(expectedPending))fail('UNEXPECTED_PENDING_FILES:'+JSON.stringify(pendingFiles));

const hrMap=run('node',['tools/hr-source/tya-build-live-hr-source-safe-r20.mjs','--mapping-self-test']);
const hrAssign=run('node',['tools/hr-source/tya-build-live-hr-source-safe-r20.mjs','--assignment-self-test']);
const post=run('node',['tools/qa/cxorbia-prei4-admin002-lifecycle-source-selftest.mjs'],{PREI4_002_SOURCE:SOURCE,PREI4_002_TREE:TREE,PREI4_002_SOURCE_OUT:OUT+'/post002'});
const provider=run('node',['--test','backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs']);

if(!hrMap.includes('PASS_R20_PROJECT_SCOPED_CINEMA_IDENTITY'))fail('HR_MAPPING_SELFTEST');
if(!hrAssign.includes('PASS_R20_SHOPPER_ASSIGNMENT_CLASSIFICATION'))fail('HR_ASSIGNMENT_SELFTEST');
if(!post.includes('PASS_PREI4_ADMIN_002_SOURCE_LIFECYCLE'))fail('POST002_SELFTEST');
if(!provider.includes('pass 25'))fail('ADMIN003_PROVIDER_SUITE');

const result={
  decision:'PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD',
  sourceSha:SOURCE,sourceTree:TREE,baselineSource:BASE,
  exactDeclaredDelta:diff,
  protectedByteParity:{hr008Owners:hrParity,post002Owners:postParity},
  moduleTruth:{
    moduleCount:mt.preTerminalComposition.moduleCount,
    matchModules:mt.preTerminalComposition.matchModules.length,
    composedNotDeployedModules:pendingModules,
    pendingFiles,
    unauthorizedFileCount:mt.preTerminalComposition.unauthorizedFileCount,
    allApprovedOwnersLoaded:true,
    duplicateScripts:0
  },
  closedRegressionTests:{
    hrMapping:'PASS_R20_PROJECT_SCOPED_CINEMA_IDENTITY',
    hrAssignment:'PASS_R20_SHOPPER_ASSIGNMENT_CLASSIFICATION',
    postulations:'PASS_PREI4_ADMIN_002_SOURCE_LIFECYCLE',
    focalProviderTests:25
  },
  builds:0,deploys:0,writes:0,production:false
};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
