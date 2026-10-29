#!/usr/bin/env node
/* CXOrbia I3 / R-026: DEV protected identity preflight, READ-ONLY.
 * Paula explicitly confirmed YES, technical account preferred. The recorded
 * HR/technical phone discrepancy is evidence, NEVER a merge eligibility gate.
 * F-026 is a DIFFERENT person and is intentionally outside this script's scope.
 * No command, Auth mutation, Firestore write, HR write, deploy or custom token.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
const HR_REV='4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a';
const APPROVED_DIGEST='ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872';
const CASE='R-026',CANON_FP='ea0cffb5ee5c3074b8df',ALIAS_FP='d8c11f266b8efc2ed118';
const AUTH='PAULA_I3_2026_10_28_APPROVED_R026_GT_TECHNICAL_KEEPER_READONLY';
const OUT=String(process.env.CX_R026_READONLY_OUT||'.tmp/cxorbia-i3-r026-keeper-readonly');
const val=x=>String(x??'').trim(),arr=x=>Array.isArray(x)?x:[],uniq=xs=>[...new Set(arr(xs).map(val).filter(Boolean))];
const sha=x=>crypto.createHash('sha256').update(String(x),'utf8').digest('hex');
const fp=(kind,x)=>sha(kind+':'+x).slice(0,20);
const norm=x=>val(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const country=x=>{const c=norm(x?.pais||x?.country||x?.país);return c==='guatemala'||c==='gt'?'GT':c==='honduras'||c==='hn'?'HN':'UNSET';};
const name=x=>norm(x?.nombre||x?.displayName||x?.fullName||x?.name||[x?.firstName,x?.lastName].filter(Boolean).join(' '));
const phone=x=>val(x?.whatsapp||x?.phone||x?.telefono).replace(/[^0-9]/g,'');
const gtPhone=x=>x.startsWith('502')&&x.length===11?x.slice(3):x;
const sid=x=>val(x?.shopperId||x?.id);
const assert=(condition,code)=>{if(!condition)throw new Error(code);};

const result={schemaVersion:'cxorbia.i3.r026.technical-keeper.readonly.v1',caseCode:CASE,
  decision:'HOLD',environment:'DEV',project:PROJECT,tenant:TENANT,program:PROGRAM,
  production:false,readOnly:true,sourceRevision:HR_REV,approvedCohortDigest:APPROVED_DIGEST,
  paulaDecision:'YES_SAME_HUMAN',paulaKeeperPreference:'TECHNICAL',
  phoneDiscrepancyAcceptedAsNonGate:true,
  providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,externalWrites:0,
  deployments:0,merges:0,credentialResets:0};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(`${OUT}/result.json`,JSON.stringify(result,null,2)+'\n','utf8');
save();

const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId',
  'applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId',
  'liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];
const owns=(row,id)=>ownerFields.some(k=>val(row?.[k])===id)||
  ownerArrays.some(k=>arr(row?.[k]).some(x=>val(x)===id));

async function byFp(collection,expected){
  const docs=(await collection.get()).docs.filter(doc=>fp('sid',doc.id)===expected);
  assert(docs.length===1,'R026_PROFILE_FINGERPRINT_NOT_UNIQUE');
  return docs[0];
}

async function hrLive(){
  const endpoint='https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json'+
    '&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV'+
    '&r026ReadOnly='+Date.now();
  const response=await fetch(endpoint,{headers:{'cache-control':'no-cache, no-store'},
    signal:AbortSignal.timeout(120000)});
  assert(response.ok,'R026_HR_PROVIDER_HTTP_'+response.status);
  const body=await response.json(),snapshot=body.snapshot||body.data||body;
  const revision=val(body.revision||body._runtime?.revision||snapshot.sourceRevision);
  assert(revision===HR_REV,'R026_HR_REVISION_DRIFT');
  assert(body._runtime?.operationalView===true&&snapshot.operationalIdentityPreview===true,
    'R026_HR_OPERATIONAL_NAMES_NOT_VERIFIED');
  return {shoppers:arr(snapshot.shoppers),visits:arr(snapshot.visits),revision};
}

function validPrincipal(member,user,identityId){
  const claims=user?.customClaims||{};
  return !!user&&!user.disabled&&member.active===true&&
    val(member.tenantId)===TENANT&&val(member.role)==='shopper'&&
    val(member.authNamespace)==='shopper'&&val(member.shopperId)===identityId&&
    arr(member.projectIds).includes(PROGRAM)&&
    val(claims.tenantId)===TENANT&&val(claims.role)==='shopper'&&
    val(claims.authNamespace)==='shopper'&&val(claims.shopperId)===identityId&&
    arr(claims.projectIds).includes(PROGRAM);
}

async function activeMembers(users,identityId,auth){
  const snap=await users.where('shopperId','==',identityId).get(),members=[];
  for(const doc of snap.docs){
    const member=doc.data()||{};
    if(member.active!==true||val(member.tenantId)!==TENANT||
      val(member.role)!=='shopper'||val(member.authNamespace)!=='shopper'||
      !arr(member.projectIds).includes(PROGRAM))continue;
    const user=await auth.getUser(doc.id);
    assert(validPrincipal(member,user,identityId),'R026_AUTH_CLAIMS_OR_MEMBERSHIP_MISMATCH');
    members.push({uid:doc.id,member,user});
  }
  assert(members.length<=1,'R026_MULTIPLE_ACTIVE_PRINCIPALS');
  return members;
}

try{
  assert(process.env.CX_R026_READONLY_AUTH===AUTH,'R026_EXPLICIT_AUTHORIZATION_GATE');
  assert(process.env.CX_R026_APPROVED_DIGEST===APPROVED_DIGEST,'R026_WORKBOOK_DIGEST_GATE');
  assert(process.env.GCLOUD_PROJECT===PROJECT||process.env.GOOGLE_CLOUD_PROJECT===PROJECT,
    'R026_DEV_PROJECT_ONLY');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const db=getFirestore(),auth=getAuth(),tenant=db.collection('tenants').doc(TENANT),
    profiles=tenant.collection('shoppers'),users=tenant.collection('users'),
    cross=tenant.collection('shopperIdentityCrosswalk');
  const [canonicalDoc,aliasDoc,hr]=await Promise.all([
    byFp(profiles,CANON_FP),byFp(profiles,ALIAS_FP),hrLive()]);
  const canonical=canonicalDoc.id,alias=aliasDoc.id,
    cp=canonicalDoc.data()||{},ap=aliasDoc.data()||{};
  const hrRows=hr.shoppers.filter(x=>sid(x)===canonical),hrAlias=hr.shoppers.filter(x=>sid(x)===alias),
    hrHistorical=hr.visits.filter(x=>sid(x)===canonical);
  result.authority={canonicalFingerprintVerified:fp('sid',canonical)===CANON_FP,
    technicalFingerprintVerified:fp('sid',alias)===ALIAS_FP,
    canonicalHrRowCount:hrRows.length,technicalHrRowCount:hrAlias.length,
    hrHistoricalVisits:hrHistorical.length,canonicalProfileIsHr:val(cp.sourceType)==='hr_external',
    technicalNotAlreadySuperseded:!val(ap.supersededByShopperId)};save();
  assert(canonical!==alias&&hrRows.length===1&&hrAlias.length===0&&
    hrHistorical.length===5&&val(cp.sourceType)==='hr_external'&&
    !val(ap.supersededByShopperId),'R026_EXACT_SOURCE_OR_HISTORY_DRIFT');
  const n1=name(cp),n2=name(ap),n3=name(hrRows[0]);
  result.identity={normalizedNameExact:!!n1&&n1===n2&&n2===n3,
    canonicalCountry:country(cp),technicalCountry:country(ap),hrCountry:country(hrRows[0])};
  assert(result.identity.normalizedNameExact&&
    result.identity.canonicalCountry==='GT'&&result.identity.technicalCountry==='GT'&&
    result.identity.hrCountry==='GT','R026_NAME_COUNTRY_AUTHORITY_DRIFT');

  // Phone is diagnostic only. Different digits cannot override Paula's exact
  // approved case decision, overwrite either contact, or mint an identity.
  const protectedProfiles=(await profiles.get()).docs.map(doc=>doc.data()||{}),
    canonicalDigits=gtPhone(phone(cp)),technicalDigits=gtPhone(phone(ap)),
    hrDigits=gtPhone(phone(hrRows[0]));
  const frequency=value=>value?protectedProfiles.filter(x=>gtPhone(phone(x))===value).length:0;
  const hrFrequency=value=>value?hr.shoppers.filter(x=>gtPhone(phone(x))===value).length:0;
  result.contactEvidence={phoneIsNeverIdentityMergeGate:true,
    canonicalPhoneDigitCount:canonicalDigits.length,
    technicalPhoneDigitCount:technicalDigits.length,hrPhoneDigitCount:hrDigits.length,
    protectedPhonesEqual:!!canonicalDigits&&canonicalDigits===technicalDigits,
    hrAndCanonicalPhoneEqual:!!hrDigits&&hrDigits===canonicalDigits,
    canonicalPhoneFingerprint:canonicalDigits?fp('gtPhone',canonicalDigits):null,
    technicalPhoneFingerprint:technicalDigits?fp('gtPhone',technicalDigits):null,
    hrPhoneFingerprint:hrDigits?fp('gtPhone',hrDigits):null,
    canonicalPhoneProfileFrequency:frequency(canonicalDigits),
    technicalPhoneProfileFrequency:frequency(technicalDigits),
    canonicalPhoneHrFrequency:hrFrequency(canonicalDigits),
    technicalPhoneHrFrequency:hrFrequency(technicalDigits)};save();

  const [canonicalMembers,technicalMembers,canonicalCross,technicalCross]=await Promise.all([
    activeMembers(users,canonical,auth),activeMembers(users,alias,auth),
    cross.doc(canonical).get(),cross.doc(alias).get()]);
  assert(technicalMembers.length===1&&canonicalMembers.length<=1,
    'R026_TECHNICAL_KEEPER_MEMBERSHIP_NOT_UNIQUE');
  const keeper=technicalMembers[0],passwordProof=val(keeper.member.credentialPasswordProofVersion||
    ap.credentialPasswordProofVersion)===ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
  const recentSecondary=canonicalMembers.some(({user})=>{
    const raw=val(user.metadata?.lastSignInTime),time=Date.parse(raw);
    return !!raw&&(!Number.isFinite(time)||Date.now()-time<7*86400000);
  });
  result.access={technicalUidFingerprint:fp('uid',keeper.uid),technicalActive:true,
    technicalPasswordProof:passwordProof,technicalLoginPresent:!!val(keeper.member.visibleLogin),
    technicalAuthNamespacePrivate:val(keeper.user.email).endsWith('@auth.cxorbia.invalid'),
    technicalClaimsExact:validPrincipal(keeper.member,keeper.user,alias),
    canonicalAdditionalActivePrincipals:canonicalMembers.length,
    canonicalSecondaryRecentSignIn:recentSecondary,
    canonicalCrosswalkSelfOwned:canonicalCross.exists&&val(canonicalCross.data()?.shopperId)===canonical,
    technicalCrosswalkSelfOwned:technicalCross.exists&&val(technicalCross.data()?.shopperId)===alias};save();
  assert(passwordProof&&result.access.technicalLoginPresent&&
    result.access.technicalAuthNamespacePrivate&&result.access.technicalClaimsExact&&
    !recentSecondary&&result.access.canonicalCrosswalkSelfOwned&&
    result.access.technicalCrosswalkSelfOwned,'R026_TECHNICAL_KEEPER_ACCESS_UNSAFE');

  const areas=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],
    ['project','certifications'],['project','liquidations'],['project','postulations'],
    ['project','reservations'],['project','visits']];
  const counts={};
  for(const [scope,collection] of areas){
    const parent=scope==='tenant'?tenant:tenant.collection('projects').doc(PROGRAM),
      snapshot=await parent.collection(collection).get();
    counts[collection]=snapshot.docs.filter(doc=>owns(doc.data()||{},alias)).length;
  }
  result.domain={aliasOwned:counts};save();
  assert(Object.values(counts).every(n=>n===0),'R026_ALIAS_DOMAIN_REFERENCES_NOT_EMPTY');
  const links=(await tenant.collection('shopperIdentityLinks').get()).docs.filter(doc=>{
    const row=doc.data()||{},tokens=[row.sourceShopperId,row.canonicalShopperId,
      ...arr(row.exactAliases),...arr(row.sourceAliases)].map(val);
    return ['active','approved','confirmed','materialized'].includes(val(row.status||row.state).toLowerCase())&&
      tokens.includes(alias);
  });
  assert(links.length===0,'R026_PREEXISTING_TRUSTED_ALIAS_LINK_CONFLICT');
  const [hrFresh,aliasFresh,canonicalFresh,technicalMemberFresh]=await Promise.all([
    hrLive(),profiles.doc(alias).get(),profiles.doc(canonical).get(),users.doc(keeper.uid).get()]);
  assert(hrFresh.shoppers.filter(x=>sid(x)===canonical).length===1&&
    hrFresh.visits.filter(x=>sid(x)===canonical).length===5&&
    JSON.stringify(aliasFresh.data()||{})===JSON.stringify(ap)&&
    JSON.stringify(canonicalFresh.data()||{})===JSON.stringify(cp)&&
    JSON.stringify(technicalMemberFresh.data()||{})===JSON.stringify(keeper.member),
    'R026_SOURCE_OR_PROTECTED_PROFILE_CHANGED_DURING_READ');
  result.decision='PASS_R026_TECHNICAL_KEEPER_READONLY_PREFLIGHT';
  result.keeperTechnicalVerified=true;
  result.contactDiscrepancyNeverBlocked=true;
  result.noFurtherHumanQuestionNeeded=true;
  save();
  console.log(JSON.stringify({decision:result.decision,caseCode:CASE,
    technicalKeeperVerified:true,canonicalHrRows:hrRows.length,hrHistoricalVisits:hrHistorical.length,
    normalizedNameExact:true,phoneDiscrepancyNeverBlocked:true,
    technicalUidFingerprint:result.access.technicalUidFingerprint,
    aliasDomainCounts:counts,production:false,writes:0}));
}catch(error){
  result.decision='HOLD_R026_TECHNICAL_KEEPER_READONLY_PREFLIGHT';
  result.errorCode=val(error?.message||error).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,120);
  save();console.error(JSON.stringify({decision:result.decision,errorCode:result.errorCode,
    production:false,writes:0}));process.exitCode=2;
}
