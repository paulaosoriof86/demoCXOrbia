import tls from 'node:tls';
import dns from 'node:dns/promises';
import net from 'node:net';
import crypto from 'node:crypto';

export const MAX_MESSAGE_BYTES=20*1024*1024;
export const MAX_UIDL_BYTES=8*1024*1024;
export function mailError(code,status=502){return Object.assign(new Error(code),{code,status});}
export function publicIp(address){
  if(net.isIP(address)===4){
    const [a,b]=address.split('.').map(Number);
    return !(a===0||a===10||a===127||a>=224||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127)||(a===198&&(b===18||b===19)));
  }
  if(net.isIP(address)===6){
    const value=address.toLowerCase();
    return !(/^::|^f[cd]|^fe[89ab]|^ff/.test(value));
  }
  return false;
}

// Every connection validates the public DNS result, SNI and trust chain. No STLS,
// cleartext connection or rejectUnauthorized=false fallback exists in this owner.
export async function connectStrictTls({host,port},options={}){
  const lookup=options.lookup||dns.lookup;
  if(!/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(host)||net.isIP(host))throw mailError('MAIL_HOST_INVALID',400);
  let addresses;
  try{addresses=await lookup(host,{all:true,verbatim:true});}catch{throw mailError('MAIL_DNS_FAILED');}
  if(!addresses.length||addresses.some(row=>!publicIp(row.address)))throw mailError('MAIL_PUBLIC_HOST_REQUIRED',400);
  const address=addresses[0];
  return await new Promise((resolve,reject)=>{
    const socket=tls.connect({host:address.address,port,servername:host,rejectUnauthorized:true,minVersion:'TLSv1.2'});
    const deadline=setTimeout(()=>socket.destroy(mailError('MAIL_TLS_TIMEOUT')),15000);
    socket.once('error',()=>{clearTimeout(deadline);reject(mailError('MAIL_TLS_FAILED'));});
    socket.once('secureConnect',()=>{
      clearTimeout(deadline);
      if(!socket.authorized){socket.destroy();reject(mailError('MAIL_TLS_CERTIFICATE_INVALID'));return;}
      socket.setTimeout(20000,()=>socket.destroy(mailError('MAIL_PROVIDER_TIMEOUT')));
      resolve(socket);
    });
  });
}

class Lines{
  constructor(socket){
    this.socket=socket;this.buffer=Buffer.alloc(0);this.queue=[];this.pending=[];this.error=null;this.queuedBytes=0;
    socket.on('data',chunk=>{
      this.buffer=Buffer.concat([this.buffer,chunk]);
      if(this.buffer.length+this.queuedBytes>MAX_MESSAGE_BYTES+65536){this.fail(mailError('MAIL_RESPONSE_TOO_LARGE'));socket.destroy();return;}
      let end;
      while((end=this.buffer.indexOf('\r\n'))>=0){
        const line=Buffer.from(this.buffer.subarray(0,end));this.buffer=this.buffer.subarray(end+2);
        if(this.pending.length)this.pending.shift().resolve(line);else{this.queue.push(line);this.queuedBytes+=line.length;}
      }
    });
    socket.on('error',()=>this.fail(mailError('MAIL_PROVIDER_IO_FAILED')));
    socket.on('close',()=>this.fail(mailError('MAIL_PROVIDER_CLOSED')));
  }
  fail(error){this.error=error;for(const p of this.pending.splice(0))p.reject(error);}
  async read(){
    if(this.queue.length){const line=this.queue.shift();this.queuedBytes-=line.length;return line;}
    if(this.error)throw this.error;
    return new Promise((resolve,reject)=>this.pending.push({resolve,reject}));
  }
}

export function assertReadOnlyPopCommand(command){
  if(!/^(?:USER [^\r\n\0]{1,320}|PASS [^\r\n\0]{1,1024}|UIDL(?: [1-9]\d*)?|LIST(?: [1-9]\d*)?|RETR [1-9]\d*|TOP [1-9]\d* [0-9]+|NOOP|RSET|QUIT)$/.test(command))throw mailError('MAIL_COMMAND_FORBIDDEN',400);
}
function positive(line){if(!/^\+OK(?: |$)/.test(line.toString('ascii')))throw mailError('MAIL_PROVIDER_REJECTED');}
export function parseUidlLines(lines){
  const seen=new Set(),numbers=new Set();
  return lines.map(line=>{
    const match=String(line).match(/^([1-9]\d*) ([!-~]{1,70})$/);
    if(!match||seen.has(match[2])||numbers.has(match[1]))throw mailError('MAIL_UIDL_INVALID');
    const number=Number(match[1]);if(!Number.isSafeInteger(number))throw mailError('MAIL_UIDL_INVALID');
    seen.add(match[2]);numbers.add(match[1]);return {number,uidl:match[2]};
  });
}
export async function openPopSession(config,options={}){
  if(config.port!==995||config.security!=='implicit_tls')throw mailError('MAIL_IMPLICIT_TLS_995_REQUIRED',400);
  const socket=await (options.connect||connectStrictTls)(config);
  const lines=new Lines(socket);let closed=false;
  async function command(value,multi=false,maxBytes=MAX_UIDL_BYTES){
    assertReadOnlyPopCommand(value);
    if(closed)throw mailError('MAIL_SESSION_CLOSED');
    socket.write(value+'\r\n');positive(await lines.read());
    if(!multi)return [];
    const result=[];let count=0;
    for(;;){const line=await lines.read();if(line.length===1&&line[0]===46)break;
      const unstuffed=line.length>1&&line[0]===46&&line[1]===46?line.subarray(1):line;
      count+=unstuffed.length+2;if(count>maxBytes){socket.destroy();throw mailError('MAIL_RESPONSE_TOO_LARGE');}
      result.push(unstuffed);
    }
    return result;
  }
  try{positive(await lines.read());}catch(error){socket.destroy();throw error;}
  return {
    async login(username,password){
      try{await command('USER '+username);await command('PASS '+password);}catch(error){socket.destroy();throw mailError(error.code==='MAIL_COMMAND_FORBIDDEN'?'MAIL_CREDENTIAL_FORMAT_INVALID':'MAIL_AUTH_FAILED',401);}
    },
    async uidl(){return parseUidlLines((await command('UIDL',true)).map(line=>line.toString('ascii')));},
    async sizes(){
      const result=new Map();for(const line of await command('LIST',true)){
        const match=line.toString('ascii').match(/^([1-9]\d*) (\d+)$/);if(!match)throw mailError('MAIL_LIST_INVALID');
        result.set(Number(match[1]),Number(match[2]));
      }return result;
    },
    async headers(number){return Buffer.concat((await command('TOP '+number+' 0',true,512*1024)).flatMap(line=>[line,Buffer.from('\r\n')]));},
    async retrieve(number){return Buffer.concat((await command('RETR '+number,true,MAX_MESSAGE_BYTES)).flatMap(line=>[line,Buffer.from('\r\n')]));},
    async close(){if(closed)return;try{await command('QUIT');}finally{closed=true;socket.destroy();}},
    abort(){closed=true;socket.destroy();}
  };
}

export async function probeMailTls({host,port,protocol},options={}){
  if(!((protocol==='pop3'&&port===995)||(protocol==='smtp'&&port===465)))throw mailError('MAIL_PROBE_SCOPE_INVALID',400);
  const socket=await (options.connect||connectStrictTls)({host,port});const lines=new Lines(socket);
  try{
    const first=(await lines.read()).toString('ascii');
    if(protocol==='pop3')positive(Buffer.from(first));else{
      if(!/^220[ -]/.test(first))throw mailError('MAIL_SMTP_GREETING_INVALID');
      let line=first,count=0;while(line.startsWith('220-')){if(++count>50)throw mailError('MAIL_SMTP_GREETING_INVALID');line=(await lines.read()).toString('ascii');if(!/^220[ -]/.test(line))throw mailError('MAIL_SMTP_GREETING_INVALID');}
    }
    const cert=socket.getPeerCertificate?.()||{};
    const result={host,port,protocol,implicitTls:true,certificateVerified:socket.authorized===true,tlsVersion:socket.getProtocol?.()||null,certificateSha256:cert.fingerprint256||null,greetingAccepted:true,credentialCommands:0,messageReads:0,sendAttempts:0,deletionCommands:0};
    socket.write('QUIT\r\n');const goodbye=(await lines.read()).toString('ascii');
    if(protocol==='pop3')positive(Buffer.from(goodbye));else if(!/^221[ -]/.test(goodbye))throw mailError('MAIL_SMTP_QUIT_INVALID');
    return result;
  }finally{socket.destroy();}
}

export function mailboxAccountKey(config){return crypto.createHash('sha256').update(config.host.toLowerCase()+'\0'+config.username.toLowerCase()).digest('hex');}
export function uidlMessageId(accountKey,uidl){return crypto.createHash('sha256').update('cxorbia-pop-uidl-v1\0'+accountKey+'\0'+uidl).digest('hex');}
export function sealCredential(password,keyBase64,{tenantId,uid,accountKey}){
  const key=Buffer.from(String(keyBase64||''),'base64');if(key.length!==32)throw mailError('MAIL_ENCRYPTION_KEY_REQUIRED',503);
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(Buffer.from('cxorbia-mail-v1\0'+tenantId+'\0'+uid+'\0'+accountKey));
  const body=Buffer.concat([cipher.update(password,'utf8'),cipher.final()]);
  return {version:1,algorithm:'AES-256-GCM',iv:iv.toString('base64'),ciphertext:body.toString('base64'),tag:cipher.getAuthTag().toString('base64')};
}
export function unsealCredential(sealed,keyBase64,scope){
  try{
    if(sealed?.version!==1||sealed?.algorithm!=='AES-256-GCM')throw Error();
    const key=Buffer.from(String(keyBase64||''),'base64');if(key.length!==32)throw Error();
    const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(sealed.iv,'base64'));
    decipher.setAAD(Buffer.from('cxorbia-mail-v1\0'+scope.tenantId+'\0'+scope.uid+'\0'+scope.accountKey));
    decipher.setAuthTag(Buffer.from(sealed.tag,'base64'));
    return Buffer.concat([decipher.update(Buffer.from(sealed.ciphertext,'base64')),decipher.final()]).toString('utf8');
  }catch{throw mailError('MAIL_CREDENTIAL_UNSEAL_FAILED',503);}
}
