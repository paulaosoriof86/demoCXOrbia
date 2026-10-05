import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PHASEA_LIVE_OUT||'');
const ROOT=String(process.env.HOSTING_URL||'').replace(/\/$/,'');
const SOURCE=String(process.env.FOCAL_SOURCE||'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'');
if(!OUT||!ROOT||!SOURCE||!EXPECTED_HR)throw new Error('ENVIRONMENT_FAILURE:PHASEA_LIVE_ENV_MISSING');
fs.mkdirSync(OUT,{recursive:true});
const write=v=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(v,null,2)+'\n');
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const tenantId='tya',projectId='cinepolis';
const PAULA_VISIBLE_LOGIN=str(process.env.PAULA_VISIBLE_LOGIN||'paula.osorio').toLowerCase();
const PAULA_EXACT_HR_ID=str(process.env.PAULA_EXACT_HR_ID||'shopper_gt_1440137b73');

const [metaRes,jsonRes]=await Promise.all([
  fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&phasealive='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)}),
  fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=json&phasealive='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)})
]);
if(!metaRes.ok||!jsonRes.ok)throw new Error('PROVIDER_FAILURE:PHASEA_HR_HTTP');
const meta=await metaRes.json(),body=await jsonRes.json(),snap=body.snapshot||body.data||body;
const revision=str(meta.revision||body.revision||body._runtime?.revision||snap.sourceRevision);
if(revision!==EXPECTED_HR||meta.ok!==true||meta.revisionStable!==true||meta.sourceSafe!==true||body.sourceSafe!==true)throw new Error('PROVIDER_FAILURE:PHASEA_HR_REVISION:'+JSON.stringify({revision,expected:EXPECTED_HR,meta}));
const periodKey=str(snap.source?.currentCalendarPeriodKey||body.currentCalendarPeriodKey||'');
const periodMeta=arr(snap.periods).find(p=>str(p.key)===periodKey)||null;
const periodId=str(periodMeta?.id||('cinepolis-'+periodKey));
const currentHrVisits=arr(snap.visits).filter(v=>str(v.periodKey)===periodKey);
const facet=v=>v?.canonicalFacets||{};
if(!periodKey||!periodId||!currentHrVisits.length)throw new Error('SOURCE_FAILURE:PHASEA_CURRENT_PERIOD_MISSING');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const [membersSnap,profilesSnap,crossSnap]=await Promise.all([
  tenant.collection('users').get(),
  tenant.collection('shoppers').get(),
  tenant.collection('shopperIdentityCrosswalk').get()
]);
const members=membersSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const profiles=profilesSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const crosswalks=crossSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const aliasToProfile=new Map();
for(const p of profiles){
  const aliases=new Set([p.id,p.shopperId,...arr(p.sourceShopperIds),...arr(p.exactAliases),...arr(p.legacyLiveShopperIds)].map(str).filter(Boolean));
  for(const a of aliases)if(!aliasToProfile.has(a))aliasToProfile.set(a,p.id);
}
for(const c of crosswalks){
  const canonical=str(c.shopperId||c.canonicalShopperId);
  if(canonical)aliasToProfile.set(str(c.id),canonical);
}
const resolveProfileId=raw=>{
  const start=str(raw);if(!start)return '';
  let cur=start;
  for(let i=0;i<8;i++){
    const next=str(aliasToProfile.get(cur)||cur);
    if(!next||next===cur)return next||cur;
    cur=next;
  }
  throw new Error('MAPPING_FAILURE:IDENTITY_CROSSWALK_CYCLE:'+start);
};
const profileName=p=>str(p.nombre||p.displayName||[p.firstName,p.lastName].filter(Boolean).join(' '));
const requiredProfileFields=p=>[
  ['firstName',p.firstName],['lastName',p.lastName],['whatsapp',p.whatsapp||p.phone],['email',p.email],['ciudad',p.ciudad],['depto',p.depto],
  ['edad',p.edad],['sexo',p.sexo],['dpi',p.dpi],['banco',p.banco],['ctaTipo',p.ctaTipo],['ctaNum',p.ctaNum],['ctaTitular',p.ctaTitular],['ctaMoneda',p.ctaMoneda]
].filter(([,v])=>!str(v)).map(([k])=>k);
const authExists=async uid=>{try{await auth.getUser(uid);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}};

const targetNames=['Julissa Flores','Priscila López','Paula Osorio'];
const targets=[],profileById=new Map(profiles.map(p=>[p.id,p]));
for(const name of targetNames){
  const namedProfiles=profiles.filter(p=>norm(profileName(p))===norm(name));
  if(!namedProfiles.length)throw new Error('MAPPING_FAILURE:TARGET_PROFILE_NAME_MISSING_'+norm(name).replace(/\s+/g,'_'));
  const operational=[];
  for(const m of members.filter(m=>m.active===true&&str(m.role).toLowerCase()==='shopper'&&str(m.authNamespace).toLowerCase()==='shopper')){
    const resolved=resolveProfileId(m.shopperId),profile=profileById.get(resolved);
    if(profile&&norm(profileName(profile))===norm(name)&&await authExists(m.id))operational.push({member:m,profile,resolved});
  }
  let selected=null,selectionAuthority='unique_display_name_operational';
  if(norm(name)===norm('Paula Osorio')){
    const exact=operational.filter(x=>x.resolved===PAULA_EXACT_HR_ID&&str(x.member.visibleLogin||x.member.username||x.member.user).toLowerCase()===PAULA_VISIBLE_LOGIN);
    if(exact.length!==1)throw new Error('MAPPING_FAILURE:TARGET_EXACT_AUTHORITY_PRINCIPAL_paula_osorio:'+JSON.stringify({expectedShopperId:PAULA_EXACT_HR_ID,expectedVisibleLogin:PAULA_VISIBLE_LOGIN,namedProfiles:namedProfiles.map(p=>({id:p.id,name:profileName(p),resolved:resolveProfileId(p.id)})),operational:operational.map(x=>({uid:x.member.id,shopperId:x.member.shopperId,visibleLogin:x.member.visibleLogin,resolved:x.resolved,profileId:x.profile.id}))}));
    selected=exact[0];
    selectionAuthority='exact_hr_id_plus_visible_login';
  }else{
    if(operational.length!==1)throw new Error('MAPPING_FAILURE:TARGET_ACTIVE_CANONICAL_PRINCIPAL_'+norm(name).replace(/\s+/g,'_')+':'+JSON.stringify({namedProfiles:namedProfiles.map(p=>({id:p.id,name:profileName(p),resolved:resolveProfileId(p.id)})),operational:operational.map(x=>({uid:x.member.id,shopperId:x.member.shopperId,resolved:x.resolved,profileId:x.profile.id}))}));
    selected=operational[0];
  }
  const profile=selected.profile;
  targets.push({name,profile,member:selected.member,selectionAuthority,independentSameDisplayNamePrincipals:operational.filter(x=>x.member.id!==selected.member.id).map(x=>({shopperId:x.member.shopperId,resolved:x.resolved,visibleLogin:x.member.visibleLogin||null})),aliasProfileIds:namedProfiles.map(p=>p.id).filter(id=>id!==profile.id),missing:requiredProfileFields(profile)});
}
let admin=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
  if(await authExists(m.id)){admin=m;break;}
}
if(!admin)throw new Error('AUTH_FAILURE:PHASEA_ADMIN_MISSING');

const unresolvedMemberships=[];
const membershipGroups=new Map();
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.authNamespace).toLowerCase()==='shopper')){
  const resolved=resolveProfileId(m.shopperId);
  if(!profiles.some(p=>p.id===resolved))unresolvedMemberships.push({uid:m.id,shopperId:m.shopperId,resolved});
  const list=membershipGroups.get(resolved)||[];list.push(m.id);membershipGroups.set(resolved,list);
}
const duplicateActivePrincipals=[...membershipGroups.entries()].filter(([id,uids])=>id&&uids.length>1).map(([id,uids])=>({shopperId:id,uids}));
const unresolvedAssigned=[];
for(const v of currentHrVisits.filter(v=>facet(v).assigned===true)){
  const raw=str(v.shopperId||v.evaluadorId||v.evaluatorId),resolved=resolveProfileId(raw);
  if(!raw||!profiles.some(p=>p.id===resolved))unresolvedAssigned.push({visitId:v.id||v.visitId,hrRowId:v.hrRowId,shopperId:raw,resolved});
}
const hrKeys=currentHrVisits.map(v=>str(v.hrRowId||v.sourceCoord||v.id||v.visitId)).filter(Boolean);
const duplicateHrKeys=hrKeys.filter((k,i)=>hrKeys.indexOf(k)!==i);
if(unresolvedMemberships.length||duplicateActivePrincipals.length||unresolvedAssigned.length||duplicateHrKeys.length){
  throw new Error('MAPPING_FAILURE:PHASEA_POPULATION_INVARIANT:'+JSON.stringify({unresolvedMemberships,duplicateActivePrincipals,unresolvedAssigned,duplicateHrKeys}));
}

const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime='+PROTECTED;
const browser=await chromium.launch({headless:true});

async function signed(member,kind){
  const ctx=await browser.newContext({viewport:{width:1480,height:1000}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(str(e?.message||e)));
  let settled=false,lastError='';
  for(let attempt=1;attempt<=5&&!settled;attempt++){
    await page.goto(URL+'&phaselive='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(member.id);
    try{
      await page.evaluate(async t=>{const fb=window.firebase;await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token);
    }catch(e){lastError=str(e?.message||e);}
    await page.waitForLoadState('domcontentloaded',{timeout:90000}).catch(()=>{});
    const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=>'');
    if(uid===String(member.id))settled=true;else if(attempt<5)await page.waitForTimeout(800*attempt);
  }
  if(!settled)throw new Error('AUTH_FAILURE:BROWSER_SESSION:'+member.id+':'+lastError);
  await page.goto('about:blank');
  await page.goto(URL+'&phaselivesettled='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({kind,rev,projectId,periodId})=>{
    const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},role=String(c.role||'').toLowerCase();
    return c.authenticated===true&&(kind==='shopper'?role==='shopper':role!=='shopper'&&role!=='cliente')
      &&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true
      &&String(d.currentProjectId||'')===projectId&&String(d.currentPeriodId||'')===periodId&&String(d.previewMeta?.sourceRevision||'')===rev;
  },{kind,rev:revision,projectId,periodId},{timeout:120000});
  if(errors.length)throw new Error('FUNCTIONAL_DEFECT:PAGEERROR_'+kind+':'+JSON.stringify(errors));
  return {ctx,page};
}
async function nav(page,route){
  await page.evaluate(r=>window.CX.router.nav(r,{history:false}),route);
  await page.waitForFunction(({route,rev})=>String(window.CX?.session?.view||'')===route&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev,{route,rev:revision},{timeout:45000});
  await page.waitForTimeout(300);
  const dirty=await page.evaluate(()=>{const t=String(document.body?.innerText||'');return {technical:/AUTH_READY|CLAIMS_READY|HRROWID|FINANCIALSOURCESTATUS|CXORBIA DEV\s*·\s*LABORATORIO|máquina canónica HR/i.test(t),blocked:t.includes('Fuente de datos no disponible'),stack:/Maximum call stack|RangeError/i.test(t)};});
  if(dirty.technical||dirty.blocked||dirty.stack)throw new Error('VISUAL_DEFECT:DIRTY_ROUTE_'+route+':'+JSON.stringify(dirty));
}

const evidence={
  schemaVersion:'cxorbia.i3.phasea.representative-live-reproof.v1',
  decision:'HOLD',
  sourceSha:SOURCE,hrRevision:revision,periodId,
  representatives:{},admin:null,
  population:{activeShopperMemberships:members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper').length,profiles:profiles.length,currentHrVisits:currentHrVisits.length,assignedHrVisits:currentHrVisits.filter(v=>facet(v).assigned===true).length,unresolvedMemberships:0,duplicateActivePrincipals:0,unresolvedAssignedVisits:0,duplicateHrVisitKeys:0},
  writes:{auth:0,hr:0,provider:0},deploys:0,production:false
};

try{
  for(const target of targets){
    const sp=await signed(target.member,'shopper'),page=sp.page;
    const base=await page.evaluate(({expectedId,currentPeriodId})=>{
      const d=window.CX?.data||{},sid=String(window.CX?.session?.user?.shopperId||''),own=typeof d.visitsForShopper==='function'?d.visitsForShopper(expectedId,false):[];
      const current=own.filter(v=>String(d.recordPeriodId?d.recordPeriodId(v):(v.periodId||v.projectId)||'')===currentPeriodId);
      const active=current.filter(v=>{const f=d.visitFacets?.(v)||{};return f.assigned===true&&f.realized!==true&&f.cancelled!==true;});
      return {sessionShopperId:sid,ownVisits:own.length,uniqueOwnVisits:new Set(own.map(v=>String(v.hrRowId||v.id||v.visitId||''))).size,currentVisits:current.length,activeVisits:active.length,firstActive:active[0]?{id:String(active[0].id||active[0].visitId||''),hrRowId:String(active[0].hrRowId||''),branch:String(active[0].sucursal||''),instructiveReadAt:String(active[0].instructiveReadAt||'')}:null};
    },{expectedId:target.profile.id,currentPeriodId:periodId});
    if(base.sessionShopperId!==target.profile.id)throw new Error('MAPPING_FAILURE:SESSION_NOT_CANONICAL:'+target.name+':'+JSON.stringify(base));
    if(base.ownVisits!==base.uniqueOwnVisits)throw new Error('MAPPING_FAILURE:DUPLICATE_OWN_VISITS:'+target.name+':'+JSON.stringify(base));

    await nav(page,'midia');
    const midia=await page.evaluate(branch=>{const text=String(document.body?.innerText||'');return {text:text.slice(0,1400),noActive:/Sin visitas activas/i.test(text),branchVisible:branch?text.includes(branch):true};},base.firstActive?.branch||'');
    if(base.activeVisits>0&&(midia.noActive||!midia.branchVisible))throw new Error('FUNCTIONAL_DEFECT:MIDIA_ACTIVE_VISIT_MISSING:'+target.name+':'+JSON.stringify({base,midia}));

    await nav(page,'miperfil');
    const profile=await page.evaluate(expectedName=>{const body=String(document.body?.innerText||''),titles=[...document.querySelectorAll('.cx-profile-group-title')].map(x=>String(x.innerText||''));return {body:body.slice(0,1600),locked:/No fue posible vincular esta sesión con tu perfil/i.test(body),grid:!!document.querySelector('.cx-profile-detail-grid'),titles,nameVisible:normLocal(body).includes(normLocal(expectedName))};function normLocal(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}},target.name);
    if(profile.locked||!profile.grid||!profile.nameVisible||!['Identidad','Contacto','Acceso','Datos de pago'].every(k=>profile.titles.some(t=>norm(t).includes(norm(k)))))throw new Error('VISUAL_DEFECT:PROFILE_'+target.name+':'+JSON.stringify(profile));

    await nav(page,'misvisitas');
    const route=await page.evaluate(({branch,read})=>{
      const body=String(document.body?.innerText||''),cards=[...document.querySelectorAll('[data-visit-card]')];
      const card=branch?cards.find(c=>String(c.innerText||'').includes(branch)):cards[0]||null;
      const cert=card?.querySelector('[data-cert]'),sched=card?.querySelector('[data-sched]'),doc=card?.querySelector('[data-doc]');
      return {cards:cards.length,body:body.slice(0,1600),branchVisible:branch?body.includes(branch):true,certDisabled:cert?cert.disabled:null,scheduleDisabled:sched?sched.disabled:null,certText:String(cert?.innerText||''),docText:String(doc?.innerText||''),progressLabels:[...card?.querySelectorAll('.cx-visit-progress-label')||[]].map(x=>String(x.innerText||'')),read};
    },{branch:base.firstActive?.branch||'',read:!!base.firstActive?.instructiveReadAt});
    if(base.activeVisits>0&&!route.branchVisible)throw new Error('FUNCTIONAL_DEFECT:MISVISITAS_ACTIVE_MISSING:'+target.name);
    if(base.firstActive){
      if(!base.firstActive.instructiveReadAt){
        if(route.certDisabled!==true||route.scheduleDisabled!==true)throw new Error('FUNCTIONAL_DEFECT:ROUTE_PREREQUISITE_BYPASS:'+target.name+':'+JSON.stringify(route));
      }else{
        if(!/Instructivo leído/i.test(route.docText))throw new Error('FUNCTIONAL_DEFECT:INSTRUCTIVE_ACK_NOT_PROJECTED:'+target.name+':'+JSON.stringify(route));
        if(/Certificación vigente/i.test(route.certText)&&route.scheduleDisabled===true)throw new Error('FUNCTIONAL_DEFECT:CERTIFIED_SCHEDULE_STILL_BLOCKED:'+target.name+':'+JSON.stringify(route));
        if(!/Certificación vigente/i.test(route.certText)&&route.certDisabled===true)throw new Error('FUNCTIONAL_DEFECT:CERT_ACTION_BLOCKED_AFTER_INSTRUCTIVE:'+target.name+':'+JSON.stringify(route));
      }
    }

    await nav(page,'cert');
    const cert=await page.evaluate(()=>{const body=String(document.body?.innerText||'');return {rendered:/Certificación/i.test(body),body:body.slice(0,1200)};});
    if(!cert.rendered)throw new Error('FUNCTIONAL_DEFECT:CERT_ROUTE_NOT_RENDERED:'+target.name);

    await nav(page,'aprendizaje');
    const academy=await page.evaluate(()=>{const heads=[...document.querySelectorAll('.cx-academy-course-head')],cards=[...document.querySelectorAll('.cx-academy-course-card')],colors=heads.map(h=>getComputedStyle(h).backgroundColor),images=heads.map(h=>getComputedStyle(h).backgroundImage);return {cards:cards.length,heads:heads.length,colors,images,distinctColors:new Set(colors).size,solid:images.every(v=>v==='none')};});
    if(academy.cards<1||academy.heads!==academy.cards||!academy.solid||academy.distinctColors<Math.min(4,academy.cards))throw new Error('VISUAL_DEFECT:ACADEMY_SOLID_COLORS:'+target.name+':'+JSON.stringify(academy));

    await nav(page,'beneficios');
    const benefits=await page.evaluate(()=>{const rows=[...document.querySelectorAll('tbody tr')].map(tr=>({text:String(tr.innerText||'').replace(/\s+/g,' ').trim(),status:String(tr.dataset.benStatus||'')}));const old=rows.filter(r=>{const m=r.text.match(/20\d{2}-\d{2}-\d{2}/);return m&&m[0]<='2026-05-31';});const oldPaid=old.filter(r=>r.status==='paid');const paidContradictions=oldPaid.filter(r=>/Pendiente de confirmación/i.test(r.text));return {rows:rows.length,oldRows:old.length,oldPaid:oldPaid.length,paidContradictions:paidContradictions.map(r=>r.text),body:String(document.body?.innerText||'').slice(0,1800)};});
    if(target.name==='Paula Osorio'&&(benefits.oldRows<1||benefits.oldPaid<1||benefits.paidContradictions.length))throw new Error('FUNCTIONAL_DEFECT:PAULA_HISTORICAL_PAYMENT_DISPLAY:'+JSON.stringify(benefits));

    evidence.representatives[target.name]={shopperId:target.profile.id,uid:target.member.id,selectionAuthority:target.selectionAuthority,independentSameDisplayNamePrincipals:target.independentSameDisplayNamePrincipals,missingProfileFields:target.missing,base,midia:{noActive:midia.noActive,branchVisible:midia.branchVisible},profile:{grid:profile.grid,titles:profile.titles,nameVisible:profile.nameVisible},route,cert:{rendered:cert.rendered},academy,benefits:{rows:benefits.rows,oldRows:benefits.oldRows,oldPaid:benefits.oldPaid,paidContradictionCount:benefits.paidContradictions.length}};
    await sp.ctx.close();
  }

  const ap=await signed(admin,'admin'),page=ap.page;
  await nav(page,'shoppers');
  await page.waitForSelector('#shSearch');
  // shoppers.js binds the input listener from setTimeout(...,0); do not race that mount.
  await page.waitForTimeout(100);
  const adminJulissaData=await page.evaluate(()=>((window.CX?.data?.shoppersFor?.()||[])
    .filter(s=>/Julissa/i.test(String(s?.nombre||'')))
    .map(s=>({id:String(s?.id||''),nombre:String(s?.nombre||''),status:String(s?.status||''),identityState:String(s?.identityState||'')}))));
  const searchAdminShopper=async(name)=>{
    const search=page.locator('#shSearch');
    await search.fill('');
    await search.fill(name);
    await page.waitForFunction(wanted=>[...document.querySelectorAll('#shBody tr')]
      .some(tr=>String(tr.innerText||'').toLowerCase().includes(String(wanted||'').toLowerCase())),name,{timeout:3000}).catch(()=>{});
    return page.evaluate(wanted=>{
      const rows=[...document.querySelectorAll('#shBody tr')].map(tr=>({text:String(tr.innerText||'').replace(/\s+/g,' ').trim(),sid:String(tr.dataset.sid||'')}));
      const exact=rows.find(r=>r.text.toLowerCase().includes(String(wanted||'').toLowerCase()));
      return {visible:!!exact,row:String(exact?.text||''),sid:String(exact?.sid||''),rows:rows.map(r=>r.text).slice(0,20)};
    },name);
  };
  const illescas=await searchAdminShopper('Julissa Illescas');
  const flores=await searchAdminShopper('Julissa Flores');
  let clicked=false;
  if(flores.visible&&flores.sid){
    clicked=await page.evaluate(sid=>{
      const tr=[...document.querySelectorAll('#shBody tr')].find(x=>String(x.dataset.sid||'')===String(sid||''));
      if(!tr)return false;
      tr.click();
      return true;
    },flores.sid);
  }
  const shopperAdmin={dataJulissas:adminJulissaData,floresVisible:flores.visible,illescasVisible:illescas.visible,floresRow:flores.row,illescasRow:illescas.row,floresSid:flores.sid,illescasSid:illescas.sid,clicked};
  if(!shopperAdmin.floresVisible||!shopperAdmin.illescasVisible||!shopperAdmin.clicked)throw new Error('MAPPING_FAILURE:ADMIN_JULISSA_DISCOVERY:'+JSON.stringify(shopperAdmin));
  await page.waitForTimeout(250);
  const modal=await page.evaluate(()=>{const m=[...document.querySelectorAll('[role="dialog"],.modal,.overlay,.ov')].find(x=>/Julissa Flores/i.test(String(x.innerText||'')))||[...document.querySelectorAll('body *')].find(x=>/Revisar \/ fusionar identidad/i.test(String(x.innerText||''))&&/Instruir perfil/i.test(String(x.innerText||'')));const text=String(m?.innerText||document.body.innerText||'');return {manualMerge:/Revisar \/ fusionar identidad|Resolver identidad/i.test(text),instructProfile:/Instruir perfil/i.test(text),text:text.slice(0,1800)};});
  if(!modal.manualMerge||!modal.instructProfile)throw new Error('FUNCTIONAL_DEFECT:ADMIN_IDENTITY_ACTIONS_MISSING:'+JSON.stringify(modal));
  await page.keyboard.press('Escape').catch(()=>{});

  await nav(page,'postulaciones');
  const post=await page.evaluate(()=>{
    const d=window.CX?.data||{},pending=typeof d.activePosts==='function'?d.activePosts().filter(p=>String(p.estado||p.status||'').toLowerCase()==='pendiente').length:0;
    const assignments=typeof d.visitas==='function'?d.visitas().filter(v=>{const f=d.visitFacets?.(v)||{};return f.assigned===true&&f.cancelled!==true;}).length:0;
    const badge=document.querySelector('#nav-postulaciones .n-badge'),badgeText=String(badge?.textContent||'').trim(),body=String(document.body?.innerText||'');
    return {pending,assignments,badgeText,headerPending:body.includes(pending+' postulaciones pendientes'),headerAssignments:body.includes(assignments+' asignaciones vigentes'),showsAllZero:/0 pendientes\s*·\s*0 aprobadas/i.test(body),body:body.slice(0,1800)};
  });
  if((post.pending?String(post.pending):'')!==post.badgeText||!post.headerPending||!post.headerAssignments)throw new Error('MAPPING_FAILURE:POSTULATIONS_COUNT_DESYNC:'+JSON.stringify(post));

  await nav(page,'visitas');
  const visitAdmin=await page.evaluate(()=>{const d=window.CX?.data||{},v=typeof d.visitas==='function'?d.visitas():[];return {count:v.length,assigned:v.filter(x=>d.visitFacets?.(x)?.assigned===true).length,unique:new Set(v.map(x=>String(x.hrRowId||x.id||x.visitId||''))).size};});
  if(visitAdmin.count!==currentHrVisits.length||visitAdmin.unique!==visitAdmin.count)throw new Error('MAPPING_FAILURE:ADMIN_VISIT_HR_PARITY:'+JSON.stringify({visitAdmin,hr:currentHrVisits.length}));

  evidence.admin={uid:admin.id,shopperAdmin,modal:{manualMerge:modal.manualMerge,instructProfile:modal.instructProfile},postulations:post,visits:visitAdmin};
  await ap.ctx.close();

  evidence.decision='PASS_I3_PHASEA_REPRESENTATIVE_SAME_ARTIFACT_LIVE_REPROOF';
  write(evidence);
  console.log(JSON.stringify(evidence,null,2));
}catch(error){
  evidence.decision='FAIL_I3_PHASEA_REPRESENTATIVE_SAME_ARTIFACT_LIVE_REPROOF';
  evidence.error=str(error?.stack||error);
  write(evidence);
  throw error;
}finally{
  await browser.close();
}
