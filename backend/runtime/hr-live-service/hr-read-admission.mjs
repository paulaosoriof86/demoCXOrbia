import {createHash,randomUUID} from 'node:crypto';
import {AsyncLocalStorage} from 'node:async_hooks';

// A single, operator-owned DEV window shares one spending ceiling across all
// instances. Client security rules grant no access to this root collection.
const policyPath='cxorbiaProviderBudgets/dev_make_hr_reader';
const context=new AsyncLocalStorage();
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const validId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(value);
const whole=value=>Number.isSafeInteger(value)&&value>=0;
const deny=reason=>{throw Error('PROVIDER_FAILURE:HR_READ_'+reason);};
export const readerTicketKey=inputs=>hash([inputs.bindingFingerprint,inputs.countryCode,inputs.periodId,inputs.driveId,
  inputs.itemId,inputs.worksheetId,inputs.rangeAddress,inputs.operation||'range']);
const scopeMatches=(a,b)=>a.tenantId===b.tenantId&&a.projectId===b.projectId;
const deterministic=message=>message.match(/^(?:AUTH_FAILURE|MAPPING_FAILURE):[A-Z0-9_]+(?=:|$)/)?.[0];

// Entry points derive the process and actor from verified credentials. No
// request-supplied budget, price, binding or balance is accepted.
export function withReaderIdentity(identity,work){
  return context.run({...identity,requestId:identity.requestId||randomUUID()},work);
}

export async function runAdmittedSnapshot({db,scope,bindingKey,work}){
  const who=context.getStore();
  if(!who||!scopeMatches(who,scope)||!/^[a-f0-9]{64}$/.test(bindingKey))deny('WINDOW_REQUIRED');
  const policy=db.doc(policyPath);
  const lease=db.doc('tenants/'+scope.tenantId+'/projects/'+scope.projectId+'/hrReadModels/automatic_sync_v1');
  const attempt=hash([who.actor,who.process,who.runId,who.requestId,scope.tenantId,scope.projectId]);
  const receipt=policy.collection('attempts').doc(attempt);
  const quarantine=lease.collection('bindingFailures').doc(bindingKey);
  await db.runTransaction(async tx=>{
    const [p,l,r,q]=await Promise.all([tx.get(policy),tx.get(lease),tx.get(receipt),tx.get(quarantine)]);
    const window=p.data(),lock=l.data(),previous=r.data();
    if(q.exists)throw Error(q.data().code);
    if(lock?.quarantine?.bindingKey===bindingKey)throw Error(lock.quarantine.code);
    if(previous?.state==='FAILED')throw Error(previous.code);
    if(previous)deny('ATTEMPT_'+(['COMPLETE','FAILED','RESERVED'].includes(previous.state)?previous.state:'INVALID'));
    const rule=window?.grants?.find(g=>g.process===who.process&&g.actor===who.actor&&g.runId===who.runId);
    if(window?.enabled!==true||!scopeMatches(window,scope)||window.bindingKey!==bindingKey||
      !validId(window.windowId)||!whole(window.expiresAt)||Date.now()>=window.expiresAt||
      !Array.isArray(rule?.tickets)||!rule.tickets.length||!rule.tickets.every(k=>/^[a-f0-9]{64}$/.test(k))||!whole(rule.maxCalls)||rule.maxCalls<1||!whole(window.maxCreditsPerCall)||window.maxCreditsPerCall<3||
      !whole(window.recoveryReserve)||window.recoveryReserve<100||!whole(window.protectedAllocation)||
      !whole(window.spendingLimit)||window.spendingLimit>60||!whole(window.reserved)||
      !/^[a-f0-9]{64}$/.test(window.allocationReceiptSha256||''))deny('WINDOW_CLOSED');
    const max=rule.maxCalls*window.maxCreditsPerCall;
    const total=window.reserved+max;
    if(!Number.isSafeInteger(total)||total>window.spendingLimit||total+window.recoveryReserve>window.protectedAllocation)deny('BUDGET_EXHAUSTED');
    tx.update(policy,{reserved:total});
    tx.create(receipt,{windowId:window.windowId,bindingKey,process:who.process,runId:who.runId,actorHash:hash(who.actor),
      tenantId:scope.tenantId,projectId:scope.projectId,maxCalls:rule.maxCalls,maxCredits:max,state:'RESERVED',calls:{},startedAt:Date.now()});
  });
  let current;
  try{
    current=await context.run({...who,policy,lease,quarantine,receipt,attempt,bindingKey,db},work);
  }catch(error){
    const code=deterministic(String(error?.message||''))||'PROVIDER_FAILURE:HR_READ_INCOMPLETE';
    await db.runTransaction(async tx=>{
      const l=await tx.get(lease);
      tx.update(receipt,{state:'FAILED',code,finishedAt:Date.now()});
      if(deterministic(code))tx.set(quarantine,{bindingKey,code,recordedAt:Date.now()});
      if(deterministic(code)&&(!l.data()?.bindingKey||l.data().bindingKey===bindingKey))
        tx.set(lease,{...l.data(),quarantine:{bindingKey,code,recordedAt:Date.now()}});
    });
    throw error;
  }
  if(!/^[a-f0-9]{64}$/.test(current?.revision))deny('RESULT_REVISION');
  await receipt.update({state:'COMPLETE',revision:current.revision,finishedAt:Date.now()});
  return current;
}

// Reserve each actual Make invocation before dispatch. An uncertain response
// retains its ticket, even across process death or a Cloud Run restart.
export async function admitReaderCall(inputs,send){
  const ctx=context.getStore();
  if(!ctx?.receipt||!scopeMatches(ctx,inputs))deny('ATTEMPT_REQUIRED');
  const {db,receipt,policy,attempt}=ctx;
  const key=readerTicketKey(inputs);
  await db.runTransaction(async tx=>{
    const [p,r,l,q]=await Promise.all([tx.get(policy),tx.get(receipt),tx.get(ctx.lease),tx.get(ctx.quarantine)]);
    if(q.exists)throw Error(q.data().code);
    const w=p.data(),a=r.data();
    if(l.data()?.quarantine?.bindingKey===ctx.bindingKey)throw Error(l.data().quarantine.code);
    if(!w||!a||w.enabled!==true||w.windowId!==a.windowId||w.bindingKey!==a.bindingKey||w.expiresAt<=Date.now()||
      a.state!=='RESERVED'||!w.grants?.some(g=>g.actor===ctx.actor&&g.process===ctx.process&&g.runId===ctx.runId&&g.tickets?.includes(key)))deny('WINDOW_CLOSED');
    if(Object.hasOwn(a.calls,key)||Object.keys(a.calls).length>=a.maxCalls)deny('TICKET_UNAVAILABLE');
    tx.update(receipt,{calls:{...a.calls,[key]:'DISPATCHED'}});
  });
  console.info(JSON.stringify({event:'cxorbia.hr.reader.dispatch',process:ctx.process,runId:ctx.runId,
    tenantId:ctx.tenantId,projectId:ctx.projectId,attempt,ticket:key}));
  const result=await send();
  await db.runTransaction(async tx=>{
    const a=(await tx.get(receipt)).data();
    if(a?.calls?.[key]!=='DISPATCHED')deny('TICKET_READBACK');
    tx.update(receipt,{calls:{...a.calls,[key]:'RETURNED'}});
  });
  return result;
}


export async function readReaderOutcome(db,scope,actor,process,runId,requestId){
  if(!validId(requestId)||!validId(runId))deny('RECEIPT_ID');
  const key=hash([actor,process,runId,requestId,scope.tenantId,scope.projectId]);
  const row=(await db.doc(policyPath).collection('attempts').doc(key).get()).data();
  if(!row||row.actorHash!==hash(actor)||row.process!==process||row.runId!==runId||!scopeMatches(row,scope))deny('RECEIPT_UNAVAILABLE');
  return {state:row.state,code:row.code||null,revision:row.revision||null,
    startedAt:row.startedAt,finishedAt:row.finishedAt||null,dispatched:Object.keys(row.calls).length,
    returned:Object.values(row.calls).filter(v=>v==='RETURNED').length,externalReadCurrent:false};
}
