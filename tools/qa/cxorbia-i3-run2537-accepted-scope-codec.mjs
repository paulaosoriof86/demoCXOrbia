import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

// One already accepted legacy result, not a new permissive receipt schema.
// Pins bind the original bytes. Keep original operations, roles and absence
// of recorded context. Never fabricate current identity, HR revision or carry.
export const RUN2537_REFS=Object.freeze({
 mixed:Object.freeze({path:'docs/checkpoints/CXORBIA_I3_RUN2537_VERIFIED_EVIDENCE_20261115/full-human-acceptance/tenant-readonly/tenant-admin-config-branding-domain.json',gitBlob:'8acdf92761f3e4a81a681b79a9875530a9624e99',sha256:'9681cf23096887a29b3ed05dc3079b153109d27d45efd8cc1dd389493f96addf'}),
 country:Object.freeze({path:'docs/checkpoints/CXORBIA_I3_RUN2537_VERIFIED_EVIDENCE_20261115/full-human-acceptance/tenant-readonly/project-country-live-proof.json',gitBlob:'d4ea8fc64fc435bb95159757fbbd47b4b1aa2873',sha256:'8c90d50bf724a8456a5e89c42f27b839c6db4931cc326906bf3eb84686f45d17'}),
 contract:Object.freeze({path:'RECOVERY-I3-MODULE-TRUTH-MATRIX-20261115-V320.json',gitBlob:'0162e85a19dc7a2c393d8efb98b81f3d5432323c',sha256:'b7d2dcee6bb395b8210a974ad6008b5186dd6dd9496e08c83b01b6c91c9ce72f'})
});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const blob=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${Buffer.byteLength(b)}\0`),Buffer.from(b)])).digest('hex');
const requireProof=(value,code)=>{if(!value)throw Error('MAPPING_FAILURE:RUN2537_ACCEPTED_SCOPE_'+code);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>Object.hasOwn(o,k)).map(k=>[k,structuredClone(o[k])]));
const identityKeys=['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','runId','runAttempt'];
const owners=['app/modules/configuracion.js','app/modules/administrabilidad.js','app/modules/marca.js'];
const checks=['config:centro','config:marca','config:plan','config:paises','config:listas','config:nda','administrabilidad','marca'];
const contractHash='df7951c9ad6baabcf948d19ab94269da82c68043bf5d98e491c36577828ad878';
const acceptanceHash='35fc1d3436b818d2479d30592eeb2356f7d6a0e719f60e5aefca49e0870928d0';
const proofRef=(ref,jsonPointer)=>({...ref,jsonPointer});
export const readRun2537Immutable=ref=>execFileSync('git',['cat-file','blob',ref.gitBlob],{maxBuffer:16*1024*1024});

export function normalizeRun2537AcceptedScopes({readImmutable=readRun2537Immutable,readSourceBytes,task,currentSourceSha}={}){
 requireProof(task?.taskId==='E05'&&task.acceptanceBindingSha256===acceptanceHash&&hash(JSON.stringify(canonical(task.frozenAuthority)))===acceptanceHash,'FROZEN_E05_ACCEPTANCE');
 const loaded={};
 for(const [name,ref] of Object.entries(RUN2537_REFS)){
  const bytes=Buffer.from(readImmutable(ref));
  requireProof(blob(bytes)===ref.gitBlob&&hash(bytes)===ref.sha256,'IMMUTABLE_'+name.toUpperCase());
  loaded[name]=JSON.parse(bytes.toString('utf8'));
 }
 const r=loaded.mixed[0],country=loaded.country,originalMod=loaded.contract.modules.find(x=>x.domain==='tenant-admin-config-branding');
 requireProof(Array.isArray(loaded.mixed)&&loaded.mixed.length===2,'ORIGINAL_INVENTORY');
 requireProof(r.schemaVersion==='cxorbia.i3.owner-domain-mixed-receipt.v1'&&r.operationKind==='MUTATION'&&r.decision==='PASS_I3_TENANT_ADMIN_CONFIG_BRANDING_COMPLETE_CONTRACT','ORIGINAL_DECISION');
 requireProof(r.sourceSha==='90c45452a6bba0d2498c3cf792aa21c49219f0ac'&&r.runId==='43772983839'&&r.runAttempt==='1'&&r.production===false,'ORIGINAL_IDENTITY');
 requireProof(same(r.ownerPaths,owners)&&r.findingIds.includes('VRM-194')&&r.findingIds.includes('VRM-330'),'ORIGINAL_OWNER_SCOPE');
 requireProof(hash(String(originalMod?.contract||''))===contractHash&&r.contractAuthority.contractSha256===contractHash&&r.contractAuthority.gitBlob===RUN2537_REFS.contract.gitBlob,'ORIGINAL_CONTRACT');
 requireProof(r.auth.authenticated===true&&r.auth.role==='super'&&r.auth.tenantExact===true&&r.auth.projectAuthorized===true&&r.auth.samePrincipalAfterReload===true,'AUTH');
 const view=r.readOnlyProof;
 requireProof(view.canonicalTenantAuthority===true&&view.protectedRuntime===true&&view.localStorageTruth===false&&view.commandWritesEnabled===true,'VIEW_AUTHORITY');
 for(const key of ['checksBeforeReload','checksAfterReload'])requireProof(view[key].length===checks.length&&checks.every(id=>view[key].filter(x=>x.id===id&&x.ok===true).length===1),'EIGHT_VIEWS_'+key);
 requireProof(view.configurationProjectionUnchanged===true&&view.relevantLocalStorageKeysUnchanged===true&&view.configurationMutationRequestsObserved===0&&view.countryMutationTested===false,'VIEW_SCOPE');
 // The actual page observed automatic HR reconciliation. Retain it; do not
 // invent global zero-write counts to fit the newer non-writing schema.
 requireProof(view.mutations.length===1&&view.mutations[0].classification==='AUTHORIZED_HR_RECONCILIATION_NOT_CONFIGURATION_WRITE','OBSERVED_HR_ACTIVITY');
 requireProof(country.decision==='PASS_I3_PROJECT_COUNTRY_UI_PROVIDER_RELOAD_REPLAY_CLEANUP'&&identityKeys.every(k=>country[k]===r[k]),'COUNTRY_IDENTITY');
 for(const k of ['syntheticOnly','actionReal','providerAck','durableReadback','reloadProof','noDuplicateRegression','cleanupVerified','samePrincipal','commercialProjectUnchanged','returnedToCommercialProject'])requireProof(country[k]===true,'COUNTRY_'+k);
 requireProof(country.production===false&&country.hrWrites===0&&country.authWrites===0&&country.paymentWrites===0,'COUNTRY_BOUNDARIES');
 requireProof(country.steps.length===2&&same(country.steps.map(x=>x.label),['add-country','remove-country']),'COUNTRY_STEPS');
 const before=country.cleanup.before;
 requireProof(country.cleanup.decision==='PASS_OWNED_FIXTURE_CLEANUP'&&country.cleanup.remaining===0&&country.cleanup.deleted===before.length,'COUNTRY_CLEANUP');
 const project=before.find(x=>x.path===`tenants/tya/projects/${country.projectId}`);
 requireProof(project?.data?.tenantId==='tya'&&project.data.periodId===country.periodId&&project.data.qaOnly===true,'SYNTHETIC_PROJECT');
 const steps=country.steps.map((s,i)=>{
  for(const k of ['uiAction','providerAck','durableReadback','pageReload','idempotentReplay'])requireProof(s[k]===true,`STEP_${i}_${k}`);
  requireProof(s.providerWritesOnReplay===0,'STEP_ZERO_REPLAY_WRITES');
  const ack=before.filter(x=>x.path.startsWith('tenants/tya/commandReceipts/')&&x.data.commandDigest===s.commandDigest);
  requireProof(ack.length===1&&ack[0].data.status==='committed'&&ack[0].data.providerAck===true&&ack[0].data.projectId===country.projectId&&ack[0].data.periodId===country.periodId,'STEP_REMOTE_RECEIPT');
  const audits=before.filter(x=>x.path.startsWith('tenants/tya/entityAuditTrail/')&&x.data.entityId===country.projectId&&x.data.commandType===ack[0].data.commandType&&x.data.actorUid===ack[0].data.actorUid&&x.data.createdAt===ack[0].data.updatedAt);
  requireProof(audits.length===1&&audits[0].data.actorRole===r.auth.role&&!!audits[0].data.idempotencyKey,'STEP_IDEMPOTENCY_AUDIT');
  return {...structuredClone(s),remoteReceiptId:ack[0].path,idempotencyKey:audits[0].data.idempotencyKey,evidence:proofRef(RUN2537_REFS.country,`/steps/${i}`),remoteAckEvidence:proofRef(RUN2537_REFS.country,`/cleanup/before/${before.indexOf(ack[0])}`),auditEvidence:proofRef(RUN2537_REFS.country,`/cleanup/before/${before.indexOf(audits[0])}`)};
 });
 const dependencyBytes=r.ownerEvidence.map(old=>{
  requireProof(old.byteParity===true&&old.sourceSha256===old.servedSha256,'ORIGINAL_BYTE_PARITY');
  if(readSourceBytes){const original=Buffer.from(readSourceBytes(r.sourceSha,old.path));requireProof(blob(original)===old.gitBlob&&hash(original)===old.sourceSha256,'ORIGINAL_SOURCE_BYTES');}
  const entry={path:old.path,kind:owners.includes(old.path)?'OWNER':'DEPENDENCY',acceptedGitBlob:old.gitBlob,acceptedSha256:old.sourceSha256,acceptedServedSha256:old.servedSha256};
  if(currentSourceSha&&readSourceBytes){const now=Buffer.from(readSourceBytes(currentSourceSha,old.path));entry.currentSourceSha=currentSourceSha;entry.currentGitBlob=blob(now);entry.currentSha256=hash(now);entry.byteUnchanged=entry.currentGitBlob===old.gitBlob;}
  return entry;
 });
 const obligationIds=r.contractCoverage.obligations.map(o=>o.id);
 requireProof(same(obligationIds,['approved-config-admin-brand-views-before-and-after-reload','actual-add-remove-country-ui-currency-ack-readback','same-principal-reload-idempotence-cleanup']),'ORIGINAL_OBLIGATIONS');
 const scopes=[
  {id:obligationIds[0],operationKind:'READ_ONLY',operationMeaning:'READING_EIGHT_APPROVED_SURFACES_ONLY_NOT_THE_ENTIRE_RUN',role:r.auth.role,originalScope:r.scope,recordedContext:{periodId:'NOT_RECORDED_IN_VIEW_RECEIPT',tenantProjectObservation:structuredClone(view.mutations[0])},owners:[...r.ownerPaths],auth:structuredClone(r.auth),readOnlyProof:structuredClone(view),projectCountryProviderBranchPresent:true,evidence:proofRef(RUN2537_REFS.mixed,'/0/readOnlyProof'),observed:true},
  {id:obligationIds[1],operationKind:'PROVIDER_WRITE',role:r.auth.role,scope:{tenantId:project.data.tenantId,projectId:country.projectId,periodId:country.periodId},scopeEvidence:proofRef(RUN2537_REFS.country,`/cleanup/before/${before.indexOf(project)}/data`),owners:['app/modules/configuracion.js'],steps,evidence:proofRef(RUN2537_REFS.country,'/steps'),observed:true},
  {id:obligationIds[2],operationKind:'PROVIDER_WRITE',role:r.auth.role,scope:{tenantId:project.data.tenantId,projectId:country.projectId,periodId:country.periodId},owners:['app/modules/configuracion.js'],samePrincipal:country.samePrincipal,reloadProof:country.reloadProof,noDuplicateRegression:country.noDuplicateRegression,providerWritesOnReplay:steps.map(s=>s.providerWritesOnReplay),cleanup:pick(country.cleanup,['decision','deleted','remaining']),commercialProjectUnchanged:country.commercialProjectUnchanged,evidence:proofRef(RUN2537_REFS.country,'/cleanup'),observed:true}
 ];
 return {schemaVersion:'cxorbia.i3.immutable-accepted-scope-codec.v1',kind:'RUN2537_E05_ACCEPTED_HISTORY',state:'ACCEPTED_SCOPES_PRESERVED_CURRENT_CARRY_REQUIRED',taskId:'E05',acceptanceBindingSha256:acceptanceHash,originalAcceptance:task.frozenAuthority.acceptance,originalIdentity:pick(r,identityKeys),originalOperationKind:r.operationKind,originalDecision:r.decision,originalContract:structuredClone(r.contractAuthority),inputEvidence:RUN2537_REFS,preservedFindingIds:[...r.findingIds],scopedObligations:scopes,ownerAndDependencyBytes:dependencyBytes,changedDependencyPaths:dependencyBytes.filter(x=>x.kind==='DEPENDENCY'&&x.byteUnchanged===false).map(x=>x.path),changedOwnerPaths:dependencyBytes.filter(x=>x.kind==='OWNER'&&x.byteUnchanged===false).map(x=>x.path),currentReadbackRequiredForChangedScopes:true,carryForward:null,terminalOwnerReceipts:[],completeTaskInventory:false,fullTaskPass:false,newFunctionalPasses:0,production:false,semantics:'Mechanical decoding of already accepted bytes. No new run, no missing value inferred, no READ_ONLY relabeling of the provider-write run, no unchanged-dependency assertion. Current carry must be bound separately to the same candidate.'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [,,matrixPath,outPath]=process.argv;
 if(!matrixPath||!outPath||path.resolve(matrixPath)===path.resolve(outPath))throw Error('ENVIRONMENT_FAILURE:RUN2537_SEPARATE_MATRIX_AND_OUTPUT_REQUIRED');
 const contracts=JSON.parse(fs.readFileSync('docs/checkpoints/CXORBIA_I3_FROZEN_FUNCTIONAL_TASK_CONTRACTS_20261125.json','utf8'));
 const matrix=JSON.parse(fs.readFileSync(matrixPath,'utf8'));
 const result=normalizeRun2537AcceptedScopes({task:contracts.tasks.find(t=>t.taskId==='E05'),currentSourceSha:matrix.productSource.sha,readSourceBytes:(source,p)=>execFileSync('git',['show',`${source}:${p}`],{maxBuffer:4*1024*1024})});
 fs.writeFileSync(outPath,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({state:result.state,scopedObligations:result.scopedObligations.length,changedOwners:result.changedOwnerPaths,changedDependencies:result.changedDependencyPaths,newFunctionalPasses:0,production:false,outPath}));
}
