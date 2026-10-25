#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const OUT=String(process.env.PREI4_003_OUT||'.tmp/prei4-admin-003');
const ROOT=String(process.env.PREI4_003_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.PREI4_003_HR_REVISION||'');
const TENANT='tya',PROJECT='cinepolis';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
const normName=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const fp=v=>sha(v).slice(0,16);
fs.mkdirSync(OUT,{recursive:true});
const write=(n,v)=>fs.writeFileSync(OUT+'/'+n,JSON.stringify(v,null,2)+'\n');
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('ENVIRONMENT_FAILURE:PREI4_003_HR_REVISION');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const docs=async ref=>(await ref.get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));
const [profiles,users,crosswalk,links,visits]=await Promise.all([
  docs(tenant.collection('shoppers')),docs(tenant.collection('users')),docs(tenant.collection('shopperIdentityCrosswalk')),docs(tenant.collection('shopperIdentityLinks')),docs(project.collection('visits'))
]);

const response=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&fresh=1&prei4003='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!response.ok)throw new Error('PROVIDER_FAILURE:PREI4_003_HR_HTTP_'+response.status);
const body=await response.json(),snapshot=body?.snapshot||body?.data||body,runtime=body?._runtime||snapshot?._runtime||{};
const observed=str(runtime.revision||snapshot.revision||snapshot.sourceRevision);
if(observed!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:PREI4_003_HR_REVISION:'+observed);
const hrVisits=arr(snapshot.visits),hrShoppers=arr(snapshot.shoppers);

const targetGroups={
  patricia:['shopper_gt_0757b1eeb4','shopper_gt_7c8b7cbdbf','shopper_gt_c342b8c62e'],
  jary:['shopper_gt_0a363269ad','shopper_gt_f726f2eb34'],
  depaz:['shopper_gt_018ca3e794','shopper_gt_bd74ace936','shopper_gt_81de8fb0a2']
};
const targetIds=new Set(Object.values(targetGroups).flat());
const techTokens=p=>uniq([
  str(p?.id),str(p?.shopperId),str(p?.legacyShopperId),str(p?.externalShopperId),str(p?.externalId),str(p?.sourceId),str(p?.sourceKey),str(p?.profileId),str(p?.shopperDocId),
  ...arr(p?.exactAliases),...arr(p?.identityAliases),...arr(p?.aliases),...arr(p?.canonicalLegacyIds),...arr(p?.legacyLiveShopperIds),...arr(p?.sourceShopperIds),...arr(p?.hrShopperIds)
]);
const profileById=new Map(profiles.map(p=>[str(p.id||p.shopperId||p.docId),p]));
const sourceTokens=l=>uniq([str(l?.sourceIdentityKey),str(l?.sourceSubjectId),str(l?.sourceId),str(l?.sourceKey),str(l?.legacyShopperId),str(l?.externalShopperId),...arr(l?.sourceIdentityAliases),...arr(l?.sourceAliases),...arr(l?.exactAliases),...arr(l?.aliases)]);
const canonicalOf=l=>str(l?.canonicalShopperId||l?.canonicalId||l?.shopperId||l?.profileId);
const crossSource=x=>str(x?.sourceShopperId||x?.sourceIdentityKey||x?.id||x?.docId);
const crossCanonical=x=>str(x?.canonicalShopperId||x?.shopperId||x?.canonicalId||x?.id||x?.docId);

const identity={};
for(const id of targetIds){
  const p=profileById.get(id)||null;
  const cw=crosswalk.filter(x=>crossSource(x)===id||crossCanonical(x)===id||techTokens(x).includes(id));
  const il=links.filter(x=>canonicalOf(x)===id||sourceTokens(x).includes(id));
  const hrv=hrVisits.filter(v=>str(v.shopperId)===id);
  const fsv=visits.filter(v=>str(v.shopperId)===id);
  const memberships=users.filter(u=>str(u.shopperId)===id);
  identity[id]={
    profile:p?{id,name:str(p.nombre||p.name||[p.firstName,p.lastName].filter(Boolean).join(' ')),nameKey:normName(p.nombre||p.name||[p.firstName,p.lastName].filter(Boolean).join(' ')),tokens:techTokens(p).map(fp),identityAuthority:str(p.identityAuthority),providerAuthority:str(p.__providerIdentityAuthorityType)}:null,
    crosswalk:cw.map(x=>({docFp:fp(x.docId),sourceFp:fp(crossSource(x)),canonicalFp:fp(crossCanonical(x)),status:str(x.status||x.state),authority:str(x.authorityType||x.identityAuthority)})),
    links:il.map(x=>({docFp:fp(x.docId),canonicalFp:fp(canonicalOf(x)),sourceFps:sourceTokens(x).map(fp),status:str(x.status||x.state),authorityType:str(x.authorityType||x.authority?.type),periodIndependent:x.periodIndependent===true,projectScope:str(x.projectScope||x.projectId||x.scope?.projectId),sourceSystem:str(x.sourceSystem||x.sourceNamespace)})),
    hr:{visits:hrv.length,current:hrv.filter(v=>str(v.periodKey)==='2026-09').length,periods:uniq(hrv.map(v=>v.periodKey)).sort()},
    durableVisits:{visits:fsv.length,current:fsv.filter(v=>str(v.periodId)==='cinepolis-2026-09').length},
    membershipCount:memberships.length
  };
}

const pairwise={};
for(const [group,ids] of Object.entries(targetGroups)){
  pairwise[group]=[];
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
    const a=profileById.get(ids[i]),b=profileById.get(ids[j]),ta=new Set(techTokens(a)),tb=new Set(techTokens(b));
    const shared=[...ta].filter(x=>tb.has(x)&&x!==ids[i]&&x!==ids[j]).sort();
    pairwise[group].push({a:fp(ids[i]),b:fp(ids[j]),sameNormalizedName:identity[ids[i]]?.profile?.nameKey&&identity[ids[i]]?.profile?.nameKey===identity[ids[j]]?.profile?.nameKey,sharedTechnicalTokens:shared.map(fp),autoMergeAllowed:shared.length>0});
  }
}

const linkConflicts=[];
for(const l of links){
  const canonical=canonicalOf(l);if(!canonical)continue;
  for(const token of sourceTokens(l)){
    const cands=uniq(crosswalk.filter(x=>crossSource(x)===token||techTokens(x).includes(token)).map(crossCanonical));
    if(cands.length===1&&cands[0]!==canonical)linkConflicts.push({linkFp:fp(l.docId),sourceFp:fp(token),linkCanonicalFp:fp(canonical),crosswalkCanonicalFp:fp(cands[0]),authorityType:str(l.authorityType||l.authority?.type),status:str(l.status||l.state)});
  }
}
const depazSource='shopper_gt_018ca3e794';
const depazLinks=links.filter(l=>sourceTokens(l).includes(depazSource)).map(l=>({linkFp:fp(l.docId),canonical:canonicalOf(l),canonicalFp:fp(canonicalOf(l)),authorityType:str(l.authorityType||l.authority?.type),status:str(l.status||l.state),periodIndependent:l.periodIndependent===true,projectScope:str(l.projectScope||l.projectId||l.scope?.projectId)}));
const depazCrosswalk=uniq(crosswalk.filter(x=>crossSource(x)===depazSource||techTokens(x).includes(depazSource)).map(crossCanonical));

const currentHrIds=new Set(hrShoppers.map(x=>str(x.id||x.shopperId)).filter(Boolean));
const targetCurrentHr=[...targetIds].filter(id=>currentHrIds.has(id));
const exactNameCollisions={};
for(const [group,ids] of Object.entries(targetGroups)){
  const names=ids.map(id=>identity[id]?.profile?.nameKey||'').filter(Boolean);
  exactNameCollisions[group]={ids:ids.map(fp),nameKeys:uniq(names),allSameName:names.length===ids.length&&new Set(names).size===1};
}

const classifications=[];
if(linkConflicts.length)classifications.push('EXACT_PROVIDER_LINK_CONFLICTS_WITH_CURRENT_CROSSWALK');
if(depazLinks.some(x=>x.canonical&&x.canonical!==depazSource))classifications.push('DEPAZ_SOURCE_HAS_EXPLICIT_CROSS_CANONICAL_LINK');
for(const [g,rows] of Object.entries(pairwise))if(rows.some(x=>x.sameNormalizedName&&!x.autoMergeAllowed))classifications.push('NAME_COLLISION_WITHOUT_EXACT_TECHNICAL_MERGE_AUTHORITY_'+g.toUpperCase());
if(!classifications.length)classifications.push('NO_PROVEN_EXACT_IDENTITY_DEFECT_FROM_TARGET_SET');

const result={
  schemaVersion:'cxorbia.prei4.admin003.identity-forensic-readonly.v1',
  decision:'PASS_PREI4_ADMIN_003_IDENTITY_DIAGNOSTIC',
  hrRevision:EXPECTED_HR,
  counts:{profiles:profiles.length,users:users.length,crosswalk:crosswalk.length,links:links.length,hrShoppers:hrShoppers.length,hrVisits:hrVisits.length,durableVisits:visits.length,targetCurrentHr:targetCurrentHr.length},
  classifications:[...new Set(classifications)],
  targetGroups:Object.fromEntries(Object.entries(targetGroups).map(([k,v])=>[k,v.map(fp)])),
  identity,pairwise,exactNameCollisions,linkConflicts,
  depaz:{sourceFp:fp(depazSource),links:depazLinks,crosswalkCanonicalFps:depazCrosswalk.map(fp)},
  safety:{readOnly:true,firestoreWrites:0,authWrites:0,hrWrites:0,deploys:0,fuzzyMatching:false,nameMatching:false,production:false}
};
write('result.json',result);
console.log(JSON.stringify({decision:result.decision,counts:result.counts,classifications:result.classifications,depaz:result.depaz,linkConflicts:result.linkConflicts,pairwise:result.pairwise},null,2));
