#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_004_BOUNDARY_OUT||'.tmp/prei4-admin-004-composer-boundary');
const ROOT=String(process.env.PREI4_004_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.PREI4_004_HR_REVISION||'');
const TENANT='tya',PROJECT='cinepolis';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),fp=v=>sha(v).slice(0,16);
const fail=m=>{throw new Error(m);};
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),project=db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT);
const ps=await project.get();if(!ps.exists)fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_MISSING');
const pc=ps.data()||{};
if(Number(pc?.honorario?.GT)!==60||Number(pc?.honorario?.HN)!==200)fail('PERSISTENCE_FAILURE:ADMIN004_CONFIG_DRIFT');

const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&boundaryDiagnostic='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrRes.ok)fail('PROVIDER_FAILURE:ADMIN004_PUBLIC_HR_'+hrRes.status);
const hb=await hrRes.json(),hr=hb?.snapshot||hb?.data||hb,rt=hb?._runtime||hr?._runtime||{},revision=str(rt.revision||hr.revision||hr.sourceRevision);
if(EXPECTED_HR&&revision!==EXPECTED_HR)fail('SOURCE_FAILURE:ADMIN004_HR_REVISION_DRIFT:'+revision);
const cfg=hr?.projectConfig||{},periodKey=str(process.env.PREI4_004_PERIOD_KEY||'2026-09');
const fallback=arr(hr.visits).filter(v=>{
  const c=str(v.pais||v.country),submitted=v?.canonicalFacets?.submitted===true||!!v?.submittedAt||['submitida','liquidada','pagada'].includes(str(v?.estado||v?.status).toLowerCase());
  return str(v.periodKey)===periodKey&&submitted&&!finite(v.honorario)&&finite(cfg?.honorario?.[c]);
}).sort((a,b)=>str(a.hrRowId||a.id).localeCompare(str(b.hrRowId||b.id)));
if(!fallback.length)fail('MAPPING_FAILURE:ADMIN004_NO_CURRENT_PERIOD_SUBMITTED_FALLBACK_VISITS:'+periodKey);
const rawTarget=fallback[0],target={id:str(rawTarget.id||rawTarget.visitId),row:str(rawTarget.hrRowId),periodKey:str(rawTarget.periodKey),country:str(rawTarget.pais||rawTarget.country),configured:Number(cfg.honorario[str(rawTarget.pais||rawTarget.country)])};
if(!target.id&&!target.row)fail('MAPPING_FAILURE:ADMIN004_TARGET_KEY_MISSING');

let admin=null,pageToken;
for(let p=0;p<10&&!admin;p++){
  const lu=await auth.listUsers(1000,pageToken);
  for(const u of lu.users){
    const c=u.customClaims||{},role=str(c.role).toLowerCase(),ns=str(c.authNamespace).toLowerCase(),projects=arr(c.projectIds).map(str);
    if(str(c.tenantId)===TENANT&&ns==='staff'&&['super','admin','ops','coordinador'].includes(role)&&(role==='super'||projects.includes(PROJECT))){admin={uid:u.uid,role};break;}
  }
  pageToken=lu.pageToken;if(!pageToken)break;
}
if(!admin)fail('AUTH_FAILURE:ADMIN004_ADMIN_MISSING');

const browser=await chromium.launch({headless:true});
let proof=null;
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  let signed=false,last='';
  for(let a=1;a<=5&&!signed;a++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const tok=await auth.createCustomToken(admin.uid);
    try{await page.evaluate(async t=>{const fb=window.firebase;if(!fb?.auth)throw new Error('FIREBASE_NOT_READY');await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},tok);}catch(e){last=String(e?.message||e);if(!/FIREBASE_NOT_READY|firebase is not defined|Execution context was destroyed|navigation|network|timeout|interrupted/i.test(last))throw e;}
    await page.waitForTimeout(700*a);signed=await page.evaluate(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,admin.uid).catch(()=>false);
  }
  if(!signed)fail('AUTH_FAILURE:ADMIN004_ADMIN_SIGNIN:'+last);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({uid,rev})=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&String(window.CX?.dataSource?.sourceRef||'')==='hr-live-all-periods+firestore-authenticated-exact-overlay'&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev,{uid:admin.uid,rev:revision},{timeout:150000});

  proof=await page.evaluate(async ({target,revision})=>{
    const pick=(rows=[])=>rows.find(v=>String(v?.id||v?.visitId||'')===target.id||String(v?.hrRowId||'')===target.row)||null;
    const snap=v=>v?{id:String(v.id||v.visitId||''),hrRowId:String(v.hrRowId||''),country:String(v.pais||v.country||''),honorario:v.honorario??null,honorarioSource:v.honorarioSource??null,honorarioSourceKnown:v.honorarioSourceKnown===true}:null;
    const user=window.firebase?.auth?.().currentUser;if(!user)throw new Error('ADMIN004_BROWSER_PRINCIPAL_MISSING');
    const token=await user.getIdToken(false);
    const protectedUrl='/api/tenants/tya/projects/cinepolis/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&protectedState=1&boundary='+Date.now();
    const rr=await fetch(protectedUrl,{cache:'no-store',headers:{Authorization:'Bearer '+token,'Cache-Control':'no-cache, no-store'}});
    const pp=await rr.json();if(!rr.ok)throw new Error('ADMIN004_PROTECTED_HR_HTTP_'+rr.status);
    const ps=pp?.snapshot||pp?.data||pp;
    const protectedTarget=pick(ps?.visits||[]);
    const engine=window.CX_TYA_CUMULATIVE_READ_MODEL;if(!engine?.compose)throw new Error('ADMIN004_COMPOSER_MISSING');
    const original=engine.compose;
    window.__CX_ADMIN004_BOUNDARY={};
    engine.compose=function(input){
      const inputTarget=pick(input?.hr?.visits||[]);
      window.__CX_ADMIN004_BOUNDARY.composeInput=snap(inputTarget);
      const out=original.call(engine,input);
      window.__CX_ADMIN004_BOUNDARY.composeOutput=snap(pick(out?.visits||[]));
      return out;
    };
    let reconcileResult=null;
    try{
      for(let a=1;a<=6;a++){
        reconcileResult=await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY('admin004_boundary_diagnostic');
        if(reconcileResult?.ok===true&&window.__CX_ADMIN004_BOUNDARY.composeInput)break;
        await new Promise(r=>setTimeout(r,250*a));
      }
    }finally{engine.compose=original;}
    const finalVisit=pick(window.CX?.data?._visitas||[]);
    const finance=typeof window.CX?.liq?.forProject==='function'?pick(window.CX.liq.forProject(window.CX.data)||[]):null;
    return {
      protectedEndpoint:{projectConfigVersion:ps?.projectConfigVersion??null,projectConfigAuthority:ps?.projectConfigAuthority??null,honorario:{GT:ps?.projectConfig?.honorario?.GT??null,HN:ps?.projectConfig?.honorario?.HN??null},target:snap(protectedTarget)},
      composeInput:window.__CX_ADMIN004_BOUNDARY.composeInput||null,
      composeOutput:window.__CX_ADMIN004_BOUNDARY.composeOutput||null,
      finalVisit:snap(finalVisit),
      finance:finance?{honorario:finance.honorario??null,honorarioSource:finance.honorarioSource??null,honorarioSourceKnown:finance.honorarioSourceKnown===true,financialSourceStatus:finance.financialSourceStatus??null,reviewRequired:finance.reviewRequired===true}:null,
      reconcileOk:reconcileResult?.ok===true,
      sourceRef:String(window.CX?.dataSource?.sourceRef||''),
      sourceRevision:String(window.CX?.data?.previewMeta?.sourceRevision||''),
      expectedRevision:revision
    };
  },{target,revision});
  await ctx.close();
}finally{await browser.close();}

const known=x=>x?.honorarioSourceKnown===true&&finite(x?.honorario);
let classification;
if(Number(proof?.protectedEndpoint?.honorario?.[target.country])!==target.configured)classification='PROTECTED_ENDPOINT_DROPS_PROJECT_CONFIG';
else if(!known(proof?.composeInput))classification='BRIDGE_FALLBACK_NOT_APPLIED_BEFORE_COMPOSER';
else if(!known(proof?.composeOutput))classification='CUMULATIVE_COMPOSER_DROPS_CONFIGURED_HONORARIUM';
else if(!known(proof?.finalVisit))classification='POST_COMPOSITION_OVERWRITE';
else if(!known(proof?.finance))classification='FINANCE_READ_MODEL_DROPS_CONFIGURED_HONORARIUM';
else classification='PROPAGATION_CHAIN_EXACT';

const result={schemaVersion:'cxorbia.prei4.admin004.composer-boundary-diagnostic.v1',decision:'PASS_PREI4_ADMIN_004_COMPOSER_BOUNDARY_DIAGNOSTIC',classification,hrRevision:revision,target:{visitFp:fp(target.id),hrRowFp:fp(target.row),periodKey:target.periodKey,country:target.country,configuredHonorario:target.configured},proof,writes:0,builds:0,deploys:0,production:false};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
