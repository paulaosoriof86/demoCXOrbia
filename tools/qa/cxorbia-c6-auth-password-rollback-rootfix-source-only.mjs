#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const targetProfile='ac93d90d9e41512acdcd';
const sourcePlanPath=process.env.CXORBIA_SOURCE_PLAN||'.tmp/c6-auth-password-rollback-rootfix/source/plan-340-source-safe.json';
const outDir=process.env.CXORBIA_ROOTFIX_OUT_DIR||'.tmp/c6-auth-password-rollback-rootfix/export';
const freezePath='backend/config/c6-shopper-auth-final-freeze-v2.json';
const contractPath='backend/contracts/c6-auth-activation-dev-v1.json';
const activationEvidencePath='app/docs/evidence/C6-AUTH-ACTIVATION-DEV-PREWRITE-STOP-RETRY-20260807.json';
const dryrunPath='app/docs/evidence/CORTE6-CREDENTIAL-HANDOFF-DRYRUN-LATEST.json';
const importEvidencePath='app/docs/evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json';
const inventoryPath='app/docs/evidence/CORTE6-CREDENTIAL-INVENTORY-SOURCE-SAFE-V3.json';
const importerPath='tools/release/cxorbia-corte6-credential-import.mjs';
const publicKeyPath='backend/secure/corte6-credential-handoff-public.json';
const privateKeyEnvelopePath='backend/secure/corte6-credential-handoff-private.enc.json';
const credentialEnvelopePath='backend/private-inbox/corte6-credential-bundle.enc.json';
const profileExtraEnvelopePath='backend/private-inbox/corte6-profile-extra-bundle.enc.json';

const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ensure=(v,c)=>{if(!v)throw new Error(c)};
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');

function hermeticSelfTest(){
  const sample='SyntheticRollback123*';
  const hash=sha(Buffer.from(sample,'utf8'));
  ensure(/^[a-f0-9]{64}$/.test(hash),'SELFTEST_SHA256_HEX');
  const imported={passwordHashHex:hash,passwordHashAlgorithm:'SHA256',passwordHashRounds:1};
  ensure(imported.passwordHashAlgorithm==='SHA256'&&imported.passwordHashRounds===1,'SELFTEST_HASH_CONFIG');
  ensure(!Object.hasOwn(imported,'passwordSalt'),'SELFTEST_SALTLESS_CONTRACT');
  ensure(sha(Buffer.from(sample,'utf8'))===imported.passwordHashHex,'SELFTEST_HASH_REPRODUCIBLE');
  const key=crypto.randomBytes(32),iv=crypto.randomBytes(12),aad=Buffer.from('cxorbia-c6-rootfix-selftest-v1');
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(aad);
  const ct=Buffer.concat([cipher.update(Buffer.from(hash,'utf8')),cipher.final()]);const tag=cipher.getAuthTag();
  const dec=crypto.createDecipheriv('aes-256-gcm',key,iv);dec.setAAD(aad);dec.setAuthTag(tag);
  const plain=Buffer.concat([dec.update(ct),dec.final()]).toString('utf8');
  ensure(plain===hash,'SELFTEST_AES_GCM_ROUNDTRIP');
  return {decision:'PASS_HERMETIC_SELFTEST',sha256Rounds:1,saltlessSyntheticImport:true,aes256GcmRoundtrip:true};
}

for(const p of [sourcePlanPath,freezePath,contractPath,activationEvidencePath,dryrunPath,importEvidencePath,inventoryPath,importerPath,publicKeyPath,privateKeyEnvelopePath,credentialEnvelopePath]) ensure(fs.existsSync(p),'REQUIRED_SOURCE_MISSING:'+p);

const selfTest=hermeticSelfTest();
const plan=readJson(sourcePlanPath);
const freeze=readJson(freezePath);
const contract=readJson(contractPath);
const activation=readJson(activationEvidencePath);
const dryrun=readJson(dryrunPath);
const imported=readJson(importEvidencePath);
const inventory=readJson(inventoryPath);
const pub=readJson(publicKeyPath);
const priv=readJson(privateKeyEnvelopePath);
const envelope=readJson(credentialEnvelopePath);
const importer=fs.readFileSync(importerPath,'utf8');

ensure(Array.isArray(plan)&&plan.length===340&&new Set(plan.map(r=>r.profileFp)).size===340,'SOURCE_PLAN_340');
ensure(sha(JSON.stringify(plan))==='acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92','SOURCE_PLAN_DIGEST');
ensure(freeze.finalPlan?.compactRowsDigestSha256==='68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3','FREEZE_DIGEST');
ensure(freeze.finalPlan?.rows===340&&freeze.finalPlan?.uniqueRows===340&&freeze.finalPlan?.operationCounts?.HOLD===0,'FREEZE_340_HOLD0');
ensure(contract.prewrite?.passwordRollbackHardStop===true,'PASSWORD_ROLLBACK_HARDSTOP');
ensure(activation.prewrite?.blocker===`PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:${targetProfile}`&&activation.prewrite?.writeBoundaryEntered===false,'ACTIVATION_BLOCKER_LINEAGE');
ensure(Number(activation.writes?.providerWriteCalls||0)===0,'ACTIVATION_ZERO_PROVIDER_WRITES');

const target=plan.find(r=>r.profileFp===targetProfile);
ensure(target&&target.primary==='UPDATE_AUTH'&&target.changes?.password===true,'TARGET_PASSWORD_UPDATE');
ensure(target.changes?.email===true&&target.changes?.claims===true,'TARGET_CHANGE_VECTOR');
ensure(target.rollback==='restore_email_disabled_and_claims_snapshot_password_compensation_only','TARGET_PRIOR_ROLLBACK_CLASS');
const sameBase=plan.filter(r=>r.baseLoginFp&&r.baseLoginFp===target.baseLoginFp);
ensure(sameBase.length===2,'TARGET_BASE_LOGIN_GROUP_SIZE');
const peer=sameBase.find(r=>r.profileFp!==targetProfile);
ensure(peer&&peer.suffixApplied===false&&peer.resolutionBases?.includes('unique_technical_holder_preserves_unsuffixed_login'),'UNSUFFIXED_TECHNICAL_HOLDER_LINEAGE');
ensure(target.suffixApplied===true&&target.sourceSafeSurnameBasis==='multi_source_full_name_consensus','TARGET_CONSENSUS_SUFFIX_LINEAGE');

ensure(dryrun.hashContract?.algorithm==='SHA256'&&Number(dryrun.hashContract?.rounds)===1,'DRYRUN_HASH_CONTRACT');
ensure(imported.hashContract?.algorithm==='SHA256'&&Number(imported.hashContract?.rounds)===1&&imported.decision==='PASS_EXACT_AUTH_IMPORT_READBACK','IMPORT_HASH_CONTRACT');
ensure(inventory.migrationPlan?.keyFingerprintSha256===pub.fingerprintSha256,'INVENTORY_PUBLIC_KEY_FINGERPRINT');
ensure(pub.fingerprintSha256===priv.fingerprintSha256&&pub.fingerprintSha256===envelope.keyFingerprintSha256,'ENCRYPTED_LINEAGE_FINGERPRINT');
ensure(importer.includes("passwordHash:Buffer.from(r.passwordHashHex,'hex')"),'IMPORTER_HASH_SOURCE');
ensure(importer.includes("hash:{algorithm:'SHA256',rounds:1}"),'IMPORTER_SHA256_ROUNDS1');
ensure(!/passwordSalt\s*:/.test(importer),'IMPORTER_EXPECTED_SALTLESS_RECORDS');

const profileExtraEnvelopePresent=fs.existsSync(profileExtraEnvelopePath);
const sourceSafeTargetCredentialBindingProven=false;
const currentProviderPasswordStateProven=false;
const exactRollbackReconstructible=sourceSafeTargetCredentialBindingProven&&currentProviderPasswordStateProven;
const contractMutationAllowed=exactRollbackReconstructible;
const decision=exactRollbackReconstructible
  ? 'PASS_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_EXACT_REVERSIBILITY_PROVEN'
  : 'STOP_RETRY_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_TARGET_PRIOR_PASSWORD_NOT_PROVEN';

const evidence={
  schemaVersion:'cxorbia.c6.auth-password-rollback-rootfix-source-only.evidence.v1',
  generatedAt:new Date().toISOString(),
  decision,
  repository:'paulaosoriof86/demoCXOrbia',branch:'docs-tya-v6-v71-audit',pullRequest:7,
  target:{profileFingerprint:targetProfile,planClass:target.primary,changes:{email:true,password:true,claims:true}},
  lineage:{
    sourcePlanRows:plan.length,
    sourcePlanDigest:'acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92',
    finalPlanDigest:freeze.finalPlan.compactRowsDigestSha256,
    activationRunId:activation.source?.workflowRunId,
    activationArtifactId:activation.source?.artifactId,
    activationPrewriteBlocker:activation.prewrite?.blocker,
    priorRollbackClassification:target.rollback
  },
  credentialSources:{
    encryptedCredentialBundlePresent:true,
    encryptedPrivateKeyEnvelopePresent:true,
    keyFingerprintMatch:true,
    legacyImportAlgorithm:'SHA256',
    legacyImportRounds:1,
    legacyImportPerUserSaltField:false,
    profileExtraEncryptedEnvelopePresent:profileExtraEnvelopePresent,
    targetSourceSafeSurnameBasis:target.sourceSafeSurnameBasis,
    targetSuffixApplied:Boolean(target.suffixApplied),
    sameVisibleBaseLoginProfiles:sameBase.length,
    peerUniqueTechnicalHolderProven:true
  },
  reversibility:{
    saltlessLegacyImportIsValidSourceContract:true,
    sourceSafeTargetCredentialBindingProven,
    currentPriorPasswordStateProven,
    exactRollbackReconstructible,
    contractMutationAllowed,
    reason:'Existing encrypted legacy credential material proves a saltless SHA256/1 import lineage globally, but the frozen source-safe lineage does not bind the current prewrite password state of this specific UPDATE_AUTH target to an exact recoverable hash. The target is the suffixed consensus member of a two-profile base-login group while the peer is the unique technical holder. No provider read is permitted in this block, and no prior encrypted prewrite password snapshot exists because activation stopped before the write boundary.'
  },
  selfTest,
  minimumAlternative:{
    classification:'ONE_TARGET_PROVIDER_READONLY_PASSWORD_ROLLBACK_SNAPSHOT_REQUIRED',
    scope:'single current Auth target for profile fingerprint only',
    requiredEvidence:['current passwordHash availability','passwordSalt nullable/empty explicitly distinguished from unavailable','effective hash algorithm/config required to restore exact hash','encrypted snapshot before any future Auth write'],
    writesAuthorized:false,
    ifHashStillUnavailable:'EXPLICIT_TENANT_AUTHORIZATION_REQUIRED_TO_RELAX_EXACT_PASSWORD_ROLLBACK_FOR_THIS_ONE_TARGET; do not infer or compensate silently'
  },
  safety:{providerReads:0,authReads:0,firestoreReads:0,hrReads:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,cloudBuilds:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,piiExported:false,uidExported:false,emailExported:false,passwordExported:false,passwordHashExported:false}
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'evidence-source-safe.json'),JSON.stringify(evidence,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'decision.txt'),decision+'\n','utf8');
console.log(decision);
console.log(JSON.stringify({selfTest:selfTest.decision,exactRollbackReconstructible,contractMutationAllowed,profileExtraEnvelopePresent,providerReads:0,providerWrites:0}));
process.exit(exactRollbackReconstructible?0:2);
