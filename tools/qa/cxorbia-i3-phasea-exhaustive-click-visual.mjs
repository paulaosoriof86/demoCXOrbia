import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PHASEA_CLICK_OUT||''),ROOT=String(process.env.HOSTING_URL||'').replace(/\/$/,''),EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'');
const FULL_SCOPE=JSON.parse(fs.readFileSync('CXORBIA_I3_FULL_MODULE_EXHAUSTIVE_SCOPE_2026-10-07.json','utf8'));
if(!OUT||!ROOT||!EXPECTED_HR)throw new Error('ENVIRONMENT_FAILURE:CLICK_E2E_ENV');
fs.mkdirSync(OUT,{recursive:true});
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim(),slug=v=>norm(v).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const tenantId='tya',projectId='cinepolis',PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+projectId+'&cxProtectedRuntime='+PROTECTED+'&phaseaclick='+Date.now();
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const [metaRes,bodyRes]=await Promise.all([
 fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&click='+Date.now(),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(120000)}),
 fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=json&click='+Date.now(),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(120000)})
]);
if(!metaRes.ok||!bodyRes.ok)throw new Error('PROVIDER_FAILURE:CLICK_HR_HTTP');
const meta=await metaRes.json(),body=await bodyRes.json(),snap=body.snapshot||body.data||body,revision=str(meta.revision||body.revision||snap.sourceRevision);
if(revision!==EXPECTED_HR||meta.ok!==true||meta.revisionStable!==true)throw new Error('PROVIDER_FAILURE:CLICK_HR_REVISION');
const periodKey=str(snap.source?.currentCalendarPeriodKey||body.currentCalendarPeriodKey||''),pm=arr(snap.periods).find(p=>str(p.key)===periodKey),periodId=str(pm?.id||('cinepolis-'+periodKey));
const [ms,ps,cs]=await Promise.all([tenant.collection('users').get(),tenant.collection('shoppers').get(),tenant.collection('shopperIdentityCrosswalk').get()]);
const members=ms.docs.map(d=>({id:d.id,...(d.data()||{})})),profiles=ps.docs.map(d=>({id:d.id,...(d.data()||{})})),cross=cs.docs.map(d=>({id:d.id,...(d.data()||{})}));
const alias=new Map();for(const p of profiles)for(const a of new Set([p.id,p.shopperId,...arr(p.sourceShopperIds),...arr(p.exactAliases),...arr(p.legacyLiveShopperIds)].map(str).filter(Boolean)))if(!alias.has(a))alias.set(a,p.id);for(const c of cross){const x=str(c.shopperId||c.canonicalShopperId);if(x)alias.set(str(c.id),x);}
const resolve=x=>{let cur=str(x);for(let i=0;i<8;i++){const n=str(alias.get(cur)||cur);if(n===cur)return cur;cur=n;}return cur;},profileById=new Map(profiles.map(p=>[p.id,p])),pname=p=>str(p?.nombre||p?.displayName||[p?.firstName,p?.lastName].filter(Boolean).join(' '));
const exists=async id=>{try{await auth.getUser(id);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}};
async function target(name){const list=[];for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper')){const p=profileById.get(resolve(m.shopperId));if(p&&norm(pname(p))===norm(name)&&await exists(m.id))list.push({member:m,profile:p});}if(name==='Paula Osorio'){const x=list.find(v=>str(v.member.visibleLogin||v.member.username).toLowerCase()==='paula.osorio'&&str(v.profile.id)==='shopper_gt_1440137b73');if(x)return x;}if(list.length!==1)throw new Error('MAPPING_FAILURE:CLICK_TARGET_'+slug(name)+':'+list.length);return list[0];}
let admin=null;for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper'))if(await exists(m.id)){admin=m;break;}if(!admin)throw new Error('AUTH_FAILURE:CLICK_ADMIN');
const targets=[];for(const n of ['Julissa Flores','Priscila López','Paula Osorio'])targets.push(await target(n));
let client=null;for(const m of members.filter(x=>x.active!==false&&['cliente','client'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()==='staff'))if(await exists(m.id)){client=m;break;}
const browser=await chromium.launch({headless:true});
const result={schemaVersion:'cxorbia.i3.phasea.exhaustive-click-visual.v3',decision:'HOLD',hrRevision:revision,periodId,shopper:{},admin:{},client:{},routeInventory:{},globalControls:{},shopperActionCoverage:{},actionFindings:[],screenshots:[],clickCount:0,writes:{auth:0,hr:0,provider:0},production:false};
const finding=(classification,code,detail={})=>result.actionFindings.push({classification,code,...detail});
const shot=async(page,name)=>{const file=name+'.png';try{await page.screenshot({path:OUT+'/'+file,fullPage:true,timeout:15000,animations:'disabled'});}catch(first){try{await page.screenshot({path:OUT+'/'+file,fullPage:false,timeout:15000,animations:'disabled'});}catch(second){throw new Error('ENVIRONMENT_FAILURE:CLICK_SCREENSHOT:'+name+':'+str(second?.message||first?.message||second||first));}}result.screenshots.push(file);};
const overlay=async page=>page.locator('.cx-ov:visible').last().innerText().catch(()=>'');
const visual=async(page,label)=>{const v=await page.evaluate(()=>{const t=String(document.body?.innerText||'');return{technical:/AUTH_READY|CLAIMS_READY|HRROWID|FINANCIALSOURCESTATUS|sourceSafe\s*[:=]|providerAck\s*[:=]|máquina canónica HR/i.test(t),blocked:t.includes('Fuente de datos no disponible'),body:t.slice(0,5000)};});if(v.technical||v.blocked)throw new Error('VISUAL_DEFECT:'+label+':'+JSON.stringify({technical:v.technical,blocked:v.blocked}));return v;};
async function signed(member,role){
 const ctx=await browser.newContext({viewport:{width:1440,height:980}});
 const page=await ctx.newPage(),errs=[];
 page.on('pageerror',e=>errs.push(str(e?.message||e)));
 let settled=false,lastError='';
 for(let attempt=1;attempt<=5&&!settled;attempt++){
  await page.goto(URL+'&signinattempt='+attempt+'&ts='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  const token=await auth.createCustomToken(member.id);
  try{
   await page.evaluate(async t=>{const fb=window.firebase;await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token);
  }catch(e){lastError=str(e?.message||e);}
  await page.waitForLoadState('domcontentloaded',{timeout:90000}).catch(()=>{});
  const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=>'');
  if(uid===String(member.id))settled=true;
  else if(attempt<5)await page.waitForTimeout(800*attempt);
 }
 if(!settled)throw new Error('AUTH_FAILURE:CLICK_BROWSER_SESSION:'+member.id+':'+lastError);
 await page.goto('about:blank');
 const authorityStartedAt=Date.now();
 await page.goto(URL+'&settled='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
 await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
 await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
 await page.waitForFunction(({role,rev,periodId})=>{const c=window.CX?.backendAuth?.context?.()||{},r=String(c.role||'').toLowerCase(),g=window.CX_C6_HR_AUTHORITY_GATE||{};const roleOk=role==='shopper'?r==='shopper':role==='client'?['cliente','client'].includes(r):(r!=='shopper'&&!['cliente','client'].includes(r));return c.authenticated===true&&roleOk&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev&&String(window.CX?.data?.currentPeriodId||'')===periodId;},{role,rev:revision,periodId},{timeout:120000});
 const authorityReadyMs=Date.now()-authorityStartedAt;
 if(authorityReadyMs>60000)throw new Error('ENVIRONMENT_FAILURE:CLICK_AUTHORITY_SYNC_EXCEEDED_60S_'+authorityReadyMs);
 if(errs.length)throw new Error('FUNCTIONAL_DEFECT:CLICK_PAGEERROR:'+role+':'+JSON.stringify(errs));
 return{ctx,page,authorityReadyMs};
}
async function dismissOverlays(page){
 for(let i=0;i<4;i++){
  const ov=page.locator('.cx-ov:visible').last();
  if(!await ov.count())break;
  const explicit=ov.locator('[data-x],[data-x4],[data-close],button[aria-label="Cerrar"],.cx-close').last();
  if(await explicit.count())await explicit.click({timeout:2500}).catch(()=>{});
  else await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(120);
  if(await ov.count()&&await ov.isVisible().catch(()=>false))await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(120);
 }
}
async function nav(page,route){await dismissOverlays(page);await page.evaluate(r=>CX.router.nav(r,{history:false}),route);await page.waitForFunction(r=>String(CX?.session?.view||'')===r,route,{timeout:45000});await page.waitForTimeout(450);await visual(page,route);}
async function click(page,sel){const l=page.locator(sel).first();if(!await l.count())return false;await l.click({timeout:10000});result.clickCount++;return true;}

async function inventoryRoute(page,role,routeId,tag){
  await nav(page,routeId);
  const data=await page.evaluate(({role,routeId})=>{
    const root=document.querySelector('#view')||document.querySelector('main.content')||document.body;
    const nodes=[...root.querySelectorAll('button,select,input,textarea,a[href],[role="button"],[tabindex="0"]')].filter(el=>{
      const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';
    });
    const controls=nodes.map((el,i)=>({
      i,tag:el.tagName.toLowerCase(),id:String(el.id||''),type:String(el.getAttribute('type')||''),
      text:String((el.innerText||el.getAttribute('aria-label')||el.getAttribute('title')||el.value||'')).trim().replace(/\s+/g,' ').slice(0,180),
      disabled:!!el.disabled||el.getAttribute('aria-disabled')==='true',
      href:el.tagName==='A'?String(el.getAttribute('href')||'').replace(/^https?:\/\/[^/]+/,''):null,
      dataset:Object.fromEntries(Object.entries(el.dataset||{}).filter(([k])=>/action|jump|kpi|rk|id|tab|go|doc|cert|sched|reprog|cancel|done|quest|geo|pay|detail|edit|del|save|create|add|new|export|filter|search|select|request|assign/i.test(k)))
    }));
    return {role,routeId,title:String(root.querySelector('h1,h2,.page-title,.ph-title,.card-t')?.textContent||'').trim(),controlCount:controls.length,controls};
  },{role,routeId});
  result.routeInventory[role]??={};result.routeInventory[role][routeId]=data;
  await shot(page,'full-'+tag+'-'+role+'-'+routeId);
  return data;
}
async function globalControlInventory(page,role){
  const g=await page.evaluate(role=>{
    const one=id=>{const el=document.getElementById(id);if(!el)return null;const r=el.getBoundingClientRect();return{present:true,visible:r.width>0&&r.height>0,disabled:!!el.disabled||el.getAttribute('aria-disabled')==='true',text:String(el.innerText||el.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,120)}};
    return{role,projectSelector:one('projSel'),periodSelector:one('periodSel'),notifications:one('tbBell'),mail:one('tbMail'),support:one('tbSupport'),logout:one('logoutBtn'),roleIdentity:one('tbRoleIdentity'),sidebarSections:document.querySelectorAll('.nav-sec-wrap').length};
  },role);result.globalControls[role]=g;return g;
}

async function waitReadyAfterReload(page,member,role){
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({role,rev,periodId})=>{const c=window.CX?.backendAuth?.context?.()||{},r=String(c.role||'').toLowerCase(),g=window.CX_C6_HR_AUTHORITY_GATE||{};return c.authenticated===true&&(role==='shopper'?r==='shopper':true)&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev&&String(window.CX?.data?.currentPeriodId||'')===periodId;},{role,rev:revision,periodId},{timeout:120000});
}
async function deepShopperActions(page,target,key){
  const cov={};
  await nav(page,'miperfil');
  cov.profileEditModal=await click(page,'[data-profile-edit]');
  if(cov.profileEditModal){
    await page.waitForTimeout(180);
    cov.profileFields=await page.locator('.cx-ov:visible #sp_save').count()>0&&await page.locator('.cx-ov:visible #sp_wa').count()>0&&await page.locator('.cx-ov:visible #sp_banco').count()>0;
    if(!cov.profileFields)finding('FUNCTIONAL_DEFECT','SHOPPER_PROFILE_EDIT_FIELDS_MISSING',{shopper:key});
    await dismissOverlays(page);
  }

  await nav(page,'visitas');
  cov.availableFilters=0;
  for(const sel of ['#vdQ','#vdEsc','#vdCan']){const loc=page.locator(sel);if(await loc.count()){const opts=await loc.locator('option').count();if(opts>1){await loc.selectOption({index:1});await page.waitForTimeout(100);await loc.selectOption({index:0});cov.availableFilters++;}}}
  cov.availableDetail=await click(page,'[data-vd]');
  if(cov.availableDetail){await page.waitForTimeout(180);if(!/detalle|sucursal|visita/i.test(await overlay(page)))finding('FUNCTIONAL_DEFECT','SHOPPER_AVAILABLE_VISIT_DETAIL_FAIL',{shopper:key});await dismissOverlays(page);}

  await nav(page,'reservas');
  const resState=await page.evaluate(()=>({eligible:Array.isArray(window.CX?.reservas?.sucursales?.())?window.CX.reservas.sucursales().length:0,button:!!document.querySelector('#rNew'),buttonDisabled:document.querySelector('#rNew')?.disabled===true||document.querySelector('#rNew')?.getAttribute('aria-disabled')==='true',emptyText:/sin (?:sucursales|visitas).*disponible|no hay.*disponible/i.test(String((document.querySelector('#view')||document.body).innerText||''))}));
  cov.reservations=resState;
  if(resState.eligible===0&&resState.button&&!resState.buttonDisabled)finding('FUNCTIONAL_DEFECT','RESERVATION_EMPTY_ELIGIBILITY_ACTION_EXPOSED',{shopper:key,resState});

  await nav(page,'misvisitas');
  cov.instructive=await click(page,'[data-doc]');
  if(cov.instructive){await page.waitForTimeout(200);cov.instructiveAckButton=await page.locator('.cx-ov:visible #docReadAck').count()>0;await dismissOverlays(page);}
  cov.scheduleButton=await page.locator('[data-sched]').count()>0;
  cov.rescheduleButton=await page.locator('[data-reprog]').count()>0;
  cov.cancelButton=await page.locator('[data-cancel]').count()>0;
  cov.completeButton=await page.locator('[data-done]').count()>0;
  cov.questionnaireButton=await page.locator('[data-quest]').count()>0;
  cov.geoButton=await page.locator('[data-geo]').count()>0;

  await nav(page,'aprendizaje');
  cov.academyFilters=0;
  for(const sel of ['#acadFilter','#acadCat']){const loc=page.locator(sel);if(await loc.count()){const opts=await loc.locator('option').count();if(opts>1){await loc.selectOption({index:1});await page.waitForTimeout(100);await loc.selectOption({index:0});cov.academyFilters++;}}}

  await nav(page,'cert');
  cov.certRendered=await page.locator('#view').count()>0;
  cov.certControls=await page.locator('#view button,#view select,#view input').count();

  await nav(page,'documentos');
  cov.resourceOpen=await click(page,'[data-opend],.docOpen,[data-open]');
  if(cov.resourceOpen){await page.waitForTimeout(160);await dismissOverlays(page);}

  await nav(page,'beneficios');
  cov.benefitFilterExercises=0;
  for(const sel of ['#benStatus','#benCountry','#benCurrency']){const loc=page.locator(sel);if(await loc.count()){const opts=await loc.locator('option').count();if(opts>1){await loc.selectOption({index:1});await page.waitForTimeout(100);await loc.selectOption({index:0});cov.benefitFilterExercises++;}}}
  const originalBenefitPeriod=await page.locator('#periodSel').inputValue().catch(()=>'');
  let benefitRows=await page.locator('#benCurrentTable tbody tr[data-ben-status]').count();
  let exercisedPeriod=originalBenefitPeriod;
  if(benefitRows===0&&await page.locator('#periodSel').count()){
    const options=await page.locator('#periodSel option').evaluateAll(opts=>opts.map(o=>({value:String(o.value||''),label:String(o.textContent||'')})));
    for(const opt of options.slice().reverse()){
      if(!opt.value||opt.value===originalBenefitPeriod)continue;
      await page.locator('#periodSel').selectOption(opt.value);await page.waitForTimeout(650);
      benefitRows=await page.locator('#benCurrentTable tbody tr[data-ben-status]').count();
      if(benefitRows>0){exercisedPeriod=opt.value;break;}
    }
  }
  let receipt=page.getByRole('button',{name:/Descargar comprobante/i});
  if(await receipt.count()){
    const disabled=await receipt.isDisabled().catch(()=>false);
    if(benefitRows>0){
      let downloaded=false,fileName='';
      try{
        const [dl]=await Promise.all([page.waitForEvent('download',{timeout:6000}),receipt.click({timeout:6000})]);
        result.clickCount++;downloaded=true;fileName=dl.suggestedFilename();
      }catch(_){}
      cov.benefitReceipt={present:true,periodId:exercisedPeriod,rowCount:benefitRows,downloaded,fileName,disabled};
      if(!downloaded)finding('FUNCTIONAL_DEFECT','BENEFITS_RECEIPT_DOWNLOAD_INERT',{shopper:key,periodId:exercisedPeriod,rowCount:benefitRows});
    }else{
      let honestEmpty=disabled;
      if(!disabled){
        await receipt.click({timeout:5000});result.clickCount++;
        honestEmpty=await page.locator('#cx-toasts .toast').filter({hasText:/No hay beneficios del periodo para descargar/i}).count()>0;
      }
      cov.benefitReceipt={present:true,periodId:exercisedPeriod,rowCount:0,downloaded:false,disabled,honestEmpty};
      if(!honestEmpty)finding('FUNCTIONAL_DEFECT','BENEFITS_RECEIPT_EMPTY_STATE_NOT_FAIL_CLOSED',{shopper:key,periodId:exercisedPeriod});
    }
  }else cov.benefitReceipt={present:false,periodId:exercisedPeriod,rowCount:benefitRows};
  if(originalBenefitPeriod&&exercisedPeriod!==originalBenefitPeriod&&await page.locator('#periodSel').count()){
    await page.locator('#periodSel').selectOption(originalBenefitPeriod);await page.waitForTimeout(500);
  }

  await nav(page,'soporte');
  const supportSubject='QA I3 SUPPORT '+String(process.env.GITHUB_RUN_ID||Date.now());
  const newTab=page.locator('[data-tab="nueva"]');
  if(await newTab.count()){
    await newTab.click();result.clickCount++;
    await page.locator('#spAsunto').fill(supportSubject);
    await page.locator('#spDet').fill('Prueba acotada de persistencia I3 · eliminar al finalizar').catch(()=>{});
    await page.locator('#spSend').click();result.clickCount++;
    cov.supportCreated=await page.waitForFunction(s=>window.CX?.supportStore?.list?.().some(x=>String(x?.asunto||'')===s),supportSubject,{timeout:20000}).then(()=>true).catch(()=>false);
    if(!cov.supportCreated){
      const toast=await page.locator('#cx-toasts .toast').last().innerText().catch(()=>'');
      finding('PERSISTENCE_FAILURE','SUPPORT_TICKET_PROVIDER_ACK_NOT_OBSERVED',{shopper:key,toast});
    }else{
      await waitReadyAfterReload(page,target.member,'shopper');
      await nav(page,'soporte');
      cov.supportPersistsReload=await page.waitForFunction(s=>window.CX?.supportStore?.list?.().some(x=>String(x?.asunto||'')===s),supportSubject,{timeout:20000}).then(()=>true).catch(()=>false);
      if(!cov.supportPersistsReload)finding('PERSISTENCE_FAILURE','SUPPORT_TICKET_NOT_DURABLE_AFTER_RELOAD',{shopper:key});
    }
    const qs=await tenant.collection('bulletins').where('title','==','Nueva solicitud de soporte').get().catch(()=>null);
    if(qs){const batch=db.batch();let n=0;for(const doc of qs.docs){const row=doc.data()||{};if(String(row.body||'').includes(supportSubject)){batch.delete(doc.ref);n++;}}if(n)await batch.commit();}
  }else cov.supportCreated='NOT_APPLICABLE_WITH_REASON:no new request control';

  await nav(page,'novedades');
  const unread=page.locator('.novRead').first();
  if(await unread.count()){
    const bulletinId=await unread.getAttribute('data-id');
    await unread.click();result.clickCount++;
    cov.newsMarkedRead=await page.waitForFunction(id=>window.CX?.novedades?.isRead?.(id)===true,bulletinId,{timeout:15000}).then(()=>true).catch(()=>false);
    if(!cov.newsMarkedRead)finding('PERSISTENCE_FAILURE','NOVEDADES_READ_ACK_NOT_OBSERVED',{shopper:key,bulletinId});
    const second=await signed(target.member,'shopper');
    await nav(second.page,'novedades');
    cov.newsDurableNewContext=await second.page.waitForFunction(id=>window.CX?.novedades?.isRead?.(id)===true,bulletinId,{timeout:15000}).then(()=>true).catch(()=>false);
    await second.ctx.close();
    if(cov.newsMarkedRead&&!cov.newsDurableNewContext)finding('PERSISTENCE_FAILURE','NOVEDADES_READ_STATE_BROWSER_LOCAL_ONLY',{shopper:key,bulletinId});
    const readId=String(target.member.id)+'_'+String(bulletinId||'');
    await tenant.collection('bulletinReads').doc(readId).delete().catch(()=>{});
  }else cov.newsMarkedRead='NOT_APPLICABLE_WITH_REASON:no unread item';

  await nav(page,'mireportes');
  cov.reportsRendered=await page.locator('#view').count()>0;
  result.shopperActionCoverage[key]=cov;
}


try{
 for(const t of targets){
  const {ctx,page}=await signed(t.member,'shopper'),key=slug(pname(t.profile)),e={};
  await nav(page,'midia');await shot(page,'shopper-'+key+'-midia');
  e.instructive=await click(page,'[data-visit-action="instructive"]');if(e.instructive){await page.waitForTimeout(900);const ov=await overlay(page),view=await page.evaluate(()=>String(CX?.session?.view||''));if(!/instruct|recurso/i.test(ov)&&!['misvisitas','documentos'].includes(view))throw new Error('FUNCTIONAL_DEFECT:CLICK_INSTRUCTIVE_'+key);await shot(page,'shopper-'+key+'-instructive');}
  await nav(page,'miperfil');e.profileJump=await click(page,'[data-profile-jump="history"]');e.profileRow=await click(page,'[data-profile-visit-row]');if(e.profileRow){await page.waitForTimeout(250);if(!/visita|periodo|estado/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:PROFILE_HISTORY_MODAL_'+key);}await shot(page,'shopper-'+key+'-profile');
  await nav(page,'beneficios');const dates=await page.locator('#benHistoryCard tbody tr[data-ben-row] td:nth-child(2)').allInnerTexts().catch(()=>[]);if(dates.length>1){const clean=dates.map(str).filter(Boolean),sorted=clean.slice().sort();if(JSON.stringify(clean)!==JSON.stringify(sorted))throw new Error('FUNCTIONAL_DEFECT:BENEFITS_ORDER_'+key+':'+JSON.stringify(clean));}e.benefitRow=await click(page,'#benHistoryCard [data-ben-row]');if(e.benefitRow){await page.waitForTimeout(250);if(!/honorario|reembolso|detalle/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:BENEFIT_DETAIL_'+key);}await shot(page,'shopper-'+key+'-benefits');
  await nav(page,'misvisitas');const rep=page.locator('[data-reprog]').first();if(await rep.count()&&await rep.isDisabled()){const note=String(await page.locator('.cx-visit-request-note').first().innerText().catch(()=>''));if(!/pendiente de (autorización|revisión)/i.test(note))throw new Error('FUNCTIONAL_DEFECT:DISABLED_REPROGRAM_WITHOUT_PENDING_STATUS_'+key);e.reprogram='DURABLE_REQUEST_PENDING_NO_DUPLICATE';}else{e.reprogram=await click(page,'[data-reprog]');if(e.reprogram){await page.waitForTimeout(250);if(!/Solicitar reprogramación/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:REPROGRAM_MODAL_'+key);}}await shot(page,'shopper-'+key+'-visits');
  await nav(page,'cert');e.certSelector=await click(page,'select');await shot(page,'shopper-'+key+'-cert');
  await nav(page,'novedades');const nt=await page.locator('body').innerText();if(/providerAck|sourceSafe|hrRowId|financialSourceStatus/i.test(nt))throw new Error('VISUAL_DEFECT:NEWS_TECHNICAL_COPY_'+key);await shot(page,'shopper-'+key+'-news');
  await globalControlInventory(page,'shopper');for(const rid of FULL_SCOPE.roles.shopper)await inventoryRoute(page,'shopper',rid,key);if(key==='julissa-flores')await deepShopperActions(page,t,key);result.shopper[pname(t.profile)]=e;await ctx.close();
 }
 const {ctx,page}=await signed(admin,'admin'),a={};
 await nav(page,'dashboard');a.dashboardSelect=await click(page,'.bdSel');if(a.dashboardSelect&&!/[1-9]/.test(await page.locator('#bdSelectedCount').innerText()))throw new Error('FUNCTIONAL_DEFECT:DASHBOARD_SELECTION_COUNT');a.dashboardContext=await click(page,'.bdCtx');if(!a.dashboardContext)a.dashboardContext=await click(page,'#bdBulkRequest');if(a.dashboardContext){await page.waitForTimeout(700);const view=await page.evaluate(()=>String(CX?.session?.view||''));if(view!=='postulaciones'||!/Pedir acción al shopper/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:DASHBOARD_HANDOFF');}await shot(page,'admin-dashboard');
 await nav(page,'postulaciones');a.requestShopper=await click(page,'#reqShopper');if(a.requestShopper){await page.waitForTimeout(250);const opts=await page.locator('.cx-ov:visible #rqSh option').allInnerTexts().catch(()=>[]);if(!opts.some(x=>/asignación vigente/i.test(x)))throw new Error('FUNCTIONAL_DEFECT:ADMIN_REQUEST_HR_TARGETS');}await shot(page,'admin-postulations');
 await nav(page,'shoppers');a.shopperProfile=await click(page,'#shBody [data-sid]');if(a.shopperProfile&&!/banco|pago|cuenta|perfil/i.test(await overlay(page)))throw new Error('VISUAL_DEFECT:ADMIN_SHOPPER_PROFILE_BANKING');await shot(page,'admin-shopper-profile');
 const finPeriod=await page.evaluate(()=>{const d=CX.data,orig=d.currentPeriodId;for(const p of (d.projects||[]).slice().reverse()){try{d.setProject(p.id);if((CX.liq?.forProject?.(d)||[]).length)return{id:p.id,orig};}catch(_){}}d.setProject(orig);return{id:orig,orig};});
 await nav(page,'liquidaciones');a.liqSelectAll=await click(page,'#liqSelectAll');a.liqDetail=await click(page,'[data-ldetail]');if(a.liqDetail){await page.waitForTimeout(250);if(!/Detalle financiero/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:LIQ_DETAIL_MODAL');}await nav(page,'liquidaciones');a.individualPay=await click(page,'[data-payone]');if(a.individualPay){await page.waitForTimeout(250);if(!await page.locator('.cx-ov:visible #onePaySupport').count())throw new Error('FUNCTIONAL_DEFECT:INDIVIDUAL_PAYMENT_SUPPORT_UI');}await nav(page,'liquidaciones');await click(page,'#liqSelectAll');const pay=page.locator('#payDraft');if(await pay.count()&&await pay.isEnabled()){await pay.click();result.clickCount++;a.batchPay=true;await page.waitForTimeout(250);if(!await page.locator('.cx-ov:visible #batchPaySupport').count())throw new Error('FUNCTIONAL_DEFECT:BATCH_PAYMENT_SUPPORT_UI');}else a.batchPay=false;await shot(page,'admin-liquidations');
 await nav(page,'movimientos');a.cxc=await click(page,'[data-cuenta="cxc"]');if(a.cxc&&!/cuenta por cobrar/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:CXC_MODAL');await nav(page,'movimientos');a.cxp=await click(page,'[data-cuenta="cxp"]');if(a.cxp&&!/cuenta por pagar/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:CXP_MODAL');await shot(page,'admin-movements');
 await nav(page,'cert');a.certImport=await click(page,'#certImp');if(a.certImport&&!/Importar banco/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:CERT_IMPORT_MODAL');await shot(page,'admin-cert');
 await nav(page,'reservas');a.reservationAssign=await click(page,'#aAsignar');if(a.reservationAssign){await page.waitForTimeout(250);if(!/Asignar sucursal a shopper/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:RESERVATION_ASSIGN_MODAL');}await shot(page,'admin-reservations');
 await globalControlInventory(page,'admin');for(const rid of FULL_SCOPE.roles.admin)await inventoryRoute(page,'admin',rid,'admin');
 result.admin=a;result.admin.financePeriod=finPeriod;await ctx.close();
 if(client){const s=await signed(client,'client');await globalControlInventory(s.page,'client');for(const rid of FULL_SCOPE.roles.cliente)await inventoryRoute(s.page,'client',rid,'client');result.client={memberId:client.id,routeCount:FULL_SCOPE.roles.cliente.length};await s.ctx.close();}else{throw new Error('AUTH_FAILURE:FULL_EXHAUSTIVE_CLIENT_MISSING');}
 const counts={admin:Object.keys(result.routeInventory.admin||{}).length,shopper:Object.keys(result.routeInventory.shopper||{}).length,client:Object.keys(result.routeInventory.client||{}).length};
 if(counts.admin!==FULL_SCOPE.counts.admin||counts.shopper!==FULL_SCOPE.counts.shopper||counts.client!==FULL_SCOPE.counts.cliente)throw new Error('RELEASE_COMPOSITION_FAILURE:FULL_ROUTE_INVENTORY_INCOMPLETE:'+JSON.stringify(counts));
 await browser.close();result.coverage={counts,expected:FULL_SCOPE.counts,shopperModules:FULL_SCOPE.shopperModules,benefitsIncluded:FULL_SCOPE.shopperModules.includes('beneficios'),globalControls:FULL_SCOPE.globalControls};if(result.actionFindings.length){result.decision='HOLD_I3_PHASEA_EXHAUSTIVE_CLICK_VISUAL_ACTION_FINDINGS';fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));process.exitCode=2;}else{result.decision='PASS_I3_PHASEA_EXHAUSTIVE_CLICK_VISUAL';fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));}
}catch(error){result.decision='FAIL_I3_PHASEA_EXHAUSTIVE_CLICK_VISUAL';result.error=str(error?.stack||error);fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');await browser.close().catch(()=>{});console.log(JSON.stringify(result,null,2));process.exitCode=2;}
