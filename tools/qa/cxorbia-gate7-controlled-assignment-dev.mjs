#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const composer=require('../../app/adapters/tya-cumulative-read-model-v2.js');
const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-dev';
const RUNTIME_URL=String(process.env.RUNTIME_URL||'').replace(/\/$/,'');
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PRIVATE=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/phase-a-runtime-private/private-e2e.json';
const TOKEN_PREVIEW='YES_PAULA_20260628_PREVIEW_DEV';
const TOKEN_PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const TOKEN_TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const fp=value=>sha(value).slice(0,24);
const now=()=>new Date().toISOString();
const receiptId=command=>sha(`${command.tenantId}\0${command.projectId}\0${command.periodId}\0${command.idempotencyKey}`).slice(0,40);
const auditId=command=>sha(`${command.idempotencyKey}\0${command.commandType}\0${command.entityId||''}`).slice(0,40);
const fail=(decision,extra={})=>{
  const out={decision,gate:7,production:false,hrWrites:0,generatedAt:now(),...extra};
  fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(path.join(OUT,'gate7-controlled-assignment.json'),JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify(out));
  process.exit(1);
};
const ensure=(ok,decision,extra)=>{if(!ok)fail(decision,extra);};
const gateError=(decision,extra={})=>Object.assign(new Error(decision),{decision,extra});
const check=(ok,decision,extra)=>{if(!ok)throw gateError(decision,extra);};
const clean=value=>JSON.parse(JSON.stringify(value??null));
const logicalVisit=value=>{
  if(!value)return null;
  const x=clean(value);
  return stable(x);
};

if(!RUNTIME_URL)fail('ENVIRONMENT_FAILURE',{blocker:'RUNTIME_URL_REQUIRED'});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const db=getFirestore();

async function fetchJson(url,options){
  const response=await fetch(url,options);
  const body=await response.json().catch(()=>null);
  return {response,body};
}
async function liveHr(){
  const {response,body}=await fetchJson(`${RUNTIME_URL}/api/tya/cinepolis/hr-live?fresh=1`);
  ensure(response.ok,'ENVIRONMENT_FAILURE',{blocker:`HR_LIVE_HTTP_${response.status}`});
  const snapshot=body?.snapshot||body?.data||body;
  ensure(snapshot?.sourceSafe===true&&arr(snapshot.visits).length>0,'SOURCE_FAILURE',{blocker:'HR_LIVE_SOURCE_INVALID'});
  return {snapshot,runtime:body?._runtime||snapshot?._runtime||{}};
}
async function initApiKey(){
  if(process.env.FIREBASE_WEB_API_KEY)return process.env.FIREBASE_WEB_API_KEY;
  const response=await fetch(`${HOSTING_URL}/__/firebase/init.js`,{cache:'no-store'});
  ensure(response.ok,'ENVIRONMENT_FAILURE',{blocker:`FIREBASE_INIT_HTTP_${response.status}`});
  const text=await response.text();
  const match=text.match(/apiKey\s*:\s*["']([^"']+)["']/);
  ensure(match?.[1],'ENVIRONMENT_FAILURE',{blocker:'FIREBASE_WEB_API_KEY_UNAVAILABLE'});
  return match[1];
}
function providerEmail(login,namespace,tenantId){
  return `${sha(`${tenantId}\0${namespace}\0${String(login||'').trim().toLowerCase()}`).slice(0,48)}@auth.cxorbia.invalid`;
}
async function staffToken(creds,tenantId){
  const apiKey=await initApiKey();
  const staff=creds.staff||{};
  ensure(staff.login&&staff.password,'AUTH_FAILURE',{blocker:'STAFF_E2E_CREDENTIAL_INCOMPLETE'});
  const email=providerEmail(staff.login,staff.namespace||'staff',tenantId);
  const {response,body}=await fetchJson(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({email,password:staff.password,returnSecureToken:true})
  });
  ensure(response.ok&&body?.idToken,'AUTH_FAILURE',{blocker:`STAFF_SIGNIN_HTTP_${response.status}`,bodyCode:body?.error?.message||null});
  return body.idToken;
}
function visitKey(v){
  const coord=str(v?.sourceTab)&&str(v?.sourceRow)?`${str(v.sourceTab)}::${str(v.sourceRow)}`:'';
  return str(v?.hrRowId)||coord||str(v?.visitId||v?.id);
}
function isAvailable(v){
  const f=v?.canonicalFacets||{};
  if(typeof f.available==='boolean')return f.available===true&&f.eligibilityBlocked!==true;
  return ['disponible','available'].includes(String(v?.estado||v?.status||'').toLowerCase())&&!str(v?.shopperId);
}
async function allDocs(col){
  const snap=await col.get();
  return snap.docs.map(d=>({id:d.id,...(d.data()||{})}));
}
async function composedCounts(snapshot,tenantId,projectId,visitId,shopperId){
  const project=db.collection('tenants').doc(tenantId).collection('projects').doc(projectId);
  const [visits,shoppers]=await Promise.all([allDocs(project.collection('visits')),allDocs(db.collection('tenants').doc(tenantId).collection('shoppers'))]);
  const result=composer.compose({hr:{projects:snapshot.periods||[],visits:snapshot.visits||[],shoppers:snapshot.shoppers||[],posts:snapshot.posts||[],currentProjectId:projectId,currentPeriodId:snapshot.currentPeriodId||''},protectedPayload:{visits,shoppers,posts:[]}});
  const visit=result.visits.find(v=>str(v.id||v.visitId)===visitId);
  return {
    available:arr(result.visits).filter(isAvailable).length,
    testVisitAvailable:visit?isAvailable(visit):null,
    shopperVisits:arr(result.visits).filter(v=>str(v.shopperId)===shopperId).length,
    duplicateVisitKeys:result.diagnostics?.duplicateVisitKeys??null,
    durableDuplicateKeys:visits.length-new Set(visits.map(visitKey).filter(Boolean)).size,
    assignmentConflicts:arr(result.diagnostics?.assignmentConflicts).length
  };
}
async function productReadback(creds,visitId,shopperId){
  let chromium;
  try{({chromium}=await import('playwright'));}catch{return {browserObserved:false,reason:'PLAYWRIGHT_UNAVAILABLE'};}
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext();
    const page=await context.newPage();
    const url=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${TOKEN_PREVIEW}&cxProjectId=cinepolis&cxProtectedRuntime=${TOKEN_PROTECTED}&cxTechnicalAuthE2E=${TOKEN_TECH}`;
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
    await page.locator('.role-btn[data-role="admin"]').click({timeout:30000});
    await page.locator('#lgUser').fill(creds.staff.login);
    await page.locator('#lgPass').fill(creds.staff.password);
    await page.locator('#lgSubmit').click();
    await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,{timeout:120000});
    const read=async()=>page.evaluate(({visitId,shopperId})=>{
      const data=window.CX?.data;
      const arr=Array.isArray(data?._visitas)?data._visitas:[];
      const isAvail=v=>{
        const f=typeof data?.visitFacets==='function'?data.visitFacets(v):null;
        return f&&typeof f.available==='boolean'?f.available===true&&f.eligibilityBlocked!==true:String(v?.estado||'').toLowerCase()==='disponible'&&!String(v?.shopperId||'');
      };
      return {
        available:arr.filter(isAvail).length,
        testVisitAvailable:arr.some(v=>String(v.id||v.visitId)===visitId&&isAvail(v)),
        shopperVisits:arr.filter(v=>String(v.shopperId||'')===shopperId).length,
        duplicateVisitKeys:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.duplicateVisitKeys??null,
        authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true
      };
    },{visitId,shopperId});
    const first=await read();
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,{timeout:120000});
    const reload=await read();
    await context.close();
    return {browserObserved:true,first,reload};
  }finally{
    await browser.close();
  }
}

const creds=JSON.parse(fs.readFileSync(PRIVATE,'utf8'));
const {snapshot,runtime}=await liveHr();
const tenantId=str(snapshot.tenantId||snapshot.tenantConfig?.tenantId);
const projectId=str(snapshot.projectId||snapshot.projectConfig?.projectId);
ensure(tenantId&&projectId,'SOURCE_FAILURE',{blocker:'HR_SCOPE_MISSING'});
const project=db.collection('tenants').doc(tenantId).collection('projects').doc(projectId);
const visitsCol=project.collection('visits');
const shopperId=str(creds.shopper?.shopperId||creds.shopper?.canonicalShopperId);
ensure(shopperId,'AUTH_FAILURE',{blocker:'SHOPPER_E2E_CREDENTIAL_SCOPE_MISSING'});
const shopperSnap=await db.collection('tenants').doc(tenantId).collection('shoppers').doc(shopperId).get();
ensure(shopperSnap.exists,'AUTH_FAILURE',{blocker:'SHOPPER_DURABLE_PROFILE_MISSING'});
const durableSnap=await visitsCol.get();
const durable=new Map(durableSnap.docs.map(d=>[d.id,d.data()||{}]));
const eligible=arr(snapshot.visits).filter(v=>isAvailable(v)).map(v=>str(v.id||v.visitId)).filter(Boolean).find(id=>durable.has(id)&&!str(durable.get(id).shopperId));
ensure(eligible,'PERSISTENCE_FAILURE',{blocker:'NO_MATERIALIZED_AVAILABLE_DURABLE_VISIT_FOR_SAFE_ASSIGNMENT',hrAvailable:arr(snapshot.visits).filter(isAvailable).length,durableVisitDocs:durableSnap.size});
const visitRef=visitsCol.doc(eligible);
const beforeSnap=await visitRef.get();
ensure(beforeSnap.exists,'PERSISTENCE_FAILURE',{blocker:'SELECTED_VISIT_NOT_DURABLE'});
const before=beforeSnap.data()||{};
const beforeFingerprint=fp(logicalVisit(before));
const countsBefore=await composedCounts(snapshot,tenantId,projectId,eligible,shopperId);
const idempotencyKey=`recovery-g7-controlled-${process.env.GITHUB_RUN_ID||Date.now()}-${fp(eligible)}`;
const command={version:'cxorbia-command-adapter-v1',commandType:'visit.assign',entityType:'visit',entityId:eligible,tenantId,projectId,periodId:str(before.periodId),expectedVersion:before.version??before.updatedAt??before.lastSyncedAt??before.hrRevision??before.sourceRevision??'source-current',idempotencyKey,payload:{visitId:eligible,hrRowId:before.hrRowId||null,shopperId,assignmentSource:'platform'},authorization:{providerEnforcementRequired:true}};
const token=await staffToken(creds,tenantId);
let assignment=null,replay=null,afterRead=null,countsAfter=null,browser=null,cleanup=null;
let gateFailure=null;
try{
  const assigned=await fetchJson(`${HOSTING_URL}/v1/cxorbia/commands`,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(command)});
  assignment={httpStatus:assigned.response.status,body:assigned.body};
  check(assigned.response.ok&&assigned.body?.ok===true&&assigned.body?.status==='committed'&&assigned.body?.committed===true&&assigned.body?.providerAck===true,'PROVIDER_FAILURE',{blocker:'VISIT_ASSIGN_ACK_NOT_COMMITTED',assignment});
  const replayed=await fetchJson(`${HOSTING_URL}/v1/cxorbia/commands`,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(command)});
  replay={httpStatus:replayed.response.status,body:replayed.body};
  check(replayed.response.ok&&replayed.body?.ok===true&&replayed.body?.idempotentReplay===true,'PERSISTENCE_FAILURE',{blocker:'VISIT_ASSIGN_REPLAY_NOT_IDEMPOTENT',replay});
  afterRead=(await visitRef.get()).data()||{};
  check(str(afterRead.shopperId)===shopperId&&afterRead.assignmentSource==='platform'&&afterRead.assignmentSyncStatus==='pending_hr'&&str(afterRead.visitId||afterRead.id)===eligible&&str(afterRead.periodId)===str(before.periodId),'PERSISTENCE_FAILURE',{blocker:'FIRESTORE_ASSIGNMENT_READBACK_INVALID'});
  countsAfter=await composedCounts(snapshot,tenantId,projectId,eligible,shopperId);
  check(countsAfter.testVisitAvailable===false&&countsAfter.shopperVisits===countsBefore.shopperVisits+1&&countsAfter.duplicateVisitKeys===0&&countsAfter.durableDuplicateKeys===0,'FUNCTIONAL_DEFECT',{blocker:'COMPOSITION_ASSIGNMENT_VISIBILITY_INVALID',countsBefore,countsAfter});
  browser=await productReadback(creds,eligible,shopperId);
  check(browser.browserObserved===true&&browser.first.testVisitAvailable===false&&browser.reload.testVisitAvailable===false&&browser.reload.shopperVisits===browser.first.shopperVisits&&browser.reload.duplicateVisitKeys===0,'VISUAL_DEFECT',{blocker:'PRODUCT_RELOAD_READBACK_INVALID',browser});
}catch(error){
  gateFailure=error;
}finally{
  try{
    await visitRef.set(before);
    await db.collection('tenants').doc(tenantId).collection('commandReceipts').doc(receiptId(command)).delete();
    await db.collection('tenants').doc(tenantId).collection('entityAuditTrail').doc(auditId(command)).delete();
    const restored=(await visitRef.get()).data()||{};
    cleanup={restored:true,beforeFingerprint,afterFingerprint:fp(logicalVisit(restored)),receiptDeleted:true,auditDeleted:true};
    if(cleanup.beforeFingerprint!==cleanup.afterFingerprint)fail('ENVIRONMENT_FAILURE_GATE7_SAFE_ROLLBACK_UNAVAILABLE',{cleanup});
  }catch(error){
    fail('ENVIRONMENT_FAILURE_GATE7_SAFE_ROLLBACK_UNAVAILABLE',{error:String(error?.message||error),cleanup});
  }
}
if(gateFailure)fail(gateFailure.decision||'ENVIRONMENT_FAILURE',{error:String(gateFailure.message||gateFailure),...(gateFailure.extra||{})});

const result={
  decision:'PASS_GATE7_ASSIGNMENT_AVAILABLE_TO_SHOPPER',
  gate6:'PASS_LOCKED',
  gate:7,
  sourceSha:process.env.SOURCE_SHA||null,
  runtimeSourceRevision:runtime.revision||null,
  hrRevisionUsed:runtime.revision||snapshot.sourceRevision||null,
  visitFingerprint:fp(eligible),
  beforeFingerprint,
  cleanupFingerprintBefore:cleanup.beforeFingerprint,
  cleanupFingerprintAfter:cleanup.afterFingerprint,
  ackObserved:{httpStatus:assignment.httpStatus,ok:assignment.body.ok,status:assignment.body.status,committed:assignment.body.committed,providerAck:assignment.body.providerAck,successUiAllowed:assignment.body.successUiAllowed},
  replayIdempotent:replay.body.idempotentReplay===true,
  availableBefore:countsBefore.available,
  availableAfter:countsAfter.available,
  shopperVisitsBefore:countsBefore.shopperVisits,
  shopperVisitsAfter:countsAfter.shopperVisits,
  reloadObserved:browser.reload,
  duplicateVisitKeys:countsAfter.duplicateVisitKeys,
  durableDuplicateKeys:countsAfter.durableDuplicateKeys,
  cleanupExact:cleanup.beforeFingerprint===cleanup.afterFingerprint,
  hrWrites:0,
  production:false
};
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'gate7-controlled-assignment.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
