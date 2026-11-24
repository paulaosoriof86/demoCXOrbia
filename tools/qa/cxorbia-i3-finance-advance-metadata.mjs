// I3 control only. Reads with ADC; writes exclusively through the protected command endpoint.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {encryptManifest} from './cxorbia-i3-finance-residual-readonly.mjs';

const str=v=>String(v??'').trim();
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
export const digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex');
const fail=(ok,code)=>{if(!ok)throw Error(code);};
const MODE='APPLY_NOV_ADVANCE_METADATA',BRANCH='recovery/cxorbia-phase-a-20260831';
const PATCH=Object.freeze({cat:'Remesa de anticipo Noviembre Cinépolis',fecha:'2026-10-31'});
const changed=new Set(['cat','fecha','version','updatedAt','updatedBy','metadataCorrection']);
const facts=row=>Object.fromEntries(Object.entries(row).filter(([k])=>!changed.has(k)));
const metadata=row=>({cat:row.cat,fecha:row.fecha});
const raw=row=>Object.fromEntries(Object.entries(row).filter(([k])=>k!=='docId'));
const pick=(row,fields)=>Object.fromEntries(fields.map(k=>[k,row[k]??null]));
const ordered=rows=>[...rows].sort((a,b)=>str(a.docId).localeCompare(str(b.docId)));
const receiptId=c=>digest(`${c.tenantId}\0${c.projectId}\0${c.periodId}\0${c.idempotencyKey}`).slice(0,40);
const frozenLedger=ledger=>Object.fromEntries(Object.entries(ledger).map(([name,rows])=>[name,ordered(rows)]));
function validatePlan(plan){
  fail(plan?.schemaVersion==='cxorbia.i3.november-advance-metadata.v1'&&plan.mode===MODE&&plan.requestId==='CXORBIA-I3-NOVEMBER-ADVANCE-METADATA-20261124','SOURCE_FAILURE:FINANCE_METADATA_SCOPE_SCHEMA');
  fail(plan.tenantId==='tya'&&plan.projectId==='cinepolis'&&plan.cashPeriodId==='cinepolis-2026-10'&&plan.amount===7300&&plan.currency==='Q'&&plan.country==='GT','SOURCE_FAILURE:FINANCE_METADATA_APPROVED_SCOPE');
  fail(digest(plan.patch)===digest(PATCH)&&plan.authorization==='USER_ALREADY_AUTHORIZED_SECOND_ADVANCE_METADATA_CORRECTION','SOURCE_FAILURE:FINANCE_METADATA_APPROVED_PATCH');
  fail(plan.production===false&&plan.financialFactWrites===false&&plan.firstAdvanceWrites===0&&plan.newMovements===0&&plan.allocationOrPayoutWrites===0&&plan.bankEvidenceConfirmed===false,'SOURCE_FAILURE:FINANCE_METADATA_SIDE_EFFECT_SCOPE');
  for(const key of ['firstIdSha256','secondIdSha256','targetSourceRefSha256','firstOriginalFactsSha256','secondOriginalFactsSha256','firstOriginalMetadataSha256','secondOriginalMetadataSha256'])fail(/^[a-f0-9]{64}$/.test(plan[key]),'SOURCE_FAILURE:FINANCE_METADATA_SCOPE_HASH');
  fail(plan.firstIdSha256!==plan.secondIdSha256&&Array.isArray(plan.expectedFactFields)&&plan.expectedFactFields.includes('desc')&&plan.expectedFactFields.includes('sourceRef'),'SOURCE_FAILURE:FINANCE_METADATA_FREEZE_FIELDS');
  fail(typeof plan.commandDispatchAllowed==='boolean'&&str(plan.reason)&&str(plan.authorityRef),'SOURCE_FAILURE:FINANCE_METADATA_EXECUTION_STATE');
}
export function validateMetadataEnvironment({plan,descriptor,current,project,host,source,tree,branch,mode,emulator}){
  validatePlan(plan);const m=descriptor.currentMaterialization||{};
  fail(project==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&!emulator&&branch===BRANCH&&mode===MODE,'ENVIRONMENT_FAILURE:FINANCE_METADATA_DEV_ONLY');
  fail(/^[a-f0-9]{40}$/.test(source)&&/^[a-f0-9]{40}$/.test(tree)&&source===descriptor.productSourceSha&&source===m.sourceSha&&tree===descriptor.productTreeAuthority&&tree===m.sourceTree&&descriptor.branch===BRANCH,'SOURCE_FAILURE:FINANCE_METADATA_CURRENT_SOURCE_REQUIRED');
  fail(m.production===false&&m.sourceHostedExact===true&&m.hrLiveVerified===true&&current.production==='DO_NOT_TOUCH'&&current.authorizationI4===false,'SOURCE_FAILURE:FINANCE_METADATA_CURRENT_DEV_AUTHORITY');
  return true;
}
function exactPair(ledger,plan){
  const rows=ledger.movements||[];
  fail(new Set(rows.map(x=>x.docId)).size===rows.length,'PERSISTENCE_FAILURE:FINANCE_METADATA_DUPLICATE_DOCUMENT');
  const find=hash=>{const hit=rows.filter(x=>digest(x.docId)===hash);fail(hit.length===1,'PERSISTENCE_FAILURE:FINANCE_METADATA_EXACT_DOCUMENT_REQUIRED');return hit[0];};
  const first=find(plan.firstIdSha256),second=find(plan.secondIdSha256);
  for(const row of [first,second]){
    fail(row.id===row.docId&&row.tenantId===plan.tenantId&&row.projectId===plan.projectId&&row.periodId===plan.cashPeriodId&&!row.global,'PERSISTENCE_FAILURE:FINANCE_METADATA_DOCUMENT_SCOPE');
    fail(row.amount===7300&&row.monto===7300&&row.currency==='Q'&&row.moneda==='Q'&&row.country==='GT'&&row.pais==='GT'&&row.tipo==='ingreso'&&row.tipoIngreso==='anticipo','PERSISTENCE_FAILURE:FINANCE_METADATA_FINANCIAL_FACT_DRIFT');
    fail(!row.accountId&&!row.visitId&&!row.visitaId&&!row.lote&&!row.loteId,'PERSISTENCE_FAILURE:FINANCE_METADATA_LINKED_ADVANCE');
  }
  fail(digest(second.sourceRef)===plan.targetSourceRefSha256,'PERSISTENCE_FAILURE:FINANCE_METADATA_SOURCE_REF_DRIFT');
  fail(digest(pick(first,plan.expectedFactFields))===plan.firstOriginalFactsSha256&&digest(pick(second,plan.expectedFactFields))===plan.secondOriginalFactsSha256,'PERSISTENCE_FAILURE:FINANCE_METADATA_BASELINE_FACT_DRIFT');
  fail(digest(metadata(first))===plan.firstOriginalMetadataSha256,'PERSISTENCE_FAILURE:FINANCE_METADATA_FIRST_ADVANCE_DRIFT');
  const other=rows.filter(x=>x.tipo==='ingreso'&&['anticipo','remesa'].includes(x.tipoIngreso)&&x.periodId===plan.cashPeriodId&&[x.amount,x.monto].includes(7300)&&[x.currency,x.moneda].includes('Q'));
  fail(other.length===2&&other.every(x=>[first.docId,second.docId].includes(x.docId)),'PERSISTENCE_FAILURE:FINANCE_METADATA_UNEXPECTED_THIRD_ADVANCE');
  return {first,second};
}
function exactVersion(row){
  if(row.version!==undefined&&row.version!==null){fail(Number.isSafeInteger(Number(row.version))&&Number(row.version)>=0&&Number(row.version)<Number.MAX_SAFE_INTEGER,'PERSISTENCE_FAILURE:FINANCE_METADATA_EXACT_VERSION_REQUIRED');return row.version;}
  fail(typeof row.updatedAt==='string'&&Number.isFinite(Date.parse(row.updatedAt)),'PERSISTENCE_FAILURE:FINANCE_METADATA_EXACT_VERSION_REQUIRED');return row.updatedAt;
}
export function prepareMetadataCommand(ledger,plan){
  validatePlan(plan);const {first,second}=exactPair(ledger,plan);
  const command={version:'cxorbia-command-adapter-v1',commandType:'finance.movement.metadata.update',entityType:'financialMovement',entityId:second.docId,
    tenantId:plan.tenantId,projectId:plan.projectId,periodId:plan.cashPeriodId,expectedVersion:exactVersion(second),
    idempotencyKey:'i3-nov-meta-'+digest(plan.requestId+'\0'+plan.secondIdSha256).slice(0,40),
    authorization:{providerEnforcementRequired:true,permission:'finance.movement.write'},
    payload:{periodId:plan.cashPeriodId,patch:{...plan.patch},reason:plan.reason,authorityRef:plan.authorityRef}};
  return {first,second,command,receiptId:receiptId(command)};
}
function verifyLedger(before,after,plan,ack){
  const a=exactPair(before,plan),b=exactPair(after,plan);
  fail(digest(a.first)===digest(b.first),'PERSISTENCE_FAILURE:FINANCE_METADATA_FIRST_CHANGED');
  fail(digest(facts(a.second))===digest(facts(b.second)),'PERSISTENCE_FAILURE:FINANCE_METADATA_IMMUTABLE_FACT_CHANGED');
  fail(digest(metadata(b.second))===digest(plan.patch),'PERSISTENCE_FAILURE:FINANCE_METADATA_PATCH_READBACK');
  const removeTarget=l=>({...l,movements:l.movements.filter(x=>x.docId!==a.second.docId)});
  fail(digest(frozenLedger(removeTarget(before)))===digest(frozenLedger(removeTarget(after))),'PERSISTENCE_FAILURE:FINANCE_METADATA_OTHER_LEDGER_CHANGED');
  if(ack){
    fail(digest(raw(b.second))===digest(ack.movement),'PERSISTENCE_FAILURE:FINANCE_METADATA_ACK_READBACK_MISMATCH');
    fail(b.second.version===Number(a.second.version||0)+1&&b.second.metadataCorrection?.authorityRef===plan.authorityRef&&b.second.metadataCorrection?.bankEvidenceConfirmed===false,'PERSISTENCE_FAILURE:FINANCE_METADATA_VERSION_AUDIT_READBACK');
  }
  return {movementCount:after.movements.length,advanceCount:2,advanceTotal:14600,firstUnchanged:true,financialFactsUnchanged:true,sameLedgerTotal:true,newMovements:0,allocationOrPayoutWrites:0};
}
function requireAck(response,{replay=false}={}){
  const b=response?.body;
  fail(response?.ok===true&&b?.ok===true&&b.providerAck===true&&b.committed===true&&b.metadataOnly===true&&b.amountsChanged===false&&b.movementCreated===false,'PERSISTENCE_FAILURE:FINANCE_METADATA_PROVIDER_ACK');
  fail(b.hrWrites===0&&b.bankWrites===0&&b.externalPaymentWrites===0&&b.externalPaymentConfirmed===false,'PERSISTENCE_FAILURE:FINANCE_METADATA_SIDE_EFFECT_ACK');
  fail(replay?b.idempotentReplay===true&&b.providerWrites===0:b.idempotentReplay===false&&b.providerWrites===3,'PERSISTENCE_FAILURE:FINANCE_METADATA_WRITE_COUNT');
  return b;
}
export async function executeAdvanceMetadata({plan,readLedger,readReceipt,sendCommand,recordPrivate=async()=>{}}){
  const before=await readLedger(),prepared=prepareMetadataCommand(before,plan),{second,command}=prepared;
  const receipt=await readReceipt(prepared.receiptId);
  await recordPrivate('prepared',{before,command,receipt,preparedAt:new Date().toISOString()});
  if(receipt){
    fail(receipt.status==='committed'&&receipt.commandType===command.commandType&&receipt.providerAck===true&&receipt.entityId===second.docId&&digest(receipt.entity)===digest(raw(second))&&digest(metadata(second))===digest(plan.patch)&&second.metadataCorrection?.providerReceiptId===prepared.receiptId&&second.metadataCorrection?.authorityRef===plan.authorityRef,'PERSISTENCE_FAILURE:FINANCE_METADATA_PRIOR_RECEIPT_CONFLICT');
    const after=await readLedger();fail(digest(frozenLedger(before))===digest(frozenLedger(after)),'PERSISTENCE_FAILURE:FINANCE_METADATA_READONLY_RECHECK_CHANGED');
    await recordPrivate('already-applied',{after,receipt});
    return {decision:'PASS_FINANCE_METADATA_ALREADY_APPLIED',providerCommandsExecuted:0,providerWrites:0,idempotentReplay:false,idempotentNoop:true,readbackExact:true,firstUnchanged:true,financialFactsUnchanged:true,sameLedgerTotal:true,advanceTotal:14600,advanceCount:2,newMovements:0,allocationOrPayoutWrites:0};
  }
  fail(digest(metadata(second))===plan.secondOriginalMetadataSha256,'PERSISTENCE_FAILURE:FINANCE_METADATA_UNEXPECTED_CURRENT_METADATA');
  // The currently served configure path still reads HR before every command.
  // Credit exhaustion is a provider blocker; this control may not bypass it.
  fail(plan.commandDispatchAllowed===true,'PROVIDER_FAILURE:FINANCE_METADATA_CONFIGURE_REQUIRES_HR');
  const firstResponse=await sendCommand(command),ack=requireAck(firstResponse);
  const after=await readLedger(),proof=verifyLedger(before,after,plan,ack);
  await recordPrivate('committed',{command,before,after,ack});
  const replay=requireAck(await sendCommand(command),{replay:true});
  fail(digest(replay.movement)===digest(ack.movement),'PERSISTENCE_FAILURE:FINANCE_METADATA_REPLAY_RECEIPT_CHANGED');
  const final=await readLedger();fail(digest(frozenLedger(final))===digest(frozenLedger(after)),'PERSISTENCE_FAILURE:FINANCE_METADATA_REPLAY_CHANGED_LEDGER');
  await recordPrivate('verified',{command,before,after,final,ack,replay});
  return {decision:'PASS_FINANCE_METADATA_SECOND_ADVANCE',...proof,providerCommandsExecuted:2,providerWrites:3,idempotentReplay:true,idempotentNoop:false,readbackExact:true};
}
export async function runAdvanceMetadata({project,host,out,source,env=process.env}){
  const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  const plan=read('docs/checkpoints/CXORBIA_I3_NOVEMBER_ADVANCE_METADATA_SCOPE_20261124.json');
  const descriptor=read(env.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'),current=read('CXORBIA_RECOVERY_EXECUTION_CURRENT.json');
  validateMetadataEnvironment({plan,descriptor,current,project,host,source,tree:env.FOCAL_TREE,branch:env.GITHUB_REF_NAME,mode:env.CXORBIA_I3_FINANCE_MODE,emulator:env.FIRESTORE_EMULATOR_HOST});
  const publicKey=read('docs/checkpoints/CXORBIA_I3_FINANCE_CURRENT_READONLY_SCOPE_20261117.json').encryptionPublicKey;crypto.createPublicKey(publicKey);
  const destination=path.join(out,'metadata');fs.mkdirSync(destination,{recursive:true});
  const {applicationDefault,initializeApp,deleteApp}=await import('firebase-admin/app');
  const {getFirestore,FieldPath}=await import('firebase-admin/firestore');
  const {getAuth}=await import('firebase-admin/auth');
  const app=initializeApp({credential:applicationDefault(),projectId:project},'finance-metadata-'+env.GITHUB_RUN_ID);
  const db=getFirestore(app),auth=getAuth(app),tenant=db.collection('tenants').doc(plan.tenantId);
  let token=null,commands=0;
  const recordPrivate=async(stage,evidence)=>fs.writeFileSync(path.join(destination,'private-'+stage+'.envelope.json'),JSON.stringify(encryptManifest(evidence,publicKey))+'\n');
  const jsonResponse=async(url,options,code)=>{let response;try{response=await fetch(url,{...options,signal:AbortSignal.timeout(60000)});}catch{throw Error(code);}const body=await response.json().catch(()=>null);return {ok:response.ok,status:response.status,body};};
  async function adminToken(){
    const users=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...d.data()}));
    const allowed=m=>m.active===true&&m.authNamespace==='staff'&&['super','admin'].includes(m.role)&&(m.role==='super'||m.projectIds?.includes(plan.projectId));
    const member=users.filter(allowed).sort((a,b)=>a.id.localeCompare(b.id))[0];fail(member,'AUTH_FAILURE:FINANCE_METADATA_ADMIN_REQUIRED');
    const user=await auth.getUser(member.id),claims=user.customClaims||{};
    fail(user.disabled!==true&&claims.tenantId===plan.tenantId&&claims.role===member.role&&claims.authNamespace==='staff'&&(claims.role==='super'||claims.projectIds?.includes(plan.projectId)),'AUTH_FAILURE:FINANCE_METADATA_CLAIMS');
    const init=await jsonResponse(host+'/__/firebase/init.json',{cache:'no-store'},'ENVIRONMENT_FAILURE:FINANCE_METADATA_FIREBASE_INIT');
    fail(init.ok&&init.body?.projectId===project&&str(init.body?.apiKey),'ENVIRONMENT_FAILURE:FINANCE_METADATA_FIREBASE_INIT_PROJECT');
    const custom=await auth.createCustomToken(member.id);
    const session=await jsonResponse('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(init.body.apiKey),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})},'AUTH_FAILURE:FINANCE_METADATA_TOKEN_EXCHANGE');
    fail(session.ok&&str(session.body?.idToken),'AUTH_FAILURE:FINANCE_METADATA_TOKEN_EXCHANGE');return session.body.idToken;
  }
  const readLedger=async()=>{
    const ledger={};
    for(const [name,collection] of Object.entries({movements:'financialMovements',accounts:'financeAccounts',lots:'paymentLots',reconciliations:'paymentReconciliations'})){
      const rows=[];let cursor=null,complete=false;
      for(let page=0;page<20;page++){
        let q=tenant.collection(collection).where('projectId','==',plan.projectId).orderBy(FieldPath.documentId()).limit(500);if(cursor)q=q.startAfter(cursor);
        const snap=await q.get();for(const d of snap.docs)rows.push({...JSON.parse(JSON.stringify(d.data())),docId:d.id});
        if(snap.size<500){complete=true;break;}cursor=snap.docs.at(-1);
      }
      fail(complete,'PROVIDER_FAILURE:FINANCE_METADATA_READ_BOUND');ledger[name]=rows;
    }
    return ledger;
  };
  let evidence={schemaVersion:'cxorbia.i3.finance-advance-metadata-result.v1',decision:'HOLD_FINANCE_METADATA',sourceSha:source,sourceTree:env.FOCAL_TREE,mode:MODE,scopeSha256:digest(plan),production:false,hrWrites:0,bankWrites:0,externalPaymentWrites:0,directFirestoreWrites:0,financialFactWrites:0,newMovements:0,privateDataExposed:false};
  try{
    const result=await executeAdvanceMetadata({plan,readLedger,readReceipt:async id=>{const d=await tenant.collection('commandReceipts').doc(id).get();return d.exists?JSON.parse(JSON.stringify(d.data())):null;},
      sendCommand:async command=>{token||=await adminToken();commands++;return jsonResponse(host+'/v1/cxorbia/commands',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(command)},'PROVIDER_FAILURE:FINANCE_METADATA_COMMAND_TRANSPORT');},recordPrivate});
    evidence={...evidence,...result};
  }catch(error){evidence={...evidence,error:str(error?.message).match(/^(?:SOURCE|ENVIRONMENT|PROVIDER|PERSISTENCE|AUTH)_FAILURE:FINANCE_METADATA_[A-Z_]+$/)?.[0]||'PROVIDER_FAILURE:FINANCE_METADATA_UNCONFIRMED',providerCommandsExecuted:commands,mutationOutcome:commands?'REQUIRES_RECEIPT_READBACK':'NO_COMMAND_DISPATCHED'};throw Error(evidence.error);
  }finally{fs.writeFileSync(path.join(destination,'finance-metadata.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));await deleteApp(app);}
  return evidence;
}
