import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const app=fs.readFileSync(new URL('../../app/app.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../../app/sw.js',import.meta.url),'utf8');
const start=app.indexOf('CX.setupPWA = function(){');
const end=app.indexOf('\n};\n\nCX.app =',start);
assert.ok(start>=0&&end>start,'PWA owner present in exact source');
const owner=app.slice(start,end+3);
function boot(controller){
 let reloadCount=0,claimHandler=null,registrationCount=0;
 const CX={ui:{toast(){}}};
 const navigator={userAgent:'',serviceWorker:{
   controller:controller?{}:null,
   register(){registrationCount++;return Promise.resolve({update(){}});},
   addEventListener(event,fn){if(event==='controllerchange')claimHandler=fn;}
 }};
 const window={navigator:{standalone:false},matchMedia(){return {matches:false}},MSStream:null};
 vm.runInNewContext(owner,{CX,window,navigator,location:{reload(){reloadCount++;}},sessionStorage:{getItem(){return null},setItem(){}},setTimeout(){}});
 CX.setupPWA();
 assert.equal(registrationCount,1);
 assert.equal(typeof claimHandler,'function');
 return {claim:claimHandler,window,count:()=>reloadCount};
}
test('first service-worker claim does not interrupt login or authentication',()=>{
 const x=boot(false);x.claim();assert.equal(x.count(),0);
 assert.equal(x.window.CX_PWA_UPDATE_PENDING.reloadDeferred,true);
});
test('service-worker upgrade preserves authenticated session and in-flight writes',()=>{
 const x=boot(true);x.claim();assert.equal(x.count(),0);
 assert.equal(x.window.CX_PWA_UPDATE_PENDING.runtimeAssetsNetworkOnly,true);
});
test('repeat controllerchange cannot force navigation or duplicate sign-in',()=>{
 const x=boot(true);x.claim();x.claim();assert.equal(x.count(),0);
});
test('service-worker executable app assets remain network-only and fail-closed',()=>{
 assert.match(sw,/CX_RUNTIME_PREFIXES/);
 assert.match(sw,/if \(isFailClosedRequest\(e\.request\)\)/);
 assert.match(sw,/cache:'no-store'/);
});
test('no forced location reload belongs to PWA upgrade callback',()=>{
 assert.doesNotMatch(owner,/location\.reload\(\)/);
});
