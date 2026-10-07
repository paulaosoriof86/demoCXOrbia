import crypto from 'node:crypto';
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const OUT=String(process.env.VRM267_OUT||'');
const ROOT=String(process.env.HOSTING_URL||'').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'');
const SOURCE=String(process.env.FOCAL_SOURCE||'');
if(!OUT||!ROOT||!EXPECTED_HR||!SOURCE)throw new Error('ENVIRONMENT_FAILURE:VRM267_ENV');
fs.mkdirSync(OUT,{recursive:true});

const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const tenantId='tya',projectId='cinepolis',PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+projectId+'&cxProtectedRuntime='+PROTECTED+'&vrm267='+Date.now();
const runKey=str(process.env.GITHUB_RUN_ID||Date.now());
const subject='QA I3 SUPPORT FOCAL '+runKey;
const clientRequestId='vrm267-'+runKey;
const detail='Probe focal VRM-267; cleanup automático';

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const result={
  schemaVersion:'cxorbia.i3.vrm267.support-focal-live.v1',
  decision:'HOLD_VRM267_SUPPORT_FOCAL_LIVE',sourceSha:SOURCE,hostingUrl:ROOT,hrRevision:EXPECTED_HR,
  subject,clientRequestId,stages:{},requests:[],events:[],browser:{},durable:{},idempotency:{},visibility:{},cleanup:{},
  hrWrites:0,production:false
};
const stage=(name,ok,extra={})=>{result.stages[name]={ok,...extra};return ok;};
const write=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');

const metaBefore=await fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&vrm267before='+runKey,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(120000)});
if(!metaBefore.ok)throw new Error('PROVIDER_FAILURE:VRM267_HR_META_BEFORE');
const beforeMeta=await metaBefore.json();
if(str(beforeMeta.revision)!==EXPECTED_HR)throw new Error('PROVIDER_FAILURE:VRM267_HR_REVISION_BEFORE');

const [membersSnap,profilesSnap,crossSnap]=await Promise.all([
  tenant.collection('users').get(),tenant.collection('shoppers').get(),tenant.collection('shopperIdentityCrosswalk').get()
]);
const members=membersSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const profiles=profilesSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const cross=crossSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
const alias=new Map();
for(const p of profiles)for(const a of new Set([p.id,p.shopperId,...arr(p.sourceShopperIds),...arr(p.exactAliases),...arr(p.legacyLiveShopperIds)].map(str).filter(Boolean)))if(!alias.has(a))alias.set(a,p.id);
for(const c of cross){const x=str(c.shopperId||c.canonicalShopperId);if(x)alias.set(str(c.id),x);}
const resolve=x=>{let cur=str(x);for(let i=0;i<8;i++){const next=str(alias.get(cur)||cur);if(next===cur)return cur;cur=next;}return cur;};
const profileById=new Map(profiles.map(p=>[p.id,p]));
const profileName=p=>str(p?.nombre||p?.displayName||[p?.firstName,p?.lastName].filter(Boolean).join(' '));
const authExists=async uid=>{try{await auth.getUser(uid);return true;}catch(error){if(str(error?.code)==='auth/user-not-found')return false;throw error;}};
const julissaCandidates=[];
for(const member of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper')){
  const profile=profileById.get(resolve(member.shopperId));
  if(profile&&norm(profileName(profile))==='julissa flores'&&await authExists(member.id))julissaCandidates.push({member,profile});
}
const julissa=julissaCandidates.find(x=>str(x.member.visibleLogin||x.member.username).toLowerCase()==='julissa.flores')||julissaCandidates[0];
if(julissaCandidates.length!==1||!julissa)throw new Error('MAPPING_FAILURE:VRM267_JULISSA_EXACT_TARGET:'+julissaCandidates.length);
let admin=null;
for(const member of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
  if(await authExists(member.id)){admin=member;break;}
}
if(!admin)throw new Error('AUTH_FAILURE:VRM267_ADMIN_TARGET');
stage('shopper_authenticated',true,{uid:julissa.member.id,visibleLogin:julissa.member.visibleLogin||julissa.member.username,shopperId:julissa.profile.id});

const browser=await chromium.launch({headless:true});
async function signed(member,role,label){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage(),pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e)));
  let settled=false,lastError='';
  for(let attempt=1;attempt<=5&&!settled;attempt++){
    await page.goto(URL+'&role='+role+'&attempt='+attempt+'&ts='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(member.id);
    try{await page.evaluate(async value=>{const fb=window.firebase;await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(value);},token);}catch(error){lastError=str(error?.message||error);}
    const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=>'');
    settled=uid===String(member.id);
    if(!settled)await page.waitForTimeout(800*attempt);
  }
  if(!settled)throw new Error('AUTH_FAILURE:VRM267_BROWSER_SESSION:'+label+':'+lastError);
  await page.goto('about:blank');
  await page.goto(URL+'&role='+role+'&settled='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({role,revision})=>{const c=window.CX?.backendAuth?.context?.()||{},r=String(c.role||'').toLowerCase(),g=window.CX_C6_HR_AUTHORITY_GATE||{};const roleOk=role==='shopper'?r==='shopper':r!=='shopper';return c.authenticated===true&&roleOk&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===revision;},{role,revision:EXPECTED_HR},{timeout:120000});
  if(pageErrors.length)throw new Error('FUNCTIONAL_DEFECT:VRM267_PAGEERROR:'+label+':'+JSON.stringify(pageErrors));
  return{ctx,page};
}
async function nav(page,route){
  await page.evaluate(r=>window.CX.router.nav(r,{history:false}),route);
  await page.waitForFunction(r=>String(window.CX?.session?.view||'')===r,route,{timeout:45000});
  await page.waitForTimeout(400);
}
async function installTrace(page){
  await page.evaluate(()=>{
    window.__VRM267_TRACE={events:[],requests:[]};
    for(const name of ['command-blocked','command-committed'])window.CX?.bus?.on?.(name,payload=>window.__VRM267_TRACE.events.push({name,payload}));
    const original=window.fetch.bind(window);
    window.fetch=async(input,init)=>{
      const url=String(typeof input==='string'?input:input?.url||'');
      const tracked=/\/v1\/cxorbia\/commands(?:\?|$)/.test(url);
      let requestBody=null;
      if(tracked){try{requestBody=JSON.parse(String(init?.body||'{}'));}catch(_){requestBody={parseError:true};}}
      try{
        const response=await original(input,init);
        if(tracked){let body=null;try{body=await response.clone().json();}catch(_){body={parseError:true};}window.__VRM267_TRACE.requests.push({url:url.replace(/^https?:\/\/[^/]+/,''),status:response.status,ok:response.ok,request:requestBody,response:body});}
        return response;
      }catch(error){if(tracked)window.__VRM267_TRACE.requests.push({url:url.replace(/^https?:\/\/[^/]+/,''),networkError:String(error?.message||error),request:requestBody});throw error;}
    };
  });
}
async function supportVisible(page){
  return page.evaluate(async subject=>{try{await window.CX.supportStore.hydrate(true);const list=window.CX.supportStore.list();return{ok:true,count:list.filter(x=>String(x?.asunto||'')===subject).length,rows:list.filter(x=>String(x?.asunto||'')===subject)};}catch(error){return{ok:false,error:String(error?.message||error),count:0,rows:[]};}},subject);
}
async function reloadReady(page,member,role){
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({role,revision})=>{const c=window.CX?.backendAuth?.context?.()||{},r=String(c.role||'').toLowerCase(),g=window.CX_C6_HR_AUTHORITY_GATE||{};return c.authenticated===true&&(role==='shopper'?r==='shopper':r!=='shopper')&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===revision;},{role,revision:EXPECTED_HR},{timeout:120000});
}

let shopperCtx=null,freshCtx=null,adminCtx=null,capturedCommand=null,ticketDocs=[];
try{
  const signedShopper=await signed(julissa.member,'shopper','julissa');shopperCtx=signedShopper.ctx;const page=signedShopper.page;
  await installTrace(page);
  const preflight=await page.evaluate(()=>({
    createSupportTicket:typeof window.CX?.data?.createSupportTicket==='function',
    supportStoreAdd:typeof window.CX?.supportStore?.add==='function',
    adapter:window.CX?.commandAdapter?.status?.()||null,
    auth:window.CX?.backendAuth?.context?.()||null,
    endpoint:window.CX?.commandHttpTransport?.endpoint?.()||null
  }));
  result.browser.preflight=preflight;
  stage('cx_data_createSupportTicket',preflight.createSupportTicket,{owner:'app/adapters/cxorbia-cxdata-command-boundary-v1.js'});
  stage('command_adapter_ready',preflight.adapter?.writesEnabled===true&&!!preflight.adapter?.activeTransport,{owner:'app/adapters/cxorbia-command-adapter-v1.js',status:preflight.adapter});
  await nav(page,'soporte');
  const newTab=page.locator('[data-tab="nueva"]');
  if(!await newTab.count())throw new Error('FUNCTIONAL_DEFECT:VRM267_NEW_REQUEST_CONTROL_MISSING');
  await newTab.click();
  await page.locator('#spAsunto').fill(subject);
  await page.locator('#spDet').fill(detail);
  await page.locator('#spSend').evaluate((el,id)=>{el.dataset.requestId=id;},clientRequestId);
  await page.locator('#spSend').click();
  await page.waitForFunction(()=>window.__VRM267_TRACE.requests.length>0||window.__VRM267_TRACE.events.some(x=>x.name==='command-blocked'),null,{timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1200);
  const trace=await page.evaluate(()=>window.__VRM267_TRACE);
  result.requests=trace.requests;result.events=trace.events;
  capturedCommand=trace.requests.find(x=>x.request?.commandType==='support.ticket.create')?.request||null;
  const blockedEvent=trace.events.find(x=>x.name==='command-blocked')?.payload||null;
  const committedEvent=trace.events.find(x=>x.name==='command-committed')?.payload||null;
  stage('clientScopeCheck',!!trace.requests.length,{owner:'app/adapters/cxorbia-command-adapter-v1.js',blockedCode:blockedEvent?.code||null});
  stage('http_command_transport',!!trace.requests.length,{owner:'app/adapters/cxorbia-command-http-transport-v1.js',status:trace.requests[0]?.status??null,networkError:trace.requests[0]?.networkError||null});
  const http=trace.requests[0]||{};
  stage('command_runtime',http.status===200||!!http.response?.providerKind,{owner:'backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs',code:http.response?.code||null});
  stage('operational_provider',http.response?.commandType==='support.ticket.create'||http.response?.providerAck===true,{owner:'backend/runtime/cxorbia-operational-command-provider-v1.mjs',code:http.response?.code||null});
  stage('provider_ack',http.response?.ok===true&&http.response?.providerAck===true&&http.response?.committed===true,{response:http.response||null,committedEvent});

  ticketDocs=(await tenant.collection('bulletins').where('supportSubject','==',subject).get()).docs;
  result.durable.initialCount=ticketDocs.length;
  result.durable.initialRows=ticketDocs.map(d=>({id:d.id,...(d.data()||{})}));
  stage('firestore_durable_write',ticketDocs.length===1,{owner:'backend/runtime/cxorbia-operational-command-provider-v1.mjs',count:ticketDocs.length});
  const liveVisible=await supportVisible(page);result.visibility.shopperImmediate=liveVisible;
  stage('shopper_visibility',liveVisible.ok&&liveVisible.count===1,{owner:'app/core/backend-bulletins.js',readback:liveVisible});
  await page.screenshot({path:OUT+'/shopper-support-created.png',fullPage:true,animations:'disabled'}).catch(()=>{});

  const replay=await page.evaluate(async spec=>{try{return await window.CX.data.createSupportTicket(spec,{ackAware:true,reason:'vrm267_focal_idempotent_replay'});}catch(error){return{thrown:true,code:error?.result?.code||null,message:String(error?.message||error),result:error?.result||null};}},{asunto:subject,detalle:detail,tipo:'Plataforma',prio:'media',de:'Julissa Flores',clientRequestId});
  result.idempotency.replay=replay;
  const postReplay=(await tenant.collection('bulletins').where('supportSubject','==',subject).get()).docs;
  result.idempotency.duplicateCount=postReplay.length;
  stage('idempotency',replay?.ok===true&&replay?.providerAck===true&&replay?.idempotentReplay===true&&postReplay.length===1,{replay,duplicateCount:postReplay.length});

  await reloadReady(page,julissa.member,'shopper');await nav(page,'soporte');
  const reloadVisible=await supportVisible(page);result.visibility.shopperReload=reloadVisible;
  stage('reload',reloadVisible.ok&&reloadVisible.count===1,{owner:'app/core/backend-bulletins.js',readback:reloadVisible});

  const fresh=await signed(julissa.member,'shopper','julissa-fresh');freshCtx=fresh.ctx;await nav(fresh.page,'soporte');
  const freshVisible=await supportVisible(fresh.page);result.visibility.shopperFreshContext=freshVisible;
  stage('fresh_browser_context',freshVisible.ok&&freshVisible.count===1,{owner:'app/core/backend-bulletins.js',readback:freshVisible});
  await fresh.ctx.close();freshCtx=null;

  const adminSigned=await signed(admin,'admin','admin');adminCtx=adminSigned.ctx;await nav(adminSigned.page,'soporte');
  const adminVisible=await supportVisible(adminSigned.page);result.visibility.admin=adminVisible;
  const adminDom=await adminSigned.page.locator('#view').innerText().catch(()=>'');
  result.visibility.admin.domContainsSubject=adminDom.includes(subject);
  stage('admin_visibility',adminVisible.ok&&adminVisible.count===1&&adminDom.includes(subject),{owner:'app/modules/soporte.js + app/core/backend-bulletins.js',readback:adminVisible,domContainsSubject:adminDom.includes(subject)});
  await adminSigned.page.screenshot({path:OUT+'/admin-support-visible.png',fullPage:true,animations:'disabled'}).catch(()=>{});

  const required=['shopper_authenticated','cx_data_createSupportTicket','command_adapter_ready','clientScopeCheck','http_command_transport','command_runtime','operational_provider','provider_ack','firestore_durable_write','shopper_visibility','idempotency','reload','fresh_browser_context','admin_visibility'];
  const failed=required.find(name=>result.stages[name]?.ok!==true);
  if(failed){
    const s=result.stages[failed]||{};
    const code=s.blockedCode||s.code||s.response?.code||http.response?.code||http.networkError||'VRM267_STAGE_FAILED';
    const classification=/ROLE|SCOPE|AUTH|401|403/.test(str(code))?'AUTH_FAILURE':failed==='provider_ack'||failed.includes('durable')||failed.includes('visibility')||failed==='reload'||failed==='fresh_browser_context'||failed==='idempotency'?'PERSISTENCE_FAILURE':failed==='http_command_transport'||failed==='command_runtime'||failed==='operational_provider'?'PROVIDER_FAILURE':'FUNCTIONAL_DEFECT';
    result.firstBreak={stage:failed,classification,code,owner:s.owner||null,file:s.owner||null};
  }else result.decision='PASS_VRM267_SUPPORT_FOCAL_LIVE';
}catch(error){
  result.error=str(error?.stack||error);
  if(!result.firstBreak){const code=str(error?.message||error);result.firstBreak={stage:'probe_exception',classification:/AUTH/.test(code)?'AUTH_FAILURE':/MAPPING/.test(code)?'MAPPING_FAILURE':/PROVIDER/.test(code)?'PROVIDER_FAILURE':/ENVIRONMENT/.test(code)?'ENVIRONMENT_FAILURE':'FUNCTIONAL_DEFECT',code,owner:null,file:null};}
}finally{
  await shopperCtx?.close().catch(()=>{});await freshCtx?.close().catch(()=>{});await adminCtx?.close().catch(()=>{});await browser.close().catch(()=>{});
  try{
    const docs=(await tenant.collection('bulletins').where('supportSubject','==',subject).get()).docs;
    const batch=db.batch();for(const doc of docs)batch.delete(doc.ref);
    if(capturedCommand){
      const receiptId=sha(`${capturedCommand.tenantId}\0${capturedCommand.projectId}\0${capturedCommand.periodId}\0${capturedCommand.idempotencyKey}`).slice(0,40);
      const auditId=sha(`${capturedCommand.idempotencyKey}\0${capturedCommand.commandType}\0${capturedCommand.entityId||''}`).slice(0,40);
      batch.delete(tenant.collection('commandReceipts').doc(receiptId));batch.delete(tenant.collection('entityAuditTrail').doc(auditId));
      result.cleanup.receiptId=receiptId;result.cleanup.auditId=auditId;
    }
    await batch.commit();
    const remaining=(await tenant.collection('bulletins').where('supportSubject','==',subject).get()).size;
    result.cleanup={...result.cleanup,ticketsDeleted:docs.length,remaining,receipt:true,audit:true,safe:true};
    stage('cleanup',remaining===0,{count:docs.length});
  }catch(error){result.cleanup={...result.cleanup,safe:false,error:str(error?.message||error)};stage('cleanup',false,{error:result.cleanup.error});}
  try{
    const metaAfterRes=await fetch(ROOT+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&vrm267after='+runKey,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(120000)});
    const metaAfter=await metaAfterRes.json();result.hrRevisionAfter=str(metaAfter.revision);result.hrUnchanged=metaAfterRes.ok&&result.hrRevisionAfter===EXPECTED_HR;
    stage('zero_hr_writes',result.hrUnchanged,{before:EXPECTED_HR,after:result.hrRevisionAfter});
  }catch(error){stage('zero_hr_writes',false,{error:str(error?.message||error)});}
  if(result.decision==='PASS_VRM267_SUPPORT_FOCAL_LIVE'&&(result.stages.cleanup?.ok!==true||result.stages.zero_hr_writes?.ok!==true)){
    result.decision='HOLD_VRM267_SUPPORT_FOCAL_LIVE';result.firstBreak={stage:result.stages.cleanup?.ok!==true?'cleanup':'zero_hr_writes',classification:'PERSISTENCE_FAILURE',code:'VRM267_POSTCONDITION_FAILED',owner:'tools/qa/cxorbia-i3-vrm267-support-focal-live.mjs',file:'tools/qa/cxorbia-i3-vrm267-support-focal-live.mjs'};
  }
  write();console.log(JSON.stringify(result,null,2));if(result.decision!=='PASS_VRM267_SUPPORT_FOCAL_LIVE')process.exitCode=2;
}
