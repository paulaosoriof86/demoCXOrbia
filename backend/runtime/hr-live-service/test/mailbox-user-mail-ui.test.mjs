// Offline workflow tests: execute the real module with a small DOM/event harness.
// This exercises event state and request payloads, not browser layout/visual QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const source=fs.readFileSync(new URL('../../../../app/modules/correo.js',import.meta.url),'utf8');
const parentId='b'.repeat(64),outId='a'.repeat(64);
const parent={id:parentId,subject:'Pregunta <script>bad()</script>',fromAddress:'sender@example.test',replyTo:[{address:'reply@example.test'}],messageId:'<parent@example.test>',to:[{address:'owner@example.test'}],text:'<img src=x onerror=bad()>',date:'2026-11-24T12:00:00Z'};
const decode=value=>value.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
class Element{
  constructor(attributes=''){this.listeners={};this.disabled=/\bdisabled\b/.test(attributes);this.readOnly=/\breadonly\b/.test(attributes);this.value=decode(attributes.match(/\bvalue="([^"]*)"/)?.[1]||'');this.textContent='';this.dataset={message:attributes.match(/data-message="([^"]*)"/)?.[1]};this.isConnected=true;this._html='';this.nodes=new Map();}
  set innerHTML(value){this._html=value;this.nodes=new Map();for(const match of value.matchAll(/<[a-z]+\b([^>]*\bid="([^"]+)"[^>]*)>/gi))this.nodes.set('#'+match[2],new Element(match[1]));this.rows=[...value.matchAll(/<button\b([^>]*\bdata-message="[^"]+"[^>]*)>/gi)].map(match=>new Element(match[1]));}
  get innerHTML(){return this._html;}
  querySelector(selector){return this.nodes.get(selector)||null;}
  querySelectorAll(selector){return selector==='[data-message]'?this.rows||[]:[];}
  addEventListener(name,fn){this.listeners[name]=fn;}
  async fire(name='click',evenIfDisabled=false){if(this.disabled&&!evenIfDisabled)return;return this.listeners[name]?.({preventDefault(){}});}
}
async function until(predicate){for(let i=0;i<100;i++){if(predicate())return;await new Promise(setImmediate);}throw Error('UI fixture did not settle');}
async function fixture({canSend=true,mode='accepted'}={}){
  const calls=[],modals=[];let authCallback,interval,host,outbox=[];
  const status={enabled:true,canRead:true,canViewOutbox:true,canSend,emailAddress:'owner@example.test',connectionStatus:'connected',providers:[]};
  const user={uid:'owner-a',getIdToken:async()=> 'fixture-id-token'};
  const auth={currentUser:user,onAuthStateChanged(fn){authCallback=fn;queueMicrotask(()=>fn(user));return ()=>{};}};
  const ui={el:()=>new Element(),modal(title,html,options){
    const form=new Element(),button=new Element();form.elements={};for(const match of html.matchAll(/<(?:input|textarea|select)\b([^>]*\bname="([^"]+)"[^>]*)>/g))form.elements[match[2]]=new Element(match[1]);
    form.reportValidity=()=>true;form.querySelector=selector=>selector==='button'?button:null;const overlay=new Element();overlay.innerHTML=html;overlay.nodes.set('form',form);let closed=false;
    const modal={title,form,button,overlay,get closed(){return closed;}};modals.push(modal);options.onMount(overlay,()=>{closed=true;});
  }};
  const fetch=async(url,options={})=>{
    const action=url.split('/mailboxes/self/')[1],body=options.body?JSON.parse(options.body):undefined;calls.push({action,body,method:options.method});let payload;
    if(action==='status')payload=status;
    else if(action==='messages')payload={messages:[parent],nextCursor:null};
    else if(action==='messages/'+parentId)payload={message:parent};
    else if(action==='outbox')payload={messages:outbox};
    else if(action==='outbox/'+outId)payload={message:outbox[0]};
    else if(action==='sync')payload={providerAck:true};
    else if(action==='send'||action==='reply'){
      const outgoing={id:outId,from:status.emailAddress,to:body.to||['reply@example.test'],subject:body.subject||'Re: Pregunta',text:body.text,messageId:'<outgoing@example.test>',status:mode==='unknown'?'delivery_unknown':mode==='rejected'?'not_sent':'smtp_accepted',error:mode==='rejected'?'MAIL_SMTP_RECIPIENT_REJECTED':null,createdAt:'2026-11-24T12:00:00Z',providerAck:mode==='unknown'?null:{code:250}};outbox=[outgoing];
      if(mode==='http-loss'&&calls.filter(row=>['send','reply'].includes(row.action)).length===1)throw TypeError('fixture transport interruption');
      payload={outgoing,idempotentReplay:calls.filter(row=>row.action===action).length>1};
    }else throw Error('unexpected fixture endpoint '+action);
    return {ok:true,status:200,json:async()=>({ok:true,...structuredClone(payload)})};
  };
  const context={window:{firebase:{auth:()=>auth},CX_TENANT_RUNTIME_CONFIG:{tenantId:'fixture-tenant'}},CX:{module:(name,fn)=>{host=fn({ui});}},document:{hidden:false},fetch,AbortController,TextEncoder,crypto:{randomUUID:crypto.randomUUID},setInterval:fn=>{interval=fn;return 1;},clearInterval(){},console};
  vm.runInNewContext(source,context);await until(()=>host.innerHTML.includes('owner@example.test')&&!host.innerHTML.includes('aria-busy="true"'));
  return {host,calls,modals,status,auth,authCallback,interval};
}
function fillCompose(modal){modal.form.elements.to.value='recipient@example.test';modal.form.elements.subject.value='Revisión';modal.form.elements.text.value='Hola, equipo.';}

test('UI permission disables compose before activation; escaped mail content remains text',async()=>{
  const f=await fixture({canSend:false});assert.equal(f.host.querySelector('#mail-compose').disabled,true);await f.host.querySelector('#mail-compose').fire('click',true);assert.equal(f.modals.length,0);
  await f.host.querySelectorAll('[data-message]')[0].fire();await until(()=>f.host.innerHTML.includes('Referencia del mensaje'));
  assert.match(f.host.innerHTML,/&lt;script&gt;bad\(\)&lt;\/script&gt;/);assert.doesNotMatch(f.host.innerHTML,/<img src=x|<script>bad/);assert.equal(f.host.querySelector('#mail-reply').disabled,true);
});
test('UI HTTP failure keeps immutable submission key and content for explicit status replay',async()=>{
  const f=await fixture({mode:'http-loss'});await f.host.querySelector('#mail-compose').fire();const modal=f.modals.at(-1);fillCompose(modal);
  await modal.form.fire('submit');assert.equal(modal.button.textContent,'Consultar este envío');assert.equal(modal.form.elements.text.readOnly,true);
  modal.form.elements.text.value='Tampered after dispatch';await modal.form.fire('submit');const sends=f.calls.filter(row=>row.action==='send');assert.equal(sends.length,2);assert.deepEqual(sends[1].body,sends[0].body);assert.equal(modal.button.disabled,true);assert.equal(modal.button.textContent,'Aceptado por el servidor');
  assert.match(modal.overlay.querySelector('#mail-send-status').textContent,/no confirma su entrega/);
});
test('UI uncertain outcome blocks another send and background refresh never submits mail',async()=>{
  const f=await fixture({mode:'unknown'});await f.host.querySelector('#mail-compose').fire();const modal=f.modals.at(-1);fillCompose(modal);await modal.form.fire('submit');
  assert.equal(modal.button.disabled,true);assert.equal(modal.form.elements.text.readOnly,true);assert.match(modal.overlay.querySelector('#mail-send-status').textContent,/podría haberse enviado/);
  await modal.form.fire('submit');f.interval();await until(()=>f.calls.some(row=>row.action==='sync'));assert.equal(f.calls.filter(row=>row.action==='send').length,1);
  await f.host.querySelector('#mail-outbox').fire();await until(()=>f.host.innerHTML.includes('Sin confirmación'));assert.match(f.host.innerHTML,/Sin confirmación/);
});
test('UI reply sends only original owner message reference and text, never client-selected headers',async()=>{
  const f=await fixture();await f.host.querySelectorAll('[data-message]')[0].fire();await until(()=>f.host.querySelector('#mail-reply'));
  await f.host.querySelector('#mail-reply').fire();const modal=f.modals.at(-1);assert.equal(modal.form.elements.to.value,'reply@example.test');assert.equal(modal.form.elements.to.readOnly,true);
  modal.form.elements.to.value='forged@example.test';modal.form.elements.subject.value='Forged subject';modal.form.elements.text.value='Gracias.';await modal.form.fire('submit');
  const reply=f.calls.find(row=>row.action==='reply').body;assert.deepEqual(Object.keys(reply).sort(),['idempotencyKey','parentId','text']);assert.equal(reply.parentId,parentId);assert.equal(reply.text,'Gracias.');
});
test('UI byte limit rejects oversized text before HTTP; owner change closes the draft and clears prior mailbox',async()=>{
  const f=await fixture();await f.host.querySelector('#mail-compose').fire();const modal=f.modals.at(-1);fillCompose(modal);modal.form.elements.text.value='á'.repeat(40000);await modal.form.fire('submit');assert.equal(f.calls.some(row=>row.action==='send'),false);assert.match(modal.overlay.querySelector('#mail-send-status').textContent,/64 KB/);
  f.auth.currentUser=null;f.authCallback(null);assert.equal(modal.closed,true);assert.doesNotMatch(f.host.innerHTML,/owner@example.test|Pregunta/);assert.equal(f.host.querySelector('#mail-compose').disabled,true);
});

test('UI explicit retry for certain not_sent creates a new key and preserves edited intent',async()=>{
  const f=await fixture({mode:'rejected'});await f.host.querySelector('#mail-compose').fire();const modal=f.modals.at(-1);fillCompose(modal);await modal.form.fire('submit');
  assert.equal(modal.button.textContent,'Volver a enviar');assert.equal(modal.button.disabled,false);assert.equal(modal.form.elements.text.readOnly,false);
  modal.form.elements.to.value='corrected@example.test';await modal.form.fire('submit');const sends=f.calls.filter(row=>row.action==='send');assert.equal(sends.length,2);assert.notEqual(sends[0].body.idempotencyKey,sends[1].body.idempotencyKey);assert.deepEqual(sends[1].body.to,['corrected@example.test']);
});
