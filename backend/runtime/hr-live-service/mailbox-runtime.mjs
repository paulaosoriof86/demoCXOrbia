import crypto from 'node:crypto';
import fs from 'node:fs';
import {mailError,openPopSession,mailboxAccountKey,uidlMessageId,sealCredential,unsealCredential,MAX_MESSAGE_BYTES} from './mailbox-pop3.mjs';

const POLICY=JSON.parse(fs.readFileSync(new URL('../../config/mailbox-provider-policy.source-safe.json',import.meta.url),'utf8'));
const PREFIX=/^\/api\/tenants\/([a-zA-Z0-9_-]{1,80})\/mailboxes\/self(?:\/(status|connect|disconnect|sync|messages)(?:\/([a-f0-9]{64}))?)?$/;
const ALLOWED_ROLES=new Set(['super','admin','ops','coordinador','cliente','shopper']);
const MAX_BODY=16*1024;
const SAFE_CODES=new Set(['MAIL_AUTH_REQUIRED','MAIL_SESSION_INVALID','MAIL_MEMBERSHIP_DENIED','MAIL_DISABLED','MAIL_ENCRYPTION_KEY_REQUIRED','MAIL_PROVIDER_NOT_ALLOWED','MAIL_EMAIL_NOT_ALLOWED','MAIL_CREDENTIAL_FORMAT_INVALID','MAIL_BODY_TOO_LARGE','MAIL_BODY_INVALID','MAIL_AUTH_FAILED','MAIL_TLS_FAILED','MAIL_TLS_CERTIFICATE_INVALID','MAIL_TLS_TIMEOUT','MAIL_DNS_FAILED','MAIL_PUBLIC_HOST_REQUIRED','MAIL_PROVIDER_TIMEOUT','MAIL_PROVIDER_REJECTED','MAIL_UIDL_INVALID','MAIL_LIST_INVALID','MAIL_RESPONSE_TOO_LARGE','MAIL_SYNC_BUSY','MAIL_NOT_CONNECTED','MAIL_CONNECTION_CHANGED','MAIL_MESSAGE_NOT_FOUND','MAIL_MESSAGE_TOO_LARGE','MAIL_SYNC_COOLDOWN','MAIL_SEND_DISABLED','MAIL_MIME_INVALID','MAIL_CREDENTIAL_UNSEAL_FAILED','MAIL_CONFIG_CONFLICT','MAIL_REQUEST_SCOPE_INVALID']);
const hash=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
export function isMailboxRuntimePath(pathname){return pathname.includes('/mailboxes/')&&pathname.startsWith('/api/tenants/');}
export function validateMailboxIdentity(decoded,member,tenantId){
  const role=String(decoded?.role||'').toLowerCase(),namespace=String(decoded?.authNamespace||'').toLowerCase();
  if(!decoded?.uid||String(decoded.uid).includes('/')||String(decoded.tenantId)!==tenantId||!ALLOWED_ROLES.has(role)||!['staff','shopper'].includes(namespace)||!member||member.active===false||['inactive','disabled','deleted'].includes(String(member.status||'').toLowerCase())||String(member.role||'').toLowerCase()!==role||String(member.authNamespace||'').toLowerCase()!==namespace||(member.tenantId&&String(member.tenantId)!==tenantId))throw mailError('MAIL_MEMBERSHIP_DENIED',403);
  if((role==='shopper')!==(namespace==='shopper'))throw mailError('MAIL_MEMBERSHIP_DENIED',403);
  return {tenantId,uid:decoded.uid,role,namespace};
}
export function validateMailboxInput(body,providers){
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!['providerId','emailAddress','password'].includes(key)))throw mailError('MAIL_REQUEST_SCOPE_INVALID',400);
  const provider=providers.find(row=>row.id===body.providerId);
  if(!provider||provider.providerType!=='pop3_smtp_generic'||provider.port!==995||provider.security!=='implicit_tls'||provider.smtpPort!==465||provider.smtpSecurity!=='implicit_tls'||provider.sendEnabled!==false||provider.deleteEnabled!==false)throw mailError('MAIL_PROVIDER_NOT_ALLOWED',400);
  const username=String(body.emailAddress||'').trim().toLowerCase();
  if(!/^[^\s@\r\n\0]+@[^\s@\r\n\0]+$/.test(username)||username.length>320||!provider.allowedEmailDomains.includes(username.split('@')[1]))throw mailError('MAIL_EMAIL_NOT_ALLOWED',400);
  if(typeof body.password!=='string'||!body.password.length||body.password.length>1024||/[\r\n\0]/.test(body.password))throw mailError('MAIL_CREDENTIAL_FORMAT_INVALID',400);
  return {...provider,username};
}
export function planUidlBatch(rows,knownIds,accountKey,{older=false,anchor=null,limit=25}={}){
  const ordered=[...rows].sort((a,b)=>b.number-a.number);
  const start=older&&anchor?Math.max(0,ordered.findIndex(row=>row.uidl===anchor)+1):0;
  const window=ordered.slice(start,start+100);
  const selected=[];let scanned=[];
  for(const row of window){scanned.push(row);if(!knownIds.has(uidlMessageId(accountKey,row.uidl)))selected.push(row);if(selected.length>=limit)break;}
  return {selected,anchor:scanned.at(-1)?.uidl||anchor,hasMore:start+scanned.length<ordered.length,scanned:scanned.length};
}
export function htmlToPlain(value){return String(value||'').replace(/<(script|style|head)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<(?:br|\/p|\/div|\/li|\/tr)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&(?:nbsp|amp|lt|gt|quot|apos);/g,m=>({'&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"})[m]).replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_,v)=>{const n=v[0].toLowerCase()==='x'?parseInt(v.slice(1),16):Number(v);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';});}
const clean=(value,max=500)=>String(value||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').slice(0,max);
export async function parseMailboxMessage(raw,withBody=false){
  try{
    const {default:PostalMime}=await import('postal-mime');
    const mail=await PostalMime.parse(raw,{maxNestingDepth:32,maxHeadersSize:512*1024,maxPartCount:500,maxRfc822NestingDepth:0,maxForwardedAddresses:1000,forceRfc822Attachments:true});
    const date=Date.parse(mail.date||'');
    const result={subject:clean(mail.subject,1000)||'(Sin asunto)',fromName:clean(mail.from?.name),fromAddress:clean(mail.from?.address),to:(mail.to||[]).slice(0,50).map(row=>({name:clean(row.name),address:clean(row.address)})),date:Number.isFinite(date)?new Date(date).toISOString():null,messageId:clean(mail.messageId,1000)};
    if(withBody){result.text=clean(mail.text||htmlToPlain(mail.html),MAX_MESSAGE_BYTES);result.attachments=(mail.attachments||[]).slice(0,100).map(row=>({filename:clean(row.filename,200),mimeType:clean(row.mimeType,100),bytes:row.content?.byteLength||0,downloadAvailable:false}));result.bodyComplete=true;}
    return result;
  }catch(error){throw mailError('MAIL_MIME_INVALID');}
}
async function admin(){
  const [app,auth,firestore]=await Promise.all([import('firebase-admin/app'),import('firebase-admin/auth'),import('firebase-admin/firestore')]);
  if(!app.getApps().length)app.initializeApp({credential:app.applicationDefault(),projectId:process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT});
  return {db:firestore.getFirestore(),auth:auth.getAuth()};
}
async function principal(req,tenantId){
  const match=String(req.headers.authorization||'').match(/^Bearer\s+(.+)$/i);if(!match)throw mailError('MAIL_AUTH_REQUIRED',401);
  const {auth,db}=await admin();let decoded;
  try{decoded=await auth.verifyIdToken(match[1],true);}catch{throw mailError('MAIL_SESSION_INVALID',401);}
  const member=await db.doc(`tenants/${tenantId}/users/${decoded.uid}`).get();
  return {...validateMailboxIdentity(decoded,member.exists?member.data():null,tenantId),db};
}
async function readJson(req){
  let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY)throw mailError('MAIL_BODY_TOO_LARGE',413);chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}catch{throw mailError('MAIL_BODY_INVALID',400);}
}
function key(){const value=String(process.env.CXORBIA_MAILBOX_CREDENTIAL_KEY_B64||'');if(Buffer.from(value,'base64').length!==32)throw mailError('MAIL_ENCRYPTION_KEY_REQUIRED',503);return value;}
function refs(p){const mailbox=p.db.doc(`tenants/${p.tenantId}/users/${p.uid}/mailboxes/primary`);return {mailbox,secret:mailbox.collection('private').doc('credential')};}
function messageRefs(p,accountKey){return refs(p).mailbox.collection('accounts').doc(accountKey).collection('messages');}
function publicStatus(meta,providers,enabled){
  const connected=meta?.connectionStatus==='connected';
  return {mailboxId:'primary',emailAddress:meta?.emailAddress||null,providerId:meta?.providerId||null,providerType:meta?.providerType||null,connectionStatus:meta?.connectionStatus||'not_configured',enabled,canRead:enabled&&connected,canSend:false,canDeleteFromServer:false,leaveOnServer:true,lastSyncAt:meta?.lastSyncAt||null,lastError:meta?.lastError||null,providerMessageCount:meta?.providerMessageCount??null,hasOlder:meta?.hasOlder===true,providers:providers.map(row=>({id:row.id,label:row.label,host:row.host,port:row.port,security:row.security,smtpHost:row.smtpHost,smtpPort:row.smtpPort,smtpSecurity:row.smtpSecurity})),syncMode:'POP3_UIDL_POLL',outboundStatus:'disabled',localOutlookFoldersImported:false};
}
export function assertSameLease(meta,lease){if(meta?.generation!==lease.generation||meta?.leaseId!==lease.id||meta?.accountKey!==lease.accountKey||meta?.connectionStatus!=='connected')throw mailError('MAIL_CONNECTION_CHANGED',409);}
async function acquire(p,{cooldown=false}={}){
  const {mailbox,secret}=refs(p);return p.db.runTransaction(async tx=>{
    const [ms,ss]=await Promise.all([tx.get(mailbox),tx.get(secret)]);const meta=ms.data();
    if(!meta||meta.connectionStatus!=='connected'||!ss.exists)throw mailError('MAIL_NOT_CONNECTED',409);
    if(meta.leaseUntil>Date.now())throw mailError('MAIL_SYNC_BUSY',409);
    if(meta.nextRetryAt>Date.now()||(cooldown&&meta.lastSyncMs>Date.now()-15000))throw mailError('MAIL_SYNC_COOLDOWN',429);
    const lease={id:crypto.randomUUID(),generation:meta.generation,accountKey:meta.accountKey,meta,sealed:ss.data().sealed};
    tx.update(mailbox,{leaseId:lease.id,leaseUntil:Date.now()+120000});return lease;
  });
}
async function release(p,lease,patch={}){
  const {mailbox}=refs(p);return p.db.runTransaction(async tx=>{const snap=await tx.get(mailbox);const meta=snap.data();assertSameLease(meta,lease);tx.update(mailbox,{...patch,leaseId:null,leaseUntil:0,updatedAt:new Date().toISOString()});});
}
async function withSession(p,lease,operation){
  const provider=POLICY.tenants[p.tenantId]?.providers?.find(row=>row.id===lease.meta.providerId);
  if(!provider)throw mailError('MAIL_PROVIDER_NOT_ALLOWED',409);
  let password=unsealCredential(lease.sealed,key(),{...p,accountKey:lease.accountKey});let pop;
  try{pop=await openPopSession(provider);await pop.login(lease.meta.emailAddress,password);password='';return await operation(pop);}
  finally{password='';if(pop)await pop.close().catch(()=>pop.abort());}
}
async function connect(p,body,providers){
  const config=validateMailboxInput(body,providers),accountKey=mailboxAccountKey(config),{mailbox,secret}=refs(p);key();
  const initial=await mailbox.get();const previousGeneration=initial.data()?.generation||null;
  if(initial.data()?.leaseUntil>Date.now())throw mailError('MAIL_SYNC_BUSY',409);
  let pop;let rows;
  try{pop=await openPopSession(config);await pop.login(config.username,body.password);rows=await pop.uidl();}
  finally{if(pop)await pop.close().catch(()=>pop.abort());}
  const sealed=sealCredential(body.password,key(),{...p,accountKey});body.password='';
  const now=new Date().toISOString(),generation=crypto.randomUUID();
  await p.db.runTransaction(async tx=>{
    const current=await tx.get(mailbox);
    if((current.data()?.generation||null)!==previousGeneration||current.data()?.leaseUntil>Date.now())throw mailError('MAIL_CONFIG_CONFLICT',409);
    tx.set(secret,{sealed,accountKey,generation,updatedAt:now});
    tx.set(mailbox,{mailboxId:'primary',tenantId:p.tenantId,userId:p.uid,providerId:config.id,providerType:config.providerType,emailAddress:config.username,accountKey,generation,connectionStatus:'connected',mailboxOwnershipType:'tenant_assigned_email',privacyScope:'owner_only',canRead:true,canSend:false,canDeleteFromServer:false,leaveOnServer:true,connectedAt:now,updatedAt:now,providerAck:{operation:'POP3_AUTH_UIDL',ack:true,observedAt:now,uidlRevision:hash(rows.map(row=>row.uidl).sort().join('\n'))},providerMessageCount:rows.length,leaseId:null,leaseUntil:0,lastError:null,hasOlder:rows.length>0});
  });
  return publicStatus((await mailbox.get()).data(),providers,true);
}
async function sync(p,body){
  if(Object.keys(body).some(name=>name!=='older')||(body.older!==undefined&&typeof body.older!=='boolean'))throw mailError('MAIL_REQUEST_SCOPE_INVALID',400);
  const lease=await acquire(p,{cooldown:body.older!==true});const collection=messageRefs(p,lease.accountKey);
  try{
    const result=await withSession(p,lease,async pop=>{
      const rows=await pop.uidl(),sizes=await pop.sizes();
      const ordered=[...rows].sort((a,b)=>b.number-a.number),head=ordered[0]?.uidl||null;
      const anchor=lease.meta.scanHeadUidl===head&&lease.meta.hasOlder?lease.meta.backfillAnchor:null;
      const start=anchor?Math.max(0,ordered.findIndex(row=>row.uidl===anchor)+1):0;
      const window=ordered.slice(start,start+100);
      const existing=window.length?await p.db.getAll(...window.map(row=>collection.doc(uidlMessageId(lease.accountKey,row.uidl)))):[];
      const plan=planUidlBatch(rows,new Set(existing.filter(snap=>snap.exists).map(snap=>snap.id)),lease.accountKey,{older:Boolean(anchor),anchor});
      const messages=[];
      for(const row of plan.selected){
        const size=sizes.get(row.number);let raw;let parsed;
        try{raw=await pop.headers(row.number);}catch(error){
          if(error.code!=='MAIL_PROVIDER_REJECTED')throw error;
          if(!Number.isFinite(size)||size>MAX_MESSAGE_BYTES)throw mailError('MAIL_MESSAGE_TOO_LARGE',413);
          raw=await pop.retrieve(row.number);
        }
        parsed=await parseMailboxMessage(raw);
        messages.push({id:uidlMessageId(lease.accountKey,row.uidl),...parsed,uidl:row.uidl,bytes:Number.isFinite(size)?size:null,receivedOrder:row.number,sortTime:parsed.date?Date.parse(parsed.date):0,providerPresent:true,read:false,observedAt:new Date().toISOString(),source:'POP3_UIDL_PROVIDER'});
      }
      const after=await pop.uidl();const revision=hash(rows.map(row=>row.uidl).sort().join('\n'));
      if(revision!==hash(after.map(row=>row.uidl).sort().join('\n')))throw mailError('MAIL_CONNECTION_CHANGED',409);
      const visible=await collection.orderBy('sortTime','desc').limit(100).get();
      const currentUidls=new Set(rows.map(row=>row.uidl));
      const presence=visible.docs.map(doc=>({id:doc.id,present:currentUidls.has(doc.data().uidl)}));
      return {messages,plan,count:rows.length,revision,head,presence};
    });
    const {mailbox}=refs(p),now=new Date().toISOString();
    await p.db.runTransaction(async tx=>{
      const meta=(await tx.get(mailbox)).data();assertSameLease(meta,lease);
      const checks=await Promise.all(result.messages.map(row=>tx.get(collection.doc(row.id))));
      for(let i=0;i<result.messages.length;i++)if(!checks[i].exists)tx.create(collection.doc(result.messages[i].id),result.messages[i]);
      for(const row of result.presence)tx.update(collection.doc(row.id),{providerPresent:row.present,presenceCheckedAt:now});
      tx.update(mailbox,{leaseId:null,leaseUntil:0,lastSyncAt:now,lastSyncMs:Date.now(),providerMessageCount:result.count,lastError:null,failureCount:0,nextRetryAt:0,providerAck:{operation:'POP3_UIDL_READ',ack:true,observedAt:now,uidlRevision:result.revision},scanHeadUidl:result.head,backfillAnchor:result.plan.anchor||null,hasOlder:result.plan.hasMore,updatedAt:now});
    });
    return {imported:result.messages.length,providerMessageCount:result.count,moreInWindow:result.plan.hasMore,providerAck:true,observedAt:now,uidlRevision:result.revision};
  }catch(error){const failureCount=Math.min(8,(lease.meta.failureCount||0)+1);await release(p,lease,{lastError:SAFE_CODES.has(error.code)?error.code:'MAIL_PROVIDER_FAILED',failureCount,nextRetryAt:Date.now()+Math.min(900000,60000*2**(failureCount-1)),...(error.code==='MAIL_AUTH_FAILED'?{connectionStatus:'connection_error',canRead:false}:{})}).catch(()=>{});throw error;}
}
async function listMessages(p,url){
  const meta=(await refs(p).mailbox.get()).data();if(meta?.connectionStatus!=='connected')throw mailError('MAIL_NOT_CONNECTED',409);
  const cursor=url.searchParams.get('before');if(cursor&&!/^\d{1,16}:[a-f0-9]{64}$/.test(cursor))throw mailError('MAIL_REQUEST_SCOPE_INVALID',400);
  let query=messageRefs(p,meta.accountKey).orderBy('sortTime','desc').orderBy('__name__','desc').select('id','subject','fromName','fromAddress','date','bytes','sortTime','read','providerPresent','observedAt','presenceCheckedAt').limit(51);
  if(cursor){const [order,id]=cursor.split(':');query=query.startAfter(Number(order),id);}
  const snap=await query.get();const current=(await refs(p).mailbox.get()).data();
  if(current?.generation!==meta.generation||current?.connectionStatus!=='connected')throw mailError('MAIL_CONNECTION_CHANGED',409);
  const rows=snap.docs.slice(0,50).map(doc=>doc.data());
  const last=rows.at(-1);return {messages:rows,nextCursor:snap.docs.length>50&&last?last.sortTime+':'+last.id:null,canSend:false};
}
async function readMessage(p,id){
  const lease=await acquire(p),ref=messageRefs(p,lease.accountKey).doc(id);
  try{
    const snap=await ref.get();if(!snap.exists)throw mailError('MAIL_MESSAGE_NOT_FOUND',404);
    const stored=snap.data();const result=await withSession(p,lease,async pop=>{
      const rows=await pop.uidl(),row=rows.find(candidate=>uidlMessageId(lease.accountKey,candidate.uidl)===id&&candidate.uidl===stored.uidl);
      if(!row){if(stored.bodyComplete===true)return {...stored,providerPresent:false};throw mailError('MAIL_MESSAGE_NOT_FOUND',404);}
      if(stored.bodyComplete===true)return {...stored,providerPresent:true};
      const sizes=await pop.sizes(),size=sizes.get(row.number);if(!Number.isFinite(size)||size>MAX_MESSAGE_BYTES)throw mailError('MAIL_MESSAGE_TOO_LARGE',413);
      return {...stored,...await parseMailboxMessage(await pop.retrieve(row.number),true),providerPresent:true};
    });
    const {mailbox}=refs(p);
    await p.db.runTransaction(async tx=>{const meta=(await tx.get(mailbox)).data();assertSameLease(meta,lease);tx.update(ref,{read:true,providerPresent:result.providerPresent,presenceCheckedAt:new Date().toISOString(),...(Buffer.byteLength(result.text||'')<600000?{text:result.text||'',attachments:result.attachments||[],bodyComplete:true}:{}),readAt:new Date().toISOString()});tx.update(mailbox,{leaseId:null,leaseUntil:0});});
    const {uidl,...visible}=result;return {...visible,read:true};
  }catch(error){await release(p,lease).catch(()=>{});throw error;}
}
function send(res,status,payload){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store, private');res.setHeader('Pragma','no-cache');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(payload));}
export async function maybeHandleMailboxRequest(req,res,url){
  if(!isMailboxRuntimePath(url.pathname))return false;
  try{
    const match=url.pathname.match(PREFIX);if(!match){send(res,404,{ok:false,error:'MAIL_ROUTE_NOT_FOUND'});return true;}
    const [,tenantId,action='status',id]=match,p=await principal(req,tenantId);
    const providers=POLICY.tenants[tenantId]?.providers||[];
    const enabled=process.env.CXORBIA_USER_MAILBOX_ENABLED==='true'&&providers.length>0;
    if(req.method==='GET'&&action==='status'&&!id){let configured=false;try{key();configured=true;}catch{}
      send(res,200,{ok:true,...publicStatus((await refs(p).mailbox.get()).data(),providers,enabled&&configured),setupRequired:!enabled?'CXORBIA_USER_MAILBOX_ENABLED':!configured?'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64':null});return true;}
    if(req.method==='POST'&&action==='disconnect'&&!id){const {mailbox,secret}=refs(p);await p.db.runTransaction(async tx=>{await tx.get(mailbox);tx.delete(secret);tx.set(mailbox,{connectionStatus:'revoked',canRead:false,canSend:false,generation:crypto.randomUUID(),leaseId:null,leaseUntil:0,updatedAt:new Date().toISOString()},{merge:true});});send(res,200,{ok:true,connectionStatus:'revoked',providerAccountDeleted:false,remoteMessagesDeleted:0});return true;}
    if(!enabled)throw mailError('MAIL_DISABLED',503);key();
    if(req.method==='GET'&&action==='messages'){send(res,200,{ok:true,...(id?{message:await readMessage(p,id)}:await listMessages(p,url))});return true;}
    if(req.method==='POST'&&!id&&['connect','sync'].includes(action)){const body=await readJson(req);try{send(res,200,{ok:true,...(action==='connect'?await connect(p,body,providers):await sync(p,body))});}finally{if(Object.hasOwn(body,'password'))body.password='';}return true;}
    send(res,405,{ok:false,error:'MAIL_METHOD_NOT_ALLOWED',canSend:false});return true;
  }catch(error){send(res,error.status||502,{ok:false,error:SAFE_CODES.has(error.code)?error.code:'MAIL_PROVIDER_FAILED',canSend:false});return true;}
}
