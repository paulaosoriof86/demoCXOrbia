#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
const OUT=String(process.env.PREI4_004_LIVE_OUT||'.tmp/prei4-admin-004-live');
const ROOT=String(process.env.PREI4_004_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const SOURCE=String(process.env.PREI4_004_SOURCE||''),TREE=String(process.env.PREI4_004_TREE||''),EXPECTED_HR=String(process.env.PREI4_004_HR_REVISION||'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),fp=v=>sha(v).slice(0,16);
const write=(n,v)=>fs.writeFileSync(OUT+'/'+n,JSON.stringify(v,null,2)+'\n'),fail=m=>{throw new Error(m);};
fs.mkdirSync(OUT,{recursive:true});
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{40}$/.test(TREE)||!/^[a-f0-9]{64}$/.test(EXPECTED_HR))fail('ENVIRONMENT_FAILURE:PREI4_004_LIVE_ENV');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const ps=await project.get();if(!ps.exists)fail('PERSISTENCE_FAILURE:PREI4_004_PROJECT_MISSING');const pc=ps.data()||{};
if(Number(pc?.honorario?.GT)!==60||Number(pc?.honorario?.HN)!==200)fail('PERSISTENCE_FAILURE:PREI4_004_PROJECT_COUNTRY_FINANCE_CONFIG');
const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?fresh=1&prei4004live='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrRes.ok)fail('PROVIDER_FAILURE:PREI4_004_HR_HTTP_'+hrRes.status);
const hb=await hrRes.json(),hr=hb?.snapshot||hb?.data||hb,rt=hb?._runtime||hr?._runtime||{},rev=str(rt.revision||hr.revision||hr.sourceRevision),refreshError=rt.refreshError??rt.lastRefreshError??hr.refreshError??hr.lastRefreshError??null;
if(rev!==EXPECTED_HR||refreshError!==null||hr.sourceSafe!==true||hr.production!==false)fail('SOURCE_FAILURE:PREI4_004_HR_AUTHORITY');
const sep=arr(hr.visits).filter(v=>str(v.periodKey)==='2026-09'),gt=sep.filter(v=>str(v.pais||v.country)==='GT').length,hn=sep.filter(v=>str(v.pais||v.country)==='HN').length;
if(sep.length!==44||gt!==34||hn!==10)fail('MAPPING_FAILURE:PREI4_004_HR_COUNTS');
let admin=null,pageToken;
for(let p=0;p<10&&!admin;p++){const lu=await auth.listUsers(1000,pageToken);for(const u of lu.users){const c=u.customClaims||{},role=str(c.role).toLowerCase(),ns=str(c.authNamespace).toLowerCase(),projects=arr(c.projectIds).map(str);if(str(c.tenantId)===TENANT&&ns==='staff'&&role==='admin'&&projects.includes(PROJECT)){admin={uid:u.uid,role};break;}}pageToken=lu.pageToken;if(!pageToken)break;}
if(!admin)fail('AUTH_FAILURE:PREI4_004_ADMIN_MISSING');
const submitted=sep.filter(v=>v?.canonicalFacets?.submitted===true||!!v?.submittedAt||['submitida','liquidada','pagada'].includes(str(v?.estado||v?.status).toLowerCase())).sort((a,b)=>str(a.hrRowId||a.id).localeCompare(str(b.hrRowId||b.id)));
let target=null;
for(const hv of submitted){for(const key of [...new Set([str(hv.hrRowId),str(hv.id||hv.visitId)].filter(Boolean))]){const s=await project.collection('visits').doc(key).get();if(!s.exists)continue;const d=s.data()||{},country=str(d.pais||d.country||hv.pais||hv.country),currency=str(d.currency||d.moneda||pc?.currency?.[country]||pc?.currencies?.[country]),explicit=finite(d?.hrManaged?.honorario)?Number(d.hrManaged.honorario):(finite(d.honorario)&&str(d.honorarioSource)!=='project_country_config'?Number(d.honorario):null),configured=finite(pc?.honorario?.[country])?Number(pc.honorario[country]):null,boleto=finite(d.boleto)?Number(d.boleto):null,combo=finite(d.comboAmt)?Number(d.comboAmt):null;if(country&&currency&&(explicit!==null||configured!==null)&&boleto!==null&&combo!==null&&d.reimbursementSourceComplete!==false&&d.reimbursementPartial!==true){target={ref:project.collection('visits').doc(key),docId:key,data:d,uiVisitId:str(hv.id||hv.visitId),country,currency,honorario:explicit!==null?explicit:configured,honorarioSource:explicit!==null?'hr_explicit':'project_country_config',boleto,combo};break;}}if(target)break;}
if(!target?.uiVisitId)fail('PERSISTENCE_FAILURE:PREI4_004_NO_EXACT_RECONCILABLE_VISIT');
const visitDocs=async()=> (await project.collection('visits').where('periodId','==',PERIOD).get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const recCount=v=>v.filter(x=>str(x.financialSourceStatus).toLowerCase()==='reconciled_exact'&&x.financialMatch).length;
const beforeV=await visitDocs(),beforeReconciled=recCount(beforeV),beforeLots=(await tenant.collection('paymentLots').where('periodId','==',PERIOD).get()).size,beforeMov=(await tenant.collection('financialMovements').where('periodId','==',PERIOD).get()).size;
const preExact=str(target.data.financialSourceStatus).toLowerCase()==='reconciled_exact'&&str(target.data.financialMatch?.status).toLowerCase()==='reconciled_exact';
const browser=await chromium.launch({headless:true}),URL=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
let ack=null,pre=null,post=null;
try{
 const ctx=await browser.newContext({viewport:{width:1440,height:980}}),page=await ctx.newPage();let ok=false;
 for(let a=1;a<=5&&!ok;a++){await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase.apps)&&window.firebase.apps.length>0,null,{timeout:90000});const t=await auth.createCustomToken(admin.uid);try{await page.evaluate(async x=>{const fb=window.firebase;if(!fb?.auth)throw new Error('FIREBASE_NOT_READY');await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(x);},t);}catch(e){if(!/FIREBASE_NOT_READY|firebase is not defined|Execution context was destroyed|navigation|network|timeout|interrupted/i.test(String(e?.message||e)))throw e;}await page.waitForTimeout(700*a);ok=await page.evaluate(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,admin.uid).catch(()=>false);}
 if(!ok)fail('AUTH_FAILURE:PREI4_004_ADMIN_SIGNIN');
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(({uid,rev})=>{const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},src=String(window.CX?.dataSource?.sourceRef||'');return String(window.firebase?.auth?.().currentUser?.uid||'')===uid&&c.authenticated===true&&String(c.role||'').toLowerCase()!=='shopper'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(d.previewMeta?.sourceRevision||'')===rev&&src==='hr-live-all-periods+firestore-authenticated-exact-overlay';},{uid:admin.uid,rev:EXPECTED_HR},{timeout:150000});
 await page.evaluate(()=>CX.router.nav('financiero',{history:false}));await page.waitForTimeout(1200);
 pre=await page.evaluate(id=>{const d=window.CX?.data||{},l=window.CX?.liq?.forProject?.(d)?.find?.(x=>String(x.visitaId||x.visitId||'')===id)||null,b=document.querySelector('[data-fin-reconcile="'+CSS.escape(id)+'"]');return{button:!!b,row:l?{estado:l.estado,financialSourceStatus:l.financialSourceStatus,honorario:l.honorario,total:l.total,reviewRequired:l.reviewRequired}:null,sourceRevision:String(d.previewMeta?.sourceRevision||'')};},target.uiVisitId);
 if(pre.sourceRevision!==EXPECTED_HR||!pre.row)fail('FUNCTIONAL_DEFECT:PREI4_004_FINANCE_ROW_MISSING:'+JSON.stringify(pre));
 if(!preExact){if(!pre.button)fail('FUNCTIONAL_DEFECT:PREI4_004_RECONCILE_UI_MISSING:'+JSON.stringify(pre));ack=await page.evaluate(async id=>window.CX.data.reconcileFinanceVisit(id,{ackAware:true,reason:'admin004-live-proof'}),target.uiVisitId);if(!(ack?.ok===true&&ack?.status==='committed'&&ack?.providerAck===true&&ack?.successUiAllowed===true&&ack?.externalPaymentConfirmed===false&&Number(ack?.externalPaymentWrites||0)===0&&Number(ack?.bankWrites||0)===0))fail('FUNCTIONAL_DEFECT:PREI4_004_RECONCILE_ACK:'+JSON.stringify(ack));await page.evaluate(async()=>{if(window.CX?.backend?.refresh)await window.CX.backend.refresh();});await page.waitForFunction(rev=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&String(window.CX?.dataSource?.sourceRef||'')==='hr-live-all-periods+firestore-authenticated-exact-overlay'&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev,EXPECTED_HR,{timeout:150000});}
 post=await page.evaluate(id=>{const d=window.CX?.data||{},l=window.CX?.liq?.forProject?.(d)?.find?.(x=>String(x.visitaId||x.visitId||'')===id)||null;return{row:l?{estado:l.estado,financialSourceStatus:l.financialSourceStatus,honorario:l.honorario,total:l.total,reviewRequired:l.reviewRequired,paymentState:l.paymentState}:null,sourceRevision:String(d.previewMeta?.sourceRevision||'')};},target.uiVisitId);
 await ctx.close();
}finally{await browser.close();}
const as=await target.ref.get();if(!as.exists)fail('PERSISTENCE_FAILURE:PREI4_004_TARGET_DISAPPEARED');const ad=as.data()||{},m=ad.financialMatch||{};
if(str(ad.financialSourceStatus).toLowerCase()!=='reconciled_exact'||str(m.status).toLowerCase()!=='reconciled_exact')fail('PERSISTENCE_FAILURE:PREI4_004_FINANCIAL_MATCH_MISSING');
if(Number(m.honorario)!==target.honorario||str(m.honorarioSource)!==target.honorarioSource||Number(m.boleto)!==target.boleto||Number(m.combo)!==target.combo||Number(m.total)!==target.honorario+target.boleto+target.combo)fail('MAPPING_FAILURE:PREI4_004_FINANCIAL_MATCH_AMOUNT');
if(m.externalPaymentConfirmed!==false||m.paymentSourceRef!==null)fail('PERSISTENCE_FAILURE:PREI4_004_FINANCIAL_MATCH_AUTHORITY');
if(!preExact&&str(m.sourceRevision)!==EXPECTED_HR)fail('PERSISTENCE_FAILURE:PREI4_004_FINANCIAL_MATCH_CURRENT_REVISION');
if(preExact&&!/^[a-f0-9]{64}$/.test(str(m.sourceRevision)))fail('PERSISTENCE_FAILURE:PREI4_004_FINANCIAL_MATCH_HISTORICAL_REVISION');
const afterReconciled=recCount(await visitDocs()),afterLots=(await tenant.collection('paymentLots').where('periodId','==',PERIOD).get()).size,afterMov=(await tenant.collection('financialMovements').where('periodId','==',PERIOD).get()).size;
if(afterLots!==beforeLots||afterMov!==beforeMov)fail('PERSISTENCE_FAILURE:PREI4_004_RECONCILE_CREATED_PAYMENT_SIDE_EFFECT');
if((!preExact&&afterReconciled!==beforeReconciled+1)||(preExact&&afterReconciled!==beforeReconciled))fail('PERSISTENCE_FAILURE:PREI4_004_RECONCILED_COUNT');
if(post?.sourceRevision!==EXPECTED_HR||post?.row?.financialSourceStatus!=='reconciled_exact'||post?.row?.reviewRequired===true)fail('FUNCTIONAL_DEFECT:PREI4_004_BROWSER_POST_RECONCILE:'+JSON.stringify(post));
const result={schemaVersion:'cxorbia.prei4.admin004.cumulative-live.v1',decision:'PASS_PREI4_ADMIN_004_CUMULATIVE_LIVE',sourceSha:SOURCE,sourceTree:TREE,hrRevision:EXPECTED_HR,hr:{september:44,GT:34,HN:10},projectFinanceConfig:{GT:Number(pc.honorario.GT),HN:Number(pc.honorario.HN)},target:{visitFp:fp(target.uiVisitId),durableFp:fp(target.docId),country:target.country,currency:target.currency,honorario:m.honorario,honorarioSource:m.honorarioSource,reembolso:m.reembolso,total:m.total,sourceRevision:m.sourceRevision},browser:{pre,post,reconciliationExecuted:!preExact},providerAck:ack?{ok:ack.ok,status:ack.status,providerAck:ack.providerAck,providerWrites:ack.providerWrites,externalPaymentConfirmed:ack.externalPaymentConfirmed,externalPaymentWrites:ack.externalPaymentWrites,bankWrites:ack.bankWrites}:{preexistingExact:true},durable:{beforeReconciled,afterReconciled,beforeLots,afterLots,beforeMovements:beforeMov,afterMovements:afterMov},externalPaymentExecuted:false,externalPaymentWrites:0,bankWrites:0,hrWrites:0,production:false};
write('result.json',result);console.log(JSON.stringify(result,null,2));
