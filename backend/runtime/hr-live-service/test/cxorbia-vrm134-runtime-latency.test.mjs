import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source=fs.readFileSync('backend/runtime/hr-live-service/server.mjs','utf8');
const begin=source.indexOf('async function resolveHrAndProtectedPrincipal(');
const end=source.indexOf('\nfunction runtimeMeta(',begin);
assert.ok(begin>=0&&end>begin,'VRM-134 exact server owner helper required');
const makeHelper=(hr,auth)=>new Function('buildSnapshot','verifiedProtectedPrincipal',
  source.slice(begin,end)+'\nreturn resolveHrAndProtectedPrincipal;')(hr,auth);
const snapshotRequiredBegin=source.indexOf('function protectedSnapshotRequired(');
const snapshotRequiredEnd=source.indexOf('\nfunction runtimeMeta(',snapshotRequiredBegin);
assert.ok(snapshotRequiredBegin>=0&&snapshotRequiredEnd>snapshotRequiredBegin,'VRM-134 protected metadata fast path required');
const protectedSnapshotRequired=new Function(source.slice(snapshotRequiredBegin,snapshotRequiredEnd)+'\nreturn protectedSnapshotRequired;')();
const pairBegin=source.indexOf('async function runIndependentHrSourceReads(');
const pairEnd=source.indexOf('\nasync function refreshSnapshot(',pairBegin);
assert.ok(pairBegin>=0&&pairEnd>pairBegin,'VRM-134 exact source read pair helper required');
const runIndependentHrSourceReads=new Function(source.slice(pairBegin,pairEnd)+'\nreturn runIndependentHrSourceReads;')();

test('VRM-134 coalesces independent protected HR and principal reads without returning before both',async()=>{
  const starts=[];let releaseHr,releaseAuth;
  const hrP=new Promise(r=>releaseHr=r),authP=new Promise(r=>releaseAuth=r);
  const helper=makeHelper(()=>{starts.push('hr');return hrP;},()=>{starts.push('auth');return authP;});
  const pending=helper({headers:{authorization:'Bearer synthetic'}},{tenantId:'tya',projectId:'cinepolis'},false,true);
  assert.deepEqual(starts,['hr','auth'],'both independent operations start before first completion');
  releaseHr({revision:'revision-safe'});
  let complete=false;pending.then(()=>{complete=true;});
  await Promise.resolve();await Promise.resolve();
  assert.equal(complete,false,'HR alone must not authorize a protected response');
  releaseAuth({uid:'exact-uid',role:'shopper'});
  const value=await pending;
  assert.equal(value.current.revision,'revision-safe');
  assert.equal(value.principal.uid,'exact-uid');
  assert.equal(typeof value.timing.hrWaitMs,'number');
  assert.equal(typeof value.timing.principalVerifyMs,'number');
});
test('VRM-134 rejects protected request if principal check fails',async()=>{
  const helper=makeHelper(async()=>({revision:'fresh'}),async()=>{throw new Error('AUTH_FAILURE:MEMBERSHIP_DENIED');});
  await assert.rejects(helper({},{tenantId:'tya',projectId:'cinepolis'},false,true),/AUTH_FAILURE:MEMBERSHIP_DENIED/);
});
test('VRM-134 public HR read never calls protected identity and retains freshness route',async()=>{
  let calls=0;
  const helper=makeHelper(async({forceFresh})=>({revision:'current',forceFresh}),()=>{calls++;throw new Error('must not run');});
  const value=await helper({},{tenantId:'tya',projectId:'cinepolis'},true,false);
  assert.equal(value.current.forceFresh,true);
  assert.equal(value.principal,null);
  assert.equal(calls,0);
});
test('VRM-134 exposes non-sensitive source refresh stages and protected timing only to verified path',()=>{
  assert.match(source,/refreshStagesMs:lastRefreshStagesMs/);
  assert.match(source,/meta\.protectedTiming=\{\.\.\.timing,protectedStateMs:/);
  assert.match(source,/if\(protectedRequested\)return sendJson\(res,200,\{snapshot,_protected:protectedState,_runtime:/);
  assert.match(source,/if\(cache&&age<CACHE_MS\)return cache/);
  assert.match(source,/Expired data is never served as current/);
});
test('VRM-134 protected metadata read verifies identity and HR without repeating protected Firestore overlay',()=>{
  assert.equal(protectedSnapshotRequired('meta',true),false,'protected metadata needs no duplicate overlay');
  assert.equal(protectedSnapshotRequired('json',true),true,'full protected JSON still requires its overlay');
  assert.equal(protectedSnapshotRequired('js',true),true,'protected JavaScript output keeps prior semantics');
  assert.equal(protectedSnapshotRequired('meta',false),false,'public metadata never requests protected overlay');
  assert.match(source,/resolveHrAndProtectedPrincipal\(req,requestedScope,forceFresh,protectedRequested\)/,
    'protected meta still verifies Firebase principal and tenant/project membership');
  assert.match(source,/if\(protectedSnapshotRequired\(format,protectedRequested\)\)/,
    'only full protected representations expand Firestore collections');
  assert.match(source,/if\(protectedRequested\)meta\.protectedTiming=\{\.\.\.timing,protectedStateMs:0/,
    'verified meta exposes a traceable metadata-only timing');
  assert.ok(source.indexOf("if(format==='meta')")<source.indexOf('const json=(operational||protectedRequested)'),
    'metadata response must not serialize a full snapshot just to return revision');
});
test('VRM-134 registry identity and live HR read start concurrently, then both settle before validation',async()=>{
  const started=[];let releaseRegistry,releaseProvider;
  const registry=new Promise(resolve=>{releaseRegistry=resolve;});
  const provider=new Promise(resolve=>{releaseProvider=resolve;});
  let settled=false;
  const pending=runIndependentHrSourceReads((name,args)=>{
    started.push([name,args[0]]);
    return name==='registryIdentity'?registry:provider;
  }).then(()=>{settled=true;});
  assert.deepEqual(started.map(x=>x[0]),['registryIdentity','liveProviderRead']);
  assert.notEqual(started[0][1],started[1][1],'two independent process outputs');
  releaseRegistry();
  await Promise.resolve();await Promise.resolve();
  assert.equal(settled,false,'metadata first cannot skip live provider read');
  releaseProvider();
  await pending;
  assert.equal(settled,true);
  assert.ok(source.indexOf('await runIndependentHrSourceReads(timedNode)')<source.indexOf("await timedNode('tabRegistryGuard'"),
    'tab/registry guard must execute only after both source reads');
});
test('VRM-134 source read failure waits for the other process before cleanup',async()=>{
  let releaseProvider,settled=false;
  const provider=new Promise(resolve=>{releaseProvider=resolve;});
  const pending=runIndependentHrSourceReads(name=>name==='registryIdentity'
    ?Promise.reject(new Error('SOURCE_FAILURE:REGISTRY')):provider);
  pending.finally(()=>{settled=true;}).catch(()=>{});
  await Promise.resolve();await Promise.resolve();
  assert.equal(settled,false,'a failed source process must not race temp-file cleanup with the other');
  releaseProvider();
  await assert.rejects(pending,/SOURCE_FAILURE:REGISTRY/);
  assert.equal(settled,true);
});


// VRM134 bounded HR batch reads: synthetic promises only, no network or business writes.
const r20Source=fs.readFileSync('tools/hr-source/tya-build-live-hr-source-safe-r20.mjs','utf8');
const identitySource=fs.readFileSync('tools/hr-source/tya-live-provider-registry-identity-dev.mjs','utf8');
function exactFunction(text,start,end){
  const begin=text.indexOf(start),finish=text.indexOf(end,begin);
  assert.ok(begin>=0&&finish>begin,'exact source owner boundaries must remain available');
  return text.slice(begin,finish);
}
const r20Owner=exactFunction(r20Source,'async function readFromSheetsApi(', 'async function readFromGvizCsv(');
const identityOwner=exactFunction(identitySource,'async function main(){','\nmain().catch(');
const flushBatch=async()=>{for(let i=0;i<32;i++)await Promise.resolve();};
function fixtureTabs(count){
  return Array.from({length:count},(_,i)=>({
    tabTitle:i===8?"fixture 'quoted' 8":'fixture-'+i,
    country:i%2?'HN':'GT',
    key:String(2025+Math.floor(Math.floor(i/2)/12))+'-'+String(Math.floor(i/2)%12+1).padStart(2,'0')
  }));
}
function expectedFixtureRanges(tabs){
  return tabs.map(tab=>"'"+tab.tabTitle.replace(/'/g,"''")+"'!A1:AI140");
}
function batchHarness(tabs,{emptyLastContact=false}={}){
  const calls=[],pending=[],events=[],files=new Map();
  let active=0,maxActive=0;
  const byTitle=new Map(tabs.map((tab,index)=>[tab.tabTitle,{tab,index}]));
  const metadata={properties:{title:'HR Guatemala - Sincronizacion Google Sheets'},sheets:tabs.map((tab,index)=>({properties:{title:tab.tabTitle,index}}))};
  async function get(query,token){
    assert.equal(token,'fixture-only','existing authentication token must reach each read');
    if(query.startsWith('?fields=')){events.push('metadata');return metadata;}
    events.push('batch');
    assert.match(query,/^\/values:batchGet\?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&/);
    const ranges=new URLSearchParams(query.slice(query.indexOf('?')+1)).getAll('ranges');
    assert.ok(ranges.length>0&&ranges.length<=8,'no provider batch may exceed eight ranges');
    calls.push(ranges);active++;maxActive=Math.max(maxActive,active);
    try{
      return await new Promise((resolve,reject)=>pending.push({resolve,reject,ranges,done:false}));
    }finally{active--;}
  }
  function response(entry){
    return {valueRanges:entry.ranges.map(range=>{
      const match=range.match(/^'((?:[^']|'')+)'!A1:AI140$/);
      assert.ok(match,'range syntax and configured bounds must remain unchanged');
      const title=match[1].replace(/''/g,"'");
      const found=byTitle.get(title);assert.ok(found,'every requested tab must come from discovery');
      const index=found.index;
      const empty=emptyLastContact&&index>=tabs.length-2;
      return {range,values:[['shopper','phone','mail'],['Synthetic Person',empty?'':'phone-'+index,empty?'':'mail-'+index]]};
    })};
  }
  function resolve(entry){entry.done=true;entry.resolve(response(entry));}
  async function drain(){
    let waves=0;
    await flushBatch();
    while(pending.some(entry=>!entry.done)){
      const wave=pending.filter(entry=>!entry.done).reverse();
      assert.ok(++waves<=Math.ceil(tabs.length/8),'no runaway batch scheduling');
      for(const entry of wave)resolve(entry);
      await flushBatch();
    }
    return waves;
  }
  return {tabs,calls,pending,events,files,get,response,resolve,drain,get maxActive(){return maxActive;}};
}
function makeR20Reader(h,{authError=null,empty=false}={}){
  return new Function('oauthToken','sheetsGet','resolveLiveMonthTabs','MAX_COL','MAX_ROW','fail',r20Owner+'\nreturn readFromSheetsApi;')(
    async()=>{h.events.push('auth');if(authError)throw authError;return {token:'fixture-only',clientEmail:'fixture'};},
    h.get,()=>empty?[]:h.tabs,'AI',140,message=>{throw new Error(message);}
  );
}
function makeIdentityReader(h,{identityOutput=true,authError=null}={}){
  const dependencies={
    accessToken:async()=>{h.events.push('auth');if(authError)throw authError;return {token:'fixture-only',principal:'fixture@invalid.test',mode:'fixture'};},
    sheets:h.get,
    resolveLiveMonthTabs:()=>[...h.tabs].reverse(),
    currentPeriodDescriptor:()=>({periodKey:h.tabs.at(-1)?.key||'2026-01',tabs:[]}),
    fs:{mkdirSync(){},writeFileSync(name,value){h.files.set(name,JSON.parse(value));}},
    path,REGISTRY_OUT:'fixture-registry',IDENTITY_OUT:identityOutput?'fixture-identities':null,
    MAX_COL:'AI',MAX_ROW:140,
    findHeader:values=>values.length?{index:0}:null,
    shopperColumn:()=>0,mappedColumn:(_header,key)=>key==='telefono'?1:2,
    assigned:value=>Boolean(value),
    safeHash:(_value,prefix)=>prefix+'_fixture',
    normalized:value=>String(value).trim().toLowerCase(),
    phoneValue:value=>String(value||''),emailValue:value=>String(value||''),
    console:{log(){}}
  };
  return new Function(...Object.keys(dependencies),identityOwner+'\nreturn main;')(...Object.values(dependencies));
}
test('VRM-134 R20 reads 36 tabs in three bounded waves and preserves response order',async()=>{
  const h=batchHarness(fixtureTabs(36)),pending=makeR20Reader(h)();
  const waves=await h.drain(),result=await pending;
  assert.equal(h.maxActive,2);assert.equal(waves,3);
  assert.deepEqual(h.calls.map(ranges=>ranges.length),[8,8,8,8,4]);
  assert.deepEqual(h.calls.flat(),expectedFixtureRanges(h.tabs),'all discovered tabs exactly once in original order');
  assert.deepEqual(result.valueRanges.map(v=>v.range),h.calls.flat(),'completion order must not reorder tab results');
  assert.equal(result.valueRanges.length,36);assert.equal(result.cacheBustApplied,true);
  assert.equal(result.accessMode,'sheets_api_service_account');
  assert.deepEqual(h.events.slice(0,2),['auth','metadata']);
});
test('VRM-134 R20 covers small and partial waves without extra or missing tabs',async()=>{
  for(const count of [1,8,9,16,17]){
    const h=batchHarness(fixtureTabs(count)),pending=makeR20Reader(h)();
    const waves=await h.drain(),result=await pending;
    assert.equal(h.calls.length,Math.ceil(count/8));
    assert.equal(waves,Math.ceil(count/16));
    assert.equal(h.maxActive,Math.min(2,Math.ceil(count/8)));
    assert.equal(result.valueRanges.length,count);
    assert.deepEqual(h.calls.flat(),expectedFixtureRanges(h.tabs));
    assert.deepEqual(result.valueRanges.map(v=>v.range),h.calls.flat());
  }
});
test('VRM-134 R20 failed batch waits for its peer and starts no later wave',async()=>{
  const h=batchHarness(fixtureTabs(36));let settled=false;
  const pending=makeR20Reader(h)();
  pending.then(()=>{settled=true;},()=>{settled=true;});
  await flushBatch();assert.equal(h.pending.length,2);
  h.pending[0].done=true;h.pending[0].reject(new Error('SOURCE_FAILURE:MOCK_PROVIDER'));
  await flushBatch();assert.equal(settled,false);assert.equal(h.calls.length,2);
  h.resolve(h.pending[1]);
  await assert.rejects(pending,/SOURCE_FAILURE:MOCK_PROVIDER/);
  assert.equal(h.calls.length,2);assert.equal(settled,true);
});
test('VRM-134 R20 authentication and missing metadata fail before batch reads',async()=>{
  const denied=batchHarness(fixtureTabs(36));
  await assert.rejects(makeR20Reader(denied,{authError:new Error('AUTH_FAILURE:FIXTURE')})(),/AUTH_FAILURE:FIXTURE/);
  assert.deepEqual(denied.events,['auth']);assert.equal(denied.calls.length,0);
  const empty=batchHarness([]);
  await assert.rejects(makeR20Reader(empty,{empty:true})(),/No monthly HR tabs detected/);
  assert.deepEqual(empty.events,['auth','metadata']);assert.equal(empty.calls.length,0);
});
test('VRM-134 identity batching preserves chronological latest nonempty contacts',async()=>{
  const h=batchHarness(fixtureTabs(36),{emptyLastContact:true}),pending=makeIdentityReader(h)();
  const waves=await h.drain();await pending;
  assert.equal(h.maxActive,2);assert.equal(waves,3);
  assert.deepEqual(h.calls.map(ranges=>ranges.length),[8,8,8,8,4]);
  const overlay=h.files.get('fixture-identities');
  assert.deepEqual(h.calls.flat(),expectedFixtureRanges(h.tabs),'identity reads each discovered period/country exactly once chronologically');
  assert.equal(overlay.identities.length,2);
  for(const country of ['GT','HN']){
    const identity=overlay.identities.find(row=>row.country===country);
    const lastContact=country==='GT'?32:33;
    assert.equal(identity.phone,'phone-'+lastContact);
    assert.equal(identity.whatsapp,'phone-'+lastContact);
    assert.equal(identity.email,'mail-'+lastContact);
    assert.equal(identity.lastObservedPeriodKey,h.tabs.at(-1).key);
  }
  assert.equal(overlay.safety.hrWrites,0);assert.equal(overlay.safety.firestoreWrites,0);
  assert.equal(overlay.containsCredentials,false);
});
test('VRM-134 identity failure waits for its peer and never publishes a partial identity file',async()=>{
  const h=batchHarness(fixtureTabs(36));let settled=false;
  const pending=makeIdentityReader(h)();
  pending.then(()=>{settled=true;},()=>{settled=true;});
  await flushBatch();assert.equal(h.pending.length,2);
  h.pending[0].done=true;h.pending[0].reject(new Error('SOURCE_FAILURE:MOCK_IDENTITY'));
  await flushBatch();assert.equal(settled,false);
  assert.equal(h.files.has('fixture-identities'),false);assert.equal(h.calls.length,2);
  h.resolve(h.pending[1]);await assert.rejects(pending,/SOURCE_FAILURE:MOCK_IDENTITY/);
  assert.equal(h.files.has('fixture-identities'),false);assert.equal(h.calls.length,2);
});
test('VRM-134 identity registry-only route performs no batch reads and retains auth boundary',async()=>{
  const h=batchHarness(fixtureTabs(36));await makeIdentityReader(h,{identityOutput:false})();
  assert.equal(h.calls.length,0);assert.equal(h.files.has('fixture-registry'),true);
  assert.equal(h.files.has('fixture-identities'),false);
  const denied=batchHarness(fixtureTabs(36));
  await assert.rejects(makeIdentityReader(denied,{authError:new Error('AUTH_FAILURE:FIXTURE')})(),/AUTH_FAILURE:FIXTURE/);
  assert.deepEqual(denied.events,['auth']);assert.equal(denied.files.size,0);
});


