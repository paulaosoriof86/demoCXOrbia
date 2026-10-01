#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=process.env.FINAL_FOCAL_OUT||'.tmp/prei4-final-focal';
const SOURCE=String(process.env.SOURCE_SHA||'');
const TENANT='tya',PROJECT_ID='cinepolis',PERIOD='cinepolis-2026-09',RUN=String(process.env.GITHUB_RUN_ID||Date.now());
fs.mkdirSync(OUT,{recursive:true});
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const receiptId=c=>sha(`${c.tenantId}\0${c.projectId}\0${c.periodId}\0${c.idempotencyKey}`).slice(0,40);
const auditId=c=>sha(`${c.idempotencyKey}\0${c.commandType}`).slice(0,40);
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);

async function apiKey(){
  const r=await fetch(HOST+'/__/firebase/init.json',{cache:'no-store'});
  assert(r.ok,'ENVIRONMENT_FAILURE:FIREBASE_INIT_'+r.status);
  return str((await r.json()).apiKey);
}
async function adminToken(){
  const users=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
  const m=users.find(x=>x.active===true&&str(x.authNamespace)==='staff'&&['super','admin'].includes(str(x.role))&&(str(x.role)==='super'||arr(x.projectIds).map(String).includes(PROJECT_ID)));
  assert(m,'AUTH_FAILURE:FINAL_FOCAL_ADMIN_MISSING');
  const custom=await auth.createCustomToken(m.id),key=await apiKey();
  const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
  const body=await r.json().catch(()=>null);
  assert(r.ok&&body?.idToken,'AUTH_FAILURE:FINAL_FOCAL_TOKEN_EXCHANGE');
  return {token:body.idToken,uid:m.id};
}
const {token,uid}=await adminToken();
const refs=[],commands=[];
async function send(c){
  commands.push(c);
  const r=await fetch(HOST+'/v1/cxorbia/commands',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(c)});
  const body=await r.json().catch(()=>null);
  return {r,body};
}
const base=(type,entityType,entityId,key,payload,permission)=>({
  version:'cxorbia-command-adapter-v1',commandType:type,entityType,entityId,
  tenantId:TENANT,projectId:PROJECT_ID,periodId:PERIOD,expectedVersion:'source-current',
  idempotencyKey:'prei4-final-'+RUN+'-'+key,payload,
  authorization:{providerEnforcementRequired:true,permission},
  audit:{reason:'PRE-I4 final focal DEV fixture'},source:'prei4-final-focal'
});
let evidence={schemaVersion:'cxorbia.prei4.final-focal.finance.v1',decision:'HOLD',sourceSha:SOURCE,production:false,hrWrites:0,cleanup:false};
try{
  const revenueId='qa-revenue-'+RUN;
  const revenue=base('finance.movement.create','financialMovement',revenueId,'revenue',{tipo:'ingreso',tipoIngreso:'honorarios',country:'GT',currency:'GTQ',amount:11,cat:'QA focal operating revenue',concepto:'QA focal operating revenue',fecha:new Date().toISOString().slice(0,10)},'finance.movement.write');
  const rr=await send(revenue);
  assert(rr.r.ok&&rr.body?.providerAck===true&&rr.body?.movement?.revenueRecognized===true&&rr.body?.movement?.nonOperating===false,'PERSISTENCE_FAILURE:FINAL_REVENUE_ACK');
  refs.push(['financialMovements',revenueId]);
  const replay=await send(revenue);
  assert(replay.r.ok&&replay.body?.providerAck===true&&replay.body?.idempotentReplay===true&&Number(replay.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE:FINAL_REVENUE_IDEMPOTENCY');

  const invalidId='qa-invalid-'+RUN;
  const invalid=base('finance.movement.create','financialMovement',invalidId,'invalid',{tipo:'ingreso',tipoIngreso:'otro',country:'GT',currency:'GTQ',amount:5,cat:'QA invalid unclassified'},'finance.movement.write');
  const ir=await send(invalid);
  assert(ir.body?.providerAck!==true,'PERSISTENCE_FAILURE:UNCLASSIFIED_MOVEMENT_ACCEPTED');
  assert(!(await tenant.collection('financialMovements').doc(invalidId).get()).exists,'PERSISTENCE_FAILURE:UNCLASSIFIED_MOVEMENT_PERSISTED');

  const cxc=base('finance.account.create','financeAccount',null,'cxc',{kind:'cxc',country:'GT',currency:'GTQ',amount:13,concepto:'QA focal CxC',origin:'qa_focal'},'finance.account.write');
  const cr=await send(cxc);
  assert(cr.r.ok&&cr.body?.providerAck===true&&cr.body?.account?.kind==='cxc','PERSISTENCE_FAILURE:FINAL_CXC_CREATE');
  const cxcId=str(cr.body.entityId);refs.push(['financeAccounts',cxcId]);
  const cxcApply=base('finance.account.apply','financeAccount',cxcId,'cxc-apply',{accountId:cxcId,amount:13,fecha:new Date().toISOString().slice(0,10),desc:'QA CxC collection'},'finance.account.apply');
  const ca=await send(cxcApply);
  assert(ca.r.ok&&ca.body?.providerAck===true&&Number(ca.body?.account?.balance)===0&&ca.body?.movement?.cashCollection===true&&ca.body?.movement?.revenueRecognized===false,'PERSISTENCE_FAILURE:FINAL_CXC_APPLY');
  refs.push(['financialMovements',str(ca.body.movement.id)]);

  const finId='qa-financing-'+RUN;
  const fin=base('finance.movement.create','financialMovement',finId,'financing',{tipo:'ingreso',tipoIngreso:'financiamiento',country:'GT',currency:'GTQ',amount:17,cat:'QA focal financing',concepto:'QA focal financing',fecha:new Date().toISOString().slice(0,10)},'finance.movement.write');
  const fr=await send(fin);
  assert(fr.r.ok&&fr.body?.providerAck===true&&fr.body?.movement?.nonOperating===true&&fr.body?.movement?.revenueRecognized===false&&fr.body?.linkedAccount?.kind==='cxp','PERSISTENCE_FAILURE:FINAL_FINANCING_CREATE');
  refs.push(['financialMovements',finId]);
  const cxpId=str(fr.body.linkedAccount.id);refs.push(['financeAccounts',cxpId]);
  const repay=base('finance.account.apply','financeAccount',cxpId,'financing-repay',{accountId:cxpId,amount:17,fecha:new Date().toISOString().slice(0,10),desc:'QA financing repayment'},'finance.account.apply');
  const pr=await send(repay);
  assert(pr.r.ok&&pr.body?.providerAck===true&&Number(pr.body?.account?.balance)===0&&pr.body?.movement?.tipo==='egreso'&&pr.body?.movement?.tipoEgreso==='abono_cxp'&&pr.body?.movement?.revenueRecognized===false,'PERSISTENCE_FAILURE:FINAL_CXP_APPLY');
  refs.push(['financialMovements',str(pr.body.movement.id)]);

  for(const c of commands){refs.push(['commandReceipts',receiptId(c)]);refs.push(['entityAuditTrail','finance-'+auditId(c)]);}

  const browser=await chromium.launch({headless:true});let projection;
  try{
    const ctx=await browser.newContext(),page=await ctx.newPage(),custom=await auth.createCustomToken(uid);
    const url=HOST+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},custom);
    await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&window.CX?.data?.__financeReadBridge===true,null,{timeout:120000});
    projection=await page.evaluate(async ({projectId,periodId,ids})=>{
      const movements=await CX.data.getFinancialMovements({projectId,periodId});
      const accounts=await CX.data.getFinanceAccounts({projectId,periodId});
      const mids=new Set((movements.items||[]).map(x=>String(x.id||''))),aids=new Set((accounts.items||[]).map(x=>String(x.id||'')));
      return {movementIds:ids.movements.filter(x=>mids.has(x)),accountIds:ids.accounts.filter(x=>aids.has(x)),movementCount:(movements.items||[]).length,accountCount:(accounts.items||[]).length};
    },{projectId:PROJECT_ID,periodId:PERIOD,ids:{movements:[revenueId,finId,str(ca.body.movement.id),str(pr.body.movement.id)],accounts:[cxcId,cxpId]}});
    await ctx.close();
  }finally{await browser.close();}
  assert(projection.movementIds.length===4&&projection.accountIds.length===2,'MAPPING_FAILURE:FINAL_FINANCE_DURABLE_PROJECTION:'+JSON.stringify(projection));
  evidence={...evidence,decision:'PASS_PREI4_FINAL_FOCAL_FINANCE',operatingRevenueAck:true,unclassifiedBlocked:true,cxcCollectionNoDoubleRevenue:true,financingNonOperatingLinkedCxp:true,cxpSettlement:true,idempotentReplay:true,durableProjection:true,projection};
}finally{
  const uniq=new Map(refs.filter(x=>x[1]).map(x=>[x[0]+'/'+x[1],x]));
  for(const [, [col,id]] of uniq)await tenant.collection(col).doc(id).delete().catch(()=>{});
  const remaining=[];for(const [, [col,id]] of uniq){if((await tenant.collection(col).doc(id).get()).exists)remaining.push(col+'/'+id);}
  evidence.cleanup=remaining.length===0;evidence.cleanupRemaining=remaining;
  fs.writeFileSync(path.join(OUT,'finance-live.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence,null,2));
}
if(evidence.decision!=='PASS_PREI4_FINAL_FOCAL_FINANCE'||!evidence.cleanup)process.exit(1);
