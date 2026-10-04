#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import {stableShopperUid,providerUidFingerprint,shopperCredentialRule,CREDENTIAL_RULE_VERSION,CREDENTIAL_PASSWORD_PROOF_VERSION} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const PERIOD='cinepolis-2026-10';
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=String(process.env.VRM216_LIVE_OUT||'.tmp/i3-vrm216-live-idempotency').trim();
const RUN=String(process.env.GITHUB_RUN_ID||Date.now()).replace(/\D+/g,'');
const str=v=>String(v??'').trim();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fixtureId='vrm216_fixture_'+sha(RUN).slice(0,12);
const uid=stableShopperUid(TENANT,fixtureId);
const key='vrm216-live-replay-'+RUN;
const receiptId=sha(TENANT+'\0'+PROGRAM+'\0'+PERIOD+'\0'+key).slice(0,40);
const profile={id:fixtureId,shopperId:fixtureId,tenantId:TENANT,projectIds:[PROGRAM],firstName:'Replay',lastName:'Fixture',nombre:'Replay Fixture',ciudad:'Guatemala',country:'GT',pais:'GT',sourceType:'platform',active:true,version:1};
const credential=shopperCredentialRule(profile);
if(!credential.ok)throw new Error('SOURCE_FAILURE:VRM216_FIXTURE_CREDENTIAL_RULE');
const email=sha(TENANT+'\0shopper\0'+credential.login.toLowerCase()).slice(0,48)+'@auth.cxorbia.invalid';

fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm216.live-idempotency.v1',decision:'HOLD',fixtureId,providerAck:false,idempotentReplay:false,changedPayloadBlocked:false,cleanup:false,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),users=tenant.collection('users'),profiles=tenant.collection('shoppers'),cross=tenant.collection('shopperIdentityCrosswalk');
const receipt=tenant.collection('commandReceipts').doc(receiptId);
let browser=null;

async function ensureAbsent(){
  const [m,p,c,r]=await Promise.all([users.doc(uid).get(),profiles.doc(fixtureId).get(),cross.doc(fixtureId).get(),receipt.get()]);
  if(m.exists||p.exists||c.exists||r.exists)throw new Error('PERSISTENCE_FAILURE:VRM216_FIXTURE_COLLISION');
  try{await auth.getUser(uid);throw new Error('AUTH_FAILURE:VRM216_FIXTURE_AUTH_COLLISION');}catch(e){if(e?.code!=='auth/user-not-found')throw e;}
}
async function setup(){
  await auth.createUser({uid,email,password:credential.password,disabled:false});
  await auth.setCustomUserClaims(uid,{tenantId:TENANT,projectIds:[PROGRAM],role:'shopper',authNamespace:'shopper',shopperId:fixtureId});
  const fp=providerUidFingerprint(uid),stamp=new Date().toISOString();
  await Promise.all([
    users.doc(uid).set({uid,tenantId:TENANT,projectIds:[PROGRAM],role:'shopper',authNamespace:'shopper',shopperId:fixtureId,active:true,status:'active',visibleLogin:credential.login,credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialPasswordProofVersion:CREDENTIAL_PASSWORD_PROOF_VERSION,createdAt:stamp,updatedAt:stamp}),
    profiles.doc(fixtureId).set({...profile,visibleLogin:credential.login,username:credential.login,user:credential.login,credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialPasswordProofVersion:CREDENTIAL_PASSWORD_PROOF_VERSION,createdAt:stamp,updatedAt:stamp}),
    cross.doc(fixtureId).set({tenantId:TENANT,shopperId:fixtureId,canonicalShopperId:fixtureId,projectIds:[PROGRAM],providerUidFingerprint:fp,identityMode:'exact',status:'active',active:true,updatedAt:stamp})
  ]);
}
async function superActor(){
  const snap=await users.get();
  const rows=snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>x.active===true&&str(x.role).toLowerCase()==='super'&&str(x.authNamespace).toLowerCase()==='staff').sort((a,b)=>a.uid.localeCompare(b.uid));
  for(const row of rows){try{const u=await auth.getUser(row.uid),c=u.customClaims||{};if(u.disabled!==true&&str(c.tenantId)===TENANT&&str(c.role).toLowerCase()==='super'&&str(c.authNamespace).toLowerCase()==='staff')return row;}catch{}}
  throw new Error('AUTH_FAILURE:VRM216_SUPER_ACTOR_MISSING');
}
async function cleanup(){
  const errors=[];
  try{await receipt.delete();}catch(e){errors.push('receipt:'+str(e?.message||e));}
  for(const ref of [cross.doc(fixtureId),profiles.doc(fixtureId),users.doc(uid)]){try{await ref.delete();}catch(e){errors.push('firestore:'+str(e?.message||e));}}
  try{await auth.deleteUser(uid);}catch(e){if(e?.code!=='auth/user-not-found')errors.push('auth:'+str(e?.message||e));}
  const [m,p,c,r]=await Promise.all([users.doc(uid).get(),profiles.doc(fixtureId).get(),cross.doc(fixtureId).get(),receipt.get()]);
  let authGone=false;try{await auth.getUser(uid);}catch(e){authGone=e?.code==='auth/user-not-found';}
  if(errors.length||m.exists||p.exists||c.exists||r.exists||!authGone)throw new Error('PERSISTENCE_FAILURE:VRM216_FIXTURE_CLEANUP_'+errors.join('|'));
  return true;
}

try{
  await ensureAbsent();await setup();
  const actor=await superActor();
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'}),page=await context.newPage();
  const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:60000});
  await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.NONE);await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(actor.uid));
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&window.CX?.commandAdapter?.status?.()?.writesEnabled===true&&!!window.CX?.commandAdapter?.status?.()?.activeTransport,null,{timeout:120000});

  const run=async city=>page.evaluate(async input=>{
    return await window.CX.commandAdapter.execute({
      commandType:'shopper.update',entityType:'shopper',entityId:input.fixtureId,
      tenantId:input.tenantId,projectId:input.projectId,periodId:input.periodId,
      expectedVersion:1,idempotencyKey:input.key,
      payload:{periodId:input.periodId,shopperId:input.fixtureId,projectIds:[input.projectId],patch:{ciudad:input.city},protectedPatch:{}},
      source:'vrm216-live-fixture',
      authorization:{providerEnforcementRequired:true,permission:'shopper.update'}
    });
  },{fixtureId,tenantId:TENANT,projectId:PROGRAM,periodId:PERIOD,key,city});

  const first=await run('Guatemala');result.first=first;save();
  if(first?.ok!==true||first?.providerAck!==true||first?.status!=='committed'||Number(first?.providerWrites||0)<1)throw new Error('PERSISTENCE_FAILURE:VRM216_FIRST_ACK');
  const second=await run('Guatemala');result.second=second;save();
  if(second?.ok!==true||second?.providerAck!==true||second?.idempotentReplay!==true||Number(second?.providerWrites||0)!==0)throw new Error('PERSISTENCE_FAILURE:VRM216_REPLAY');
  const changed=await run('Mixco');result.changed=changed;save();
  if(changed?.ok!==false||str(changed?.code)!=='SHOPPER_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD'||Number(changed?.providerWrites||0)!==0)throw new Error('PERSISTENCE_FAILURE:VRM216_CHANGED_PAYLOAD_NOT_BLOCKED');
  const rc=await receipt.get(),rd=rc.exists?(rc.data()||{}):{};
  if(!rc.exists||str(rd.status)!=='committed'||str(rd.commandType)!=='shopper.update'||rd.providerAck!==true)throw new Error('PERSISTENCE_FAILURE:VRM216_RECEIPT_READBACK');
  result.providerAck=true;result.idempotentReplay=true;result.changedPayloadBlocked=true;result.receiptStatus=str(rd.status);
  result.cleanup=await cleanup();
  result.decision='PASS_VRM216_LIVE_IDEMPOTENCY_FIXTURE';
  save();console.log(JSON.stringify(result,null,2));
}catch(error){
  result.decision='FAIL_VRM216_LIVE_IDEMPOTENCY_FIXTURE';result.error=str(error?.stack||error);
  try{result.cleanup=await cleanup();}catch(cleanError){result.cleanupError=str(cleanError?.stack||cleanError);}
  save();console.error(result.error);process.exitCode=2;
}finally{try{if(browser)await browser.close();}catch{}}
