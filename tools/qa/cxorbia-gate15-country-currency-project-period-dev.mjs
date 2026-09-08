#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate15';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex'),fp=v=>sha(v).slice(0,24),now=()=>new Date().toISOString();
const write=(name,value)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:15,generatedAt:now(),production:false,readOnly:true,providerWrites:0,hrWrites:0,localStorageTruth:false,...extra};write('gate15-country-currency-project-period.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}
async function jsonFetch(url){const r=await fetch(url,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});const b=await r.json().catch(()=>null);return {response:r,body:b};}
const visitKey=v=>str(v?.hrRowId)||(str(v?.sourceTab)&&str(v?.sourceRow)?`${str(v.sourceTab)}::${str(v.sourceRow)}`:str(v?.id||v?.visitId));

const gate14=JSON.parse(fs.readFileSync(path.join(OUT,'gate14-locked.json'),'utf8'));
ensure(gate14.decision==='PASS_GATE14_KPIS_SAME_EXTERNAL_HR_REVISION'&&gate14.lockedEvidence===true&&gate14.noProductDrift===true,'SOURCE_FAILURE',{blocker:'GATE15_REQUIRES_LOCKED_GATE14_PASS'});
const tenantId=str(gate14.tenantId),rootProjectId=str(gate14.projectId);
ensure(tenantId&&rootProjectId,'SOURCE_FAILURE',{blocker:'GATE15_SCOPE_FROM_GATE14_MISSING'});

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const members=await allDocs(db.collection('tenants').doc(tenantId).collection('users'));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(rootProjectId)));
ensure(staff,'AUTH_FAILURE',{blocker:'GATE15_AUTHORIZED_ADMIN_MISSING'});
let browserToken=await auth.createCustomToken(staff.id);

let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'GATE15_PLAYWRIGHT_UNAVAILABLE'});}
const browser=await chromium.launch({headless:true});
const baseUrl=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(rootProjectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
let result=null;const pageErrors=[];
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e).slice(0,400)));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async token=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(token);},browserToken);browserToken='';
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,rootProjectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(rootProjectId)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,rootProjectId},{timeout:120000});

  const browserState=await page.evaluate(({rootProjectId})=>{
    const D=window.CX?.data,C=window.CX;if(!D||!C)return {ok:false,blocker:'GATE15_CX_DATA_UNAVAILABLE'};
    const revision=String(D.previewMeta?.sourceRevision||'');
    if(!/^[a-f0-9]{64}$/.test(revision))return {ok:false,blocker:'GATE15_BROWSER_HR_REVISION_INVALID',revision};
    const periods=(Array.isArray(D.projects)?D.projects:[]).map(p=>({id:String(p?.id||''),tenantId:String(p?.tenantId||''),rootProjectId:String(p?.rootProjectId||''),projectId:String(p?.projectId||''),periodKey:String(p?.periodKey||''),periodo:String(p?.periodo||''),countries:Array.isArray(p?.countries)?p.countries.map(String):[],currency:p?.currency&&typeof p.currency==='object'?{...p.currency}:{}}));
    const visits=(Array.isArray(D._visitas)?D._visitas:[]).map(v=>({key:String(v?.hrRowId||((v?.sourceTab&&v?.sourceRow)?`${v.sourceTab}::${v.sourceRow}`:(v?.id||v?.visitId||''))),id:String(v?.id||v?.visitId||''),tenantId:String(v?.tenantId||''),rootProjectId:String(v?.rootProjectId||''),projectId:String(v?.projectId||''),periodKey:String(v?.periodKey||''),periodLabel:String(v?.periodLabel||''),pais:String(v?.pais||''),country:String(v?.country||''),currency:String(v?.currency||'')}));
    const per=D.period?.()||null,project=D.project?.()||null,ctx=D.ctx?.()||{};
    return {ok:true,revision,currentProjectId:String(D.currentProjectId||''),currentPeriodId:String(D.currentPeriodId||''),activePeriod:per?{id:String(per.id||''),periodKey:String(per.periodKey||''),periodo:String(per.periodo||''),rootProjectId:String(per.rootProjectId||'')}:null,activeProject:project?{id:String(project.id||''),activePeriodId:String(project.activePeriodId||''),rootProjectId:String(project.rootProjectId||'')}:null,context:{tenantId:String(ctx.tenantId||''),projectId:String(ctx.projectId||''),periodId:String(ctx.periodId||'')},periods,visits,authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,sourceMode:String(D.sourceMode||''),visibleContract:window.CX_TYA_VISIBLE_DATA_CONTRACT||null};
  },{rootProjectId});
  ensure(browserState?.ok,browserState?.blocker==='GATE15_BROWSER_HR_REVISION_INVALID'?'ENVIRONMENT_FAILURE':'PROVIDER_FAILURE',{blocker:browserState?.blocker||'GATE15_BROWSER_STATE_FAILED'});

  const external=await jsonFetch(`${HOSTING_URL}/api/tya/cinepolis/hr-live?format=json&gate15_cache=${Date.now()}`);
  ensure(external.response.ok&&external.body,'ENVIRONMENT_FAILURE',{blocker:`GATE15_EXTERNAL_HR_HTTP_${external.response.status}`});
  const snapshot=external.body?.snapshot||external.body?.data||external.body,runtime={...(external.body?._runtime||{}),...(snapshot?._runtime||{})};
  ensure(snapshot?.sourceSafe===true&&arr(snapshot?.periods).length>0&&arr(snapshot?.visits).length>0,'SOURCE_FAILURE',{blocker:'GATE15_EXTERNAL_HR_SNAPSHOT_INVALID'});
  const externalRevision=str(runtime.revision);
  ensure(/^[a-f0-9]{64}$/.test(externalRevision),'SOURCE_FAILURE',{blocker:'GATE15_EXTERNAL_HR_REVISION_INVALID'});
  ensure(externalRevision===browserState.revision,'ENVIRONMENT_FAILURE',{blocker:'GATE15_PROVIDER_CACHE_NOT_BROWSER_REVISION',externalRevision,browserRevision:browserState.revision});

  const externalPeriods=arr(snapshot.periods),externalVisits=arr(snapshot.visits);
  const externalPeriodByKey=new Map(externalPeriods.map(p=>[str(p?.key||p?.periodKey),p]));
  ensure(externalPeriodByKey.size===externalPeriods.length,'SOURCE_FAILURE',{blocker:'GATE15_EXTERNAL_DUPLICATE_PERIOD_KEYS',externalRevision});
  const browserPeriodByKey=new Map(browserState.periods.map(p=>[p.periodKey,p]));
  const periodMismatches=[];
  for(const [key,p] of externalPeriodByKey){
    const b=browserPeriodByKey.get(key),expectedId=`${rootProjectId}-${key}`;
    if(!b||b.id!==expectedId||b.projectId!==expectedId||b.rootProjectId!==rootProjectId||b.tenantId!==tenantId||b.periodo!==str(p?.label||p?.periodo||''))periodMismatches.push({periodKey:key,expectedId,observed:b?{id:b.id,projectId:b.projectId,rootProjectId:b.rootProjectId,tenantId:b.tenantId,periodo:b.periodo}:null});
  }
  if(browserPeriodByKey.size!==externalPeriodByKey.size)periodMismatches.push({periodCount:{external:externalPeriodByKey.size,browser:browserPeriodByKey.size}});

  const browserVisitByKey=new Map(browserState.visits.map(v=>[v.key,v]));
  ensure(browserVisitByKey.size===browserState.visits.length,'FUNCTIONAL_DEFECT',{blocker:'GATE15_BROWSER_DUPLICATE_VISIT_TECHNICAL_KEYS',externalRevision});
  const countryMismatches=[],currencyMismatches=[],projectMismatches=[],visitPeriodMismatches=[],missingVisits=[];
  const countries=new Set(),currenciesByCountry={};
  for(const v of externalVisits){
    const key=visitKey(v),b=browserVisitByKey.get(key);if(!b){missingVisits.push(fp(key));continue;}
    const country=str(v?.pais||v?.country),currency=str(v?.currency),periodKey=str(v?.periodKey),expectedPeriodId=`${rootProjectId}-${periodKey}`;
    if(country)countries.add(country);if(country&&currency){if(!currenciesByCountry[country])currenciesByCountry[country]=new Set();currenciesByCountry[country].add(currency);}
    if(!['GT','HN'].includes(country)||b.pais!==country||b.country!==country)countryMismatches.push({visit:fp(key),expected:country,observed:{pais:b.pais,country:b.country}});
    if(!currency||b.currency!==currency)currencyMismatches.push({visit:fp(key),country,expected:currency||null,observed:b.currency||null});
    if(b.tenantId!==tenantId||b.rootProjectId!==rootProjectId||b.projectId!==expectedPeriodId)projectMismatches.push({visit:fp(key),expected:{tenantId,rootProjectId,projectId:expectedPeriodId},observed:{tenantId:b.tenantId,rootProjectId:b.rootProjectId,projectId:b.projectId}});
    if(!externalPeriodByKey.has(periodKey)||b.periodKey!==periodKey||b.projectId!==expectedPeriodId||b.periodLabel!==str(externalPeriodByKey.get(periodKey)?.label||v?.periodLabel||''))visitPeriodMismatches.push({visit:fp(key),periodKey,expectedPeriodId,observed:{periodKey:b.periodKey,projectId:b.projectId,periodLabel:b.periodLabel}});
  }
  ensure(missingVisits.length===0,'MAPPING_FAILURE',{blocker:'GATE15_EXTERNAL_VISITS_MISSING_IN_BROWSER',count:missingVisits.length,sample:missingVisits.slice(0,10),externalRevision});
  ensure(browserState.visits.length===externalVisits.length,'FUNCTIONAL_DEFECT',{blocker:'GATE15_VISIT_COUNT_DIFFERS_FROM_EXTERNAL_HR',external:externalVisits.length,browser:browserState.visits.length,externalRevision});
  ensure(periodMismatches.length===0,'FUNCTIONAL_DEFECT',{blocker:'GATE15_PERIOD_MAPPING_INCORRECT',count:periodMismatches.length,sample:periodMismatches.slice(0,10),externalRevision});
  ensure(countryMismatches.length===0,'FUNCTIONAL_DEFECT',{blocker:'GATE15_COUNTRY_MAPPING_INCORRECT',count:countryMismatches.length,sample:countryMismatches.slice(0,10),externalRevision});
  ensure(currencyMismatches.length===0,'FUNCTIONAL_DEFECT',{blocker:'GATE15_CURRENCY_MAPPING_INCORRECT',count:currencyMismatches.length,sample:currencyMismatches.slice(0,10),externalRevision});
  ensure(projectMismatches.length===0,'FUNCTIONAL_DEFECT',{blocker:'GATE15_PROJECT_MAPPING_INCORRECT',count:projectMismatches.length,sample:projectMismatches.slice(0,10),externalRevision});
  ensure(visitPeriodMismatches.length===0,'FUNCTIONAL_DEFECT',{blocker:'GATE15_VISIT_PERIOD_MAPPING_INCORRECT',count:visitPeriodMismatches.length,sample:visitPeriodMismatches.slice(0,10),externalRevision});
  ensure(countries.has('GT')&&countries.has('HN'),'SOURCE_FAILURE',{blocker:'GATE15_EXPECTED_GT_HN_NOT_BOTH_PRESENT_IN_EXTERNAL_REVISION',countries:[...countries].sort(),externalRevision});
  const currencySets=Object.fromEntries(Object.entries(currenciesByCountry).map(([c,s])=>[c,[...s].sort()]));
  ensure((currencySets.GT||[]).length===1&&(currencySets.HN||[]).length===1,'SOURCE_FAILURE',{blocker:'GATE15_EXTERNAL_CURRENCY_NOT_UNIQUE_BY_COUNTRY',currencySets,externalRevision});

  const activeKey=str(browserState.activePeriod?.periodKey),activeExternal=externalPeriodByKey.get(activeKey)||null;
  ensure(browserState.currentProjectId===rootProjectId&&browserState.context.projectId===rootProjectId&&browserState.activeProject?.id===rootProjectId,'FUNCTIONAL_DEFECT',{blocker:'GATE15_ACTIVE_PROJECT_CONTEXT_INCORRECT',currentProjectId:browserState.currentProjectId,contextProjectId:browserState.context.projectId,activeProjectId:browserState.activeProject?.id||null});
  ensure(activeExternal&&browserState.currentPeriodId===`${rootProjectId}-${activeKey}`&&browserState.context.periodId===browserState.currentPeriodId&&browserState.activePeriod?.id===browserState.currentPeriodId&&browserState.activeProject?.activePeriodId===browserState.currentPeriodId,'FUNCTIONAL_DEFECT',{blocker:'GATE15_ACTIVE_PERIOD_CONTEXT_INCORRECT',activeKey,currentPeriodId:browserState.currentPeriodId,contextPeriodId:browserState.context.periodId,activePeriodId:browserState.activePeriod?.id||null,projectActivePeriodId:browserState.activeProject?.activePeriodId||null});
  ensure(browserState.context.tenantId===tenantId&&browserState.authorityApplied===true,'AUTH_FAILURE',{blocker:'GATE15_AUTHORITY_CONTEXT_INCORRECT',tenantId:browserState.context.tenantId,authorityApplied:browserState.authorityApplied});

  const external2=await jsonFetch(`${HOSTING_URL}/api/tya/cinepolis/hr-live?format=json&gate15_readback=${Date.now()}`),snapshot2=external2.body?.snapshot||external2.body?.data||external2.body,runtime2={...(external2.body?._runtime||{}),...(snapshot2?._runtime||{})},readbackRevision=str(runtime2.revision);
  ensure(external2.response.ok&&readbackRevision===externalRevision,'ENVIRONMENT_FAILURE',{blocker:'GATE15_PROVIDER_CACHE_CHANGED_DURING_CERTIFICATION',startRevision:externalRevision,endRevision:readbackRevision||null});

  result={externalRevision,browserRevision:browserState.revision,readbackRevision,externalPeriodCount:externalPeriods.length,externalVisitCount:externalVisits.length,countries:[...countries].sort(),currencySets,activeProjectId:browserState.currentProjectId,activePeriodId:browserState.currentPeriodId,activePeriodKey:activeKey,activePeriodLabel:str(activeExternal?.label||activeExternal?.periodo||''),periodMappingExact:true,countryMappingExact:true,currencyMappingExact:true,projectMappingExact:true,visitPeriodMappingExact:true,activeContextExact:true,authorityApplied:true};
  await ctx.close();
}finally{browserToken='';await browser.close();}
finish('PASS_GATE15_COUNTRY_CURRENCY_PROJECT_PERIOD',{sourceSha:process.env.SOURCE_SHA||null,lockedGate14RunId:Number(gate14.lockedRunId)||null,tenantId,projectId:rootProjectId,externalRevision:result.externalRevision,browserRevision:result.browserRevision,readbackRevision:result.readbackRevision,sameRevision:true,periodCount:result.externalPeriodCount,visitCount:result.externalVisitCount,countries:result.countries,currencySets:result.currencySets,activeProjectId:result.activeProjectId,activePeriodId:result.activePeriodId,activePeriodKey:result.activePeriodKey,activePeriodLabel:result.activePeriodLabel,periodMappingExact:true,countryMappingExact:true,currencyMappingExact:true,projectMappingExact:true,visitPeriodMappingExact:true,activeContextExact:true,authorityApplied:true,externalAuthority:'hr-live-runtime',comparisonIndependentFromLocalStorage:true,pageErrors},0);
