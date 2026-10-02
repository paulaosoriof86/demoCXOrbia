import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PREI4_OUT||'');
const ROOT=String(process.env.CXORBIA_PREI4_ROOT||'').replace(/\/$/,'');
const SOURCE=String(process.env.CXORBIA_PREI4_SOURCE_SHA||'');
const EXPECTED_HR=String(process.env.CXORBIA_EXPECTED_HR_REVISION||'');
if(!OUT||!ROOT||!SOURCE||!EXPECTED_HR)throw new Error('ENVIRONMENT_FAILURE:VRM154_156_ENV_MISSING');
fs.mkdirSync(OUT,{recursive:true});
const write=v=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(v,null,2)+'\n');
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const tenantId='tya',projectId='cinepolis';
const [metaRes,jsonRes]=await Promise.all([
  fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&vrm154156browser='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)}),
  fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=json&vrm154156browser='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)})
]);
if(!metaRes.ok||!jsonRes.ok)throw new Error('PROVIDER_FAILURE:VRM154_156_HR_HTTP');
const meta=await metaRes.json(),body=await jsonRes.json(),snap=body.snapshot||body.data||body;
const revision=str(meta.revision||body.revision||body._runtime?.revision||snap.sourceRevision);
if(revision!==EXPECTED_HR||meta.ok!==true||meta.revisionStable!==true||meta.sourceSafe!==true||body.sourceSafe!==true)throw new Error('PROVIDER_FAILURE:VRM154_156_HR_REVISION:'+JSON.stringify({revision,expected:EXPECTED_HR,meta}));
const config=body.projectConfig||snap.projectConfig||{};
const dims=arr(config.scenarioDimensions);
for(const key of ['escenario','tipoCombo'])if(!dims.some(d=>str(d.key)===key))throw new Error('MAPPING_FAILURE:VRM154_SCENARIO_DIMENSION_MISSING_'+key);
const periodKey=str(snap.source?.currentCalendarPeriodKey||body.currentCalendarPeriodKey||'');
const periodMeta=arr(snap.periods).find(p=>str(p.key)===periodKey)||null;
const periodId=str(periodMeta?.id||('cinepolis-'+periodKey));
const currentVisits=arr(snap.visits).filter(v=>str(v.periodKey)===periodKey);
const facets=v=>v?.canonicalFacets||{};
const scenarioVisits=currentVisits.filter(v=>str(v.escenario)&&str(v.tipoCombo));
if(!periodKey||!currentVisits.length||!scenarioVisits.length)throw new Error('SOURCE_FAILURE:VRM154_CURRENT_SCENARIO_VISITS_MISSING');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const profiles=(await tenant.collection('shoppers').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const aliases=p=>new Set([p.id,p.shopperId,...arr(p.sourceShopperIds),...arr(p.exactAliases),...arr(p.legacyLiveShopperIds)].map(str).filter(Boolean));
const authExists=async id=>{try{await auth.getUser(id);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}};
let admin=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper'))if(await authExists(m.id)){admin=m;break;}
if(!admin)throw new Error('AUTH_FAILURE:VRM154_156_ADMIN_MISSING');

const activeScenarioVisits=scenarioVisits.filter(v=>facets(v).assigned===true&&facets(v).submitted!==true&&facets(v).cancelled!==true&&str(v.shopperId||v.evaluadorId||v.evaluatorId));
let target=null;
for(const visit of activeScenarioVisits){
  const sourceShopperId=str(visit.shopperId||visit.evaluadorId||visit.evaluatorId);
  const profile=profiles.find(p=>aliases(p).has(sourceShopperId));
  const canonicalId=str(profile?.id||sourceShopperId);
  const member=members.find(m=>m.active===true&&str(m.role).toLowerCase()==='shopper'&&str(m.authNamespace).toLowerCase()==='shopper'&&str(m.shopperId)===canonicalId);
  if(member&&await authExists(member.id)){target={visit,profile:profile||{id:canonicalId,nombre:sourceShopperId},member,sourceShopperId,canonicalId};break;}
}
if(!target)throw new Error('AUTH_FAILURE:VRM154_NO_AUTHENTICATED_ACTIVE_SCENARIO_SHOPPER');

const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime='+PROTECTED+'&cxHumanFullVisual='+FULL;
const evidence={schemaVersion:'cxorbia.i3.vrm154-156.live-reproof.v1',decision:'HOLD',sourceSha:SOURCE,hrRevision:revision,periodId,scenarioDimensions:dims.map(d=>({key:str(d.key),label:str(d.label),icon:str(d.icon)})),selectedShopper:{shopperId:target.canonicalId,name:str(target.profile.nombre||target.profile.name),visitId:str(target.visit.id||target.visit.visitId),hrRowId:str(target.visit.hrRowId),branch:str(target.visit.sucursal),escenario:str(target.visit.escenario),tipoCombo:str(target.visit.tipoCombo)},shopper:null,admin:null,writes:{auth:0,hr:0,provider:0},production:false};
const browser=await chromium.launch({headless:true});

async function signed(member,kind){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(str(e?.message||e)));
  await page.goto(URL+'&vrm154156='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  const token=await auth.createCustomToken(member.id);
  let signedIn=false;
  for(let i=0;i<5&&!signedIn;i++){
    try{
      await page.waitForFunction(()=>!!window.firebase?.auth,{timeout:30000});
      await page.evaluate(async t=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await window.firebase.auth().signInWithCustomToken(t);},token);
      signedIn=true;
    }catch(e){
      const msg=str(e?.message||e);
      if(!/Execution context was destroyed|navigation|network|timeout|FIREBASE/i.test(msg))throw e;
      await page.waitForTimeout(500);
    }
  }
  if(!signedIn)throw new Error('AUTH_FAILURE:VRM154_156_SIGNIN_'+kind);
  await page.waitForFunction(({kind,rev})=>{const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},r=String(c.role||'').toLowerCase();return c.authenticated===true&&(kind==='shopper'?r==='shopper':r!=='shopper'&&r!=='cliente')&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(d.previewMeta?.sourceRevision||'')===rev;},{kind,rev:revision},{timeout:120000});
  if(errors.length)throw new Error('FUNCTIONAL_DEFECT:VRM154_156_PAGEERROR_'+kind+':'+JSON.stringify(errors));
  return {ctx,page};
}
async function nav(page,route){
  await page.evaluate(r=>window.CX.router.nav(r,{history:false}),route);
  await page.waitForFunction(({route,rev})=>String(window.CX?.session?.view||'')===route&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev,{route,rev:revision},{timeout:30000});
  await page.waitForTimeout(350);
  const dirty=await page.evaluate(()=>{const t=String(document.body?.innerText||'');return {technical:/AUTH_READY|CLAIMS_READY|VISITID|HRROWID|FINANCIALSOURCESTATUS|CXORBIA DEV\s*·\s*LABORATORIO|máquina canónica HR/i.test(t),blocked:t.includes('Fuente de datos no disponible')};});
  if(dirty.technical||dirty.blocked)throw new Error('VISUAL_DEFECT:VRM154_156_DIRTY_ROUTE_'+route+':'+JSON.stringify(dirty));
}
try{
  const sp=await signed(target.member,'shopper'),page=sp.page;
  await nav(page,'midia');
  const midia=await page.evaluate(()=>({text:String(document.body?.innerText||'').slice(0,800),route:String(window.CX?.session?.view||'')}));
  await nav(page,'misvisitas');
  const scenarioCard=await page.evaluate(({id,hrRowId,branch,escenario,tipoCombo,dimCount})=>{
    const d=window.CX?.data||{};
    const visits=Array.isArray(d._visitas)?d._visitas:[];
    const v=visits.find(x=>String(x.id||x.visitId||'')===id||(hrRowId&&String(x.hrRowId||'')===hrRowId)||(String(x.sucursal||'')===branch&&String(x.escenario||'')===escenario&&String(x.tipoCombo||'')===tipoCombo));
    if(!v)return {found:false};
    const dims=typeof d.scenarioDimensionsForVisit==='function'?d.scenarioDimensionsForVisit(v,d.period?.()):[];
    const card=[...document.querySelectorAll('[data-visit-card]')].find(el=>String(el.getAttribute('data-visit-card')||'')===String(v.id||v.visitId||'')||String(el.innerText||'').includes(branch));
    const text=String(card?.innerText||'');
    const chips=card?[...card.querySelectorAll('.cx-scenario-chip')].map(el=>String(el.innerText||'')):[];
    const progress=card?[...card.querySelectorAll('.cx-visit-progress-step')].map(el=>({text:String(el.innerText||''),classes:String(el.className||'')})):[];
    const actions=card?[...card.querySelectorAll('.cx-visit-actions .btn')].map(el=>String(el.innerText||'')):[];
    const temp=document.createElement('span');temp.style.color='var(--brand)';document.body.appendChild(temp);const brand=getComputedStyle(temp).color;temp.remove();
    return {found:!!card,visitId:String(v.id||v.visitId||''),dims,chipCount:chips.length,chips,progressCount:progress.length,progress,actions,branchVisible:text.includes(branch),escenarioVisible:text.includes(escenario),tipoComboVisible:text.includes(tipoCombo),brandBorder:card?getComputedStyle(card).borderLeftColor:'',expectedBrand:brand,allConfiguredDimensionsVisible:!!card&&dims.length>=dimCount&&chips.length>=dimCount&&text.includes(escenario)&&text.includes(tipoCombo),visualMarkersPass:!!card&&card.classList.contains('cx-shopper-visit-card')&&progress.length>=5&&actions.length>=1&&getComputedStyle(card).borderLeftColor===brand};
  },{id:str(target.visit.id||target.visit.visitId),hrRowId:str(target.visit.hrRowId),branch:str(target.visit.sucursal),escenario:str(target.visit.escenario),tipoCombo:str(target.visit.tipoCombo),dimCount:dims.length});
  if(!scenarioCard.found||!scenarioCard.allConfiguredDimensionsVisible||!scenarioCard.visualMarkersPass)throw new Error('VISUAL_DEFECT:VRM154_155_MISVISITAS:'+JSON.stringify(scenarioCard));

  const visitDetail=await page.evaluate(({id,hrRowId,branch,escenario,tipoCombo,dimCount})=>{
    const d=window.CX?.data||{},visits=Array.isArray(d._visitas)?d._visitas:[];
    const v=visits.find(x=>String(x.id||x.visitId||'')===id||(hrRowId&&String(x.hrRowId||'')===hrRowId)||(String(x.sucursal||'')===branch&&String(x.escenario||'')===escenario&&String(x.tipoCombo||'')===tipoCombo));
    if(!v||typeof window.CX?.shopperVisitDetail!=='function')return {opened:false};
    window.CX.shopperVisitDetail(d,d.period?.(),v,window.CX.ui);
    const grid=document.querySelector('.cx-scenario-grid-detail');
    const text=String(grid?.innerText||''),chips=grid?[...grid.querySelectorAll('.cx-scenario-chip')].map(el=>String(el.innerText||'')):[];
    return {opened:!!grid,chipCount:chips.length,chips,escenarioVisible:text.includes(escenario),tipoComboVisible:text.includes(tipoCombo),allConfiguredDimensionsVisible:!!grid&&chips.length>=dimCount&&text.includes(escenario)&&text.includes(tipoCombo)};
  },{id:str(target.visit.id||target.visit.visitId),hrRowId:str(target.visit.hrRowId),branch:str(target.visit.sucursal),escenario:str(target.visit.escenario),tipoCombo:str(target.visit.tipoCombo),dimCount:dims.length});
  if(!visitDetail.opened||!visitDetail.allConfiguredDimensionsVisible)throw new Error('FUNCTIONAL_DEFECT:VRM154_VISIT_DETAIL:'+JSON.stringify(visitDetail));
  await page.keyboard.press('Escape').catch(()=>{});

  await nav(page,'miperfil');
  const profile=await page.evaluate(expectedName=>{
    const body=String(document.body?.innerText||''),hero=document.querySelector('.cx-profile-hero'),section=document.querySelector('.cx-profile-section-title');
    const temp=document.createElement('span');temp.style.color='var(--brand)';document.body.appendChild(temp);const brand=getComputedStyle(temp).color;temp.remove();
    const heroStyle=hero?getComputedStyle(hero):null;
    return {nameVisible:expectedName?normText(body).includes(normText(expectedName)):true,hasHero:!!hero,hasSection:!!section,hasKpis:/Desempeño/i.test(body)&&/Visitas/i.test(body)&&/Realizadas/i.test(body)&&/Submitidas/i.test(body)&&/Pagadas confirmadas/i.test(body),hasHistory:/Histórico de visitas/i.test(body),heroBackground:heroStyle?.backgroundImage||'',visualMarkersPass:!!hero&&!!section&&/linear-gradient/i.test(heroStyle?.backgroundImage||'')&&/Desempeño/i.test(body)&&/Histórico de visitas/i.test(body),brand};function normText(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
  },str(target.profile.nombre||target.profile.name));
  if(!profile.visualMarkersPass||!profile.nameVisible||!profile.hasKpis||!profile.hasHistory)throw new Error('VISUAL_DEFECT:VRM155_PROFILE:'+JSON.stringify(profile));

  await nav(page,'beneficios');
  const benefits=await page.evaluate(()=>({route:String(window.CX?.session?.view||''),text:String(document.body?.innerText||'').slice(0,1200)}));

  await nav(page,'aprendizaje');
  const academy=await page.evaluate(()=>{
    const body=String(document.body?.innerText||''),cards=[...document.querySelectorAll('.cx-academy-course-card')],heads=[...document.querySelectorAll('.cx-academy-course-head')];
    const gradients=heads.map(x=>getComputedStyle(x).backgroundImage);
    return {title:/Academia CXOrbia/i.test(body),courseCards:cards.length,courseHeads:heads.length,gradients,hasIcons:/🎓|📚|🚀|📊|🕵️|🏆/.test(body),visualMarkersPass:/Academia CXOrbia/i.test(body)&&cards.length>0&&heads.length===cards.length&&gradients.every(x=>/linear-gradient/i.test(x))};
  });
  if(!academy.visualMarkersPass||!academy.hasIcons)throw new Error('VISUAL_DEFECT:VRM156_ACADEMY:'+JSON.stringify(academy));

  const own=await page.evaluate(sid=>{const d=window.CX?.data||{},v=typeof d.visitsForShopper==='function'?d.visitsForShopper(sid,false):[];return {count:v.length,unique:new Set(v.map(x=>String(x.id||x.visitId||''))).size};},target.canonicalId);
  evidence.shopper={midia,scenarioCard,visitDetail,profile,benefits:{route:benefits.route,rendered:benefits.text.length>0},academy,ownVisits:own};
  await sp.ctx.close();

  const ap=await signed(admin,'admin'),a=ap.page;
  for(const route of ['dashboard','shoppers','visitas','postulaciones'])await nav(a,route);
  await nav(a,'shoppers');
  const adminProof=await a.evaluate(({shopperId,name})=>{
    const d=window.CX?.data||{},rows=typeof d.shoppersFor==='function'?d.shoppersFor():arrLocal(d.shoppers);
    const row=rows.find(x=>String(x.id||x.shopperId||'')===shopperId);
    const body=String(document.body?.innerText||'');
    const visits=typeof d.visitsForShopper==='function'?d.visitsForShopper(shopperId,false):[];
    return {shopperFound:!!row,humanName:String(row?.nombre||row?.name||''),nameVisible:name?normLocal(body).includes(normLocal(name)):!!row,visitCount:visits.length,uniqueVisitCount:new Set(visits.map(x=>String(x.id||x.visitId||''))).size,noDuplicateSelectedShopperVisits:visits.length===new Set(visits.map(x=>String(x.id||x.visitId||''))).size,stats:typeof d.shopperStats==='function'?d.shopperStats(shopperId):null};function arrLocal(v){return Array.isArray(v)?v:[];}function normLocal(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
  },{shopperId:target.canonicalId,name:str(target.profile.nombre||target.profile.name)});
  if(!adminProof.shopperFound||!adminProof.nameVisible||!adminProof.noDuplicateSelectedShopperVisits||!adminProof.stats)throw new Error('MAPPING_FAILURE:VRM154_156_ADMIN_SHOPPER:'+JSON.stringify(adminProof));
  await nav(a,'postulaciones');
  const postProof=await a.evaluate(()=>{const body=String(document.body?.innerText||'');return {rawTechnicalIdentity:/shopper_(?:gt|hn|sv|ni)_[0-9a-f]+/i.test(body),rendered:body.length>0};});
  if(postProof.rawTechnicalIdentity)throw new Error('VISUAL_DEFECT:VRM154_156_ADMIN_RAW_ID');
  evidence.admin={...adminProof,postulations:postProof};
  await ap.ctx.close();

  const finRoot=OUT+'/finance',dryOut=finRoot+'/dry',readOut=finRoot+'/readback';
  fs.mkdirSync(dryOut,{recursive:true});fs.mkdirSync(readOut,{recursive:true});
  const hrUrl=ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=json&vrm154156finance='+Date.now();
  const runNode=(script,extra,log)=>{
    const r=spawnSync(process.execPath,[script],{env:{...process.env,PROJECT:process.env.PROJECT||'cxorbia-backend-dev',TENANT_ID:tenantId,PROJECT_ID:projectId,HR_URL:hrUrl,...extra},encoding:'utf8'});
    fs.writeFileSync(log,(r.stdout||'')+(r.stderr||''));
    if(r.status!==0)throw new Error('PERSISTENCE_FAILURE:VRM154_156_FINANCE_SCRIPT:'+script+':'+str(r.stderr||r.stdout));
  };
  runNode('tools/qa/cxorbia-vrm151-final-canonical-dry-run.mjs',{OUT:dryOut},finRoot+'/dry.log');
  const dry=JSON.parse(fs.readFileSync(dryOut+'/result.json','utf8'));
  if(dry.decision!=='PASS_VRM151_FINAL_CANONICAL_HISTORICAL_DRY_RUN'||dry.observed?.canonicalSubmitted!==628||dry.observed?.paid!==562||dry.observed?.pending!==66||dry.observed?.amountReviewRequired!==5||dry.observed?.octoberTouched!==0||dry.writes!==0)throw new Error('PERSISTENCE_FAILURE:VRM154_156_FINANCE_DRY:'+JSON.stringify(dry.observed));
  runNode('tools/qa/cxorbia-vrm153-reconciliation-readback-diagnostic.mjs',{OUT:readOut,DRY_RESULT:dryOut+'/result.json'},finRoot+'/readback.log');
  const rb=JSON.parse(fs.readFileSync(readOut+'/result.json','utf8'));
  if(rb.decision!=='PASS_VRM153_RECONCILIATION_READBACK_MATCH'||rb.counts?.records!==628||rb.counts?.uniqueVisits!==628||rb.counts?.paid!==562||rb.counts?.pending!==66||rb.counts?.amountReviewRequired!==5||rb.octoberRecords!==0||rb.writes!==0)throw new Error('PERSISTENCE_FAILURE:VRM154_156_FINANCE_READBACK:'+JSON.stringify(rb));
  evidence.finance={canonicalSubmitted:dry.observed.canonicalSubmitted,paid:rb.counts.paid,pending:rb.counts.pending,amountReviewRequired:rb.counts.amountReviewRequired,octoberRecords:rb.octoberRecords,writes:0};

  evidence.decision='PASS_VRM154_156_SEALED_DEV_LIVE_REPROOF';
  write(evidence);
  console.log(JSON.stringify({decision:evidence.decision,hrRevision:evidence.hrRevision,shopper:evidence.selectedShopper,scenarioCard:evidence.shopper.scenarioCard,visitDetail:evidence.shopper.visitDetail,profile:evidence.shopper.profile,academy:evidence.shopper.academy,admin:evidence.admin,finance:evidence.finance},null,2));
}catch(error){
  evidence.decision='FAIL_VRM154_156_SEALED_DEV_LIVE_REPROOF';
  evidence.error=str(error?.stack||error);
  write(evidence);
  throw error;
}finally{await browser.close();}
