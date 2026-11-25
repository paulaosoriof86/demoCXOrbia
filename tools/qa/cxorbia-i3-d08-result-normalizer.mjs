// Pure normalizer for exact, verified D08 producer evidence; no product actions.
// Caller pins transport/request/contracts/sourceAssets to the producer run before
// invoking this pure function. It performs no I/O and never promotes a domain.
import crypto from 'node:crypto';

export const D08_RECEIPT_SCHEMA = 'cxorbia.i3.d08-academy-owner-obligations.v1';
const RAW_SCHEMA = 'cxorbia.i3.d08-ui-provider-new-session.v1';
const PASS = 'PASS_I3_D08_UI_PROVIDER_NEW_SESSION_EDIT_NEGATIVES_CLEANUP';
const OWNER = 'app/modules/academia.js';
const ROLES = ['admin', 'shopper', 'cliente'];
export const D08_ASSET_PATHS = [OWNER, 'app/core/manuales-data.js', 'app/core/backend-browser-auth.js',
  'app/adapters/cxorbia-command-adapter-v1.js', 'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js'];
const ASSETS = D08_ASSET_PATHS;
const SHA = /^[a-f0-9]{40}$/, HASH = /^[a-f0-9]{64}$/;
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(stable(value))).digest('hex');
const equal = (a, b) => hash(a) === hash(b);
const need = (ok, code) => { if (!ok) throw Error('MAPPING_FAILURE:D08_NORMALIZATION_' + code); };
const one = (list, predicate, code) => { const rows = list.filter(predicate); need(rows.length === 1, code); return rows[0]; };
const unique = values => new Set(values).size === values.length;

export const D08_OBLIGATION_IDS = [
  ...ROLES.flatMap(role => ['course', 'lesson', 'evaluation', 'resource', 'progress', 'new_session_replay'].map(key => `D08.${role}.${key}`)),
  'D08.admin.edit', 'D08.shopper.edit_denied', 'D08.cliente.edit_denied',
  'D08.stale_version_denied', 'D08.other_learner_isolated', 'D08.wrong_audience_denied', 'D08.cleanup'
];

// `authority` must be loaded from a frozen control contract, never from receipt.
// It is a scoped inventory, NOT terminalRequiredObligationIds for the domain.
export function permitsD08PeriodlessScope(receipt, authority) {
  const ids = receipt?.contractCoverage?.obligations?.map(x => x.id) || [];
  return !!authority && authority.taskId === 'D08' && authority.periodRequired === false &&
    HASH.test(String(authority.sha256 || '')) && receipt?.schemaVersion === D08_RECEIPT_SCHEMA &&
    receipt.moduleDomain === 'certifications' && receipt.hrIndependent === true &&
    receipt.scope?.periodId === null && receipt.scope?.kind === 'D08_ACADEMY_TENANT_COURSE' &&
    receipt.contractAuthority?.taskId === 'D08' && equal(authority.obligationIds, D08_OBLIGATION_IDS) &&
    receipt.contractAuthority?.scopeContractSha256 === authority.sha256 &&
    receipt.operationKind === 'PROVIDER_WRITE' && receipt.contractCoverage?.fullDomain === false &&
    equal(receipt.ownerPaths, [OWNER]) && ids.length > 0 &&
    ids.every(id => D08_OBLIGATION_IDS.includes(id));
}

export function normalizeD08Result({ resultText, transport, request, baseContractText,
  moduleContract, scopeAuthority, sourceAssets }) {
  need(typeof resultText === 'string', 'RESULT_BYTES');
  need(typeof baseContractText === 'string', 'BASE_CONTRACT_BYTES');
  const raw = JSON.parse(resultText), rawHash = hash(resultText), baseContract = JSON.parse(baseContractText), baseHash = hash(baseContractText);
  need(raw.schemaVersion === RAW_SCHEMA && raw.decision === PASS && raw.functionalPass === true, 'RESULT_NOT_PASS');
  need(raw.production === false && raw.fullDomain === false && raw.phaseAComplete === false && raw.hrIndependent === true && raw.periodId === null, 'RESULT_SCOPE');
  need(!raw.error && !raw.postflightError && !raw.interceptionError && raw.productionIndexUnchanged === true, 'RESULT_FAILURE');
  need(transport && String(raw.runId) === String(transport.runId) && String(raw.runAttempt) === String(transport.runAttempt), 'RUN_ATTEMPT');
  const google=transport.provider==='GOOGLE_CLOUD_SHELL';
  if(google){
    const match=/^gs:\/\/cxorbia-backend-dev_cloudbuild\/cxorbia-i3-qa\/([a-f0-9-]{36})\/start\.json#([1-9]\d{7,19})$/.exec(transport.startUri);
    const base=match&&transport.startUri.split('/start.json#')[0];
    need(match&&match[2]===transport.startGeneration&&match[2]===raw.runId&&
      transport.resultUri===base+'/result.json#'+transport.resultGeneration&&/^[1-9]\d{7,19}$/.test(transport.resultGeneration)&&
      transport.archiveUri?.startsWith(base+'/evidence.zip#')&&/^[1-9]\d{7,19}$/.test(transport.archiveUri.split('#')[1])&&
      transport.resultRef===transport.archiveUri&&transport.archiveVerified===true&&HASH.test(transport.archiveSha256)&&
      HASH.test(transport.bundleSha256)&&HASH.test(transport.startSha256)&&transport.resultSha256===rawHash&&
      SHA.test(transport.transportSha)&&SHA.test(transport.controlHead)&&raw.controlSha===transport.controlHead&&
      raw.externalExecution?.startUri===transport.startUri&&raw.externalExecution?.transportSha===transport.transportSha&&
      raw.priorAbsence?.status==='VERIFIED_ABSENT'&&raw.priorAbsence?.writes===0&&
      transport.jobId===undefined&&transport.artifactId===undefined,'GOOGLE_TRANSPORT_IDENTITY');
  }else{
    need(!raw.externalExecution&&/^\d+$/.test(String(transport.jobId))&&/^\d+$/.test(String(transport.artifactId))&&SHA.test(transport.controlHead),'TRANSPORT_IDENTITY');
    need(/^sha256:[a-f0-9]{64}$/.test(transport.artifactDigest)&&transport.verifiedArchiveDigest===transport.artifactDigest,'ARCHIVE_DIGEST');
  }
  need(transport.jobName === 'i3-run2382-academy-b7-isolated-dev-qa' && transport.jobConclusion === 'success', 'PRODUCER_JOB');
  need(transport.resultRef && (!transport.resultSha256 || transport.resultSha256 === rawHash), 'RESULT_HASH');
  need(request?.schemaVersion === 'cxorbia.i3.d08-ui-qa-request.v1' && request.authorization === 'PAULA_AUTHORIZED_D08_DEV_ONLY' && request.production === false && request.hrIndependent === true, 'REQUEST_AUTHORITY');
  const identityKeys = ['sourceSha', 'sourceTree', 'runtimeRevision', 'runtimeDigest', 'hostingVersion'];
  need(SHA.test(raw.sourceSha) && SHA.test(raw.sourceTree) && identityKeys.every(k => raw[k] && raw[k] === request[k]), 'REQUEST_IDENTITY');
  need(raw.tenantId && raw.projectId && raw.tenantId === request.tenantId && raw.projectId === request.projectId, 'REQUEST_SCOPE');
  need(typeof moduleContract === 'string' && moduleContract.length > 0, 'MODULE_CONTRACT');
  need(scopeAuthority?.taskId === 'D08' && scopeAuthority.periodRequired === false && HASH.test(String(scopeAuthority.sha256 || '')), 'SCOPE_AUTHORITY');
  need(scopeAuthority.baseContractSha256 === baseHash && equal(scopeAuthority.obligationIds, D08_OBLIGATION_IDS), 'FROZEN_SCOPE_INVENTORY');
  need(baseContract?.schemaVersion === 'cxorbia.academy-base-progress-contract.v1' && Array.isArray(baseContract.courses), 'COURSE_CONTRACT');
  need(['hrWrites', 'realLearnerWrites', 'realCourseWrites', 'realVisitsWritten', 'paymentWrites', 'emailCalls', 'calendarCalls', 'productionDeploys'].every(k => raw.safety?.[k] === 0), 'UNAUTHORIZED_EFFECT');
  need(raw.cleanup?.ok === true && raw.cleanup.exactKnownPathsOnly === true && raw.cleanup.ownershipTransaction === true && raw.cleanup.remainingOwnedDocuments === 0 && raw.cleanup.remainingOwnedAuth === 0, 'CLEANUP');
  need(Array.isArray(raw.awaitJournal) && !raw.awaitJournal.some(x => ['TIMED_OUT', 'WAITING'].includes(x.state)), 'UNSETTLED_AWAIT');
  need(Array.isArray(raw.requestJournal) && raw.requestJournal.length > 0 && unique(raw.requestJournal.map(x => x.sequence)), 'REQUEST_JOURNAL');
  need(raw.requestJournal.every(x => x.dispatched === true && x.responseParsed === true && x.closed === true && Number.isInteger(x.httpStatus)), 'UNSETTLED_REQUEST');
  for (const stage of ['before', 'after']) {
    const serving = raw.serving?.[stage];
    need(serving?.exact === true && identityKeys.every(k => serving[k] === raw[k]), 'SERVING_' + stage);
    for (const asset of ASSETS) {
      const p = serving.assets?.[asset], expected = sourceAssets?.[asset];
      need(expected && SHA.test(expected.gitBlob) && HASH.test(expected.sourceSha256) && p?.byteParity === true &&
        p.gitBlob === expected.gitBlob && p.sourceSha256 === expected.sourceSha256 && p.servedSha256 === expected.sourceSha256,
      'ASSET_' + stage + ':' + asset);
    }
  }
  need(Array.isArray(raw.identities) && raw.identities.length === 4 && unique(raw.identities.map(x => x.uid)), 'IDENTITIES');
  const tag = `qa_d08_${raw.runId}_${raw.runAttempt}`, tenantPrefix = `tenants/${raw.tenantId}`;
  const byRole = {}, actors = new Map();
  for (const label of [...ROLES, 'other']) {
    const actor = one(raw.identities, x => x.label === label, 'ACTOR_' + label), role = label === 'other' ? 'shopper' : label;
    need(actor.uid === `${tag}_${label}` && actor.role === role && actor.observer === (label === 'other') && actor.state === 'CREATED_VERIFIED', 'ACTOR_SCOPE_' + label);
    need(actor.namespace === (role === 'shopper' ? 'shopper' : 'staff') && actor.authIdentity?.uid === actor.uid && actor.authIdentity.disabled === false, 'ACTOR_AUTH_' + label);
    need(actor.memberPath === `${tenantPrefix}/users/${actor.uid}` && actor.memberCreateDispatched === true, 'MEMBERSHIP_PATH_' + label);
    for (const claims of [actor.expectedClaims, actor.expectedMembership]) need(claims?.tenantId === raw.tenantId && claims.role === role && claims.authNamespace === actor.namespace &&
      claims.qaSynthetic === true && claims.qaRunId === raw.runId && claims.qaRunAttempt === raw.runAttempt && claims.qaPurpose === 'D08' &&
      Array.isArray(claims.projectIds) && claims.projectIds.includes(raw.projectId), 'CLAIMS_' + label);
    need(actor.expectedMembership.uid === actor.uid && actor.expectedMembership.active === true && actor.expectedMembership.status === 'active', 'MEMBERSHIP_' + label);
    if (role === 'shopper') need(actor.profilePath === `${tenantPrefix}/shoppers/${actor.uid}` && actor.profileCreateDispatched === true && actor.expectedProfile?.shopperId === actor.uid, 'SHOPPER_PROFILE_' + label);
    actors.set(actor.uid, actor); if (label !== 'other') byRole[role] = actor;
  }
  const observer = one(raw.identities, x => x.observer === true, 'OBSERVER');
  need(Array.isArray(raw.sessionDiagnostics) && raw.sessionDiagnostics.length === ROLES.length * 2 + 2 && unique(raw.sessionDiagnostics.map(x => x.label)), 'SESSIONS');
  function session(label, actor) {
    const s = one(raw.sessionDiagnostics, x => x.label === label, 'SESSION_' + label), a = s.observed;
    need(s.stage === 'READY' && s.initialStorageEmpty === true && s.role === actor.role && a?.authenticated === true && a.role === actor.role &&
      a.namespace === actor.namespace && a.tenantId === raw.tenantId && a.projectId === raw.projectId && a.boundaryActorId, 'AUTH_' + label);
    if (actor.role === 'shopper') need(a.shopperReady === true && a.shopperCountry === String(request.country).trim().toUpperCase() && a.ownVisits === 0, 'SHOPPER_AUTH_' + label);
    return s;
  }
  for (const role of ROLES) { session(role, byRole[role]); session(role + '-new-session', byRole[role]); }
  session('admin-edit-new-session', byRole.admin); session('other-shopper', observer);
  need(Array.isArray(raw.creationJournal) && unique(raw.creationJournal.map(x => x.receiptPath)), 'CREATION_JOURNAL');
  const records = raw.creationJournal;
  for (const r of records) {
    const actor = actors.get(r.uid), c = r.command, p = c?.payload;
    need(actor && r.role === actor.role && c && p && ['write', 'negative'].includes(r.mode), 'RECORD_ACTOR');
    need(c.tenantId === raw.tenantId && c.projectId === raw.projectId && c.actor?.role === actor.role && typeof c.idempotencyKey === 'string' && c.idempotencyKey.length > 0 && c.idempotencyKey.length <= 250 && r.commandSha256 === hash(c), 'COMMAND_SCOPE_HASH');
    const dispatch = one(raw.requestJournal, q => q.recordPath === r.receiptPath && q.mode === r.mode, 'ORIGINAL_REQUEST');
    const ses = one(raw.sessionDiagnostics, s => s.label === dispatch.session, 'COMMAND_SESSION');
    need(dispatch.commandType === c.commandType && ses.role === actor.role && (c.actor.actorId === ses.observed.boundaryActorId || c.actor.actorId === actor.uid), 'COMMAND_ACTOR_BINDING');
    const progress = c.commandType === 'academy.progress.lesson.complete';
    need((progress && r.kind === 'progress') || (!progress && r.kind === 'course' && ['academy.course.create', 'academy.course.update'].includes(c.commandType)), 'COMMAND_TYPE');
    let receiptId, auditId, trailId;
    if (progress) {
      need(c.entityType === 'academyProgress' && c.entityId === p.courseId && c.periodId === null && c.requireProject === true && c.requirePeriod === false && c.authorization?.permission === 'academy.progress.self', 'PROGRESS_BOUNDARY');
      need(p.origin === 'base' && Object.keys(p).every(k => ['origin', 'audience', 'courseId', 'revision', 'lessonId', 'answers'].includes(k)), 'PROGRESS_PAYLOAD');
      const course = one(baseContract.courses, x => x.courseId === p.courseId && x.audience === p.audience && x.revision === p.revision, 'PROGRESS_COURSE');
      const lesson = one(course.lessons, x => x.id === p.lessonId, 'PROGRESS_LESSON');
      need(Array.isArray(p.answers) && equal(p.answers, lesson.quiz.map(q => q.answer)), 'PROGRESS_ANSWERS');
      if (r.mode === 'write') need(actor.observer === false && actor.courseId === p.courseId && actor.role === p.audience, 'PROGRESS_OWNER');
      else need(actor.uid === observer.uid && r.negative === 'wrong_audience' && p.audience === 'cliente' && c.expectedVersion === 0, 'PROGRESS_NEGATIVE');
      need(r.commandDigest === hash({actorUid:r.uid, tenantId:raw.tenantId, commandType:c.commandType, payload:p}) && r.progressKey === hash([p.origin, p.audience, p.courseId, p.revision]), 'PROGRESS_DIGEST');
      receiptId = 'academy-progress-' + hash([r.uid, c.idempotencyKey]).slice(0, 40); auditId = receiptId; trailId = receiptId;
    } else {
      need(c.entityType === 'academyCourse' && c.entityId === `${tag}_course` && c.requirePeriod === false && (c.periodId === null || typeof c.periodId === 'string' && c.periodId.length > 0), 'COURSE_BOUNDARY');
      need(p.audience === 'admin' && r.commandDigest === hash(c) && r.progressKey === null, 'COURSE_DIGEST');
      if (c.commandType === 'academy.course.create') need(r.mode === 'write' && r.role === 'admin' && c.expectedVersion === 'absent' && c.authorization?.permission === 'academy.create' && p.id === `${tag}_course` &&
        p.estado === 'borrador' && p.contentVersion === 1 && p.workflowVersion === 1 && p.cert === false && Array.isArray(p.lessons) && p.lessons.length === 0 && p.qaSynthetic === true && p.qaRunId === raw.runId && p.qaRunAttempt === raw.runAttempt && p.qaPurpose === 'D08' && equal(p.scope, request.draftScope), 'COURSE_CREATE');
      else need(c.authorization?.permission === 'academy.edit' && p.contentChange === true && p.patch && Object.keys(p.patch).every(k => ['n','desc','cat','scope'].includes(k)) && equal(p.patch.scope, request.draftScope) &&
        (r.mode === 'write' ? r.role === 'admin' && c.expectedVersion === 1 :
          r.negative === 'role_denied' ? ['shopper','cliente'].includes(r.role) && c.expectedVersion === 2 :
            r.negative === 'stale_version' && r.role === 'admin' && c.expectedVersion === 1), 'COURSE_EDIT');
      receiptId = hash(raw.tenantId + '\0' + c.idempotencyKey).slice(0, 40);
      auditId = 'aa-' + hash(c.idempotencyKey).slice(0, 32); trailId = 'academy-' + hash(c.idempotencyKey).slice(0, 32);
    }
    need(r.receiptPath === `${tenantPrefix}/commandReceipts/${receiptId}` && r.auditPath === `${tenantPrefix}/academyAudit/${auditId}` && r.trailPath === `${tenantPrefix}/entityAuditTrail/${trailId}`, 'REMOTE_PATHS');
    if (r.mode === 'negative') { need(!r.bundle && r.providerAck !== true && r.durableReadback !== true, 'NEGATIVE_WROTE'); continue; }
    need(r.providerAck === true && r.durableReadback === true && r.bundle && r.bundleSha256 === hash(r.bundle), 'ACK_READBACK_HASH');
    const {receipt, audit, trail} = r.bundle;
    need(receipt && audit && trail && receipt.status === 'committed' && receipt.providerAck === true && receipt.actorUid === r.uid && receipt.commandDigest === r.commandDigest && receipt.commandType === c.commandType && receipt.entityId === c.entityId && receipt.entityType === c.entityType, 'RECEIPT_BINDING');
    for (const a of [audit, trail]) need(a.actorUid === r.uid && a.actorRole === r.role && a.tenantId === raw.tenantId && a.projectId === raw.projectId && a.commandType === c.commandType && a.entityId === c.entityId && a.entityType === c.entityType && a.idempotencyKey === c.idempotencyKey && (a.periodId ?? null) === (c.periodId ?? null), 'AUDIT_BINDING');
    if (progress) need(receipt.progressKey === r.progressKey && audit.lessonId === p.lessonId && audit.courseRevision === p.revision && audit.progressVersion === receipt.entityVersion, 'PROGRESS_AUDIT');
  }
  need(raw.requestJournal.every(q => records.some(r => r.receiptPath === q.recordPath) && ['write', 'negative', 'replay'].includes(q.mode)), 'UNKNOWN_REQUEST');
  const replay = (record, sessionLabel) => one(raw.requestJournal, q => q.mode === 'replay' && q.session === sessionLabel && q.recordPath === record.receiptPath && q.commandType === record.command.commandType && q.httpStatus >= 200 && q.httpStatus < 300, 'REPLAY_' + sessionLabel);
  const roleWrites = {}, replayRows = {};
  for (const role of ROLES) {
    const actor = byRole[role], summary = raw.roles?.[role];
    need(summary && ['uiCourse','uiContent','uiEvaluation','uiProgress','providerAck','durableReadback','independentNewSession','replayNoDuplicate'].every(k => summary[k] === true), 'ROLE_PROOF_' + role);
    const course = one(baseContract.courses, c => c.courseId === actor.courseId && c.audience === role && c.revision === summary.courseRevision, 'ROLE_COURSE_' + role);
    need(summary.courseId === course.courseId && summary.lessons === course.lessons.length && summary.evaluationQuestions === course.lessons.reduce((n, x) => n + x.quiz.length, 0), 'ROLE_INVENTORY_' + role);
    const writes = records.filter(r => r.uid === actor.uid && r.kind === 'progress' && r.mode === 'write').sort((a,b) => a.bundle.receipt.entityVersion - b.bundle.receipt.entityVersion);
    need(writes.length === course.lessons.length && unique(writes.map(r => r.command.payload.lessonId)) && course.lessons.every(l => writes.some(r => r.command.payload.lessonId === l.id)), 'ROLE_LESSONS_' + role);
    need(writes.every((r,i) => r.command.expectedVersion === i && r.bundle.receipt.entityVersion === i + 1), 'ROLE_VERSIONS_' + role);
    roleWrites[role] = writes; replayRows[role] = replay(writes.at(-1), role + '-new-session');
    const resource = one(raw.resources || [], x => x.role === role, 'RESOURCE_' + role);
    need(resource.realSourceOwned === true && resource.readOnly === true && resource.sections > 1 && HASH.test(resource.firstSectionSha256) && HASH.test(resource.secondSectionSha256) && resource.firstSectionSha256 !== resource.secondSectionSha256, 'RESOURCE_CONTENT_' + role);
  }
  need(raw.resources.length === 3, 'RESOURCE_COUNT');
  const created = one(records, r => r.mode === 'write' && r.command.commandType === 'academy.course.create', 'DRAFT_CREATE');
  const edited = one(records, r => r.mode === 'write' && r.command.commandType === 'academy.course.update', 'DRAFT_EDIT');
  need(created.uid === byRole.admin.uid && edited.uid === byRole.admin.uid && created.bundle.receipt.entityVersion === 1 && edited.bundle.receipt.entityVersion === 2, 'DRAFT_VERSIONS');
  const edit = raw.authorizedAdminEdit;
  need(edit && ['providerAck','durableReadback','independentNewSession','replayNoDuplicate'].every(k => edit[k] === true) && edit.courseId === `${tag}_course` && edit.version === 2 && edit.contentVersion === 2 && edit.state === 'borrador', 'DRAFT_PROOF');
  const editReplay = replay(edited, 'admin-edit-new-session');
  const expectedNegatives = [['stale_version','admin','ACADEMY_EXPECTED_VERSION_CONFLICT'], ['role_denied','shopper','ACADEMY_ACTOR_DENIED'], ['role_denied','cliente','ACADEMY_ACTOR_DENIED'], ['wrong_audience','shopper','ACADEMY_PROGRESS_COURSE_DENIED']];
  need(Array.isArray(raw.negatives), 'NEGATIVE_PROOFS');
  for (const [name, role, code] of expectedNegatives) {
    const n = one(raw.negatives, x => x.case === name && x.role === role, 'NEGATIVE_' + name + '_' + role);
    need(n.code === code && n.zeroWrites === true && n.receiptAbsent === true, 'NEGATIVE_RESULT_' + name);
    one(records, r => r.mode === 'negative' && r.negative === name && r.role === role, 'NEGATIVE_RECORD_' + name + '_' + role);
  }
  for (const role of ['shopper','cliente']) need(one(raw.negatives, x => x.case === 'ui_edit_permission' && x.role === role, 'UI_DENIED_' + role).zeroCommands === true, 'UI_COMMAND_DENIAL_' + role);
  const isolation = one(raw.negatives, x => x.case === 'other_learner' && x.role === 'shopper', 'OTHER_LEARNER');
  need(isolation.emptyOwnProgress === true && isolation.foreignMemberReadDenied === true, 'OTHER_LEARNER_ISOLATION');
  need(records.filter(r => r.mode === 'negative').length === 4 && raw.negatives.length === 7, 'NEGATIVE_INVENTORY');
  need(raw.requestJournal.filter(q => q.mode === 'replay').length === 4, 'REPLAY_INVENTORY');

  const provenance = {...transport, resultSha256:rawHash, requestCanonicalSha256:hash(request), baseContractSha256:baseHash};
  const specialIds = {admin:['D08.admin.edit','D08.stale_version_denied','D08.cleanup'], shopper:['D08.shopper.edit_denied','D08.other_learner_isolated','D08.wrong_audience_denied'], cliente:['D08.cliente.edit_denied']};
  const receipts = ROLES.map(role => {
    const writes = roleWrites[role], original = writes.at(-1), ids = [...D08_OBLIGATION_IDS.filter(id => id.startsWith(`D08.${role}.`) && !['D08.admin.edit','D08.shopper.edit_denied','D08.cliente.edit_denied'].includes(id)), ...specialIds[role]];
    const positive = role === 'admin' ? [...writes, created, edited] : writes;
    const obligations = ids.map(id => ({id, observed:true, evidenceRef:transport.resultRef, evidenceSha256:rawHash,
      ...(id === 'D08.other_learner_isolated' || id === 'D08.wrong_audience_denied' ? {actorUid:observer.uid, targetUid:byRole.shopper.uid} : {})}));
    const receipt = {
      schemaVersion:D08_RECEIPT_SCHEMA, moduleDomain:'certifications', findingIds:[], decision:'PASS_D08_SCOPED_OWNER_OBLIGATIONS',
      ...Object.fromEntries(identityKeys.map(k => [k, raw[k]])), hrIndependent:true, production:false, fullDomain:false,
      operationKind:'PROVIDER_WRITE', ownerPaths:[OWNER], ownerEvidence:[{path:OWNER, ...raw.serving.after.assets[OWNER]}],
      dependencyEvidence:ASSETS.filter(p => p !== OWNER).map(path => ({path, ...raw.serving.after.assets[path]})),
      contractAuthority:{contractSha256:hash(moduleContract), taskId:'D08', scopeContractSha256:scopeAuthority.sha256, baseContractSha256:baseHash},
      contractCoverage:{fullDomain:false, completeDomainInventory:false, taskIds:['D08'], obligations},
      scope:{kind:'D08_ACADEMY_TENANT_COURSE', tenantId:raw.tenantId, projectId:raw.projectId, periodId:null, role},
      auth:{authenticated:true, tenantExact:true, projectAuthorized:true, role, method:'FIREBASE_CUSTOM_TOKEN_QA', actorUids:role === 'shopper' ? [byRole.shopper.uid, observer.uid] : [byRole[role].uid]},
      actionReal:true, providerAck:true, durableReadback:true, reloadProof:true, noDuplicateRegression:true,
      providerWriteProof:{remoteReceiptId:original.receiptPath, idempotencyKey:original.command.idempotencyKey, replayNoDuplicate:true,
        receipts:positive.map(r => ({actorUid:r.uid, commandType:r.command.commandType, commandPeriodId:r.command.periodId, receiptPath:r.receiptPath, idempotencyKey:r.command.idempotencyKey, commandDigest:r.commandDigest, bundleSha256:r.bundleSha256})),
        replayRequests:role === 'admin' ? [replayRows.admin, editReplay] : [replayRows[role]]},
      normalizationEvidence:provenance, cleanup:raw.cleanup
    };
    need(permitsD08PeriodlessScope(receipt, scopeAuthority), 'NORMALIZED_SCOPE');
    return receipt;
  });
  const observedIds = receipts.flatMap(r => r.contractCoverage.obligations.map(o => o.id));
  need(observedIds.length === 25 && unique(observedIds) && D08_OBLIGATION_IDS.every(id => observedIds.includes(id)), 'NORMALIZED_OBLIGATIONS');
  return {schemaVersion:'cxorbia.i3.d08-typed-incorporation.v1', decision:'PASS_D08_TYPED_PARTIAL_INCORPORATION',
    ownerSpecificReceipts:receipts, evidence:provenance, focalObligationCount:25, fullDomain:false, newDomainMatches:0, production:false};
}
