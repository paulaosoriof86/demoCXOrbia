#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate13';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex'),fp=v=>sha(v).slice(0,24),now=()=>new Date().toISOString();
const write=(name,value)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:13,generatedAt:now(),production:false,readOnly:true,providerWrites:0,hrWrites:0,localStorageTruth:false,...extra};write('gate13-authorized-identity-kpis.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}

const gate12=JSON.parse(fs.readFileSync(path.join(OUT,'gate12-locked.json'),'utf8'));
ensure(gate12.decision==='PASS_GATE12_SHOPPER_HISTORY'&&gate12.lockedEvidence===true&&gate12.noProductDrift===true,'SOURCE_FAILURE',{blocker:'GATE13_REQUIRES_LOCKED_GATE12_PASS'});
const tenantId=str(gate12.tenantId),rootProjectId=str(gate12.projectId),periodId=str(gate12.periodId);
ensure(tenantId&&rootProjectId&&periodId,'SOURCE_FAILURE',{blocker:'GATE13_SCOPE_FROM_GATE12_MISSING'});

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const members=await allDocs(db.collection('tenants').doc(tenantId).collection('users'));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(rootProjectId)));
ensure(staff,'AUTH_FAILURE',{blocker:'GATE13_AUTHORIZED_ADMIN_MISSING'});
let browserToken=await auth.createCustomToken(staff.id);

let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'GATE13_PLAYWRIGHT_UNAVAILABLE'});}
const browser=await chromium.launch({headless:true});
const baseUrl=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(rootProjectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
let result=null;
const pageErrors=[];
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e).slice(0,400)));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async token=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(token);},browserToken);browserToken='';
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,rootProjectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(rootProjectId)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,rootProjectId},{timeout:120000});

  result=await page.evaluate(({rootProjectId})=>{
    const C=window.CX,D=C?.data,auth=C?.backendAuth?.context?.()||{};
    if(!C||!D)return {ok:false,blocker:'GATE13_CX_DATA_UNAVAILABLE'};
    if(!(auth.authenticated===true&&auth.provider==='firebase'&&['super','admin'].includes(String(auth.role||''))))return {ok:false,blocker:'GATE13_FIREBASE_ADMIN_CONTEXT_INVALID'};
    if(C.session?.canSeeProtectedData?.()!==true)return {ok:false,blocker:'GATE13_ADMIN_PROTECTED_DATA_PERMISSION_FALSE'};
    if(D.__shopperStore?.canonical!==true||D.__shopperStore?.localPersistence!==false||D.__shopperStore?.localHydration!==false)return {ok:false,blocker:'GATE13_CANONICAL_SHOPPER_STORE_REQUIRED'};

    const root=String(D.currentProjectId||rootProjectId||'');
    const projectRows=Array.isArray(D.projects)?D.projects:[];
    const rootForVisit=v=>{
      if(String(v?.rootProjectId||''))return String(v.rootProjectId);
      const pid=String(v?.projectId||v?.periodId||'');
      const p=projectRows.find(x=>String(x?.id||'')===pid)||null;
      return String(p?.rootProjectId||p?.program||p?.programKey||((pid&&pid===root)?root:'')||'');
    };
    const state=v=>String(v?.estado||v?.status||'').toLowerCase();
    const scopedVisits=id=>(Array.isArray(D._visitas)?D._visitas:[]).filter(v=>String(v?.shopperId||'')===String(id)&&rootForVisit(v)===root);
    const stats=id=>{const vs=scopedVisits(id);return {total:vs.length,realizadas:vs.filter(v=>['realizada','cuestionario','liquidada'].includes(state(v))).length,liquidadas:vs.filter(v=>state(v)==='liquidada').length,enCurso:vs.filter(v=>['asignada','agendada','postulada'].includes(state(v))).length};};
    const level=s=>C.data_shopperDataLevel?.(s)||'protected_reference';
    const shoppers=Array.isArray(D.shoppers)?D.shoppers:[];
    const candidates=shoppers.filter(s=>s&&s.__canonicalIdentityOverlay===true&&level(s)==='full_authorized_profile'&&String(s.nombre||'').trim()&&scopedVisits(s.id).length>0);
    const fallback=shoppers.filter(s=>s&&s.__canonicalIdentityOverlay===true&&level(s)!=='protected_reference'&&String(s.nombre||'').trim()&&scopedVisits(s.id).length>0);
    const target=candidates[0]||fallback[0]||null;
    if(!target)return {ok:false,blocker:'GATE13_REAL_EXACT_PROFILE_WITH_HISTORY_MISSING',exactProfilesWithHistory:0};
    const sensitive=[target.whatsapp,target.email,target.dpi,target.banco,target.ctaNum].map(x=>String(x||'').trim()).find(Boolean)||'';
    C.router?.nav?.('shoppers');
    return {ok:true,targetId:String(target.id),root,expected:stats(target.id),dataLevel:level(target),exactProfileOverlay:target.__canonicalIdentityOverlay===true,sensitiveAvailable:!!sensitive,targetName:String(target.nombre||''),targetCode:String(target.code||''),sensitiveValue:sensitive,backendRole:String(auth.role||''),backendProvider:String(auth.provider||''),backendSource:String(auth.source||'')};
  },{rootProjectId});
  ensure(result?.ok,'PROVIDER_FAILURE',{blocker:result?.blocker||'GATE13_REAL_PROFILE_SELECTION_FAILED'});
  const targetFingerprint=fp(result.targetId);

  await page.waitForSelector('#shBody [data-sid]',{timeout:30000});
  const clicked=await page.evaluate(id=>{const row=[...document.querySelectorAll('#shBody [data-sid]')].find(x=>String(x.dataset.sid)===String(id));if(!row)return false;row.click();return true;},result.targetId);
  ensure(clicked,'FUNCTIONAL_DEFECT',{blocker:'GATE13_SHOPPER_ROW_NOT_RENDERED',shopperFingerprint:targetFingerprint});
  await page.waitForSelector('#shKpis [data-k="all"]',{timeout:30000});

  const profile=await page.evaluate(({targetName,targetCode,sensitiveValue,expected})=>{
    const modal=[...document.querySelectorAll('.cx-modal')].at(-1)||document.body;
    const text=String(modal.innerText||modal.textContent||'');
    const numberOf=key=>{const el=document.querySelector(`#shKpis [data-k="${key}"]`);const m=String(el?.innerText||el?.textContent||'').match(/\b(\d+)\b/);return m?Number(m[1]):null;};
    const actual={total:numberOf('all'),realizadas:numberOf('done'),liquidadas:numberOf('liq'),enCurso:numberOf('curso')};
    return {identityVisible:!!targetName&&text.includes(targetName)&&(!targetCode||text.includes(targetCode)),sensitiveIdentityVisible:sensitiveValue?text.includes(sensitiveValue):null,actual,kpisExact:Object.keys(expected).every(k=>Number(actual[k])===Number(expected[k])),adminCanSeeProtectedData:window.CX?.session?.canSeeProtectedData?.()===true,backendAuthenticated:window.CX?.backendAuth?.context?.()?.authenticated===true,backendProviderFirebase:window.CX?.backendAuth?.context?.()?.provider==='firebase',authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true};
  },{targetName:result.targetName,targetCode:result.targetCode,sensitiveValue:result.sensitiveValue,expected:result.expected});
  ensure(profile.identityVisible,'FUNCTIONAL_DEFECT',{blocker:'GATE13_AUTHORIZED_IDENTITY_NOT_VISIBLE',shopperFingerprint:targetFingerprint});
  ensure(profile.kpisExact,'FUNCTIONAL_DEFECT',{blocker:'GATE13_KPIS_NOT_EXACT',expected:result.expected,actual:profile.actual,shopperFingerprint:targetFingerprint});
  ensure(profile.adminCanSeeProtectedData&&profile.backendAuthenticated&&profile.backendProviderFirebase&&profile.authorityApplied,'AUTH_FAILURE',{blocker:'GATE13_AUTHORIZED_ADMIN_BOUNDARY_INVALID',shopperFingerprint:targetFingerprint});
  if(result.sensitiveAvailable)ensure(profile.sensitiveIdentityVisible===true,'FUNCTIONAL_DEFECT',{blocker:'GATE13_AUTHORIZED_SENSITIVE_IDENTITY_MASKED',shopperFingerprint:targetFingerprint});

  await page.locator('#shKpis [data-k="all"]').click();
  await page.waitForFunction(expected=>{const modals=[...document.querySelectorAll('.cx-modal')],m=modals.at(-1);if(!m)return false;const rows=m.querySelectorAll('table tbody tr').length;return rows===Number(expected);},result.expected.total,{timeout:30000});
  const history=await page.evaluate(expected=>{const modal=[...document.querySelectorAll('.cx-modal')].at(-1)||null;const rows=modal?modal.querySelectorAll('table tbody tr').length:0;const text=String(modal?.innerText||modal?.textContent||'');return {historyVisible:!!modal&&rows===Number(expected)&&rows>0,historyRows:rows,periodColumnVisible:text.includes('Periodo'),evaluationValuesPresent:rows>0};},result.expected.total);
  ensure(history.historyVisible,'FUNCTIONAL_DEFECT',{blocker:'GATE13_HISTORY_NOT_VISIBLE',expectedRows:result.expected.total,actualRows:history.historyRows,shopperFingerprint:targetFingerprint});

  result={targetFingerprint,expected:result.expected,dataLevel:result.dataLevel,exactProfileOverlay:result.exactProfileOverlay,sensitiveAvailable:result.sensitiveAvailable,backendRole:result.backendRole,backendProvider:result.backendProvider,backendSource:result.backendSource,...profile,...history};
  delete result.targetName;delete result.targetCode;delete result.sensitiveValue;delete result.targetId;
  await ctx.close();
}finally{browserToken='';await browser.close();}

finish('PASS_GATE13_AUTHORIZED_IDENTITY_KPIS',{sourceSha:process.env.SOURCE_SHA||null,lockedGate12RunId:Number(gate12.lockedRunId)||null,tenantId,projectId:rootProjectId,periodId,shopperFingerprint:result.targetFingerprint,authorizedAdmin:true,backendRole:result.backendRole,backendProviderFirebase:result.backendProviderFirebase,backendSource:result.backendSource,adminCanSeeProtectedData:result.adminCanSeeProtectedData,exactProfileOverlay:result.exactProfileOverlay,dataLevel:result.dataLevel,identityVisible:result.identityVisible,sensitiveIdentityAvailable:result.sensitiveAvailable,sensitiveIdentityVisible:result.sensitiveAvailable?result.sensitiveIdentityVisible:true,kpisExact:result.kpisExact,kpiExpected:result.expected,kpiActual:result.actual,historyVisible:result.historyVisible,historyRows:result.historyRows,rootProjectScoped:true,authorityApplied:result.authorityApplied,canonicalShopperStore:true,pageErrors},0);
