#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_002_OUT||'.tmp/prei4-admin-002-diagnostic');
const ROOT=String(process.env.PREI4_002_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.PREI4_002_SOURCE||'');
const EXPECTED_HR=String(process.env.PREI4_002_HR_REVISION||'');
const TENANT='tya',PROJECT='cinepolis';
const str=v=>String(v??'').trim(), arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const fp=v=>sha(v).slice(0,16);
fs.mkdirSync(OUT,{recursive:true});
const write=(name,v)=>fs.writeFileSync(OUT+'/'+name,JSON.stringify(v,null,2)+'\n');
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('ENVIRONMENT_FAILURE:PREI4_002_ENV');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const docs=async ref=>(await ref.get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));

const liveResponse=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?fresh=1&prei4002='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!liveResponse.ok)throw new Error('PROVIDER_FAILURE:PREI4_002_HR_HTTP_'+liveResponse.status);
const liveBody=await liveResponse.json();
const snapshot=liveBody?.snapshot||liveBody?.data||liveBody;
const runtime=liveBody?._runtime||snapshot?._runtime||{};
const observedRevision=str(runtime.revision||snapshot.sourceRevision||snapshot.revision);
if(observedRevision!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:PREI4_002_HR_REVISION:'+observedRevision);
if((runtime.refreshError??snapshot.refreshError??null)!==null)throw new Error('PROVIDER_FAILURE:PREI4_002_HR_REFRESH_ERROR');

const hrVisits=arr(snapshot.visits);
const hrById=new Map(),hrByRow=new Map();
for(const v of hrVisits){const id=str(v.id||v.visitId),row=str(v.hrRowId);if(id)hrById.set(id,v);if(row)hrByRow.set(row,v);}
const members=await docs(tenant.collection('users'));
let admin=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
  try{await auth.getUser(m.id);admin=m;break;}catch{}
}
if(!admin)throw new Error('AUTH_FAILURE:PREI4_002_ADMIN_MISSING');

const durableAll=await docs(project.collection('postulations'));
const durableCurrent=durableAll.filter(p=>str(p.periodId)==='cinepolis-2026-09');
const pairKey=p=>str(p.visitId||p.visitaId)+'::'+str(p.shopperId);
const idOf=p=>str(p.id||p.applicationId||p.postulationId||p.docId);
const resolveVisit=p=>hrById.get(str(p.visitId||p.visitaId))||hrByRow.get(str(p.hrRowId))||null;
const durableAnalysis=durableCurrent.map(p=>{
  const v=resolveVisit(p),state=str(p.estado||p.status).toLowerCase(),postShopper=str(p.shopperId),hrShopper=str(v?.shopperId);
  const available=v?.canonicalFacets?.available===true,assigned=v?.canonicalFacets?.assigned===true||!!hrShopper;
  let lifecycle='current_reviewable';
  if(!v)lifecycle='orphan_missing_live_visit';
  else if(state==='pendiente'&&(!available||assigned))lifecycle='pending_on_ineligible_or_assigned_visit';
  else if(state==='aprobada'&&postShopper&&hrShopper&&postShopper!==hrShopper)lifecycle='approved_hr_owner_changed';
  else if(state==='aprobada'&&postShopper&&hrShopper===postShopper)lifecycle='approved_hr_confirmed';
  return {
    idFp:fp(idOf(p)),pairFp:fp(pairKey(p)),visitFp:fp(str(p.visitId||p.visitaId||p.hrRowId)),shopperFp:fp(postShopper),
    state,source:str(p.source),hasLiveVisit:!!v,liveVisitAvailable:available,liveVisitAssigned:assigned,
    hrShopperMatches:!!(postShopper&&hrShopper&&postShopper===hrShopper),lifecycle
  };
});
const pairGroups={};
for(const p of durableCurrent){const k=pairKey(p);pairGroups[k]=(pairGroups[k]||0)+1;}
const durableDuplicatePairs=Object.entries(pairGroups).filter(([,n])=>n>1).map(([k,n])=>({pairFp:fp(k),count:n}));

const browser=await chromium.launch({headless:true});
let browserEvidence;
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  for(let attempt=1;attempt<=4;attempt++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(admin.id);
    await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token).catch(()=>{});
    if(await page.waitForFunction(uid=>String(firebase.auth().currentUser?.uid||'')===uid,admin.id,{timeout:45000}).then(()=>true).catch(()=>false))break;
  }
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({uid,rev})=>String(firebase.auth().currentUser?.uid||'')===uid&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_C6_HR_AUTHORITY_GATE?.ready===true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev,{uid:admin.id,rev:EXPECTED_HR},{timeout:150000});
  await page.evaluate(()=>window.CX.router.nav('postulaciones',{history:false}));
  await page.waitForTimeout(1000);
  browserEvidence=await page.evaluate(()=>{
    const d=window.CX?.data||{},posts=Array.isArray(d._posts)?d._posts:[],visits=Array.isArray(d._visitas)?d._visitas:[];
    const period=String(d.currentPeriodId||''),current=posts.filter(p=>String(d.recordPeriodId?d.recordPeriodId(p):(p.periodId||p.projectId)||'')===period);
    const rows=current.map(p=>({id:String(p.id||p.applicationId||p.postulationId||''),visitId:String(p.visitId||p.visitaId||''),hrRowId:String(p.hrRowId||''),shopperId:String(p.shopperId||''),state:String(p.estado||p.status||'').toLowerCase(),source:String(p.source||''),sourceSafe:p.sourceSafe===true,piiProtected:p.piiProtected===true,syntheticId:/^hr-post-/.test(String(p.id||''))}));
    return {sourceRevision:String(d.previewMeta?.sourceRevision||''),currentPeriodId:period,postCount:current.length,rows,domCards:document.querySelectorAll('[data-pid]').length,visitCount:visits.filter(v=>String(d.recordPeriodId?d.recordPeriodId(v):(v.periodId||v.projectId)||'')===period).length};
  });
  await ctx.close();
}finally{await browser.close();}

if(browserEvidence.sourceRevision!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:PREI4_002_BROWSER_HR_REVISION');
const durableById=new Map(durableCurrent.map(p=>[idOf(p),p]));
const durableByPair=new Map(durableCurrent.map(p=>[pairKey(p),p]));
const composed=browserEvidence.rows.map(p=>{
  const match=durableById.get(p.id)||durableByPair.get(str(p.visitId)+'::'+str(p.shopperId))||null;
  return {
    idFp:fp(p.id),visitFp:fp(p.visitId||p.hrRowId),shopperFp:fp(p.shopperId),state:p.state,source:p.source,
    syntheticId:p.syntheticId,durableMatch:!!match,durableIdFp:match?fp(idOf(match)):null
  };
});
const syntheticOnly=composed.filter(x=>x.syntheticId&&!x.durableMatch);
const composedNoDurable=composed.filter(x=>!x.durableMatch);
const staleDurable=durableAnalysis.filter(x=>['orphan_missing_live_visit','pending_on_ineligible_or_assigned_visit','approved_hr_owner_changed'].includes(x.lifecycle));

const freshSyntheticCandidates=hrVisits.filter(v=>str(v.periodKey)==='2026-09'&&['asignada','agendada','fuera_rango','disponible'].includes(str(v.estado))).map(v=>({visitFp:fp(str(v.id||v.visitId)),shopperFp:fp(str(v.shopperId)),state:str(v.estado)}));

const rootCauses=[];
if(freshSyntheticCandidates.length)rootCauses.push('HR_PREVIEW_SYNTHESIZES_POSTULATIONS_FROM_VISIT_STATE');
if(syntheticOnly.length)rootCauses.push('SYNTHETIC_HR_POSTS_SURVIVE_IN_ADMIN_READ_MODEL');
if(staleDurable.length)rootCauses.push('DURABLE_APPLICATION_LIFECYCLE_NOT_CLOSED_AGAINST_CURRENT_HR');
if(durableDuplicatePairs.length)rootCauses.push('DURABLE_DUPLICATE_VISIT_SHOPPER_PAIR');

const result={
  schemaVersion:'cxorbia.prei4.admin002.postulation-semantic-forensic.v1',
  decision:rootCauses.length?'PASS_PREI4_ADMIN_002_ROOT_CAUSE_PROVEN':'HOLD_PREI4_ADMIN_002_ROOT_CAUSE_NOT_PROVEN',
  sourceSha:SOURCE,hrRevision:EXPECTED_HR,readOnly:true,writes:0,deploys:0,production:false,
  counts:{
    firestoreAll:durableAll.length,firestoreCurrentPeriod:durableCurrent.length,
    browserCurrentPeriod:browserEvidence.postCount,browserDomCards:browserEvidence.domCards,
    freshHrSyntheticCandidates:freshSyntheticCandidates.length,syntheticOnlyInReadModel:syntheticOnly.length,
    composedWithoutDurableMatch:composedNoDurable.length,staleDurable:staleDurable.length,durableDuplicatePairs:durableDuplicatePairs.length
  },
  rootCauses,
  durableAnalysis,
  durableDuplicatePairs,
  composed,
  syntheticOnly,
  freshSyntheticCandidates,
  browser:{sourceRevision:browserEvidence.sourceRevision,currentPeriodId:browserEvidence.currentPeriodId,visitCount:browserEvidence.visitCount}
};
write('result.json',result);
console.log(JSON.stringify({decision:result.decision,counts:result.counts,rootCauses:result.rootCauses},null,2));
if(result.decision!=='PASS_PREI4_ADMIN_002_ROOT_CAUSE_PROVEN')process.exit(1);
