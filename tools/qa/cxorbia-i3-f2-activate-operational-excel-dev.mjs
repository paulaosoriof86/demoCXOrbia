/* I3/F2 exact DEV-only project selector activation.
 * A country's period workbook is independent of every other period.
 * Mutates only the scoped DEV project operationalSource after remote
 * Cloud Run + Hosting identity checks. No HR/Google/visit/auth writes.
 */
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {applicationDefault,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {resolveExcelOriginalProjectPlan} from '../../backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs';

const str=x=>String(x??'').trim();
const fail=code=>{throw Error(code)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const out='.tmp/i3-f2-operational-dev/receipt.json';
const projectId='cinepolis',tenantId='tya',project='cxorbia-backend-dev';
const host='https://cxorbia-backend-dev.web.app';
const expectedRuntime='cxorbia-live-hr-dev-00383-dl6';
const expectedDigest='sha256:436ab2b32141bc98e5b24c2aa7024d5d53d02b17b51b1da504d2a1e8300248e8';
const expectedHosting='sites/cxorbia-backend-dev/versions/b2c3e6be97c92c62';
const expectedSource='7db39f1688eae61ab288f6ac7f8bcaff55df3bcf';
const expectedTree='2bd564ca98a271c35331f021d048e140723e85aa';
const report={schemaVersion:'cxorbia.i3.f2.original-excel-live-selector-dev.v1',
  iteration:'I3',decision:'HOLD',environment:project,tenantId,projectId,
  periodIndependence:'NO_CROSS_PERIOD_RECONCILIATION',
  beforeProvider:null,afterProvider:null,configWrites:0,rollbackWrites:0,
  hrOriginalWrites:0,googleMirrorWrites:0,visitWrites:0,authWrites:0,
  production:false,i4Authorized:false,sourceSha:expectedSource,
  runtimeRevision:null,hostingVersion:null,periodJobs:0};
let db,ref,oldSource,excelSource,switchStamp,changed=false;
const gcloud=(...args)=>execFileSync('gcloud',args,{stdio:['ignore','pipe','ignore'],encoding:'utf8',timeout:60000}).trim();
const time=s=>String(s?.updateTime?.seconds||'')+':'+String(s?.updateTime?.nanoseconds||'');
try{
 fs.mkdirSync('.tmp/i3-f2-operational-dev',{recursive:true});
 if(process.env.CXORBIA_F2_DEV_OPERATIONAL_SWITCH_GATE!=='PAULA_I3_F2_EXCEL_ORIGINAL_DEV_ONLY_20261123'||
    process.env.GITHUB_REF!=='refs/heads/recovery/cxorbia-phase-a-20260831'||
    process.env.GITHUB_REPOSITORY!=='paulaosoriof86/demoCXOrbia')fail('AUTH_FAILURE:F2_DEV_SELECTOR_GATE');
 const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
 if(descriptor.productSourceSha!==expectedSource||descriptor.productTreeAuthority!==expectedTree||
    descriptor.production!=='DO_NOT_TOUCH'||descriptor.i4Authorized!==false||
    descriptor.pendingDevSuccessor?.sourceSha!==expectedSource)fail('RELEASE_COMPOSITION_FAILURE:F2_SELECTOR_SOURCE');
 if(execFileSync('git',['rev-parse',expectedSource+'^{tree}'],{encoding:'utf8'}).trim()!==expectedTree)
   fail('RELEASE_COMPOSITION_FAILURE:F2_SELECTOR_SOURCE_TREE');
 const service=JSON.parse(gcloud('run','services','describe','cxorbia-live-hr-dev','--project',project,
    '--region','us-central1','--format=json'));
 if(service.status?.latestReadyRevisionName!==expectedRuntime||
    service.status?.traffic?.filter(v=>v.revisionName===expectedRuntime&&v.percent===100).length!==1)
   fail('RELEASE_COMPOSITION_FAILURE:F2_DEV_RUNTIME_DRIFT');
 const revision=JSON.parse(gcloud('run','revisions','describe',expectedRuntime,
   '--project',project,'--region','us-central1','--format=json'));
 const container=revision.spec?.containers?.[0]||{};
 const names=new Map((container.env||[]).map(e=>[e.name,e]));
 if(names.get('CXORBIA_RECOVERY_SOURCE_SHA')?.value!==expectedSource)
   fail('RELEASE_COMPOSITION_FAILURE:F2_DEV_RUNTIME_SOURCE_MISMATCH');
 if(!['sha256:'+str(revision.status?.imageDigest).split('sha256:').at(-1),
       str(revision.status?.imageDigest)].includes(expectedDigest))
   fail('RELEASE_COMPOSITION_FAILURE:F2_DEV_RUNTIME_DIGEST_MISMATCH');
 if(!names.has('CXORBIA_B14_MAKE_TOOLBOX_TOKEN')||!names.has('CXORBIA_B14_MAKE_TOOLBOX_URL'))
   fail('AUTH_FAILURE:F2_DEV_TOOLBOX_ENV_MISSING');
 report.runtimeRevision=expectedRuntime;report.runtimeDigest=expectedDigest;
 const token=gcloud('auth','print-access-token');
 const hosted=await fetch('https://firebasehosting.googleapis.com/v1beta1/sites/cxorbia-backend-dev/channels/live',
   {headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(45000)});
 if(!hosted.ok)fail('PROVIDER_FAILURE:F2_HOSTING_INVENTORY');
 const hosting=await hosted.json();
 if(hosting.release?.version?.name!==expectedHosting)
   fail('RELEASE_COMPOSITION_FAILURE:F2_DEV_HOSTING_DRIFT');
 report.hostingVersion=expectedHosting;
 const app=initializeApp({credential:applicationDefault(),projectId:project});
 db=getFirestore(app);ref=db.doc('tenants/'+tenantId+'/projects/'+projectId);
 const projectSnap=await ref.get(),raw=projectSnap.data()||{};
 if(!projectSnap.exists||raw.tenantId!==tenantId||
    (raw.projectId&&raw.projectId!==projectId))fail('MAPPING_FAILURE:F2_PROJECT_SCOPE');
 oldSource=raw.operationalSource||raw.routeSource||{};
 report.beforeProvider=str(oldSource.providerType);
 let bindingIds=[];
 if(oldSource.providerType==='excel_online'){
   excelSource=oldSource;
 }else{
   if(oldSource.mode!=='external'||oldSource.providerType!=='google_sheets'||
     oldSource.readPolicy!=='external_live'||oldSource.writePolicy!=='external_read_only')
     fail('MAPPING_FAILURE:F2_PREVIOUS_SELECTOR_UNEXPECTED');
   const oldId=str(oldSource.providerBindingId||oldSource.integrationSettingId||oldSource.providerRef);
   if(!oldId)fail('MAPPING_FAILURE:F2_PREVIOUS_REFERENCE');
   const previous=await db.doc('tenants/'+tenantId+'/integrationSettings/'+oldId).get();
   const mirror=previous.data()||{};
   if(!previous.exists||mirror.tenantId!==tenantId||mirror.projectId!==projectId||
      !Array.isArray(mirror.originalReadbackBindings)||mirror.originalReadbackBindings.length!==2)
     fail('MAPPING_FAILURE:F2_ORIGINAL_BINDINGS_UNVERIFIED');
   const countryBindings=mirror.originalReadbackBindings;
   const countries=[...(raw.countries||[])].sort();
   if(countries.length!==2||countryBindings.map(x=>str(x.countryCode)).sort().join('|')!==countries.join('|'))
     fail('MAPPING_FAILURE:F2_COUNTRY_PROJECT_SCOPE');
   excelSource={mode:'external',authority:'external_source',providerType:'excel_online',
     readPolicy:'external_live',writePolicy:'external_read_only',
     periodDiscovery:'provider_auto',countryBindings};
   bindingIds=countryBindings.map(x=>x.providerBindingId);
   const proofs=await Promise.all(bindingIds.map(x=>db.doc('tenants/'+tenantId+'/integrationSettings/'+x).get()));
   if(proofs.some(x=>!x.exists||x.data()?.providerType!=='excel_online'||x.data()?.hrWritesEnabled!==false||
     x.data()?.enabled!==true))fail('MAPPING_FAILURE:F2_COUNTRY_BINDINGS_NOT_READY');
   const virtualDb={collection:db.collection.bind(db),doc:path=>{
     const actual=db.doc(path);
     if(path!=='tenants/'+tenantId+'/projects/'+projectId)return actual;
     return {get:async()=>({exists:true,updateTime:projectSnap.updateTime,
       data:()=>({...raw,operationalSource:excelSource})})};
   }};
   const preview=await resolveExcelOriginalProjectPlan({db:virtualDb,scope:{tenantId,projectId}});
   if(preview.proof.providerType!=='excel_online'||preview.proof.jobCount<38||
      preview.proof.periodCount<19||preview.proof.hrWrites!==false)
     fail('MAPPING_FAILURE:F2_EXCEL_PROVIDER_PLAN_SHORT');
   report.periodJobs=preview.proof.jobCount;
   const result=await db.runTransaction(async tx=>{
     const current=await tx.get(ref),v=current.data()||{},selected=v.operationalSource||v.routeSource||{};
     if(!current.exists||time(current)!==time(projectSnap)||!same(selected,oldSource))
       fail('MAPPING_FAILURE:F2_SELECTOR_CHANGED_BEFORE_TX');
     tx.update(ref,{operationalSource:excelSource});
     return 'UPDATED';
   });
   if(result!=='UPDATED')fail('PERSISTENCE_FAILURE:F2_SELECTOR_NOT_ACKED');
   changed=true;report.configWrites=1;
   const once=await ref.get();switchStamp=time(once);
   if(!same(once.data()?.operationalSource,excelSource))fail('PERSISTENCE_FAILURE:F2_SELECTOR_READBACK_MISMATCH');
 }
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId,projectId}});
 if(plan.proof.jobCount<38||plan.proof.providerType!=='excel_online')
   fail('PERSISTENCE_FAILURE:F2_LIVE_PROJECT_PLAN');
 report.periodJobs=plan.proof.jobCount;
 report.bindingFingerprint=plan.proof.bindingFingerprint;
 let meta=null;
 for(let attempt=0;attempt<2;attempt++){
   try{
     const request=await fetch(host+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&fresh=1&f2selector='+process.env.GITHUB_RUN_ID,
       {headers:{'Cache-Control':'no-store'},signal:AbortSignal.timeout(210000)});
     if(!request.ok)throw Error('PROVIDER_FAILURE:F2_RUNTIME_HTTP');
     const result=await request.json();
     if(result.ok!==true||result.sourceAccessMode!=='make_graph_delegated'||
       result.projectReadBinding?.providerType!=='excel_online'||
       result.providerReadStats?.excelOnlineOriginal?.periodReads!==plan.proof.jobCount||
       !/^[a-f0-9]{64}$/.test(str(result.revision)))
       throw Error('MAPPING_FAILURE:F2_RUNTIME_ORIGINAL_SOURCE_NOT_APPLIED');
     meta=result;break;
   }catch(e){if(attempt===1)throw e;}
 }
 if(!meta)fail('PROVIDER_FAILURE:F2_RUNTIME_NO_READBACK');
 report.afterProvider='excel_online';
 report.sourceRevision=meta.projectReadBinding.sourceRevision||null;
 report.runtimeRevisionFromMeta=meta.projectReadBinding.providerType;
 report.hrRevision=meta.revision;report.readbackPeriodJobs=meta.providerReadStats.excelOnlineOriginal.periodReads;
 report.decision='PASS_F2_ORIGINAL_EXCEL_OPERATIONAL_DEV_REMOTE_READBACK__NOT_TERMINAL_I3_GO';
 report.sourceSwitch=true;report.configReadbackVerified=true;report.production=false;
}catch(error){
 const msg=str(error?.message);
 report.errorCode=/^(?:AUTH_FAILURE|RELEASE_COMPOSITION_FAILURE|MAPPING_FAILURE|PERSISTENCE_FAILURE|PROVIDER_FAILURE):[A-Z0-9_]+$/.test(msg)
   ?msg:'ENVIRONMENT_FAILURE:F2_DEV_OPERATIONAL_SELECTOR';
 if(changed&&db&&ref&&excelSource&&oldSource){
   try{
     const reverted=await db.runTransaction(async tx=>{
       const now=await tx.get(ref);
       if(!now.exists||time(now)!==switchStamp||!same(now.data()?.operationalSource,excelSource))
         return false;
       tx.update(ref,{operationalSource:oldSource});
       return true;
     });
     report.rollbackWrites=reverted?1:0;
     report.safeRollbackVerified=reverted?(await ref.get()).data()?.operationalSource?.providerType===oldSource.providerType:false;
   }catch{report.safeRollbackVerified=false;}
 }
 process.exitCode=1;
}finally{
 fs.mkdirSync('.tmp/i3-f2-operational-dev',{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('CXORBIA_I3_F2_OPERATIONAL_SOURCE_DEV='+JSON.stringify(report));
}
