#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate18';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const fp=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex').slice(0,24),now=()=>new Date().toISOString();
const write=(n,v)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:18,generatedAt:now(),production:false,readOnly:true,providerWrites:0,hrWrites:0,localStorageTruth:false,...extra};write('gate18-admin-e2e.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}

const g17=JSON.parse(fs.readFileSync(path.join(OUT,'gate17-locked.json'),'utf8'));
ensure(g17.decision==='PASS_GATE17_SYNTAX_CONTRACTS'&&g17.lockedEvidence===true&&g17.noProductDrift===true,'SOURCE_FAILURE',{blocker:'GATE18_REQUIRES_LOCKED_GATE17_PASS'});
const tenantId=str(g17.tenantId||'tya'),projectId=str(g17.projectId||'cinepolis'),periodId=str(g17.periodId||'cinepolis-2026-09');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const members=await allDocs(db.collection('tenants').doc(tenantId).collection('users'));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(projectId)));
ensure(staff,'AUTH_FAILURE',{blocker:'GATE18_AUTHORIZED_ADMIN_MISSING'});
let token=await auth.createCustomToken(staff.id);
let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'GATE18_PLAYWRIGHT_UNAVAILABLE'});}
const browser=await chromium.launch({headless:true});
const url=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(projectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
const pageErrors=[];let result=null;
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e).slice(0,500)));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(t);},token);token='';
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,projectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(projectId)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,projectId},{timeout:120000});

  const base=await page.evaluate(({tenantId,projectId})=>{const C=window.CX,D=C?.data,a=C?.backendAuth?.context?.()||{},ctx=D?.ctx?.()||{};const rev=String(D?.previewMeta?.sourceRevision||'');const visits=Array.isArray(D?._visitas)?D._visitas:[],posts=Array.isArray(D?._posts)?D._posts:[],shoppers=Array.isArray(D?.shoppers)?D.shoppers:[];const level=s=>C?.data_shopperDataLevel?.(s)||'protected_reference';const target=shoppers.find(s=>s&&s.__canonicalIdentityOverlay===true&&level(s)!=='protected_reference'&&String(s.nombre||'').trim()&&visits.some(v=>String(v?.shopperId||'')===String(s.id)))||null;return {ok:!!C&&!!D&&a.authenticated===true&&a.provider==='firebase'&&['super','admin'].includes(String(a.role||''))&&C.session?.canSeeProtectedData?.()===true&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&D.__shopperStore?.canonical===true&&D.__shopperStore?.localPersistence===false,revision:rev,ctx,visitCount:visits.length,activeVisitCount:typeof D.visitas==='function'?D.visitas().length:0,postCount:posts.length,activePostCount:posts.filter(p=>String(p?.projectId||'')===String(D.currentPeriodId||'')).length,shopperCount:shoppers.length,visitName:String((typeof D.visitas==='function'?D.visitas():visits)[0]?.sucursal||''),targetId:target?String(target.id):'',targetName:target?String(target.nombre||''):'',targetHistory:target?visits.filter(v=>String(v?.shopperId||'')===String(target.id)).length:0,tenantMatch:String(ctx.tenantId||'')===tenantId,projectMatch:String(ctx.projectId||'')===projectId,periodId:String(ctx.periodId||''),role:String(a.role||'')};},{tenantId,projectId});
  ensure(base.ok&&/^[a-f0-9]{64}$/.test(base.revision)&&base.tenantMatch&&base.projectMatch&&base.periodId&&base.visitCount>0&&base.activeVisitCount>0&&base.shopperCount>0&&base.targetId,'PROVIDER_FAILURE',{blocker:'GATE18_ADMIN_RUNTIME_CONTEXT_INCOMPLETE',revision:base.revision||null,visitCount:base.visitCount,shopperCount:base.shopperCount});

  await page.evaluate(()=>window.CX.router.nav('dashboard'));
  await page.waitForFunction(()=>document.querySelectorAll('[data-kpi]').length>=5&&String(document.body.innerText||'').includes('Dashboard'),null,{timeout:30000});
  const dash=await page.evaluate(rev=>({kpiTiles:document.querySelectorAll('[data-kpi]').length,phaseTiles:document.querySelectorAll('[data-fase]').length,revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),contextProject:String(window.CX?.data?.currentProjectId||'')}),base.revision);
  ensure(dash.kpiTiles>=5&&dash.phaseTiles>0&&dash.revision===base.revision&&dash.contextProject===projectId,'FUNCTIONAL_DEFECT',{blocker:'GATE18_DASHBOARD_E2E_FAILED',dash});

  await page.evaluate(()=>window.CX.router.nav('visitas'));
  await page.waitForFunction(name=>{const t=String(document.body.innerText||'');return t.includes('Visitas')&&(!name||t.includes(name));},base.visitName,{timeout:30000});
  const visitsUi=await page.evaluate(rev=>({revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),hasVisitSurface:String(document.body.innerText||'').includes('Visitas'),activeVisits:Number(window.CX?.data?.visitas?.().length||0)}),base.revision);
  ensure(visitsUi.hasVisitSurface&&visitsUi.activeVisits===base.activeVisitCount&&visitsUi.revision===base.revision,'FUNCTIONAL_DEFECT',{blocker:'GATE18_VISITS_E2E_FAILED',visitsUi,expectedActiveVisits:base.activeVisitCount});

  await page.evaluate(()=>window.CX.router.nav('postulaciones'));
  await page.waitForSelector('#poKpis [data-k="todas"]',{timeout:30000});
  const postsUi=await page.evaluate(()=>{const el=document.querySelector('#poKpis [data-k="todas"]'),m=String(el?.innerText||el?.textContent||'').match(/\b(\d+)\b/);return {allKpi:m?Number(m[1]):null,renderedCards:document.querySelectorAll('#pGroups [data-pid]').length,revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),heading:String(document.body.innerText||'').includes('Gestión de Postulaciones')};});
  ensure(postsUi.heading&&postsUi.allKpi===base.activePostCount&&postsUi.renderedCards>=base.activePostCount&&postsUi.revision===base.revision,'FUNCTIONAL_DEFECT',{blocker:'GATE18_POSTULATIONS_E2E_FAILED',postsUi,expectedActivePosts:base.activePostCount});

  await page.evaluate(()=>window.CX.router.nav('shoppers'));
  await page.waitForSelector('#shBody [data-sid]',{timeout:30000});
  const clicked=await page.evaluate(id=>{const row=[...document.querySelectorAll('#shBody [data-sid]')].find(x=>String(x.dataset.sid)===String(id));if(!row)return false;row.click();return true;},base.targetId);
  ensure(clicked,'FUNCTIONAL_DEFECT',{blocker:'GATE18_SHOPPER_ROW_NOT_RENDERED',shopperFingerprint:fp(base.targetId)});
  await page.waitForSelector('#shKpis [data-k="all"]',{timeout:30000});
  const profile=await page.evaluate(({name,rev})=>{const modal=[...document.querySelectorAll('.cx-modal')].at(-1)||document.body,t=String(modal.innerText||modal.textContent||'');return {identityVisible:!!name&&t.includes(name),kpisVisible:document.querySelectorAll('#shKpis [data-k]').length===4,revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),protectedAccess:window.CX?.session?.canSeeProtectedData?.()===true};},{name:base.targetName,rev:base.revision});
  ensure(profile.identityVisible&&profile.kpisVisible&&profile.protectedAccess&&profile.revision===base.revision,'FUNCTIONAL_DEFECT',{blocker:'GATE18_SHOPPER_PROFILE_E2E_FAILED',shopperFingerprint:fp(base.targetId),profile});
  await page.locator('#shKpis [data-k="all"]').click();
  await page.waitForFunction(()=>{const m=[...document.querySelectorAll('.cx-modal')].at(-1);return !!m&&m.querySelectorAll('table tbody tr').length>0;},null,{timeout:30000});
  const history=await page.evaluate(()=>{const m=[...document.querySelectorAll('.cx-modal')].at(-1);return {rows:m?.querySelectorAll('table tbody tr').length||0,text:String(m?.innerText||m?.textContent||''),revision:String(window.CX?.data?.previewMeta?.sourceRevision||'')};});
  ensure(history.rows>0&&history.text.includes('Periodo')&&history.text.includes('Evaluación')&&history.revision===base.revision,'FUNCTIONAL_DEFECT',{blocker:'GATE18_SHOPPER_HISTORY_E2E_FAILED',shopperFingerprint:fp(base.targetId),historyRows:history.rows});

  const end=await page.evaluate(()=>({revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,authenticated:window.CX?.backendAuth?.context?.()?.authenticated===true,provider:window.CX?.backendAuth?.context?.()?.provider||null,localShopperPersistence:window.CX?.data?.__shopperStore?.localPersistence}));
  ensure(end.revision===base.revision&&end.authorityApplied&&end.authenticated&&end.provider==='firebase'&&end.localShopperPersistence===false,'ENVIRONMENT_FAILURE',{blocker:'GATE18_RUNTIME_CHANGED_DURING_E2E',startRevision:base.revision,endRevision:end.revision});
  ensure(pageErrors.length===0,'FUNCTIONAL_DEFECT',{blocker:'GATE18_BROWSER_PAGE_ERRORS',pageErrorCount:pageErrors.length,pageErrors});

  result={tenantId,projectId,periodId:base.periodId,sourceRevision:base.revision,adminRole:base.role,dashboardKpiTiles:dash.kpiTiles,dashboardPhaseTiles:dash.phaseTiles,activeVisitCount:base.activeVisitCount,activePostCount:base.activePostCount,renderedPostCards:postsUi.renderedCards,shopperFingerprint:fp(base.targetId),shopperIdentityVisible:true,shopperKpisVisible:true,shopperHistoryRows:history.rows,sourceRevisionStable:true,authorityApplied:true,protectedAdminAccess:true,pageErrors};
  await ctx.close();
}finally{token='';await browser.close();}
finish('PASS_GATE18_ADMIN_E2E',{sourceSha:process.env.SOURCE_SHA||null,lockedGate17RunId:Number(g17.lockedRunId)||null,...result},0);
