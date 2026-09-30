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
          if(!r.ok||!p){last={endpoint:base,httpStatus:r.status,error:!p?`HR_LIVE_NON_JSON_${r.status}`:`HR_LIVE_HTTP_${r.status}`,bodyMarker:text.slice(0,80),snapshot:null,revision:null,attempt};if((r.status===429||r.status>=500||!p)&&attempt<4){await sleep(1000*attempt);continue;}return last;}
          const s=p?.snapshot||p?.data||p||{},rt=p?._runtime||s?._runtime||{};
          return {endpoint:base,httpStatus:r.status,snapshot:s,revision:rt.revision||s.sourceRevision||null,error:null,attempt};
        }catch(e){last={endpoint:base,httpStatus:0,error:String(e?.message||e),snapshot:null,revision:null,attempt};if(attempt<4){await sleep(1000*attempt);continue;}}
      }
      return last;
    });
    const liveValidation=validate(live.snapshot); delete live.snapshot;
    const before=await page.evaluate(()=>{const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},id=window.CX_TYA_CANONICAL_SHOPPER_PORTAL?.resolveExactSessionShopper?.(d)||null,p=d.__sessionShopperProfile||null;return {authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,boot:window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||null,context:{authenticated:c.authenticated===true,tenantId:c.tenantId||null,role:c.role||null,authNamespace:c.authNamespace||null,shopperId:c.shopperId||null,projectIds:Array.isArray(c.projectIds)?c.projectIds:[]},previewMeta:d.previewMeta||null,dataSource:window.CX?.dataSource||null,counts:{projects:Array.isArray(d.projects)?d.projects.length:0,visits:Array.isArray(d._visitas)?d._visitas.length:0,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:0},identity:id?{ok:id.ok===true,reason:id.reason||null,raw:id.raw||null,canonical:id.canonical||null,matchCount:Array.isArray(id.matches)?id.matches.length:0}:null,sessionProfile:{present:!!p,id:p?String(p.id||p.shopperId||''):null},legalModalVisible:[...document.querySelectorAll('.cx-modal')].some(x=>/Términos de uso y confidencialidad/i.test(String(x.innerText||''))&&getComputedStyle(x).display!=='none')};});
    const second=await page.evaluate(async()=>{const r=await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('i3_focal_second_reconcile');return {ok:r?.ok===true,skipped:r?.skipped===true,reason:r?.reason||null,error:r?.error||null,resultApplied:r?.result?.applied===true};});
    const after=await page.evaluate(()=>{const d=window.CX?.data||{},id=window.CX_TYA_CANONICAL_SHOPPER_PORTAL?.resolveExactSessionShopper?.(d)||null,p=d.__sessionShopperProfile||null;return {authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,counts:{projects:Array.isArray(d.projects)?d.projects.length:0,visits:Array.isArray(d._visitas)?d._visitas.length:0,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:0},identity:id?{ok:id.ok===true,reason:id.reason||null,raw:id.raw||null,canonical:id.canonical||null,matchCount:Array.isArray(id.matches)?id.matches.length:0}:null,sessionProfile:{present:!!p,id:p?String(p.id||p.shopperId||''):null}};});

    const profileUi=await page.evaluate(async()=>{
      const s=v=>String(v??'').trim(),d=window.CX?.data||{},p=d.__sessionShopperProfile||{};
      window.CX?.router?.nav?.('miperfil'); await new Promise(r=>setTimeout(r,150));
      const text=String(document.querySelector('#view')?.innerText||'');
      const username=s(p.username||p.user),phone=s(p.whatsapp||p.phone),email=s(p.email),cert=s(p.certificationStatus)||p.certified===true||p.certificationPresented===true;
      const visits=typeof d.visitsForShopper==='function'?d.visitsForShopper(s(p.id||p.shopperId),false):[];
      const stats=typeof d.shopperStats==='function'?d.shopperStats(s(p.id||p.shopperId)):null;
      return {
        source:{profileComplete:!!d.shopperProfileComplete?.(p),usernamePresent:!!username,phonePresent:!!phone,emailPresent:!!email,certificationPresent:!!cert,visitCount:Array.isArray(visits)?visits.length:0,statsTotal:Number(stats?.total||0)},
        ui:{profileComplete:text.includes('Perfil completo'),usernameMatches:!username||text.includes(username),phoneMatches:!phone||text.includes(phone),emailMatches:!email||text.includes(email),certificationVisible:!cert||/Certificada|Certificación presentada/.test(text),visitCountVisible:text.includes(`Histórico de visitas · ${Array.isArray(visits)?visits.length:0}`),pendingMarker:/Validando tu identidad|slice transitorio|Periodos HR:\s*pendiente/i.test(text),identityBlocked:/identidad de esta sesión no está vinculada/i.test(text)}
      };
    });

    const availableUi=await page.evaluate(async()=>{
      const d=window.CX?.data||{};
      const projects=(window.CX?.router&&typeof window.CX.router.resolveVisibleProjects==='function')?window.CX.router.resolveVisibleProjects('shopper'):(typeof d.projectsFor==='function'?d.projectsFor('shopper'):d.projects||[]);
      const allowed=new Set((projects||[]).map(pr=>d.programKey?d.programKey(pr):pr.id));
      const projByAny=id=>{let pr=(d.projects||[]).find(x=>x.id===id);if(!pr)pr=(d.projects||[]).find(x=>(d.programKey?d.programKey(x):x.id)===id);return pr;};
      const progKeyOf=v=>{const pr=projByAny(v.projectId);return pr?(d.programKey?d.programKey(pr):pr.id):v.projectId;};
      const pool=(d._visitas||[]).filter(v=>(!d.inScope||d.inScope(v.pais))&&allowed.has(progKeyOf(v)));
      const expected=(typeof d.availableVisits==='function')?d.availableVisits(pool):pool.filter(v=>v.estado==='disponible');
      const projectCount=new Set(expected.map(progKeyOf)).size;
      window.CX?.router?.nav?.('visitas'); await new Promise(r=>setTimeout(r,150));
      const view=document.querySelector('#view'),text=String(view?.innerText||''),cards=view?.querySelectorAll?.('[data-detail]')?.length||0;
      const m=text.match(/(\d+) oportunidades en (\d+) proyecto\(s\) para tu perfil/i);
      return {expectedCount:expected.length,expectedProjectCount:projectCount,renderedCount:m?Number(m[1]):-1,renderedProjectCount:m?Number(m[2]):-1,detailCards:cards,headerPresent:!!m,emptyShown:/Sin visitas disponibles/i.test(text),pendingMarker:/slice transitorio|Periodos HR:\s*pendiente/i.test(text)};
    });

    observed={live,liveValidation,before,second,after,profileUi,availableUi,pageErrors,legalReadback:{currentTenantLegalContentCount:legal.length,currentReceiptPresent:matching.length>0,currentReceiptCount:matching.length}};
  } finally { await ctx.close(); await browser.close(); }

  const a=observed.after.authority||{},b=observed.before,live=observed.liveValidation||{},id=observed.after.identity||{},profile=observed.after.sessionProfile||{},pf=observed.profileUi||{},av=observed.availableUi||{};
  const profileExact=pf.source&&pf.ui&&pf.ui.profileComplete===pf.source.profileComplete&&pf.ui.usernameMatches&&pf.ui.phoneMatches&&pf.ui.emailMatches&&pf.ui.certificationVisible&&pf.ui.visitCountVisible&&!pf.ui.pendingMarker&&!pf.ui.identityBlocked&&pf.source.visitCount===pf.source.statsTotal;
  const availableExact=av.headerPresent===true&&av.renderedCount===av.expectedCount&&av.renderedProjectCount===av.expectedProjectCount&&av.detailCards===av.expectedCount&&!av.pendingMarker&&((av.expectedCount===0&&av.emptyShown===true)||(av.expectedCount>0&&av.emptyShown===false));
  const checks={humanAuth:b.context?.authenticated===true&&b.context?.role==='shopper'&&b.context?.shopperId===SHOPPER_ID,hrHttp200:observed.live.httpStatus===200,validateSnapshot:live.ok===true,authorityApplied:a.applied===true,hrVisitsMatch:Number(a.hrVisits)===Number(live.visits),hrShoppersMatch:Number(a.hrShoppers)===Number(live.shoppers),protectedSliceStable:Number(a.protectedProfiles)===1,sessionProfilePreserved:a.sessionProfilePreserved===true&&profile.present===true&&profile.id===SHOPPER_ID,identityResolved:id.ok===true&&id.raw===SHOPPER_ID&&id.canonical===SHOPPER_ID,secondReconcileApplied:observed.second.ok===true&&observed.second.resultApplied===true,legalReceiptDurable:observed.legalReadback.currentReceiptPresent===true&&!b.legalModalVisible,noPageErrors:observed.pageErrors.length===0,notTransient:b.counts.projects>0&&b.counts.visits>0&&b.counts.shoppers>1,profileFullExact:profileExact,availableVisitsExact:availableExact};
  const pass=Object.values(checks).every(Boolean);
  const environmentOnly=!pass&&(observed.live.httpStatus===0||observed.live.httpStatus===429||observed.live.httpStatus>=500||observed.liveValidation?.ok!==true&&/^HR_LIVE_(HTTP|NON_JSON|UNAVAILABLE)/.test(str(observed.live.error)));
  const functionalOnly=!pass&&!environmentOnly&&(checks.profileFullExact===false||checks.availableVisitsExact===false);
  const out={decision:pass?'PASS_I3_PROFILE_FULL_AVAILABLE_VISITS':environmentOnly?'ENVIRONMENT_FAILURE':'HOLD_I3_PROFILE_FULL_AVAILABLE_VISITS',classification:pass?null:environmentOnly?'ENVIRONMENT_FAILURE':functionalOnly?'FUNCTIONAL_DEFECT':'RELEASE_COMPOSITION_FAILURE',checks,observed:{...observed,profileUi:pf,availableUi:av},writes:{hostingDevDeploys:0,providerWrites:0,firestoreWrites:0,authWrites:0,hrWrites:0,productionWrites:0},priorDevDeployRun:PRIOR_DEV_DEPLOY_RUN,production:false,generatedAt:new Date().toISOString()};
  write(out);
  console.log(out.decision,JSON.stringify(checks),JSON.stringify({live:observed.live,profileUi:pf,availableUi:av}));
  if(!pass)process.exitCode=2;
} catch(e) {
  const out={decision:'ENVIRONMENT_FAILURE',blocker:'I3_FOCAL_PROBE_EXCEPTION',error:String(e?.stack||e?.message||e),priorDevDeployRun:PRIOR_DEV_DEPLOY_RUN,production:false};
  write(out);
  console.error(e);
  process.exitCode=1;
}