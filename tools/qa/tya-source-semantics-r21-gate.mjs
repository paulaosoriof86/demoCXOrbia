#!/usr/bin/env node
/* CXOrbia TyA Phase A — compact R21 source semantics gate. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const baseUrl=valueOf('--base-url',process.env.CXORBIA_BASE_URL||'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible');
const outDir=path.resolve(valueOf('--out','.tmp/tya-source-semantics-r21'));
const expectedRoles=['admin','cliente','shopper','ops','coordinador','aliado'];
const maxAgeHours=Number(process.env.CXORBIA_MAX_SOURCE_AGE_HOURS||24);
fs.mkdirSync(outDir,{recursive:true});
const report={schemaVersion:'1.0.0',gate:'tya-source-semantics-r21',generatedAt:new Date().toISOString(),baseUrl,observed:null,blockers:[],warnings:[],decision:'HOLD_NOT_RUN',safeState:{browserReadOnly:true,writes:false,imports:false,deploy:false,production:false,providers:false,payments:false}};
const block=(code,detail='')=>report.blockers.push(detail?`${code}:${detail}`:code);
const warn=(code,detail='')=>report.warnings.push(detail?`${code}:${detail}`:code);

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
  const page=await context.newPage();
  const pageErrors=[],consoleErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error?.message||error).slice(0,300)));
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text().slice(0,300));});
  await page.addInitScript(()=>{try{localStorage.clear();sessionStorage.clear();localStorage.setItem('cx_banners','[]');sessionStorage.setItem('cx_pwa_shown','1');}catch{}});
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>Boolean(window.CX_TYA_HR_SOURCE_SAFE&&window.CX?.data&&window.CX_TYA_VISIBLE_DATA_READY),null,{timeout:30000});
  report.observed=await page.evaluate(()=>{
    const s=window.CX_TYA_HR_SOURCE_SAFE||{};
    const d=window.CX?.data||{};
    const rows=typeof d.visitas==='function'?d.visitas():[];
    const facets=typeof d.visitFacets==='function'?rows.map(v=>d.visitFacets(v)):[];
    const available=typeof d.availableVisits==='function'?d.availableVisits(rows):[];
    const profile=window.CX?.tenantProfile||{};
    const generatedAt=s.generatedAt||null;
    return {
      sourceSafe:s.sourceSafe===true,imported:s.imported===true,production:s.production===true,
      tenantId:s.tenantId||null,projectId:s.projectId||null,periods:Number(s.counts?.periods??s.periods?.length??0),visits:Number(s.counts?.visits??s.visits?.length??0),shoppers:Number(s.counts?.shoppers??s.shoppers?.length??0),
      semanticNormalizer:s.source?.semanticNormalizer||null,historyScope:s.normalization?.historyScope||null,assignmentAndAvailabilitySeparated:s.source?.assignmentAndAvailabilitySeparated===true,normalizedFranjaAndMeasurementWindow:s.source?.normalizedFranjaAndMeasurementWindow===true,
      generatedAt,ageHours:generatedAt?(Date.now()-new Date(generatedAt).getTime())/3600000:null,runtimeLiveSync:s.source?.runtimeLiveSync===true,
      currentProjectId:d.currentProjectId||null,currentPeriodId:d.currentPeriodId||null,currentRows:rows.length,
      current:{available:facets.filter(f=>f.available&&!f.assigned&&!f.cancelled).length,eligibilityBlocked:facets.filter(f=>f.eligibilityBlocked&&!f.assigned&&!f.cancelled).length,assigned:facets.filter(f=>f.assigned).length,unassigned:facets.filter(f=>!f.assigned&&!f.cancelled).length},
      availableRows:available.map(v=>({availableFrom:v.disponibleDesde||null,franjaCode:v.franjaCode||null,windowStart:v.measurementWindowStart||null,windowEnd:v.measurementWindowEnd||null})),
      postulationEligibility:typeof d.postulationEligibility==='function',availableVisits:typeof d.availableVisits==='function',
      tenantProfile:{tenantId:profile.tenantId||null,visibleLoginRoles:Array.isArray(profile.visibleLoginRoles)?profile.visibleLoginRoles:[],roleTestAreaLabel:profile.roleTestAreaLabel||null,showRoleTestArea:profile.showRoleTestArea===true,clientPortalVisible:profile.clientPortalVisible===true,allowShopperRegistration:profile.allowShopperRegistration!==false}
    };
  });
  const o=report.observed;
  if(!o.sourceSafe||o.imported||o.production)block('unsafe_source_state');
  if(o.tenantId!=='tya'||o.projectId!=='cinepolis')block('source_identity_mismatch',`${o.tenantId}/${o.projectId}`);
  if(o.periods!==14||o.visits!==616)block('history_count_mismatch',`${o.periods}/${o.visits}`);
  if(!Number.isInteger(o.shoppers)||o.shoppers<=0)block('shopper_count_invalid',String(o.shoppers));
  if(o.shoppers!==216)warn('shopper_count_drift_review',`${o.shoppers}/216`);
  if(o.semanticNormalizer!=='r15g+r20+r21-eligibility')block('semantic_normalizer_mismatch',String(o.semanticNormalizer));
  if(!['all_verified_hr_periods','all_detected_hr_periods'].includes(o.historyScope))block('history_scope_mismatch',String(o.historyScope));
  if(!o.assignmentAndAvailabilitySeparated)block('assignment_availability_separation_missing');
  if(!o.normalizedFranjaAndMeasurementWindow)block('franja_window_normalization_missing');
  if(!o.generatedAt||!Number.isFinite(o.ageHours)||o.ageHours<-1||o.ageHours>maxAgeHours)block('source_age_invalid',String(o.ageHours));
  if(o.runtimeLiveSync)warn('runtime_live_sync_unexpected_in_build_snapshot');
  if(o.currentProjectId!=='cinepolis'||!o.currentPeriodId||o.currentPeriodId===o.currentProjectId)block('project_period_context_invalid',`${o.currentProjectId}/${o.currentPeriodId}`);
  if(o.currentRows!==44)block('current_period_row_count_mismatch',String(o.currentRows));
  if(o.current.unassigned!==5||o.current.available!==4||o.current.eligibilityBlocked!==1||o.current.assigned!==39)block('july_eligibility_buckets_mismatch',JSON.stringify(o.current));
  if(!o.postulationEligibility||!o.availableVisits)block('r21_public_contract_missing');
  if(o.availableRows.length!==4)block('available_rows_mismatch',String(o.availableRows.length));
  if(o.availableRows.some(v=>!v.availableFrom||!['WK','WKND'].includes(v.franjaCode)||!v.windowStart||!v.windowEnd))block('available_rows_projection_incomplete');
  if(o.tenantProfile.tenantId!=='tya')block('tenant_profile_missing');
  if(JSON.stringify(o.tenantProfile.visibleLoginRoles)!==JSON.stringify(expectedRoles))block('validation_roles_mismatch',JSON.stringify(o.tenantProfile.visibleLoginRoles));
  if(o.tenantProfile.roleTestAreaLabel!=='Accesos de validación'||!o.tenantProfile.showRoleTestArea||!o.tenantProfile.clientPortalVisible)block('validation_login_profile_mismatch',JSON.stringify(o.tenantProfile));
  if(pageErrors.length)block('page_errors',String(pageErrors.length));
  if(consoleErrors.length)warn('console_errors',String(consoleErrors.length));
  report.pageErrors=pageErrors;report.consoleErrors=consoleErrors;
  await page.screenshot({path:path.join(outDir,'tya-source-semantics-r21.png'),fullPage:true});
  await context.close();
}catch(error){block('gate_fatal',String(error?.message||error).slice(0,400));}
finally{await browser.close();}
report.blockers=[...new Set(report.blockers)];report.warnings=[...new Set(report.warnings)];
report.ok=report.blockers.length===0;
report.decision=report.ok?(report.warnings.length?'PASS_WITH_WARNING_R21_TYA_SOURCE_SEMANTICS':'PASS_R21_TYA_SOURCE_SEMANTICS'):'HOLD_R21_TYA_SOURCE_SEMANTICS';
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),['# TyA R21 source semantics','',`Decision: **${report.decision}**`,`Available/blocked/unassigned: ${report.observed?.current?.available??'n/a'}/${report.observed?.current?.eligibilityBlocked??'n/a'}/${report.observed?.current?.unassigned??'n/a'}`,'','## Blockers',...(report.blockers.length?report.blockers.map(x=>`- ${x}`):['- none']),'','## Warnings',...(report.warnings.length?report.warnings.map(x=>`- ${x}`):['- none'])].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(!report.ok)process.exit(1);
