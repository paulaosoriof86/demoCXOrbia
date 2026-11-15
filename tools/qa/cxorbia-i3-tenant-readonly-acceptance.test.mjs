import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateTenantReadonlyReceipt,configurationRequestEvidence,CONTRACT_SHA,DOMAIN} from './cxorbia-i3-tenant-readonly-acceptance.mjs';
const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const mod=JSON.parse(fs.readFileSync(descriptor.moduleTruthPath,'utf8')).modules.find(x=>x.domain===DOMAIN);
export function validReadonlyReceipt(){
  const paths=[...mod.owners,'app/core/config.js','app/core/backend-protected-dev-mode.js','app/core/backend-browser-auth.js','app/config/runtime.js','app/adapters/tya-c6-unified-human-runtime-v1.js'];
  const checks=['config:centro','config:marca','config:plan','config:paises','config:listas','config:nda','administrabilidad','marca'].map(id=>({id,ok:true}));
  return {moduleDomain:DOMAIN,operationKind:'READ_ONLY',decision:'PASS_I3_TENANT_ADMIN_CONFIG_BRANDING_READONLY',findingIds:['VRM-194','VRM-330'],production:false,hrIndependent:true,
    contractAuthority:{contractSha256:CONTRACT_SHA},ownerPaths:mod.owners,
    ownerEvidence:paths.map(path=>({path,gitBlob:mod.currentOwnerBlobs[path],byteParity:true,sourceSha256:'a'.repeat(64),servedSha256:'a'.repeat(64)})),
    mutationEvidence:{applicable:false,providerAckClaimed:false},auth:{authenticated:true,tenantExact:true,projectAuthorized:true,samePrincipalAfterReload:true},
    humanAcceptance:{mode:'PRESERVED_PRIOR_SCOPE_NO_NEW_DESIGN_CHANGE'},
    readOnlyProof:{canonicalTenantAuthority:true,protectedRuntime:true,localStorageTruth:false,commandWritesEnabled:false,
      checksBeforeReload:structuredClone(checks),checksAfterReload:structuredClone(checks),configurationProjectionUnchanged:true,relevantLocalStorageKeysUnchanged:true,configurationMutationRequestsObserved:0}};
}
test('approved readonly evidence uses no fabricated mutation ACK',()=>assert.equal(validateTenantReadonlyReceipt(validReadonlyReceipt(),mod).pass,true));
for(const [name,mutate] of [
  ['different contract',r=>r.contractAuthority.contractSha256='b'.repeat(64)],
  ['missing owner',r=>r.ownerEvidence.pop()],
  ['different owner bytes',r=>r.ownerEvidence[0].servedSha256='b'.repeat(64)],
  ['only navigation, no reload',r=>r.readOnlyProof.checksAfterReload=[]],
  ['missing route',r=>r.readOnlyProof.checksBeforeReload.pop()],
  ['demo control found',r=>r.readOnlyProof.checksBeforeReload[1].ok=false],
  ['changed local authority',r=>r.readOnlyProof.relevantLocalStorageKeysUnchanged=false],
  ['a real mutation',r=>r.readOnlyProof.configurationMutationRequestsObserved=1],
  ['fake provider ACK',r=>r.providerAck=true],
  ['real write branch cannot be called readonly',r=>r.readOnlyProof.commandWritesEnabled=true],
  ['changed principal',r=>r.auth.samePrincipalAfterReload=false]
])test('readonly rejects '+name,()=>{const r=validReadonlyReceipt();mutate(r);assert.equal(validateTenantReadonlyReceipt(r,mod).pass,false);});
test('only the exact authorized automatic HR reconciliation is separated from configuration mutations',()=>{
  const r={method:'POST',url:'https://example.invalid/v1/cxorbia/commands',tenantId:'t',projectId:'p',hrRevision:'a'.repeat(64),body:{commandType:'hr.snapshot.reconcile',entityType:'hrSnapshot',periodId:null,requirePeriod:false,payload:{},tenantId:'t',projectId:'p',entityId:'a'.repeat(64),expectedVersion:'a'.repeat(64),source:'hr-source-authorized-auto-reconciliation'}};
  assert.equal(configurationRequestEvidence(r).classification,'AUTHORIZED_HR_RECONCILIATION_NOT_CONFIGURATION_WRITE');
  for(const mutate of [v=>v.body.commandType='project.update',v=>v.body.projectId='other',v=>v.body.tenantId='other',v=>v.body.entityId='b'.repeat(64),v=>v.body.expectedVersion='b'.repeat(64),v=>delete v.body.source,v=>v.body=null,v=>v.method='PATCH',v=>v.url='https://example.invalid/api/tenants/t/users',v=>v.body.payload={country:'HN'},v=>v.body.periodId='commercial',v=>v.body.entityType='project']){
    const v=structuredClone(r);mutate(v);assert.equal(configurationRequestEvidence(v).classification,'CONFIGURATION_OR_UNCLASSIFIED_MUTATION');
  }
});
