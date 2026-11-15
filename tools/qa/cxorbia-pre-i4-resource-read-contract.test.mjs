import test from 'node:test';
import assert from 'node:assert/strict';
import {validateFocalResourceRead} from './cxorbia-pre-i4-resource-read-contract.mjs';
import {shopperResourceProjection} from '../../backend/runtime/hr-live-service/certification-runtime.mjs';
function fixture(){
  const expected={kind:'shopper',uid:'uid',shopperId:'s',tenantId:'t',projectId:'p',periodId:'p-2026-11',origin:'https://dev.example'};
  const principal={uid:'uid',shopperId:'s',authenticated:true,role:'shopper',authNamespace:'shopper',tenantId:'t'};
  const item={id:'guide',tenantId:'t',projectId:'p',periodId:'p-2026-10',inheritedProjectGuide:true,
    resourceType:'project_resource',status:'active',visibleRoles:['shopper'],version:3,n:'Instructivo Shopper'};
  const bank={id:'bank',tenantId:'t',projectId:'p',periodId:expected.periodId,resourceType:'certification_bank',status:'active',visibleRoles:['shopper'],
    bank:{estado:'published',preguntas:[{q:'Question',ops:['A','B']}]}};
  const resources={status:{status:'ready',source:'verified-server-projection',tenantId:'t',projectId:'p',periodId:expected.periodId,count:2},
    staticResourceSeedIds:[],rows:[{id:'guide',name:item.n,version:3,status:'active'}]};
  const remote={url:'https://dev.example/api/tenants/t/projects/p/certifications/shopper-resources?periodId='+expected.periodId,
    method:'GET',status:200,authorizationPresent:true,fromServiceWorker:false,
    body:{ok:true,providerAck:true,production:false,source:'verified_shopper_projection',periodId:expected.periodId,count:2,items:[item,bank]}};
  return {resources,principal,expected,remote};
}
test('approved Shopper projection with current authenticated provider ACK and exact visible guide passes',()=>{
  const input=fixture(),r=validateFocalResourceRead(input);
  assert.equal(r.decision,'PASS_FOCAL_SHOPPER_AUTHENTICATED_SERVER_RESOURCE_AUTHORITY');
  assert.equal(r.visibleReadback,true);assert.equal(r.writes,0);assert.equal(r.safeProjection,true);
});
test('operator continues to require Firestore authority on the exact current scope',()=>{
  const x=fixture();x.expected.kind='admin';x.principal.role='super';x.resources.status.source='firestore';x.remote=null;
  assert.equal(validateFocalResourceRead(x).decision,'PASS_FOCAL_OPERATOR_RESOURCE_AUTHORITY');
  x.resources.status.source='verified-server-projection';assert.throws(()=>validateFocalResourceRead(x),/OPERATOR_SOURCE/);
});
test('real server output preserves reusable project resources and published banks from prior periods',()=>{
  const x=fixture(),scope={tenantId:'t',projectId:'p',periodId:x.expected.periodId};
  const bank=shopperResourceProjection({...x.remote.body.items[1],periodId:'p-2026-10',tipo:'certification_bank'},scope);
  const resource=shopperResourceProjection({...x.remote.body.items[0],n:'Checklist operativo',inheritedProjectGuide:undefined,tipo:'pdf',
    storagePath:'tenants/t/projects/p/periods/p-2026-10/resources/guide.pdf'},scope);
  assert.ok(bank);assert.ok(resource);assert.equal(bank.inheritedProjectGuide,undefined);assert.equal(resource.inheritedProjectGuide,undefined);
  x.remote.body.items=[resource,bank];x.resources.rows[0].name=resource.n;
  assert.equal(validateFocalResourceRead(x).visibleReadback,true);
  delete x.remote.body.items[0].periodId;
  assert.equal(validateFocalResourceRead(x).visibleReadback,true);
});
for(const patch of [{qaOnly:true},{visitId:'specific-visit'},{tipo:'pdf',storagePath:'tenants/other/projects/p/periods/p-2026-10/resources/file.pdf'}])
  test('cross-period resource does not inherit when it is QA, visit-scoped or stored elsewhere '+JSON.stringify(patch),()=>{
    const x=fixture();Object.assign(x.remote.body.items[0],patch);
    assert.throws(()=>validateFocalResourceRead(x),/PROVIDER_ROW_SCOPE/);
  });
for(const [name,change,code] of [
  ['source label alone',x=>x.remote=null,'AUTHENTICATED_GET'],
  ['missing remote ACK',x=>x.remote.body.providerAck=false,'PROVIDER_ACK'],
  ['another principal',x=>x.principal.uid='other','PRINCIPAL'],
  ['another shopper',x=>x.principal.shopperId='other','SHOPPER'],
  ['stale period',x=>x.resources.status.periodId='p-2026-09','SCOPE'],
  ['another project endpoint',x=>x.remote.url=x.remote.url.replace('/projects/p/','/projects/other/'),'AUTHENTICATED_GET'],
  ['missing authorization',x=>x.remote.authorizationPresent=false,'AUTHENTICATED_GET'],
  ['service worker response',x=>x.remote.fromServiceWorker=true,'AUTHENTICATED_GET'],
  ['answer key leak',x=>x.remote.body.items[1].bank.preguntas[0].correcta='A','SAFE_BANK'],
  ['hidden key in project resource',x=>x.remote.body.items[0].answerKey='A','SAFE_RESOURCE'],
  ['changed visible version',x=>x.resources.rows[0].version=2,'VISIBLE_READBACK'],
  ['unknown visible row',x=>x.resources.rows[0].id='local-seed','VISIBLE_READBACK'],
  ['wrong resource tenant',x=>x.remote.body.items[0].tenantId='other','PROVIDER_ROW_SCOPE'],
  ['duplicate provider row',x=>{x.remote.body.items.push(x.remote.body.items[0]);x.remote.body.count++;},'PROVIDER_DUPLICATES']
])test('resource authority rejects '+name,()=>{
  const x=fixture();change(x);assert.throws(()=>validateFocalResourceRead(x),new RegExp(code));
});
