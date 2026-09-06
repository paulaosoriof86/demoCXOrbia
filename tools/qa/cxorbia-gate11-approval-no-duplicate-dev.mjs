#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate9';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex'),fp=v=>sha(v).slice(0,24),now=()=>new Date().toISOString();
const write=(name,value)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:11,generatedAt:now(),production:false,hrWrites:0,...extra};write('gate11-approval-no-duplicate.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}
async function jsonFetch(url,options){const response=await fetch(url,options);return {response,body:await response.json().catch(()=>null)};}
async function apiKey(){const r=await fetch(`${HOSTING_URL}/__/firebase/init.json`,{cache:'no-store'});ensure(r.ok,'ENVIRONMENT_FAILURE',{blocker:`GATE11_FIREBASE_INIT_${r.status}`});const j=await r.json();ensure(str(j?.apiKey),'ENVIRONMENT_FAILURE',{blocker:'GATE11_FIREBASE_API_KEY_MISSING'});return str(j.apiKey);}
async function exchangeCustomToken(token){const key=await apiKey();const {response,body}=await jsonFetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,returnSecureToken:true})});ensure(response.ok&&body?.idToken,'AUTH_FAILURE',{blocker:'GATE11_ADMIN_TOKEN_EXCHANGE_FAILED',status:response.status});return body.idToken;}

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const gate10=JSON.parse(fs.readFileSync(path.join(OUT,'gate10-persistence-reload.json'),'utf8'));
ensure(gate10.decision==='PASS_GATE10_PERSISTENCE_AFTER_RELOAD','FUNCTIONAL_DEFECT',{blocker:'GATE11_REQUIRES_GATE10_PASS'});
const tenantId=str(gate10.tenantId),projectId=str(gate10.projectId),periodId=str(gate10.periodId),targetFp=str(gate10.postulationFingerprint);
ensure(tenantId&&projectId&&periodId&&targetFp,'SOURCE_FAILURE',{blocker:'GATE11_SCOPE_FROM_GATE10_MISSING'});
const tenant=db.collection('tenants').doc(tenantId),project=tenant.collection('projects').doc(projectId);
const [members,beforePosts]=await Promise.all([allDocs(tenant.collection('users')),allDocs(project.collection('postulations'))]);
const target=beforePosts.find(p=>fp(str(p.id||p.applicationId||p.postulationId))===targetFp)||null;
ensure(target,'SOURCE_FAILURE',{blocker:'GATE11_TARGET_POSTULATION_NOT_FOUND',targetFingerprint:targetFp});
const targetId=str(target.id||target.applicationId||target.postulationId),visitId=str(target.visitId||target.visitaId),shopperId=str(target.shopperId);
ensure(str(target.status||target.estado)==='pendiente','FUNCTIONAL_DEFECT',{blocker:'GATE11_TARGET_NOT_PENDING',status:str(target.status||target.estado),postulationFingerprint:targetFp});
const pairBefore=beforePosts.filter(p=>str(p.visitId||p.visitaId)===visitId&&str(p.shopperId)===shopperId);
ensure(pairBefore.length===1,'PERSISTENCE_FAILURE',{blocker:'GATE11_DUPLICATE_BEFORE_APPROVAL',pairCount:pairBefore.length,postulationFingerprint:targetFp});
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(projectId)));
ensure(staff,'AUTH_FAILURE',{blocker:'GATE11_ADMIN_MISSING'});
const browserToken=await auth.createCustomToken(staff.id),apiToken=await exchangeCustomToken(await auth.createCustomToken(staff.id));
let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'GATE11_PLAYWRIGHT_UNAVAILABLE'});}
const browser=await chromium.launch({headless:true});
const baseUrl=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(projectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
let commandTrace=null,uiApproved=false;
try{
  const ctx=await browser.newContext(),page=await ctx.newPage();
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async token=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(token);},browserToken);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,projectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(projectId)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,projectId},{timeout:120000});
  await page.evaluate(()=>window.CX?.router?.nav?.('postulaciones'));
  await page.waitForSelector(`[data-pid="${targetId}"]`,{timeout:30000});
  const responsePromise=page.waitForResponse(response=>{const req=response.request();if(req.method()!=='POST'||!response.url().includes('/v1/cxorbia/commands'))return false;try{const p=req.postDataJSON();return str(p?.commandType)==='application.status.update'&&str(p?.entityId)===targetId;}catch(_){return false;}},{timeout:30000});
  const approve=page.locator(`[data-ap="${targetId}"]`);ensure(await approve.count(),'FUNCTIONAL_DEFECT',{blocker:'GATE11_APPROVE_BUTTON_MISSING',postulationFingerprint:targetFp});
  await approve.first().click();
  const response=await responsePromise;let body=null,payload=null;try{body=await response.json();}catch(_){}try{payload=response.request().postDataJSON();}catch(_){}
  commandTrace={observed:true,httpStatus:response.status(),httpOk:response.ok(),ok:body?.ok===true,status:str(body?.status)||null,providerAck:body?.providerAck===true,successUiAllowed:body?.successUiAllowed===true,idempotentReplay:body?.idempotentReplay===true,providerWrites:Number(body?.providerWrites??-1),request:{commandType:str(payload?.commandType)||null,entityIdMatch:str(payload?.entityId)===targetId,tenantMatch:str(payload?.tenantId)===tenantId,projectMatch:str(payload?.projectId)===projectId,periodMatch:str(payload?.periodId)===periodId,idempotencyKeyPresent:!!str(payload?.idempotencyKey),providerEnforcementRequired:payload?.authorization?.providerEnforcementRequired===true},payload};
  ensure(response.ok&&body?.providerAck===true&&body?.successUiAllowed===true&&body?.committed===true,'PERSISTENCE_FAILURE',{blocker:'GATE11_APPROVAL_REMOTE_ACK_MISSING',command:commandTrace,postulationFingerprint:targetFp});
  try{await page.waitForFunction(id=>{const el=document.querySelector(`[data-pid="${id}"]`);return !!el&&/Aprobada/i.test(el.textContent||'');},targetId,{timeout:30000});uiApproved=true;}catch(_){uiApproved=false;}
  await page.screenshot({path:path.join(OUT,'gate11-admin-approved.png'),fullPage:true});
  await ctx.close();
  ensure(payload,'FUNCTIONAL_DEFECT',{blocker:'GATE11_COMMAND_PAYLOAD_NOT_CAPTURED'});
  const replay=await jsonFetch(`${HOSTING_URL}/v1/cxorbia/commands`,{method:'POST',headers:{authorization:`Bearer ${apiToken}`,'content-type':'application/json'},body:JSON.stringify(payload)});
  commandTrace.replay={httpStatus:replay.response.status,httpOk:replay.response.ok,ok:replay.body?.ok===true,providerAck:replay.body?.providerAck===true,idempotentReplay:replay.body?.idempotentReplay===true,providerWrites:Number(replay.body?.providerWrites??-1)};
  ensure(replay.response.ok&&replay.body?.providerAck===true&&replay.body?.idempotentReplay===true&&Number(replay.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE',{blocker:'GATE11_APPROVAL_IDEMPOTENT_REPLAY_FAILED',command:commandTrace,postulationFingerprint:targetFp});
}finally{await browser.close();}
const [afterPosts,visitSnap]=await Promise.all([allDocs(project.collection('postulations')),project.collection('visits').doc(visitId).get()]);
const after=afterPosts.find(p=>str(p.id||p.applicationId||p.postulationId)===targetId)||null,visit=visitSnap.exists?(visitSnap.data()||{}):null;
const pairAfter=afterPosts.filter(p=>str(p.visitId||p.visitaId)===visitId&&str(p.shopperId)===shopperId);
ensure(after&&str(after.status||after.estado)==='aprobada','PERSISTENCE_FAILURE',{blocker:'GATE11_APPROVED_POSTULATION_NOT_DURABLE',postulationFingerprint:targetFp});
ensure(visit&&str(visit.shopperId)===shopperId&&['asignada','assigned'].includes(str(visit.status||visit.estado).toLowerCase()),'PERSISTENCE_FAILURE',{blocker:'GATE11_APPROVAL_VISIT_ASSIGNMENT_MISSING',visitFingerprint:fp(visitId),shopperFingerprint:fp(shopperId)});
ensure(beforePosts.length===afterPosts.length&&pairAfter.length===1,'PERSISTENCE_FAILURE',{blocker:'GATE11_APPROVAL_DUPLICATED_ENTITY',postCountBefore:beforePosts.length,postCountAfter:afterPosts.length,pairCountBefore:pairBefore.length,pairCountAfter:pairAfter.length});
finish('PASS_GATE11_APPROVAL_NO_DUPLICATE',{gate10:'PASS_LOCKED',sourceSha:process.env.SOURCE_SHA||null,tenantId,projectId,periodId,postulationFingerprint:targetFp,visitFingerprint:fp(visitId),shopperFingerprint:fp(shopperId),remoteAck:true,successUiAfterAck:uiApproved,commandObserved:commandTrace?.observed===true,idempotentReplay:commandTrace?.replay?.idempotentReplay===true,replayProviderWrites:commandTrace?.replay?.providerWrites,postCountBefore:beforePosts.length,postCountAfter:afterPosts.length,duplicatePairCountBefore:pairBefore.length,duplicatePairCountAfter:pairAfter.length,visitAssignedDurably:true,localStorageTruth:false},0);
