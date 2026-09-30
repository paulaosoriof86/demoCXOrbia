#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const OUT=String(process.env.PREI4_003_RESUME_OUT||'.tmp/prei4-admin-003-resume');
const ROOT=String(process.env.PREI4_003_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.PREI4_003_SOURCE||'');
const TREE=String(process.env.PREI4_003_TREE||'');
const BASE=String(process.env.PREI4_003_BASE||'');
const EXPECTED_RUNTIME=String(process.env.PREI4_003_EXPECTED_RUNTIME||'');
const EXPECTED_DIGEST=String(process.env.PREI4_003_EXPECTED_DIGEST||'');
const BASELINE_HR=String(process.env.PREI4_003_BASELINE_HR||'');
const ALL_ROWS_HASH=String(process.env.PREI4_003_ALL_ROWS_HASH||'');
const SEP_ROWS_HASH=String(process.env.PREI4_003_SEP_ROWS_HASH||'');
const str=v=>String(v??'').trim();
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:Buffer.from(v)).digest('hex');
const run=(cmd,args,env={})=>execFileSync(cmd,args,{encoding:'utf8',env:{...process.env,...env}});
const write=(name,v)=>fs.writeFileSync(OUT+'/'+name,JSON.stringify(v,null,2)+'\n');
const fail=m=>{throw new Error(m);};
fs.mkdirSync(OUT,{recursive:true});

if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{40}$/.test(TREE)||!/^[a-f0-9]{40}$/.test(BASE))fail('SOURCE_FAILURE:PREI4_003_RESUME_ENV');
if(run('git',['rev-parse',SOURCE+'^{tree}']).trim()!==TREE)fail('SOURCE_FAILURE:PREI4_003_TREE');
const productDiff=run('git',['diff','--name-only',BASE,SOURCE,'--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source']).trim().split('\n').filter(Boolean).sort();
const expected=['app/modules/shoppers.js','backend/runtime/cxorbia-shopper-command-provider-v1.mjs','backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs'].sort();
if(JSON.stringify(productDiff)!==JSON.stringify(expected))fail('RELEASE_COMPOSITION_FAILURE:PREI4_003_PRODUCT_DELTA:'+JSON.stringify(productDiff));

const runtime=JSON.parse(run('gcloud',['run','services','describe','cxorbia-live-hr-dev','--project','cxorbia-backend-dev','--region','us-central1','--format=json']));
const revision=str(runtime?.status?.latestReadyRevisionName);
if(revision!==EXPECTED_RUNTIME)fail('RELEASE_COMPOSITION_FAILURE:PREI4_003_RUNTIME_REVISION:'+revision);
const rev=JSON.parse(run('gcloud',['run','revisions','describe',revision,'--project','cxorbia-backend-dev','--region','us-central1','--format=json']));
const rawDigest=str(rev?.status?.imageDigest);
const digest=rawDigest.startsWith('sha256:')?rawDigest:(rawDigest.includes('@sha256:')?'sha256:'+rawDigest.split('@sha256:').pop():'');
if(digest!==EXPECTED_DIGEST)fail('RELEASE_COMPOSITION_FAILURE:PREI4_003_RUNTIME_DIGEST:'+digest);

const served=await fetch(ROOT+'/modules/shoppers.js?resume='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(60000)}).then(async r=>{if(!r.ok)fail('PROVIDER_FAILURE:PREI4_003_HOSTING_UI_HTTP_'+r.status);return Buffer.from(await r.arrayBuffer());});
const sourceUi=run('git',['show',SOURCE+':app/modules/shoppers.js']);
if(sha(served)!==sha(sourceUi))fail('RELEASE_COMPOSITION_FAILURE:PREI4_003_HOSTING_SOURCE_MISMATCH');

const hr=await fetch(ROOT+'/api/tya/cinepolis/hr-live?fresh=1&prei4003resume='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)}).then(async r=>{if(!r.ok)fail('PROVIDER_FAILURE:PREI4_003_HR_HTTP_'+r.status);return r.json();});
const runtimeMeta=hr._runtime||{};
const currentHr=str(runtimeMeta.revision||hr.revision||hr.sourceRevision);
const refreshError=runtimeMeta.refreshError??runtimeMeta.lastRefreshError??hr.refreshError??hr.lastRefreshError??null;
const visits=Array.isArray(hr.visits)?hr.visits:[];
const rowHash=rows=>sha(rows.map(v=>str(v.hrRowId)).sort().join('\n')+'\n');
const allRowsHash=rowHash(visits),sepVisits=visits.filter(v=>str(v.periodKey)==='2026-09'),sepRowsHash=rowHash(sepVisits);
const summaries=Array.isArray(hr.periodOperationalSummary)?hr.periodOperationalSummary:[];
const sep=summaries.find(x=>str(x.periodKey)==='2026-09'),aug=summaries.find(x=>str(x.periodKey)==='2026-08');
if(!/^[a-f0-9]{64}$/.test(currentHr)||refreshError!=null||hr.sourceSafe!==true||hr.production!==false)fail('PROVIDER_FAILURE:PREI4_003_CURRENT_HR_AUTHORITY');
if(allRowsHash!==ALL_ROWS_HASH||sepRowsHash!==SEP_ROWS_HASH)fail('SOURCE_FAILURE:PREI4_003_HR_ROW_UNIVERSE_CHANGED');
if(Number(sep?.total)!==44||Number(sep?.byCountry?.GT)!==34||Number(sep?.byCountry?.HN)!==10||Number(aug?.total)!==44)fail('MAPPING_FAILURE:PREI4_003_HR_COUNTS');

const postOut=OUT+'/post002';fs.mkdirSync(postOut,{recursive:true});
const postEnv={PREI4_002_LIVE_OUT:postOut,PREI4_002_ROOT:ROOT,PREI4_002_SOURCE:SOURCE,PREI4_002_TREE:TREE,PREI4_002_HR_REVISION:currentHr};
fs.writeFileSync(OUT+'/post002-console.log',run('node',['tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs'],postEnv));
const post=JSON.parse(fs.readFileSync(postOut+'/result.json','utf8'));
if(post.decision!=='PASS_PREI4_ADMIN_002_HOSTING_LIVE'||Number(post?.admin?.initial?.active)!==0||Number(post?.admin?.initial?.archived)!==12||str(post?.durableBefore?.hash)!==str(post?.durableAfter?.hash))fail('FUNCTIONAL_DEFECT:PREI4_002_REGRESSION');

const adminOut=OUT+'/admin003';fs.mkdirSync(adminOut,{recursive:true});
const adminEnv={PREI4_003_LIVE_OUT:adminOut,PREI4_003_ROOT:ROOT,PREI4_003_SOURCE:SOURCE,PREI4_003_TREE:TREE,PREI4_003_HR_REVISION:currentHr};
fs.writeFileSync(OUT+'/admin003-console.log',run('node',['tools/qa/cxorbia-prei4-admin003-cumulative-live-reproof.mjs'],adminEnv));
const admin=JSON.parse(fs.readFileSync(adminOut+'/result.json','utf8'));
if(admin.decision!=='PASS_PREI4_ADMIN_003_CUMULATIVE_LIVE'||str(admin?.shopper?.profile?.profileName)!=='Milton De Paz'||Number(admin?.shopper?.history?.visitCount)<1)fail('FUNCTIONAL_DEFECT:PREI4_003_LIVE');
if((admin?.admin?.patricia||[]).filter(x=>x.found===true&&x.review==='required').length!==3)fail('FUNCTIONAL_DEFECT:PREI4_003_PATRICIA_REVIEW');
if((admin?.admin?.jary||[]).filter(x=>x.found===true).length!==2)fail('FUNCTIONAL_DEFECT:PREI4_003_JARY_SEPARATE');

const token=run('gcloud',['auth','print-access-token']).trim();
const hosting=await fetch('https://firebasehosting.googleapis.com/v1beta1/sites/cxorbia-backend-dev/channels/live',{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(60000)}).then(async r=>{if(!r.ok)fail('PROVIDER_FAILURE:PREI4_003_HOSTING_READBACK_'+r.status);return r.json();});
const hostingVersion=str(hosting?.release?.version?.name);
if(!hostingVersion)fail('RELEASE_COMPOSITION_FAILURE:PREI4_003_HOSTING_VERSION_EMPTY');

const result={
  decision:'PASS_PREI4_ADMIN_003_CUMULATIVE_RESUME_NO_DEPLOY',
  sourceSha:SOURCE,sourceTree:TREE,
  runtimeRevision:revision,runtimeDigest:digest,hostingVersion,
  hr:{baselineRevision:BASELINE_HR,currentRevision:currentHr,dataEvolutionDetected:currentHr!==BASELINE_HR,refreshError,september:sep,august:aug,allHrRowIdSetSha256:allRowsHash,septemberHrRowIdSetSha256:sepRowsHash},
  closedRegression:{preI4Admin002:post.decision,preI4Admin003:admin.decision},
  builds:0,runtimeDeploys:0,hostingDeploys:0,rulesDeploys:0,hrWrites:0,production:false
};
write('result.json',result);
console.log(JSON.stringify(result,null,2));
