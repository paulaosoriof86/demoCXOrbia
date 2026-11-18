// I3 control-plane only: no commands, Auth changes, HR calls or financial writes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const s=v=>String(v??'').trim();
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
export const FINANCE_COLLECTIONS=Object.freeze({movements:'financialMovements',accounts:'financeAccounts',lots:'paymentLots',reconciliations:'paymentReconciliations'});
export const IDENTITY_LINK_COLLECTION='shopperIdentityLinks';
export function identityLinkAssessment(visits,links){
  const rows=[];
  for(const visit of visits){
    const previous=(visit.priorReconciliations||[]).filter(r=>s(r.shopperId)&&s(r.shopperId)!==s(visit.shopperId));
    if(!previous.length)continue;
    const possible=links.filter(link=>{
      const aliases=[link.canonicalShopperId,link.sourceIdentityKey,...(Array.isArray(link.sourceIdentityAliases)?link.sourceIdentityAliases:[]),...(Array.isArray(link.sourceAliases)?link.sourceAliases:[]),...(Array.isArray(link.aliases)?link.aliases:[])].map(s);
      return aliases.includes(s(visit.shopperId))&&previous.some(r=>aliases.includes(s(r.shopperId)));
    });
    rows.push({visitId:visit.docId,currentShopperId:visit.shopperId,previousShopperIds:[...new Set(previous.map(r=>r.shopperId))],
      candidateLinks:possible.map(link=>({docId:link.docId,status:link.status,authorityType:link.authorityType,authorityRef:link.authorityRef,projectScope:link.projectScope,sourceSystem:link.sourceSystem,sourceSafe:link.sourceSafe,periodIndependent:link.periodIndependent})),
      automaticAdjudication:false});
  }
  return rows;
}
export function amountOf(row){
  const valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
  const a=valid(row.amount)?Number(row.amount):null,m=valid(row.monto)?Number(row.monto):null;
  return {amount:a??m,conflict:a!==null&&m!==null&&Math.abs(a-m)>0.001};
}
export function advanceCandidate(row,projectId){
  const a=amountOf(row),currency=s(row.currency||row.moneda).toUpperCase(),country=s(row.country||row.pais).toUpperCase();
  const amountMatch=[row.amount,row.monto].some(v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))&&Math.abs(Number(v)-7300)<0.001);
  const currencies=[row.currency,row.moneda].map(v=>s(v).toUpperCase()).filter(Boolean);
  const countries=[row.country,row.pais].map(v=>s(v).toUpperCase()).filter(Boolean);
  if(s(row.tipo)!=='ingreso'||!amountMatch||!currencies.some(c=>['Q','GTQ'].includes(c)))return null;
  const conflicts=[];
  if(a.conflict)conflicts.push('AMOUNT_FIELDS_CONFLICT');
  if([row.amount,row.monto].some(v=>v!==null&&v!==undefined&&v!==''&&!Number.isFinite(Number(v))))conflicts.push('INVALID_AMOUNT_FIELD');
  if(currencies.some(c=>!['Q','GTQ'].includes(c)))conflicts.push('CURRENCY_FIELDS_CONFLICT');
  if(countries.some(c=>!['GT','GUATEMALA'].includes(c)))conflicts.push('COUNTRY_FIELDS_CONFLICT');
  if(s(row.tenantId)&&s(row.tenantId)!=='tya')conflicts.push('TENANT_SCOPE_CONFLICT');
  if(!['GT','GUATEMALA'].includes(country))conflicts.push('COUNTRY_UNPROVEN');
  if(s(row.projectId)!==projectId||row.global===true)conflicts.push('PROJECT_SCOPE_UNPROVEN');
  if(!['anticipo','remesa'].includes(s(row.tipoIngreso)))conflicts.push('ADVANCE_CLASSIFICATION_UNPROVEN');
  if(s(row.id)&&s(row.id)!==s(row.docId))conflicts.push('DOCUMENT_ID_ALIAS_CONFLICT');
  return {...row,normalizedAmount:a.amount,conflicts,scopeExact:conflicts.length===0};
}
export function paymentEvidence(row){
  const reference=s(row.paymentSourceRef||row.externalPaymentSourceRef||row.paymentRef||row.bankProofRef);
  return {externalConfirmed:row.externalPaymentConfirmed===true&&Boolean(reference),
    historicalConfirmed:row.historicalReconciliationConfirmed===true&&Boolean(s(row.reconciliationSourceRef||row.historicalPaymentAuthorityRef)),
    platformRecorded:s(row.paymentState)==='platform_recorded_pending_external_reconciliation',
    paidLabelOnly:/^(pagado|pagada|paid)$/i.test(s(row.estado||row.status))&&row.externalPaymentConfirmed!==true};
}
export function buildFinanceManifest(data,{tenantId,projectId,periodId}){
  const movements=data.movements||[],accounts=data.accounts||[],lots=data.lots||[],reconciliations=data.reconciliations||[];
  const candidates=movements.map(x=>advanceCandidate(x,projectId)).filter(Boolean);
  const visits=(data.visits||[]).filter(x=>s(x.periodId)===periodId);
  const movementById=new Map(movements.map(x=>[x.docId,x]));
  const lotIds=new Set(lots.map(x=>x.docId));
  const applications=candidates.map(c=>{
    const linkedAccounts=accounts.filter(x=>s(x.sourceMovementId)===c.docId||s(x.lastMovementId)===c.docId||s(c.accountId)===x.docId);
    const ids=new Set(linkedAccounts.map(x=>x.docId));
    const applied=movements.filter(x=>ids.has(s(x.accountId))||[c.docId,s(c.id)].filter(Boolean).includes(s(x.sourceMovementId)));
    return {advanceDocId:c.docId,accountIds:[...ids],movementIds:applied.map(x=>x.docId),appliedMovements:applied,
      accountLastMovements:linkedAccounts.map(x=>({accountId:x.docId,lastMovementId:s(x.lastMovementId),exists:movementById.has(s(x.lastMovementId))})),
      allocationEvidence:linkedAccounts.length||applied.length?'EXPLICIT_DURABLE_LINKS_REVIEW_REQUIRED':'NO_EXPLICIT_DURABLE_LINK_FOUND',
      allocationAmountInferred:false,ownerStatementPreserved:true};
  });
  const september=visits.map(v=>{
    const exact=reconciliations.filter(r=>s(r.projectId)===projectId&&s(r.periodId)===periodId&&(
      s(r.durableVisitId)===v.docId||(s(v.visitId||v.id)&&s(r.visitId)===s(v.visitId||v.id))||(s(v.hrRowId)&&s(r.hrRowId)===s(v.hrRowId))));
    const errors=[];
    if(v.tenantId&&s(v.tenantId)!==tenantId||v.projectId&&s(v.projectId)!==projectId)errors.push('VISIT_SCOPE_CONFLICT');
    if(!s(v.shopperId))errors.push('SHOPPER_ID_MISSING');
    if(!s(v.country||v.pais)||!s(v.currency||v.moneda))errors.push('COUNTRY_OR_CURRENCY_MISSING');
    if(s(v.loteId)&&!lotIds.has(s(v.loteId)))errors.push('REFERENCED_LOT_MISSING');
    if(exact.some(r=>s(r.shopperId)&&s(r.shopperId)!==s(v.shopperId)))errors.push('RECONCILIATION_SHOPPER_REVIEW');
    return {...v,paymentEvidence:paymentEvidence(v),priorReconciliations:exact,review:errors,settlementEligibleNow:'NOT_CERTIFIED'};
  });
  return {schemaVersion:'cxorbia.i3.finance-residual-private.v1',tenantId,projectId,periodId,
    advances:{expectedCount:2,candidates,selectedExactIds:[],structurallyScopedIds:candidates.filter(x=>x.scopeExact).map(x=>x.docId),applications,
      warning:'Amount and row count alone do not prove the owner-authorized two advances or bank settlement'},
    september:{visits:september,periodAliasRows:(data.visits||[]).filter(x=>s(x.periodId)!==periodId&&[x.periodId,x.periodKey,x.sourcePeriodKey].some(p=>s(p).includes('2026-09')))},
    identityLinkAssessment:identityLinkAssessment(september,data.identityLinks||[]),identityLinkRecordsRead:(data.identityLinks||[]).length,
    accounts,lots,reconciliations,movements:movements.filter(x=>!s(x.projectId)||s(x.projectId)===projectId),projectBinding:data.projectBinding||null,integrationMetadata:data.integrationMetadata||[],
    hrAuthorityMode:'PINNED_SEAL_AND_STORED_FIELDS_ONLY',freshExternalHrVerified:false,providerCommandsExecuted:0,newDomainMatches:0,
    writes:{firestore:0,auth:0,hr:0,finance:0,bank:0},production:false};
}
export function summarizeIdentityPreflight(rows,linkCount){
  const a=Array.isArray(rows)?rows:[];
  const candidates=x=>Array.isArray(x.candidateLinks)?x.candidateLinks.length:0;
  return {identityLinkRecordsRead:Number(linkCount)||0,identityConflictVisits:a.length,
    zeroLinkCandidates:a.filter(x=>candidates(x)===0).length,
    oneLinkCandidate:a.filter(x=>candidates(x)===1).length,
    multipleLinkCandidates:a.filter(x=>candidates(x)>1).length,
    autoAdjudicated:0,privateIdsExposed:false};
}
export function encryptManifest(manifest,publicKey){
  const key=crypto.randomBytes(32),iv=crypto.randomBytes(12),plain=Buffer.from(JSON.stringify(manifest));
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const bytes=Buffer.concat([cipher.update(plain),cipher.final()]);
  const envelope={version:1,algorithm:'RSA-OAEP-SHA256+AES-256-GCM',key:crypto.publicEncrypt({key:publicKey,oaepHash:'sha256'},key).toString('base64'),
    iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:bytes.toString('base64'),plainSha256:hash(plain.toString())};
  key.fill(0);return envelope;
}
export function validateReadonlyScope({descriptor,current,scope,source,tree,project,host,period}){
  const m=descriptor.currentMaterialization||{};
  const ok=project==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&scope.mode==='READONLY_SEP_ADVANCES'&&
    source===descriptor.productSourceSha&&source===m.sourceSha&&source===scope.sourceSha&&tree===m.sourceTree&&tree===scope.sourceTree&&
    m.production===false&&m.sourceHostedExact===true&&m.hrLiveVerified===true&&current.production==='DO_NOT_TOUCH'&&current.authorizationI4===false&&
    period===scope.periodId&&scope.providerWrites===0&&scope.production===false&&scope.tenantId==='tya'&&scope.projectId==='cinepolis';
  if(!ok)throw Error('SOURCE_FAILURE:FINANCE_READONLY_SCOPE_NOT_CURRENT');
  crypto.createPublicKey(scope.encryptionPublicKey);return true;
}
const fields={
 movements:['id','tenantId','projectId','global','periodId','tipo','tipoIngreso','monto','amount','country','pais','currency','moneda','fecha','date','cat','categoria','desc','concepto','sourceRef','sourceStatus','accountId','sourceMovementId','visitaId','visitId','lote','status','estado','paymentState','externalPaymentConfirmed','paymentSourceRef','externalPaymentSourceRef','bankProofRef','createdAt','updatedAt'],
 accounts:['id','tenantId','projectId','periodId','kind','country','pais','currency','moneda','amount','monto','balance','saldo','status','estado','sourceMovementId','lastMovementId','visitId','visitaId','updatedAt'],
 lots:['id','tenantId','projectId','periodId','country','pais','currency','moneda','visitIds','status','estado','paymentState','paymentSourceRef','externalPaymentConfirmed','createdAt','updatedAt'],
 reconciliations:['id','tenantId','projectId','periodId','visitId','durableVisitId','hrRowId','shopperId','country','currency','status','paymentState','paymentStatus','paymentConfirmed','externalPaymentConfirmed','historicalReconciliationConfirmed','reconciliationSourceRef','historicalPaymentAuthorityRef','sourceRef','sourceRevision','paymentDate','paymentAmount','amount','amountStatus','reconciliationBatchId','supersededBy','supersededAt','updatedAt'],
 visits:['id','visitId','hrRowId','shopperId','tenantId','projectId','periodId','periodKey','sourcePeriodKey','pais','country','currency','moneda','estado','status','canonicalState','canonicalFacets','submittedAt','hrManaged.honorario','honorario','honorarioSource','boleto','comboAmt','reimbursementSourceComplete','reimbursementPartial','financialSourceStatus','financialMatch','paymentState','paymentConfirmed','externalPaymentConfirmed','paymentSourceRef','paymentRef','externalPaymentSourceRef','bankProofRef','historicalPaymentAuthorityRef','historicalReconciliationConfirmed','historicalPaymentStatus','historicalPaymentDate','historicalPaymentAmount','historicalPaymentAmountStatus','reconciliationBatchId','reconciliationSourceRef','reconciliationSourceRevision','loteId','lastPaymentCommandId','version','updatedAt'],
 identityLinks:['id','tenantId','projectScope','sourceIdentityAliases','sourceAliases','aliases','sourceIdentityKey','canonicalShopperId','sourceSystem','status','authorityType','authorityRef','periodIndependent','sourceSafe']
};
export async function runFinanceResidualReadonly({project,host,out,source,period,env=process.env}){
  if(s(env.FIRESTORE_EMULATOR_HOST))throw Error('ENVIRONMENT_FAILURE:FINANCE_EMULATOR_NOT_LIVE');
  const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  const descriptor=read(env.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json');
  const current=read('CXORBIA_RECOVERY_EXECUTION_CURRENT.json');
  const scope=read('docs/checkpoints/CXORBIA_I3_FINANCE_CURRENT_READONLY_SCOPE_20261117.json');
  validateReadonlyScope({descriptor,current,scope,source,tree:env.FOCAL_TREE,project,host,period});
  const {applicationDefault,initializeApp,deleteApp}=await import('firebase-admin/app');
  const {getFirestore,FieldPath}=await import('firebase-admin/firestore');
  const app=initializeApp({credential:applicationDefault(),projectId:project},'finance-readonly-'+env.GITHUB_RUN_ID);
  const db=getFirestore(app),tenant=db.collection('tenants').doc(scope.tenantId),tracking=[],counts={},data={};
  const stamp=d=>d.updateTime?String(d.updateTime.seconds)+':'+String(d.updateTime.nanoseconds):null;
  async function readCollection(name,ref){
    const rows=[];let cursor=null,complete=false;
    for(let page=0;page<20;page++){
      let q=ref.select(...fields[name]).orderBy(FieldPath.documentId()).limit(500);if(cursor)q=q.startAfter(cursor);
      const snap=await q.get();
      for(const d of snap.docs){tracking.push({ref:d.ref,stamp:stamp(d)});rows.push({...d.data(),docId:d.id,documentPath:d.ref.path,providerUpdateTime:stamp(d)});}
      if(snap.size<500){complete=true;break;}cursor=snap.docs.at(-1);
    }
    if(!complete)throw Error('PROVIDER_FAILURE:FINANCE_READ_LIMIT_REACHED');counts[name]=rows.length;return rows;
  }
  try{
    for(const [name,col] of Object.entries(FINANCE_COLLECTIONS))data[name]=await readCollection(name,tenant.collection(col));
    data.visits=await readCollection('visits',tenant.collection('projects').doc(scope.projectId).collection('visits'));
    data.identityLinks=await readCollection('identityLinks',tenant.collection(IDENTITY_LINK_COLLECTION));
    const projectRef=tenant.collection('projects').doc(scope.projectId);
    const [pd]=await db.getAll(projectRef,{fieldMask:['id','tenantId','projectId','version','operationalSource.mode','operationalSource.providerType','operationalSource.readPolicy','operationalSource.writePolicy','operationalSource.providerBindingId','operationalSource.integrationSettingId','routeSource.mode','routeSource.writePolicy','routeSource.providerBindingId','routeSource.integrationSettingId']});
    data.projectBinding=pd.exists?{...pd.data(),docId:pd.id,providerUpdateTime:stamp(pd)}:null;
    if(pd.exists)tracking.push({ref:pd.ref,stamp:stamp(pd)});
    const ids=[...new Set([pd.data()?.operationalSource?.providerBindingId,pd.data()?.operationalSource?.integrationSettingId,pd.data()?.routeSource?.providerBindingId,pd.data()?.routeSource?.integrationSettingId].map(s).filter(x=>x&&!x.includes('/')))];
    data.integrationMetadata=[];
    for(const id of ids){const [d]=await db.getAll(tenant.collection('integrationSettings').doc(id),{fieldMask:['id','tenantId','projectId','projectIds','enabled','status','providerType','readPolicy','writePolicy','hrWritesEnabled']});if(d.exists){tracking.push({ref:d.ref,stamp:stamp(d)});data.integrationMetadata.push({...d.data(),docId:d.id,providerUpdateTime:stamp(d)});}}
    let stable=true;
    for(let i=0;i<tracking.length;i+=100){const group=tracking.slice(i,i+100),again=await db.getAll(...group.map(x=>x.ref),{fieldMask:['id']});if(again.some((d,j)=>!d.exists||stamp(d)!==group[j].stamp))stable=false;}
    const manifest=buildFinanceManifest(data,scope);
    manifest.readback={sameDocumentsStable:stable,collectionEnumerationComplete:true,atomicSnapshotClaimed:false,counts,readAt:new Date().toISOString()};
    manifest.sourceSha=source;manifest.sourceTree=env.FOCAL_TREE;manifest.materialization=descriptor.currentMaterialization;
    const encrypted=encryptManifest(manifest,scope.encryptionPublicKey);fs.mkdirSync(out,{recursive:true});
    fs.writeFileSync(path.join(out,'finance-private.json.enc'),JSON.stringify(encrypted)+'\n');
    const publicReceipt={schemaVersion:'cxorbia.i3.finance-residual-public.v1',decision:stable?'PASS_FINANCE_READONLY_CURRENT_MANIFEST':'HOLD_FINANCE_CONCURRENT_DOCUMENT_CHANGE',
      operationKind:'READ_ONLY',sourceSha:source,sourceTree:env.FOCAL_TREE,runId:env.GITHUB_RUN_ID,runAttempt:env.GITHUB_RUN_ATTEMPT,
      encryptedEvidence:'finance-private.json.enc',encryptedEvidenceSha256:hash(JSON.stringify(encrypted)+'\n'),privateEvidenceSha256:encrypted.plainSha256,
      exactCollections:{...FINANCE_COLLECTIONS,identityLinks:IDENTITY_LINK_COLLECTION},completeRead:true,sameDocumentsStable:stable,atomicSnapshotClaimed:false,
      privateDataExposed:false,identityPreflight:summarizeIdentityPreflight(manifest.identityLinkAssessment,manifest.identityLinkRecordsRead),providerCommandsExecuted:0,freshExternalHrVerified:false,newDomainMatches:0,phaseAComplete:false,
      writes:{firestore:0,auth:0,hr:0,finance:0,bank:0},production:false};
    fs.writeFileSync(path.join(out,'finance-readonly.json'),JSON.stringify(publicReceipt,null,2)+'\n');
    console.log('FINANCE_READONLY_RECEIPT='+JSON.stringify(publicReceipt));
    if(!stable)throw Error('PROVIDER_FAILURE:FINANCE_CONCURRENT_DOCUMENT_CHANGE');
    return publicReceipt;
  }finally{await deleteApp(app);}
}
