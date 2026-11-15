import crypto from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateTerminalHrObservation} from './cxorbia-i3-terminal-hr-observation.mjs';
import {inspectServingDevRevision,assertExactServingDigest} from './cxorbia-i3-vrm300-traffic.mjs';

const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined && typeof value[k] !== 'function').map(k => [k, stable(value[k])])) : value;
export const commandDigest = command => crypto.createHash('sha256').update(JSON.stringify(stable(command))).digest('hex');
export const sameDocument = isDeepStrictEqual;
export function requireProviderAck(ack, label) {
  if (!ack || !['ok','committed','providerAck','successUiAllowed'].every(k => ack[k] === true))
    throw new Error('PROVIDER_FAILURE:' + label + ':ACK_NOT_COMMITTED');
  return ack;
}
export function reservationLifecyclePassed(r) {
  return r?.operationKind === 'SYNTHETIC_PROVIDER_LIFECYCLE' && r.production === false &&
    ['created','createAck','statusAck','deleted','deleteAck','independentFirestoreReadback','reloadReadback',
      'absentAfterReload','idempotentReplay','cleanupVerified'].every(k => r[k] === true) && r.duplicateCount === 0;
}
export function requireExactCommandReceipt(receipt, command, actorUid) {
  if (!(receipt?.status === 'committed' && receipt.providerAck === true &&
    receipt.commandDigest === commandDigest(command) && receipt.commandType === command.commandType &&
    String(receipt.entityId) === String(command.entityId) && receipt.actorUid === actorUid))
    throw new Error('PERSISTENCE_FAILURE:FIXTURE_RECEIPT_MISMATCH');
}
export function fixturePlatformIdentityLinkId(tenantId,shopperId){
  const key='platform:'+tenantId+':'+shopperId;
  return 'irl_'+crypto.createHash('sha256').update(tenantId+'\0platform\0*\0'+key+'\0'+shopperId).digest('hex').slice(0,32);
}
export function fixtureApplicationId(command){
  return 'app-'+crypto.createHash('sha256').update(command.tenantId+'\0'+command.projectId+'\0'+command.payload.visitId+'\0'+
    command.payload.shopperId+'\0'+command.idempotencyKey).digest('hex').slice(0,24);
}
export async function dispatchTrackedFixtureCreation({journal,checkAbsence,register,persist,send}){
  if(await checkAbsence()!==true)throw new Error('PERSISTENCE_FAILURE:FIXTURE_CREATION_PREFLIGHT_COLLISION');
  journal.preflightAbsent=true;journal.submitted=false;register();await persist();
  journal.submitted=true;journal.outcome='AMBIGUOUS';await persist();
  try{const ack=await send();journal.ack=ack;return ack;}
  finally{await persist();}
}
export function requireFixtureCreationReceipt(journal,receipt){
  const c=journal?.command,kind=c?.commandType,identity=kind==='shopper.create'?receipt?.shopperId:receipt?.entityId;
  if(!['shopper.create','application.create'].includes(kind)||
    ![journal?.actorUid,journal?.entityId,c?.tenantId,c?.projectId,c?.periodId,c?.idempotencyKey].every(v=>typeof v==='string'&&v.trim())||
    journal.preflightAbsent!==true||journal.submitted!==true||!receipt||receipt.status!=='committed'||receipt.providerAck!==true||
    receipt.commandDigest!==commandDigest(journal.command)||receipt.commandType!==journal.command.commandType||
    receipt.actorUid!==journal.actorUid||identity!==journal.entityId)
    throw new Error('PERSISTENCE_FAILURE:FIXTURE_CREATION_UNRESOLVED_OR_FOREIGN');
  return true;
}
export function fixtureAuthSnapshot(user){
  return {uid:user.uid,email:user.email,disabled:user.disabled,displayName:user.displayName,
    customClaims:user.customClaims,creationTime:user.metadata?.creationTime,phoneNumber:user.phoneNumber||null,
    emailVerified:user.emailVerified===true,tenantId:user.tenantId||null,tokensValidAfterTime:user.tokensValidAfterTime||null,
    providerData:JSON.parse(JSON.stringify(user.providerData||[])),multiFactor:JSON.parse(JSON.stringify(user.multiFactor||null))};
}
export function requireFixtureShopperOwnership(j,docs,user){
  const f=j.fixture,{profile:p,membership:m,crosswalk:c,link:l}=docs;
  const key='platform:'+j.command.tenantId+':'+j.entityId;
  const fingerprint=crypto.createHash('sha256').update('cxorbia-provider-uid-v1\0'+f.uid).digest('hex');
  const projects=v=>isDeepStrictEqual(v,[j.command.projectId]);
  const scope=v=>v?.tenantId===j.command.tenantId&&v.shopperId===j.entityId&&projects(v.projectIds);
  const claims={authNamespace:'shopper',projectIds:[j.command.projectId],role:'shopper',shopperId:j.entityId,tenantId:j.command.tenantId};
  const ok=scope(p)&&p.id===j.entityId&&p.sourceType==='platform'&&p.sourceIdentityKey===key&&p.createdVia==='live-fixture'&&p.hrSourceRevision===null&&
    p.nombre===f.profile.nombre&&p.visibleLogin===f.visibleLogin&&(p.pais||p.country)===f.profile.pais&&
    (p.whatsapp||p.phone)===f.profile.whatsapp&&String(p.email||'')===String(f.profile.email||'')&&
    scope(m)&&m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&m.providerUidFingerprint===fingerprint&&m.visibleLogin===f.visibleLogin&&
    scope(c)&&c.authNamespace==='shopper'&&c.providerUidFingerprint===fingerprint&&c.sourceStableKey===j.entityId&&
    c.sourceType==='platform'&&c.identityMode==='stable_platform_shopper_id'&&c.fuzzyMatching===false&&
    l?.tenantId===j.command.tenantId&&l.identityLinkId===f.identityLinkId&&l.canonicalShopperId===j.entityId&&
    l.sourceSystem==='platform'&&l.projectScope==='*'&&l.sourceIdentityKey===key&&l.status==='active'&&
    isDeepStrictEqual(l.sourceAliases,[key,j.entityId])&&l.authorityType==='platform_created'&&
    l.authorityRef===j.receiptId&&l.periodIndependent===true&&l.providerAck===true&&l.providerUidFingerprint===fingerprint&&
    user?.uid===f.uid&&user.email===f.internalEmail&&user.disabled===false&&isDeepStrictEqual(user.customClaims,claims);
  if(!ok)throw new Error('PERSISTENCE_FAILURE:FIXTURE_SHOPPER_OWNERSHIP_CONFLICT');
  return true;
}
export function requireFixtureApplicationOwnership(j,a){
  const c=j.command,p=c.payload;
  if(!(a?.id===j.entityId&&a.applicationId===j.entityId&&a.postulationId===j.entityId&&a.tenantId===c.tenantId&&
    a.projectId===c.projectId&&a.periodId===c.periodId&&a.visitId===p.visitId&&a.visitaId===p.visitId&&
    a.shopperId===p.shopperId&&a.hrRowId===p.hrRowId&&a.fechaProp===p.proposedDate&&a.note===p.note&&a.source==='platform'&&
    a.status==='pendiente'&&a.estado==='pendiente'&&a.version===1))
    throw new Error('PERSISTENCE_FAILURE:FIXTURE_APPLICATION_OWNERSHIP_CONFLICT');
  return true;
}
export function fixtureProposedDate(visit,project,now=new Date()){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:project.timeZone||project.timezone||'America/Guatemala',
    year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`;
  const start=String(visit.disponibleDesde||visit.measurementWindowStart||visit.availableFromRaw||'').slice(0,10);
  const end=String(visit.disponibleHasta||visit.measurementWindowEnd||visit.availableUntilRaw||'').slice(0,10);
  const valid=s=>/^20\d{2}-[01]\d-[0-3]\d$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
  if(!valid(start)||!valid(end)||start>end)return null;
  const proposed=start>today?start:today;
  return proposed<=end?proposed:null;
}
export async function deleteOwnedFixtureDocuments(db,{referenceQueries,ownedPaths,removals}){
  return db.runTransaction(async tx=>{
    for(const {query,label} of referenceQueries){
      const references=await tx.get(query);
      if(references.docs.some(d=>!ownedPaths.has(d.ref.path)))
        throw new Error('PERSISTENCE_FAILURE:CLEANUP_BLOCKED_COMMERCIAL_REFERENCE:'+label);
    }
    for(const snapshot of removals){
      const current=await tx.get(snapshot.ref);
      if(!current.exists||!current.updateTime.isEqual(snapshot.updateTime)||!sameDocument(current.data(),snapshot.data()))
        throw new Error('PERSISTENCE_FAILURE:FIXTURE_CLEANUP_CONCURRENT_DOCUMENT');
    }
    // All reference queries and owned reads precede writes in this same transaction.
    for(const snapshot of removals)tx.delete(snapshot.ref,{lastUpdateTime:snapshot.updateTime});
    return {deleted:removals.length,referenceQueriesChecked:referenceQueries.length};
  });
}
const sameTime = (a, b) => !!a && !!b && typeof a.isEqual === 'function' && a.isEqual(b);

// This journal is registered before the POST. Never overwrite another operator's write.
export async function restoreAssignment(db, journal) {
  if (journal.restored === true) return journal.result;
  const {ref, receiptRef, beforeData, beforeUpdateTime, command, actorUid} = journal;
  const result = await db.runTransaction(async tx => {
    const [visit, receipt] = await Promise.all([tx.get(ref), tx.get(receiptRef)]);
    if (!visit.exists) throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_VISIT_MISSING');
    const current = visit.data();
    if (sameDocument(current, beforeData)) {
      // A timed-out request can still commit: absence alone is not proof of no write.
      if (journal.submitted && !receipt.exists && journal.outcome !== 'BLOCKED_NO_WRITES')
        throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_AMBIGUOUS_REQUEST');
      if (receipt.exists) requireExactCommandReceipt(receipt.data(), command, actorUid);
      else if (!sameTime(visit.updateTime, beforeUpdateTime))
        throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_CONCURRENT_WRITE');
      return {ok:true, restored:true, writes:0, alreadyRestored:true};
    }
    if (!receipt.exists) throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_RECEIPT_MISSING');
    requireExactCommandReceipt(receipt.data(), command, actorUid);
    if (!sameTime(visit.updateTime, receipt.updateTime))
      throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_CONCURRENT_WRITE');
    const expected = {...beforeData, shopperId:command.payload.shopperId, estado:'asignada', status:'asignada',
      assignmentSource:'platform', assignmentSyncStatus:'pending_hr', hrRowId:command.payload.hrRowId || beforeData.hrRowId || null,
      periodId:command.periodId, lastSyncedAt:null, updatedAt:current.updatedAt, version:Number(beforeData.version || 0)+1};
    if (!current.updatedAt || !Number.isFinite(Date.parse(current.updatedAt)) || !sameDocument(current, expected))
      throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_POSTIMAGE_CONFLICT');
    tx.set(ref, beforeData, {merge:false});
    return {ok:true, restored:true, writes:1, alreadyRestored:false};
  });
  const readback = await ref.get();
  if (!readback.exists || !sameDocument(readback.data(), beforeData))
    throw new Error('PERSISTENCE_FAILURE:ASSIGNMENT_RESTORE_READBACK_CONFLICT');
  journal.restored = true;
  journal.result = {...result, exactReadback:true};
  return journal.result;
}

// Functional prerequisites are evidence for this run, never a release manifest.
export const FIXTURE_INPUT_FILES=Object.freeze({
  preterminal:'current-preterminal-result.json',human:'full-human-acceptance/human-live-acceptance.json',
  probes:'full-human-acceptance/i3-functional-probes.json',focal:'semantic/browser-focal.json',
  oracle:'semantic/hr-contrast.json',hr:'hr-current-live.json',hrMeta:'hr-current-live-meta.json',
  hrStability:'hr-stability-proof.json',runtimeService:'runtime-current.json',runtime:'runtime-revision.json',
  hosting:'hosting-live-channel.json',rules:'firestore-live-parity.json',sourceQa:'source-qa/source-qa-receipt.json'
});
export const FIXTURE_TEST_IDS=Object.freeze(['1_SHOPPER_GT','2_SHOPPER_HN','3_NOMBRE_TILDE','4_NOMBRE_COMPUESTO',
  '5_PERFIL_ADMIN','6_HISTORICO_KPIS','7_DISPONIBILIDAD_ASIGNACION','8_POSTULACION','9_RESERVA','10_CLIENTE']);
const HASH=/^[0-9a-f]{64}$/,SHA=/^[0-9a-f]{40}$/;
export const fixtureFileHash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const bindingFail=code=>{throw new Error('RELEASE_COMPOSITION_FAILURE:FIXTURE_BINDING_'+code);};
const requireBinding=(ok,code)=>{if(!ok)bindingFail(code);};
export const fixtureExpected=env=>({sourceSha:env.I3_CERTIFICATION_SOURCE_SHA,sourceTree:env.I3_CERTIFICATION_SOURCE_TREE,
  controlHeadSha:env.GITHUB_SHA,runId:String(env.GITHUB_RUN_ID||''),runAttempt:String(env.GITHUB_RUN_ATTEMPT||''),
  firebaseProject:env.PROJECT,hostingUrl:String(env.HOSTING_URL||'').replace(/\/$/,''),tenantId:env.TENANT_ID,
  projectId:env.PROJECT_ID,periodId:env.PERIOD_ID,artifactSha256:env.ARTIFACT_SHA256,
  runtimeRevision:env.DEV_REVISION||env.EXPECTED_RUNTIME_REVISION,runtimeDigest:env.RUNTIME_DIGEST||env.EXPECTED_RUNTIME_DIGEST,
  hostingVersion:env.HOSTING_VERSION_NAME||env.EXPECTED_HOSTING_VERSION,hrRevision:env.CURRENT_LIVE_HR_REVISION});
export function validateFixturePrerequisites(b,{expected,readBytes,artifactBytes}={}){
  requireBinding(b?.schemaVersion==='cxorbia.i3.live-fixture-prerequisites.v1'&&b.proofStage==='PRE_CERTIFICATION'&&
    b.certified===false&&b.phaseAComplete===false&&b.gate20==='HOLD'&&b.gate21==='HOLD'&&b.production===false,'SCOPE');
  for(const key of ['sourceSha','sourceTree','controlHeadSha'])requireBinding(SHA.test(b[key]||''),'FORMAT_'+key);
  requireBinding(/^\d+$/.test(b.runId||'')&&Number(b.runId)>0&&/^\d+$/.test(b.runAttempt||'')&&Number(b.runAttempt)>0,'RUN_FORMAT');
  requireBinding(HASH.test(b.artifactSha256||'')&&HASH.test(b.hrRevision||'')&&/^sha256:[0-9a-f]{64}$/.test(b.runtimeDigest||''),'HASH_FORMAT');
  requireBinding(b.firebaseProject==='cxorbia-backend-dev'&&b.hostingUrl==='https://cxorbia-backend-dev.web.app'&&
    b.tenantId&&b.projectId&&b.periodId&&b.runtimeRevision&&b.hostingVersion,'DEV_SCOPE');
  for(const key of ['sourceSha','sourceTree','controlHeadSha','runId','runAttempt','firebaseProject','hostingUrl','tenantId',
    'projectId','periodId','artifactSha256','runtimeRevision','runtimeDigest','hostingVersion','hrRevision'])
    requireBinding(b[key]===expected?.[key],'EXPECTED_'+key);
  requireBinding(b.artifactFile==='cxorbia-i3-certified-source.tar'&&fixtureFileHash(artifactBytes)===b.artifactSha256,'ARTIFACT_BYTES');
  requireBinding(Object.keys(b.evidence||{}).length===Object.keys(FIXTURE_INPUT_FILES).length,'EVIDENCE_COUNT');
  const data={};
  for(const [key,file] of Object.entries(FIXTURE_INPUT_FILES)){
    const e=b.evidence?.[key];requireBinding(e?.path===file&&HASH.test(e?.sha256||''),'EVIDENCE_PATH_'+key);
    const raw=readBytes(file);requireBinding(fixtureFileHash(raw)===e.sha256,'EVIDENCE_HASH_'+key);
    data[key]=JSON.parse(raw);
  }
  const q=data.preterminal;
  requireBinding(q.decision==='PASS_C3_PRETERMINAL_SOURCE_READY_EXACT_DEV'&&q.sourceSha===b.sourceSha&&q.sourceTree===b.sourceTree&&
    q.sourceReadyModules===21&&q.moduleCount===21&&q.pendingFiles===0&&q.production===false&&q.allApprovedOwnersLoaded===true&&
    q.runtimeRevision===b.runtimeRevision&&q.runtimeDigest===b.runtimeDigest&&q.hostingVersion===b.hostingVersion,'PRETERMINAL');
  const qa=data.sourceQa;
  requireBinding(qa.decision==='PASS_I3_SAME_RUN_PATH_BOUND_SOURCE_QA'&&qa.sourceSha===b.sourceSha&&qa.sourceTree===b.sourceTree&&
    qa.controlSha===b.controlHeadSha&&String(qa.runId)===b.runId&&String(qa.runAttempt)===b.runAttempt&&qa.production===false&&
    q.sameRunSourceQa?.receiptSha256===b.evidence.sourceQa.sha256,'SOURCE_QA');
  const h=data.human,p=data.probes,f=data.focal,o=data.oracle;
  requireBinding(h.decision==='PASS_I3_HUMAN_LIVE_ACCEPTANCE'&&h.sourceSha===b.sourceSha&&h.sourceRevision===b.hrRevision&&
    h.routeInventory?.expectedRoleRouteEntries===56&&h.production===false&&!h.issues?.length&&!h.pageErrors?.length,'HUMAN');
  requireBinding(p.decision==='PASS_I3_ATOMIC_FUNCTIONAL_PROBES'&&p.sourceSha===b.sourceSha&&p.sourceRevision===b.hrRevision&&p.production===false,'PROBES');
  requireBinding(f.decision==='PASS_PRE_I4_FOCAL_HUMAN_BROWSER'&&f.sourceSha===b.sourceSha&&f.hrRevision===b.hrRevision&&
    f.periodId===b.periodId&&f.production===false,'FOCAL');
  requireBinding(o.decision==='PASS_C3_TERMINAL_HR_SEMANTIC_ORACLE'&&o.sourceRevision===b.hrRevision&&o.currentPeriodId===b.periodId&&
    o.projectId===b.projectId&&o.production===false,'ORACLE_PERIOD');
  const snapshot=data.hr.snapshot||data.hr.data||data.hr;
  requireBinding((snapshot._runtime?.revision||snapshot.sourceRevision)===b.hrRevision,'HR_REVISION');
  validateFixtureHrObservation(data.hrMeta,b.hrRevision);
  requireBinding(data.hrStability.decision==='PASS_TERMINAL_HR_STABLE_REVISION'&&data.hrStability.revision===b.hrRevision&&
    data.hrStability.reconciliationCertified===false&&data.hrStability.production===false,'HR_STABILITY');
  validateFixtureDevIdentity(b,{service:data.runtimeService,revision:data.runtime,hosting:data.hosting});
  requireBinding(data.rules.decision==='PASS_TERMINAL_FIRESTORE_RULES_EXACT'&&data.rules.production===false&&
    data.rules.sha256===q.firestoreRulesSha256,'RULES');
  return data;
}
export function validateFixtureHrObservation(meta,revision){
  const r=validateTerminalHrObservation(meta);
  requireBinding(meta.revisionStable===true&&r.revision===revision,'HR_STABLE_REVISION');
  return r;
}
export function validateFixtureDevIdentity(b,{service,revision,hosting}){
  const serving=inspectServingDevRevision(service);
  requireBinding(serving.ok&&serving.ready===b.runtimeRevision&&revision?.metadata?.name===b.runtimeRevision,'RUNTIME_REVISION_TRAFFIC');
  assertExactServingDigest(revision,b.runtimeDigest);
  requireBinding(hosting?.release?.version?.name===b.hostingVersion,'HOSTING_VERSION');
}
export function readFixturePrerequisites(root,expected){
  const raw=fs.readFileSync(path.join(root,'live-fixture-prerequisites.json'));
  const binding=JSON.parse(raw),readBytes=file=>fs.readFileSync(path.join(root,file));
  const data=validateFixturePrerequisites(binding,{expected,readBytes,artifactBytes:readBytes('cxorbia-i3-certified-source.tar')});
  return {binding,data,sha256:fixtureFileHash(raw)};
}
export function validatePrecertificationFixtureReceipt(live,{binding,bindingHash,readFinalBytes}={}){
  requireBinding(live?.decision==='PASS_I3_LIVE_FIXTURES_V2'&&live.proofStage==='PRE_CERTIFICATION'&&live.certifiedAtExecution===false&&
    live.phaseAComplete===false&&live.production===false&&live.cleanup?.ok===true&&live.cleanup?.creationJournalsResolved===true&&live.cleanupError==null&&
    live.buildCountThisRun===0&&live.deployCountThisRun===0&&live.hrWrites===0&&live.prerequisitesSha256===bindingHash,'LIVE_RESULT');
  for(const key of ['sourceSha','sourceTree','artifactSha256','runtimeRevision','runtimeDigest','hostingVersion','runId','runAttempt','controlHeadSha'])
    requireBinding(live[key]===binding[key],'LIVE_'+key);
  requireBinding(live.hrRevision===binding.hrRevision&&live.finalHrRevision===binding.hrRevision&&live.finalDevIdentityVerified===true,'LIVE_FINAL_IDENTITY');
  requireBinding(typeof readFinalBytes==='function'&&Object.keys(live.finalEvidence||{}).length===5,'FINAL_EVIDENCE_REQUIRED');
  const final={};
  for(const key of ['service','revision','hosting','hr','meta']){
    const file='final-'+key+'.json',entry=live.finalEvidence[key];
    requireBinding(entry?.path===file&&HASH.test(entry?.sha256||''),'FINAL_EVIDENCE_PATH_'+key);
    const raw=readFinalBytes(file);requireBinding(fixtureFileHash(raw)===entry.sha256,'FINAL_EVIDENCE_HASH_'+key);
    final[key]=JSON.parse(raw);
  }
  validateFixtureDevIdentity(binding,final);validateFixtureHrObservation(final.meta,binding.hrRevision);
  const hr=final.hr.snapshot||final.hr.data||final.hr;
  requireBinding((hr._runtime?.revision||hr.sourceRevision)===binding.hrRevision,'FINAL_HR_SNAPSHOT');
  requireBinding(Array.isArray(live.tests)&&live.tests.length===10&&new Set(live.tests.map(x=>x.id)).size===10&&
    FIXTURE_TEST_IDS.every(id=>live.tests.some(x=>x.id===id&&x.ok===true)),'TEN_TESTS');
  return {decision:'PASS_I3_PRECERTIFICATION_FIXTURE_EVIDENCE',certified:false,writes:0,production:false};
}
export function validateSealedFixtureReceipt(manifest,live,{binding,bindingHash,liveHash,artifactHash,readFinalBytes}={}){
  requireBinding(manifest?.decision==='PASS_I3_ONE_ARTIFACT_READY_FOR_GATE21'&&manifest.production===false&&manifest.buildCount===1&&
    manifest.artifactPackCount===1&&manifest.rebuildAfterCertification===false&&manifest.moduleTruth?.phaseAComplete===true&&
    manifest.moduleTruth?.allModulesMatch===true,'FINAL_CERTIFICATE');
  requireBinding(manifest.liveFixtures?.evidenceSha256===liveHash&&manifest.liveFixtures?.prerequisitesSha256===bindingHash&&
    manifest.artifactSha256===artifactHash&&binding.artifactSha256===artifactHash,'SEALED_HASH');
  validatePrecertificationFixtureReceipt(live,{binding,bindingHash,readFinalBytes});
  requireBinding(manifest.i3CertificationSourceSha===binding.sourceSha&&manifest.i3CertificationSourceTree===binding.sourceTree&&
    manifest.controlHeadSha===binding.controlHeadSha&&String(manifest.runId)===binding.runId&&String(manifest.runAttempt)===binding.runAttempt&&
    manifest.devRuntimeRevision===binding.runtimeRevision&&manifest.runtimeImageDigest===binding.runtimeDigest&&
    manifest.hostingVersionName===binding.hostingVersion&&manifest.certificationHrRevision===binding.hrRevision,'MANIFEST_IDENTITY');
  return {decision:'PASS_I3_SEALED_FIXTURE_RECEIPT',writes:0,production:false};
}
function runFixtureBindingCli(){
  const [mode,root,out]=process.argv.slice(2),expected=fixtureExpected(process.env);
  if(mode==='prepare'){
    const readBytes=file=>fs.readFileSync(path.join(root,file));
    const binding={schemaVersion:'cxorbia.i3.live-fixture-prerequisites.v1',proofStage:'PRE_CERTIFICATION',certified:false,
      phaseAComplete:false,gate20:'HOLD',gate21:'HOLD',production:false,...expected,artifactFile:'cxorbia-i3-certified-source.tar',
      evidence:Object.fromEntries(Object.entries(FIXTURE_INPUT_FILES).map(([key,file])=>[key,{path:file,sha256:fixtureFileHash(readBytes(file))}]))};
    validateFixturePrerequisites(binding,{expected,readBytes,artifactBytes:readBytes(binding.artifactFile)});
    fs.writeFileSync(path.join(root,'live-fixture-prerequisites.json'),JSON.stringify(binding,null,2)+'\n');
    console.log('PASS_I3_FIXTURE_PREREQUISITES_NOT_CERTIFICATION');return;
  }
  if(mode==='verify-sealed'){
    const manifest=JSON.parse(fs.readFileSync(path.join(root,'i3-certification-manifest.json')));
    const rawBinding=fs.readFileSync(path.join(root,'live-fixture-prerequisites.json')),binding=JSON.parse(rawBinding);
    // All identity values come from the same-run sealed certificate and its exact binding.
    const actual={...binding,sourceSha:expected.sourceSha,sourceTree:expected.sourceTree,controlHeadSha:expected.controlHeadSha,
      runId:expected.runId,runAttempt:expected.runAttempt};
    const checked=readFixturePrerequisites(root,actual);
    const rawLive=fs.readFileSync(path.join(root,'live-fixtures/i3-live-fixtures-result.json'));
    const live=JSON.parse(rawLive),result=validateSealedFixtureReceipt(manifest,live,{binding:checked.binding,
      bindingHash:checked.sha256,liveHash:fixtureFileHash(rawLive),artifactHash:fixtureFileHash(fs.readFileSync(path.join(root,binding.artifactFile))),
      readFinalBytes:file=>fs.readFileSync(path.join(root,'live-fixtures',file))});
    fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'i3-live-fixtures-result.json'),rawLive);
    fs.writeFileSync(path.join(out,'sealed-fixture-readback.json'),JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result));return;
  }
  if(mode==='verify-live'){
    const checked=readFixturePrerequisites(root,expected),live=JSON.parse(fs.readFileSync(path.join(root,'live-fixtures/i3-live-fixtures-result.json')));
    console.log(JSON.stringify(validatePrecertificationFixtureReceipt(live,{binding:checked.binding,bindingHash:checked.sha256,
      readFinalBytes:file=>fs.readFileSync(path.join(root,'live-fixtures',file))})));return;
  }
  bindingFail('UNKNOWN_CLI_MODE');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))runFixtureBindingCli();
