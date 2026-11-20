#!/usr/bin/env node
/* I3/B11 — scoped, authenticated DEV-only Chromium readback.
   Exactly the served Dashboard+MiDia owner bytes, current independent HR revision,
   GT/HN total-stage click keysets and MiDia realized KPI. No provider writes. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
const ROOT='https://cxorbia-backend-dev.web.app';
const SOURCE=String(process.env.FOCAL_SOURCE||'');
const REVISION=String(process.env.EXPECTED_HR_REVISION||'');
const PERIOD=String(process.env.EXPECTED_PERIOD_ID||'cinepolis-2026-11');
const crossSurface=process.env.B11_CROSS_SURFACE==='true';
const OUT=String(process.env.B11_STAGE_OUT||'.tmp/i3-b11-stage');
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const result={decision:'HOLD_B11_STAGE_CURRENT_HR',sourceSha:SOURCE,expectedHrRevision:REVISION,periodId:PERIOD,
  tenantId:'tya',projectId:'cinepolis',role:'admin',sourceRead:'independent_hr_live',owners:[],
  countries:[],midia:null,production:false,providerWrites:0,firestoreWrites:0,authWrites:0,hrWrites:0,pageErrors:[]};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
const assert=(ok,reason)=>{if(!ok)throw new Error(reason)};
const get=async path=>{const r=await fetch(ROOT+path,{headers:{'Cache-Control':'no-cache, no-store'},cache:'no-store'});assert(r.ok,'ENVIRONMENT_FAILURE:REMOTE_GET_'+r.status);return r;};
let browser=null;
try{
  assert(/^[a-f0-9]{40}$/.test(SOURCE)&&/^[a-f0-9]{64}$/.test(REVISION)&&/^cinepolis-20\d{2}-(0[1-9]|1[0-2])$/.test(PERIOD),'SOURCE_FAILURE:B11_PIN_INVALID');
  for(const name of (crossSurface ? ['visitas.js','operacion-extra.js'] : ['dashboard.js','midia.js'])){
    const file='app/modules/'+name,src=execFileSync('git',['show',SOURCE+':'+file],{encoding:'utf8',maxBuffer:200000});
    const http=await get('/modules/'+name+'?b11owner='+Date.now());
    const served=await http.text();
    assert(hash(src)===hash(served),'RELEASE_COMPOSITION_FAILURE:B11_SERVED_OWNER_BYTE_DRIFT:'+name);
    result.owners.push({path:file,sourceSha256:hash(src),servedSha256:hash(served),byteParity:true});
  }
  const hr=await (await get('/api/tya/cinepolis/hr-live?format=json&b11source='+Date.now())).json();
  const snapshot=hr?.snapshot||hr?.data||hr,actualRev=String(hr?._runtime?.revision||snapshot?._runtime?.revision||'');
  assert(snapshot?.sourceSafe===true&&arr(snapshot.visits).length>0,'SOURCE_FAILURE:B11_EXTERNAL_HR_SNAPSHOT_INVALID');
  assert(actualRev===REVISION,'RELEASE_COMPOSITION_FAILURE:B11_HR_REVISION_DRIFT');
  const active=arr(snapshot.visits).filter(v=>str(v.periodId||'')===PERIOD||str(v.periodKey||'')===PERIOD.replace('cinepolis-','')).filter(v=>v?._archived!==true);
  assert(active.length>0,'SOURCE_FAILURE:B11_ACTIVE_VISITS_EMPTY');
  const expectedCountry=code=>active.filter(v=>str(v.country||v.pais)===code);
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
  const db=getFirestore(),auth=getAuth(),tenant=db.collection('tenants').doc('tya');
  const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...d.data()}));
  let staff=null;
  for(const m of members.filter(m=>m.active===true&&m.authNamespace==='staff'&&['admin','super'].includes(m.role))){
    if(m.role!=='super'&&!arr(m.projectIds).includes('cinepolis'))continue;
    try{const a=await auth.getUser(m.id),c=a.customClaims||{};if(!a.disabled&&c.tenantId==='tya'&&c.authNamespace==='staff'&&['admin','super'].includes(c.role)){staff=m;break}}catch{}
  }
  assert(staff,'AUTH_FAILURE:B11_EXACT_ADMIN_NOT_AVAILABLE');
  let token=await auth.createCustomToken(staff.id);
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();page.on('pageerror',e=>result.pageErrors.push(str(e.message).slice(0,160)));
  await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxTechnicalAuthE2E=YES_PAULA_20260801_REAL_USERS_E2E',{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(t);},token);
  token='';await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(rev=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX?.backendAuth?.context?.().authenticated===true&&window.CX?.data?.previewMeta?.sourceRevision===rev,REVISION,{timeout:120000});
  if (crossSurface) {
    await page.evaluate(() => window.CX.router.nav('visitas', {history: false}));
    await page.locator('#vBody tr[data-vid]').first().waitFor();
    for (const country of ['GT', 'HN']) {
      const expected = expectedCountry(country).map(v => str(v.id || v.visitId)).sort();
      assert(expected.length > 0 && expected.every(Boolean) && new Set(expected).size === expected.length, 'SOURCE_FAILURE:EXTERNAL_VISIT_KEYS');
      await page.locator('#vPais').selectOption(country);
      const actual = await page.locator('#vBody tr[data-vid]:visible').evaluateAll(rows => rows.map(row => row.dataset.vid).sort());
      const keysMatch = JSON.stringify(expected) === JSON.stringify(actual);
      result.countries.push({country, expected: expected.length, observed: actual.length, expectedKeyHash: hash(expected), observedKeyHash: hash(actual), keysMatch});
      assert(keysMatch, 'FUNCTIONAL_DEFECT:VISITS_KEYS_DIFFER_' + country);
    }
    await page.evaluate(() => window.CX.router.nav('informes', {history: false}));
    await page.locator('#view [data-rep="cobertura"]').click();
    const table = page.locator('#rptBody table').filter({has: page.getByRole('columnheader', {name:'Cobertura', exact:true})});
    await table.waitFor();
    const coverage = await table.evaluate(el => {
      const labels = [...el.querySelectorAll('thead th')].map(th => th.textContent.trim());
      return [...el.querySelectorAll('tbody tr')].map(row => Object.fromEntries([...row.querySelectorAll('td')].map((cell, i) => [labels[i],cell.textContent.trim()])));
    });
    result.coverage = [];
    assert(coverage.length === result.countries.length, 'FUNCTIONAL_DEFECT:REPORT_COUNTRY_ROWS');
    for (const {country} of result.countries) {
      const eligible = expectedCountry(country).filter(v => v.canonicalFacets?.cancelled !== true);
      const expectedRealized = eligible.filter(v => v.canonicalFacets?.realized === true).length;
      const match = coverage.filter(row => row['País'] === country);
      assert(match.length === 1, 'FUNCTIONAL_DEFECT:REPORT_COUNTRY_KEY_' + country);
      const row = match[0];
      const expectedCoverage = Math.round(100 * expectedRealized / Math.max(1,eligible.length)) + '%';
      const pass = row.Total === String(eligible.length) && row.Realizadas === String(expectedRealized) && row.Cobertura === expectedCoverage;
      result.coverage.push({country, expectedTotal:eligible.length, observedTotal:row.Total, expectedRealized, observedRealized:row.Realizadas, expectedCoverage, observedCoverage:row.Cobertura, pass});
      assert(pass, 'FUNCTIONAL_DEFECT:REPORT_COVERAGE_' + country);
    }
    const reportRevision = await page.evaluate(() => window.CX.data.previewMeta.sourceRevision);
    assert(reportRevision === REVISION, 'RELEASE_COMPOSITION_FAILURE:REPORT_REVISION');
  } else {
    await page.evaluate(()=>{window.CX.session._dashAll=false;window.CX.router.nav('dashboard',{history:false});});
    await page.locator('#view [data-fase]').first().waitFor({timeout:35000});
    await page.waitForTimeout(250);
    for(const country of ['GT','HN']){
      const ex=expectedCountry(country),ids=ex.map(v=>str(v.id||v.visitId)).filter(Boolean).sort();
      assert(ids.length===ex.length&&new Set(ids).size===ids.length,'SOURCE_FAILURE:B11_EXTERNAL_IDS_NOT_STABLE');
      const tile=page.locator('#view [data-fase="'+country+'|total"]').first();
      assert(await tile.count()===1,'VISUAL_DEFECT:B11_STAGE_TILE_MISSING:'+country);
      const n=Number((await tile.locator('div').first().innerText()).trim());
      assert(Number.isSafeInteger(n)&&n===ex.length,'FUNCTIONAL_DEFECT:B11_DASHBOARD_TOTAL_STAGE_MISMATCH:'+country);
      await tile.click({timeout:12000});
      await page.locator('.cx-ov:visible #drBody').waitFor({timeout:30000});
      const got=await page.locator('.cx-ov:visible #drBody tr[data-vrow]').evaluateAll(nodes=>nodes.map(n=>String(n.dataset.vrow)));
      if(ex.length<=40)assert(JSON.stringify(got.slice().sort())===JSON.stringify(ids),'FUNCTIONAL_DEFECT:B11_STAGE_VISIT_ID_SET_MISMATCH:'+country);
      assert(got.length===Math.min(ex.length,40),'FUNCTIONAL_DEFECT:B11_STAGE_MODAL_COUNT_MISMATCH:'+country);
      result.countries.push({country,externalVisits:ex.length,tileCount:n,modalRows:got.length,
        keysetExact:ex.length<=40,expectedIdsSha256:hash(ids),observedIdsSha256:hash(got.slice().sort()),passed:true});
      await page.evaluate(()=>window.CX?.ui?.closeAllModals?.());
    }
    await page.evaluate(()=>window.CX?.router?.nav('midia',{history:false}));
    await page.locator('#midKpis [data-mk="real"]').waitFor({timeout:30000});
    const expectedReal=active.filter(v=>v?.canonicalFacets?.realized===true&&v?.canonicalFacets?.cancelled!==true).length;
    const mid=await page.evaluate(()=>{const e=document.querySelector('#midKpis [data-mk="real"] .k-v');const text=String(e?.textContent||'').trim();return {text,revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),view:String(window.CX?.session?.view||'')}})
    const observedReal=Number(mid.text.replace(/[^\d-]/g,''));
    assert(mid.view==='midia'&&mid.revision===REVISION,'RELEASE_COMPOSITION_FAILURE:B11_MIDIA_CONTEXT_OR_REVISION_DRIFT');
    assert(Number.isSafeInteger(observedReal)&&observedReal===expectedReal,'FUNCTIONAL_DEFECT:B11_MIDIA_REALIZED_KPI_MISMATCH');
    result.midia={expectedReal,observedReal,revisionSame:true,view:'midia',passed:true};
  }
  assert(result.pageErrors.length===0,'VISUAL_DEFECT:B11_BROWSER_PAGE_ERRORS');
  const end=await (await get('/api/tya/cinepolis/hr-live?format=meta&b11end='+Date.now())).json();
  assert(end.revision===REVISION,'RELEASE_COMPOSITION_FAILURE:B11_INDEPENDENT_HR_REVISION_CHANGED');
  result.decision=crossSurface ? 'PASS_B11_VISITS_KEYS_REPORT_COVERAGE_SAME_REVISION' : 'PASS_B11_DASHBOARD_MIDIA_CURRENT_HR_SCOPED_READONLY';
}catch(error){result.error=String(error?.message||error).slice(0,180);}
finally{if(browser)await browser.close().catch(()=>{});save();console.log(JSON.stringify({decision:result.decision,owners:result.owners.length,countries:result.countries,midia:result.midia,reason:result.error||null,production:false}));}
if(!result.decision.startsWith('PASS_'))process.exitCode=2;
