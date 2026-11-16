#!/usr/bin/env node
// VRM356: raw Google Sheets range headers only, before the existing paired build.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {b14PrincipalOf} from './cxorbia-i3-hr-ack-exact-same-revision.mjs';
import {pathToFileURL} from 'node:url';
const descriptor=JSON.parse(fs.readFileSync(process.env.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const request=descriptor.vrm356FreshReadPreflight;
if(request?.enabled!==true){console.log('VRM356_RANGE_PREFLIGHT_NOT_REQUESTED');process.exit(0);}
const hash=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
const root=process.env.SOURCE_DIR,out=process.env.FOCAL_OUT;
if(process.env.PROJECT!=='cxorbia-backend-dev'||!root||!out||process.env.FOCAL_SOURCE!==descriptor.productSourceSha||request.sourceSha!==descriptor.productSourceSha||request.sourceTree!==descriptor.productTreeAuthority)throw Error('VRM356_PREFLIGHT_SCOPE_MISMATCH');
const runtime=JSON.parse(fs.readFileSync(path.join(out,'runtime-before.json'),'utf8'));
const runtimeEnv=Object.fromEntries((runtime.spec?.template?.spec?.containers?.[0]?.env||[]).filter(x=>typeof x.value==='string').map(x=>[x.name,x.value]));
const {resolveLiveMonthTabs}=await import(pathToFileURL(path.join(root,'tools/hr-source/tya-resolve-live-month-tabs.mjs')));
const report={schemaVersion:'cxorbia.i3.vrm356.raw-range-preflight.v1',runId:process.env.GITHUB_RUN_ID,sourceSha:request.sourceSha,sourceTree:request.sourceTree,scope:'BOUNDED_METADATA_AND_RANGE_HEADERS_ONLY_NOT_HR_CONTENT_OR_CERTIFICATION',production:false,hrWrites:0,firestoreWrites:0,authWrites:0,builds:0,deploys:0,readers:[]};
const safeRange=value=>{
  const text=String(value||''),split=text.lastIndexOf('!');let title=text.slice(0,split);
  if(title.startsWith("'")&&title.endsWith("'"))title=title.slice(1,-1).replace(/''/g,"'");
  return {titleSha256:hash(title),bounds:split>=0?text.slice(split+1).replace(/[^A-Za-z0-9:$]/g,'?').slice(0,80):null,present:split>0};
};
try{

 const requireHere=createRequire(import.meta.url),requireAdmin=createRequire(requireHere.resolve('firebase-admin/app'));
 const {GoogleAuth,Impersonated}=requireAdmin('google-auth-library');
 const spec=runtime.spec?.template?.spec,principal=String(spec?.serviceAccountName||'').trim();
 const env=spec?.containers?.[0]?.env||[];
 if(!principal||spec?.containers?.length!==1)throw Error('VRM356_RUNTIME_READER_UNRESOLVED');
 if(env.some(x=>x.name==='FIREBASE_SERVICE_ACCOUNT_JSON'&&(x.valueFrom||String(x.value||'').trim())))throw Error('VRM356_READER_CREDENTIAL_OVERRIDE_UNRESOLVED');
 const scopes=['https://www.googleapis.com/auth/spreadsheets.readonly'],adc=await new GoogleAuth({scopes}).getClient(),adcPrincipal=await b14PrincipalOf(adc),usesImpersonation=adcPrincipal!==principal;
 const client=usesImpersonation?new Impersonated({sourceClient:await new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}).getClient(),targetPrincipal:principal,targetScopes:scopes,lifetime:600}):adc;
 const issued=await client.getAccessToken(),token=typeof issued==='string'?issued:issued?.token;
 if(!token)throw Error('VRM356_READER_TOKEN_MISSING');
 report.readerAuth={requestedScopes:scopes,runtimePrincipalSha256:hash(principal),adcPrincipalSha256:adcPrincipal?hash(adcPrincipal):null,usesImpersonation,tokenIssued:true};
 const productionBytes=fs.readFileSync(path.join(out,'production-before.html'));
 report.productionObservation={sha256:crypto.createHash('sha256').update(productionBytes).digest('hex'),byteLength:productionBytes.length,kind:'EXACT_EXISTING_PAIRED_STEP_HTTP_RESPONSE_BYTES_READ_ONLY'};

 for(const rel of ['tools/hr-source/tya-live-provider-registry-identity-dev.mjs','tools/hr-source/tya-build-live-hr-source-safe-r20.mjs']){
  const text=fs.readFileSync(path.join(root,rel),'utf8'),sourceBlob=crypto.createHash('sha1').update('blob '+Buffer.byteLength(text)+'\0').update(text).digest('hex');
  if(request.ownerBlobs?.[rel]!==sourceBlob)throw Error('VRM356_PREFLIGHT_OWNER_MISMATCH');
  const sheetId=runtimeEnv.CXORBIA_HR_LIVE_SHEET_ID||text.match(/const SHEET_ID=[^\n]*\|\|'([^']+)'/)[1];
  if(hash(sheetId)!==request.workbookRefSha256)throw Error('VRM356_PREFLIGHT_WORKBOOK_BINDING_MISMATCH');
  const maxRow=Number(runtimeEnv.CXORBIA_HR_LIVE_MAX_ROW||140),maxCol=runtimeEnv.CXORBIA_HR_LIVE_MAX_COL||'AI';
  if(!Number.isInteger(maxRow)||maxRow<1||maxRow>10000||!/^[A-Z]{1,3}$/.test(maxCol))throw Error('VRM356_PREFLIGHT_RANGE_LIMIT_INVALID');
  const start=text.indexOf('function hrRangeBatches('),end=text.indexOf('function reportHrSourceFailure(',start);
  if(start<0||end<start)throw Error('VRM356_PREFLIGHT_HELPER_NOT_FOUND');
  const stats={attempts:0,successfulRequests:0,quotaRetries:0,responseBytes:0};
  const helpers=new Function('HR_SHEETS_READ_DEADLINE','HR_SHEETS_READ_STATS',text.slice(start,end)+'\nreturn {hrRangeBatches,hrRangeForTab,validateHrRangeResponse,readSheetsJson};')(performance.now()+75000,stats);
  const base='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId);
  const read=suffix=>helpers.readSheetsJson(base+suffix,{headers:{Authorization:'Bearer '+token,'Cache-Control':'no-store'}});
  const meta=await read('?fields=properties(title),sheets(properties(title,index,gridProperties(rowCount,columnCount)))');
  const tabs=resolveLiveMonthTabs((meta.sheets||[]).map(s=>({title:s.properties?.title,index:s.properties?.index})));
  if(!tabs.length)throw Error('VRM356_PREFLIGHT_NO_MONTHLY_TABS');
  const ordered=rel.includes('registry-identity')?[...tabs].sort((a,b)=>String(a.key||a.periodKey).localeCompare(String(b.key||b.periodKey))||a.country.localeCompare(b.country)):tabs;
  const rangeForTab=tab=>helpers.hrRangeForTab(tab.tabTitle,meta,maxCol,maxRow);
  const item={owner:rel,ownerBlob:sourceBlob,tabCount:ordered.length,batches:[],stats,pass:true};report.readers.push(item);
  for(const batch of helpers.hrRangeBatches(ordered,rangeForTab)){
    const ranges=batch.map(rangeForTab),query=ranges.map(r=>'ranges='+encodeURIComponent(r)).join('&');
    const data=await read('/values:batchGet?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&fields=valueRanges(range,majorDimension)&'+query);
    const entry={requested:ranges.length,received:data.valueRanges?.length??null,rangeHeaders:(data.valueRanges||[]).map((r,i)=>({index:i,expected:safeRange(ranges[i]),actual:safeRange(r.range),majorDimension:r.majorDimension||null,grid:(meta.sheets||[]).find(s=>s.properties?.title===batch[i]?.tabTitle)?.properties?.gridProperties||null}))};
    item.batches.push(entry);
    try{helpers.validateHrRangeResponse(data,ranges);}catch(error){entry.error=String(error.message).split(':')[0];item.pass=false;}
  }
 }
 report.pass=report.readers.every(x=>x.pass);report.decision=report.pass?'PASS_RAW_RANGE_HEADERS_NOT_HR_CONTENT':'HOLD_RAW_RANGE_MISMATCH_NO_BUILD_OR_DEPLOY';

 report.knownFailedPredecessor=false;
 if(report.pass&&descriptor.pendingDevSuccessor?.servingPairedMaterialization?.decision==='HOLD_EXACT_DEV_DEPLOYED_HR_RANGE_READ_FAILED'){
  const url=String(runtime.status?.url||'');
  if(!/^https:\/\/[a-z0-9.-]+\.run\.app$/.test(url))throw Error('VRM356_PREDECESSOR_RUNTIME_URL_INVALID');
  const hr=await fetch(url+'/api/'+encodeURIComponent(process.env.TENANT_ID) +'/'+encodeURIComponent(process.env.PROJECT_ID)+'/hr-live?format=meta&fresh=1',{headers:{'Cache-Control':'no-store'},signal:AbortSignal.timeout(90000)});
  const healthResponse=await fetch(url+'/health',{headers:{'Cache-Control':'no-store'},signal:AbortSignal.timeout(15000)}),health=await healthResponse.json();
  report.knownFailedPredecessor=hr.status===503&&healthResponse.ok&&health.production===false&&health.hrWrites===false&&health.bootstrapReady===false&&
   String(health.lastRefreshError||'').includes('HR_SOURCE_RANGE_RESPONSE_MISMATCH')&&
   runtime.status?.latestReadyRevisionName===descriptor.postDeployRunSeal?.runtimeRevision&&
   descriptor.postDeployRunSeal?.hrLiveVerified===false&&descriptor.postDeployRunSeal?.sourceSha!==request.sourceSha&&
   descriptor.vrm354CanonicalNameRepairRequest?.enabled===false;
  report.predecessorHrObservation={httpStatus:hr.status,healthOk:healthResponse.ok,bootstrapReady:health.bootstrapReady===true,
   classification:report.knownFailedPredecessor?'OBSERVED_RECORDED_PREDECESSOR_HR503_CORRECTION_REQUIRED':'UNEXPECTED_PREDECESSOR_STATE',
   completeHrObservation:false,sourceSha:descriptor.postDeployRunSeal?.sourceSha,revision:runtime.status?.latestReadyRevisionName,
   writes:0,phaseAComplete:false,doesNotReplaceSuccessorHrGate:true};
 }

}catch(error){report.pass=false;report.decision='HOLD_RAW_RANGE_PREFLIGHT_ERROR';report.code=String(error.code||error.message||'UNKNOWN').split(':')[0].replace(/[^a-zA-Z0-9_/-]/g,'_').slice(0,120);}
report.observedAt=new Date().toISOString();
fs.writeFileSync(path.join(out,'vrm356-raw-range-preflight.json'),JSON.stringify(report,null,2)+'\n');
console.log('I3_VRM356_RAW_RANGE_PREFLIGHT '+JSON.stringify(report));
if(!report.pass)process.exitCode=1;
