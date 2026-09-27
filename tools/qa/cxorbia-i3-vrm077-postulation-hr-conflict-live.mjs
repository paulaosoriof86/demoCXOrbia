import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=process.env.VRM077_OUT||'.tmp/i3-vrm077';
const ROOT=String(process.env.VRM077_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.VRM077_SOURCE||'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const TARGET_VISIT='hr_2026-09_gt_23_8ed01e4363',TARGET_ROW='SEPTIEMBRE 26!23',TARGET_BRANCH='C. Paseo Cayalá',HR_SHOPPER='shopper_gt_5233bd64ee';
if(!OUT||!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('ENVIRONMENT_FAILURE:VRM077_ENV');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const str=v=>String(v??'').trim();

const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
async function authExists(m){try{await auth.getUser(m.id);return true;}catch{return false;}}
let admin=null,shopper=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper'))if(await authExists(m)){admin=m;break;}
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio'))if(await authExists(m)){shopper=m;break;}
if(!admin||!shopper)throw new Error('AUTH_FAILURE:VRM077_PRINCIPAL_MISSING');

const paulaShopperId=str(shopper.shopperId);
if(!paulaShopperId)throw new Error('AUTH_FAILURE:VRM077_PAULA_SHOPPER_ID_MISSING');
const postDocs=(await project.collection('postulations').where('shopperId','==',paulaShopperId).get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));
const targets=postDocs.filter(x=>str(x.visitId||x.visitaId)===TARGET_VISIT||str(x.hrRowId)===TARGET_ROW||str(x.sucursal)===TARGET_BRANCH);
if(targets.length!==1)throw new Error('MAPPING_FAILURE:VRM077_TARGET_APPLICATION_CARDINALITY:'+targets.length);
const target=targets[0];
if(str(target.estado||target.status).toLowerCase()!=='aprobada')throw new Error('MAPPING_FAILURE:VRM077_TARGET_NOT_APPROVED');

const visitDocs=(await project.collection('visits').where('periodId','==',PERIOD).get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));
const durable=visitDocs.find(v=>str(v.hrRowId)===TARGET_ROW||str(v.visitId||v.id)===TARGET_VISIT||v.docId===TARGET_ROW);
if(!durable)throw new Error('PERSISTENCE_FAILURE:VRM077_DURABLE_VISIT_MISSING');
if(str(durable.shopperId)!==HR_SHOPPER||str(durable.shopperId)===paulaShopperId)throw new Error('MAPPING_FAILURE:VRM077_HR_AUTHORITY_NOT_ARIANA');

const reviews=(await tenant.collection('reviewQueue').get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));
const review=reviews.find(x=>str(x.reviewType)==='hr_platform_assignment_conflict'&&(str(x.entityId)===TARGET_ROW||str(x.entityId)===TARGET_VISIT||str(x.observedHrShopperId)===HR_SHOPPER)&&str(x.platformShopperId)===paulaShopperId&&str(x.status)==='open')||null;
if(!review)throw new Error('PERSISTENCE_FAILURE:VRM077_DURABLE_REVIEW_MISSING');

const meta=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=meta&vrm077='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'}}).then(r=>{if(!r.ok)throw new Error('PROVIDER_FAILURE:VRM077_HR_META_HTTP_'+r.status);return r.json();});
if(meta?.ok!==true||meta?.revisionStable!==true||meta?.visitReconciliation?.providerAck!==true)throw new Error('PROVIDER_FAILURE:VRM077_HR_PROVIDER_ACK');
const HRREV=str(meta.revision);
if(!HRREV)throw new Error('PROVIDER_FAILURE:VRM077_HR_REVISION_MISSING');

const browser=await chromium.launch({headless:true});
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
async function signed(member,kind){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  for(let attempt=0;attempt<7;attempt++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(member.id);
    try{await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);}catch(e){if(!/Execution context was destroyed|navigation|network|timeout|interrupted/i.test(String(e?.message||e)))throw e;}
    await page.waitForTimeout(900*(attempt+1));
    if(await page.evaluate(uid=>String(firebase.auth().currentUser?.uid||'')===uid,member.id).catch(()=>false))break;
  }
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,member.id,{timeout:90000});
  await page.evaluate(async()=>{await CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(k=>{const c=CX.backendAuth.context()||{},r=String(c.role||'').toLowerCase();return c.authenticated===true&&(k==='shopper'?r==='shopper':r!=='shopper'&&r!=='cliente')&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_C6_HR_AUTHORITY_GATE?.ready===true;},kind,{timeout:120000});
  return {ctx,page};
}
async function shopperProof(page){
  await page.evaluate(()=>CX.router.nav('misvisitas',{history:false}));await page.waitForTimeout(600);
  return page.evaluate(({targetVisit,targetRow,targetBranch,paula})=>{
    const d=CX.data;
    const app=(d._posts||[]).find(x=>String(x.shopperId||'')===paula&&(String(x.visitId||x.visitaId||'')===targetVisit||String(x.hrRowId||'')===targetRow||String(x.sucursal||'')===targetBranch));
    const v=(d._visitas||[]).find(x=>String(x.id||x.visitId||'')===targetVisit||String(x.hrRowId||'')===targetRow);
    const conflict=[...document.querySelectorAll('[data-app-state="conflict_review_required"]')].find(el=>String(el.innerText||'').includes(targetBranch))||null;
    const validating=[...document.querySelectorAll('[data-app-state="approved_assignment_review"]')].some(el=>String(el.innerText||'').includes(targetBranch));
    const active=(d.visitsForShopper?d.visitsForShopper(paula):[]).filter(x=>String(x.id||x.visitId||'')===targetVisit||String(x.hrRowId||'')===targetRow);
    return {sourceRevision:String(d.previewMeta?.sourceRevision||''),appId:String(app?.id||app?.docId||''),visitShopperId:String(v?.shopperId||''),conflictVisible:!!conflict,conflictText:String(conflict?.innerText||''),validatingVisible:validating,activeTargetCount:active.length};
  },{targetVisit:TARGET_VISIT,targetRow:TARGET_ROW,targetBranch:TARGET_BRANCH,paula:paulaShopperId});
}
async function adminProof(page){
  await page.evaluate(()=>CX.router.nav('postulaciones',{history:false}));await page.waitForTimeout(600);
  return page.evaluate(({targetVisit,targetRow,targetBranch,paula})=>{
    const d=CX.data;
    const app=(d._posts||[]).find(x=>String(x.shopperId||'')===paula&&(String(x.visitId||x.visitaId||'')===targetVisit||String(x.hrRowId||'')===targetRow||String(x.sucursal||'')===targetBranch));
    const card=app?.id?document.querySelector('[data-pid="'+CSS.escape(String(app.id))+'"]'):null;
    const text=String(card?.innerText||'');
    return {sourceRevision:String(d.previewMeta?.sourceRevision||''),appId:String(app?.id||''),cardFound:!!card,text,reviewVisible:/REQUIERE REVISIÓN|asignación en revisión/i.test(text),validatingVisible:/validando asignación/i.test(text)};
  },{targetVisit:TARGET_VISIT,targetRow:TARGET_ROW,targetBranch:TARGET_BRANCH,paula:paulaShopperId});
}

const evidence={schemaVersion:'cxorbia.i3.vrm077.postulation-hr-conflict-live.v1',decision:'HOLD',sourceSha:SOURCE,hrRevision:HRREV,target:{visitId:TARGET_VISIT,hrRowId:TARGET_ROW,branch:TARGET_BRANCH,applicationId:target.id||target.docId,applicationShopperId:paulaShopperId,hrShopperId:HR_SHOPPER},providerAck:true,durableReview:{id:review.docId,reviewType:review.reviewType,status:review.status},production:false,writes:0,hrWrites:0};
try{
  const sp=await signed(shopper,'shopper');
  const before=await shopperProof(sp.page);
  if(before.sourceRevision!==HRREV)throw new Error('PROVIDER_FAILURE:VRM077_SHOPPER_REVISION_DESYNC');
  if(!before.conflictVisible||before.validatingVisible||before.activeTargetCount!==0||before.visitShopperId!==HR_SHOPPER)throw new Error('MAPPING_FAILURE:VRM077_SHOPPER_CONFLICT_PRESENTATION:'+JSON.stringify(before));
  await sp.page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await sp.page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_C6_HR_AUTHORITY_GATE?.ready===true,null,{timeout:120000});
  const after=await shopperProof(sp.page);
  if(!after.conflictVisible||after.validatingVisible||after.activeTargetCount!==0||after.sourceRevision!==HRREV)throw new Error('PERSISTENCE_FAILURE:VRM077_SHOPPER_RELOAD:'+JSON.stringify(after));
  evidence.shopper={before,after,reloadProof:true};
  await sp.ctx.close();

  const ap=await signed(admin,'admin');
  const adminState=await adminProof(ap.page);
  if(adminState.sourceRevision!==HRREV||!adminState.cardFound||!adminState.reviewVisible||adminState.validatingVisible)throw new Error('MAPPING_FAILURE:VRM077_ADMIN_CONFLICT_PRESENTATION:'+JSON.stringify(adminState));
  evidence.admin=adminState;
  await ap.ctx.close();

  evidence.decision='PASS_I3_VRM077_POSTULATION_HR_CONFLICT_LIVE';
  evidence.actionReal=true;evidence.durableReadback=true;evidence.noDuplicateRegression=true;
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
}catch(error){
  evidence.decision='FAIL_I3_VRM077_POSTULATION_HR_CONFLICT_LIVE';evidence.error=String(error?.stack||error);
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
  throw error;
}finally{await browser.close();}
