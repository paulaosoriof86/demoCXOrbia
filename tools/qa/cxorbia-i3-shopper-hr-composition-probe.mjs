import fs from 'fs';
import path from 'path';
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const OUT=process.env.OUT;
const PROJECT=process.env.PROJECT;
const TENANT=process.env.TENANT_ID;
const PROJECT_ID=process.env.PROJECT_ID;
const SHOPPER_ID=process.env.AFFECTED_SHOPPER_ID;
const HOST=String(process.env.HOSTING_URL||'').replace(/\/$/,'');
const PRIOR_DEV_DEPLOY_RUN=process.env.PRIOR_DEV_DEPLOY_RUN||null;
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV';
const PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const write=v=>fs.writeFileSync(path.join(OUT,'affected-shopper-human-lane.json'),JSON.stringify(v,null,2)+'\n');
const visitKey=v=>{const coord=str(v?.sourceTab)&&str(v?.sourceRow)?`${str(v.sourceTab)}::${str(v.sourceRow)}`:'';return str(v?.hrRowId)||coord||str(v?.visitId||v?.id);};
const validate=s=>{try{if(!s||s.sourceSafe!==true)throw new Error('HR_LIVE_SOURCE_SAFE_REQUIRED');const periods=arr(s.periods),visits=arr(s.visits),shoppers=arr(s.shoppers),pk=periods.map(p=>str(p.key||p.periodKey)).filter(Boolean),vk=visits.map(visitKey).filter(Boolean);if(!periods.length||!visits.length)throw new Error('HR_LIVE_NONEMPTY_REQUIRED');if(new Set(pk).size!==pk.length)throw new Error('HR_LIVE_DUPLICATE_PERIOD_KEYS');if(vk.length!==visits.length||new Set(vk).size!==vk.length)throw new Error('HR_LIVE_DUPLICATE_OR_MISSING_VISIT_KEYS');const ps=new Set(pk);for(const k of new Set(visits.map(v=>str(v.periodKey)).filter(Boolean)))if(!ps.has(k))throw new Error(`HR_LIVE_VISIT_PERIOD_MISSING_${k}`);return {ok:true,periods:periods.length,visits:visits.length,shoppers:shoppers.length,uniqueVisitKeys:vk.length};}catch(e){return {ok:false,error:str(e?.message||e)};}};

try{
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
  const memberDocs=await tenant.collection('users').where('shopperId','==',SHOPPER_ID).get();
  const members=memberDocs.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(m=>m.active===true&&str(m.role)==='shopper'&&str(m.authNamespace)==='shopper'&&arr(m.projectIds).map(String).includes(PROJECT_ID));
  if(members.length!==1)throw new Error('AFFECTED_SHOPPER_MEMBERSHIP_DRIFT');
  const member=members[0];
  await auth.getUser(member.id);
  const profileSnap=await tenant.collection('shoppers').doc(SHOPPER_ID).get();
  if(!profileSnap.exists)throw new Error('AFFECTED_SHOPPER_PROFILE_DRIFT');

  const legal=(await tenant.collection('legalContents').get()).docs.map(d=>({id:d.id,...(d.data()||{})})).filter(c=>c.active!==false&&str(c.scopeMode||'tenant')==='tenant'&&str(c.currentVersion)&&/^[a-f0-9]{64}$/.test(str(c.currentDigest).toLowerCase()));
  const receipts=(await tenant.collection('legalAcceptances').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
  const current=legal.length===1?legal[0]:null;
  const matching=current?receipts.filter(r=>str(r.actorUid)===member.id&&str(r.tenantId)===TENANT&&str(r.scopeMode)==='tenant'&&str(r.role)==='shopper'&&str(r.authNamespace)==='shopper'&&str(r.legalContentId)===str(current.id)&&str(r.legalVersion)===str(current.currentVersion)&&str(r.contentDigest).toLowerCase()===str(current.currentDigest).toLowerCase()&&str(r.status)==='accepted'&&str(r.acceptanceMethod)==='human_ui'&&r.subjectExact===true&&Boolean(r.acceptedAt)):[];

  const browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext({serviceWorkers:'allow'});
  const page=await ctx.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e)));
  let observed={};
  try{
    const url=`${HOST}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(PROJECT_ID)}&cxProtectedRuntime=${PROTECTED}&cxHumanFullVisual=${FULL}&i3focal=${Date.now()}`;
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.CX_DEV_ENTRY_CANONICAL?.lane==='authenticated-human-canonical'&&window.CX_DEV_ENTRY_CANONICAL?.technicalAuth===false,null,{timeout:90000});
    await page.waitForFunction(()=>window.firebase?.apps?.some(a=>a?.name==='[DEFAULT]')&&typeof window.firebase.auth==='function',null,{timeout:90000});
    const token=await auth.createCustomToken(member.id);
    await page.evaluate(async t=>{const a=firebase.auth();await a.setPersistence(firebase.auth.Auth.Persistence.SESSION);await a.signInWithCustomToken(t);},token);
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(({tenant,shopper})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&String(c.tenantId||'')===tenant&&String(c.role||'')==='shopper'&&String(c.shopperId||'')===shopper;},{tenant:TENANT,shopper:SHOPPER_ID},{timeout:120000});
    await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE?.completed===true,null,{timeout:120000});
    const live=await page.evaluate(async()=>{
      const sleep=ms=>new Promise(r=>setTimeout(r,ms));
      const base=window.CX_TYA_LIVE_SOURCE_URL||'/api/tya/cinepolis/hr-live',sep=base.includes('?')?'&':'?';
      let last={endpoint:base,httpStatus:0,error:'HR_LIVE_UNAVAILABLE',snapshot:null,revision:null,attempt:0};
      for(let attempt=1;attempt<=4;attempt++){
        try{
          const r=await fetch(base+sep+new URLSearchParams({format:'json',fresh:'1',i3focal:String(Date.now()),attempt:String(attempt)}),{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
          const text=await r.text();
          let p=null;
          try{p=text?JSON.parse(text):null;}catch(_){p=null;}
          if(!r.ok||!p){
            last={endpoint:base,httpStatus:r.status,error:!p?`HR_LIVE_NON_JSON_${r.status}`:`HR_LIVE_HTTP_${r.status}`,bodyMarker:text.slice(0,80),snapshot:null,revision:null,attempt};
            if((r.status===429||r.status>=500||!p)&&attempt<4){await sleep(1000*attempt);continue;}
            return last;
          }
          const s=p?.snapshot||p?.data||p||{},rt=p?._runtime||s?._runtime||{};
          return {endpoint:base,httpStatus:r.status,snapshot:s,revision:rt.revision||s.sourceRevision||null,error:null,attempt};
        }catch(e){
          last={endpoint:base,httpStatus:0,error:String(e?.message||e),snapshot:null,revision:null,attempt};
          if(attempt<4){await sleep(1000*attempt);continue;}
        }
      }
      return last;
    });
    const liveValidation=validate(live.snapshot); delete live.snapshot;
    const before=await page.evaluate(()=>{const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},id=window.CX_TYA_CANONICAL_SHOPPER_PORTAL?.resolveExactSessionShopper?.(d)||null,p=d.__sessionShopperProfile||null;return {authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,boot:window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||null,context:{authenticated:c.authenticated===true,tenantId:c.tenantId||null,role:c.role||null,authNamespace:c.authNamespace||null,shopperId:c.shopperId||null,projectIds:Array.isArray(c.projectIds)?c.projectIds:[]},previewMeta:d.previewMeta||null,dataSource:window.CX?.dataSource||null,counts:{projects:Array.isArray(d.projects)?d.projects.length:0,visits:Array.isArray(d._visitas)?d._visitas.length:0,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:0},identity:id?{ok:id.ok===true,reason:id.reason||null,raw:id.raw||null,canonical:id.canonical||null,matchCount:Array.isArray(id.matches)?id.matches.length:0}:null,sessionProfile:{present:!!p,id:p?String(p.id||p.shopperId||''):null},legalModalVisible:[...document.querySelectorAll('.cx-modal')].some(x=>/Términos de uso y confidencialidad/i.test(String(x.innerText||''))&&getComputedStyle(x).display!=='none')};});
    const second=await page.evaluate(async()=>{const r=await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('i3_focal_second_reconcile');return {ok:r?.ok===true,skipped:r?.skipped===true,reason:r?.reason||null,error:r?.error||null,resultApplied:r?.result?.applied===true};});
    const after=await page.evaluate(()=>{const d=window.CX?.data||{},id=window.CX_TYA_CANONICAL_SHOPPER_PORTAL?.resolveExactSessionShopper?.(d)||null,p=d.__sessionShopperProfile||null;return {authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,counts:{projects:Array.isArray(d.projects)?d.projects.length:0,visits:Array.isArray(d._visitas)?d._visitas.length:0,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:0},identity:id?{ok:id.ok===true,reason:id.reason||null,raw:id.raw||null,canonical:id.canonical||null,matchCount:Array.isArray(id.matches)?id.matches.length:0}:null,sessionProfile:{present:!!p,id:p?String(p.id||p.shopperId||''):null}};});
    observed={live,liveValidation,before,second,after,pageErrors,legalReadback:{currentTenantLegalContentCount:legal.length,currentReceiptPresent:matching.length>0,currentReceiptCount:matching.length}};
  } finally {
    await ctx.close();
    await browser.close();
  }

  const a=observed.after.authority||{},b=observed.before,live=observed.liveValidation||{},id=observed.after.identity||{},profile=observed.after.sessionProfile||{};
  const checks={humanAuth:b.context?.authenticated===true&&b.context?.role==='shopper'&&b.context?.shopperId===SHOPPER_ID,hrHttp200:observed.live.httpStatus===200,validateSnapshot:live.ok===true,authorityApplied:a.applied===true,hrVisitsMatch:Number(a.hrVisits)===Number(live.visits),hrShoppersMatch:Number(a.hrShoppers)===Number(live.shoppers),protectedSliceStable:Number(a.protectedProfiles)===1,sessionProfilePreserved:a.sessionProfilePreserved===true&&profile.present===true&&profile.id===SHOPPER_ID,identityResolved:id.ok===true&&id.raw===SHOPPER_ID&&id.canonical===SHOPPER_ID,secondReconcileApplied:observed.second.ok===true&&observed.second.resultApplied===true,legalReceiptDurable:observed.legalReadback.currentReceiptPresent===true&&!b.legalModalVisible,noPageErrors:observed.pageErrors.length===0,notTransient:b.counts.projects>0&&b.counts.visits>0&&b.counts.shoppers>1};
  const pass=Object.values(checks).every(Boolean);
  const environmentOnly=!pass&&(observed.live.httpStatus===0||observed.live.httpStatus===429||observed.live.httpStatus>=500||observed.liveValidation?.ok!==true&&/^HR_LIVE_(HTTP|NON_JSON|UNAVAILABLE)/.test(str(observed.live.error)));
  const out={decision:pass?'PASS_I3_SHOPPER_HR_COMPOSITION_FIX':environmentOnly?'ENVIRONMENT_FAILURE':'HOLD_I3_SHOPPER_HR_COMPOSITION_FIX',classification:pass?null:environmentOnly?'ENVIRONMENT_FAILURE':'RELEASE_COMPOSITION_FAILURE',checks,observed,writes:{hostingDevDeploys:0,providerWrites:0,firestoreWrites:0,authWrites:0,hrWrites:0,productionWrites:0},priorDevDeployRun:PRIOR_DEV_DEPLOY_RUN,production:false,generatedAt:new Date().toISOString()};
  write(out);
  console.log(out.decision,JSON.stringify(checks),JSON.stringify({live:observed.live}));
  if(!pass)process.exitCode=2;
} catch(e) {
  const out={decision:'ENVIRONMENT_FAILURE',blocker:'I3_FOCAL_PROBE_EXCEPTION',error:String(e?.stack||e?.message||e),priorDevDeployRun:PRIOR_DEV_DEPLOY_RUN,production:false};
  write(out);
  console.error(e);
  process.exitCode=1;
}