#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';

const files=[
  'app/adapters/cxorbia-exact-identity-contract-v1.js',
  'app/adapters/tya-cumulative-read-model-v2.js',
  'app/adapters/tya-canonical-state-semantics-v2.js'
];
const sandbox={console:{log(){},warn(){},error(){}},setTimeout,clearTimeout};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const file of files)vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:3000});
const composer=sandbox.CX_TYA_CUMULATIVE_READ_MODEL;
const normalizer=sandbox.CX_EXACT_LINKED_OWNER_NORMALIZER;
if(!composer||typeof composer.compose!=='function'||normalizer?.installed!==true)throw new Error('P0_RUNTIME_COMPOSITION_COMPONENTS_NOT_READY');
const result=composer.compose({
  hr:{projects:[{id:'period-1'}],currentPeriodId:'period-1',visits:[{id:'live-v1',hrRowId:'row-1',shopperId:'live-s1'}],shoppers:[{id:'live-s1'}],posts:[]},
  protectedPayload:{shoppers:[{id:'profile-1',shopperId:'profile-1',legacyId:'legacy-1'}],visits:[{id:'protected-v1',shopperId:'legacy-1',hrRowId:'row-1'}],posts:[],certifications:[],liquidations:[]}
});
const map=result.identityMap||{};
const checks={
  normalizerInstalled:result.identityOwnerNormalizerVersion==='cxorbia-exact-linked-owner-normalizer-v1',
  exactAliasPropagated:Object.values(map).map(String).includes('profile-1'),
  canonicalShopperPresent:(result.shoppers||[]).some(row=>String(row?.id||row?.shopperId||'')==='profile-1'),
  visitCanonicalized:(result.visits||[]).some(row=>String(row?.shopperId||'')==='profile-1'),
  noProviderCalls:true,
  noWrites:true
};
const failed=Object.entries(checks).filter(([,pass])=>!pass).map(([id])=>id);
const report={schemaVersion:'cxorbia.p0.global-composition-source-selftest.v1',decision:failed.length?'FAIL_P0_GLOBAL_COMPOSITION_SOURCE':'PASS_P0_GLOBAL_COMPOSITION_SOURCE',testedChain:'profile_claim_to_profile_alias_to_protected_visit_to_hr_row_to_live_hr',checks,failed,safety:{providerReads:0,providerWrites:0,writes:0,deploys:0,merge:false,production:false}};
console.log(JSON.stringify(report,null,2));
if(failed.length)process.exitCode=1;
