#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_CONTENT001_OUT||'.tmp/prei4-content001-live');
const ROOT=String(process.env.PREI4_CONTENT001_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.PREI4_CONTENT001_SOURCE||'');
const TREE=String(process.env.PREI4_CONTENT001_TREE||'');
const EXPECTED_HR=String(process.env.PREI4_CONTENT001_HR_REVISION||'');
const TENANT='tya',PROJECT='cinepolis';
const GENERAL='https://example.invalid/cxorbia/general-questionnaire';
const VISIT='https://example.invalid/cxorbia/visit-questionnaire';
const WRONG='https://example.invalid/cxorbia/wrong-fallback';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const fail=m=>{throw new Error(m);};
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{40}$/.test(TREE)||!/^[a-f0-9]{64}$/.test(EXPECTED_HR))fail('ENVIRONMENT_FAILURE:CONTENT001_LIVE_ENV');
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth();

let shopper=null,pageToken=undefined;
for(let page=0;page<10&&!shopper;page++){
  const listed=await auth.listUsers(1000,pageToken);
  for(const u of listed.users){
    const c=u.customClaims||{},role=str(c.role).toLowerCase(),ns=str(c.authNamespace).toLowerCase(),projects=arr(c.projectIds).map(str),sid=str(c.shopperId);
    if(u.disabled!==true&&str(c.tenantId)===TENANT&&role==='shopper'&&ns==='shopper'&&sid&&projects.includes(PROJECT)){shopper={uid:u.uid,shopperId:sid};break;}
  }
  pageToken=listed.pageToken;if(!pageToken)break;
}
if(!shopper)fail('AUTH_FAILURE:CONTENT001_SHOPPER_MISSING');

const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:1440,height:980}});
const page=await ctx.newPage();
const URL=ROOT+'/index-backend-dev.html?cxProjectId=cinepolis';
const evidence={schemaVersion:'cxorbia.prei4.content001.live.v1',decision:'HOLD',sourceSha:SOURCE,sourceTree:TREE,hrRevision:EXPECTED_HR,production:false,writes:0,hrWrites:0};
try{
  let ok=false;
  for(let attempt=1;attempt<=5&&!ok;attempt++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(shopper.uid);
    try{await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);}catch(e){if(!/network|timeout|interrupted|Execution context was destroyed|navigation/i.test(String(e?.message||e)))throw e;}
    await page.waitForTimeout(700*attempt);
    ok=await page.evaluate(uid=>String(firebase.auth().currentUser?.uid||'')===uid,shopper.uid).catch(()=>false);
  }
  if(!ok)fail('AUTH_FAILURE:CONTENT001_SHOPPER_SIGNIN');
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({sid,rev})=>{
    const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
    return c.authenticated===true&&String(c.role||'').toLowerCase()==='shopper'&&String(c.shopperId||'')===sid&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(d.previewMeta?.sourceRevision||'')===rev;
  },{sid:shopper.shopperId,rev:EXPECTED_HR},{timeout:150000});

  const result=await page.evaluate(({general,visitUrl,wrong})=>{
    const d=window.CX?.data,ui=window.CX?.ui;
    if(typeof window.CX?.shopperQuestionnaire!=='function')throw new Error('QUESTIONNAIRE_RUNTIME_MISSING');
    const p=d.period();
    const v=(typeof d.visitsForShopper==='function'?d.visitsForShopper(String(window.CX?.session?.user?.shopperId||''),false):[])[0]||d._visitas?.[0]||{id:'qa-visit'};
    const originalProject=JSON.parse(JSON.stringify(p.cuestionario||{}));
    const originalVisit={questionnaireLink:v.questionnaireLink,cuestionarioUrl:v.cuestionarioUrl,linkCuestionario:v.linkCuestionario,urlCuestionario:v.urlCuestionario,hrQuestionnaireLink:v.hrQuestionnaireLink};
    const readModal=()=>{
      const ov=[...document.querySelectorAll('.cx-ov')].at(-1);
      const a=ov?.querySelector('a[href]');
      return {href:a?.getAttribute('href')||'',text:String(ov?.innerText||'')};
    };
    const closeModal=()=>{const ov=[...document.querySelectorAll('.cx-ov')].at(-1);if(ov)ov.remove();};

    p.cuestionario={modo:'externo_general',url:general,etiqueta:'QA general'};
    window.CX.shopperQuestionnaire(d,p,v,ui);
    const generalProof=readModal();closeModal();

    p.cuestionario={modo:'externo_visita',url:wrong,etiqueta:'QA visita'};
    v.questionnaireLink=visitUrl;v.cuestionarioUrl='';v.linkCuestionario='';v.urlCuestionario='';v.hrQuestionnaireLink='';
    window.CX.shopperQuestionnaire(d,p,v,ui);
    const visitProof=readModal();closeModal();

    p.cuestionario=originalProject;
    Object.assign(v,originalVisit);
    return {generalProof,visitProof,sourceRevision:String(d.previewMeta?.sourceRevision||''),projectId:String(d.currentProjectId||''),periodId:String(d.currentPeriodId||'')};
  },{general:GENERAL,visitUrl:VISIT,wrong:WRONG});

  if(result.sourceRevision!==EXPECTED_HR)fail('SOURCE_FAILURE:CONTENT001_BROWSER_REVISION');
  if(result.generalProof.href!==GENERAL||!/link general|cuestionario externo/i.test(result.generalProof.text))fail('FUNCTIONAL_DEFECT:CONTENT001_GENERAL_ROUTE:'+JSON.stringify(result.generalProof));
  if(result.visitProof.href!==VISIT||result.visitProof.href===WRONG||!/link propio por visita/i.test(result.visitProof.text))fail('FUNCTIONAL_DEFECT:CONTENT001_VISIT_ROUTE:'+JSON.stringify(result.visitProof));
  evidence.decision='PASS_PREI4_CONTENT001_AUTHENTICATED_SHOPPER_ROUTE';
  evidence.shopperFp=shopper.shopperId.slice(0,12);
  evidence.browser=result;
  fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence,null,2));
}catch(error){
  evidence.decision='FAIL_PREI4_CONTENT001_AUTHENTICATED_SHOPPER_ROUTE';
  evidence.error=String(error?.stack||error);
  fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n');
  throw error;
}finally{
  await ctx.close().catch(()=>{});
  await browser.close().catch(()=>{});
}
