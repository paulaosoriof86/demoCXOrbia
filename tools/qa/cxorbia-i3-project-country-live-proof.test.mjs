import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {digest,projectIdFor,projectCommandPaths,validateCountryReadback,composeTenantCountryReceipts} from './cxorbia-i3-project-country-live-proof.mjs';
import {validReadonlyReceipt} from './cxorbia-i3-tenant-readonly-acceptance.test.mjs';
const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const mod=JSON.parse(fs.readFileSync(descriptor.moduleTruthPath,'utf8')).modules.find(x=>x.domain==='tenant-admin-config-branding');
function fixture(){
  const scope={projectId:'p',tenantId:'t',periodId:'qa-period',name:'I3 QA',runId:'123',staffUid:'staff'};
  const command={commandType:'project.update',idempotencyKey:'own-command',tenantId:'t',projectId:'p',periodId:'qa-period',payload:{periodId:'qa-period',countries:['GT','HN'],currency:{GT:'Q',HN:'L'}}};
  const record={id:'p',projectId:'p',tenantId:'t',periodId:'qa-period',name:'I3 QA',qaOnly:true,qaRunId:'123',createdBy:'staff',version:2,countries:['GT','HN'],currency:{GT:'Q',HN:'L'},operationalSource:{mode:'internal',writePolicy:'platform_only'}};
  const ack={ok:true,status:'committed',tenantId:'t',periodId:'qa-period',committed:true,providerAck:true,successUiAllowed:true,readbackVerified:true,commandType:'project.update',idempotencyKey:'own-command',projectId:'p',entityVersion:2};
  const receipt={status:'committed',providerAck:true,commandDigest:digest(command),projectId:'p',periodId:'qa-period',commandType:'project.update',actorUid:'staff',entityVersion:2};
  const audit={tenantId:'t',projectId:'p',entityType:'project',periodId:'qa-period',entityId:'p',commandType:'project.update',actorUid:'staff',idempotencyKey:'own-command'};
  return {scope,command,record,ack,receipt,audit};
}
test('project identity, command paths and stable digest match the provider contract',()=>{
  assert.equal(projectIdFor('t','  I3 QA Países  '),projectIdFor('t','i3 qa paises'));
  assert.notEqual(projectIdFor('t','I3 QA'),projectIdFor('other','I3 QA'));
  const f=fixture(),p=projectCommandPaths('t',f.command);
  assert.equal(p.receipt,'tenants/t/commandReceipts/'+digest('t\0own-command').slice(0,40));
  assert.equal(p.audit,'tenants/t/entityAuditTrail/project-'+digest('own-command').slice(0,32));
  assert.equal(digest({b:2,a:1}),digest({a:1,b:2}));
});
test('real ACK needs exact independent project, receipt and audit ownership',()=>assert.equal(validateCountryReadback(fixture()).pass,true));
for(const [name,mutate] of [
  ['fake ACK',f=>f.ack.providerAck=false],['foreign tenant',f=>f.command.tenantId='other'],
  ['foreign project',f=>f.record.id='other'],['unowned fixture',f=>f.record.qaOnly=false],
  ['other run',f=>f.record.qaRunId='999'],['wrong actor',f=>f.record.createdBy='other'],
  ['commercial period',f=>f.command.payload.periodId='commercial'],['external source',f=>f.record.operationalSource.mode='external'],
  ['newer foreign version',f=>f.record.version=3],['wrong command digest',f=>f.receipt.commandDigest='bad'],
  ['receipt absent',f=>f.receipt=null],['audit foreign actor',f=>f.audit.actorUid='other'],
  ['missing country',f=>f.record.countries=['GT']],['missing currency',f=>delete f.record.currency.HN]
])test('rejects '+name,()=>{const f=fixture();mutate(f);assert.equal(validateCountryReadback(f).pass,false);});
function composite(){
  const readonly=validReadonlyReceipt();readonly.readOnlyProof.commandWritesEnabled=true;
  const identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),runtimeRevision:'runtime',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'hosting'};
  Object.assign(readonly,identity);
  return {readonly,country:{...identity,decision:'PASS_I3_PROJECT_COUNTRY_UI_PROVIDER_RELOAD_REPLAY_CLEANUP',actionReal:true,providerAck:true,durableReadback:true,reloadProof:true,noDuplicateRegression:true,cleanupVerified:true,samePrincipal:true,commercialProjectUnchanged:true}};
}
test('domain proof combines readonly obligations and actual provider mutation without pretending the write branch is readonly',()=>{
  const f=composite(),receipts=composeTenantCountryReceipts(f.readonly,f.country,mod);
  assert.equal(receipts[0].operationKind,'MUTATION');assert.equal(receipts[0].validation.pass,true);
  assert.deepEqual(receipts[1].findingIds,['VRM-335']);assert.deepEqual(receipts[1].ownerPaths,['app/modules/configuracion.js']);
  assert.equal(f.readonly.operationKind,'READ_ONLY');assert.equal(f.readonly.readOnlyProof.commandWritesEnabled,true);
});
for(const key of ['actionReal','providerAck','durableReadback','reloadProof','noDuplicateRegression','cleanupVerified','samePrincipal','commercialProjectUnchanged'])test('no domain promotion without '+key,()=>{
  const f=composite();f.country[key]=false;assert.equal(composeTenantCountryReceipts(f.readonly,f.country,mod)[0].validation.pass,false);
});
test('unknown navigation writes, wrong source and incomplete readonly evidence still block the composed proof',()=>{
  for(const mutate of [f=>f.readonly.readOnlyProof.configurationMutationRequestsObserved=1,f=>f.country.sourceSha='d'.repeat(40),f=>f.readonly.readOnlyProof.checksAfterReload.pop()]){
    const f=composite();mutate(f);assert.equal(composeTenantCountryReceipts(f.readonly,f.country,mod)[0].validation.pass,false);
  }
});
