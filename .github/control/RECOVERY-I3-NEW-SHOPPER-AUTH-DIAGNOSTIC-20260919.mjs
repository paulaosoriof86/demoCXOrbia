#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const PROJECT=process.env.PROJECT;
const HOSTING_URL=String(process.env.HOSTING_URL||'').replace(/\/$/,'');
const TENANT=process.env.TENANT_ID;
const PROJECT_ID=process.env.PROJECT_ID;
const PERIOD_ID=process.env.PERIOD_ID;
const SOURCE_DIR=process.env.SOURCE_DIR;
const OUT=process.env.OUT;
const RUN_ID=String(process.env.GITHUB_RUN_ID||Date.now());
const SOURCE_SHA=process.env.I3_CERTIFICATION_SOURCE_SHA;
const SOURCE_TREE=process.env.I3_CERTIFICATION_SOURCE_TREE;
const PRIOR_RUN_ID=process.env.PRIOR_RUN_ID;
const ARTIFACT_SHA256=process.env.CERTIFIED_ARTIFACT_SHA256;
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV';
const PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const err=e=>String(e?.message||e||'unknown').replace(/[\r\n]+/g,' ').slice(0,900);

fs.mkdirSync(OUT,{recursive:true});
let browser=null,page=null,uid='';
const shopperId='shopper_i3_authdiag_'+RUN_ID;
const idempotencyKey='i3-authdiag-'+RUN_ID;
const receiptId=sha(TENANT+'\0'+PROJECT_ID+'\0'+PERIOD_ID+'\0'+idempotencyKey).slice(0,40);
const result={
  schemaVersion:'cxorbia.i3.new-shopper-auth-diagnostic.v1',
  decision:'HOLD_I3_NEW_SHOPPER_AUTH_DIAGNOSTIC',
  classification:null,stage:'init',
  sourceSha:SOURCE_SHA,sourceTree:SOURCE_TREE,priorRunId:String(PRIOR_RUN_ID||''),
  certifiedArtifactSha256:String(ARTIFACT_SHA256||''),
  production:false,buildCountThisRun:0,deployCountThisRun:0,hrWrites:0,
  fixture:{shopperIdFingerprint:sha(shopperId).slice(0,24),country:'GT',projectId:PROJECT_ID,periodId:PERIOD_ID},
  provider:null,durableReadback:null,directPasswordAuth:null,
  visibleLogin:{snapshots:[],console:[],pageErrors:[]},
  ensureAuthenticated:null,membership:null,hrAuthorityObserved:null,cleanup:{ok:false}
};
const save=()=>fs.writeFileSync(path.join(OUT,'auth-diagnostic-result.json'),JSON.stringify(result,null,2)+'\n');
save();

async function fetchRetry(url,options={},attempts=5){
  let last=null;
  for(let i=1;i<=attempts;i++){
    try{const r=await fetch(url,options);if(r.ok||r.status<500)return r;last=new Error('HTTP_'+r.status);}catch(e){last=e}
    if(i<attempts)await sleep(800*i);
  }
  throw new Error('ENVIRONMENT_FAILURE:NETWORK:'+err(last));
}
async function firebaseApiKey(){
  const r=await fetchRetry(HOSTING_URL+'/__/firebase/init.js',{headers:{accept:'application/javascript'}});
  if(!r.ok)throw new Error('ENVIRONMENT_FAILURE:FIREBASE_INIT_HTTP_'+r.status);
  const m=(await r.text()).match(/["']?apiKey["']?\s*:\s*["']([^"']+)["']/);
  if(!m)throw new Error('ENVIRONMENT_FAILURE:FIREBASE_INIT_APIKEY_MISSING');
  return m[1];
}
async function restJson(url,body){
  const r=await fetchRetry(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  return {ok:r.ok,status:r.status,body:await r.json().catch(()=>({}))};
}
async function pageState(label){
  let state={label,at:new Date().toISOString()};
  try{
    state={...state,...await page.evaluate(async()=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const u=window.firebase?.auth?.().currentUser||null;
      let tokenClaims=null;
      if(u){try{const t=await u.getIdTokenResult(true);tokenClaims={role:String(t?.claims?.role||''),tenantId:String(t?.claims?.tenantId||''),shopperId:String(t?.claims?.shopperId||''),authNamespace:String(t?.claims?.authNamespace||''),projectIds:Array.isArray(t?.claims?.projectIds)?t.claims.projectIds.map(String):[]};}catch(_){}}
      const su=window.CX?.session?.user||{};
      return {
        firebaseUser:Boolean(u),firebaseUid:u?String(u.uid):'',firebaseEmail:u?String(u.email||''):'',tokenClaims,
        backendAuthReady:window.CX?.backendAuth?.isReady?.()===true,
        selectedRole:String(window.CX?.backendAuth?.selectedRole?.()||''),
        context:ctx?{authenticated:ctx.authenticated===true,role:String(ctx.role||''),tenantId:String(ctx.tenantId||''),shopperId:String(ctx.shopperId||''),authNamespace:String(ctx.authNamespace||''),projectIds:Array.isArray(ctx.projectIds)?ctx.projectIds.map(String):[]}:null,
        membership:window.CX_SHOPPER_MEMBERSHIP||null,
        formSelectedRole:String(document.querySelector('#loginForm')?.dataset?.selectedRole||''),
        submitText:String(document.querySelector('#lgSubmit')?.innerText||''),submitDisabled:Boolean(document.querySelector('#lgSubmit')?.disabled),
        authError:String(document.querySelector('#cxIntegratedAuthError')?.innerText||document.querySelector('#lgError')?.innerText||'').slice(0,300),
        sessionUser:{role:String(su.role||''),actualRole:String(su.actualRole||su.authRole||''),tenantId:String(su.tenantId||''),shopperId:String(su.shopperId||''),projectIds:Array.isArray(su.projectIds)?su.projectIds.map(String):[],membershipVerified:su.membershipVerified===true},
        hrAuthority:{applied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,gateReady:window.CX_C6_HR_AUTHORITY_GATE?.ready===true,gateBlocked:window.CX_C6_HR_AUTHORITY_GATE?.blocked===true,source:String(window.CX?.dataSource?.sourceRef||'')}
      };
    })};
  }catch(e){state.evaluateError=err(e)}
  result.visibleLogin.snapshots.push(state);save();return state;
}
async function cleanup(auth,db){
  const tenant=db.collection('tenants').doc(TENANT);
  const refs=[tenant.collection('commandReceipts').doc(receiptId),tenant.collection('shopperIdentityCrosswalk').doc(shopperId),tenant.collection('shoppers').doc(shopperId)];
  if(uid)refs.push(tenant.collection('users').doc(uid));
  const deleteErrors=[];
  for(const ref of refs){try{await ref.delete()}catch(e){deleteErrors.push(err(e))}}
  if(uid){try{await auth.deleteUser(uid)}catch(e){if(str(e?.code)!=='auth/user-not-found')deleteErrors.push(err(e))}}
  const [receipt,profile,cross,users]=await Promise.all([
    tenant.collection('commandReceipts').doc(receiptId).get(),
    tenant.collection('shoppers').doc(shopperId).get(),
    tenant.collection('shopperIdentityCrosswalk').doc(shopperId).get(),
    tenant.collection('users').where('shopperId','==',shopperId).get()
  ]);
  let authAbsent=true;if(uid){try{await auth.getUser(uid);authAbsent=false}catch(e){authAbsent=str(e?.code)==='auth/user-not-found'}}
  result.cleanup={ok:deleteErrors.length===0&&!receipt.exists&&!profile.exists&&!cross.exists&&users.empty&&authAbsent,deleteErrors,receiptAbsent:!receipt.exists,profileAbsent:!profile.exists,crosswalkAbsent:!cross.exists,membershipAbsent:users.empty,authAbsent};save();
}

try{
  if(!PROJECT||!HOSTING_URL||!TENANT||!PROJECT_ID||!PERIOD_ID||!SOURCE_DIR)throw new Error('ENVIRONMENT_FAILURE:DIAGNOSTIC_ENV_INCOMPLETE');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
  const providerMod=await import(pathToFileURL(path.join(SOURCE_DIR,'backend/runtime/cxorbia-shopper-command-provider-v1.mjs')).href);
  const apiKey=await firebaseApiKey();

  result.stage='select_actor';save();
  let actor=null;
  for(const d of (await tenant.collection('users').get()).docs){
    const m=d.data()||{},role=str(m.role),ns=str(m.authNamespace||'staff');
    if(m.active!==true||!['super','admin'].includes(role)||ns!=='staff'||(role!=='super'&&!uniq(m.projectIds).includes(PROJECT_ID)))continue;
    try{
      const u=await auth.getUser(d.id),c=u.customClaims||{};
      if(u.disabled===true||str(c.role)!==role||str(c.tenantId)!==TENANT||str(c.authNamespace||'staff')!=='staff'||(role!=='super'&&!uniq(c.projectIds).includes(PROJECT_ID)))continue;
      actor={uid:d.id,role};break;
    }catch(_){}
  }
  if(!actor)throw new Error('AUTH_FAILURE:STAFF_ACTOR_NOT_FOUND');
  const actorSignin=await restJson('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(apiKey),{token:await auth.createCustomToken(actor.uid),returnSecureToken:true});
  if(!actorSignin.ok||!actorSignin.body?.idToken)throw new Error('AUTH_FAILURE:STAFF_ACTOR_TOKEN_EXCHANGE');
  const actorDecoded=await auth.verifyIdToken(actorSignin.body.idToken,true);
  if(str(actorDecoded.uid)!==actor.uid||!['super','admin'].includes(str(actorDecoded.role))||str(actorDecoded.tenantId)!==TENANT)throw new Error('AUTH_FAILURE:STAFF_ACTOR_CONTEXT');
  result.actor={role:str(actorDecoded.role),uidFingerprint:sha(actor.uid).slice(0,24),projectScoped:str(actorDecoded.role)==='super'||uniq(actorDecoded.projectIds).includes(PROJECT_ID)};

  result.stage='provider_create';save();
  const tail=RUN_ID.replace(/\D/g,'').slice(-8).padStart(8,'0');
  const profile={firstName:'Nora',lastName:'Pruebai3'+tail,nombre:'Nora Pruebai3'+tail,pais:'GT',country:'GT',whatsapp:'+5025555'+tail.slice(-4),phone:'+5025555'+tail.slice(-4),estado:'Activo',sourceType:'platform',createdVia:'i3-live-auth-diagnostic'};
  const credential=providerMod.shopperCredentialRule(profile);
  if(!credential?.ok)throw new Error('PROVIDER_FAILURE:CREDENTIAL_RULE_REJECTED');
  uid=providerMod.stableShopperUid(TENANT,shopperId);
  const internalEmail=sha(TENANT+'\0shopper\0'+credential.login).slice(0,48)+'@auth.cxorbia.invalid';
  const provider=providerMod.createShopperCommandProvider({auth,db,policy:{schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,allowedTenantIds:[TENANT],allowedProjectIds:[PROJECT_ID],hrWrites:false,externalWrites:false,fuzzyMatching:false}});
  const ack=await provider.execute(actorSignin.body.idToken,{version:'cxorbia-command-adapter-v1',commandType:'shopper.create',tenantId:TENANT,projectId:PROJECT_ID,periodId:PERIOD_ID,entityId:shopperId,idempotencyKey,authorization:{providerEnforcementRequired:true,permission:'shopper.create'},payload:{sourceRevision:'i3-authdiag:'+RUN_ID,profile}});
  result.provider={ok:ack?.ok===true,status:str(ack?.status),providerAck:ack?.providerAck===true,entityMatches:str(ack?.entityId)===shopperId,providerWrites:Number(ack?.providerWrites||0),idempotentReplay:ack?.idempotentReplay===true,hrWrites:Number(ack?.hrWrites||0),externalWrites:Number(ack?.externalWrites||0),credentialRuleVersion:providerMod.CREDENTIAL_RULE_VERSION,loginFingerprint:sha(credential.login).slice(0,24)};save();
  if(!result.provider.ok||!result.provider.providerAck||!result.provider.entityMatches)throw new Error('PROVIDER_FAILURE:SHOPPER_CREATE_ACK');

  result.stage='durable_readback';save();
  const [member,profileDoc,cross,receipt,user]=await Promise.all([tenant.collection('users').doc(uid).get(),tenant.collection('shoppers').doc(shopperId).get(),tenant.collection('shopperIdentityCrosswalk').doc(shopperId).get(),tenant.collection('commandReceipts').doc(receiptId).get(),auth.getUser(uid)]);
  const claims=user.customClaims||{};
  result.durableReadback={member:member.exists,profile:profileDoc.exists,crosswalk:cross.exists,receipt:receipt.exists,authUser:true,uidStable:str(user.uid)===uid,authEmailExact:str(user.email).toLowerCase()===internalEmail.toLowerCase(),role:str(claims.role),tenantId:str(claims.tenantId),shopperIdMatches:str(claims.shopperId)===shopperId,authNamespace:str(claims.authNamespace),projectScoped:uniq(claims.projectIds).includes(PROJECT_ID)};save();
  if(!member.exists||!profileDoc.exists||!cross.exists||!receipt.exists||str(claims.role)!=='shopper'||str(claims.tenantId)!==TENANT||str(claims.shopperId)!==shopperId||str(claims.authNamespace)!=='shopper'||!uniq(claims.projectIds).includes(PROJECT_ID))throw new Error('PERSISTENCE_FAILURE:NEW_SHOPPER_DURABLE_READBACK');

  result.stage='direct_password_auth';save();
  const direct=await restJson('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(apiKey),{email:internalEmail,password:credential.password,returnSecureToken:true});
  if(!direct.ok||!direct.body?.idToken)throw new Error('AUTH_FAILURE:DIRECT_PASSWORD_SIGNIN');
  const directDecoded=await auth.verifyIdToken(direct.body.idToken,true);
  result.directPasswordAuth={ok:true,uidMatches:str(direct.body.localId)===uid&&str(directDecoded.uid)===uid,role:str(directDecoded.role),tenantId:str(directDecoded.tenantId),shopperIdMatches:str(directDecoded.shopperId)===shopperId,authNamespace:str(directDecoded.authNamespace),projectScoped:uniq(directDecoded.projectIds).includes(PROJECT_ID)};save();
  if(!result.directPasswordAuth.uidMatches||result.directPasswordAuth.role!=='shopper'||result.directPasswordAuth.tenantId!==TENANT||!result.directPasswordAuth.shopperIdMatches||result.directPasswordAuth.authNamespace!=='shopper'||!result.directPasswordAuth.projectScoped)throw new Error('AUTH_FAILURE:DIRECT_PASSWORD_CLAIMS');

  result.stage='visible_login';save();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  page=await context.newPage();
  page.on('console',m=>{if(['error','warning'].includes(m.type())){result.visibleLogin.console.push({type:m.type(),text:m.text().slice(0,500)});save();}});
  page.on('pageerror',e=>{result.visibleLogin.pageErrors.push(err(e));save();});
  const url=HOSTING_URL+'/index-backend-dev.html?cxBackendPreview='+encodeURIComponent(PREVIEW)+'&cxProjectId='+encodeURIComponent(PROJECT_ID)+'&cxProtectedRuntime='+encodeURIComponent(PROTECTED)+'&cxHumanFullVisual='+encodeURIComponent(FULL);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0&&typeof window.CX?.backendAuth?.context==='function',null,{timeout:90000});
  await pageState('boot');
  await page.locator('.role-btn[data-role="shopper"]').first().click({timeout:30000});
  await page.locator('#lgUser').waitFor({state:'visible',timeout:30000});
  await page.locator('#lgUser').fill(credential.login);
  await page.locator('#lgPass').fill(credential.password);
  await pageState('before-submit');
  await page.locator('#lgSubmit').click({timeout:30000});

  const checkpoints=[1000,2500,5000,10000,20000,45000];let elapsed=0,last=null;
  for(const ms of checkpoints){await sleep(ms-elapsed);elapsed=ms;last=await pageState('after-submit-'+ms+'ms');if(last?.context?.authenticated===true||last?.authError)break;}
  if(!last?.firebaseUser){result.visibleLogin.failureOwner='visible_password_signin';throw new Error('AUTH_FAILURE:VISIBLE_FIREBASE_USER_NOT_ESTABLISHED:'+str(last?.authError||'no-ui-error'))}
  if(str(last.firebaseUid)!==uid){result.visibleLogin.failureOwner='visible_wrong_principal';throw new Error('AUTH_FAILURE:VISIBLE_FIREBASE_UID_MISMATCH')}

  if(!last?.context?.authenticated){
    result.stage='ensure_authenticated_probe';save();
    result.ensureAuthenticated=await page.evaluate(async()=>{
      const p=window.CX?.backendAuth?.ensureAuthenticated?.();if(!p)return {supported:false};
      return await Promise.race([Promise.resolve(p).then(x=>({supported:true,resolved:true,context:x?{authenticated:x.authenticated===true,role:String(x.role||''),tenantId:String(x.tenantId||''),shopperId:String(x.shopperId||''),projectIds:Array.isArray(x.projectIds)?x.projectIds.map(String):[]}:null})).catch(e=>({supported:true,resolved:false,error:String(e?.message||e).slice(0,300)})),new Promise(r=>setTimeout(()=>r({supported:true,resolved:false,timeout:true}),15000))]);
    });save();last=await pageState('after-ensureAuthenticated');
  }
  const ctx=last?.context;
  if(!ctx?.authenticated||ctx.role!=='shopper'||ctx.tenantId!==TENANT||ctx.shopperId!==shopperId||!arr(ctx.projectIds).includes(PROJECT_ID)){result.visibleLogin.failureOwner=last?.firebaseUser?'backendAuth.context':'visible_password_signin';throw new Error('AUTH_FAILURE:VISIBLE_BACKEND_CONTEXT_NOT_ESTABLISHED')}

  result.stage='membership_probe';save();
  result.membership=await page.evaluate(async()=>{const ctx=window.CX?.backendAuth?.context?.()||null;if(typeof window.CX?.backendAuth?.verifyShopperMembership!=='function')return {supported:false,global:window.CX_SHOPPER_MEMBERSHIP||null};try{const x=await window.CX.backendAuth.verifyShopperMembership(ctx);return {supported:true,ok:x?.membershipVerified===true,global:window.CX_SHOPPER_MEMBERSHIP||null};}catch(e){return {supported:true,ok:false,error:String(e?.message||e).slice(0,300),global:window.CX_SHOPPER_MEMBERSHIP||null};}});save();
  if(result.membership?.supported&&result.membership.ok!==true)throw new Error('AUTH_FAILURE:SHOPPER_MEMBERSHIP_VERIFICATION');
  result.hrAuthorityObserved=(await pageState('auth-complete')).hrAuthority;
  await page.screenshot({path:path.join(OUT,'new-shopper-visible-login.png'),fullPage:true}).catch(()=>{});
  result.stage='passed';result.decision='PASS_I3_NEW_SHOPPER_AUTH_DIAGNOSTIC';result.classification=null;result.p0Proven=false;save();
}catch(e){
  const msg=err(e),prefix=(msg.match(/^(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE)/)||[])[1];
  result.error=msg;result.classification=prefix||'ENVIRONMENT_FAILURE';result.p0Proven=result.classification==='AUTH_FAILURE'&&result.directPasswordAuth?.ok===true;if(result.visibleLogin?.failureOwner)result.owner=result.visibleLogin.failureOwner;save();
}finally{
  try{if(browser)await browser.close()}catch(_){}
  try{if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});await cleanup(getAuth(),getFirestore())}catch(e){result.cleanup={ok:false,error:err(e)};if(result.decision==='PASS_I3_NEW_SHOPPER_AUTH_DIAGNOSTIC'){result.decision='HOLD_I3_NEW_SHOPPER_AUTH_DIAGNOSTIC';result.classification='PERSISTENCE_FAILURE'}save()}
  if(!result.cleanup.ok&&result.decision==='PASS_I3_NEW_SHOPPER_AUTH_DIAGNOSTIC'){result.decision='HOLD_I3_NEW_SHOPPER_AUTH_DIAGNOSTIC';result.classification='PERSISTENCE_FAILURE'}
  result.finishedAt=new Date().toISOString();save();
  console.log(result.decision+' stage='+result.stage+' class='+(result.classification||'NONE')+' cleanup='+String(result.cleanup.ok)+' build=0 deploy=0 production=false');
}
