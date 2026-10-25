#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
globalThis.CX={};
const provider=require(path.join(root,'app/adapters/cxorbia-provider-identity-link-runtime-v1.js'));
const canonical=require(path.join(root,'app/adapters/cxorbia-identity-roll-forward-v1.js'));

const ctx={tenantId:'tya',projectIds:['cinepolis']};
const base={
  id:'irl_fixture',tenantId:'tya',projectId:'cinepolis',projectScope:'cinepolis',sourceSystem:'hr',
  sourceIdentityKey:'shp-fixture',canonicalShopperId:'TYA_FIXTURE',authorityType:'tenant_adjudication',
  authorityRef:'fixture-authority',periodIndependent:true,sourceSafe:true
};
const accepted=['active','confirmed','approved','materialized'];
for(const status of accepted){
  const link={...base,status};
  assert.equal(canonical.normalizeLink(link).ok,true,`canonical must accept ${status}`);
  assert.equal(provider.canonicalApplicable(link,ctx),true,`provider fallback must accept ${status}`);
  assert.equal(provider.applicable(link,ctx),true,`provider runtime must accept ${status}`);
}

const target={...base,id:'irl_3ed1b9a65d36c5873c1306bae1621e9d',status:'materialized',sourceIdentityKey:'shp-57d2e3769946',canonicalShopperId:'TYA_GT_0C0BA8856E'};
assert.equal(provider.applicable(target,ctx),true,'I3.11C materialized target must be applicable');

for(const status of ['inactive','disabled','archived','deleted','']){
  const link={...base,status};
  assert.equal(canonical.normalizeLink(link).ok,false,`canonical must reject ${status||'<empty>'}`);
  assert.equal(provider.canonicalApplicable(link,ctx),false,`provider fallback must reject ${status||'<empty>'}`);
}

assert.equal(provider.canonicalApplicable({...base,status:'materialized',tenantId:'other'},ctx),false,'tenant isolation');
assert.equal(provider.canonicalApplicable({...base,status:'materialized',projectScope:'other'},ctx),false,'project isolation');
assert.equal(provider.canonicalApplicable({...base,status:'materialized',periodKey:'2026-08'},ctx),false,'period-scoped link forbidden');
assert.equal(provider.canonicalApplicable({...base,status:'materialized',sourceSafe:false},ctx),false,'sourceSafe false rejected');
assert.equal(provider.canonicalApplicable({...base,status:'materialized',authorityType:'manual_guess'},ctx),false,'untrusted authority rejected');
assert.equal(provider.canonicalApplicable({...base,status:'materialized',sourceIdentityKey:'',sourceAliases:[],sourceIdentityAliases:[],identityAliases:[],exactAliases:[],aliases:[]},ctx),false,'no exact source token rejected');
assert.equal(provider.canonicalApplicable({tenantId:'tya',projectScope:'cinepolis',status:'materialized',canonicalShopperId:'TYA_FIXTURE',authorityType:'tenant_adjudication',authorityRef:'fixture',periodIndependent:true,sourceSystem:'hr',name:'Same Name',email:'same@example.com'},ctx),false,'name/email only must never establish identity');

const targetOutput={
  identityMap:{},
  shoppers:[{id:'TYA_GT_0C0BA8856E',shopperId:'TYA_GT_0C0BA8856E'}],
  visits:[{visitId:'v1',shopperId:'TYA_GT_0C0BA8856E'}]
};
const mergedTarget=provider.bridgeComposeOutput(targetOutput,[target]);
assert.equal(mergedTarget.identityMap['shp-57d2e3769946'],'TYA_GT_0C0BA8856E','authoritative exact provider source key must survive into canonical identityMap');
assert.deepEqual(targetOutput.identityMap,{},'identityMap bridge must not mutate input result');

const preservedConflict=provider.bridgeComposeOutput({
  identityMap:{'shp-57d2e3769946':'TYA_OTHER'},
  shoppers:[{id:'TYA_GT_0C0BA8856E'}],visits:[]
},[target]);
assert.equal(preservedConflict.identityMap['shp-57d2e3769946'],'TYA_OTHER','conflicting existing exact map must never be overwritten');

const absentCanonical=provider.bridgeComposeOutput({identityMap:{},shoppers:[],visits:[]},[target]);
assert.equal(absentCanonical.identityMap?.['shp-57d2e3769946'],undefined,'provider link must not create a map to a canonical identity absent from composed output');

assert.deepEqual([...provider.activeStates].sort(),[...canonical.activeStates].sort(),'active state parity');
assert.deepEqual([...provider.trustedAuthorities].sort(),[...canonical.trustedAuthorities].sort(),'trusted authority parity');
assert.equal(provider.fuzzyMatching,false,'fuzzy matching must remain disabled');
assert.equal(provider.exactTechnicalOnly,true,'exact technical identity required');

console.log(JSON.stringify({
  schemaVersion:'cxorbia.provider-identity-runtime-contract-parity-gate.v2',
  decision:'PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY',
  providerVersion:provider.version,
  canonicalVersion:canonical.version,
  acceptedStates:provider.activeStates,
  trustedAuthorities:provider.trustedAuthorities,
  targetMaterializedApplicable:true,
  exactIdentityMapExport:true,
  conflictOverwrite:false,
  canonicalPresenceRequired:true,
  exactTechnicalOnly:true,
  fuzzyMatching:false,
  providerReads:0,providerWrites:0
},null,2));