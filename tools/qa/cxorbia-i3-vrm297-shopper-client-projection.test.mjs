import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const sources={
  client:readFileSync('app/core/backend-certifications.js','utf8'),
  resources:readFileSync('app/core/backend-resources.js','utf8'),
  cert:readFileSync('app/modules/cert.js','utf8')
};
const qaScope={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10'};
const sanitized={id:'qa-published',projectId:'cinepolis',periodId:qaScope.periodId,status:'active',
  resourceType:'certification_bank',visibleRoles:['shopper'],bank:{estado:'published',certificationId:'main',
    preguntas:[{q:'QA Question',ops:['A','B']}]}};

function sandbox(extra={}){
  const calls=[];
  const ctx={
    CX:{BACKEND:{enabled:true,tenantId:'tya'},data:{currentProjectId:'cinepolis',currentPeriodId:qaScope.periodId,ctx:()=>({...qaScope})},
      session:{role:'shopper',user:{shopperId:'qa-shopper'},effectiveRole:()=> 'shopper'},bus:{emit:()=>{}}},
    firebase:{apps:[{}],auth:()=>({currentUser:{uid:'qa-auth',getIdToken:async()=> 'QA_TOKEN'}}),
      firestore:()=>({collection:()=>({doc:()=>({collection:()=>({where:()=>{throw new Error('DIRECT_FIRESTORE_READ_FORBIDDEN');}})})})})},
    Date,JSON,Map,Set,Math,Object,Array,String,Number,Promise,Error,
    document:{readyState:'loading',addEventListener:()=>{}},console,setTimeout,addEventListener:()=>{},
    fetch:async(url,options)=>{calls.push({url,options});return {ok:true,status:200,json:async()=>({ok:true,providerAck:true,items:[sanitized]})};},
    ...extra
  };
  ctx.window=ctx;
  vm.createContext(ctx);
  return {ctx,calls};
}

test('VRM297 Shopper loads only the authenticated GET projection and caches no key',async()=>{
  const {ctx,calls}=sandbox();
  vm.runInContext(sources.client,ctx);vm.runInContext(sources.resources,ctx);
  const rows=await ctx.CX.backendResources.load();
  assert.equal(rows.length,1);assert.equal(rows[0].id,'qa-published');
  assert.equal(calls.length,1);
  assert.match(calls[0].url,/certifications\/shopper-resources\?periodId=cinepolis-2026-10$/);
  assert.equal(calls[0].options.method,'GET');
  assert.equal(calls[0].options.headers.Authorization,'Bearer QA_TOKEN');
  assert.equal(JSON.stringify(ctx.CX.backendResources.items).includes('correcta'),false);
});

test('VRM297 frontend fails closed if server projection unexpectedly carries keys',async()=>{
  const leaked={...sanitized,bank:{...sanitized.bank,preguntas:[{q:'QA',ops:['A','B'],correcta:'A'}]}};
  const {ctx}=sandbox({fetch:async()=>({ok:true,status:200,json:async()=>({ok:true,providerAck:true,items:[leaked]})})});
  vm.runInContext(sources.client,ctx);vm.runInContext(sources.resources,ctx);
  await assert.rejects(ctx.CX.backendResources.load(),/CERT_SHOPPER_PROJECTION_UNSAFE/);
  assert.equal(ctx.CX.backendResources.items.length,0);
  assert.equal(ctx.CX_BACKEND_RESOURCES_STATUS.status,'blocked');
});

test('VRM297 preview submits only chosen options, never client-side answer keys',async()=>{
  const {ctx,calls}=sandbox({fetch:async(url,options)=>{
    calls.push({url,options});return {ok:true,status:200,json:async()=>({ok:true,providerAck:true,preview:true,providerWrites:0,score:100,pass:true,feedback:[]})};
  }});
  vm.runInContext(sources.client,ctx);
  const result=await ctx.CX.backendCertifications.previewAttempt({periodId:qaScope.periodId,bankResourceId:'qa-preview',answers:['A']});
  assert.equal(result.preview,true);
  assert.match(calls[0].url,/\/certifications\/practice$/);
  assert.equal(calls[0].options.method,'POST');
  assert.deepEqual(JSON.parse(calls[0].options.body).answers,['A']);
  assert.equal(sources.cert.includes('mine.trim().toLowerCase()==='),false);
  assert.match(sources.cert,/CX\.backendCertifications\.previewAttempt/);
});
