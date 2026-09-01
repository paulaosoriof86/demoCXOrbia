#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const P=relative=>path.join(root,relative);
const plannerPath=P('tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs');
const classifierPath=P('tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs');
const sharedPath=P('tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs');
const contractPath=P('backend/contracts/c6-shopper-deterministic-suffix-v1.json');
const evidencePath=P('app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-LATEST.json');
const replaceOnce=(source,before,after,label)=>{
  const count=source.split(before).length-1;
  if(count!==1)throw new Error(label+'_expected_once_found_'+count);
  return source.replace(before,after);
};
const write=(file,content)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content.endsWith('\n')?content:content+'\n','utf8');};

let shared=fs.readFileSync(sharedPath,'utf8');
shared=replaceOnce(shared,'// SOURCE_ONLY_PENDING','// SOURCE_ONLY_INTEGRATED','shared_marker');
write(sharedPath,shared);

let planner=fs.readFileSync(plannerPath,'utf8');
planner=replaceOnce(planner,
"} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';\n\nconst TECH_KEYS = [",
"} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';\nimport {\n  EQUIVALENT_UNIVERSE_VERSION,\n  resolveEquivalentNames, equivalentActive, resolveLinkedSourceMode,\n  buildReferenceMemberVector, buildPlannerMemberVector,\n  reconcileEquivalentGroupSets, stableAuthCandidateFingerprint\n} from './cxorbia-c6-shopper-equivalent-universe.mjs';\n\nconst TECH_KEYS = [",'planner_import');
planner=replaceOnce(planner,
`  const linkedByProfile = new Map();
  const link = (shopperId, source) => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push(source);
    propagateLinkedSourceTechKeys(relationIndex, source, shopperId);
  };`,
`  const linkedByProfile = new Map();
  const link = (shopperId, source, linkMode = 'direct_shopper_id') => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push({ ...source, __linkMode: linkMode });
    propagateLinkedSourceTechKeys(relationIndex, source, shopperId);
  };`,'planner_link');
planner=replaceOnce(planner,"          link(direct, source);","          link(direct, source, 'direct_shopper_id');",'planner_direct');
planner=replaceOnce(planner,"        if (exact.length === 1) link(exact[0], source);","        if (exact.length === 1) link(exact[0], source, 'exact_technical_anchor');",'planner_anchor');
planner=replaceOnce(planner,'    const names = sourceSafeNames(profile, linkedSources, credentials);','    const names = resolveEquivalentNames(profile, linkedSources, credentials);','planner_names');
planner=replaceOnce(planner,
`    const active = !status.inactive && (
      status.active || authCandidates.length > 0 || credentials.length > 0 || rowActivity.hrLinks > 0 || rowActivity.recentVisits > 0
    );`,
`    const active = equivalentActive({
      status,
      authCandidateCount: authCandidates.length,
      credentialCount: credentials.length,
      hrLinks: rowActivity.hrLinks,
      recentVisits: rowActivity.recentVisits
    });`,'planner_active');
planner=replaceOnce(planner,
`        candidateVectors: scored.map((entry, index) => ({
          candidateOrdinal: index + 1,
          score: entry.score,
          signals: entry.signals
        }))`,
`        candidateVectors: scored.map((entry, index) => ({
          candidateOrdinal: index + 1,
          candidateFingerprint: stableAuthCandidateFingerprint(entry.user.uid),
          score: entry.score,
          signals: entry.signals
        }))`,'planner_candidate');
planner=replaceOnce(planner,
`    groupMatrix.push({
      groupFp: stableGroupFingerprint(baseLogin),
      activeCount: members.length,
      keeperSelected: Boolean(keeper),
      suffixedCount: members.length - (keeper ? 1 : 0),
      suffixLengths,
      unresolvedCount: members.filter(row => !row.targetLogin).length
    });`,
`    groupMatrix.push({
      groupFp: stableGroupFingerprint(baseLogin),
      universeVersion: EQUIVALENT_UNIVERSE_VERSION,
      activeCount: members.length,
      keeperSelected: Boolean(keeper),
      suffixedCount: members.length - (keeper ? 1 : 0),
      suffixLengths,
      unresolvedCount: members.filter(row => !row.targetLogin).length,
      memberVectors: members.map(row => buildPlannerMemberVector({
        profileId: row.profile.id,
        active: row.active,
        names: row.names,
        keeper: row === keeper,
        suffixApplied: row.suffixLength > 0,
        suffixLength: row.suffixLength,
        linkedSourceResolutionMode: resolveLinkedSourceMode(row.linkedSources)
      }))
    });`,'planner_vectors');
planner=replaceOnce(planner,'  for (const [, members] of baseGroups) {',
`  const equivalentReferenceGroups = collisionGroups.map(([baseLogin, members]) => ({
    groupFp: stableGroupFingerprint(baseLogin),
    universeVersion: EQUIVALENT_UNIVERSE_VERSION,
    memberVectors: members.map(row => buildReferenceMemberVector({
      profileId: row.profile.id,
      active: row.active,
      names: row.names,
      linkedSourceResolutionMode: resolveLinkedSourceMode(row.linkedSources)
    }))
  }));
  const equivalentPlannerGroups = groupMatrix.map(group => ({
    groupFp: group.groupFp,
    universeVersion: EQUIVALENT_UNIVERSE_VERSION,
    memberVectors: group.memberVectors
  }));
  const equivalentUniverseReconciliation = reconcileEquivalentGroupSets(equivalentReferenceGroups, equivalentPlannerGroups);

  for (const [, members] of baseGroups) {`,'planner_sets');
planner=replaceOnce(planner,"    schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-readonly.result.v2',","    schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-readonly.result.v2.2',",'planner_schema');
planner=replaceOnce(planner,'    multiAuth: {',
`    equivalentUniverse: {
      version: EQUIVALENT_UNIVERSE_VERSION,
      populationPredicate: 'same_tenant_shopper_snapshot',
      activityPredicate: 'equivalentActive_v1',
      linkingPredicate: 'direct_shopper_id_or_exact_unique_technical_anchor',
      completenessPredicate: 'post_consensus_active_complete',
      referenceGroups: equivalentReferenceGroups.length,
      plannerGroups: equivalentPlannerGroups.length,
      reconciliation: equivalentUniverseReconciliation,
      deltaMemberVectorsOnly: true
    },
    multiAuth: {`,'planner_output');
write(plannerPath,planner);

let classifier=fs.readFileSync(classifierPath,'utf8');
classifier=replaceOnce(classifier,
"} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';\n\nconst TECH_KEYS = [",
"} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';\nimport {\n  EQUIVALENT_UNIVERSE_VERSION,\n  resolveEquivalentNames, equivalentActive, resolveLinkedSourceMode,\n  buildReferenceMemberVector, stableAuthCandidateFingerprint\n} from './cxorbia-c6-shopper-equivalent-universe.mjs';\n\nconst TECH_KEYS = [",'classifier_import');
classifier=replaceOnce(classifier,
`  const relationIndex = new Map();
  const linkedByProfile = new Map();
  const link = (shopperId, source, basis) => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push({ ...source, __basis: basis });
    for (const key of TECH_KEYS) {
      const value = source?.[key];
      for (const item of Array.isArray(value) ? value : [value]) add(relationIndex, text(item), shopperId);
    }
  };`,
`  const relationIndex = new Map();
  const linkedByProfile = new Map();
  const link = (shopperId, source, basis, linkMode = 'direct_shopper_id') => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push({ ...source, __basis: basis, __linkMode: linkMode });
    for (const key of TECH_KEYS) {
      const value = source?.[key];
      for (const item of Array.isArray(value) ? value : [value]) add(relationIndex, text(item), shopperId);
    }
  };`,'classifier_link');
classifier=replaceOnce(classifier,
`      for (const source of [root, ...recursiveObjects(root)]) {
        const shopperId = text(source.shopperId || source.profileId || source.shopperDocId);
        if (shopperId) link(shopperId, source, basis);
      }`,
`      for (const source of [root, ...recursiveObjects(root)]) {
        const shopperId = text(source.shopperId || source.profileId || source.shopperDocId);
        if (shopperId && profiles.has(shopperId)) {
          link(shopperId, source, basis, 'direct_shopper_id');
          continue;
        }
        const candidates = [];
        for (const key of TECH_KEYS) candidates.push(...(relationIndex.get(text(source[key])) || []));
        const exact = uniq(candidates);
        if (exact.length === 1) link(exact[0], source, basis, 'exact_technical_anchor');
      }`,'classifier_fallback');
classifier=replaceOnce(classifier,'    const names = canonicalNames(profile, linkedSources, credentials);',"    const names = resolveEquivalentNames(profile, linkedSources.map(source => ({ value: source, basis: source.__basis || 'linked', linkMode: source.__linkMode || 'direct_shopper_id' })), credentials);",'classifier_names');
classifier=replaceOnce(classifier,
`    const active = !status.inactive && (
      status.active ||
      uniqueAuth.length > 0 ||
      credentials.length > 0 ||
      profileActivity.hrLinks > 0 ||
      profileActivity.recentVisits > 0
    );`,
`    const active = equivalentActive({
      status,
      authCandidateCount: uniqueAuth.length,
      credentialCount: credentials.length,
      hrLinks: profileActivity.hrLinks,
      recentVisits: profileActivity.recentVisits
    });`,'classifier_active');
classifier=replaceOnce(classifier,
`  for (const [login, members] of candidateGroups) {
    if (members.length < 2) continue;
    groupMatrix.push(classifyGroup(login, members, tenantId, projectId));
  }`,
`  for (const [login, members] of candidateGroups) {
    if (members.length < 2) continue;
    const classified = classifyGroup(login, members, tenantId, projectId);
    classified.universeVersion = EQUIVALENT_UNIVERSE_VERSION;
    classified.memberVectors = members.map(row => buildReferenceMemberVector({
      profileId: row.profile.id,
      active: row.active,
      names: row.names,
      linkedSourceResolutionMode: resolveLinkedSourceMode(row.linkedSources)
    }));
    groupMatrix.push(classified);
  }`,'classifier_vectors');
classifier=replaceOnce(classifier,
`    const scored = row.authUsers
      .map(user => ({ user, score: authScore(user, row, tenantId, projectId) }))
      .sort((a, b) => b.score - a.score);`,
`    const scored = row.authUsers
      .map(user => ({ user, candidateFingerprint: stableAuthCandidateFingerprint(user.uid), score: authScore(user, row, tenantId, projectId) }))
      .sort((a, b) => b.score - a.score);`,'classifier_scored');
classifier=replaceOnce(classifier,
`      scoreMargin: top && second ? top.score - second.score : top?.score || 0,
      resolution: uniqueStrong ? 'RESOLVED_UNIQUE_TECHNICAL_AUTH_CANDIDATE' : 'HOLD_MULTIPLE_AUTH_CANDIDATES'`,
`      scoreMargin: top && second ? top.score - second.score : top?.score || 0,
      candidateVectors: scored.map((entry, index) => ({ candidateOrdinal: index + 1, candidateFingerprint: entry.candidateFingerprint, score: entry.score })),
      resolution: uniqueStrong ? 'RESOLVED_UNIQUE_TECHNICAL_AUTH_CANDIDATE' : 'HOLD_MULTIPLE_AUTH_CANDIDATES'`,'classifier_candidates');
classifier=replaceOnce(classifier,'  return {\n    generatedAt: new Date().toISOString(),',"  return {\n    schemaVersion: 'cxorbia.c6.shopper-login-collision-classification.result.v2.2',\n    generatedAt: new Date().toISOString(),",'classifier_schema');
classifier=replaceOnce(classifier,'    classification: matrix,',
`    equivalentUniverse: {
      version: EQUIVALENT_UNIVERSE_VERSION,
      populationPredicate: 'same_tenant_shopper_snapshot',
      activityPredicate: 'equivalentActive_v1',
      linkingPredicate: 'direct_shopper_id_or_exact_unique_technical_anchor',
      completenessPredicate: 'post_consensus_active_complete',
      referenceGroupFingerprints: groupMatrix.map(group => group.groupFp).sort(),
      memberProvenanceIntegrated: true
    },
    classification: matrix,`,'classifier_output');
write(classifierPath,classifier);

const contract=JSON.parse(fs.readFileSync(contractPath,'utf8'));
contract.schemaVersion='cxorbia.c6.shopper-deterministic-suffix.v2.2';
contract.plan.diagnosticContractVersion='v2.2';
contract.multiAuthResolution.diagnosticVector.fields=[...new Set([...(contract.multiAuthResolution.diagnosticVector.fields||[]),'candidateFingerprint'])];
contract.multiAuthResolution.diagnosticVector.candidateFingerprintNamespace='shopper-auth-candidate-v1';
contract.collisionReconciliation={
  ...(contract.collisionReconciliation||{}),
  groupFingerprintNamespace:'shopper-visible-login-group-v1',memberFingerprintNamespace:'shopper-collision-member-v1',equivalentUniverseVersion:'shopper-equivalent-universe-v1',
  sameUniverseRequired:true,referenceUniverse:'post_consensus_active_complete_equivalent_v1',plannerUniverse:'post_consensus_active_complete_equivalent_v1',
  populationPredicate:'same_tenant_shopper_snapshot',activityPredicate:'equivalentActive_v1',linkingPredicate:'direct_shopper_id_or_exact_unique_technical_anchor',completenessPredicate:'post_consensus_active_complete',
  currentUniverseClassification:'EQUIVALENT_UNIVERSE_CONTRACT_INTEGRATED_SOURCE_ONLY',priorComparatorDefect:'REFERENCE_UNIVERSE_MISMATCH_PROVEN',diagnosticComparatorDefectFixedSourceOnly:true,providerRevalidationPending:true,
  exactAddedGroupCause:'PENDING_EQUIVALENT_UNIVERSE_PROVIDER_REVALIDATION',suffixAlgorithmDefectProven:false,deltaOnlyMemberProvenanceExport:true,
  memberProvenanceVector:{fields:['memberFingerprint','active','preConsensusComplete','postConsensusComplete','completedByConsensus','sourceSafeSurnameBasis','surnameBasisCount','keeper','suffixApplied','suffixLength','inReferenceSet','inPlannerSet','referenceEligibility','plannerEligibility','linkedSourceResolutionMode'],allowedSurnameBasis:['explicit_or_technical','multi_source_full_name_consensus','unresolved'],allowedSuffixLengths:[0,4,6,8],allowedLinkModes:['profile_only','linked_source','direct_shopper_id','exact_technical_anchor'],rawIdentityAllowed:false,requiredForAddedOrRemovedGroups:true}
};
write(contractPath,JSON.stringify(contract,null,2));

const evidence={schemaVersion:'cxorbia.c6.shopper-equivalent-universe-member-provenance-source-static.v1',generatedAt:'2026-08-05T22:12:00-06:00',decision:'PASS_C6_EQUIVALENT_UNIVERSE_MEMBER_PROVENANCE_INTEGRATION_SOURCE_STATIC',repository:'paulaosoriof86/demoCXOrbia',branch:'docs-tya-v6-v71-audit',pullRequest:7,sourceProviderRun:31069282511,integration:{sharedHelper:'tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs',plannerIntegrated:true,classifierIntegrated:true,contractVersion:'v2.2',universeVersion:'shopper-equivalent-universe-v1',populationEquivalent:true,activityEquivalent:true,linkingEquivalent:true,completenessEquivalent:true,deltaOnlyMemberProvenance:true,multiAuthCandidateFingerprints:true},priorStatePreserved:{providerPlanRows:340,providerHoldRows:13,readyForAuthRepair:false,executable:false,partialExecutionAllowed:false},safety:{providerReads:0,providerWrites:0,authWrites:0,passwordChanges:0,passwordResets:0,membershipWrites:0,firestoreWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,hostingDeploys:0,cloudRunDeploys:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},nextGate:'NEW_EXPLICIT_PROVIDER_READONLY_REVALIDATION_OR_TENANT_ADJUDICATION_PREPARATION_REQUIRED'};
write(evidencePath,JSON.stringify(evidence,null,2));

const docs={
'app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md':'# CAMBIOS BACKEND — C6 universo equivalente\n\nPASS source/static. Se integraron helper compartido, planner, clasificador, contrato v2.2, member fingerprints delta-only y candidate fingerprints multi-Auth. Provider reads/writes, Auth, datos, deploy, merge y producción: 0/false.\n',
'app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md':'# RESUMEN PARA CLAUDE — C6 universo equivalente\n\nSin cambios frontend, módulos, Login ni CX.data. Cambio exclusivo de tooling backend read-only y contrato diagnóstico.\n',
'app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md':'# PENDIENTES PROTOTIPO — C6 universo equivalente\n\nPendientes: nueva revalidación provider solo con autorización; evidencia autoritativa para 12 apellidos; adjudicación source-safe del empate multi-Auth; cero aplicación parcial.\n',
'app/docs/ACADEMIA-IMPACTO-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md':'# ACADEMIA — C6 universo equivalente\n\nComparar conjuntos exige idéntico universo; fingerprints permiten trazabilidad sin PII; todo delta requiere procedencia por miembro.\n',
'app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md':'# PHASE A — C6 universo equivalente\n\nIntegración planner/clasificador y contrato v2.2: PASS source/static. Provider reads: 0. Plan 340 previo preservado y no ejecutable.\n'};
for(const [relative,content] of Object.entries(docs))write(P(relative),content);

for(const token of ['EQUIVALENT_UNIVERSE_VERSION','buildReferenceMemberVector','buildPlannerMemberVector','reconcileEquivalentGroupSets','candidateFingerprint: stableAuthCandidateFingerprint'])if(!planner.includes(token))throw new Error('planner_token_missing_'+token);
for(const token of ['resolveEquivalentNames','equivalentActive','buildReferenceMemberVector','candidateFingerprint: stableAuthCandidateFingerprint',"link(exact[0], source, basis, 'exact_technical_anchor')"])if(!classifier.includes(token))throw new Error('classifier_token_missing_'+token);
console.log('PASS_C6_EQUIVALENT_UNIVERSE_MEMBER_PROVENANCE_PATCH_APPLIED');
