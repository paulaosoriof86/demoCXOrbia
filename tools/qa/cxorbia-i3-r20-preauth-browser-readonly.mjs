#!/usr/bin/env node
/* I3 R20 one-pass pre-authenticated login screen diagnostic only.
   Never fill credentials, submit login, create tokens or write providers. */
import fs from 'node:fs';
import {chromium} from 'playwright';

const out=String(process.env.R20_PREAUTH_OUT||'.tmp/i3-r20-preauth');
const base=String(process.env.R20_PREAUTH_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const url=base+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV';
const result={schemaVersion:'cxorbia.i3.r20.preauth-browser-readonly.v1',
 decision:'HOLD_R20_PREAUTH_UI_NOT_PROVEN',sourceSha:String(process.env.FOCAL_SOURCE||''),
 browser:'chromium',canonicalUrl:'/index-backend-dev.html',preAuth:{},afterRole:{},
 loginAttempts:0,credentialsEntered:0,customTokensUsed:0,authWrites:0,
 providerWrites:0,hrWrites:0,deploys:0,production:false};
fs.mkdirSync(out,{recursive:true});
let browser=null;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>{errors.push(String(e?.name||'Error').replace(/[^a-zA-Z]/g,'').slice(0,25));});
 const start=Date.now();
 const resp=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
 const role=page.locator('.role-btn[data-role="shopper"]').first();
 await role.waitFor({state:'visible',timeout:35000});
 result.preAuth=await page.evaluate(()=>{
   const c=window.CX_DEV_ENTRY_CANONICAL||{},auth=window.CX?.backendAuth?.context?.()||{};
   return {canonical:c.canonical===true,previewSource:c.preAuthOperationalData==='none',
     protectedRuntime:c.protectedRuntime===true,projectScoped:c.projectId==='cinepolis',
     selectedRoleBefore:null,authBefore:auth.authenticated===true,loginFormVisible:!!document.querySelector('#loginForm'),
     roleShopperExists:!!document.querySelector('.role-btn[data-role="shopper"]')};
 });
 result.preAuth.httpStatus=resp?.status()||0;
 result.preAuth.readyMs=Date.now()-start;
 await role.click({timeout:10000});
 const user=page.locator('#lgUser').first(),pass=page.locator('#lgPass').first(),submit=page.locator('#lgSubmit').first();
 await user.waitFor({state:'visible',timeout:15000});
 await pass.waitFor({state:'visible',timeout:15000});
 await submit.waitFor({state:'visible',timeout:15000});
 result.afterRole=await page.evaluate(()=>{
   const u=document.querySelector('#lgUser'),p=document.querySelector('#lgPass'),s=document.querySelector('#lgSubmit');
   const form=document.querySelector('#loginForm'),c=window.CX?.backendAuth?.context?.()||{};
   return {roleSelected:form?.dataset?.selectedRole==='shopper'||document.querySelector('.role-btn[data-role="shopper"]')?.classList.contains('active')===true,
      usernameExists:!!u,passwordExists:!!p,submitExists:!!s,
      usernameAutocomplete:u?.getAttribute('autocomplete')||null,
      passwordAutocomplete:p?.getAttribute('autocomplete')||null,
      usernameEmpty:u?.value==='',passwordEmpty:p?.value==='',
      submitLabel:(s?.textContent||'').trim()==='Ingresar',
      authBeforeSubmit:c.authenticated===true,
      noAuthReadyYet:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied!==true};
 });
 result.pageErrorTypes=Array.from(new Set(errors)).slice(0,5);
 result.decision=(
   result.preAuth.canonical&&result.preAuth.previewSource&&result.preAuth.protectedRuntime&&
   result.preAuth.projectScoped&&result.preAuth.httpStatus===200&&
   !result.preAuth.authBefore&&result.preAuth.roleShopperExists&&
   result.afterRole.usernameExists&&result.afterRole.passwordExists&&result.afterRole.submitExists&&
   result.afterRole.usernameEmpty&&result.afterRole.passwordEmpty&&result.afterRole.submitLabel&&
   !result.afterRole.authBeforeSubmit&&result.afterRole.noAuthReadyYet
 )?'PASS_R20_PREAUTH_BROWSER_UI_READONLY_NOT_PASSWORD_E2E':'HOLD_R20_PREAUTH_BROWSER_UI_DEVIATION';
 result.scope='NO_CREDENTIALS_PURE_READONLY';
}catch(e){
 const name=String(e?.name||'Error').replace(/[^a-zA-Z]/g,'').slice(0,28);
 result.failureKind=name||'UnknownError';
 result.decision='HOLD_R20_PREAUTH_BROWSER_ENVIRONMENT_OR_UI';
}finally{
 try{await browser?.close();}catch(e){}
 fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
}
