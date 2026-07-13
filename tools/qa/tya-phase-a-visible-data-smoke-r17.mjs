#!/usr/bin/env node
/*
  CXOrbia TyA Phase A R17 — visible-data smoke.

  Validates what a human actually sees, not only that a source-safe payload is
  present in window. It fails when the UI still shows generic demo data, when
  periods are not independently selectable, or when TyA/Cinepolis branding and
  counts are not visible. Browser-only, read-only, no providers or writes.
*/

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = valueOf('--base-url', process.env.CXORBIA_BASE_URL || 'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1');
const outDir = path.resolve(valueOf('--out', '.tmp/phase-a-visible-data-smoke-r17'));
fs.mkdirSync(outDir, { recursive:true });

const expected = { periods:14, visits:616, shoppers:210, currentPeriodVisits:44 };
const report = {
  schemaVersion:'1.0.0', gate:'cxorbia-tya-visible-data-smoke-r17', generatedAt:new Date().toISOString(),
  baseUrl, expected, login:null, runtime:null, admin:null, blockers:[], warnings:[], decision:'HOLD_NOT_RUN',
  safeState:{browserOnly:true,providerCalls:false,writes:false,imports:false,deploy:false,production:false,piiOutput:false}
};
const block = (code, detail='') => report.blockers.push(detail ? `${code}:${detail}` : code);
const warn = (code, detail='') => report.warnings.push(detail ? `${code}:${detail}` : code);
const clean = text => String(text || '').replace(/\s+/g,' ').trim().slice(0,500);

const browser = await chromium.launch({ headless:true });
try {
  const context = await browser.newContext({ viewport:{width:1440,height:1100}, serviceWorkers:'block' });
  const page = await context.newPage();
  const consoleErrors=[];
  const pageErrors=[];
  page.on('console', message => { if(message.type()==='error') consoleErrors.push(clean(message.text())); });
  page.on('pageerror', error => pageErrors.push(clean(error?.message || error)));
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('cx_pwa_shown','1');
      localStorage.setItem('cx_banners','[]');
    } catch(e) {}
  });
  await page.goto(baseUrl, {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(() => window.CX_TYA_VISIBLE_DATA_READY === true, null, {timeout:20000});
  await page.waitForFunction(() => Boolean(window.CX?.app?.selectRole && window.CX?.dataSource), null, {timeout:20000});

  report.login = await page.evaluate(() => {
    const login = document.querySelector('#login');
    return {
      text:String(login?.innerText || '').replace(/\s+/g,' ').trim(),
      title:document.title,
      clientName:window.CX?.BRAND?.clientName || null,
      tagline:window.CX?.BRAND?.tagline || null,
      flags:[...document.querySelectorAll('.login-flags .cflag span')].map(node=>String(node.textContent||'').trim()),
      demoBadgeVisible:/Demo comercial/i.test(String(login?.innerText || ''))
    };
  });

  report.runtime = await page.evaluate(() => {
    const projects = Array.isArray(window.CX?.data?.projects) ? window.CX.data.projects : [];
    const visits = Array.isArray(window.CX?.data?._visitas) ? window.CX.data._visitas : [];
    const shoppers = Array.isArray(window.CX?.data?.shoppers) ? window.CX.data.shoppers : [];
    const currentVisits = window.CX?.data?.visitas ? window.CX.data.visitas() : [];
    return {
      visibleContract:window.CX_TYA_VISIBLE_DATA_CONTRACT || null,
      dataSource:{mode:window.CX?.dataSource?.mode,status:window.CX?.dataSource?.status,label:window.CX?.dataSource?.label?.()},
      projectCount:projects.length,
      uniqueProjectIds:new Set(projects.map(p=>p.id)).size,
      periodKeys:new Set(projects.map(p=>p.periodKey)).size,
      currentProjectId:window.CX?.data?.currentProjectId || null,
      currentProjectName:window.CX?.data?.project?.()?.name || null,
      visitCount:visits.length,
      currentPeriodVisitCount:Array.isArray(currentVisits)?currentVisits.length:0,
      shopperCount:shoppers.length,
      genericProjectIds:projects.filter(p=>['retail','banca','food'].includes(String(p.id))).map(p=>p.id),
      allVisitsHavePeriodProject:visits.every(v=>String(v.projectId||'').startsWith('cinepolis-') && Boolean(v.periodKey)),
      tenant:document.documentElement.getAttribute('data-cx-tenant'),
      project:document.documentElement.getAttribute('data-cx-project'),
      source:document.documentElement.getAttribute('data-cx-source')
    };
  });

  if(report.login.clientName!=='TyA') block('login_brand_not_tya',String(report.login.clientName));
  if(!/TyA/i.test(report.login.text)) block('login_missing_tya');
  if(!/Tenant TyA|Phase A/i.test(report.login.text)) block('login_missing_tya_context');
  if(!report.login.flags.includes('GT') || !report.login.flags.includes('HN')) block('login_country_flags_missing',JSON.stringify(report.login.flags));
  if(report.login.demoBadgeVisible) block('login_still_claims_demo_commercial');
  if(report.runtime.dataSource.mode!=='source_safe_preview' || report.runtime.dataSource.status!=='ready') block('datasource_not_ready',JSON.stringify(report.runtime.dataSource));
  if(report.runtime.projectCount!==expected.periods) block('period_project_count_mismatch',`${report.runtime.projectCount}/${expected.periods}`);
  if(report.runtime.uniqueProjectIds!==expected.periods) block('period_ids_not_unique',`${report.runtime.uniqueProjectIds}/${expected.periods}`);
  if(report.runtime.periodKeys!==expected.periods) block('period_keys_not_unique',`${report.runtime.periodKeys}/${expected.periods}`);
  if(report.runtime.visitCount!==expected.visits) block('visit_count_mismatch',`${report.runtime.visitCount}/${expected.visits}`);
  if(report.runtime.currentPeriodVisitCount!==expected.currentPeriodVisits) block('current_period_visit_count_mismatch',`${report.runtime.currentPeriodVisitCount}/${expected.currentPeriodVisits}`);
  if(report.runtime.shopperCount!==expected.shoppers) block('shopper_count_mismatch',`${report.runtime.shopperCount}/${expected.shoppers}`);
  if(report.runtime.genericProjectIds.length) block('generic_demo_projects_visible',report.runtime.genericProjectIds.join(','));
  if(!report.runtime.allVisitsHavePeriodProject) block('visits_not_bound_to_unique_periods');
  if(report.runtime.tenant!=='tya' || report.runtime.project!=='cinepolis' || report.runtime.source!=='source-safe') block('document_visible_contract_missing');

  await page.evaluate(() => {
    document.querySelectorAll('.cx-ov').forEach(node=>node.remove());
    if(window.CX?.confidencialidad){
      window.CX.confidencialidad.pending=()=>false;
      window.CX.confidencialidad.show=(_r,done)=>done&&done();
    }
    if(window.CX?.app) window.CX.app.showBanners=()=>{};
    window.CX.app.selectRole('admin');
  });
  await page.waitForSelector('#app.on',{state:'visible',timeout:15000});
  await page.waitForSelector('#view',{state:'visible',timeout:15000});
  await page.waitForTimeout(600);

  report.admin = await page.evaluate(() => {
    const body=String(document.body.innerText||'').replace(/\s+/g,' ').trim();
    const badge=String(document.querySelector('.tb-demo')?.innerText||'').replace(/\s+/g,' ').trim();
    const view=String(document.querySelector('#view')?.innerText||'').replace(/\s+/g,' ').trim();
    return {
      badge, bodySample:body.slice(0,1500), viewSample:view.slice(0,1200),
      hasTya:/TyA/i.test(body), hasCinepolis:/Cinépolis|Cinepolis/i.test(body),
      hasLatestPeriod:/JUL 2026|Julio 2026/i.test(body),
      hasGenericDemo:/Proyecto Retail|Proyecto Banca|Proyecto Restaurantes|Cliente Retail \(demo\)/i.test(body)
    };
  });

  if(!/Source-safe \(preview\).*Listo/i.test(report.admin.badge)) block('topbar_not_source_safe_ready',report.admin.badge);
  if(!report.admin.hasTya) block('admin_ui_missing_tya');
  if(!report.admin.hasCinepolis) block('admin_ui_missing_cinepolis');
  if(!report.admin.hasLatestPeriod) warn('admin_ui_latest_period_not_in_initial_view');
  if(report.admin.hasGenericDemo) block('admin_ui_contains_generic_demo');
  if(consoleErrors.length) block('console_errors',String(consoleErrors.length));
  if(pageErrors.length) block('page_errors',String(pageErrors.length));

  await page.screenshot({path:path.join(outDir,'tya-visible-login-admin-r17.png'),fullPage:true});
  report.consoleErrors=consoleErrors;
  report.pageErrors=pageErrors;
  report.decision=report.blockers.length?'FAIL_VISIBLE_TYA_DATA_R17':(report.warnings.length?'PASS_WITH_REVIEW_VISIBLE_TYA_DATA_R17':'PASS_VISIBLE_TYA_DATA_R17');
  await context.close();
} catch(error) {
  block('smoke_exception',clean(error?.message || error));
  report.decision='FAIL_VISIBLE_TYA_DATA_R17';
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir,'visible-data-smoke-r17.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'visible-data-smoke-r17.md'),[
  '# CXOrbia TyA visible-data smoke R17','',`Decision: ${report.decision}`,
  `Login client: ${report.login?.clientName || 'n/a'}`,
  `Data source: ${report.runtime?.dataSource?.mode || 'n/a'} / ${report.runtime?.dataSource?.status || 'n/a'}`,
  `Periods / unique IDs: ${report.runtime?.projectCount ?? 0} / ${report.runtime?.uniqueProjectIds ?? 0}`,
  `Visits / current period: ${report.runtime?.visitCount ?? 0} / ${report.runtime?.currentPeriodVisitCount ?? 0}`,
  `Shoppers: ${report.runtime?.shopperCount ?? 0}`,
  `Topbar: ${report.admin?.badge || 'n/a'}`,
  `Blockers: ${report.blockers.length}`,
  ...report.blockers.map(item=>`- ${item}`),
  `Warnings: ${report.warnings.length}`,
  ...report.warnings.map(item=>`- ${item}`),'',
  'Browser-only, read-only. No providers, writes, imports, deploy or production.'
].join('\n'),'utf8');

console.log(JSON.stringify({decision:report.decision,login:report.login,runtime:report.runtime,admin:report.admin,blockers:report.blockers,warnings:report.warnings,safeState:report.safeState},null,2));
process.exitCode=report.blockers.length?2:0;
