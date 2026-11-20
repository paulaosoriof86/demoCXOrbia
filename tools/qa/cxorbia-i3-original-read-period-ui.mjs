import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {applicationDefault,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const root='https://cxorbia-backend-dev.web.app', api='/api/tenants/tya/projects/cinepolis/hr-live';
const source=process.env.FOCAL_SOURCE,period='cinepolis-2026-11',oct='cinepolis-2026-10';
const expectations=JSON.parse(fs.readFileSync('docs/checkpoints/CXORBIA_I3_B14_ORIGINAL_SERVICE_QA_AND_APPLICATION_SCOPE_20261120.json','utf8'));
const result={decision:'HOLD',source,iteration:'I3',origin:'authenticated Chromium in DEV',appReads:[],reloads:[],errors:[],hrWrites:0,production:false};
const hash=v=>createHash('sha256').update(v).digest('hex');
const check=(v,code)=>{if(!v)throw Error(code)};
const out='.tmp/i3-original-browser';
fs.mkdirSync(out,{recursive:true});
let browser;
try {
 for (const file of ['app/core/router.js','app/adapters/tya-live-source-inplace-apply.js']) {
   const response=await fetch(root+'/'+file.slice(4)+'?check='+Date.now(),{cache:'no-store'});
   check(response.ok && hash(await response.text())===hash(execFileSync('git',['show',source+':'+file])),'SOURCE_FAILURE:SERVED_UI');
 }
 const meta=await (await fetch(root+api+'?format=meta&check='+Date.now(),{cache:'no-store'})).json();
 check(meta.sourceSafe===true && /^[a-f0-9]{64}$/.test(meta.revision),'SOURCE_FAILURE:HR_REVISION');
 result.servedHrRevision=meta.revision;
 const app=initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'}),db=getFirestore(app),auth=getAuth(app);
 const users=(await db.collection('tenants/tya/users').get()).docs.map(d=>({...d.data(),uid:d.id})).filter(m=>m.active===true);
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 browser=await chromium.launch({headless:true});
 async function session(member){
   const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
   const url=root+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxTechnicalAuthE2E=YES_PAULA_20260801_REAL_USERS_E2E';
   await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.firebase?.apps?.length>0);
   const token=await auth.createCustomToken(member.uid);
   await page.evaluate(async jwt=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(jwt)},token);
   await page.reload({waitUntil:'domcontentloaded'});
   const ready=async()=>page.waitForFunction(({id,rev})=>firebase.auth().currentUser?.uid===id&&CX?.backendAuth?.context?.().authenticated===true&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&CX?.data?.previewMeta?.sourceRevision===rev,{id:member.uid,rev:meta.revision},{timeout:100000});
   await ready();return {context,page,ready};
 }
 const receiptAction=async(label,fn)=>{try{await fn()}catch(e){const raw=String(e.message||'');result.errors.push({label,reason:/^[A-Z_]+:[A-Z0-9_]+$/.test(raw)?raw:(e.name==='TimeoutError'?'BROWSER_WAIT_TIMEOUT':'RUNTIME_ERROR')})}};
 await receiptAction('B14_ADMIN',async()=>{
  const staff=users.find(m=>m.authNamespace==='staff'&&['admin','super'].includes(m.role)&&(m.role==='super'||m.projectIds?.includes('cinepolis')));
  check(staff,'AUTH_FAILURE:ADMIN_NOT_AVAILABLE');
  const {page,context}=await session(staff);
  try{
   for(const country of expectations.countries){
    const read=await page.evaluate(async({api,country,period})=>{
     const bearer=await firebase.auth().currentUser.getIdToken();
     const start=new Date().toISOString();
     const response=await fetch(api+'?'+new URLSearchParams({format:'b14-provider-meta',countryCode:country,periodId:period}),{cache:'no-store',headers:{Authorization:'Bearer '+bearer}});
     const p=await response.json();
     return {http:response.status,start,end:new Date().toISOString(),country:p.countryCode,period:p.periodId,purpose:p.bindingPurpose,revision:p.sourceRevision,worksheets:p.worksheetCount,readSha:p.worksheetProofs?.[0]?.sourceContentSha256,rows:p.worksheetProofs?.[0]?.rowsReturned,equalIndependentReads:p.externalRevisionIndependentlyVerified,privateRowsExposed:!!(p.privateProviderRows||p.privateRows||p.values1||p.values2),reason:typeof p.error==='string'?p.error.slice(0,90):undefined,hrWrites:p.hrWrites};
    },{api,country:country.country,period});
    result.appReads.push({...read,expectedCountry:country.country});
    check(read.http===200&&read.purpose==='original_readback'&&read.country===country.country&&read.period===period&&read.readSha===country.contentSha256&&read.equalIndependentReads===true&&read.rows===140&&read.privateRowsExposed===false&&[0,false].includes(read.hrWrites),'MAPPING_FAILURE:APP_ORIGINAL_READ');
   }
  }finally{await context.close()}
 });
 const cases=[{country:'GT',login:'jennypher.murga',tests:[['GT11','visitas'],['GT12','mireportes']]},{country:'HN',login:'rocio.vilca',tests:[['HN06','mireportes']]}];
 for(const subject of cases)await receiptAction('SESSION_'+subject.country,async()=>{
  const choices=users.filter(m=>m.role==='shopper'&&m.authNamespace==='shopper'&&m.projectIds?.includes('cinepolis')&&norm(m.visibleLogin||m.username||m.user)===subject.login);
  check(choices.length===1,'AUTH_FAILURE:SHOPPER_UNIQUE');const member=choices[0],account=await auth.getUser(member.uid);
  check(account.disabled===false&&account.customClaims?.shopperId===member.shopperId,'AUTH_FAILURE:SHOPPER_SCOPE');
  const profile=(await db.doc('tenants/tya/shoppers/'+member.shopperId).get()).data()||{};
  check([subject.country,subject.country==='GT'?'GUATEMALA':'HONDURAS'].includes(String(profile.pais||profile.country||'').toUpperCase()),'MAPPING_FAILURE:SHOPPER_COUNTRY');
  const {page,context,ready}=await session(member);
  try{
   for(const [id,view] of subject.tests)await receiptAction(id,async()=>{
    const selector=page.locator('#periodSel');
    await selector.selectOption(period);
    await page.evaluate(view=>CX.router.nav(view,{history:false}),view);
    await page.waitForFunction(v=>CX?.session?.view===v&&document.querySelector('#view')?.textContent?.trim(),view);
    const capture=async()=>page.evaluate(({view})=>({period:document.querySelector('#periodSel')?.value,view:CX.session.view,periodInData:CX.data.currentPeriodId,count:view==='visitas'?document.querySelectorAll('#vList [data-detail]').length:null,
      reportMonth:view==='mireportes'?/oct(?:ubre)?\.?\s*2026/i.test(document.querySelector('#view')?.innerText||''):null,owner:CX.backendAuth.context().shopperId}),{view});
    const before=await capture();await selector.selectOption(oct);
    await page.waitForFunction(({v,target})=>CX.data.currentPeriodId===target && document.querySelector('#periodSel')?.value===target && CX.session.view===v && (v==='visitas'?document.querySelector('#vList'):/oct(?:ubre)?\.?\s*2026/i.test(document.querySelector('#view')?.innerText||'')),{v:view,target:oct},{timeout:16000});
    const selected=await capture();await page.reload({waitUntil:'domcontentloaded'});await ready();await selector.waitFor({timeout:14000});
    try{await page.waitForFunction(({v,target})=>CX.session.view===v&&CX.data.currentPeriodId===target&&document.querySelector('#periodSel')?.value===target,{v:view,target:oct},{timeout:8000})}catch{}
    const after=await capture();
    const ownerOk=[before,selected,after].every(x=>x.owner===member.shopperId);
    const pass=ownerOk&&selected.period===oct&&after.period===oct&&after.periodInData===oct&&after.view===view&&
      (view==='visitas'?selected.count>0&&before.count!==selected.count&&after.count===selected.count:after.reportMonth&&selected.reportMonth);
    for(const x of [before,selected,after])delete x.owner;
    result.reloads.push({id,country:subject.country,view,ownerOk,before,selected,after,pass});
    await selector.screenshot({path:out+'/'+id+'.png'});
    check(pass,'PERSISTENCE_FAILURE:PERIOD_OR_VIEW');
   });
  }finally{await context.close()}
 });
 if(result.errors.length===0&&result.appReads.length===2&&result.reloads.length===3&&result.reloads.every(x=>x.pass))result.decision='PASS_B14_APP_READ_AND_THREE_SCOPED_RELOADS';
} catch(e){result.errors.push({label:'bootstrap',reason:(String(e.message||'').match(/^[A-Z_]+:[A-Z0-9_]+$/)||[])[0]||'RUNTIME_ERROR'});}
finally{await browser?.close().catch(()=>{});fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(result.decision==='HOLD')process.exitCode=1;}
