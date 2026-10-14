import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../../app/modules/dashboard.js',import.meta.url),'utf8');
function harness(){
  const start=source.indexOf('  const normalizeWaRecipient=(raw)=>{');
  const end=source.indexOf('  /* END HF-20261012-13 exact manual draft helper */',start);
  assert.ok(start>0&&end>start);
  const fragment=source.slice(start,end);
  const toasts=[],opened=[],environment={
    window:{open:(url,target)=>{opened.push({url,target});return {opener:{}};}},
    ui:{toast:(message,level)=>toasts.push({message,level})}
  };
  const h=new Function('window','ui',fragment+' return {normalizeWaRecipient,openExactWaDraft};');
  return {h:h(environment.window,environment.ui),toasts,opened,environment};
}
test('HF13 valid international number opens wa.me with encoded draft, not sent',()=>{
  const s=harness();
  const ok=s.h.openExactWaDraft({shopper:'María',shopperWa:'+502 5555 1234'},'Hola María, ¿agendamos?');
  assert.equal(ok,true);
  assert.equal(s.opened.length,1);
  assert.equal(s.opened[0].url,'https://wa.me/50255551234?text='+encodeURIComponent('Hola María, ¿agendamos?'));
  assert.equal(s.opened[0].target,'_blank');
  assert.match(s.toasts[0].message,/Borrador.*envío debe realizarse/);
  assert.doesNotMatch(s.toasts[0].message,/mensaje enviado|envío confirmado/i);
});
test('HF13 malformed or local-only number fails closed without browser/open log',()=>{
  for(const phone of ['','55551234','+502 abc 5555','+502000','001234567890']){
    const s=harness();const result=s.h.openExactWaDraft({shopper:'Test',whatsapp:phone},'Hola');
    assert.equal(result,false);assert.equal(s.opened.length,0);assert.equal(s.toasts[0].level,'warn');
  }
});
test('HF13 no exact shopper or popup-blocked does not assert success',()=>{
  const noShop=harness();assert.equal(noShop.h.openExactWaDraft({whatsapp:'+504 9988 7766'},'Hola'),false);
  const blocked=harness();blocked.environment.window.open=()=>null;
  assert.equal(blocked.h.openExactWaDraft({shopper:'Test',whatsapp:'+504 9988 7766'},'Hola'),false);
  assert.equal(blocked.toasts[0].level,'warn');
});
test('HF13 all individual Dashboard paths use exact helper; no fake prepared log',()=>{
  assert.match(source,/querySelectorAll\('\.drWa'\)[\s\S]*?openExactWaDraft\(v,/);
  assert.match(source,/querySelectorAll\('\[data-wa\]'\)[\s\S]*?openExactWaDraft\(v,/);
  assert.match(source,/querySelector\('#bdWa'\)[\s\S]*?openExactWaDraft\(v,/);
  assert.doesNotMatch(source,/querySelectorAll\('\[data-wa\]'\)[^\n]*?_pushLog/);
  assert.doesNotMatch(source,/https:\/\/wa\.me\/\?text=/);
});


test('HF28 connected automation templates use tenant Firestore ACK/readback and no localStorage truth',async()=>{
  const records=new Map(),paths=[];
  const makeRef=(path)=>({
    path,
    async get(opts){assert.equal(opts?.source,'server');paths.push(path);return {exists:records.has(path),data:()=>records.get(path)};}
  });
  const db={
    collection(name){return {doc(id){const p=name+'/'+id;return {
      collection(child){return {doc(k){return makeRef(p+'/'+child+'/'+k);}}}
    };}}},
    async runTransaction(fn){return fn({get:ref=>ref.get({source:'server'}),set(ref,value){
      records.set(ref.path,{...records.get(ref.path),...value});
    }});}
  };
  let writes=0,notifies=0;
  const CX={BACKEND:{enabled:true,tenantId:'tenant-a'},bus:{emit(){notifies++;}}};
  const auth={currentUser:{uid:'admin-1'}};
  const app={auth:()=>auth,firestore:()=>db};
  const firebase={apps:[app],app:()=>app};
  const win={CX,firebase};
  const ls={getItem(){return null;},setItem(){writes++;},removeItem(){writes++;}};
  const ctx={CX,window:win,firebase,localStorage:ls,crypto:{randomUUID:()=>String(records.size+1)},Date,Math,console,Promise};
  vm.runInNewContext(readFileSync(new URL('../../app/core/automations.js',import.meta.url),'utf8'),ctx);
  const A=CX.automations;
  assert.equal(A.list().length,0,'no unproven local/default automation authority while connected');
  await assert.rejects(A.update('a_agenda',{plantilla:'Listo'}),/AUTOMATION_REMOTE_READ_REQUIRED/);
  const init=await A.loadConfig();assert.equal(init.ok,true);assert.equal(A.list().length,10);
  const ack=await A.update('a_agenda',{plantilla:'Agenda {fecha}'});
  assert.equal(ack.providerAck,true);assert.equal(ack.readback,true);assert.equal(A.get('a_agenda').plantilla,'Agenda {fecha}');
  const hook=await A.setHookRequested(true);
  assert.equal(hook.providerAck,true);assert.equal(A.hookRequested(),true);assert.equal(A.hookConfigured(),false);
  assert.equal(records.get('tenants/tenant-a/automations/tenant-event-templates').providerChannelActive,false);
  assert.equal(writes,0,'no connected-mode localStorage writes');
  CX.BACKEND.tenantId='tenant-b';
  assert.equal(A.list().length,0,'no previous tenant templates leak');
  await A.loadConfig();assert.equal(A.get('a_agenda').plantilla,'{shopper} agendó {sucursal} para {fecha}');
  assert.equal(A.hookRequested(),false);
  assert.ok(notifies>0);assert.ok(paths.length>=4);
});

test('B7 mass WhatsApp paths reuse exact recipient helper and never declare delivery',()=>{
  assert.ok(source.includes('const sendWa=ids=>'));
  assert.ok(source.includes("board.querySelector('#bdBulkWa')"));
  assert.ok(source.includes("board.querySelectorAll('[data-bulk]')"));
  assert.ok(source.includes("openExactWaDraft({shopper:s.nombre"));
  assert.ok(!source.includes('Recordatorio masivo preparado'));
});
