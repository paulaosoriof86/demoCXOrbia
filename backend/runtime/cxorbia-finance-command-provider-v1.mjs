#!/usr/bin/env node
/* CXOrbia Recovery — durable finance command provider v1.
   This owner records an internal payment event in Firestore only. It never initiates,
   confirms or reconciles a bank/payment-provider transfer. External payment truth stays
   pending until a future authorized source supplies a paymentSourceRef.
*/
import crypto from 'node:crypto';

export const VERSION='cxorbia-finance-command-provider-v1';
export const COMMAND_TYPES=Object.freeze(['finance.reconcile.visit','finance.payment.batch','finance.movement.create','finance.account.create','finance.account.apply']);
export const OPERATOR_ROLES=Object.freeze(['super','admin']);

const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
const now=()=>new Date().toISOString();
const today=()=>new Date().toISOString().slice(0,10);
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const versionOf=data=>data?.version??data?.updatedAt??data?.lastSyncedAt??data?.hrRevision??data?.sourceRevision??'source-current';
const receiptId=command=>sha(`${command.tenantId}\0${command.projectId}\0${command.periodId}\0${command.idempotencyKey}`).slice(0,40);
const auditId=command=>sha(`${command.idempotencyKey}\0${command.commandType}`).slice(0,40);
const clientHash=value=>{
  const s=typeof value==='string'?value:JSON.stringify(value||{});
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return (h>>>0).toString(36);
};

function blocked(command,code,extra={}){
  return {ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,tenantId:command?.tenantId||null,projectId:command?.projectId||null,periodId:command?.periodId||null,commandType:command?.commandType||null,entityId:command?.entityId||null,code,...extra};
}
function ack(command,extra={}){
  return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,commandType:command.commandType,entityType:'paymentBatch',entityId:command.entityId||null,idempotencyKey:command.idempotencyKey,externalPaymentConfirmed:false,externalPaymentWrites:0,bankWrites:0,...extra};
}

export function validateProviderPolicy(policy={}){
  const errors=[];
  if(policy.schemaVersion!=='cxorbia.finance-command-provider-policy.v1')errors.push('FINANCE_POLICY_SCHEMA_INVALID');
  if(policy.enabled!==true)errors.push('FINANCE_POLICY_DISABLED');
  if(!uniq(policy.allowedTenantIds).length)errors.push('FINANCE_POLICY_TENANTS_REQUIRED');
  if(policy.externalPaymentWrites!==false||policy.bankWrites!==false||policy.hrWrites!==false)errors.push('FINANCE_EXTERNAL_SIDE_EFFECTS_MUST_BE_FALSE');
  if(policy.conflictPolicy!=='review_no_silent_overwrite')errors.push('FINANCE_CONFLICT_POLICY_INVALID');
  return {ok:errors.length===0,errors};
}
function scopeAllowed(policy,command){
  const tenants=new Set(uniq(policy.allowedTenantIds)),projects=new Set(uniq(policy.allowedProjectIds));
  return tenants.has(str(command.tenantId))&&(!projects.size||projects.has(str(command.projectId)));
}
function validateCommand(command={}){
  const errors=[],type=str(command.commandType);
  const entityByType={
    'finance.reconcile.visit':'financeReconciliation',
    'finance.payment.batch':'paymentBatch',
    'finance.movement.create':'financialMovement',
    'finance.account.create':'financeAccount',
    'finance.account.apply':'financeAccount'
  };
  const permissionByType={
    'finance.reconcile.visit':'finance.reconcile',
    'finance.payment.batch':'finance.markPaid',
    'finance.movement.create':'finance.movement.write',
    'finance.account.create':'finance.account.write',
    'finance.account.apply':'finance.account.apply'
  };
  if(command.version!=='cxorbia-command-adapter-v1')errors.push('FINANCE_COMMAND_VERSION_INVALID');
  if(!COMMAND_TYPES.includes(type))errors.push('FINANCE_COMMAND_TYPE_INVALID');
  if(str(command.entityType)!==entityByType[type])errors.push('FINANCE_ENTITY_TYPE_INVALID');
  if(!str(command.tenantId)||!str(command.projectId)||!str(command.periodId))errors.push('FINANCE_SCOPE_REQUIRED');
  if(!str(command.idempotencyKey))errors.push('FINANCE_IDEMPOTENCY_REQUIRED');
  if(command.expectedVersion===undefined||command.expectedVersion===null||command.expectedVersion==='')errors.push('FINANCE_EXPECTED_VERSION_REQUIRED');
  if(command.authorization?.providerEnforcementRequired!==true||str(command.authorization?.permission)!==permissionByType[type])errors.push('FINANCE_PROVIDER_PERMISSION_REQUIRED');
  if(type==='finance.reconcile.visit'&&!str(command.payload?.visitId||command.entityId))errors.push('FINANCE_VISIT_ID_REQUIRED');
  if(type==='finance.payment.batch'&&!uniq(command.payload?.visitIds).length)errors.push('FINANCE_VISIT_IDS_REQUIRED');
  if(type==='finance.account.apply'&&!str(command.entityId||command.payload?.accountId))errors.push('FINANCE_ACCOUNT_ID_REQUIRED');
  return {ok:errors.length===0,errors};
}

async function exactActor(auth,db,token,command){
  const decoded=await auth.verifyIdToken(token,true);
  const role=str(decoded.role),namespace=str(decoded.authNamespace||'staff');
  if(str(decoded.tenantId)!==str(command.tenantId)||!OPERATOR_ROLES.includes(role)||namespace!=='staff')throw new Error('FINANCE_ACTOR_SCOPE_DENIED');
  if(role!=='super'&&!uniq(decoded.projectIds).includes(str(command.projectId)))throw new Error('FINANCE_ACTOR_PROJECT_DENIED');
  const member=await db.collection('tenants').doc(command.tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('FINANCE_ACTOR_MEMBERSHIP_MISSING');
  const m=member.data()||{};
  if(m.active!==true||str(m.tenantId)!==str(command.tenantId)||str(m.role)!==role||str(m.authNamespace)!=='staff')throw new Error('FINANCE_ACTOR_MEMBERSHIP_INVALID');
  if(role!=='super'&&!uniq(m.projectIds).includes(str(command.projectId)))throw new Error('FINANCE_ACTOR_MEMBERSHIP_PROJECT_DENIED');
  return {uid:decoded.uid,role};
}

async function resolveVisitDocument(tx,visits,visitId,hrRowId){
  const keys=[...new Set([str(hrRowId),str(visitId)].filter(Boolean))];
  for(const key of keys){const ref=visits.doc(key),snap=await tx.get(ref);if(snap.exists)return {ref,snap,data:snap.data()||{},durableVisitId:key};}
  return {ref:null,snap:null,data:null,durableVisitId:null};
}
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
function configuredAmount(project,country,key){
  const map=project?.[key]||project?.financial?.[key]||project?.finance?.[key]||{};
  const value=map&&typeof map==='object'?map[country]:null;
  return finite(value)?Number(value):null;
}
function exactFinanceAmount(v,project){
  const country=str(v?.pais||v?.country);
  const explicit=finite(v?.hrManaged?.honorario)?Number(v.hrManaged.honorario):(finite(v?.honorario)&&str(v?.honorarioSource)!=='project_country_config'?Number(v.honorario):null);
  const configured=configuredAmount(project,country,'honorario');
  const honorario=explicit!==null?explicit:configured;
  const honorarioSource=explicit!==null?'hr_explicit':(configured!==null?'project_country_config':'pending_source');
  const boleto=finite(v?.boleto)?Number(v.boleto):null,combo=finite(v?.comboAmt)?Number(v.comboAmt):null;
  if(!country)return {ok:false,reason:'País ausente'};
  const currency=str(v?.currency||v?.moneda||project?.currency?.[country]||project?.currencies?.[country]);
  if(!currency)return {ok:false,reason:'Moneda ausente'};
  if(honorario===null)return {ok:false,reason:'Honorario sin fuente autorizada'};
  if(boleto===null||combo===null||v?.reimbursementSourceComplete===false||v?.reimbursementPartial===true)return {ok:false,reason:'Reembolso incompleto'};
  const total=honorario+boleto+combo;if(!Number.isFinite(total)||total<0)return {ok:false,reason:'Monto total inválido'};
  return {ok:true,country,currency,honorario,honorarioSource,boleto,combo,reembolso:boleto+combo,total};
}
function amountOf(v){
  const m=v?.financialMatch;
  if(str(v?.financialSourceStatus).toLowerCase()!=='reconciled_exact'||!m||str(m.status).toLowerCase()!=='reconciled_exact')return {ok:false,reason:'Conciliación financiera exacta requerida'};
  const total=finite(m.total)?Number(m.total):null;
  if(total===null||total<0)return {ok:false,reason:'Monto financiero conciliado inválido'};
  return {ok:true,total};
}
function lotId(command,country,currency,reference,ids){
  const key=[command.tenantId,command.projectId,country,currency,reference||''].join('::');
  return `L-${sha(`${key}::${[...ids].sort().join(',')}`).slice(0,8).toUpperCase()}`;
}

export function createFinanceCommandProvider({auth,db,policy}={}){
  const pv=validateProviderPolicy(policy);if(!pv.ok)throw new Error('FINANCE_PROVIDER_POLICY_INVALID:'+pv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection||!db?.runTransaction)throw new Error('FINANCE_PROVIDER_DEPENDENCIES_MISSING');
  return Object.freeze({
    version:VERSION,
    async execute(token,command={}){
      const cv=validateCommand(command);if(!cv.ok)return blocked(command,'FINANCE_COMMAND_INVALID',{errors:cv.errors});
      if(!scopeAllowed(policy,command))return blocked(command,'FINANCE_COMMAND_SCOPE_DENIED');
      let actor;try{actor=await exactActor(auth,db,token,command);}catch(error){return blocked(command,str(error?.message||error));}
      const reconcile=command.commandType==='finance.reconcile.visit';
      const visitIds=uniq(command.payload?.visitIds),fechaPago=str(command.payload?.fechaPago)||today(),referencia=str(command.payload?.referencia);
      const tenant=db.collection('tenants').doc(command.tenantId),project=tenant.collection('projects').doc(command.projectId),visits=project.collection('visits');
      const receipt=tenant.collection('commandReceipts').doc(receiptId(command));
      const audit=tenant.collection('entityAuditTrail').doc('finance-'+auditId(command));
      const digest=sha(clean(command));
      try{
        return await db.runTransaction(async tx=>{
          if(reconcile){
            const prior=await tx.get(receipt);
            if(prior.exists){const p=prior.data()||{};if(str(p.commandDigest)!==digest)throw new Error('FINANCE_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');if(p.status==='committed')return ack(command,{entityType:'financeReconciliation',entityId:p.entityId||command.entityId,financialMatch:p.financialMatch||null,idempotentReplay:true,providerWrites:0});}
            const resolved=await resolveVisitDocument(tx,visits,command.payload?.visitId||command.entityId,command.payload?.hrRowId);
            if(!resolved.snap?.exists)throw new Error('FINANCE_VISIT_MISSING');
            const v=resolved.data||{},projectSnap=await tx.get(project),projectData=projectSnap.exists?(projectSnap.data()||{}):{};
            if(str(v.periodId)!==str(command.periodId))throw new Error('FINANCE_PERIOD_SCOPE_CONFLICT');
            const expected=str(command.expectedVersion),actual=str(versionOf(v));
            if(expected&&expected!=='source-current'&&expected!==actual)throw new Error('FINANCE_EXPECTED_VERSION_CONFLICT');
            const submitted=v?.canonicalFacets?.submitted===true||!!v?.submittedAt||['submitida','liquidada','pagada'].includes(str(v?.estado||v?.status).toLowerCase());
            if(!submitted)throw new Error('FINANCE_VISIT_NOT_SUBMITTED');
            const amount=exactFinanceAmount(v,projectData);if(!amount.ok)throw new Error('FINANCE_RECONCILIATION_SOURCE_INCOMPLETE:'+amount.reason);
            const sourceRevision=str(command.payload?.sourceRevision||v.hrSourceRevision||v.sourceRevision);if(!sourceRevision)throw new Error('FINANCE_HR_REVISION_REQUIRED');
            const match={status:'reconciled_exact',authority:amount.honorarioSource,projectConfigVersion:projectData.version??null,sourceRevision,visitId:str(command.payload?.visitId||command.entityId),durableVisitId:resolved.durableVisitId,hrRowId:str(v.hrRowId)||null,country:amount.country,pais:amount.country,currency:amount.currency,moneda:amount.currency,honorario:amount.honorario,honorarioSource:amount.honorarioSource,boleto:amount.boleto,combo:amount.combo,reembolso:amount.reembolso,total:amount.total,estado:'validada',liquidationState:'validated_financial_source',paymentState:'not_scheduled',externalPaymentConfirmed:false,paymentSourceRef:null,reconciledAt:now(),reconciledBy:actor.uid};
            tx.set(resolved.ref,{financialMatch:match,financialSourceStatus:'reconciled_exact',financialReviewRequired:false,version:Number(v.version||0)+1,updatedAt:now()},{merge:true});
            tx.set(audit,{tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,entityType:'financeReconciliation',entityId:resolved.durableVisitId,commandType:command.commandType,actorUid:actor.uid,actorRole:actor.role,idempotencyKey:command.idempotencyKey,financialMatch:match,externalPaymentConfirmed:false,createdAt:now()},{merge:false});
            tx.set(receipt,{status:'committed',commandDigest:digest,entityId:resolved.durableVisitId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,financialMatch:match,updatedAt:now()},{merge:false});
            return ack(command,{entityType:'financeReconciliation',entityId:resolved.durableVisitId,financialMatch:match,providerWrites:3,idempotentReplay:false});
          }
          const prior=await tx.get(receipt);
          if(prior.exists){
            const p=prior.data()||{};
            if(str(p.commandDigest)!==digest)throw new Error('FINANCE_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
            if(p.status==='committed')return ack(command,{pagadas:Number(p.pagadas||0),fechaPago:p.fechaPago||fechaPago,loteIds:arr(p.loteIds),porPais:p.porPais||{},detalle:arr(p.detalle),reviewRequired:arr(p.reviewRequired),idempotentReplay:true,providerWrites:0});
          }

          const refsInput=arr(command.payload?.visitRefs),resolvedRows=[];
          for(const id of visitIds){const hinted=refsInput.find(x=>str(x?.visitId)===id)||{};resolvedRows.push(await resolveVisitDocument(tx,visits,id,hinted.hrRowId));}
          const expectedPairs=[];
          const valid=[],reviewRequired=[];
          for(let i=0;i<visitIds.length;i++){
            const id=visitIds[i],resolved=resolvedRows[i],snap=resolved.snap;
            if(!snap?.exists){reviewRequired.push({id,motivo:'Visita no encontrada'});continue;}
            const v=snap.data()||{};expectedPairs.push([id,versionOf(v)]);
            if(str(v.tenantId||command.tenantId)!==str(command.tenantId)||str(v.projectId||command.projectId)!==str(command.projectId)){reviewRequired.push({id,motivo:'Proyecto/tenant no coincide con el alcance'});continue;}
            if(str(v.periodId)!==str(command.periodId)){reviewRequired.push({id,motivo:'Periodo no coincide con el alcance activo'});continue;}
            if(str(v.estado||v.status).toLowerCase()==='liquidada'||str(v.loteId)){reviewRequired.push({id,motivo:'Visita ya marcada como liquidada; no se sobrescribe'});continue;}
            const pais=str(v.pais||v.country),currency=str(v.currency||v.moneda);if(!pais){reviewRequired.push({id,motivo:'País ausente'});continue;}if(!currency){reviewRequired.push({id,motivo:'Moneda ausente'});continue;}
            const amount=amountOf(v);if(!amount.ok){reviewRequired.push({id,motivo:amount.reason});continue;}
            valid.push({id,ref:resolved.ref,v,pais,currency,total:amount.total});
          }
          if(str(command.expectedVersion)!==clientHash(expectedPairs))throw new Error('FINANCE_EXPECTED_VERSION_CONFLICT');

          const groups=new Map();
          for(const item of valid){const key=[item.pais,item.currency,referencia].join('::');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
          const porPais={},detalle=[],loteIds=[];let providerWrites=0;
          for(const group of groups.values()){
            const pais=group[0].pais,currency=group[0].currency,lote=lotId(command,pais,currency,referencia,group.map(x=>x.id));loteIds.push(lote);
            let lotTotal=0;
            for(const item of group){
              const ts=now();lotTotal+=item.total;
              tx.set(item.ref,{estado:'liquidada',fechaPago,realizada:item.v.realizada||fechaPago,loteId:lote,loteRef:referencia||null,paymentState:'platform_recorded_pending_external_reconciliation',externalPaymentConfirmed:false,paymentSourceRef:null,lastPaymentCommandId:receiptId(command),updatedAt:ts,version:Number(item.v.version||0)+1},{merge:true});providerWrites++;
              const movementId=`pay-${sha(`${command.tenantId}\0${command.projectId}\0${command.periodId}\0${item.id}\0${lote}`).slice(0,32)}`;
              const movementRef=tenant.collection('financialMovements').doc(movementId);
              tx.set(movementRef,{id:movementId,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,tipo:'egreso',cat:`Honorario · ${str(item.v.shopper||'Evaluador')}`,pais,monto:-item.total,currency,desc:`${str(item.v.sucursal)} · lote ${lote}`,estado:'Pagado',origen:'lote',lote,shopper:str(item.v.shopper),shopperId:str(item.v.shopperId)||null,visitaId:item.id,fecha:fechaPago,externalPaymentConfirmed:false,paymentState:'platform_recorded_pending_external_reconciliation',paymentSourceRef:null,updatedAt:ts,createdAt:ts},{merge:false});providerWrites++;
              porPais[pais]=porPais[pais]||{monto:0,n:0,cur:currency};porPais[pais].monto+=item.total;porPais[pais].n++;
              detalle.push({shopper:str(item.v.shopper||'Evaluador'),shopperId:str(item.v.shopperId)||null,sucursal:str(item.v.sucursal),pais,monto:item.total,cur:currency,visitaId:item.id,loteId:lote});
            }
            const lotRef=tenant.collection('paymentLots').doc(lote);
            tx.set(lotRef,{id:lote,loteId:lote,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,pais,currency,referencia:referencia||null,visitIds:group.map(x=>x.id).sort(),monto:lotTotal,estado:'Pagado',fechaPago,externalPaymentConfirmed:false,paymentState:'platform_recorded_pending_external_reconciliation',paymentSourceRef:null,updatedAt:now(),createdAt:now()},{merge:false});providerWrites++;
          }
          const summary={status:'committed',commandDigest:digest,commandType:command.commandType,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,actorUid:actor.uid,pagadas:valid.length,fechaPago,loteIds,porPais,detalle,reviewRequired,externalPaymentConfirmed:false,externalPaymentWrites:0,bankWrites:0,updatedAt:now()};
          tx.set(audit,{...summary,auditType:'finance.payment.batch',idempotencyKey:command.idempotencyKey,automaticBankConfirmation:false},{merge:false});providerWrites++;
          tx.set(receipt,{...summary,providerAck:true,providerWrites:providerWrites+1},{merge:false});providerWrites++;
          return ack(command,{pagadas:valid.length,fechaPago,loteIds,porPais,detalle,reviewRequired,idempotentReplay:false,providerWrites});
        });
      }catch(error){return blocked(command,str(error?.message||error));}
    },
    status(){return {version:VERSION,enabled:true,allowedTenantIds:uniq(policy.allowedTenantIds),allowedProjectIds:uniq(policy.allowedProjectIds),durableFirestoreWrites:true,externalPaymentConfirmed:false,externalPaymentWrites:false,bankWrites:false,hrWrites:false,conflictPolicy:policy.conflictPolicy};}
  });
}

export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,validateProviderPolicy,createFinanceCommandProvider};
