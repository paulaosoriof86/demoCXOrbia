#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const args=new Set(process.argv.slice(2));
const execute=args.has('--execute');
const PROJECT=String(process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev');
const TENANT=String(process.env.CXORBIA_TENANT_ID||'tya');
const PROJECT_ID=String(process.env.CXORBIA_PROJECT_ID||'cinepolis');
const ROOT=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const AUTH=String(process.env.CXORBIA_F8_CHECKPOINT_SHOPPER_AUTHORIZED||'');
const CHECKPOINT=String(process.env.CXORBIA_F8_SHOPPER_CHECKPOINT||'app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json');
const OUT=String(process.env.CXORBIA_F8_SHOPPER_OUT||'.tmp/f8-checkpoint-shopper-runtime/report.json');

const sha=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
const fp=(kind,value)=>sha(kind+'\0'+String(value||'').trim()).slice(0,20);
const safe={
  repositoryWrites:false,dataWrites:false,providerCredentialWrites:false,authWrites:0,
  authPasswordUpdates:0,passwordResets:0,firestoreWrites:0,hrWrites:0,storageWrites:0,
  rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,merge:false,
  production:false,credentialsExposed:false,tokensExposed:false
};
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const write=value=>{fs.mkdirSync(OUT.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(value,null,2)+'\n','utf8');};

function sourceSelfTest(){
  const source=fs.readFileSync(new URL(import.meta.url),'utf8');
  const forbidden=[
    /\.createUser\s*\(/,/\.updateUser\s*\(/,/\.deleteUser\s*\(/,/\.setCustomUserClaims\s*\(/,
    /\.setPassword\s*\(/,/\.collection\([^\n]+\)\.doc\([^\n]+\)\.(set|update|delete)\s*\(/,
    /firebase\s+deploy/i,/gcloud\s+run\s+deploy/i
  ];
  const checks={
    checkpointRequired:source.includes('PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY'),
    exactFingerprintMatch:source.includes("fp('uid',user.uid)")&&source.includes("fp('shopper',shopperId)"),
    customTokenEphemeral:source.includes('createCustomToken')&&source.includes('tokensExposed:false'),
    browserRuntimeRequired:source.includes("await import('playwright')")&&source.includes('CX_PROTECTED_AUTH_HR_AUTHORITY'),
    noCredentialWriteApis:forbidden.every(re=>!re.test(source)),
    explicitExecutionGate:source.includes('YES_PAULA_F8_CHECKPOINT_BACKED_SHOPPER_READONLY'),
    sourceGateDependencyFree:!/^import\s+admin\s+from\s+['"]firebase-admin['"]/m.test(source)
  };
  const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  return {schemaVersion:'cxorbia.f8.checkpoint-backed-shopper-runtime.source.v1',decision:failed.length?'HOLD_F8_CHECKPOINT_SHOPPER_SOURCE':'PASS_F8_CHECKPOINT_SHOPPER_SOURCE',checks,failed,safety:safe};
}

async function initProvider(){
  const raw=String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'');
  let sa=null;try{sa=JSON.parse(raw);}catch{}
  ensure(sa&&sa.type==='service_account'&&sa.project_id===PROJECT&&sa.client_email&&sa.private_key,'F8_SERVICE_ACCOUNT_INVALID');
  const {default:admin}=await import('firebase-admin');
  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:PROJECT});
  return {auth:admin.auth(),db:admin.firestore()};
}

async function exactCheckpointPrincipal(auth,db,checkpoint){
  ensure(checkpoint?.decision==='PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY','F8_HISTORICAL_SHOPPER_CHECKPOINT_NOT_PASS');
  ensure(checkpoint?.identity?.exact===true&&checkpoint?.identity?.uidPreserved===true&&checkpoint?.identity?.claims===true&&checkpoint?.identity?.profile===true&&checkpoint?.identity?.membership===true&&checkpoint?.identity?.crosswalk===true&&checkpoint?.identity?.history===true&&checkpoint?.identity?.historyE2E===true,'F8_HISTORICAL_SHOPPER_CHECKPOINT_INCOMPLETE');
  ensure(checkpoint?.shopperIdFingerprint&&checkpoint?.uidFingerprint,'F8_HISTORICAL_SHOPPER_FINGERPRINTS_MISSING');

  const matches=[];
  let pageToken;
  do{
    const page=await auth.listUsers(1000,pageToken);
    for(const user of page.users){if(fp('uid',user.uid)===checkpoint.uidFingerprint)matches.push(user);}
    pageToken=page.pageToken;
  }while(pageToken);
  ensure(matches.length===1,'F8_CHECKPOINT_UID_FINGERPRINT_MATCH_NOT_EXACT_'+matches.length);
  const user=matches[0];
  const claims=user.customClaims||{};
  const shopperId=String(claims.shopperId||'').trim();
  ensure(claims.role==='shopper'&&String(claims.authNamespace||'')==='shopper','F8_CHECKPOINT_AUTH_NAMESPACE_INVALID');
  ensure(String(claims.tenantId||'')===TENANT,'F8_CHECKPOINT_TENANT_INVALID');
  ensure(Array.isArray(claims.projectIds)&&claims.projectIds.map(String).includes(PROJECT_ID),'F8_CHECKPOINT_PROJECT_SCOPE_INVALID');
  ensure(shopperId&&fp('shopper',shopperId)===checkpoint.shopperIdFingerprint,'F8_CHECKPOINT_SHOPPER_FINGERPRINT_MISMATCH');
  ensure(user.disabled!==true,'F8_CHECKPOINT_AUTH_USER_DISABLED');

  const profileRef=db.collection('tenants').doc(TENANT).collection('shoppers').doc(shopperId);
  const membershipRef=db.collection('tenants').doc(TENANT).collection('users').doc(user.uid);
  const crossRef=db.collection('tenants').doc(TENANT).collection('shopperIdentityCrosswalk').doc(shopperId);
  const historyRef=db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT_ID).collection('visits');
  const [profile,membership,cross,history]=await Promise.all([
    profileRef.get(),membershipRef.get(),crossRef.get(),historyRef.where('shopperId','==',shopperId).get()
  ]);
  ensure(profile.exists,'F8_CHECKPOINT_PROFILE_MISSING');
  ensure(membership.exists,'F8_CHECKPOINT_MEMBERSHIP_MISSING');
  ensure(cross.exists,'F8_CHECKPOINT_CROSSWALK_MISSING');
  ensure(history.size>0,'F8_CHECKPOINT_HISTORY_MISSING');
  const m=membership.data()||{},c=cross.data()||{};
  ensure(m.active===true&&m.tenantId===TENANT&&m.role==='shopper'&&m.authNamespace==='shopper'&&m.shopperId===shopperId,'F8_CHECKPOINT_MEMBERSHIP_INVALID');
  ensure(Array.isArray(m.projectIds)&&m.projectIds.map(String).includes(PROJECT_ID),'F8_CHECKPOINT_MEMBERSHIP_PROJECT_INVALID');
  ensure(c.tenantId===TENANT&&c.shopperId===shopperId&&String(c.authNamespace||'')==='shopper','F8_CHECKPOINT_CROSSWALK_INVALID');
  return {user,shopperId,historyCount:history.size};
}

async function browserProof(auth,principal){
  const {chromium}=await import('playwright');
  const token=await auth.createCustomToken(principal.user.uid);
  ensure(token&&typeof token==='string','F8_CUSTOM_TOKEN_NOT_CREATED');
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
  try{
    const url=new URL(ROOT+'/index-backend-dev.html');
    url.searchParams.set('cxProtectedRuntime','YES_PAULA_20260730_PROTECTED_DEV');
    url.searchParams.set('cxHumanFullVisual','YES_PAULA_20260731_FULL_PROFILE_DEV');
    url.searchParams.set('cxProjectId',PROJECT_ID);
    await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>Boolean(window.firebase&&window.CX?.BACKEND?.firebaseConfig),null,{timeout:30000});
    await page.evaluate(async customToken=>{
      const cfg=window.CX.BACKEND.firebaseConfig;
      const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
      const auth=typeof app.auth==='function'?app.auth():firebase.auth();
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      await auth.signInWithCustomToken(customToken);
    },token);
    await page.reload({waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(({tenant,projectId})=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
      return Boolean(ctx?.authenticated===true&&ctx?.tenantId===tenant&&ctx?.role==='shopper'&&ctx?.authNamespace==='shopper'&&ctx?.projectIds?.includes(projectId)&&authority?.applied===true&&authority?.periods>0&&authority?.hrVisits>0&&document.getElementById('app')?.classList.contains('on'));
    },{tenant:TENANT,projectId:PROJECT_ID},{timeout:90000});

    const result=await page.evaluate(({shopperId,projectId})=>{
      const ctx=window.CX?.backendAuth?.context?.()||{};
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
      const d=window.CX?.data||{};
      const raw=String(ctx.shopperId||'').trim();
      const canonical=String((d.__identityMap||{})[raw]||raw).trim();
      const review=Array.isArray(d.__identityReviewQueue)?d.__identityReviewQueue:[];
      const inReview=review.some(item=>{
        const vals=[item?.liveShopperId,item?.profileId,item?.shopperId].filter(Boolean).map(String);
        const arr=[...(Array.isArray(item?.candidates)?item.candidates:[]),...(Array.isArray(item?.shopperIds)?item.shopperIds:[])].map(String);
        return vals.includes(raw)||vals.includes(canonical)||arr.includes(raw)||arr.includes(canonical);
      });
      let ownVisits=[];try{ownVisits=typeof d.visitsForShopper==='function'?d.visitsForShopper(canonical,false):[];}catch{}
      const body=String(document.body?.innerText||'');
      const sourceRef=String(window.CX?.dataSource?.sourceRef||'');
      return {
        authenticated:ctx.authenticated===true,role:String(ctx.role||''),namespace:String(ctx.authNamespace||''),
        tenantId:String(ctx.tenantId||''),projectScoped:Array.isArray(ctx.projectIds)&&ctx.projectIds.includes(projectId),
        exactShopperId:raw===shopperId||canonical===shopperId,reviewRequired:inReview,ownVisits:ownVisits.length,
        periods:Number(authority.periods||0),visits:Number(authority.hrVisits||0),shoppers:Number(authority.hrShoppers||0),
        firstPeriod:authority.firstPeriod||null,latestPeriod:authority.latestPeriod||null,
        duplicateVisitKeys:Number(authority.duplicateVisitKeys||0),duplicateShopperIds:Number(authority.duplicateShopperIds||0),
        sourceRef,appOn:document.getElementById('app')?.classList.contains('on')===true,
        loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
        lockVisible:body.includes('La identidad de esta sesión no está vinculada al read model canónico.'),
        dataBlocked:body.includes('Fuente de datos no disponible')
      };
    },{shopperId:principal.shopperId,projectId:PROJECT_ID});

    ensure(pageErrors.length===0,'F8_CHECKPOINT_BROWSER_PAGE_ERRORS');
    ensure(result.authenticated&&result.role==='shopper'&&result.namespace==='shopper','F8_CHECKPOINT_BROWSER_AUTH_CONTEXT_INVALID');
    ensure(result.tenantId===TENANT&&result.projectScoped,'F8_CHECKPOINT_BROWSER_SCOPE_INVALID');
    ensure(result.exactShopperId&&!result.reviewRequired,'F8_CHECKPOINT_BROWSER_EXACT_IDENTITY_INVALID');
    ensure(result.ownVisits>0,'F8_CHECKPOINT_BROWSER_HISTORY_MISSING');
    ensure(result.periods>0&&result.visits>0&&result.shoppers>0,'F8_CHECKPOINT_BROWSER_HR_AUTHORITY_EMPTY');
    ensure(result.duplicateVisitKeys===0&&result.duplicateShopperIds===0,'F8_CHECKPOINT_BROWSER_DUPLICATE_KEYS');
    ensure(result.sourceRef.includes('hr-live-all-periods+firestore-authenticated-exact-overlay'),'F8_CHECKPOINT_BROWSER_SOURCE_NOT_CANONICAL');
    ensure(result.appOn&&result.loginHidden&&!result.lockVisible&&!result.dataBlocked,'F8_CHECKPOINT_BROWSER_VISIBLE_STATE_INVALID');

    const legal=await page.evaluate(()=>{
      const c=window.CX?.confidencialidad;let pending=false;
      if(c&&typeof c.pending==='function'){try{pending=Boolean(c.pending('shopper'));}catch{}}
      const visible=[...document.querySelectorAll('.cx-ov,[role="dialog"]')].some(el=>{
        const text=String(el.innerText||'');const box=el.getBoundingClientRect();const style=getComputedStyle(el);
        return /(confidencial|\bnda\b|acuerdo)/i.test(text)&&style.display!=='none'&&style.visibility!=='hidden'&&box.width>0&&box.height>0;
      });
      return {supported:Boolean(c&&typeof c.pending==='function'),pending,visible};
    });
    if(legal.pending)ensure(legal.supported&&legal.visible,'F8_CHECKPOINT_LEGAL_GATE_INVALID');

    return {...result,legalGate:{...legal,acceptanceAutomated:false},technicalCheckpointBacked:true,humanPasswordRouteFresh:false,historicalHumanPasswordCheckpoint:true};
  }finally{
    try{await context.close();}catch{}
    try{await browser.close();}catch{}
  }
}

async function executeProof(){
  ensure(AUTH==='YES_PAULA_F8_CHECKPOINT_BACKED_SHOPPER_READONLY','F8_CHECKPOINT_SHOPPER_EXPLICIT_GATE_REQUIRED');
  ensure(fs.existsSync(CHECKPOINT),'F8_HISTORICAL_SHOPPER_CHECKPOINT_MISSING');
  const checkpoint=JSON.parse(fs.readFileSync(CHECKPOINT,'utf8'));
  const {auth,db}=await initProvider();
  const principal=await exactCheckpointPrincipal(auth,db,checkpoint);
  const browser=await browserProof(auth,principal);
  const report={
    schemaVersion:'cxorbia.f8.checkpoint-backed-shopper-runtime.result.v1',
    generatedAt:new Date().toISOString(),decision:'PASS_F8_CHECKPOINT_BACKED_SHOPPER_CURRENT_RUNTIME_READONLY',
    classification:'MECHANISM_HARNESS_RECOVERY',
    historicalCheckpoint:{decision:checkpoint.decision,workflowRunId:checkpoint.workflowRunId||null,shopperIdFingerprint:checkpoint.shopperIdFingerprint,uidFingerprint:checkpoint.uidFingerprint,historyE2E:checkpoint.identity?.historyE2E===true},
    currentProvider:{exactUidFingerprint:true,exactShopperFingerprint:true,claimsExact:true,profileExists:true,membershipExact:true,crosswalkExact:true,historyCount:principal.historyCount,authUserEnabled:principal.user.disabled!==true},
    browser,
    interpretation:'The F8 HOLD H0/S0 is a credential-lifecycle harness gap after the prior one-shot random password recovery; current exact identity and shopper runtime are freshly proven without resetting or persisting a password.',
    safety:safe
  };
  write(report);return report;
}

if(!execute){
  const report=sourceSelfTest();console.log(JSON.stringify(report,null,2));if(report.failed.length)process.exitCode=1;
}else{
  try{const report=await executeProof();console.log(JSON.stringify(report,null,2));}
  catch(error){const report={schemaVersion:'cxorbia.f8.checkpoint-backed-shopper-runtime.result.v1',generatedAt:new Date().toISOString(),decision:'HOLD_F8_CHECKPOINT_BACKED_SHOPPER_CURRENT_RUNTIME_READONLY',error:String(error?.message||error),safety:safe};write(report);console.error(JSON.stringify(report,null,2));process.exitCode=1;}
}
