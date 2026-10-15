#!/usr/bin/env node
/* I3 R22 and Finance read-only live provider proof, same frozen DEV artifact.
 * Zero markRead, Firestore/HR/Auth/finance mutations. No identifiers/secrets emitted.
 * Admin-issued ephemeral browser session is READ-ONLY and is not R20 password proof.
 */
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const E=process.env, str=v=>String(v??'').trim(), arr=v=>Array.isArray(v)?v:[];
const source=str(E.FOCAL_SOURCE),revision=str(E.EXPECTED_HR_REVISION);
const host=str(E.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const out=str(E.R22_FINANCE_OUT||'.tmp/phasea-representative-live/r22-finance');
const tenantId='tya',projectId='cinepolis';
const evidence={schema:'cxorbia.i3.r22-finance.live-readonly.v1',
  sourceSha:source,expectedHrRevision:revision,decision:'HOLD_READONLY',
  notification:{decision:'HOLD_R22_NO_PROOF',profilesChecked:0},
  finance:{decision:'HOLD_FINANCE_PROVIDER_EVIDENCE'},
  providerWrites:0,firestoreWrites:0,hrWrites:0,authWrites:0,bankWrites:0,production:false};
fs.mkdirSync(out,{recursive:true});
const persist=()=>{fs.writeFileSync(out+'/result.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));};
function reason(e){return str(e?.code||e?.name||e).replace(/[^a-z0-9_:-]/gi,'_').slice(0,92);}
async function docs(ref,max=1800){const s=await ref.limit(max).get();return {rows:s.docs.map(x=>({id:x.id,...x.data()})),limitHit:s.size===max};}
const projectMatch=x=>!str(x.projectId)||str(x.projectId)===projectId;
function countrySummary(rows){
 const ct={GT:0,HN:0,unscoped:0};
 for(const r of rows){let v=str(r.country||r.pais||r.countryCode).toUpperCase();
  if(['GT','GUATEMALA'].includes(v))ct.GT++;else if(['HN','HONDURAS'].includes(v))ct.HN++;else ct.unscoped++;
 }return ct;
}
function sourceFlag(x){return Boolean(str(x.paymentSourceRef||x.externalPaymentSourceRef||x.historicalPaymentAuthorityRef||x.providerRef||x.reconciliationSourceRef));}
try{
 if(!/^[a-f0-9]{40}$/.test(source)||!/^[a-f0-9]{64}$/.test(revision)||new URL(host).origin!=='https://cxorbia-backend-dev.web.app')throw Error('SOURCE_FAILURE_EXACT_DEV_UNPINNED');
 if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
 const tenant=getFirestore().collection('tenants').doc(tenantId),auth=getAuth();
 const refs={users:tenant.collection('users'),bulletins:tenant.collection('bulletins'),reads:tenant.collection('bulletinReads'),
  reconciliations:tenant.collection('paymentReconciliations'),batches:tenant.collection('paymentBatches'),
  liquidations:tenant.collection('liquidations'),movement:tenant.collection('financialMovements'),
  accounts:tenant.collection('financeAccounts'),visits:tenant.collection('projects').doc(projectId).collection('visits')};
 const data=Object.fromEntries(await Promise.all(Object.entries(refs).map(async ([k,ref])=>{
  try{return [k,{ok:true,...await docs(ref)}];}catch(e){return [k,{ok:false,error:reason(e),rows:[]}];}
 })));
 const financeCollections=['reconciliations','batches','liquidations','movement','accounts','visits'];
 const f={collections:{},pendingWithoutExternalProof:{},providerPaymentAcksClaimed:0,realBankTransfersConfirmedByThisTest:0};
 for(const k of financeCollections){
  const group=data[k].rows.filter(projectMatch);
  f.collections[k]={readOk:data[k].ok===true,records:group.length,countries:countrySummary(group),truncated:data[k].limitHit===true};
  if(['reconciliations','batches','liquidations','visits'].includes(k)){
   const pending=group.filter(x=>/paid|pagad|confirmad|conciliad|reconciled/i.test(str(x.paymentState||x.paymentStatus||x.estado||x.status))&&!sourceFlag(x));
   f.pendingWithoutExternalProof[k]=pending.length;
  }
 }
 f.externalPaymentTruthNotInferred=true;f.allCollectionsReadable=financeCollections.every(k=>data[k].ok===true);
 f.decision='HOLD_FINANCE_HISTORICAL_AND_BATCH_TERMINAL_PROVIDER_PROOF_PENDING';
 evidence.finance=f;
 const members=data.users.rows.filter(x=>x.active===true&&x.role==='shopper'&&x.authNamespace==='shopper'&&arr(x.projectIds).map(str).includes(projectId));
 const memberByUid=new Map(members.map(x=>[x.id,x]));
 const bulletins=new Map(data.bulletins.rows.filter(projectMatch).map(x=>[x.id,x]));
 const counts=new Map();
 for(const r of data.reads.rows){
  const uid=str(r.userId),m=memberByUid.get(uid),b=bulletins.get(str(r.bulletinId));
  if(!m||!b||!arr(b.targetShopperIds).map(str).includes(str(m.shopperId)))continue;
  const prior=counts.get(uid)||new Set();prior.add(b.id);counts.set(uid,prior);
 }
 const candidates=[...counts.entries()].filter(([uid,set])=>set.size>0&&memberByUid.has(uid))
   .sort((a,b)=>b[1].size-a[1].size||a[0].localeCompare(b[0]));
 let selected=[];
 for(const [uid,seen] of candidates){
  const m=memberByUid.get(uid),shopperId=str(m.shopperId);
  if(selected.some(p=>p.shopperId===shopperId))continue;
  try{
   const u=await auth.getUser(uid),c=u.customClaims||{};
   if(!u.disabled&&c.role==='shopper'&&c.authNamespace==='shopper'&&c.tenantId===tenantId&&c.shopperId===shopperId&&arr(c.projectIds).includes(projectId)){
    selected.push({uid,shopperId,readIds:seen});
   }
  }catch(_){}
  if(selected.length===2)break;
 }
 const n={readReceiptsAvailable:data.reads.rows.length,activeProjectNotices:bulletins.size,
   exactCandidatesWithRead:counts.size,principalsSelected:selected.length,profilesChecked:0,
   scopedReadPersisted:0,wrongShopperLeak:0,readLostAfterReload:0,readUnauthorizedShown:0,
   visitTargetWithoutRoute:0,visibleTechnicalTextCount:0,
   browserPageErrors:0, allSamePrincipalAfterReload:true,
   usedCustomTokenForReadOnlyInspection:true,ordinaryPasswordProofSubstitution:false};
 evidence.notification=n;
 if(selected.length!==2){n.decision='HOLD_R22_TWO_EXACT_EXISTING_READERS_NOT_FOUND';persist();process.exit(0);}
 const browser=await chromium.launch({headless:true});
 try{
  for(const person of selected){
   const context=await browser.newContext({serviceWorkers:'block'});
   try{
    const page=await context.newPage();let errors=0;page.on('pageerror',()=>{errors++});
    const url=host+'/index-backend-dev.html?cxProjectId='+encodeURIComponent(projectId);
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:65000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:45000});
    const token=await auth.createCustomToken(person.uid);
    await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(t);},token);
    await page.goto('about:blank',{waitUntil:'domcontentloaded',timeout:30000});
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:65000});
    await page.waitForFunction(({tenantId,projectId,uid})=>{
     const ctx=window.CX?.backendAuth?.context?.()||{};
     return window.firebase?.auth?.().currentUser?.uid===uid&&ctx.authenticated===true&&ctx.role==='shopper'&&ctx.tenantId===tenantId&&ctx.projectIds?.includes(projectId)&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;
    },{tenantId,projectId,uid:person.uid},{timeout:95000});
    const capture=async()=>page.evaluate(async()=>{
      await window.CX?.backendBulletins?.load?.();
      const entries=(window.CX?.notif?.history?.('shopper')||[]).filter(x=>x.source==='firestore');
      const sid=String(window.CX?.backendAuth?.context?.()?.shopperId||'');
      return {ownerExact:window.CX?.backendAuth?.context?.()?.authenticated===true,
       items:entries.map(x=>({id:String(x.id||''),leida:x.leida===true,targets:Array.isArray(x.targetShopperIds)?x.targetShopperIds.map(String):[],
         visitNotice:x.entityType==='visit',nav:String(x.nav||''),technical:/hr_20\\d{2}[-_]/i.test(String(x.txt||''))})),
       sid,
       sourceReady:window.CX_BACKEND_BULLETINS_STATUS?.source==='firestore'};
    });
    const before=await capture();
    await page.reload({waitUntil:'domcontentloaded',timeout:65000});
    await page.waitForFunction(uid=>window.firebase?.auth?.().currentUser?.uid===uid&&window.CX?.backendAuth?.context?.()?.authenticated===true&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,person.uid,{timeout:95000});
    const after=await capture();
    const set=person.readIds;
    n.profilesChecked++;
    n.scopedReadPersisted+=after.items.filter(x=>set.has(x.id)&&x.leida).length;
    n.readLostAfterReload+=before.items.filter(x=>x.leida&&!after.items.some(y=>y.id===x.id&&y.leida)).length;
    n.wrongShopperLeak+=after.items.filter(x=>x.targets.length&&!x.targets.includes(person.shopperId)).length;
    n.readUnauthorizedShown+=after.items.filter(x=>x.targets.length&&!x.targets.includes(after.sid)).length;
    n.visitTargetWithoutRoute+=after.items.filter(x=>x.visitNotice&&x.nav!=='misvisitas').length;
    n.visibleTechnicalTextCount+=after.items.filter(x=>x.technical).length;
    n.browserPageErrors+=errors;
    n.allSamePrincipalAfterReload=n.allSamePrincipalAfterReload&&before.sid===person.shopperId&&after.sid===person.shopperId&&before.ownerExact&&after.ownerExact&&before.sourceReady&&after.sourceReady;
   }finally{await context.close();}
  }
 }finally{await browser.close();}
 n.decision=n.profilesChecked===2&&n.scopedReadPersisted>0&&n.readLostAfterReload===0&&n.wrongShopperLeak===0&&n.readUnauthorizedShown===0&&n.browserPageErrors===0&&n.allSamePrincipalAfterReload?
  'PASS_R22_EXISTING_READ_RELOAD_IDENTITY_ISOLATION_PARTIAL':
  'HOLD_R22_EXISTING_READ_RELOAD_ISOLATION';
 n.missingTerminalProof=['FRESH_PER_NOTICE_MARK_READ_ACK','EXACT_NOTIFICATION_CLICK_NAVIGATION','FULL_POPULATION','HUMAN_REVIEW_OF_TECHNICAL_BODIES'];
 evidence.decision='HOLD_I3_OPEN_P0_READONLY_EVIDENCE_ONLY';
 persist();
}catch(e){
 evidence.failureCategory=reason(e);
 evidence.decision='HOLD_I3_READONLY_ENV_OR_PROVIDER';
 persist();process.exitCode=2;
}
