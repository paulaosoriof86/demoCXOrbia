'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(process.argv[2]||'.');
const serverSource=fs.readFileSync(path.join(root,'backend/runtime/hr-live-service/server.mjs'),'utf8');
const visualSource=fs.readFileSync(path.join(root,'backend/runtime/hr-live-service/dev-visual.mjs'),'utf8');
const scripts=['tools/hr-source/tya-live-provider-registry-identity-dev.mjs','tools/hr-source/tya-build-live-hr-source-safe-r20.mjs','tools/hr-source/tya-enforce-live-tab-registry.mjs','tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs','tools/hr-source/tya-reapply-canonical-state-r20.mjs','tools/qa/tya-live-hr-read-probe-gate.mjs'];
function fixture(){
  const calls={providerReconcile:0,durableWrites:0,reads:0,children:[],network:[],localCleanup:0,mockListen:0};
  let handler;
  const snapshot={tenantId:'tya',projectId:'cinepolis',generatedAt:new Date().toISOString(),sourceSafe:true,imported:false,firestoreWrites:0,periods:[{key:'2026-10'}],visits:[{id:'v',shopperId:'s'}],shoppers:[{id:'s'}],source:{}};
  const denyWriter=()=>{calls.durableWrites++;throw new Error('UNEXPECTED_DURABLE_WRITER');};
  function query(p){return {collection:n=>query(p+'/'+n),doc:n=>query(p+'/'+n),where:()=>query(p),set:denyWriter,update:denyWriter,create:denyWriter,delete:denyWriter,add:denyWriter,get:async()=>{
    calls.reads++;
    if(/\/users\//.test(p))return {exists:true,data:()=>({active:true,role:context.role,authNamespace:context.role==='shopper'?'shopper':'staff',shopperId:'s',projectIds:['cinepolis']})};
    if(/\/projects\/cinepolis$/.test(p))return {exists:true,data:()=>({name:'Synthetic project'})};
    return {exists:false,docs:[],data:()=>({})};
  }};}
  const db={collection:n=>query(n),batch:denyWriter,runTransaction:denyWriter};
  const auth={verifyIdToken:async token=>{calls.reads++;if(token==='denied')throw new Error('AUTH_FAILURE:SYNTHETIC');return {uid:'uid',role:context.role,authNamespace:context.role==='shopper'?'shopper':'staff',tenantId:'tya',shopperId:'s'};},createUser:denyWriter,updateUser:denyWriter,deleteUser:denyWriter,setCustomUserClaims:denyWriter,revokeRefreshTokens:denyWriter};
  const provider=()=>({reconcileSnapshot:async()=>{calls.providerReconcile++;return {shopperCount:1,visitCount:1,authCreated:0,createdVisits:0,providerWrites:0};}});
  const wrongRoute=()=>{throw new Error('UNEXPECTED_ROUTE');};
  const context={
    crypto,path,URL,URLSearchParams,Buffer,Promise,Map,Set,Date,console:{log(){},warn(){},error(){}},
    fs:{existsSync:()=>false,mkdtempSync:()=>'/virtual-tmp/one',copyFileSync:()=>{throw new Error('UNEXPECTED_COPY');},rmSync:()=>{calls.localCleanup++;},readFileSync:file=>{if(file!=='/virtual-tmp/one/snapshot.js')throw new Error('UNEXPECTED_READ:'+file);return 'window.CX_TYA_HR_SOURCE_SAFE = '+JSON.stringify(snapshot)+';';}},
    os:{tmpdir:()=>'/virtual-tmp'},
    process:{env:{CXORBIA_DEV_OPERATIONAL_NAMES:'true',CXORBIA_DEV_VISUAL_PROFILE_TOKEN_SHA256:crypto.createHash('sha256').update('visual-fixture').digest('hex'),CXORBIA_DEV_VISUAL_PROFILE_TOKEN_EXPIRES_AT:'2999-01-01T00:00:00Z'},execPath:'/stub/node'},
    fileURLToPath:()=>'/virtual/backend/runtime/hr-live-service/server.mjs',
    http:{createServer:fn=>{handler=fn;return {listen:()=>{calls.mockListen++;}};}},
    spawn:(command,args)=>{assert.equal(command,'/stub/node');calls.children.push(args[0]);const stream={on(){}};return {stdout:stream,stderr:stream,on(event,callback){if(event==='close')queueMicrotask(()=>callback(0));}};},
    getApps:()=>[{}],initializeApp(){},applicationDefault:()=>({}),getAuth:()=>auth,getFirestore:()=>db,
    createShopperCommandProvider:provider,createOperationalCommandProvider:provider,
    createHrSnapshotReconciler:()=>wrongRoute,
    isLiveUserAdminPath:()=>false,maybeHandleLiveUserAdminRequest:wrongRoute,isLegalRuntimePath:()=>false,maybeHandleLegalRuntimeRequest:wrongRoute,
    isCertificationRuntimePath:()=>false,maybeHandleCertificationRuntimeRequest:wrongRoute,isCxorbiaCommandRuntimePath:()=>false,maybeHandleCxorbiaCommandRuntimeRequest:wrongRoute,
    fetch:async(url,options={})=>{const method=options.method||'GET';calls.network.push({url:String(url).split('?')[0],method});if(method!=='GET')throw new Error('UNEXPECTED_FETCH_WRITER');if(String(url).includes('metadata.google.internal'))return {ok:true,json:async()=>({access_token:'fixture-only'})};if(String(url).includes('firestore.googleapis.com'))return {ok:true,text:async()=>JSON.stringify({documents:[]})};throw new Error('UNEXPECTED_NETWORK');},
    role:'admin',fixtureSnapshot:snapshot
  };
  // Strip module syntax to inject inert dependencies; never alter a product function body.
  const isolated=source=>source.replace(/^#!.*\n/,'').replace(/^import .*;\n/gm,'').replaceAll('import.meta.url',"'file:///virtual/server.mjs'").replace(/^export /gm,'');
  vm.createContext(context);
  vm.runInContext(isolated(visualSource)+'\n'+isolated(serverSource),context,{timeout:1000});
  assert.equal(calls.mockListen,1);assert.equal(typeof handler,'function');
  return {calls,async request(q='',{token='',role='admin',cacheMode='none'}={}){
    context.role=role;
    vm.runInContext(cacheMode==='expired'?"cache=materialize(fixtureSnapshot,'runtime_refresh');cache.loadedAt=0;":cacheMode==='hit'?"cache=materialize(fixtureSnapshot,'runtime_refresh');":'cache=null;',context);
    const res={statusCode:0,headers:{},setHeader(k,v){this.headers[k]=v;},end(body=''){this.body=body;}};
    await handler({method:'GET',url:'/v1/tenants/tya/projects/cinepolis/hr-live'+q,headers:{host:'fixture.invalid',authorization:token?'Bearer '+token:''}},res);
    const active=vm.runInContext('inFlight',context);if(active)await active.catch(()=>{});
    for(let i=0;i<8;i++)await Promise.resolve();
    return res;
  }};
}
function noDurableEffects(p){
  assert.equal(p.calls.providerReconcile,0,'GET must never call a reconciliation provider');
  assert.equal(p.calls.durableWrites,0,'GET must never call Auth/Firestore mutators');
  assert.ok(p.calls.network.every(x=>x.method==='GET'),'visual endpoint only reads');
}
const queries=['','?format=json','?format=meta','?format=js','?fresh=1','?fresh=1&format=meta','?protectedState=1','?fresh=1&protectedState=1','?fresh=1&protectedState=1&format=meta','?view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV'];
for(const cacheMode of ['none','expired','hit'])for(const q of queries)test('G05 GET '+(q||'default')+' cache='+cacheMode,async()=>{
  const p=fixture(),r=await p.request(q,{cacheMode,token:'valid'});assert.equal(r.statusCode,200);
  assert.deepEqual(p.calls.children,cacheMode!=='hit'||q.includes('fresh=1')?scripts:[],'freshness pipeline preserved');noDurableEffects(p);
});
for(const token of ['','denied'])test('G05 rejected protected principal '+(token||'missing'),async()=>{
  const p=fixture(),r=await p.request('?fresh=1&protectedState=1',{token});assert.equal(r.statusCode,503);assert.deepEqual(p.calls.children,scripts);noDurableEffects(p);
});
test('G05 protected shopper observes without reconciliation',async()=>{
  const p=fixture(),r=await p.request('?fresh=1&protectedState=1',{token:'valid',role:'shopper'});assert.equal(r.statusCode,200);noDurableEffects(p);
});
for(const token of ['visual-fixture',''])test('G05 full-profile '+(token?'authorized':'rejected'),async()=>{
  const p=fixture(),r=await p.request('?view=full-profile',{token});assert.equal(r.statusCode,token?200:401);
  assert.equal(p.calls.children.length,0,'visual request exits before HR refresh');assert.equal(p.calls.network.length,token?7:0);noDurableEffects(p);
});
