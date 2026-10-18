import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initializeApp,applicationDefault,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const ROOT=String(process.env.HOSTING_URL||'').replace(/\/$/,'');
const SRC=String(process.env.FOCAL_SOURCE||'');
const HR=String(process.env.EXPECTED_HR_REVISION||'');
const RUN=String(process.env.GITHUB_RUN_ID||'');
const OUT=String(process.env.PHASEA_LIVE_OUT||'')+'/d04-e04';
const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
if(!ROOT||!SRC||!HR||!/^\d+$/.test(RUN))throw Error('ENVIRONMENT_FAILURE:D04_E04_ENV');
assert.equal(descriptor.status,'HOLD_I3_D04_E04_LIVE_E2E_REQUIRED');
assert.equal(descriptor.productSourceSha,SRC);
assert.equal(descriptor.currentMaterialization?.sourceSha,SRC);
assert.equal(descriptor.currentMaterialization?.runNumber,1782);
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc('tya');
const str=x=>String(x??'').trim();
const res={decision:'HOLD',version:'cxorbia.i3.d04-e04.run1782.connected.v1',sourceSha:SRC,sourceTree:descriptor.productTreeAuthority,run1782:descriptor.currentMaterialization.runId,hostingVersion:descriptor.currentMaterialization.hostingVersion,runtimeRevision:descriptor.currentMaterialization.runtimeRevision,hrRevision:HR,scope:{tenant:'tya',project:'cinepolis'},d04:{},e04:{},cleanup:{},writes:{auth:0,hr:0,otherBanks:0,production:0},production:false};
let browser,qaRef=null;
const record=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(res,null,2)+'\n');
const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxProjectId=cinepolis&d04run='+RUN;
async function member(role){
 const all=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...d.data()}));
 const pool=all.filter(m=>m.active!==false&&
   (role==='admin'?['admin','super'].includes(str(m.role).toLowerCase())&&str(m.authNamespace).toLowerCase()!=='shopper':
    ['cliente','client'].includes(str(m.role).toLowerCase())&&str(m.authNamespace).toLowerCase()==='staff'));
 for(const m of pool){
  const ids=Array.isArray(m.projectIds)?m.projectIds.map(String):[];
  if(ids.length&&!ids.includes('cinepolis')&&str(m.scopeProjectId)!=='cinepolis')continue;
  try{const u=await auth.getUser(m.id);if(!u.disabled)return m;}catch(e){if(str(e.code)!=='auth/user-not-found')throw e;}
 }
 throw Error('AUTH_FAILURE:'+role.toUpperCase()+'_SCOPED_MEMBER_UNAVAILABLE');
}
async function sign(m,role){
 const ctx=await browser.newContext({viewport:{width:1400,height:940}}),page=await ctx.newPage();
 await page.goto(url+'&pre='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:90000});
 const token=await auth.createCustomToken(m.id);
 await page.evaluate(async t=>{const a=window.firebase.auth();await a.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await a.signInWithCustomToken(t);},token);
 await page.goto('about:blank');
 await page.goto(url+'&signed='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(id=>String(window.firebase?.auth?.().currentUser?.uid||'')===id,m.id,{timeout:90000});
 await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
 await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
 await page.waitForFunction(input=>{const c=window.CX?.backendAuth?.context?.()||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},r=String(c.role||'').toLowerCase();
  return c.authenticated===true&&(input.role==='admin'?['admin','super'].includes(r):['cliente','client'].includes(r))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===input.hr;},{role,hr:HR},{timeout:120000});
 return {ctx,page};
}
try{
 browser=await chromium.launch({headless:true});
 const admin=await sign(await member('admin'),'admin');
 const page=admin.page;
 const current=await page.evaluate(()=>({project:String(window.CX?.data?.currentProjectId||''),period:String(window.CX?.data?.period?.()?.id||'')}));
 assert.equal(current.project,'cinepolis');
 if(!current.period)throw Error('MAPPING_FAILURE:CERT_SCOPE_PERIOD');
 const certId='qa-i3-d04-'+RUN;
 const rid='certbank-cinepolis-'+current.period+'-'+certId;
 res.scope.period=current.period;
 qaRef=tenant.collection('resources').doc(rid);
 if((await qaRef.get()).exists)throw Error('PERSISTENCE_FAILURE:QA_COLLISION');
 const allBefore=(await tenant.collection('resources').where('projectId','==','cinepolis').where('status','==','active').get()).docs
  .filter(d=>d.data()?.resourceType==='certification_bank')
  .map(d=>({id:d.id,version:d.data().version,revision:d.data().bank?.contentRevision})).sort((a,b)=>a.id.localeCompare(b.id));
 const questions=Array.from({length:15},(_,i)=>({q:'Pregunta QA '+(i+1),ops:['Primera','Segunda','Tercera','Cuarta'],correcta:'Primera',exp:'Explicación QA',fuente:'[Página 1]'}));
 const seed=await page.evaluate(async arg=>{
  await window.CX.backendResources.load({projectId:'cinepolis',periodId:arg.period});
  const reply=await window.CX.certStore.save(arg.period,{certificationId:arg.certId,certificationName:'QA D04 '+arg.run,preguntas:arg.questions,gate:80,estado:'pending_review',contentRevision:'qa-'+arg.run,generadoPorUid:'qa-fixture-not-user',documentSource:{name:'Fixture QA',source_sha256:'a'.repeat(64),extraction_quality:{pageCount:1,sufficient:true}}},arg.certId);
  return{ack:reply?.providerAck===true,committed:reply?.committed===true,resourceId:reply?.item?.id,version:reply?.item?.version};
 },{period:current.period,certId,run:RUN,questions});
 if(!seed.ack||!seed.committed||seed.resourceId!==rid||seed.version!==1)throw Error('PERSISTENCE_FAILURE:QA_SEED_ACK');
 if((await qaRef.get()).data()?.version!==1)throw Error('PERSISTENCE_FAILURE:QA_SEED_READBACK');
 await page.evaluate(id=>{window.CX_CERT_SELECTED_ID=id;window.CX.router.nav('cert',{history:false});},certId);
 await page.locator('#certReviewEdit').waitFor({state:'visible',timeout:30000});
 await page.locator('#certReviewEdit').click();
 await page.locator('#certReviewQuestions fieldset').first().locator('textarea').first().fill('Pregunta QA revisada '+RUN);
 await page.locator('#certReviewPreview').click();
 if(!/Preguntas modificadas: 1/.test(await page.locator('#certReviewDiff').innerText()))throw Error('FUNCTIONAL_DEFECT:REVIEW_DIFF');
 await page.locator('#certReviewSave').click();
 await page.waitForFunction(id=>(window.CX?.backendResources?.items||[]).some(x=>x.id===id&&x.version===2),rid,{timeout:45000});
 const stored=(await qaRef.get()).data()||{};
 if(stored.version!==2||stored.bank?.preguntas?.length!==15||stored.bank?.preguntas?.[0]?.q!=='Pregunta QA revisada '+RUN||stored.bank?.estado!=='pending_review'||stored.bank?.reviewHistory?.length!==1||stored.bank?.reviewHistory?.[0]?.toVersion!==2)throw Error('PERSISTENCE_FAILURE:D04_VERSION_ACK_READBACK');
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&!!window.CX?.backendResources?.load,null,{timeout:90000});
 const reloaded=await page.evaluate(async a=>{await window.CX.backendResources.load({projectId:'cinepolis',periodId:a.period});const b=window.CX.certStore.bank(a.period,a.id);return{version:b?.__resourceVersion,q:b?.preguntas?.[0]?.q,estado:b?.estado,history:b?.reviewHistory?.length};},{period:current.period,id:certId});
 if(reloaded.version!==2||reloaded.q!=='Pregunta QA revisada '+RUN||reloaded.estado!=='pending_review'||reloaded.history!==1)throw Error('PERSISTENCE_FAILURE:D04_RELOAD');
 const allAfter=(await tenant.collection('resources').where('projectId','==','cinepolis').where('status','==','active').get()).docs
  .filter(d=>d.id!==rid&&d.data()?.resourceType==='certification_bank')
  .map(d=>({id:d.id,version:d.data().version,revision:d.data().bank?.contentRevision})).sort((a,b)=>a.id.localeCompare(b.id));
 if(JSON.stringify(allBefore)!==JSON.stringify(allAfter))throw Error('PERSISTENCE_FAILURE:NON_QA_BANK_CHANGED');
 res.d04={decision:'PASS_15_QUESTION_REVIEW_PROVIDER_ACK_VERSION_HISTORY_RELOAD',versionBefore:1,versionAfter:2,questions:15,oldBanksUnchanged:true,autoPublished:false,editableAiName:!!(await page.locator('#ciName').count())};
 await admin.ctx.close();
 const client=await sign(await member('client'),'client');
 await client.page.evaluate(()=>window.CX.router.nav('cli_insights',{history:false}));
 await client.page.waitForFunction(()=>String(window.CX?.session?.view||'')==='cli_insights',null,{timeout:30000});
 await client.page.waitForTimeout(500);
 const visual=await client.page.evaluate(()=>{const txt=String(document.querySelector('#view')?.innerText||''),p=window.CX?.data?.period?.()||{};
  return{route:String(window.CX?.session?.view||''),benchmarkStatus:String(p.benchmarkSource?.status||''),revision:String(p.benchmarkSource?.sourceRevision||''),section:txt.includes('Benchmark vs industria'),sourceMissing:txt.includes('Referencia sectorial pendiente'),noInvented:txt.includes('No se emiten comparaciones ni juicios de desempeño.'),visible:!!document.querySelector('#view')?.getBoundingClientRect()?.height};});
 if(visual.route!=='cli_insights'||!visual.section||!visual.visible)throw Error('VISUAL_DEFECT:F12_CLIENT_ROUTE');
 if(visual.benchmarkStatus!=='verified'&&(!visual.sourceMissing||!visual.noInvented))throw Error('FUNCTIONAL_DEFECT:F12_UNVERIFIED_BENCHMARK_SHOWN');
 if(visual.benchmarkStatus==='verified'&&!visual.revision)throw Error('SOURCE_FAILURE:F12_BENCHMARK_NO_REVISION');
 res.e04={decision:'PASS_CLIENT_F12_SOURCE_AWARE_DOM',sourceStatus:visual.benchmarkStatus||'absent',sourceAbsentWarningShown:visual.sourceMissing,noInventedComparison:visual.noInvented,humanApproval:'PENDING'};
 await client.ctx.close();
 res.decision='PASS_D04_E04_CONNECTED_DEV_QA_NO_HUMAN_APPROVAL';
}catch(e){res.error={classification:String(e?.message||e).split(':')[0],detail:String(e?.message||e).slice(0,340)};}
finally{
 if(qaRef)try{const x=await qaRef.get();if(x.exists)await qaRef.delete();res.cleanup.qaAbsentAfter=!(await qaRef.get()).exists;}catch(e){res.cleanup.error=String(e?.message||e).slice(0,200);}
 else res.cleanup.qaAbsentAfter=true;
 if(browser)await browser.close().catch(()=>{});
 if(res.cleanup.qaAbsentAfter!==true)res.decision='HOLD_QA_CLEANUP';
 record();
}
console.log(JSON.stringify({decision:res.decision,d04:res.d04,e04:res.e04,cleanup:res.cleanup,error:res.error||null,production:false}));
if(res.decision!=='PASS_D04_E04_CONNECTED_DEV_QA_NO_HUMAN_APPROVAL')process.exitCode=1;
