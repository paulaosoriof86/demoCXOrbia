#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate9';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex'),fp=v=>sha(v).slice(0,24),now=()=>new Date().toISOString();
const write=(name,value)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:12,generatedAt:now(),production:false,readOnly:true,providerWrites:0,hrWrites:0,localStorageTruth:false,...extra};write('gate12-shopper-history.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}

const localShoppers=fs.readFileSync('app/modules/shoppers.js','utf8');
let remoteShoppers='';
try{
  const response=await fetch(`${HOSTING_URL}/modules/shoppers.js?gate12=${Date.now()}`,{headers:{'Cache-Control':'no-cache'}});
  ensure(response.ok,'RELEASE_COMPOSITION_FAILURE',{blocker:'GATE12_HOSTING_SHOPPERS_FETCH_FAILED',httpStatus:response.status});
  remoteShoppers=await response.text();
}catch(error){finish('RELEASE_COMPOSITION_FAILURE',{blocker:'GATE12_HOSTING_SHOPPERS_FETCH_FAILED',message:str(error?.message||error).slice(0,300)});}
const localShoppersSha=sha(localShoppers),remoteShoppersSha=sha(remoteShoppers);
ensure(localShoppersSha===remoteShoppersSha,'RELEASE_COMPOSITION_FAILURE',{blocker:'GATE12_HOSTING_SHOPPERS_PARITY_MISMATCH',localShoppersSha,remoteShoppersSha});

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const gate11=JSON.parse(fs.readFileSync(path.join(OUT,'gate11-approval-no-duplicate.json'),'utf8'));
ensure(gate11.decision==='PASS_GATE11_APPROVAL_NO_DUPLICATE','FUNCTIONAL_DEFECT',{blocker:'GATE12_REQUIRES_GATE11_PASS'});
const tenantId=str(gate11.tenantId),projectId=str(gate11.projectId),periodId=str(gate11.periodId);
ensure(tenantId&&projectId&&periodId,'SOURCE_FAILURE',{blocker:'GATE12_SCOPE_FROM_GATE11_MISSING'});

const members=await allDocs(db.collection('tenants').doc(tenantId).collection('users'));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(projectId)));
ensure(staff,'AUTH_FAILURE',{blocker:'GATE12_AUTHORIZED_ADMIN_MISSING'});
const browserToken=await auth.createCustomToken(staff.id);

let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'GATE12_PLAYWRIGHT_UNAVAILABLE'});}
const browser=await chromium.launch({headless:true});
const baseUrl=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(projectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
let result=null;
const pageErrors=[];
try{
  const ctx=await browser.newContext(),page=await ctx.newPage();
  page.on('pageerror',error=>pageErrors.push(str(error?.message||error).slice(0,500)));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async token=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(token);},browserToken);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,projectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(projectId)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,projectId},{timeout:120000});

  result=await page.evaluate(()=>{
    const D=window.CX?.data,CX0=window.CX;
    if(!D||!CX0) return {ok:false,blocker:'GATE12_CX_DATA_UNAVAILABLE'};
    const context=CX0.backendAuth?.context?.()||{};
    if(!(context.authenticated===true&&['super','admin'].includes(String(context.role||''))))return {ok:false,blocker:'GATE12_ADMIN_CONTEXT_NOT_AUTHORIZED'};
    const root=String(D.currentProjectId||'');
    const currentPeriod=String(D.currentPeriodId||'');
    const basePeriod=(D.projects||[]).find(p=>String(p.id)===currentPeriod)||(D.projects||[])[0];
    if(!root||!basePeriod)return {ok:false,blocker:'GATE12_ACTIVE_PROJECT_PERIOD_MISSING'};
    const target=(D.shoppers||[]).find(s=>CX0.data_shopperDataLevel?.(s)!=='protected_reference'&&String(s.nombre||'').trim());
    if(!target)return {ok:false,blocker:'GATE12_OPERATIONAL_SHOPPER_MISSING'};

    const priorId='__g12_prior_period__',foreignRoot='__g12_foreign_project__',foreignPeriodId='__g12_foreign_period__';
    const priorLabel='G12 Prior Period',foreignLabel='G12 Foreign Period';
    const backup={projects:D.projects,periods:D.periods,visits:D._visitas,currentProjectId:D.currentProjectId,currentPeriodId:D.currentPeriodId};
    window.__CX_GATE12_BACKUP=backup;
    const countries=Array.isArray(basePeriod.countries)&&basePeriod.countries.length?basePeriod.countries:['GT'];
    const prior=Object.assign({},basePeriod,{id:priorId,rootProjectId:root,projectId:priorId,program:root,programLabel:D.previewMeta?.projectName||root,periodKey:'g12-prior',periodLabel:priorLabel,periodo:priorLabel,ronda:priorLabel,name:priorLabel,countries});
    const foreign=Object.assign({},basePeriod,{id:foreignPeriodId,rootProjectId:foreignRoot,projectId:foreignPeriodId,program:foreignRoot,programLabel:'G12 Foreign Project',periodKey:'g12-foreign',periodLabel:foreignLabel,periodo:foreignLabel,ronda:foreignLabel,name:foreignLabel,countries});
    D.projects=[...(D.projects||[]).filter(p=>![priorId,foreignPeriodId].includes(String(p.id))),prior,foreign];
    if(Array.isArray(D.periods))D.periods=[...D.periods.filter(p=>![priorId,foreignPeriodId].includes(String(p.id))),prior,foreign];
    const other=(D._visitas||[]).filter(v=>String(v.shopperId||'')!==String(target.id));
    const mk=(id,rootProjectId,periodId,periodLabel,sucursal,estado,score,date)=>({id,visitId:id,tenantId:'tya',rootProjectId,projectId:periodId,periodId,periodKey:periodId,periodLabel,shopperId:target.id,shopper:target.nombre,sucursal,ciudad:'Gate12',pais:countries[0],escenario:'Gate 12 history fixture',estado,score,realizada:date,sourceSafe:true});
    D._visitas=[...other,
      mk('__g12_current_visit__',root,currentPeriod,'G12 Current Period','G12_CUR','realizada',91,'2026-09-01'),
      mk('__g12_prior_visit__',root,priorId,priorLabel,'G12_PRIOR','liquidada',84,'2026-08-01'),
      mk('__g12_foreign_visit__',foreignRoot,foreignPeriodId,foreignLabel,'G12_FOREIGN','realizada',13,'2026-07-01')
    ];
    try{localStorage.setItem('cx_revision',JSON.stringify({__g12_current_visit__:{estado:'rejected',score:999,note:'G12_LOCALSTORAGE_POISON'}}));}catch(_){}
    CX0.router?.nav?.('shoppers');
    return {ok:true,targetId:String(target.id),targetFingerprint:null,root,currentPeriod,priorId,foreignRoot};
  });
  ensure(result?.ok,'FUNCTIONAL_DEFECT',{blocker:result?.blocker||'GATE12_FIXTURE_SETUP_FAILED'});
  result.targetFingerprint=fp(result.targetId);

  await page.waitForSelector('#shBody [data-sid]',{timeout:30000});
  const rowClicked=await page.evaluate(targetId=>{const row=[...document.querySelectorAll('#shBody [data-sid]')].find(x=>String(x.dataset.sid)===String(targetId));if(!row)return false;row.click();return true;},result.targetId);
  ensure(rowClicked,'FUNCTIONAL_DEFECT',{blocker:'GATE12_SHOPPER_ROW_NOT_RENDERED',shopperFingerprint:result.targetFingerprint});
  await page.waitForSelector('#shKpis [data-k="all"]',{timeout:30000});
  const profile=await page.evaluate(targetId=>{
    const all=document.querySelector('#shKpis [data-k="all"]');
    return {identityVisible:!!document.querySelector(`[data-sid="${CSS.escape(targetId)}"]`)&&!!all,kpiText:String(all?.innerText||all?.textContent||'').trim()};
  },result.targetId);
  const scopedKpiExact=/(^|\D)2(\D|$)/.test(profile.kpiText);
  ensure(scopedKpiExact,'FUNCTIONAL_DEFECT',{blocker:'GATE12_SCOPED_KPI_NOT_EXACT',kpiText:profile.kpiText,shopperFingerprint:result.targetFingerprint});

  await page.locator('#shKpis [data-k="all"]').click();
  await page.waitForFunction(()=>String(document.body.innerText||'').includes('G12_CUR')&&String(document.body.innerText||'').includes('G12_PRIOR'),null,{timeout:30000});
  const observed=await page.evaluate(()=>{
    const text=String(document.body.innerText||'');
    const lower=text.toLowerCase();
    return {
      currentPeriodVisible:text.includes('G12 Current Period'),
      priorPeriodVisible:text.includes('G12 Prior Period'),
      foreignProjectExcluded:!text.includes('G12_FOREIGN')&&!text.includes('G12 Foreign Period')&&!text.includes('G12 Foreign Project'),
      periodColumnVisible:text.includes('Periodo'),
      evaluationColumnVisible:text.includes('Evaluación'),
      currentEvaluationVisible:/(^|\D)91(\D|$)/.test(text),
      priorEvaluationVisible:/(^|\D)84(\D|$)/.test(text),
      statusesVisible:lower.includes('realizada')&&lower.includes('liquidada'),
      currentVisitVisible:text.includes('G12_CUR'),
      priorVisitVisible:text.includes('G12_PRIOR'),
      localStoragePoisonExcluded:!text.includes('G12_LOCALSTORAGE_POISON')&&!/(^|\D)999(\D|$)/.test(text)
    };
  });
  const acceptance={authorizedAdmin:true,identityVisible:profile.identityVisible,scopedKpiExact,...observed};
  ensure(Object.values(acceptance).every(Boolean),'FUNCTIONAL_DEFECT',{blocker:'GATE12_HISTORY_ACCEPTANCE_INCOMPLETE',acceptance,shopperFingerprint:result.targetFingerprint,pageErrors});

  await page.evaluate(()=>{
    const D=window.CX?.data,b=window.__CX_GATE12_BACKUP;
    if(D&&b){D.projects=b.projects;if(b.periods!==undefined)D.periods=b.periods;D._visitas=b.visits;D.currentProjectId=b.currentProjectId;D.currentPeriodId=b.currentPeriodId;}
    try{localStorage.removeItem('cx_revision');}catch(_){}
    delete window.__CX_GATE12_BACKUP;
  });
  result={...result,...acceptance};
}finally{await browser.close();}

finish('PASS_GATE12_SHOPPER_HISTORY',{gate11:'PASS_LOCKED',sourceSha:process.env.SOURCE_SHA||null,tenantId,projectId,periodId,shopperFingerprint:result.targetFingerprint,authorizedAdmin:result.authorizedAdmin,identityVisible:result.identityVisible,currentPeriodVisible:result.currentPeriodVisible,priorPeriodVisible:result.priorPeriodVisible,foreignProjectExcluded:result.foreignProjectExcluded,periodColumnVisible:result.periodColumnVisible,evaluationColumnVisible:result.evaluationColumnVisible,currentEvaluationVisible:result.currentEvaluationVisible,priorEvaluationVisible:result.priorEvaluationVisible,statusesVisible:result.statusesVisible,scopedKpiExact:result.scopedKpiExact,localStoragePoisonExcluded:result.localStoragePoisonExcluded,hostingExactParity:true,localShoppersSha,remoteShoppersSha,pageErrors},0);
