#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_004_RESUME_OUT||'.tmp/prei4-admin-004-config-resume');
const ROOT=String(process.env.PREI4_004_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT='tya',PROJECT='cinepolis';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const fail=m=>{throw new Error(m);};
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const beforeSnap=await project.get();if(!beforeSnap.exists)fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_MISSING');
const before=beforeSnap.data()||{},ops=before.operationalSource||{};
const opSafe=o=>({mode:str(o.mode),providerType:str(o.providerType),readPolicy:str(o.readPolicy),writePolicy:str(o.writePolicy),mappingRef:str(o.mappingRef),providerBindingId:str(o.providerBindingId||o.integrationSettingId||o.providerRef)});
const exact=d=>Number(d?.honorario?.GT)===60&&Number(d?.honorario?.HN)===200&&str(d?.currency?.GT)==='Q'&&str(d?.currency?.HN)==='L';
const safeOpsBefore=opSafe(ops);
if(safeOpsBefore.mode!=='external'||safeOpsBefore.providerType!=='google_sheets'||safeOpsBefore.readPolicy!=='external_live'||safeOpsBefore.writePolicy!=='external_read_only'||!safeOpsBefore.mappingRef||!safeOpsBefore.providerBindingId)fail('PERSISTENCE_FAILURE:ADMIN004_OPERATIONAL_SOURCE_DRIFT');
let ack=null,writeExecuted=false,actorFp=null;
if(!exact(before)){
  if(Number(before.version)!==3)fail('PERSISTENCE_FAILURE:ADMIN004_UNEXPECTED_VERSION:'+String(before.version));
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
  actorFp=sha(actor.uid).slice(0,16);
  const browser=await chromium.launch({headless:true});
  try{
    const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
    const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV';
    let signed=false,lastAuthError='';
    for(let attempt=1;attempt<=5&&!signed;attempt++){
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
      const token=await auth.createCustomToken(actor.uid);
      try{
        await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);
      }catch(e){
        lastAuthError=String(e?.message||e);
        if(!/network-request-failed|Execution context was destroyed|navigation|network|timeout|interrupted/i.test(lastAuthError))throw e;
      }
      await page.waitForTimeout(800*attempt);
      signed=await page.evaluate(uid=>String(firebase.auth().currentUser?.uid||'')===uid,actor.uid).catch(()=>false);
    }
    if(!signed)fail('AUTH_FAILURE:ADMIN004_PROJECT_CONFIG_SIGNIN:'+lastAuthError);
    await page.waitForFunction(()=>window.CX?.cxDataCommandBoundary?.canonicalMode?.()===true&&typeof window.CX?.data?.updateProject==='function'&&Array.isArray(window.CX?.data?.__backendAllProjectRecords)&&window.CX.data.__backendAllProjectRecords.some(p=>String(p.id||p.projectId)==='cinepolis'),null,{timeout:150000});
    ack=await page.evaluate(async()=>{
      const current=window.CX.data.__backendAllProjectRecords.find(p=>String(p.id||p.projectId)==='cinepolis');
      const patch={
        version:current.version,
        name:current.name||'Cinépolis',
        countries:['GT','HN'],
        currency:Object.assign({},current.currency||{},{GT:'Q',HN:'L'}),
        honorario:Object.assign({},current.honorario||{},{GT:60,HN:200}),
        operationalSource:Object.assign({},current.operationalSource||{})
      };
      return window.CX.data.updateProject('cinepolis',patch,{ackAware:true,reason:'prei4-admin004-project-finance-config'});
    });
    await ctx.close();
  }finally{await browser.close();}
  if(!(ack?.ok===true&&ack?.status==='committed'&&ack?.committed===true&&ack?.providerAck===true&&ack?.successUiAllowed===true&&Number(ack?.providerWrites)===3))fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_UPDATE_ACK:'+JSON.stringify(ack));
  writeExecuted=true;
}
const afterSnap=await project.get();if(!afterSnap.exists)fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_DISAPPEARED');
const after=afterSnap.data()||{};
if(!exact(after))fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_FINANCE_CONFIG_NOT_DURABLE');
if(JSON.stringify(opSafe(after.operationalSource||{}))!==JSON.stringify(safeOpsBefore))fail('PERSISTENCE_FAILURE:ADMIN004_OPERATIONAL_SOURCE_MUTATED');
if(writeExecuted&&Number(after.version)!==Number(before.version)+1)fail('PERSISTENCE_FAILURE:ADMIN004_VERSION_NOT_INCREMENTED');
let receiptVerified=false,auditVerified=false;
if(ack?.idempotencyKey){
  const receiptId=sha(TENANT+'\0'+ack.idempotencyKey).slice(0,40),auditId='project-'+sha(ack.idempotencyKey).slice(0,32);
  const receipt=await tenant.collection('commandReceipts').doc(receiptId).get(),audit=await tenant.collection('entityAuditTrail').doc(auditId).get();
  receiptVerified=receipt.exists&&receipt.data()?.status==='committed'&&receipt.data()?.providerAck===true;
  auditVerified=audit.exists&&str(audit.data()?.commandType)==='project.update'&&str(audit.data()?.projectId)===PROJECT;
  if(!receiptVerified||!auditVerified)fail('PERSISTENCE_FAILURE:ADMIN004_PROJECT_ACK_EVIDENCE_MISSING');
}
const result={schemaVersion:'cxorbia.prei4.admin004.project-config-write.v1',decision:'PASS_PREI4_ADMIN_004_PROJECT_CONFIG_ACK',production:false,writeExecuted,actorFp,before:{version:Number(before.version||0),currency:{GT:before?.currency?.GT??null,HN:before?.currency?.HN??null},honorario:{GT:before?.honorario?.GT??null,HN:before?.honorario?.HN??null},operationalSource:safeOpsBefore},after:{version:Number(after.version||0),currency:{GT:after.currency.GT,HN:after.currency.HN},honorario:{GT:Number(after.honorario.GT),HN:Number(after.honorario.HN)},operationalSource:opSafe(after.operationalSource||{})},providerAck:ack?{status:ack.status,providerAck:ack.providerAck,providerWrites:ack.providerWrites,idempotencyKeyFp:sha(ack.idempotencyKey).slice(0,16)}:{alreadyDurable:true},receiptVerified,auditVerified,hrWrites:0,externalProviderWrites:0,paymentWrites:0,deploys:0};
fs.writeFileSync(OUT+'/project-config-write.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
