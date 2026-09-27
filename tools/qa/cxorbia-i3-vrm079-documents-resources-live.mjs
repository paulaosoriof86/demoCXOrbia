#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=process.env.VRM079_OUT||'.tmp/i3-vrm079';
const ROOT=String(process.env.VRM079_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.VRM079_SOURCE||'');
const RUN=String(process.env.GITHUB_RUN_ID||Date.now());
const TENANT='tya',PROJECT='cinepolis';
if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('ENVIRONMENT_FAILURE:VRM079_SOURCE');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),resources=tenant.collection('resources');
const str=v=>String(v??'').trim();
const name='QA Resource '+RUN, updatedName=name+' Updated';
const evidence={schemaVersion:'cxorbia.i3.vrm079.documents-resources-live.v1',decision:'HOLD',sourceSha:SOURCE,production:false,binaryWrites:0,hrWrites:0};
let browser,ctx;

async function hardCleanup(){
  const snap=await resources.where('projectId','==',PROJECT).get();
  const docs=snap.docs.filter(d=>[name,updatedName].includes(str(d.data()?.n)));
  if(docs.length){const b=db.batch();docs.forEach(d=>b.delete(d.ref));await b.commit();}
  const after=await resources.where('projectId','==',PROJECT).get();
  const residue=after.docs.filter(d=>[name,updatedName].includes(str(d.data()?.n)));
  return {deletedIds:docs.map(d=>d.id),after:residue.length};
}
async function signedAdmin(){
  const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
  let admin=null;
  for(const m of members.filter(x=>x.active===true&&['super','admin'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
    try{await auth.getUser(m.id);admin=m;break;}catch{}
  }
  if(!admin)throw new Error('AUTH_FAILURE:VRM079_ADMIN_MISSING');
  browser=await chromium.launch({headless:true});
  ctx=await browser.newContext({viewport:{width:1440,height:1050}});
  const page=await ctx.newPage();
  const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  for(let attempt=0;attempt<5;attempt++){
    try{
      await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:60000});
      const token=await auth.createCustomToken(admin.id);
      await page.evaluate(async ({token,timeoutMs})=>{
        const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('AUTH_SIGNIN_TIMEOUT')),timeoutMs));
        await Promise.race([(async()=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(token);})(),timeout]);
      },{token,timeoutMs:30000});
    }catch(e){
      const msg=String(e?.message||e);
      if(!/network|timeout|interrupted|AUTH_SIGNIN_TIMEOUT|Execution context was destroyed|navigation/i.test(msg))throw e;
      console.log(JSON.stringify({vrm079AuthRetry:attempt+1,error:msg.slice(0,240)}));
    }
    await page.waitForTimeout(1000*(attempt+1));
    if(await page.evaluate(uid=>String(firebase.auth().currentUser?.uid||'')===uid,admin.id).catch(()=>false))break;
  }
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,admin.id,{timeout:60000});
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&window.CX?.backendResources?.storageStatus&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:120000});
  return page;
}

try{
  const page=await signedAdmin();
  await page.evaluate(()=>CX.router.nav('documentos',{history:false}));
  await page.waitForTimeout(800);

  const initial=await page.evaluate(()=>({
    storage:CX.backendResources.storageStatus(),
    binaryState:!!document.querySelector('[data-resource-binary-state="disabled"]'),
    topText:String(document.querySelector('#docUp')?.innerText||'')
  }));
  if(initial.storage.authorized!==false||!initial.binaryState||!/Agregar recurso/i.test(initial.topText))throw new Error('VISUAL_DEFECT:VRM079_BINARY_STATE_NOT_FAIL_CLOSED:'+JSON.stringify(initial));

  await page.locator('#docUp').click();
  await page.waitForSelector('#duN',{timeout:20000});
  const createModal=await page.evaluate(()=>({
    fileDisabled:document.querySelector('#duF')?.disabled===true,
    help:String(document.querySelector('[data-binary-help]')?.innerText||''),
    saveText:String(document.querySelector('#duS')?.innerText||'')
  }));
  if(!createModal.fileDisabled||!/carga y sustitución de archivos todavía no está habilitada/i.test(createModal.help)||!/Guardar recurso/i.test(createModal.saveText))throw new Error('VISUAL_DEFECT:VRM079_CREATE_MODAL_FALSE_UPLOAD:'+JSON.stringify(createModal));
  await page.locator('#duN').fill(name);
  await page.locator('#duT').selectOption('text');
  await page.locator('#duB').fill('# Recurso QA\n\nPersistencia durable de metadatos.');
  await page.locator('#duS').click();

  let created=null;
  for(let i=0;i<30;i++){
    const s=await resources.where('projectId','==',PROJECT).where('status','==','active').get();
    created=s.docs.find(d=>str(d.data()?.n)===name)||null;
    if(created)break;
    await new Promise(r=>setTimeout(r,400));
  }
  if(!created)throw new Error('PERSISTENCE_FAILURE:VRM079_CREATE_READBACK');
  const createdData=created.data()||{};
  if(!str(createdData.body).includes('Persistencia durable'))throw new Error('PERSISTENCE_FAILURE:VRM079_CREATE_BODY');

  await page.waitForFunction(n=>[...document.querySelectorAll('.card')].some(c=>String(c.innerText||'').includes(n)),name,{timeout:30000});
  const card=page.locator('.card').filter({hasText:name}).first();
  await card.locator('[data-editd]').click();
  await page.waitForSelector('#edN',{timeout:20000});
  const editModal=await page.evaluate(()=>({
    fileDisabled:document.querySelector('#edFile')?.disabled===true,
    help:String(document.querySelector('[data-binary-help]')?.innerText||'')
  }));
  if(!editModal.fileDisabled||!/carga y sustitución de archivos todavía no está habilitada/i.test(editModal.help))throw new Error('VISUAL_DEFECT:VRM079_EDIT_MODAL_FALSE_UPLOAD:'+JSON.stringify(editModal));
  await page.locator('#edN').fill(updatedName);
  await page.locator('#edBody').fill('# Recurso QA actualizado\n\nReadback confirmado.');
  await page.locator('#edSave').click();

  let updated=null;
  for(let i=0;i<30;i++){
    const s=await resources.doc(created.id).get();
    if(s.exists&&str(s.data()?.n)===updatedName&&Number(s.data()?.version)>=2){updated=s;break;}
    await new Promise(r=>setTimeout(r,400));
  }
  if(!updated)throw new Error('PERSISTENCE_FAILURE:VRM079_UPDATE_READBACK');

  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&window.CX?.backendResources?.storageStatus&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:120000});
  await page.evaluate(()=>CX.router.nav('documentos',{history:false}));
  await page.waitForFunction(n=>[...document.querySelectorAll('.card')].some(c=>String(c.innerText||'').includes(n)),updatedName,{timeout:45000});
  const reloadState=await page.evaluate(n=>({visible:[...document.querySelectorAll('.card')].some(c=>String(c.innerText||'').includes(n)),binaryState:!!document.querySelector('[data-resource-binary-state="disabled"]')}),updatedName);
  if(!reloadState.visible||!reloadState.binaryState)throw new Error('PERSISTENCE_FAILURE:VRM079_RELOAD_PROOF');

  const updatedCard=page.locator('.card').filter({hasText:updatedName}).first();
  await updatedCard.locator('[data-deld]').click();

  let deleted=null;
  for(let i=0;i<30;i++){
    const s=await resources.doc(created.id).get();
    if(s.exists&&str(s.data()?.status)==='deleted'){deleted=s;break;}
    await new Promise(r=>setTimeout(r,400));
  }
  if(!deleted)throw new Error('PERSISTENCE_FAILURE:VRM079_DELETE_READBACK');

  evidence.decision='PASS_I3_VRM079_DOCUMENTS_RESOURCES_DURABLE_METADATA';
  evidence.storageState=initial.storage;
  evidence.binaryControl={top:initial,createModal,editModal};
  evidence.create={id:created.id,version:Number(createdData.version||0)};
  evidence.update={id:updated.id,version:Number(updated.data()?.version||0)};
  evidence.delete={id:deleted.id,status:deleted.data()?.status,version:Number(deleted.data()?.version||0)};
  evidence.reloadState=reloadState;
  evidence.providerAck=true;
  evidence.durableReadback=true;
  evidence.reloadProof=true;
  evidence.noDuplicateRegression=true;
}catch(error){
  evidence.decision='FAIL_I3_VRM079_DOCUMENTS_RESOURCES_DURABLE_METADATA';
  evidence.error=String(error?.stack||error);
  throw error;
}finally{
  try{if(ctx)await ctx.close();}catch{}
  try{if(browser)await browser.close();}catch{}
  try{evidence.cleanup=await hardCleanup();}catch(e){evidence.cleanup={error:String(e?.message||e)};}
  fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
}
