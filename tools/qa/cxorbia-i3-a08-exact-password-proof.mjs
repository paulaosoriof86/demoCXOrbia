// QA credential provenance only. A proved existing login alias is not username canonization.
import crypto from 'node:crypto';
import {historicalReceiptProof} from './cxorbia-i3-terminal-human-contract.mjs';
export const A08_PASSWORD_EXCEPTION_IDS=Object.freeze(['shopper_gt_a092a0647f','shopper_hn_3b3c2f5cc1','shp-3669abbb015a']);
export const A08_USER_ADMIN_PATH='/api/tenants/tya/users';
const str=x=>String(x??'').trim();
export function assessExactPasswordProof({shopperId,expected,visibleLogin,sealedHashes}){
  const visible=str(visibleLogin).toLowerCase();
  const ruleAvailable=expected?.ok===true&&Boolean(str(expected?.password))&&Boolean(str(expected?.login));
  const canonicalLoginMatches=ruleAvailable&&str(expected.login).toLowerCase()===visible;
  const exactAliasAllowed=!canonicalLoginMatches&&A08_PASSWORD_EXCEPTION_IDS.includes(str(shopperId));
  const proof=Array.isArray(sealedHashes)?sealedHashes:[];
  const base={ruleAvailable,canonicalLoginMatches,exactAliasAllowed,sealedRecordCount:proof.length,
    credentialHashMatches:false,allowed:false,usernameCanonizationProven:false};
  if(!ruleAvailable)return {...base,reason:'CANONICAL_CREDENTIAL_RULE_INCOMPLETE'};
  if(!visible)return {...base,reason:'EXISTING_VISIBLE_LOGIN_MISSING'};
  if(!canonicalLoginMatches&&!exactAliasAllowed)return {...base,reason:'CANONICAL_LOGIN_MISMATCH_OUTSIDE_EXACT_EXCEPTIONS'};
  if(proof.length!==1||!/^[a-f0-9]{64}$/.test(str(proof[0])))return {...base,reason:'UNIQUE_SEALED_PASSWORD_HASH_MISSING'};
  const matches=crypto.createHash('sha256').update(String(expected.password),'utf8').digest('hex')===proof[0];
  if(!matches)return {...base,reason:'SEALED_PASSWORD_HASH_MISMATCH'};
  return {...base,credentialHashMatches:true,allowed:true,reason:'EXACT_CREDENTIAL_PROVEN',
    provenance:canonicalLoginMatches?'EXACT_SEALED_HASH_CANONICAL_RULE_AND_AUTH_CLAIMS':'EXACT_SEALED_HASH_EXISTING_LOGIN_ALIAS_AND_AUTH_CLAIMS'};
}

// Explicit current-provider provenance, never selected as a password fallback.
// The provider writes a deterministic rule, not a SHA256 secret. These flags only
// authorize ONE existing recipe; the real browser password session must still prove it.
const hash=x=>crypto.createHash('sha256').update(String(x),'utf8').digest('hex');
const list=x=>Array.isArray(x)?x:[];
const RULE='tya-shopper-primer-nombre-primer-apellido-v2';
const SWEEP='cxorbia-durable-shopper-credential-sweep-v2';
const PROOF='cxorbia-shopper-password-proof-v2';
export function sameKeeperSealedHashes(records,uid){
  return list(records).filter(r=>r?.kind==='shopper'&&str(r.authNamespace||'shopper')==='shopper'&&
    'tya-sh-'+hash('tya\0shopper\0'+str(r.normalizedLogin||r.loginIdentifier).toLowerCase()).slice(0,24)===uid&&
    r.passwordHashAlgorithm==='SHA256'&&r.passwordHashRounds===1&&/^[a-f0-9]{64}$/.test(str(r.passwordHashHex))).map(r=>r.passwordHashHex);
}
// RUN2529 already proved that historical adjudication links stored their ACK in
// the exactly referenced command receipt. Reuse that strict authority contract;
// only an absent inline field may qualify, never false/null/string or a diagnostic.
export function a08AdjudicationAck({link,receipt,providerRead={}}={}){
  const present=!!link&&Object.hasOwn(link,'providerAck');
  const inlineState=!present?'ABSENT':link.providerAck===true?'TRUE':link.providerAck===false?'FALSE':link.providerAck===null?'NULL':'NON_BOOLEAN';
  const base={allowed:false,mode:'UNPROVEN',inlineState,historicalReceiptBound:false};
  if(link?.providerAck===true)return {...base,allowed:true,mode:'EXPLICIT_LINK_ACK'};
  if(!link||present||providerRead.complete!==true||providerRead.stage!=='COMPLETE'||
    providerRead.receiptExists!==true||providerRead.linkExists!==true)return base;
  const ref=str(link.authorityRef);
  const proof=historicalReceiptProof({...link,id:providerRead.linkDocumentId,_documentPath:providerRead.linkDocumentPath},{
    tenantId:'tya',projectId:'cinepolis',commandReceipts:new Map([[ref,{
      exists:providerRead.receiptExists,id:providerRead.receiptDocumentId,path:providerRead.receiptDocumentPath,data:receipt
    }]])
  });
  return proof?{...base,allowed:true,mode:proof.mode,historicalReceiptBound:true}:base;
}
export function assessCurrentProviderPasswordProof({shopperId,uid,member,profile,authUser,expected,cross,receipt,link,sealedHashes=[],providerRead={}}){
  const result={allowed:false,ruleAvailable:expected?.ok===true,canonicalLoginMatches:false,exactAliasAllowed:false,
    credentialHashMatches:false,sealedRecordCount:sealedHashes.length,usernameCanonizationProven:false,durableProviderProof:false};
  const stop=reason=>({...result,reason});
  if(!A08_PASSWORD_EXCEPTION_IDS.includes(shopperId))return stop('CURRENT_PROVIDER_TARGET_NOT_AUTHORIZED');
  if(!expected?.ok||expected.ruleVersion!==RULE||!str(expected.password))return stop('CURRENT_PROVIDER_RULE_INCOMPLETE');
  const login=str(member?.visibleLogin).toLowerCase(),profileLogin=str(profile?.visibleLogin||profile?.username||profile?.user).toLowerCase();
  if(!login||login!==profileLogin)return stop('CURRENT_PROVIDER_LOGIN_PARITY_MISSING');
  result.canonicalLoginMatches=login===str(expected.login).toLowerCase();result.exactAliasAllowed=!result.canonicalLoginMatches;
  // Rule password depends only on first name. A later HR first-name change must never
  // cause an alternative credential attempt for an adjudicated keeper.
  if(login.split('.')[0]!==str(expected.login).toLowerCase().split('.')[0])return stop('CURRENT_PROVIDER_FIRST_NAME_AUTHORITY_CHANGED');
  const versions=o=>o?.credentialRuleVersion===RULE&&o?.credentialSweepVersion===SWEEP&&
    o?.credentialPasswordProofVersion===PROOF&&o?.credentialPasswordRuleVersion===RULE;
  if(!versions(member)||!versions(profile)||member.credentialState!=='enrolled')return stop('CURRENT_PROVIDER_DURABLE_RULE_PROOF_MISSING');
  const fingerprint=hash('cxorbia-provider-uid-v1\0'+uid),claims=authUser?.customClaims||{};
  if(member.active!==true||member.tenantId!=='tya'||member.role!=='shopper'||member.authNamespace!=='shopper'||
    member.shopperId!==shopperId||!list(member.projectIds).includes('cinepolis')||member.providerUidFingerprint!==fingerprint||
    authUser?.uid!==uid||authUser?.disabled===true||claims.tenantId!=='tya'||claims.role!=='shopper'||claims.authNamespace!=='shopper'||
    claims.shopperId!==shopperId||!list(claims.projectIds).includes('cinepolis')||
    str(authUser.email).toLowerCase()!==hash('tya\0shopper\0'+login).slice(0,48)+'@auth.cxorbia.invalid')return stop('CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH');
  if(str(profile.tenantId||'tya')!=='tya'||str(profile.shopperId||shopperId)!==shopperId||profile.identityState==='superseded_exact_alias'||
    !list(profile.projectIds).includes('cinepolis')||cross?.tenantId!=='tya'||cross.shopperId!==shopperId||
    cross.sourceStableKey!==shopperId||cross.providerUidFingerprint!==fingerprint)return stop('CURRENT_PROVIDER_CROSSWALK_MISMATCH');
  const ref=str(profile.identityAuthorityRef);
  if(profile.identityAuthority==='tenant_adjudication'){
    const linkAck=a08AdjudicationAck({link,receipt,providerRead});
    if(!/^[a-f0-9]{40}$/.test(ref)||!member.identityConsolidatedAt||!profile.identityConsolidatedAt||cross.identityAuthorityRef!==ref||
      receipt?.status!=='committed'||receipt.commandType!=='shopper.identity.adjudicate'||receipt.providerAck!==true||receipt.identityConsolidated!==true||
      receipt.shopperId!==shopperId||receipt.keeperUidFingerprint!==fingerprint||!str(receipt.actorUid)||!/^[a-f0-9]{64}$/.test(str(receipt.commandDigest))||
      !/^irl_[a-f0-9]{32}$/.test(str(receipt.identityLinkId))||link?.identityLinkId!==receipt.identityLinkId||link.tenantId!=='tya'||
      !['*','cinepolis'].includes(link.projectScope)||!['active','confirmed','approved','materialized'].includes(link.status||link.state)||
      link.canonicalShopperId!==shopperId||link.authorityType!=='tenant_adjudication'||link.authorityRef!==ref||
      !linkAck.allowed||link.humanConfirmed!==true||link.fuzzyMatching!==false)return stop('CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN');
    result.identityAuthority='EXACT_DURABLE_ADJUDICATED_KEEPER';
    result.identityLinkAckMode=linkAck.mode;
  }else{
    if(uid!=='cx-sh-'+hash('tya\0shopper\0'+shopperId).slice(0,28)||cross.sourceType!=='hr_external'||
      !['stable_hr_shopper_id','exact_technical_keys_only'].includes(cross.identityMode)||cross.fuzzyMatching===true)return stop('CURRENT_PROVIDER_HR_NATIVE_UID_UNPROVEN');
    result.identityAuthority='EXACT_DURABLE_HR_NATIVE_UID';
  }
  // A supplied same-UID seal can veto this mode; it is never ignored or replaced.
  if(sealedHashes.length){
    if(sealedHashes.length!==1||!/^[a-f0-9]{64}$/.test(str(sealedHashes[0]))||hash(expected.password)!==sealedHashes[0])return stop('CURRENT_PROVIDER_SAME_UID_SEALED_HASH_CONFLICT');
    result.credentialHashMatches=true;
  }
  return {...result,allowed:true,durableProviderProof:true,reason:'CURRENT_PROVIDER_SINGLE_RULE_CREDENTIAL_PROVEN',
    provenance:'CURRENT_DURABLE_PROVIDER_RULE_AND_EXACT_KEEPER_AUTH',
    credentialHashSource:sealedHashes.length?'EXACT_C6_SAME_KEEPER_UID_SEAL':'NOT_STORED_BY_HR_NATIVE_PROVIDER'};
}

// RUN2783: only the two unproved identities are diagnostic targets. This mode
// never authorizes a login, even when a credential recipe is proved locally.
export const A08_PROVENANCE_TARGETS=Object.freeze({GT_EXCEPTION:'shopper_gt_a092a0647f',LEGACY_EXCEPTION:'shp-3669abbb015a'});
export const A08_GT_CURRENT_PROVIDER_MODE='GT_CURRENT_PROVIDER_PASSWORD_ONLY';
function validGtCurrentAuthorityDiagnostic(d,sealCheck){
  const required=A08_PROVENANCE_CHECKS.filter(k=>!k.startsWith('HR_NATIVE_')&&!k.startsWith('SAME_UID_'));
  if(d?.caseId!=='GT_EXCEPTION'||d.identityAuthority!=='TENANT_ADJUDICATION'||d.provenanceAllowed!==true||
    d.diagnosticComplete!==true||d.readStage!=='COMPLETE'||d.primaryReason!=='CURRENT_PROVIDER_SINGLE_RULE_CREDENTIAL_PROVEN'||
    !Array.isArray(d.failedChecks)||d.failedChecks.length!==0||!required.every(k=>d.checks?.[k]===true)||
    d.historicalSameUidProof?.recipeUsedForLogin!==false)return false;
  const h=d.historicalSameUidProof;
  if(sealCheck==='NOT_READ')return ['recordCount','supportedSealCount','uniqueSupportedSeal','currentRuleRecipeMatches','keeperLoginRecipeMatches'].every(k=>h[k]===null);
  if(sealCheck!=='READ'||h.recordCount!==h.supportedSealCount)return false;
  return h.supportedSealCount===0?h.uniqueSupportedSeal===false&&h.currentRuleRecipeMatches===null:
    h.supportedSealCount===1&&h.uniqueSupportedSeal===true&&h.currentRuleRecipeMatches===true;
}
export function validA08GtCurrentPasswordChild(proof,sourceSha){
  const s=proof?.selection||{},d=proof?.currentProviderDiagnostic;
  return proof?.schemaVersion==='cxorbia.i3.r20.one-proven-credential-readonly.v2'&&proof.sourceSha===sourceSha&&
    proof.decision==='PASS_R20_ORDINARY_PASSWORD_FULL_SESSION_LIFECYCLE'&&
    proof.credentialProvenance==='CURRENT_DURABLE_PROVIDER_RULE_AND_EXACT_KEEPER_AUTH'&&
    proof.providerCredentialMode==='ADC_CURRENT_PROVIDER_GT_ONLY'&&['NOT_READ','READ'].includes(proof.sealCheck)&&
    proof.knownHistoricalSealCheck==='VETO_ONLY_NO_CURRENT_CREDIT'&&s.activeShopperMembers===1&&s.exactProfiles===1&&
    s.selected===true&&s.boundedShopperIdQuery===true&&s.requestedShopperId===A08_PROVENANCE_TARGETS.GT_EXCEPTION&&
    s.selectedShopperMatchesRequested===true&&s.durableProviderProof===true&&s.credentialAuthorityMode==='CURRENT_PROVIDER_VERIFIED_RULE_V1'&&
    validGtCurrentAuthorityDiagnostic(d,proof.sealCheck)&&
    proof.attemptedAccounts===1&&proof.loginAttempts===2&&proof.browserLaunches===1&&proof.identityPreservedAfter===true&&
    proof.firstPasswordLogin===true&&proof.identityAndHr===true&&proof.restorationLogoutRelogin==='PASS_SAME_UID_SAME_SHOPPER_HR_AFTER_RELOGIN'&&
    ['restore','logout','relogin'].every(k=>proof.sessionLifecycle?.[k]===true)&&proof.production===false&&
    ['customTokensUsed','authWrites','passwordChanges','passwordResets','firestoreWrites','hrWrites','financeWrites','providerWrites','deploys'].every(k=>proof[k]===0);
}
export function publicA08GtPasswordProof(value={}){
  return {caseId:value?.caseId==='GT_EXCEPTION'?'GT_EXCEPTION':null,pass:value?.pass===true,
    currentProviderProofVerified:value?.currentProviderProofVerified===true,
    sealCheck:['NOT_READ','READ'].includes(value?.sealCheck)?value.sealCheck:null,
    historicalSealUsedAsAuthority:false,identityAndHr:value?.identityAndHr===true,
    identityPreservedAfter:value?.identityPreservedAfter===true,
    sessionLifecycle:Object.fromEntries(['restore','logout','relogin'].map(k=>[k,value?.sessionLifecycle?.[k]===true])),
    loginAttempts:Number.isSafeInteger(value?.loginAttempts)&&value.loginAttempts>=0?value.loginAttempts:null,
    evidenceSha256:typeof value?.evidenceSha256==='string'&&/^[a-f0-9]{64}$/.test(value.evidenceSha256)?value.evidenceSha256:null,
    ...(value?.authorityPreflight?{authorityPreflight:publicA08ProvenanceDiagnostic(value.authorityPreflight)}:{})};
}
export function validA08GtPasswordScope(result){
  const p=result?.passwordProofs?.[0],scope=result?.scope||{},s=result?.safety||{};
  return scope.executionMode===A08_GT_CURRENT_PROVIDER_MODE&&scope.exceptionShopperIds?.length===1&&
    scope.exceptionShopperIds[0]===A08_PROVENANCE_TARGETS.GT_EXCEPTION&&scope.apiOperation===null&&scope.storageOperation===null&&
    result.passwordProofs?.length===1&&p?.shopperId===A08_PROVENANCE_TARGETS.GT_EXCEPTION&&p.caseId==='GT_EXCEPTION'&&p.pass===true&&
    p.decision==='PASS_R20_ORDINARY_PASSWORD_FULL_SESSION_LIFECYCLE'&&p.credentialProvenance==='CURRENT_DURABLE_PROVIDER_RULE_AND_EXACT_KEEPER_AUTH'&&
    p.currentProviderProofVerified===true&&['NOT_READ','READ'].includes(p.sealCheck)&&p.historicalSealUsedAsAuthority===false&&
    validGtCurrentAuthorityDiagnostic(p.authorityPreflight,p.sealCheck)&&
    p.identityAndHr===true&&p.identityPreservedAfter===true&&p.loginAttempts===2&&
    ['restore','logout','relogin'].every(k=>p.sessionLifecycle?.[k]===true)&&typeof p.evidenceSha256==='string'&&/^[a-f0-9]{64}$/.test(p.evidenceSha256)&&
    result.apiProofs?.length===0&&result.storageDiscovery?.executed===false&&result.storageProof?.pass===false&&result.errors?.length===0&&
    s.loginAttempts===2&&s.browserLaunches===1&&s.hnLoginAttempts===0&&s.legacyLoginAttempts===0&&s.production===false&&
    ['customTokensUsed','providerCommands','directAuthWrites','directFirestoreWrites','storageWrites','hrWrites','passwordChanges','passwordResets','fixtureCreates','builds','deploys'].every(k=>s[k]===0);
}
export const a08ProvenanceCase=shopperId=>Object.keys(A08_PROVENANCE_TARGETS).find(k=>A08_PROVENANCE_TARGETS[k]===shopperId)||null;
export const A08_PROVENANCE_CHECKS=Object.freeze([
  'TARGET_AUTHORIZED','RULE_AVAILABLE','RULE_VERSION','LOGIN_PRESENT','PROFILE_LOGIN_PARITY','FIRST_NAME_AUTHORITY_MATCH',
  ...['MEMBER','PROFILE'].flatMap(k=>['RULE_VERSION','SWEEP_VERSION','PASSWORD_PROOF_VERSION','PASSWORD_RULE_VERSION'].map(v=>k+'_'+v)),
  'MEMBER_ENROLLED','MEMBER_ACTIVE','MEMBER_TENANT','MEMBER_ROLE','MEMBER_NAMESPACE','MEMBER_SHOPPER','MEMBER_PROJECT','MEMBER_KEEPER_FINGERPRINT',
  'AUTH_UID','AUTH_ENABLED','AUTH_TENANT','AUTH_ROLE','AUTH_NAMESPACE','AUTH_SHOPPER','AUTH_PROJECT','AUTH_LOGIN_EMAIL',
  'PROFILE_TENANT','PROFILE_SHOPPER','PROFILE_NOT_SUPERSEDED','PROFILE_PROJECT','CROSS_EXISTS','CROSS_TENANT','CROSS_SHOPPER','CROSS_STABLE_KEY','CROSS_KEEPER_FINGERPRINT',
  'AUTHORITY_REF_FORMAT','MEMBER_CONSOLIDATED','PROFILE_CONSOLIDATED','CROSS_AUTHORITY_REF',
  'RECEIPT_EXISTS','RECEIPT_COMMITTED','RECEIPT_COMMAND_TYPE','RECEIPT_PROVIDER_ACK','RECEIPT_CONSOLIDATED','RECEIPT_SHOPPER','RECEIPT_KEEPER_FINGERPRINT','RECEIPT_ACTOR_PRESENT','RECEIPT_DIGEST_FORMAT','RECEIPT_LINK_ID_FORMAT',
  'LINK_EXISTS','LINK_ID','LINK_DOCUMENT_ID','LINK_TENANT','LINK_PROJECT','LINK_ACTIVE','LINK_SHOPPER','LINK_AUTHORITY_TYPE','LINK_AUTHORITY_REF','LINK_PROVIDER_ACK','LINK_HUMAN_CONFIRMED','LINK_NOT_FUZZY',
  'HR_NATIVE_UID','HR_NATIVE_SOURCE_TYPE','HR_NATIVE_IDENTITY_MODE','HR_NATIVE_NOT_FUZZY','SAME_UID_SEAL_UNIQUE','SAME_UID_CURRENT_RECIPE_MATCH'
]);
const diagnosticReasons=Object.freeze(['CURRENT_PROVIDER_TARGET_NOT_AUTHORIZED','CURRENT_PROVIDER_RULE_INCOMPLETE','CURRENT_PROVIDER_LOGIN_PARITY_MISSING','CURRENT_PROVIDER_FIRST_NAME_AUTHORITY_CHANGED','CURRENT_PROVIDER_DURABLE_RULE_PROOF_MISSING','CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH','CURRENT_PROVIDER_CROSSWALK_MISMATCH','CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN','CURRENT_PROVIDER_HR_NATIVE_UID_UNPROVEN','CURRENT_PROVIDER_SAME_UID_SEALED_HASH_CONFLICT','CURRENT_PROVIDER_SINGLE_RULE_CREDENTIAL_PROVEN','CURRENT_PROVIDER_PROVENANCE_READ_FAILED']);
const diagnosticBool=x=>typeof x==='boolean'?x:null;
const diagnosticCount=x=>Number.isSafeInteger(x)&&x>=0?x:null;
// Shared public allowlist: neither the wrapper nor the typed index copies raw
// provider fields, identities, logins, passwords, or credential hashes.
export function publicA08ProvenanceDiagnostic(value={}){
  const checks=Object.fromEntries(A08_PROVENANCE_CHECKS.map(k=>[k,diagnosticBool(value.checks?.[k])]));
  return {caseId:Object.hasOwn(A08_PROVENANCE_TARGETS,value.caseId)?value.caseId:null,
    diagnosticOnly:value.diagnosticOnly===true,diagnosticComplete:value.diagnosticComplete===true,
    primaryReason:diagnosticReasons.includes(value.primaryReason)?value.primaryReason:null,
    provenanceAllowed:diagnosticBool(value.provenanceAllowed),
    identityAuthority:['TENANT_ADJUDICATION','HR_NATIVE','OTHER'].includes(value.identityAuthority)?value.identityAuthority:null,
    readStage:['AUTH','CROSSWALK','RECEIPT','LINK','COMPLETE'].includes(value.readStage)?value.readStage:null,
    checks,failedChecks:A08_PROVENANCE_CHECKS.filter(k=>checks[k]===false),
    ...(value.adjudicationAck?{adjudicationAck:{
      mode:['UNPROVEN','EXPLICIT_LINK_ACK','REFERENCED_COMMITTED_COMMAND_RECEIPT'].includes(value.adjudicationAck.mode)?value.adjudicationAck.mode:null,
      inlineState:['ABSENT','TRUE','FALSE','NULL','NON_BOOLEAN'].includes(value.adjudicationAck.inlineState)?value.adjudicationAck.inlineState:null,
      historicalReceiptBound:diagnosticBool(value.adjudicationAck.historicalReceiptBound)
    }}:{}),
    historicalSameUidProof:{
      recordCount:diagnosticCount(value.historicalSameUidProof?.recordCount),
      supportedSealCount:diagnosticCount(value.historicalSameUidProof?.supportedSealCount),
      uniqueSupportedSeal:diagnosticBool(value.historicalSameUidProof?.uniqueSupportedSeal),
      currentRuleRecipeMatches:diagnosticBool(value.historicalSameUidProof?.currentRuleRecipeMatches),
      keeperLoginRecipeMatches:diagnosticBool(value.historicalSameUidProof?.keeperLoginRecipeMatches),
      recipeUsedForLogin:diagnosticBool(value.historicalSameUidProof?.recipeUsedForLogin)},
    loginAttempts:diagnosticCount(value.loginAttempts),browserLaunches:diagnosticCount(value.browserLaunches),customTokensUsed:diagnosticCount(value.customTokensUsed)};
}

// Complete all applicable checks, including those after an earlier failed gate.
// `assessCurrentProviderPasswordProof` remains the credential authority.
export function diagnoseCurrentProviderPasswordProof(input,records=[],readState={}){
  const {shopperId,uid,member:m={},profile:p={},authUser:a={},expected:e={},cross:c,receipt:r,link:l}=input;
  const login=str(m.visibleLogin).toLowerCase(),fingerprint=hash('cxorbia-provider-uid-v1\0'+uid),claims=a.customClaims||{};
  const adjudicated=p.identityAuthority==='tenant_adjudication',ref=str(p.identityAuthorityRef),checks={};
  const adjudicationAck=adjudicated?a08AdjudicationAck({link:l,receipt:r,providerRead:readState}):null;
  const put=(key,value)=>{checks[key]=Boolean(value);};
  put('TARGET_AUTHORIZED',A08_PASSWORD_EXCEPTION_IDS.includes(shopperId));put('RULE_AVAILABLE',e.ok===true&&str(e.password));put('RULE_VERSION',e.ruleVersion===RULE);
  put('LOGIN_PRESENT',login);put('PROFILE_LOGIN_PARITY',login&&login===str(p.visibleLogin||p.username||p.user).toLowerCase());
  put('FIRST_NAME_AUTHORITY_MATCH',login&&str(e.login)&&login.split('.')[0]===str(e.login).toLowerCase().split('.')[0]);
  for(const [prefix,o]of [['MEMBER',m],['PROFILE',p]])for(const [suffix,key,want]of [['RULE_VERSION','credentialRuleVersion',RULE],['SWEEP_VERSION','credentialSweepVersion',SWEEP],['PASSWORD_PROOF_VERSION','credentialPasswordProofVersion',PROOF],['PASSWORD_RULE_VERSION','credentialPasswordRuleVersion',RULE]])put(prefix+'_'+suffix,o[key]===want);
  put('MEMBER_ENROLLED',m.credentialState==='enrolled');put('MEMBER_ACTIVE',m.active===true);put('MEMBER_TENANT',m.tenantId==='tya');put('MEMBER_ROLE',m.role==='shopper');put('MEMBER_NAMESPACE',m.authNamespace==='shopper');put('MEMBER_SHOPPER',m.shopperId===shopperId);put('MEMBER_PROJECT',list(m.projectIds).includes('cinepolis'));put('MEMBER_KEEPER_FINGERPRINT',m.providerUidFingerprint===fingerprint);
  put('AUTH_UID',a.uid===uid);put('AUTH_ENABLED',a.uid===uid&&a.disabled!==true);put('AUTH_TENANT',claims.tenantId==='tya');put('AUTH_ROLE',claims.role==='shopper');put('AUTH_NAMESPACE',claims.authNamespace==='shopper');put('AUTH_SHOPPER',claims.shopperId===shopperId);put('AUTH_PROJECT',list(claims.projectIds).includes('cinepolis'));put('AUTH_LOGIN_EMAIL',login&&str(a.email).toLowerCase()===hash('tya\0shopper\0'+login).slice(0,48)+'@auth.cxorbia.invalid');
  put('PROFILE_TENANT',str(p.tenantId||'tya')==='tya');put('PROFILE_SHOPPER',str(p.shopperId||shopperId)===shopperId);put('PROFILE_NOT_SUPERSEDED',p.identityState!=='superseded_exact_alias');put('PROFILE_PROJECT',list(p.projectIds).includes('cinepolis'));
  checks.CROSS_EXISTS=diagnosticBool(readState.crossExists??Boolean(c));
  if(c){put('CROSS_TENANT',c.tenantId==='tya');put('CROSS_SHOPPER',c.shopperId===shopperId);put('CROSS_STABLE_KEY',c.sourceStableKey===shopperId);put('CROSS_KEEPER_FINGERPRINT',c.providerUidFingerprint===fingerprint);}
  if(adjudicated){
    put('AUTHORITY_REF_FORMAT',/^[a-f0-9]{40}$/.test(ref));put('MEMBER_CONSOLIDATED',m.identityConsolidatedAt);put('PROFILE_CONSOLIDATED',p.identityConsolidatedAt);if(c)put('CROSS_AUTHORITY_REF',c.identityAuthorityRef===ref);
    checks.RECEIPT_EXISTS=diagnosticBool(readState.receiptExists);checks.LINK_EXISTS=diagnosticBool(readState.linkExists);
    if(r){put('RECEIPT_COMMITTED',r.status==='committed');put('RECEIPT_COMMAND_TYPE',r.commandType==='shopper.identity.adjudicate');put('RECEIPT_PROVIDER_ACK',r.providerAck===true);put('RECEIPT_CONSOLIDATED',r.identityConsolidated===true);put('RECEIPT_SHOPPER',r.shopperId===shopperId);put('RECEIPT_KEEPER_FINGERPRINT',r.keeperUidFingerprint===fingerprint);put('RECEIPT_ACTOR_PRESENT',str(r.actorUid));put('RECEIPT_DIGEST_FORMAT',/^[a-f0-9]{64}$/.test(str(r.commandDigest)));put('RECEIPT_LINK_ID_FORMAT',/^irl_[a-f0-9]{32}$/.test(str(r.identityLinkId)));}
    if(l&&r){put('LINK_ID',l.identityLinkId===r.identityLinkId);put('LINK_DOCUMENT_ID',readState.linkDocumentId===r.identityLinkId);put('LINK_TENANT',l.tenantId==='tya');put('LINK_PROJECT',['*','cinepolis'].includes(l.projectScope));put('LINK_ACTIVE',['active','confirmed','approved','materialized'].includes(l.status||l.state));put('LINK_SHOPPER',l.canonicalShopperId===shopperId);put('LINK_AUTHORITY_TYPE',l.authorityType==='tenant_adjudication');put('LINK_AUTHORITY_REF',l.authorityRef===ref);put('LINK_PROVIDER_ACK',adjudicationAck.allowed);put('LINK_HUMAN_CONFIRMED',l.humanConfirmed===true);put('LINK_NOT_FUZZY',l.fuzzyMatching===false);}
  }else{
    put('HR_NATIVE_UID',uid==='cx-sh-'+hash('tya\0shopper\0'+shopperId).slice(0,28));if(c){put('HR_NATIVE_SOURCE_TYPE',c.sourceType==='hr_external');put('HR_NATIVE_IDENTITY_MODE',['stable_hr_shopper_id','exact_technical_keys_only'].includes(c.identityMode));put('HR_NATIVE_NOT_FUZZY',c.fuzzyMatching!==true);}
  }
  const sealNotRead=readState.sealCheck==='NOT_READ';
  const exactRecords=list(records).filter(row=>row?.kind==='shopper'&&str(row.authNamespace||'shopper')==='shopper'&&
    'tya-sh-'+hash('tya\0shopper\0'+str(row.normalizedLogin||row.loginIdentifier).toLowerCase()).slice(0,24)===uid);
  const seals=sameKeeperSealedHashes(records,uid),unique=seals.length===1;
  const currentMatches=unique&&e.ok===true?hash(e.password)===seals[0]:null;
  // Only evaluate this deterministic historical recipe against ONE same-UID
  // seal. It is never returned, tried, used as fallback, or made authoritative.
  const keeperFirst=login.split('.')[0];
  const keeperMatches=unique&&/^[a-z0-9]+$/.test(keeperFirst)?hash(keeperFirst[0].toUpperCase()+keeperFirst.slice(1)+'123*')===seals[0]:null;
  if(seals.length){put('SAME_UID_SEAL_UNIQUE',unique);checks.SAME_UID_CURRENT_RECIPE_MATCH=currentMatches;}
  const assessed=readState.complete===false?{allowed:false,reason:'CURRENT_PROVIDER_PROVENANCE_READ_FAILED'}:assessCurrentProviderPasswordProof({...input,sealedHashes:seals,providerRead:readState});
  return publicA08ProvenanceDiagnostic({caseId:a08ProvenanceCase(shopperId),diagnosticOnly:true,diagnosticComplete:readState.complete!==false,
    primaryReason:assessed.reason,provenanceAllowed:assessed.allowed,identityAuthority:adjudicated?'TENANT_ADJUDICATION':p.identityAuthority?'OTHER':'HR_NATIVE',readStage:readState.stage||'COMPLETE',checks,...(adjudicationAck?{adjudicationAck}:{}),
    historicalSameUidProof:{recordCount:sealNotRead?null:exactRecords.length,supportedSealCount:sealNotRead?null:seals.length,uniqueSupportedSeal:sealNotRead?null:unique,currentRuleRecipeMatches:sealNotRead?null:currentMatches,keeperLoginRecipeMatches:sealNotRead?null:keeperMatches,recipeUsedForLogin:false},
    loginAttempts:0,browserLaunches:0,customTokensUsed:0});
}
