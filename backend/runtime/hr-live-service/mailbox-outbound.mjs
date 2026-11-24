import crypto from 'node:crypto';
import {mailError,unsealCredential} from './mailbox-pop3.mjs';
import {buildOutgoingMime,mailboxAddress,submitSmtp,validateOutgoing} from './mailbox-smtp.mjs';

const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const SEND_ERRORS=new Set(['MAIL_AUTH_FAILED','MAIL_TLS_FAILED','MAIL_TLS_CERTIFICATE_INVALID','MAIL_TLS_TIMEOUT','MAIL_DNS_FAILED','MAIL_PUBLIC_HOST_REQUIRED','MAIL_PROVIDER_TIMEOUT','MAIL_PROVIDER_IO_FAILED','MAIL_PROVIDER_CLOSED','MAIL_SMTP_RESPONSE_INVALID','MAIL_SMTP_GREETING_INVALID','MAIL_SMTP_AUTH_UNSUPPORTED','MAIL_SMTP_RECIPIENT_REJECTED','MAIL_SMTP_REJECTED','MAIL_CONNECTION_CHANGED','MAIL_CREDENTIAL_UNSEAL_FAILED','MAIL_ENCRYPTION_KEY_REQUIRED']);
const ACTIVE=new Set(['prepared','data_in_flight']);
const paths=p=>{const mailbox=p.db.doc(`tenants/${p.tenantId}/users/${p.uid}/mailboxes/primary`);return {mailbox,secret:mailbox.collection('private').doc('credential')};};
const account=(p,key)=>paths(p).mailbox.collection('accounts').doc(key);
const refFor=(p,key,id)=>account(p,key).collection('outgoing').doc(id);
export function smtpEnabled(meta,providers,enabled=process.env.CXORBIA_USER_MAILBOX_SEND_ENABLED==='true'){
  const provider=providers.find(row=>row.id===meta?.providerId);
  return enabled&&meta?.connectionStatus==='connected'&&provider?.providerType==='pop3_smtp_generic'&&provider.sendEnabled===true&&provider.smtpPort===465&&provider.smtpSecurity==='implicit_tls'&&provider.deleteEnabled===false&&provider.allowedEmailDomains?.includes(String(meta.emailAddress||'').split('@')[1]);
}
function visible(row,detail=false){
  const status=ACTIVE.has(row.status)?'sending':row.status;
  return {id:row.id,status,from:row.from,to:row.to,subject:row.subject,messageId:row.messageId,parentId:row.parentId,inReplyTo:row.inReplyTo,createdAt:row.createdAt,updatedAt:row.updatedAt,error:row.error||null,providerAck:row.smtpAck||null,retryAllowed:status==='not_sent',...(detail?{text:row.text}:{}),deliveryConfirmed:false};
}
function settleExpired(row,now=Date.now()){
  if(ACTIVE.has(row.status)&&row.leaseUntil<=now)return {...row,status:row.status==='data_in_flight'?'delivery_unknown':'not_sent',error:row.status==='data_in_flight'?'MAIL_SEND_UNCERTAIN':'MAIL_SEND_INTERRUPTED_BEFORE_DATA',updatedAt:new Date(now).toISOString()};
  return row;
}
export async function outgoingStatus(p,id=null){
  const {mailbox}=paths(p),meta=(await mailbox.get()).data();
  if(!meta?.accountKey)return id?Promise.reject(mailError('MAIL_MESSAGE_NOT_FOUND',404)):{messages:[]};
  if(id&&!/^[a-f0-9]{64}$/.test(id))throw mailError('MAIL_REQUEST_SCOPE_INVALID',400);
  const collection=account(p,meta.accountKey).collection('outgoing');
  const docs=id?[await collection.doc(id).get()]:(await collection.orderBy('createdAt','desc').limit(50).get()).docs;
  const rows=[];
  for(const doc of docs){
    if(!doc.exists){if(id)throw mailError('MAIL_MESSAGE_NOT_FOUND',404);continue;}
    const original=doc.data();
    const row=ACTIVE.has(original.status)&&original.leaseUntil<=Date.now()?await p.db.runTransaction(async tx=>{const snap=await tx.get(doc.ref),stored=snap.data();if(!stored)return null;const next=settleExpired(stored);if(next!==stored)tx.update(doc.ref,{status:next.status,error:next.error,updatedAt:next.updatedAt});return next;}):original;
    if(row)rows.push(visible(row,Boolean(id)));
  }
  const current=(await mailbox.get()).data();
  if(current?.generation!==meta.generation||current?.accountKey!==meta.accountKey)throw mailError('MAIL_CONNECTION_CHANGED',409);
  return id?{message:rows[0]}:{messages:rows};
}

// p is produced only by the HTTP handler's revoked-token and durable-membership
// checks. Every reference below is derived from that tenant/UID, never the body.
export async function dispatchOutgoing(p,body,action,providers,{credentialKey,sendEnabled,submit=submitSmtp,now=()=>Date.now()}={}){
  const {mailbox,secret}=paths(p),initial=(await mailbox.get()).data();
  if(!initial?.accountKey||initial.connectionStatus!=='connected')throw mailError('MAIL_NOT_CONNECTED',409);
  let parent=null;
  if(action==='reply'){
    if(!body||typeof body.parentId!=='string'||!/^[a-f0-9]{64}$/.test(body.parentId))throw mailError('MAIL_MESSAGE_NOT_FOUND',404);
    const snapshot=await account(p,initial.accountKey).collection('messages').doc(body.parentId).get();
    if(!snapshot.exists)throw mailError('MAIL_MESSAGE_NOT_FOUND',404);parent=snapshot.data();
  }
  const content=validateOutgoing(body,action,parent),from=mailboxAddress(initial.emailAddress);
  const id=hash('cxorbia-mail-outbound-v1\0'+body.idempotencyKey),requestDigest=hash(JSON.stringify({from,...content})),ref=refFor(p,initial.accountKey,id);
  const guard=account(p,initial.accountKey).collection('outgoingGuards').doc(requestDigest);
  const reservation=await p.db.runTransaction(async tx=>{
    const [ms,ss,os,gs]=await Promise.all([tx.get(mailbox),tx.get(secret),tx.get(ref),tx.get(guard)]),meta=ms.data();
    if(meta?.generation!==initial.generation||meta?.accountKey!==initial.accountKey||meta?.connectionStatus!=='connected')throw mailError('MAIL_CONNECTION_CHANGED',409);
    if(os.exists){
      const stored=os.data();if(stored.requestDigest!==requestDigest)throw mailError('MAIL_IDEMPOTENCY_CONFLICT',409);
      const settled=settleExpired(stored,now());if(settled!==stored)tx.update(ref,{status:settled.status,error:settled.error,updatedAt:settled.updatedAt});
      return {existing:settled};
    }
    if(gs.exists&&gs.data().outgoingId!==id){
      const prior=await tx.get(refFor(p,initial.accountKey,gs.data().outgoingId));
      const state=prior.exists?settleExpired(prior.data(),now()).status:null;
      if(ACTIVE.has(state)||state==='delivery_unknown')throw mailError('MAIL_DUPLICATE_UNRESOLVED',409);
    }
    if(!smtpEnabled(meta,providers,sendEnabled))throw mailError('MAIL_SEND_DISABLED',503);
    if(meta.leaseUntil>now())throw mailError('MAIL_SYNC_BUSY',409);
    if(!ss.exists||ss.data().accountKey!==meta.accountKey||ss.data().generation!==meta.generation)throw mailError('MAIL_NOT_CONNECTED',409);
    const leaseId=crypto.randomUUID(),leaseUntil=now()+120000,createdAt=new Date(now()).toISOString();
    const messageId='<cxorbia-'+hash(p.tenantId+'\0'+p.uid+'\0'+meta.accountKey+'\0'+id)+'@'+from.split('@')[1]+'>';
    const row={id,requestDigest,from,...content,messageId,status:'prepared',leaseId,leaseUntil,generation:meta.generation,accountKey:meta.accountKey,createdAt,updatedAt:createdAt,smtpAck:null,error:null};
    tx.create(ref,row);tx.set(guard,{outgoingId:id,createdAt});tx.update(mailbox,{leaseId,leaseUntil,leaseOperation:'smtp'});
    return {row,sealed:ss.data().sealed,provider:providers.find(provider=>provider.id===meta.providerId)};
  });
  if(reservation.existing)return {outgoing:visible(reservation.existing),idempotentReplay:true};
  const {row,provider}=reservation;
  const finish=async(status,{ack=null,error=null}={})=>p.db.runTransaction(async tx=>{
    const [out,ms]=await Promise.all([tx.get(ref),tx.get(mailbox)]),stored=out.data(),meta=ms.data();
    if(!stored||stored.leaseId!==row.leaseId)throw mailError('MAIL_SEND_RECORD_UNAVAILABLE',503);
    if(stored.status==='smtp_accepted')return stored;
    const updated={...stored,status,smtpAck:ack,error,updatedAt:new Date(now()).toISOString()};
    tx.update(ref,{status,smtpAck:ack,error,updatedAt:updated.updatedAt});
    if(meta?.leaseId===row.leaseId&&meta?.generation===row.generation)tx.update(mailbox,{leaseId:null,leaseUntil:0,leaseOperation:null,lastSendAt:updated.updatedAt,lastSendError:error});
    return updated;
  });
  let config,enteredData=false;
  try{
    config={...provider,username:row.from,password:unsealCredential(reservation.sealed,credentialKey,{...p,accountKey:row.accountKey})};
    const mime=buildOutgoingMime({...row,date:row.createdAt});
    const ack=await submit(config,{to:row.to,mime,messageId:row.messageId},{beforeData:async()=>{
      await p.db.runTransaction(async tx=>{
        const [ms,os]=await Promise.all([tx.get(mailbox),tx.get(ref)]),meta=ms.data(),out=os.data();
        if(meta?.generation!==row.generation||meta?.accountKey!==row.accountKey||meta?.connectionStatus!=='connected'||meta?.leaseId!==row.leaseId||meta.leaseUntil<=now()||out?.leaseId!==row.leaseId||out?.status!=='prepared')throw mailError('MAIL_CONNECTION_CHANGED',409);
        tx.update(ref,{status:'data_in_flight',dataStartedAt:new Date(now()).toISOString(),updatedAt:new Date(now()).toISOString()});
      });
      enteredData=true;
    }});
    if(!ack?.accepted||ack.code!==250||ack.messageId!==row.messageId)throw Object.assign(mailError('MAIL_SMTP_RESPONSE_INVALID'),{deliveryUnknown:true});
    let accepted;
    try{accepted=await finish('smtp_accepted',{ack});}catch{throw mailError('MAIL_SEND_RECORD_UNAVAILABLE',503);}
    return {outgoing:visible(accepted),idempotentReplay:false};
  }catch(error){
    // A lost journal write after positive SMTP ACK must never become "not sent".
    if(error.code==='MAIL_SEND_RECORD_UNAVAILABLE')throw error;
    const uncertain=error.deliveryUnknown===true||(enteredData&&error.deliveryUnknown!==false);
    let outcome;
    try{outcome=await finish(uncertain?'delivery_unknown':'not_sent',{error:uncertain?'MAIL_SEND_UNCERTAIN':SEND_ERRORS.has(error.code)?error.code:'MAIL_SEND_FAILED'});}catch{throw mailError('MAIL_SEND_RECORD_UNAVAILABLE',503);}
    return {outgoing:visible(outcome),idempotentReplay:false};
  }finally{if(config)config.password='';}
}
