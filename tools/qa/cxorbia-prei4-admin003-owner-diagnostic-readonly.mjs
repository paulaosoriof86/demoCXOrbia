#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_003_OWNER_OUT||'.tmp/prei4-admin-003-owner');
const ROOT=String(process.env.PREI4_003_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.PREI4_003_HR_REVISION||'');
const TENANT='tya',PROJECT='cinepolis';
const INVALID='shopper_gt_018ca3e794',CANON='shopper_gt_bd74ace936',MILTON_PAZ='shopper_gt_81de8fb0a2';
const PATRICIA=['shopper_gt_0757b1eeb4','shopper_gt_7c8b7cbdbf','shopper_gt_c342b8c62e'];
const JARY=['shopper_gt_0a363269ad','shopper_gt_f726f2eb34'];
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
const normName=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),fp=v=>sha(v).slice(0,16);
fs.mkdirSync(OUT,{recursive:true});
const write=(n,v)=>fs.writeFileSync(OUT+'/'+n,JSON.stringify(v,null,2)+'\n');
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('ENVIRONMENT_FAILURE:PREI4_003_OWNER_HR');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const docs=async ref=>(await ref.get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));
const [profiles,users,crosswalk,links]=await Promise.all([
  docs(tenant.collection('shoppers')),docs(tenant.collection('users')),docs(tenant.collection('shopperIdentityCrosswalk')),docs(tenant.collection('shopperIdentityLinks'))
]);
const byId=id=>profiles.find(x=>str(x.id||x.shopperId||x.docId)===id)||null;
const tokens=x=>uniq([str(x?.id),str(x?.shopperId),str(x?.legacyShopperId),str(x?.externalShopperId),str(x?.sourceId),str(x?.sourceKey),str(x?.profileId),str(x?.shopperDocId),...arr(x?.exactAliases),...arr(x?.identityAliases),...arr(x?.aliases),...arr(x?.canonicalLegacyIds),...arr(x?.legacyLiveShopperIds),...arr(x?.sourceShopperIds),...arr(x?.hrShopperIds)]);
const sourceTokens=l=>uniq([str(l?.sourceIdentityKey),str(l?.sourceSubjectId),str(l?.sourceId),str(l?.sourceKey),str(l?.legacyShopperId),str(l?.externalShopperId),str(l?.sourceShopperId),...arr(l?.sourceIdentityAliases),...arr(l?.sourceAliases),...arr(l?.exactAliases),...arr(l?.aliases)]);
const canonicalOf=l=>str(l?.canonicalShopperId||l?.canonicalId||l?.shopperId||l?.profileId);
const crossSource=x=>str(x?.sourceShopperId||x?.sourceIdentityKey||x?.sourceStableKey||x?.id||x?.docId);
const crossCanonical=x=>str(x?.canonicalShopperId||x?.shopperId||x?.canonicalId||x?.id||x?.docId);

const hrResp=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&fresh=1&prei4003owner='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrResp.ok)throw new Error('PROVIDER_FAILURE:PREI4_003_OWNER_HR_HTTP_'+hrResp.status);
const hb=await hrResp.json(),hs=hb?.snapshot||hb?.data||hb,rt=hb?._runtime||hs?._runtime||{};
const rev=str(rt.revision||hs.revision||hs.sourceRevision);
if(rev!==EXPECTED_HR)throw new Error('SOURCE_FAILURE:PREI4_003_OWNER_HR_REVISION:'+rev);

const viewProfile=id=>{
  const p=byId(id);
  if(!p)return {exists:false,id};
  return {exists:true,id,name:str(p.nombre||p.name),firstName:str(p.firstName),lastName:str(p.lastName),visibleLogin:str(p.visibleLogin),identityQuarantined:p.identityQuarantined===true,excludedFromCanonicalReadModel:p.excludedFromCanonicalReadModel===true,canonicalShopperId:str(p.canonicalShopperId),identityAuthority:str(p.identityAuthority),identityAuthorityRef:str(p.identityAuthorityRef),tokens:tokens(p)};
};
const milton={canonical:viewProfile(CANON),invalid:viewProfile(INVALID),distinctMiltonPaz:viewProfile(MILTON_PAZ)};
const invalidCross=crosswalk.filter(x=>crossSource(x)===INVALID||str(x.docId)===INVALID).map(x=>({docId:x.docId,source:crossSource(x),canonical:crossCanonical(x),authorityType:str(x.authorityType),authorityRef:str(x.authorityRef),status:str(x.status||x.state)}));
const invalidLinks=links.filter(x=>sourceTokens(x).includes(INVALID)||canonicalOf(x)===CANON).map(x=>({docId:x.docId,sourceTokens:sourceTokens(x),canonical:canonicalOf(x),authorityType:str(x.authorityType||x.authority?.type),authorityRef:str(x.authorityRef||x.authority?.evidenceRef),status:str(x.status||x.state),periodIndependent:x.periodIndependent===true,projectScope:str(x.projectScope||x.projectId||x.scope?.projectId)}));
const miltonMemberships=users.filter(x=>[CANON,INVALID,MILTON_PAZ].includes(str(x.shopperId))).map(x=>({uidFp:fp(x.docId),shopperId:str(x.shopperId),active:x.active===true,role:str(x.role),namespace:str(x.authNamespace),visibleLogin:str(x.visibleLogin)}));

const linkConflicts=[];
for(const l of links){
  const canonical=canonicalOf(l);if(!canonical)continue;
  for(const t of sourceTokens(l)){
    const cands=uniq(crosswalk.filter(x=>crossSource(x)===t||tokens(x).includes(t)).map(crossCanonical));
    if(cands.length===1&&cands[0]!==canonical)linkConflicts.push({linkId:l.docId,sourceToken:t,linkCanonical:canonical,crosswalkCanonical:cands[0],authorityType:str(l.authorityType||l.authority?.type),status:str(l.status||l.state),projectScope:str(l.projectScope||l.projectId||l.scope?.projectId)});
  }
}

const groupMeta=ids=>ids.map(id=>{const p=byId(id);return{id,exists:!!p,name:str(p?.nombre||p?.name||[p?.firstName,p?.lastName].filter(Boolean).join(' ')),nameKey:normName(p?.nombre||p?.name||[p?.firstName,p?.lastName].filter(Boolean).join(' ')),tokens:tokens(p)};});
const exactOverlap=(a,b)=>{const aa=new Set(a.tokens.filter(x=>x!==a.id&&x!==b.id)),bb=new Set(b.tokens.filter(x=>x!==a.id&&x!==b.id));return [...aa].filter(x=>bb.has(x));};
function groupProof(ids){const rows=groupMeta(ids),pairs=[];for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)pairs.push({a:rows[i].id,b:rows[j].id,sameName:rows[i].nameKey&&rows[i].nameKey===rows[j].nameKey,sharedExact:exactOverlap(rows[i],rows[j])});return{rows,pairs};}
const groups={patricia:groupProof(PATRICIA),jary:groupProof(JARY)};

let admin=null,pageToken=undefined;
for(let page=0;page<10&&!admin;page++){
  const listed=await auth.listUsers(1000,pageToken);
  for(const u of listed.users){const c=u.customClaims||{},role=str(c.role).toLowerCase(),ns=str(c.authNamespace).toLowerCase(),tid=str(c.tenantId),projects=arr(c.projectIds).map(str);if(tid===TENANT&&ns==='staff'&&['super','admin','ops','coordinador'].includes(role)&&(role==='super'||projects.includes(PROJECT))){admin={uid:u.uid,role};break;}}
  pageToken=listed.pageToken;if(!pageToken)break;
}
if(!admin)throw new Error('AUTH_FAILURE:PREI4_003_OWNER_ADMIN');

const browser=await chromium.launch({headless:true});
let browserProof=null;
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();
  const URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  for(let attempt=1;attempt<=5;attempt++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(admin.uid);
    await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token).catch(()=>{});
    if(await page.waitForFunction(uid=>String(firebase.auth().currentUser?.uid||'')===uid,admin.uid,{timeout:30000}).then(()=>true).catch(()=>false))break;
  }
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({uid,rev})=>String(firebase.auth().currentUser?.uid||'')===uid&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_C6_HR_AUTHORITY_GATE?.ready===true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev,{uid:admin.uid,rev:EXPECTED_HR},{timeout:150000});
  await page.evaluate(()=>CX.router.nav('shoppers',{history:false}));await page.waitForTimeout(900);
  browserProof=await page.evaluate(({canon,invalid,patricia,jary})=>{
    const d=window.CX?.data||{},body=String(document.body?.innerText||''),rows=Array.isArray(d.shoppers)?d.shoppers:[];
    const by=id=>rows.find(x=>String(x.id||x.shopperId||'')===id)||null;
    const review=Array.isArray(d.__identityReviewQueue)?d.__identityReviewQueue:[];
    const groupReview=review.filter(x=>x&&x.reason==='display_name_collision_not_auto_merged');
    const tr=id=>document.querySelector('[data-sid="'+CSS.escape(id)+'"]');
    return {
      sourceRevision:String(d.previewMeta?.sourceRevision||''),
      canonicalMilton:by(canon)?{name:String(by(canon).nombre||''),firstName:String(by(canon).firstName||''),lastName:String(by(canon).lastName||'')} : null,
      invalidVisible:!!by(invalid)||!!tr(invalid),
      canonicalVisible:!!tr(canon),
      reviewQueueCount:review.length,
      sameNameReviewCount:groupReview.length,
      sameNameReviewGroups:groupReview.map(x=>({reason:String(x.reason||''),shopperIds:(x.shopperIds||[]).map(String)})),
      uiHasIdentityReviewCopy:/identidad|duplicad|coincidencia|revisi[oó]n de identidad|mismo nombre/i.test(body),
      patriciaVisible:patricia.filter(id=>!!tr(id)),
      jaryVisible:jary.filter(id=>!!tr(id))
    };
  },{canon:CANON,invalid:INVALID,patricia:PATRICIA,jary:JARY});
  await ctx.close();
}finally{await browser.close();}

const rootCauses=[];
if(milton.canonical.exists&&normName(milton.canonical.name)==='mishael de paz'&&milton.canonical.firstName==='Milton'&&milton.canonical.lastName==='De Paz')rootCauses.push('DURABLE_CANONICAL_MILTON_NAME_REGRESSION');
if(milton.invalid.exists&&(!milton.invalid.identityQuarantined||!milton.invalid.excludedFromCanonicalReadModel))rootCauses.push('INVALID_MISHAEL_QUARANTINE_REGRESSION');
if(browserProof?.canonicalMilton&&normName(browserProof.canonicalMilton.name)==='mishael de paz')rootCauses.push('CANONICAL_MILTON_BROWSER_DISPLAY_REGRESSION');
if((browserProof?.sameNameReviewCount||0)>0&&browserProof?.uiHasIdentityReviewCopy!==true)rootCauses.push('ADMIN_IDENTITY_REVIEW_QUEUE_NOT_SURFACED');
if(linkConflicts.length)rootCauses.push('PROVIDER_LINK_CROSSWALK_CONFLICT_PRESENT');
if(groups.patricia.pairs.some(x=>x.sameName&&!x.sharedExact.length))rootCauses.push('PATRICIA_SAME_NAME_NO_EXACT_MERGE_AUTHORITY');
if(groups.jary.pairs.some(x=>!x.sharedExact.length))rootCauses.push('JARY_NO_EXACT_MERGE_AUTHORITY');

const result={
  schemaVersion:'cxorbia.prei4.admin003.owner-diagnostic-readonly.v1',
  decision:'PASS_PREI4_ADMIN_003_OWNER_DIAGNOSTIC',
  hrRevision:EXPECTED_HR,
  milton,invalidCross,invalidLinks,miltonMemberships,linkConflicts,groups,browserProof,rootCauses,
  safety:{readOnly:true,firestoreWrites:0,authWrites:0,hrWrites:0,deploys:0,fuzzyMatching:false,nameMatching:false,production:false}
};
write('result.json',result);
console.log(JSON.stringify({decision:result.decision,rootCauses,milton,browserProof,linkConflicts,groups},null,2));
