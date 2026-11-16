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
function readerHelpers(text){
  const begin=text.indexOf('function hrRangeBatches('),end=text.indexOf('function reportHrSourceFailure(',begin);
  if(begin<0||end<begin)return {hrRangeBatches:()=>{throw Error('MISSING_VRM356_BATCH_HELPER');},validateHrRangeResponse:()=>{throw Error('MISSING_VRM356_RANGE_VALIDATOR');},readSheetsJson:()=>{throw Error('MISSING_VRM356_RETRY_HELPER');}};
  return new Function('HR_SHEETS_READ_DEADLINE','HR_SHEETS_READ_STATS',text.slice(begin,end)+'\nreturn {hrRangeBatches,validateHrRangeResponse,readSheetsJson};')(75000,{attempts:0,successfulRequests:0,quotaRetries:0,responseBytes:0});
}
const r20Helpers=readerHelpers(r20Source),identityHelpers=readerHelpers(identitySource);
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
    assert.ok(ranges.length>0&&ranges.length<=64,'no provider batch may exceed64 ranges');
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
      assert.ok(++waves<=tabs.length,'no runaway batch scheduling');
      for(const entry of wave)resolve(entry);
      await flushBatch();
    }
    return waves;
  }
  return {tabs,calls,pending,events,files,get,response,resolve,drain,get maxActive(){return maxActive;}};
}
function makeR20Reader(h,{authError=null,empty=false}={}){
  return new Function('oauthToken','sheetsGet','resolveLiveMonthTabs','MAX_COL','MAX_ROW','fail','hrRangeBatches','validateHrRangeResponse',r20Owner+'\nreturn readFromSheetsApi;')(
    async()=>{h.events.push('auth');if(authError)throw authError;return {token:'fixture-only',clientEmail:'fixture'};},
    h.get,()=>empty?[]:h.tabs,'AI',140,message=>{throw new Error(message);},r20Helpers.hrRangeBatches,r20Helpers.validateHrRangeResponse
  );
}
function makeIdentityReader(h,{identityOutput=true,authError=null}={}){
  const dependencies={
    accessToken:async()=>{h.events.push('auth');if(authError)throw authError;return {token:'fixture-only',principal:'fixture@invalid.test',mode:'fixture'};},
    sheets:h.get,hrRangeBatches:identityHelpers.hrRangeBatches,validateHrRangeResponse:identityHelpers.validateHrRangeResponse,
    HR_SHEETS_READ_STATS:{attempts:0,successfulRequests:0,quotaRetries:0,responseBytes:0},
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
test('VRM-134 R20 reads36 tabs in one bounded batch and preserves response order',async()=>{
  const h=batchHarness(fixtureTabs(36)),pending=makeR20Reader(h)();
  const waves=await h.drain(),result=await pending;
  assert.equal(h.maxActive,1);assert.equal(waves,1);
  assert.deepEqual(h.calls.map(ranges=>ranges.length),[36]);
  assert.deepEqual(h.calls.flat(),expectedFixtureRanges(h.tabs),'all discovered tabs exactly once in original order');
  assert.deepEqual(result.valueRanges.map(v=>v.range),h.calls.flat(),'completion order must not reorder tab results');
  assert.equal(result.valueRanges.length,36);assert.equal(result.cacheBustApplied,true);
  assert.equal(result.accessMode,'sheets_api_service_account');
  assert.deepEqual(h.events.slice(0,2),['auth','metadata']);
});
test('VRM-134 R20 covers small and partial waves without extra or missing tabs',async()=>{
  for(const count of [1,63,64,65,128,129]){
    const h=batchHarness(fixtureTabs(count)),pending=makeR20Reader(h)();
    const waves=await h.drain(),result=await pending;
    assert.equal(h.calls.length,Math.ceil(count/64));
    assert.equal(waves,Math.ceil(count/128));
    assert.equal(h.maxActive,Math.min(2,Math.ceil(count/64)));
    assert.equal(result.valueRanges.length,count);
    assert.deepEqual(h.calls.flat(),expectedFixtureRanges(h.tabs));
    assert.deepEqual(result.valueRanges.map(v=>v.range),h.calls.flat());
  }
});
test('VRM-134 R20 failed batch waits for its peer and starts no later wave',async()=>{
  const h=batchHarness(fixtureTabs(129));let settled=false;
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
  assert.equal(h.maxActive,1);assert.equal(waves,1);
  assert.deepEqual(h.calls.map(ranges=>ranges.length),[36]);
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
  const h=batchHarness(fixtureTabs(129));let settled=false;
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




function quotaFixture(sequence,{retryAfter='',deadlineAt=75000}={}){
  let time=0;const calls=[],waits=[],stats={attempts:0,successfulRequests:0,quotaRetries:0,responseBytes:0};
  const expected={valueRanges:[{range:"'HR fixture'!A1:AI140",values:[['fixture-only']]}]};
  const io={deadlineAt,now:()=>time,wallNow:()=>Date.UTC(2026,10,16)+time,random:()=>0,stats,
    wait:async ms=>{waits.push(ms);time+=ms;},
    fetchImpl:async(url,options)=>{calls.push({url,method:options.method,headers:options.headers});const status=sequence[Math.min(calls.length-1,sequence.length-1)];return {ok:status===200,status,headers:{get:()=>retryAfter},json:async()=>status===200?expected:{error:{code:status}}};}};
  return {io,calls,waits,stats,expected,get time(){return time;}};
}
for(const [label,helper]of [['identity',identityHelpers],['R20',r20Helpers]]){
  test('VRM356 '+label+' retries only the identical rejected Sheets GET and preserves its result',async()=>{
    const f=quotaFixture([429,429,200]),url='https://sheets.googleapis.com/v4/spreadsheets/fixture/values:batchGet?ranges=exact';
    const headers={Authorization:'Bearer test-only','Cache-Control':'no-store'};
    const result=await helper.readSheetsJson(url,{headers},f.io);
    assert.deepEqual(result,f.expected);assert.deepEqual(f.waits,[1000,2000]);
    assert.equal(f.calls.length,3);assert.ok(f.calls.every(x=>x.url===url&&x.method==='GET'));
    assert.ok(f.calls.every(x=>x.headers===headers),'same verified principal/options preserved');
    assert.equal(f.stats.successfulRequests,1);assert.equal(f.stats.quotaRetries,2);
  });
  test('VRM356 '+label+' exhausted quota terminates after seven attempts within the global deadline',async()=>{
    const f=quotaFixture([429]);
    await assert.rejects(helper.readSheetsJson('https://sheets.googleapis.com/fixture',{},f.io),error=>{
      assert.equal(error.code,'HR_SOURCE_READ_QUOTA_EXHAUSTED');
      assert.equal(error.hrSourceFailure.upstreamStatus,429);
      assert.equal(error.hrSourceFailure.attempts,7);assert.equal(error.hrSourceFailure.readOnly,true);return true;
    });
    assert.equal(f.calls.length,7);assert.deepEqual(f.waits,[1000,2000,4000,8000,16000,32000]);
    assert.equal(f.time,63000);assert.equal(f.stats.successfulRequests,0);
  });
  test('VRM356 '+label+' honors Retry-After seconds and HTTP date without exceeding deadline',async()=>{
    for(const retryAfter of ['30',new Date(Date.UTC(2026,10,16)+30000).toUTCString()]){
      const f=quotaFixture([429,200],{retryAfter});
      await helper.readSheetsJson('https://sheets.googleapis.com/fixture',{},f.io);
      assert.deepEqual(f.waits,[30000]);assert.equal(f.calls.length,2);
    }
    const blocked=quotaFixture([429,200],{retryAfter:'120'});
    await assert.rejects(helper.readSheetsJson('https://sheets.googleapis.com/fixture',{},blocked.io),/HR_SOURCE_READ_QUOTA_EXHAUSTED/);
    assert.equal(blocked.calls.length,1);assert.equal(blocked.waits.length,0);
  });
  test('VRM356 '+label+' rejects writes and does not retry non429 errors',async()=>{
    for(const status of [400,401,403,404,500]){
      const f=quotaFixture([status,200]);
      await assert.rejects(helper.readSheetsJson('https://sheets.googleapis.com/fixture',{},f.io),new RegExp('HTTP_'+status));
      assert.equal(f.calls.length,1);assert.equal(f.waits.length,0);
    }
    const f=quotaFixture([200]);
    await assert.rejects(helper.readSheetsJson('https://sheets.googleapis.com/fixture',{method:'POST'},f.io),/READ_METHOD_REQUIRED/);
    assert.equal(f.calls.length,0);
  });
  test('VRM356 '+label+' cannot restart an expired global read budget',async()=>{
    const f=quotaFixture([200],{deadlineAt:0});
    await assert.rejects(helper.readSheetsJson('https://sheets.googleapis.com/fixture',{},f.io),/HR_SOURCE_READ_DEADLINE_EXCEEDED/);
    assert.equal(f.calls.length,0);
  });
  test('VRM356 '+label+' range batches preserve129 rows and bounded URLs including long quoted titles',()=>{
    const tabs=Array.from({length:129},(_,i)=>({title:i+' '+("long' ".repeat(i%3?1:70))}));
    const rangeForTab=tab=>"'"+tab.title.replace(/'/g,"''")+"'!A1:AI140";
    const batches=helper.hrRangeBatches(tabs,rangeForTab);
    assert.deepEqual(batches.flat(),tabs);assert.ok(batches.every(x=>x.length<=64));
    assert.ok(batches.every(x=>x.map(t=>'ranges='+encodeURIComponent(rangeForTab(t))).join('&').length<=6000));
    assert.throws(()=>helper.hrRangeBatches([{title:'x'.repeat(7000)}],rangeForTab),/URL_TOO_LONG/);
  });
  test('VRM356 '+label+' rejects incomplete or reordered batch results and accepts a truly empty range',()=>{
    const ranges=["'first sheet'!A1:AI140","'second sheet'!A1:AI140"];
    assert.throws(()=>helper.validateHrRangeResponse({valueRanges:[{range:ranges[0]}]},ranges),/INCOMPLETE/);
    assert.throws(()=>helper.validateHrRangeResponse({valueRanges:[{range:ranges[1]},{range:ranges[0]}]},ranges),/MISMATCH/);
    const value={valueRanges:[{range:ranges[0]},{range:ranges[1],values:[]}]};
    assert.equal(helper.validateHrRangeResponse(value,ranges),value);
  });
}
test('VRM356 four fresh observations consume16 independent Sheets reads instead of48 and preserve every tab',async()=>{
  let total=0;
  for(let refresh=0;refresh<4;refresh++){
    for(const make of [makeR20Reader,makeIdentityReader]){
      const h=batchHarness(fixtureTabs(36)),pending=make(h)();
      await h.drain();await pending;
      total+=h.events.filter(x=>x==='metadata'||x==='batch').length;
      assert.deepEqual(h.calls.flat(),expectedFixtureRanges(h.tabs));
    }
  }
  assert.equal(total,16,'metadata and values remain independent for both readers');
});
test('VRM356 R20 exhausted quota and incomplete batches never fall back to GViz',async()=>{
  const start=r20Source.indexOf('async function readLiveHr('),end=r20Source.indexOf('\n',start);
  assert.ok(start>=0&&end>start);
  for(const error of [Object.assign(new Error('HR_SOURCE_READ_QUOTA_EXHAUSTED'),{hrSourceFailure:{readOnly:true}}),new Error('HR_SOURCE_RANGE_RESPONSE_INCOMPLETE')]){
    let gvizCalls=0;
    const read=new Function('readFromSheetsApi','readFromGvizCsv','console',r20Source.slice(start,end)+'\nreturn readLiveHr;')(
      async()=>{throw error;},async()=>{gvizCalls++;return {};},{warn(){}}
    );
    await assert.rejects(read(),e=>e===error);assert.equal(gvizCalls,0);
  }
});
test('VRM356 child error marker retains safe provider metadata and rejects forged or raw stderr',()=>{
  const begin=source.indexOf('function parseHrSourceFailure('),end=source.indexOf('function runNode(',begin);
  assert.ok(begin>=0&&end>begin);
  const parse=new Function(source.slice(begin,end)+'\nreturn parseHrSourceFailure;')();
  const data={schemaVersion:'cxorbia.hr-source-read-failure.v1',code:'HR_SOURCE_READ_QUOTA_EXHAUSTED',upstreamStatus:429,attempts:7,readOnly:true};
  const script='tools/hr-source/tya-live-provider-registry-identity-dev.mjs',marker='CXORBIA_HR_SOURCE_FAILURE='+JSON.stringify(data);
  assert.deepEqual(parse(marker,script),{...data,stage:'registryIdentity'});
  assert.equal(parse('HTTP_429 raw provider error',script),null);
  assert.equal(parse(marker+'\n'+marker,script),null);
  assert.equal(parse(marker,'tools/unknown.mjs'),null);
  assert.equal(parse('CXORBIA_HR_SOURCE_FAILURE='+JSON.stringify({...data,token:'must-never-leak'}),script),null);
  assert.equal(parse('CXORBIA_HR_SOURCE_FAILURE='+JSON.stringify({...data,code:'AUTH_DENIED'}),script),null);
});
