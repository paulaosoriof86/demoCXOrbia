import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
const inplace=fs.readFileSync(new URL('../../../../app/adapters/tya-live-source-inplace-apply.js',import.meta.url),'utf8');
const watcher=fs.readFileSync(new URL('../../../../app/adapters/tya-live-source-refresh-watch-v2.js',import.meta.url),'utf8');
const bridge=fs.readFileSync(new URL('../../../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',import.meta.url),'utf8');
const c6=fs.readFileSync(new URL('../../../../app/adapters/tya-c6-unified-human-runtime-v1.js',import.meta.url),'utf8');
const dataSource=fs.readFileSync(new URL('../../../../app/core/data-source.js',import.meta.url),'utf8');
const fn=(text,from,to)=>{const a=text.indexOf(from),b=text.indexOf(to,a);assert.ok(a>=0&&b>a);return text.slice(a,b);};
const selector=fn(server,'async function buildSnapshot(','\nasync function resolveHrAndProtectedPrincipal(');
const recovery=fn(server,'async function recoverHrReadModel(','\nfunction parseHrSourceFailure(');
const materializer=fn(server,'function stableRevisionValue(','\nfunction operationalSnapshot(');
const materialize=new Function('crypto',`const VOLATILE_REVISION_KEYS=new Set(['generatedAt','lastSnapshotAt','sourceSnapshotAt','tabRegistryObservedAt']);${materializer};return materialize;`)(crypto);
const binding={scope:{tenantId:'qa-tenant',projectId:'qa-project'},proof:{providerType:'excel_online',bindingFingerprint:'b'.repeat(64)}};
const snapshot={tenantId:'qa-tenant',projectId:'qa-project',sourceSafe:true,imported:false,production:false,
  projectConfig:{name:'Synthetic QA',countries:['GT'],currency:{GT:'Q'}},periods:[{key:'2026-11'}],
  visits:[{id:'qa-visit',periodKey:'2026-11',pais:'GT',estado:'disponible'}],shoppers:[]};

function selectHarness({cached=null,refresh=async()=>{throw Error('EXTERNAL_PROVIDER_DOWN');},recover=async()=>null}={}){
  const calls=[];
  const build=new Function('cached','resolveProjectHrReadBinding','refreshSnapshot','recoverHrReadModel','persistHrReadModel',
    `let cache=cached,inFlight=null,inFlightBinding=null,lastReadModelError=null;const CACHE_MS=5000;const scopedHrCache=new Map();${selector};return buildSnapshot;`)
    (cached,async()=>binding,async b=>{calls.push('fresh');return refresh(b);},async b=>{calls.push('recover');return recover(b);},async()=>{calls.push('persist');return {published:true};});
  return {build,calls};
}
test('strict commands/probes never fall back to a durable view if provider fails',async()=>{
  const h=selectHarness({cached:{origin:'durable_internal_snapshot',externalReadCurrent:false,
    loadedAt:Date.now(),bindingProof:binding.proof},recover:async()=>({secret:'must not be used'})});
  await assert.rejects(h.build({scope:binding.scope}),/EXTERNAL_PROVIDER_DOWN/);
  assert.deepEqual(h.calls,['fresh']);
});
test('forceFresh always wins over presentation recovery, including a newly recovered cache',async()=>{
  const h=selectHarness({cached:{origin:'durable_internal_snapshot',externalReadCurrent:false,
    loadedAt:Date.now(),bindingProof:binding.proof},recover:async()=>({mustNotRun:true})});
  await assert.rejects(h.build({scope:binding.scope,forceFresh:true,allowDurableRead:true}),/EXTERNAL_PROVIDER_DOWN/);
  assert.deepEqual(h.calls,['fresh']);
});
test('presentation can recover instantly on a cold process without initiating an external read',async()=>{
  const saved={...materialize(snapshot,'durable_internal_snapshot'),externalReadCurrent:false,loadedAt:1700000000000,bindingProof:binding.proof};
  const h=selectHarness({recover:async()=>saved});
  const got=await h.build({scope:binding.scope,allowDurableRead:true});
  assert.equal(got,saved);assert.equal(got.loadedAt,1700000000000);assert.deepEqual(h.calls,['recover']);
});
test('missing recoverable view requires the real provider, never the build bootstrap',async()=>{
  const bootstrap={...materialize(snapshot,'build_bootstrap'),bindingProof:binding.proof};
  const h=selectHarness({cached:bootstrap});
  await assert.rejects(h.build({scope:binding.scope,allowDurableRead:true}),/EXTERNAL_PROVIDER_DOWN/);
  assert.deepEqual(h.calls,['recover','fresh']);
});
test('parallel presentation selection performs reads only before authentication',async()=>{
  const current={...materialize(snapshot,'runtime_excel_online_original'),externalReadCurrent:true,bindingProof:binding.proof};
  const h=selectHarness({refresh:async()=>current});const got=await h.build({scope:binding.scope,allowDurableRead:true});
  assert.deepEqual(h.calls,['recover','fresh']);assert.equal(got.readModelWriteAck,undefined);
  assert.equal(got.loadedAt,current.loadedAt);assert.equal(got.revision,current.revision);
});
test('corrupt durable content is not displayed; an independent fresh provider read can recover the view',async()=>{
  const current={...materialize(snapshot,'runtime_excel_online_original'),externalReadCurrent:true,bindingProof:binding.proof};
  const h=selectHarness({recover:async()=>{throw Error('PERSISTENCE_FAILURE:HR_READ_MODEL_CHUNK');},refresh:async()=>current});
  const got=await h.build({scope:binding.scope,allowDurableRead:true});assert.equal(got.revision,current.revision);
  assert.deepEqual(h.calls,['recover','fresh']);
});
test('live cache retains its strict existing five-second window',async()=>{
  const current={...materialize(snapshot,'runtime_excel_online_original'),externalReadCurrent:true,bindingProof:binding.proof};
  const h=selectHarness({cached:current});assert.equal(await h.build({scope:binding.scope}),current);assert.deepEqual(h.calls,[]);
});

function recoveryHarness(saved,resolve=async()=>binding){
  return new Function('materialize','resolveProjectHrReadBinding','saved',
    `let cache=null;const HR_READ_MODEL_MAX_AGE_MS=86400000;const durableHrReadContext=()=>({store:{read:async()=>saved},key:{}});${recovery};return {recoverHrReadModel,get cache(){return cache;}};`)(materialize,resolve,saved);
}
test('restored source is rehashed and binding rechecked before cache publication',async()=>{
  const raw=materialize(snapshot,'runtime_excel_online_original');
  const saved={...raw,origin:'durable_internal_snapshot',loadedAt:Date.now()-60000,externalReadCurrent:false,bindingProof:binding.proof};
  const h=recoveryHarness(saved);const read=await h.recoverHrReadModel(binding);
  assert.equal(read.revision,raw.revision);assert.equal(read.loadedAt,saved.loadedAt);assert.equal(h.cache,read);
  const corrupt=recoveryHarness({...saved,revision:'a'.repeat(64)});
  await assert.rejects(corrupt.recoverHrReadModel(binding),/HR_READ_MODEL_REVISION/);assert.equal(corrupt.cache,null);
  const changed=recoveryHarness(saved,async()=>({...binding,proof:{...binding.proof,bindingFingerprint:'c'.repeat(64)}}));
  await assert.rejects(changed.recoverHrReadModel(binding),/BINDING_CHANGED_DURING_READ_MODEL_RECOVERY/);assert.equal(changed.cache,null);
});

test('only explicit readModel=1 presentation requests enable recovery; forced reads and auth remain strict',async()=>{
  const helper=fn(server,'async function resolveHrAndProtectedPrincipal(','\nfunction runtimeMeta('),calls=[];
  const resolve=new Function('buildSnapshot','verifiedProtectedPrincipal',helper+'\nreturn resolveHrAndProtectedPrincipal;')
    (async options=>{calls.push(options);return {revision:'same'};},async()=>({uid:'verified'}));
  await resolve({url:'/?format=json&readModel=1'},binding.scope,false,true);
  await resolve({url:'/?format=json&readModel=1'},binding.scope,true,true);
  await resolve({url:'/?format=meta'},binding.scope,false,false);
  assert.deepEqual(calls.map(x=>x.allowDurableRead),[true,false,false]);
  const denied=new Function('buildSnapshot','verifiedProtectedPrincipal',helper+'\nreturn resolveHrAndProtectedPrincipal;')
    (async()=>({revision:'same'}),async()=>{throw Error('AUTH_DENIED');});
  await assert.rejects(denied({url:'/?readModel=1'},binding.scope,false,true),/AUTH_DENIED/);
});

function browser(){
  const attrs={},CX={data:{projects:[],_visitas:[],shoppers:[],previewMeta:{}},BRAND:{},
    dataSource:{warnings:[],badge(){return {c:'blue',t:'test'};}},bus:{emit(){}}};
  const window={CX,dispatchEvent(){}};
  const ctx=vm.createContext({window,CX,document:{getElementById(){return null;},documentElement:{setAttribute(k,v){attrs[k]=v;}}},
    localStorage:{setItem(){}},CustomEvent:class{},console});
  vm.runInContext(inplace,ctx);return {window,CX,attrs,ctx};
}
test('recovered UI cannot be upgraded to live by bridge overrides and retains its observation time',()=>{
  const b=browser(),at='2026-11-24T08:00:00.000Z',revision='d'.repeat(64);
  const candidate=b.window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE(snapshot,{revision,sourceReadAt:at,externalReadCurrent:false});
  b.window.CX_TYA_PUBLISH_LIVE_SNAPSHOT_CANDIDATE(candidate,{suppressEvents:true,
    dataPatch:{previewMeta:{note:'HR viva',runtimeReadActive:true}},dataSourcePatch:{runtimeReadActive:true,updatedAt:'2099-01-01'}});
  assert.equal(b.CX.data.previewMeta.externalReadCurrent,false);assert.equal(b.CX.data.previewMeta.runtimeReadActive,false);
  assert.equal(b.CX.dataSource.updatedAt,at);assert.equal(b.CX.dataSource.runtimeReadActive,false);
  assert.match(b.CX.data.previewMeta.note,/Última hoja de ruta sincronizada/);
  assert.equal(b.window.CX_TYA_HR_VIVA_SOURCE_SAFE,false);assert.equal(b.window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE,true);
  assert.equal(b.window.CX_TYA_VISIBLE_DATA_CONTRACT.externalReadCurrent,false);assert.equal(b.attrs['data-cx-source'],'hr-last-confirmed');
});
test('fresh observation of the same revision clears stale warnings without changing content',()=>{
  const b=browser(),revision='d'.repeat(64),first='2026-11-24T08:00:00.000Z',next='2026-11-24T09:00:00.000Z';
  b.window.CX_TYA_APPLY_LIVE_SNAPSHOT(snapshot,{revision,sourceReadAt:first,externalReadCurrent:false});
  const visits=b.CX.data._visitas;b.window.CX_TYA_APPLY_HR_FRESHNESS({revision,sourceReadAt:next,externalReadCurrent:true});
  assert.equal(b.CX.data._visitas,visits);assert.equal(b.CX.dataSource.updatedAt,next);assert.equal(b.CX.dataSource.runtimeReadActive,true);
  assert.equal(b.window.CX_TYA_HR_VIVA_SOURCE_SAFE,true);assert.ok(!b.CX.dataSource.warnings.some(x=>x.startsWith('Última sincronización confirmada:')));
});
test('a different deferred revision cannot refresh the timestamp or freshness of the currently displayed view',()=>{
  const b=browser(),first='2026-11-24T08:00:00.000Z';
  b.window.CX_TYA_APPLY_LIVE_SNAPSHOT(snapshot,{revision:'a'.repeat(64),sourceReadAt:first,externalReadCurrent:true});
  b.window.CX_TYA_APPLY_HR_FRESHNESS({revision:'b'.repeat(64),sourceReadAt:'2026-11-24T09:00:00.000Z',externalReadCurrent:true});
  assert.equal(b.CX.data.previewMeta.sourceReadAt,first);assert.equal(b.CX.data.previewMeta.sourceRevision,'a'.repeat(64));
  assert.equal(b.CX.data.previewMeta.externalReadCurrent,false);
});
test('visible global badge identifies last synchronization and does not claim current live data',()=>{
  const body=fn(dataSource,'    badge(){','\n\n    /* P0-2');
  const obj=new Function('CX','return ({'+body+'});')({data:{previewMeta:{}}});
  const got=obj.badge.call({hrFreshness:{externalReadCurrent:false,sourceReadAt:'2026-11-24T08:00:00.000Z'},mode:'connected'});
  assert.equal(got.status,'last_confirmed');assert.match(got.t,/última sincronización/);assert.doesNotMatch(got.t,/Listo|viva/);
});
test('existing browser bridge opts into read model, watcher refreshes strictly, and commands do not opt in',()=>{
  assert.match(bridge,/format:'json'.*readModel:'1'/);assert.match(bridge,/format:'meta'.*readModel:'1'/);
  assert.match(watcher,/getJson\('meta',\{fresh:'1',\.\.\.\(!automatic\?\{inventory:'1'\}:\{\}\)\}\)/);
  const configure=fn(server,'      configure:async command=>{','      hrSnapshotReconcile:async input=>{');
  assert.doesNotMatch(configure,/allowDurableRead/);assert.match(configure,/buildSnapshot\(\{forceFresh:hrCommands.has/);
  assert.match(server,/readSnapshot:scope=>buildSnapshot\(\{forceFresh:true,scope\}\)/);
});


const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function protectedResolver({read,verify,persist=async()=>({published:true})}){
  const helper=fn(server,'async function resolveHrAndProtectedPrincipal(','\nfunction runtimeMeta(');
  return new Function('buildSnapshot','verifiedProtectedPrincipal','persistHrReadModel',helper+'\nreturn resolveHrAndProtectedPrincipal;')(read,verify,persist);
}
function liveRead(){return {...materialize(snapshot,'runtime_excel_online_original'),externalReadCurrent:true,bindingProof:binding.proof};}

test('durable reader keys reuse source hashes but recompute the selected mapping for every binding',()=>{
  const helper=fn(server,'let durableHrStore=null,','\nasync function persistHrReadModel(');
  const mappings={alpha:{columnMap:{v:1},cinemaRegistry:{a:1}},beta:{columnMap:{v:2},cinemaRegistry:{b:2}}};
  let reads=0;const selected=[];
  const context=new Function('crypto','fs','path','loadExcelMappingLibrary','createDurableHrReadModel','hrReadModelKey','ensureAdmin',
    `const ROOT='/synthetic';${helper};return durableHrReadContext;`)(crypto,
      {readFileSync:name=>{reads++;return Buffer.from(name);}}, {join:(...x)=>x.join('/')},
      ref=>{selected.push(ref);if(!mappings[ref])throw Error('MAPPING_UNSUPPORTED');return mappings[ref];},
      ()=>({}), (b,readerFingerprint)=>({...b.scope,readerFingerprint}), ()=>({db:{}}));
  const a=context({...binding,mappingRef:'alpha'}),b=context({...binding,mappingRef:'beta'}),again=context({...binding,mappingRef:'alpha'});
  assert.equal(reads,7,'immutable reader owners are hashed once per process');
  assert.deepEqual(selected,['alpha','beta','alpha']);assert.equal(a.key.readerFingerprint,again.key.readerFingerprint);
  assert.notEqual(a.key.readerFingerprint,b.key.readerFingerprint,'first project mapping cannot contaminate the second');
  mappings.alpha.columnMap.v=3;assert.notEqual(context({...binding,mappingRef:'alpha'}).key.readerFingerprint,a.key.readerFingerprint);
  assert.throws(()=>context({...binding,mappingRef:'missing'}),/MAPPING_UNSUPPORTED/);
});

test('protected presentation reads overlap auth, but no persistence occurs before both succeed',async()=>{
  for(const authFirst of [false,true]){
    const hr=deferred(),auth=deferred(),order=[];let writes=0;
    const resolve=protectedResolver({read:()=>{order.push('read');return hr.promise;},verify:()=>{order.push('auth');return auth.promise;},
      persist:async(scope,current)=>{writes++;assert.deepEqual(scope,binding.scope);assert.equal(current.externalReadCurrent,true);return {published:true};}});
    const pending=resolve({url:'/?readModel=1'},binding.scope,false,true);
    assert.deepEqual(order,['read','auth']);
    if(authFirst)auth.resolve({uid:'verified'});else hr.resolve(liveRead());
    await settle();assert.equal(writes,0);
    if(authFirst)hr.resolve(liveRead());else auth.resolve({uid:'verified'});
    const result=await pending;assert.equal(writes,1);assert.equal(result.current.readModelWriteAck.published,true);
  }
});

test('rejected principal cannot cause a cache write even when the HR task finishes afterwards',async()=>{
  const hr=deferred(),auth=deferred();let writes=0;
  const resolve=protectedResolver({read:()=>hr.promise,verify:()=>auth.promise,persist:async()=>{writes++;}});
  const pending=resolve({url:'/?readModel=1'},binding.scope,false,true);
  auth.reject(Error('AUTH_FAILURE:MEMBERSHIP_DENIED'));
  await assert.rejects(pending,/MEMBERSHIP_DENIED/);hr.resolve(liveRead());await settle();assert.equal(writes,0);
});

test('anonymous opt-in, probes and recovered views never persist; explicit authenticated fresh presentation may',async()=>{
  const cases=[
    {url:'/?readModel=1',protectedRequested:false,forceFresh:false,live:true,writes:0,durable:false},
    {url:'/?fresh=1',protectedRequested:true,forceFresh:true,live:true,writes:0,durable:false},
    {url:'/?format=meta',protectedRequested:true,forceFresh:false,live:true,writes:0,durable:false},
    {url:'/?readModel=1',protectedRequested:true,forceFresh:false,live:false,writes:0,durable:true},
    {url:'/?readModel=1&fresh=1',protectedRequested:true,forceFresh:true,live:true,writes:1,durable:false}
  ];
  for(const c of cases){let writes=0,selection;
    const current={...liveRead(),...(c.live?{}:{externalReadCurrent:false,origin:'durable_internal_snapshot'})};
    const resolve=protectedResolver({read:async options=>{selection=options;return current;},verify:async()=>({uid:'verified'}),persist:async()=>{writes++;return {published:true};}});
    await resolve({url:c.url},binding.scope,c.forceFresh,c.protectedRequested);
    assert.equal(writes,c.writes,c.url);assert.equal(selection.allowDurableRead,c.durable,c.url);
  }
});

test('binding change after protected verification aborts before publication',async()=>{
  let contextCalls=0;
  const helper=fn(server,'async function persistHrReadModel(','\nasync function recoverHrReadModel(');
  const persist=new Function('resolveProjectHrReadBinding','durableHrReadContext',
    `let lastReadModelPersistence=null,lastReadModelError=null;${helper};return persistHrReadModel;`)(
      async()=>({...binding,proof:{...binding.proof,bindingFingerprint:'c'.repeat(64)}}),()=>{contextCalls++;});
  await assert.rejects(persist(binding.scope,liveRead()),/HR_BINDING_CHANGED_BEFORE_READ_MODEL_PUBLISH/);assert.equal(contextCalls,0);
});

function protectedBrowser(){
  const b=browser(),listeners={},timers=[],mounts=[];
  const ctx={authenticated:true,role:'admin',authNamespace:'staff',tenantId:binding.scope.tenantId,projectIds:[binding.scope.projectId]};
  b.CX.backendAuth={context:()=>ctx};b.CX.session={role:'admin',view:'dashboard'};b.CX.MODULES={dashboard:{}};
  b.CX.router={mount(){mounts.push('mount');},nav(){}};
  b.window.firebase={auth:()=>({currentUser:{uid:'verified'}})};
  b.window.addEventListener=(name,fn)=>{(listeners[name]||=[]).push(fn);};
  b.window.dispatchEvent=e=>{for(const fn of listeners[e.type]||[])fn(e);};
  b.ctx.document.addEventListener=()=>{};b.ctx.document.querySelectorAll=()=>[];b.ctx.document.body={};
  b.ctx.document.activeElement=b.ctx.document.body;
  b.ctx.setTimeout=fn=>{timers.push(fn);return timers.length;};b.ctx.setInterval=()=>1;
  b.ctx.location={search:'?cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV&cxProjectId='+binding.scope.projectId};
  b.ctx.URLSearchParams=URLSearchParams;
  b.ctx.CustomEvent=class {constructor(type,options={}){this.type=type;this.detail=options.detail;}};
  b.publish=(revision,sourceReadAt,externalReadCurrent)=>{
    const meta={revision,sourceReadAt,externalReadCurrent,sourceSafe:true,runtimeRead:true};
    b.window.CX_TYA_PUBLISH_LIVE_SNAPSHOT_CANDIDATE(b.window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE(snapshot,meta),
      {suppressEvents:true,dataPatch:{sourceMode:'tya_hr_live_all_periods_plus_firestore_exact_overlay_dev'}});
    b.CX.dataSource.sourceRef='hr-live-all-periods+firestore-authenticated-exact-overlay';
    b.window.CX_PROTECTED_AUTH_HR_AUTHORITY={applied:true,atomicPublication:true,tenantId:binding.scope.tenantId,
      projectId:binding.scope.projectId,sourceRevision:revision,actorUid:'verified',role:ctx.role,authNamespace:ctx.authNamespace,externalReadCurrent,sourceReadAt,at:new Date().toISOString()};
    b.window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE={ready:true,completed:true,sourceRevision:revision};
    return meta;
  };
  return {...b,listeners,mounts,authContext:ctx,flush(){while(timers.length)timers.shift()();}};
}

test('visible historical rows survive a fresh window without entering command authority or resurrecting a deleted row',()=>{
 const b=protectedBrowser(),scope=binding.scope,old={...snapshot.visits[0],...scope,id:'old',visitId:'old',periodId:'qa-project-2026-05',periodKey:'2026-05',country:'GT'};
 const current={...old,id:'current',visitId:'current',periodId:'qa-project-2026-11',periodKey:'2026-11'};
 const s={...snapshot,visits:[current],periods:[{key:'2026-11'}],periodCatalog:[{key:'2026-05'},{key:'2026-11'},{key:'2026-12'}],
  readScope:{mode:'rolling_window',currentPeriodId:'qa-project-2026-11',freshPeriodIds:['qa-project-2026-11'],countryPeriods:[{countryCode:'GT',periodId:'qa-project-2026-11'}]},
  confirmedHistory:{schemaVersion:'cxorbia.hr-confirmed-history.v1',...scope,externalReadCurrent:false,visits:[old,{...current,id:'deleted',visitId:'deleted'}],shoppers:[],periods:[{key:'2026-05'},{key:'2026-11'}],observations:[{countryCode:'GT',periodId:'qa-project-2026-05',sourceReadAt:'2026-05-30T12:00:00Z'}]}};
 const candidate=b.window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE(s,{revision:'a'.repeat(64),externalReadCurrent:true,sourceReadAt:'2026-11-24T12:00:00Z'});
 assert.deepEqual(Array.from(candidate.data._visitas,v=>v.id),['old','current']);assert.equal(candidate.data.currentPeriodId,'qa-project-2026-11');
 assert.equal(candidate.snapshot.visits.length,1);assert.equal(candidate.snapshot.confirmedHistory,undefined);
 assert.equal(candidate.data._visitas[0].externalReadCurrent,false);assert.equal(candidate.data._visitas[0].sourceReadAt,'2026-05-30T12:00:00Z');
 b.window.CX_TYA_PUBLISH_LIVE_SNAPSHOT_CANDIDATE(candidate,{suppressEvents:true});assert.equal(b.window.CX_TYA_HR_SOURCE_SAFE.visits.length,1);
 const selected=b.window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE(s,{revision:'a'.repeat(64)},{periodId:'qa-project-2026-05'});assert.equal(selected.data.currentPeriodId,'qa-project-2026-05');
});
test('history from a different scope is rejected before atomic publication',()=>{
 const b=protectedBrowser(),s={...snapshot,confirmedHistory:{schemaVersion:'cxorbia.hr-confirmed-history.v1',tenantId:'foreign',projectId:'qa-project',externalReadCurrent:false}};
 assert.throws(()=>b.window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE(s,{}),/HR_HISTORY_SCOPE_INVALID/);
});
test('an explicit historical view pauses automatic polling and its manual refresh keeps the same period',async()=>{
 const b=protectedBrowser(),calls=[];b.publish('a'.repeat(64),new Date().toISOString(),true);
 b.window.CX_PROTECTED_AUTH_HR_AUTHORITY.readScope={mode:'explicit_period',requestedPeriodId:'qa-project-2026-05'};
 b.window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY=async(reason,options)=>{calls.push({reason,options});return {ok:true};};
 b.ctx.fetch=()=>{throw Error('UNEXPECTED_PROVIDER_READ');};vm.runInContext(watcher,b.ctx);
 assert.equal((await b.window.CX_TYA_CHECK_LIVE_SOURCE('poll')).reason,'historical_period_on_demand_only');assert.equal(calls.length,0);
 await b.window.CX_TYA_CHECK_LIVE_SOURCE('manual');assert.equal(calls.length,1);assert.equal(calls[0].options.periodId,'qa-project-2026-05');
});
test('watcher handoff reuses its verified provider revision instead of forcing a second read',async()=>{
 const consume=fn(bridge,'async function consumeHrPrefetch(','\nfunction sessionProfile('),calls=[];
 const h=new Function('fetchHr',`let hrPrefetch={key:'old'};${consume};return consumeHrPrefetch;`)(async(scope,options)=>{calls.push(options);return {runtime:{revision:'new'}};});
 await h(binding.scope,{expectedRevision:'new'});assert.equal(calls.length,1);assert.equal(calls[0].forceFresh,false);
 await assert.rejects(h(binding.scope,{expectedRevision:'different'}),/REVISION_CHANGED_DURING_COMPOSITION/);
});

test('actual C6 shell releases an atomic last-confirmed view and does not remount on repeated ready events',()=>{
  const b=protectedBrowser();
  const human=fn(c6,'  function humanAuthorityReady(){','\n  function requestHumanAuthority(');
  const gate=fn(c6,'  function installHumanAuthorityGate(){','\n\n  forceUnifiedConfig();');
  b.ctx.str=v=>String(v??'').trim();b.ctx.arr=v=>Array.isArray(v)?v:[];b.ctx.requestHumanAuthority=()=>{};
  vm.runInContext(human+gate+'\ninstallHumanAuthorityGate();this.humanReady=humanAuthorityReady;',b.ctx);
  b.CX.router.mount();assert.equal(b.window.CX_C6_HR_AUTHORITY_GATE.ready,false);assert.equal(b.mounts.length,0);
  b.publish('a'.repeat(64),'2026-11-24T08:00:00.000Z',false);
  assert.equal(b.ctx.humanReady(),true);assert.equal(b.window.CX_TYA_HR_VIVA_SOURCE_SAFE,false);
  b.window.dispatchEvent({type:'cx:protected-auth-hr-authority-ready'});b.window.dispatchEvent({type:'cx:live-source-updated'});b.flush();
  assert.equal(b.window.CX_C6_HR_AUTHORITY_GATE.ready,true);assert.equal(b.mounts.length,1);
  b.window.dispatchEvent({type:'cx:protected-auth-hr-authority-ready'});b.flush();assert.equal(b.mounts.length,1);
  b.window.CX_PROTECTED_AUTH_HR_AUTHORITY.sourceRevision='b'.repeat(64);assert.equal(b.ctx.humanReady(),false);
});

test('actual watcher preserves stale freshness, confirms same revision and converges after one different-revision composition',async()=>{
  const b=protectedBrowser(),a='a'.repeat(64),next='b'.repeat(64),first='2026-11-24T08:00:00.000Z';
  b.publish(a,first,false);const calls=[],schedules=[],responses=[];
  b.window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE=(...args)=>schedules.push(args);
  b.ctx.fetch=async url=>{calls.push(url);const value=responses.shift();if(value instanceof Error)throw value;return {ok:true,json:async()=>value};};
  vm.runInContext(watcher,b.ctx);
  // A recovered durable view triggers an immediate background external check;
  // a provider failure retains its real last-confirmed timestamp and revision.
  responses.push(Error('EXTERNAL_PROVIDER_DOWN'));
  await b.listeners['cx:protected-auth-hr-authority-ready'].at(-1)();
  assert.equal(calls.length,1);assert.equal(b.CX.data.previewMeta.externalReadCurrent,false);assert.equal(b.CX.data.previewMeta.sourceReadAt,first);
  // Subsequent transitions are explicit reads; automatic polling is separately
  // covered with a virtual clock in the VRM372 budget tests.
  const meta=(revision,at)=>({revision,sourceReadAt:at,externalReadCurrent:true,sourceSafe:true,runtimeRead:true});
  responses.push(meta(a,'2026-11-24T09:00:00.000Z'));
  assert.equal((await b.window.CX_TYA_CHECK_LIVE_SOURCE('qa_explicit_refresh')).changed,false);
  assert.equal(b.CX.data.previewMeta.externalReadCurrent,true);assert.equal(schedules.length,0);
  responses.push(meta(next,'2026-11-24T10:00:00.000Z'));
  assert.equal((await b.window.CX_TYA_CHECK_LIVE_SOURCE('qa_explicit_refresh')).delegated,true);
  assert.deepEqual(JSON.parse(JSON.stringify(schedules)),[['live_watcher_revision_change',true,{expectedRevision:next}]]);
  b.publish(next,'2026-11-24T10:00:00.000Z',true);
  // The explicit next probe supplies the new independent observation; an
  // additional ready event here would also be due for this historical timestamp.
  responses.push(meta(next,'2026-11-24T10:01:00.000Z'));
  assert.equal((await b.window.CX_TYA_CHECK_LIVE_SOURCE('qa_explicit_refresh')).changed,false);assert.equal(schedules.length,1);
  assert.equal(b.CX.data.previewMeta.sourceRevision,next);assert.equal(b.CX.data.previewMeta.sourceReadAt,'2026-11-24T10:01:00.000Z');
  assert.ok(calls.every(url=>new URL(url,'https://example.invalid').searchParams.get('fresh')==='1'));
});

test('watcher-triggered bridge refresh discards prior prefetch and requests strict authenticated presentation',async()=>{
  const consume=fn(bridge,'async function consumeHrPrefetch(','\nfunction sessionProfile(');
  const calls=[],old={key:'old',promise:Promise.resolve({ok:true,value:{revision:'old'},receivedAt:Date.now()})};
  const h=new Function('fetchHr','initial',`let hrPrefetch=initial;${consume};return {consumeHrPrefetch,prefetch:()=>hrPrefetch};`)
    (async(scope,options)=>{calls.push({scope,options});return {revision:'next'};},old);
  const value=await h.consumeHrPrefetch(binding.scope,{forceFresh:true});
  assert.equal(value.revision,'next');assert.equal(h.prefetch(),null);assert.deepEqual(calls,[{scope:binding.scope,options:{forceFresh:true,periodId:undefined}}]);
  const query=fn(bridge,'function queryUrl(','\nasync function fetchHr(');
  const url=new Function('endpointFor','URLSearchParams',query+'\nreturn queryUrl;')(()=>'/hr',URLSearchParams)(binding.scope,{forceFresh:true});
  const params=new URL(url,'https://example.invalid').searchParams;
  assert.equal(params.get('protectedState'),'1');assert.equal(params.get('fresh'),'1');assert.equal(params.get('readModel'),'1');
  assert.match(bridge,/expectedRevision:options.expectedRevision/);
});

test('a recovered snapshot without a history bank still marks every visible visit as stale',()=>{
 const b=protectedBrowser(),copy=structuredClone(snapshot),at='2026-11-23T12:00:00.000Z';
 const candidate=b.window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE(copy,{revision:'a'.repeat(64),externalReadCurrent:false,sourceReadAt:at});
 assert.ok(candidate.data._visitas.length>0);
 assert.ok(candidate.data._visitas.every(v=>v.externalReadCurrent===false&&v.sourceReadAt===at));
 assert.equal(candidate.snapshot.visits[0].externalReadCurrent,undefined);
});
test('manual refresh discovers new tabs while automatic polling retains its inventory cache',()=>{
 const b=protectedBrowser(),calls=[];b.publish('a'.repeat(64),new Date().toISOString(),true);
 b.ctx.fetch=async url=>{calls.push(url);return {ok:true,json:async()=>({sourceSafe:true,runtimeRead:true,revision:'a'.repeat(64),externalReadCurrent:true,sourceReadAt:new Date().toISOString()})};};
 vm.runInContext(watcher,b.ctx);
 return b.window.CX_TYA_CHECK_LIVE_SOURCE('manual').then(()=>{assert.equal(new URL(calls.at(-1),'https://example.invalid').searchParams.get('inventory'),'1');});
});
