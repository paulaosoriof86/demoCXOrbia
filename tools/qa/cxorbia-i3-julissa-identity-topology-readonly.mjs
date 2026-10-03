#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const TENANT=process.env.TENANT_ID||'tya';
const PROJECT_ID=process.env.PROJECT_ID||'cinepolis';
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=process.env.JULISSA_OUT||'.tmp/i3-julissa-topology';
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const db=getFirestore(),auth=getAuth();
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT_ID);
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const [profiles,members,cross,links,visits]=await Promise.all([
  docs(tenant.collection('shoppers')),
  docs(tenant.collection('users')),
  docs(tenant.collection('shopperIdentityCrosswalk')),
  docs(tenant.collection('shopperIdentityLinks')),
  docs(project.collection('visits'))
]);
const profileName=p=>str(p.nombre||p.displayName||p.fullName||[p.firstName,p.lastName].filter(Boolean).join(' '));
const targetProfiles=profiles.filter(p=>/\bjulissa\b/i.test(norm(profileName(p)))||/\bjulissa\b/i.test(norm(p.firstName)));
const tokens=new Set();
for(const p of targetProfiles){
  for(const v of [p.id,p.shopperId,p.canonicalShopperId,...arr(p.sourceShopperIds),...arr(p.exactAliases),...arr(p.legacyLiveShopperIds),...arr(p.aliases)].map(str).filter(Boolean))tokens.add(v);
}
const crossMatches=cross.filter(x=>[x.id,x.shopperId,x.canonicalShopperId,x.sourceStableKey,x.sourceShopperId].map(str).some(v=>tokens.has(v)));
for(const x of crossMatches)for(const v of [x.id,x.shopperId,x.canonicalShopperId,x.sourceStableKey,x.sourceShopperId].map(str).filter(Boolean))tokens.add(v);
const linkTokens=x=>[x.id,x.canonicalShopperId,x.canonicalId,x.shopperId,x.profileId,x.sourceIdentityKey,x.sourceShopperId,x.sourceSubjectId,...arr(x.sourceAliases),...arr(x.exactAliases),...arr(x.identityAliases),...arr(x.aliases)].map(str).filter(Boolean);
const linkMatches=links.filter(x=>linkTokens(x).some(v=>tokens.has(v)));
for(const x of linkMatches)for(const v of linkTokens(x))tokens.add(v);
const memberMatches=members.filter(m=>tokens.has(str(m.shopperId))||/\bjulissa\b/i.test(norm(m.displayName||m.name||m.visibleLogin||m.username||'')));
const authRows=[];
for(const m of memberMatches){
  try{
    const u=await auth.getUser(m.id);
    authRows.push({uid:m.id,shopperId:str(m.shopperId),active:m.active===true,role:str(m.role),authNamespace:str(m.authNamespace),visibleLogin:str(m.visibleLogin||m.username),emailPresent:!!u.email,disabled:u.disabled===true,claims:u.customClaims||{}});
  }catch(e){authRows.push({uid:m.id,shopperId:str(m.shopperId),active:m.active===true,role:str(m.role),authNamespace:str(m.authNamespace),error:str(e?.code||e?.message||e)});}
}
const visitMatches=visits.filter(v=>tokens.has(str(v.shopperId))||/\bjulissa\b/i.test(norm(v.shopper||v.evaluador||v.evaluator||'')));
const hrRes=await fetch(HOST+'/api/'+TENANT+'/'+PROJECT_ID+'/hr-live?format=json&julissatopology='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrRes.ok)throw new Error('PROVIDER_FAILURE:JULISSA_HR_HTTP_'+hrRes.status);
const hrBody=await hrRes.json(),hr=hrBody.snapshot||hrBody.data||hrBody;
const hrProfiles=arr(hr.shoppers).filter(p=>/\bjulissa\b/i.test(norm(profileName(p))));
const hrVisits=arr(hr.visits).filter(v=>tokens.has(str(v.shopperId))||/\bjulissa\b/i.test(norm(v.shopper||v.evaluador||v.evaluator||'')));
const slimProfile=p=>({id:str(p.id||p.shopperId),name:profileName(p),firstName:str(p.firstName),lastName:str(p.lastName),visibleLogin:str(p.visibleLogin||p.username||p.user),whatsappPresent:!!str(p.whatsapp||p.phone),emailPresent:!!str(p.email),city:str(p.ciudad),country:str(p.pais||p.country),active:p.active,status:str(p.status||p.estado),canonicalShopperId:str(p.canonicalShopperId),sourceShopperIds:arr(p.sourceShopperIds).map(str),exactAliases:arr(p.exactAliases).map(str),legacyLiveShopperIds:arr(p.legacyLiveShopperIds).map(str),identityAuthority:str(p.identityAuthority),identityReviewRequired:p.identityReviewRequired===true});
const result={
  schemaVersion:'cxorbia.i3.julissa.identity-topology.readonly.v1',
  decision:'PASS_JULISSA_IDENTITY_TOPOLOGY_READONLY',
  sourceRevision:str(hrBody.revision||hrBody._runtime?.revision||hr.sourceRevision),
  profiles:targetProfiles.map(slimProfile),
  members:memberMatches.map(m=>({uid:m.id,shopperId:str(m.shopperId),active:m.active===true,role:str(m.role),authNamespace:str(m.authNamespace),visibleLogin:str(m.visibleLogin||m.username),identityState:str(m.identityState),supersededByShopperId:str(m.supersededByShopperId)})),
  auth:authRows,
  crosswalk:crossMatches.map(x=>({id:str(x.id),shopperId:str(x.shopperId),canonicalShopperId:str(x.canonicalShopperId),sourceStableKey:str(x.sourceStableKey),sourceShopperId:str(x.sourceShopperId),identityMode:str(x.identityMode),status:str(x.status||x.state),active:x.active})),
  links:linkMatches.map(x=>({id:str(x.id),canonicalShopperId:str(x.canonicalShopperId||x.canonicalId||x.shopperId||x.profileId),sourceIdentityKey:str(x.sourceIdentityKey),sourceShopperId:str(x.sourceShopperId),sourceSubjectId:str(x.sourceSubjectId),sourceAliases:arr(x.sourceAliases).map(str),exactAliases:arr(x.exactAliases).map(str),authorityType:str(x.authorityType||x.authority?.type),status:str(x.status||x.state)})),
  durableVisits:visitMatches.map(v=>({id:str(v.id||v.visitId),hrRowId:str(v.hrRowId),periodId:str(v.periodId),shopperId:str(v.shopperId),branch:str(v.sucursal),state:str(v.estado||v.status),assignmentSource:str(v.assignmentSource)})),
  hrProfiles:hrProfiles.map(slimProfile),
  hrVisits:hrVisits.map(v=>({id:str(v.id||v.visitId),hrRowId:str(v.hrRowId),periodKey:str(v.periodKey),shopperId:str(v.shopperId),shopper:str(v.shopper||v.evaluador||v.evaluator),branch:str(v.sucursal),state:str(v.estado||v.status)})),
  counts:{profiles:targetProfiles.length,members:memberMatches.length,authRows:authRows.length,crosswalk:crossMatches.length,links:linkMatches.length,durableVisits:visitMatches.length,hrProfiles:hrProfiles.length,hrVisits:hrVisits.length},
  writes:0,production:false
};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
