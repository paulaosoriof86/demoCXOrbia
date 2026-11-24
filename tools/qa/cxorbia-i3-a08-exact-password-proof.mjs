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
