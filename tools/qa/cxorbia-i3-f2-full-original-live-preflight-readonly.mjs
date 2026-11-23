/* I3/F2 exact source candidate against ORIGINAL Excel via existing Make B14.
 * READ ONLY: no database mutations, no source switch, no PII in receipts.
 */
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {applicationDefault,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {resolveExcelOriginalProjectPlan,readExcelOriginalProjectSnapshot} from '../../backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs';
import {readExcelPeriodThroughMake} from '../../backend/runtime/cxorbia-make-graph-provider-v1.mjs';

const root='tenants/tya/projects/cinepolis';
const out='.tmp/i3-f2-live-excel-source-preflight/result.json';
const proof={schemaVersion:'cxorbia.i3.f2.original-excel-operational-preflight.v1',
  decision:'HOLD',iteration:'I3',tenantId:'tya',projectId:'cinepolis',
  sourceMode:'READ_ONLY_PROJECT_SELECTOR_SIMULATION',writes:0,hrWrites:0,
  authWrites:0,production:false,sourceSwitch:false,excelReadCalls:0};
const fail=code=>{throw Error(code)};
let client;
try {
 if(process.env.GITHUB_REF!=='refs/heads/recovery/cxorbia-phase-a-20260831'
   ||process.env.GITHUB_REPOSITORY!=='paulaosoriof86/demoCXOrbia')
     fail('SOURCE_FAILURE:RECOVERY_BRANCH_REQUIRED');
 const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
 const source=descriptor.productSourceSha;
 if(!/^[a-f0-9]{40}$/.test(source))fail('RELEASE_COMPOSITION_FAILURE:SOURCE_ID');
 execFileSync('git',['merge-base','--is-ancestor',source,'HEAD'],{stdio:'ignore'});
 const runnerSource=process.env.CXORBIA_F2_EXACT_SOURCE_SHA;
 if(source!==runnerSource)fail('RELEASE_COMPOSITION_FAILURE:F2_SOURCE_SHA_MISMATCH');
 if(descriptor.production!=='DO_NOT_TOUCH')fail('RELEASE_COMPOSITION_FAILURE:PRODUCTION_POLICY');
 const app=initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
 const db=getFirestore(app);
 const project=await db.doc(root).get();
 if(!project.exists)fail('MAPPING_FAILURE:PROJECT_MISSING');
 const raw=project.data()||{},prior=raw.operationalSource||raw.routeSource||{};
 if(prior.providerType!=='google_sheets'||prior.mode!=='external')fail('MAPPING_FAILURE:UNEXPECTED_CURRENT_SELECTOR');
 const mirrorId=prior.providerBindingId||prior.integrationSettingId||prior.providerRef;
 if(!mirrorId)fail('MAPPING_FAILURE:OBSOLETE_SOURCE_REFERENCE_MISSING');
 const mirrorSnap=await db.doc('tenants/tya/integrationSettings/'+mirrorId).get();
 const mirror=mirrorSnap.data()||{},bindings=mirror.originalReadbackBindings;
 if(!Array.isArray(bindings)||bindings.length!==2
   ||bindings.map(b=>b.countryCode).sort().join(',')!=='GT,HN')
     fail('MAPPING_FAILURE:ORIGINAL_COUNTRY_BINDING_INCOMPLETE');
 const virtualSource={mode:'external',authority:'external_source',providerType:'excel_online',
   readPolicy:'external_live',writePolicy:'external_read_only',periodDiscovery:'provider_auto',
   countryBindings:bindings};
 // Replace only a projected data() result on one GET. Never update Firestore.
 const virtualDb={
   doc:path=>{
     const real=db.doc(path);
     if(path!==root)return real;
     return {get:async()=>{
       const current=await real.get();
       return {exists:current.exists,updateTime:current.updateTime,
         data:()=>({...current.data(),operationalSource:virtualSource})};
     }};
   },
   collection:db.collection.bind(db)
 };
 const scope={tenantId:'tya',projectId:'cinepolis'};
 const plan=await resolveExcelOriginalProjectPlan({db:virtualDb,scope});
 proof.plan={periods:plan.proof.periodCount,countryPeriodJobs:plan.proof.jobCount,
   countryCounts:Object.fromEntries(['GT','HN'].map(x=>[x,plan.bindings.filter(b=>b.scope.countryCode===x).length]))};
 if(plan.proof.periodCount!==19||plan.proof.jobCount!==38)
   fail('MAPPING_FAILURE:EXCEL_HISTORICAL_19X2_INCOMPLETE');
 const key=execFileSync('gcloud',['secrets','versions','access','1',
   '--secret=cxorbia-dev-b14-make-toolbox','--project','cxorbia-backend-dev'],
   {stdio:['ignore','pipe','ignore'],encoding:'utf8'}).trim();
 if(!key)fail('AUTH_FAILURE:B14_TOOLBOX_TOKEN_NOT_AVAILABLE');
 const url=new URL('https://eu2.make.com/mcp/server/98b29fbe-fbfe-42f2-aeae-e27998eb60c6');
 client=new Client({name:'cxorbia-f2-original-readonly',version:'1.0.0'});
 await client.connect(new StreamableHTTPClientTransport(url,
   {requestInit:{redirect:'error',headers:{Authorization:'Bearer '+key}}}));
 const list=await client.listTools();
 if(list.nextCursor||list.tools.length!==1||list.tools[0].annotations?.readOnlyHint!==true)
   fail('MAPPING_FAILURE:B14_ONLY_READ_TOOL_REQUIRED');
 const tool=list.tools[0];
 const columnMap=JSON.parse(fs.readFileSync('backend/contracts/tya-hr-column-map-r20-v1.json','utf8'));
 const registry=JSON.parse(fs.readFileSync('backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json','utf8'));
 const runScenario=async input=>{
   proof.excelReadCalls++;
   const reply=await client.callTool({name:tool.name,arguments:{...input,operation:'read'}},
     undefined,{timeout:90000});
   if(reply.isError)fail('PROVIDER_FAILURE:B14_GRAPH_READ_ERROR');
   let obj=reply.structuredContent;
   if(!obj){
     if(reply.content?.length!==1||reply.content[0].type!=='text')
       fail('PROVIDER_FAILURE:B14_OUTPUT_FORMAT');
     try{obj=JSON.parse(reply.content[0].text)}
     catch{fail('PROVIDER_FAILURE:B14_OUTPUT_JSON')}
   }
   if(Array.isArray(obj)&&obj.length===1)obj=obj[0];
   return obj?.outputs||obj?.output||obj;
 };
 const snapshot=await readExcelOriginalProjectSnapshot({db:virtualDb,plan,
   columnMap,cinemaRegistry,readBinding:b=>readExcelPeriodThroughMake({
     binding:b,columnMap,runScenario})});
 if(!snapshot.proof.independentlyVerified||snapshot.proof.hrWrites!==0
   ||snapshot.proof.unmatchedActive!==0)fail('MAPPING_FAILURE:SOURCE_SNAPSHOT_UNSAFE');
 proof.projection={revision:snapshot.proof.sourceRevision,periodReads:snapshot.proof.periodReads,
   visits:snapshot.proof.visits,matchedDurable:snapshot.proof.matchedDurable,
   unmatchedActive:snapshot.proof.unmatchedActive,
   countryVisitCounts:snapshot.snapshot.counts.byCountry,
   periods:snapshot.snapshot.periods.length};
 proof.decision='PASS_F2_FULL_ORIGINAL_EXCEL_PREVIEW_READONLY__NO_DEV_SWITCH';
}catch(e){
 proof.errorCode=/^(MAPPING_FAILURE|PROVIDER_FAILURE|AUTH_FAILURE|SOURCE_FAILURE|RELEASE_COMPOSITION_FAILURE):[A-Z0-9_]+$/.test(String(e?.message||''))?
     e.message:'ENVIRONMENT_FAILURE:F2_FULL_SOURCE_PREFLIGHT';
 process.exitCode=1;
}finally{
 await client?.close().catch(()=>{});
 fs.mkdirSync('.tmp/i3-f2-live-excel-source-preflight',{recursive:true});
 fs.writeFileSync(out,JSON.stringify(proof,null,2)+'\n');
 console.log('CXORBIA_F2_LIVE_PREFLIGHT='+JSON.stringify(proof));
}