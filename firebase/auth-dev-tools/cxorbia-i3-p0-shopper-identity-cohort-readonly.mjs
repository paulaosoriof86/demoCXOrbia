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
const sid=v=>val(v?.shopperId||v?.id);
const assert=(yes,code)=>{if(!yes)throw new Error(code);};
const report={schemaVersion:'cxorbia.i3.p0.shopper-identity-cohort-readonly.v1',
  decision:'HOLD_DIAGNOSTIC_INCOMPLETE',environment:'DEV',project:PROJECT,tenant:TENANT,program:PROGRAM,
  production:false,authWrites:0,firestoreWrites:0,hrWrites:0,externalWrites:0,deployments:0,
  merges:0,credentialResets:0,classification:{},countryClassification:{},cases:[]};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(report,null,2)+'\n','utf8');
save();

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
  for(const row of hr.visits){const id=sid(row);if(id)hrVisitCounts.set(id,(hrVisitCounts.get(id)||0)+1);}
  report.hrSummary={shoppers:hr.shoppers.length,visits:hr.visits.length,
    profilesWithHistory:[...hrVisitCounts].filter(([,count])=>count>0).length,
    byCountry:Object.fromEntries(['GT','HN'].map(c=>[c,hr.shoppers.filter(x=>country(x)===c).length]))};
  const [memberSnap,profileSnap,crossSnap]=await Promise.all([
    tenant.collection('users').get(),tenant.collection('shoppers').get(),tenant.collection('shopperIdentityCrosswalk').get()]);
  const members=memberSnap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(m=>
    m.active===true&&val(m.tenantId)===TENANT&&val(m.role)==='shopper'&&
    val(m.authNamespace)==='shopper'&&arr(m.projectIds).includes(PROGRAM));
  const profiles=new Map(profileSnap.docs.map(d=>[d.id,{...(d.data()||{}),__docId:d.id}]));
  const cross=new Map(crossSnap.docs.map(d=>[d.id,d.data()||{}]));
  const allAuth=[];let token;
  do{const page=await auth.listUsers(1000,token);allAuth.push(...page.users);token=page.pageToken;}while(token);
  const authByUid=new Map(allAuth.map(u=>[u.uid,u]));
  const rows=members.map(m=>classify({m,auth:authByUid.get(m.uid),hrById,hrVisitCounts,profiles,cross}));
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
  report.cases=flagged.slice(0,80).map(({canonical,...x})=>({...x,canonicalFingerprint:canonical?fp('sid:'+canonical):null}));
  report.casesTruncated=flagged.length>report.cases.length;
  const after=await currentHr('after');
  assert(after.revision===hr.revision,'HR_CHANGED_DURING_COHORT_READ');
  report.decision='PASS_DEV_SHOPPER_IDENTITY_COHORT_READONLY';
  report.systemicFinding=report.flaggedCount>0?'P0_REAL_IDENTITY_LINKS_REQUIRE_EXACT_RESOLUTION':'NO_UNRESOLVED_ACTIVE_AUTH_MEMBERSHIPS';
}catch(error){report.decision='HOLD_COHORT_READONLY';report.errorCode=val(error?.message||error).replace(/[^a-zA-Z0-9_:-]/g,'_').slice(0,90);}
save();
console.log(JSON.stringify({decision:report.decision,hrRevision:report.hrRevision,hrSummary:report.hrSummary,
  totalActiveCredentialMemberships:report.totalActiveCredentialMemberships,
  classification:report.classification,flaggedCount:report.flaggedCount,
  unlinkedWithUniqueNameAndPhoneCandidate:report.unlinkedWithUniqueNameAndPhoneCandidate,
  unlinkedNameOnlyNotSafeToMerge:report.unlinkedNameOnlyNotSafeToMerge,
  production:false,writes:0,errorCode:report.errorCode||null}));
if(report.decision!=='PASS_DEV_SHOPPER_IDENTITY_COHORT_READONLY')process.exitCode=2;
