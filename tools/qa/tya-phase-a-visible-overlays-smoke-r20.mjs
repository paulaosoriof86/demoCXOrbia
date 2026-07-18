#!/usr/bin/env node
/*
  CXOrbia TyA Phase A R20 — visible overlay smoke.

  Browser-only/read-only. Confirma que los controles financieros R14C siguen
  pendientes de cruce, que R20 no infiere pago/lote y que los shoppers siguen
  siendo referencias protegidas. Acepta las etiquetas canónicas R20
  `not_confirmed`, `pending_financial_source` y el alias histórico
  `pending_financial_review` como estados pendientes, nunca como pago.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const baseUrl=valueOf('--base-url',process.env.CXORBIA_BASE_URL||'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible');
const outDir=path.resolve(valueOf('--out','.tmp/phase-a-visible-overlays-smoke-r20'));
fs.mkdirSync(outDir,{recursive:true});

const expected={periods:14,visits:616,currentPeriodVisits:44,financialExactLinks:196,financialReviewQueue:92,shopperReviewQueue:1,certificationReviewQueue:1};
const report={schemaVersion:'2.0.0',gate:'cxorbia-tya-visible-overlays-smoke-r20',generatedAt:new Date().toISOString(),baseUrl,expected,runtime:null,modules:[],blockers:[],warnings:[],decision:'HOLD_NOT_RUN',safeState:{browserOnly:true,providerCalls:false,writes:false,imports:false,deploy:false,production:false,piiOutput:false,paymentsInferred:false}};
const clean=value=>String(value||'').replace(/\s+/g,' ').trim().slice(0,1000);
const block=(code,detail='')=>report.blockers.push(detail?`${code}:${detail}`:code);
const warn=(code,detail='')=>report.warnings.push(detail?`${code}:${detail}`:code);

async function prepare(page){
  await page.addInitScript(()=>{try{localStorage.clear();sessionStorage.clear();sessionStorage.setItem('cx_pwa_shown','1');localStorage.setItem('cx_banners','[]');}catch{}});
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.CX_TYA_VISIBLE_DATA_READY===true&&window.CX_TYA_R18D_VISIBLE_READY===true&&Boolean(window.CX?.data),null,{timeout:25000});
}
async function enterAdmin(page){
  await page.evaluate(()=>{window.CX?.session?.clear?.();window.CX?.app?.selectRole?.('admin');});
  await page.waitForSelector('#app.on',{state:'visible',timeout:15000});
  await page.waitForSelector('#view',{state:'visible',timeout:15000});
}
async function openModule(page,token){
  const result=await page.evaluate(async routeToken=>{
    const keys=[...new Set([...Object.keys(window.CX?.modules||{}),...Object.keys(window.CX?.routes||{})])];
    const normalized=String(routeToken).toLowerCase();
    const target=keys.find(key=>String(key).toLowerCase()===normalized)||keys.find(key=>String(key).toLowerCase().includes(normalized)||normalized.includes(String(key).toLowerCase()))||null;
    if(!target)return {token:routeToken,target:null,rendered:false,text:'',error:null};
    try{window.CX?.router?.nav?.(target)||window.CX?.router?.go?.(target)||window.CX?.router?.navigate?.(target);}catch(error){return {token:routeToken,target,rendered:false,text:'',error:String(error?.message||error)};}
    await new Promise(resolve=>setTimeout(resolve,400));
    const text=String(document.querySelector('#view')?.innerText||'').replace(/\s+/g,' ').trim();
    return {token:routeToken,target,rendered:Boolean(text),text:text.slice(0,2500),error:null};
  },token);
  report.modules.push(result);
  if(!result.target)block(`module_missing_${token}`);
  else if(result.error)block(`module_render_error_${token}`,clean(result.error));
  else if(!result.rendered)block(`module_not_rendered_${token}`);
  return result;
}

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block'});
  const page=await context.newPage();
  const consoleErrors=[],pageErrors=[];
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(clean(message.text()));});
  page.on('pageerror',error=>pageErrors.push(clean(error?.message||error)));
  await prepare(page);

  report.runtime=await page.evaluate(()=>{
    const visits=Array.isArray(window.CX?.data?._visitas)?window.CX.data._visitas:[];
    const shoppers=Array.isArray(window.CX?.data?.shoppers)?window.CX.data.shoppers:[];
    const periods=Array.isArray(window.CX?.data?.projects)?window.CX.data.projects:[];
    const current=window.CX?.data?.visitas?.()||[];
    const exact=visits.filter(item=>item.r14cExactControl===true);
    const pendingStates=new Set(['pending_financial_review','pending_financial_source','not_confirmed']);
    return {
      visibleContract:window.CX_TYA_R18D_VISIBLE_CONTRACT||null,
      baseVisibleContract:window.CX_TYA_VISIBLE_DATA_CONTRACT||null,
      sourceShopperCount:Number(window.CX_TYA_HR_SOURCE_SAFE?.counts?.shoppers??window.CX_TYA_HR_SOURCE_SAFE?.shoppers?.length??0),
      periods:periods.length,
      uniquePeriodIds:new Set(periods.map(item=>item.id)).size,
      visits:visits.length,
      shoppers:shoppers.length,
      protectedReferenceShoppers:shoppers.filter(item=>item.dataLevel==='protected_reference'&&item.operationalProfileAvailable===false).length,
      shopperRatingsInvented:shoppers.filter(item=>item.dataLevel==='protected_reference'&&item.rating!=null).length,
      shopperStatusesInvented:shoppers.filter(item=>item.dataLevel==='protected_reference'&&(item.estado!=null||item.status!=null)).length,
      currentPeriodVisits:Array.isArray(current)?current.length:0,
      financialExactLinks:exact.length,
      exactPendingFinancial:exact.every(item=>pendingStates.has(item.paymentState)||item.paymentControlOnly===true),
      exactLiquidationCandidates:exact.every(item=>item.liquidationCandidate===true||item.submissionState==='confirmed_hr'),
      exactNotPaid:exact.every(item=>item.paymentConfirmed!==true&&item.paid!==true&&item.lotEligible!==true),
      financialReviewQueue:Array.isArray(window.CX?.data?.financialReviewQueue)?window.CX.data.financialReviewQueue.length:-1,
      shopperReviewQueue:Array.isArray(window.CX?.data?.shopperReviewQueue)?window.CX.data.shopperReviewQueue.length:-1,
      certificationReviewQueue:Array.isArray(window.CX?.data?.certificationReviewQueue)?window.CX.data.certificationReviewQueue.length:-1,
      certificationFalseConfirmations:shoppers.filter(item=>item.certificationCarryoverConfirmed===true).length,
      runtimeSyncActive:window.CX?.dataSource?.runtimeSyncActive===true,
      documentFinancialOverlay:document.documentElement.getAttribute('data-cx-financial-overlay'),
      documentCertificationCarryover:document.documentElement.getAttribute('data-cx-certification-carryover')
    };
  });

  const r=report.runtime;
  if(!r.visibleContract||r.visibleContract.integrationId!=='R18D_VISIBLE_EXISTING_OVERLAYS')block('r18d_visible_contract_missing');
  if(r.periods!==expected.periods||r.uniquePeriodIds!==expected.periods)block('period_count_mismatch',`${r.periods}/${r.uniquePeriodIds}`);
  if(r.visits!==expected.visits)block('visit_count_mismatch',`${r.visits}/${expected.visits}`);
  if(r.currentPeriodVisits!==expected.currentPeriodVisits)block('current_period_visit_count_mismatch',`${r.currentPeriodVisits}/${expected.currentPeriodVisits}`);
  if(!Number.isInteger(r.shoppers)||r.shoppers<=0)block('shopper_count_empty_or_invalid',String(r.shoppers));
  if(r.shoppers!==r.sourceShopperCount)block('shopper_source_runtime_count_mismatch',`${r.shoppers}/${r.sourceShopperCount}`);
  if(r.protectedReferenceShoppers!==r.shoppers)block('shopper_protected_reference_contract_mismatch',`${r.protectedReferenceShoppers}/${r.shoppers}`);
  if(r.shopperRatingsInvented)block('protected_shopper_rating_invented',String(r.shopperRatingsInvented));
  if(r.shopperStatusesInvented)block('protected_shopper_status_invented',String(r.shopperStatusesInvented));
  if(r.runtimeSyncActive)block('snapshot_falsely_claims_runtime_sync');
  if(r.financialExactLinks!==expected.financialExactLinks)block('financial_exact_links_mismatch',`${r.financialExactLinks}/${expected.financialExactLinks}`);
  if(!r.exactPendingFinancial)block('exact_controls_not_pending_financial_source');
  if(!r.exactLiquidationCandidates)block('exact_controls_missing_submission_or_liquidation_candidate');
  if(!r.exactNotPaid)block('payment_or_lot_inferred_from_control');
  if(r.financialReviewQueue!==expected.financialReviewQueue)block('financial_review_queue_mismatch',`${r.financialReviewQueue}/${expected.financialReviewQueue}`);
  if(r.shopperReviewQueue!==expected.shopperReviewQueue)block('shopper_review_queue_mismatch',`${r.shopperReviewQueue}/${expected.shopperReviewQueue}`);
  if(r.certificationReviewQueue!==expected.certificationReviewQueue)block('certification_review_queue_mismatch',`${r.certificationReviewQueue}/${expected.certificationReviewQueue}`);
  if(r.certificationFalseConfirmations!==0)block('certification_carryover_inferred',String(r.certificationFalseConfirmations));
  if(r.visibleContract?.paidConfirmed!==0||r.visibleContract?.paymentLotsCreated!==0)block('payment_confirmation_inferred');
  if(r.documentFinancialOverlay!=='r14c-pending-review')block('financial_overlay_document_marker_missing');
  if(r.documentCertificationCarryover!=='hold-pending-source')block('certification_hold_document_marker_missing');

  await enterAdmin(page);
  const shoppersModule=await openModule(page,'shoppers');
  const financeModule=await openModule(page,'financiero');
  const certificationModule=await openModule(page,'cert');
  if(shoppersModule.rendered&&/★\s*4\.3|\bActivo\b.*\bCompleto\b/i.test(shoppersModule.text))block('shopper_module_displays_invented_operational_facts');
  if(financeModule.rendered&&/Pagada \(confirmado\)|pago confirmado|lote confirmado/i.test(financeModule.text))block('finance_module_claims_confirmed_payment');
  if(certificationModule.rendered&&!/pendiente de fuente|no hay.*certificaci|banco.*no publicado/i.test(certificationModule.text))warn('certification_hold_copy_not_visible',clean(certificationModule.text).slice(0,180));
  if(consoleErrors.length)block('console_errors',String(consoleErrors.length));
  if(pageErrors.length)block('page_errors',String(pageErrors.length));
  report.consoleErrors=consoleErrors;report.pageErrors=pageErrors;
  await page.screenshot({path:path.join(outDir,'r20-admin-final-view.png'),fullPage:true});
  await context.close();
}catch(error){block('smoke_exception',clean(error?.message||error));}
finally{await browser.close();}

report.blockers=[...new Set(report.blockers)];report.warnings=[...new Set(report.warnings)];
report.ok=report.blockers.length===0;
report.decision=report.ok?(report.warnings.length?'PASS_WITH_REVIEW_R20_VISIBLE_OVERLAYS':'PASS_R20_VISIBLE_OVERLAYS'):'HOLD_R20_VISIBLE_OVERLAYS';
fs.writeFileSync(path.join(outDir,'r20-visible-overlays-smoke.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'r20-visible-overlays-smoke.md'),['# CXOrbia TyA visible overlays smoke R20','',`Decision: **${report.decision}**`,`Blockers: ${report.blockers.length}`,...report.blockers.map(item=>`- ${item}`),`Warnings: ${report.warnings.length}`,...report.warnings.map(item=>`- ${item}`),'','Browser-only, read-only. Pending financial states never authorize payment or lot creation.'].join('\n')+'\n','utf8');
console.log(JSON.stringify({decision:report.decision,ok:report.ok,runtime:report.runtime,blockers:report.blockers,warnings:report.warnings,safeState:report.safeState},null,2));
process.exitCode=report.ok?0:2;
