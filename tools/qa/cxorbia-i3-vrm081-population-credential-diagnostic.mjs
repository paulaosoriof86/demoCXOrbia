#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const OUT=process.env.VRM081_OUT||'.tmp/i3-vrm081';
const ROOT=String(process.env.VRM081_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT=String(process.env.VRM081_TENANT||'tya');
const PROJECT=String(process.env.VRM081_PROJECT||'cinepolis');
const SOURCE=String(process.env.VRM081_SOURCE||'');
const OPERATIONAL_TOKEN='YES_PAULA_20260731_NAMES_DEV';
if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('ENVIRONMENT_FAILURE:VRM081_SOURCE');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const sha=v=>{const h=crypto.createHash('sha256');h['update'](String(v));return h.digest('hex');};
const fp=(kind,v)=>sha(kind+'\0'+String(v)).slice(0,20);
const stableUid=shopperId=>`cx-sh-${sha(`${TENANT}\0shopper\0${str(shopperId)}`).slice(0,28)}`;
const internalEmail=login=>`${sha(`${TENANT}\0shopper\0${str(login).toLowerCase()}`).slice(0,48)}@auth.cxorbia.invalid`;
const rule=ShopperCredentialRule.shopperCredentialRule;
const active=m=>m?.active===true&&str(m?.status||'active').toLowerCase()!=='inactive';
const projectScoped=m=>uniq(m?.projectIds).includes(PROJECT)||str(m?.scopeProjectId)===PROJECT;
const authPrincipalMatches=(u,shopperId)=>{
  const c=u?.customClaims||{},role=str(c.role).toLowerCase(),namespace=str(c.authNamespace||(role==='shopper'?'shopper':'')).toLowerCase();
  const tenantMatch=str(c.tenantId)===TENANT||uniq(c.tenants).includes(TENANT);
  const projects=uniq([...(arr(c.projectIds)),c.projectId]);
  return tenantMatch&&str(c.shopperId)===shopperId&&role==='shopper'&&namespace==='shopper'&&projects.includes(PROJECT);
};
const exactClaims=(u,shopperId)=>{
  const c=u?.customClaims||{};
  return str(c.tenantId)===TENANT&&str(c.role)==='shopper'&&str(c.authNamespace)==='shopper'&&str(c.shopperId)===shopperId&&uniq(c.projectIds).includes(PROJECT);
};
async function listAllAuth(){
  const out=[];let token;
  do{const page=await auth.listUsers(1000,token);out.push(...page.users);token=page.pageToken;}while(token);
  return out;
}
const IDENTITY_TECHNICAL_KEYS=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId','sourceIdentityKey','sourceSubjectId'];
const IDENTITY_ALIAS_KEYS=['exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases'];
const ACTIVE_LINK_STATES=new Set(['active','confirmed','approved','materialized']);
const TRUSTED_AUTHORITIES=new Set(['provider_exact','tenant_adjudication','platform_created','migrated_exact']);
const flattenTechnical=value=>{
  const out=[];
  const walk=v=>{if(v==null)return;if(Array.isArray(v)){v.forEach(walk);return;}if(typeof v==='object'){Object.values(v).forEach(walk);return;}const token=str(v);if(token)out.push(token);};
  walk(value);return out;
};
const identityLinkTokens=link=>uniq([
  link,link?.sourceIdentity,link?.identity,link?.crosswalk,link?.profile,link?.exactIdentityAnchors
].filter(Boolean).flatMap(container=>[
  ...IDENTITY_TECHNICAL_KEYS.flatMap(key=>flattenTechnical(container[key])),
  ...IDENTITY_ALIAS_KEYS.flatMap(key=>flattenTechnical(container[key]))
]));
const linkInfo=(doc)=>{
  const link={id:doc.id,...(doc.data()||{})};
  const status=str(link.status||link.state).toLowerCase();
  const authority=str(link.authorityType||link.authority?.type).toLowerCase();
  const authorityRef=str(link.authorityRef||link.authority?.evidenceRef||link.authority?.adjudicationId||link.authority?.providerRef||link.authority?.commandId||link.providerAckRef||link.adjudicationId||link.commandId||link.idempotencyKey||doc.id);
  const scope=str(link.projectScope||link.scope?.projectId||link.projectId||'*');
  const canonicalShopperId=str(link.canonicalShopperId||link.canonicalId||link.shopperId||link.profileId);
  const sourceSystem=str(link.sourceSystem||link.sourceNamespace||link.sourceType||link.sourceIdentity?.sourceSystem).toLowerCase();
  const tenantOk=str(link.tenantId||link.scope?.tenantId)===TENANT;
  const activeState=ACTIVE_LINK_STATES.has(status);
  const trusted=TRUSTED_AUTHORITIES.has(authority)&&!!authorityRef;
  const periodIndependent=!(link.periodKey||link.periodId||link.periodScope);
  const scoped=scope==='*'||scope.toLowerCase()==='tenant'||scope===PROJECT;
  return {link,status,authority,canonicalShopperId,sourceSystem,eligible:tenantOk&&activeState&&trusted&&periodIndependent&&scoped&&!!canonicalShopperId};
};
const addObjArray=(obj,key,value)=>{if(!obj[key])obj[key]=[];obj[key].push(value);};
const countBy=(items,keyFn)=>{const out={};for(const item of items){const k=keyFn(item);out[k]=(out[k]||0)+1;}return out;};
const sourceCandidate=row=>({
  shopperId:str(row?.shopperId||row?.id),tenantId:TENANT,projectId:PROJECT,
  nombre:str(row?.nombre||row?.shopper||row?.name||row?.displayName),
  firstName:str(row?.firstName),lastName:str(row?.lastName||row?.apellido),
  country:str(row?.country||row?.pais),pais:str(row?.pais||row?.country),
  shopperCode:str(row?.shopperCode),sourceSafe:row?.sourceSafe===true,piiProtected:row?.piiProtected===true
});

const evidence={
  schemaVersion:'cxorbia.i3.vrm081.population-credential-diagnostic.v2',
  decision:'HOLD',sourceSha:SOURCE,scope:{tenantId:TENANT,projectId:PROJECT},production:false,
  safety:{firestoreWrites:0,authWrites:0,hrWrites:0,externalWrites:0,deploys:0,rawPiiExported:false}
};

try{
  const nonce=Date.now();
  const [meta,sourceSafe,operational]=await Promise.all([
    fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=meta&vrm081v2='+nonce,{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(60000)}).then(async r=>{if(!r.ok)throw new Error('PROVIDER_FAILURE:VRM081_HR_META_HTTP_'+r.status);return r.json();}),
    fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&vrm081safe='+nonce,{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(60000)}).then(async r=>{if(!r.ok)throw new Error('PROVIDER_FAILURE:VRM081_HR_SOURCE_SAFE_HTTP_'+r.status);return r.json();}),
    fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&view=operational-names&cxOperationalPreview='+OPERATIONAL_TOKEN+'&vrm081v2='+nonce,{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(60000)}).then(async r=>{if(!r.ok)throw new Error('PROVIDER_FAILURE:VRM081_HR_OPERATIONAL_HTTP_'+r.status);return r.json();})
  ]);
  if(meta?.ok!==true||meta?.revisionStable!==true)throw new Error('PROVIDER_FAILURE:VRM081_HR_META_INVALID');
  const hrRevision=str(meta.revision);
  const safeSnapshot=sourceSafe?.snapshot||sourceSafe?.data||sourceSafe;
  const operationalSnapshot=operational?.snapshot||operational?.data||operational;
  const sourceSafeRevision=str(sourceSafe?._runtime?.revision||safeSnapshot?._runtime?.revision||safeSnapshot?.sourceRevision||'');
  const operationalRevision=str(operational?._runtime?.revision||operationalSnapshot?._runtime?.revision||operationalSnapshot?.sourceRevision||'');
  if(!/^[a-f0-9]{64}$/.test(hrRevision)||sourceSafeRevision!==hrRevision||operationalRevision!==hrRevision)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM081_HR_REVISION_MISMATCH');
  if(sourceSafe?.sourceSafe!==true&&safeSnapshot?.sourceSafe!==true)throw new Error('SOURCE_FAILURE:VRM081_SOURCE_SAFE_NOT_READY');
  if(operationalSnapshot?.operationalIdentityPreview!==true)throw new Error('SOURCE_FAILURE:VRM081_OPERATIONAL_IDENTITY_NOT_READY');
  const sr=meta.shopperReconciliation||{};
  if(Number(sr.shopperCount||0)<=0)throw new Error('SOURCE_FAILURE:VRM081_SHOPPER_RECONCILIATION_MISSING');

  const [usersSnap,shoppersSnap,crossSnap,linksSnap,authUsers]=await Promise.all([
    tenant.collection('users').get(),tenant.collection('shoppers').get(),tenant.collection('shopperIdentityCrosswalk').get(),tenant.collection('shopperIdentityLinks').get(),listAllAuth()
  ]);
  const memberships=usersSnap.docs.map(d=>({uid:d.id,...(d.data()||{})}));
  const profiles=Object.fromEntries(shoppersSnap.docs.map(d=>[d.id,{id:d.id,...(d.data()||{})}]));
  const crosswalks=Object.fromEntries(crossSnap.docs.map(d=>[d.id,{id:d.id,...(d.data()||{})}]));
  const authByUid=Object.fromEntries(authUsers.map(u=>[u.uid,u]));
  const authByEmail=Object.fromEntries(authUsers.filter(u=>str(u.email)).map(u=>[str(u.email).toLowerCase(),u]));
  const membershipByUid=Object.fromEntries(memberships.map(m=>[m.uid,m]));
  const membershipByShopper={};for(const m of memberships){const sid=str(m.shopperId);if(sid)addObjArray(membershipByShopper,sid,m);}

  const exactIdentity={},identityConflicts=[],trustedPlatformCanonicals=new Set();
  for(const doc of linksSnap.docs){
    const info=linkInfo(doc);if(!info.eligible)continue;
    if(info.authority==='platform_created')trustedPlatformCanonicals.add(info.canonicalShopperId);
    if(!info.sourceSystem.includes('hr'))continue;
    for(const token of identityLinkTokens(info.link)){
      if(exactIdentity[token]&&exactIdentity[token]!==info.canonicalShopperId)identityConflicts.push(fp('identity-token',token));
      else exactIdentity[token]=info.canonicalShopperId;
    }
  }

  const operationalById={};
  for(const row of [...arr(operationalSnapshot.shoppers),...arr(operationalSnapshot.visits)]){
    const id=str(row?.shopperId||row?.id);if(!id)continue;
    operationalById[id]={...(operationalById[id]||{}),...row};
  }
  const sourceById={};
  const ingestSourceRow=row=>{
    const id=str(row?.shopperId||row?.id);if(!id)return;
    const c=sourceCandidate({...row,...(operationalById[id]||{})});
    const prior=sourceById[c.shopperId]||{};
    sourceById[c.shopperId]={...prior,...Object.fromEntries(Object.entries(c).filter(([,v])=>v!==''&&v!==false))};
  };
  for(const shopper of arr(safeSnapshot.shoppers))ingestSourceRow(shopper);
  for(const visit of arr(safeSnapshot.visits))if(str(visit?.shopperId))ingestSourceRow(visit);
  const sourceRows=Object.values(sourceById);
  if(sourceRows.length!==Number(sr.shopperCount))throw new Error('MAPPING_FAILURE:VRM081_SOURCE_UNIVERSE_'+sourceRows.length+'_EXPECTED_'+Number(sr.shopperCount));
  const canonicalForSource=Object.fromEntries(sourceRows.map(s=>[s.shopperId,exactIdentity[s.shopperId]||s.shopperId]));
  const currentCanonicalSet=new Set(Object.values(canonicalForSource));
  for(const id of trustedPlatformCanonicals)currentCanonicalSet.add(id);

  const credentialBySource={};const loginCanonicalGroups={};
  for(const source of sourceRows){
    const canonical=canonicalForSource[source.shopperId],profile=profiles[canonical]||{};
    const credential=rule({...profile,...source,nombre:source.nombre||profile.nombre,firstName:source.firstName||profile.firstName,lastName:source.lastName||profile.lastName||profile.apellido});
    credentialBySource[source.shopperId]=credential;
    if(credential.ok){
      if(!loginCanonicalGroups[credential.login])loginCanonicalGroups[credential.login]=new Set();
      loginCanonicalGroups[credential.login].add(canonical);
    }
  }
  const structuralLoginGroups=Object.entries(loginCanonicalGroups).filter(([,ids])=>ids.size>1).map(([login,ids])=>({loginFingerprint:fp('login',login),canonicalCount:ids.size}));
  const structuralLoginSet=new Set(structuralLoginGroups.map(x=>x.loginFingerprint));

  const reviews=arr(sr.identityReviewQueue),migrations=arr(sr.identityMigrationQueue);
  const reviewClassifications=[];
  for(const q of reviews){
    const sourceId=str(q.sourceShopperId),canonical=str(q.canonicalShopperId||canonicalForSource[sourceId]||sourceId),credential=credentialBySource[sourceId]||{ok:false,reason:'SOURCE_NOT_FOUND'};
    const members=arr(membershipByShopper[canonical]);
    const activeMembers=members.filter(m=>active(m)&&str(m.role).toLowerCase()==='shopper'&&str(m.authNamespace).toLowerCase()==='shopper'&&projectScoped(m));
    const matchingAuth=authUsers.filter(u=>u.disabled!==true&&authPrincipalMatches(u,canonical));
    const selectedUid=members.length===1?str(members[0].uid):(matchingAuth.length===1?str(matchingAuth[0].uid):stableUid(canonical));
    const email=credential.ok?internalEmail(credential.login):'';
    const occupant=email?authByEmail[email.toLowerCase()]||null:null;
    const occupantUid=str(occupant?.uid),occupantMember=occupantUid?membershipByUid[occupantUid]||null:null;
    const occupantCanonical=str(occupant?.customClaims?.shopperId||occupantMember?.shopperId);
    const occupantLegitimate=!!occupantCanonical&&currentCanonicalSet.has(occupantCanonical);
    const occupantSameCanonical=!!occupantCanonical&&occupantCanonical===canonical;
    const loginFp=credential.ok?fp('login',credential.login):null;
    let bucket='UNCLASSIFIED_REVIEW';
    if(str(q.reason)==='SHOPPER_CREDENTIAL_NAME_INCOMPLETE'||!credential.ok)bucket='SOURCE_NAME_INCOMPLETE_REQUIRES_ADJUDICATION';
    else if((str(q.reason)==='SHOPPER_VISIBLE_LOGIN_COLLISION'||str(q.reason)==='SHOPPER_AUTH_EMAIL_CONFLICT')&&occupant&&occupantUid!==selectedUid){
      if(occupantSameCanonical)bucket='DUPLICATE_PRINCIPAL_SAME_CANONICAL_MECHANICAL';
      else if(occupantLegitimate)bucket='CURRENT_CURRENT_VISIBLE_LOGIN_COLLISION_POLICY_REQUIRED';
      else bucket='HISTORICAL_AUTH_EMAIL_OCCUPANT_MECHANICAL_REVIEW';
    }else if((str(q.reason)==='SHOPPER_VISIBLE_LOGIN_COLLISION'||str(q.reason)==='SHOPPER_AUTH_EMAIL_CONFLICT')&&!occupant)bucket='PROVIDER_QUEUE_STALE_COLLISION_REPROOF';
    else if(credential.ok&&structuralLoginSet.has(loginFp))bucket='CURRENT_CURRENT_VISIBLE_LOGIN_COLLISION_POLICY_REQUIRED';
    reviewClassifications.push({
      sourceFingerprint:fp('source-shopper',sourceId),canonicalFingerprint:fp('canonical-shopper',canonical),country:str(q.country),providerReason:str(q.reason),bucket,
      credentialFingerprint:q.credentialFingerprint||loginFp,selectedPrincipalFingerprint:fp('auth',selectedUid),occupantPrincipalFingerprint:occupantUid?fp('auth',occupantUid):null,
      occupantCanonicalFingerprint:occupantCanonical?fp('canonical-shopper',occupantCanonical):null,occupantLegitimateCurrent:occupantLegitimate,occupantSameCanonical,
      activeMembershipCount:activeMembers.length,totalMembershipCount:members.length,matchingEnabledAuthPrincipals:matchingAuth.length,
      currentMembershipAuthPresent:!!authByUid[selectedUid],currentMembershipClaimsExact:!!authByUid[selectedUid]&&exactClaims(authByUid[selectedUid],canonical)
    });
  }

  const migrationClassifications=[];
  for(const q of migrations){
    const sourceId=str(q.sourceShopperId),canonical=str(q.canonicalShopperId||canonicalForSource[sourceId]||''),cross=crosswalks[sourceId]||{};
    const exactLinked=exactIdentity[sourceId]===canonical;
    const crossSelf=str(cross.shopperId)===sourceId&&str(cross.sourceType).toLowerCase()==='hr_external'&&['stable_hr_shopper_id','exact_technical_keys_only'].includes(str(cross.identityMode).toLowerCase());
    const canonicalProfile=!!profiles[canonical];
    const memberCount=arr(membershipByShopper[canonical]).length;
    const safe=exactLinked&&crossSelf&&canonicalProfile&&memberCount<=1&&q.exactIdentityAlreadyProven===true&&q.requiresHumanAdjudication===false;
    migrationClassifications.push({sourceFingerprint:fp('source-shopper',sourceId),canonicalFingerprint:canonical?fp('canonical-shopper',canonical):null,country:str(q.country),providerReason:str(q.reason),safeExactMigration:safe,exactIdentityLinked:exactLinked,crosswalkSelfMap:crossSelf,canonicalProfilePresent:canonicalProfile,canonicalMembershipCount:memberCount});
  }

  const bucketCounts=countBy(reviewClassifications,x=>x.bucket);
  const providerReasonCounts=countBy(reviews,x=>str(x.reason));
  const migrationSafe=migrationClassifications.filter(x=>x.safeExactMigration).length;
  const migrationUnsafe=migrationClassifications.length-migrationSafe;
  const legitimateCurrentCollisionRows=reviewClassifications.filter(x=>x.bucket==='CURRENT_CURRENT_VISIBLE_LOGIN_COLLISION_POLICY_REQUIRED').length;
  const nameIncompleteRows=reviewClassifications.filter(x=>x.bucket==='SOURCE_NAME_INCOMPLETE_REQUIRES_ADJUDICATION').length;

  evidence.hrRevision=hrRevision;
  evidence.runtimeReconciliation={shopperCount:Number(sr.shopperCount||0),reconciledShopperCount:Number(sr.reconciledShopperCount||0),identityReviewCount:Number(sr.identityReviewCount||0),identityMigrationCount:Number(sr.identityMigrationCount||0),providerWrites:Number(sr.providerWrites||0),hrWrites:Number(sr.hrWrites||0),externalWrites:Number(sr.externalWrites||0)};
  evidence.population={sourceShopperCount:sourceRows.length,canonicalHrTargetCount:new Set(Object.values(canonicalForSource)).size,trustedPlatformCanonicalCount:trustedPlatformCanonicals.size,tenantMembershipDocs:memberships.length,authUsersTotal:authUsers.length,shopperProfiles:shoppersSnap.size,identityLinks:linksSnap.size,identityLinkConflicts:identityConflicts.length,currentStructuralVisibleLoginCollisionGroups:structuralLoginGroups.length};
  evidence.providerQueues={reviewCount:reviews.length,migrationCount:migrations.length,providerReasonCounts};
  evidence.remediationBuckets={...bucketCounts,SAFE_EXACT_ALIAS_MIGRATION:migrationSafe,UNSAFE_EXACT_ALIAS_MIGRATION:migrationUnsafe};
  evidence.classification={reviewRows:reviewClassifications,migrationRows:migrationClassifications,structuralLoginGroups,identityConflictFingerprints:identityConflicts.sort()};
  evidence.humanDecisionRequired={required:legitimateCurrentCollisionRows>0||nameIncompleteRows>0||migrationUnsafe>0||identityConflicts.length>0,currentCurrentCollisionRows:legitimateCurrentCollisionRows,nameIncompleteRows,unsafeMigrationRows:migrationUnsafe,identityConflictTokens:identityConflicts.length};
  evidence.mechanicalRemediation={eligible:(bucketCounts.HISTORICAL_AUTH_EMAIL_OCCUPANT_MECHANICAL_REVIEW||0)+(bucketCounts.DUPLICATE_PRINCIPAL_SAME_CANONICAL_MECHANICAL||0)+(bucketCounts.PROVIDER_QUEUE_STALE_COLLISION_REPROOF||0)+migrationSafe,staleAuthOccupantRows:bucketCounts.HISTORICAL_AUTH_EMAIL_OCCUPANT_MECHANICAL_REVIEW||0,duplicateSameCanonicalRows:bucketCounts.DUPLICATE_PRINCIPAL_SAME_CANONICAL_MECHANICAL||0,staleQueueRows:bucketCounts.PROVIDER_QUEUE_STALE_COLLISION_REPROOF||0,safeExactAliasMigrationRows:migrationSafe};
  evidence.activeCredentialUniverseResolved=reviews.length===0&&migrations.length===0&&identityConflicts.length===0;
  evidence.decision='PASS_I3_VRM081_POPULATION_CREDENTIAL_DIAGNOSTIC';
  console.log(JSON.stringify({decision:evidence.decision,hrRevision,population:evidence.population,providerQueues:evidence.providerQueues,remediationBuckets:evidence.remediationBuckets,humanDecisionRequired:evidence.humanDecisionRequired,mechanicalRemediation:evidence.mechanicalRemediation,safety:evidence.safety},null,2));
}catch(error){
  evidence.decision='FAIL_I3_VRM081_POPULATION_CREDENTIAL_DIAGNOSTIC';evidence.error=String(error?.stack||error);throw error;
}finally{
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
}
