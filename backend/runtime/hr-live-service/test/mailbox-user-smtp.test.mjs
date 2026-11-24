import test from 'node:test';
import assert from 'node:assert/strict';
import {Duplex} from 'node:stream';
import {sealCredential,mailboxAccountKey,mailError} from '../mailbox-pop3.mjs';
import {mailboxAddress,validateOutgoing,buildOutgoingMime,submitSmtp} from '../mailbox-smtp.mjs';
import {dispatchOutgoing,outgoingStatus,smtpEnabled} from '../mailbox-outbound.mjs';
import {parseMailboxMessage,validateMailboxInput} from '../mailbox-runtime.mjs';

const key=Buffer.alloc(32,7).toString('base64');
const provider={id:'fixture',providerType:'pop3_smtp_generic',host:'mail.example.test',port:995,security:'implicit_tls',smtpHost:'mail.example.test',smtpPort:465,smtpSecurity:'implicit_tls',allowedEmailDomains:['example.test'],sendEnabled:true,deleteEnabled:false};
const body={idempotencyKey:'fixture-submission-key-0001',to:['recipient@example.test'],subject:'Revisión',text:'Observación pendiente.\nSegunda línea.'};
const clone=value=>value===undefined?undefined:structuredClone(value);
class Ref{
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(name){return new Collection(this.db,this.path+'/'+name);}
  async get(){return this.db.snapshot(this.path);}
}
class Collection{
  constructor(db,path){this.db=db;this.path=path;this.order=null;this.cap=Infinity;}
  doc(id){return new Ref(this.db,this.path+'/'+id);}
  orderBy(field,order){this.order=[field,order];return this;}
  limit(count){this.cap=count;return this;}
  async get(){let docs=[...this.db.rows.keys()].filter(path=>path.startsWith(this.path+'/')&&!path.slice(this.path.length+1).includes('/')).map(path=>this.db.snapshot(path));if(this.order)docs.sort((a,b)=>String(a.data()[this.order[0]]).localeCompare(String(b.data()[this.order[0]]))*(this.order[1]==='desc'?-1:1));return {docs:docs.slice(0,this.cap)};}
}
class MemoryDb{
  constructor(){this.rows=new Map();this.tail=Promise.resolve();this.rejectCommit=null;}
  doc(path){return new Ref(this,path);}
  snapshot(path){return {id:path.split('/').at(-1),ref:this.doc(path),exists:this.rows.has(path),data:()=>clone(this.rows.get(path))};}
  async runTransaction(fn){
    const operation=this.tail.then(async()=>{const writes=[];
      const tx={get:async ref=>{assert.equal(writes.length,0,'Firestore reads must precede writes');return this.snapshot(ref.path);},create:(ref,row)=>writes.push(['create',ref.path,clone(row)]),set:(ref,row)=>writes.push(['set',ref.path,clone(row)]),update:(ref,row)=>writes.push(['update',ref.path,clone(row)])};
      const result=await fn(tx);if(this.rejectCommit?.(writes))throw Error('fixture persistence unavailable');
      for(const [type,path,row] of writes){if(type==='create')assert.equal(this.rows.has(path),false);if(type==='update')assert.equal(this.rows.has(path),true);this.rows.set(path,type==='update'?{...this.rows.get(path),...row}:row);}return result;
    });this.tail=operation.catch(()=>{});return operation;
  }
}
function setup(){
  const db=new MemoryDb(),p={db,tenantId:'fixture-tenant',uid:'owner-a',role:'ops',namespace:'staff'},accountKey=mailboxAccountKey({...provider,username:'owner@example.test'}),prefix=`tenants/${p.tenantId}/users/${p.uid}/mailboxes/primary`;
  const meta={providerId:provider.id,accountKey,emailAddress:'owner@example.test',connectionStatus:'connected',generation:'g1',leaseId:null,leaseUntil:0};
  db.rows.set(prefix,meta);db.rows.set(prefix+'/private/credential',{accountKey,generation:'g1',sealed:sealCredential('fixture-only',key,{...p,accountKey})});
  return {db,p,prefix,meta,accountKey,options:{credentialKey:key,sendEnabled:true}};
}
const receipt=message=>({operation:'SMTP_DATA',accepted:true,code:250,messageId:message.messageId,observedAt:new Date().toISOString(),responseSha256:'a'.repeat(64)});
const accepted=async(config,message,options)=>{await options.beforeData();return receipt(message);};
class SmtpFixture extends Duplex{
  constructor(options={}){super();this.options=options;this.commands=[];this.data=[];this.mode='command';this.authStage=0;this.rcpt=0;if(!options.silentGreeting)this.push('220 fixture ready\r\n');}
  _read(){}
  _write(chunk,encoding,done){const value=chunk.toString();this.commands.push(value.replace(/\r\n$/,''));
    const reply=text=>this.push(text+'\r\n');
    if(this.mode==='data'){
      this.data.push(value);this.mode='done';
      if(this.options.dropAfterData)queueMicrotask(()=>this.destroy());
      else if(this.options.silentAfterData){}else reply(this.options.rejectAfterData?'550 rejected':'250 2.0.0 fixture accepted');
    }else if(value.startsWith('EHLO '))reply('250-fixture\r\n250-AUTH '+(this.options.loginOnly?'LOGIN':this.options.noAuth?'CRAM-MD5':'PLAIN LOGIN')+'\r\n250 SIZE 100000');
    else if(value.startsWith('AUTH PLAIN '))reply(this.options.rejectAuth?'535 private fixture-only rejected':'235 authenticated');
    else if(value==='AUTH LOGIN\r\n'){this.authStage=1;reply('334 VXNlcm5hbWU6');}
    else if(this.authStage===1){this.authStage=2;reply('334 UGFzc3dvcmQ6');}
    else if(this.authStage===2){this.authStage=0;reply('235 authenticated');}
    else if(value.startsWith('MAIL FROM:'))reply('250 sender accepted');
    else if(value.startsWith('RCPT TO:')){this.rcpt++;reply(this.options.rejectRecipient===this.rcpt?'550 private address rejected':'250 recipient accepted');}
    else if(value==='DATA\r\n'){this.mode='data';reply('354 continue');}
    else if(value==='QUIT\r\n'){if(this.options.dropQuit)queueMicrotask(()=>this.destroy());else reply('221 bye');}
    else reply('500 unexpected fixture command');
    done();
  }
}
function smtpOptions(socket,beforeData=async()=>{}){return {connect:async config=>{assert.equal(config.port,465);assert.equal(config.host,provider.smtpHost);return socket;},beforeData};}
function smtpMessage(){const message={from:'owner@example.test',...validateOutgoing(body),messageId:'<fixture-id@example.test>',date:'2026-11-24T12:00:00Z'};return {...message,mime:buildOutgoingMime(message)};}
const config={...provider,username:'owner@example.test',password:'fixture-only'};

test('outgoing input refuses sender, UID, host, header injection and invalid recipient/header/body limits',()=>{
  for(const patch of [{uid:'other'},{tenantId:'other'},{from:'forged@example.test'},{host:'127.0.0.1'},{to:['valid@example.test\r\nBcc: bad@example.test']},{to:['a..b@example.test']},{to:['x@example.test>']},{subject:'Subject\r\nBcc: bad@example.test'},{text:'\0'},{text:'á'.repeat(65536)},{to:Array(21).fill('a@example.test')}])assert.throws(()=>validateOutgoing({...body,...patch}));
  assert.equal(mailboxAddress('qa@EXAMPLE.TEST'),'qa@example.test');
  assert.equal(validateMailboxInput({providerId:provider.id,emailAddress:'owner@example.test',password:'fixture-only'},[provider]).smtpPort,465);
});
test('MIME roundtrip preserves UTF-8 subject/body and isolates body text from headers',async()=>{
  const message=smtpMessage();message.subject='Revisión para el equipo ✨ '.repeat(7);message.text='Hola\n.\nBcc: nunca@example.test\n<script>no ejecutar</script>';const mime=buildOutgoingMime(message);
  const parsed=await parseMailboxMessage(mime,true);assert.equal(parsed.subject,message.subject);assert.match(parsed.text,/Bcc: nunca@example.test/);assert.equal(parsed.to.length,1);assert.equal(parsed.messageId,message.messageId);
  assert.ok(mime.toString().split('\r\n').every(line=>Buffer.byteLength(line)<998));assert.doesNotMatch(mime.toString(),/Content-Type: text\/html/);
});
test('SMTP enforces 465 implicit TLS and a durable pre-DATA hook before any connection',async()=>{
  let calls=0;const connect=async()=>{calls++;};
  for(const patch of [{smtpPort:587},{smtpSecurity:'starttls'}])await assert.rejects(()=>submitSmtp({...config,...patch},smtpMessage(),{connect,beforeData:async()=>{}}),/MAIL_IMPLICIT_TLS_465_REQUIRED/);
  await assert.rejects(()=>submitSmtp(config,smtpMessage(),{connect}),/MAIL_SEND_JOURNAL_REQUIRED/);assert.equal(calls,0);
});
test('SMTP obtains explicit auth and DATA ACK, journals before body, and preserves ACK if QUIT fails',async()=>{
  for(const loginOnly of [false,true]){
    const socket=new SmtpFixture({loginOnly,dropQuit:true});let durable=false;
    const result=await submitSmtp(config,smtpMessage(),smtpOptions(socket,async()=>{assert.equal(socket.data.length,0);durable=true;}));
    assert.equal(durable,true);assert.equal(socket.data.length,1);assert.equal(result.accepted,true);assert.equal(result.code,250);assert.equal(result.messageId,'<fixture-id@example.test>');assert.match(result.responseSha256,/^[a-f0-9]{64}$/);
    assert.equal(socket.commands.some(command=>/STARTTLS|DELE|STLS/.test(command)),false);assert.equal(JSON.stringify(result).includes('fixture-only'),false);
  }
});
test('one rejected recipient prevents DATA for every recipient; auth failure never exposes provider text',async()=>{
  const socket=new SmtpFixture({rejectRecipient:2}),message=smtpMessage();message.to.push('second@example.test');
  await assert.rejects(()=>submitSmtp(config,message,smtpOptions(socket)),error=>error.code==='MAIL_SMTP_RECIPIENT_REJECTED'&&error.deliveryUnknown===false);assert.equal(socket.data.length,0);assert.equal(socket.commands.includes('DATA'),false);
  await assert.rejects(()=>submitSmtp(config,smtpMessage(),smtpOptions(new SmtpFixture({rejectAuth:true}))),error=>error.code==='MAIL_AUTH_FAILED'&&!JSON.stringify(error).includes('fixture-only'));
  await assert.rejects(()=>submitSmtp(config,smtpMessage(),smtpOptions(new SmtpFixture({noAuth:true}))),/MAIL_SMTP_AUTH_UNSUPPORTED/);
});
test('socket loss after DATA is uncertain; explicit final rejection is known not sent',async()=>{
  await assert.rejects(()=>submitSmtp(config,smtpMessage(),smtpOptions(new SmtpFixture({dropAfterData:true}))),error=>error.deliveryUnknown===true);
  await assert.rejects(()=>submitSmtp(config,smtpMessage(),smtpOptions(new SmtpFixture({rejectAfterData:true}))),error=>error.code==='MAIL_SMTP_REJECTED'&&error.deliveryUnknown===false&&error.smtpCode===550);
});
test('timeouts settle both before and after DATA without an unbounded socket wait',async()=>{
  for(const afterData of [false,true]){
    const socket=new SmtpFixture(afterData?{silentAfterData:true}:{silentGreeting:true});
    await assert.rejects(()=>submitSmtp(config,smtpMessage(),{...smtpOptions(socket),timeoutMs:30}),error=>error.code==='MAIL_PROVIDER_TIMEOUT'&&error.deliveryUnknown===afterData);assert.equal(socket.destroyed,true);
  }
});
test('durable journal deduplicates accepted replay, retains owner receipt after reload, and rejects changed payload',async()=>{
  const s=setup();let calls=0;const submit=async(...args)=>{calls++;return accepted(...args);};
  const first=await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit});const second=await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit});
  assert.equal(first.outgoing.status,'smtp_accepted');assert.equal(second.idempotentReplay,true);assert.equal(first.outgoing.messageId,second.outgoing.messageId);assert.equal(calls,1);
  const readback=(await outgoingStatus(s.p,first.outgoing.id)).message;assert.equal(readback.providerAck.code,250);assert.equal(readback.text,body.text);assert.equal(readback.deliveryConfirmed,false);
  await assert.rejects(()=>dispatchOutgoing(s.p,{...body,text:'Changed'},'send',[provider],{...s.options,submit}),/MAIL_IDEMPOTENCY_CONFLICT/);assert.equal(calls,1);
  const journal=JSON.stringify([...s.db.rows.values()]);assert.equal(journal.includes('fixture-only'),false);
});
test('lost SMTP ACK persists unknown; replay and a fresh key with the same content cannot duplicate',async()=>{
  const s=setup();let connections=0;const submit=(cfg,message,options)=>{connections++;return submitSmtp(cfg,message,{...options,connect:async()=>new SmtpFixture({dropAfterData:true})});};
  const first=await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit});assert.equal(first.outgoing.status,'delivery_unknown');assert.equal(first.outgoing.retryAllowed,false);
  const replay=await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit});assert.equal(replay.outgoing.status,'delivery_unknown');assert.equal(connections,1);
  await assert.rejects(()=>dispatchOutgoing(s.p,{...body,idempotencyKey:'different-idempotency-key'},'send',[provider],{...s.options,submit}),/MAIL_DUPLICATE_UNRESOLVED/);assert.equal(connections,1);
});
test('concurrent same-key requests create one provider attempt; other content waits for mailbox lease',async()=>{
  const s=setup();let resume,entered;const started=new Promise(resolve=>{entered=resolve;});const gate=new Promise(resolve=>{resume=resolve;});let calls=0;
  const submit=async(...args)=>{calls++;entered();await gate;return accepted(...args);};
  const first=dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit});await started;
  const replay=await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit});assert.equal(replay.outgoing.status,'sending');
  await assert.rejects(()=>dispatchOutgoing(s.p,{...body,idempotencyKey:'other-content-key-0002',text:'Second message'},'send',[provider],{...s.options,submit}),/MAIL_SYNC_BUSY/);
  resume();assert.equal((await first).outgoing.status,'smtp_accepted');assert.equal(calls,1);
});
test('credential/generation changes before DATA fence submission; other tenant/UID cannot read or reply',async()=>{
  const s=setup();let data=0;const submit=async(cfg,message,options)=>{s.db.rows.get(s.prefix).generation='g2';await options.beforeData();data++;return receipt(message);};
  const result=await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit});assert.equal(result.outgoing.status,'not_sent');assert.equal(data,0);
  for(const patch of [{uid:'other-owner'},{tenantId:'other-tenant'}]){
    await assert.rejects(()=>dispatchOutgoing({...s.p,...patch},body,'send',[provider],s.options),/MAIL_NOT_CONNECTED/);
    await assert.rejects(()=>outgoingStatus({...s.p,...patch},result.outgoing.id),/MAIL_MESSAGE_NOT_FOUND/);
  }
});
test('reply recipient and Message-ID chain come only from same-owner stored message',async()=>{
  const s=setup(),parentId='b'.repeat(64);s.db.rows.set(s.prefix+'/accounts/'+s.accountKey+'/messages/'+parentId,{fromAddress:'sender@example.test',replyTo:[{address:'reply@example.test'}],subject:'Pregunta',messageId:'<parent@example.test>',references:['<thread@example.test>','<unsafe\r\n@example.test>']});
  let observed;const submit=async(cfg,message,options)=>{observed={cfg:{...cfg},message};return accepted(cfg,message,options);};
  const reply={idempotencyKey:'reply-fixture-key-0001',parentId,text:'Gracias, recibida.'};const result=await dispatchOutgoing(s.p,reply,'reply',[provider],{...s.options,submit});
  assert.deepEqual(observed.message.to,['reply@example.test']);assert.equal(observed.cfg.username,'owner@example.test');assert.match(observed.message.mime.toString(),/In-Reply-To: <parent@example.test>/);assert.match(observed.message.mime.toString(),/References: <thread@example.test>\r\n <parent@example.test>/);assert.equal(result.outgoing.parentId,parentId);
  await assert.rejects(()=>dispatchOutgoing(s.p,{...reply,parentId:'a'.repeat(64)},'reply',[provider],s.options),/MAIL_MESSAGE_NOT_FOUND/);
  await assert.rejects(()=>dispatchOutgoing(s.p,{...reply,to:['forged@example.test']},'reply',[provider],s.options),/MAIL_REQUEST_SCOPE_INVALID/);
});
test('disabled feature/provider deny new attempts without opening SMTP',async()=>{
  for(const providers of [[provider],[{...provider,sendEnabled:false}]]){
    const s=setup();let calls=0;await assert.rejects(()=>dispatchOutgoing(s.p,body,'send',providers,{...s.options,sendEnabled:providers[0].sendEnabled?false:true,submit:async()=>{calls++;}}),/MAIL_SEND_DISABLED/);assert.equal(calls,0);assert.equal([...s.db.rows.keys()].some(path=>path.includes('/outgoing/')),false);
  }
  assert.equal(smtpEnabled({connectionStatus:'connected',providerId:provider.id},[provider],false),false);
});
test('persistence failure after DATA ACK cannot downgrade to not sent or cause a second provider attempt',async()=>{
  const s=setup();let calls=0;s.db.rejectCommit=writes=>writes.some(([,path,row])=>path.includes('/outgoing/')&&row.status==='smtp_accepted');
  const submit=async(...args)=>{calls++;return accepted(...args);};await assert.rejects(()=>dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit}),/MAIL_SEND_RECORD_UNAVAILABLE/);
  s.db.rejectCommit=null;const replay=await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit});assert.equal(replay.outgoing.status,'sending');assert.equal(calls,1);
  const path=s.prefix+'/accounts/'+s.accountKey+'/outgoing/'+replay.outgoing.id;s.db.rows.get(path).leaseUntil=Date.now()-1;
  const after=(await outgoingStatus(s.p,replay.outgoing.id)).message;assert.equal(after.status,'delivery_unknown');assert.equal(after.retryAllowed,false);
  assert.equal((await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit})).outgoing.status,'delivery_unknown');assert.equal(calls,1);
});
test('expired before-DATA reservation is known not sent; same key stays terminal and explicit new intent may retry',async()=>{
  const s=setup();let resume,entered;const started=new Promise(resolve=>{entered=resolve;}),gate=new Promise(resolve=>{resume=resolve;});
  const first=dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit:async(cfg,message,options)=>{entered();await gate;await options.beforeData();return receipt(message);}});await started;
  const path=[...s.db.rows.keys()].find(path=>path.includes('/outgoing/'));s.db.rows.get(path).leaseUntil=Date.now()-1;s.db.rows.get(s.prefix).leaseUntil=Date.now()-1;
  const replay=await dispatchOutgoing(s.p,body,'send',[provider],{...s.options,submit:accepted});assert.equal(replay.outgoing.status,'not_sent');resume();assert.equal((await first).outgoing.status,'not_sent');
  const next=await dispatchOutgoing(s.p,{...body,idempotencyKey:'explicit-second-intent-key'},'send',[provider],{...s.options,submit:accepted});assert.equal(next.outgoing.status,'smtp_accepted');
});
