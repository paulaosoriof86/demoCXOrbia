#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const INPUT=String(process.env.VRM239_INPUT||'').trim();
const OUT=String(process.env.VRM239_OUT||'.tmp/i3-vrm239-readiness').trim();
const TARGETS=['shopper_hn_9a6963fdf6','shopper_gt_8cface989a','shp-b2e3d7bef69b','TYA_GT_0C0BA8856E'];
const REVIEW_ONLY='shopper_hn_9a6963fdf6';
const NONCURRENT_NAMELESS='shopper_gt_8cface989a';
const CLAIMS_STALE='shp-b2e3d7bef69b';
const LOGIN_DRIFT='TYA_GT_0C0BA8856E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))],norm=v=>str(v).toLowerCase();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const internalEmail=login=>sha(TENANT+'\0shopper\0'+norm(login)).slice(0,48)+'@auth.cxorbia.invalid';
const collisionLogin=(base,sid,n)=>base+'.'+sha(TENANT+'\0'+sid).slice(0,n);
const terminal=/^(?:submitted|submitida|realizada|completed|completada|liquidated|liquidada|paid|pagada|cancelled|cancelada|rejected|rechazada|certificada|certified|closed|cerrada)$/i;
fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm239.residual-closure-readiness.v1',decision:'HOLD',targets:{},aliasRemap:{},hrRevision:null,writes:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
const fail=(classification,code,extra={})=>{Object.assign(result,{decision:'FAIL_VRM239_RESIDUAL_CLOSURE_READINESS',classification,code,...extra});save();console.log(JSON.stringify(result,null,2));process.exit(2);};
const need=(ok,classification,code,extra={})=>{if(!ok)fail(classification,code,extra);};
need(INPUT&&fs.existsSync(INPUT),'ENVIRONMENT_FAILURE','VRM239_ROOT_DIAGNOSTIC_INPUT_MISSING');
const diag=JSON.parse(fs.readFileSync(INPUT,'utf8'));
need(diag.decision==='PASS_VRM217_219_POPULATION_ROOT_DIAGNOSTIC','SOURCE_FAILURE','VRM239_ROOT_DIAGNOSTIC_NOT_PASS');
need(Number(diag.visits?.ambiguousAuthorityGroups||0)===0,'MAPPING_FAILURE','VRM239_VISIT_AUTHORITY_AMBIGUOUS');
need(Number(diag.visits?.authoritativeAliasRows||0)===127,'MAPPING_FAILURE','VRM239_AUTHORITATIVE_ALIAS_COUNT_DRIFT',{observed:diag.visits?.authoritativeAliasRows});
need(Number(diag.visits?.historicalAliasRows||0)===122,'MAPPING_FAILURE','VRM239_HISTORICAL_ALIAS_COUNT_DRIFT',{observed:diag.visits?.historicalAliasRows});

const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&vrm239='+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
need(hrRes.ok,'PROVIDER_FAILURE','VRM239_HR_HTTP_'+hrRes.status);
const hrBody=await hrRes.json(),hr=hrBody.snapshot||hrBody.data||hrBody,hrRevision=str(hrBody.revision||hrBody._runtime?.revision||hr.sourceRevision);
need(hrRevision===EXPECTED_HR,'PROVIDER_FAILURE','VRM239_HR_REVISION_DRIFT',{observed:hrRevision,expected:EXPECTED_HR});
result.hrRevision=hrRevision;

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const [members,profiles,crosswalk,reviews,reviewQueue,visits,posts,reservations,certs,liqs,payments]=await Promise.all([
 docs(tenant.collection('users')),docs(tenant.collection('shoppers')),docs(tenant.collection('shopperIdentityCrosswalk')),
 docs(tenant.collection('shopperIdentityReviews')),docs(tenant.collection('reviewQueue')),docs(project.collection('visits')),
 docs(project.collection('postulations')),docs(project.collection('reservations')),docs(project.collection('certifications')),
 docs(project.collection('liquidations')),docs(tenant.collection('paymentReconciliations'))
]);
const profileById=new Map(profiles.map(x=>[x.id,x])),crossById=new Map(crosswalk.map(x=>[x.id,x]));
const sourceIdsFor=sid=>new Set([sid,...crosswalk.filter(c=>str(c.shopperId||c.canonicalShopperId)===sid).flatMap(c=>[c.id,c.sourceStableKey,c.sourceShopperId]).map(str).filter(Boolean)]);
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
const arrayFields=['shopperIds','candidateShopperIds'];
const refs=(row,set)=>ownerFields.some(k=>set.has(str(row?.[k])))||arrayFields.some(k=>arr(row?.[k]).some(v=>set.has(str(v))));
const domains={visits,postulations:posts,reservations,certifications:certs,liquidations:liqs,paymentReconciliations:payments};
const hrProfiles=arr(hr.shoppers),hrVisits=arr(hr.visits);

for(const sid of TARGETS){
  const profile=profileById.get(sid)||null,cross=crossById.get(sid)||null,memberRows=members.filter(m=>str(m.shopperId)===sid),activeMembers=memberRows.filter(m=>m.active===true&&!['inactive','superseded','retired'].includes(norm(m.status))&&norm(m.identityState)!=='superseded_exact_alias');
  let authUser=null;if(activeMembers.length===1){try{authUser=await auth.getUser(activeMembers[0].id);}catch(_){}}
  const claims=authUser?.customClaims||{},claimProjects=uniq([...(arr(claims.projectIds)),claims.projectId]);
  const rule=profile?ShopperCredentialRule.shopperCredentialRule(profile):{ok:false,reason:'PROFILE_MISSING'};
  const visibleLogin=norm(activeMembers[0]?.visibleLogin||profile?.visibleLogin||profile?.username||profile?.user);
  const approvedLogins=rule?.ok?[rule.login,...[4,6,8].map(n=>collisionLogin(rule.login,sid,n))]:[];
  const ids=sourceIdsFor(sid);
  const hrIdentity=hrProfiles.some(x=>ids.has(str(x.shopperId||x.id)));
  const currentHrVisits=hrVisits.filter(v=>ids.has(str(v.shopperId)));
  const domainCounts={},activeBlocking=[];
  for(const [name,rows] of Object.entries(domains)){
    const owned=rows.filter(r=>refs(r,ids));domainCounts[name]=owned.length;
    if(['visits','postulations','reservations','liquidations'].includes(name)){
      const active=owned.filter(r=>!terminal.test(str(r.status||r.estado||r.state)));if(active.length)activeBlocking.push({domain:name,count:active.length});
    }
  }
  if(hrIdentity)activeBlocking.push({domain:'hr_current_identity',count:1});
  if(currentHrVisits.length)activeBlocking.push({domain:'hr_current_assignments',count:currentHrVisits.length});
  const reviewRows=[...reviews,...reviewQueue].filter(r=>[r.shopperId,r.sourceShopperId,r.canonicalShopperId,...arr(r.shopperIds),...arr(r.candidateShopperIds)].some(v=>ids.has(str(v))));
  const activeReviewRows=reviewRows.filter(r=>!['resolved','resolved_distinct','resolved_merged','retired','closed'].includes(norm(r.status||r.state)));
  const claimProjection={tenantId:str(claims.tenantId),role:norm(claims.role),authNamespace:norm(claims.authNamespace),shopperId:str(claims.shopperId),projectIds:claimProjects,disabled:authUser?.disabled===true};
  const claimMismatches=[];
  if(str(claims.tenantId)!==TENANT)claimMismatches.push('tenantId');
  if(norm(claims.role)!=='shopper')claimMismatches.push('role');
  if(norm(claims.authNamespace)!=='shopper')claimMismatches.push('authNamespace');
  if(str(claims.shopperId)!==sid)claimMismatches.push('shopperId');
  if(!claimProjects.includes(PROGRAM))claimMismatches.push('projectIds');
  const item={shopperId:sid,currentHrIdentity:hrIdentity,currentHrAssignedVisits:currentHrVisits.length,profilePresent:!!profile,crosswalkPresent:!!cross,activeMemberships:activeMembers.length,authPresent:!!authUser,credentialRuleOk:rule?.ok===true,credentialReason:rule?.reason||null,visibleLogin,approvedLogins,visibleLoginApproved:!!visibleLogin&&approvedLogins.includes(visibleLogin),authEmailMatchesVisibleLogin:!!authUser&&!!visibleLogin&&norm(authUser.email)===norm(internalEmail(visibleLogin)),claims:claimProjection,claimMismatches,domainCounts,blocking:activeBlocking,safeToRetire:activeBlocking.length===0,activeReviewRows:activeReviewRows.length};
  if(sid===REVIEW_ONLY)item.expectedDisposition=hrIdentity&&!rule?.ok?'EXCLUDE_FROM_AUTH_ELIGIBLE_POPULATION_PRESERVE_REVIEW_ONLY':'REVIEW_ONLY_AUTHORITY_DRIFT';
  if(sid===NONCURRENT_NAMELESS)item.expectedDisposition=!hrIdentity&&!rule?.ok&&activeBlocking.length===0?'SAFE_PROVIDER_RETIRE':'IDENTITY_REVIEW_KEEP_FAIL_CLOSED';
  if(sid===CLAIMS_STALE)item.expectedDisposition=claimMismatches.length===1&&claimMismatches[0]==='authNamespace'?'BOUNDED_AUTH_NAMESPACE_CLAIM_REPAIR':'AUTH_CLAIMS_REPAIR_REQUIRES_REVIEW';
  if(sid===LOGIN_DRIFT)item.expectedDisposition=rule?.ok&&activeMembers.length===1&&!!authUser&&!approvedLogins.includes(visibleLogin)?'DURABLE_CREDENTIAL_NORMALIZE_VISIBLE_LOGIN':'LOGIN_DRIFT_REQUIRES_REVIEW';
  result.targets[sid]=item;
}

const rows=arr(diag.visits?.authoritativeAliasDetails),groups=new Map();
for(const row of rows){
  const canonical=str(row.canonicalTarget),alias=str(row.sourceShopperId),visitKey=str(row.visitKey);
  if(!groups.has(canonical))groups.set(canonical,{canonicalShopperId:canonical,aliases:new Map(),visitKeys:[]});
  const g=groups.get(canonical);if(!g.aliases.has(alias))g.aliases.set(alias,[]);g.aliases.get(alias).push(visitKey);g.visitKeys.push(visitKey);
}
const groupOut=[];
for(const g of groups.values()){
  const canonProfile=profileById.get(g.canonicalShopperId),canonMembers=members.filter(m=>str(m.shopperId)===g.canonicalShopperId&&m.active===true&&!['inactive','superseded','retired'].includes(norm(m.status))&&norm(m.identityState)!=='superseded_exact_alias');
  let canonAuth=null;if(canonMembers.length===1){try{canonAuth=await auth.getUser(canonMembers[0].id);}catch(_){}}
  const aliasRows=[...g.aliases.entries()].map(([alias,visitKeys])=>{const c=crossById.get(alias)||{};return{aliasShopperId:alias,visitCount:visitKeys.length,visitKeys,profilePresent:profileById.has(alias),crosswalkPresent:crossById.has(alias),crosswalkCanonical:str(c.shopperId||c.canonicalShopperId),basis:rows.find(r=>str(r.sourceShopperId)===alias&&str(r.canonicalTarget)===g.canonicalShopperId)?.basis||''};});
  const executable=!!canonProfile&&canonMembers.length===1&&!!canonAuth&&canonAuth.disabled!==true&&aliasRows.every(a=>a.crosswalkPresent&&a.crosswalkCanonical===g.canonicalShopperId&&/trusted_identity_link/.test(a.basis))&&g.visitKeys.length<=350;
  groupOut.push({canonicalShopperId:g.canonicalShopperId,canonicalProfilePresent:!!canonProfile,activeCanonicalMemberships:canonMembers.length,canonicalAuthPresent:!!canonAuth,canonicalAuthDisabled:canonAuth?.disabled===true,aliasCount:aliasRows.length,visitCount:g.visitKeys.length,aliases:aliasRows,executable});
}
result.aliasRemap={canonicalGroups:groupOut.length,aliases:groupOut.reduce((n,g)=>n+g.aliasCount,0),authoritativeVisitRows:groupOut.reduce((n,g)=>n+g.visitCount,0),historicalRowsPreserved:Number(diag.visits?.historicalAliasRows||0),allGroupsExecutable:groupOut.every(g=>g.executable),groups:groupOut};
need(result.targets[REVIEW_ONLY]?.expectedDisposition==='EXCLUDE_FROM_AUTH_ELIGIBLE_POPULATION_PRESERVE_REVIEW_ONLY','MAPPING_FAILURE','VRM239_REVIEW_ONLY_DISPOSITION_UNPROVEN',{target:result.targets[REVIEW_ONLY]});
need(['SAFE_PROVIDER_RETIRE','IDENTITY_REVIEW_KEEP_FAIL_CLOSED'].includes(result.targets[NONCURRENT_NAMELESS]?.expectedDisposition),'MAPPING_FAILURE','VRM239_NONCURRENT_NAMELESS_DISPOSITION_UNPROVEN');
need(result.targets[CLAIMS_STALE]?.expectedDisposition==='BOUNDED_AUTH_NAMESPACE_CLAIM_REPAIR','AUTH_FAILURE','VRM239_CLAIMS_DELTA_NOT_BOUNDED',{target:result.targets[CLAIMS_STALE]});
need(result.targets[LOGIN_DRIFT]?.expectedDisposition==='DURABLE_CREDENTIAL_NORMALIZE_VISIBLE_LOGIN','MAPPING_FAILURE','VRM239_LOGIN_DELTA_NOT_BOUNDED',{target:result.targets[LOGIN_DRIFT]});
need(result.aliasRemap.canonicalGroups===18&&result.aliasRemap.aliases===29&&result.aliasRemap.authoritativeVisitRows===127&&result.aliasRemap.allGroupsExecutable,'MAPPING_FAILURE','VRM239_ALIAS_REMAP_NOT_EXECUTABLE',{aliasRemap:{canonicalGroups:result.aliasRemap.canonicalGroups,aliases:result.aliasRemap.aliases,authoritativeVisitRows:result.aliasRemap.authoritativeVisitRows,allGroupsExecutable:result.aliasRemap.allGroupsExecutable}});
result.decision='PASS_VRM239_RESIDUAL_CLOSURE_READINESS';save();console.log(JSON.stringify(result,null,2));
