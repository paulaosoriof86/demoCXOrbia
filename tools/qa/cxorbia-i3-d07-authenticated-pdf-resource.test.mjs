import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/core/backend-resources.js',import.meta.url),'utf8');
const PDF=new Uint8Array([37,80,68,70,45,49,46,55,10,37,37,69,79,70]);

function fixture(){
  const scope={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10'};
  const resource={id:'res-1olqhkg',tenantId:'tya',projectId:scope.projectId,
    periodId:scope.periodId,status:'active',tipo:'pdf',resourceType:'project_resource',
    visibleRoles:['shopper','admin'],targetAll:false,
    storagePath:'tenants/tya/projects/cinepolis/periods/cinepolis-2026-10/resources/res-18gkwuj/Instructivo_Shopper.pdf'};
  let currentUser={uid:'shopper-test-uid',getIdToken:async()=> 'SYNTHETIC_TOKEN_NOT_REAL'};
  let response={ok:true,status:200,headers:{get:()=>String(PDF.byteLength)},
    arrayBuffer:async()=>PDF.buffer.slice(0)};
  const calls=[];
  const auth={get currentUser(){return currentUser;}};
  const firebase={apps:[{}],auth:()=>auth,app:()=>({options:{storageBucket:'cxorbia-backend-dev.firebasestorage.app'}})};
  const CX={BACKEND:{enabled:true,tenantId:scope.tenantId},data:{currentProjectId:scope.projectId,
      currentPeriodId:scope.periodId,ctx:()=>({projectId:scope.projectId,periodId:scope.periodId})},
    session:{role:'shopper',effectiveRole(){return this.role;}},bus:{on(){}}};
  const context={window:{firebase,CX},CX,firebase,console,Date,Uint8Array,
    document:{readyState:'loading',addEventListener(){}},
    fetch:async(url,options)=>{calls.push({url,options});return response;}};
  vm.runInNewContext(source,context);
  CX.backendResources.items=[resource];
  return {CX,scope,resource,calls,setUser:u=>{currentUser=u;},
    setResponse:r=>{response=r;},PDF};
}

test('D07 authenticates a single role-scoped PDF read without public download tokens',async()=>{
  const h=fixture(),result=await h.CX.backendResources.readPublishedPdf(h.resource,h.scope);
  assert.equal(result.ok,true);
  assert.equal(result.status,'read');
  assert.deepEqual(Array.from(result.bytes),Array.from(h.PDF));
  assert.equal(h.calls.length,1);
  assert.match(h.calls[0].url,/firebasestorage\.googleapis\.com\/v0\/b\/cxorbia-backend-dev/);
  assert.match(h.calls[0].url,/resources%2Fres-18gkwuj%2FInstructivo_Shopper\.pdf/);
  assert.match(h.calls[0].options.headers.Authorization,/^Firebase SYNTHETIC_TOKEN_NOT_REAL$/);
  assert.doesNotMatch(h.calls[0].url,/token=|SYNTHETIC_TOKEN/);
  assert.equal(h.calls[0].options.credentials,'omit');
});
test('D07 never accesses Storage when Firebase Auth is absent',async()=>{
  const h=fixture();h.setUser(null);
  const result=await h.CX.backendResources.readPublishedPdf(h.resource,h.scope);
  assert.equal(result.ok,false);assert.equal(result.code,'RESOURCE_READ_AUTH_REQUIRED');assert.equal(h.calls.length,0);
});
test('D07 rejects cross-project or other period Storage paths before requesting bytes',async()=>{
  const h=fixture();
  const wrong={...h.resource,storagePath:h.resource.storagePath.replace('/cinepolis/','/other-project/')};
  let r=await h.CX.backendResources.readPublishedPdf(wrong,h.scope);
  assert.equal(r.code,'RESOURCE_READ_STORAGE_SCOPE_MISMATCH');
  const wrongPeriod={...h.resource,storagePath:h.resource.storagePath.replace('cinepolis-2026-10/','cinepolis-2026-09/')};
  r=await h.CX.backendResources.readPublishedPdf(wrongPeriod,h.scope);
  assert.equal(r.code,'RESOURCE_READ_STORAGE_SCOPE_MISMATCH');
  assert.equal(h.calls.length,0);
});
test('D07 does not read a withdrawn/unpublished resource even when URL metadata survives',async()=>{
  const h=fixture();h.CX.backendResources.items=[];
  const result=await h.CX.backendResources.readPublishedPdf(h.resource,h.scope);
  assert.equal(result.ok,false);assert.equal(result.code,'RESOURCE_READ_NOT_PUBLISHED_FOR_ROLE');assert.equal(h.calls.length,0);
});
test('D07 returns provider-denied without public token fallback on HTTP 403',async()=>{
  const h=fixture();h.setResponse({ok:false,status:403,headers:{get:()=>''}});
  const result=await h.CX.backendResources.readPublishedPdf(h.resource,h.scope);
  assert.equal(result.ok,false);assert.equal(result.code,'RESOURCE_READ_PROVIDER_DENIED');
  assert.equal(result.httpStatus,403);assert.equal(h.calls.length,1);
});
test('D07 rejects non-PDF responses without ever rendering provider error HTML',async()=>{
  const h=fixture();const body=new Uint8Array([60,104,116,109,108,62]);
  h.setResponse({ok:true,status:200,headers:{get:()=>String(body.length)},arrayBuffer:async()=>body.buffer});
  const result=await h.CX.backendResources.readPublishedPdf(h.resource,h.scope);
  assert.equal(result.ok,false);assert.equal(result.code,'RESOURCE_READ_INVALID_PDF');
});
test('D07 fails closed when identity changes during an in-flight download',async()=>{
  const h=fixture();const body=h.PDF;
  h.setResponse({ok:true,status:200,headers:{get:()=>String(body.length)},
    arrayBuffer:async()=>{h.setUser({uid:'another-user',getIdToken:async()=> 'other'});return body.buffer;}});
  const result=await h.CX.backendResources.readPublishedPdf(h.resource,h.scope);
  assert.equal(result.ok,false);assert.equal(result.code,'RESOURCE_READ_AUTH_SCOPE_CHANGED');
});
test('D07 rejects response over bounded size and protects existing binary-write gate',async()=>{
  const h=fixture();h.setResponse({ok:true,status:200,headers:{get:()=>String(27*1024*1024)},
    arrayBuffer:async()=>{throw Error('should not read oversized bytes');}});
  const result=await h.CX.backendResources.readPublishedPdf(h.resource,h.scope);
  assert.equal(result.ok,false);assert.equal(result.code,'RESOURCE_READ_SIZE_EXCEEDED');
  assert.equal(h.CX.backendResources.storageStatus().authorized,false,'upload restriction must remain unchanged');
});
