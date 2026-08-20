#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args=process.argv.slice(2);
const value=(flag,fallback=null)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const baseUrl=value('--base-url',process.env.CXORBIA_BASE_URL||'http://127.0.0.1:4173/index.html');
const outDir=path.resolve(value('--out','.tmp/i5-preprod-uat'));
fs.mkdirSync(outDir,{recursive:true});

const report={
  schemaVersion:'cxorbia.i5.preprod.source-safe-uat.v1',
  generatedAt:new Date().toISOString(),
  baseUrl,
  decision:'HOLD_I5_PREPROD_UAT_NOT_RUN',
  source:null,
  roles:[],
  blockers:[],
  warnings:[],
  safety:{sourceSafe:true,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,rawSensitiveDataOutput:false}
};
const block=(code,detail='')=>report.blockers.push(detail?`${code}:${detail}`:code);
const warn=(code,detail='')=>report.warnings.push(detail?`${code}:${detail}`:code);
const clean=s=>String(s||'').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email-protected]').replace(/\b\+?\d[\d\s()-]{7,}\b/g,'[phone-protected]').slice(0,260);

const sensitiveKeys=['email','correo','phone','telefono','whatsapp','wa','dpi','documentId','documento','idNumber','banco','bank','ctaNum','accountNumber','cuentaPago','pass','password'];
const nameKeys=['name','nombre','shopperName','shopper'];
const roleSpecs=[
  {id:'admin',enter:'admin',routes:['dashboard','proyectos','visitas','postulaciones','cert','financiero','aprendizaje']},
  {id:'cliente',enter:'cliente',routes:['cli_dashboard','cli_sucursales','cli_reportes']},
  {id:'shopper',enter:'shopper',routes:['visitas','cert','beneficios','aprendizaje']}
];

async function harden(page){
  await page.evaluate(()=>{
    try{localStorage.setItem('cx_banners','[]');sessionStorage.setItem('cx_pwa_shown','1');}catch{}
    document.querySelectorAll('.cx-ov').forEach(n=>n.remove());
    if(window.CX?.confidencialidad){window.CX.confidencialidad.pending=()=>false;window.CX.confidencialidad.show=(_r,done)=>done&&done();window.CX.confidencialidad.accept=()=>{};}
    if(window.CX?.app)window.CX.app.showBanners=()=>{};
  });
}
async function open(page){
  await page.addInitScript(()=>{window.CX_TYA_PHASE_A_PREVIEW=true;try{localStorage.setItem('cx_banners','[]');sessionStorage.setItem('cx_pwa_shown','1');}catch{}});
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Boolean(window.CX_TYA_HR_SOURCE_SAFE),null,{timeout:20000});
  await page.waitForFunction(()=>Boolean(window.CX?.app?.selectRole&&window.CX?.router),null,{timeout:20000});
  await harden(page);
}
async function readSource(page){
  return page.evaluate(({sensitiveKeys,nameKeys})=>{
    const s=window.CX_TYA_HR_SOURCE_SAFE||{};
    const visits=Array.isArray(s.visits)?s.visits:[];
    const shoppers=Array.isArray(s.shoppers)?s.shoppers:[];
    const periods=Array.isArray(s.periods)?s.periods:[];
    let sensitiveSignals=0,rawNames=0;
    for(const row of shoppers){
      if(!row||typeof row!=='object')continue;
      for(const k of sensitiveKeys){const v=row[k];if(v!==undefined&&v!==null&&String(v).trim()!=='')sensitiveSignals++;}
      for(const k of nameKeys){const v=String(row[k]||'').trim();if(v&&!/^(shopper|evaluador) protegido$/i.test(v))rawNames++;}
    }
    for(const row of visits){
      const v=String(row?.shopper||row?.shopperName||'').trim();
      if(v&&!/^(shopper|evaluador) protegido$/i.test(v))rawNames++;
    }
    const countries=[...new Set(visits.map(v=>String(v?.pais||v?.country||'').toUpperCase()).filter(Boolean))];
    return {tenantId:s.tenantId||null,projectId:s.projectId||null,sourceSafe:s.sourceSafe===true,imported:s.imported===true,production:s.production===true,counts:{periods:Number(s.counts?.periods??periods.length),visits:Number(s.counts?.visits??visits.length),shoppers:Number(s.counts?.shoppers??shoppers.length)},arrays:{periods:periods.length,visits:visits.length,shoppers:shoppers.length},countries,sensitiveSignals,rawNames};
  },{sensitiveKeys,nameKeys});
}
async function enter(page,role){
  await harden(page);
  await page.evaluate(r=>{document.querySelectorAll('.cx-ov').forEach(n=>n.remove());if(window.CX?.session?.clear)window.CX.session.clear();window.CX.app.selectRole(r);},role);
  await page.waitForSelector('#app.on',{state:'visible',timeout:15000});
  await page.waitForSelector('#view',{state:'visible',timeout:15000});
  await harden(page);
}
async function route(page,token){
  return page.evaluate(async token=>{
    const m=window.CX?.modules||{},r=window.CX?.routes||{};const keys=[...new Set([...Object.keys(m),...Object.keys(r)])];
    const n=token.toLowerCase();const target=keys.find(k=>k.toLowerCase()===n)||keys.find(k=>k.toLowerCase().includes(n)||n.includes(k.toLowerCase()))||null;
    if(!target)return{token,target:null,rendered:false,missing:true};
    try{if(window.CX?.router?.nav)window.CX.router.nav(target);else if(window.CX?.router?.go)window.CX.router.go(target);else if(window.CX?.router?.navigate)window.CX.router.navigate(target);else return{token,target,rendered:false,noRouter:true};}catch(e){return{token,target,rendered:false,error:String(e?.message||e).slice(0,180)};}
    await new Promise(r=>setTimeout(r,250));const view=document.querySelector('#view');const text=String(view?.innerText||'').trim();
    return{token,target,rendered:Boolean(view&&text.length>0),textLength:text.length,dishonest:/pago ejecutado|sincronizado con hr|publicado automáticamente|enviado con éxito/i.test(text)};
  },token);
}

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});const page=await ctx.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(clean(e?.message||e)));
  await open(page);report.source=await readSource(page);
  if(report.source.tenantId!=='tya')block('tenant_mismatch',String(report.source.tenantId));
  if(report.source.projectId!=='cinepolis')block('project_mismatch',String(report.source.projectId));
  if(!report.source.sourceSafe)block('source_safe_false');
  if(report.source.imported)block('imported_true');
  if(report.source.production)block('production_true');
  if(report.source.counts.periods!==report.source.arrays.periods)block('period_count_internal_mismatch');
  if(report.source.counts.visits!==report.source.arrays.visits)block('visit_count_internal_mismatch');
  if(!report.source.countries.includes('GT')||!report.source.countries.includes('HN'))block('country_coverage_missing');
  if(report.source.sensitiveSignals)block('public_source_sensitive_fields',String(report.source.sensitiveSignals));
  if(report.source.rawNames)block('public_source_raw_shopper_names',String(report.source.rawNames));
  if(pageErrors.length)block('source_page_errors',String(pageErrors.length));
  await page.screenshot({path:path.join(outDir,'source-entry.png'),fullPage:true});await ctx.close();

  for(const spec of roleSpecs){
    const c=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(clean(e?.message||e)));
    const rr={id:spec.id,status:'pending',routes:[],pageErrorCount:0};
    try{await open(p);await enter(p,spec.enter);for(const t of spec.routes){const x=await route(p,t);rr.routes.push(x);if(x.missing)warn(`${spec.id}_route_alias_missing`,t);else if(!x.rendered)block(`${spec.id}_route_not_rendered`,t);if(x.dishonest)block(`${spec.id}_dishonest_runtime_copy`,t);}rr.pageErrorCount=errors.length;if(errors.length)block(`${spec.id}_page_errors`,String(errors.length));await p.screenshot({path:path.join(outDir,`${spec.id}.png`),fullPage:true});rr.status=errors.length?'fail':'pass';}catch(e){rr.status='fail';rr.error=clean(e?.message||e);block(`${spec.id}_shell_failure`,rr.error);}finally{report.roles.push(rr);await c.close();}
  }
  report.decision=report.blockers.length?'HOLD_I5_PREPROD_SOURCE_SAFE_UAT':'PASS_I5_PREPROD_SOURCE_SAFE_UAT';
}catch(e){block('uat_exception',clean(e?.message||e));report.decision='HOLD_I5_PREPROD_SOURCE_SAFE_UAT';}
finally{await browser.close();}
fs.writeFileSync(path.join(outDir,'result.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(report.blockers.length)process.exit(2);
