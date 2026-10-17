#!/usr/bin/env node
/* CXOrbia Recovery I3 command runtime shim.
   Import side effects: zero writes, zero provider initialization.
*/
import crypto from 'node:crypto';
import { createProjectCommandProvider } from '../cxorbia-project-command-provider-v1.mjs';
import { createOperationalCommandProvider } from '../cxorbia-operational-command-provider-v1.mjs';
import { createShopperCommandProvider } from '../cxorbia-shopper-command-provider-v1.mjs';
import { createFinanceCommandProvider } from '../cxorbia-finance-command-provider-v1.mjs';
import { createCommercialCommandProvider } from '../cxorbia-commercial-command-provider-v1.mjs';
import { createAcademyCommandProvider } from '../cxorbia-academy-command-provider-v1.mjs';



/* G05: only the explicit, verified command below may invoke HR reconciliation.
   The facade records the existing providers' effects without changing identity rules.
   Auth and Firestore are not one transaction: uncertain Auth outcomes stay on HOLD. */
const hrStable=value=>Array.isArray(value)?value.map(hrStable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,hrStable(value[k])])):value;
const hrDigest=value=>crypto.createHash('sha256').update(JSON.stringify(hrStable(value))).digest('hex');
const hrCode=error=>str(error?.code||error?.message||'HR_RECONCILIATION_FAILED').split(':')[0].replace(/[^a-zA-Z0-9_/-]/g,'_').slice(0,100);
const hrError=code=>Object.assign(new Error(code),{code});
const hrMatches=(actual,expected)=>Object.entries(expected).every(([key,value])=>{
  if(value&&typeof value==='object'&&!Array.isArray(value))return actual?.[key]&&hrMatches(actual[key],value);
  return hrDigest(actual?.[key]??null)===hrDigest(value??null);
});
const HR_TERMINAL=new Set(['committed','committed_with_identity_review']);

export function createHrSnapshotReconciler({
  verifyPrincipal,readSnapshot,ensureAdmin,shopperPolicy,operationalPolicy,
  shopperProviderFactory=createShopperCommandProvider,
  operationalProviderFactory=createOperationalCommandProvider,
  now=Date.now,leaseMs=120000
}={}){
  if([verifyPrincipal,readSnapshot,ensureAdmin,shopperPolicy,operationalPolicy].some(fn=>typeof fn!=='function'))throw hrError('HR_RECONCILIATION_DEPENDENCIES_REQUIRED');

  return async function reconcileHrSnapshot({req,command={}}={}){
    let receiptRef=null,lockRef=null,db=null,attemptId=null,digest=null,sourceRevision=null,principal=null;
    let acquired=false,controlWrites=0;
    const base=()=>({
      commandType:'hr.snapshot.reconcile',tenantId:command.tenantId,projectId:command.projectId,
      sourceRevision,receiptPath:receiptRef?.path||null,
      receiptBinding:{tenantId:command.tenantId,projectId:command.projectId,sourceRevision,actorUid:principal?.uid||null,idempotencyKey:command.idempotencyKey,commandType:'hr.snapshot.reconcile'},
      localMutation:false,localStorageWrite:false,hrWrites:0,storageWrites:0,production:false
    });
    const stop=(code,extra={})=>blocked(code,{...base(),controlWrites,...extra});
    const stamp=()=>new Date(now()).toISOString();
    const leasePatch=async(fn)=>{
      let writes=0;
      const result=await db.runTransaction(async tx=>{
        writes=0;
        const lock=(await tx.get(lockRef)).data()||{};
        if(lock.attemptId!==attemptId||lock.receiptPath!==receiptRef.path||lock.expiresAt<=now())throw hrError('HR_RECONCILIATION_LEASE_LOST');
        const result=await fn({get:ref=>tx.get(ref),set:(...args)=>{writes++;return tx.set(...args);}});
        if(lock.expiresAt-now()<leaseMs/2){tx.set(lockRef,{expiresAt:now()+leaseMs},{merge:true});writes++;}
        return result;
      });
      controlWrites+=writes;
      return result;
    };
    const summary=async()=>{
      const [intents,effects]=await Promise.all([receiptRef.collection('intents').get(),receiptRef.collection('effects').get()]);
      const committed=new Map(effects.docs.map(doc=>[doc.id,doc.data()]));
      let authWrites=0,firestoreWrites=0,unresolvedEffects=0,unverifiedEffects=0,reviewWrites=0,credentialAuthenticationPending=false;
      const applicationWritesThisAttempt={auth:0,firestore:0};
      const systems={auth:0,firestore:0};
      for(const effect of committed.values()){
        const n=effect.operations?.length||0;
        if(effect.system==='auth'){authWrites+=n;systems.auth+=n;}
        if(effect.system==='firestore'){firestoreWrites+=n;systems.firestore+=n;}
        if(effect.system==='firestore')reviewWrites+=(effect.operations||[]).filter(op=>/\/(?:shopperIdentityReviews|reviewQueue)\//.test(op.entity)).length;
        if(effect.attemptId===attemptId&&Object.hasOwn(applicationWritesThisAttempt,effect.system))applicationWritesThisAttempt[effect.system]+=n;
        if(effect.readbackVerified!==true)unverifiedEffects++;
        if(effect.credentialAuthenticationPending===true)credentialAuthenticationPending=true;
      }
      for(const intent of intents.docs){
        const row=intent.data();
        if(!committed.has(intent.id)&&!['no_effect','failed_before_write'].includes(row.status))unresolvedEffects++;
      }
      return {
        authWrites,firestoreWrites,confirmedProviderWrites:authWrites+firestoreWrites,
        providerWrites:unresolvedEffects?null:authWrites+firestoreWrites,
        unresolvedEffects,unverifiedEffects,reviewWrites,credentialAuthenticationPending,
        credentialReadback:credentialAuthenticationPending?'PROVIDER_ACK_ONLY_AUTHENTICATION_GATE_PENDING':'NO_CREDENTIAL_CHANGE',
        systems,applicationWritesThisAttempt,providerWritesScope:'cumulative_command_effects',effectCollectionPath:receiptRef.collection('effects').path,
        intentCollectionPath:receiptRef.collection('intents').path
      };
    };
    const readCommitted=async(replay=false)=>{
      const snap=await receiptRef.get(),row=snap.data()||{};
      if(!snap.exists||row.digest!==digest||!HR_TERMINAL.has(row.status)||row.sourceRevision!==sourceRevision)throw hrError('HR_RECONCILIATION_RECEIPT_READBACK_FAILED');
      return {...row.result,...base(),...(replay?{applicationWritesThisAttempt:{auth:0,firestore:0}}:{}),idempotentReplay:replay,readbackVerified:true,controlWrites};
    };

    try{
      const validScope=v=>typeof v==='string'&&v.length>0&&v.length<=128&&!/[\/\s]/.test(v)&&v!=='.'&&v!=='..';
      if(command.version!=='cxorbia-command-adapter-v1'||command.commandType!=='hr.snapshot.reconcile'||command.entityType!=='hrSnapshot'||
        !validScope(command.tenantId)||!validScope(command.projectId)||command.requirePeriod!==false||command.periodId!=null||
        !/^[a-f0-9]{64}$/.test(command.expectedVersion||'')||command.entityId!==command.expectedVersion||
        typeof command.idempotencyKey!=='string'||command.idempotencyKey.length<16||command.idempotencyKey.length>200||
        !command.payload||Array.isArray(command.payload)||Object.keys(command.payload).length!==0){
        return stop('HR_RECONCILIATION_COMMAND_INVALID');
      }
      sourceRevision=command.expectedVersion;
      const scope={tenantId:command.tenantId,projectId:command.projectId};
      principal=await verifyPrincipal(req,scope);
      if(!principal?.uid||principal.namespace!=='staff'||!['super','admin'].includes(principal.role))return stop('HR_RECONCILIATION_PRINCIPAL_DENIED',{httpStatus:403});
      ({db}=ensureAdmin());
      const collection=db.collection('tenants').doc(scope.tenantId).collection('commandReceipts');
      receiptRef=collection.doc('hr-'+hrDigest([scope.projectId,command.idempotencyKey]));
      // Auth identities are tenant scoped, so concurrent project reconciliations share a lease.
      lockRef=collection.doc('hr-scope-'+hrDigest(scope.tenantId));
      digest=hrDigest({actorUid:principal.uid,scope,sourceRevision,commandType:command.commandType});
      const previous=(await receiptRef.get()).data();
      if(previous&&previous.digest!==digest)return stop('HR_RECONCILIATION_IDEMPOTENCY_CONFLICT',{httpStatus:409});
      if(previous&&HR_TERMINAL.has(previous.status))return await readCommitted(true);
      const priorLock=(await lockRef.get()).data();
      if(priorLock&&priorLock.status!=='committed'&&priorLock.receiptPath!==receiptRef.path){
        const existingId=str(priorLock.receiptPath).split('/').at(-1);
        const pending=(await collection.doc(existingId).get()).data()||{};
        const resume=pending.actorUid===principal.uid&&pending.projectId===scope.projectId&&pending.sourceRevision===sourceRevision?pending.idempotencyKey:null;
        return stop('HR_RECONCILIATION_SCOPE_BUSY',{providerWrites:null,existingReceiptPath:priorLock.receiptPath,resumeIdempotencyKey:resume||null});
      }
      if(priorLock?.status==='running'&&priorLock.expiresAt>now()){
        return stop('HR_RECONCILIATION_IN_PROGRESS',{providerWrites:null,existingReceiptPath:priorLock.receiptPath});
      }
      if(previous){
        const effects=await summary();
        if(effects.unresolvedEffects||effects.unverifiedEffects)return stop('HR_RECONCILIATION_UNCERTAIN_EFFECTS_REQUIRE_READBACK',{...effects,status:'partial',committed:false});
      }
      const current=await readSnapshot();
      const actual={tenantId:str(current?.snapshot?.tenantId||current?.snapshot?.projectConfig?.tenantId),projectId:str(current?.snapshot?.projectId||current?.snapshot?.projectConfig?.projectId)};
      if(!current?.snapshot||current.revision!==sourceRevision||actual.tenantId!==scope.tenantId||actual.projectId!==scope.projectId)return stop('HR_RECONCILIATION_SOURCE_CHANGED',{httpStatus:409});
      const sourceConfig=current.snapshot.projectConfig?.operationalSource||current.snapshot.projectConfig?.routeSource||{};
      if(current.snapshot.sourceSafe!==true||current.snapshot.imported===true||Number(current.snapshot.firestoreWrites||0)!==0||
        sourceConfig.mode!=='external'||sourceConfig.readPolicy!=='external_live'||
        !str(sourceConfig.providerBindingId||sourceConfig.integrationSettingId||sourceConfig.providerRef)||!str(sourceConfig.mappingRef)){
        return stop('HR_RECONCILIATION_LIVE_SOURCE_CONFIG_REQUIRED',{httpStatus:409});
      }
      const freshPrincipal=await verifyPrincipal(req,scope);
      if(freshPrincipal?.uid!==principal.uid||freshPrincipal?.namespace!=='staff'||!['super','admin'].includes(freshPrincipal?.role))return stop('HR_RECONCILIATION_PRINCIPAL_CHANGED',{httpStatus:403});
      principal=freshPrincipal;
      attemptId=crypto.randomUUID();
      await db.runTransaction(async tx=>{
        const [receiptSnap,lockSnap]=await Promise.all([tx.get(receiptRef),tx.get(lockRef)]);
        const row=receiptSnap.data(),lock=lockSnap.data();
        if(row?.digest&&row.digest!==digest)throw hrError('HR_RECONCILIATION_IDEMPOTENCY_CONFLICT');
        if(row&&HR_TERMINAL.has(row.status))throw hrError('HR_RECONCILIATION_ALREADY_COMMITTED');
        if(lock?.status!=='committed'&&lock?.receiptPath&&lock.receiptPath!==receiptRef.path)throw hrError('HR_RECONCILIATION_SCOPE_BUSY');
        if(lock?.status==='running'&&lock.expiresAt>now())throw hrError('HR_RECONCILIATION_IN_PROGRESS');
        if(row?.attemptId!==previous?.attemptId||row?.status!==previous?.status)throw hrError('HR_RECONCILIATION_ATTEMPT_CHANGED');
        tx.set(receiptRef,{version:'cxorbia.hr-reconciliation-receipt.v1',digest,actorUid:principal.uid,idempotencyKey:command.idempotencyKey,...scope,sourceRevision,status:'running',attemptId,startedAt:stamp()},{merge:true});
        tx.set(lockRef,{receiptPath:receiptRef.path,attemptId,status:'running',expiresAt:now()+leaseMs,projectId:scope.projectId});
      });
      acquired=true;controlWrites+=2;

      const journal=stage=>{
        const startIntent=async(system,operations=[])=>{
          const id=crypto.randomUUID(),ref=receiptRef.collection('intents').doc(id);
          await leasePatch(tx=>tx.set(ref,{attemptId,stage,system,operations,status:'pending',startedAt:stamp()}));
          return {id,ref,effectRef:receiptRef.collection('effects').doc(id)};
        };
        const finishIntent=async(intent,status)=>{
          await intent.ref.set({status,finishedAt:stamp()},{merge:true});controlWrites++;
        };
        const effectRecord=(system,operations,extra={})=>({attemptId,stage,system,operations,sourceRevision,committedAt:stamp(),readbackVerified:false,...extra});
        const authMutation=async(method,args)=>{
          const uid=method==='createUser'?str(args[0]?.uid):str(args[0]);
          if(!uid)throw hrError('HR_AUTH_EXPLICIT_UID_REQUIRED');
          const values=method==='setCustomUserClaims'?{customClaims:args[1]}:Object.fromEntries(Object.entries(args[method==='createUser'?0:1]||{}).filter(([key])=>key!=='password'));
          const password=method!=='setCustomUserClaims'&&Object.prototype.hasOwnProperty.call(args[method==='createUser'?0:1]||{},'password');
          const operations=[{entity:uid,operation:method,fields:Object.keys(values).sort(),expectedDigest:hrDigest(values)}];
          const intent=await startIntent('auth',operations);
          try{
            const lock=(await lockRef.get()).data()||{};
            if(lock.attemptId!==attemptId||lock.receiptPath!==receiptRef.path||lock.expiresAt<=now())throw hrError('HR_RECONCILIATION_LEASE_LOST');
          }catch(error){
            await finishIntent(intent,'failed_before_write');
            throw error;
          }
          let result;
          try{result=await rawAuth[method](...args);}
          catch(error){
            const definitelyRejected=/^auth\/(?:invalid-|email-already-exists$|uid-already-exists$|user-not-found$)/.test(str(error?.code));
            await finishIntent(intent,definitelyRejected?'failed_before_write':'uncertain');
            throw error;
          }
          const record=effectRecord('auth',operations,{providerAck:true,credentialAuthenticationPending:password});
          // ACK evidence is independent of the lease; a late provider ACK must remain visible.
          await intent.effectRef.set(record);controlWrites++;
          const readback=await rawAuth.getUser(uid);
          if(str(readback?.uid)!==uid||!hrMatches(readback,values))throw hrError('HR_AUTH_READBACK_MISMATCH');
          await intent.effectRef.set({readbackVerified:true,readbackAt:stamp(),readbackDigest:hrDigest(values)},{merge:true});controlWrites++;
          return result;
        };
        const natives=new WeakMap();
        const native=ref=>natives.get(ref)||ref;
        const allowed=ref=>{
          const parts=str(native(ref)?.path).split('/');
          const tenantOk=parts[0]==='tenants'&&parts[1]===scope.tenantId;
          const shopperPath=parts.length===4&&['shoppers','users','shopperIdentityCrosswalk','shopperIdentityReviews','reviewQueue'].includes(parts[2]);
          const visitPath=parts.length===6&&parts[2]==='projects'&&parts[3]===scope.projectId&&parts[4]==='visits';
          if(!tenantOk||!(shopperPath||visitPath))throw hrError('HR_RECONCILIATION_WRITE_PATH_DENIED');
        };
        const transaction=async(callback)=>{
          const intent=await startIntent('firestore');
          let operations=[],expected=[],callbackFailure=false,value,renewalWrites=0;
          try{
            value=await db.runTransaction(async tx=>{
              const lock=(await tx.get(lockRef)).data()||{};
              if(lock.attemptId!==attemptId||lock.expiresAt<=now())throw hrError('HR_RECONCILIATION_LEASE_LOST');
              const ops=[],checks=[];
              const wrapped={
                get:ref=>tx.get(native(ref)),
                set(ref,data,options){allowed(ref);const n=native(ref);ops.push({entity:n.path,operation:'set',fields:Object.keys(data).sort(),expectedDigest:hrDigest(data)});checks.push({ref:n,data});tx.set(n,data,...(options?[options]:[]));return wrapped;},
                create(ref,data){allowed(ref);const n=native(ref);ops.push({entity:n.path,operation:'create',fields:Object.keys(data).sort(),expectedDigest:hrDigest(data)});checks.push({ref:n,data});tx.create(n,data);return wrapped;}
              };
              let result;
              try{result=await callback(wrapped);}catch(error){callbackFailure=true;throw error;}
              callbackFailure=false;operations=ops;expected=checks;
              if(ops.length)tx.set(intent.effectRef,effectRecord('firestore',ops,{providerAck:true}));
              renewalWrites=lock.expiresAt-now()<leaseMs/2?1:0;
              if(renewalWrites)tx.set(lockRef,{expiresAt:now()+leaseMs},{merge:true});
              return result;
            });
          }catch(error){
            const committed=await intent.effectRef.get();
            if(!committed.exists)await finishIntent(intent,callbackFailure?'failed_before_write':'uncertain');
            throw error;
          }
          controlWrites+=(operations.length?1:0)+renewalWrites;
          if(!operations.length){await finishIntent(intent,'no_effect');return value;}
          for(const check of expected){
            const snap=await check.ref.get();
            if(!snap.exists||!hrMatches(snap.data(),check.data))throw hrError('HR_FIRESTORE_READBACK_MISMATCH');
          }
          await intent.effectRef.set({readbackVerified:true,readbackAt:stamp()},{merge:true});controlWrites++;
          return value;
        };
        const wrap=ref=>{
          const out={path:ref.path,id:ref.id,get:()=>ref.get()};
          if(typeof ref.doc==='function')out.doc=id=>wrap(ref.doc(id));
          if(typeof ref.collection==='function')out.collection=name=>wrap(ref.collection(name));
          if(typeof ref.where==='function')out.where=(...args)=>wrap(ref.where(...args));
          if(typeof ref.limit==='function')out.limit=(...args)=>wrap(ref.limit(...args));
          if(typeof ref.set==='function')out.set=(data,options)=>transaction(tx=>tx.set(out,data,options));
          natives.set(out,ref);return out;
        };
        const auth={};
        for(const method of ['getUser','getUserByEmail','listUsers','verifyIdToken'])if(typeof rawAuth[method]==='function')auth[method]=rawAuth[method].bind(rawAuth);
        for(const method of ['createUser','updateUser','setCustomUserClaims'])if(typeof rawAuth[method]==='function')auth[method]=(...args)=>authMutation(method,args);
        return {auth,db:{collection:name=>wrap(db.collection(name)),runTransaction:transaction}};
      };
      const {auth:rawAuth}=ensureAdmin();
      const runStage=async(name,factory,policy)=>{
        const ref=receiptRef.collection('stages').doc(name),old=(await ref.get()).data();
        if(old?.status==='committed'&&old.sourceRevision===sourceRevision)return old.summary;
        const facade=journal(name);
        const provider=factory({...facade,policy:policy(current.snapshot),hrSnapshot:current.snapshot,hrRevision:sourceRevision});
        const result=await provider.reconcileSnapshot(current.snapshot,{sourceRevision,identityByShopperId:current.identity});
        if(result?.ok!==true||result?.providerAck!==true||!HR_TERMINAL.has(result?.status))throw hrError('HR_RECONCILIATION_PROVIDER_ACK_REQUIRED');
        // Retain scalar counts, never identity payloads or unbounded provider queues.
        const counts=Object.fromEntries(Object.entries(result).filter(([,v])=>typeof v==='number'||typeof v==='boolean'));
        const compact={status:result.status,...counts};
        await leasePatch(tx=>tx.set(ref,{status:'committed',sourceRevision,summary:compact,completedAt:stamp()}));
        return compact;
      };
      const settled=await Promise.allSettled([
        runStage('shoppers',shopperProviderFactory,shopperPolicy),
        runStage('visits',operationalProviderFactory,operationalPolicy)
      ]);
      const effects=await summary(),stages={};
      settled.forEach((result,index)=>{stages[index===0?'shoppers':'visits']=result.status==='fulfilled'?{ok:true,...result.value}:{ok:false,code:hrCode(result.reason)};});
      const complete=settled.every(result=>result.status==='fulfilled')&&!effects.unresolvedEffects&&!effects.unverifiedEffects;
      const review=effects.reviewWrites>0||Object.values(stages).some(stage=>stage.status==='committed_with_identity_review'||stage.reviewRequiredVisits>0);
      const status=complete?'committed':'partial';
      const result={
        ...base(),ok:complete,status,committed:complete,providerAck:complete,readbackVerified:false,
        successUiAllowed:complete,code:complete?'HR_RECONCILIATION_COMMITTED':'HR_RECONCILIATION_PARTIAL',
        stages,...effects,identityReviewRequired:review,viewRefreshVerified:false,controlWrites
      };
      await leasePatch(tx=>{
        tx.set(receiptRef,{status,result,completedAt:stamp()},{merge:true});
        tx.set(lockRef,{status:complete?'committed':'partial'},{merge:true});
      });
      if(complete)return await readCommitted();
      const readback=(await receiptRef.get()).data();
      return {...result,receiptReadbackVerified:readback?.digest===digest&&readback?.status===status,controlWrites};
    }catch(error){
      if(!acquired)return stop(hrCode(error),{httpStatus:403,providerWrites:receiptRef?null:0});
      let effects;
      try{effects=await summary();}catch(_){effects={providerWrites:null,confirmedProviderWrites:null,unresolvedEffects:null,unverifiedEffects:null};}
      const result={...stop(hrCode(error)),...effects,status:'partial',committed:false,providerAck:false,readbackVerified:false,successUiAllowed:false};
      try{
        await leasePatch(tx=>{
          tx.set(receiptRef,{status:'partial',result,completedAt:stamp()},{merge:true});
          tx.set(lockRef,{status:'partial'},{merge:true});
        });
        result.receiptReadbackVerified=(await receiptRef.get()).data()?.status==='partial';
      }catch(_){result.receiptReadbackVerified=false;}
      return result;
    }
  };
}

export const VERSION='cxorbia-command-runtime-v1';
const ROUTE='/v1/cxorbia/commands';
const PROJECT_COMMANDS=new Set(['project.create','project.update','period.create','period.state.update']);
const SHOPPER_COMMANDS=new Set(['shopper.create','shopper.update','shopper.credential.reset','shopper.identity.adjudicate','shopper.identity.review.resolve','shopper.delete']);
const FINANCE_COMMANDS=new Set(['finance.reconcile.visit','finance.historical.reconcile','finance.payment.batch','finance.movement.create','finance.account.create','finance.account.apply','finance.budget.save','finance.budget.delete']);
const COMMERCIAL_COMMANDS=new Set(['client.create','client.update','crm.account.create','crm.account.update','crm.contact.create','crm.contact.update','crm.opportunity.create','crm.opportunity.update','crm.column.create','crm.column.update','crm.column.delete']);
const ACADEMY_COMMANDS=new Set(['academy.course.create','academy.course.update','academy.course.state','academy.category.create']);
const str=v=>String(v==null?'':v).trim();
const json=(res,status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));};
const blocked=(code,extra={})=>({ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,code,production:false,...extra});

export function isCxorbiaCommandRuntimePath(pathname){
  return pathname===ROUTE;
}

export function commandProviderKind(commandType){
  const type=str(commandType);
  if(PROJECT_COMMANDS.has(type))return 'project';
  if(SHOPPER_COMMANDS.has(type))return 'shopper';
  if(FINANCE_COMMANDS.has(type))return 'finance';
  if(COMMERCIAL_COMMANDS.has(type))return 'commercial';
  if(ACADEMY_COMMANDS.has(type))return 'academy';
  return 'operational';
}

async function readJson(req){
  let raw='';
  for await(const chunk of req){
    raw+=chunk;
    if(raw.length>131072)throw new Error('COMMAND_BODY_TOO_LARGE');
  }
  return raw?JSON.parse(raw):{};
}

function derivedFinancePolicy(operationalPolicy){
  if(!operationalPolicy)return null;
  return {
    schemaVersion:'cxorbia.finance-command-provider-policy.v1',
    enabled:operationalPolicy.enabled===true,
    allowedTenantIds:Array.isArray(operationalPolicy.allowedTenantIds)?operationalPolicy.allowedTenantIds:[],
    allowedProjectIds:Array.isArray(operationalPolicy.allowedProjectIds)?operationalPolicy.allowedProjectIds:[],
    conflictPolicy:operationalPolicy.conflictPolicy||'review_no_silent_overwrite',
    externalPaymentWrites:false,
    bankWrites:false,
    hrWrites:false
  };
}

export function createProviderForCommand(command,overrides={}){
  const kind=commandProviderKind(command?.commandType);
  const auth=overrides.auth??globalThis.CXORBIA_COMMAND_AUTH??null;
  const db=overrides.db??globalThis.CXORBIA_COMMAND_DB??null;
  const projectPolicy=overrides.projectPolicy??globalThis.CXORBIA_PROJECT_COMMAND_PROVIDER_POLICY??null;
  const operationalPolicy=overrides.operationalPolicy??globalThis.CXORBIA_OPERATIONAL_COMMAND_PROVIDER_POLICY??null;
  const shopperPolicy=overrides.shopperPolicy??globalThis.CXORBIA_SHOPPER_COMMAND_PROVIDER_POLICY??null;
  const financePolicy=overrides.financePolicy??globalThis.CXORBIA_FINANCE_COMMAND_PROVIDER_POLICY??derivedFinancePolicy(operationalPolicy);
  const commercialPolicy=overrides.commercialPolicy??globalThis.CXORBIA_COMMERCIAL_COMMAND_PROVIDER_POLICY??null;
  const academyPolicy=overrides.academyPolicy??globalThis.CXORBIA_ACADEMY_COMMAND_PROVIDER_POLICY??null;
  const hrSnapshot=overrides.hrSnapshot??globalThis.CXORBIA_COMMAND_HR_SNAPSHOT??null;
  const hrRevision=overrides.hrRevision??globalThis.CXORBIA_COMMAND_HR_REVISION??'';
  if(!auth||!db)return {provider:null,kind,error:'COMMAND_PROVIDER_DEPENDENCIES_NOT_CONFIGURED'};
  if(kind==='project'){
    if(!projectPolicy)return {provider:null,kind,error:'PROJECT_COMMAND_PROVIDER_NOT_CONFIGURED'};
    try{return {provider:createProjectCommandProvider({auth,db,policy:projectPolicy}),kind};}
    catch(error){return {provider:null,kind,error:'PROJECT_COMMAND_PROVIDER_POLICY_INVALID',detail:str(error?.message||error)};}
  }
  if(kind==='shopper'){
    if(!shopperPolicy)return {provider:null,kind,error:'SHOPPER_COMMAND_PROVIDER_NOT_CONFIGURED'};
    try{return {provider:createShopperCommandProvider({auth,db,policy:shopperPolicy,hrSnapshot,hrRevision}),kind};}
    catch(error){return {provider:null,kind,error:'SHOPPER_COMMAND_PROVIDER_POLICY_INVALID',detail:str(error?.message||error)};}
  }
  if(kind==='finance'){
    if(!financePolicy)return {provider:null,kind,error:'FINANCE_COMMAND_PROVIDER_NOT_CONFIGURED'};
    try{return {provider:createFinanceCommandProvider({auth,db,policy:financePolicy,hrSnapshot,hrRevision}),kind};}
    catch(error){return {provider:null,kind,error:'FINANCE_COMMAND_PROVIDER_POLICY_INVALID',detail:str(error?.message||error)};}
  }
  if(kind==='commercial'){
    if(!commercialPolicy)return {provider:null,kind,error:'COMMERCIAL_COMMAND_PROVIDER_NOT_CONFIGURED'};
    try{return {provider:createCommercialCommandProvider({auth,db,policy:commercialPolicy}),kind};}
    catch(error){return {provider:null,kind,error:'COMMERCIAL_COMMAND_PROVIDER_POLICY_INVALID',detail:str(error?.message||error)};}
  }
  if(!operationalPolicy)return {provider:null,kind,error:'OPERATIONAL_COMMAND_PROVIDER_NOT_CONFIGURED'};
  try{return {provider:createOperationalCommandProvider({auth,db,policy:operationalPolicy}),kind};}
  catch(error){return {provider:null,kind,error:'OPERATIONAL_COMMAND_PROVIDER_POLICY_INVALID',detail:str(error?.message||error)};}
}

export async function maybeHandleCxorbiaCommandRuntimeRequest(req,res,url,{hrSnapshotReconcile,configure}={}){
  if(!isCxorbiaCommandRuntimePath(url.pathname))return false;
  if(req.method==='OPTIONS'){
    res.statusCode=204;
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type, Idempotency-Key');
    res.end();
    return true;
  }
  if(req.method!=='POST'){
    json(res,405,blocked('COMMAND_METHOD_NOT_ALLOWED'));
    return true;
  }
  try{
    const token=str(req.headers.authorization).replace(/^Bearer\s+/i,'');
    if(!token)return json(res,401,blocked('COMMAND_BEARER_REQUIRED'));
    const command=await readJson(req);
    if(command.commandType==='hr.snapshot.reconcile'){
      if(typeof hrSnapshotReconcile!=='function')return json(res,409,blocked('HR_RECONCILIATION_NOT_CONFIGURED'));
      const result=await hrSnapshotReconcile({req,command});
      return json(res,result?.httpStatus||(result?.ok===true?200:409),result);
    }
    if(configure)await configure();
    const {provider,error,kind,detail}=createProviderForCommand(command);
    if(!provider)return json(res,409,blocked(error,{providerKind:kind,detail:detail||null,commandType:command?.commandType||null,tenantId:command?.tenantId||null,projectId:command?.projectId||null,periodId:command?.periodId||null}));
    const result=await provider.execute(token,command);
    return json(res,result?.ok===true?200:409,result);
  }catch(error){
    return json(res,409,blocked(str(error?.message||error)));
  }
}
