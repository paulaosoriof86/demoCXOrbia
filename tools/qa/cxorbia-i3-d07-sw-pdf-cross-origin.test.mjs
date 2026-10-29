import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/sw.js',import.meta.url),'utf8');

function fixture(){
  const listeners=new Map(),fetches=[];
  const origin='https://cxorbia-backend-dev--preview.web.app';
  const self={location:{origin},addEventListener:(name,cb)=>listeners.set(name,cb)};
  const response={ok:true,clone(){return this;}};
  const caches={open:async()=>({put:async()=>{}}),match:async()=>null};
  vm.runInNewContext(source,{self,CX_BUILD_ID:'I3-D07-TEST',importScripts(){},caches,
    fetch:async request=>{fetches.push(request.url);return response;},Response:{error:()=>({ok:false})},URL});
  const dispatch=(url,headers={})=>{
    const result={responded:false,response:null};
    const request={url,method:'GET',headers,mode:'cors'};
    listeners.get('fetch')({request,respondWith(promise){result.responded=true;result.response=promise;}});
    return result;
  };
  return {origin,dispatch,fetches};
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
