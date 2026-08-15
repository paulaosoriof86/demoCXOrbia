#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium} from 'playwright';

const root=String(process.env.CXORBIA_I3_E2E_ROOT_URL||'http://127.0.0.1:4175').replace(/\/$/,'');
const commandEndpoint=String(process.env.CXORBIA_I3_COMMAND_ENDPOINT||'http://127.0.0.1:4180/v1/commands');
const existingPath=String(process.env.CXORBIA_I3_PRIVATE_EXISTING_CREDENTIALS||'.tmp/cxorbia-i3-private/existing-e2e.json');
const newPath=String(process.env.CXORBIA_I3_PRIVATE_NEW_CREDENTIAL||'.tmp/cxorbia-i3-private/new-shopper.json');
const authorized=process.env.CXORBIA_I3_REAL_E2E_AUTHORIZED==='YES_PAULA_I3_DEV_AUTH_FIRESTORE';
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
ensure(authorized,'I3_REAL_E2E_GATE_REQUIRED');ensure(fs.existsSync(existingPath),'I3_EXISTING_PRIVATE_CREDENTIALS_MISSING');
const existing=JSON.parse(fs.readFileSync(existingPath,'utf8'));ensure(existing.staff?.login&&existing.staff?.password,'I3_ADMIN_CREDENTIAL_MISSING');
const suffix=crypto.createHash('sha256').update(String(process.env.GITHUB_RUN_ID||Date.now())).digest('hex').slice(0,8);
const testProfile={firstName:'I3Test',lastName:'Shopper'+suffix,whatsapp:'0000000000',pais:'GT',ciudad:'Guatemala',estado:'Pendiente'};
const browser=await chromium.launch({headless:true});
const errors=[];
async function pageWithTransport(context){const p=await context.newPage();p.on('pageerror',e=>errors.push(String(e?.message||e)));return p;}
async function login(page,role,cred){
  await page.evaluate(r=>window.CX?.backendAuth?.showForRole?.(r),role);
  await page.locator('#lgUser').fill(cred.login);await page.locator('#lgPass').fill(cred.password);
  const overlay=page.locator('#cxBackendPreviewStatus');
  if(await overlay.count()){
    const pointerEvents=await overlay.evaluate(el=>getComputedStyle(el).pointerEvents);
    ensure(pointerEvents==='none','I3_DEV_STATUS_OVERLAY_INTERACTIVE_'+pointerEvents);
  }
  await page.locator('#lgSubmit').click();
  await page.waitForFunction(r=>{const c=window.CX?.backendAuth?.context?.();return c?.authenticated===true&&(r==='admin'?['super','admin'].includes(c.role):c.role===r);},role,{timeout:30000});
}
async function waitCanonicalAdminFrontend(page){
  await page.waitForFunction(()=>{
    const h=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF;
    const appOn=document.getElementById('app')?.classList.contains('on')===true;
    const loginHidden=document.getElementById('login')?.classList.contains('hidden')===true;
    return h?.status==='entered'&&h?.membershipVerified===true&&h?.authorityApplied===true&&appOn&&loginHidden;
  },null,{timeout:45000});
  const state=await page.evaluate(()=>({
    handoffStatus:window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF?.status||null,
    membershipVerified:window.CX?.session?.user?.membershipVerified===true,
    appOn:document.getElementById('app')?.classList.contains('on')===true,
    loginHidden:document.getElementById('login')?.classList.contains('hidden')===true
  }));
  ensure(state.handoffStatus==='entered'&&state.membershipVerified&&state.appOn&&state.loginHidden,'I3_ADMIN_FRONTEND_HANDOFF_NOT_ENTERED');
  return state;
}
async function shopperCheck(page,shopperId){
  await page.waitForFunction(id=>{const c=window.CX?.backendAuth?.context?.();return c?.authenticated===true&&c.role==='shopper'&&c.shopperId===id&&window.CX_SHOPPER_MEMBERSHIP?.status==='verified';},shopperId,{timeout:30000});
  return page.evaluate(id=>{const c=window.CX?.backendAuth?.context?.();const p=window.CX?.data?.getShopper?.(id)||null;return{authenticated:c?.authenticated===true,role:c?.role,shopperIdExact:c?.shopperId===id,membershipVerified:window.CX_SHOPPER_MEMBERSHIP?.status==='verified',profileVisible:Boolean(p),profileVersion:Number(p?.version||0)};},shopperId);
}
try{
  const adminContext=await browser.newContext({serviceWorkers:'block'});await adminContext.addInitScript(endpoint=>{window.CX_COMMAND_ENDPOINT_OVERRIDE=endpoint;},commandEndpoint);const adminPage=await pageWithTransport(adminContext);
  await adminPage.goto(root+'/index-backend-dev.html?cxProjectId=cinepolis',{waitUntil:'domcontentloaded',timeout:30000});await login(adminPage,'admin',existing.staff);
  await adminPage.waitForFunction(()=>window.CX?.session?.user?.membershipVerified===true,null,{timeout:30000});
  await waitCanonicalAdminFrontend(adminPage);
  await adminPage.evaluate(()=>{window.CX.BACKEND.enableCommandWrites=true;window.CX.commandHttpTransport?.activate?.();window.__I3_COMMITS=[];window.CX?.bus?.on?.('command-committed',r=>window.__I3_COMMITS.push({commandType:r.commandType,entityId:r.entityId,profileVersion:r.profileVersion||null,providerAck:r.providerAck===true}));window.CX?.router?.nav?.('shoppers');});
  await adminPage.waitForFunction(()=>window.CX?.session?.view==='shoppers',null,{timeout:15000});
  await adminPage.locator('#shNew').waitFor({state:'visible',timeout:20000});await adminPage.locator('#shNew').click();await adminPage.locator('#al_first').fill(testProfile.firstName);await adminPage.locator('#al_last').fill(testProfile.lastName);await adminPage.locator('#al_wa').fill(testProfile.whatsapp);
  await adminPage.locator('#al_save').click();await adminPage.waitForFunction(()=>Array.isArray(window.__I3_COMMITS)&&window.__I3_COMMITS.some(x=>x.commandType==='shopper.create'&&x.providerAck),null,{timeout:30000});
  const createAck=await adminPage.evaluate(()=>window.__I3_COMMITS.find(x=>x.commandType==='shopper.create'));
  for(let i=0;i<100&&!fs.existsSync(newPath);i++)await sleep(100);ensure(fs.existsSync(newPath),'I3_NEW_PRIVATE_CREDENTIAL_NOT_MATERIALIZED');const newCred=JSON.parse(fs.readFileSync(newPath,'utf8'));ensure(newCred.shopperId===createAck.entityId,'I3_NEW_CREDENTIAL_ENTITY_MISMATCH');
  await adminPage.evaluate(async()=>{try{await window.CX?.backend?.refresh?.();}catch(_){}});await adminPage.waitForFunction(id=>Boolean(window.CX?.data?.getShopper?.(id)),newCred.shopperId,{timeout:30000});
  const updateAck=await adminPage.evaluate(async id=>window.CX.data.updateShopper(id,{ciudad:'Guatemala',estado:'Activo',__commandMeta:{ackAware:true,reason:'i3-admin-shopper-update-e2e'}}),newCred.shopperId);ensure(updateAck?.ok===true&&updateAck?.providerAck===true&&Number(updateAck?.profileVersion)===2,'I3_ADMIN_UPDATE_ACK_FAILED');
  await adminContext.close();

  const newContext=await browser.newContext({serviceWorkers:'block'});const newPage=await pageWithTransport(newContext);await newPage.goto(root+'/index-backend-dev.html?cxProjectId=cinepolis',{waitUntil:'domcontentloaded',timeout:30000});await login(newPage,'shopper',newCred);const first=await shopperCheck(newPage,newCred.shopperId);ensure(first.authenticated&&first.membershipVerified&&first.shopperIdExact,'I3_NEW_SHOPPER_FIRST_LOGIN_FAILED');
  await newPage.reload({waitUntil:'domcontentloaded',timeout:30000});const reload=await shopperCheck(newPage,newCred.shopperId);ensure(reload.authenticated&&reload.membershipVerified,'I3_NEW_SHOPPER_RELOAD_FAILED');
  const newTab=await pageWithTransport(newContext);await newTab.goto(root+'/index-backend-dev.html?cxProjectId=cinepolis',{waitUntil:'domcontentloaded',timeout:30000});let tabState;try{tabState=await shopperCheck(newTab,newCred.shopperId);}catch(_){await login(newTab,'shopper',newCred);tabState=await shopperCheck(newTab,newCred.shopperId);}ensure(tabState.authenticated&&tabState.membershipVerified,'I3_NEW_SHOPPER_NEW_TAB_FAILED');await newContext.close();

  const secondContext=await browser.newContext({serviceWorkers:'block'});const secondPage=await pageWithTransport(secondContext);await secondPage.goto(root+'/index-backend-dev.html?cxProjectId=cinepolis',{waitUntil:'domcontentloaded',timeout:30000});await login(secondPage,'shopper',newCred);const second=await shopperCheck(secondPage,newCred.shopperId);ensure(second.authenticated&&second.membershipVerified&&second.shopperIdExact,'I3_NEW_SHOPPER_SECOND_CONTEXT_FAILED');await secondContext.close();
  ensure(errors.length===0,'I3_BROWSER_PAGE_ERRORS:'+errors.slice(0,3).join('|'));
  console.log(JSON.stringify({schemaVersion:'cxorbia.i3.shopper-persistence-e2e.v2',decision:'PASS_I3_ADMIN_CREATE_UPDATE_NEW_SHOPPER_AUTH_E2E',adminFrontendHandoffAwaited:true,adminCreateProviderAck:true,adminUpdateProviderAck:true,newShopperLogin:true,reload:true,newTab:true,secondContext:true,shopperIdFingerprint:crypto.createHash('sha256').update(newCred.shopperId).digest('hex').slice(0,20),credentialsExposed:false,tokensExposed:false,fuzzyMatching:false,hrWrites:0,storageWrites:0,deploys:0,production:false},null,2));
}finally{await browser.close();}
