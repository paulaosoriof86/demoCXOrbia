import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';

const DESCRIPTOR = 'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
const POINTER = 'CXORBIA_RECOVERY_EXECUTION_CURRENT.json';
const FREEZE = 'CXORBIA_I3_PLAN_CHOQUE_CIERRE_MONOTONICO_FROZEN_2026-10-28.md';
const EXPECTED_BRANCH = 'recovery/cxorbia-phase-a-20260831';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

export function hasVerifiedHostingAssets(receipt,previousSourceSha,
  gitRead=args=>execFileSync('git',args,{encoding:'utf8'})){
  try{
    const assets=Object.entries(receipt.servedSha256||{});
    if(assets.length<19||receipt.verifiedServedAssetCount!==assets.length)return false;
    const changed=gitRead(['diff','--name-only','--diff-filter=ACMRT',previousSourceSha,receipt.sourceSha,'--','app'])
      .trim().split('\n').filter(Boolean).map(x=>x.replace(/^app\//,''));
    if(changed.some(p=>!Object.hasOwn(receipt.servedSha256,p)))return false;
    return assets.every(([p,hash])=>!p.startsWith('/')&&!p.includes('..')&&/^[a-f0-9]{64}$/.test(hash)&&
      crypto.createHash('sha256').update(gitRead(['show',receipt.sourceSha+':app/'+p])).digest('hex')===hash);
  }catch{return false;}
}

export function validatePendingDevSuccessor({descriptor:d,pointer:p,matrix:m,gitBlob,
  gitRead=args=>execFileSync('git',args,{encoding:'utf8'}).trim(),
  gitAncestor=(before,after)=>{try{execFileSync('git',['merge-base','--is-ancestor',before,after],{stdio:'ignore'});return true;}catch{return false;}}}){
  const pending=d.pendingDevSuccessor,other=p.pendingDevSuccessor;
  if(!pending&&!other)return {present:false,pass:false};
  try{
    if(!pending||JSON.stringify(pending)!==JSON.stringify(other)||
      pending.state!=='P0_PROVEN_PENDING_DEV_MATERIALIZATION'||
      !['RUNTIME_AND_HOSTING','HOSTING_ONLY'].includes(pending.scope)||
      pending.sourceSha!==d.productSourceSha||pending.sourceSha!==m.productSource?.sha||
      pending.sourceTree!==d.productTreeAuthority||gitRead(['rev-parse',pending.sourceSha+'^{tree}'])!==pending.sourceTree||
      !gitAncestor(pending.predecessorProductSourceSha,pending.sourceSha)||pending.predecessorProductSourceSha===pending.sourceSha||
      pending.devPublished!==false||pending.production!==false||pending.rulesDeploys!==0||pending.storageRulesDeploys!==0||
      m.productSource?.authorityState!==(pending.scope==='HOSTING_ONLY'
        ?'SOURCE_ONLY_PROVEN_PENDING_HOSTING_ONLY_DEV':'SOURCE_ONLY_PROVEN_PENDING_RUNTIME_AND_HOSTING_DEV'))return {present:true,pass:false};
    const hosting=d.currentHostingOnlyDevMaterialization,seal=d.postDeployRunSeal||{};
    if(JSON.stringify(pending.servingRuntimeSeal)!==JSON.stringify(seal)||
      seal.mode!=='PREDECESSOR_SERVING_PENDING_SOURCE')return {present:true,pass:false};
    if(hosting){
      if(pending.servingPairedMaterialization||pending.predecessorProductSourceSha!==hosting.sourceSha||
        JSON.stringify(pending.servingHosting)!==JSON.stringify(hosting)||
        !hosting.receiptPath||gitBlob(hosting.receiptPath)!==hosting.receiptBlob)return {present:true,pass:false};
    }else{
      const paired=d.currentMaterialization;
      if(p.currentHostingOnlyDevMaterialization||pending.servingHosting||!paired||
        JSON.stringify(seal)!==JSON.stringify(p.postDeployRunSeal)||
        JSON.stringify(paired)!==JSON.stringify(p.currentDevMaterialization)||
        JSON.stringify(pending.servingPairedMaterialization)!==JSON.stringify(paired)||
        pending.predecessorProductSourceSha!==paired.sourceSha||
        paired.materializationReceiptPath!==seal.receiptPath||
        !seal.receiptPath||gitBlob(seal.receiptPath)!==seal.receiptBlob)return {present:true,pass:false};
      const receipt=JSON.parse(gitRead(['show','HEAD:'+seal.receiptPath]));
      if(receipt.source?.sha!==paired.sourceSha||receipt.source?.tree!==paired.sourceTree||
        JSON.stringify(receipt.materialization)!==JSON.stringify(paired)||paired.production!==false||
        ['sourceSha','sourceTree','runId','runNumber','runtimeRevision','runtimeDigest','hostingVersion','hostingRelease','artifactDigest']
          .some(key=>!paired[key]||paired[key]!==seal[key]))return {present:true,pass:false};
    }
    if(!pending.proofReceiptPath||gitBlob(pending.proofReceiptPath)!==pending.proofReceiptBlob)return {present:true,pass:false};
    const proof=JSON.parse(gitRead(['show','HEAD:'+pending.proofReceiptPath]));
    for(const field of ['sourceSha','sourceTree','predecessorProductSourceSha','sourceTestsPass','sourceTestsFail','allowedProductFiles','allowedTestFiles'])
      if(JSON.stringify(proof[field])!==JSON.stringify(pending[field]))return {present:true,pass:false};
    if(!(proof.sourceTestsPass>0)||proof.sourceTestsFail!==0||proof.production!==false||
      !Array.isArray(proof.findings)||!proof.findings.length||proof.findings.some(x=>x.priority!=='P0_PROVEN')||
      !proof.scopeReceiptPath||gitBlob(proof.scopeReceiptPath)!==proof.scopeReceiptBlob)return {present:true,pass:false};
    const scoped=JSON.parse(gitRead(['show','HEAD:'+proof.scopeReceiptPath]));
    if(JSON.stringify(scoped.allowedProductFiles)!==JSON.stringify(proof.allowedProductFiles))return {present:true,pass:false};
    const allowed=[...(proof.allowedProductFiles||[]),...(proof.allowedTestFiles||[])];
    if(!proof.allowedProductFiles?.length||new Set(allowed).size!==allowed.length||
      allowed.some(file=>/(?:^|\/)(?:firestore|storage)\.rules$|^firebase\.json$|^\.firebaserc$/.test(file)))return {present:true,pass:false};
    const changed=gitRead(['diff','--name-only',pending.predecessorProductSourceSha,pending.sourceSha,'--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source']).split('\n').filter(Boolean);
    if(!changed.length||changed.some(file=>!allowed.includes(file))||proof.allowedProductFiles.some(file=>!changed.includes(file)))return {present:true,pass:false};
    // Hosting-only may change browser assets, never a backend/runtime or Firebase authority.
    if(pending.scope==='HOSTING_ONLY'&&changed.some(file=>!file.startsWith('app/')))return {present:true,pass:false};
    return {present:true,pass:true};
  }catch{return {present:true,pass:false};}
}

export function classifyModules(matrix) {
  const modules = Array.isArray(matrix?.modules) ? matrix.modules : [];
  const counts = {};
  for (const m of modules) {
    const key = String(m.classification || 'UNCLASSIFIED');
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

// This witness is intentionally independent of the descriptor and pointer.
// RUN2382 already proved the active product source served in DEV while both
// control JSONs still pointed at RUN2322 and therefore agreed falsely.
export function findNewerDevProviderReceipt({sourceSha, sealedRunId, receipts}) {
  return receipts.find(({path: receiptPath, value: r}) => {
    const f2 = r?.schemaVersion === 'cxorbia.i3.f2.operational-excel-dev-pass-continuity.v1';
    const provider = r?.providerReceipt || r?.materialization || (f2 ? r?.devMaterialization : null);
    const runId = Number(r?.workflowRunId || provider?.runId || 0);
    const source = r?.productSourceSha || r?.source?.sha || provider?.sourceSha;
    const passed = /^PASS/.test(String(provider?.decision || r?.decision || ''));
    // This witness can only fail a stale seal, never promote a certificate.
    const devOnly = provider?.production === false || (f2 && r?.iteration === 'I3' &&
      r?.state === 'HOLD' && r?.safety?.production === 'DO_NOT_TOUCH' &&
      r?.safety?.i4Authorized === false && provider?.sourceHostedExact === true &&
      provider?.runtimeTrafficExact === true);
    return source === sourceSha && runId > Number(sealedRunId || 0) &&
      passed && devOnly &&
      Boolean(provider?.runtimeRevision && provider?.hostingVersion &&
        provider?.hostingRelease) && Boolean(receiptPath);
  });
}


export function readDevProviderReceipts(proofDir = 'docs/checkpoints') {
  return fs.existsSync(proofDir) ? fs.readdirSync(proofDir)
    .filter(name => /^CXORBIA_I3_.*\.json$/.test(name))
    .flatMap(name => {
      const file = path.join(proofDir, name);
      try { return [{path: file, value: readJson(file)}]; }
      catch { return []; }
    }) : [];
}

export function validateOperationalExcelReceipt({descriptor:d,gitBlob,pendingDev,
  gitRead=args=>execFileSync('git',args,{encoding:'utf8'})}) {
  const op=d.currentF2OperationalExcel,failures=[];
  if(!op)return {present:false,pass:true,failures};
  const check=(ok,code)=>{if(!ok)failures.push(code);};
  const seal=d.postDeployRunSeal||{},pending=d.pendingDevSuccessor||{};
  const predecessorReceipt=pendingDev?.present===true&&pendingDev.pass===true&&
    pending.state==='P0_PROVEN_PENDING_DEV_MATERIALIZATION'&&pending.scope==='RUNTIME_AND_HOSTING'&&
    pending.devPublished===false&&pending.production===false&&seal.mode==='PREDECESSOR_SERVING_PENDING_SOURCE'&&
    pending.sourceSha===d.productSourceSha&&pending.sourceTree===d.productTreeAuthority&&
    pending.predecessorProductSourceSha===seal.sourceSha&&op.sourceSha===seal.sourceSha&&op.sourceTree===seal.sourceTree;
  const expectedSource=predecessorReceipt?seal.sourceSha:d.productSourceSha,expectedTree=predecessorReceipt?seal.sourceTree:d.productTreeAuthority;
  let receipt;
  try {
    check(typeof op.receiptPath==='string'&&op.receiptPath.startsWith('docs/checkpoints/')&&
      /^[a-f0-9]{40}$/.test(op.receiptBlob||'')&&gitBlob(op.receiptPath)===op.receiptBlob,
      'RELEASE_COMPOSITION_FAILURE:OPERATIONAL_EXCEL_RECEIPT_GIT_BLOB');
    const raw=gitRead(['show','HEAD:'+op.receiptPath]);
    const bytes=Buffer.isBuffer(raw)?raw:Buffer.from(raw,'utf8');
    const computed=crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
    check(computed===op.receiptBlob,'RELEASE_COMPOSITION_FAILURE:OPERATIONAL_EXCEL_RECEIPT_CONTENT_BLOB');
    receipt=JSON.parse(bytes.toString('utf8'));
  }catch{
    check(false,'RELEASE_COMPOSITION_FAILURE:OPERATIONAL_EXCEL_RECEIPT_UNREADABLE');
    return {present:true,pass:false,failures};
  }
  const materialization=receipt.devMaterialization||{},selector=receipt.devOperationalSelector||{};
  check(receipt.schemaVersion==='cxorbia.i3.f2.operational-excel-dev-pass-continuity.v1'&&
    receipt.iteration==='I3'&&receipt.state==='HOLD'&&receipt.productSourceSha===expectedSource&&
    receipt.productSourceTree===expectedTree&&receipt.productSourceSha===op.sourceSha&&
    receipt.productSourceTree===op.sourceTree&&receipt.safety?.production==='DO_NOT_TOUCH'&&
    receipt.safety?.i4Authorized===false&&receipt.phaseA?.strictDomainPromotion===false,
    'RELEASE_COMPOSITION_FAILURE:OPERATIONAL_EXCEL_RECEIPT_SCOPE');
  check(/^PASS_/.test(materialization.decision||'')&&materialization.sourceHostedExact===true&&
    materialization.runtimeTrafficExact===true&&materialization.runId===op.materializationRunId&&
    materialization.runId===seal.runId&&['runtimeRevision','runtimeDigest','hostingVersion'].every(k=>
      Boolean(materialization[k])&&materialization[k]===op[k]&&materialization[k]===seal[k]),
    'RELEASE_COMPOSITION_FAILURE:OPERATIONAL_EXCEL_MATERIALIZATION_RECEIPT');
  const selectorFields=['runId','runNumber','jobId','decision','configWrites','configReadbackVerified',
    'sourceRevision','hrRevision','bindingFingerprint','periodJobs','readbackPeriodJobs'];
  check(selectorFields.every(k=>selector[k]!==undefined&&selector[k]===op[k])&&
    /^PASS_/.test(selector.decision||'')&&selector.afterProvider===op.provider&&op.provider==='excel_online'&&
    selector.configReadbackVerified===true&&selector.periodJobs===selector.readbackPeriodJobs&&
    ['originalExcelWrites','obsoleteGoogleMirrorWrites','visitWrites','authWrites'].every(k=>
      receipt.safety?.[k]===0&&op[k]===receipt.safety[k])&&op.production===false&&
    op.strictDomainPromotion===false&&op.terminalCertified===false&&op.i4Authorized===false,
    'RELEASE_COMPOSITION_FAILURE:OPERATIONAL_EXCEL_SELECTOR_RECEIPT');
  return {present:true,pass:failures.length===0,failures};
}

export function failedDevReadbackAllowsCorrection({descriptor:d,pointer:p,receipt:r,transition:x,pendingFromPaired,pendingProven}){
  const q=d.vrm356FreshReadPreflight||{},pending=d.pendingDevSuccessor||{},materialization=r.materialization||{},seal=d.postDeployRunSeal||{};
  return pendingFromPaired===true&&pendingProven===true&&
    r.schemaVersion==='cxorbia.i3.paired-dev-failed-readback.v2'&&r.jobConclusion==='failure'&&
    r.decision==='HOLD_EXACT_DEV_DEPLOYED_HR_RANGE_READ_FAILED'&&materialization.decision===r.decision&&
    materialization.hrLiveVerified===false&&materialization.production===false&&
    r.productionUnchanged===null&&r.productionDeploys===0&&r.production===false&&r.i4Authorized===false&&r.phaseAComplete===false&&
    x.hrLiveVerified===false&&x.certifiable===false&&seal.hrLiveVerified===false&&seal.certifiable===false&&
    /^HOLD_/.test(d.status||'')&&p.state==='HOLD'&&d.terminalCertificationAllowed===false&&
    d.i4Authorized===false&&d.i3Closed===false&&p.authorizationI4!==true&&
    d.production==='DO_NOT_TOUCH'&&p.production==='DO_NOT_TOUCH'&&
    q.enabled===true&&q.readsOnly===true&&q.buildBeforePass===false&&q.production===false&&
    q.sourceSha===pending.sourceSha&&q.sourceTree===pending.sourceTree&&
    JSON.stringify(q)===JSON.stringify(p.vrm356FreshReadPreflight||null)&&
    d.vrm354CanonicalNameRepairRequest?.enabled===false&&p.vrm354CanonicalNameRepairRequest?.enabled===false;
}

export function validateShockContinuity({descriptor: d, pointer: p, matrix: m, gitBlob, freezePath = FREEZE,gitRead,gitAncestor}) {
  const failures = [];
  const check = (condition, code) => { if (!condition) failures.push(code); };
  const pendingDev=validatePendingDevSuccessor({descriptor:d,pointer:p,matrix:m,gitBlob,gitRead,gitAncestor});
  check(!pendingDev.present||pendingDev.pass,'RELEASE_COMPOSITION_FAILURE:PENDING_DEV_SUCCESSOR_UNPROVEN');
  const matrixPath = String(d.moduleTruthPath || '');
  const actualCounts = classifyModules(m);
  const uniqueDomains = new Set((Array.isArray(m.modules) ? m.modules : []).map(x => x.domain));
  const freezeD = d.activeShockControl || {};
  const freezeP = p.activeShockControl || {};

  check(d.branch === EXPECTED_BRANCH, 'MAPPING_FAILURE:BRANCH');
  check(d.productSourceSha === p.productSourceSha && d.productSourceSha === m?.productSource?.sha,
    'RELEASE_COMPOSITION_FAILURE:SOURCE_POINTER_DESYNC');
  check(Boolean(matrixPath) && p.moduleTruthAuthority?.path === matrixPath,
    'MAPPING_FAILURE:MATRIX_PATH_DESYNC');
  check(!p.moduleTruthPath || p.moduleTruthPath === matrixPath,
    'MAPPING_FAILURE:LEGACY_MATRIX_PATH_DESYNC');
  check(Boolean(d.moduleTruthExpectedGitBlob) &&
    p.moduleTruthAuthority?.gitBlob === d.moduleTruthExpectedGitBlob &&
    gitBlob(matrixPath) === d.moduleTruthExpectedGitBlob,
    'MAPPING_FAILURE:MATRIX_BLOB_DESYNC');
  check((!p.moduleTruthExpectedGitBlob || p.moduleTruthExpectedGitBlob === d.moduleTruthExpectedGitBlob) &&
    (!p.findingsLedgerPath || p.findingsLedgerPath === d.findingsLedgerPath) &&
    (!p.findingsLedgerExpectedGitBlob || p.findingsLedgerExpectedGitBlob === d.findingsLedgerExpectedGitBlob),
    'MAPPING_FAILURE:LEGACY_ROOT_DOCUMENT_BLOB_DESYNC');
  check(Array.isArray(m.modules) && m.modules.length === 21 && uniqueDomains.size === 21,
    'RELEASE_COMPOSITION_FAILURE:DOMAIN_COVERAGE');

  const snapshot = p.activeShockModuleTruth || {};
  check(snapshot.sourceSha === d.productSourceSha && snapshot.matrixPath === matrixPath &&
    snapshot.matrixBlob === d.moduleTruthExpectedGitBlob,
    'MAPPING_FAILURE:CLASSIFICATION_SNAPSHOT_AUTHORITY');
  check(JSON.stringify(snapshot.classificationCounts || {}) === JSON.stringify(actualCounts),
    'MAPPING_FAILURE:CLASSIFICATION_COUNTS_STALE');
  if (m.classificationCounts) {
    const declaredCounts = Object.fromEntries(Object.entries(m.classificationCounts)
      .sort(([a], [b]) => a.localeCompare(b)));
    check(JSON.stringify(declaredCounts) === JSON.stringify(actualCounts),
      'MAPPING_FAILURE:MATRIX_REPORTED_CLASS_COUNTS_STALE');
  }

  check(freezeD.path === freezePath && freezeP.path === freezePath &&
    Boolean(freezeD.gitBlob) && freezeD.gitBlob === freezeP.gitBlob &&
    gitBlob(freezePath) === freezeD.gitBlob,
    'MAPPING_FAILURE:FROZEN_PRIORITY_BLOB_DESYNC');
  check(freezeD.id === 'CXORBIA-I3-SHOCK-MONOTONIC-CLOSURE-20261028' &&
    freezeD.id === freezeP.id, 'MAPPING_FAILURE:PRIORITY_ID_DESYNC');
  check(Boolean(d.exactNextAction) && d.exactNextAction === p.nextExactAction,
    'MAPPING_FAILURE:NEXT_ACTION_DESYNC');
  // The descriptor also retains a compatibility field. It must not silently
  // reintroduce an older action after the current control pointer is updated.
  check(!d.nextExactAction || d.nextExactAction === d.exactNextAction,
    'MAPPING_FAILURE:DESCRIPTOR_LEGACY_NEXT_ACTION_DESYNC');
  // Some older continuity consumers still read this second field. A green
  // gate must not hide a stale historical next action alongside the new one.
  check(!p.exactNextAction||p.exactNextAction===p.nextExactAction,
    'MAPPING_FAILURE:LEGACY_NEXT_ACTION_DESYNC');
  // The next-action prose is an explanation, NOT a certification oracle.
  // The former guard required literal "G03", "HR" and "finanzas" in every
  // rewrite of the plan, reopening a closed control for editorial changes.
  // Validate the structured frozen B1-B9 scope instead when it exists.
  const phaseLock = p.activePhaseAClosureLock20261110;
  if (phaseLock) {
    const required=Array.from({length:9},(_,i)=>'B'+(i+1));
    const protectedPass=['B4','B5','B6','B7'];
    check(phaseLock.sourceSha === d.productSourceSha &&
      phaseLock.phaseABlocksTotal === 9 &&
      required.every(b=>Boolean(phaseLock.blocks?.[b]?.technical && phaseLock.blocks?.[b]?.human)) &&
      protectedPass.every(b=>phaseLock.humanPassBlocks?.includes(b) &&
        String(phaseLock.blocks?.[b]?.human||'').includes('PASS')) &&
      phaseLock.phaseABlocksHumanPassed >= protectedPass.length &&
      typeof phaseLock.gate20 === 'string' && typeof phaseLock.gate21 === 'string' &&
      phaseLock.production === 'DO_NOT_TOUCH' && phaseLock.i4Authorized === false,
      'MAPPING_FAILURE:PHASE_A_FROZEN_SCOPE_DESYNC');
  }

  // Matching pointers can still be mutually stale. Preserve the last verified
  // cohort receipt and the actual DEV Hosting observation across iterations.
  const fusionD = d.i3FusionContinuityRecovered20261031 || {};
  const fusionP = p.i3FusionContinuityRecovered20261031 || {};
  check(Boolean(fusionD.receiptPath && fusionD.receiptGitBlob) &&
    JSON.stringify(fusionD) === JSON.stringify(fusionP) &&
    gitBlob(fusionD.receiptPath) === fusionD.receiptGitBlob,
    'MAPPING_FAILURE:SHOPPER_FUSION_RECEIPT_DESYNC');
  const verifiedCurrent = p.currentCanonicalCheckpoint?.verifiedTotal ?? fusionD.provisionalVerifiedGroups;
  const pendingCurrent = p.currentCanonicalCheckpoint?.remaining ?? fusionD.provisionalPendingGroups;
  check(fusionD.provisionalVerifiedGroups >= fusionD.lastIndependentVerifiedGroups &&
    fusionD.provisionalVerifiedGroups + fusionD.provisionalPendingGroups === 83 &&
    fusionD.recensusRequired === true &&
    // The immutable October receipt is the floor, the current checkpoint is
    // the live count. A text-only change must not erase a proven 83/83 count.
    Number.isInteger(verifiedCurrent) && Number.isInteger(pendingCurrent) &&
    verifiedCurrent >= fusionD.provisionalVerifiedGroups &&
    pendingCurrent >= 0 && verifiedCurrent + pendingCurrent === 83,
    'MAPPING_FAILURE:SHOPPER_FUSION_PROGRESS_STALE');

  const hostingD = d.g03ActualHostingDevReadback20261031 || {};
  const hostingP = p.g03ActualHostingDevReadback20261031 || {};
  const currentDev = p.currentDevMaterialization || {};
  const currentCheckpoint = p.currentCanonicalCheckpoint || {};
  const handoff = p.continuityHandoff || {};
  if (currentDev.materializationReceiptPath && currentCheckpoint.path === currentDev.materializationReceiptPath) {
    const currentReceiptBlob = gitBlob(currentCheckpoint.path);
    check(Boolean(currentReceiptBlob) && currentCheckpoint.checkpointGitBlob === currentReceiptBlob &&
      currentCheckpoint.gitBlob === currentReceiptBlob && handoff.gitBlob === currentReceiptBlob,
      'MAPPING_FAILURE:CURRENT_CHECKPOINT_BLOB_DESYNC');
    check(currentCheckpoint.productSourceSha === currentDev.sourceSha &&
      currentCheckpoint.productSourceTree === currentDev.sourceTree &&
      currentCheckpoint.devServedCurrentSourceSha === currentDev.sourceSha &&
      currentCheckpoint.devMaterializationRunId === currentDev.runId &&
      currentCheckpoint.devRuntimeRevision === currentDev.runtimeRevision &&
      currentCheckpoint.devHostingVersion === currentDev.hostingVersion &&
      handoff.productSourceSha === currentDev.sourceSha &&
      handoff.productSourceTree === currentDev.sourceTree &&
      handoff.latestBatchRunId === currentDev.runId &&
      handoff.immediateAction === d.exactNextAction,
      'MAPPING_FAILURE:CURRENT_CHECKPOINT_DEV_SEAL_DESYNC');
  }
  const newerCurrentDev = Boolean(currentDev.hostingVersion && currentDev.sourceSha);
  const servedVersion = String(newerCurrentDev ? currentDev.hostingVersion : hostingD.hostingVersion || '').split('/').pop();
  // A newly source-proven P0 can legitimately wait for a single controlled
  // DEV materialization. The *actual* served version stays bound to its old
  // immutable seal; never relabel it as the newly proposed source.
  const seal = d.postDeployRunSeal || {};
  // Check immutable, already-committed provider acknowledgements as a third
  // witness: two stale current pointers must never pass by agreeing together.
  const providerReceipts = readDevProviderReceipts();
  const newerServedWitness = findNewerDevProviderReceipt({
    sourceSha: d.productSourceSha, sealedRunId: seal.runId, receipts: providerReceipts,
  });
  check(!newerServedWitness, 'MAPPING_FAILURE:PROVEN_DEV_RECEIPT_NEWER_THAN_SEAL');
  const operationalReceipt=validateOperationalExcelReceipt({descriptor:d,gitBlob,gitRead,pendingDev});
  failures.push(...operationalReceipt.failures);
  check(!(seal.mode === 'CURRENT_SOURCE_SERVING' &&
    /^SOURCE_ONLY/.test(String(m.productSource?.authorityState || ''))),
  'MAPPING_FAILURE:CURRENT_DEV_MATRIX_FALSE_SOURCE_ONLY');
  const predecessorServing = seal.mode === 'PREDECESSOR_SERVING_PENDING_SOURCE' &&
    p.postDeployRunSeal?.mode === seal.mode &&
    p.postDeployRunSeal?.sourceSha === seal.sourceSha &&
    seal.sourceSha !== d.productSourceSha &&
    currentDev.sourceSha === seal.sourceSha && currentDev.sourceTree === seal.sourceTree &&
    currentDev.hostingVersion === seal.hostingVersion &&
    currentDev.runtimeRevision === seal.runtimeRevision &&
    currentDev.runtimeDigest === seal.runtimeDigest &&
    currentDev.hostingRelease === seal.hostingRelease;
  const servedAuthorityMatches = newerCurrentDev ?
    ((currentDev.sourceSha === d.productSourceSha &&
      currentDev.sourceTree === d.productTreeAuthority && seal.mode !== 'PREDECESSOR_SERVING_PENDING_SOURCE') || predecessorServing) &&
    Boolean(currentDev.runtimeRevision && currentDev.runtimeDigest && currentDev.hostingRelease) &&
    p.continuityHandoff?.path === p.currentCanonicalCheckpoint?.path :
    // Historical records before the structured currentDev seal may be accepted
    // only by their frozen verified readback/receipt, not by repeating a
    // Hosting version in a narrative next-action sentence.
    hostingD.verifiedBrowserDevOnly === true &&
    (!hostingD.receiptPath || (Boolean(hostingD.receiptGitBlob) &&
      gitBlob(hostingD.receiptPath) === hostingD.receiptGitBlob));
  check(Boolean(servedVersion) && JSON.stringify(hostingD) === JSON.stringify(hostingP) &&
    hostingD.verifiedBrowserDevOnly === true &&
    servedAuthorityMatches,
    'MAPPING_FAILURE:DEV_HOSTING_REALITY_STALE');

  // A Hosting-only deployment can be newer than the last paired runtime +
  // Hosting materialization. Keep that paired record intact, but fail closed
  // if its newer, immutable Hosting receipt is missing or described as source-only.
  const latestHostingD = d.currentHostingOnlyDevMaterialization || {};
  const latestHostingP = p.currentHostingOnlyDevMaterialization || {};
  if (latestHostingD.receiptPath || latestHostingP.receiptPath) {
    const proposed = d.i3Nov06HrSourceStatusFix || {};
    const proposedP = p.i3Nov06HrSourceStatusFix || {};
    // A previously verified Hosting receipt remains the served authority
    // while one scoped, lineage-validated successor awaits its first DEV
    // deployment. Never rewrite that receipt to pretend the new source is live.
    const boundedSourcePending = pendingDev.pass || (proposed.status === 'PENDING_HOSTING_ONLY_DEV' &&
      JSON.stringify(proposed) === JSON.stringify(proposedP) &&
      proposed.sourceSha === d.productSourceSha &&
      proposed.sourceTree === d.productTreeAuthority &&
      proposed.findingId === 'VRM-310' &&
      Boolean(proposed.receiptPath && proposed.receiptBlob) &&
      gitBlob(proposed.receiptPath) === proposed.receiptBlob &&
      proposed.predecessorServingSourceSha === latestHostingD.sourceSha &&
      proposed.sourceTestsPass === 14 && proposed.sourceTestsFail === 0 &&
      proposed.production === false && proposed.devPublished === false &&
      m.productSource?.authorityState === 'SOURCE_ONLY_PROVEN_PENDING_HOSTING_ONLY_DEV' &&
      latestHostingD.sourceSha !== d.productSourceSha);
    check(boundedSourcePending || !/source.only.*(pending|predecessor)|source_only_proven_not_yet_composed_or_dev_materialized/i
      .test(`${m.productSource?.message || ''} ${m.productSource?.authorityState || ''}`),
    'MAPPING_FAILURE:MATRIX_SOURCE_ONLY_STATUS_AFTER_HOSTING_DEV');
    check(Boolean(latestHostingD.receiptPath && latestHostingD.receiptBlob) &&
      JSON.stringify(latestHostingD) === JSON.stringify(latestHostingP) &&
      gitBlob(latestHostingD.receiptPath) === latestHostingD.receiptBlob,
      'MAPPING_FAILURE:ACTIVE_HOSTING_ONLY_RECEIPT_DESYNC');
    check((boundedSourcePending || (latestHostingD.sourceSha === d.productSourceSha &&
      latestHostingD.sourceTree === d.productTreeAuthority)) &&
      latestHostingD.hostingVersion?.startsWith('sites/cxorbia-backend-dev/versions/') &&
      latestHostingD.runtimeRevision === currentDev.runtimeRevision &&
      latestHostingD.verifiedServedAssetCount > 0 &&
      latestHostingD.cloudRunDeploys === 0 &&
      latestHostingD.firestoreRulesDeploys === 0 &&
      latestHostingD.productionChanged === false,
      'RELEASE_COMPOSITION_FAILURE:ACTIVE_HOSTING_ONLY_COMPONENT_DESYNC');
    const stalePendingDev = /SOURCE_ONLY_PENDING_DEV|PENDING_DEV_MATERIALIZATION/i;
    check(pendingDev.pass || (!stalePendingDev.test(d.status || '') &&
      !stalePendingDev.test(p.activeShockModuleTruth?.meaning || '') &&
      !stalePendingDev.test(d.exactNextAction || '')),
      'MAPPING_FAILURE:STALE_HOSTING_MATERIALIZATION_STATUS');
  }
  const c3AfterHostingD=d.i3Q2HostingReleaseC3Pending;
  const c3AfterHostingP=p.i3Q2HostingReleaseC3Pending;
  if(c3AfterHostingD||c3AfterHostingP){
    const x=c3AfterHostingD||{};
    const receipt=x.receiptPath&&fs.existsSync(x.receiptPath)?readJson(x.receiptPath):{};
    if(x.state==='DEV_RUNTIME_AND_HOSTING_VERIFIED_C3_PENDING'){
      const materialization=receipt.materialization||{};
      const pendingFromPaired=pendingDev.pass&&Boolean(d.pendingDevSuccessor?.servingPairedMaterialization)&&
        d.pendingDevSuccessor.predecessorProductSourceSha===currentDev.sourceSha;
      check(JSON.stringify(x)===JSON.stringify(c3AfterHostingP||null)&&x.production===false&&
        x.sourceSha===(pendingFromPaired?currentDev.sourceSha:d.productSourceSha)&&
        x.sourceTree===(pendingFromPaired?currentDev.sourceTree:d.productTreeAuthority)&&
        x.hostingVersion===currentDev.hostingVersion&&x.runtimeRevision===currentDev.runtimeRevision&&
        x.previousC3SourceSha===d.currentC3PreterminalAudit?.sourceSha&&
        x.previousC3SourceTree===d.currentC3PreterminalAudit?.sourceTree&&
        x.previousHostingVersion===d.currentC3PreterminalAudit?.hostingVersion&&
        x.previousRuntimeRevision===d.currentC3PreterminalAudit?.runtimeRevision&&
        x.receiptPath&&x.receiptBlob===gitBlob(x.receiptPath)&&
        seal.mode===(pendingFromPaired?'PREDECESSOR_SERVING_PENDING_SOURCE':'CURRENT_SOURCE_SERVING')&&seal.receiptPath===x.receiptPath&&seal.receiptBlob===x.receiptBlob&&
        JSON.stringify(d.currentMaterialization)===JSON.stringify(currentDev)&&
        JSON.stringify(materialization)===JSON.stringify(currentDev)&&materialization.production===false&&
        receipt.source?.sha===x.sourceSha&&receipt.source?.tree===x.sourceTree&&
        ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','hostingRelease','runId','artifactDigest'].every(k=>materialization[k]&&materialization[k]===seal[k])&&
        hasVerifiedHostingAssets({...receipt,sourceSha:receipt.source?.sha},x.previousC3SourceSha,gitRead)&&
        ((receipt.schemaVersion==='cxorbia.i3.paired-dev-failed-readback.v2'||receipt.jobConclusion==='failure'||receipt.materialization?.hrLiveVerified===false)
          ?failedDevReadbackAllowsCorrection({descriptor:d,pointer:p,receipt,transition:x,pendingFromPaired,pendingProven:pendingDev.pass}):receipt.productionUnchanged===true)&&
        (pendingFromPaired||m.productSource?.authorityState==='RUNTIME_AND_HOSTING_DEV_MATERIALIZED_PENDING_C3_E2E'),
        'RELEASE_COMPOSITION_FAILURE:PAIRED_DEV_C3_TRANSITION_RECEIPT');
    }else{
    check(JSON.stringify(x)===JSON.stringify(c3AfterHostingP||null)&&
      x.state==='DEV_HOSTING_VERIFIED_C3_PENDING'&&x.production===false&&
      (pendingDev.pass ? (x.sourceSha===d.pendingDevSuccessor.predecessorProductSourceSha&&x.sourceTree===latestHostingD.sourceTree) : (x.sourceSha===d.productSourceSha&&x.sourceTree===d.productTreeAuthority))&&
      x.hostingVersion===latestHostingD.hostingVersion&&
      x.runtimeRevision===latestHostingD.runtimeRevision&&
      x.previousC3SourceSha===d.currentC3PreterminalAudit?.sourceSha&&
      x.previousC3SourceTree===d.currentC3PreterminalAudit?.sourceTree&&
      x.previousHostingVersion===d.currentC3PreterminalAudit?.hostingVersion&&
      (x.previousRuntimeRevision??currentDev.runtimeRevision)===d.currentC3PreterminalAudit?.runtimeRevision&&
      x.receiptPath&&x.receiptBlob===gitBlob(x.receiptPath)&&
      receipt.sourceSha===x.sourceSha&&receipt.sourceTree===x.sourceTree&&
      receipt.hostingAfter===x.hostingVersion&&receipt.runtimeRevision===x.runtimeRevision&&
      hasVerifiedHostingAssets(receipt,x.previousC3SourceSha)&&receipt.productionUnchanged===true&&
      (m.productSource?.authorityState==='HOSTING_DEV_MATERIALIZED_PENDING_C3_E2E'||(pendingDev.pass&&m.productSource?.authorityState==='SOURCE_ONLY_PROVEN_PENDING_RUNTIME_AND_HOSTING_DEV')),
      'RELEASE_COMPOSITION_FAILURE:HOSTING_DEV_C3_TRANSITION_RECEIPT');
    }
  }
  check(p.progressByStageSemantics === 'HISTORICAL_SNAPSHOTS_NOT_RELEASE_AUTHORITY',
    'MAPPING_FAILURE:STALE_PROGRESS_AS_LIVE');
  check(p.state === 'HOLD' && d.production === 'DO_NOT_TOUCH' && p.production === 'DO_NOT_TOUCH' &&
    p.authorizationI4 !== true && d.terminalCertificationAllowed === false,
    'RELEASE_COMPOSITION_FAILURE:PREMATURE_PRODUCTION');

  return {pass: failures.length === 0, failures, matrixPath, sourceSha: d.productSourceSha,
    classificationCounts: actualCounts, domainCount: m.modules?.length || 0,
    status: 'CONTROL_CONTINUITY_ONLY_NOT_I3_CERTIFICATION'};
}

function main() {
  const d = readJson(DESCRIPTOR);
  const p = readJson(POINTER);
  const m = readJson(d.moduleTruthPath);
  const gitBlob = (file) => {
    try { return execFileSync('git', ['rev-parse', `HEAD:${file}`], {encoding: 'utf8'}).trim(); }
    catch { return ''; }
  };
  const result = validateShockContinuity({descriptor: d, pointer: p, matrix: m, gitBlob});
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (!result.pass) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
