#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const OUT=String(process.env.PREI4_004_RESUME_OUT||'.tmp/prei4-admin-004-config-resume');
const ROOT=String(process.env.PREI4_004_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const fail=m=>{throw new Error(m);};
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const snap=await project.get();if(!snap.exists)fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_MISSING');
const before=snap.data()||{},ops=before.operationalSource||{};
const opSafe=o=>({mode:str(o.mode),providerType:str(o.providerType),readPolicy:str(o.readPolicy),writePolicy:str(o.writePolicy),mappingRef:str(o.mappingRef),providerBindingId:str(o.providerBindingId||o.integrationSettingId||o.providerRef)});
const exact=d=>Number(d?.honorario?.GT)===60&&Number(d?.honorario?.HN)===200&&str(d?.currency?.GT)==='Q'&&str(d?.currency?.HN)==='L';
if(exact(before)){
  fs.writeFileSync(OUT+'/project-config-write.json',JSON.stringify({decision:'PASS_PREI4_ADMIN_004_PROJECT_CONFIG_ACK',writeExecuted:false,alreadyDurable:true,beforeVersion:Number(before.version||0),afterVersion:Number(before.version||0),production:false,hrWrites:0,externalProviderWrites:0,paymentWrites:0,deploys:0},null,2)+'\n');
  process.exit(0);
}
if(Number(before.version)!==3)fail('PERSISTENCE_FAILURE:ADMIN004_UNEXPECTED_VERSION:'+String(before.version));
const safeOps=opSafe(ops);
if(safeOps.mode!=='external'||safeOps.providerType!=='google_sheets'||safeOps.readPolicy!=='external_live'||safeOps.writePolicy!=='external_read_only'||!safeOps.mappingRef||!safeOps.providerBindingId)fail('PERSISTENCE_FAILURE:ADMIN004_OPERATIONAL_SOURCE_DRIFT');

let actor=null,pageToken;
for(let p=0;p<10&&!actor;p++){
  const listed=await auth.listUsers(1000,pageToken);
  for(const u of listed.users){
    const c=u.customClaims||{},role=str(c.role).toLowerCase(),ns=str(c.authNamespace).toLowerCase(),projects=arr(c.projectIds).map(str);
    if(str(c.tenantId)!==TENANT||ns!=='staff'||!['super','admin'].includes(role)||(role!=='super'&&!projects.includes(PROJECT)))continue;
    const m=await tenant.collection('users').doc(u.uid).get();if(!m.exists)continue;const md=m.data()||{};
    if(md.active!==true||str(md.tenantId)!==TENANT||str(md.role).toLowerCase()!==role||str(md.authNamespace).toLowerCase()!=='staff')continue;
    actor={uid:u.uid,role};break;
  }
  pageToken=listed.pageToken;if(!pageToken)break;
}
if(!actor)fail('AUTH_FAILURE:ADMIN004_PROJECT_CONFIG_ACTOR_MISSING');

const init=await fetch(ROOT+'/__/firebase/init.js?admin004='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(60000)});
if(!init.ok)fail('ENVIRONMENT_FAILURE:ADMIN004_FIREBASE_INIT_HTTP_'+init.status);
const initText=await init.text();
const apiKey=(initText.match(/["']apiKey["']\s*:\s*["']([^"']+)["']/)||[])[1];
if(!apiKey)fail('ENVIRONMENT_FAILURE:ADMIN004_FIREBASE_API_KEY_MISSING');

let idToken='',last='';
for(let attempt=1;attempt<=5&&!idToken;attempt++){
  try{
    const customToken=await auth.createCustomToken(actor.uid);
    const ex=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(apiKey),{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:customToken,returnSecureToken:true}),signal:AbortSignal.timeout(60000)
    });
    const body=await ex.json().catch(()=>({}));
    if(ex.ok&&body.idToken)idToken=String(body.idToken);else last='HTTP_'+ex.status+':'+JSON.stringify(body);
  }catch(e){last=String(e?.message||e);}
  if(!idToken)await new Promise(r=>setTimeout(r,700*attempt));
}
if(!idToken)fail('AUTH_FAILURE:ADMIN004_ID_TOKEN_EXCHANGE:'+last);

const payload={...before,projectId:PROJECT,id:PROJECT,periodId:PERIOD,version:Number(before.version),countries:['GT','HN'],currency:{...(before.currency||{}),GT:'Q',HN:'L'},honorario:{...(before.honorario||{}),GT:60,HN:200},operationalSource:{...ops}};
delete payload.createdAt;delete payload.createdBy;
const idempotencyKey='prei4-admin004-project-finance-config-v3-gt60-hn200';
const command={commandType:'project.update',entityType:'project',entityId:PROJECT,tenantId:TENANT,projectId:PROJECT,periodId:PERIOD,expectedVersion:Number(before.version),idempotencyKey,payload,source:'prei4-admin004-control',reason:'Persist proven independent country finance configuration in Recovery DEV',authorization:{providerEnforcementRequired:true,permission:'project.update'}};
const res=await fetch(ROOT+'/v1/cxorbia/commands',{method:'POST',headers:{Authorization:'Bearer '+idToken,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(command),signal:AbortSignal.timeout(120000)});
const ack=await res.json().catch(()=>({}));
if(!(res.ok&&ack?.ok===true&&ack?.status==='committed'&&ack?.committed===true&&ack?.providerAck===true&&ack?.successUiAllowed===true&&Number(ack?.providerWrites)===3))fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_UPDATE_ACK:'+res.status+':'+JSON.stringify(ack));

const afterSnap=await project.get();if(!afterSnap.exists)fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_DISAPPEARED');
const after=afterSnap.data()||{};
if(!exact(after))fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_FINANCE_CONFIG_NOT_DURABLE');
if(JSON.stringify(opSafe(after.operationalSource||{}))!==JSON.stringify(safeOps))fail('PERSISTENCE_FAILURE:ADMIN004_OPERATIONAL_SOURCE_MUTATED');
if(Number(after.version)!==4)fail('PERSISTENCE_FAILURE:ADMIN004_VERSION_NOT_INCREMENTED');

const receiptId=sha(TENANT+'\0'+idempotencyKey).slice(0,40),auditId='project-'+sha(idempotencyKey).slice(0,32);
const [receipt,audit]=await Promise.all([tenant.collection('commandReceipts').doc(receiptId).get(),tenant.collection('entityAuditTrail').doc(auditId).get()]);
if(!receipt.exists||receipt.data()?.status!=='committed'||receipt.data()?.providerAck!==true)fail('PERSISTENCE_FAILURE:ADMIN004_RECEIPT_MISSING');
if(!audit.exists||str(audit.data()?.commandType)!=='project.update'||str(audit.data()?.projectId)!==PROJECT)fail('PERSISTENCE_FAILURE:ADMIN004_AUDIT_MISSING');
const result={schemaVersion:'cxorbia.prei4.admin004.project-config-http-write.v1',decision:'PASS_PREI4_ADMIN_004_PROJECT_CONFIG_ACK',production:false,writeExecuted:true,actorFp:sha(actor.uid).slice(0,16),before:{version:Number(before.version),currency:{GT:before?.currency?.GT??null,HN:before?.currency?.HN??null},honorario:{GT:before?.honorario?.GT??null,HN:before?.honorario?.HN??null},operationalSource:safeOps},after:{version:Number(after.version),currency:{GT:after.currency.GT,HN:after.currency.HN},honorario:{GT:Number(after.honorario.GT),HN:Number(after.honorario.HN)},operationalSource:opSafe(after.operationalSource||{})},providerAck:{status:ack.status,providerAck:ack.providerAck,providerWrites:ack.providerWrites,idempotentReplay:ack.idempotentReplay===true},receiptVerified:true,auditVerified:true,hrWrites:0,externalProviderWrites:0,paymentWrites:0,deploys:0};
fs.writeFileSync(OUT+'/project-config-write.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
