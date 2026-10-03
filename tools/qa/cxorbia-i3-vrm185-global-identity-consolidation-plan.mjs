#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev',HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT=process.env.TENANT_ID||'tya',PROGRAM=process.env.PROJECT_ID||'cinepolis',OUT=process.env.OUT||'.tmp/vrm185-global-plan',EXPECTED=String(process.env.EXPECTED_HR_REVISION||'').trim();
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))],sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),fp=v=>v?sha(v).slice(0,20):null;
const ACTIVE=new Set(['active','confirmed','approved','materialized']);
const tech=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','sourceStableKey','sourceShopperId','sourceIdentityKey','sourceSubjectId','profileId','shopperDocId'];
const aliases=['exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases'];
const flat=v=>{const o=[];const w=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach(w);return;}if(typeof x==='object'){Object.values(x).forEach(w);return;}const s=str(x);if(s)o.push(s)};w(v);return o};
const tokens=o=>uniq([o,o?.sourceIdentity,o?.identity,o?.crosswalk,o?.profile,o?.exactIdentityAnchors].filter(Boolean).flatMap(c=>[...tech.flatMap(k=>flat(c[k])),...aliases.flatMap(k=>flat(c[k]))]));
const result={schemaVersion:'cxorbia.i3.vrm185.global-identity-consolidation-plan.v1',decision:'HOLD',readOnly:true,writes:0,authWrites:0,firestoreWrites:0,hrWrites:0,deploys:0,production:false,expectedHrRevision:EXPECTED,safePlans:[],reviewRequired:[],alreadyConverged:[],summary:null};
fs.mkdirSync(OUT,{recursive:true});const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');save();
if(!/^[a-f0-9]{64}$/.test(EXPECTED))throw new Error('VRM185_GLOBAL_EXPECTED_REVISION_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),users=tenant.collection('users'),profiles=tenant.collection('shoppers'),cross=tenant.collection('shopperIdentityCrosswalk'),links=tenant.collection('shopperIdentityLinks');
async function allAuth(){const out=[];let p;do{const x=await auth.listUsers(1000,p);out.push(...x.users);p=x.pageToken;}while(p);return out}
async function oneMember(shopperId){const s=await users.where('shopperId','==',shopperId).limit(3).get();return s.docs.map(d=>({uid:d.id,...(d.data()||{})}));}
const proofCurrent=x=>str(x?.credentialPasswordProofVersion)==='cxorbia-shopper-password-proof-v2';
const operational=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const ownerKey=k=>/^(?:shopper|shopperId|shopperIds|assignedShopperId|assignedToShopperId|auditorId|profileId|applicantShopperId|ownerShopperId|targetShopperId|beneficiaryShopperId|liquidationShopperId|reservationShopperId)$/i.test(k)&&!/^(?:source|legacy|original|migrated)/i.test(k);
function ownerRefs(value,ids,path=[]){const found=[];if(value==null)return found;if(Array.isArray(value)){value.forEach((v,i)=>found.push(...ownerRefs(v,ids,path.concat(i))));return found;}if(typeof value==='object'){for(const [k,v] of Object.entries(value)){if(ownerKey(k)){if(typeof v==='string'&&ids.has(str(v)))found.push(path.concat(k).join('.'));else if(Array.isArray(v)&&v.some(x=>ids.has(str(x))))found.push(path.concat(k).join('.'));}found.push(...ownerRefs(v,ids,path.concat(k)));}return found;}return found;}
async function domainScope(idSet){
 const out=[];for(const [scope,name] of operational){const col=scope==='tenant'?tenant.collection(name):tenant.collection('projects').doc(PROGRAM).collection(name),snap=await col.get();let docs=0,paths=new Set();for(const d of snap.docs){const p=ownerRefs(d.data()||{},idSet);if(p.length){docs++;p.forEach(x=>paths.add(x));}}if(docs)out.push({scope,collection:name,documents:docs,fieldPaths:[...paths].sort()});}return out;
}
const hrRes=await fetch(HOST+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&vrm185global='+Date.now(),{headers:{'cache-control':'no-cache,no-store,max-age=0'}});
if(!hrRes.ok)throw new Error('SOURCE_FAILURE:VRM185_GLOBAL_HR_'+hrRes.status);
const hp=await hrRes.json(),hr=hp?.snapshot||hp?.data||hp,revision=str(hp?._runtime?.revision||hr?._runtime?.revision||hr?.sourceRevision||hr?.revision);
if(revision!==EXPECTED)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM185_GLOBAL_REVISION:'+revision);
const hrIds=new Set(arr(hr?.shoppers).map(s=>str(s.id||s.shopperId)).filter(Boolean));
const [linkSnap,authUsers]=await Promise.all([links.get(),allAuth()]);
const authByUid=new Map(authUsers.map(u=>[u.uid,u]));
for(const doc of linkSnap.docs){
 const l=doc.data()||{},status=str(l.status||l.state).toLowerCase(),authority=str(l.authorityType||l.authority?.type).toLowerCase(),legacy=str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId);
 if(!ACTIVE.has(status)||authority!=='tenant_adjudication'||!legacy)continue;
 const sourceCandidates=tokens(l).filter(x=>x!==legacy&&hrIds.has(x));
 for(const current of sourceCandidates){
  const currentCrossSnap=await cross.doc(current).get(),currentCross=currentCrossSnap.exists?(currentCrossSnap.data()||{}):{};
  if(str(currentCross.shopperId)!==current||str(currentCross.sourceType).toLowerCase()!=='hr_external')continue;
  const [legacyP,currentP,legacyMs,currentMs]=await Promise.all([profiles.doc(legacy).get(),profiles.doc(current).get(),oneMember(legacy),oneMember(current)]);
  if(!legacyP.exists||!currentP.exists){result.reviewRequired.push({linkFingerprint:fp(doc.id),current,legacy,reason:'PROFILE_PAIR_INCOMPLETE'});continue;}
  if(legacyMs.length>1||currentMs.length>1){result.reviewRequired.push({linkFingerprint:fp(doc.id),current,legacy,reason:'DUPLICATE_MEMBERSHIP_FOR_ID'});continue;}
  const legacyM=legacyMs[0]||null,currentM=currentMs[0]||null,legacyU=legacyM?authByUid.get(legacyM.uid):null,currentU=currentM?authByUid.get(currentM.uid):null;
  const legacyActive=!!(legacyM&&legacyM.active===true&&legacyU&&legacyU.disabled!==true),currentActive=!!(currentM&&currentM.active===true&&currentU&&currentU.disabled!==true);
  if(!legacyActive&&!currentActive){result.reviewRequired.push({linkFingerprint:fp(doc.id),current,legacy,reason:'NO_ACTIVE_PRINCIPAL'});continue;}
  if(legacyActive&&!currentActive){result.safePlans.push({linkFingerprint:fp(doc.id),currentCanonicalShopperId:current,legacyAliasShopperId:legacy,keeper:'legacy_only_active',keeperUidFingerprint:fp(legacyM.uid),retireUidFingerprint:null,domain:await domainScope(new Set([legacy,current]))});continue;}
  if(!legacyActive&&currentActive){result.alreadyConverged.push({linkFingerprint:fp(doc.id),current,legacy,activePrincipal:'current'});continue;}
  const legacyProof=proofCurrent(legacyM)||proofCurrent(legacyP.data()),currentProof=proofCurrent(currentM)||proofCurrent(currentP.data());
  if(legacyProof===currentProof){result.reviewRequired.push({linkFingerprint:fp(doc.id),current,legacy,reason:legacyProof?'MULTIPLE_CURRENT_PASSWORD_PROOFS':'NO_UNIQUE_PASSWORD_PROOF',legacyVisibleLogin:str(legacyM.visibleLogin),currentVisibleLogin:str(currentM.visibleLogin)});continue;}
  const keeper=legacyProof?legacyM:currentM,retire=legacyProof?currentM:legacyM;
  result.safePlans.push({linkFingerprint:fp(doc.id),currentCanonicalShopperId:current,legacyAliasShopperId:legacy,keeper:legacyProof?'legacy_human_adjudicated_password_proof':'current_exact_password_proof',keeperUidFingerprint:fp(keeper.uid),retireUidFingerprint:fp(retire.uid),legacyVisibleLogin:str(legacyM.visibleLogin),currentVisibleLogin:str(currentM.visibleLogin),domain:await domainScope(new Set([legacy,current]))});
 }
}
result.summary={hrRevision:revision,activeTenantAdjudicationLinks:linkSnap.docs.filter(d=>str((d.data()||{}).authorityType).toLowerCase()==='tenant_adjudication'&&ACTIVE.has(str((d.data()||{}).status||(d.data()||{}).state).toLowerCase())).length,safePlanCount:result.safePlans.length,reviewRequiredCount:result.reviewRequired.length,alreadyConvergedCount:result.alreadyConverged.length};
result.decision=result.reviewRequired.length===0?'PASS_VRM185_GLOBAL_IDENTITY_CONSOLIDATION_PLAN':'HOLD_VRM185_GLOBAL_IDENTITY_REVIEW_REQUIRED';
save();console.log(JSON.stringify(result,null,2));if(result.decision!=='PASS_VRM185_GLOBAL_IDENTITY_CONSOLIDATION_PLAN')process.exitCode=2;
