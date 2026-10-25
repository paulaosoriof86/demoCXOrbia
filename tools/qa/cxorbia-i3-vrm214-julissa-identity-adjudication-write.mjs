#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';
import {CREDENTIAL_PASSWORD_PROOF_VERSION} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.FOCAL_SOURCE||'').trim();
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const OUT=String(process.env.JULISSA_WRITE_OUT||'.tmp/i3-vrm214-julissa-adjudication').trim();
const CANONICAL='shopper_gt_0c198c1055';
const ALIASES=['shopper_gt_86254c4228','shp-7309d525805e','shr-1780611985059-49vr'];
const KEEPER='shr-1780611985059-49vr';
const ILL='shopper_gt_86254c4228';
const PERIOD='cinepolis-2026-10';
const MIRAFLORES_ROW='OCTUBRE 26!2';
const EXPECTED_LOGIN='julissa.flores';
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const receiptId=(periodId,key)=>sha(TENANT+'\0'+PROGRAM+'\0'+periodId+'\0'+key).slice(0,40);

const result={schemaVersion:'cxorbia.i3.vrm214.julissa.adjudication.v1',decision:'HOLD',classification:'MAPPING_FAILURE',sourceSha:SOURCE,expectedHrRevision:EXPECTED_HR,tenantId:TENANT,projectId:PROGRAM,periodId:PERIOD,canonicalShopperId:CANONICAL,aliases:ALIASES,expectedKeeperShopperId:KEEPER,providerAck:false,idempotentReplay:false,durableReadback:false,hrWrites:0,externalWrites:0,production:false};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();
if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('SOURCE_FAILURE:VRM214_SOURCE_REQUIRED');
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('SOURCE_FAILURE:VRM214_HR_REQUIRED');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const users=tenant.collection('users'),profiles=tenant.collection('shoppers'),cross=tenant.collection('shopperIdentityCrosswalk'),links=tenant.collection('shopperIdentityLinks');
const ids=[CANONICAL,...ALIASES],aliasSet=new Set(ALIASES);

async function activeMembers(shopperId){
  const snap=await users.where('shopperId','==',shopperId).get();
  return snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>x.active===true&&str(x.role)==='shopper'&&str(x.authNamespace)==='shopper'&&arr(x.projectIds).map(str).includes(PROGRAM));
}
async function hrSnapshot(tag){
  const r=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&vrm214='+encodeURIComponent(tag)+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
  if(!r.ok)throw new Error('PROVIDER_FAILURE:VRM214_HR_HTTP_'+r.status);
  const body=await r.json(),snap=body.snapshot||body.data||body,revision=str(body.revision||body._runtime?.revision||snap.sourceRevision);
  if(revision!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:VRM214_HR_DRIFT_'+revision);
  return {snap,revision};
}
function miraflores(hr){
  const rows=arr(hr.snap.visits).filter(v=>str(v.hrRowId)===MIRAFLORES_ROW);
  if(rows.length!==1)throw new Error('MAPPING_FAILURE:VRM214_MIRAFLORES_COUNT_'+rows.length);
  const v=rows[0];
  if(str(v.shopperId)!==CANONICAL||str(v.periodKey||v.periodId)!=='2026-10'||str(v.country||v.pais)!=='GT'||!/miraflores/i.test(str(v.sucursal||v.branch)))throw new Error('MAPPING_FAILURE:VRM214_MIRAFLORES_AUTHORITY_MISMATCH');
  return {id:str(v.id||v.visitId),hrRowId:str(v.hrRowId),periodKey:str(v.periodKey||v.periodId),country:str(v.country||v.pais),shopperId:str(v.shopperId),branch:str(v.sucursal||v.branch),state:str(v.estado||v.status),assignmentSource:str(v.assignmentSource)};
}
async function aliasResidual(){
  const fields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
  const arrays=['shopperIds','candidateShopperIds'];
  const defs=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
  const rows=[];
  for(const [scope,name] of defs){
    const col=scope==='tenant'?tenant.collection(name):project.collection(name),snap=await col.get();
    for(const doc of snap.docs){
      const d=doc.data()||{},hit=[];
      for(const k of fields)if(aliasSet.has(str(d[k])))hit.push(k);
      for(const k of arrays)if(arr(d[k]).some(v=>aliasSet.has(str(v))))hit.push(k);
      if(hit.length)rows.push({scope,collection:name,id:doc.id,fields:hit});
    }
  }
  return rows;
}
async function preflight(){
  const snaps=await Promise.all(ids.map(id=>profiles.doc(id).get()));
  if(snaps.some(s=>!s.exists))throw new Error('MAPPING_FAILURE:VRM214_PROFILE_MISSING');
  const p=Object.fromEntries(ids.map((id,i)=>[id,snaps[i].data()||{}]));
  const m={};
  for(const id of ids){m[id]=await activeMembers(id);if(m[id].length!==1)throw new Error('MAPPING_FAILURE:VRM214_ACTIVE_COUNT_'+id+'_'+m[id].length);}
  const strong=ids.filter(id=>str(m[id][0].credentialPasswordProofVersion||p[id].credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION).sort();
  if(JSON.stringify(strong)!==JSON.stringify([ILL,KEEPER].sort()))throw new Error('AUTH_FAILURE:VRM214_STRONG_SET_'+strong.join(','));
  const rule=ShopperCredentialRule.shopperCredentialRule(p[CANONICAL]);
  if(!rule?.ok||str(rule.login).toLowerCase()!==EXPECTED_LOGIN)throw new Error('AUTH_FAILURE:VRM214_CANONICAL_LOGIN_RULE');
  const strongMatch=strong.filter(id=>str(m[id][0].visibleLogin||p[id].visibleLogin||p[id].username||p[id].user).toLowerCase()===EXPECTED_LOGIN);
  if(strongMatch.length!==1||strongMatch[0]!==KEEPER)throw new Error('AUTH_FAILURE:VRM214_KEEPER_NOT_DETERMINISTIC');
  return {members:m,profiles:p,strong,keeperUid:m[KEEPER][0].uid,beforeUids:Object.fromEntries(ids.map(id=>[id,m[id][0].uid]))};
}
async function superActor(){
  const snap=await users.get(),rows=snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>x.active===true&&str(x.role).toLowerCase()==='super'&&str(x.authNamespace).toLowerCase()==='staff').sort((a,b)=>a.uid.localeCompare(b.uid));
  for(const row of rows){try{const u=await auth.getUser(row.uid),c=u.customClaims||{};if(u.disabled!==true&&str(c.tenantId)===TENANT&&str(c.role).toLowerCase()==='super'&&str(c.authNamespace).toLowerCase()==='staff')return row;}catch{}}
  throw new Error('AUTH_FAILURE:VRM214_SUPER_ACTOR_MISSING');
}
async function readback(before,ack){
  const ca=await activeMembers(CANONICAL);
  if(ca.length!==1||ca[0].uid!==before.keeperUid)throw new Error('AUTH_FAILURE:VRM214_KEEPER_NOT_CANONICAL');
  for(const a of ALIASES)if((await activeMembers(a)).length)throw new Error('PERSISTENCE_FAILURE:VRM214_ALIAS_ACTIVE_'+a);
  const ku=await auth.getUser(before.keeperUid);
  if(ku.disabled===true||str(ku.customClaims?.shopperId)!==CANONICAL)throw new Error('AUTH_FAILURE:VRM214_KEEPER_AUTH');
  for(const id of ids.filter(x=>x!==KEEPER)){const u=await auth.getUser(before.beforeUids[id]);if(u.disabled!==true)throw new Error('AUTH_FAILURE:VRM214_RETIRED_ENABLED_'+id);}
  const cp=await profiles.doc(CANONICAL).get(),cd=cp.data()||{};
  if(!cp.exists||str(cd.shopperId)!==CANONICAL||str(cd.visibleLogin).toLowerCase()!==EXPECTED_LOGIN)throw new Error('PERSISTENCE_FAILURE:VRM214_CANONICAL_PROFILE');
  for(const a of ALIASES){
    const ap=await profiles.doc(a).get(),ad=ap.exists?(ap.data()||{}):{};
    if(str(ad.identityState)!=='superseded_exact_alias'||str(ad.supersededByShopperId)!==CANONICAL)throw new Error('PERSISTENCE_FAILURE:VRM214_ALIAS_PROFILE_'+a);
    const cw=await cross.doc(a).get();
    if(!cw.exists||str((cw.data()||{}).shopperId)!==CANONICAL)throw new Error('MAPPING_FAILURE:VRM214_ALIAS_CROSSWALK_'+a);
  }
  const cc=await cross.doc(CANONICAL).get();
  if(!cc.exists||str((cc.data()||{}).shopperId)!==CANONICAL)throw new Error('MAPPING_FAILURE:VRM214_CANONICAL_CROSSWALK');
  const link=await links.doc(str(ack.identityLinkId)).get(),ld=link.exists?(link.data()||{}):{};
  if(!link.exists||str(ld.canonicalShopperId)!==CANONICAL||ld.humanConfirmed!==true||str(ld.authorityType)!=='tenant_adjudication'||JSON.stringify(uniq(ld.exactAliases))!==JSON.stringify(uniq(ALIASES)))throw new Error('MAPPING_FAILURE:VRM214_IDENTITY_LINK');
  const residual=await aliasResidual();
  if(residual.length)throw new Error('PERSISTENCE_FAILURE:VRM214_ALIAS_REFERENCES_'+residual.length);
  const hr=await hrSnapshot('after'),mf=miraflores(hr);
  const visits=await project.collection('visits').get();
  const durable=visits.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(v=>str(v.hrRowId||v.id||v.visitId)===MIRAFLORES_ROW&&str(v.shopperId)===CANONICAL);
  if(!durable.length)throw new Error('PERSISTENCE_FAILURE:VRM214_MIRAFLORES_DURABLE_MISSING');
  const rid=receiptId(PERIOD,str(ack.idempotencyKey)),rc=await tenant.collection('commandReceipts').doc(rid).get(),rd=rc.exists?(rc.data()||{}):{};
  if(!rc.exists||str(rd.status)!=='committed'||rd.providerAck!==true||str(rd.commandType)!=='shopper.identity.adjudicate'||rd.identityConsolidated!==true)throw new Error('PERSISTENCE_FAILURE:VRM214_RECEIPT');
  return {canonicalActiveMemberships:1,activeAliasPrincipals:0,canonicalVisibleLogin:str(cd.visibleLogin),aliasOperationalReferences:0,identityLinkId:str(ack.identityLinkId),receiptId:rid,receiptStatus:str(rd.status),mirafloresDurableCount:durable.length,hrMiraflores:mf,hrRevision:hr.revision};
}

let browser=null;
try{
  const hr=await hrSnapshot('before'),mf=miraflores(hr),before=await preflight(),residual=await aliasResidual();
  result.before={hrRevision:hr.revision,miraflores:mf,strongPrincipals:before.strong,keeperShopperId:KEEPER,providerOwnedAliasReferences:residual.length};
  save();
  const actor=await superActor();
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'}),page=await context.newPage();
  const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:60000});
  await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(actor.uid));
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&typeof window.CX?.data?.adjudicateShopperIdentity==='function',null,{timeout:120000});
  const ctxProof=await page.evaluate(period=>{window.CX?.data?.setCurrentPeriod?.(period);const c=window.CX?.data?.ctx?.()||{},a=window.CX?.backendAuth?.context?.()||{};return {periodId:String(c.periodId||''),projectId:String(c.projectId||''),role:String(a.role||''),namespace:String(a.authNamespace||''),commandBoundary:String(window.CX?.data?.__cxCommandBoundaryVersion||'')};},PERIOD);
  if(ctxProof.periodId!==PERIOD||ctxProof.projectId!==PROGRAM||ctxProof.role!=='super'||ctxProof.namespace!=='staff')throw new Error('AUTH_FAILURE:VRM214_COMMAND_CONTEXT_'+JSON.stringify(ctxProof));
  result.adminContext=ctxProof;save();
  const call=()=>page.evaluate(async input=>await window.CX.data.adjudicateShopperIdentity(input.canonical,input.aliases,{ackAware:true,reason:'admin_confirmed_same_human_vrm214'}),{canonical:CANONICAL,aliases:ALIASES});
  const ack1=await call();result.commandAck=ack1;save();
  if(ack1?.ok!==true||ack1?.providerAck!==true||ack1?.commandType!=='shopper.identity.adjudicate'||ack1?.identityConsolidated!==true)throw new Error('PERSISTENCE_FAILURE:VRM214_ACK_'+str(ack1?.code||ack1?.status));
  if(str(ack1?.canonicalShopperId||ack1?.entityId)!==CANONICAL||JSON.stringify(uniq(ack1?.exactAliases))!==JSON.stringify(uniq(ALIASES)))throw new Error('MAPPING_FAILURE:VRM214_ACK_MAPPING');
  if(Number(ack1?.retiredPrincipalCount||0)!==3||Number(ack1?.hrWrites||0)!==0||Number(ack1?.externalWrites||0)!==0)throw new Error('PERSISTENCE_FAILURE:VRM214_ACK_SIDE_EFFECTS');
  const ack2=await call();result.replayAck=ack2;save();
  if(ack2?.ok!==true||ack2?.providerAck!==true||ack2?.idempotentReplay!==true||Number(ack2?.providerWrites||0)!==0||str(ack2?.idempotencyKey)!==str(ack1?.idempotencyKey))throw new Error('PERSISTENCE_FAILURE:VRM214_REPLAY');
  result.readback=await readback(before,ack1);
  result.decision='PASS_VRM214_JULISSA_PROVIDER_ADJUDICATION';result.providerAck=true;result.idempotentReplay=true;result.durableReadback=true;
  save();console.log(JSON.stringify(result,null,2));
}catch(error){result.decision='FAIL_VRM214_JULISSA_PROVIDER_ADJUDICATION';result.error=str(error?.stack||error);save();console.error(result.error);process.exitCode=2;}
finally{try{if(browser)await browser.close();}catch{}}
