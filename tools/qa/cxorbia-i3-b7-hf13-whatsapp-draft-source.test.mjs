import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

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
