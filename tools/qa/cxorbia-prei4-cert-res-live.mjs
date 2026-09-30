import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const projectId=str(process.env.PROJECT_ID);
const tenantId=str(process.env.TENANT_ID);
const root=str(process.env.HOSTING_URL);
const sourceSha=str(process.env.CERT_RES_SOURCE);
const outDir=str(process.env.CERT_RES_MAT_OUT||'.tmp/prei4-cert-res-materialize');
const runId=str(process.env.GITHUB_RUN_ID||Date.now());
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV';
const PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';

if(!projectId||!tenantId||!root||!sourceSha)throw new Error('MAPPING_FAILURE:CERT_RES_LIVE_ENV_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),bucket=getStorage().bucket('cxorbia-backend-dev.firebasestorage.app');
fs.mkdirSync(outDir,{recursive:true});

const tenant=db.collection('tenants').doc(tenantId);
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
async function authUserExists(id){try{await auth.getUser(id);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}}
let adminMember=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
  if(await authUserExists(m.id)){adminMember=m;break;}
}
let shopperMember=null;
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.authNamespace).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio')){
  if(await authUserExists(m.id)){shopperMember=m;break;}
}
if(!adminMember)throw new Error('AUTH_FAILURE:CERT_RES_ADMIN_PRINCIPAL_MISSING');
if(!shopperMember)throw new Error('AUTH_FAILURE:CERT_RES_PAULA_SHOPPER_PRINCIPAL_MISSING');

const shopperUser=await auth.getUser(shopperMember.id);
const shopperId=str(shopperUser.customClaims?.shopperId);
if(!shopperId)throw new Error('AUTH_FAILURE:CERT_RES_SHOPPER_ID_CLAIM_MISSING');

const fixturePeriod='cert-res-fixture-'+runId;
const fixtureResource='res-cert-res-'+runId;
let bankResourceId='',attemptId='',recertId='',binaryPath='';
const evidence={
  schemaVersion:'cxorbia.prei4.cert-res.live.v1',
  decision:'HOLD',
  sourceSha,projectId,tenantId,fixturePeriod,
  admin:{},shopper:{},cert001:{},cert002:{},res001:{},
  cleanup:{},
  hrWrites:0,production:false
};

async function signIn(member,expectedRole){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(str(e?.message||e)));
  const url=root+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime='+PROTECTED+'&cxHumanFullVisual='+FULL+'&certres='+runId;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  const token=await auth.createCustomToken(member.id);
  await page.evaluate(async t=>{
    await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
    await window.firebase.auth().signInWithCustomToken(t);
  },token);
  await page.goto('about:blank',{waitUntil:'domcontentloaded',timeout:30000});
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===String(uid),member.id,{timeout:90000});
  await page.evaluate(async()=>{await window.CX?.backendAuth?.ensureAuthenticated?.();});
  await page.waitForFunction(({tenantId,projectId,expectedRole})=>{
    const c=window.CX?.backendAuth?.context?.()||{};
    const role=String(c.role||'').toLowerCase();
    const roleOk=expectedRole==='shopper'?role==='shopper':['super','admin','ops','coordinador'].includes(role);
    const ps=Array.isArray(c.projectIds)?c.projectIds.map(String):[];
    return c.authenticated===true&&String(c.tenantId||'')===tenantId&&roleOk&&(role==='super'||ps.length===0||ps.includes(projectId))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;
  },{tenantId,projectId,expectedRole},{timeout:180000});
  const context=await page.evaluate(()=>window.CX?.backendAuth?.context?.()||{});
  return {ctx,page,errors,context};
}

const browser=await chromium.launch({headless:true});
let adminSession=null,shopperSession=null;
try{
  adminSession=await signIn(adminMember,'admin');
  evidence.admin={uid:adminMember.id,role:str(adminSession.context.role),authorityApplied:true,pageErrors:adminSession.errors};

  const ai=await adminSession.page.evaluate(async ({fixturePeriod})=>{
    await window.CX?.backendAI?.load?.();
    if(!window.CX?.ai?.ready?.())throw new Error('AI_PROVIDER_NOT_READY_IN_BROWSER');
    const sourceText='Protocolo de prueba técnica CXOrbia. El shopper debe conservar anonimato. Debe registrar evidencia exactamente según el instructivo. Debe completar el cuestionario dentro del plazo definido y no inventar información.';
    const generated=await window.CX.ai.ask(sourceText,{module:'certification',questionCount:4,gate:80});
    if(!(generated?.providerAck===true&&Array.isArray(generated.preguntas)&&generated.preguntas.length>=3))throw new Error('AI_PROVIDER_ACK_OR_QUESTIONS_MISSING');
    const uid=String(window.firebase?.auth?.().currentUser?.uid||'');
    const bank={
      preguntas:generated.preguntas,
      gate:80,
      fecha:new Date().toISOString().slice(0,10),
      generadoPor:'fixture-generator',
      generadoPorUid:'fixture-generator-not-current',
      revisadoPor:'Recovery live proof',
      revisadoPorUid:uid,
      estado:'published',
      provider:generated.provider,
      model:generated.model,
      providerAck:true,
      contentRevision:generated.contentRevision,
      generatedAt:new Date().toISOString(),
      publishedAt:new Date().toISOString(),
      historicalEquivalenceKeys:['cert-res-fixture-equivalence']
    };
    const saved=await window.CX.certStore.save(fixturePeriod,bank);
    if(!(saved?.providerAck===true&&saved?.committed===true))throw new Error('CERT_BANK_SAVE_ACK_REQUIRED');
    const resourceId=window.CX.certStore.resourceId(fixturePeriod);
    return {
      provider:generated.provider,
      model:generated.model,
      questionCount:generated.preguntas.length,
      contentRevision:generated.contentRevision,
      resourceId,
      savedAck:true,
      answers:generated.preguntas.map(q=>q.correcta)
    };
  },{fixturePeriod});
  bankResourceId=ai.resourceId;
  evidence.cert001={decision:'PASS_PREI4_CERT_001_LIVE',provider:ai.provider,model:ai.model,questionCount:ai.questionCount,contentRevision:ai.contentRevision,bankResourceId,providerAck:true};

  const bankSnap=await tenant.collection('resources').doc(bankResourceId).get();
  if(!bankSnap.exists)throw new Error('PERSISTENCE_FAILURE:CERT_BANK_READBACK_MISSING');
  const bankData=bankSnap.data()||{};
  if(bankData.resourceType!=='certification_bank'||bankData.bank?.estado!=='published'||bankData.bank?.contentRevision!==ai.contentRevision)throw new Error('PERSISTENCE_FAILURE:CERT_BANK_READBACK_MISMATCH');

  shopperSession=await signIn(shopperMember,'shopper');
  evidence.shopper={uid:shopperMember.id,shopperId,role:str(shopperSession.context.role),authorityApplied:true,pageErrors:shopperSession.errors};

  const attempt=await shopperSession.page.evaluate(async ({fixturePeriod,bankResourceId,answers,shopperId,projectId})=>{
    if(!window.CX?.backendCertifications?.submitAttempt)throw new Error('CERT_RUNTIME_CLIENT_MISSING');
    const result=await window.CX.backendCertifications.submitAttempt({periodId:fixturePeriod,bankResourceId,answers});
    if(!(result?.providerAck===true&&result?.committed===true&&result?.pass===true))throw new Error('CERT_ATTEMPT_NOT_COMMITTED');
    const profile=window.CX?.data?.__sessionShopperProfile||{};
    const bank=window.CX?.certStore?.bank?.(fixturePeriod)||null;
    const carry=window.CX?.backendCertifications?.carryoverDecision?.(profile,bank,projectId)||null;
    return {result,carry,shopperContext:String(window.CX?.backendAuth?.context?.()?.shopperId||shopperId)};
  },{fixturePeriod,bankResourceId,answers:ai.answers,shopperId,projectId});
  if(str(attempt.shopperContext)!==shopperId)throw new Error('AUTH_FAILURE:CERT_ATTEMPT_WRONG_SHOPPER');
  evidence.cert002.attempt={score:attempt.result.score,pass:attempt.result.pass,providerAck:attempt.result.providerAck,carryoverStateBeforeRecert:attempt.carry?.state||null,carryoverEligibilityBeforeRecert:attempt.carry?.eligibilityGranted===true};

  const attemptSnap=await db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('certifications')
    .where('shopperId','==',shopperId).where('bankResourceId','==',bankResourceId).get();
  if(attemptSnap.empty)throw new Error('PERSISTENCE_FAILURE:CERT_ATTEMPT_READBACK_MISSING');
  const attemptDoc=attemptSnap.docs.sort((a,b)=>str(b.data()?.createdAt).localeCompare(str(a.data()?.createdAt)))[0];
  attemptId=attemptDoc.id;
  if(attemptDoc.data()?.pass!==true||attemptDoc.data()?.providerAck!==true)throw new Error('PERSISTENCE_FAILURE:CERT_ATTEMPT_READBACK_MISMATCH');

  await new Promise(r=>setTimeout(r,1100));
  const recert=await adminSession.page.evaluate(async ({fixturePeriod,shopperId})=>{
    const r=await window.CX.backendCertifications.requestRecertification({scope:'one',shopperId,reason:'Recovery PRE-I4 live fixture',days:7,periodId:fixturePeriod});
    if(!(r?.providerAck===true&&r?.committed===true))throw new Error('RECERT_NOT_COMMITTED');
    return r;
  },{fixturePeriod,shopperId});
  recertId=str(recert.item?.id);
  if(!recertId)throw new Error('PERSISTENCE_FAILURE:RECERT_ID_MISSING');
  const recertSnap=await db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('certificationRecertifications').doc(recertId).get();
  if(!recertSnap.exists||recertSnap.data()?.providerAck!==true)throw new Error('PERSISTENCE_FAILURE:RECERT_READBACK_MISSING');

  await shopperSession.page.evaluate(async()=>{
    if(window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY)await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY('prei4_cert_res_live_recert');
  });
  await shopperSession.page.waitForFunction(id=>(window.CX?.data?.__protectedCertificationRecertifications||[]).some(x=>String(x.id||'')===String(id)),recertId,{timeout:120000});
  const recertState=await shopperSession.page.evaluate(({shopperId,fixturePeriod,projectId})=>{
    const bank=window.CX?.certStore?.bank?.(fixturePeriod)||null;
    const profile=window.CX?.data?.__sessionShopperProfile||{};
    const durable=window.CX?.backendCertifications?.durableCurrent?.(shopperId,bank)||null;
    const carry=window.CX?.backendCertifications?.carryoverDecision?.(profile,bank,projectId)||null;
    return {durable:!!durable,carryState:carry?.state||null,carryEligibility:carry?.eligibilityGranted===true};
  },{shopperId,fixturePeriod,projectId});
  if(recertState.durable!==false||recertState.carryState!=='recertification_required'||recertState.carryEligibility!==false)throw new Error('FUNCTIONAL_DEFECT:RECERTIFICATION_DID_NOT_INVALIDATE_PRIOR_ELIGIBILITY');
  evidence.cert002.recertification={decision:'PASS_PREI4_CERT_002_LIVE',recertId,priorAttemptInvalidated:true,carryState:recertState.carryState,providerAck:true};

  const storage=await adminSession.page.evaluate(async ({fixturePeriod,fixtureResource})=>{
    const bytes=new TextEncoder().encode('CXOrbia PRE-I4 resource fixture '+Date.now());
    const file=new File([bytes],'cxorbia-cert-res-fixture.txt',{type:'text/plain',lastModified:Date.now()});
    const up=await window.CX.backendResources.uploadBinary(file,{projectId:window.CX.data.currentProjectId,periodId:fixturePeriod,resourceId:fixtureResource});
    if(!(up?.providerAck===true&&up?.committed===true&&up?.storageProviderAck===true))throw new Error('RESOURCE_UPLOAD_ACK_REQUIRED');
    const saved=await window.CX.backendResources.saveMetadata({
      id:fixtureResource,resourceType:'project_resource',projectId:window.CX.data.currentProjectId,periodId:fixturePeriod,
      n:'PRE-I4 Storage fixture',tipo:'text',meta:file.name,url:up.item.url,storagePath:up.item.storagePath,
      visibleRoles:['super','admin','ops','coordinador','shopper'],targetAll:false
    },{projectId:window.CX.data.currentProjectId,periodId:fixturePeriod,idempotencyKey:'prei4-res-save:'+fixtureResource});
    if(!(saved?.providerAck===true&&saved?.committed===true))throw new Error('RESOURCE_METADATA_ACK_REQUIRED');
    return {item:saved.item,storagePath:up.item.storagePath,url:up.item.url};
  },{fixturePeriod,fixtureResource});
  binaryPath=str(storage.storagePath);
  if(!binaryPath)throw new Error('PERSISTENCE_FAILURE:RESOURCE_STORAGE_PATH_MISSING');

  const [existsBefore]=await bucket.file(binaryPath).exists();
  if(!existsBefore)throw new Error('PERSISTENCE_FAILURE:RESOURCE_BINARY_READBACK_MISSING');
  const resSnap=await tenant.collection('resources').doc(fixtureResource).get();
  if(!resSnap.exists||str(resSnap.data()?.storagePath)!==binaryPath)throw new Error('PERSISTENCE_FAILURE:RESOURCE_METADATA_READBACK_MISSING');

  const deletion=await adminSession.page.evaluate(async ({item,fixturePeriod})=>{
    const r=await window.CX.backendResources.deleteResource(item,{projectId:window.CX.data.currentProjectId,periodId:fixturePeriod,idempotencyKey:'prei4-res-delete:'+item.id});
    if(!(r?.providerAck===true&&r?.committed===true))throw new Error('RESOURCE_DELETE_ACK_REQUIRED');
    return r;
  },{item:storage.item,fixturePeriod});
  const [existsAfter]=await bucket.file(binaryPath).exists();
  const deletedSnap=await tenant.collection('resources').doc(fixtureResource).get();
  if(existsAfter)throw new Error('PERSISTENCE_FAILURE:RESOURCE_ORPHAN_BINARY_REMAINS');
  if(!deletedSnap.exists||deletedSnap.data()?.status!=='deleted')throw new Error('PERSISTENCE_FAILURE:RESOURCE_METADATA_DELETE_READBACK_MISMATCH');
  evidence.res001={decision:'PASS_PREI4_RES_001_LIVE',storagePath:binaryPath,uploadAck:true,metadataAck:true,deleteAck:deletion.providerAck===true,orphanBinary:false,deletedMetadataState:'deleted'};

  evidence.decision='PASS_PREI4_CERT_RES_CUMULATIVE_DEV_LIVE';
} finally {
  const cleanup={attempt:false,recert:false,bank:false,resource:false,binary:false};
  try{
    if(attemptId){await db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('certifications').doc(attemptId).delete();cleanup.attempt=true;}
    if(recertId){await db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('certificationRecertifications').doc(recertId).delete();cleanup.recert=true;}
    if(bankResourceId){await tenant.collection('resources').doc(bankResourceId).delete();cleanup.bank=true;}
    if(fixtureResource){await tenant.collection('resources').doc(fixtureResource).delete();cleanup.resource=true;}
    if(binaryPath){try{await bucket.file(binaryPath).delete({ignoreNotFound:true});}catch(_){}cleanup.binary=!(await bucket.file(binaryPath).exists())[0];}
  }catch(error){
    cleanup.error=str(error?.message||error);
  }
  evidence.cleanup=cleanup;
  if(adminSession?.ctx)await adminSession.ctx.close().catch(()=>{});
  if(shopperSession?.ctx)await shopperSession.ctx.close().catch(()=>{});
  await browser.close().catch(()=>{});
  fs.writeFileSync(path.join(outDir,'cert-res-live.json'),JSON.stringify(evidence,null,2)+'\n');
}
if(evidence.decision!=='PASS_PREI4_CERT_RES_CUMULATIVE_DEV_LIVE')throw new Error('FUNCTIONAL_DEFECT:CERT_RES_LIVE_NOT_PASS');
if(!evidence.cleanup.attempt||!evidence.cleanup.recert||!evidence.cleanup.bank||!evidence.cleanup.resource||!evidence.cleanup.binary)throw new Error('PERSISTENCE_FAILURE:CERT_RES_FIXTURE_CLEANUP_INCOMPLETE:'+JSON.stringify(evidence.cleanup));
process.stdout.write(JSON.stringify(evidence,null,2)+'\n');
