// QA credential provenance only. A proved existing login alias is not username canonization.
import crypto from 'node:crypto';
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
export function assessCurrentProviderPasswordProof({shopperId,uid,member,profile,authUser,expected,cross,receipt,link,sealedHashes=[]}){
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
    if(!/^[a-f0-9]{40}$/.test(ref)||!member.identityConsolidatedAt||!profile.identityConsolidatedAt||cross.identityAuthorityRef!==ref||
      receipt?.status!=='committed'||receipt.commandType!=='shopper.identity.adjudicate'||receipt.providerAck!==true||receipt.identityConsolidated!==true||
      receipt.shopperId!==shopperId||receipt.keeperUidFingerprint!==fingerprint||!str(receipt.actorUid)||!/^[a-f0-9]{64}$/.test(str(receipt.commandDigest))||
      !/^irl_[a-f0-9]{32}$/.test(str(receipt.identityLinkId))||link?.identityLinkId!==receipt.identityLinkId||link.tenantId!=='tya'||
      !['*','cinepolis'].includes(link.projectScope)||!['active','confirmed','approved','materialized'].includes(link.status||link.state)||
      link.canonicalShopperId!==shopperId||link.authorityType!=='tenant_adjudication'||link.authorityRef!==ref||
      link.providerAck!==true||link.humanConfirmed!==true||link.fuzzyMatching!==false)return stop('CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN');
    result.identityAuthority='EXACT_DURABLE_ADJUDICATED_KEEPER';
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
// `assessCurrentProviderPasswordProof` remains unchanged and is the authority.
export function diagnoseCurrentProviderPasswordProof(input,records=[],readState={}){
  const {shopperId,uid,member:m={},profile:p={},authUser:a={},expected:e={},cross:c,receipt:r,link:l}=input;
  const login=str(m.visibleLogin).toLowerCase(),fingerprint=hash('cxorbia-provider-uid-v1\0'+uid),claims=a.customClaims||{};
  const adjudicated=p.identityAuthority==='tenant_adjudication',ref=str(p.identityAuthorityRef),checks={};
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
    if(l&&r){put('LINK_ID',l.identityLinkId===r.identityLinkId);put('LINK_DOCUMENT_ID',readState.linkDocumentId===r.identityLinkId);put('LINK_TENANT',l.tenantId==='tya');put('LINK_PROJECT',['*','cinepolis'].includes(l.projectScope));put('LINK_ACTIVE',['active','confirmed','approved','materialized'].includes(l.status||l.state));put('LINK_SHOPPER',l.canonicalShopperId===shopperId);put('LINK_AUTHORITY_TYPE',l.authorityType==='tenant_adjudication');put('LINK_AUTHORITY_REF',l.authorityRef===ref);put('LINK_PROVIDER_ACK',l.providerAck===true);put('LINK_HUMAN_CONFIRMED',l.humanConfirmed===true);put('LINK_NOT_FUZZY',l.fuzzyMatching===false);}
  }else{
    put('HR_NATIVE_UID',uid==='cx-sh-'+hash('tya\0shopper\0'+shopperId).slice(0,28));if(c){put('HR_NATIVE_SOURCE_TYPE',c.sourceType==='hr_external');put('HR_NATIVE_IDENTITY_MODE',['stable_hr_shopper_id','exact_technical_keys_only'].includes(c.identityMode));put('HR_NATIVE_NOT_FUZZY',c.fuzzyMatching!==true);}
  }
  const exactRecords=list(records).filter(row=>row?.kind==='shopper'&&str(row.authNamespace||'shopper')==='shopper'&&
    'tya-sh-'+hash('tya\0shopper\0'+str(row.normalizedLogin||row.loginIdentifier).toLowerCase()).slice(0,24)===uid);
  const seals=sameKeeperSealedHashes(records,uid),unique=seals.length===1;
  const currentMatches=unique&&e.ok===true?hash(e.password)===seals[0]:null;
  // Only evaluate this deterministic historical recipe against ONE same-UID
  // seal. It is never returned, tried, used as fallback, or made authoritative.
  const keeperFirst=login.split('.')[0];
  const keeperMatches=unique&&/^[a-z0-9]+$/.test(keeperFirst)?hash(keeperFirst[0].toUpperCase()+keeperFirst.slice(1)+'123*')===seals[0]:null;
  if(seals.length){put('SAME_UID_SEAL_UNIQUE',unique);checks.SAME_UID_CURRENT_RECIPE_MATCH=currentMatches;}
  const assessed=readState.complete===false?{allowed:false,reason:'CURRENT_PROVIDER_PROVENANCE_READ_FAILED'}:assessCurrentProviderPasswordProof({...input,sealedHashes:seals});
  return publicA08ProvenanceDiagnostic({caseId:a08ProvenanceCase(shopperId),diagnosticOnly:true,diagnosticComplete:readState.complete!==false,
    primaryReason:assessed.reason,provenanceAllowed:assessed.allowed,identityAuthority:adjudicated?'TENANT_ADJUDICATION':p.identityAuthority?'OTHER':'HR_NATIVE',readStage:readState.stage||'COMPLETE',checks,
    historicalSameUidProof:{recordCount:exactRecords.length,supportedSealCount:seals.length,uniqueSupportedSeal:unique,currentRuleRecipeMatches:currentMatches,keeperLoginRecipeMatches:keeperMatches,recipeUsedForLogin:false},
    loginAttempts:0,browserLaunches:0,customTokensUsed:0});
}
