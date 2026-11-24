import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';

// Offline diagnostic. Runs actual Excel mapper and shopper provider with inert
// Firestore/Auth reads. It never initializes an SDK, network client or server.
const root=path.resolve(process.env.CXORBIA_QA_REPO_ROOT||path.join(path.dirname(fileURLToPath(import.meta.url)),'../..'));
const {resolveExcelOriginalProjectPlan,readExcelOriginalProjectSnapshot}=await import(pathToFileURL(path.join(root,'backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs')));
const {readExcelPeriodThroughMake}=await import(pathToFileURL(path.join(root,'backend/runtime/cxorbia-make-graph-provider-v1.mjs')));
const {createShopperCommandProvider}=await import(pathToFileURL(path.join(root,'backend/runtime/cxorbia-shopper-command-provider-v1.mjs')));
const columnMap=JSON.parse(fs.readFileSync(path.join(root,'backend/contracts/tya-hr-column-map-r20-v1.json'),'utf8'));
const cinemaRegistry=JSON.parse(fs.readFileSync(path.join(root,'backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json'),'utf8'));
const serverSource=fs.readFileSync(path.join(root,'backend/runtime/hr-live-service/server.mjs'),'utf8');
const fixtureSource=fs.readFileSync(path.join(root,'backend/runtime/hr-live-service/test/cxorbia-f3-scoped-excel-read.test.mjs'),'utf8');
const fixtureContext={crypto,columnMap,readExcelPeriodThroughMake,structuredClone};
vm.createContext(fixtureContext);
vm.runInContext(fixtureSource.slice(fixtureSource.indexOf("const tenantId='tya'"),fixtureSource.indexOf("for(const policy of")),fixtureContext);
const scope={tenantId:'tya',projectId:'f3-qa-20261124'};

function materializer({historical=false}={}){
  const first=serverSource.indexOf('function stableRevisionValue('),last=serverSource.indexOf('function operationalSnapshot(',first);
  assert.ok(first>=0&&last>first,'served runtime materializer must exist');
  let code=serverSource.slice(first,last);
  if(historical){
    // Explicit reconstruction of the RUN2768 materializer, kept only to prove
    // the causal regression. Product assertions below execute the real current
    // server function body read from this same checkout.
    code=code.slice(0,code.indexOf('function materialize('))+`
      function materialize(snapshot,origin,identity=new Map(),privateReviewNotes=new Map()){
        const json=JSON.stringify(snapshot);
        const identityStable=[...identity.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0]))).map(([id,value])=>[id,stableRevisionValue(value)]);
        const stableJson=JSON.stringify({snapshot:stableRevisionValue(snapshot),shopperIdentity:identityStable});
        const revision=crypto.createHash('sha256').update(stableJson).digest('hex');
        return {snapshot,json,revision,loadedAt:Date.now(),origin,identity,privateReviewNotes};
      }`;
  }
  const context={crypto,Date,Map,VOLATILE_REVISION_KEYS:new Set(['generatedAt','lastSnapshotAt','sourceSnapshotAt','tabRegistryObservedAt'])};
  vm.createContext(context);vm.runInContext(code,context);return context.materialize;
}
async function sourceFixture(){
  const h=fixtureContext.fixture();
  const plan=await resolveExcelOriginalProjectPlan({db:h.db,scope});
  const result=await readExcelOriginalProjectSnapshot({db:h.db,plan,columnMap,cinemaRegistry,readBinding:h.readBinding});
  return {h,result};
}
function shopperProvider(h){
  let writes=0;
  const denied=()=>{writes++;throw Error('UNEXPECTED_WRITE');};
  const auth={getUser:denied,createUser:denied,setCustomUserClaims:denied};
  const db={...h.db,runTransaction:denied};
  const policy={schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,allowedTenantIds:['tya'],allowedProjectIds:[scope.projectId],hrWrites:false,externalWrites:false,fuzzyMatching:false};
  return {provider:createShopperCommandProvider({db,auth,policy}),writes:()=>writes};
}

test('VRM-370 historical RUN2768 materializer reproduces the exact shopper stage failure with no shoppers or writes',async()=>{
  const {h,result}=await sourceFixture(),current=materializer({historical:true})(result.snapshot,'runtime_excel_online_original',result.identity);
  const {provider,writes}=shopperProvider(h);
  assert.equal(current.snapshot.shoppers.length,0);
  assert.notEqual(current.snapshot.sourceRevision,current.revision);
  await assert.rejects(provider.reconcileSnapshot(current.snapshot,{sourceRevision:current.revision,identityByShopperId:current.identity}),/SHOPPER_HR_NAME_REVISION_MISMATCH/);
  assert.equal(writes(),0);assert.equal(h.writes(),0);
});

test('VRM-370 current runtime materializer keeps the original hash and provider evidence; same-revision shopper stage commits with zero writes',async()=>{
  const {h,result}=await sourceFixture(),before=structuredClone(result.snapshot),old=materializer({historical:true})(result.snapshot,'runtime_excel_online_original',result.identity),current=materializer()(result.snapshot,'runtime_excel_online_original',result.identity);
  assert.equal(current.revision,old.revision);
  assert.equal(current.snapshot.sourceRevision,current.revision);
  assert.equal(current.snapshot.source.sourceRevision,result.proof.sourceRevision);
  assert.equal(JSON.parse(current.json).sourceRevision,current.revision);
  const rematerialized=materializer()(current.snapshot,'durable_recovery',current.identity);
  assert.equal(rematerialized.revision,current.revision);
  assert.deepEqual(JSON.parse(rematerialized.json),JSON.parse(current.json));
  assert.deepEqual(result.snapshot,before);
  const {provider,writes}=shopperProvider(h);
  const ack=await provider.reconcileSnapshot(current.snapshot,{sourceRevision:current.revision,identityByShopperId:current.identity});
  assert.equal(ack.ok,true);assert.equal(ack.status,'committed');assert.equal(ack.shopperCount,0);assert.equal(ack.providerWrites,0);assert.equal(writes(),0);assert.equal(h.writes(),0);
  // Preserve, rather than bypass, VRM-354's evidence-revision invariant.
  const tampered={...current.snapshot,sourceRevision:'0'.repeat(64)};
  await assert.rejects(provider.reconcileSnapshot(tampered,{sourceRevision:current.revision,identityByShopperId:current.identity}),/SHOPPER_HR_NAME_REVISION_MISMATCH/);
  assert.equal(writes(),0);
});

test('VRM-370 current runtime revision remains stable across timestamps and reacts to exact HR/identity changes; other adapters retain their payload',async()=>{
  const {result}=await sourceFixture(),materialize=materializer(),a=materialize(result.snapshot,'runtime_excel_online_original',result.identity);
  const later={...result.snapshot,generatedAt:'2099-01-01T00:00:00.000Z'};
  assert.equal(materialize(later,'runtime_excel_online_original',result.identity).revision,a.revision);
  const changed=structuredClone(result.snapshot);changed.visits[0].escenario='Different exact HR value';
  assert.notEqual(materialize(changed,'runtime_excel_online_original',result.identity).revision,a.revision);
  assert.notEqual(materialize(result.snapshot,'runtime_excel_online_original',new Map([['qa-exact',{displayName:'QA Exact Identity'}]])).revision,a.revision);
  const generic={...result.snapshot,source:{providerType:'google_sheets'},sourceRevision:undefined};
  const genericResult=materialize(generic,'runtime_refresh',result.identity);
  assert.equal(genericResult.snapshot,generic);assert.equal(genericResult.json,JSON.stringify(generic));
});
