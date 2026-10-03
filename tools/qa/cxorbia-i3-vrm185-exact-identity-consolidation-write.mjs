#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev',TENANT=process.env.TENANT_ID||'tya',PROGRAM=process.env.PROJECT_ID||'cinepolis';
const EXPECTED=String(process.env.EXPECTED_HR_REVISION||'').trim(),OUT=process.env.OUT||'.tmp/vrm185-exact-consolidation';
const CURRENT='shopper_gt_1440137b73',LEGACY='s3',KEEPER_LOGIN='paula.osorio',RETIRE_LOGIN='paula.osorio.b06e';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),fp=v=>sha(v).slice(0,20),now=()=>new Date().toISOString();
const puf=uid=>sha('cxorbia-provider-uid-v1\0'+uid);
const claims=(shopperId,projectIds)=>({authNamespace:'shopper',projectIds:uniq(projectIds),role:'shopper',shopperId,tenantId:TENANT});
const claimsDigest=c=>sha(JSON.stringify(claims(c.shopperId,c.projectIds)));
const ACTIVE=new Set(['active','confirmed','approved','materialized']);
const EXPECTED_AUTHORITY_LINK_FP='df210da083c2eaeca79e';
const tech=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','sourceStableKey','sourceShopperId','sourceIdentityKey','sourceSubjectId','profileId','shopperDocId'];
const aliasKeys=['exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases'];
const flat=v=>{const o=[];const w=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach(w);return;}if(typeof x==='object'){Object.values(x).forEach(w);return;}const s=str(x);if(s)o.push(s)};w(v);return o};
const linkTokens=o=>uniq([o,o?.sourceIdentity,o?.identity,o?.crosswalk,o?.profile,o?.exactIdentityAnchors].filter(Boolean).flatMap(c=>[...tech.flatMap(k=>flat(c[k])),...aliasKeys.flatMap(k=>flat(c[k]))]));
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
const domains=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const result={schemaVersion:'cxorbia.i3.vrm185.exact-identity-consolidation.v1',decision:'HOLD',classification:'MAPPING_FAILURE',currentCanonicalShopperId:CURRENT,legacyAliasShopperId:LEGACY,keeperVisibleLogin:KEEPER_LOGIN,retiredVisibleLogin:RETIRE_LOGIN,sourceRevision:EXPECTED,providerAck:false,idempotentReplay:false,authWrites:0,firestoreWrites:0,domainWrites:{},hrWrites:0,externalWrites:0,deploys:0,production:false};
fs.mkdirSync(OUT,{recursive:true});const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');save();
if(!/^[a-f0-9]{64}$/.test(EXPECTED))throw new Error('RELEASE_COMPOSITION_FAILURE:VRM185_EXPECTED_REVISION_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),users=tenant.collection('users'),profiles=tenant.collection('shoppers'),cross=tenant.collection('shopperIdentityCrosswalk'),links=tenant.collection('shopperIdentityLinks');
const auditId='vrm185-exact-identity-consolidation-'+sha(TENANT+'\0'+PROGRAM+'\0'+CURRENT+'\0'+LEGACY).slice(0,24),auditRef=tenant.collection('auditLogs').doc(auditId);

async function membersFor(id){const s=await users.where('shopperId','==',id).limit(3).get();return s.docs.map(d=>({uid:d.id,...(d.data()||{})}));}
async function allAuth(){const out=[];let t;do{const p=await auth.listUsers(1000,t);out.push(...p.users);t=p.pageToken;}while(t);return out;}
function topLevelPatch(data){
  const patch={};for(const k of ownerFields)if(str(data?.[k])===LEGACY)patch[k]=CURRENT;
  if(Array.isArray(data?.shopperIds)&&data.shopperIds.some(x=>str(x)===LEGACY))patch.shopperIds=uniq(data.shopperIds.map(x=>str(x)===LEGACY?CURRENT:x));
  return patch;
}
async function domainPlan(){
  const out=[];for(const [scope,name] of domains){const col=scope==='tenant'?tenant.collection(name):tenant.collection('projects').doc(PROGRAM).collection(name),snap=await col.get();for(const d of snap.docs){const patch=topLevelPatch(d.data()||{});if(Object.keys(patch).length)out.push({scope,name,ref:d.ref,patch});}}return out;
}
async function legacyOperationalRefs(){
  const rows=await domainPlan();return rows.map(x=>({scope:x.scope,collection:x.name,path:x.ref.path,fields:Object.keys(x.patch)}));
}
async function main(){
  const prior=await auditRef.get();
  if(prior.exists&&(prior.data()||{}).status==='committed'){
    const leftovers=await legacyOperationalRefs();
    const km=await membersFor(CURRENT),lm=await membersFor(LEGACY);
    if(leftovers.length||km.length!==1||lm.length!==0)throw new Error('PERSISTENCE_FAILURE:VRM185_IDEMPOTENT_READBACK_MISMATCH');
    const ku=await auth.getUser(km[0].uid);
    if(ku.disabled===true||str(ku.customClaims?.shopperId)!==CURRENT||str(km[0].visibleLogin).toLowerCase()!==KEEPER_LOGIN)throw new Error('AUTH_FAILURE:VRM185_IDEMPOTENT_KEEPER_MISMATCH');
    result.decision='PASS_VRM185_EXACT_IDENTITY_CONSOLIDATION';result.providerAck=true;result.idempotentReplay=true;save();console.log(JSON.stringify(result,null,2));return;
  }
  const [currentMs,legacyMs,currentP,legacyP,currentX,legacyX,linkSnap,authUsers]=await Promise.all([
    membersFor(CURRENT),membersFor(LEGACY),profiles.doc(CURRENT).get(),profiles.doc(LEGACY).get(),cross.doc(CURRENT).get(),cross.doc(LEGACY).get(),links.get(),allAuth()
  ]);
  if(currentMs.length!==1||legacyMs.length!==1)throw new Error('MAPPING_FAILURE:VRM185_PRINCIPAL_MEMBERSHIP_COUNT');
  if(!currentP.exists||!legacyP.exists||!currentX.exists)throw new Error('PERSISTENCE_FAILURE:VRM185_PROFILE_OR_CROSSWALK_MISSING');
  const cm=currentMs[0],lm=legacyMs[0],cp=currentP.data()||{},lp=legacyP.data()||{},cx=currentX.data()||{},lx=legacyX.exists?(legacyX.data()||{}):{};
  const au=new Map(authUsers.map(u=>[u.uid,u])),cu=au.get(cm.uid),lu=au.get(lm.uid);
  if(!cu||!lu||cu.disabled===true||lu.disabled===true)throw new Error('AUTH_FAILURE:VRM185_ACTIVE_AUTH_PAIR_REQUIRED');
  if(str(cm.visibleLogin).toLowerCase()!==RETIRE_LOGIN||str(lm.visibleLogin).toLowerCase()!==KEEPER_LOGIN)throw new Error('AUTH_FAILURE:VRM185_VISIBLE_LOGIN_TOPOLOGY_CHANGED');
  const legacyProof=str(lm.credentialPasswordProofVersion)==='cxorbia-shopper-password-proof-v2'||str(lp.credentialPasswordProofVersion)==='cxorbia-shopper-password-proof-v2';
  const currentProof=str(cm.credentialPasswordProofVersion)==='cxorbia-shopper-password-proof-v2'||str(cp.credentialPasswordProofVersion)==='cxorbia-shopper-password-proof-v2';
  if(!legacyProof||currentProof)throw new Error('AUTH_FAILURE:VRM185_UNIQUE_KEEPER_PASSWORD_PROOF_NOT_PRESERVED');
  if(str(cx.shopperId)!==CURRENT||str(cx.sourceType).toLowerCase()!=='hr_external')throw new Error('MAPPING_FAILURE:VRM185_CURRENT_HR_SELF_CROSSWALK_REQUIRED');
  const relevantLinks=linkSnap.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(l=>{
    const st=str(l.status||l.state).toLowerCase(),a=str(l.authorityType||l.authority?.type).toLowerCase(),can=str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId),toks=linkTokens(l);
    return fp(l.id)===EXPECTED_AUTHORITY_LINK_FP&&ACTIVE.has(st)&&a==='tenant_adjudication'&&l.humanConfirmed===true&&((can===LEGACY&&toks.includes(CURRENT))||(can===CURRENT&&toks.includes(LEGACY)));
  });
  if(relevantLinks.length!==1)throw new Error('MAPPING_FAILURE:VRM185_HUMAN_ADJUDICATION_AUTHORITY_COUNT_'+relevantLinks.length);
  const authority=relevantLinks[0],domain=await domainPlan();
  if(domain.length>400)throw new Error('PERSISTENCE_FAILURE:VRM185_DOMAIN_WRITE_BUDGET_EXCEEDED');
  const projectIds=uniq([...(arr(cm.projectIds)),...(arr(lm.projectIds)),...(arr(cp.projectIds)),...(arr(lp.projectIds)),...(arr(cx.projectIds)),...(arr(lx.projectIds)),PROGRAM]);
  const keeperClaims=claims(CURRENT,projectIds),oldKeeperClaims=lu.customClaims||{},oldRetireDisabled=cu.disabled===true;
  const legacyFallbackFields=['email','whatsapp','phone','depto','ciudad','sexo','edad','dpi','documentId','banco','ctaTipo','ctaNum','ctaTitular','ctaMoneda','cuentaPago','ndaStatus','benefits','beneficios','certificationEvidenceRecords','certificationStatus','certificationPresented','certified','certs','rating','ratingBreakdown','scoreBreakdown'];
  const canonicalPatch={shopperId:CURRENT,id:CURRENT,tenantId:TENANT,projectIds,sourceType:'hr_external',visibleLogin:KEEPER_LOGIN,username:KEEPER_LOGIN,user:KEEPER_LOGIN,credentialRuleVersion:str(lm.credentialRuleVersion||lp.credentialRuleVersion),credentialSweepVersion:str(lm.credentialSweepVersion||lp.credentialSweepVersion),credentialPasswordProofVersion:str(lm.credentialPasswordProofVersion||lp.credentialPasswordProofVersion),credentialPasswordRuleVersion:str(lm.credentialPasswordRuleVersion||lp.credentialPasswordRuleVersion),exactAliases:uniq([...(arr(cp.exactAliases)),...(arr(lp.exactAliases)),CURRENT,LEGACY]),sourceShopperIds:uniq([...(arr(cp.sourceShopperIds)),...(arr(lp.sourceShopperIds)),CURRENT,LEGACY]),legacyLiveShopperIds:uniq([...(arr(cp.legacyLiveShopperIds)),...(arr(lp.legacyLiveShopperIds)),LEGACY]),identityAliases:uniq([...(arr(cp.identityAliases)),...(arr(lp.identityAliases)),LEGACY]),identityAuthority:'tenant_adjudication',identityAuthorityRef:str(authority.authorityRef||authority.adjudicationId||authority.id),identityConsolidatedAt:now(),updatedAt:now()};
  for(const k of legacyFallbackFields){const cv=cp[k],lv=lp[k];const empty=cv==null||cv===''||(Array.isArray(cv)&&cv.length===0);if(empty&&lv!=null&&lv!==''&&(!Array.isArray(lv)||lv.length))canonicalPatch[k]=lv;}
  const keeperMember={...lm,shopperId:CURRENT,projectIds,active:true,status:'active',visibleLogin:KEEPER_LOGIN,providerUidFingerprint:puf(lm.uid),claimsDigest:claimsDigest(keeperClaims),identityConsolidatedFrom:LEGACY,identityConsolidatedAt:now(),updatedAt:now()};
  delete keeperMember.uid;
  const retireMember={active:false,status:'superseded',identityState:'superseded_exact_alias',supersededByShopperId:CURRENT,supersededByUidFingerprint:puf(lm.uid),supersededAt:now(),updatedAt:now()};
  const currentCross={tenantId:TENANT,shopperId:CURRENT,projectIds,authNamespace:'shopper',providerUidFingerprint:puf(lm.uid),sourceStableKey:CURRENT,identityMode:'stable_hr_shopper_id',fuzzyMatching:false,sourceType:'hr_external',identityConsolidatedAt:now(),updatedAt:now()};
  const legacyCross={tenantId:TENANT,shopperId:CURRENT,projectIds,authNamespace:'shopper',providerUidFingerprint:puf(lm.uid),sourceStableKey:LEGACY,identityMode:'provider_exact_identity_link',fuzzyMatching:false,sourceType:str(lx.sourceType||'hr_external'),migrationAuthorityType:'tenant_adjudication',migrationAuthorityRef:str(authority.authorityRef||authority.id),migratedFromShopperId:LEGACY,identityConsolidatedAt:now(),updatedAt:now()};
  const newLinkId='irl_'+sha(TENANT+'\0'+PROGRAM+'\0'+CURRENT+'\0'+LEGACY+'\0vrm185').slice(0,32),newLinkRef=links.doc(newLinkId);
  const newLink={schemaVersion:'cxorbia.shopper-identity-link.v1',identityLinkId:newLinkId,tenantId:TENANT,projectScope:PROGRAM,periodIndependent:true,canonicalShopperId:CURRENT,sourceSystem:'hr_external',sourceIdentityKey:LEGACY,exactAliases:[LEGACY],sourceAliases:[LEGACY],status:'active',state:'active',authorityType:'tenant_adjudication',authorityRef:str(authority.authorityRef||authority.adjudicationId||authority.id),adjudicationId:str(authority.adjudicationId||authority.authorityRef||authority.id),humanConfirmed:true,sourceSafe:true,fuzzyMatching:false,actorUidFingerprint:str(authority.actorUidFingerprint),reason:'admin_exact_identity_consolidation_vrm185',supersedesIdentityLinkId:authority.id,createdAt:now(),updatedAt:now()};
  let authChanged=false;
  try{
    await auth.setCustomUserClaims(lm.uid,keeperClaims);result.authWrites++;
    await auth.updateUser(cm.uid,{disabled:true});result.authWrites++;authChanged=true;
    const batch=db.batch();
    batch.set(profiles.doc(CURRENT),canonicalPatch,{merge:true});
    batch.set(profiles.doc(LEGACY),{identityState:'superseded_exact_alias',supersededByShopperId:CURRENT,supersededAt:now(),updatedAt:now()},{merge:true});
    batch.set(users.doc(lm.uid),keeperMember,{merge:true});
    batch.set(users.doc(cm.uid),retireMember,{merge:true});
    batch.set(cross.doc(CURRENT),currentCross,{merge:true});
    batch.set(cross.doc(LEGACY),legacyCross,{merge:true});
    batch.set(newLinkRef,newLink,{merge:false});
    batch.set(links.doc(authority.id),{status:'superseded',state:'superseded',supersededByIdentityLinkId:newLinkId,supersededAt:now(),updatedAt:now()},{merge:true});
    for(const item of domain){batch.set(item.ref,{...item.patch,identityConsolidatedFrom:LEGACY,identityConsolidatedAt:now()},{merge:true});result.domainWrites[item.name]=(result.domainWrites[item.name]||0)+1;}
    const audit={status:'committed',action:'SHOPPER_EXACT_IDENTITY_CONSOLIDATION',tenantId:TENANT,projectId:PROGRAM,currentCanonicalShopperId:CURRENT,legacyAliasShopperId:LEGACY,keeperUidFingerprint:puf(lm.uid),retiredUidFingerprint:puf(cm.uid),authorityLinkFingerprint:fp(authority.id),newIdentityLinkId:newLinkId,sourceRevision:EXPECTED,domainWriteCounts:result.domainWrites,hrManagedNestedFieldsPreserved:true,commandReceiptsImmutable:true,production:false,createdAt:now(),updatedAt:now()};
    batch.set(auditRef,audit,{merge:false});
    await batch.commit();result.firestoreWrites=9+domain.length;
  }catch(error){
    if(authChanged){
      try{await auth.setCustomUserClaims(lm.uid,oldKeeperClaims);}catch(_){}
      try{await auth.updateUser(cm.uid,{disabled:oldRetireDisabled});}catch(_){}
    }
    throw error;
  }
  const leftovers=await legacyOperationalRefs(),[km,lmAfter,canonAfter,legacyAfter,cxAfter,lxAfter,newLinkAfter,keeperUser,retiredUser]=await Promise.all([
    membersFor(CURRENT),membersFor(LEGACY),profiles.doc(CURRENT).get(),profiles.doc(LEGACY).get(),cross.doc(CURRENT).get(),cross.doc(LEGACY).get(),newLinkRef.get(),auth.getUser(lm.uid),auth.getUser(cm.uid)
  ]);
  if(leftovers.length)throw new Error('PERSISTENCE_FAILURE:VRM185_LEGACY_OPERATIONAL_REFERENCES_REMAIN_'+leftovers.length);
  if(km.length!==1||km[0].uid!==lm.uid||lmAfter.length!==0)throw new Error('PERSISTENCE_FAILURE:VRM185_MEMBERSHIP_CONSOLIDATION_READBACK');
  if(!canonAfter.exists||str((canonAfter.data()||{}).shopperId)!==CURRENT||str((canonAfter.data()||{}).visibleLogin).toLowerCase()!==KEEPER_LOGIN)throw new Error('PERSISTENCE_FAILURE:VRM185_CANONICAL_PROFILE_READBACK');
  if(!legacyAfter.exists||str((legacyAfter.data()||{}).identityState)!=='superseded_exact_alias')throw new Error('PERSISTENCE_FAILURE:VRM185_LEGACY_PROFILE_AUDIT_PRESERVATION');
  if(str((cxAfter.data()||{}).shopperId)!==CURRENT||str((lxAfter.data()||{}).shopperId)!==CURRENT)throw new Error('MAPPING_FAILURE:VRM185_CROSSWALK_READBACK');
  if(!newLinkAfter.exists||str((newLinkAfter.data()||{}).canonicalShopperId)!==CURRENT||str((newLinkAfter.data()||{}).sourceIdentityKey)!==LEGACY)throw new Error('MAPPING_FAILURE:VRM185_IDENTITY_LINK_READBACK');
  if(keeperUser.disabled===true||str(keeperUser.customClaims?.shopperId)!==CURRENT||retiredUser.disabled!==true)throw new Error('AUTH_FAILURE:VRM185_AUTH_READBACK');
  result.decision='PASS_VRM185_EXACT_IDENTITY_CONSOLIDATION';result.providerAck=true;result.readback={legacyOperationalReferences:0,canonicalMemberships:1,legacyMemberships:0,keeperClaimsShopperId:CURRENT,retiredDuplicateDisabled:true,legacyProfilePreserved:true,hrManagedNestedFieldsPreserved:true,commandReceiptsImmutable:true};save();console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{result.error=String(e?.message||e);save();console.error(result.error);process.exitCode=2;});
