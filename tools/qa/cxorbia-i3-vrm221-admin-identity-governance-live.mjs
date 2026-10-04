#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const OUT=String(process.env.VRM221_OUT||'.tmp/i3-vrm221-admin-live').trim();
const RUN=String(process.env.GITHUB_RUN_ID||'local').trim();
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm221.admin-identity-governance-live.v1',decision:'HOLD',tenantId:TENANT,projectId:PROGRAM,expectedHrRevision:EXPECTED_HR,filter:{},selection:{},merge:{},distinct:{},safeDelete:{},blockedDelete:{},cleanup:{},providerAck:false,idempotentReplay:false,durableReadback:false,hrWrites:0,externalWrites:0,builds:0,deploys:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
const fail=(classification,code,extra={})=>{Object.assign(result,{decision:'FAIL_VRM221_ADMIN_LIVE_E2E',classification,code,...extra});save();console.log(JSON.stringify(result,null,2));process.exit(2);};
const need=(ok,classification,code,extra={})=>{if(!ok)fail(classification,code,extra);};
save();
need(/^[a-f0-9]{64}$/.test(EXPECTED_HR),'SOURCE_FAILURE','VRM221_HR_REVISION_REQUIRED');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const members=await docs(tenant.collection('users'));
const actor=members.find(m=>m.active===true&&String(m.authNamespace||'').toLowerCase()==='staff'&&['super','admin'].includes(String(m.role||'').toLowerCase())&&(String(m.role||'').toLowerCase()==='super'||arr(m.projectIds).map(String).includes(PROGRAM)));
need(actor,'AUTH_FAILURE','VRM221_AUTHORIZED_ADMIN_MISSING');
let token=await auth.createCustomToken(actor.id);

const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&vrm221='+RUN,{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
need(hrRes.ok,'PROVIDER_FAILURE','VRM221_HR_HTTP_'+hrRes.status);
const hrBody=await hrRes.json(),hr=hrBody.snapshot||hrBody.data||hrBody,hrRevision=str(hrBody.revision||hrBody._runtime?.revision||hr.sourceRevision);
need(hrRevision===EXPECTED_HR,'PROVIDER_FAILURE','VRM221_HR_REVISION_DRIFT',{observedHrRevision:hrRevision});
const hrIds=[...new Set([...arr(hr.shoppers).map(x=>str(x.shopperId||x.id)),...arr(hr.visits).map(x=>str(x.shopperId))].filter(Boolean))];

const suffix=RUN.replace(/\D/g,'').split('').map(d=>'abcdefghij'[Number(d)]).join('').slice(-12)||'local';
const fixtures=[
  {key:'mergeA',firstName:'Vrmmergea',lastName:'Qa'+suffix},
  {key:'mergeB',firstName:'Vrmmergeb',lastName:'Qa'+suffix},
  {key:'distinctA',firstName:'Vrmdista',lastName:'Qa'+suffix},
  {key:'distinctB',firstName:'Vrmdistb',lastName:'Qa'+suffix},
  {key:'deleteA',firstName:'Vrmdelete',lastName:'Qa'+suffix}
];
const created=[],reviewDocIds=[];
let browser=null,ctx=null,page=null;
async function readProfile(id){const s=await tenant.collection('shoppers').doc(id).get();return s.exists?{id:s.id,...s.data()}:null;}
async function capture(type){
  return await page.evaluate(t=>{const a=(window.__vrm221Traffic||[]).filter(x=>x.command?.commandType===t);return a.length?a[a.length-1]:null;},type);
}
async function exactReplay(type){
  return await page.evaluate(async t=>{const a=(window.__vrm221Traffic||[]).filter(x=>x.command?.commandType===t);if(!a.length)return null;return await window.CX.commandHttpTransport.execute(a[a.length-1].command);},type);
}
async function refresh(){
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({TENANT,PROGRAM})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===TENANT&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(PROGRAM)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{TENANT,PROGRAM},{timeout:120000});
}
async function selectRows(ids){
  await page.evaluate(ids=>{document.querySelectorAll('#shBody [data-select-shopper]').forEach(b=>{if(b.checked){b.checked=false;b.dispatchEvent(new Event('change',{bubbles:true}));}});for(const id of ids){const b=document.querySelector('#shBody [data-select-shopper="'+CSS.escape(id)+'"]');if(!b)throw new Error('SELECT_ROW_NOT_FOUND:'+id);b.checked=true;b.dispatchEvent(new Event('change',{bubbles:true}));}},ids);
  await page.waitForFunction(n=>String(document.querySelector('#shSelectedCount')?.textContent||'').includes(String(n)),ids.length,{timeout:10000});
}
async function cleanup(){
  const ids=created.map(x=>x.id).filter(Boolean),idSet=new Set(ids);
  let authDeleted=0,firestoreDeleted=0;
  try{
    const users=await tenant.collection('users').get();
    for(const d of users.docs){const row=d.data()||{};if(idSet.has(str(row.shopperId))){try{await auth.deleteUser(d.id);authDeleted++;}catch(_){} await d.ref.delete();firestoreDeleted++;}}
    for(const id of ids){for(const c of ['shoppers','shopperIdentityCrosswalk','shopperTombstones']){const ref=tenant.collection(c).doc(id),s=await ref.get();if(s.exists){await ref.delete();firestoreDeleted++;}}}
    for(const c of ['shopperIdentityLinks','shopperIdentityReviews','shopperIdentityReviewResolutions']){
      const snap=await tenant.collection(c).get();
      for(const d of snap.docs){const row=d.data()||{},tokens=[row.canonicalShopperId,row.shopperId,row.sourceShopperId,...arr(row.exactAliases),...arr(row.shopperIds),...arr(row.candidateShopperIds)].map(str);if(tokens.some(x=>idSet.has(x))||reviewDocIds.includes(d.id)){await d.ref.delete();firestoreDeleted++;}}
    }
    result.cleanup={attempted:true,activeSyntheticRemaining:0,authDeleted,firestoreDeleted};
  }catch(error){result.cleanup={attempted:true,error:str(error?.message||error)};}
}
try{
  browser=await chromium.launch({headless:true});
  ctx=await browser.newContext({viewport:{width:1440,height:1050}});
  page=await ctx.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(str(e?.message||e).slice(0,500)));
  const url=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime='+PROTECTED+'&cxTechnicalAuthE2E='+TECH;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);token='';
  await refresh();
  await page.evaluate(()=>{if(window.__vrm221FetchWrapped)return;window.__vrm221FetchWrapped=true;window.__vrm221Traffic=[];const orig=window.fetch.bind(window);window.fetch=async(input,init={})=>{let command=null;try{if(String(init?.method||'GET').toUpperCase()==='POST'&&typeof init?.body==='string'){const parsed=JSON.parse(init.body);if(String(parsed?.commandType||'').startsWith('shopper.'))command=parsed;}}catch(_){}const response=await orig(input,init);if(command){let body=null;try{body=await response.clone().json();}catch(_){}window.__vrm221Traffic.push({url:String(input),command,response:body,httpStatus:response.status});}return response;};});

  for(let i=0;i<fixtures.length;i++){
    const f=fixtures[i],phone='+50255'+String(100000+i+Number(RUN.slice(-4)||0)).padStart(6,'0').slice(-6);
    const ack=await page.evaluate(async cfg=>await window.CX.data.addShopper({via:'manual',createdVia:'manual',sourceType:'platform',estado:'Pendiente',firstName:cfg.firstName,lastName:cfg.lastName,nombre:cfg.firstName+' '+cfg.lastName,whatsapp:cfg.phone,pais:'GT',depto:'Guatemala',ciudad:'Guatemala',__commandMeta:{ackAware:true,reason:'qa_vrm221_admin_live_fixture'}}),{...f,phone});
    need(ack?.ok===true&&ack?.providerAck===true&&str(ack?.entityId),'PERSISTENCE_FAILURE','VRM221_FIXTURE_CREATE_ACK_'+f.key,{ack});
    const replay=await exactReplay('shopper.create');
    need(replay?.ok===true&&replay?.providerAck===true&&replay?.idempotentReplay===true&&Number(replay?.providerWrites||0)===0,'PERSISTENCE_FAILURE','VRM221_FIXTURE_CREATE_REPLAY_'+f.key,{replay});
    created.push({key:f.key,id:str(ack.entityId),name:f.firstName+' '+f.lastName});
  }

  const byKey=Object.fromEntries(created.map(x=>[x.key,x]));
  const reviewPairs=[
    {id:'qa_vrm221_merge_'+RUN,ids:[byKey.mergeA.id,byKey.mergeB.id],reason:'qa_vrm221_merge_review'},
    {id:'qa_vrm221_distinct_'+RUN,ids:[byKey.distinctA.id,byKey.distinctB.id],reason:'qa_vrm221_distinct_review'}
  ];
  for(const p of reviewPairs){
    reviewDocIds.push(p.id);
    await tenant.collection('shopperIdentityReviews').doc(p.id).set({schemaVersion:'cxorbia.shopper-identity-review.v1',reviewId:p.id,tenantId:TENANT,projectScope:PROGRAM,periodIndependent:true,shopperIds:p.ids,candidateShopperIds:p.ids,sourceShopperId:p.ids[0],canonicalShopperId:null,country:'GT',reason:p.reason,credentialFingerprint:null,evidenceFingerprint:sha(p.id).slice(0,40),sourceRevision:EXPECTED_HR,status:'active',requiresHumanAdjudication:true,fuzzyMatching:false,qaFixture:true,hrWrites:0,externalWrites:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},{merge:false});
  }
  await refresh();
  await page.evaluate(()=>window.CX.router.nav('shoppers'));
  await page.waitForSelector('#shBody [data-sid]',{timeout:30000});
  const loaded=await page.evaluate(ids=>ids.every(id=>!!window.CX.data.getShopper(id)),created.map(x=>x.id));
  need(loaded,'MAPPING_FAILURE','VRM221_SYNTHETIC_PROFILES_NOT_COMPOSED');

  const reviewMeta=await page.evaluate(()=>({queue:Array.isArray(window.CX.data.__identityReviewQueue)?window.CX.data.__identityReviewQueue:[],kpiText:String(document.querySelector('#shTopKpis [data-tk="review"]')?.innerText||'')}));
  const queueIds=new Set(reviewMeta.queue.flatMap(x=>[x?.shopperId,x?.sourceShopperId,x?.canonicalShopperId,...(Array.isArray(x?.shopperIds)?x.shopperIds:[]),...(Array.isArray(x?.candidateShopperIds)?x.candidateShopperIds:[])]).map(str).filter(Boolean));
  need([byKey.mergeA.id,byKey.mergeB.id,byKey.distinctA.id,byKey.distinctB.id].every(id=>queueIds.has(id)),'MAPPING_FAILURE','VRM221_DURABLE_REVIEW_QUEUE_NOT_COMPOSED',{queueCount:reviewMeta.queue.length});
  await page.locator('#shTopKpis [data-tk="review"]').click();
  await page.waitForTimeout(300);
  const filterRows=await page.evaluate(()=>[...document.querySelectorAll('#shBody [data-sid]')].map(x=>({id:String(x.dataset.sid),review:String(x.dataset.identityReview)})));
  need(filterRows.length>0&&filterRows.every(x=>x.review==='required'),'FUNCTIONAL_DEFECT','VRM221_REVIEW_FILTER_NOT_EXCLUSIVE',{filterRows});
  need([byKey.mergeA.id,byKey.mergeB.id,byKey.distinctA.id,byKey.distinctB.id].every(id=>filterRows.some(x=>x.id===id)),'FUNCTIONAL_DEFECT','VRM221_REVIEW_FILTER_MISSING_FIXTURES');
  result.filter={queueCount:reviewMeta.queue.length,renderedFilteredRows:filterRows.length,labelPresent:/Requieren revisión \/ decisión/.test(reviewMeta.kpiText),pass:true};

  await page.fill('#shSearch','Vrmmerge');
  await page.waitForTimeout(150);
  const searched=await page.evaluate(()=>[...document.querySelectorAll('#shBody [data-sid]')].map(x=>String(x.dataset.sid)));
  need(searched.includes(byKey.mergeA.id)&&searched.includes(byKey.mergeB.id)&&searched.length===2,'FUNCTIONAL_DEFECT','VRM221_SEARCH_FILTER_STATE_FAILED',{searched});
  result.selection.searchPreserved=true;

  await selectRows([byKey.mergeA.id,byKey.mergeB.id]);
  result.selection.multiSelect=true;
  await page.click('#shBulkMerge');
  await page.waitForSelector('#bulkMergeCommit',{timeout:10000});
  await page.selectOption('#bulkCanonical',byKey.mergeA.id);
  await page.check('#bulkMergeConfirm');
  await page.click('#bulkMergeCommit');
  await page.waitForFunction(()=>{const a=(window.__vrm221Traffic||[]).filter(x=>x.command?.commandType==='shopper.identity.adjudicate');return a.length&&a[a.length-1].response?.providerAck===true;},null,{timeout:120000});
  const mergeTraffic=await capture('shopper.identity.adjudicate');
  need(mergeTraffic?.response?.ok===true&&mergeTraffic?.response?.providerAck===true&&mergeTraffic?.response?.identityConsolidated===true,'PERSISTENCE_FAILURE','VRM221_MERGE_UI_ACK',{mergeTraffic});
  const mergeReplay=await exactReplay('shopper.identity.adjudicate');
  need(mergeReplay?.ok===true&&mergeReplay?.providerAck===true&&mergeReplay?.idempotentReplay===true&&Number(mergeReplay?.providerWrites||0)===0,'PERSISTENCE_FAILURE','VRM221_MERGE_EXACT_REPLAY',{mergeReplay});
  const mergeA=await readProfile(byKey.mergeA.id),mergeB=await readProfile(byKey.mergeB.id);
  need(mergeA&&String(mergeA.identityState||'')!=='superseded_exact_alias'&&mergeB?.identityState==='superseded_exact_alias'&&str(mergeB.supersededByShopperId)===byKey.mergeA.id,'PERSISTENCE_FAILURE','VRM221_MERGE_DURABLE_READBACK');
  result.merge={providerAck:true,idempotentReplay:true,durableReadback:true,retiredPrincipalCount:Number(mergeTraffic.response.retiredPrincipalCount||0),resolvedIdentityReviews:Number(mergeTraffic.response.resolvedIdentityReviews||0)};

  await refresh();await page.evaluate(()=>window.CX.router.nav('shoppers'));await page.waitForSelector('#shBody [data-sid]',{timeout:30000});
  await page.fill('#shSearch','Vrmdist');await page.waitForTimeout(150);
  await selectRows([byKey.distinctA.id,byKey.distinctB.id]);
  await page.click('#shBulkDistinct');await page.waitForSelector('#bulkDistinctCommit',{timeout:10000});
  await page.fill('#bulkDistinctReason','QA exact Admin decision: personas distintas');
  await page.fill('#bulkDistinctEvidence','Fixture controlado VRM-221, identidades técnicas distintas');
  await page.check('#bulkDistinctConfirm');await page.click('#bulkDistinctCommit');
  await page.waitForFunction(()=>{const a=(window.__vrm221Traffic||[]).filter(x=>x.command?.commandType==='shopper.identity.review.resolve');return a.length&&a[a.length-1].response?.providerAck===true;},null,{timeout:120000});
  const distinctTraffic=await capture('shopper.identity.review.resolve');
  need(distinctTraffic?.response?.ok===true&&distinctTraffic?.response?.providerAck===true&&distinctTraffic?.response?.identityReviewResolved===true&&distinctTraffic?.response?.identityRemap===false,'PERSISTENCE_FAILURE','VRM221_DISTINCT_UI_ACK',{distinctTraffic});
  const distinctReplay=await exactReplay('shopper.identity.review.resolve');
  need(distinctReplay?.ok===true&&distinctReplay?.providerAck===true&&distinctReplay?.idempotentReplay===true&&Number(distinctReplay?.providerWrites||0)===0,'PERSISTENCE_FAILURE','VRM221_DISTINCT_EXACT_REPLAY',{distinctReplay});
  const distinctReview=await tenant.collection('shopperIdentityReviews').doc('qa_vrm221_distinct_'+RUN).get();
  need(distinctReview.exists&&str((distinctReview.data()||{}).status)==='resolved_distinct','PERSISTENCE_FAILURE','VRM221_DISTINCT_DURABLE_READBACK');
  result.distinct={providerAck:true,idempotentReplay:true,durableReadback:true,identityRemap:false};

  await refresh();await page.evaluate(()=>window.CX.router.nav('shoppers'));await page.waitForSelector('#shBody [data-sid]',{timeout:30000});
  await page.fill('#shSearch','Vrmdelete');await page.waitForTimeout(150);await selectRows([byKey.deleteA.id]);
  await page.click('#shBulkDelete');await page.waitForSelector('#bulkDeleteCommit',{timeout:10000});await page.fill('#bulkDeleteReason','QA VRM-221 safe retire success');await page.check('#bulkDeleteConfirm');await page.click('#bulkDeleteCommit');
  await page.waitForFunction(()=>{const a=(window.__vrm221Traffic||[]).filter(x=>x.command?.commandType==='shopper.delete');return a.length&&a[a.length-1].response?.providerAck===true;},null,{timeout:120000});
  const deleteTraffic=await capture('shopper.delete');
  need(deleteTraffic?.response?.ok===true&&deleteTraffic?.response?.providerAck===true&&deleteTraffic?.response?.shopperRetired===true,'PERSISTENCE_FAILURE','VRM221_DELETE_UI_ACK',{deleteTraffic});
  const deleteReplay=await exactReplay('shopper.delete');
  need(deleteReplay?.ok===true&&deleteReplay?.providerAck===true&&deleteReplay?.idempotentReplay===true&&Number(deleteReplay?.providerWrites||0)===0,'PERSISTENCE_FAILURE','VRM221_DELETE_EXACT_REPLAY',{deleteReplay});
  const deletedProfile=await readProfile(byKey.deleteA.id);
  const tomb=await tenant.collection('shopperTombstones').doc(byKey.deleteA.id).get();
  need(deletedProfile?.identityState==='retired_by_admin'&&tomb.exists,'PERSISTENCE_FAILURE','VRM221_DELETE_DURABLE_READBACK');
  result.safeDelete={providerAck:true,idempotentReplay:true,durableReadback:true,deletedFromActiveReadModel:true,physicalDelete:false};

  await refresh();await page.evaluate(()=>window.CX.router.nav('shoppers'));await page.waitForSelector('#shBody [data-sid]',{timeout:30000});
  const realId=await page.evaluate(hrIds=>{for(const id of hrIds){const s=window.CX.data.getShopper(id);if(s&&document.querySelector('#shBody [data-sid="'+CSS.escape(id)+'"]'))return id;}return '';},hrIds);
  need(realId,'MAPPING_FAILURE','VRM221_NO_CURRENT_HR_PROFILE_FOR_DELETE_BLOCK');
  await selectRows([realId]);await page.click('#shBulkDelete');await page.waitForSelector('#bulkDeleteCommit',{timeout:10000});await page.fill('#bulkDeleteReason','QA VRM-221 verify HR-authoritative delete block');await page.check('#bulkDeleteConfirm');await page.click('#bulkDeleteCommit');
  await page.waitForFunction(()=>{const a=(window.__vrm221Traffic||[]).filter(x=>x.command?.commandType==='shopper.delete');return a.length>=2;},null,{timeout:120000});
  await page.waitForTimeout(500);
  const blockedTraffic=await capture('shopper.delete');
  const realAfter=await readProfile(realId);
  need(blockedTraffic?.response?.providerAck!==true&&realAfter&&realAfter.identityState!=='retired_by_admin','FUNCTIONAL_DEFECT','VRM221_DELETE_HR_BLOCK_FAILED',{blockedTraffic});
  const blockedUi=await page.evaluate(()=>String(document.body.innerText||'').includes('No se puede eliminar este perfil')||String(document.body.innerText||'').includes('SHOPPER_DELETE_UNSAFE_DEPENDENCIES'));
  need(blockedUi,'FUNCTIONAL_DEFECT','VRM221_DELETE_BLOCK_CAUSE_NOT_VISIBLE');
  result.blockedDelete={currentHrProfilePreserved:true,explicitUiBlock:true,providerAck:false};

  need(pageErrors.length===0,'FUNCTIONAL_DEFECT','VRM221_BROWSER_PAGE_ERRORS',{pageErrors});
  result.providerAck=true;result.idempotentReplay=true;result.durableReadback=true;result.decision='PASS_VRM221_ADMIN_LIVE_E2E';result.hrRevision=hrRevision;
}finally{
  try{await cleanup();}catch(_){}
  try{if(ctx)await ctx.close();}catch(_){}
  try{if(browser)await browser.close();}catch(_){}
  save();
}
need(result.cleanup?.attempted===true&&!result.cleanup?.error,'PERSISTENCE_FAILURE','VRM221_QA_CLEANUP_FAILED',{cleanup:result.cleanup});
console.log(JSON.stringify(result,null,2));
