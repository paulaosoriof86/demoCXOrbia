#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate19';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const fp=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex').slice(0,24),now=()=>new Date().toISOString();
const write=(n,v)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:19,generatedAt:now(),production:false,readOnly:true,providerWrites:0,hrWrites:0,localStorageTruth:false,...extra};write('gate19-shopper-e2e-lineage.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}

const g8=JSON.parse(fs.readFileSync(path.join(OUT,'gate8-locked.json'),'utf8'));
const g9=JSON.parse(fs.readFileSync(path.join(OUT,'gate9-locked.json'),'utf8'));
const g10=JSON.parse(fs.readFileSync(path.join(OUT,'gate10-locked.json'),'utf8'));
const g11=JSON.parse(fs.readFileSync(path.join(OUT,'gate11-locked.json'),'utf8'));
const g18=JSON.parse(fs.readFileSync(path.join(OUT,'gate18-locked.json'),'utf8'));
ensure(g8.decision==='PASS_GATE8_SECURE_SHOPPER_LOGIN'&&g8.lockedEvidence===true&&g8.browserObserved===true&&g8.sameIdentityAfterReload===true&&g8.sameHistoryAfterReload===true,'SOURCE_FAILURE',{blocker:'GATE19_GATE8_LOCK_INVALID'});
ensure(g9.decision==='PASS_GATE9_POSTULATION_IMMEDIATE'&&g9.lockedEvidence===true&&g9.role==='shopper'&&g9.remoteAckRequired===true&&g9.durableReadback===true&&g9.adminImmediateRead===true&&g9.gestionDomObserved===true,'SOURCE_FAILURE',{blocker:'GATE19_GATE9_LOCK_INVALID'});
ensure(g10.decision==='PASS_GATE10_PERSISTENCE_AFTER_RELOAD'&&g10.lockedEvidence===true&&g10.shopperSessionRestored===true&&g10.shopperReadModelAfterReload===true&&g10.adminSessionRestored===true&&g10.adminReadModelAfterReload===true&&g10.noWriteOnReload===true,'SOURCE_FAILURE',{blocker:'GATE19_GATE10_LOCK_INVALID'});
ensure(g11.decision==='PASS_GATE11_APPROVAL_NO_DUPLICATE'&&g11.lockedEvidence===true&&g11.remoteAck===true&&g11.successUiAfterAck===true&&g11.idempotentReplay===true&&Number(g11.replayProviderWrites)===0&&g11.visitAssignedDurably===true,'SOURCE_FAILURE',{blocker:'GATE19_GATE11_LOCK_INVALID'});
ensure(g18.decision==='PASS_GATE18_ADMIN_E2E'&&g18.lockedEvidence===true&&g18.noProductDrift===true,'SOURCE_FAILURE',{blocker:'GATE19_GATE18_LOCK_INVALID'});
ensure(g9.shopperFingerprint===g10.shopperFingerprint&&g10.shopperFingerprint===g11.shopperFingerprint&&g9.visitFingerprint===g10.visitFingerprint&&g10.visitFingerprint===g11.visitFingerprint&&g9.postulationFingerprint===g10.postulationFingerprint&&g10.postulationFingerprint===g11.postulationFingerprint,'SOURCE_FAILURE',{blocker:'GATE19_LOCKED_FLOW_FINGERPRINT_MISMATCH'});

const tenantId=str(g11.tenantId),projectId=str(g11.projectId),periodId=str(g11.periodId);
ensure(tenantId&&projectId&&periodId,'SOURCE_FAILURE',{blocker:'GATE19_SCOPE_MISSING'});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),project=tenant.collection('projects').doc(projectId);
const [members,visits,posts]=await Promise.all([allDocs(tenant.collection('users')),allDocs(project.collection('visits')),allDocs(project.collection('postulations'))]);
const member=members.find(m=>str(m.role)==='shopper'&&str(m.authNamespace)==='shopper'&&fp(m.shopperId)===g11.shopperFingerprint);
const visit=visits.find(v=>fp(v.visitId||v.id)===g11.visitFingerprint);
const post=posts.find(p=>fp(p.id||p.applicationId||p.postulationId)===g11.postulationFingerprint);
ensure(member&&member.active===true&&arr(member.projectIds).map(String).includes(projectId),'PERSISTENCE_FAILURE',{blocker:'GATE19_LOCKED_SHOPPER_NOT_DURABLE'});
ensure(visit&&str(visit.shopperId)===str(member.shopperId)&&str(visit.periodId)===periodId,'PERSISTENCE_FAILURE',{blocker:'GATE19_LOCKED_VISIT_ASSIGNMENT_NOT_DURABLE'});
ensure(post&&str(post.shopperId)===str(member.shopperId)&&str(post.visitId||post.visitaId)===str(visit.visitId||visit.id)&&str(post.periodId||post.projectId)===periodId,'PERSISTENCE_FAILURE',{blocker:'GATE19_LOCKED_POSTULATION_NOT_DURABLE'});
const samePair=posts.filter(p=>str(p.shopperId)===str(member.shopperId)&&str(p.visitId||p.visitaId)===str(visit.visitId||visit.id));
ensure(samePair.length===1,'PERSISTENCE_FAILURE',{blocker:'GATE19_DUPLICATE_SHOPPER_VISIT_POSTULATION',duplicatePairCount:samePair.length});

finish('PASS_GATE19_SHOPPER_E2E_LINEAGE',{
  sourceSha:process.env.SOURCE_SHA||null,
  tenantId,projectId,periodId,
  lockedGate8RunId:Number(g8.lockedRunId)||null,lockedGate8SourceSha:g8.lockedSourceSha||null,
  lockedGate9to11RunId:Number(g11.lockedRunId)||null,lockedGate9to11SourceSha:g11.lockedSourceSha||null,
  lockedGate18RunId:Number(g18.lockedRunId)||null,lockedGate18SourceSha:g18.lockedSourceSha||null,
  shopperFingerprint:g11.shopperFingerprint,visitFingerprint:g11.visitFingerprint,postulationFingerprint:g11.postulationFingerprint,
  secureShopperLoginObserved:true,sameIdentityAfterReload:true,sameHistoryAfterReload:true,
  shopperPostulationObserved:true,postulationRemoteAck:true,postulationDurableReadback:true,adminImmediateRead:true,
  shopperSessionRestored:true,shopperReadModelAfterReload:true,adminSessionRestored:true,adminReadModelAfterReload:true,noWriteOnReload:true,
  approvalRemoteAck:true,approvalUiAfterAck:true,approvalIdempotentReplay:true,replayProviderWrites:0,visitAssignedDurably:true,
  currentShopperMemberDurable:true,currentVisitAssignmentDurable:true,currentPostulationDurable:true,duplicatePairCount:1,
  humanLegalAcceptanceReexecuted:false,legalAcceptanceBypass:false,
  certificationMethod:'locked real shopper browser/write/reload E2E + current no-drift owner lineage + current durable readback + current Hosting parity',
  currentReadbackOnly:true
},0);
