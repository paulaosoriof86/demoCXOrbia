#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=process.env.VRM078_OUT||'.tmp/i3-vrm078';
const ROOT=String(process.env.VRM078_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.VRM078_SOURCE||'');
const RUN=String(process.env.GITHUB_RUN_ID||Date.now());
const TENANT='tya';
if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('ENVIRONMENT_FAILURE:VRM078_SOURCE');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const str=v=>String(v??'').trim();
const normalizedName=name=>str(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const projectName='QA External Source '+RUN;
const projectId='prj-'+sha(TENANT+'\0'+normalizedName(projectName)).slice(0,20);
const bindingRef='binding:qa-'+RUN;
const mappingRef='mapping:visitas-'+RUN;
const periodId='setup-qa-'+RUN;
const evidence={schemaVersion:'cxorbia.i3.vrm078.external-project-live.v1',decision:'HOLD',sourceSha:SOURCE,projectName,projectId,bindingRef,mappingRef,production:false,hrWrites:0,externalWrites:0};
let browser,ctx;
async function cleanup(){
  let writes=0;
  const projectRef=tenant.collection('projects').doc(projectId);
  const receipts=await tenant.collection('commandReceipts').where('projectId','==',projectId).get();
  const audits=await tenant.collection('entityAuditTrail').where('projectId','==',projectId).get();
  const batch=db.batch();
  receipts.docs.forEach(d=>{batch.delete(d.ref);writes++;});
  audits.docs.forEach(d=>{batch.delete(d.ref);writes++;});
  if((await projectRef.get()).exists){batch.delete(projectRef);writes++;}
  if(writes)await batch.commit();
  const after=await projectRef.get();
  const r2=await tenant.collection('commandReceipts').where('projectId','==',projectId).get();
  const a2=await tenant.collection('entityAuditTrail').where('projectId','==',projectId).get();
  return {cleanupWrites:writes,projectDeleted:!after.exists,receiptsAfter:r2.size,auditsAfter:a2.size};
}
try{
  const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
  let admin=null;
  for(const m of members.filter(x=>x.active===true&&['super','admin'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
    try{await auth.getUser(m.id);admin=m;break;}catch{}
  }
  if(!admin)throw new Error('AUTH_FAILURE:VRM078_ADMIN_MISSING');

  browser=await chromium.launch({headless:true});
  ctx=await browser.newContext({viewport:{width:1440,height:1050}});
  const page=await ctx.newPage();
  const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  for(let attempt=0;attempt<5;attempt++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:60000});
    const token=await auth.createCustomToken(admin.id);
    try{await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);}catch(e){if(!/network|timeout|interrupted/i.test(String(e?.message||e)))throw e;}
    await page.waitForTimeout(800*(attempt+1));
    if(await page.evaluate(uid=>String(firebase.auth().currentUser?.uid||'')===uid,admin.id).catch(()=>false))break;
  }
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,admin.id,{timeout:60000});
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&window.CX?.commandAdapter?.writesEnabled?.()===true&&typeof window.CX?.projectWizard==='function',null,{timeout:120000});

  await page.evaluate(()=>CX.projectWizard(CX.data,CX.ui));
  await page.locator('#f_name').fill(projectName);
  await page.locator('#f_ind').fill('QA Recovery');
  await page.locator('.wCountry[data-c="GT"]').check();
  await page.locator('#wNext').click();
  await page.locator('#wNext').click();
  await page.locator('#wNext').click();

  await page.locator('#f_hr').selectOption({label:'Google Sheets (online)'});
  await page.locator('#f_hrBinding').fill(bindingRef);
  await page.locator('#f_hrMapping').fill(mappingRef);
  const refsVisible=await page.locator('#f_hrRefs').evaluate(el=>getComputedStyle(el).display!=='none');
  if(!refsVisible)throw new Error('FUNCTIONAL_DEFECT:VRM078_SOURCE_REFS_NOT_VISIBLE');
  await page.locator('#wNext').click();
  await page.locator('#wNext').click();

  let snap=null;
  for(let i=0;i<30;i++){snap=await tenant.collection('projects').doc(projectId).get();if(snap.exists)break;await new Promise(r=>setTimeout(r,500));}
  if(!snap?.exists)throw new Error('PERSISTENCE_FAILURE:VRM078_PROJECT_NOT_CREATED');
  const project=snap.data()||{};
  if(str(project.operationalSource?.mode)!=='external'||str(project.operationalSource?.providerType)!=='google_sheets')throw new Error('MAPPING_FAILURE:VRM078_SOURCE_MODE_READBACK');
  if(str(project.operationalSource?.providerBindingId)!==bindingRef||str(project.operationalSource?.mappingRef)!==mappingRef)throw new Error('PERSISTENCE_FAILURE:VRM078_BINDING_MAPPING_READBACK');
  const receipts=await tenant.collection('commandReceipts').where('projectId','==',projectId).get();
  if(receipts.empty||!receipts.docs.some(d=>(d.data()||{}).providerAck===true))throw new Error('PERSISTENCE_FAILURE:VRM078_PROVIDER_ACK_RECEIPT');
  const browserState=await page.evaluate(pid=>({present:(CX.data?.projects||[]).some(p=>String(p.id||p.projectId)===pid),toast:[...document.querySelectorAll('.toast')].map(x=>String(x.innerText||'')).slice(-5)}),projectId).catch(()=>({present:false,toast:[]}));

  evidence.decision='PASS_I3_VRM078_EXTERNAL_PROJECT_CREATE_READBACK';
  evidence.providerAck=true;evidence.durableReadback=true;evidence.browserWizard=true;evidence.refsVisible=true;
  evidence.projectReadback={tenantId:project.tenantId,projectId:project.projectId,name:project.name,countries:project.countries,operationalSource:project.operationalSource,version:project.version};
  evidence.browserState=browserState;
} catch(error){
  evidence.decision='FAIL_I3_VRM078_EXTERNAL_PROJECT_CREATE_READBACK';
  evidence.error=String(error?.stack||error);
  throw error;
} finally {
  try{if(ctx)await ctx.close();}catch{}
  try{if(browser)await browser.close();}catch{}
  try{evidence.cleanup=await cleanup();}catch(e){evidence.cleanup={error:String(e?.message||e)};}
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
}
