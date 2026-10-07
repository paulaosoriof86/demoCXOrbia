import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.PHASEA_CLICK_OUT||''),ROOT=String(process.env.HOSTING_URL||'').replace(/\/$/,''),EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'');
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
const browser=await chromium.launch({headless:true});
const result={schemaVersion:'cxorbia.i3.phasea.exhaustive-click-visual.v1',decision:'HOLD',hrRevision:revision,periodId,shopper:{},admin:{},screenshots:[],clickCount:0,writes:{auth:0,hr:0,provider:0},production:false};
const shot=async(page,name)=>{await page.screenshot({path:OUT+'/'+name+'.png',fullPage:true});result.screenshots.push(name+'.png');};
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
 await page.waitForFunction(({role,rev,periodId})=>{const c=window.CX?.backendAuth?.context?.()||{},r=String(c.role||'').toLowerCase(),g=window.CX_C6_HR_AUTHORITY_GATE||{};return c.authenticated===true&&(role==='shopper'?r==='shopper':r!=='shopper'&&r!=='cliente')&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev&&String(window.CX?.data?.currentPeriodId||'')===periodId;},{role,rev:revision,periodId},{timeout:120000});
 const authorityReadyMs=Date.now()-authorityStartedAt;
 if(authorityReadyMs>60000)throw new Error('ENVIRONMENT_FAILURE:CLICK_AUTHORITY_SYNC_EXCEEDED_60S_'+authorityReadyMs);
 if(errs.length)throw new Error('FUNCTIONAL_DEFECT:CLICK_PAGEERROR:'+role+':'+JSON.stringify(errs));
 return{ctx,page,authorityReadyMs};
}
async function nav(page,route){await page.evaluate(r=>CX.router.nav(r,{history:false}),route);await page.waitForFunction(r=>String(CX?.session?.view||'')===r,route,{timeout:45000});await page.waitForTimeout(450);await visual(page,route);}
async function click(page,sel){const l=page.locator(sel).first();if(!await l.count())return false;await l.click({timeout:10000});result.clickCount++;return true;}

try{
 for(const t of targets){
  const {ctx,page}=await signed(t.member,'shopper'),key=slug(pname(t.profile)),e={};
  await nav(page,'midia');await shot(page,'shopper-'+key+'-midia');
  e.instructive=await click(page,'[data-visit-action="instructive"]');if(e.instructive){await page.waitForTimeout(900);const ov=await overlay(page),view=await page.evaluate(()=>String(CX?.session?.view||''));if(!/instruct|recurso/i.test(ov)&&!['misvisitas','documentos'].includes(view))throw new Error('FUNCTIONAL_DEFECT:CLICK_INSTRUCTIVE_'+key);await shot(page,'shopper-'+key+'-instructive');}
  await nav(page,'miperfil');e.profileJump=await click(page,'[data-profile-jump="history"]');e.profileRow=await click(page,'[data-profile-visit-row]');if(e.profileRow){await page.waitForTimeout(250);if(!/visita|periodo|estado/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:PROFILE_HISTORY_MODAL_'+key);}await shot(page,'shopper-'+key+'-profile');
  await nav(page,'beneficios');const dates=await page.locator('#benHistoryCard tbody tr[data-ben-row] td:nth-child(2)').allInnerTexts().catch(()=>[]);if(dates.length>1){const clean=dates.map(str).filter(Boolean),sorted=clean.slice().sort();if(JSON.stringify(clean)!==JSON.stringify(sorted))throw new Error('FUNCTIONAL_DEFECT:BENEFITS_ORDER_'+key+':'+JSON.stringify(clean));}e.benefitRow=await click(page,'#benHistoryCard [data-ben-row]');if(e.benefitRow){await page.waitForTimeout(250);if(!/honorario|reembolso|detalle/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:BENEFIT_DETAIL_'+key);}await shot(page,'shopper-'+key+'-benefits');
  await nav(page,'misvisitas');e.reprogram=await click(page,'[data-reprog]');if(e.reprogram){await page.waitForTimeout(250);if(!/Solicitar reprogramación/i.test(await overlay(page)))throw new Error('FUNCTIONAL_DEFECT:REPROGRAM_MODAL_'+key);}await shot(page,'shopper-'+key+'-visits');
  await nav(page,'cert');e.certSelector=await click(page,'select');await shot(page,'shopper-'+key+'-cert');
  await nav(page,'novedades');const nt=await page.locator('body').innerText();if(/providerAck|sourceSafe|hrRowId|financialSourceStatus/i.test(nt))throw new Error('VISUAL_DEFECT:NEWS_TECHNICAL_COPY_'+key);await shot(page,'shopper-'+key+'-news');
  result.shopper[pname(t.profile)]=e;await ctx.close();
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
 result.admin=a;result.admin.financePeriod=finPeriod;await ctx.close();await browser.close();result.decision='PASS_I3_PHASEA_EXHAUSTIVE_CLICK_VISUAL';fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}catch(error){result.decision='FAIL_I3_PHASEA_EXHAUSTIVE_CLICK_VISUAL';result.error=str(error?.stack||error);fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');await browser.close().catch(()=>{});console.log(JSON.stringify(result,null,2));process.exitCode=2;}
