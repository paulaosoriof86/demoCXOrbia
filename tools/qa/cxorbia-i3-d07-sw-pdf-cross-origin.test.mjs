import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/sw.js',import.meta.url),'utf8');

function fixture({offline=false}={}){
  const listeners=new Map(),fetches=[],cacheActions=[];
  const origin='https://cxorbia-backend-dev--preview.web.app';
  const self={location:{origin},addEventListener:(name,cb)=>listeners.set(name,cb)};
  const response={ok:true,clone(){return this;}};
  const caches={open:async()=>({put:async()=>{cacheActions.push('put');}}),match:async()=>{cacheActions.push('match');return {ok:true,privateActor:'previous'};}};
  vm.runInNewContext(source,{self,CX_BUILD_ID:'I3-D07-TEST',importScripts(){},caches,
    fetch:async(request,options)=>{fetches.push({url:request.url,cache:options?.cache});if(offline)throw Error('OFFLINE');return response;},Response:{error:()=>({ok:false})},URL});
  const dispatch=(url,headers={},cache='default')=>{
    const result={responded:false,response:null};
    const request={url,method:'GET',headers:new Headers(headers),mode:'cors',cache};
    listeners.get('fetch')({request,respondWith(promise){result.responded=true;result.response=promise;}});
    return result;
  };
  return {origin,dispatch,fetches,cacheActions};
}

test('D07 authenticated Storage PDF GET bypasses service worker interception and CacheStorage',()=>{
  const h=fixture();
  const request=h.dispatch('https://firebasestorage.googleapis.com/v0/b/dev/o/private.pdf?alt=media',
    {Authorization:'Firebase SYNTHETIC_NEVER_REAL'});
  assert.equal(request.responded,false,'browser must own authenticated cross-origin reads');
  assert.equal(h.fetches.length,0,'service worker must not replay or cache protected Storage requests');
});

test('D07 unrelated cross-origin resources bypass PWA cache while same-origin runtime remains fail-closed',async()=>{
  const h=fixture();
  assert.equal(h.dispatch('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/pdf.min.js').responded,false);
  assert.equal(h.dispatch(h.origin+'/core/backend-resources.js').responded,true);
  assert.equal(h.fetches.length,1);
});
for(const route of ['/api/tenants/t/projects/p/certifications/shopper-resources?periodId=x','/v1/cxorbia/commands','/api/hr-live'])test('protected API is native-network-only: '+route,()=>{
 const h=fixture();for(const actor of ['A','B'])assert.equal(h.dispatch(h.origin+route,{Authorization:'Bearer SYNTHETIC_'+actor},'no-store').responded,false);
 assert.equal(h.fetches.length,0);assert.deepEqual(h.cacheActions,[]);
});
test('API requests without explicit no-store force a fresh fetch and never cache',async()=>{
 const h=fixture(),r=h.dispatch(h.origin+'/api/public-source');assert.equal(r.responded,true);await r.response;assert.equal(h.fetches[0].cache,'no-store');assert.deepEqual(h.cacheActions,[]);
});
test('Authorization on another path forces no-store; explicit no-store bypasses the worker',async()=>{
 const h=fixture(),r=h.dispatch(h.origin+'/protected-report',{Authorization:'Bearer SYNTHETIC'});assert.equal(r.responded,true);await r.response;assert.equal(h.fetches[0].cache,'no-store');
 assert.equal(h.dispatch(h.origin+'/fresh-data',{},'no-store').responded,false);assert.equal(h.fetches.length,1);assert.deepEqual(h.cacheActions,[]);
});
test('offline API and a changed principal never receive the stale private cache entry',async()=>{
 const h=fixture({offline:true});for(const actor of ['A','B']){const r=h.dispatch(h.origin+'/api/private',{Authorization:'Bearer SYNTHETIC_'+actor});assert.equal(r.responded,true);await assert.rejects(r.response,/OFFLINE/);}
 assert.deepEqual(h.cacheActions,[]);assert.ok(h.fetches.every(x=>x.cache==='no-store'));
});
