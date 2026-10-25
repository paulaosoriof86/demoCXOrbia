#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.I3_SWEEP_OUT||'.tmp/i3-multimodule-live-sweep');
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.FOCAL_SOURCE||'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'');
const TENANT='tya',PROGRAM='cinepolis';
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
fs.mkdirSync(OUT,{recursive:true});
const evidence={schemaVersion:'cxorbia.i3.multimodule-live-sweep.v1',decision:'HOLD',sourceSha:SOURCE,hrRevision:null,periodId:null,admin:{},shoppers:{},client:{},extras:{},population:{},writes:{before:null,after:null,delta:null},pageErrors:[],hrWrites:0,externalWrites:0,builds:0,deploys:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(evidence,null,2)+'\n','utf8');
const fail=(classification,code,extra={})=>{Object.assign(evidence,{decision:'FAIL_I3_MULTIMODULE_LIVE_SWEEP',classification,code,...extra});save();console.log(JSON.stringify(evidence,null,2));process.exit(2);};
const need=(ok,classification,code,extra={})=>{if(!ok)fail(classification,code,extra);};
need(ROOT&&SOURCE&&/^[a-f0-9]{64}$/.test(EXPECTED_HR),'ENVIRONMENT_FAILURE','I3_SWEEP_ENV_MISSING');

const [metaRes,jsonRes]=await Promise.all([
 fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=meta&i3sweep='+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)}),
 fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&i3sweep='+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)})
]);
need(metaRes.ok&&jsonRes.ok,'PROVIDER_FAILURE','I3_SWEEP_HR_HTTP');
const meta=await metaRes.json(),body=await jsonRes.json(),snap=body.snapshot||body.data||body;
const revision=str(meta.revision||body.revision||body._runtime?.revision||snap.sourceRevision);
need(revision===EXPECTED_HR&&meta.ok===true&&meta.revisionStable===true&&meta.sourceSafe===true,'PROVIDER_FAILURE','I3_SWEEP_HR_REVISION',{revision,expected:EXPECTED_HR});
const periodKey=str(snap.source?.currentCalendarPeriodKey||body.currentCalendarPeriodKey||'');
const periodMeta=arr(snap.periods).find(p=>str(p.key)===periodKey)||null;
const periodId=str(periodMeta?.id||('cinepolis-'+periodKey));
const currentHrVisits=arr(snap.visits).filter(v=>str(v.periodKey)===periodKey);
need(periodKey&&periodId&&currentHrVisits.length>0,'SOURCE_FAILURE','I3_SWEEP_CURRENT_PERIOD_MISSING',{periodKey,periodId,visits:currentHrVisits.length});
evidence.hrRevision=revision;evidence.periodId=periodId;

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const all=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const [members,profiles,crosswalks]=await Promise.all([all(tenant.collection('users')),all(tenant.collection('shoppers')),all(tenant.collection('shopperIdentityCrosswalk'))]);
const aliasToProfile=new Map(),profileById=new Map(profiles.map(p=>[p.id,p]));
for(const p of profiles){for(const a of new Set([p.id,p.shopperId,...arr(p.sourceShopperIds),...arr(p.exactAliases),...arr(p.legacyLiveShopperIds)].map(str).filter(Boolean)))if(!aliasToProfile.has(a))aliasToProfile.set(a,p.id);}
for(const c of crosswalks){const canonical=str(c.shopperId||c.canonicalShopperId);if(canonical)aliasToProfile.set(str(c.id),canonical);}
const resolveProfileId=raw=>{let cur=str(raw);for(let i=0;i<8&&cur;i++){const next=str(aliasToProfile.get(cur)||cur);if(next===cur)return cur;cur=next;}return cur;};
const profileName=p=>str(p?.nombre||p?.displayName||[p?.firstName,p?.lastName].filter(Boolean).join(' '));
const authExists=async uid=>{try{await auth.getUser(uid);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}};

const shopperOps=[];
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.authNamespace).toLowerCase()==='shopper')){
 const resolved=resolveProfileId(m.shopperId),profile=profileById.get(resolved);
 if(profile&&await authExists(m.id))shopperOps.push({member:m,profile,resolved,name:profileName(profile)});
}
const unresolvedMemberships=members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.authNamespace).toLowerCase()==='shopper').filter(m=>!profileById.has(resolveProfileId(m.shopperId))).map(m=>({uid:m.id,shopperId:m.shopperId,resolved:resolveProfileId(m.shopperId)}));
const groups=new Map();for(const x of shopperOps){const a=groups.get(x.profile.id)||[];a.push(x.member.id);groups.set(x.profile.id,a);}
const duplicateActivePrincipals=[...groups.entries()].filter(([,uids])=>uids.length>1).map(([shopperId,uids])=>({shopperId,uids}));
const hrKeys=currentHrVisits.map(v=>str(v.hrRowId||v.sourceCoord||v.id||v.visitId)).filter(Boolean);
const duplicateHrVisitKeys=hrKeys.filter((k,i)=>hrKeys.indexOf(k)!==i);
const unresolvedAssigned=currentHrVisits.filter(v=>(v?.canonicalFacets||{}).assigned===true).map(v=>({v,raw:str(v.shopperId||v.evaluadorId||v.evaluatorId)})).filter(x=>!x.raw||!profileById.has(resolveProfileId(x.raw))).map(x=>({hrRowId:x.v.hrRowId,shopperId:x.raw,resolved:resolveProfileId(x.raw)}));
need(!unresolvedMemberships.length&&!duplicateActivePrincipals.length&&!duplicateHrVisitKeys.length&&!unresolvedAssigned.length,'MAPPING_FAILURE','I3_SWEEP_POPULATION_INVARIANT',{unresolvedMemberships,duplicateActivePrincipals,duplicateHrVisitKeys,unresolvedAssigned});
evidence.population={activeShopperMemberships:shopperOps.length,profiles:profiles.length,currentHrVisits:currentHrVisits.length,unresolvedMemberships:0,duplicateActivePrincipals:0,duplicateHrVisitKeys:0,unresolvedAssignedVisits:0};

let admin=null,client=null;
for(const m of members){
 const role=str(m.role).toLowerCase(),ns=str(m.authNamespace).toLowerCase();
 if(!admin&&m.active===true&&ns==='staff'&&['super','admin'].includes(role)&&await authExists(m.id))admin=m;
 if(!client&&m.active!==false&&String(m.status||'active').toLowerCase()!=='disabled'&&ns==='staff'&&['cliente','client'].includes(role)&&await authExists(m.id))client=m;
}
need(admin,'AUTH_FAILURE','I3_SWEEP_ADMIN_MISSING');
need(client,'AUTH_FAILURE','I3_SWEEP_CLIENT_MISSING');

const authorityNames=['Herbert Ríos','Elizabeth González','Andrea Loarca','Cinthya Lixon','Erick Gomez','Joshua Urbina','Aldair Ixcayau','Flavio Salgado'];
const paula=shopperOps.find(x=>norm(x.name).includes('paula')&&norm(x.name).includes('osorio'));
const hn=shopperOps.find(x=>['hn','honduras'].includes(str(x.profile.pais||x.profile.country).toLowerCase()));
const gt=shopperOps.find(x=>['gt','guatemala'].includes(str(x.profile.pais||x.profile.country).toLowerCase())&&(!paula||x.member.id!==paula.member.id))||paula;
const consolidated=shopperOps.find(x=>authorityNames.some(n=>norm(x.name)===norm(n)||norm(x.name).startsWith(norm(n)+' ')));
need(paula&&gt&&hn&&consolidated,'MAPPING_FAILURE','I3_SWEEP_REQUIRED_SHOPPER_LANES_MISSING',{paula:!!paula,gt:gt?.name||null,hn:hn?.name||null,consolidated:consolidated?.name||null});

const project=tenant.collection('projects').doc(PROGRAM);
const beforeCounts={commandReceipts:(await tenant.collection('commandReceipts').get()).size,users:(await tenant.collection('users').get()).size,postulations:(await project.collection('postulations').get()).size,reservations:(await project.collection('reservations').get()).size};
evidence.writes.before=beforeCounts;

const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime='+PROTECTED+'&cxTechnicalAuthE2E='+TECH;
const browser=await chromium.launch({headless:true});
async function ready(page,member,kind){
 await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
 await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
 await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
 await page.waitForFunction(({kind,rev,projectId,periodId})=>{
  const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},role=String(c.role||'').toLowerCase(),roleOk=kind==='admin'?['super','admin'].includes(role):kind==='shopper'?role==='shopper':['cliente','client'].includes(role);
  return c.authenticated===true&&roleOk&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&String(d.currentProjectId||'')===projectId&&String(d.currentPeriodId||'')===periodId&&String(d.previewMeta?.sourceRevision||'')===rev;
 },{kind,rev:revision,projectId:PROGRAM,periodId},{timeout:120000});
}
async function signed(member,kind,reloadProof=false){
 const ctx=await browser.newContext({viewport:{width:1480,height:1050}}),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(str(e?.message||e).slice(0,500)));
 await page.goto(URL+'&i3sweep='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
 const token=await auth.createCustomToken(member.id);
 await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);
 await page.goto('about:blank');await page.goto(URL+'&i3sweepsettled='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});await ready(page,member,kind);
 const first=await page.evaluate(()=>({uid:String(firebase.auth().currentUser?.uid||''),role:String(CX.backendAuth.context()?.role||''),tenantId:String(CX.backendAuth.context()?.tenantId||''),projectId:String(CX.data.currentProjectId||''),periodId:String(CX.data.currentPeriodId||''),revision:String(CX.data.previewMeta?.sourceRevision||''),view:String(CX.session.view||''),protectedData:CX.session?.canSeeProtectedData?.()===true}));
 let reload=null;
 if(reloadProof){await page.reload({waitUntil:'domcontentloaded',timeout:90000});await ready(page,member,kind);reload=await page.evaluate(()=>({uid:String(firebase.auth().currentUser?.uid||''),role:String(CX.backendAuth.context()?.role||''),projectId:String(CX.data.currentProjectId||''),periodId:String(CX.data.currentPeriodId||''),revision:String(CX.data.previewMeta?.sourceRevision||''),view:String(CX.session.view||'')}));need(reload.uid===first.uid&&reload.projectId===first.projectId&&reload.periodId===first.periodId&&reload.revision===first.revision,'AUTH_FAILURE','I3_SWEEP_SESSION_RECOVERY_'+kind,{first,reload});}
 return {ctx,page,errors,first,reload};
}
async function route(page,id,required=true){
 const visible=await page.evaluate(r=>!!document.querySelector('#nav-'+r),id);
 if(required)need(visible,'FUNCTIONAL_DEFECT','I3_SWEEP_ROUTE_NOT_VISIBLE_'+id);
 if(!visible)return {id,visible:false,disposition:'PRESERVED_NOT_YET_PHASE_A_AUTHORITY'};
 await page.evaluate(r=>window.CX.router.nav(r,{history:false}),id);
 await page.waitForFunction(({r,rev})=>String(window.CX?.session?.view||'')===r&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev,{r:id,rev:revision},{timeout:45000});
 await page.waitForTimeout(250);
 const snap=await page.evaluate(()=>{const t=String(document.getElementById('view')?.innerText||'').trim();return {textLength:t.length,blocked:/Fuente de datos no disponible/i.test(t),stack:/Maximum call stack|RangeError/i.test(t),revision:String(CX.data?.previewMeta?.sourceRevision||''),projectId:String(CX.data?.currentProjectId||''),periodId:String(CX.data?.currentPeriodId||'')};});
 need(snap.textLength>10&&!snap.blocked&&!snap.stack&&snap.revision===revision&&snap.projectId===PROGRAM&&snap.periodId===periodId,'FUNCTIONAL_DEFECT','I3_SWEEP_ROUTE_RENDER_'+id,{snap});
 return {id,visible:true,disposition:'PASS_CURRENT_ARTIFACT',...snap};
}

try{
 const a=await signed(admin,'admin',true),ap=a.page;
 need(a.first.protectedData===true,'AUTH_FAILURE','I3_SWEEP_ADMIN_PROTECTED_ACCESS');
 const adminRoutes=['midia','dashboard','shoppers','visitas','postulaciones','reservas','cert','aprendizaje','documentos','financiero','movimientos','liquidaciones','config','marca','informes','historico','cuestionarios'];
 const ar={};for(const id of adminRoutes)ar[id]=await route(ap,id,true);
 const adminData=await ap.evaluate(()=>{const d=CX.data||{},v=typeof d.visitas==='function'?d.visitas():[],keys=v.map(x=>String(x.hrRowId||x.sourceCoord||x.id||x.visitId||''));return {visits:v.length,uniqueVisits:new Set(keys).size,projectId:String(d.currentProjectId||''),periodId:String(d.currentPeriodId||''),revision:String(d.previewMeta?.sourceRevision||''),brandSource:String(CX.tenant?.brandingSource||window.CX_TENANT_RUNTIME_CONFIG?.sourceAuthority||''),localShopperPersistence:d.__shopperStore?.localPersistence===true};});
 need(adminData.visits===currentHrVisits.length&&adminData.uniqueVisits===adminData.visits&&!adminData.localShopperPersistence,'MAPPING_FAILURE','I3_SWEEP_ADMIN_DATA_PARITY',{adminData,hrVisits:currentHrVisits.length});
 const extras={};for(const id of ['soporte','novedades','marketing','automatizaciones','integraciones','correo'])extras[id]=await route(ap,id,false);
 evidence.admin={uid:admin.id,session:a.first,reload:a.reload,routes:ar,data:adminData};evidence.extras=extras;evidence.pageErrors.push(...a.errors.map(x=>'admin:'+x));await a.ctx.close();

 const targetMap=[['GT',gt],['HN',hn],['Paula Osorio',paula],['Consolidated '+consolidated.name,consolidated]];
 for(const [label,target] of targetMap){
  const s=await signed(target.member,'shopper',label==='Paula Osorio'),p=s.page;
  need(s.first.protectedData===false,'AUTH_FAILURE','I3_SWEEP_SHOPPER_PROTECTED_LEAK_'+label);
  const expectedId=target.profile.id;
  const base=await p.evaluate(id=>{const d=CX.data||{},sid=String(CX.session?.user?.shopperId||''),own=typeof d.visitsForShopper==='function'?d.visitsForShopper(id,false):[],keys=own.map(v=>String(v.hrRowId||v.sourceCoord||v.id||v.visitId||''));return {sessionShopperId:sid,ownVisits:own.length,uniqueOwnVisits:new Set(keys).size,revision:String(d.previewMeta?.sourceRevision||''),projectId:String(d.currentProjectId||''),periodId:String(d.currentPeriodId||'')};},expectedId);
  need(resolveProfileId(base.sessionShopperId)===expectedId&&base.ownVisits===base.uniqueOwnVisits,'MAPPING_FAILURE','I3_SWEEP_SHOPPER_SELF_SCOPE_'+label,{base,expectedId});
  const sr={};for(const id of ['midia','miperfil','visitas','reservas','misvisitas','aprendizaje','cert','documentos','beneficios','mireportes'])sr[id]=await route(p,id,true);
  const beforeView=await p.evaluate(()=>String(CX.session.view||''));await p.evaluate(()=>window.CX.router.nav('shoppers',{history:false}));await p.waitForTimeout(200);const afterView=await p.evaluate(()=>String(CX.session.view||''));
  need(afterView===beforeView,'AUTH_FAILURE','I3_SWEEP_SHOPPER_ADMIN_ROUTE_LEAK_'+label,{beforeView,afterView});
  evidence.shoppers[label]={name:target.name,shopperId:expectedId,country:str(target.profile.pais||target.profile.country),session:s.first,reload:s.reload,base,routes:sr};evidence.pageErrors.push(...s.errors.map(x=>'shopper '+label+':'+x));await s.ctx.close();
 }

 const c=await signed(client,'client',true),cp=c.page;
 need(c.first.protectedData===false,'AUTH_FAILURE','I3_SWEEP_CLIENT_PROTECTED_LEAK');
 const cr={};for(const id of ['cli_dashboard','cli_sucursales','cli_acciones','cli_insights','cli_capacitacion','cli_reportes','cli_programa'])cr[id]=await route(cp,id,true);
 const clientScope=await cp.evaluate(()=>({role:String(CX.backendAuth.context()?.role||''),projectId:String(CX.data.currentProjectId||''),periodId:String(CX.data.currentPeriodId||''),revision:String(CX.data.previewMeta?.sourceRevision||''),projectSelector:document.querySelector('#projSel')?.value||null,periodSelector:document.querySelector('#periodSel')?.value||null}));
 const clientBefore=await cp.evaluate(()=>String(CX.session.view||''));await cp.evaluate(()=>window.CX.router.nav('shoppers',{history:false}));await cp.waitForTimeout(200);const clientAfter=await cp.evaluate(()=>String(CX.session.view||''));
 need(clientAfter===clientBefore,'AUTH_FAILURE','I3_SWEEP_CLIENT_ADMIN_ROUTE_LEAK',{clientBefore,clientAfter});
 evidence.client={uid:client.id,session:c.first,reload:c.reload,routes:cr,scope:clientScope};evidence.pageErrors.push(...c.errors.map(x=>'client:'+x));await c.ctx.close();

 need(evidence.pageErrors.length===0,'FUNCTIONAL_DEFECT','I3_SWEEP_BROWSER_PAGE_ERRORS',{pageErrors:evidence.pageErrors});
 const afterCounts={commandReceipts:(await tenant.collection('commandReceipts').get()).size,users:(await tenant.collection('users').get()).size,postulations:(await project.collection('postulations').get()).size,reservations:(await project.collection('reservations').get()).size};
 evidence.writes.after=afterCounts;evidence.writes.delta=Object.fromEntries(Object.keys(beforeCounts).map(k=>[k,afterCounts[k]-beforeCounts[k]]));
 need(Object.values(evidence.writes.delta).every(v=>v===0),'PERSISTENCE_FAILURE','I3_SWEEP_UNEXPECTED_WRITE',{writes:evidence.writes});
 evidence.decision='PASS_I3_MULTIMODULE_LIVE_SWEEP';save();console.log(JSON.stringify(evidence,null,2));
}catch(error){
 evidence.error=str(error?.stack||error);if(evidence.decision==='HOLD')evidence.decision='FAIL_I3_MULTIMODULE_LIVE_SWEEP';save();throw error;
}finally{await browser.close();}
