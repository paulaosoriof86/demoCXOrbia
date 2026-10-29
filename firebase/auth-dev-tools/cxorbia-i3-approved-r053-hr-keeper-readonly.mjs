#!/usr/bin/env node
/* CXOrbia I3 / R-053 GT — exact human-approved identity READ-ONLY preflight.
 * Independently recomputes the 139-case approved workbook digest before it
 * selects R-053. Only provider/HR/Auth/Firestore reads. No fusion or writes.
 * Human names, phones, logins, IDs and Auth UIDs never enter output artifacts.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis',CASE='R-053';
const EXPECTED_REV='4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a';
const PAIRS_DIGEST='ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872';
const AUTHORIZATION='PAULA_I3_2026_10_29_R053_GT_HR_KEEPER_READONLY';
const COMPLETED_REASON=/^paula_confirmed_exact_same_human_[fr]\d{3}_2026_10_28$/;
const OUT=String(process.env.CX_R053_READONLY_OUT||'.tmp/cxorbia-i3-r053-hr-keeper-readonly');
const HR_URL='https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV';
const val=x=>String(x??'').trim(),arr=x=>Array.isArray(x)?x:[];
const uniq=xs=>[...new Set(arr(xs).map(val).filter(Boolean))];
const hash=x=>crypto.createHash('sha256').update(String(x),'utf8').digest('hex');
const fp=(kind,x)=>hash(kind+':'+x).slice(0,20);
const norm=x=>val(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const country=x=>{const c=norm(x?.pais||x?.country||x?.país);return c==='guatemala'||c==='gt'?'GT':c==='honduras'||c==='hn'?'HN':c?'OTHER':'UNSET';};
const name=x=>norm(x?.nombre||x?.displayName||x?.fullName||x?.name||[x?.firstName,x?.lastName].filter(Boolean).join(' '));
const displayName=x=>val(x?.nombre||x?.displayName||x?.fullName||x?.name||[x?.firstName,x?.lastName].filter(Boolean).join(' '));
const phone=x=>val(x?.whatsapp||x?.phone||x?.telefono).replace(/\D/g,'');
const localPhone=x=>{const p=phone(x);return p.length===11&&p.startsWith('502')?p.slice(3):p.length===13&&p.startsWith('00502')?p.slice(5):p;};
const sid=x=>val(x?.shopperId||x?.id);
const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const result={schemaVersion:'cxorbia.i3.r053.gt.hr-keeper.readonly.v1',caseCode:CASE,
  decision:'HOLD',environment:'DEV',firebaseProject:PROJECT,tenant:TENANT,program:PROGRAM,
  sourceProductSha:'a2be5a77a4c0008ec374c17f42d5da27070e1ed6',
  sourceRevision:EXPECTED_REV,approvedWorkbookPairDigest:PAIRS_DIGEST,
  humanDecision:'YES_SAME_HUMAN',phoneNeverMergeGate:true,contactReviewAtFirstLoginRequired:true,
  readOnly:true,production:false,authWrites:0,firestoreWrites:0,hrWrites:0,
  externalWrites:0,deployments:0,merges:0,credentialResets:0};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();

async function currentHr(label){
  const response=await fetch(HR_URL+'&r053Preflight='+encodeURIComponent(label)+'-'+Date.now(),{
    headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(120000)});
  assert(response.ok,'R053_HR_HTTP_'+response.status);
  const body=await response.json(),snapshot=body.snapshot||body.data||body;
  const revision=val(body.revision||body._runtime?.revision||snapshot.sourceRevision);
  assert(revision===EXPECTED_REV,'R053_HR_REVISION_DRIFT');
  assert(body._runtime?.operationalView===true&&snapshot.operationalIdentityPreview===true,
    'R053_HR_OPERATIONAL_NAMES_NOT_AUTHORIZED');
  assert(arr(snapshot.shoppers).length>0&&arr(snapshot.visits).length>0,'R053_HR_EMPTY');
  return {revision,shoppers:arr(snapshot.shoppers),visits:arr(snapshot.visits)};
}
function authValid(member,user){
  const claims=user?.customClaims||{};
  return !!user&&!user.disabled&&member.active===true&&
    val(member.tenantId)===TENANT&&val(member.role)==='shopper'&&
    val(member.authNamespace)==='shopper'&&arr(member.projectIds).includes(PROGRAM)&&
    val(claims.tenantId)===TENANT&&val(claims.role)==='shopper'&&
    val(claims.authNamespace)==='shopper'&&val(claims.shopperId)===val(member.shopperId)&&
    arr(claims.projectIds).includes(PROGRAM);
}
function currentCanonical(id,cross,hrById){
  if(hrById.has(id))return id;
  const row=cross.get(id)||{},target=val(row.shopperId||row.canonicalShopperId);
  if(val(row.tenantId)===TENANT&&(!arr(row.projectIds).length||arr(row.projectIds).includes(PROGRAM))&&
    hrById.has(target))return target;
  return '';
}
// Must stay byte-semantically equivalent to the approved-139 preflight's
// pairing order and digest. If upstream authority changes, fail closed.
function approvedPairs({members,profiles,hrById,cross,links,authByUid}){
  const strong=[],weak=[];
  const active=members.filter(m=>m.active===true&&val(m.tenantId)===TENANT&&
    val(m.role)==='shopper'&&val(m.authNamespace)==='shopper'&&arr(m.projectIds).includes(PROGRAM));
  for(const member of active){
    if(!authValid(member,authByUid.get(member.uid)))continue;
    const accountId=val(member.shopperId),profile=profiles.get(accountId);
    if(!profile||currentCanonical(accountId,cross,hrById))continue;
    const n=name(profile),p=phone(profile),c=country(profile);
    if(!n||c==='UNSET')continue;
    const matches=[];
    for(const [id] of hrById){
      const source=profiles.get(id);
      if(!source||val(source.sourceType)!=='hr_external'||country(source)!==c||name(source)!==n)continue;
      matches.push({id,phoneExact:!!p&&p===phone(source)});
    }
    const exact=matches.filter(x=>x.phoneExact);
    if(exact.length===1){strong.push({hrId:exact[0].id,accountId,country:c,hrName:displayName(profiles.get(exact[0].id))});continue;}
    if(exact.length===0)for(const x of matches)
      weak.push({hrId:x.id,accountId,country:c,hrName:displayName(profiles.get(x.id))});
  }
  const completed=links.filter(l=>val(l.authorityType)==='tenant_adjudication'&&
    COMPLETED_REASON.test(val(l.reason))&&l.humanConfirmed===true&&
    ['active','approved','confirmed'].includes(val(l.status||l.state).toLowerCase()));
  for(const link of completed){
    const canonicalId=val(link.canonicalShopperId),cp=profiles.get(canonicalId);
    if(!hrById.has(canonicalId)||!cp||val(cp.sourceType)!=='hr_external')continue;
    const c=country(cp);
    for(const aliasId of uniq(link.exactAliases||[])){
      const ap=profiles.get(aliasId),cw=cross.get(aliasId)||{},sameName=!!ap&&name(cp)===name(ap);
      assert(aliasId!==canonicalId&&ap&&sameName&&c!=='UNSET'&&c===country(ap)&&
        val(ap.supersededByShopperId)===canonicalId&&val(cw.shopperId)===canonicalId&&
        !active.some(m=>val(m.shopperId)===aliasId),'R053_COMPLETED_LINK_READBACK_DRIFT');
      if(strong.some(x=>x.hrId===canonicalId&&x.accountId===aliasId)||
        weak.some(x=>x.hrId===canonicalId&&x.accountId===aliasId))continue;
      const matchingPhone=!!phone(cp)&&phone(cp)===phone(ap);
      (matchingPhone?strong:weak).push({hrId:canonicalId,accountId:aliasId,country:c,
        hrName:displayName(cp),alreadyConsolidated:true});
    }
  }
  const sorter=(a,b)=>a.country.localeCompare(b.country)||a.hrName.localeCompare(b.hrName,'es')||a.accountId.localeCompare(b.accountId);
  strong.sort(sorter);weak.sort(sorter);
  assert(strong.length===66&&weak.length===73,'R053_APPROVED_COUNT_DRIFT');
  const cases=[...strong.map((x,i)=>({...x,caseId:'F-'+String(i+1).padStart(3,'0')})),
    ...weak.map((x,i)=>({...x,caseId:'R-'+String(i+1).padStart(3,'0')}))];
  const digest=hash(cases.map(c=>c.caseId+'\0'+c.hrId+'\0'+c.accountId).join('\n'));
  assert(digest===PAIRS_DIGEST,'R053_APPROVED_PAIR_DIGEST_DRIFT');
  return cases;
}
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId',
  'applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId',
  'liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];
const owns=(row,id)=>ownerFields.some(k=>val(row?.[k])===id)||
  ownerArrays.some(k=>arr(row?.[k]).some(x=>val(x)===id));

async function inspect(){
  assert(process.env.CX_R053_READONLY_AUTH===AUTHORIZATION,'R053_EXPLICIT_AUTH_GATE');
  assert(process.env.CX_R053_APPROVED_DIGEST===PAIRS_DIGEST,'R053_APPROVED_WORKBOOK_GATE');
  assert(process.env.GCLOUD_PROJECT===PROJECT||process.env.GOOGLE_CLOUD_PROJECT===PROJECT,
    'R053_DEV_PROJECT_ONLY');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const db=getFirestore(),auth=getAuth(),tenant=db.collection('tenants').doc(TENANT);
  const [hr,membersSnap,profilesSnap,crossSnap,linksSnap]=await Promise.all([
    currentHr('first'),tenant.collection('users').get(),tenant.collection('shoppers').get(),
    tenant.collection('shopperIdentityCrosswalk').get(),tenant.collection('shopperIdentityLinks').get()]);
  const members=membersSnap.docs.map(d=>({uid:d.id,...(d.data()||{})})),
    profiles=new Map(profilesSnap.docs.map(d=>[d.id,d.data()||{}])),
    cross=new Map(crossSnap.docs.map(d=>[d.id,d.data()||{}])),
    links=linksSnap.docs.map(d=>d.data()||{}),hrById=new Map();
  for(const row of hr.shoppers){const id=sid(row);assert(id&&!hrById.has(id),'R053_HR_DUPLICATE_ID');hrById.set(id,row);}
  const authUsers=[];let token,pageCount=0;
  do{const page=await auth.listUsers(1000,token);authUsers.push(...arr(page.users));token=page.pageToken;
    assert(++pageCount<=30,'R053_AUTH_PAGINATION_BOUND');}while(token);
  const authByUid=new Map(authUsers.map(user=>[user.uid,user]));
  const cases=approvedPairs({members,profiles,hrById,cross,links,authByUid});
  const selected=cases.filter(x=>x.caseId===CASE);
  assert(selected.length===1,'R053_CASE_NOT_UNIQUE');
  const pair=selected[0],canonical=pair.hrId,alias=pair.accountId,
    cp=profiles.get(canonical),ap=profiles.get(alias),live=hrById.get(canonical);
  assert(canonical!==alias&&pair.country==='GT'&&pair.alreadyConsolidated!==true&&
    !!cp&&!!ap&&!!live&&val(cp.sourceType)==='hr_external'&&
    !val(ap.supersededByShopperId),'R053_EXACT_PAIR_OR_STATE_DRIFT');
  const hrRows=hr.shoppers.filter(x=>sid(x)===canonical),aliasHr=hr.shoppers.filter(x=>sid(x)===alias),
    historical=hr.visits.filter(x=>sid(x)===canonical);
  assert(hrRows.length===1&&aliasHr.length===0,'R053_HR_CANONICAL_UNIQUENESS_DRIFT');
  assert(name(cp)&&name(cp)===name(ap)&&name(cp)===name(live)&&
    country(cp)==='GT'&&country(ap)==='GT'&&country(live)==='GT',
    'R053_NAME_COUNTRY_AUTHORITY_DRIFT');
  result.identity={canonicalFingerprint:fp('sid',canonical),aliasFingerprint:fp('sid',alias),
    canonicalHrRowCount:hrRows.length,aliasHrRowCount:aliasHr.length,historicalHrVisits:historical.length,
    normalizedNameExact:true,country:'GT',technicalProfileNotSuperseded:true};save();

  const activeFor=id=>members.filter(m=>m.active===true&&val(m.shopperId)===id&&
    val(m.tenantId)===TENANT&&val(m.role)==='shopper'&&val(m.authNamespace)==='shopper'&&
    arr(m.projectIds).includes(PROGRAM));
  const canonicalMembers=activeFor(canonical),aliasMembers=activeFor(alias);
  assert(canonicalMembers.length===1&&aliasMembers.length<=1,'R053_HR_KEEPER_MEMBERSHIP_UNSAFE');
  for(const m of [...canonicalMembers,...aliasMembers])
    assert(authValid(m,authByUid.get(m.uid)),'R053_AUTH_CLAIMS_MEMBERSHIP_DRIFT');
  const keeper=canonicalMembers[0],keeperUser=authByUid.get(keeper.uid);
  const keeperProof=val(keeper.credentialPasswordProofVersion||cp.credentialPasswordProofVersion)===
    ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
  const other=aliasMembers[0],otherUser=other?authByUid.get(other.uid):null,
    secondaryProof=other&&val(other.credentialPasswordProofVersion||ap.credentialPasswordProofVersion)===
      ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
  const signIn=val(otherUser?.metadata?.lastSignInTime),secondaryTime=Date.parse(signIn),
    secondaryRecent=!!signIn&&(!Number.isFinite(secondaryTime)||Date.now()-secondaryTime<7*86400000);
  const canonicalCross=cross.get(canonical)||{},aliasCross=cross.get(alias)||{};
  result.access={keeperDirection:'HR',keeperUidFingerprint:fp('uid',keeper.uid),
    hrPrincipalActive:true,aliasAdditionalActivePrincipals:aliasMembers.length,
    keeperPasswordProof:keeperProof,aliasPasswordProof:!!secondaryProof,
    keeperVisibleLoginPresent:!!val(keeper.visibleLogin),
    keeperPrivateNamespace:val(keeperUser?.email).endsWith('@auth.cxorbia.invalid'),
    secondaryRecentSignIn:secondaryRecent,
    canonicalCrosswalkSelfOwned:val(canonicalCross.shopperId)===canonical,
    aliasCrosswalkSelfOwned:val(aliasCross.shopperId)===alias};save();
  assert(keeperProof&&result.access.keeperVisibleLoginPresent&&
    result.access.keeperPrivateNamespace&&!secondaryRecent&&
    result.access.canonicalCrosswalkSelfOwned&&result.access.aliasCrosswalkSelfOwned,
    'R053_AUTH_KEEPER_OR_CROSSWALK_UNSAFE');
  assert(!secondaryProof,'R053_DUAL_PASSWORD_PROOF_REQUIRES_SEPARATE_HUMAN_REVIEW');

  const areas=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],
    ['project','certifications'],['project','liquidations'],['project','postulations'],
    ['project','reservations'],['project','visits']];
  const ownership={};
  for(const [scope,collection] of areas){
    const parent=scope==='tenant'?tenant:tenant.collection('projects').doc(PROGRAM),
      snap=await parent.collection(collection).get();
    ownership[collection]=snap.docs.filter(doc=>owns(doc.data()||{},alias)).length;
  }
  result.domains={aliasOwnedByDomain:ownership,aliasOwnedTotal:Object.values(ownership).reduce((a,b)=>a+b,0)};save();
  assert(Object.values(ownership).every(x=>x===0),'R053_SEVEN_DOMAIN_ALIAS_REFERENCES_NOT_ZERO');
  const conflicts=links.filter(link=>{
    const tokens=[link.sourceIdentityKey,link.sourceShopperId,...arr(link.exactAliases),...arr(link.sourceAliases)].map(val);
    return ['active','confirmed','approved','materialized'].includes(val(link.status||link.state).toLowerCase())&&
      tokens.includes(alias)&&val(link.canonicalShopperId)!==canonical;
  });
  assert(conflicts.length===0,'R053_PRIOR_TRUSTED_LINK_CONFLICT');

  const canonicalDigits=localPhone(cp),aliasDigits=localPhone(ap),hrDigits=localPhone(live),
    profileFrequency=x=>x?[...profiles.values()].filter(p=>localPhone(p)===x).length:0,
    hrFrequency=x=>x?hr.shoppers.filter(p=>localPhone(p)===x).length:0;
  const contactOptions=uniq([canonicalDigits,aliasDigits,hrDigits]).map(digits=>({
    fingerprint:fp('gtPhone',digits),
    protectedFrequency:profileFrequency(digits),hrFrequency:hrFrequency(digits),
    totalFrequency:profileFrequency(digits)+hrFrequency(digits)
  }));
  result.contact={neverBlocksIdentityMerge:true,canonicalPhonePresent:!!canonicalDigits,
    aliasPhonePresent:!!aliasDigits,hrPhonePresent:!!hrDigits,
    differentProtectedPhones:!!canonicalDigits&&!!aliasDigits&&canonicalDigits!==aliasDigits,
    candidateFrequencies:contactOptions,selectionRule:'MOST_FREQUENT_TIE_ANY_PRESERVE_ALTERNATES',
    firstLoginReviewRequired:true};save();

  const [hrSecond,canonicalFresh,aliasFresh,keeperFresh]=await Promise.all([
    currentHr('second'),tenant.collection('shoppers').doc(canonical).get(),
    tenant.collection('shoppers').doc(alias).get(),tenant.collection('users').doc(keeper.uid).get()]);
  // The in-memory index adds the Firestore document ID as `uid`; comparing it
  // to raw doc.data() would always fail, even when the authority is unchanged.
  const {uid:keeperUidFromIndex,...keeperMemberSource}=keeper;
  assert(hrSecond.shoppers.filter(x=>sid(x)===canonical).length===1&&
    hrSecond.visits.filter(x=>sid(x)===canonical).length===historical.length&&
    JSON.stringify(canonicalFresh.data()||{})===JSON.stringify(cp)&&
    JSON.stringify(aliasFresh.data()||{})===JSON.stringify(ap)&&
    keeperFresh.id===keeperUidFromIndex&&
    JSON.stringify(keeperFresh.data()||{})===JSON.stringify(keeperMemberSource),
    'R053_SOURCE_CHANGED_DURING_PREFLIGHT');
  result.decision='PASS_R053_GT_HR_KEEPER_READONLY_PREFLIGHT';
  result.keeperHRVerified=true;result.phoneNeverMergeGate=true;
  result.authorizationForCanary=false;result.noWritesVerified=true;save();
}
try{await inspect();}
catch(error){result.decision='HOLD_R053_GT_HR_KEEPER_READONLY';
  result.errorCode=val(error?.message||error).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,100);
  process.exitCode=2;save();}
console.log(JSON.stringify(result));
