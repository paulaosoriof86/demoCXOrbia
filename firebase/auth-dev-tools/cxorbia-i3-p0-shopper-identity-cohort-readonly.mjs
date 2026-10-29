#!/usr/bin/env node
/*
 * CXOrbia I3 G12/G13 — bounded, DEV-only cohort diagnosis.
 * The source of historical visits is the CURRENT external HR revision.
 * Reads Auth, tenant membership, protected profiles and exact crosswalks.
 * No claims changes, merges, upserts, Firestore writes, HR writes or deploy.
 * Output contains aggregate metrics and technical SHA-256 fingerprints only.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
const SOURCE='https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json';
const OUT=String(process.env.CX_SHOPPER_COHORT_OUT||'.tmp/i3-shopper-identity-cohort');
const AUTHORIZATION='PAULA_APPROVED_2026-10-28_GENERAL_SHOPPER_IDENTITY_DIAG_READONLY';
const val=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const fp=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex').slice(0,20);
const norm=v=>val(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const country=v=>{const c=norm(v?.pais||v?.country||v?.país);return c==='honduras'||c==='hn'?'HN':c==='guatemala'||c==='gt'?'GT':c?'OTHER':'UNSET';};
const name=v=>norm(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const phone=v=>val(v?.whatsapp||v?.phone||v?.telefono).replace(/[^0-9]/g,'');
const displayName=v=>val(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const phoneMask=v=>{const p=phone(v);return p?'•••• '+p.slice(-4):'Sin dato';};
const sid=v=>val(v?.shopperId||v?.id);
const assert=(yes,code)=>{if(!yes)throw new Error(code);};
const report={schemaVersion:'cxorbia.i3.p0.shopper-identity-cohort-readonly.v1',
  decision:'HOLD_DIAGNOSTIC_INCOMPLETE',environment:'DEV',project:PROJECT,tenant:TENANT,program:PROGRAM,
  production:false,authWrites:0,firestoreWrites:0,hrWrites:0,externalWrites:0,deployments:0,
  merges:0,credentialResets:0,classification:{},countryClassification:{},cases:[]};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(report,null,2)+'\n','utf8');
save();

function writeSealedPrivateReview(publicKey64,rows){
  assert(!!publicKey64,'REVIEW_PUBLIC_KEY_MISSING');
  const pem=Buffer.from(publicKey64,'base64').toString('utf8');
  assert(pem.includes('BEGIN PUBLIC KEY'),'REVIEW_PUBLIC_KEY_INVALID');
  const sessionKey=crypto.randomBytes(32),nonce=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',sessionKey,nonce);
  const plaintext=Buffer.from(JSON.stringify(rows),'utf8');
  const encrypted=Buffer.concat([cipher.update(plaintext),cipher.final()]);
  const wrapped=crypto.publicEncrypt({key:pem,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},sessionKey);
  const sealed={schemaVersion:'cxorbia.i3.p0.private-review.sealed.v1',algorithm:'RSA-OAEP-SHA256+AES-256-GCM',
    strongCount:rows.strong.length,weakCount:rows.weak.length,
    wrappedKey:wrapped.toString('base64'),nonce:nonce.toString('base64'),
    tag:cipher.getAuthTag().toString('base64'),ciphertext:encrypted.toString('base64')};
  fs.writeFileSync(OUT+'/private-review.sealed.json',JSON.stringify(sealed)+'\n','utf8');
  sessionKey.fill(0);plaintext.fill(0);
}

async function currentHr(tag){
  const response=await fetch(SOURCE+'&cohort='+encodeURIComponent(tag)+'-'+Date.now(),{
    headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(120000)});
  assert(response.ok,'HR_PROVIDER_HTTP_'+response.status);
  const body=await response.json(),snapshot=body.snapshot||body.data||body;
  const revision=val(body.revision||body._runtime?.revision||snapshot.sourceRevision);
  assert(/^[a-f0-9]{64}$/.test(revision),'HR_CURRENT_REVISION_UNPROVEN');
  const shoppers=arr(snapshot.shoppers),visits=arr(snapshot.visits);
  assert(shoppers.length>0&&visits.length>0,'HR_CURRENT_SOURCE_EMPTY');
  return {revision,shoppers,visits};
}
function exactTarget(cross,memberShopperId,hrById){
  const row=cross.get(memberShopperId);
  if(!row)return {id:'',status:'NO_CROSSWALK'};
  const rowTenant=val(row.tenantId),pids=arr(row.projectIds).map(val),pid=val(row.projectId);
  if(rowTenant!==TENANT||(pid&&pid!==PROGRAM)||(pids.length&&!pids.includes(PROGRAM)))
    return {id:'',status:'CROSSWALK_SCOPE_CONFLICT'};
  const target=val(row.shopperId||row.canonicalShopperId);
  if(!target)return {id:'',status:'CROSSWALK_MISSING_TARGET'};
  if(!hrById.has(target))return {id:'',status:'CROSSWALK_TARGET_NOT_HR'};
  // A target reached by a direct HR source ID is exact; a crosswalk is
  // insufficient evidence to merge two distinct credential-bearing humans.
  return {id:target,status:target===memberShopperId?'HR_SELF_CROSSWALK':'HR_EXACT_CROSSWALK'};
}
function approvedTechnicalLinks(snapshot,hrById){
  const map=new Map();let eligible=0,conflicted=0;
  for(const doc of arr(snapshot?.docs)){
    const r=doc.data()||{},authority=val(r.authorityType||r.authority?.type).toLowerCase();
    const status=val(r.status||r.state).toLowerCase(),source=val(r.sourceSystem).toLowerCase();
    const scope=val(r.projectScope||r.projectId||'*'),owner=val(r.canonicalShopperId);
    if(val(r.tenantId)!==TENANT||!['active','confirmed','approved','materialized'].includes(status)||
      !['provider_exact','tenant_adjudication','migrated_exact'].includes(authority)||!source.includes('hr')||
      !val(r.authorityRef)||!owner||!hrById.has(owner)||
      !['*','tenant',PROGRAM].includes(scope)||r.periodId||r.periodKey||r.periodScope)continue;
    if(authority==='tenant_adjudication'&&r.humanConfirmed!==true)continue;
    eligible++;
    const tokens=[r.sourceIdentityKey,...arr(r.exactAliases),...arr(r.sourceAliases),
      ...arr(r.identityAliases),...arr(r.aliases),r.sourceShopperId,r.shopperId];
    for(const token of tokens.map(val).filter(Boolean)){
      const targets=map.get(token)||new Set();targets.add(owner);map.set(token,targets);
      if(targets.size>1)conflicted++;
    }
  }
  return {map,eligible,conflicted};
}
function classify({m,auth,hrById,hrVisitCounts,profiles,cross}){
  const mId=val(m.shopperId),rawCountry=country(m),profile=profiles.get(mId)||null;
  const claims=auth?.customClaims||{},claimsId=val(claims.shopperId);
  const valid=!!auth&&!auth.disabled&&val(claims.tenantId)===TENANT&&
    val(claims.role)==='shopper'&&val(claims.authNamespace)==='shopper'&&
    claimsId===mId&&arr(claims.projectIds).includes(PROGRAM);
  const direct=hrById.has(mId),crossTarget=exactTarget(cross,mId,hrById);
  const canonical=direct?mId:crossTarget.id;
  const count=canonical?(hrVisitCounts.get(canonical)||0):0;
  let category='UNLINKED_TECHNICAL_ACCOUNT';
  if(!valid)category='AUTH_MEMBERSHIP_CLAIMS_CONFLICT';
  else if(direct)category=count>0?'HR_DIRECT_WITH_HISTORY':'HR_DIRECT_ZERO_HISTORY';
  else if(canonical)category=count>0?'HR_EXACT_CROSSWALK_WITH_HISTORY':'HR_EXACT_CROSSWALK_ZERO_HISTORY';
  else if(crossTarget.status==='CROSSWALK_SCOPE_CONFLICT'||crossTarget.status==='CROSSWALK_MISSING_TARGET')
    category='CROSSWALK_CONFLICT';
  else if(crossTarget.status==='CROSSWALK_TARGET_NOT_HR')category='CROSSWALK_TARGET_NOT_HR';
  const aliasName=name(profile),aliasPhone=phone(profile),aliasCountry=country(profile);
  const candidates=[];
  if(!canonical&&profile){
    for(const [id,owner] of hrById){
      const cp=profiles.get(id);
      if(!cp||val(cp.sourceType)!=='hr_external'||val(cp.shopperId||cp.id)!==id)continue;
      if(aliasCountry==='UNSET'||aliasCountry!==country(cp))continue;
      const sameName=!!aliasName&&aliasName===name(cp);
      const samePhone=!!aliasPhone&&aliasPhone===phone(cp);
      if(sameName||samePhone)candidates.push({id,sameName,samePhone,count:hrVisitCounts.get(id)||0});
    }
  }
  const corroborated=candidates.filter(c=>c.samePhone&&c.sameName),named=candidates.filter(c=>c.sameName);
  const candidate=corroborated.length===1?corroborated[0]:null;
  return {category,rawCountry,profileCountry:aliasCountry,authHealthy:valid,
    directHrOwner:direct,crossStatus:crossTarget.status,canonical,historyCount:count,
    _shopperId:mId,_candidateCanonicalId:candidate?.id||'',
    corroboratedCandidateCount:corroborated.length,nameOnlyCandidateCount:named.filter(c=>!c.samePhone).length,
    candidateFingerprint:candidate?fp('sid:'+candidate.id):null,
    candidateHistoryCount:candidate?.count||0,
    shopperIdFingerprint:fp('sid:'+mId),uidFingerprint:fp('uid:'+m.uid),
    enrolled:val(m.credentialState)==='enrolled',sourceProfilePresent:!!profile,
    identityState:val(profile?.identityState||'').slice(0,48)};
}

try{
  assert(process.env.CX_SHOPPER_COHORT_EXECUTION===AUTHORIZATION,'AUTHORIZATION_GATE');
  assert(process.env.GOOGLE_CLOUD_PROJECT===PROJECT||process.env.GCLOUD_PROJECT===PROJECT,'DEV_PROJECT_GATE');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
  const hr=await currentHr('before');
  report.hrRevision=hr.revision;
  const hrById=new Map(),hrVisitCounts=new Map();
  for(const row of hr.shoppers){const id=sid(row);assert(id&&!hrById.has(id),'HR_SHOPPER_UNIQUE_KEY_CONFLICT');hrById.set(id,row);}
  for(const row of hr.visits){const id=val(row?.shopperId);if(id&&hrById.has(id))hrVisitCounts.set(id,(hrVisitCounts.get(id)||0)+1);}
  report.hrSummary={shoppers:hr.shoppers.length,visits:hr.visits.length,
    profilesWithHistory:[...hrVisitCounts].filter(([,count])=>count>0).length,
    byCountry:Object.fromEntries(['GT','HN'].map(c=>[c,hr.shoppers.filter(x=>country(x)===c).length]))};
  const [memberSnap,profileSnap,crossSnap,linkSnap]=await Promise.all([
    tenant.collection('users').get(),tenant.collection('shoppers').get(),tenant.collection('shopperIdentityCrosswalk').get(),tenant.collection('shopperIdentityLinks').get()]);
  const members=memberSnap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(m=>
    m.active===true&&val(m.tenantId)===TENANT&&val(m.role)==='shopper'&&
    val(m.authNamespace)==='shopper'&&arr(m.projectIds).includes(PROGRAM));
  const profiles=new Map(profileSnap.docs.map(d=>[d.id,{...(d.data()||{}),__docId:d.id}]));
  const cross=new Map(crossSnap.docs.map(d=>[d.id,d.data()||{}]));
  const allAuth=[];let token;
  do{const page=await auth.listUsers(1000,token);allAuth.push(...page.users);token=page.pageToken;}while(token);
  const authByUid=new Map(allAuth.map(u=>[u.uid,u]));
  const rows=members.map(m=>classify({m,auth:authByUid.get(m.uid),hrById,hrVisitCounts,profiles,cross}));
  const approved=approvedTechnicalLinks(linkSnap,hrById);
  const directActiveCounts=new Map();for(const r of rows)if(r.directHrOwner&&r.authHealthy)
    directActiveCounts.set(r.canonical,(directActiveCounts.get(r.canonical)||0)+1);
  const corroborated=rows.filter(r=>!r.canonical&&r.corroboratedCandidateCount===1&&r._candidateCanonicalId);
  const approvedMatches=corroborated.filter(r=>approved.map.get(r._shopperId)?.has(r._candidateCanonicalId));
  const conflictingLinks=corroborated.filter(r=>(approved.map.get(r._shopperId)?.size||0)>1);
  report.technicalIdentityEvidence={
    eligibleApprovedLinkDocuments:approved.eligible,conflictingTechnicalTokens:approved.conflicted,
    corroboratedCases:corroborated.length,approvedExactLinkToCorroboratedCandidate:approvedMatches.length,
    noApprovedExactLinkToCorroboratedCandidate:corroborated.length-approvedMatches.length,
    approvedLinkConflicts:conflictingLinks.length,
    canonicalOwnerAlsoHasActiveAuth:corroborated.filter(r=>(directActiveCounts.get(r._candidateCanonicalId)||0)>0).length,
    canonicalOwnerWithoutActiveAuth:corroborated.filter(r=>(directActiveCounts.get(r._candidateCanonicalId)||0)===0).length,
    noIdentityMergesAuthorizedFromSimilarity:true,authWrites:0,firestoreWrites:0
  };
  // Preflight-only classification. The adjudicator retires every non-keeper Auth
  // principal: a technical keeper preference is NOT a same-human confirmation.
  // Do not include names, raw IDs, passwords, logins or telephone numbers here.
  const memberById=new Map(members.map(m=>[val(m.shopperId),m]));
  const hrAliasCounts=new Map(),keeperCounts={};
  const inc=key=>{keeperCounts[key]=(keeperCounts[key]||0)+1;};
  for(const row of corroborated){
    const aliasId=row._shopperId,canonicalId=row._candidateCanonicalId;
    hrAliasCounts.set(canonicalId,(hrAliasCounts.get(canonicalId)||0)+1);
    const alias=memberById.get(aliasId),owner=memberById.get(canonicalId);
    const aliasProfile=profiles.get(aliasId)||{},ownerProfile=profiles.get(canonicalId)||{};
    if(!alias||!owner){inc('missingExactMembership');continue;}
    const proof=m=>val(m?.credentialPasswordProofVersion)===ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
    const proofAlias=proof(alias)||proof(aliasProfile),proofOwner=proof(owner)||proof(ownerProfile);
    inc(proofAlias&&proofOwner?'bothPasswordProof':proofAlias?'aliasOnlyPasswordProof':proofOwner?'ownerOnlyPasswordProof':'neitherPasswordProof');
    const strong=[proofAlias?{type:'alias',m:alias,p:aliasProfile}:null,proofOwner?{type:'owner',m:owner,p:ownerProfile}:null].filter(Boolean);
    const credential=ShopperCredentialRule.shopperCredentialRule(ownerProfile);
    const desired=credential?.ok?val(credential.login).toLowerCase():'';
    // Compare login internally; never emit the login or its proof metadata.
    const canonicalLoginStrong=strong.filter(x=>desired&&val(x.m.visibleLogin||x.p.visibleLogin||x.p.username||x.p.user).toLowerCase()===desired);
    const picked=strong.length===1?strong[0]:strong.length>1&&canonicalLoginStrong.length===1?canonicalLoginStrong[0]:null;
    if(picked){inc('providerDeterministicKeeper');inc(picked.type==='owner'?'providerKeeperWouldBeHrOwner':'providerKeeperWouldBeAlias');}
    else inc('providerKeeperAmbiguousWithoutAdminSelection');
    if(row.candidateHistoryCount>0)inc('candidateWithHistoricalVisits');
    else inc('candidateWithoutHistoricalVisits');
  }
  report.keeperPreflight={
    schemaVersion:'cxorbia.i3.p0.shopper-keeper-preflight-readonly.v1',
    corroboratedPairCount:corroborated.length,
    distinctHrCanonicalTargets:hrAliasCounts.size,
    hrCanonicalWithMultipleAliases:[...hrAliasCounts.values()].filter(n=>n>1).length,
    ...keeperCounts,
    actionPermitted:'NONE_READONLY',
    humanConfirmationStillRequired:true,
    autoDisableOrMergeAuthorized:false,
    authWrites:0,firestoreWrites:0
  };
  const buckets=new Map(),countries=new Map();
  for(const x of rows){buckets.set(x.category,(buckets.get(x.category)||0)+1);
    const key=x.profileCountry;countries.set(key,(countries.get(key)||0)+1);}
  report.totalActiveCredentialMemberships=rows.length;
  report.totalAuthPrincipals=allAuth.length;
  report.totalProtectedProfiles=profiles.size;
  report.totalCrosswalks=cross.size;
  report.classification=Object.fromEntries([...buckets].sort());
  report.countryClassification=Object.fromEntries([...countries].sort());
  report.historyExpectedIfExactLinked=rows.reduce((sum,x)=>sum+x.historyCount,0);
  report.unlinkedWithUniqueNameAndPhoneCandidate=rows.filter(x=>!x.canonical&&x.corroboratedCandidateCount===1).length;
  report.unlinkedWithAmbiguousCandidates=rows.filter(x=>!x.canonical&&x.corroboratedCandidateCount>1).length;
  report.unlinkedNameOnlyNotSafeToMerge=rows.filter(x=>!x.canonical&&x.nameOnlyCandidateCount>0&&x.corroboratedCandidateCount===0).length;
  const duplicateMembers=new Map();for(const x of rows){if(x.canonical)duplicateMembers.set(x.canonical,(duplicateMembers.get(x.canonical)||0)+1);}
  report.duplicateActiveMembershipsForExactHrOwner=[...duplicateMembers.values()].filter(n=>n>1).length;
  const flagged=rows.filter(x=>!['HR_DIRECT_WITH_HISTORY','HR_DIRECT_ZERO_HISTORY','HR_EXACT_CROSSWALK_WITH_HISTORY','HR_EXACT_CROSSWALK_ZERO_HISTORY'].includes(x.category)||x.corroboratedCandidateCount>0);
  report.flaggedCount=flagged.length;
  report.cases=flagged.slice(0,80).map(({canonical,_shopperId,_candidateCanonicalId,...x})=>({...x,canonicalFingerprint:canonical?fp('sid:'+canonical):null}));
  report.casesTruncated=flagged.length>report.cases.length;
  const after=await currentHr('after');
  assert(after.revision===hr.revision,'HR_CHANGED_DURING_COHORT_READ');
  if(process.env.CX_SHOPPER_REVIEW_PUBKEY_B64){
    const memberById=new Map(members.map(m=>[val(m.shopperId),m]));
    const displayPair=(aliasId,ownerId,classification)=>{
      const alias=profiles.get(aliasId)||{},owner=profiles.get(ownerId)||{};
      const aliasMember=memberById.get(aliasId),ownerMember=memberById.get(ownerId);
      const proof=m=>val(m?.credentialPasswordProofVersion)===ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
      const strong=[proof(aliasMember)||proof(alias)?{type:'Técnica',m:aliasMember,p:alias}:null,
        proof(ownerMember)||proof(owner)?{type:'HR',m:ownerMember,p:owner}:null].filter(Boolean);
      const rule=ShopperCredentialRule.shopperCredentialRule(owner);
      const desired=rule?.ok?val(rule.login).toLowerCase():'';
      const canonicalLogin=strong.filter(x=>desired&&val(x.m?.visibleLogin||x.p.visibleLogin||x.p.username||x.p.user).toLowerCase()===desired);
      const keeper=strong.length===1?strong[0]:strong.length>1&&canonicalLogin.length===1?canonicalLogin[0]:null;
      return {caseKey:fp('pair:'+aliasId+'\0'+ownerId),classification,
        aliasShopperId:aliasId,hrShopperId:ownerId,
        technicalName:displayName(alias),hrName:displayName(owner),
        country:country(owner),technicalPhoneMasked:phoneMask(alias),hrPhoneMasked:phoneMask(owner),
        phoneExactMatch:!!phone(alias)&&phone(alias)===phone(owner),
        hrVisitCount:hrVisitCounts.get(ownerId)||0,
        principalCount:Number(!!aliasMember)+Number(!!ownerMember),
        proposedKeeper:keeper?.type||'Requiere decisión',
        proposalReason:keeper?'Acceso con prueba técnica de credencial y login canónico':'Sin cuenta principal técnica única',
        sameHumanDecision:'',reviewerNotes:''};
    };
    const strong=corroborated.map(r=>displayPair(r._shopperId,r._candidateCanonicalId,'Nombre + teléfono + país'));
    const weak=[];
    for(const row of rows.filter(r=>!r.canonical&&r.corroboratedCandidateCount===0&&r.nameOnlyCandidateCount>0)){
      const alias=profiles.get(row._shopperId)||{},aliasName=name(alias),aliasCountry=country(alias);
      for(const [hrId] of hrById){
        const owner=profiles.get(hrId)||{};
        if(val(owner.sourceType)!=='hr_external'||aliasCountry==='UNSET'||country(owner)!==aliasCountry||name(owner)!==aliasName||(!!phone(alias)&&phone(owner)===phone(alias)))continue;
        weak.push(displayPair(row._shopperId,hrId,'Solo nombre + país (teléfono diferente)'));
      }
    }
    const order=(a,b)=>a.country.localeCompare(b.country)||a.hrName.localeCompare(b.hrName,'es')||a.aliasShopperId.localeCompare(b.aliasShopperId);
    strong.sort(order);weak.sort(order);
    assert(strong.length===corroborated.length,'REVIEW_STRONG_CASE_COUNT_MISMATCH');
    writeSealedPrivateReview(process.env.CX_SHOPPER_REVIEW_PUBKEY_B64,{
      schemaVersion:'cxorbia.i3.p0.private-review.v1',sourceRevision:hr.revision,
      sourceRun:'DEV_READONLY',production:false,authWrites:0,firestoreWrites:0,hrWrites:0,
      columnsEditability:{sameHumanDecision:'Paula',reviewerNotes:'Paula',otherFields:'no editar'},strong,weak});
    report.privateReview={sealed:true,plaintextWrittenToDisk:false,encryptedCount:strong.length+weak.length,
      strongCount:strong.length,weakCount:weak.length,decisionColumnsDefaultBlank:true,authWrites:0,firestoreWrites:0};
  }
  report.decision='PASS_DEV_SHOPPER_IDENTITY_COHORT_READONLY';
  report.systemicFinding=report.flaggedCount>0?'P0_REAL_IDENTITY_LINKS_REQUIRE_EXACT_RESOLUTION':'NO_UNRESOLVED_ACTIVE_AUTH_MEMBERSHIPS';
}catch(error){report.decision='HOLD_COHORT_READONLY';report.errorCode=val(error?.message||error).replace(/[^a-zA-Z0-9_:-]/g,'_').slice(0,90);}
save();
console.log(JSON.stringify({decision:report.decision,hrRevision:report.hrRevision,hrSummary:report.hrSummary,
  totalActiveCredentialMemberships:report.totalActiveCredentialMemberships,
  classification:report.classification,flaggedCount:report.flaggedCount,
  unlinkedWithUniqueNameAndPhoneCandidate:report.unlinkedWithUniqueNameAndPhoneCandidate,
  technicalIdentityEvidence:report.technicalIdentityEvidence,
  keeperPreflight:report.keeperPreflight,
  privateReview:report.privateReview,
  unlinkedNameOnlyNotSafeToMerge:report.unlinkedNameOnlyNotSafeToMerge,
  production:false,writes:0,errorCode:report.errorCode||null}));
if(report.decision!=='PASS_DEV_SHOPPER_IDENTITY_COHORT_READONLY')process.exitCode=2;
