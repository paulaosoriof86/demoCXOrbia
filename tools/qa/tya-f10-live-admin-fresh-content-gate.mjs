#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args=process.argv.slice(2);
const arg=(name,fallback='')=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const root=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const privatePath=String(process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/phase-a-runtime-private/private-e2e.json');
const freshPath=arg('--fresh','.tmp/phase-a-runtime-multirole/f10-fresh-hr/report.json');
const outPath=arg('--out','.tmp/phase-a-runtime-multirole/f10-live-admin-fresh-content.json');
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const fail=m=>{throw new Error(m);};
const clean=v=>String(v??'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').replace(/_+/g,'_').slice(0,1600);
const write=v=>{fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(v,null,2)+'\n','utf8');};
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const bool=v=>v===true;
const normCountry=v=>String(v||'unknown').trim().toUpperCase()||'UNKNOWN';
const normRowKey=(hrRowId,sourceTab,sourceRow,visitId)=>String(hrRowId||((sourceTab&&sourceRow!=null)?`${sourceTab}!${sourceRow}`:'')||visitId||'').trim();
const sortRows=rows=>rows.slice().sort((a,b)=>String(a.rowKey).localeCompare(String(b.rowKey))||String(a.country).localeCompare(String(b.country))||Number(a.sourceRow||0)-Number(b.sourceRow||0));

if(!fs.existsSync(freshPath))fail('fresh_report_missing');
if(!fs.existsSync(privatePath))fail('private_credentials_missing');
const fresh=readJson(freshPath);
const bundle=readJson(privatePath);
const cred=bundle?.staff||null;
if(fresh.decision!=='PASS_F10_FRESH_HR_ROW_LEVEL_RECONCILIATION'||fresh.ok!==true)fail('fresh_hr_not_pass');
if(fresh.provider?.cacheOrigin!=='runtime_refresh')fail('fresh_hr_not_runtime_refresh');
if(!fresh.provider?.revision||!fresh.provider?.sourceReadAt)fail('fresh_hr_identity_missing');
if(!Array.isArray(fresh.focus?.rows)||!fresh.focus?.periodKey||!fresh.focus?.digestSha256)fail('fresh_focus_evidence_missing');
if(!cred?.login||!cred?.password||cred?.role!=='admin')fail('canonical_admin_private_credential_missing');

const rows=fresh.focus.rows;
const active=rows.filter(r=>r?.canonical?.cancelled!==true);
const submitted=r=>r.submittedEvidence===true||r.canonical?.liquidationConfirmed===true||r.canonical?.paymentConfirmed===true;
const expected={
  total:active.length,
  realizadas:active.filter(r=>r.realizedEvidence===true).length,
  pendRealizar:active.filter(r=>r.realizedEvidence!==true).length,
  sinAgendar:active.filter(r=>r.canonical?.assigned===true&&r.scheduledEvidence!==true&&r.realizedEvidence!==true).length,
  cuestPend:active.filter(r=>r.realizedEvidence===true&&r.questionnaireEvidence!==true).length,
  sinSubmitir:active.filter(r=>r.questionnaireEvidence===true&&!submitted(r)).length,
  liquidationCandidates:active.filter(submitted).length,
  liquidadas:active.filter(r=>r.canonical?.liquidationConfirmed===true).length
};
const providerOperationalRows=sortRows(rows.map(r=>({
  rowKey:normRowKey(r?.hrRowId,r?.sourceTab,r?.sourceRow,r?.visitId),
  country:normCountry(r?.country),
  sourceRow:Number(r?.sourceRow??0),
  assigned:bool(r?.assigned),
  scheduledEvidence:bool(r?.scheduledEvidence),
  realizedEvidence:bool(r?.realizedEvidence),
  questionnaireEvidence:bool(r?.questionnaireEvidence),
  submittedEvidence:bool(r?.submittedEvidence),
  liquidationConfirmed:bool(r?.canonical?.liquidationConfirmed),
  paymentConfirmed:bool(r?.canonical?.paymentConfirmed),
  cancelled:bool(r?.canonical?.cancelled),
  reviewRequired:bool(r?.reviewRequired)
})));
if(providerOperationalRows.some(r=>!r.rowKey))fail('provider_operational_row_key_missing');
if(new Set(providerOperationalRows.map(r=>r.rowKey)).size!==providerOperationalRows.length)fail('provider_operational_row_key_duplicate');
const providerOperationalDigest=digest(providerOperationalRows);

function summaryFromRows(signatures){
  const out={total:0,assigned:0,scheduled:0,pendingSchedule:0,realized:0,pendingRealization:0,questionnaireCompleted:0,pendingQuestionnaire:0,submitted:0,pendingSubmission:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0,reviewRequired:0,byCountry:{},statesByCountry:{}};
  for(const r of signatures){
    const active=!r.cancelled;
    out.total++;
    out.byCountry[r.country]=(out.byCountry[r.country]||0)+1;
    out.statesByCountry[r.country]??={total:0,assigned:0,scheduled:0,pendingSchedule:0,realized:0,pendingRealization:0,questionnaireCompleted:0,pendingQuestionnaire:0,submitted:0,pendingSubmission:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0};
    const s=out.statesByCountry[r.country];s.total++;
    if(r.assigned&&active){out.assigned++;s.assigned++;}
    if(r.scheduledEvidence&&active){out.scheduled++;s.scheduled++;}
    if(r.assigned&&!r.scheduledEvidence&&!r.realizedEvidence&&active){out.pendingSchedule++;s.pendingSchedule++;}
    if(r.realizedEvidence&&active){out.realized++;s.realized++;}
    if(!r.realizedEvidence&&active){out.pendingRealization++;s.pendingRealization++;}
    if(r.questionnaireEvidence&&active){out.questionnaireCompleted++;s.questionnaireCompleted++;}
    if(r.realizedEvidence&&!r.questionnaireEvidence&&active){out.pendingQuestionnaire++;s.pendingQuestionnaire++;}
    if(r.submittedEvidence&&active){out.submitted++;out.liquidationCandidates++;s.submitted++;s.liquidationCandidates++;}
    if(r.questionnaireEvidence&&!r.submittedEvidence&&active){out.pendingSubmission++;s.pendingSubmission++;}
    if(r.liquidationConfirmed&&active){out.liquidationConfirmed++;s.liquidationConfirmed++;}
    if(r.paymentConfirmed&&active){out.paymentConfirmed++;s.paymentConfirmed++;}
    if(r.reviewRequired)out.reviewRequired++;
  }
  return out;
}
const providerOperationalSummary=summaryFromRows(providerOperationalRows);

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
const page=await context.newPage();
let report=null;
try{
  await page.goto(root+'/?f10content='+Date.now(),{waitUntil:'commit',timeout:60000});
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:60000});
  await page.click('.role-btn[data-role="admin"]');
  await page.waitForSelector('#lgUser',{state:'visible',timeout:15000});
  await page.fill('#lgUser',cred.login);
  await page.fill('#lgPass',cred.password);
  await page.press('#lgPass','Enter');

  let ready=false;
  let last=null;
  const started=Date.now();
  while(Date.now()-started<120000){
    last=await page.evaluate(()=>{
      const c=window.CX?.backendAuth?.context?.()||{};
      const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
      const d=window.CX?.data||{};
      const meta=window.CX_TYA_HR_LIVE_META||{};
      return {
        authenticated:c.authenticated===true,
        role:c.role||null,
        authNamespace:c.authNamespace||null,
        authorityApplied:a.applied===true,
        authorityVisits:Number(a.hrVisits||0),
        authorityPeriods:Number(a.periods||0),
        authorityLatestPeriod:a.latestPeriod||null,
        sourceRevision:d.previewMeta?.sourceRevision||window.CX_TYA_VISIBLE_DATA_CONTRACT?.sourceRevision||null,
        sourceReadAt:meta.sourceReadAt||null,
        cacheOrigin:meta.cacheOrigin||null
      };
    });
    if(last.authenticated&&last.role==='admin'&&last.authorityApplied&&last.authorityVisits>0&&last.authorityPeriods>0&&last.sourceRevision){ready=true;break;}
    await page.waitForTimeout(1000);
  }
  if(!ready)fail('live_gate_prerequisite_timeout:'+clean(JSON.stringify(last||{})));

  const actual=await page.evaluate(focus=>{
    const d=window.CX.data;
    const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
    const meta=window.CX_TYA_HR_LIVE_META||{};
    const str=v=>String(v==null?'':v).trim();
    const lower=v=>str(v).toLowerCase();
    const has=v=>v!==undefined&&v!==null&&str(v)!=='';
    const country=v=>String(v?.country||v?.pais||'unknown').trim().toUpperCase()||'UNKNOWN';
    const period=v=>str(v?.periodKey)||str(v?.projectId).replace(/^cinepolis-/,'');
    const key=v=>str(v?.hrRowId)||((str(v?.sourceTab)&&v?.sourceRow!=null)?`${str(v.sourceTab)}!${v.sourceRow}`:'')||str(v?.id||v?.visitId);
    d.currentProjectId='cinepolis';
    d.currentPeriodId='cinepolis-'+focus;
    if(typeof window.CX_TYA_F10_OPERATIONAL_EVIDENCE?.install==='function')window.CX_TYA_F10_OPERATIONAL_EVIDENCE.install('postdeploy_fresh_row_content_equivalence_gate');
    const k=d.kpis();
    const s=(d.periodOperationalSummary||[]).find(x=>String(x.periodKey)===focus)||null;
    const operational=typeof d.operationalEvidenceFacets==='function'?d.operationalEvidenceFacets:typeof d.visitFacets==='function'?d.visitFacets:null;
    if(typeof operational!=='function')throw new Error('operational_evidence_facets_missing');
    const rowSignatures=(Array.isArray(d._visitas)?d._visitas:[]).filter(v=>period(v)===focus&&!v?._archived).map(v=>{
      const f=operational(v)||{};
      return {
        rowKey:key(v),
        country:country(v),
        sourceRow:Number(v?.sourceRow??0),
        assigned:f.assigned===true,
        scheduledEvidence:f.scheduled===true,
        realizedEvidence:f.realized===true,
        questionnaireEvidence:f.questionnaire===true,
        submittedEvidence:f.submitted===true||v?.submit===true||has(v?.submittedAt)||['confirmed_hr','submitted_by_tya'].includes(lower(v?.submissionState))||f.liquidationConfirmed===true||f.paymentConfirmed===true,
        liquidationConfirmed:f.liquidationConfirmed===true,
        paymentConfirmed:f.paymentConfirmed===true,
        cancelled:f.cancelled===true,
        reviewRequired:v?.reviewRequired===true
      };
    }).sort((x,y)=>String(x.rowKey).localeCompare(String(y.rowKey))||String(x.country).localeCompare(String(y.country))||Number(x.sourceRow||0)-Number(y.sourceRow||0));
    return {
      revision:d.previewMeta?.sourceRevision||window.CX_TYA_VISIBLE_DATA_CONTRACT?.sourceRevision||null,
      sourceReadAt:meta.sourceReadAt||null,
      cacheOrigin:meta.cacheOrigin||null,
      authorityVisits:Number(a.hrVisits||0),
      authorityPeriods:Number(a.periods||0),
      authorityLatestPeriod:a.latestPeriod||null,
      markerVersion:window.CX_TYA_F10_OPERATIONAL_EVIDENCE?.version||null,
      readyVersion:window.CX_TYA_F10_OPERATIONAL_EVIDENCE_READY?.version||null,
      periodId:d.currentPeriodId,
      kpis:{
        total:k.total?.t,
        realizadas:k.realizadas?.t,
        pendRealizar:k.pendRealizar?.t,
        sinAgendar:k.sinAgendar?.t,
        cuestPend:k.cuestPend?.t,
        sinSubmitir:k.sinSubmitir?.t,
        liquidationCandidates:k.liquidationCandidates?.t,
        liquidadas:k.liquidadas?.t
      },
      summary:s,
      rowSignatures
    };
  },fresh.focus.periodKey);

  if(actual.authorityVisits!==Number(fresh.inventory?.visitCount||0))fail('live_authority_visit_count_mismatch:'+actual.authorityVisits+'/'+fresh.inventory?.visitCount);
  if(actual.authorityPeriods!==Number(fresh.inventory?.periodCount||0))fail('live_authority_period_count_mismatch:'+actual.authorityPeriods+'/'+fresh.inventory?.periodCount);
  if(actual.authorityLatestPeriod!==fresh.inventory?.latestPeriodKey)fail('live_authority_latest_period_mismatch:'+actual.authorityLatestPeriod+'/'+fresh.inventory?.latestPeriodKey);
  for(const [k,v] of Object.entries(expected))if(Number(actual.kpis[k])!==Number(v))fail('live_kpi_mismatch_'+k+':'+actual.kpis[k]+'/'+v);
  if(actual.markerVersion!=='f10-operational-evidence-v1'||actual.readyVersion!=='f10-operational-evidence-v1')fail('f10_runtime_marker_missing');
  if(!Array.isArray(actual.rowSignatures)||actual.rowSignatures.length!==providerOperationalRows.length)fail('live_operational_row_count_mismatch:'+String(actual.rowSignatures?.length??-1)+'/'+providerOperationalRows.length);
  if(actual.rowSignatures.some(r=>!r.rowKey))fail('live_operational_row_key_missing');
  if(new Set(actual.rowSignatures.map(r=>r.rowKey)).size!==actual.rowSignatures.length)fail('live_operational_row_key_duplicate');
  const liveOperationalDigest=digest(actual.rowSignatures);
  if(liveOperationalDigest!==providerOperationalDigest)fail('live_operational_row_digest_mismatch:'+liveOperationalDigest+'/'+providerOperationalDigest);
  const summaryKeys=['total','assigned','scheduled','pendingSchedule','realized','pendingRealization','questionnaireCompleted','pendingQuestionnaire','submitted','pendingSubmission','liquidationCandidates','liquidationConfirmed','paymentConfirmed','reviewRequired'];
  for(const k of summaryKeys)if(Number(actual.summary?.[k]??-1)!==Number(providerOperationalSummary[k]))fail('live_operational_summary_mismatch_'+k+':'+String(actual.summary?.[k])+'/'+String(providerOperationalSummary[k]));
  if(JSON.stringify(actual.summary?.byCountry||{})!==JSON.stringify(providerOperationalSummary.byCountry))fail('live_operational_country_totals_mismatch');
  for(const [c,expectedCountry] of Object.entries(providerOperationalSummary.statesByCountry)){
    const got=actual.summary?.statesByCountry?.[c]||{};
    for(const k of Object.keys(expectedCountry))if(Number(got?.[k]??-1)!==Number(expectedCountry[k]))fail('live_operational_country_summary_mismatch_'+c+'_'+k+':'+String(got?.[k])+'/'+String(expectedCountry[k]));
  }

  const revisionRelation=actual.revision===fresh.provider.revision?'same_refresh_token':'different_refresh_token_row_content_equivalent';
  report={
    schemaVersion:'cxorbia.f10.live-admin-fresh-content-equivalence.v2',
    generatedAt:new Date().toISOString(),
    decision:'PASS_F10_LIVE_ADMIN_FRESH_CONTENT_EQUIVALENCE',
    periodKey:fresh.focus.periodKey,
    providerFresh:{revision:fresh.provider.revision,sourceReadAt:fresh.provider.sourceReadAt,cacheOrigin:fresh.provider.cacheOrigin,focusDigestSha256:fresh.focus.digestSha256,operationalEvidenceDigestSha256:providerOperationalDigest,operationalRowCount:providerOperationalRows.length,visitCount:fresh.inventory.visitCount,periodCount:fresh.inventory.periodCount,latestPeriodKey:fresh.inventory.latestPeriodKey},
    liveBrowser:{revision:actual.revision,sourceReadAt:actual.sourceReadAt,cacheOrigin:actual.cacheOrigin,revisionRelation,authorityVisits:actual.authorityVisits,authorityPeriods:actual.authorityPeriods,authorityLatestPeriod:actual.authorityLatestPeriod,periodId:actual.periodId,operationalEvidenceDigestSha256:liveOperationalDigest,operationalRowCount:actual.rowSignatures.length,rowDigestMatch:true,summaryCountsMatch:true,expectedKpis:expected,actualKpis:actual.kpis,summary:actual.summary,markerVersion:actual.markerVersion,readyVersion:actual.readyVersion},
    interpretation:{exactRevisionTokenEqualityRequired:false,rowLevelOperationalDigestRequired:true,contentAuthority:'fresh_provider_row_level_digest_plus_live_admin_row_digest_and_kpi_equivalence',crossRefreshTokenDifferenceIsBlocker:false},
    safety:{browserReadOnly:true,providerReads:true,providerWrites:0,dataWrites:0,repositoryWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,merge:false,production:false,credentialsExposed:false,tokensExposed:false}
  };
  write(report);
  console.log(JSON.stringify({decision:report.decision,periodKey:report.periodKey,revisionRelation,rowDigestMatch:true,operationalEvidenceDigestSha256:liveOperationalDigest,expectedKpis:expected,actualKpis:actual.kpis,providerRevision:fresh.provider.revision,browserRevision:actual.revision},null,2));
} catch(error){
  report={schemaVersion:'cxorbia.f10.live-admin-fresh-content-equivalence.failure.v2',generatedAt:new Date().toISOString(),decision:'HOLD_F10_LIVE_ADMIN_FRESH_CONTENT_EQUIVALENCE',error:clean(error?.message||error),periodKey:fresh.focus?.periodKey||null,safety:{browserReadOnly:true,providerReads:true,providerWrites:0,dataWrites:0,repositoryWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,merge:false,production:false,credentialsExposed:false,tokensExposed:false}};
  write(report);
  console.error(report.error);
  process.exitCode=1;
} finally {
  await browser.close();
}
