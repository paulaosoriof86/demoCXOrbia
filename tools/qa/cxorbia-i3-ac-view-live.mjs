import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {initializeApp,applicationDefault,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const ROOT=String(process.env.HOSTING_URL||'').replace(/\/$/,'');
const SOURCE=String(process.env.FOCAL_SOURCE||'');
const OUT=String(process.env.PHASEA_LIVE_OUT||'')+'/admin-client-preview';
const RUN=String(process.env.GITHUB_RUN_ID||'');
const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
if(!ROOT||!SOURCE||!RUN||!OUT)throw Error('ENVIRONMENT_FAILURE:AC_VIEW_ENV_MISSING');
if(descriptor.status!=='HOLD_I3_PHASEA_CUMULATIVE_LIVE_E2E_REQUIRED'||descriptor.activeBlocker!=='ADMIN_CLIENT_PREVIEW_LIVE_E2E_REQUIRED')throw Error('SOURCE_FAILURE:AC_VIEW_WRONG_CONTROL_STATE');
if(descriptor.productSourceSha!==SOURCE||descriptor.currentMaterialization?.sourceSha!==SOURCE||descriptor.currentMaterialization?.production!==false)throw Error('RELEASE_COMPOSITION_FAILURE:AC_VIEW_SOURCE_MATERIALIZATION_MISMATCH');
fs.mkdirSync(OUT,{recursive:true});
const str=x=>String(x??'').trim();
const record={schemaVersion:'cxorbia.i3.admin-client-preview.connected.v1',decision:'HOLD',sourceSha:SOURCE,sourceTree:descriptor.productTreeAuthority,materialization:descriptor.currentMaterialization,servedOwnerBlobs:{},hrRevision:null,admin:{},client:{},shopper:{},writes:{firestore:0,hr:0,production:0},deploys:0,production:false};
const write=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(record,null,2)+'\n');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc('tya');
let browser=null;
const origin=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxProjectId=cinepolis&adminClientE2E='+encodeURIComponent(RUN);
async function member(kind){
 const docs=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...d.data()}));
 for(const m of docs){
  const mr=str(m.role).toLowerCase(),isRole=kind==='admin'?['admin','super'].includes(mr):kind==='client'?['cliente','client'].includes(mr):mr==='shopper';
  if(!isRole||m.active===false||m.status==='disabled'||m.status==='inactive')continue;
  const ns=kind==='shopper'?'shopper':'staff';
  if(m.authNamespace && str(m.authNamespace).toLowerCase()!==ns)continue;
  const visibleProjects=Array.isArray(m.projectIds)?m.projectIds.map(String):[];
  if(visibleProjects.length&&!visibleProjects.includes('cinepolis')&&str(m.scopeProjectId)!=='cinepolis')continue;
  try{
   const u=await auth.getUser(m.id);
   const claims=u.customClaims||{},cr=str(claims.role).toLowerCase();
   if(u.disabled||!(kind==='admin'?['admin','super'].includes(cr):kind==='client'?['cliente','client'].includes(cr):cr==='shopper'))continue;
   if(kind==='admin'&&!(claims.tenantId==='tya'||(Array.isArray(claims.tenants)&&claims.tenants.includes('tya'))))continue;
   if(kind==='shopper'&&!str(claims.shopperId))continue;
   const scope=Array.isArray(claims.projectIds)?claims.projectIds.map(String):[];
   if(kind!=='admin'&&!scope.includes('cinepolis'))continue;
   return{uid:u.uid,claims:{role:cr,shopperId:kind==='shopper'?str(claims.shopperId):null}};
  }catch(e){if(str(e?.code)==='auth/user-not-found')continue;throw e;}
 }
 throw Error('AUTH_FAILURE:AC_VIEW_NO_AUTHORIZED_'+kind.toUpperCase()+'_MEMBER');
}
async function sign(principal,kind){
 const ctx=await browser.newContext({viewport:{width:1480,height:980}});
 const page=await ctx.newPage();
 await page.goto(origin+'&boot='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:90000});
 const token=await auth.createCustomToken(principal.uid);
 await page.evaluate(async t=>{const fb=window.firebase;await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token);
 await page.goto('about:blank');
 await page.goto(origin+'&signed='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,principal.uid,{timeout:90000});
 await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
 await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
 await page.waitForFunction(input=>{
  const c=window.CX?.backendAuth?.context?.()||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},rev=String(window.CX?.data?.previewMeta?.sourceRevision||''),role=String(c.role||'').toLowerCase();
  const ok=input.kind==='admin'?['admin','super'].includes(role):input.kind==='client'?['cliente','client'].includes(role):role==='shopper';
  return c.authenticated===true&&ok&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&rev===input.hr;
 },{kind,hr:record.hrRevision},{timeout:90000});
 return{ctx,page};
}
const probe=async page=>page.evaluate(()=>({role:window.CX?.session?.role||null,realRole:window.CX?.backendAuth?.context?.()?.role||null,preview:window.CX?.session?.user?.clientPreviewReadOnly===true,previewAuth:window.CX?.backendAuth?.clientPreviewActive?.()===true,project:String(window.CX?.data?.currentProjectId||''),period:String(window.CX?.data?.currentPeriodId||''),revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),view:String(window.CX?.session?.view||''),shopperIdSet:!!window.CX?.session?.user?.shopperId}));
const nav=async(page,id)=>{
 await page.evaluate(name=>window.CX.router.nav(name,{history:false}),id);
 await page.waitForFunction(name=>String(window.CX?.session?.view||'')===name,id,{timeout:25000});
};
try{
 for(const asset of ['core/backend-browser-auth.js','core/router.js']){
  const response=await fetch(ROOT+'/'+asset+'?acSource='+RUN,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('RELEASE_COMPOSITION_FAILURE:AC_VIEW_ASSET_HTTP_'+asset);
  const data=Buffer.from(await response.arrayBuffer());
  const gitBlob=crypto.createHash('sha1').update('blob '+data.byteLength+'\0').update(data).digest('hex');
  const expected=execFileSync('git',['rev-parse',SOURCE+':app/'+asset],{encoding:'utf8'}).trim();
  if(gitBlob!==expected)throw Error('RELEASE_COMPOSITION_FAILURE:AC_VIEW_SERVED_BYTE_MISMATCH_'+asset);
  record.servedOwnerBlobs[asset]=gitBlob;
 }
 const metaResp=await fetch(ROOT+'/api/tya/cinepolis/hr-live?format=meta&ac='+RUN,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(60000)});
 if(!metaResp.ok)throw Error('PROVIDER_FAILURE:AC_VIEW_HR_META_HTTP');
 const meta=await metaResp.json();
 if(meta.ok!==true||meta.revisionStable!==true||meta.sourceSafe!==true||!/^[a-f0-9]{64}$/.test(str(meta.revision)))throw Error('PROVIDER_FAILURE:AC_VIEW_HR_SOURCE_NOT_STABLE');
 record.hrRevision=str(meta.revision);
 browser=await chromium.launch({headless:true});
 const adminUser=await member('admin');
 const as=await sign(adminUser,'admin');
 const page=as.page;
 await page.locator('#cxEnterClientPreview').waitFor({state:'visible',timeout:25000});
 if((await probe(page)).role!=='admin')throw Error('AUTH_FAILURE:AC_VIEW_ADMIN_ENTRY_ROLE');
 await page.locator('#cxEnterClientPreview').click();
 await page.waitForFunction(()=>window.CX?.session?.role==='cliente'&&window.CX?.session?.user?.clientPreviewReadOnly===true&&window.CX?.backendAuth?.clientPreviewActive?.()===true,{timeout:25000});
 const preview=await probe(page);
 if(!['admin','super'].includes(preview.realRole)||preview.project!=='cinepolis'||preview.revision!==record.hrRevision)throw Error('MAPPING_FAILURE:AC_VIEW_ADMIN_PREVIEW_SCOPE');
 await nav(page,'cli_insights');
 const clientText=await page.locator('#view').innerText();
 if(!clientText.includes('Benchmark vs industria')||!clientText.includes('Vista del cliente · consulta administrativa'))throw Error('VISUAL_DEFECT:AC_VIEW_CLIENT_PREVIEW_NOT_RENDERED');
 const overlaysBefore=await page.locator('.cx-ov').count();
 await page.locator('#npsBtn').click();
 await page.locator('#notaBtn').click();
 const overlaysAfter=await page.locator('.cx-ov').count();
 if(overlaysAfter!==overlaysBefore)throw Error('FUNCTIONAL_DEFECT:AC_VIEW_READONLY_ACTION_OPENED');
 record.admin={claimRolePreserved:preview.realRole,uiRole:preview.role,clientPortalVisible:true,sourceRevisionEqual:true,readOnly:true,mutatingButtonsSuppressed:true,returnButtonPresent:await page.locator('#cxLeaveClientPreview').isVisible()};
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(input=>window.CX?.backendAuth?.context?.()?.authenticated===true&&window.CX?.session?.role==='cliente'&&window.CX?.session?.user?.clientPreviewReadOnly===true&&window.CX?.backendAuth?.clientPreviewActive?.()===true&&window.CX?.data?.previewMeta?.sourceRevision===input.rev,{rev:record.hrRevision},{timeout:90000});
 await page.locator('#cxLeaveClientPreview').click();
 await page.waitForFunction(()=>window.CX?.session?.role==='admin'&&!window.CX?.session?.user?.clientPreviewReadOnly&&window.CX?.backendAuth?.clientPreviewActive?.()===false,null,{timeout:25000});
 const after=await probe(page);
 if(after.realRole!==preview.realRole||after.revision!==record.hrRevision||after.project!=='cinepolis')throw Error('MAPPING_FAILURE:AC_VIEW_ADMIN_RETURN_DRIFT');
 record.admin.sessionPreservedAfterReload=true;record.admin.returnToAdminWithoutSignout=true;
 await as.ctx.close();
 const cu=await member('client'),cs=await sign(cu,'client');
 if((await probe(cs.page)).preview||!['cliente','client'].includes((await probe(cs.page)).realRole))throw Error('AUTH_FAILURE:AC_VIEW_CLIENT_ROLE_CHANGED');
 await nav(cs.page,'cli_insights');
 if(!(await cs.page.locator('#view').innerText()).includes('Benchmark vs industria'))throw Error('FUNCTIONAL_DEFECT:AC_VIEW_REAL_CLIENT_F12_ROUTE');
 record.client={realClientRoleRetained:true,previewFalse:true,f12Visible:true,hrRevisionEqual:true};
 await cs.ctx.close();
 const su=await member('shopper'),ss=await sign(su,'shopper');
 const shopper=await probe(ss.page);
 if(shopper.role!=='shopper'||shopper.realRole!=='shopper'||shopper.preview||!shopper.shopperIdSet||shopper.revision!==record.hrRevision)throw Error('AUTH_FAILURE:AC_VIEW_SHOPPER_ROLE_SCOPE_REGRESSION');
 await nav(ss.page,'misvisitas');
 record.shopper={roleUnchanged:true,authenticated:true,shopperIdentityPresent:true,miVisitasRoute:true,hrRevisionEqual:true,populationWideVerified:false};
 await ss.ctx.close();
 record.decision='PASS_I3_ADMIN_CLIENT_PREVIEW_SAME_ARTIFACT_READONLY_LIVE';
}catch(e){record.error={type:str(e?.message||e).split(':')[0],message:str(e?.message||e).slice(0,420)};}
finally{if(browser)await browser.close().catch(()=>{});write();}
console.log(JSON.stringify({decision:record.decision,sourceSha:record.sourceSha,hrRevision:record.hrRevision,servedOwnerBlobs:record.servedOwnerBlobs,admin:record.admin,client:record.client,shopper:record.shopper,error:record.error||null,production:false}));
if(!record.decision.startsWith('PASS_'))process.exitCode=1;
