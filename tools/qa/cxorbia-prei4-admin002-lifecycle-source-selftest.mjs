#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
const SOURCE=String(process.env.PREI4_002_SOURCE||'');
const TREE=String(process.env.PREI4_002_TREE||'');
const OUT=String(process.env.PREI4_002_SOURCE_OUT||'.tmp/prei4-admin-002-source');
const fail=m=>{throw new Error('PREI4_ADMIN_002_SOURCE_TEST:'+m);};
fs.mkdirSync(OUT,{recursive:true});
const preview=fs.readFileSync('app/core/tya-phase-a-source-safe-preview.js','utf8');
if(/id\s*:\s*`hr-post-/.test(preview))fail('HR_POST_SYNTHESIS_REMAINS');
if(!/const posts\s*=\s*\[\]/.test(preview))fail('HR_POSTS_NOT_EMPTY');
const model=fs.readFileSync('app/adapters/tya-cumulative-read-model-v2.js','utf8');
globalThis.window=globalThis;
vm.runInThisContext(model,{filename:'tya-cumulative-read-model-v2.js'});
const engine=globalThis.CX_TYA_CUMULATIVE_READ_MODEL;
if(!engine?.compose)fail('COMPOSER_MISSING');
const periodId='cinepolis-2026-09';
const visit=(id,shopperId,available)=>({id,visitId:id,hrRowId:'SEP!'+id.slice(1),periodId,projectId:'cinepolis',rootProjectId:'cinepolis',periodKey:'2026-09',pais:'GT',estado:available?'disponible':'asignada',shopperId:shopperId||null,canonicalFacets:{assigned:!!shopperId,available:!!available,scheduled:false,realized:false,questionnaire:false,submitted:false,outOfRange:false,cancelled:false}});
const hr={projects:[{id:periodId,projectId:'cinepolis',rootProjectId:'cinepolis',periodKey:'2026-09'}],visits:[visit('v1','sA',false),visit('v2','sB',false),visit('v3',null,true)],shoppers:[{id:'sA',shopperId:'sA',nombre:'A'},{id:'sB',shopperId:'sB',nombre:'B'}],posts:[],currentProjectId:'cinepolis',currentPeriodId:periodId,sourceRevision:'fixture-revision'};
const p=(id,visitId,shopperId,estado)=>({id,visitId,visitaId:visitId,shopperId,estado,status:estado,periodId,projectId:'cinepolis',rootProjectId:'cinepolis',source:'platform'});
const protectedPayload={postulations:[
  p('p-approved-stale','v1','sX','aprobada'),
  p('p-pending-stale','v2','sY','pendiente'),
  p('p-pending-valid','v3','sZ','pendiente'),
  p('p-approved-valid','v1','sA','aprobada')
],applications:[],visits:[],shoppers:[]};
const result=engine.compose({hr,protectedPayload});
const byId=new Map(result.posts.map(x=>[x.id,x]));
const checks={
  staleApprovedArchived:byId.get('p-approved-stale')?._archived===true&&byId.get('p-approved-stale')?.postulationLifecycleReason==='approved_owner_changed_in_live_hr',
  stalePendingArchived:byId.get('p-pending-stale')?._archived===true&&byId.get('p-pending-stale')?.postulationLifecycleReason==='pending_superseded_by_live_hr',
  validPendingActive:byId.get('p-pending-valid')?._archived!==true,
  validApprovedActive:byId.get('p-approved-valid')?._archived!==true,
  outputPosts:result.posts.length===4,
  archiveCount:Number(result.diagnostics?.lifecycleArchivedPosts)===2,
  pendingArchiveCount:Number(result.diagnostics?.lifecyclePendingSuperseded)===1,
  approvedArchiveCount:Number(result.diagnostics?.lifecycleApprovedOwnerChanged)===1
};
if(Object.values(checks).some(v=>v!==true))fail('LIFECYCLE_ASSERTION:'+JSON.stringify(checks));
const data=fs.readFileSync('app/core/data.js','utf8');
const admin=fs.readFileSync('app/modules/postulaciones.js','utf8');
const shopper=fs.readFileSync('app/modules/misvisitas.js','utf8');
if(!/posts\(\).*?_archived!==true/.test(data.replace(/\n/g,'')))fail('DATA_ACTIVE_ARCHIVE_FILTER_MISSING');
if(!/activePosts=.*?_archived!==true/.test(admin.replace(/\n/g,'')))fail('ADMIN_ACTIVE_ARCHIVE_FILTER_MISSING');
if(!/lifecycleOk=hist\|\|x\?\._archived!==true/.test(admin.replace(/\n/g,'')))fail('ADMIN_HISTORY_ARCHIVE_GATE_MISSING');
if(!/currentApps=.*?_archived!==true/.test(shopper.replace(/\n/g,'')))fail('SHOPPER_ACTIVE_ARCHIVE_FILTER_MISSING');
const receipt={decision:'PASS_PREI4_ADMIN_002_SOURCE_LIFECYCLE',sourceSha:SOURCE,sourceTree:TREE,checks,diagnostics:result.diagnostics,production:false,writes:0,deploys:0};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({decision:receipt.decision,checks,archived:result.diagnostics.lifecycleArchivedPosts},null,2));
