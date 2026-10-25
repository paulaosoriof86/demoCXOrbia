#!/usr/bin/env node
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const OUT=String(process.env.PREI4_004_OUT||'.tmp/prei4-admin-004-finance');
const ROOT=String(process.env.PREI4_004_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.PREI4_004_HR_REVISION||'');
const SOURCE=String(process.env.PREI4_004_SOURCE||'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
fs.mkdirSync(OUT,{recursive:true});
const write=(n,v)=>fs.writeFileSync(OUT+'/'+n,JSON.stringify(v,null,2)+'\n');
if(!/^[a-f0-9]{40}$/.test(SOURCE)||!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('ENVIRONMENT_FAILURE:PREI4_004_ENV');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);

const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?fresh=1&prei4004='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrRes.ok)throw new Error('PROVIDER_FAILURE:PREI4_004_HR_HTTP_'+hrRes.status);
const hrBody=await hrRes.json(),hr=hrBody?.snapshot||hrBody?.data||hrBody,runtime=hrBody?._runtime||hr?._runtime||{};
const revision=str(runtime.revision||hr.revision||hr.sourceRevision),refreshError=runtime.refreshError??runtime.lastRefreshError??hr.refreshError??hr.lastRefreshError??null;
if(revision!==EXPECTED_HR||refreshError!==null)throw new Error('SOURCE_FAILURE:PREI4_004_HR_AUTHORITY');

const projectSnap=await project.get(),projectData=projectSnap.exists?(projectSnap.data()||{}):{};
const visitDocs=(await project.collection('visits').where('periodId','==',PERIOD).get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));
const lots=(await tenant.collection('paymentLots').where('periodId','==',PERIOD).get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));
const movements=(await tenant.collection('financialMovements').where('periodId','==',PERIOD).get()).docs.map(d=>({docId:d.id,...(d.data()||{})}));

const configCandidates={
  projectHonorario:projectData.honorario??projectData.honorarium??projectData.financial?.honorario??projectData.finance?.honorario??null,
  projectCurrency:projectData.currency??projectData.currencies??projectData.financial?.currency??projectData.finance?.currency??null,
  projectFinancial:projectData.financial??projectData.finance??null
};

const hrSep=arr(hr.visits).filter(v=>str(v.periodKey)==='2026-09');
const hrSubmitted=hrSep.filter(v=>v?.canonicalFacets?.submitted===true);
const hrHonorariumKnown=hrSubmitted.filter(v=>num(v.honorario)!==null);
const hrHonorariumMissing=hrSubmitted.filter(v=>num(v.honorario)===null);

const durable=visitDocs.map(v=>{
  const honorario=num(v.honorario),boleto=num(v.boleto),combo=num(v.comboAmt),financialMatch=v.financialMatch??v.financeMatch??v.financialSourceRef??null;
  return {
    id:v.docId,country:str(v.pais||v.country),currency:str(v.currency||v.moneda),status:str(v.estado||v.status),
    honorario,boleto,combo,financialMatch:!!financialMatch,
    financialSourceStatus:str(v.financialSourceStatus),liquidationState:str(v.liquidationState),paymentState:str(v.paymentState),
    paymentSourceRef:str(v.paymentSourceRef),loteId:str(v.loteId),submittedAt:str(v.submittedAt),hrRowId:str(v.hrRowId)
  };
});
const durableSubmitted=durable.filter(v=>['submitida','liquidada','pagada'].includes(v.status.toLowerCase())||v.submittedAt);
const durableFinancialMatch=durableSubmitted.filter(v=>v.financialMatch);
const durableHonorariumKnown=durableSubmitted.filter(v=>v.honorario!==null);
const lotCandidates=durableSubmitted.filter(v=>v.honorario!==null&&v.currency&&v.country&&!v.loteId);

const applySrc=fs.readFileSync('app/adapters/tya-live-source-inplace-apply.js','utf8');
const financeModelSrc=fs.readFileSync('app/adapters/tya-canonical-finance-read-model-v2.js','utf8');
const providerSrc=fs.readFileSync('backend/runtime/cxorbia-finance-command-provider-v1.mjs','utf8');
const financeUiSrc=fs.readFileSync('app/modules/finanzas.js','utf8');

const sourceFacts={
  liveApplyUsesProjectHonorariumFallback:/projectConfig\?\.honorario|configuredHonorario/.test(applySrc)&&/project_country_config/.test(applySrc),
  liveApplyMissingHonorariumBecomesPending:/honorarioSource=honorarioKnown\?'hr_explicit':'pending_source'/.test(applySrc),
  canonicalFinanceRequiresVisitHonorarium:/honorarioKnown=v\.honorarioSourceKnown===true/.test(financeModelSrc),
  canonicalFinanceCanReadExactMatch:/financialMatchForVisit/.test(financeModelSrc),
  providerCommandTypes:(providerSrc.match(/COMMAND_TYPES=Object\.freeze\((\[[^\]]*\])\)/)||[])[1]||null,
  providerHasReconciliationCommand:/reconcil/i.test((providerSrc.match(/COMMAND_TYPES[\s\S]{0,500}/)||[''])[0]),
  uiHasReconciliationCommand:/financialMatch|conciliar|reconcili/i.test(financeUiSrc)&&/command/i.test(financeUiSrc)
};

const testRun=spawnSync(process.execPath,['--test','backend/runtime/hr-live-service/test/cxorbia-pre-i4-finance-live-source-honorarium.test.mjs'],{encoding:'utf8'});
fs.writeFileSync(OUT+'/existing-finance-honorarium-test.log',(testRun.stdout||'')+'\n'+(testRun.stderr||''));
const testFacts={exitCode:testRun.status,pass:/# pass\s+6/.test(testRun.stdout||''),fail:/# fail\s+[1-9]/.test(testRun.stdout||'')};

const rootCauses=[];
if(hrHonorariumMissing.length>0&&!sourceFacts.liveApplyUsesProjectHonorariumFallback)rootCauses.push('LIVE_HR_ADAPTER_DROPS_CONFIGURED_PROJECT_COUNTRY_HONORARIUM_FALLBACK');
if(durableFinancialMatch.length===0&&!sourceFacts.providerHasReconciliationCommand)rootCauses.push('NO_DURABLE_FINANCIAL_RECONCILIATION_COMMAND_TO_CREATE_EXACT_MATCH');
if(testFacts.exitCode!==0)rootCauses.push('EXISTING_FINANCE_HONORARIUM_CONTRACT_TEST_FAILS_ON_CURRENT_SOURCE');
if(durableSubmitted.length>0&&lotCandidates.length===0)rootCauses.push('SUBMITTED_DURABLE_VISITS_CANNOT_BECOME_VALID_LOT_CANDIDATES');

const result={
  schemaVersion:'cxorbia.prei4.admin004.finance-forensic.v1',
  decision:rootCauses.length?'PASS_PREI4_ADMIN_004_ROOT_CAUSE_PROVEN':'HOLD_PREI4_ADMIN_004_ROOT_CAUSE_NOT_PROVEN',
  sourceSha:SOURCE,hrRevision:revision,refreshError,readOnly:true,writes:0,deploys:0,production:false,
  counts:{
    hrSeptember:hrSep.length,hrSubmitted:hrSubmitted.length,hrHonorariumKnown:hrHonorariumKnown.length,hrHonorariumMissing:hrHonorariumMissing.length,
    durableVisits:durable.length,durableSubmitted:durableSubmitted.length,durableHonorariumKnown:durableHonorariumKnown.length,
    durableFinancialMatch:durableFinancialMatch.length,lotCandidates:lotCandidates.length,paymentLots:lots.length,financialMovements:movements.length
  },
  projectConfig:configCandidates,
  sourceFacts,testFacts,rootCauses,
  safeSamples:{
    durableSubmitted:durableSubmitted.slice(0,8).map(v=>({id:v.id,country:v.country,currency:v.currency,honorario:v.honorario,financialMatch:v.financialMatch,financialSourceStatus:v.financialSourceStatus,liquidationState:v.liquidationState,paymentState:v.paymentState,loteId:v.loteId,hrRowId:v.hrRowId}))
  }
};
write('result.json',result);
console.log(JSON.stringify({decision:result.decision,counts:result.counts,sourceFacts:result.sourceFacts,testFacts:result.testFacts,rootCauses},null,2));
if(result.decision!=='PASS_PREI4_ADMIN_004_ROOT_CAUSE_PROVEN')process.exit(1);
