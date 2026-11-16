// I3 QA: one existing Admin HR sync, exact durable readback and same-command
// replay. No product mutation, direct database repair, or external HR write.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {b14ReadJournalPage,b14SummarizeCurrentJournal,b14ReconciliationLeaseReadOnly} from './cxorbia-i3-hr-ack-exact-same-revision.mjs';
import {settleCustomRoleAuth,settleVisibleShopperAuth} from '../../.github/control/RECOVERY-I3-BROWSER-AUTH-LIFECYCLE-20260919.mjs';

const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const sha=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex');
const requireProof=(ok,code)=>{if(!ok)throw Error('RELEASE_COMPOSITION_FAILURE:VRM354_'+code);};
const fp=uid=>sha('cxorbia-provider-uid-v1\0'+str(uid));
export const canonicalNameHash=v=>sha(str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase());
export function validateNameRepairRequest({descriptor,pointer,env,ownerBlobs}){
 const a=descriptor?.vrm354CanonicalNameRepairRequest,b=pointer?.vrm354CanonicalNameRepairRequest;
 if(a?.enabled!==true&&b?.enabled!==true)return null;
 requireProof(a?.enabled===true&&b?.enabled===true&&sha(a)===sha(b),'REQUEST_ALIAS_DRIFT');
 requireProof(a.findingId==='VRM-354'&&a.scope==='EXISTING_ADMIN_HR_SYNC_EXACT_CANONICAL_NAME_REPAIR'&&a.production===false,'REQUEST_SCOPE');
 requireProof(env.PROJECT==='cxorbia-backend-dev'&&a.firebaseProjectId===env.PROJECT&&a.hostingUrl==='https://cxorbia-backend-dev.web.app'&&str(env.HOSTING_URL).replace(/\/$/,'')===a.hostingUrl,'DEV_ONLY');
 const fields={sourceSha:'I3_CERTIFICATION_SOURCE_SHA',sourceTree:'I3_CERTIFICATION_SOURCE_TREE',runtimeRevision:'DEV_REVISION',runtimeDigest:'RUNTIME_DIGEST',hostingVersion:'HOSTING_VERSION_NAME',hrRevision:'CX_I3_PINNED_HR_REVISION',tenantId:'TENANT_ID',projectId:'PROJECT_ID'};
 for(const [k,e]of Object.entries(fields))requireProof(str(a[k])&&a[k]===env[e],'ENV_'+k);
 for(const d of [descriptor,pointer]){
  requireProof(d.productSourceSha===a.sourceSha&&(d===pointer?d.productTree:(d.productTreeAuthority||d.productSourceTree))===a.sourceTree,'SOURCE_ALIAS');
  const m=d.currentMaterialization,s=d.postDeployRunSeal;
  for(const k of ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','hrRevision'])requireProof(m?.[k]===a[k]&&s?.[k]===a[k],'DEV_RECEIPT_'+k);
  requireProof(m.production===false&&m.sourceHostedExact===true&&m.runtimeTrafficExact===true&&s.mode!=='PREDECESSOR_SERVING_PENDING_SOURCE','DEV_RECEIPT_STATE');
 }
 requireProof(a.nameHashMethod==='NFD_DIACRITICS_STRIP_TRIM_COLLAPSE_WS_LOWER_V1','NAME_HASH_METHOD');
 for(const k of ['actorUidHash','targetUidFingerprint','beforeNameSha256','expectedNameSha256','authorityRefHash'])requireProof(/^[a-f0-9]{64}$/.test(a[k]),'HASH_'+k);
 requireProof(a.beforeNameSha256!==a.expectedNameSha256&&/^shopper_[a-z]{2}_[a-f0-9]+$/.test(a.canonicalShopperId),'CANONICAL_TARGET');
 requireProof(a.ownerGitBlobs&&Object.keys(a.ownerGitBlobs).length===2,'OWNER_COUNT');
 for(const [p,blob]of Object.entries(a.ownerGitBlobs))requireProof(/^[a-f0-9]{40}$/.test(blob)&&ownerBlobs?.[p]===blob,'OWNER_BLOB');
 return a;
}
export function nameRepairInvariant(profile,member,user){
 const pick=(v,keys)=>Object.fromEntries(keys.map(k=>[k,v?.[k]??null]));
 const credentialKeys=v=>Object.keys(v||{}).filter(k=>/credential|password|login/i.test(k));
 return sha({
  profile:pick(profile,[...new Set(['shopperId','canonicalShopperId','tenantId','projectIds','firstName','lastName','firstSurname','primerApellido','apellido','visibleLogin','username','user','displayFirstName','displayLastName','displayNameAuthority','displayNameAuthorityRef','displayNameUpdatedAt','selfManagedFields','identityConsolidatedAt','identityAuthority','identityAuthorityRef','providerUidFingerprint','externalHrIdentityAnchors','selfDisplayName','selfDisplayNameSignature','selfDisplayNameUpdatedAt',...credentialKeys(profile)])]),
  membership:pick(member,[...new Set(['uid','shopperId','tenantId','projectIds','role','authNamespace','active','status','identityState','providerUidFingerprint','visibleLogin','identityConsolidatedAt',...credentialKeys(member)])]),
  auth:pick(user,['uid','email','emailVerified','disabled','customClaims','providerData','tokensValidAfterTime'])
 });
}
export function validateNameRepairCommand(c,r,actor){
 requireProof(c?.version==='cxorbia-command-adapter-v1'&&c.commandType==='hr.snapshot.reconcile'&&c.entityType==='hrSnapshot'&&c.entityId===r.hrRevision&&c.expectedVersion===r.hrRevision,'NATIVE_COMMAND_TYPE');
 requireProof(c.tenantId===r.tenantId&&c.projectId===r.projectId&&c.periodId===null&&c.requirePeriod===false&&c.requireProject===true,'NATIVE_COMMAND_SCOPE');
 requireProof(c.source==='hr-source-sync-request'&&c.payload&&Object.keys(c.payload).length===0&&c.authorization?.providerEnforcementRequired===true,'NATIVE_COMMAND_PAYLOAD');
 requireProof(typeof c.idempotencyKey==='string'&&c.idempotencyKey.length>=16&&c.idempotencyKey.length<=200,'NATIVE_COMMAND_KEY');
 requireProof(c.actor?.actorId===actor.actorId&&c.actor?.role===actor.role&&sha(c.actor?.projectIds)===sha(actor.projectIds)&&c.actor?.shopperId===(actor.shopperId||null),'NATIVE_COMMAND_ACTOR');
 return c;
}
export function validateNameRepairSequence(events,r,actor){
 requireProof(Array.isArray(events)&&events.length>=1&&events.length<=2,'NATIVE_COMMAND_COUNT');
 for(const e of events)validateNameRepairCommand(e.command,r,actor);
 if(events.length===2){
  const [a,b]=events;requireProof(a.response?.code==='HR_RECONCILIATION_SCOPE_BUSY'&&a.response.resumeIdempotencyKey===b.command.idempotencyKey&&a.command.idempotencyKey!==b.command.idempotencyKey,'NATIVE_RESUME_UNPROVEN');
  const strip=c=>({...c,idempotencyKey:null,audit:{...c.audit,correlationId:null}});requireProof(sha(strip(a.command))===sha(strip(b.command)),'NATIVE_RESUME_COMMAND_DRIFT');
 }
 return events.at(-1);
}
export function validateNameRepairAck(result,command,r,actorUid,{replay=false,durable=false}={}){
 const receiptPath='tenants/'+r.tenantId+'/commandReceipts/hr-'+sha(JSON.stringify([r.projectId,command.idempotencyKey]));
 const binding={tenantId:r.tenantId,projectId:r.projectId,sourceRevision:r.hrRevision,actorUid,idempotencyKey:command.idempotencyKey,commandType:'hr.snapshot.reconcile'};
 requireProof(result?.ok===true&&result.status==='committed'&&result.committed===true&&result.providerAck===true&&result.unresolvedEffects===0&&result.unverifiedEffects===0,'COMMITTED_ACK_REQUIRED');
 requireProof(durable||result.readbackVerified===true&&result.successUiAllowed===true,'INDEPENDENT_READBACK_REQUIRED');
 requireProof(result.tenantId===r.tenantId&&result.projectId===r.projectId&&result.sourceRevision===r.hrRevision&&result.receiptPath===receiptPath&&sha(result.receiptBinding)===sha(binding),'RECEIPT_BINDING');
 for(const stage of ['visits','shoppers'])requireProof(result.stages?.[stage]?.ok===true&&result.stages[stage].status==='committed'&&result.stages[stage].providerAck===true&&!result.stages[stage].code,'STALE_OR_UNCOMMITTED_STAGE');
 if(replay)requireProof(result.idempotentReplay===true&&result.applicationWritesThisAttempt?.auth===0&&result.applicationWritesThisAttempt?.firestore===0&&result.controlWrites===0,'REPLAY_NEW_WRITES');
 return {receiptPathHash:sha(receiptPath),idempotencyKeyHash:sha(command.idempotencyKey),providerWrites:result.providerWrites,applicationWritesThisAttempt:result.applicationWritesThisAttempt,canonicalFullNamesRestored:result.stages.shoppers.canonicalFullNamesRestored||0,receiptBindingVerified:true,readbackVerified:!durable,replay};
}
async function readReceipt(db,receiptPath,r){
 return db.runTransaction(async tx=>{
  const ref=db.doc(receiptPath),doc=await tx.get(ref);requireProof(doc.exists,'DURABLE_RECEIPT_MISSING');
  const [intents,effects,visits,shoppers]=await Promise.all([b14ReadJournalPage(tx,ref.collection('intents')),b14ReadJournalPage(tx,ref.collection('effects')),tx.get(ref.collection('stages').doc('visits')),tx.get(ref.collection('stages').doc('shoppers'))]);
  const records=p=>p.docs.map(d=>({id:d.id,data:d.data()})),row=doc.data(),ir=records(intents),er=records(effects);
  const journal=b14SummarizeCurrentJournal({receipt:row,receiptPath,tenantId:r.tenantId,projectId:r.projectId,revision:r.hrRevision,intents:ir,effects:er,complete:intents.complete&&effects.complete});
  return {row,journal,seal:sha({receipt:row,intents:ir,effects:er,stages:{visits:visits.data()??null,shoppers:shoppers.data()??null}}),updateTime:doc.updateTime?.toDate().toISOString()||null};
 },{readOnly:true});
}
export async function proveVrm354CanonicalNameRepair({db,auth,chromium,credentialRule,env=process.env}){
 const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
 const descriptor=readJson(env.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'),pointer=readJson('CXORBIA_RECOVERY_EXECUTION_CURRENT.json');
 const requested=descriptor.vrm354CanonicalNameRepairRequest||pointer.vrm354CanonicalNameRepairRequest;
 if(descriptor.vrm354CanonicalNameRepairRequest?.enabled!==true&&pointer.vrm354CanonicalNameRepairRequest?.enabled!==true)return {decision:'NOT_REQUESTED',nativeClicks:0,production:false};
 const blobs={};for(const p of Object.keys(requested?.ownerGitBlobs||{})){
  requireProof(['backend/runtime/cxorbia-shopper-command-provider-v1.mjs','backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs'].includes(p),'OWNER_PATH');
  const bytes=fs.readFileSync(path.join(env.SOURCE_DIR,p));blobs[p]=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 }
 const r=validateNameRepairRequest({descriptor,pointer,env,ownerBlobs:blobs}),out=env.ACCEPTANCE_OUT||'.tmp/recovery-i3-human-live-acceptance';fs.mkdirSync(out,{recursive:true});
 const proof={schemaVersion:'cxorbia.i3.canonical-name-native-repair-live.v1',findingIds:['VRM-354','VRM-355'],decision:'HOLD',sourceSha:r.sourceSha,sourceTree:r.sourceTree,runtimeRevision:r.runtimeRevision,runtimeDigest:r.runtimeDigest,hostingVersion:r.hostingVersion,hrRevision:r.hrRevision,production:false,nativeClicks:0,remoteHrWrites:0,credentialResets:0,directRepairWrites:0,startedAt:new Date().toISOString()};
 const save=()=>{fs.writeFileSync(path.join(out,'vrm354-native-name-repair.json'),JSON.stringify(proof,null,2)+'\n');console.log('I3_VRM354_NATIVE_REPAIR='+JSON.stringify(proof));};
 const identity=async()=>{
  const response=await fetch(r.hostingUrl+'/api/tya/'+encodeURIComponent(r.projectId)+'/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&vrm354='+Date.now(),{headers:{'cache-control':'no-cache'}}),raw=await response.json(),hr=raw.snapshot||raw.data||raw,revision=raw?._runtime?.revision||hr?._runtime?.revision||hr.sourceRevision;
  requireProof(response.ok&&revision===r.hrRevision&&hr.operationalIdentityPreview===true&&hr.operationalIdentityScope==='display_name_only','INDEPENDENT_HR_AUTHORITY');
  const rows=arr(hr.shoppers).filter(s=>str(s.id||s.shopperId)===r.canonicalShopperId);
  requireProof(rows.length===1&&canonicalNameHash(rows[0].nombre||rows[0].name)===r.expectedNameSha256,'CANONICAL_HR_NAME');
  return {revision,nameSha256:r.expectedNameSha256,uniqueCanonicalRow:true};
 };
 const tenant=db.collection('tenants').doc(r.tenantId),profileRef=tenant.collection('shoppers').doc(r.canonicalShopperId),users=tenant.collection('users');
 let browser;
 try{
  const pinnedRaw=readJson(env.CX_I3_PINNED_HR_FILE),pinned=pinnedRaw.snapshot||pinnedRaw.data||pinnedRaw;
  requireProof((pinned.sourceRevision||pinned?._runtime?.revision||pinnedRaw?._runtime?.revision)===r.hrRevision,'PINNED_HR_REVISION');
  proof.independentHrBefore=await identity();
  const ms=await users.get(),active=ms.docs.map(d=>({id:d.id,...d.data()}));
  const targets=active.filter(m=>m.active===true&&m.shopperId===r.canonicalShopperId&&m.tenantId===r.tenantId&&m.role==='shopper'&&m.authNamespace==='shopper'&&arr(m.projectIds).includes(r.projectId)&&fp(m.id)===r.targetUidFingerprint);
  const actors=active.filter(m=>sha(m.id)===r.actorUidHash&&m.active!==false&&m.tenantId===r.tenantId&&['admin','super'].includes(m.role)&&m.authNamespace==='staff'&&(m.role==='super'||arr(m.projectIds).includes(r.projectId)));
  requireProof(targets.length===1&&actors.length===1,'EXACT_MEMBERSHIP');
  const target=targets[0],actor=actors[0],getTarget=async()=>{
   const [p,m,u]=await Promise.all([profileRef.get(),users.doc(target.id).get(),auth.getUser(target.id)]);requireProof(p.exists&&m.exists,'IDENTITY_READBACK');
   return {profile:p.data(),member:m.data(),user:u};
  },before=await getTarget();
  requireProof(!before.user.disabled&&fp(before.user.uid)===r.targetUidFingerprint&&before.user.customClaims?.shopperId===r.canonicalShopperId&&before.user.customClaims?.role==='shopper'&&before.user.customClaims?.authNamespace==='shopper'&&before.user.customClaims?.tenantId===r.tenantId&&arr(before.user.customClaims?.projectIds).includes(r.projectId),'AUTH_SCOPE');
  requireProof(sha(str(before.profile.identityAuthorityRef))===r.authorityRefHash&&before.profile.identityAuthority==='tenant_adjudication','KEEPER_AUTHORITY');
  const beforeHash=canonicalNameHash(before.profile.nombre);proof.beforeNameSha256=beforeHash;proof.expectedNameSha256=r.expectedNameSha256;
  requireProof(beforeHash===r.beforeNameSha256||beforeHash===r.expectedNameSha256,'UNEXPECTED_CURRENT_NAME');
  // A later run cannot invent a new transition or issue another fresh sync.
  if(beforeHash===r.expectedNameSha256){proof.decision='ALREADY_CORRECT_REPAIR_RECEIPT_REUSE_REQUIRED';save();throw Error('SOURCE_FAILURE:VRM354_PRIOR_REPAIR_READBACK_REQUIRED');}
  const credentials=credentialRule(before.profile),login=str(before.member.visibleLogin||before.profile.visibleLogin||before.profile.username||before.profile.user).toLowerCase();
  requireProof(credentials?.ok===true&&login&&credentials.password,'EXISTING_CREDENTIALS');
  const invariant=nameRepairInvariant(before.profile,before.member,before.user);
  proof.beforeInvariantSha256=invariant;proof.precedingJournal=await b14ReconciliationLeaseReadOnly(db,r.tenantId,r.projectId,r.hrRevision);
  const prior=proof.precedingJournal.receipt,autoKey='hr-auto-v2-'+r.hrRevision.slice(0,32)+'-'+actor.id;
  requireProof(prior?.status==='committed'&&prior.sourceRevision===r.hrRevision&&prior.actorUidHash===r.actorUidHash&&prior.idempotencyKeyHash===sha(autoKey)&&prior.journal?.journalVerified===true&&prior.journal?.receiptTerminalCommitted===true,'PRIOR_AUTOMATIC_RECEIPT');
  const baseUrl=r.hostingUrl+'/index-backend-dev.html?'+new URLSearchParams({cxBackendPreview:'YES_PAULA_20260628_PREVIEW_DEV',cxProjectId:r.projectId,cxProtectedRuntime:'YES_PAULA_20260730_PROTECTED_DEV',cxHumanFullVisual:'YES_PAULA_20260731_FULL_PROFILE_DEV'});
  browser=await chromium.launch({headless:true});
  const visibleLogin=async()=>{
   const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
   try{const got=await settleVisibleShopperAuth({page,expectedUid:target.id,rawShopperId:r.canonicalShopperId,canonicalShopperId:r.canonicalShopperId,tenantId:r.tenantId,projectId:r.projectId,baseUrl,login,password:credentials.password});const signed=await page.evaluate(async()=>{const u=window.firebase.auth().currentUser,t=await u.getIdTokenResult();return {uid:u.uid,role:t.claims.role,namespace:t.claims.authNamespace,tenantId:t.claims.tenantId,shopperId:t.claims.shopperId,projectIds:t.claims.projectIds};});requireProof(got.authPrincipal?.uid===target.id&&signed.uid===target.id&&signed.role==='shopper'&&signed.namespace==='shopper'&&signed.tenantId===r.tenantId&&signed.shopperId===r.canonicalShopperId&&arr(signed.projectIds).includes(r.projectId),'VISIBLE_LOGIN_UID_AND_SCOPE');return {ok:true,uidFingerprint:r.targetUidFingerprint,visiblePasswordLogin:true,credentialReset:false};}finally{await context.close();}
  };
  proof.visibleLoginBefore=await visibleLogin();
  const adminContext=await browser.newContext({viewport:{width:1440,height:1000}}),page=await adminContext.newPage();
  await settleCustomRoleAuth({page,member:actor,role:'admin',tenantId:r.tenantId,projectId:r.projectId,baseUrl,getCustomToken:()=>auth.createCustomToken(actor.id)});
  await page.waitForFunction(rev=>window.CX?.backendHrSourceBridge?.last?.response?.status==='committed'&&window.CX.backendHrSourceBridge.last.response.sourceRevision===rev, r.hrRevision,{timeout:150000});
  const auto=await page.evaluate(()=>window.CX.backendHrSourceBridge.last?.response);
  requireProof(auto?.idempotentReplay===true&&auto.applicationWritesThisAttempt?.auth===0&&auto.applicationWritesThisAttempt?.firestore===0&&auto.receiptBinding?.idempotencyKey===autoKey,'AUTOMATIC_REPLAY_NOT_EFFECT_FREE');
  const preClick=await getTarget();requireProof(canonicalNameHash(preClick.profile.nombre)===beforeHash&&nameRepairInvariant(preClick.profile,preClick.member,preClick.user)===invariant,'PRE_CLICK_IDENTITY_DRIFT');
  proof.automaticReplay={idempotentReplay:true,applicationWritesThisAttempt:{auth:0,firestore:0},samePreviousReceipt:true};
  await page.evaluate(()=>window.CX.router.nav('hrsource'));
  await page.locator('#hsSync').waitFor({state:'visible',timeout:60000});
  const capture=await page.evaluate(pid=>{
   const c=window.CX.backendHrSourceBridge.captureSyncContext(pid),actor=window.CX.commandAdapter.currentActor();
   return {ok:c.ok,uid:c.uid,tenantId:c.tenantId,projectId:c.projectId,revision:c.revision,role:c.role,authNamespace:c.authNamespace,actor,endpoint:window.CX.commandHttpTransport.endpoint(),lastAt:window.CX.backendHrSourceBridge.last?.at||null};
  },r.projectId);
  requireProof(capture.ok===true&&capture.uid===actor.id&&capture.tenantId===r.tenantId&&capture.projectId===r.projectId&&capture.revision===r.hrRevision&&capture.authNamespace==='staff'&&['admin','super'].includes(capture.role),'ADMIN_CAPTURE_SCOPE');
  const endpoint=new URL(capture.endpoint,r.hostingUrl).href;requireProof(new URL(endpoint).protocol==='https:','COMMAND_ENDPOINT');
  const events=[],pending=[],errors=[];let armed=true;
  const onRequest=request=>{
   if(!armed||request.method()!=='POST'||request.url()!==endpoint)return;
   let command;try{command=request.postDataJSON();}catch(_){return;}
   if(command?.commandType!=='hr.snapshot.reconcile')return;
   if(command.source!=='hr-source-sync-request'){errors.push('UNEXPECTED_HR_COMMAND');return;}
   const entry={request,command,response:null};events.push(entry);
   const task=(async()=>{try{const response=await request.response();requireProof(response,'NATIVE_RESPONSE_MISSING');entry.response=await response.json();entry.httpStatus=response.status();}catch(_){entry.captureError='NATIVE_RESPONSE_UNAVAILABLE';}})();pending.push(task);
  };
  page.on('request',onRequest);
  proof.nativeClicks=1;await page.locator('#hsSync').click();
  await page.waitForFunction(({rev,lastAt})=>{const x=window.CX?.backendHrSourceBridge?.last;return x?.kind==='sync-request'&&x.payload?.sourceRevision===rev&&x.at!==lastAt&&typeof x.response?.ok==='boolean';},{rev:r.hrRevision,lastAt:capture.lastAt},{timeout:180000});
  armed=false;page.off('request',onRequest);await Promise.all(pending);
  requireProof(errors.length===0,'UNEXPECTED_HR_COMMAND');
  const final=validateNameRepairSequence(events,r,capture.actor);requireProof(!final.captureError,'NATIVE_RESPONSE_UNAVAILABLE');
  const command=final.command;proof.nativeCommandCount=events.length;proof.commandSha256=sha(command);proof.idempotencyKeySha256=sha(command.idempotencyKey);
  proof.commandAck=validateNameRepairAck(final.response,command,r,actor.id);
  const receiptPath='tenants/'+r.tenantId+'/commandReceipts/hr-'+sha(JSON.stringify([r.projectId,command.idempotencyKey])),durable=await readReceipt(db,receiptPath,r);
  validateNameRepairAck(durable.row.result,command,r,actor.id,{durable:true});
  requireProof(durable.journal.journalVerified&&durable.journal.receiptTerminalCommitted,'COMPLETE_JOURNAL');
  requireProof(proof.commandAck.canonicalFullNamesRestored>=1,'NAME_RESTORATION_NOT_RECORDED');
  requireProof(durable.journal.authWritesObserved===0,'UNEXPECTED_AUTH_WRITE');
  proof.journal=durable.journal;proof.receiptSealBeforeReplay=durable.seal;
  const replay=await page.evaluate(c=>window.CX.commandAdapter.execute(c),command);
  proof.replay=validateNameRepairAck(replay,command,r,actor.id,{replay:true});
  const durableAfter=await readReceipt(db,receiptPath,r);requireProof(durableAfter.seal===durable.seal&&durableAfter.updateTime===durable.updateTime,'REPLAY_DURABLE_MUTATION');
  proof.receiptSealAfterReplay=durableAfter.seal;
  await page.evaluate(async()=>{await window.CX.backend.refresh();});
  await page.waitForFunction(({rev,pid,uid})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&String(window.firebase?.auth?.().currentUser?.uid||'')===uid&&window.CX?.data?.currentProjectId===pid&&window.CX?.data?.previewMeta?.sourceRevision===rev&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{rev:r.hrRevision,pid:r.projectId,uid:actor.id},{timeout:150000});
  await adminContext.close();
  proof.visibleLoginAfter=await visibleLogin();
  const after=await getTarget();proof.afterNameSha256=canonicalNameHash(after.profile.nombre);proof.afterInvariantSha256=nameRepairInvariant(after.profile,after.member,after.user);
  requireProof(proof.afterNameSha256===r.expectedNameSha256,'NAME_NOT_RESTORED');
  requireProof(proof.afterInvariantSha256===invariant,'CREDENTIAL_OR_AUTHORITY_MUTATED');
  proof.independentHrAfter=await identity();
  proof.decision='PASS_VRM354_NATIVE_NAME_REPAIR_AND_VRM355_CURRENT_RECEIPT';proof.completedAt=new Date().toISOString();proof.futureNewKeyNeeded=false;proof.phaseAComplete=false;proof.b14Closed=false;save();return proof;
 }catch(error){
  const code=String(error?.message||'UNKNOWN').match(/(?:SOURCE|MAPPING|PROVIDER|PERSISTENCE|AUTH|RELEASE_COMPOSITION|ENVIRONMENT)_FAILURE:[A-Z0-9_]+/)?.[0]||'ENVIRONMENT_FAILURE:VRM354_LIVE_PROOF_INCOMPLETE';
  proof.failureCode=code;proof.completedAt=new Date().toISOString();proof.retryPolicy='READ_CAPTURED_NATIVE_RECEIPT_AND_REPLAY_SAME_KEY_ONLY_NO_FRESH_CLICK';save();throw Error(code);
 }finally{if(browser)await browser.close();}
}
