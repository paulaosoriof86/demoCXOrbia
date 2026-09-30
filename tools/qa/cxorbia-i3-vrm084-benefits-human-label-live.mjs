#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';
import { settleVisibleShopperAuth } from '../../.github/control/RECOVERY-I3-BROWSER-AUTH-LIFECYCLE-20260919.mjs';

const ROOT=String(process.env.VRM084_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=process.env.VRM084_SOURCE;
const SOURCE_DIR=process.env.VRM084_SOURCE_DIR;
const OUT=process.env.VRM084_OUT||'.tmp/i3-vrm084';
const TENANT='tya',PROJECT='cinepolis',TARGET_NAME='cesar castillo';
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const profiles=(await tenant.collection('shoppers').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
const candidates=profiles.filter(p=>norm(p.nombre||p.name)===TARGET_NAME);
if(!candidates.length)throw new Error('VRM084_TARGET_PROFILE_MISSING');
const resolved=[];
for(const profileCandidate of candidates){
  const candidateShopperId=String(profileCandidate.shopperId||profileCandidate.id);
  const candidateMembers=(await tenant.collection('users').where('shopperId','==',candidateShopperId).get()).docs.map(d=>({id:d.id,...(d.data()||{})})).filter(m=>m.active!==false&&String(m.role)==='shopper');
  if(candidateMembers.length===1)resolved.push({profile:profileCandidate,shopperId:candidateShopperId,member:candidateMembers[0]});
}
if(!resolved.length)throw new Error('VRM084_TARGET_ACTIVE_IDENTITY_MISSING');
const hrResponse=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&vrm084='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
if(!hrResponse.ok)throw new Error('VRM084_HR_READ_FAILED:'+hrResponse.status);
const hr=await hrResponse.json(),hrVisits=Array.isArray(hr.visits)?hr.visits:[];
for(const item of resolved){
  const ids=new Set([item.shopperId,...(Array.isArray(item.profile.legacyLiveShopperIds)?item.profile.legacyLiveShopperIds:[]),...(Array.isArray(item.profile.exactAliases)?item.profile.exactAliases:[])].map(String));
  item.hrVisitCount=hrVisits.filter(v=>ids.has(String(v.shopperId||v.shopperID||''))).length;
}
const maxVisits=Math.max(...resolved.map(x=>x.hrVisitCount));
const operational=resolved.filter(x=>x.hrVisitCount===maxVisits&&x.hrVisitCount>0);
if(operational.length!==1)throw new Error('VRM084_TARGET_OPERATIONAL_IDENTITY_NOT_UNIQUE:'+operational.length+':maxVisits='+maxVisits);
const {profile,shopperId,member}=operational[0];
const credMod=await import(pathToFileURL(path.join(SOURCE_DIR,'backend/runtime/cxorbia-shopper-command-provider-v1.mjs')).href);
const credential=credMod.shopperCredentialRule(profile);
if(!credential?.ok)throw new Error('VRM084_TARGET_CREDENTIAL_NOT_DERIVABLE:'+String(credential?.reason||''));
const base=ROOT+'/index-backend-dev.html?'+new URLSearchParams({cxBackendPreview:'YES_PAULA_20260628_PREVIEW_DEV',cxProjectId:PROJECT,cxProtectedRuntime:'YES_PAULA_20260730_PROTECTED_DEV',cxHumanFullVisual:'YES_PAULA_20260731_FULL_PROFILE_DEV'});
const browser=await chromium.launch({headless:true});const ctx=await browser.newContext({viewport:{width:1440,height:1000}});const page=await ctx.newPage();
await settleVisibleShopperAuth({page,rawShopperId:shopperId,canonicalShopperId:shopperId,tenantId:TENANT,projectId:PROJECT,baseUrl:base,login:credential.login,password:credential.password});
await page.waitForFunction(()=>window.CX?.session?.role==='shopper'&&document.querySelector('#nav-beneficios'),null,{timeout:90000});
await page.locator('#nav-beneficios').click();
await page.waitForFunction(()=>window.CX?.session?.view==='beneficios'&&/Mis Beneficios/i.test(document.querySelector('#view')?.innerText||'')&&/Detalle por visita/i.test(document.querySelector('#view')?.innerText||''),null,{timeout:90000});
await page.waitForTimeout(1500);
const viewText=await page.locator('#view').innerText();
const technical=/pending_source_confirmation|pending_financial_source|pending_or_review|honorarium_pending_source|hr_operational_amount_pending_financial_reconciliation/i.test(viewText);
const human=/Pendiente de confirmación|Pago confirmado|Pendiente de validación/i.test(viewText);
const heading=/Mis Beneficios/i.test(viewText);
const humanHeader=/Estado de pago/i.test(viewText);
const authorityApplied=await page.evaluate(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true);
await page.screenshot({path:path.join(OUT,'vrm084-beneficios.png'),fullPage:true});
const result={decision:heading&&humanHeader&&!technical&&authorityApplied?'PASS_I3_VRM084_BENEFITS_HUMAN_LABEL':'FAIL_I3_VRM084_BENEFITS_HUMAN_LABEL',sourceSha:SOURCE,target:{shopperId,name:profile.nombre||profile.name,uid:member.id},heading,humanHeaderVisible:humanHeader,humanLabelVisible:human,technicalTokenVisible:technical,authorityApplied,revision:await page.evaluate(()=>String(window.CX?.data?.previewMeta?.sourceRevision||window.CX_TYA_HR_LIVE_META?.revision||'')),safety:{writes:0,hrWrites:0,authWrites:0,production:false}};
fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
await ctx.close();await browser.close();
if(result.decision!=='PASS_I3_VRM084_BENEFITS_HUMAN_LABEL')process.exitCode=1;
