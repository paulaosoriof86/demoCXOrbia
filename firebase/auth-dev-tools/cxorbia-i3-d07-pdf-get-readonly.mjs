#!/usr/bin/env node
/* CXOrbia I3 D07 · exactly one protected PDF GET in an ephemeral DEV Shopper session.
 * READ-ONLY. Never print/serialize JWTs, UIDs, Firestore IDs, Storage paths or PDF bytes.
 * An exact live resource must be discovered and uniquely proved before any binary GET.
 * This is a source-only candidate; it is not wired to or executed by a workflow yet.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis',PERIOD='cinepolis-2026-10';
// Same exact A2BE Hosting Preview as the successful R026 and S1 readbacks;
// DEV main Hosting has deliberately not been replaced by this candidate.
const ROOT='https://cxorbia-backend-dev--i3-a2be-40833285318-rlxwpgjo.web.app';
const SOURCE='a2be5a77a4c0008ec374c17f42d5da27070e1ed6';
const TREE='eb8734a450c14d510a9a9924b39cb826caacf510';
const EXECUTION='PAULA_I3_D07_PDF_SHOPPER_ONE_GET_READONLY_20261029';
// Approved F057 canonical identity fingerprint, not a human name or a raw identity.
const F057_CANON_FP='ec311371b5cd5893ad55';
const OUT=String(process.env.CX_D07_OUT||'.tmp/cxorbia-i3-d07-pdf-get-readonly');
const val=x=>String(x??'').trim();
const norm=x=>val(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const fp=(type,id)=>sha(`${type}:${id}`).slice(0,20);
const assert=(yes,code)=>{if(!yes)throw new Error(code);};
const result={schemaVersion:'cxorbia.i3.d07.authenticated.pdf.one_get.readonly.v1',environment:'DEV',
  decision:'HOLD',reasonCode:'NOT_STARTED',sourceSha:SOURCE,treeSha:TREE,
  production:false,firestoreWrites:0,authWrites:0,storageWrites:0,hrWrites:0,deployments:0,
  resourceUniquelyResolved:false,resourcePublishedForShopper:false,sourceServedMatches:false,
  principalAuthenticated:false,role:'shopper',getStarted:false,getCount:0,httpStatus:null,
  tokenObtained:false,bytesRead:false,bytesLength:0,pdfSignatureVerified:false,
  providerReadCode:null,errorType:null};
const save=()=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(`${OUT}/result.json`,JSON.stringify(result,null,2)+'\n','utf8');};
const allowedCodes=new Set([
  'EXECUTION_NOT_AUTHORIZED','PROJECT_SCOPE_DRIFT','SOURCE_SHA_DRIFT','SOURCE_TREE_DRIFT',
  'SERVE_SOURCE_HTTP_FAILED','SERVE_SOURCE_NOT_EQUAL','F057_CANONICAL_NOT_UNIQUE',
  'F057_ACTIVE_SHOPPER_NOT_UNIQUE','F057_SHOPPER_AUTH_DRIFT',
  'PDF_RESOURCE_NOT_UNIQUE','PDF_RESOURCE_UNPUBLISHED_FOR_SHOPPER','PDF_RESOURCE_PATH_DRIFT',
  'PDF_RESOURCE_WRONG_BUCKET','SHOPPER_SESSION_UNAVAILABLE','SHOPPER_SCOPE_DRIFT',
  'PDF_RESOURCE_NOT_IN_SHOPPER_CACHE','PDF_RESOURCE_READ_FAIL','PDF_GET_NOT_EXACTLY_ONE',
  'PDF_INVALID_SIGNATURE','PDF_HTTP_NOT_200','PDF_READ_NOT_COMPLETE',
  'ENVIRONMENT_FAILURE']);
const reason=e=>allowedCodes.has(val(e?.message))?val(e.message):'ENVIRONMENT_FAILURE';
let browser;
save();

function resourceMatch(item){
  if(val(item.status)!=='active'||val(item.projectId)!==PROGRAM||val(item.periodId)!==PERIOD||
    norm(item.tipo)!=='pdf'||val(item.tenantId)!==TENANT)return false;
  const label=norm([item.n,item.name,item.title,item.meta,item.description].filter(Boolean).join(' '));
  return label.includes('instructivo')&&label.includes('shopper')&&label.includes('cinepolis');
}
function publishedForShopper(item){
  // backendResources.load() queries visibleRoles with array-contains for Shopper.
  return Array.isArray(item.visibleRoles)&&item.visibleRoles.includes('shopper');
}
function validPdfPath(path){
  const prefix=`tenants/${TENANT}/projects/${PROGRAM}/periods/${PERIOD}/resources/`;
  if(!path.startsWith(prefix))return false;
  const suffix=path.slice(prefix.length);
  return /^[-a-zA-Z0-9_]+\/[-a-zA-Z0-9_.]+\.pdf$/i.test(suffix)&&!suffix.includes('..');
}
function validShopper(user,membership,shopperId){
  const claims=user?.customClaims||{};
  return !!user&&!user.disabled&&membership.active===true&&
    val(membership.shopperId)===shopperId&&val(membership.role)==='shopper'&&
    val(membership.authNamespace)==='shopper'&&val(membership.tenantId)===TENANT&&
    val(claims.role)==='shopper'&&val(claims.authNamespace)==='shopper'&&
    val(claims.tenantId)===TENANT&&val(claims.shopperId)===shopperId&&
    Array.isArray(claims.projectIds)&&claims.projectIds.includes(PROGRAM)&&
    Array.isArray(membership.projectIds)&&membership.projectIds.includes(PROGRAM);
}
async function exactServedSource(){
  const expected=execFileSync('git',['show',`${SOURCE}:app/core/backend-resources.js`],
    {encoding:'utf8',maxBuffer:1024*1024,stdio:['ignore','pipe','ignore']});
  const actual=await fetch(`${ROOT}/core/backend-resources.js?cxD07ReadOnly=${Date.now()}`,
    {cache:'no-store',signal:AbortSignal.timeout(45000)});
  assert(actual.ok,'SERVE_SOURCE_HTTP_FAILED');
  assert(sha(await actual.text())===sha(expected),'SERVE_SOURCE_NOT_EQUAL');
  result.sourceServedMatches=true;save();
}
async function exactPrincipal(tenant,auth){
  const profiles=(await tenant.collection('shoppers').get()).docs
    .filter(d=>fp('sid',d.id)===F057_CANON_FP);
  assert(profiles.length===1,'F057_CANONICAL_NOT_UNIQUE');
  const shopperId=profiles[0].id;
  const members=(await tenant.collection('users').where('shopperId','==',shopperId).get()).docs;
  const valid=[];
  for(const doc of members){
    const membership=doc.data()||{};
    let authUser=null;try{authUser=await auth.getUser(doc.id);}catch{}
    if(validShopper(authUser,membership,shopperId))valid.push(doc.id);
  }
  assert(valid.length===1,'F057_ACTIVE_SHOPPER_NOT_UNIQUE');
  return valid[0];
}
async function exactPublishedResource(tenant){
  const docs=(await tenant.collection('resources').where('projectId','==',PROGRAM)
    .where('status','==','active').get()).docs;
  const matched=docs.map(d=>({...d.data(),id:d.id})).filter(resourceMatch);
  assert(matched.length===1,'PDF_RESOURCE_NOT_UNIQUE');
  const item=matched[0];result.resourceUniquelyResolved=true;
  assert(publishedForShopper(item),'PDF_RESOURCE_UNPUBLISHED_FOR_SHOPPER');
  result.resourcePublishedForShopper=true;
  assert(validPdfPath(val(item.storagePath)),'PDF_RESOURCE_PATH_DRIFT');
  save();return item;
}
async function shopperRead(auth,shopperUid,item){
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  let getCount=0,responseStatus=null,requestFailed=false;
  const encodedPath=encodeURIComponent(item.storagePath);
  const exactRequest=req=>req.method()==='GET'&&
    req.url().startsWith('https://firebasestorage.googleapis.com/v0/b/')&&
    req.url().includes(encodedPath);
  const page=await context.newPage();
  page.on('request',req=>{if(exactRequest(req))getCount++;});
  page.on('response',res=>{if(exactRequest(res.request()))responseStatus=res.status();});
  page.on('requestfailed',req=>{if(exactRequest(req))requestFailed=true;});
  try{
    await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'+
      '&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'+
      '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV',
    {waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,
      null,{timeout:60000});
    const temporaryToken=await auth.createCustomToken(shopperUid);
    await page.evaluate(async token=>{
      await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
      await window.firebase.auth().signInWithCustomToken(token);
    },temporaryToken);
    await page.reload({waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&
      window.CX?.backendAuth?.context?.()?.role==='shopper'&&
      window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,
      null,{timeout:120000});
    result.principalAuthenticated=true;
    const probe=await page.evaluate(async({projectId,periodId,resourceId})=>{
      const context=window.CX?.backendAuth?.context?.()||{};
      if(context.role!=='shopper'||context.tenantId!=='tya')return {code:'SHOPPER_SCOPE_DRIFT'};
      window.CX.data?.setCurrentPeriod?.(periodId);
      const scope={projectId,periodId};
      const resources=await window.CX.backendResources.load(scope);
      const matches=resources.filter(r=>String(r.id||'')===resourceId);
      if(matches.length!==1)return {code:'PDF_RESOURCE_NOT_IN_SHOPPER_CACHE'};
      const r=await window.CX.backendResources.readPublishedPdf(matches[0],scope);
      const b=r.bytes;
      return {ok:r.ok===true,code:String(r.code||''),
        stage:String(r.diagnostic?.stage||''),tokenObtained:r.diagnostic?.tokenObtained===true,
        httpStatus:Number.isInteger(r.diagnostic?.httpStatus)?r.diagnostic.httpStatus:null,
        errorType:String(r.diagnostic?.errorType||''),
        bytesRead:r.diagnostic?.bytesRead===true,
        bytesLength:Number(r.diagnostic?.bytesLength||0),
        pdfMagic:!!b&&b.length>=5&&b[0]===37&&b[1]===80&&b[2]===68&&b[3]===70&&b[4]===45};
    },{projectId:PROGRAM,periodId:PERIOD,resourceId:item.id});
    result.getCount=getCount;result.getStarted=getCount>0;
    result.httpStatus=probe.httpStatus??responseStatus;
    result.tokenObtained=probe.tokenObtained===true;
    result.bytesRead=probe.bytesRead===true;
    result.bytesLength=probe.bytesLength||0;
    result.pdfSignatureVerified=probe.pdfMagic===true;
    result.transportRequestFailed=requestFailed;
    result.stage=/^(TOKEN|GET|GET_HTTP|BYTES|COMPLETE)$/.test(probe.stage)?probe.stage:'UNCLASSIFIED';
    result.providerReadCode=/^RESOURCE_READ_[A-Z0-9_]{3,80}$/.test(probe.code)?probe.code:null;
    result.errorType=/^(TypeError|AbortError|NetworkError|TimeoutError|FirebaseError|InvalidStateError|OtherError)$/.test(probe.errorType)?probe.errorType:null;
    save();
    assert(!probe.code||probe.ok,'PDF_RESOURCE_READ_FAIL');
    assert(getCount===1,'PDF_GET_NOT_EXACTLY_ONE');
    assert(result.httpStatus===200,'PDF_HTTP_NOT_200');
    assert(result.bytesRead&&result.bytesLength>=5,'PDF_READ_NOT_COMPLETE');
    assert(result.pdfSignatureVerified,'PDF_INVALID_SIGNATURE');
  }finally{await context.close();}
}

try{
  assert(process.env.CX_D07_GET_READONLY===EXECUTION,'EXECUTION_NOT_AUTHORIZED');
  assert(process.env.GCLOUD_PROJECT===PROJECT||process.env.GOOGLE_CLOUD_PROJECT===PROJECT,
    'PROJECT_SCOPE_DRIFT');
  assert(process.env.CX_D07_SOURCE_SHA===SOURCE,'SOURCE_SHA_DRIFT');
  assert(process.env.CX_D07_SOURCE_TREE===TREE,'SOURCE_TREE_DRIFT');
  const tree=val(execFileSync('git',['rev-parse',`${SOURCE}^{tree}`],{encoding:'utf8'}));
  assert(tree===TREE,'SOURCE_TREE_DRIFT');
  await exactServedSource();
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const tenant=getFirestore().collection('tenants').doc(TENANT),auth=getAuth();
  const [shopperUid,item]=await Promise.all([exactPrincipal(tenant,auth),exactPublishedResource(tenant)]);
  await shopperRead(auth,shopperUid,item);
  result.decision='PASS_DEV_D07_AUTHENTICATED_PDF_GET_READONLY';result.reasonCode='NONE';save();
}catch(error){result.decision='HOLD';result.reasonCode=reason(error);save();
}finally{if(browser)await browser.close().catch(()=>{});}
process.stdout.write(JSON.stringify({decision:result.decision,reasonCode:result.reasonCode,
  environment:result.environment,production:false,getCount:result.getCount,
  httpStatus:result.httpStatus,pdfSignatureVerified:result.pdfSignatureVerified})+'\n');
if(result.decision!=='PASS_DEV_D07_AUTHENTICATED_PDF_GET_READONLY')process.exitCode=2;
