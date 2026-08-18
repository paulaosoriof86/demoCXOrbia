#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const argv=process.argv.slice(2);
const arg=(name,fallback=null)=>{const i=argv.indexOf(name);return i>=0?argv[i+1]:fallback;};
const requestPath=path.resolve(arg('--request','backend/requests/i3-9-10-11-visible-login-close.json'));
const sourceRoot=path.resolve(arg('--source-root','.'));
const outPath=path.resolve(arg('--out','.tmp/i3-9-10-11-visible-login-close/result.json'));
const rootUrl='https://cxorbia-backend-dev.web.app';
const targetUrl=rootUrl+'/index-backend-dev.html';
const str=v=>String(v==null?'':v).trim();
const stable=v=>JSON.stringify(v,null,2)+'\n';
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const uidFingerprint=uid=>sha(Buffer.from('cxorbia-provider-uid-v1\0'+uid,'utf8'));
const internalEmail=(tenant,login)=>sha(Buffer.from(tenant+'\0shopper\0'+str(login).toLowerCase().normalize('NFC'),'utf8')).slice(0,48)+'@auth.cxorbia.invalid';
const providerEmailFingerprint=email=>sha(Buffer.from('provider-email\0'+email,'utf8'));
const readJson=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const uniq=a=>[...new Set(a)];

const result={
  schemaVersion:'cxorbia.i3.9-10-11.visible-login-close.result.v1',
  requestId:null,
  gateId:'I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE',
  productTargetHeadSha:null,
  targetProject:'cxorbia-backend-dev',
  status:'NOT_STARTED',decision:'NOT_STARTED',
  remoteParity:{indexExact:false,membershipAdapterExact:false,membershipLoaderPresent:false,sourceHeadExact:false},
  providerReads:{authUser:0,membership:0,profile:0,crosswalk:0},
  exactProvider:{user:false,claims:false,membership:false,profile:false,crosswalk:false,platformCreatedAuthority:false,periodIndependent:false,visibleLoginMapping:false},
  browser:{visibleLogin:false,providerAuth:false,claimsContext:false,membershipVerified:false,shopperSession:false,profileLoaded:false,projectScope:false,workspace:false,reload:false,newTab:false,secondLogicalContext:false},
  i3_10:{duplicateVisitIds:null,duplicateShopperIds:null,countsNonnegative:null,summaryConsistent:null,shopperStatsNonnegative:null,scopeConsistent:null,dynamicNoFixedTotals:true,status:'NOT_EVALUATED',decision:'NOT_EVALUATED'},
  i3_11:{priorI3_1_to_8FrozenPass:false,sameSourceBuild:false,i3_9Pass:false,i3_10Pass:false,status:'NOT_EVALUATED',decision:'NOT_EVALUATED'},
  safety:{historicalShopperAccess:0,historicalShopperLogin:0,historicalShopperRecovery:0,historicalShopperReset:0,userCreates:0,userUpdates:0,claimWrites:0,authWrites:0,passwordChanges:0,passwordResets:0,firestoreWrites:0,hrWrites:0,financeWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,cloudRunDeploys:0,hostingDeploys:Number(process.env.CXORBIA_HOSTING_DEPLOY_COUNT||0),merge:false,production:false,passwordPersisted:false,credentialPersisted:false},
  blockers:[],notes:[]
};
const block=c=>{if(!result.blockers.includes(c))result.blockers.push(c);};
const save=()=>{fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,stable(result),'utf8');};

async function remoteBytes(url){
  const r=await fetch(url+(url.includes('?')?'&':'?')+'cxI3Close='+Date.now(),{cache:'no-store',redirect:'follow'});
  if(!r.ok)throw new Error('REMOTE_FETCH_'+r.status+'_'+url);
  return Buffer.from(await r.arrayBuffer());
}
function snapshotEval(shopperId,projectId){
  const D=window.CX?.data||{};
  const ctx=window.CX?.backendAuth?.context?.()||null;
  const membership=window.CX_SHOPPER_MEMBERSHIP||null;
  const session=window.CX?.session||{};
  const visits=Array.isArray(D._visitas)?D._visitas:[];
  const shoppers=Array.isArray(D.shoppers)?D.shoppers:[];
  const periods=Array.isArray(D.periods)?D.periods:[];
  const projects=Array.isArray(D.projects)?D.projects:[];
  const ids=(rows,keys)=>rows.map(x=>String(keys.map(k=>x?.[k]).find(Boolean)||'')).filter(Boolean);
  const visitIds=ids(visits,['visitId','id']);
  const shopperIds=ids(shoppers,['shopperId','id']);
  const duplicateVisitIds=visitIds.length-new Set(visitIds).size;
  const duplicateShopperIds=shopperIds.length-new Set(shopperIds).size;
  const summaries=Array.isArray(D.periodOperationalSummary)?D.periodOperationalSummary:[];
  let countsNonnegative=true,summaryConsistent=true;
  for(const row of summaries){
    const total=Number(row?.total||0);
    if(!Number.isFinite(total)||total<0){countsNonnegative=false;summaryConsistent=false;}
    for(const k of ['available','assigned','scheduled','realized','questionnaireCompleted','submitted','liquidationCandidates','liquidationConfirmed','paymentConfirmed','outOfRange','reviewRequired']){
      const n=Number(row?.[k]||0);
      if(!Number.isFinite(n)||n<0)countsNonnegative=false;
      if(Number.isFinite(n)&&Number.isFinite(total)&&n>total)summaryConsistent=false;
    }
  }
  let shopperStats=null;
  try{shopperStats=typeof D.shopperStats==='function'?D.shopperStats(shopperId):null;}catch(_){}
  let shopperStatsNonnegative=true;
  if(shopperStats&&typeof shopperStats==='object')for(const v of Object.values(shopperStats)){if(typeof v==='number'&&(!Number.isFinite(v)||v<0))shopperStatsNonnegative=false;}
  const own=shoppers.find(s=>String(s?.shopperId||s?.id||'')===shopperId)||null;
  const scopeConsistent=String(D.currentProjectId||'')===projectId&&projects.some(p=>String(p?.id||'')===projectId)&&(!ctx?.projectIds||ctx.projectIds.includes(projectId));
  return {
    ctx,membership,sessionRole:session.role||null,sessionShopperId:session.user?.shopperId||null,
    appOn:document.getElementById('app')?.classList.contains('on')===true,
    loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
    currentProjectId:D.currentProjectId||null,currentPeriodId:D.currentPeriodId||null,
    projectIds:projects.map(p=>String(p?.id||'')).filter(Boolean),periodCount:periods.length,visitCount:visits.length,shopperCount:shoppers.length,
    ownProfile:!!own,duplicateVisitIds,duplicateShopperIds,countsNonnegative,summaryConsistent,shopperStatsNonnegative,scopeConsistent,
    dataSource:window.CX_BACKEND_DATA_SOURCE||null,
    authError:document.getElementById('cxIntegratedAuthError')?.textContent||''
  };
}
async function waitApp(page,shopperId){
  await page.waitForFunction(id=>{
    try{
      const c=window.CX?.backendAuth?.context?.();
      return !!(c&&c.authenticated===true&&c.role==='shopper'&&c.shopperId===id&&window.CX_SHOPPER_MEMBERSHIP?.status==='verified');
    }catch(_){return false;}
  },shopperId,{timeout:90000});
  await page.waitForFunction(id=>Array.isArray(window.CX?.data?.shoppers)&&window.CX.data.shoppers.some(s=>String(s?.shopperId||s?.id||'')===id),shopperId,{timeout:90000});
}
async function visibleLogin(page,login,password,shopperId){
  await page.goto(targetUrl,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('#login .role-btn[data-role="shopper"]',{state:'visible',timeout:60000});
  await page.locator('#login .role-btn[data-role="shopper"]').click();
  await page.waitForSelector('#loginForm',{state:'visible',timeout:30000});
  await page.locator('#lgUser').fill(login);
  await page.locator('#lgPass').fill(password);
  await page.locator('#lgSubmit').click();
  await waitApp(page,shopperId);
}

let browser=null;
let tempPassword=null;
try{
  const req=readJson(requestPath);
  result.requestId=str(req.requestId)||null;result.productTargetHeadSha=str(req.productTargetHeadSha)||null;
  const valid=req.schemaVersion==='cxorbia.i3.9-10-11.visible-login-close.request.v1'&&req.enabled===true&&req.consumed===false&&req.status==='authorized_execute_once'&&req.gateId===result.gateId&&req.authorizedBy==='Paula'&&req.repository==='paulaosoriof86/demoCXOrbia'&&req.branch==='docs-tya-v6-v71-audit'&&Number(req.pullRequest)===7&&req.targetProject==='cxorbia-backend-dev'&&req.tenantId==='tya'&&req.projectId==='cinepolis'&&req.shopperId==='TYA_GT_393371F88D10F7A8'&&req.identityLinkId==='irl_fd0e52a9792ef088aa275fa90e27c77d'&&str(req.visibleLogin)==='i38-shopper-dev-20260817-01'&&Number(req.maxHostingDeploys)===1&&Number(req.maxPasswordChanges)===1&&Number(req.maxCloudRunDeploys)===0&&Number(req.maxCreateUsers)===0&&Number(req.maxClaimWrites)===0&&Number(req.maxFirestoreWrites)===0&&req.noAutomaticRetry===true;
  if(!valid){block('REQUEST_CONTRACT_INVALID');result.status='BLOCKED_PRE_PROVIDER';result.decision='HOLD_I3_9_10_11_REQUEST_INVALID';save();process.exit(2);}

  const sourceHead=String((await import('node:child_process')).execFileSync('git',['-C',sourceRoot,'rev-parse','HEAD'],{encoding:'utf8'})).trim();
  result.remoteParity.sourceHeadExact=sourceHead===req.productTargetHeadSha;
  if(!result.remoteParity.sourceHeadExact)block('SOURCE_HEAD_NOT_EXACT');
  const localIndex=fs.readFileSync(path.join(sourceRoot,'app/index-backend-dev.html'));
  const localMembership=fs.readFileSync(path.join(sourceRoot,'app/adapters/cxorbia-shopper-membership-wiring-v1.js'));
  const remoteIndex=await remoteBytes(rootUrl+'/index-backend-dev.html');
  const remoteMembership=await remoteBytes(rootUrl+'/adapters/cxorbia-shopper-membership-wiring-v1.js');
  result.remoteParity.indexExact=sha(localIndex)===sha(remoteIndex);
  result.remoteParity.membershipAdapterExact=sha(localMembership)===sha(remoteMembership);
  result.remoteParity.membershipLoaderPresent=remoteIndex.toString('utf8').includes('adapters/cxorbia-shopper-membership-wiring-v1.js');
  if(!result.remoteParity.indexExact)block('REMOTE_INDEX_NOT_EXACT_TARGET_SOURCE');
  if(!result.remoteParity.membershipAdapterExact)block('REMOTE_MEMBERSHIP_ADAPTER_NOT_EXACT_TARGET_SOURCE');
  if(!result.remoteParity.membershipLoaderPresent)block('REMOTE_MEMBERSHIP_LOADER_MISSING');
  if(result.blockers.length){result.status='HOLD_BEFORE_PASSWORD_WRITE';result.decision='HOLD_I3_9_REMOTE_BUILD_PARITY';save();process.exit(2);}

  const app=getApps()[0]||initializeApp({credential:applicationDefault(),projectId:req.targetProject});
  const auth=getAuth(app),db=getFirestore(app);
  const email=internalEmail(req.tenantId,req.visibleLogin);
  result.exactProvider.visibleLoginMapping=providerEmailFingerprint(email)===req.expectedProviderEmailFingerprint;
  const user=await auth.getUserByEmail(email);result.providerReads.authUser=1;
  result.exactProvider.user=user.disabled===false&&uidFingerprint(user.uid)===req.expectedProviderUidFingerprint;
  const c=user.customClaims||{};
  result.exactProvider.claims=c.role==='shopper'&&c.authNamespace==='shopper'&&c.tenantId===req.tenantId&&c.shopperId===req.shopperId&&Array.isArray(c.projectIds)&&c.projectIds.includes(req.projectId);
  const [ms,ps,ls]=await Promise.all([
    db.doc(`tenants/${req.tenantId}/users/${user.uid}`).get(),
    db.doc(`tenants/${req.tenantId}/shoppers/${req.shopperId}`).get(),
    db.doc(`tenants/${req.tenantId}/shopperIdentityLinks/${req.identityLinkId}`).get()
  ]);
  result.providerReads.membership=1;result.providerReads.profile=1;result.providerReads.crosswalk=1;
  const m=ms.data()||{},p=ps.data()||{},l=ls.data()||{};
  result.exactProvider.membership=ms.exists&&m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&m.tenantId===req.tenantId&&m.shopperId===req.shopperId&&Array.isArray(m.projectIds)&&m.projectIds.includes(req.projectId)&&m.providerUidFingerprint===req.expectedProviderUidFingerprint;
  result.exactProvider.profile=ps.exists&&p.shopperId===req.shopperId&&p.tenantId===req.tenantId&&p.sourceType==='platform'&&p.testSynthetic===true;
  result.exactProvider.crosswalk=ls.exists&&l.identityLinkId===req.identityLinkId&&l.canonicalShopperId===req.shopperId&&l.sourceSystem==='platform';
  result.exactProvider.platformCreatedAuthority=l.authorityType==='platform_created';
  result.exactProvider.periodIndependent=l.periodIndependent===true&&String(l.projectScope||'')==='*';
  if(!Object.values(result.exactProvider).every(Boolean)){block('EXACT_PROVIDER_PRECONDITION_FAILED');result.status='HOLD_BEFORE_PASSWORD_WRITE';result.decision='HOLD_I3_9_PROVIDER_PRECONDITION';save();process.exit(2);}

  tempPassword='Cx!'+crypto.randomBytes(24).toString('base64url')+'9a';
  await auth.updateUser(user.uid,{password:tempPassword});
  result.safety.userUpdates=1;result.safety.authWrites=1;result.safety.passwordChanges=1;

  browser=await chromium.launch({headless:true});
  const ctx1=await browser.newContext();
  const page1=await ctx1.newPage();
  await visibleLogin(page1,req.visibleLogin,tempPassword,req.shopperId);
  const s1=await page1.evaluate(snapshotEval,req.shopperId,req.projectId);
  result.browser.visibleLogin=true;
  result.browser.providerAuth=s1.ctx?.authenticated===true&&s1.ctx?.provider==='firebase';
  result.browser.claimsContext=s1.ctx?.role==='shopper'&&s1.ctx?.tenantId===req.tenantId&&s1.ctx?.shopperId===req.shopperId&&Array.isArray(s1.ctx?.projectIds)&&s1.ctx.projectIds.includes(req.projectId);
  result.browser.membershipVerified=s1.membership?.status==='verified'&&s1.membership?.shopperIdVerified===true;
  result.browser.shopperSession=s1.sessionRole==='shopper'&&s1.sessionShopperId===req.shopperId;
  result.browser.profileLoaded=s1.ownProfile===true;
  result.browser.projectScope=s1.scopeConsistent===true;
  result.browser.workspace=s1.appOn===true&&s1.loginHidden===true;

  await page1.reload({waitUntil:'domcontentloaded',timeout:60000});await waitApp(page1,req.shopperId);
  const sr=await page1.evaluate(snapshotEval,req.shopperId,req.projectId);
  result.browser.reload=sr.ctx?.shopperId===req.shopperId&&sr.membership?.status==='verified'&&sr.ownProfile===true&&sr.appOn===true;

  const pageTab=await ctx1.newPage();await pageTab.goto(targetUrl,{waitUntil:'domcontentloaded',timeout:60000});await waitApp(pageTab,req.shopperId);
  const st=await pageTab.evaluate(snapshotEval,req.shopperId,req.projectId);
  result.browser.newTab=st.ctx?.shopperId===req.shopperId&&st.membership?.status==='verified'&&st.ownProfile===true&&st.appOn===true;

  const ctx2=await browser.newContext();const page2=await ctx2.newPage();
  await visibleLogin(page2,req.visibleLogin,tempPassword,req.shopperId);const s2=await page2.evaluate(snapshotEval,req.shopperId,req.projectId);
  result.browser.secondLogicalContext=s2.ctx?.shopperId===req.shopperId&&s2.membership?.status==='verified'&&s2.ownProfile===true&&s2.scopeConsistent===true&&s2.appOn===true;

  result.i3_10.duplicateVisitIds=s1.duplicateVisitIds;result.i3_10.duplicateShopperIds=s1.duplicateShopperIds;result.i3_10.countsNonnegative=s1.countsNonnegative;result.i3_10.summaryConsistent=s1.summaryConsistent;result.i3_10.shopperStatsNonnegative=s1.shopperStatsNonnegative;result.i3_10.scopeConsistent=s1.scopeConsistent;
  const i310=s1.duplicateVisitIds===0&&s1.duplicateShopperIds===0&&s1.countsNonnegative===true&&s1.summaryConsistent===true&&s1.shopperStatsNonnegative===true&&s1.scopeConsistent===true;
  result.i3_10.status=i310?'PASS_DYNAMIC_DERIVED_STATE':'HOLD';result.i3_10.decision=i310?'PASS_I3_10_DYNAMIC_KPI_STATE_SEMANTICS':'HOLD_I3_10_DYNAMIC_KPI_STATE_SEMANTICS';

  const indexDoc=fs.readFileSync(path.join(sourceRoot,'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md'),'utf8');
  result.i3_11.priorI3_1_to_8FrozenPass=/I3_1_TO_8_PASS|I3_1_2_3_4_5_6_7_PASS__I3_8/.test(indexDoc);
  result.i3_11.sameSourceBuild=Object.values(result.remoteParity).every(Boolean);
  result.i3_11.i3_9Pass=Object.values(result.browser).every(Boolean)&&Object.values(result.exactProvider).every(Boolean);
  result.i3_11.i3_10Pass=i310;
  const i311=result.i3_11.priorI3_1_to_8FrozenPass&&result.i3_11.sameSourceBuild&&result.i3_11.i3_9Pass&&result.i3_11.i3_10Pass;
  result.i3_11.status=i311?'PASS_INTEGRAL_SAME_BUILD':'HOLD';result.i3_11.decision=i311?'PASS_I3_11_INTEGRAL_SAME_BUILD_CLOSE':'HOLD_I3_11_INTEGRAL_SAME_BUILD_CLOSE';
  if(!result.i3_11.i3_9Pass)block('I3_9_VISIBLE_LOGIN_E2E_INCOMPLETE');
  if(!i310)block('I3_10_DYNAMIC_SEMANTICS_FAILED');
  if(!i311)block('I3_11_INTEGRAL_SAME_BUILD_FAILED');
  if(result.safety.hostingDeploys!==1)block('HOSTING_DEPLOY_COUNT_NOT_ONE');

  if(result.blockers.length){result.status='HOLD_AFTER_SINGLE_PASSWORD_CHANGE';result.decision='HOLD_I3_9_10_11_NO_AUTOMATIC_RETRY';}
  else{result.status='PASS_INTEGRAL';result.decision='PASS_I3_9_I3_10_I3_11_CLOSE_I3';result.notes.push('One synthetic Shopper password change was used only in runner memory for the canonical visible login and was never persisted.');}
  save();
  await ctx2.close();await ctx1.close();await browser.close();browser=null;tempPassword=null;
  process.exit(result.blockers.length?2:0);
}catch(error){
  block('I3_9_10_11_TECHNICAL_ERROR');result.status=result.safety.passwordChanges===1?'HOLD_AFTER_SINGLE_PASSWORD_CHANGE':'HOLD_BEFORE_PASSWORD_WRITE';result.decision='HOLD_I3_9_10_11_TECHNICAL_NO_AUTOMATIC_RETRY';result.notes.push(str(error?.code||error?.message||error).slice(0,220));save();
  tempPassword=null;try{await browser?.close();}catch{}process.exit(2);
}
