#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';import {getAuth} from 'firebase-admin/auth';import {getFirestore} from 'firebase-admin/firestore';import {chromium} from 'playwright';
const PROJECT=process.env.PROJECT,HOST=String(process.env.HOSTING_URL).replace(/\/$/,''),TENANT=process.env.TENANT_ID,PROJ=process.env.PROJECT_ID,SOURCE=process.env.I3_CERTIFICATION_SOURCE_SHA,OUT=process.env.ACCEPTANCE_OUT||'.tmp/recovery-i3-human-live-acceptance';const PRE='YES_PAULA_20260628_PREVIEW_DEV',PROT='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const ROUTE_INVENTORY=JSON.parse(fs.readFileSync(path.join(process.cwd(),'CXORBIA_CANONICAL_ROUTE_INVENTORY_2026-09-18.json'),'utf8'));if(ROUTE_INVENTORY?.counts?.roleRouteEntries!==56)throw new Error('RELEASE_COMPOSITION_FAILURE:ROUTE_INVENTORY_INVALID');
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),safe=v=>str(v).toLowerCase().replace(/[^a-z0-9_-]+/g,'-').slice(0,80)||'route';fs.mkdirSync(OUT,{recursive:true});const write=(n,o)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(o,null,2)+'\n');async function docs(r){const s=await r.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}))}
const part=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,''),cap=v=>{const t=part(v);return t?t[0].toUpperCase()+t.slice(1):''};function cred(p){const t=str(p?.nombre||p?.name||p?.fullName).split(/\s+/).filter(Boolean),a=part(p?.firstName||t[0]),b=part(p?.lastName||p?.apellido||t.slice(1).join(' '));return a&&b?{login:a+'.'+b,password:cap(p?.firstName||t[0])+'123*'}:null}const vkey=v=>str(v?.hrRowId)||(str(v?.sourceTab)&&str(v?.sourceRow)?str(v.sourceTab)+'::'+str(v.sourceRow):'')||str(v?.visitId||v?.id);
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);const [members,profiles,links,cross,legalContents,receipts]=await Promise.all([docs(tenant.collection('users')),docs(tenant.collection('shoppers')),docs(tenant.collection('shopperIdentityLinks')),docs(tenant.collection('shopperIdentityCrosswalk')),docs(tenant.collection('legalContents')),docs(tenant.collection('legalAcceptances'))]);
const hrUrl=HOST+'/api/tenants/'+encodeURIComponent(TENANT)+'/projects/'+encodeURIComponent(PROJ)+'/hr-live?'+new URLSearchParams({format:'json',fresh:(process.env.CX_FORENSIC_IDENTITY_ONLY==='1'?'0':'1'),view:'operational-names',cxOperationalPreview:'YES_PAULA_20260731_NAMES_DEV'});
let hp=null,lastHrStatus=0,lastHrError='';for(let attempt=1;attempt<=5;attempt++){try{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),180000);const resp=await fetch(hrUrl+'&ts='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store'},signal:ctrl.signal});clearTimeout(timer);lastHrStatus=resp.status;if(resp.ok){hp=await resp.json();break;}lastHrError='HTTP_'+resp.status;}catch(e){lastHrError=str(e?.message||e)}if(attempt<5)await new Promise(r=>setTimeout(r,attempt*2500));}
if(!hp)throw new Error('PROVIDER_FAILURE:LIVE_HR_HTTP_'+String(lastHrStatus||lastHrError||'UNKNOWN'));
const hr=hp?.snapshot||hp?.data||hp,visits=arr(hr?.visits),shoppers=arr(hr?.shoppers),periods=arr(hr?.periods),revision=str(hr?.sourceRevision||hr?._runtime?.revision||hp?._runtime?.revision);if(!(hr?.sourceSafe===true&&visits.length&&periods.length&&new Set(visits.map(vkey)).size===visits.length&&/^[a-f0-9]{64}$/.test(revision)))throw new Error('PROVIDER_FAILURE:LIVE_HR_INVALID');
const legal=legalContents.filter(c=>c.active!==false&&str(c.scopeMode||'tenant')==='tenant'&&str(c.currentVersion)&&/^[a-f0-9]{64}$/.test(str(c.currentDigest).toLowerCase())&&(arr(c.roleApplicability).length===0||arr(c.roleApplicability).map(str).includes('shopper')));if(legal.length!==1)throw new Error('AUTH_FAILURE:LEGAL_AMBIGUOUS');const current=legal[0];
const humanReceipts=receipts.filter(r=>str(r.tenantId)===TENANT&&str(r.role)==='shopper'&&str(r.authNamespace)==='shopper'&&str(r.status)==='accepted'&&str(r.acceptanceMethod)==='human_ui'&&r.subjectExact===true&&Boolean(r.acceptedAt)&&str(r.actorUid));const currentAccepted=new Set(humanReceipts.filter(r=>str(r.legalContentId)===str(current.id)&&str(r.legalVersion)===str(current.currentVersion)&&str(r.contentDigest).toLowerCase()===str(current.currentDigest).toLowerCase()).map(r=>str(r.actorUid)));const everAccepted=new Set(humanReceipts.map(r=>str(r.actorUid)));
const linkTargets=new Map(),crossTargets=new Map();
const addTarget=(map,a,b)=>{a=str(a);b=str(b);if(!a||!b)return;if(!map.has(a))map.set(a,new Set());map.get(a).add(b)};
for(const l of links){
  const st=str(l?.status||l?.state).toLowerCase(),au=str(l?.authorityType||l?.authority?.type).toLowerCase(),to=str(l?.canonicalShopperId||l?.canonicalId||l?.shopperId||l?.profileId);
  if(str(l?.tenantId||l?.scope?.tenantId)!==TENANT||!['active','confirmed','approved','materialized'].includes(st)||!['provider_exact','tenant_adjudication','platform_created','migrated_exact'].includes(au)||!to)continue;
  for(const x of [l?.sourceIdentityKey,l?.sourceSubjectId,l?.sourceId,l?.sourceKey,l?.legacyShopperId,l?.externalShopperId,...arr(l?.sourceIdentityAliases),...arr(l?.identityAliases),...arr(l?.aliases)].map(str).filter(Boolean))addTarget(linkTargets,x,to);
}
for(const x of cross){
  const ps=arr(x?.projectIds).map(str),to=str(x?.shopperId),mode=str(x?.identityMode).toLowerCase();
  if(str(x?.tenantId||TENANT)!==TENANT||str(x?.sourceType).toLowerCase()!=='hr_external'||!to||(!ps.includes(PROJ)&&ps.length)||!['provider_exact_identity_link','stable_hr_shopper_id','exact_technical_keys_only'].includes(mode))continue;
  for(const t of [x.id,x?.sourceStableKey,x?.sourceShopperId].map(str).filter(Boolean))addTarget(crossTargets,t,to);
}
const nextExact=cur=>{
  const crossExact=[...(crossTargets.get(cur)||new Set())];
  if(crossExact.length)return {authority:'hr_exact_crosswalk',targets:crossExact};
  return {authority:'historical_identity_link',targets:[...(linkTargets.get(cur)||new Set())]};
};
const resolve=id=>{
  let cur=str(id),seen=new Set();
  for(let i=0;i<8;i++){
    if(!cur||seen.has(cur))return'';
    seen.add(cur);
    const step=nextExact(cur),targets=step.targets;
    if(targets.length!==1)return targets.length===0?cur:'';
    if(targets[0]===cur)return cur;
    cur=targets[0];
  }
  return'';
};
const identityPrecedence={rule:'hr_exact_crosswalk_over_historical_identity_link',fuzzyMatching:false};
const byProfile=new Map(profiles.map(p=>[str(p?.canonicalShopperId||p?.shopperId||p?.id),p]).filter(([k])=>k)),hist=new Map(),country=new Map();for(const v of visits){const raw=str(v?.shopperId||v?.shopperCode||v?.shopper);if(!raw)continue;const c=resolve(raw)||raw;hist.set(c,(hist.get(c)||0)+1);if(str(v?.pais||v?.country)&&!country.has(c))country.set(c,str(v?.pais||v?.country))}for(const s of shoppers){const raw=str(s?.id||s?.shopperId),c=resolve(raw)||raw;if(str(s?.pais||s?.country)&&!country.has(c))country.set(c,str(s?.pais||s?.country))}
const CRED_RULE='tya-shopper-nombre-apellido-v1',PASSWORD_PROOF='cxorbia-shopper-password-proof-v1';
const all=[];for(const m of members.filter(x=>x.active===true&&str(x.authNamespace)==='shopper'&&str(x.role)==='shopper'&&str(x.shopperId)&&(arr(x.projectIds).length===0||arr(x.projectIds).map(String).includes(PROJ)))){try{await auth.getUser(m.id)}catch(e){if(str(e?.code)==='auth/user-not-found')continue;throw e}const raw=str(m.shopperId),can=resolve(raw)||raw,p=byProfile.get(can)||byProfile.get(raw),cr=p&&cred(p),h=hist.get(can)||hist.get(raw)||0,co=str(p?.pais||p?.country||country.get(can)||country.get(raw)),credentialReady=str(m.credentialRuleVersion)===CRED_RULE&&str(m.credentialPasswordProofVersion)===PASSWORD_PROOF&&str(m.credentialPasswordRuleVersion)===CRED_RULE;if(p&&cr&&credentialReady)all.push({uid:m.id,raw,can,p,cr,h,co,currentAccepted:currentAccepted.has(m.id),everAccepted:everAccepted.has(m.id)})}all.sort((a,b)=>b.h-a.h);
const projectRef=tenant.collection('projects').doc(PROJ);const [durableVisitSnap,durablePostSnap]=await Promise.all([projectRef.collection('visits').get(),projectRef.collection('postulations').get()]);const durableVisits=durableVisitSnap.docs.map(d=>({_docId:d.id,...(d.data()||{})}));const durablePosts=durablePostSnap.docs.map(d=>({_docId:d.id,...(d.data()||{})}));
const TECH_KEYS=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'];
const ALIAS_KEYS=['canonicalLegacyIds','legacyLiveShopperIds','sourceShopperIds','hrShopperIds','externalShopperIds','identityAliases','aliases','exactAliases'];
const tok=new Map(),addTok=(v,c)=>{v=str(v);c=str(c);if(!v||!c)return;if(!tok.has(v))tok.set(v,new Set());tok.get(v).add(c)};
const walkProfile=(p,c)=>{for(const k of TECH_KEYS)addTok(p?.[k],c);for(const k of ALIAS_KEYS)for(const v of arr(p?.[k]))addTok(v,c);for(const box of ['legacy','identity','crosswalk','profile']){const o=p?.[box];if(o&&typeof o==='object'){for(const k of TECH_KEYS)addTok(o?.[k],c);for(const k of ALIAS_KEYS)for(const v of arr(o?.[k]))addTok(v,c);}}};
for(const p of profiles){const c=str(p?.canonicalShopperId||p?.shopperId||p?.id);if(c){addTok(c,c);walkProfile(p,c);}}
for(const l of links){const st=str(l?.status||l?.state).toLowerCase(),au=str(l?.authorityType||l?.authority?.type).toLowerCase(),c=str(l?.canonicalShopperId||l?.canonicalId||l?.shopperId||l?.profileId);if(str(l?.tenantId||l?.scope?.tenantId)!==TENANT||!['active','confirmed','approved','materialized'].includes(st)||!['provider_exact','tenant_adjudication','platform_created','migrated_exact'].includes(au)||!c)continue;for(const k of TECH_KEYS)addTok(l?.[k],c);for(const k of ALIAS_KEYS)for(const v of arr(l?.[k]))addTok(v,c);for(const v of [l?.sourceIdentityKey,l?.sourceSubjectId])addTok(v,c);}
for(const x of cross){const ps=arr(x?.projectIds).map(str),c=str(x?.shopperId),mode=str(x?.identityMode).toLowerCase();if(str(x?.tenantId||TENANT)!==TENANT||str(x?.sourceType).toLowerCase()!=='hr_external'||!c||(!ps.includes(PROJ)&&ps.length)||!['provider_exact_identity_link','stable_hr_shopper_id','exact_technical_keys_only'].includes(mode))continue;for(const v of [x.id,x?.sourceStableKey,x?.sourceShopperId])addTok(v,c);}
const exact=id=>{id=str(id);const a=[...(tok.get(id)||new Set())];return a.length===1?{ok:true,id:a[0]}:a.length>1?{ok:false,ambiguous:true}:{ok:false,ambiguous:false}};
const liveByVisitKey=new Map(visits.map(v=>[vkey(v),v]).filter(([k])=>k)),relation=new Map(),addRel=(live,c)=>{live=str(live);c=str(c);if(!live||!c)return;if(!relation.has(live))relation.set(live,new Set());relation.get(live).add(c)};
let durableVisitExactMatches=0,durableVisitOwnerResolved=0;
for(const pv of durableVisits){const lv=liveByVisitKey.get(vkey(pv));if(!lv)continue;durableVisitExactMatches++;const own=exact(pv?.shopperId);if(own.ok){durableVisitOwnerResolved++;addRel(lv?.shopperId||lv?.shopperCode||lv?.shopper,own.id);}}
const activeShopperMembers=members.filter(x=>x.active===true&&str(x.authNamespace)==='shopper'&&str(x.role)==='shopper'&&str(x.shopperId)&&(arr(x.projectIds).length===0||arr(x.projectIds).map(String).includes(PROJ)));
let authPresent=0,memberProfileResolved=0,memberProfileAmbiguous=0,memberProfileMissing=0,memberToLiveResolved=0,memberToLiveAmbiguous=0,credentialDerivable=0,credentialMetadataCurrent=0;
const unresolved=[];
for(const m of activeShopperMembers){try{await auth.getUser(m.id);authPresent++;}catch(e){if(str(e?.code)!=='auth/user-not-found')throw e;continue}const pr=exact(m.shopperId);if(!pr.ok){if(pr.ambiguous)memberProfileAmbiguous++;else memberProfileMissing++;if(unresolved.length<12)unresolved.push(hash(m.id+':'+str(m.shopperId)).slice(0,18));continue}memberProfileResolved++;const p=byProfile.get(pr.id)||profiles.find(x=>str(x?.canonicalShopperId||x?.shopperId||x?.id)===pr.id);const cr=p&&cred(p);if(cr){credentialDerivable++;const visible=str(m.visibleLogin||p?.visibleLogin||p?.username||p?.user).toLowerCase();if(visible===cr.login.toLowerCase()&&str(m.credentialRuleVersion||p?.credentialRuleVersion)==='tya-shopper-nombre-apellido-v1')credentialMetadataCurrent++}let hits=0,amb=false;for(const [live,set] of relation){if(set.has(pr.id)){if(set.size===1)hits++;else amb=true;}}if(hits>0)memberToLiveResolved++;else if(amb)memberToLiveAmbiguous++;}
const clientMembers=members.filter(m=>m.active!==false&&str(m.status||'active').toLowerCase()!=='inactive'&&str(m.authNamespace)==='staff'&&['cliente','client'].includes(str(m.role)));let clientAuthPresent=0;for(const m of clientMembers){try{await auth.getUser(m.id);clientAuthPresent++;}catch(e){if(str(e?.code)!=='auth/user-not-found')throw e;}}
const durableKeyGroups=new Map();for(const v of durableVisits){const k=vkey(v)||'MISSING';if(!durableKeyGroups.has(k))durableKeyGroups.set(k,[]);durableKeyGroups.get(k).push(v);}
const durableDuplicateGroups=[...durableKeyGroups.values()].filter(g=>g.length>1),durableDuplicateRows=durableDuplicateGroups.reduce((n,g)=>n+g.length-1,0);
let durableOwnerConflictGroups=0;for(const g of durableDuplicateGroups){const owners=new Set(g.map(v=>str(v?.shopperId)).filter(Boolean));if(owners.size>1)durableOwnerConflictGroups++;}
const relationUnique=[...relation.values()].filter(x=>x.size===1).length,relationAmbiguous=[...relation.values()].filter(x=>x.size>1).length,relationMaxTargets=Math.max(0,...[...relation.values()].map(x=>x.size));
const liveByKey=new Map(visits.map(v=>[vkey(v),v]).filter(([k])=>k));
let duplicateGroupsWithExactlyOneDocIdMatchingLive=0,duplicateGroupsWithNoDocIdMatchingLive=0,duplicateGroupsWithTwoDocIdMatchingLive=0;
let duplicateDocsCurrentRevision=0,duplicateGroupsWithExactlyOneCurrentRevision=0,duplicateGroupsWithTwoCurrentRevision=0;
let duplicateDocsPlatformPending=0,duplicateGroupsWithPlatformPending=0,duplicateGroupsWithExactlyOnePlatformPending=0;
let duplicateGroupsCanonicalTargetAlsoCurrentRevision=0,duplicateGroupsCanonicalTargetPreservesPending=0;
for(const g of durableDuplicateGroups){
 const live=liveByKey.get(vkey(g[0]));const liveId=str(live?.visitId||live?.id);const idMatches=g.filter(x=>str(x._docId)===liveId);
 if(idMatches.length===1)duplicateGroupsWithExactlyOneDocIdMatchingLive++;else if(idMatches.length===0)duplicateGroupsWithNoDocIdMatchingLive++;else duplicateGroupsWithTwoDocIdMatchingLive++;
 const current=g.filter(x=>str(x.hrSourceRevision)===revision);duplicateDocsCurrentRevision+=current.length;if(current.length===1)duplicateGroupsWithExactlyOneCurrentRevision++;else if(current.length>1)duplicateGroupsWithTwoCurrentRevision++;
 const pending=g.filter(x=>str(x.assignmentSource)==='platform'&&str(x.assignmentSyncStatus)==='pending_hr'&&str(x.shopperId));duplicateDocsPlatformPending+=pending.length;if(pending.length)duplicateGroupsWithPlatformPending++;if(pending.length===1)duplicateGroupsWithExactlyOnePlatformPending++;
 if(idMatches.length===1&&str(idMatches[0].hrSourceRevision)===revision)duplicateGroupsCanonicalTargetAlsoCurrentRevision++;
 if(idMatches.length===1&&pending.some(x=>x===idMatches[0]))duplicateGroupsCanonicalTargetPreservesPending++;
}
const canonicalToLive=new Map();for(const [live,set] of relation)for(const c of set){if(!canonicalToLive.has(c))canonicalToLive.set(c,new Set());canonicalToLive.get(c).add(live);}
const idClass=id=>{id=str(id);return /^TYA_/i.test(id)?'TYA':/^shp-/i.test(id)?'shp':/^shopper_/i.test(id)?'shopper':/^cx-sh-/i.test(id)?'cxsh':'other';};
const countClass=ids=>ids.reduce((o,id)=>{const k=idClass(id);o[k]=(o[k]||0)+1;return o},{});
const activeMemberIds=new Set(activeShopperMembers.map(m=>str(m.shopperId)).filter(Boolean));
const profileIds=profiles.map(p=>str(p?.canonicalShopperId||p?.shopperId||p?.id)).filter(Boolean);
const liveShopperIds=shoppers.map(x=>str(x?.shopperId||x?.id)).filter(Boolean);
let relationExactlyOneActiveCandidate=0,relationZeroActiveCandidate=0,relationMultipleActiveCandidates=0,relationActiveCandidateEqualsLive=0;
const uniqueActiveMappings=[];
for(const [live,set] of relation){const active=[...set].filter(c=>activeMemberIds.has(c));if(active.length===1){relationExactlyOneActiveCandidate++;uniqueActiveMappings.push([live,active[0]]);if(active[0]===live)relationActiveCandidateEqualsLive++;}else if(active.length===0)relationZeroActiveCandidate++;else relationMultipleActiveCandidates++;}
const activeLinks=links.filter(l=>['active','confirmed','approved','materialized'].includes(str(l?.status||l?.state).toLowerCase())),activeCross=cross.filter(x=>str(x?.sourceType).toLowerCase()==='hr_external');
const existingTrustedMap=new Map();for(const l of activeLinks){const to=str(l?.canonicalShopperId||l?.canonicalId||l?.shopperId||l?.profileId);for(const x of [l?.sourceIdentityKey,l?.sourceSubjectId,l?.sourceId,l?.sourceKey,l?.legacyShopperId,l?.externalShopperId,...arr(l?.sourceIdentityAliases),...arr(l?.identityAliases),...arr(l?.aliases)].map(str).filter(Boolean)){if(!existingTrustedMap.has(x))existingTrustedMap.set(x,new Set());existingTrustedMap.get(x).add(to);}}
for(const x of activeCross){const to=str(x?.shopperId);for(const t of [x.id,x?.sourceStableKey,x?.sourceShopperId].map(str).filter(Boolean)){if(!existingTrustedMap.has(t))existingTrustedMap.set(t,new Set());existingTrustedMap.get(t).add(to);}}
let liveWithUniqueTrustedMap=0,liveWithAmbiguousTrustedMap=0,liveWithNoTrustedMap=0,liveTrustedToActiveMembership=0;
for(const live of liveShopperIds){const c=[...(existingTrustedMap.get(live)||new Set())];if(c.length===1){liveWithUniqueTrustedMap++;if(activeMemberIds.has(c[0]))liveTrustedToActiveMembership++;}else if(c.length>1)liveWithAmbiguousTrustedMap++;else liveWithNoTrustedMap++;}
const linkMap=new Map(),crossMap=new Map();for(const l of activeLinks){const to=str(l?.canonicalShopperId||l?.canonicalId||l?.shopperId||l?.profileId);for(const x of [l?.sourceIdentityKey,l?.sourceSubjectId,l?.sourceId,l?.sourceKey,l?.legacyShopperId,l?.externalShopperId,...arr(l?.sourceIdentityAliases),...arr(l?.identityAliases),...arr(l?.aliases)].map(str).filter(Boolean)){if(!linkMap.has(x))linkMap.set(x,new Set());linkMap.get(x).add(to);}}for(const x of activeCross){const to=str(x?.shopperId);for(const t of [x.id,x?.sourceStableKey,x?.sourceShopperId].map(str).filter(Boolean)){if(!crossMap.has(t))crossMap.set(t,new Set());crossMap.get(t).add(to);}}
let liveLinkUnique=0,liveLinkAmbiguous=0,liveLinkNone=0,liveLinkUniqueActive=0,liveCrossUnique=0,liveCrossAmbiguous=0,liveCrossNone=0,liveCrossUniqueActive=0,uniqueLinkCrossConflict=0,ambiguousCombinedResolvedByUniqueLink=0;
for(const live of liveShopperIds){const l=[...(linkMap.get(live)||new Set())],c=[...(crossMap.get(live)||new Set())],all=[...(existingTrustedMap.get(live)||new Set())];if(l.length===1){liveLinkUnique++;if(activeMemberIds.has(l[0]))liveLinkUniqueActive++;}else if(l.length>1)liveLinkAmbiguous++;else liveLinkNone++;if(c.length===1){liveCrossUnique++;if(activeMemberIds.has(c[0]))liveCrossUniqueActive++;}else if(c.length>1)liveCrossAmbiguous++;else liveCrossNone++;if(l.length===1&&c.length===1&&l[0]!==c[0])uniqueLinkCrossConflict++;if(all.length>1&&l.length===1&&activeMemberIds.has(l[0]))ambiguousCombinedResolvedByUniqueLink++;}
const identityLinkAuthorityTypes=activeLinks.reduce((o,l)=>{const k=str(l?.authorityType||l?.authority?.type||'none').toLowerCase()||'none';o[k]=(o[k]||0)+1;return o},{});
const canonicalMultiLive=[...canonicalToLive.values()].filter(x=>x.size>1).length;
const profileCanonicalGroups=new Map();for(const p of profiles){const c=str(p?.canonicalShopperId||p?.shopperId||p?.id);if(!c)continue;if(!profileCanonicalGroups.has(c))profileCanonicalGroups.set(c,0);profileCanonicalGroups.set(c,profileCanonicalGroups.get(c)+1);}
const duplicateCanonicalProfileIds=[...profileCanonicalGroups.values()].filter(n=>n>1).length;
const identityDiagnostic={schema:'cxorbia.recovery.identity-universe-diagnostic.v5',generatedAt:new Date().toISOString(),tenantId:TENANT,projectId:PROJ,sourceRevision:revision,readOnly:true,piiExported:false,providerWrites:0,production:false,counts:{membershipsTotal:members.length,activeShopperMemberships:activeShopperMembers.length,authPresent,profiles:profiles.length,profileCanonicalIds:profileCanonicalGroups.size,duplicateCanonicalProfileIds,liveHrShoppers:shoppers.length,liveHrVisits:visits.length,durableVisits:durableVisits.length,durableVisitUniqueKeys:durableKeyGroups.size,durableVisitDuplicateGroups:durableDuplicateGroups.length,durableDuplicateRows,durableOwnerConflictGroups,duplicateGroupsWithExactlyOneDocIdMatchingLive,duplicateGroupsWithNoDocIdMatchingLive,duplicateGroupsWithTwoDocIdMatchingLive,duplicateDocsCurrentRevision,duplicateGroupsWithExactlyOneCurrentRevision,duplicateGroupsWithTwoCurrentRevision,duplicateDocsPlatformPending,duplicateGroupsWithPlatformPending,duplicateGroupsWithExactlyOnePlatformPending,duplicateGroupsCanonicalTargetAlsoCurrentRevision,duplicateGroupsCanonicalTargetPreservesPending,durablePostulations:durablePosts.length,platformPostulations:durablePosts.filter(x=>str(x.source)==='platform').length,syntheticHrPostIdsInDurableStore:durablePosts.filter(x=>/^hr-post-/.test(str(x.id||x.applicationId||x.postulationId))).length,identityLinks:links.length,activeIdentityLinks:activeLinks.length,identityCrosswalk:cross.length,activeHrCrosswalk:activeCross.length,exactTechnicalTokens:tok.size,durableVisitExactMatches,durableVisitOwnerResolved,liveHrShopperRelations:relation.size,liveRelationUnique:relationUnique,liveRelationAmbiguous:relationAmbiguous,liveRelationMaxTargets:relationMaxTargets,canonicalProfilesLinkedToMultipleLiveIds:canonicalMultiLive,activeMembershipIdClasses:countClass([...activeMemberIds]),profileIdClasses:countClass(profileIds),liveShopperIdClasses:countClass(liveShopperIds),relationExactlyOneActiveCandidate,relationZeroActiveCandidate,relationMultipleActiveCandidates,relationActiveCandidateEqualsLive,liveWithUniqueTrustedMap,liveWithAmbiguousTrustedMap,liveWithNoTrustedMap,liveTrustedToActiveMembership,liveLinkUnique,liveLinkAmbiguous,liveLinkNone,liveLinkUniqueActive,liveCrossUnique,liveCrossAmbiguous,liveCrossNone,liveCrossUniqueActive,uniqueLinkCrossConflict,ambiguousCombinedResolvedByUniqueLink,identityLinkAuthorityTypes,memberProfileResolved,memberProfileAmbiguous,memberProfileMissing,memberToLiveResolved,memberToLiveAmbiguous,credentialDerivable,credentialMetadataCurrent,clientMemberships:clientMembers.length,clientScopedToProject:clientMembers.filter(x=>arr(x.projectIds).length===0||arr(x.projectIds).map(String).includes(PROJ)).length,clientAuthPresent},unresolvedMembershipFingerprints:unresolved};
write('identity-universe-diagnostic.json',identityDiagnostic);if(process.env.CX_FORENSIC_IDENTITY_ONLY==='1'){console.log('PASS_I3_FORENSIC_IDENTITY_UNIVERSE_DIAGNOSTIC');process.exit(0);}
const accepted=all.filter(x=>x.currentAccepted),history=all.filter(x=>x.h>0&&x.co),acceptedHistory=history.filter(x=>x.currentAccepted),everAcceptedHistory=history.filter(x=>!x.currentAccepted&&x.everAccepted),proofReadyHistory=[...acceptedHistory,...everAcceptedHistory,...history.filter(x=>!x.currentAccepted&&!x.everAccepted)];if(!all.length)throw new Error('AUTH_FAILURE:NO_CREDENTIAL_PROVEN_ACTIVE_SHOPPER');if(!history.length)throw new Error('MAPPING_FAILURE:NO_CREDENTIAL_PROVEN_SHOPPER_WITH_HR_HISTORY');
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&str(m.role)==='super')||members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['admin','ops','coordinador'].includes(str(m.role)));const client=members.find(m=>m.active!==false&&str(m.status||'active').toLowerCase()!=='inactive'&&str(m.authNamespace)==='staff'&&['cliente','client'].includes(str(m.role))&&(arr(m.projectIds).length===0||arr(m.projectIds).map(String).includes(PROJ)));if(!staff)throw new Error('AUTH_FAILURE:STAFF_MISSING');const clientMissing=!client;await auth.getUser(staff.id);if(client)await auth.getUser(client.id);
const base=HOST+'/index-backend-dev.html?'+new URLSearchParams({cxBackendPreview:PRE,cxProjectId:PROJ,cxProtectedRuntime:PROT,cxHumanFullVisual:FULL});const browser=await chromium.launch({headless:true}),routes=[],shots=[],issues=[],pageErrors=[];async function ctx(viewport={width:1440,height:1000},mobile=false){const c=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile}),p=await c.newPage();p.on('pageerror',e=>pageErrors.push(str(e?.message||e).slice(0,500)));return{c,p}}async function snap(p,n){const f=safe(n)+'.png';await p.screenshot({path:path.join(OUT,f),fullPage:true});shots.push(f);return f}
async function custom(p,m,role){
  let authSettled=false,lastError='';
  for(let attempt=1;attempt<=5;attempt++){
    try{
      if(!p.url().startsWith(HOST))await p.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
      await p.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
      const attemptToken=await auth.createCustomToken(m.id);
      try{
        await p.evaluate(async t=>{
          const fb=window.firebase;
          if(!fb?.auth||!Array.isArray(fb.apps)||!fb.apps.length)throw new Error('FIREBASE_SDK_NOT_READY');
          await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);
          await fb.auth().signInWithCustomToken(t);
        },attemptToken);
      }catch(e){
        const msg=str(e?.message||e);
        if(!/Execution context was destroyed|navigation|FIREBASE_SDK_NOT_READY|app-compat\/no-app|No Firebase App|auth\/network-request-failed|network AuthError|timeout|interrupted connection|unreachable host/i.test(msg))throw e;
        lastError=msg;
      }
      await p.waitForLoadState('domcontentloaded',{timeout:90000}).catch(()=>{});
      if(!p.url().startsWith(HOST))await p.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
      await p.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
      const persistedUid=await p.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=> '');
      if(persistedUid===String(m.id)){authSettled=true;break;}
      lastError='uid_not_rehydrated';
    }catch(e){
      const msg=str(e?.message||e);
      if(!/Execution context was destroyed|navigation|FIREBASE_SDK_NOT_READY|app-compat\/no-app|No Firebase App|auth\/network-request-failed|network AuthError|timeout|interrupted connection|unreachable host/i.test(msg))throw e;
      lastError=msg;
    }
    if(attempt<5)await p.waitForTimeout(1500*attempt);
  }
  if(!authSettled)throw new Error('ENVIRONMENT_FAILURE:ACCEPTANCE_CUSTOM_AUTH_NOT_SETTLED:'+role+':'+lastError.slice(0,160));
  await p.goto('about:blank',{waitUntil:'domcontentloaded',timeout:30000});
  await p.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
  await p.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  await p.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===String(uid),m.id,{timeout:90000});
  await p.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  try{await p.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});}catch(e){
    const msg=str(e?.message||e);
    if(!/Execution context was destroyed|navigation/i.test(msg))throw e;
  }
  await p.waitForFunction(({t,pr,r})=>{
    const c=window.CX?.backendAuth?.context?.()||{},x=String(c.role||'').toLowerCase(),ps=Array.isArray(c.projectIds)?c.projectIds.map(String):[];
    return c.authenticated&&c.tenantId===t&&(r==='admin'?['super','admin','ops','coordinador'].includes(x):['cliente','client'].includes(x))&&(x==='super'||!ps.length||ps.includes(pr))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;
  },{t:TENANT,pr:PROJ,r:role},{timeout:150000});
}
async function visible(p,x){
  const waitContext=()=>p.waitForFunction(({t,pr,raw,can})=>{
    const c=window.CX?.backendAuth?.context?.()||{},ps=Array.isArray(c.projectIds)?c.projectIds.map(String):[],sid=String(c.shopperId||'');
    return c.authenticated===true&&String(c.role||'').toLowerCase()==='shopper'&&c.tenantId===t&&(ps.length===0||ps.includes(pr))&&(!sid||sid===String(raw)||sid===String(can));
  },{t:TENANT,pr:PROJ,raw:x.raw,can:x.can},{timeout:120000});
  await p.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
  await p.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  await p.locator('.role-btn[data-role="shopper"]').click({timeout:30000});
  await p.locator('#lgUser').fill(x.cr.login);
  await p.locator('#lgPass').fill(x.cr.password);
  await p.locator('#lgSubmit').click();
  let firstError='';
  try{await waitContext();}catch(e){
    firstError=str(e?.message||e);
    await p.reload({waitUntil:'domcontentloaded',timeout:90000});
    await p.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    try{await waitContext();}catch(e2){
      const diag=await p.evaluate(({uid})=>{const c=window.CX?.backendAuth?.context?.()||{},u=String(window.firebase?.auth?.().currentUser?.uid||''),err=String(document.querySelector('#cxIntegratedAuthError')?.innerText||'');return{selectedRole:String(window.CX?.backendAuth?.selectedRole?.()||''),authError:err.slice(0,160),firebaseUserPresent:Boolean(u),firebaseUidMatches:u===String(uid),contextAuthenticated:c.authenticated===true,contextRole:String(c.role||''),contextTenant:String(c.tenantId||''),contextShopperPresent:Boolean(c.shopperId)}} ,{uid:x.uid}).catch(()=>({diagnosticUnavailable:true}));
      throw new Error('VISIBLE_LOGIN_CONTEXT_NOT_READY:'+firstError.slice(0,100)+':reload:'+str(e2?.message||e2).slice(0,100)+':diag:'+JSON.stringify(diag).slice(0,260));
    }
  }
  const uid=await p.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||''));
  if(uid&&uid!==String(x.uid))throw new Error('VISIBLE_LOGIN_UID_MISMATCH');
  await p.waitForTimeout(500);
  return await p.evaluate(()=>({ctx:CX?.backendAuth?.context?.()||{},authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,legalModal:[...document.querySelectorAll('.cx-modal')].some(x=>/Términos de uso y confidencialidad/i.test(String(x.innerText||''))),body:String(document.body?.innerText||'')}));
}
async function assertNav(p,role){const expected=arr(ROUTE_INVENTORY?.roles?.[role]),actual=await p.evaluate(r=>{const a=v=>Array.isArray(v)?v:[];return a(window.CX?.NAV?.[r]).flatMap(s=>a(s?.items).map(String))},role);const missing=expected.filter(x=>!actual.includes(x));if(missing.length)issues.push({classification:'RELEASE_COMPOSITION_FAILURE',code:'EXPECTED_CANONICAL_NAV_MISSING',role,missing,expectedCount:expected.length,actualCount:actual.length});return {expected,actual,missing}}
async function route(p,role,id,label,tag){try{await p.evaluate(x=>window.CX.router.nav(x),id);await p.waitForFunction(x=>window.CX?.session?.view===x,id,{timeout:15000});await p.waitForTimeout(650);const m=await p.evaluate(({id,role})=>{const v=document.querySelector('#view')||document.querySelector('main.content'),r=v?.getBoundingClientRect()||{},h=document.documentElement,b=String(document.body?.innerText||'');return{id,role,visible:(r.width||0)>0&&(r.height||0)>0,text:String(v?.innerText||'').trim().length,tenant:h.getAttribute('data-cx-tenant'),project:h.getAttribute('data-cx-project'),revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,bad:/No se encontró tu registro de evaluador|identidad de esta sesión no está vinculada|sin país asignado/i.test(b),module:typeof window.CX?.modules?.[id]==='function'}} ,{id,role});const f=await snap(p,tag+'-'+role+'-'+id);if(!(m.visible&&m.text>20&&m.module&&m.tenant===TENANT&&m.project===PROJ&&m.authority&&/^[a-f0-9]{64}$/.test(m.revision))||(role==='shopper'&&m.bad))issues.push({classification:role==='shopper'&&m.bad?'FUNCTIONAL_DEFECT':'VISUAL_DEFECT',code:'ROUTE_FAIL',role,id,label,m,f});routes.push({...m,label,f})}catch(e){let f=null;try{f=await snap(p,tag+'-'+role+'-'+id+'-error')}catch{};issues.push({classification:'VISUAL_DEFECT',code:'ROUTE_NAVIGATION_EXCEPTION',role,id,label,error:str(e?.message||e).slice(0,300),f});routes.push({id,role,label,failed:true,f})}}
try{
 const acceptedOne=proofReadyHistory[0];
 {const {c,p}=await ctx();try{
   await visible(p,acceptedOne);
   await p.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:150000});
 }catch(e){throw new Error('AUTH_FAILURE:FAST_ACCEPTED_SHOPPER_VISIBLE_LOGIN:'+str(e?.message||e).slice(0,420));}finally{await c.close()}}
 {const {c,p}=await ctx();await custom(p,staff,'admin');const summary=await p.evaluate(()=>({visits:window.CX?.data?._visitas?.length||0,shoppers:window.CX?.data?.shoppers?.length||0,periods:window.CX?.data?.projects?.length||0,project:String(window.CX?.data?.currentProjectId||''),revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),protectedNames:(window.CX?.data?.shoppers||[]).filter(x=>/shopper protegido/i.test(String(x?.nombre||x?.name||''))).length,realNames:(window.CX?.data?.shoppers||[]).filter(x=>String(x?.nombre||x?.name||'').trim()&&!/shopper protegido/i.test(String(x?.nombre||x?.name||''))).length}));if(summary.visits!==visits.length||summary.shoppers!==shoppers.length||summary.periods!==periods.length||summary.project!==PROJ)issues.push({classification:'FUNCTIONAL_DEFECT',code:'ADMIN_HR_COMPOSITION_MISMATCH',summary,expected:{visits:visits.length,shoppers:shoppers.length,periods:periods.length}});if(summary.realNames<1||summary.protectedNames>0)issues.push({classification:'MAPPING_FAILURE',code:'ADMIN_REAL_SHOPPER_IDENTITY_NOT_RENDERABLE',summary});
 const probe=await p.evaluate(async expectedDurablePosts=>{
   const d=window.CX?.data||{},sleep=ms=>new Promise(r=>setTimeout(r,ms)),months=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
   const posts=Array.isArray(d._posts)?d._posts:[];
   const postulations={durableCountExpected:expectedDurablePosts,uiReadModelCount:posts.length,syntheticHrIds:posts.filter(x=>/^hr-post-/i.test(String(x?.id||x?.applicationId||x?.postulationId||''))).length,hrDerived:posts.filter(x=>String(x?.source||'')==='hr_live_derived').length};
   postulations.ok=postulations.uiReadModelCount===postulations.durableCountExpected&&postulations.syntheticHrIds===0&&postulations.hrDerived===0;
   const originalPeriod=String(d.currentPeriodId||''),program=String(d.currentProjectId||''),programKey=x=>typeof d.programKey==='function'?String(d.programKey(x)||''):String(x?.rootProjectId||x?.projectId||'');
   const same=(Array.isArray(d.projects)?d.projects:[]).filter(x=>programKey(x)===program).sort((a,b)=>String(a.periodKey||a.id).localeCompare(String(b.periodKey||b.id)));
   const selected=same.length>=2?[same[same.length-2],same[same.length-1]]:same.slice(0,1),periods=[];
   for(const per of selected){
     const changed=typeof d.setCurrentPeriod==='function'?d.setCurrentPeriod(per.id):(d.setProject(per.id),true);
     if(changed===false){periods.push({id:per.id,ok:false,reason:'setter_rejected'});continue;}
     window.CX.router.nav('dashboard');await sleep(350);
     const tile=Number(document.querySelector('[data-kpi="total"] .k-v')?.textContent||'NaN'),expected=(typeof d.visitas==='function'?d.visitas():[]).filter(v=>!v._archived).length,body=String((document.querySelector('#view')||document.body)?.innerText||'');
     const token=String(per.periodKey||'').match(/(20\d{2})-(0[1-9]|1[0-2])/),label=token?months[Number(token[2])-1]+' '+token[1]:'';
     periods.push({id:per.id,periodKey:per.periodKey||null,tile,expected,label,labelPresent:label?body.includes(label):true,ok:Number.isFinite(tile)&&tile===expected&&(label?body.includes(label):true)});
   }
   if(originalPeriod){if(typeof d.setCurrentPeriod==='function')d.setCurrentPeriod(originalPeriod);else d.setProject(originalPeriod);window.CX.router.nav('dashboard');await sleep(250);}
   const finance={modelReady:window.CX_PROJECT_FINANCIAL_MODEL_CONTRACT?.ready===true,configurationReady:window.CX_PROJECT_FINANCIAL_CONFIGURATION_MATERIALIZATION?.ready===true,readBridge:d.__financeReadBridge===true,canonicalPeriod:String(window.CX?.fin?.canonCurrentId?.()||'')===String(d.currentPeriodId||'')};
   finance.ok=finance.modelReady&&finance.configurationReady&&finance.readBridge&&finance.canonicalPeriod;
   let reservations={ok:false,created:false,statusAck:false,deleted:false,source:String(window.CX_TYA_CANONICAL_RESERVATIONS?.source||''),mutationsEnabled:window.CX_TYA_CANONICAL_RESERVATIONS?.mutationsEnabled===true,error:null};
   let createdId='';
   try{
     const shopper=(Array.isArray(d.shoppers)?d.shoppers:[]).find(x=>String(x?.canonicalShopperId||x?.id||x?.shopperId||'').trim());
     if(!shopper)throw new Error('QA_SHOPPER_MISSING');
     const sid=String(shopper.canonicalShopperId||shopper.id||shopper.shopperId),period=window.CX?.reservas?.periodoActual?.(),branch='i3-qa-'+Date.now();
     const created=await window.CX.reservas.reservar(null,{sucursalId:branch,sucursal:'I3 QA TEMP',ciudad:'QA',pais:String(shopper.pais||shopper.country||'GT'),periodo:period,shopperId:sid,shopper:String(shopper.nombre||shopper.name||'QA')});
     if(created?.dup)throw new Error('QA_RESERVATION_UNEXPECTED_DUPLICATE');
     createdId=String(created?.r?.id||'');reservations.created=Boolean(created?.providerAck&&createdId);
     const updated=await window.CX.reservas.setEstado(null,createdId,'asignada',{shopperId:sid,shopper:String(shopper.nombre||shopper.name||'QA')});
     reservations.statusAck=String(updated?.estado||updated?.status)==='asignada';
     await window.CX.reservas.remove(null,createdId);
     reservations.deleted=!window.CX.reservas.list().some(x=>String(x?.id||x?.reservationId)===createdId);
     reservations.ok=reservations.created&&reservations.statusAck&&reservations.deleted&&reservations.source==='durable_provider'&&reservations.mutationsEnabled;
   }catch(e){
     reservations.error=String(e?.message||e).slice(0,240);
     if(createdId){try{await window.CX.reservas.remove(null,createdId)}catch{}}
   }
   return {postulations,periods,dashboardPeriodsOk:periods.length>=2&&periods.every(x=>x.ok),finance,reservations};
 },durablePosts.length);
 write('i3-functional-probes.json',{decision:probe.postulations.ok&&probe.dashboardPeriodsOk&&probe.finance.ok&&probe.reservations.ok?'PASS_I3_ATOMIC_FUNCTIONAL_PROBES':'HOLD_I3_ATOMIC_FUNCTIONAL_PROBES',sourceSha:SOURCE,sourceRevision:revision,production:false,probe});
 console.log('I3_RESERVATION_PROBE='+JSON.stringify(probe.reservations));
 if(!probe.postulations.ok)issues.push({classification:'FUNCTIONAL_DEFECT',code:'POSTULATIONS_NOT_DURABLE_ONLY',probe:probe.postulations});
 if(!probe.dashboardPeriodsOk)issues.push({classification:'FUNCTIONAL_DEFECT',code:'DASHBOARD_PERIOD_CONTEXT_FAIL',probe:probe.periods});
 if(!probe.finance.ok)issues.push({classification:'RELEASE_COMPOSITION_FAILURE',code:'FINANCE_DEPENDENCY_CLOSURE_NOT_ACTIVE',probe:probe.finance});
 if(!probe.reservations.ok)issues.push({classification:'PROVIDER_FAILURE',code:'RESERVATION_DURABLE_ACK_READBACK_FAIL',probe:probe.reservations});
 await assertNav(p,'admin');for(const id of ROUTE_INVENTORY.roles.admin)await route(p,'admin',id,id,'desktop');await c.close()}
 if(client){const {c,p}=await ctx();await custom(p,client,'cliente');await assertNav(p,'cliente');for(const id of ROUTE_INVENTORY.roles.cliente)await route(p,'cliente',id,id,'desktop');await c.close()}else issues.push({classification:'AUTH_FAILURE',code:'CLIENT_MEMBERSHIP_MISSING',roleCounts:members.reduce((a,m)=>{const k=str(m.role||'none')+'|'+str(m.authNamespace||'none');a[k]=(a[k]||0)+1;return a},{})});
 {const {c,p}=await ctx();try{const login=await visible(p,acceptedOne);await snap(p,'shopper-proof-ready-after-visible-login');await p.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:150000});await route(p,'shopper','miperfil','Mi Perfil','accepted');const st=await p.evaluate(()=>{const q=window.CX_TYA_CANONICAL_SHOPPER_PORTAL?.resolveExactSessionShopper?.(window.CX.data)||{},row=q.row||{},key=String(row.id||row.shopperId||q.canonical||''),vs=key&&window.CX.data.visitsForShopper?window.CX.data.visitsForShopper(key,false):[],cr=window.CX_TYA_CANONICAL_SHOPPER_PORTAL?.currentSessionCredentialState?.()||{};return{identity:q.ok===true,country:String(row.pais||row.country||''),history:vs.length,credential:cr.available===true&&cr.passwordPresent===true}});if(!st.identity||!st.credential)issues.push({classification:'FUNCTIONAL_DEFECT',code:'ACCEPTED_SHOPPER_PROFILE_OR_CREDENTIAL_FAIL',st});}catch(e){issues.push({classification:'AUTH_FAILURE',code:'ACCEPTED_SHOPPER_VISIBLE_LOGIN_OR_BOOT_FAIL',error:str(e?.message||e).slice(0,300)});try{await snap(p,'shopper-proof-ready-login-error')}catch{}}await c.close()}
 const chosen=[];for(const co of ['GT','HN']){const x=history.find(h=>h.co===co);if(x)chosen.push(x)}if(!chosen.length)chosen.push(history[0]);for(const x of chosen){const {c,p}=await ctx();try{await visible(p,x);await snap(p,'history-shopper-'+x.co+'-after-visible-login');await p.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:150000});await route(p,'shopper','miperfil','Mi Perfil','history-'+x.co.toLowerCase());const st=await p.evaluate(()=>{const q=window.CX_TYA_CANONICAL_SHOPPER_PORTAL?.resolveExactSessionShopper?.(window.CX.data)||{},row=q.row||{},key=String(row.id||row.shopperId||q.canonical||''),vs=key&&window.CX.data.visitsForShopper?window.CX.data.visitsForShopper(key,false):[],s=key&&window.CX.data.shopperStats?window.CX.data.shopperStats(key):{},name=String(row.nombre||row.name||row.fullName||''),body=String(document.body?.innerText||'');return{identity:q.ok===true,name,nameRendered:Boolean(name)&&body.includes(name),country:String(row.pais||row.country||''),history:vs.length,stats:Number(s.total||0),own:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.ownVisits??-1)}});if(!(st.identity&&st.nameRendered&&st.country&&st.history>0&&st.stats===st.history&&st.own===st.history))issues.push({classification:'FUNCTIONAL_DEFECT',code:'HISTORY_SHOPPER_PROFILE_HISTORY_KPI_FAIL',country:x.co,st});await assertNav(p,'shopper');for(const id of ROUTE_INVENTORY.roles.shopper)await route(p,'shopper',id,id,'history-'+x.co.toLowerCase());}catch(e){issues.push({classification:'AUTH_FAILURE',code:'HISTORY_SHOPPER_VISIBLE_LOGIN_OR_BOOT_FAIL',country:x.co,history:x.h,error:str(e?.message||e).slice(0,300)});try{await snap(p,'history-shopper-'+x.co+'-login-error')}catch{}}await c.close()}
 {const {c,p}=await ctx({width:390,height:844},true);await custom(p,staff,'admin');for(const x of [['dashboard','Dashboard'],['shoppers','Shoppers'],['visitas','Visitas']])await route(p,'admin',x[0],x[1],'mobile');await c.close()}
 const blockers=issues.filter(x=>['AUTH_FAILURE','FUNCTIONAL_DEFECT','VISUAL_DEFECT','MAPPING_FAILURE','PROVIDER_FAILURE','PERSISTENCE_FAILURE','RELEASE_COMPOSITION_FAILURE','ENVIRONMENT_FAILURE'].includes(x.classification));const decision=history.length&&blockers.length===0?'PASS_I3_HUMAN_LIVE_ACCEPTANCE':'HOLD_I3_HUMAN_LIVE_ACCEPTANCE';write('human-live-acceptance.json',{decision,generatedAt:new Date().toISOString(),sourceSha:SOURCE,sourceRevision:revision,production:false,readOnly:false,identityPrecedence,hr:{periods:periods.length,visits:visits.length,shoppers:shoppers.length},population:{activeAuthShopperProfiles:all.length,currentLegalAccepted:accepted.length,withHrHistory:history.length,currentLegalAcceptedWithHrHistory:acceptedHistory.length,humanReceipts:humanReceipts.length,clientMembershipFound:!clientMissing,roleCounts:members.reduce((a,m)=>{const k=str(m.role||'none')+'|'+str(m.authNamespace||'none');a[k]=(a[k]||0)+1;return a},{})},acceptedShopper:{fingerprint:hash(acceptedOne.uid+':'+acceptedOne.can).slice(0,18),history:acceptedOne.h,country:acceptedOne.co||null},historyCandidates:chosen.map(x=>({fingerprint:hash(x.uid+':'+x.can).slice(0,18),country:x.co,history:x.h,currentAccepted:x.currentAccepted,everAccepted:x.everAccepted})),routeInventory:{sha256:'ad262dd0165a7159e62076f67a6339b375ce0760dd6b650abc4ee438b04950af',expectedRoleRouteEntries:56},routes,screenshotCount:shots.length,screenshots:shots,pageErrors,issues,classification:decision==='PASS_I3_HUMAN_LIVE_ACCEPTANCE'?null:(blockers[0]?.classification||'FUNCTIONAL_DEFECT'),code:decision==='PASS_I3_HUMAN_LIVE_ACCEPTANCE'?null:(blockers[0]?.code||'LIVE_ACCEPTANCE_BLOCKED')});if(decision!=='PASS_I3_HUMAN_LIVE_ACCEPTANCE')throw new Error((blockers[0]?.classification||'FUNCTIONAL_DEFECT')+':'+(blockers[0]?.code||'LIVE_ACCEPTANCE_BLOCKED'));console.log(decision)
}finally{await browser.close()}
