#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import crypto from 'node:crypto';
import {CREDENTIAL_PASSWORD_PROOF_VERSION} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const TENANT=process.env.TENANT_ID||'tya';
const PROJECT_ID=process.env.PROJECT_ID||'cinepolis';
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=process.env.JULISSA_OUT||'.tmp/i3-julissa-topology';
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const db=getFirestore(),auth=getAuth();
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(str(v).toLowerCase(),'utf8').digest('hex').slice(0,20);
const norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT_ID);
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const [profiles,members,cross,links,visits,receipts,reviewRows]=await Promise.all([
  docs(tenant.collection('shoppers')),
  docs(tenant.collection('users')),
  docs(tenant.collection('shopperIdentityCrosswalk')),
  docs(tenant.collection('shopperIdentityLinks')),
  docs(project.collection('visits')),
  docs(tenant.collection('commandReceipts')),
  docs(tenant.collection('reviewQueue'))
]);
const profileName=p=>str(p.nombre||p.displayName||p.fullName||[p.firstName,p.lastName].filter(Boolean).join(' '));
const TARGET_SHOPPER_IDS=new Set(['shr-1780611985059-49vr','shopper_gt_0c198c1055','shp-7309d525805e']);
const targetProfiles=profiles.filter(p=>TARGET_SHOPPER_IDS.has(str(p.id||p.shopperId)));
const tokens=new Set(TARGET_SHOPPER_IDS);
for(const p of targetProfiles){
  for(const v of [p.id,p.shopperId,p.canonicalShopperId,...arr(p.sourceShopperIds),...arr(p.exactAliases),...arr(p.legacyLiveShopperIds),...arr(p.aliases)].map(str).filter(Boolean))tokens.add(v);
}
const crossMatches=cross.filter(x=>[x.id,x.shopperId,x.canonicalShopperId,x.sourceStableKey,x.sourceShopperId].map(str).some(v=>tokens.has(v)));
for(const x of crossMatches)for(const v of [x.id,x.shopperId,x.canonicalShopperId,x.sourceStableKey,x.sourceShopperId].map(str).filter(Boolean))tokens.add(v);
const linkTokens=x=>[x.id,x.canonicalShopperId,x.canonicalId,x.shopperId,x.profileId,x.sourceIdentityKey,x.sourceShopperId,x.sourceSubjectId,...arr(x.sourceAliases),...arr(x.exactAliases),...arr(x.identityAliases),...arr(x.aliases)].map(str).filter(Boolean);
const linkMatches=links.filter(x=>linkTokens(x).some(v=>tokens.has(v)));
for(const x of linkMatches)for(const v of linkTokens(x))tokens.add(v);
const memberMatches=members.filter(m=>tokens.has(str(m.shopperId)));
const authRows=[];
for(const m of memberMatches){
  try{
    const u=await auth.getUser(m.id);
    authRows.push({uid:m.id,shopperId:str(m.shopperId),active:m.active===true,role:str(m.role),authNamespace:str(m.authNamespace),visibleLogin:str(m.visibleLogin||m.username),emailPresent:!!u.email,emailFingerprint:u.email?sha(u.email):'',disabled:u.disabled===true,claims:u.customClaims||{},strongPasswordProof:str(m.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION});
  }catch(e){authRows.push({uid:m.id,shopperId:str(m.shopperId),active:m.active===true,role:str(m.role),authNamespace:str(m.authNamespace),error:str(e?.code||e?.message||e)});}
}
const visitMatches=visits.filter(v=>tokens.has(str(v.shopperId))||/\bjulissa\b/i.test(norm(v.shopper||v.evaluador||v.evaluator||'')));
const hrRes=await fetch(HOST+'/api/'+TENANT+'/'+PROJECT_ID+'/hr-live?format=json&julissatopology='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrRes.ok)throw new Error('PROVIDER_FAILURE:JULISSA_HR_HTTP_'+hrRes.status);
const hrBody=await hrRes.json(),hr=hrBody.snapshot||hrBody.data||hrBody;
const hrProfiles=arr(hr.shoppers).filter(p=>tokens.has(str(p.id||p.shopperId)));
const hrVisits=arr(hr.visits).filter(v=>tokens.has(str(v.shopperId)));
const ts=v=>v?.toDate?.()?.toISOString?.()||str(v);
const slimProfile=p=>({id:str(p.id||p.shopperId),name:profileName(p),firstName:str(p.firstName),lastName:str(p.lastName),visibleLogin:str(p.visibleLogin||p.username||p.user),whatsappPresent:!!str(p.whatsapp||p.phone),whatsappFingerprint:str(p.whatsapp||p.phone)?sha(String(p.whatsapp||p.phone).replace(/\D+/g,'')):'',emailPresent:!!str(p.email),emailFingerprint:str(p.email)?sha(p.email):'',dpiFingerprint:str(p.dpi||p.documentId||p.identification)?sha(String(p.dpi||p.documentId||p.identification).replace(/\D+/g,'')):'',bankAccountFingerprint:str(p.ctaNum||p.accountNumber)?sha(String(p.ctaNum||p.accountNumber).replace(/\s+/g,'')):'',accountHolderFingerprint:str(p.ctaTitular||p.accountHolder)?sha(p.ctaTitular||p.accountHolder):'',city:str(p.ciudad),country:str(p.pais||p.country),active:p.active,status:str(p.status||p.estado),sourceType:str(p.sourceType),sourceIdentityKey:str(p.sourceIdentityKey),hrSourceRevision:str(p.hrSourceRevision),createdAt:ts(p.createdAt),updatedAt:ts(p.updatedAt),canonicalShopperId:str(p.canonicalShopperId),sourceShopperIds:arr(p.sourceShopperIds).map(str),exactAliases:arr(p.exactAliases).map(str),legacyLiveShopperIds:arr(p.legacyLiveShopperIds).map(str),identityAuthority:str(p.identityAuthority),identityAuthorityRefPresent:!!str(p.identityAuthorityRef),identityReviewRequired:p.identityReviewRequired===true,credentialPasswordProofVersion:str(p.credentialPasswordProofVersion),strongPasswordProof:str(p.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION});
const activePrincipals=memberMatches.filter(m=>m.active===true&&str(m.role)==='shopper'&&str(m.authNamespace)==='shopper');
const strongPrincipals=activePrincipals.filter(m=>str(m.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION||str(targetProfiles.find(p=>p.id===str(m.shopperId))?.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION);
const visitKeysByShopper=Object.fromEntries([...tokens].map(id=>[id,new Set(visitMatches.filter(v=>str(v.shopperId)===id).map(v=>str(v.hrRowId||v.id||v.visitId)).filter(Boolean))]));
const overlaps=[];
const tokenList=[...TARGET_SHOPPER_IDS];
for(let i=0;i<tokenList.length;i++)for(let j=i+1;j<tokenList.length;j++){const a=tokenList[i],b=tokenList[j],sa=visitKeysByShopper[a]||new Set(),sb=visitKeysByShopper[b]||new Set(),same=[...sa].filter(k=>sb.has(k));if(same.length)overlaps.push({a,b,sharedVisitKeys:same});}
const profileById=new Map(targetProfiles.map(p=>[str(p.id||p.shopperId),slimProfile(p)]));
const authByShopper=new Map(authRows.map(a=>[str(a.shopperId),a]));
const match=(a,b,key)=>{const av=str(profileById.get(a)?.[key]),bv=str(profileById.get(b)?.[key]);return !!av&&av===bv;};
const exactPairEvidence=[];
for(let i=0;i<tokenList.length;i++)for(let j=i+1;j<tokenList.length;j++){
  const a=tokenList[i],b=tokenList[j],shared=(overlaps.find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a))?.sharedVisitKeys||[]);
  const authA=str(authByShopper.get(a)?.emailFingerprint),authB=str(authByShopper.get(b)?.emailFingerprint);
  exactPairEvidence.push({a,b,profileNameExact:norm(profileById.get(a)?.name)===norm(profileById.get(b)?.name),whatsappFingerprintMatch:match(a,b,'whatsappFingerprint'),dpiFingerprintMatch:match(a,b,'dpiFingerprint'),bankAccountFingerprintMatch:match(a,b,'bankAccountFingerprint'),accountHolderFingerprintMatch:match(a,b,'accountHolderFingerprint'),authEmailFingerprintMatch:!!authA&&authA===authB,sharedVisitKeys:shared,exactTechnicalAnchorProven:match(a,b,'whatsappFingerprint')||match(a,b,'dpiFingerprint')||match(a,b,'bankAccountFingerprint')||(!!authA&&authA===authB)||shared.length>0});
}
const durableVisitCountsByShopper=Object.fromEntries(tokenList.map(id=>[id,visitMatches.filter(v=>str(v.shopperId)===id).length]));
const hrVisitCountsByShopper=Object.fromEntries(tokenList.map(id=>[id,hrVisits.filter(v=>str(v.shopperId)===id).length]));
const currentHrTargetShopperIds=tokenList.filter(id=>(hrVisitCountsByShopper[id]||0)>0);
const collectTargetIds=(v,out=new Set(),depth=0)=>{if(depth>6||v==null)return out;if(Array.isArray(v)){for(const x of v)collectTargetIds(x,out,depth+1);return out;}if(typeof v==='object'){for(const x of Object.values(v))collectTargetIds(x,out,depth+1);return out;}const s=str(v);if(TARGET_SHOPPER_IDS.has(s))out.add(s);return out;};
const receiptMatches=receipts.map(r=>({row:r,ids:[...collectTargetIds(r)]})).filter(x=>x.ids.length).map(({row,ids})=>({id:str(row.id),matchedTargetIds:ids,commandType:str(row.commandType),shopperId:str(row.shopperId),providerAck:row.providerAck===true,identityLinkId:str(row.identityLinkId),identityConsolidated:row.identityConsolidated===true,retiredPrincipalCount:Number(row.retiredPrincipalCount||0),visibleLogin:str(row.visibleLogin),authCreated:row.authCreated===true,profileUpdated:row.profileUpdated===true,updatedAt:ts(row.updatedAt)}));
const reviewMatches=reviewRows.map(r=>({row:r,ids:[...collectTargetIds(r)]})).filter(x=>x.ids.length).map(({row,ids})=>({id:str(row.id),matchedTargetIds:ids,reason:str(row.reason||row.reviewReason||row.code),status:str(row.status||row.state),canonicalShopperId:str(row.canonicalShopperId),sourceShopperId:str(row.sourceShopperId),shopperId:str(row.shopperId),candidateShopperIds:arr(row.candidateShopperIds||row.shopperIds).map(str),createdAt:ts(row.createdAt),updatedAt:ts(row.updatedAt)}));
const result={
  schemaVersion:'cxorbia.i3.julissa.identity-topology.readonly.v1',
  decision:'PASS_JULISSA_IDENTITY_TOPOLOGY_READONLY',
  sourceRevision:str(hrBody.revision||hrBody._runtime?.revision||hr.sourceRevision),
  profiles:targetProfiles.map(slimProfile),
  members:memberMatches.map(m=>({uid:m.id,shopperId:str(m.shopperId),active:m.active===true,role:str(m.role),authNamespace:str(m.authNamespace),visibleLogin:str(m.visibleLogin||m.username),identityState:str(m.identityState),supersededByShopperId:str(m.supersededByShopperId),credentialPasswordProofVersion:str(m.credentialPasswordProofVersion),strongPasswordProof:str(m.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION})),
  auth:authRows,
  crosswalk:crossMatches.map(x=>({id:str(x.id),shopperId:str(x.shopperId),canonicalShopperId:str(x.canonicalShopperId),sourceStableKey:str(x.sourceStableKey),sourceShopperId:str(x.sourceShopperId),identityMode:str(x.identityMode),sourceType:str(x.sourceType),migrationAuthorityType:str(x.migrationAuthorityType),migrationAuthorityRefPresent:!!str(x.migrationAuthorityRef),identityAuthority:str(x.identityAuthority),identityAuthorityRefPresent:!!str(x.identityAuthorityRef),providerUidFingerprintPresent:!!str(x.providerUidFingerprint),status:str(x.status||x.state),active:x.active,updatedAt:ts(x.updatedAt)})),
  links:linkMatches.map(x=>({id:str(x.id),canonicalShopperId:str(x.canonicalShopperId||x.canonicalId||x.shopperId||x.profileId),sourceIdentityKey:str(x.sourceIdentityKey),sourceShopperId:str(x.sourceShopperId),sourceSubjectId:str(x.sourceSubjectId),sourceAliases:arr(x.sourceAliases).map(str),exactAliases:arr(x.exactAliases).map(str),authorityType:str(x.authorityType||x.authority?.type),status:str(x.status||x.state)})),
  durableVisits:visitMatches.map(v=>({id:str(v.id||v.visitId),hrRowId:str(v.hrRowId),periodId:str(v.periodId),shopperId:str(v.shopperId),branch:str(v.sucursal),state:str(v.estado||v.status),assignmentSource:str(v.assignmentSource)})),
  hrProfiles:hrProfiles.map(slimProfile),
  hrVisits:hrVisits.map(v=>({id:str(v.id||v.visitId),hrRowId:str(v.hrRowId),periodKey:str(v.periodKey),shopperId:str(v.shopperId),shopper:str(v.shopper||v.evaluador||v.evaluator),branch:str(v.sucursal),state:str(v.estado||v.status)})),
  provenance:{commandReceipts:receiptMatches,reviewQueue:reviewMatches},
  counts:{profiles:targetProfiles.length,members:memberMatches.length,authRows:authRows.length,crosswalk:crossMatches.length,links:linkMatches.length,durableVisits:visitMatches.length,hrProfiles:hrProfiles.length,hrVisits:hrVisits.length,commandReceipts:receiptMatches.length,reviewQueue:reviewMatches.length},
  adjudicationReadiness:{targetShopperIds:tokenList,activePrincipalCount:activePrincipals.length,strongPrincipalCount:strongPrincipals.length,strongPrincipalShopperIds:strongPrincipals.map(m=>str(m.shopperId)),credentialKeeperUnambiguous:strongPrincipals.length===1,currentHrTargetShopperIds,canonicalOperationalCandidate:currentHrTargetShopperIds.length===1?currentHrTargetShopperIds[0]:'',canonicalOperationalCandidateUnambiguous:currentHrTargetShopperIds.length===1,durableVisitCountsByShopper,hrVisitCountsByShopper,exactPairEvidence,visitKeyOverlaps:overlaps},
  writes:0,production:false
};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
