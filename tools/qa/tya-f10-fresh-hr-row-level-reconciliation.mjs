#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { deriveCanonicalVisitState } from '../hr-source/tya-canonical-visit-state-r20.mjs';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const requestPath=arg('--request','.github/cxorbia-gate-requests/request.json');
const outDir=arg('--out','.tmp/cxorbia-readonly-post-gates-runner/f10-fresh-hr-row-level');
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
const root=String(request.devRootUrl||process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const focus=String(request.periodFocus||'').trim();
const endpoint=new URL(`${root}/api/tya/cinepolis/hr-live`);
endpoint.searchParams.set('fresh','1');
endpoint.searchParams.set('_f10nonce',`${Date.now()}-${crypto.randomBytes(8).toString('hex')}`);

const blockers=[];
const warnings=[];
const checks=[];
const add=(arr,code,detail='')=>arr.push(detail?`${code}:${detail}`:code);
const check=(cond,code,detail='')=>{if(cond)checks.push(detail?`${code}:${detail}`:code);else add(blockers,code,detail);};
const bool=v=>v===true;
const countryOf=v=>String(v?.country||v?.pais||'unknown').trim().toUpperCase()||'unknown';
const rowKey=v=>[v?.tenantId||'tya',v?.projectId||'cinepolis',v?.periodKey||'',countryOf(v),v?.sourceRow??''].join('|');
const facetShape=d=>({
  available:bool(d.available),
  eligibilityBlocked:!bool(d.available)&&!bool(d.assigned),
  assigned:bool(d.assigned),
  scheduled:bool(d.scheduled),
  realized:bool(d.realized),
  questionnaire:bool(d.questionnaireCompleted),
  submitted:bool(d.submitted),
  outOfRange:bool(d.outOfRange),
  cancelled:bool(d.cancelled),
  liquidationCandidate:bool(d.liquidationCandidate),
  liquidationConfirmed:bool(d.liquidationConfirmed),
  paymentConfirmed:bool(d.paymentConfirmed)
});
const sameFacets=(a,b)=>Object.keys(a).every(k=>bool(a[k])===bool(b?.[k]));
const blankSummary=()=>({total:0,available:0,eligibilityBlocked:0,assigned:0,unassigned:0,scheduled:0,pendingSchedule:0,realized:0,pendingRealization:0,questionnaireCompleted:0,pendingQuestionnaire:0,submitted:0,pendingSubmission:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0,outOfRange:0,cancelled:0,reviewRequired:0});
function accumulate(s,v,d){
  s.total++;
  s.available+=d.available?1:0;
  s.eligibilityBlocked+=(!d.available&&!d.assigned)?1:0;
  s.assigned+=d.assigned?1:0;
  s.unassigned+=d.assigned?0:1;
  s.scheduled+=d.scheduled?1:0;
  s.pendingSchedule+=(d.assigned&&!d.scheduled&&!d.realized&&!d.cancelled)?1:0;
  s.realized+=d.realized?1:0;
  s.pendingRealization+=(!d.realized&&!d.cancelled)?1:0;
  s.questionnaireCompleted+=d.questionnaireCompleted?1:0;
  s.pendingQuestionnaire+=(d.realized&&!d.questionnaireCompleted&&!d.cancelled)?1:0;
  s.submitted+=d.submitted?1:0;
  s.pendingSubmission+=(d.questionnaireCompleted&&!d.submitted&&!d.cancelled)?1:0;
  s.liquidationCandidates+=d.liquidationCandidate?1:0;
  s.liquidationConfirmed+=d.liquidationConfirmed?1:0;
  s.paymentConfirmed+=d.paymentConfirmed?1:0;
  s.outOfRange+=d.outOfRange?1:0;
  s.cancelled+=d.cancelled?1:0;
  s.reviewRequired+=v?.reviewRequired===true?1:0;
}
function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8');}

check(request.schemaVersion==='cxorbia.readonly-post-gates-request.v1','request_schema_valid');
check(request.enabled===true,'request_enabled');
check(request.profile==='CORTE3_FINANCIAL_RECONCILIATION_R20','existing_profile_exact');
check(request.diagnosticMode==='F10_INDEPENDENT_PROVIDER_LIVE_REBUILD_AND_ROW_IDENTITY_RECONCILIATION','f10_diagnostic_mode_exact');
check(request.repository==='paulaosoriof86/demoCXOrbia','repository_exact');
check(request.branch==='docs-tya-v6-v71-audit','branch_exact');
check(request.providerReads===true&&request.providerWrites===false,'provider_readonly');
check(request.repositoryWrites===false&&request.dataWrites===false,'repository_and_data_writes_forbidden');
check(request.deploy===false&&request.merge===false&&request.production===false,'deploy_merge_production_forbidden');
check(Boolean(focus),'period_focus_present');

const controller=new AbortController();
const timer=setTimeout(()=>controller.abort(),180000);
let response,payload;
const startedAt=new Date().toISOString();
try{
  response=await fetch(endpoint,{method:'GET',headers:{Accept:'application/json','Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'},redirect:'follow',signal:controller.signal});
  const text=await response.text();
  if(!response.ok)throw new Error(`fresh_provider_http_${response.status}:${text.slice(0,800)}`);
  const type=response.headers.get('content-type')||'';
  if(!type.includes('application/json'))throw new Error(`fresh_provider_content_type:${type}`);
  payload=JSON.parse(text);
}catch(error){
  add(blockers,'fresh_provider_read_failed',String(error?.message||error));
}finally{clearTimeout(timer);}

let report;
if(payload){
  const runtime=payload._runtime||{};
  const revisionHeader=String(response.headers.get('x-cxorbia-source-revision')||'');
  const sourceReadHeader=String(response.headers.get('x-cxorbia-source-read-at')||'');
  const cacheOriginHeader=String(response.headers.get('x-cxorbia-cache-origin')||'');
  const visits=Array.isArray(payload.visits)?payload.visits:[];
  const periods=Array.isArray(payload.periods)?payload.periods:[];
  const periodKeys=periods.map(p=>String(p?.key||'')).filter(Boolean).sort();
  const latestPeriodKey=periodKeys.at(-1)||null;
  const keySeen=new Set();
  const duplicateRowKeys=[];
  const canonicalFacetMismatches=[];
  const allSummary=blankSummary();
  const focusSummary=blankSummary();
  const focusByCountry={};
  const focusRows=[];

  for(const visit of visits){
    const key=rowKey(visit);
    if(keySeen.has(key))duplicateRowKeys.push(key); else keySeen.add(key);
    const derived=deriveCanonicalVisitState(visit);
    const expected=facetShape(derived);
    const current=visit?.canonicalFacets||null;
    if(!current||!sameFacets(expected,current))canonicalFacetMismatches.push({rowKey:key,periodKey:visit?.periodKey||null,country:countryOf(visit),sourceRow:visit?.sourceRow??null,expected,current:current?Object.fromEntries(Object.keys(expected).map(k=>[k,bool(current[k])])):null});
    accumulate(allSummary,visit,derived);
    if(String(visit?.periodKey||'')===focus){
      accumulate(focusSummary,visit,derived);
      const country=countryOf(visit);
      focusByCountry[country]??=blankSummary();
      accumulate(focusByCountry[country],visit,derived);
      focusRows.push({
        visitId:String(visit?.id||visit?.visitId||''),
        hrRowId:String(visit?.hrRowId||''),
        sourceTab:String(visit?.sourceTab||''),
        sourceRow:visit?.sourceRow??null,
        country,
        assigned:derived.assigned,
        scheduledEvidence:Boolean(visit?.agendada),
        realizedEvidence:Boolean(visit?.realizada),
        questionnaireEvidence:Boolean(visit?.cuestFecha),
        submittedEvidence:Boolean(visit?.submittedAt)||['confirmed_hr','submitted_by_tya'].includes(String(visit?.submissionState||'').toLowerCase()),
        canonical:{
          available:derived.available,
          assigned:derived.assigned,
          scheduled:derived.scheduled,
          pendingSchedule:derived.assigned&&!derived.scheduled&&!derived.realized&&!derived.cancelled,
          realized:derived.realized,
          pendingRealization:!derived.realized&&!derived.cancelled,
          questionnaireCompleted:derived.questionnaireCompleted,
          pendingQuestionnaire:derived.realized&&!derived.questionnaireCompleted&&!derived.cancelled,
          submitted:derived.submitted,
          pendingSubmission:derived.questionnaireCompleted&&!derived.submitted&&!derived.cancelled,
          liquidationCandidate:derived.liquidationCandidate,
          liquidationConfirmed:derived.liquidationConfirmed,
          paymentConfirmed:derived.paymentConfirmed,
          outOfRange:derived.outOfRange,
          cancelled:derived.cancelled,
          presentationState:derived.presentationState,
          operationalStage:derived.operationalStage
        },
        reviewRequired:visit?.reviewRequired===true,
        reviewReasons:Array.isArray(visit?.reviewReasons)?visit.reviewReasons.slice():[]
      });
    }
  }

  focusRows.sort((a,b)=>a.country.localeCompare(b.country)||Number(a.sourceRow||0)-Number(b.sourceRow||0)||a.hrRowId.localeCompare(b.hrRowId));
  const focusDigest=crypto.createHash('sha256').update(JSON.stringify(focusRows)).digest('hex');
  const sourceReadAt=String(runtime.sourceReadAt||sourceReadHeader||'');
  const sourceReadMs=Date.parse(sourceReadAt);
  const sourceAgeMs=Number.isFinite(sourceReadMs)?Math.max(0,Date.now()-sourceReadMs):null;

  check(runtime.sourceSafe===true,'runtime_source_safe');
  check(runtime.runtimeRead===true,'runtime_read_true');
  check(runtime.revisionStable===true,'runtime_revision_stable');
  check(Boolean(runtime.revision),'runtime_revision_present');
  check(revisionHeader===String(runtime.revision||''),'revision_header_matches_runtime');
  check(Boolean(sourceReadAt),'source_read_at_present');
  check(sourceReadHeader===sourceReadAt,'source_read_header_matches_runtime');
  check(String(runtime.cacheOrigin||'')==='runtime_refresh','fresh_cache_origin_runtime_refresh',String(runtime.cacheOrigin||''));
  check(cacheOriginHeader===String(runtime.cacheOrigin||''),'cache_origin_header_matches_runtime');
  check(sourceAgeMs!==null&&sourceAgeMs<=30000,'fresh_source_read_age_le_30s',String(sourceAgeMs));
  check(visits.length>0,'visits_present',String(visits.length));
  check(periods.length>0,'periods_present',String(periods.length));
  check(periodKeys.includes(focus),'focus_period_present',focus);
  check(focusSummary.total>0,'focus_period_has_visits',String(focusSummary.total));
  check(duplicateRowKeys.length===0,'stable_row_identity_unique',String(duplicateRowKeys.length));
  check(canonicalFacetMismatches.length===0,'provider_facets_match_independent_r20',String(canonicalFacetMismatches.length));
  check(focusSummary.submitted===focusSummary.liquidationCandidates,'submitted_equals_liquidation_candidates',`${focusSummary.submitted}/${focusSummary.liquidationCandidates}`);
  check(focusSummary.paymentConfirmed<=focusSummary.liquidationCandidates,'payment_not_above_candidates',`${focusSummary.paymentConfirmed}/${focusSummary.liquidationCandidates}`);

  report={
    schemaVersion:'cxorbia.f10.fresh-hr-row-level-reconciliation.v1',
    generatedAt:new Date().toISOString(),
    startedAt,
    decision:blockers.length?'HOLD_F10_FRESH_HR_ROW_LEVEL_RECONCILIATION':'PASS_F10_FRESH_HR_ROW_LEVEL_RECONCILIATION',
    ok:blockers.length===0,
    requestId:request.requestId,
    activeIncident:request.activeIncident||null,
    tenantId:request.tenantId||'tya',
    projectId:request.projectId||'cinepolis',
    endpointPath:'/api/tya/cinepolis/hr-live?fresh=1',
    freshRequested:true,
    provider:{
      revision:runtime.revision||null,
      sourceReadAt,
      sourceAgeMs,
      cacheOrigin:runtime.cacheOrigin||null,
      cacheAgeMs:runtime.cacheAgeMs??null,
      generatedAt:runtime.generatedAt||payload.generatedAt||null,
      tabRegistryMode:runtime.tabRegistryMode||null,
      tabRegistryAutoDiscovery:runtime.tabRegistryAutoDiscovery===true,
      tabRegistryObservedAt:runtime.tabRegistryObservedAt||null,
      responseHeaders:{revision:revisionHeader,sourceReadAt:sourceReadHeader,cacheOrigin:cacheOriginHeader}
    },
    inventory:{periodCount:periods.length,visitCount:visits.length,periodKeys,latestPeriodKey,duplicateRowKeys:duplicateRowKeys.length},
    focus:{periodKey:focus,digestSha256:focusDigest,summary:focusSummary,byCountry:focusByCountry,rowCount:focusRows.length,rows:focusRows},
    allPeriodsSummary:allSummary,
    independentCanonicalComparison:{mismatchCount:canonicalFacetMismatches.length,mismatches:canonicalFacetMismatches.slice(0,100)},
    checks,
    blockers,
    warnings,
    safety:{providerReads:true,providerWrites:0,repositoryWrites:0,businessDataWrites:0,authWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,rebuilds:0,reimports:0,merge:false,productionMutation:false,piiOutput:false,credentialsExposed:false}
  };
}else{
  report={schemaVersion:'cxorbia.f10.fresh-hr-row-level-reconciliation.failure.v1',generatedAt:new Date().toISOString(),startedAt,decision:'HOLD_F10_FRESH_HR_ROW_LEVEL_RECONCILIATION',ok:false,requestId:request.requestId,checks,blockers,warnings,safety:{providerReads:true,providerWrites:0,repositoryWrites:0,businessDataWrites:0,authWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,rebuilds:0,reimports:0,merge:false,productionMutation:false,piiOutput:false,credentialsExposed:false}};
}

writeJson(path.join(outDir,'report.json'),report);
fs.writeFileSync(path.join(outDir,'summary.md'),[
  '# F10 fresh HR row-level reconciliation','',
  `Decision: **${report.decision}**`,
  `Request: \`${report.requestId||'n/a'}\``,
  `Revision: \`${report.provider?.revision||'n/a'}\``,
  `sourceReadAt: \`${report.provider?.sourceReadAt||'n/a'}\``,
  `Focus: \`${report.focus?.periodKey||focus||'n/a'}\``,
  `Rows: \`${report.focus?.rowCount??'n/a'}\``,
  '',
  '## Focus summary','',
  '```json',JSON.stringify(report.focus?.summary||null,null,2),'```','',
  '## By country','',
  '```json',JSON.stringify(report.focus?.byCountry||null,null,2),'```','',
  '## Blockers','',...(report.blockers?.length?report.blockers.map(x=>`- ${x}`):['- none']),'',
  'Read-only provider observation. No business/Auth/HR/payment writes, deploy, merge or production mutation.'
].join('\n')+'\n','utf8');

console.log(JSON.stringify({decision:report.decision,ok:report.ok,revision:report.provider?.revision||null,sourceReadAt:report.provider?.sourceReadAt||null,periodKey:report.focus?.periodKey||focus||null,summary:report.focus?.summary||null,byCountry:report.focus?.byCountry||null,blockers:report.blockers||[]},null,2));
if(!report.ok)process.exit(1);
