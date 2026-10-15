#!/usr/bin/env node
/* CXOrbia I3 R08/R22/finance independent, bounded provider metadata readback.
 * No credential material, PII, payment identifiers, bank writes or source text is emitted.
 * A read-only inventory is NOT an R08/R22/R09-R17 terminal E2E PASS.
 */
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const str=v=>String(v??'').trim(), arr=v=>Array.isArray(v)?v:[];
const source=str(process.env.FOCAL_SOURCE),expectedRev=str(process.env.EXPECTED_HR_REVISION);
const host=str(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const out=str(process.env.P0_FOCAL_OUT||'.tmp/phasea-representative-live/p0-parallel-readonly');
const tenantId='tya',projectId='cinepolis';
const receipt={schemaVersion:'cxorbia.i3.r08-r22-finance.readonly.v1',
  decision:'HOLD_I3_OPEN_P0_READONLY_EVIDENCE_ONLY',classification:null,
  sourceSha:source,hrRevisionExpected:expectedRev,hrRevisionObserved:null,sections:{},production:false,
  firestoreWrites:0,hrWrites:0,authWrites:0,financeWrites:0,providerWrites:0,deploys:0};
fs.mkdirSync(out,{recursive:true});
const save=()=>{fs.writeFileSync(out+'/result.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));};
const read=async(ref)=>{const q=await ref.limit(2200).get();return {items:q.docs.map(d=>({id:d.id,...d.data()})),limitHit:q.size===2200};};
const byProject=x=>!str(x.projectId)||str(x.projectId)===projectId;
const textLen=x=>Math.max(0,...['sourceText','extractedText','instructionText','instructivoText','protocolText','bodyText'].map(k=>str(x[k]).length));
async function hrMeta(kind){
 const r=await fetch(host+'/api/tya/cinepolis/hr-live?format=meta&p0='+kind+'-'+Date.now(),{
  headers:{'cache-control':'no-store'},signal:AbortSignal.timeout(95000)});
 if(!r.ok)throw new Error('PROVIDER_FAILURE_HR_META_HTTP_'+r.status);
 const j=await r.json();
 if(j.ok!==true||j.sourceSafe!==true||j.revisionStable!==true)throw Error('PROVIDER_FAILURE_HR_META_STATE');
 return str(j.revision);
}
try{
 if(!/^[a-f0-9]{40}$/.test(source)||!/^[a-f0-9]{64}$/.test(expectedRev)||new URL(host).origin!=='https://cxorbia-backend-dev.web.app')
  throw Error('SOURCE_FAILURE_UNPINNED_DEV_AUTHORITY');
 receipt.hrRevisionObserved=await hrMeta('before');
 if(receipt.hrRevisionObserved!==expectedRev)throw Error('ENVIRONMENT_FAILURE_HR_REVISION_DRIFT');
 if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
 const db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
 const collections={
  settings:tenant.collection('aiSettings'),resources:tenant.collection('resources'),
  memberships:tenant.collection('users'),bulletins:tenant.collection('bulletins'),
  noticeReads:tenant.collection('bulletinReads'),movements:tenant.collection('financialMovements'),
  accounts:tenant.collection('financeAccounts'),
  certAttempts:tenant.collection('projects').doc(projectId).collection('certifications'),
  recerts:tenant.collection('projects').doc(projectId).collection('certificationRecertifications')
 };
 const entries=await Promise.all(Object.entries(collections).map(async([name,ref])=>{
  try{return [name,{ok:true,...await read(ref)}];}
  catch(e){return [name,{ok:false,code:String(e?.code||e?.name||'UNKNOWN').slice(0,50)}];}
 }));
 const data=Object.fromEntries(entries);
 const a=data.settings.items||[],banks=(data.resources.items||[]).filter(x=>byProject(x)&&x.resourceType==='certification_bank');
 const training=(data.resources.items||[]).filter(x=>byProject(x)&&(
  /instructivo|manual|protocol|training|capacitaci/i.test([x.resourceType,x.tipo,x.n,x.name,x.title].map(str).join(' '))||
  textLen(x)>=40));
 const active=a.filter(x=>x.status==='active'&&x.serverProxy===true&&
  (!arr(x.projectIds).length||x.projectIds.includes(projectId))&&
  ['vertex','vertex-ai','google-vertex'].includes(str(x.provider).toLowerCase()));
 const published=banks.filter(x=>['published','confirmed'].includes(str(x.bank?.estado).toLowerCase()));
 const pending=banks.filter(x=>str(x.bank?.estado).toLowerCase()==='pending_review');
 const samples=training.filter(x=>textLen(x)>=40&&textLen(x)<=60000);
 receipt.sections.R08={decision:'HOLD_R08_VERTEX_15_AUTHENTIC_GENERATION_NOT_PROVEN',
  configurationRead:data.settings.ok===true,activeVertexSettings:active.length,
  resourcesRead:data.resources.ok===true,sourceTextEligibleResources:samples.length,
  authorizedTrainingResources:training.length,bankCount:banks.length,
  pendingReviewBanks:pending.length,publishedBanks:published.length,
  banksWithExact15: banks.filter(x=>arr(x.bank?.preguntas).length===15).length,
  banksWithMultipleCertId:new Set(banks.map(x=>str(x.bank?.certificationId)).filter(Boolean)).size,
  attemptRecords:(data.certAttempts.items||[]).length,recertificationRecords:(data.recerts.items||[]).length,
  providerGeneratedInThisRun:false,sourceTextExposed:false,liveVertexHttp:'NOT_ATTEMPTED',
  noInventedQuestions:true,readScopeOnly:true};
 const user=(data.memberships.items||[]).filter(x=>x.active===true&&x.role==='shopper');
 const known=new Map(user.map(x=>[x.id,str(x.shopperId)]));
 const bulletins=(data.bulletins.items||[]).filter(byProject),reads=data.noticeReads.items||[];
 const noticeById=new Map(bulletins.map(x=>[x.id,x]));
 let verified=0,cross=0,unknown=0,technical=0,withoutTarget=0;
 for(const r of reads){
  const b=noticeById.get(str(r.bulletinId));if(!b)continue;
  const sid=known.get(str(r.userId));if(!sid){unknown++;continue;}
  const targets=arr(b.targetShopperIds).map(str);
  if(!targets.length){withoutTarget++;continue;}
  if(targets.includes(sid))verified++;else cross++;
 }
 for(const b of bulletins){
  if(/hr_20\d{2}[-_]/i.test(str(b.body||b.text)))technical++;
 }
 receipt.sections.R22={decision:cross?'HOLD_R22_POSSIBLE_CROSS_SHOPPER_READ_PROOF':'HOLD_R22_READ_RELOAD_BROWSER_PROOF_PENDING',
  bulletinsRead:data.bulletins.ok===true,readsRead:data.noticeReads.ok===true,
  projectBulletins:bulletins.length,readReceiptsForKnownShoppers:verified,
  readReceiptsCrossShopper:cross,readReceiptsUnknownPrincipal:unknown,
  bulletinsWithoutIndividualTarget:withoutTarget,visibleTechnicalBodies:technical,
  readAfterBrowserReload:'NOT_TESTED',individualRouteNav:'NOT_TESTED',sourceOnly:false};
 const movements=(data.movements.items||[]).filter(byProject),accounts=(data.accounts.items||[]).filter(byProject);
 const countCountry=(items,c)=>items.filter(x=>{
  const a=str(x.country||x.pais||x.countryCode).toUpperCase();
  return c==='GT'?['GT','GUATEMALA'].includes(a):['HN','HONDURAS'].includes(a);
 }).length;
 const uncertainPaid=movements.filter(x=>/pagad|conciliad|settled|reconciled/i.test(str(x.status||x.estado))&&!str(x.providerAck));
 const historical=movements.filter(x=>str(x.fecha||x.date||x.paidAt).slice(0,7)<='2026-09');
 receipt.sections.finance={decision:'HOLD_FINANCE_EXACT_HISTORICAL_PAYMENT_AND_BATCH_PROOF_PENDING',
  movementsRead:data.movements.ok===true,accountsRead:data.accounts.ok===true,
  movementRecords:movements.length,accounts:accounts.length,
  movementsGT:countCountry(movements,'GT'),movementsHN:countCountry(movements,'HN'),
  accountsGT:countCountry(accounts,'GT'),accountsHN:countCountry(accounts,'HN'),
  historicalRecordsInspected:historical.length,
  historicalStatusWithoutAckCount:uncertainPaid.length,
  paymentBatchE2E:'NOT_TESTED',supportAndStorageAck:'NOT_TESTED',
  septPaymentsNotInferred:true,realBankWrites:0};
 receipt.sections.readLimits=Object.fromEntries(Object.entries(data).filter(([k,x])=>x.limitHit===true).map(([k])=>[k,true]));
 receipt.sections.readErrors=Object.fromEntries(Object.entries(data).filter(([k,x])=>!x.ok).map(([k,x])=>[k,x.code]));
 receipt.hrRevisionReadback=await hrMeta('after');
 if(receipt.hrRevisionReadback!==expectedRev)throw Error('ENVIRONMENT_FAILURE_HR_REVISION_AFTER');
 receipt.readonlyInventoryCompleted=true;
 save();
}catch(e){
 let code=str(e?.message||e).replace(/[^A-Za-z0-9_]/g,'_').slice(0,100);
 receipt.classification=code.match(/^(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE)/)?.[1]||'ENVIRONMENT_FAILURE';
 receipt.decision='HOLD_I3_READONLY_PREFLIGHT_'+code;
 save();process.exitCode=2;
}
