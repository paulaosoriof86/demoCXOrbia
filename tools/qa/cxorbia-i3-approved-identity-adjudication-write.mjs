#!/usr/bin/env node
/* I3 — Execute only explicitly owner-approved identity fusions, through the
   existing DEV provider command and its normal ACK/idempotency boundary.
   No named-person special cases exist in the implementation; approvals are
   data in the exact frozen checkpoint. Production and external HR are inert. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import {CREDENTIAL_PASSWORD_PROOF_VERSION} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const str=x=>String(x??'').trim();
const arr=x=>Array.isArray(x)?x:[];
const uniq=x=>[...new Set(arr(x).map(str).filter(Boolean))].sort();
const hash=x=>crypto.createHash('sha256').update(String(x),'utf8').digest('hex');
const norm=x=>str(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase();
const countryCode=x=>({guatemala:'GT',gt:'GT',gtm:'GT',honduras:'HN',hn:'HN',hnd:'HN'})[norm(x)]||str(x).toUpperCase();
const PROJECT=str(process.env.PROJECT||'cxorbia-backend-dev');
const TENANT=str(process.env.TENANT_ID||'tya');
const PROGRAM=str(process.env.PROJECT_ID||'cinepolis');
const ROOT=str(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=str(process.env.FOCAL_SOURCE);
const EXPECTED_HR=str(process.env.EXPECTED_HR_REVISION);
const OUT=str(process.env.APPROVED_IDENTITY_OUT||'.tmp/approved-identity-adjudication');
const APPROVAL_FILE=str(process.env.APPROVED_IDENTITY_FILE||'docs/checkpoints/CXORBIA_I3_APPROVED_FUSIONS_20261105.json');
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw Error('SOURCE_FAILURE:APPROVED_IDENTITY_EXACT_SOURCE_AND_HR_REQUIRED');
const approvals=JSON.parse(fs.readFileSync(APPROVAL_FILE,'utf8'));
if(approvals.schemaVersion!=='cxorbia.i3.approved-identity-adjudication.v1'||approvals.scope!=='DEV_ONLY'||approvals.tenantId!==TENANT||approvals.projectId!==PROGRAM||approvals.productSourceSha!==SOURCE||ROOT!=='https://cxorbia-backend-dev.web.app'||arr(approvals.approvedCases).length!==1)throw Error('SOURCE_FAILURE:APPROVED_IDENTITY_AUTHORITY_OR_DEV_SCOPE_INVALID');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const profiles=tenant.collection('shoppers'),users=tenant.collection('users'),cross=tenant.collection('shopperIdentityCrosswalk'),links=tenant.collection('shopperIdentityLinks');
const result={schemaVersion:'cxorbia.i3.approved-identity-adjudication-write.v1',decision:'HOLD',classification:'MAPPING_FAILURE',sourceSha:SOURCE,hrRevision:EXPECTED_HR,approvalFile:APPROVAL_FILE,production:false,externalWrites:0,hrWrites:0,cases:[]};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();

async function sameHrRevision(tag){
  const r=await fetch(ROOT+'/api/'+encodeURIComponent(TENANT)+'/'+encodeURIComponent(PROGRAM)+'/hr-live?format=meta&approved_identity='+encodeURIComponent(tag)+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
  if(!r.ok)throw Error('PROVIDER_FAILURE:IDENTITY_HR_HTTP_'+r.status);
  const data=await r.json(),rev=str(data.revision);
  if(rev!==EXPECTED_HR)throw Error('SOURCE_FAILURE:IDENTITY_HR_DRIFT_'+rev);
  return rev;
}
async function activeMembers(id){
  const snap=await users.where('shopperId','==',id).get();
  return snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>x.active===true&&str(x.role)==='shopper'&&str(x.authNamespace)==='shopper'&&arr(x.projectIds).map(str).includes(PROGRAM));
}
function fullName(profile){
  return norm(profile?.nombre||profile?.name||[profile?.firstName||profile?.displayFirstName,profile?.lastName||profile?.displayLastName].filter(Boolean).join(' '));
}
async function activeIdentityPreflight(item){
  const canonical=str(item.canonicalShopperId),keeperId=str(item.keeperShopperId),aliases=uniq(item.approvedAliasShopperIds);
  if(!canonical||!aliases.length||aliases.includes(canonical)||!aliases.includes(keeperId)||!str(item.reason)||!str(item.expectedLogin)||!['GT','HN'].includes(item.country))throw Error('SOURCE_FAILURE:IDENTITY_INVALID_CASE');
  const ids=[canonical,...aliases],p={};
  for(const id of ids){
    const snap=await profiles.doc(id).get();
    if(!snap.exists)throw Error('MAPPING_FAILURE:IDENTITY_MISSING_PROFILE_'+id);
    p[id]=snap.data()||{};
    const actualName=fullName(p[id]);
    if(actualName&&actualName!==norm(item.normalizedFullName))throw Error('MAPPING_FAILURE:IDENTITY_NAME_CONTRADICTION_'+id);
    const country=countryCode(p[id].pais||p[id].country||p[id].hrManaged?.pais||p[id].hrManaged?.country);
    if(country&&country!==item.country)throw Error('MAPPING_FAILURE:IDENTITY_COUNTRY_CONTRADICTION_'+id);
  }
  const canonicalActive=await activeMembers(canonical),aliasActive=await Promise.all(aliases.map(activeMembers));
  // A second run is a readback-only PASS, never another mutation.
  if(canonicalActive.length===1&&!aliasActive.some(x=>x.length)&&str(canonicalActive[0].visibleLogin).toLowerCase()===str(item.expectedLogin).toLowerCase())return {state:'ALREADY_CONSOLIDATED',canonical,aliases,keeperUid:canonicalActive[0].uid,profiles:p};
  if(canonicalActive.length!==1||aliasActive.some(x=>x.length>1)||aliasActive[aliases.indexOf(keeperId)]?.length!==1)throw Error('AUTH_FAILURE:IDENTITY_ACTIVE_MEMBERSHIP_NOT_DETERMINISTIC');
  const allMembers=[...canonicalActive,...aliasActive.flat()];
  const keeperMember=aliasActive[aliases.indexOf(keeperId)][0];
  if(str(keeperMember.visibleLogin).toLowerCase()!==str(item.expectedLogin).toLowerCase())throw Error('AUTH_FAILURE:IDENTITY_NORMAL_LOGIN_NOT_KEEPER');
  if(str(keeperMember.credentialPasswordProofVersion||p[keeperId].credentialPasswordProofVersion)!==CREDENTIAL_PASSWORD_PROOF_VERSION)throw Error('AUTH_FAILURE:IDENTITY_KEEPER_CREDENTIAL_UNVERIFIED');
  const activeUids=new Set(allMembers.map(x=>x.uid));
  if(activeUids.size!==allMembers.length)throw Error('AUTH_FAILURE:IDENTITY_DUPLICATE_UID');
  for(const m of allMembers){
    const u=await auth.getUser(m.uid);
    if(u.disabled===true||str(u.customClaims?.tenantId)!==TENANT||str(u.customClaims?.shopperId)!==str(m.shopperId)||!arr(u.customClaims?.projectIds).map(str).includes(PROGRAM))throw Error('AUTH_FAILURE:IDENTITY_AUTH_CLAIMS_MISMATCH');
  }
  const all=await users.get();
  const other=all.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(m=>m.active===true&&str(m.role)==='shopper'&&str(m.authNamespace)==='shopper'&&arr(m.projectIds).map(str).includes(PROGRAM)&&str(m.visibleLogin).toLowerCase()===str(item.expectedLogin).toLowerCase()&&!activeUids.has(m.uid));
  if(other.length)throw Error('AUTH_FAILURE:IDENTITY_LOGIN_HAS_UNRELATED_ACTIVE_PRINCIPAL');
  return {state:'READY',canonical,aliases,keeperId,keeperUid:keeperMember.uid,beforeUids:Object.fromEntries(allMembers.map(m=>[str(m.shopperId),m.uid])),profiles:p};
}
async function operator(){
  const snap=await users.get();
  const candidates=snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(m=>m.active===true&&str(m.role).toLowerCase()==='super'&&str(m.authNamespace).toLowerCase()==='staff').sort((a,b)=>a.uid.localeCompare(b.uid));
  for(const c of candidates){try{const u=await auth.getUser(c.uid);if(u.disabled!==true&&str(u.customClaims?.tenantId)===TENANT&&str(u.customClaims?.role).toLowerCase()==='super'&&str(u.customClaims?.authNamespace).toLowerCase()==='staff')return c;}catch{}}
  throw Error('AUTH_FAILURE:IDENTITY_AUTHORIZED_SUPER_MISSING');
}
async function aliasResidual(aliases){
  const fields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
  const arrays=['shopperIds','candidateShopperIds'],set=new Set(aliases),defs=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
  const hits=[];
  for(const [scope,name] of defs){
    const col=scope==='tenant'?tenant.collection(name):project.collection(name),snap=await col.get();
    for(const doc of snap.docs){const row=doc.data()||{};if(fields.some(k=>set.has(str(row[k])))||arrays.some(k=>arr(row[k]).some(v=>set.has(str(v)))))hits.push({collection:name,id:doc.id});}
  }
  return hits;
}
async function verify(item,before,ack){
  const canonical=before.canonical,aliases=before.aliases,active=await activeMembers(canonical);
  if(active.length!==1||active[0].uid!==before.keeperUid)throw Error('AUTH_FAILURE:IDENTITY_KEEPER_NOT_CANONICAL_AFTER');
  const keeper=await auth.getUser(before.keeperUid);
  if(keeper.disabled||str(keeper.customClaims?.shopperId)!==canonical||str(active[0].visibleLogin).toLowerCase()!==str(item.expectedLogin).toLowerCase())throw Error('AUTH_FAILURE:IDENTITY_KEEPER_LOGIN_CHANGED');
  for(const id of aliases){
    if((await activeMembers(id)).length)throw Error('AUTH_FAILURE:IDENTITY_ALIAS_STILL_ACTIVE_'+id);
    const ps=await profiles.doc(id).get(),data=ps.data()||{},cr=await cross.doc(id).get();
    if(str(data.identityState)!=='superseded_exact_alias'||str(data.supersededByShopperId)!==canonical||!cr.exists||str(cr.data()?.shopperId)!==canonical)throw Error('MAPPING_FAILURE:IDENTITY_ALIAS_READBACK_'+id);
  }
  if(before.beforeUids)for(const [id,uid] of Object.entries(before.beforeUids)){if(uid===before.keeperUid)continue;const u=await auth.getUser(uid);if(!u.disabled)throw Error('AUTH_FAILURE:IDENTITY_RETIRED_ACCOUNT_ACTIVE_'+id);}
  const ps=await profiles.doc(canonical).get(),p=ps.data()||{},cw=await cross.doc(canonical).get();
  if(!ps.exists||str(p.shopperId)!==canonical||str(p.visibleLogin).toLowerCase()!==str(item.expectedLogin).toLowerCase()||!cw.exists||str(cw.data()?.shopperId)!==canonical)throw Error('MAPPING_FAILURE:IDENTITY_CANONICAL_PROFILE_MISMATCH');
  const link=ack?.identityLinkId?await links.doc(str(ack.identityLinkId)).get():null;
  if(link&&(!link.exists||str(link.data()?.canonicalShopperId)!==canonical||link.data()?.humanConfirmed!==true||str(link.data()?.authorityType)!=='tenant_adjudication'))throw Error('PERSISTENCE_FAILURE:IDENTITY_PROVIDER_LINK_UNVERIFIED');
  const pending=await aliasResidual(aliases);
  if(pending.length)throw Error('PERSISTENCE_FAILURE:IDENTITY_OPERATIONAL_ALIAS_RESIDUAL_'+pending.length);
  const rev=await sameHrRevision('after');
  return {canonicalActiveMemberships:active.length,aliasActiveMemberships:0,keeperVisibleLogin:str(p.visibleLogin),keeperShopperId:canonical,aliasCrosswalks:aliases.length,operationalAliasResiduals:0,linkId:str(ack?.identityLinkId),hrRevision:rev};
}

let browser=null;
try{
  await sameHrRevision('before');
  const item=approvals.approvedCases[0],before=await activeIdentityPreflight(item),entry={caseId:str(item.caseId),canonicalShopperId:before.canonical,aliases:before.aliases,expectedAdminHistory:Number(item.expectedAdminHistory||0),decision:'HOLD'};
  result.cases.push(entry);save();
  if(before.state==='ALREADY_CONSOLIDATED'){
    entry.readback=await verify(item,before,null);
    entry.decision='PASS_ALREADY_CONSOLIDATED_NO_WRITE';entry.providerAck=true;entry.idempotentReplay=true;entry.durableReadback=true;
  }else{
    const actor=await operator();
    browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
    const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'}),page=await context.newPage();
    const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:60000});
    await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(actor.uid));
    await page.reload({waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&typeof window.CX?.data?.adjudicateShopperIdentity==='function',null,{timeout:120000});
    const authContext=await page.evaluate(period=>{window.CX?.data?.setCurrentPeriod?.(period);const a=window.CX?.backendAuth?.context?.()||{},c=window.CX?.data?.ctx?.()||{};return {role:String(a.role||''),namespace:String(a.authNamespace||''),projectId:String(c.projectId||''),periodId:String(c.periodId||'')};},str(item.periodForCommand));
    if(authContext.role!=='super'||authContext.namespace!=='staff'||authContext.projectId!==PROGRAM||authContext.periodId!==str(item.periodForCommand))throw Error('AUTH_FAILURE:IDENTITY_ADMIN_CONTEXT_WRONG');
    entry.adminContext=authContext;save();
    const input={canonical:before.canonical,aliases:before.aliases,keeper:before.keeperId,reason:str(item.reason)};
    const call=()=>page.evaluate(async d=>window.CX.data.adjudicateShopperIdentity(d.canonical,d.aliases,{ackAware:true,keeperShopperId:d.keeper,keeperAccessConfirmed:true,reason:d.reason}),input);
    const ack=await call();entry.commandAck=ack;save();
    if(ack?.ok!==true||ack?.providerAck!==true||ack?.commandType!=='shopper.identity.adjudicate'||ack?.identityConsolidated!==true||str(ack.canonicalShopperId||ack.entityId)!==before.canonical||JSON.stringify(uniq(ack.exactAliases))!==JSON.stringify(before.aliases)||Number(ack.hrWrites||0)!==0||Number(ack.externalWrites||0)!==0)throw Error('PERSISTENCE_FAILURE:IDENTITY_PROVIDER_ACK_INVALID_'+str(ack?.code||ack?.status));
    const replay=await call();entry.replayAck={ok:replay?.ok,providerAck:replay?.providerAck,idempotentReplay:replay?.idempotentReplay,providerWrites:replay?.providerWrites};save();
    if(replay?.ok!==true||replay?.providerAck!==true||replay?.idempotentReplay!==true||Number(replay.providerWrites||0)!==0||str(replay.idempotencyKey)!==str(ack.idempotencyKey))throw Error('PERSISTENCE_FAILURE:IDENTITY_REPLAY_FAILED');
    entry.readback=await verify(item,before,ack);
    entry.providerAck=true;entry.idempotentReplay=true;entry.durableReadback=true;entry.decision='PASS_APPROVED_IDENTITY_PROVIDER_ADJUDICATION';
  }
  result.decision='PASS_APPROVED_IDENTITY_PROVIDER_ADJUDICATION';result.classification='MATCH';save();console.log(JSON.stringify(result,null,2));
}catch(error){result.decision='FAIL_APPROVED_IDENTITY_PROVIDER_ADJUDICATION';result.error=str(error?.stack||error);save();console.error(result.error);process.exitCode=2;}
finally{try{if(browser)await browser.close();}catch{}}
