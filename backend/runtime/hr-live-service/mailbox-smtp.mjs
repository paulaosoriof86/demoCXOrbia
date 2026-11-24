// P0367: one bounded SMTP submission over the existing strict TLS transport.
// No queue retry, STARTTLS downgrade, remote deletion, attachments or HTML.
import crypto from 'node:crypto';
import {connectStrictTls,mailError} from './mailbox-pop3.mjs';

export const MAX_OUTGOING_BYTES=64*1024;
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
export function mailboxAddress(value){
  if(typeof value!=='string'||/[\r\n\0]/.test(value))throw mailError('MAIL_RECIPIENT_INVALID',400);
  const address=value.trim(),parts=address.split('@');
  if(address.length>254||parts.length!==2||parts[0].length>64||!parts[0]||parts[0].startsWith('.')||parts[0].endsWith('.')||parts[0].includes('..')||!/^[-A-Za-z0-9.!#$%&'*+/=?^_`{|}~]+$/.test(parts[0])||!parts[1].includes('.')||!parts[1].split('.').every(label=>/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label)))throw mailError('MAIL_RECIPIENT_INVALID',400);
  return parts[0]+'@'+parts[1].toLowerCase();
}
export function safeMessageId(value){
  return typeof value==='string'&&value.length<=254&&/^<[-A-Za-z0-9.!#$%&'*+/=?^_`{|}~]+@[A-Za-z0-9.-]+>$/.test(value)?value:null;
}
export function replyMetadata(parent){
  const inReplyTo=safeMessageId(parent?.messageId);
  if(!inReplyTo)throw mailError('MAIL_REPLY_TRACE_INVALID',409);
  const to=[mailboxAddress(parent.replyTo?.[0]?.address||parent.fromAddress)];
  const original=String(parent.subject||'').replace(/[\r\n\x00-\x1f\x7f]/g,' ').trim().slice(0,190)||'(Sin asunto)';
  const subject=/^re\s*:/i.test(original)?original:'Re: '+original;
  const references=[...new Set([...(Array.isArray(parent.references)?parent.references:[]).filter(safeMessageId),inReplyTo])].slice(-10);
  return {to,subject,inReplyTo,references};
}
export function validateOutgoing(body,action='send',parent=null){
  const allowed=action==='reply'?['idempotencyKey','parentId','text']:['idempotencyKey','to','subject','text'];
  if(!['send','reply'].includes(action)||!body||Array.isArray(body)||typeof body!=='object'||Object.keys(body).some(name=>!allowed.includes(name)))throw mailError('MAIL_REQUEST_SCOPE_INVALID',400);
  if(typeof body.idempotencyKey!=='string'||!/^[-A-Za-z0-9_]{16,128}$/.test(body.idempotencyKey))throw mailError('MAIL_IDEMPOTENCY_INVALID',400);
  if(typeof body.text!=='string'||!body.text.trim()||body.text.includes('\0')||Buffer.byteLength(body.text)>MAX_OUTGOING_BYTES)throw mailError('MAIL_OUTGOING_BODY_INVALID',400);
  let headers;
  if(action==='reply'){
    if(typeof body.parentId!=='string'||!/^[a-f0-9]{64}$/.test(body.parentId)||!parent)throw mailError('MAIL_MESSAGE_NOT_FOUND',404);
    headers=replyMetadata(parent);
  }else{
    if(!Array.isArray(body.to)||!body.to.length||body.to.length>20)throw mailError('MAIL_RECIPIENT_INVALID',400);
    if(typeof body.subject!=='string'||!body.subject.trim()||body.subject.length>200||/[\x00-\x1f\x7f]/.test(body.subject))throw mailError('MAIL_SUBJECT_INVALID',400);
    headers={to:[...new Set(body.to.map(mailboxAddress))],subject:body.subject.trim(),inReplyTo:null,references:[]};
  }
  return {...headers,text:body.text.replace(/\r\n|\r/g,'\n'),parentId:action==='reply'?body.parentId:null};
}
function encodedSubject(value){
  const chunks=[];let chunk='';
  for(const char of value){if(Buffer.byteLength(chunk+char)>42){chunks.push(chunk);chunk='';}chunk+=char;}
  if(chunk)chunks.push(chunk);
  return chunks.map(part=>'=?UTF-8?B?'+Buffer.from(part).toString('base64')+'?=').join('\r\n ');
}
export function buildOutgoingMime({from,to,subject,text,messageId,date,inReplyTo=null,references=[]}){
  const sender=mailboxAddress(from),recipients=to.map(mailboxAddress);
  if(!safeMessageId(messageId)||!Number.isFinite(Date.parse(date))||typeof subject!=='string'||/[\r\n\0]/.test(subject))throw mailError('MAIL_HEADER_INVALID',400);
  if(inReplyTo&&!safeMessageId(inReplyTo))throw mailError('MAIL_HEADER_INVALID',400);
  if(references.some(value=>!safeMessageId(value)))throw mailError('MAIL_HEADER_INVALID',400);
  const headers=['From: '+sender,'To: '+recipients.join(',\r\n '),'Subject: '+encodedSubject(subject),'Date: '+new Date(date).toUTCString(),'Message-ID: '+messageId];
  if(inReplyTo)headers.push('In-Reply-To: '+inReplyTo);
  if(references.length)headers.push('References: '+references.join('\r\n '));
  headers.push('MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64');
  const content=Buffer.from(text.replace(/\r\n|\r|\n/g,'\r\n'),'utf8').toString('base64').match(/.{1,76}/g)?.join('\r\n')||'';
  return Buffer.from(headers.join('\r\n')+'\r\n\r\n'+content+'\r\n','utf8');
}

class Replies{
  constructor(socket){
    this.buffer='';this.queue=[];this.pending=[];this.error=null;this.total=0;
    socket.on('data',chunk=>{
      this.total+=chunk.length;this.buffer+=chunk.toString('latin1');
      if(this.total>65536||this.buffer.length>8192){this.fail(mailError('MAIL_SMTP_RESPONSE_INVALID'));socket.destroy();return;}
      let end;while((end=this.buffer.indexOf('\r\n'))>=0){const line=this.buffer.slice(0,end);this.buffer=this.buffer.slice(end+2);if(line.length>2048){this.fail(mailError('MAIL_SMTP_RESPONSE_INVALID'));socket.destroy();return;}if(this.pending.length)this.pending.shift().resolve(line);else this.queue.push(line);}
    });
    socket.on('error',()=>this.fail(mailError('MAIL_PROVIDER_IO_FAILED')));
    socket.on('close',()=>this.fail(mailError('MAIL_PROVIDER_CLOSED')));
  }
  fail(error){this.error=error;for(const p of this.pending.splice(0))p.reject(error);}
  line(){if(this.queue.length)return Promise.resolve(this.queue.shift());if(this.error)return Promise.reject(this.error);return new Promise((resolve,reject)=>this.pending.push({resolve,reject}));}
  async reply(){
    const lines=[];let expected;
    for(let i=0;i<50;i++){
      const line=await this.line(),match=line.match(/^([2-5][0-9]{2})([ -])(.*)$/);
      if(!match||(expected&&expected!==Number(match[1])))throw mailError('MAIL_SMTP_RESPONSE_INVALID');
      expected=Number(match[1]);lines.push(match[3]);if(match[2]===' ')return {code:expected,lines};
    }
    throw mailError('MAIL_SMTP_RESPONSE_INVALID');
  }
  async read(timeoutMs=20000){
    let timer;
    try{return await Promise.race([this.reply(),new Promise((_,reject)=>{timer=setTimeout(()=>{const error=mailError('MAIL_PROVIDER_TIMEOUT');this.fail(error);reject(error);},timeoutMs);})]);}
    finally{clearTimeout(timer);}
  }
}

export async function submitSmtp(config,message,options={}){
  if(config.smtpPort!==465||config.smtpSecurity!=='implicit_tls')throw mailError('MAIL_IMPLICIT_TLS_465_REQUIRED',400);
  const from=mailboxAddress(config.username),to=message.to.map(mailboxAddress);
  if(typeof config.password!=='string'||!config.password||/[\r\n\0]/.test(config.password)||config.password.length>1024)throw mailError('MAIL_CREDENTIAL_FORMAT_INVALID',400);
  if(typeof options.beforeData!=='function')throw mailError('MAIL_SEND_JOURNAL_REQUIRED',500);
  let socket,replies,timer,expired=false,dataStarted=false,finalRejection=false;
  const timeoutMs=Math.min(options.timeoutMs||90000,90000);
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;socket?.destroy();reject(mailError('MAIL_PROVIDER_TIMEOUT'));},timeoutMs);});
  const attempt=async()=>{
    socket=await (options.connect||connectStrictTls)({host:config.smtpHost,port:465});
    if(expired){socket.destroy();throw mailError('MAIL_PROVIDER_TIMEOUT');}
    replies=new Replies(socket);
    const expect=async(codes,errorCode)=>{const response=await replies.read();if(!codes.includes(response.code)){const error=mailError(errorCode);error.smtpCode=response.code;throw error;}return response;};
    const command=async(value,codes,errorCode='MAIL_SMTP_REJECTED')=>{if(expired||socket.destroyed)throw mailError('MAIL_PROVIDER_TIMEOUT');socket.write(value+'\r\n');return expect(codes,errorCode);};
    await expect([220],'MAIL_SMTP_GREETING_INVALID');
    const hello=await command('EHLO '+from.split('@')[1],[250]);
    const auth=hello.lines.flatMap(line=>/^AUTH(?:[ =])/i.test(line)?line.replace(/^AUTH(?:[ =])+/i,'').toUpperCase().split(/\s+/):[]);
    if(auth.includes('PLAIN')){
      const payload=Buffer.from('\0'+from+'\0'+config.password).toString('base64');
      const response=await command('AUTH PLAIN '+payload,[235,334],'MAIL_AUTH_FAILED');
      if(response.code===334)await command(payload,[235],'MAIL_AUTH_FAILED');
    }else if(auth.includes('LOGIN')){
      await command('AUTH LOGIN',[334],'MAIL_AUTH_FAILED');
      await command(Buffer.from(from).toString('base64'),[334],'MAIL_AUTH_FAILED');
      await command(Buffer.from(config.password).toString('base64'),[235],'MAIL_AUTH_FAILED');
    }else throw mailError('MAIL_SMTP_AUTH_UNSUPPORTED',409);
    await command('MAIL FROM:<'+from+'>',[250]);
    // No DATA if any recipient rejects: an accepted subset is never submitted.
    for(const recipient of to)await command('RCPT TO:<'+recipient+'>',[250,251],'MAIL_SMTP_RECIPIENT_REJECTED');
    await command('DATA',[354]);
    await options.beforeData();
    if(expired||socket.destroyed)throw mailError('MAIL_PROVIDER_TIMEOUT');
    dataStarted=true;
    socket.setTimeout?.(60000);
    socket.write(message.mime.toString('utf8').replace(/^\./gm,'..')+'.\r\n');
    const receipt=await replies.read(60000);
    if(receipt.code!==250){finalRejection=receipt.code>=400;const error=mailError('MAIL_SMTP_REJECTED');error.smtpCode=receipt.code;throw error;}
    // A later QUIT failure cannot erase the provider's positive DATA receipt.
    socket.end('QUIT\r\n');
    return {operation:'SMTP_DATA',accepted:true,code:250,observedAt:new Date().toISOString(),responseSha256:digest(receipt.lines.join('\n')),messageId:message.messageId};
  };
  try{return await Promise.race([attempt(),deadline]);}
  catch(error){error.deliveryUnknown=dataStarted&&!finalRejection;throw error;}
  finally{clearTimeout(timer);socket?.destroy();}
}
