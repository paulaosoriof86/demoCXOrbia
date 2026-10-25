#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const paths = {
  overlay: 'backend/config/c6-skip13-access-reconciliation-overlay-v1.json',
  freeze: 'backend/config/c6-shopper-auth-final-freeze-v1.json',
  provider: 'app/docs/evidence/C6-SKIP13-PROVIDER-READONLY-REVALIDATION-V2-HOLD-20260807.json',
  residual: 'app/docs/evidence/CORTE6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-LATEST.json',
  diagnostic: 'app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-LATEST.json'
};
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const overlay = read(paths.overlay);
const freeze = read(paths.freeze);
const provider = read(paths.provider);
const residual = read(paths.residual);
const diagnostic = read(paths.diagnostic);
const checks = {};
const eq = (a,b) => JSON.stringify(a) === JSON.stringify(b);

checks.freezeRows340 = freeze.planFreeze?.rows === 340 && freeze.planFreeze?.uniqueRows === 340;
checks.freezeDigestExact = freeze.planFreeze?.planDigestSha256 === '6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b';
checks.providerResolved13 = provider.scope?.resolvedProfiles === 13 && provider.scope?.requestedProfiles === 13;
checks.providerEffective8x9 = provider.aggregate?.profilesWithUnplannedEffectiveAccess === 8 && provider.aggregate?.authCandidates === 9 && provider.aggregate?.effectiveOwnShopperAccessCandidates === 9;
checks.overlayEightProfiles = Array.isArray(overlay.profiles) && overlay.profiles.length === 8 && new Set(overlay.profiles.map(x=>x.profileFingerprint)).size === 8;
checks.overlayNineCandidates = new Set(overlay.profiles.flatMap(x=>x.candidateFingerprints||[])).size === 9;
checks.providerMappingExact = (() => {
  const providerMap = provider.profiles.filter(x=>x.candidateCount>0).map(x=>[x.profileFingerprint,[...(x.candidateFingerprints||[])].sort()]).sort((a,b)=>a[0].localeCompare(b[0]));
  const overlayMap = overlay.profiles.map(x=>[x.profileFingerprint,[...(x.candidateFingerprints||[])].sort()]).sort((a,b)=>a[0].localeCompare(b[0]));
  return eq(providerMap, overlayMap);
})();
checks.sevenUniqueCanonical = overlay.profiles.filter(x=>x.technicalClass==='CANONICAL_CURRENT_EFFECTIVE_AUTH_UNIQUE'&&x.candidateFingerprints?.length===1&&x.primaryTransition==='PRESERVE_NO_AUTH_TO_NO_OP').length === 7;
checks.blockingProfileExact = (() => {
  const b=overlay.profiles.find(x=>x.profileFingerprint==='7cc28c78de9bfda01d14');
  return Boolean(b && b.technicalClass==='DUPLICATE_EFFECTIVE_AUTH_PAIR_UNRESOLVED_KEEPER' && b.primaryTransition==='PRESERVE_NO_AUTH_TO_HOLD' && eq([...b.candidateFingerprints].sort(), ['4e6d26551d11db444bd0','9b2b7ca1bd72c1301d29'].sort()));
})();
checks.priorTieStillUndiscriminated = residual.multiAuthHold?.profileFp === '7cc28c78de9bfda01d14' && residual.multiAuthHold?.notProven?.includes('which Auth account is canonical') && diagnostic.multiAuthResidual?.automaticSelectionAllowed === false;
checks.noForbiddenSelectorUsed = (overlay.classificationContract?.forbiddenSelectors||[]).every(x=>['creationTime','candidateOrdinal','firstReturned','enabledStateAlone','emailVerifiedAlone'].includes(x));
checks.noHistoricalAliasFabricated = overlay.profiles.every(x=>x.classification!=='ALIAS_HISTORICO');
checks.noRetireFabricated = overlay.profiles.every(x=>!x.candidateDispositions || x.candidateDispositions.every(c=>c.retireAccess===null));
checks.provisionalRowsUniqueAndNonOverlapping = (()=>{
  const c=overlay.derivedProvisionalPlanState?.operationCounts||{};
  return overlay.derivedProvisionalPlanState?.rows===340 && overlay.derivedProvisionalPlanState?.uniqueRows===340 && overlay.derivedProvisionalPlanState?.onePrimaryOperationPerProfile===true && (c.CREATE_AUTH+c.UPDATE_AUTH+c.NO_OP+c.HOLD+c.PRESERVE_NO_AUTH)===340;
})();
checks.holdZeroNotSatisfied = overlay.derivedProvisionalPlanState?.operationCounts?.HOLD===1 && overlay.derivedProvisionalPlanState?.targetHoldZeroSatisfied===false && overlay.derivedProvisionalPlanState?.executable===false;
checks.frozenPlanNotModified = overlay.frozenPlan?.modifiedByThisOverlay===false && overlay.frozenPlan?.digest===freeze.planFreeze?.planDigestSha256;
checks.zeroOperationalEffects = Object.entries(overlay.safety||{}).every(([k,v]) => ['merge','production'].includes(k) ? v===false : v===0);
checks.historyPreserved = Object.values(overlay.preservation||{}).every(v=>v===0);

const failed = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const decision = failed.length
  ? 'HOLD_C6_SKIP13_ACCESS_RECONCILIATION_SOURCE_VALIDATION_FAILED'
  : 'STOP_RETRY_C6_SKIP13_ACCESS_RECONCILIATION_MULTI_AUTH_KEEPER_UNRESOLVED';
const result = {
  schemaVersion:'cxorbia.c6.skip13-access-reconciliation-source-only.result.v1',
  generatedAt:new Date().toISOString(),
  decision,
  checks,
  failed,
  classification:{
    canonicalCurrentEffectiveAuthUniqueProfiles:7,
    historicalAliasCandidatesProven:0,
    duplicateEffectiveProfiles:1,
    duplicateEffectiveCandidates:2,
    accessToRetireCandidatesProven:0,
    unresolvedKeeperProfiles:1
  },
  provisionalPlan:overlay.derivedProvisionalPlanState,
  safety:overlay.safety,
  evidenceDigest:'sha256:'+crypto.createHash('sha256').update(JSON.stringify({checks,classification:overlay.profiles,provisionalPlan:overlay.derivedProvisionalPlanState})).digest('hex')
};
fs.mkdirSync('.tmp/c6-skip13-access-reconciliation-source-only',{recursive:true});
fs.writeFileSync('.tmp/c6-skip13-access-reconciliation-source-only/result.json',JSON.stringify(result,null,2)+'\n','utf8');
console.log(decision);
if(failed.length) process.exitCode=1;
