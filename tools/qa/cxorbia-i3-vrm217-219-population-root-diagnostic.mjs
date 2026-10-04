#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';
import {CREDENTIAL_PASSWORD_PROOF_VERSION,DURABLE_CREDENTIAL_SWEEP_VERSION} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const OUT=String(process.env.VRM217_OUT||'.tmp/i3-vrm217-219-root').trim();
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
const norm=v=>str(v).toLowerCase(),sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const internalEmail=login=>sha(TENANT+'\0shopper\0'+norm(login)).slice(0,48)+'@auth.cxorbia.invalid';
const visitKey=v=>str(v.hrRowId||v.visitKey||v.id||v.visitId);
const activeMember=m=>m.active===true&&norm(m.role)==='shopper'&&norm(m.authNamespace)==='shopper'&&arr(m.projectIds).map(str).includes(PROGRAM)&&!['inactive','superseded'].includes(norm(m.status))&&norm(m.identityState)!=='superseded_exact_alias';
const ACTIVE_LINK_STATES=new Set(['active','confirmed','approved','materialized']);
const TRUSTED_AUTHORITIES=new Set(['provider_exact','tenant_adjudication','platform_created','migrated_exact']);
const ID_KEYS=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId','sourceIdentityKey','sourceSubjectId'];
const ALIAS_KEYS=['exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases'];
const flatten=v=>{const out=[];const walk=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach(walk);return;}if(typeof x==='object'){Object.values(x).forEach(walk);return;}const s=str(x);if(s)out.push(s);};walk(v);return out;};
const linkTokens=l=>uniq([...ID_KEYS.flatMap(k=>flatten(l?.[k])),...ALIAS_KEYS.flatMap(k=>flatten(l?.[k]))]);
const fp=(kind,v)=>sha(kind+'\0'+String(v)).slice(0,20);
const countBy=(xs,fn)=>xs.reduce((o,x)=>(o[fn(x)]=(o[fn(x)]||0)+1,o),{});

fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm217-219.population-root.readonly.v1',decision:'HOLD',tenantId:TENANT,projectId:PROGRAM,expectedHrRevision:EXPECTED_HR,writes:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('SOURCE_FAILURE:VRM217_HR_REVISION_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
async function listAuth(){const out=[];let token;do{const p=await auth.listUsers(1000,token);out.push(...p.users);token=p.pageToken;}while(token);return out;}

const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&vrm217='+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrRes.ok)throw new Error('PROVIDER_FAILURE:VRM217_HR_HTTP_'+hrRes.status);
const hrBody=await hrRes.json(),hr=hrBody.snapshot||hrBody.data||hrBody,hrRevision=str(hrBody.revision||hrBody._runtime?.revision||hr.sourceRevision);
if(hrRevision!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:VRM217_HR_DRIFT_'+hrRevision);
const [membersAll,profiles,crosswalk,links,durableVisits,payments,certs,liqs,posts,reservations,authUsers]=await Promise.all([
  docs(tenant.collection('users')),docs(tenant.collection('shoppers')),docs(tenant.collection('shopperIdentityCrosswalk')),docs(tenant.collection('shopperIdentityLinks')),
  docs(project.collection('visits')),docs(tenant.collection('paymentReconciliations')),docs(project.collection('certifications')),docs(project.collection('liquidations')),docs(project.collection('postulations')),docs(project.collection('reservations')),listAuth()
]);
const members=membersAll.filter(activeMember),activeByShopper=new Map(),profileById=new Map(profiles.map(x=>[x.id,x])),crossById=new Map(crosswalk.map(x=>[x.id,x])),authByUid=new Map(authUsers.map(x=>[x.uid,x])),authByEmail=new Map(authUsers.filter(x=>str(x.email)).map(x=>[norm(x.email),x]));
for(const m of members){const sid=str(m.shopperId);if(!activeByShopper.has(sid))activeByShopper.set(sid,[]);activeByShopper.get(sid).push(m);}
const activeIds=new Set(activeByShopper.keys()),hrSourceIds=new Set([...arr(hr.shoppers),...arr(hr.visits)].map(x=>str(x.shopperId||x.id)).filter(Boolean));

const trustedMap=new Map(),mapConflicts=[];
for(const l of links){
  const status=norm(l.status||l.state),authority=norm(l.authorityType||l.authority?.type),scope=str(l.projectScope||l.projectId||'*'),canonical=str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId);
  const eligible=str(l.tenantId)===TENANT&&ACTIVE_LINK_STATES.has(status)&&TRUSTED_AUTHORITIES.has(authority)&&canonical&&(scope==='*'||scope==='tenant'||scope===PROGRAM)&&!(l.periodKey||l.periodId||l.periodScope);
  if(!eligible)continue;
  for(const token of linkTokens(l)){
    if(trustedMap.has(token)&&trustedMap.get(token)!==canonical)mapConflicts.push({tokenFingerprint:fp('identity',token),a:trustedMap.get(token),b:canonical});
    else trustedMap.set(token,canonical);
  }
}
function canonicalEvidence(id){
  id=str(id);const c=crossById.get(id)||{},p=profileById.get(id)||{};
  const candidates=[];
  const crossTarget=str(c.shopperId||c.canonicalShopperId);
  if(crossTarget&&crossTarget!==id)candidates.push({target:crossTarget,basis:'crosswalk:'+norm(c.identityMode||c.migrationAuthorityType||'mapped')});
  const profileTarget=str(p.supersededByShopperId||p.canonicalShopperId);
  if(profileTarget&&profileTarget!==id)candidates.push({target:profileTarget,basis:'profile_superseded'});
  const linkTarget=str(trustedMap.get(id));
  if(linkTarget&&linkTarget!==id)candidates.push({target:linkTarget,basis:'trusted_identity_link'});
  const targets=uniq(candidates.map(x=>x.target));
  if(targets.length>1)return{target:'',basis:'CONFLICT',conflict:targets};
  return{target:targets[0]||id,basis:candidates.map(x=>x.basis).join('+')||'self'};
}

const memberRows=[],credentialCandidates=[],aliasActive=[],holds=[];
for(const m of members){
  const sid=str(m.shopperId),p=profileById.get(sid),c=crossById.get(sid),u=authByUid.get(m.id),ce=canonicalEvidence(sid);
  const row={shopperId:sid,uidFingerprint:fp('uid',m.id),canonicalTarget:ce.target,canonicalBasis:ce.basis,currentHrSource:hrSourceIds.has(sid),profilePresent:!!p,crosswalkPresent:!!c,authPresent:!!u};
  if(ce.basis==='CONFLICT'){row.classification='IDENTITY_MAPPING_CONFLICT';holds.push(row);memberRows.push(row);continue;}
  if(ce.target!==sid){row.classification='EXACT_ALIAS_ACTIVE_PRINCIPAL';aliasActive.push(row);memberRows.push(row);continue;}
  const rule=p?ShopperCredentialRule.shopperCredentialRule(p):{ok:false,reason:'PROFILE_MISSING'};
  const login=norm(m.visibleLogin||p?.visibleLogin||p?.username||p?.user);
  const expectedEmail=rule.ok&&login?internalEmail(login):'';
  const claims=u?.customClaims||{},projects=uniq([...(arr(claims.projectIds)),claims.projectId]);
  const claimExact=!!u&&str(claims.tenantId)===TENANT&&norm(claims.role)==='shopper'&&norm(claims.authNamespace)==='shopper'&&str(claims.shopperId)===sid&&projects.includes(PROGRAM)&&u.disabled!==true;
  const emailExact=!!u&&!!expectedEmail&&norm(u.email)===norm(expectedEmail);
  const proofCurrent=str(m.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION&&str(m.credentialPasswordRuleVersion||ShopperCredentialRule.CREDENTIAL_RULE_VERSION)===ShopperCredentialRule.CREDENTIAL_RULE_VERSION;
  const sweepCurrent=str(m.credentialSweepVersion)===DURABLE_CREDENTIAL_SWEEP_VERSION;
  Object.assign(row,{credentialRuleOk:rule.ok,credentialReason:rule.reason||null,visibleLogin:login?fp('login',login):null,claimsExact:claimExact,emailExact,passwordProofCurrent:proofCurrent,sweepCurrent});
  if(!p||!c||str(c.shopperId||c.canonicalShopperId)!==sid||!u||!claimExact||!rule.ok){row.classification='CREDENTIAL_OR_CANONICAL_HOLD';holds.push(row);}
  else{row.classification=(emailExact&&proofCurrent&&sweepCurrent)?'CREDENTIAL_CURRENT':'CREDENTIAL_NORMALIZE_CANDIDATE';if(row.classification==='CREDENTIAL_NORMALIZE_CANDIDATE')credentialCandidates.push({...row,baseLogin:rule.login});}
  memberRows.push(row);
}

const baseGroups=new Map();
for(const row of credentialCandidates){if(!baseGroups.has(row.baseLogin))baseGroups.set(row.baseLogin,[]);baseGroups.get(row.baseLogin).push(row);}
const collisionPlan=[];
for(const [baseLogin,rows] of baseGroups){
  const occupant=authByEmail.get(norm(internalEmail(baseLogin))),holderSid=str(occupant?.customClaims?.shopperId);
  const ids=uniq(rows.map(x=>x.shopperId));
  if(ids.length>1||occupant&&!ids.includes(holderSid))collisionPlan.push({baseLoginFingerprint:fp('login',baseLogin),candidateShopperIds:ids,occupantShopperId:holderSid||null,occupantIsCandidate:ids.includes(holderSid),policy:'DETERMINISTIC_TECHNICAL_SUFFIX'});
}
const currentHrReconcileCandidates=credentialCandidates.filter(x=>x.currentHrSource).map(x=>x.shopperId);
const durableSweepCandidates=credentialCandidates.filter(x=>!x.currentHrSource).map(x=>x.shopperId);

const hrAssignmentErrors=[];
for(const v of arr(hr.visits)){
  const raw=str(v.shopperId);if(!raw)continue;const ce=canonicalEvidence(raw),target=ce.target;
  if(!target||!activeIds.has(target))hrAssignmentErrors.push({hrRowId:str(v.hrRowId),sourceShopperId:raw,canonicalTarget:target||null,basis:ce.basis,profilePresent:profileById.has(raw),crosswalkPresent:crossById.has(raw)});
}

const visitGroups=new Map();
for(const v of durableVisits){const k=visitKey(v);if(!visitGroups.has(k))visitGroups.set(k,[]);visitGroups.get(k).push(v);}
let duplicateGroups=0,ambiguousAuthorityGroups=0,historicalRows=0,historicalAliasRows=0,authoritativeAliasRows=0;
const authoritativeAliasDetails=[];
for(const [key,rows] of visitGroups){
  if(rows.length>1)duplicateGroups++;
  let authoritative=rows.filter(x=>x.id===key);
  if(authoritative.length!==1){const current=rows.filter(x=>str(x.hrSourceRevision)===EXPECTED_HR);if(current.length===1)authoritative=current;else{ambiguousAuthorityGroups++;continue;}}
  const authRow=authoritative[0],hist=rows.filter(x=>x.id!==authRow.id);historicalRows+=hist.length;
  for(const h of hist){const ce=canonicalEvidence(str(h.shopperId));if(ce.target&&ce.target!==str(h.shopperId))historicalAliasRows++;}
  const sid=str(authRow.shopperId),ce=canonicalEvidence(sid);
  if(ce.target&&ce.target!==sid){authoritativeAliasRows++;authoritativeAliasDetails.push({visitKey:key,sourceShopperId:sid,canonicalTarget:ce.target,basis:ce.basis});}
}
function domainAliasPlan(rows,name){
  const out=[];
  for(const d of rows){const sid=str(d.shopperId);if(!sid)continue;const ce=canonicalEvidence(sid);if(ce.target&&ce.target!==sid)out.push({collection:name,id:d.id,sourceShopperId:sid,canonicalTarget:ce.target,basis:ce.basis});}
  return out;
}
const paymentAlias=domainAliasPlan(payments,'paymentReconciliations'),certAlias=domainAliasPlan(certs,'certifications'),liqAlias=domainAliasPlan(liqs,'liquidations'),postAlias=domainAliasPlan(posts,'postulations'),reservationAlias=domainAliasPlan(reservations,'reservations');

result.hrRevision=hrRevision;
result.population={activeMemberships:members.length,activeCanonicalIds:activeIds.size,memberRows:memberRows.length};
result.identity={exactAliasActivePrincipals:aliasActive.length,mappingConflicts:mapConflicts.length,holds:holds.length,aliasRows:aliasActive,holdRows:holds};
result.credentials={normalizeCandidates:credentialCandidates.length,currentHrReconcileCandidates:currentHrReconcileCandidates.length,durableSweepCandidates:durableSweepCandidates.length,currentHrReconcileShopperIds:currentHrReconcileCandidates,durableSweepShopperIds:durableSweepCandidates,collisionGroups:collisionPlan.length,collisionPlan};
result.hrAssignments={assigned:arr(hr.visits).filter(x=>str(x.shopperId)).length,unresolved:hrAssignmentErrors.length,rows:hrAssignmentErrors};
result.visits={durableRows:durableVisits.length,uniqueVisitKeys:visitGroups.size,duplicateGroups,historicalRows,ambiguousAuthorityGroups,authoritativeAliasRows,historicalAliasRows,authoritativeAliasDetails};
result.operationalAliasReferences={paymentReconciliations:paymentAlias.length,certifications:certAlias.length,liquidations:liqAlias.length,postulations:postAlias.length,reservations:reservationAlias.length,rows:[...paymentAlias,...certAlias,...liqAlias,...postAlias,...reservationAlias]};
result.repairPlan={
  currentHrProviderReconcile:{eligible:currentHrReconcileCandidates.length,owner:'cxorbia-shopper-command-provider-v1.reconcileSnapshot',humanDecisionRequired:false},
  durableCredentialSweep:{eligible:durableSweepCandidates.length,owner:'cxorbia-shopper-command-provider-v1.normalizeDurableCredentials',humanDecisionRequired:false},
  exactAliasActiveRepair:{eligible:aliasActive.filter(x=>x.canonicalBasis!=='CONFLICT').length,owner:'exact identity authority required before retire/remap',humanDecisionRequired:falseWhenTrustedMapping:true},
  authoritativeAliasRemap:{eligible:authoritativeAliasRows+paymentAlias.length+certAlias.length+liqAlias.length+postAlias.length+reservationAlias.length,owner:'provider exact alias remap',historicalVisitRowsExcluded:true},
  manualHolds:holds.length+mapConflicts.length+hrAssignmentErrors.length,
  noHistoricalVisitRewrite:true
};
result.errorClassCounts={memberClass:countBy(memberRows,x=>x.classification),canonicalBasis:countBy(memberRows,x=>x.canonicalBasis)};
result.decision='PASS_VRM217_219_POPULATION_ROOT_DIAGNOSTIC';
save();console.log(JSON.stringify({decision:result.decision,hrRevision,population:result.population,identity:{exactAliasActivePrincipals:result.identity.exactAliasActivePrincipals,mappingConflicts:result.identity.mappingConflicts,holds:result.identity.holds},credentials:{normalizeCandidates:result.credentials.normalizeCandidates,currentHrReconcileCandidates:result.credentials.currentHrReconcileCandidates,durableSweepCandidates:result.credentials.durableSweepCandidates,collisionGroups:result.credentials.collisionGroups},hrAssignments:{assigned:result.hrAssignments.assigned,unresolved:result.hrAssignments.unresolved},visits:result.visits,operationalAliasReferences:{paymentReconciliations:paymentAlias.length,certifications:certAlias.length,liquidations:liqAlias.length,postulations:postAlias.length,reservations:reservationAlias.length},repairPlan:result.repairPlan,writes:0,production:false},null,2));
