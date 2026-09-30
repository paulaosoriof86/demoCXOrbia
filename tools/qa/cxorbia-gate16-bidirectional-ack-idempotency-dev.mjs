#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate16';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex'),now=()=>new Date().toISOString();
const write=(name,value)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:16,generatedAt:now(),production:false,readOnly:true,providerWrites:0,hrWrites:0,localStorageTruth:false,...extra};write('gate16-bidirectional-ack-idempotency.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}

const gate15=JSON.parse(fs.readFileSync(path.join(OUT,'gate15-locked.json'),'utf8'));
const gate11=JSON.parse(fs.readFileSync(path.join(OUT,'gate11-locked.json'),'utf8'));
ensure(gate15.decision==='PASS_GATE15_COUNTRY_CURRENCY_PROJECT_PERIOD'&&gate15.lockedEvidence===true&&gate15.noProductDrift===true,'SOURCE_FAILURE',{blocker:'GATE16_REQUIRES_LOCKED_GATE15_PASS'});
ensure(gate11.decision==='PASS_GATE11_APPROVAL_NO_DUPLICATE'&&gate11.lockedEvidence===true&&gate11.remoteAck===true&&gate11.successUiAfterAck===true&&gate11.idempotentReplay===true&&Number(gate11.replayProviderWrites)===0&&gate11.visitAssignedDurably===true,'SOURCE_FAILURE',{blocker:'GATE16_REQUIRES_LOCKED_REAL_WRITE_ACK_REPLAY'});
const tenantId=str(gate15.tenantId),projectId=str(gate15.projectId),periodId=str(gate15.periodId);
ensure(tenantId&&projectId&&periodId,'SOURCE_FAILURE',{blocker:'GATE16_SCOPE_MISSING'});

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const members=await allDocs(db.collection('tenants').doc(tenantId).collection('users'));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(projectId)));
ensure(staff,'AUTH_FAILURE',{blocker:'GATE16_AUTHORIZED_ADMIN_MISSING'});
const visits=await allDocs(db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('visits'));
const platformAssignments=visits.filter(v=>str(v.assignmentSource)==='platform');
const pending=platformAssignments.filter(v=>str(v.assignmentSyncStatus)==='pending_hr');
const synced=platformAssignments.filter(v=>str(v.assignmentSyncStatus)==='synced');
const invalidPlatformStatus=platformAssignments.filter(v=>!['pending_hr','synced'].includes(str(v.assignmentSyncStatus)));
const invalidSynced=platformAssignments.filter(v=>str(v.assignmentSyncStatus)==='synced'&&!str(v.lastSyncedAt));
ensure(platformAssignments.length>0,'PERSISTENCE_FAILURE',{blocker:'GATE16_NO_DURABLE_PLATFORM_ASSIGNMENT_FOUND'});
ensure(invalidPlatformStatus.length===0&&invalidSynced.length===0,'FUNCTIONAL_DEFECT',{blocker:'GATE16_PLATFORM_ASSIGNMENT_SYNC_STATE_INVALID',platformAssignments:platformAssignments.length,pending:pending.length,synced:synced.length,invalidStatus:invalidPlatformStatus.length,invalidSynced:invalidSynced.length});

let browserToken=await auth.createCustomToken(staff.id);
let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'GATE16_PLAYWRIGHT_UNAVAILABLE'});}
const browser=await chromium.launch({headless:true});
const baseUrl=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(projectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
let runtime=null;const pageErrors=[];
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e).slice(0,400)));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async token=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(token);},browserToken);browserToken='';
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,projectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(projectId)))&&window.CX?.commandAdapter?.status&&window.CX?.hrWriteAdapter?.status&&window.CX_CXDATA_COMMAND_BOUNDARY?.ready===true&&window.CX_CANONICAL_WRITE_FIREWALL?.ready===true;},{tenantId,projectId},{timeout:120000});
  runtime=await page.evaluate(async()=>{
    const command=window.CX?.commandAdapter?.status?.()||{};
    const hr=window.CX?.hrWriteAdapter?.status?.()||{};
    const transport=window.CX_COMMAND_HTTP_TRANSPORT||{};
    const boundary=window.CX_CXDATA_COMMAND_BOUNDARY||{};
    const firewall=window.CX_CANONICAL_WRITE_FIREWALL||{};
    const entry=window.CX_DEV_ENTRY_CANONICAL||{};
    const backend=window.CX?.BACKEND||{};
    const auth=window.CX?.backendAuth?.context?.()||{};
    const before=JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]));
    let hrProbe=null;
    if(hr.writesEnabled===false){
      hrProbe=await window.CX.hrWriteAdapter.execute({tenantId:auth.tenantId||backend.tenantId,projectId:(Array.isArray(auth.projectIds)&&auth.projectIds[0])||backend.defaultProjectId,actionType:'assignment',visitId:'gate16-noop-proof',hrRowId:'gate16-noop-proof',shopperId:'gate16-noop-shopper',assignmentSource:'platform',assignmentSyncStatus:'pending',expectedVersion:'source-current',idempotencyKey:'gate16-hr-write-disabled-proof-v1',payload:{proofOnly:true}});
    }
    const after=JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]));
    return {
      auth:{authenticated:auth.authenticated===true,provider:auth.provider||null,role:auth.role||null,tenantId:auth.tenantId||null},
      command,
      hr,
      transport:{ready:transport.ready===true,endpointConfigured:transport.endpointConfigured===true,writesEnabled:transport.writesEnabled===true,localMutation:transport.localMutation,localStoragePersistence:transport.localStoragePersistence},
      boundary:{ready:boundary.ready===true,localMutation:boundary.localMutation,localStoragePersistence:boundary.localStoragePersistence},
      firewall:{ready:firewall.ready===true,directLocalWriteAllowed:firewall.directLocalWriteAllowed,providerWrites:firewall.providerWrites},
      entryProviderAckRequired:entry?.persistenceRequired?.providerAck===true,
      backend:{enabled:backend.enabled===true,readOnly:backend.readOnly===true,writeMode:backend.writeMode||null,enableCommandWrites:backend.enableCommandWrites===true,enableHrWrites:backend.enableHrWrites===true},
      hrProbe:hrProbe?{ok:hrProbe.ok===true,status:hrProbe.status||null,committed:hrProbe.committed===true,providerAck:hrProbe.providerAck===true,code:hrProbe.code||null,localMutation:hrProbe.localMutation===true,silentOverwrite:hrProbe.silentOverwrite===true}:null,
      localStorageUnchanged:before===after
    };
  });
  await ctx.close();
}finally{browserToken='';await browser.close();}

ensure(runtime?.auth?.authenticated===true&&runtime?.auth?.provider==='firebase'&&['super','admin'].includes(str(runtime?.auth?.role)),'AUTH_FAILURE',{blocker:'GATE16_BROWSER_AUTH_CONTEXT_INVALID'});
ensure(runtime?.command?.writesEnabled===true&&runtime?.command?.successRequiresProviderAck===true&&runtime?.command?.providerAuthorizationRequired===true&&runtime?.command?.localMutation===false&&runtime?.command?.localStoragePersistence===false,'FUNCTIONAL_DEFECT',{blocker:'GATE16_COMMAND_ACK_BOUNDARY_INVALID',command:runtime?.command||null});
ensure(runtime?.transport?.ready===true&&runtime?.transport?.endpointConfigured===true&&runtime?.transport?.writesEnabled===true&&runtime?.transport?.localMutation===false&&runtime?.transport?.localStoragePersistence===false,'FUNCTIONAL_DEFECT',{blocker:'GATE16_COMMAND_TRANSPORT_INVALID',transport:runtime?.transport||null});
ensure(runtime?.boundary?.ready===true&&runtime?.boundary?.localMutation===false&&runtime?.boundary?.localStoragePersistence===false&&runtime?.firewall?.ready===true&&runtime?.firewall?.directLocalWriteAllowed===false&&Number(runtime?.firewall?.providerWrites||0)===0&&runtime?.entryProviderAckRequired===true,'FUNCTIONAL_DEFECT',{blocker:'GATE16_LOCAL_WRITE_FIREWALL_INVALID',boundary:runtime?.boundary||null,firewall:runtime?.firewall||null});
ensure(runtime?.backend?.enabled===true&&runtime?.backend?.enableCommandWrites===true&&runtime?.backend?.enableHrWrites===false,'FUNCTIONAL_DEFECT',{blocker:'GATE16_DEV_WRITE_MODE_INVALID',backend:runtime?.backend||null});
ensure(runtime?.hr?.writesEnabled===false&&runtime?.hrProbe?.ok===false&&runtime?.hrProbe?.status==='blocked'&&runtime?.hrProbe?.committed===false&&runtime?.hrProbe?.providerAck===false&&runtime?.hrProbe?.code==='HR_WRITES_DISABLED'&&runtime?.hrProbe?.localMutation===false&&runtime?.localStorageUnchanged===true,'FUNCTIONAL_DEFECT',{blocker:'GATE16_HR_FAIL_CLOSED_INVALID',hrStatus:runtime?.hr||null,hrProbe:runtime?.hrProbe||null,localStorageUnchanged:runtime?.localStorageUnchanged});

finish('PASS_GATE16_BIDIRECTIONAL_ACK_IDEMPOTENCY',{
  sourceSha:process.env.SOURCE_SHA||null,lockedGate15RunId:Number(gate15.lockedRunId)||null,lockedGate11RunId:Number(gate11.lockedRunId)||null,
  tenantId,projectId,periodId,
  lockedRealWriteRemoteAck:true,lockedRealWriteSuccessUiAfterAck:true,lockedRealWriteIdempotentReplay:true,lockedReplayProviderWrites:0,lockedVisitAssignedDurably:true,
  commandWritesEnabled:true,commandSuccessRequiresProviderAck:true,providerAuthorizationRequired:true,commandLocalMutation:false,commandLocalStoragePersistence:false,transportEndpointConfigured:true,
  canonicalBoundaryReady:true,directLocalWriteAllowed:false,entryProviderAckRequired:true,
  hrWritesEnabled:false,hrWriteFailClosed:true,hrWriteBlockedCode:'HR_WRITES_DISABLED',hrProviderAck:false,hrCommitted:false,hrLocalMutation:false,localStorageUnchanged:true,
  platformAssignments:platformAssignments.length,pendingHrAssignments:pending.length,syncedAssignments:synced.length,invalidPlatformSyncStates:0,invalidSyncedWithoutTimestamp:0,
  syncSemantics:'platform assignment remains pending_hr until explicit remote confirmation; no external HR write is enabled in DEV',
  pageErrors
},0);
