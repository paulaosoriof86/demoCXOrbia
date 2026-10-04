import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('app/adapters/cxorbia-command-adapter-v1.js','utf8');

function load(){
  let tick=0;
  class AdvancingDate extends Date{
    constructor(...args){super(...(args.length?args:[1700000000000+(tick++*1000)]));}
  }
  const CX={
    BACKEND:{enableCommandWrites:true,tenantId:'tya'},
    backendAuth:{context:()=>({actorId:'admin-1',role:'super',tenantId:'tya',projectIds:['cinepolis'],shopperId:null})},
    session:{user:{},effectiveRole:()=> 'super'}
  };
  const context={CX,CX_BUILD_LOCK:{version:'vrm216-test'},Date:AdvancingDate,console};
  vm.createContext(context);
  vm.runInContext(source,context,{filename:'cxorbia-command-adapter-v1.js'});
  return context.CX.commandAdapter;
}

function input(payload={canonicalShopperId:'shopper-a',aliasShopperIds:['shopper-b']}){
  return {
    commandType:'shopper.identity.adjudicate',entityType:'shopper',entityId:'shopper-a',
    tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10',
    actor:{actorId:'admin-1',role:'super',projectIds:['cinepolis']},
    expectedVersion:'source-current',idempotencyKey:'same-key',
    payload,source:'admin-shopper-identity-adjudication',
    authorization:{providerEnforcementRequired:true,permission:'shopper.identity.adjudicate',humanAdjudicationRequired:true}
  };
}

test('VRM-216 shared adapter emits a stable semantic command across wall-clock time',()=>{
  const adapter=load();
  const a=adapter.build(input()),b=adapter.build(input());
  assert.equal(a.ok,true);assert.equal(b.ok,true);
  assert.equal(a.command.requestedAt,null);
  assert.equal(b.command.requestedAt,null);
  assert.deepEqual(JSON.parse(JSON.stringify(a.command)),JSON.parse(JSON.stringify(b.command)));
});

test('VRM-216 exact replay succeeds with zero writes while changed payload under same key remains blocked',async()=>{
  const adapter=load(),receipts=new Map();
  adapter.registerTransport('probe',{execute:async command=>{
    const digest=JSON.stringify(command),prior=receipts.get(command.idempotencyKey);
    if(prior&&prior!==digest)return{ok:false,status:'blocked',providerAck:false,code:'IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD'};
    if(prior)return{ok:true,status:'committed',providerAck:true,idempotentReplay:true,providerWrites:0,entityId:command.entityId};
    receipts.set(command.idempotencyKey,digest);
    return{ok:true,status:'committed',providerAck:true,idempotentReplay:false,providerWrites:1,entityId:command.entityId};
  }});
  adapter.useTransport('probe');
  const first=await adapter.execute(input()),second=await adapter.execute(input());
  assert.equal(first.ok,true);assert.equal(first.providerWrites,1);
  assert.equal(second.ok,true);assert.equal(second.providerAck,true);assert.equal(second.idempotentReplay,true);assert.equal(second.providerWrites,0);
  const changed=await adapter.execute(input({canonicalShopperId:'shopper-a',aliasShopperIds:['shopper-c']}));
  assert.equal(changed.ok,false);assert.equal(changed.code,'IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');assert.equal(changed.providerWrites,0);
});
