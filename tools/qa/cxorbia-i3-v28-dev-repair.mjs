import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const OUT=process.env.V28_OUT||'.tmp/i3-v28';
const HR_URL=process.env.V28_HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&v28=repair';
const RUN=process.env.GITHUB_RUN_ID||Date.now().toString();
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const INVALID='shopper_gt_018ca3e794',CANON='shopper_gt_bd74ace936';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore(),auth=getAuth(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const visits=project.collection('visits'),posts=project.collection('postulations'),reservations=project.collection('reservations');
const archive=tenant.collection('recoveryArchives').doc('I3_V28_'+RUN);
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const clean=v=>Array.isArray(v)?v.map(clean):(v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([,x])=>x!==undefined&&typeof x!=='function').map(([k,x])=>[k,clean(x)])):v);
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex').slice(0,32);
let writes=0,archives=0,deletes=0,authWrites=0;
async function archiveDoc(ref,reason){
  const snap=await ref.get();if(!snap.exists)return null;
  const data=snap.data()||{},id=hash(ref.path);
  await archive.collection('items').doc(id).set({sourcePath:ref.path,reason,archivedAt:new Date().toISOString(),data:clean(data)},{merge:false});
  writes++;archives++;return data;
}
async function queryEq(col,field,value){const s=await col.where(field,'==',value).get();return s.docs;}
async function setMerge(ref,data){await ref.set(clean(data),{merge:true});writes++;}
async function deleteRef(ref){await ref.delete();writes++;deletes++;}

await archive.set({
  schemaVersion:'cxorbia.i3.v28.dev-repair.v1',tenantId:TENANT,projectId:PROJECT,
  invalidIdentity:INVALID,canonicalIdentity:CANON,authorityType:'tenant_adjudication',
  authorityRef:'paula-2026-09-25-mishael-does-not-exist',startedAt:new Date().toISOString(),
  production:false,hrWrites:0
},{merge:false});writes++;

// 1) Freeze exact tenant adjudication before any HR reconciliation can recreate the phantom identity.
const profileRef=tenant.collection('shoppers').doc(INVALID),canonRef=tenant.collection('shoppers').doc(CANON);
const canonSnap=await canonRef.get();if(!canonSnap.exists)throw new Error('MAPPING_FAILURE:CANONICAL_MILTON_PROFILE_MISSING');
const canon=canonSnap.data()||{},canonName=str(canon.nombre||[canon.firstName,canon.lastName].filter(Boolean).join(' '))||'Milton De Paz';
const canonMembers=(await queryEq(tenant.collection('users'),'shopperId',CANON)).filter(d=>{const x=d.data()||{};return x.active===true&&str(x.role)==='shopper'&&str(x.authNamespace)==='shopper';});
if(canonMembers.length!==1)throw new Error('MAPPING_FAILURE:CANONICAL_MILTON_MEMBERSHIP_COUNT_'+canonMembers.length);
const canonMember=canonMembers[0].data()||{};
const canonUid=canonMembers[0].id;
const canonAuth=await auth.getUser(canonUid).catch(()=>null);
if(!canonAuth||canonAuth.disabled===true)throw new Error('AUTH_FAILURE:CANONICAL_MILTON_AUTH_INVALID');
const canonUidFingerprint=crypto.createHash('sha256').update('cxorbia-provider-uid-v1\0'+canonUid,'utf8').digest('hex');
const canonCrossSnap=await tenant.collection('shopperIdentityCrosswalk').doc(CANON).get();
const canonCross=canonCrossSnap.exists?(canonCrossSnap.data()||{}):{};
const canonicalProjectIds=[...new Set([...arr(canon.projectIds),...arr(canonMember.projectIds),...arr(canonCross.projectIds),PROJECT].map(str).filter(Boolean))];
await archiveDoc(profileRef,'invalid_identity_profile_before_quarantine');
await setMerge(profileRef,{identityQuarantined:true,excludedFromCanonicalReadModel:true,identityAdjudicationState:'tenant_invalid_identity',canonicalShopperId:CANON,quarantineReason:'tenant_owner_confirms_identity_does_not_exist',quarantinedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});

const crossRef=tenant.collection('shopperIdentityCrosswalk').doc(INVALID);
await archiveDoc(crossRef,'invalid_identity_crosswalk_before_adjudication');
await setMerge(crossRef,{tenantId:TENANT,shopperId:CANON,canonicalShopperId:CANON,sourceShopperId:INVALID,sourceStableKey:INVALID,providerUidFingerprint:canonUidFingerprint,identityAdjudicationState:'tenant_adjudicated_invalid_alias',authorityType:'tenant_adjudication',authorityRef:'paula-2026-09-25-mishael-does-not-exist',projectIds:canonicalProjectIds,updatedAt:new Date().toISOString()});

const linkRef=tenant.collection('shopperIdentityLinks').doc('tenant-adj-mishael-depaz-20260926');
await archiveDoc(linkRef,'identity_link_prior_state');
await linkRef.set({
  tenantId:TENANT,projectId:PROJECT,projectScope:PROJECT,sourceSystem:'hr_external',sourceType:'hr_external',
  sourceIdentity:{shopperId:INVALID,sourceShopperId:INVALID},sourceShopperId:INVALID,
  canonicalShopperId:CANON,shopperId:CANON,status:'confirmed',state:'confirmed',
  authorityType:'tenant_adjudication',authorityRef:'paula-2026-09-25-mishael-does-not-exist',
  providerUidFingerprint:canonUidFingerprint,periodIndependent:true,exactAliases:[INVALID],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
},{merge:false});writes++;

const members=await queryEq(tenant.collection('users'),'shopperId',INVALID);
for(const m of members){
  await archiveDoc(m.ref,'invalid_identity_membership_before_disable');
  await setMerge(m.ref,{active:false,identityQuarantined:true,canonicalShopperId:CANON,quarantineReason:'tenant_owner_confirms_identity_does_not_exist',updatedAt:new Date().toISOString()});
  try{await auth.updateUser(m.id,{disabled:true});authWrites++;}catch(e){if(str(e?.code)!=='auth/user-not-found')throw e;}
}

// 2) Re-home platform-owned records from the nonexistent identity to the tenant-adjudicated canonical Milton profile.
for(const d of await queryEq(posts,'shopperId',INVALID)){
  await archiveDoc(d.ref,'postulation_invalid_identity_before_canonicalization');
  await setMerge(d.ref,{shopperId:CANON,shopper:canonName,shopperCode:str(canon.code||canon.shopperCode),identityAdjudicatedFrom:INVALID,identityAuthority:'tenant_adjudication',identityAuthorityRef:'paula-2026-09-25-mishael-does-not-exist',updatedAt:new Date().toISOString()});
}
for(const d of await queryEq(reservations,'shopperId',INVALID)){
  await archiveDoc(d.ref,'reservation_invalid_identity_before_canonicalization');
  await setMerge(d.ref,{shopperId:CANON,shopper:canonName,identityAdjudicatedFrom:INVALID,identityAuthority:'tenant_adjudication',identityAuthorityRef:'paula-2026-09-25-mishael-does-not-exist',updatedAt:new Date().toISOString()});
}

// 3) Trigger the new provider against the live source. The trusted identity link prevents phantom recreation.
let response=null,lastHttpStatus=0,lastHttpError=null;
for(let attempt=1;attempt<=20;attempt++){
  try{
    response=await fetch(HR_URL+'&attempt='+attempt,{headers:{'cache-control':'no-cache,no-store,max-age=0'}});
    lastHttpStatus=Number(response.status||0);
    if(response.ok)break;
    if(![429,500,502,503,504].includes(lastHttpStatus))throw new Error('ENVIRONMENT_FAILURE:V28_HR_HTTP_'+lastHttpStatus);
  }catch(error){lastHttpError=error;}
  if(attempt<20)await new Promise(r=>setTimeout(r,Math.min(15000,1200*attempt)));
}
if(!response||!response.ok)throw new Error('ENVIRONMENT_FAILURE:V28_HR_RETRY_EXHAUSTED_'+lastHttpStatus+':'+str(lastHttpError?.message||lastHttpError||''));
const payload=await response.json(),snapshot=payload.snapshot||payload.data||payload;
if(snapshot?.sourceSafe!==true||snapshot?.imported===true||snapshot?.production===true)throw new Error('PROVIDER_FAILURE:V28_HR_UNSAFE');
const liveVisits=arr(snapshot.visits),current=liveVisits.filter(v=>str(v.periodKey)==='2026-09');
if(current.length!==44)throw new Error('MAPPING_FAILURE:V28_HR_CURRENT_COUNT_'+current.length);
const liveByRow=new Map(liveVisits.map(v=>[str(v.hrRowId),v]).filter(([k])=>k));

// 4) Canonicalize all current durable visit document IDs to stable hrRowId and archive/delete superseded source-ID docs.
for(const row of current){
  const key=str(row.hrRowId);if(!key)throw new Error('MAPPING_FAILURE:V28_HR_ROW_KEY_MISSING');
  const group=await queryEq(visits,'hrRowId',key);
  const canonical=group.find(d=>d.id===key);
  if(!canonical)throw new Error('PERSISTENCE_FAILURE:V28_CANONICAL_VISIT_NOT_MATERIALIZED:'+key);
  for(const d of group){
    if(d.id===key)continue;
    await archiveDoc(d.ref,'superseded_current_visit_duplicate_before_delete');
    await deleteRef(d.ref);
  }
}

// 5) Any remaining durable visit that still references the invalid shopper is mapped by exact HR row.
// If the live source itself still carries the invalid alias, the tenant adjudication maps it to Milton.
for(const d of await queryEq(visits,'shopperId',INVALID)){
  const v=d.data()||{},row=liveByRow.get(str(v.hrRowId));
  await archiveDoc(d.ref,'invalid_identity_visit_before_exact_source_repair');
  const sourceShopper=str(row?.shopperId);
  const target=!sourceShopper||sourceShopper===INVALID?CANON:sourceShopper;
  await setMerge(d.ref,{shopperId:target,shopper:target===CANON?canonName:(row?.shopper||v.shopper||null),identityAdjudicatedFrom:INVALID,identityAuthority:sourceShopper&&sourceShopper!==INVALID?'hr_exact':'tenant_adjudication',identityAuthorityRef:sourceShopper&&sourceShopper!==INVALID?str(payload?._runtime?.revision||payload.revision):'paula-2026-09-25-mishael-does-not-exist',updatedAt:new Date().toISOString()});
}

// 6) Resolve review rows that were caused by the invalid identity; preserve the review record itself.
const reviewSnap=await tenant.collection('reviewQueue').get();
for(const d of reviewSnap.docs){
  const x=d.data()||{};
  if(str(x.platformShopperId)!==INVALID&&str(x.observedHrShopperId)!==INVALID)continue;
  await archiveDoc(d.ref,'invalid_identity_review_before_resolution');
  await setMerge(d.ref,{status:'resolved',resolution:'tenant_identity_adjudication_and_hr_authority',canonicalShopperId:CANON,resolvedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
}

// 7) Exact post-repair assertions.
const currentDurable=(await visits.where('periodId','==',PERIOD).get()).docs.filter(d=>(d.data()||{}).excludedFromCanonicalReadModel!==true);
const keys=currentDurable.map(d=>str((d.data()||{}).hrRowId)).filter(Boolean);
if(currentDurable.length!==44||new Set(keys).size!==44)throw new Error('PERSISTENCE_FAILURE:V28_CURRENT_VISIT_PARITY');
if(currentDurable.some(d=>str((d.data()||{}).shopperId)===INVALID))throw new Error('MAPPING_FAILURE:V28_INVALID_IDENTITY_CURRENT_VISIT');
if((await queryEq(posts,'shopperId',INVALID)).length)throw new Error('MAPPING_FAILURE:V28_INVALID_IDENTITY_POSTULATIONS_REMAIN');
if((await queryEq(reservations,'shopperId',INVALID)).length)throw new Error('MAPPING_FAILURE:V28_INVALID_IDENTITY_RESERVATIONS_REMAIN');
const invalidMemberActive=(await queryEq(tenant.collection('users'),'shopperId',INVALID)).filter(d=>(d.data()||{}).active===true);
if(invalidMemberActive.length)throw new Error('AUTH_FAILURE:V28_INVALID_IDENTITY_MEMBER_ACTIVE');
const invalidProfile=(await profileRef.get()).data()||{};
if(invalidProfile.identityQuarantined!==true)throw new Error('PERSISTENCE_FAILURE:V28_INVALID_PROFILE_NOT_QUARANTINED');

const result={
  schemaVersion:'cxorbia.i3.v28.dev-repair.result.v1',decision:'PASS_I3_V28_DEV_DURABLE_REPAIR',
  hrRevision:str(payload?._runtime?.revision||payload.revision||payload.sourceRevision),
  hrCurrentCount:current.length,durableCurrentCount:currentDurable.length,uniqueCurrentHrRows:new Set(keys).size,
  invalidIdentity:INVALID,canonicalIdentity:CANON,invalidIdentityActiveMembers:invalidMemberActive.length,
  remainingInvalidPostulations:(await queryEq(posts,'shopperId',INVALID)).length,
  remainingInvalidReservations:(await queryEq(reservations,'shopperId',INVALID)).length,
  archives,writes,deletes,authWrites,hrWrites:0,production:false,completedAt:new Date().toISOString()
};
await archive.set({completedAt:result.completedAt,result},{merge:true});writes++;
await import('node:fs').then(fs=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/repair-result.json',JSON.stringify({...result,writes},null,2)+'\n');});
console.log(JSON.stringify({...result,writes},null,2));
