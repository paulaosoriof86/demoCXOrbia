import fs from 'node:fs';
import crypto from 'node:crypto';
import process from 'node:process';
import path from 'node:path';
import { initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const EXPECTED_PROJECT='cxorbia-backend-dev';
const TENANT='tya';
const PROJECT='cinepolis';
const REQUEST_PATH=process.env.CXORBIA_REQUEST_PATH||'backend/config/corte6-hold-profile-live-hr-readonly-request.json';
const PRIVATE_OUT=process.env.CXORBIA_PRIVATE_OUT||'.tmp/c6-hold-profile-live-hr/private.json';
const SAFE_OUT=process.env.CXORBIA_SAFE_OUT||'app/docs/evidence/CORTE6-HOLD-PROFILE-LIVE-HR-READONLY-LATEST.json';
const LIVE_URLS=(process.env.CXORBIA_LIVE_HR_URLS||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?fresh=1').split(',').map(x=>x.trim()).filter(Boolean);
const PLAN_SURNAME_FPS=new Set([
  'cc941934f90032aa48e8','9ed0cdabf3794b7ccf21','3451d618b5d6307b87da','80d716626b85e14778ea',
  '8aea97650e97902f7616','32e2de62067ab6ecfb7b','b31bdc0c7514acbe25ba','4a59de15805804cbe398',
  'cfbd0c519e59f40c6239','540c9e6b71440b393365','c01e0f344901f03e78d2','729eb0480d5ec2266a20'
]);
const PLAN_MULTI_AUTH_FP='7cc28c78de9bfda01d14';
const MULTI_AUTH_NAMESPACE_FP='d15356ed735e87a33e69';

const text=v=>String(v??'').trim();
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=(namespace,value)=>hash(`${namespace}\0${text(value)}`).slice(0,20);
const firstNonEmpty=(o,keys)=>{for(const k of keys){const v=text(o?.[k]);if(v)return v;}return '';};
function displayName(p){
  const direct=firstNonEmpty(p,['nombre','name','displayName','fullName','legacyName','personName','shopperName']);
  if(direct)return direct;
  const first=firstNonEmpty(p,['firstName','primerNombre','nombre1']);
  const last=firstNonEmpty(p,['lastName','apellido','apellidos','surname','familyName']);
  return [first,last].filter(Boolean).join(' ').trim();
}
function periodKey(data,pathValue=''){
  for(const v of [data?.periodKey,data?.periodId,data?.period,data?.projectPeriod,pathValue]){
    const m=text(v).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);if(m)return `${m[1]}-${m[2]}`;
  }
  return '';
}
function statusValue(p){return firstNonEmpty(p,['status','estado','profileStatus','accountStatus','approvalStatus'])||null;}
function dateValue(x){
  for(const k of ['updatedAt','createdAt','submittedAt','completedAt','approvedAt','date','fecha']){
    const v=x?.[k];
    if(v?.toDate)return v.toDate().toISOString();
    if(typeof v==='string'&&v.trim())return v.trim();
  }
  return null;
}
async function listAllUsers(auth){
  const out=[];let pageToken;
  do{const page=await auth.listUsers(1000,pageToken);out.push(...page.users);pageToken=page.pageToken;}while(pageToken);
  return out;
}
async function readLiveHr(){
  const errors=[];
  for(const url of LIVE_URLS){
    try{
      const response=await fetch(url,{headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'},signal:AbortSignal.timeout(180000)});
      const body=await response.json().catch(()=>null);
      if(!response.ok||!body||body.ok===false)throw new Error(`HTTP_${response.status}:${body?.error||body?.message||'invalid_json'}`);
      const periods=(body.periods||[]).map(p=>text(p.key)).filter(Boolean).sort();
      const tabs=(body.tabsRead||[]).map(t=>text(t.title||t.tabTitle)).filter(Boolean);
      const visits=Array.isArray(body.visits)?body.visits:[];
      const augustVisits=visits.filter(v=>periodKey(v)==='2026-08');
      const byCountry={GT:augustVisits.filter(v=>text(v.country||v.pais)==='GT').length,HN:augustVisits.filter(v=>text(v.country||v.pais)==='HN').length};
      const runtime=body._runtime||{};
      const source=body.source||{};
      const latestPeriodKey=periods.at(-1)||null;
      const augustTabs=tabs.filter(t=>/^AGOSTO 26(?: HN)?$/i.test(t));
      const generatedAt=body.generatedAt||null;
      const sourceReadAt=runtime.sourceReadAt||null;
      const ageMs=sourceReadAt?Math.max(0,Date.now()-Date.parse(sourceReadAt)):null;
      const liveAuthorityPass=runtime.runtimeRead===true&&runtime.cacheOrigin==='runtime_refresh'&&runtime.tabRegistryAutoDiscovery===true&&latestPeriodKey==='2026-08'&&augustTabs.length===2&&byCountry.GT>0&&byCountry.HN>0;
      return {ok:true,url,latestPeriodKey,periodCount:periods.length,visitCount:visits.length,augustTabs,augustVisits:augustVisits.length,augustByCountry:byCountry,generatedAt,sourceReadAt,sourceAgeMs:Number.isFinite(ageMs)?ageMs:null,runtimeRead:runtime.runtimeRead===true,cacheOrigin:runtime.cacheOrigin||null,tabRegistryMode:runtime.tabRegistryMode||source.tabRegistryMode||null,tabRegistryAutoDiscovery:runtime.tabRegistryAutoDiscovery===true||source.tabRegistryAutoDiscovery===true,sourceAccessMode:runtime.sourceAccessMode||source.accessMode||null,revision:runtime.revision||null,refreshError:runtime.refreshError||null,liveAuthorityPass};
    }catch(error){errors.push({url,error:String(error?.message||error).slice(0,500)});}
  }
  return {ok:false,errors,liveAuthorityPass:false};
}

const request=JSON.parse(fs.readFileSync(REQUEST_PATH,'utf8'));
if(request.schemaVersion!=='cxorbia.c6.hold-profile-live-hr-readonly-request.v1'||request.enabled!==true||request.consumed!==false)throw new Error('REQUEST_NOT_READY');
if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||request.firebaseProjectId!==EXPECTED_PROJECT||request.tenantId!==TENANT||request.projectId!==PROJECT)throw new Error('TARGET_MISMATCH');
for(const k of ['providerWrites','authWrites','firestoreWrites','hrWrites','rulesWrites','storageWrites','hostingDeploys','cloudRunDeploys','makeWrites','geminiCalls','paymentsWrites'])if(Number(request[k])!==0)throw new Error(`UNSAFE_FLAG:${k}`);

const serviceAccount=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'{}');
if(serviceAccount.type!=='service_account'||serviceAccount.project_id!==EXPECTED_PROJECT)throw new Error('SERVICE_ACCOUNT_INVALID');
const app=initializeApp({credential:cert(serviceAccount),projectId:EXPECTED_PROJECT});
const db=getFirestore(app),auth=getAuth(app);
try{
  const tenantRef=db.collection('tenants').doc(TENANT);
  const projectRef=tenantRef.collection('projects').doc(PROJECT);
  const [profileSnap,visitSnap,certSnap,liqSnap,authUsers,liveHr]=await Promise.all([
    tenantRef.collection('shoppers').get(),
    projectRef.collection('visits').get(),
    db.collectionGroup('certifications').get(),
    db.collectionGroup('liquidations').get(),
    listAllUsers(auth),
    readLiveHr()
  ]);
  const targetRows=[];
  for(const doc of profileSnap.docs){
    const p={id:doc.id,...(doc.data()||{})};
    const planFp=fp('deterministic-suffix-plan-profile',doc.id);
    const multiFp=fp('multi-auth-profile-v1',doc.id);
    const isSurname=PLAN_SURNAME_FPS.has(planFp);
    const isMulti=planFp===PLAN_MULTI_AUTH_FP||multiFp===MULTI_AUTH_NAMESPACE_FP;
    if(!isSurname&&!isMulti)continue;
    const visits=visitSnap.docs.filter(v=>text(v.data()?.shopperId)===doc.id);
    const certs=certSnap.docs.filter(v=>text(v.data()?.shopperId)===doc.id);
    const liqs=liqSnap.docs.filter(v=>text(v.data()?.shopperId)===doc.id);
    const users=authUsers.filter(u=>text(u.customClaims?.shopperId)===doc.id);
    const periods=visits.map(v=>periodKey(v.data()||{},v.ref.path)).filter(Boolean).sort();
    targetRows.push({
      holdType:isMulti?'MULTI_AUTH_TIE':'SURNAME_UNRESOLVED',
      profileId:doc.id,
      planProfileFingerprint:planFp,
      multiAuthProfileFingerprint:isMulti?multiFp:null,
      displayName:displayName(p)||'(sin nombre visible)',
      firstName:firstNonEmpty(p,['firstName','primerNombre','nombre1'])||null,
      lastName:firstNonEmpty(p,['lastName','apellido','apellidos','surname','familyName'])||null,
      status:statusValue(p),
      visits:visits.length,
      firstVisitPeriod:periods.at(0)||null,
      lastVisitPeriod:periods.at(-1)||null,
      certifications:certs.length,
      liquidations:liqs.length,
      credentialAnchorPresent:Boolean(firstNonEmpty(p,['username','userName','usuario','login','loginIdentifier','normalizedLogin','legacyShopperId','legacyId','externalShopperId','sourceId','sourceKey'])),
      authCandidates:users.map(u=>({candidateFingerprint:fp('shopper-auth-candidate-v1',u.uid),createdAt:u.metadata?.creationTime||null,lastSignInAt:u.metadata?.lastSignInTime||null,enabled:!u.disabled,emailVerified:Boolean(u.emailVerified)})),
      profileCreatedAt:dateValue(p),
      profileUpdatedAt:(p.updatedAt?.toDate?p.updatedAt.toDate().toISOString():typeof p.updatedAt==='string'?p.updatedAt:null)
    });
  }
  targetRows.sort((a,b)=>a.holdType.localeCompare(b.holdType)||a.displayName.localeCompare(b.displayName,'es'));
  const missingSurname=[...PLAN_SURNAME_FPS].filter(x=>!targetRows.some(r=>r.planProfileFingerprint===x));
  const multiFound=targetRows.some(r=>r.holdType==='MULTI_AUTH_TIE');
  const privateResult={schemaVersion:'cxorbia.c6.hold-profile-live-hr-readonly.private.v1',generatedAt:new Date().toISOString(),requestId:request.requestId,target:{firebaseProjectId:EXPECTED_PROJECT,tenantId:TENANT,projectId:PROJECT},profiles:targetRows,coverage:{expected:13,found:targetRows.length,missingSurnameFingerprints:missingSurname,multiAuthFound:multiFound},liveHr,safety:{providerReads:1,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,deploys:0,merge:false,production:false,emailsExported:false,phonesExported:false,passwordsExported:false,uidsExported:false,namesPrivateArtifactOnly:true}};
  const safeProfiles=targetRows.map(r=>({holdType:r.holdType,planProfileFingerprint:r.planProfileFingerprint,multiAuthProfileFingerprint:r.multiAuthProfileFingerprint,visits:r.visits,firstVisitPeriod:r.firstVisitPeriod,lastVisitPeriod:r.lastVisitPeriod,certifications:r.certifications,liquidations:r.liquidations,credentialAnchorPresent:r.credentialAnchorPresent,authCandidateCount:r.authCandidates.length,statusPresent:Boolean(r.status),profileCreatedAtPresent:Boolean(r.profileCreatedAt),profileUpdatedAtPresent:Boolean(r.profileUpdatedAt)}));
  const staleCandidates=safeProfiles.filter(r=>r.holdType==='SURNAME_UNRESOLVED'&&r.visits===0&&r.certifications===0&&r.liquidations===0&&r.authCandidateCount===0&&!r.credentialAnchorPresent).length;
  const safeResult={schemaVersion:'cxorbia.c6.hold-profile-live-hr-readonly.source-safe.v1',generatedAt:privateResult.generatedAt,requestId:request.requestId,decision:targetRows.length===13&&liveHr.liveAuthorityPass?'PASS_IDENTITIES_LOCATED_AND_LIVE_HR_AUGUST_CONFIRMED':'HOLD_IDENTITIES_OR_LIVE_HR_NOT_FULLY_CONFIRMED',coverage:privateResult.coverage,profileSummary:{surnameHolds:safeProfiles.filter(r=>r.holdType==='SURNAME_UNRESOLVED').length,multiAuthHolds:safeProfiles.filter(r=>r.holdType==='MULTI_AUTH_TIE').length,staleSurnameDiscardCandidates:staleCandidates,profiles:safeProfiles},liveHr,safety:{...privateResult.safety,namesExported:false,profileIdsExported:false,privateArtifactRequiredForTenantDecision:true}};
  fs.mkdirSync(path.dirname(PRIVATE_OUT),{recursive:true});
  fs.mkdirSync(path.dirname(SAFE_OUT),{recursive:true});
  fs.writeFileSync(PRIVATE_OUT,JSON.stringify(privateResult,null,2)+'\n','utf8');
  fs.writeFileSync(SAFE_OUT,JSON.stringify(safeResult,null,2)+'\n','utf8');
  console.log(JSON.stringify({decision:safeResult.decision,coverage:safeResult.coverage,liveHr:safeResult.liveHr,staleCandidates},null,2));
}finally{
  await deleteApp(app);
}
