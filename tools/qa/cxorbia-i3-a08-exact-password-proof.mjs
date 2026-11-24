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
