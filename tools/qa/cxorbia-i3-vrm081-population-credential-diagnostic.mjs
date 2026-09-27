#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const OUT=process.env.VRM081_OUT||'.tmp/i3-vrm081';
const ROOT=String(process.env.VRM081_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT=String(process.env.VRM081_TENANT||'tya');
const PROJECT=String(process.env.VRM081_PROJECT||'cinepolis');
const SOURCE=String(process.env.VRM081_SOURCE||'');
if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('ENVIRONMENT_FAILURE:VRM081_SOURCE');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const normLogin=v=>str(v).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'');
const fp=(kind,v)=>crypto.createHash('sha256').update(kind+'\0'+String(v)).digest('hex').slice(0,20);
const active=m=>m?.active===true&&str(m?.status||'active').toLowerCase()!=='inactive';
const projectScoped=m=>uniq(m?.projectIds).includes(PROJECT)||str(m?.scopeProjectId)===PROJECT;
const exactClaims=(u,m)=>{
  const c=u?.customClaims||{};
  return str(c.tenantId)===TENANT&&str(c.role)==='shopper'&&str(c.authNamespace)==='shopper'&&str(c.shopperId)===str(m.shopperId)&&uniq(c.projectIds).includes(PROJECT);
};
async function listAllAuth(){
  const out=[];let token;
  do{const page=await auth.listUsers(1000,token);out.push(...page.users);token=page.pageToken;}while(token);
  return out;
}
function linkTarget(link){
  return str(link?.canonicalShopperId||link?.canonicalId||link?.shopperId||link?.profileId);
}
function linkTrusted(link){
  const status=str(link?.status||link?.state).toLowerCase();
  const authority=str(link?.authorityType||link?.authority?.type).toLowerCase();
  const scope=str(link?.projectScope||link?.scope?.projectId||link?.projectId||'*');
  const sourceSystem=str(link?.sourceSystem||link?.sourceNamespace||link?.sourceType||link?.sourceIdentity?.sourceSystem).toLowerCase();
  const activeState=['active','approved','adjudicated','linked','verified','canonical'].includes(status);
  const trustedAuthority=['provider','provider_ack','hr','hr_external','adjudicated','manual_adjudication','platform_created'].some(x=>authority.includes(x));
  const scoped=scope==='*'||scope.toLowerCase()==='tenant'||scope===PROJECT;
  return activeState&&trustedAuthority&&scoped&&!!linkTarget(link)&&!!sourceSystem;
}

const evidence={
  schemaVersion:'cxorbia.i3.vrm081.population-credential-diagnostic.v1',
  decision:'HOLD',
  sourceSha:SOURCE,
  scope:{tenantId:TENANT,projectId:PROJECT},
  production:false,
  safety:{firestoreWrites:0,authWrites:0,hrWrites:0,externalWrites:0,deploys:0,rawPiiExported:false}
};

try{
  const meta=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=meta&vrm081='+Date.now(),{
    headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(60000)
  }).then(async r=>{if(!r.ok)throw new Error('PROVIDER_FAILURE:VRM081_HR_META_HTTP_'+r.status);return r.json();});
  if(meta?.ok!==true||meta?.revisionStable!==true)throw new Error('PROVIDER_FAILURE:VRM081_HR_META_INVALID');
  const hrRevision=str(meta.revision);
  if(!/^[a-f0-9]{64}$/.test(hrRevision))throw new Error('PROVIDER_FAILURE:VRM081_HR_REVISION_INVALID');

  const [usersSnap,shoppersSnap,crossSnap,linksSnap,authUsers]=await Promise.all([
    tenant.collection('users').get(),
    tenant.collection('shoppers').get(),
    tenant.collection('shopperIdentityCrosswalk').get(),
    tenant.collection('shopperIdentityLinks').get(),
    listAllAuth()
  ]);

  const memberships=usersSnap.docs.map(d=>({uid:d.id,...(d.data()||{})}));
  const shopperMemberships=memberships.filter(m=>str(m.authNamespace).toLowerCase()==='shopper'||str(m.role).toLowerCase()==='shopper');
  const activeMembers=shopperMemberships.filter(m=>active(m)&&str(m.role).toLowerCase()==='shopper'&&str(m.authNamespace).toLowerCase()==='shopper'&&projectScoped(m));
  const profileById=new Map(shoppersSnap.docs.map(d=>[d.id,{id:d.id,...(d.data()||{})}]));
  const authByUid=new Map(authUsers.map(u=>[u.uid,u]));
  const activeAuthShopperPrincipals=authUsers.filter(u=>{
    const c=u.customClaims||{};
    return u.disabled!==true&&str(c.tenantId)===TENANT&&str(c.role)==='shopper'&&str(c.authNamespace)==='shopper'&&uniq(c.projectIds).includes(PROJECT);
  });

  const crossTargets=new Map(),crossAmbiguousTokens=[];
  for(const doc of crossSnap.docs){
    const x={id:doc.id,...(doc.data()||{})};
    if(str(x.sourceType).toLowerCase()!=='hr_external')continue;
    const scopes=uniq(x.projectIds);if(x.projectId&&str(x.projectId)!==PROJECT)continue;if(scopes.length&&!scopes.includes(PROJECT))continue;
    const target=str(x.shopperId||x.canonicalShopperId);if(!target)continue;
    for(const token of [x.id,x.sourceStableKey,x.sourceShopperId].map(str).filter(Boolean)){
      if(!crossTargets.has(token))crossTargets.set(token,new Set());
      crossTargets.get(token).add(target);
    }
  }
  const exactHrCanonicalIds=new Set();
  for(const [token,targets] of crossTargets){
    if(targets.size===1)exactHrCanonicalIds.add([...targets][0]);
    else crossAmbiguousTokens.push(fp('cross-token',token));
  }

  const trustedLinkTargets=new Set();
  let trustedHrLinks=0,trustedPlatformLinks=0;
  for(const doc of linksSnap.docs){
    const l={id:doc.id,...(doc.data()||{})};if(!linkTrusted(l))continue;
    const target=linkTarget(l),source=str(l.sourceSystem||l.sourceNamespace||l.sourceType||l.sourceIdentity?.sourceSystem).toLowerCase();
    trustedLinkTargets.add(target);
    if(source.includes('hr'))trustedHrLinks++;else if(source.includes('platform'))trustedPlatformLinks++;
  }

  const loginGroups=new Map();
  const rows=[];
  for(const m of activeMembers){
    const uid=str(m.uid),shopperId=str(m.shopperId),login=normLogin(m.visibleLogin||m.loginIdentifier||m.username);
    const u=authByUid.get(uid)||null;
    if(login){if(!loginGroups.has(login))loginGroups.set(login,[]);loginGroups.get(login).push(uid);}
    const profile=shopperId?profileById.get(shopperId)||null:null;
    const issues=[];
    if(!shopperId)issues.push('ACTIVE_MEMBERSHIP_SHOPPER_ID_MISSING');
    if(!login)issues.push('ACTIVE_MEMBERSHIP_VISIBLE_LOGIN_MISSING');
    if(!u)issues.push('ACTIVE_MEMBERSHIP_AUTH_USER_MISSING');
    else{
      if(u.disabled)issues.push('ACTIVE_MEMBERSHIP_AUTH_DISABLED');
      if(!exactClaims(u,m))issues.push('ACTIVE_MEMBERSHIP_AUTH_CLAIMS_MISMATCH');
    }
    if(shopperId&&!profile)issues.push('ACTIVE_MEMBERSHIP_PROFILE_MISSING');
    const exactHr=shopperId&&exactHrCanonicalIds.has(shopperId);
    const exactTrustedLink=shopperId&&trustedLinkTargets.has(shopperId);
    if(shopperId&&!exactHr&&!exactTrustedLink)issues.push('ACTIVE_MEMBERSHIP_EXACT_IDENTITY_AUTHORITY_MISSING');
    rows.push({
      membershipFingerprint:fp('membership',uid),
      shopperFingerprint:shopperId?fp('shopper',shopperId):null,
      loginFingerprint:login?fp('login',login):null,
      authPresent:!!u,authDisabled:u?.disabled===true,claimsExact:!!u&&exactClaims(u,m),
      profilePresent:!!profile,exactHrCrosswalk:!!exactHr,trustedIdentityLink:!!exactTrustedLink,
      issues
    });
  }

  const collisions=[...loginGroups.entries()].filter(([,uids])=>uids.length>1).map(([login,uids])=>({
    loginFingerprint:fp('login',login),
    activePrincipalCount:uids.length,
    membershipFingerprints:uids.map(x=>fp('membership',x)).sort()
  }));

  for(const row of rows){
    if(row.loginFingerprint&&collisions.some(c=>c.loginFingerprint===row.loginFingerprint)&&!row.issues.includes('ACTIVE_VISIBLE_LOGIN_COLLISION'))row.issues.push('ACTIVE_VISIBLE_LOGIN_COLLISION');
  }

  const activeMemberUids=new Set(activeMembers.map(m=>str(m.uid)));
  const authOrphans=activeAuthShopperPrincipals.filter(u=>!activeMemberUids.has(u.uid)).map(u=>({
    authFingerprint:fp('auth',u.uid),
    shopperFingerprint:str(u.customClaims?.shopperId)?fp('shopper',str(u.customClaims.shopperId)):null,
    issue:'ACTIVE_AUTH_PRINCIPAL_WITHOUT_ACTIVE_MEMBERSHIP'
  }));

  const blockingRows=rows.filter(r=>r.issues.length);
  const issueCounts={};
  for(const r of rows)for(const x of r.issues)issueCounts[x]=(issueCounts[x]||0)+1;
  for(const x of authOrphans)issueCounts[x.issue]=(issueCounts[x.issue]||0)+1;

  const nonLoginProfiles=shoppersSnap.docs.filter(d=>{
    const id=d.id;
    const hasActive=activeMembers.some(m=>str(m.shopperId)===id);
    return !hasActive;
  }).length;

  evidence.hrRevision=hrRevision;
  evidence.runtimeReconciliation={
    shopperCount:Number(meta?.shopperReconciliation?.shopperCount||0),
    reconciledShopperCount:Number(meta?.shopperReconciliation?.reconciledShopperCount||0),
    identityReviewCount:Number(meta?.shopperReconciliation?.identityReviewCount||0),
    identityMigrationCount:Number(meta?.shopperReconciliation?.identityMigrationCount||0)
  };
  evidence.population={
    tenantMembershipDocs:memberships.length,
    shopperMembershipDocs:shopperMemberships.length,
    activeLoginBearingMemberships:activeMembers.length,
    authUsersTotal:authUsers.length,
    activeAuthShopperPrincipals:activeAuthShopperPrincipals.length,
    shopperProfiles:shoppersSnap.size,
    nonLoginBearingProfiles:nonLoginProfiles,
    hrCrosswalkDocs:crossSnap.size,
    exactHrCanonicalTargets:exactHrCanonicalIds.size,
    ambiguousHrCrosswalkTokens:crossAmbiguousTokens.length,
    identityLinks:linksSnap.size,
    trustedHrLinks,trustedPlatformLinks
  };
  evidence.blockers={
    activeMembershipIssueCount:blockingRows.length,
    activeVisibleLoginCollisionGroups:collisions.length,
    activeAuthPrincipalWithoutMembership:authOrphans.length,
    issueCounts
  };
  evidence.classification={
    activeMemberships:rows,
    collisionGroups:collisions,
    authOrphans,
    ambiguousCrosswalkTokenFingerprints:crossAmbiguousTokens.sort()
  };
  evidence.providerReconciliationGap={
    reviewOrMigrationCount:Number(meta?.shopperReconciliation?.identityReviewCount||0)+Number(meta?.shopperReconciliation?.identityMigrationCount||0),
    activeCredentialBlockerCount:blockingRows.length+authOrphans.length,
    historicalOrNonLoginAliasDelta:Math.max(0,Number(meta?.shopperReconciliation?.identityReviewCount||0)+Number(meta?.shopperReconciliation?.identityMigrationCount||0)-blockingRows.length-authOrphans.length)
  };
  evidence.decision='PASS_I3_VRM081_POPULATION_CREDENTIAL_DIAGNOSTIC';
  evidence.activeCredentialUniverseResolved=blockingRows.length===0&&authOrphans.length===0&&crossAmbiguousTokens.length===0;
}catch(error){
  evidence.decision='FAIL_I3_VRM081_POPULATION_CREDENTIAL_DIAGNOSTIC';
  evidence.error=String(error?.stack||error);
  throw error;
}finally{
  fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
}
