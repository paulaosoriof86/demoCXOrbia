import test from 'node:test';
import assert from 'node:assert/strict';
import {Duplex} from 'node:stream';
import fs from 'node:fs';
import {assertReadOnlyPopCommand,publicIp,connectStrictTls,openPopSession,parseUidlLines,probeMailTls,mailboxAccountKey,uidlMessageId,sealCredential,unsealCredential} from '../mailbox-pop3.mjs';
import {validateMailboxIdentity,validateMailboxInput,planUidlBatch,assertSameLease,parseMailboxMessage,htmlToPlain} from '../mailbox-runtime.mjs';

const provider={id:'test-pop',providerType:'pop3_smtp_generic',host:'mail.example.test',port:995,security:'implicit_tls',smtpHost:'mail.example.test',smtpPort:465,smtpSecurity:'implicit_tls',allowedEmailDomains:['example.test'],sendEnabled:false,deleteEnabled:false};
class FakeSocket extends Duplex{
  constructor({greeting='+OK ready\r\n',responses={}}={}){super();this.commands=[];this.responses=responses;this.authorized=true;this.push(greeting);}
  _read(){}
  _write(chunk,encoding,done){const command=chunk.toString().replace(/\r\n$/,'');this.commands.push(command);this.push(this.responses[command]||'+OK\r\n');done();}
  getPeerCertificate(){return {fingerprint256:'AA:BB'};}
  getProtocol(){return 'TLSv1.3';}
}
test('POP command owner rejects deletion, SMTP, CRLF injection and cleartext upgrade',()=>{
  for(const command of ['DELE 1','STLS','AUTH PLAIN x','PASS x\r\nDELE 1','MAIL FROM:<x>','USER x\0y','QUIT\r\n'])assert.throws(()=>assertReadOnlyPopCommand(command),/MAIL_COMMAND_FORBIDDEN/);
  for(const command of ['USER qa@example.test','PASS fixture-only','UIDL','LIST','TOP 1 0','RETR 1','QUIT'])assert.doesNotThrow(()=>assertReadOnlyPopCommand(command));
});
test('TLS transport rejects private addresses before a socket is opened',async()=>{
  for(const address of ['127.0.0.1','10.0.0.1','172.16.5.5','169.254.169.254','192.168.1.2','::1','::ffff:127.0.0.1','fc00::1'])assert.equal(publicIp(address),false);
  assert.equal(publicIp('8.8.8.8'),true);
  await assert.rejects(()=>connectStrictTls(provider,{lookup:async()=>[{address:'169.254.169.254',family:4}]}),/MAIL_PUBLIC_HOST_REQUIRED/);
});
test('POP requires implicit TLS 995; no insecure fallback is attempted',async()=>{
  let attempted=0;
  await assert.rejects(()=>openPopSession({...provider,security:'starttls'},{connect:async()=>{attempted++;}}),/MAIL_IMPLICIT_TLS_995_REQUIRED/);
  assert.equal(attempted,0);
});
test('POP consumes actual greeting, USER/PASS, UIDL and RETR; QUIT contains no DELE',async()=>{
  const socket=new FakeSocket({responses:{UIDL:'+OK\r\n1 a-uidl\r\n2 b-uidl\r\n.\r\n','RETR 2':'+OK\r\nSubject: Hi\r\n\r\n..dot-stuffed\r\n.\r\n'}});
  const pop=await openPopSession(provider,{connect:async()=>socket});await pop.login('qa@example.test','fixture-only');
  assert.deepEqual(await pop.uidl(),[{number:1,uidl:'a-uidl'},{number:2,uidl:'b-uidl'}]);
  assert.equal((await pop.retrieve(2)).toString(),'Subject: Hi\r\n\r\n.dot-stuffed\r\n');await pop.close();
  assert.deepEqual(socket.commands,['USER qa@example.test','PASS fixture-only','UIDL','RETR 2','QUIT']);
});
test('provider auth rejection does not expose server text or submitted password',async()=>{
  const socket=new FakeSocket({responses:{'PASS fixture-only':'-ERR rejected fixture-only private@example.test\r\n'}});
  const pop=await openPopSession(provider,{connect:async()=>socket});
  await assert.rejects(()=>pop.login('qa@example.test','fixture-only'),error=>error.message==='MAIL_AUTH_FAILED'&&!JSON.stringify(error).includes('fixture-only'));
});
test('UIDL uniqueness is validated and id remains stable after message renumbering',()=>{
  assert.throws(()=>parseUidlLines(['1 uid','2 uid']),/MAIL_UIDL_INVALID/);
  assert.throws(()=>parseUidlLines(['1 first','1 second']),/MAIL_UIDL_INVALID/);
  const account=mailboxAccountKey({...provider,username:'qa@example.test'});
  const first=parseUidlLines(['1 before','2 stable']),second=parseUidlLines(['1 stable']);
  assert.equal(uidlMessageId(account,first[1].uidl),uidlMessageId(account,second[0].uidl));
  assert.notEqual(uidlMessageId(account,'stable'),uidlMessageId('different-account','stable'));
});
test('durable UIDL replay selects no already persisted message; older cursor keeps progress',()=>{
  const rows=Array.from({length:150},(_,i)=>({number:i+1,uidl:'uid-'+(i+1)}));const account='account';
  const first=planUidlBatch(rows,new Set(),account);assert.equal(first.selected.length,25);assert.equal(first.anchor,'uid-126');
  const known=new Set(rows.map(row=>uidlMessageId(account,row.uidl)));assert.equal(planUidlBatch(rows,known,account).selected.length,0);
  const older=planUidlBatch(rows,new Set(first.selected.map(row=>uidlMessageId(account,row.uidl))),account,{older:true,anchor:first.anchor});
  assert.equal(older.selected[0].uidl,'uid-125');assert.equal(older.selected.at(-1).uidl,'uid-101');
});
test('credential ciphertext cannot be transplanted to another UID, tenant, or account',()=>{
  const key=Buffer.alloc(32,7).toString('base64'),scope={tenantId:'test',uid:'user-a',accountKey:'mail-a'};
  const sealed=sealCredential('fixture-only',key,scope);assert.equal(unsealCredential(sealed,key,scope),'fixture-only');assert.equal(JSON.stringify(sealed).includes('fixture-only'),false);
  for(const changed of [{uid:'user-b'},{tenantId:'other'},{accountKey:'mail-b'}])assert.throws(()=>unsealCredential(sealed,key,{...scope,...changed}),/MAIL_CREDENTIAL_UNSEAL_FAILED/);
  assert.throws(()=>sealCredential('fixture-only','',scope),/MAIL_ENCRYPTION_KEY_REQUIRED/);
});
test('ownership comes only from verified UID and durable active membership',()=>{
  const decoded={uid:'u-a',tenantId:'t-a',role:'ops',authNamespace:'staff'},member={role:'ops',authNamespace:'staff',active:true};
  assert.equal(validateMailboxIdentity(decoded,member,'t-a').uid,'u-a');
  for(const [token,m,tenant] of [[decoded,member,'t-b'],[decoded,{...member,active:false},'t-a'],[decoded,{...member,role:'super'},'t-a'],[{...decoded,authNamespace:'shopper'},member,'t-a'],[decoded,null,'t-a']])assert.throws(()=>validateMailboxIdentity(token,m,tenant),/MAIL_MEMBERSHIP_DENIED/);
});
test('request cannot select another UID or host; provider and email domain are allowlisted',()=>{
  const body={providerId:'test-pop',emailAddress:'QA@example.test',password:'fixture-only'};
  assert.equal(validateMailboxInput(body,[provider]).username,'qa@example.test');
  for(const payload of [{...body,uid:'another'},{...body,host:'169.254.169.254'},{...body,emailAddress:'qa@other.test'},{...body,password:'x\r\nDELE 1'},{...body,providerId:'unknown'}])assert.throws(()=>validateMailboxInput(payload,[provider]));
});
test('disconnect or competing connect generation fences a late sync write',()=>{
  const lease={id:'lease1',generation:'v1',accountKey:'a'},meta={leaseId:'lease1',generation:'v1',accountKey:'a',connectionStatus:'connected'};
  assert.doesNotThrow(()=>assertSameLease(meta,lease));
  for(const patch of [{generation:'v2'},{leaseId:'lease2'},{accountKey:'b'},{connectionStatus:'revoked'}])assert.throws(()=>assertSameLease({...meta,...patch},lease),/MAIL_CONNECTION_CHANGED/);
});
test('strict TLS probe uses only greeting and QUIT; no credentials or mail access',async()=>{
  for(const protocol of ['pop3','smtp']){
    const socket=new FakeSocket({greeting:protocol==='smtp'?'220-mail.example.test\r\n220 ready\r\n':'+OK ready\r\n',responses:{QUIT:protocol==='smtp'?'221 bye\r\n':'+OK bye\r\n'}});
    const proof=await probeMailTls({host:provider.host,port:protocol==='smtp'?465:995,protocol},{connect:async()=>socket});
    assert.equal(proof.greetingAccepted,true);assert.equal(proof.certificateVerified,true);assert.equal(proof.credentialCommands,0);assert.deepEqual(socket.commands,['QUIT']);
  }
});
test('MIME parser decodes non-ASCII subject and quoted-printable body with bounded text output',async()=>{
  const message=await parseMailboxMessage(Buffer.from('Subject: =?UTF-8?B?UmV2aXNpw7Nu?=\r\nFrom: Test <qa@example.test>\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\nObservaci=C3=B3n pendiente.\r\n'),true);
  assert.equal(message.subject,'Revisión');assert.match(message.text,/Observación pendiente/);assert.equal(message.bodyComplete,true);
});
test('HTML-only mail becomes plain escaped UI data without executing or fetching content',async()=>{
  const message=await parseMailboxMessage(Buffer.from('Content-Type: text/html; charset=utf-8\r\n\r\n<script>fetch("secret")</script><p>Hola &amp; equipo</p><img src="https://tracking.test/pixel">'),true);
  assert.match(message.text,/Hola & equipo/);assert.doesNotMatch(message.text,/fetch|tracking|<img|<script/);
  assert.equal(htmlToPlain('<b>&lt;img src=x onerror=alert(1)&gt;</b>'),'<img src=x onerror=alert(1)>');
  const ui=fs.readFileSync(new URL('../../../../app/modules/correo.js',import.meta.url),'utf8');
  assert.match(ui,/esc\(selected\.text/);assert.doesNotMatch(ui,/localStorage|_DEMO_RAW|DEMO\.push/);
});
