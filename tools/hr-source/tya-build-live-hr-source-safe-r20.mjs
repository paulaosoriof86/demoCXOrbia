#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — live HR source-safe builder R20.

  Orden de lectura read-only:
  1. Google Sheets API con service account, cuando el gate tiene credencial.
  2. Google Visualization CSV por tab con cache-busting, sin depender del XLSX
     público que demostró entregar una copia desactualizada.

  Descubre tabs mensuales por patrón, aplica un contrato único de columnas y
  genera únicamente referencias/estados source-safe. No incluye nombres,
  teléfono, correo, observaciones, URLs privadas ni el workbook crudo.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import process from 'node:process';
import {
  applyCanonicalVisitState,
  deriveHrReviewState,
  summarizeCanonicalPeriods,
  validateCanonicalHistory,
  normalizedText,
  validIsoDate
} from './tya-canonical-visit-state-r20.mjs';
import { resolveLiveMonthTabs } from './tya-resolve-live-month-tabs.mjs';

const SHEET_ID=process.env.CXORBIA_HR_LIVE_SHEET_ID||'1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const OUT_FILE=process.env.CXORBIA_HR_SOURCE_SAFE_OUT||'app/data/tya-hr-source-safe-periods.js';
const SERVICE_ACCOUNT_JSON=process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'';
const MAX_ROW=Number(process.env.CXORBIA_HR_LIVE_MAX_ROW||140);
const MAX_COL=process.env.CXORBIA_HR_LIVE_MAX_COL||'AI';
const EARLIEST_PERIOD=process.env.CXORBIA_HR_EARLIEST_PERIOD||'2025-01';
const COLUMN_MAP_FILE=path.resolve(process.env.CXORBIA_HR_COLUMN_MAP_FILE||'backend/contracts/tya-hr-column-map-r20-v1.json');
if(process.env.CXORBIA_HR_REQUIRE_PROJECT_BINDING==='true'&&(!process.env.CXORBIA_HR_LIVE_SHEET_ID||!process.env.CXORBIA_HR_COLUMN_MAP_FILE))throw new Error('MAPPING_FAILURE:HR_BINDING_READER_CONFIG_REQUIRED');
const CINEMA_REGISTRY_FILE=path.resolve(process.env.CXORBIA_TYA_CINEPOLIS_CINEMA_REGISTRY||'backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json');
const GATE_OUT=path.resolve(process.env.CXORBIA_GATE_OUT||'.tmp/r20-source-safe-gates');
const GENERATED_AT=new Date().toISOString();
const TENANT_TIMEZONE=process.env.CXORBIA_TENANT_TIMEZONE||'America/Guatemala';
function tenantYearMonth(date=new Date()){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TENANT_TIMEZONE,year:'numeric',month:'2-digit'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  return {year:Number(parts.year),month:Number(parts.month)};
}

const MONTHS=[
  {n:1,name:'ENERO',short:'ENE',full:'Enero'}, {n:2,name:'FEBRERO',short:'FEB',full:'Febrero'},
  {n:3,name:'MARZO',short:'MAR',full:'Marzo'}, {n:4,name:'ABRIL',short:'ABR',full:'Abril'},
  {n:5,name:'MAYO',short:'MAY',full:'Mayo'}, {n:6,name:'JUNIO',short:'JUN',full:'Junio'},
  {n:7,name:'JULIO',short:'JUL',full:'Julio'}, {n:8,name:'AGOSTO',short:'AGO',full:'Agosto'},
  {n:9,name:'SEPTIEMBRE',short:'SEP',full:'Septiembre'}, {n:10,name:'OCTUBRE',short:'OCT',full:'Octubre'},
  {n:11,name:'NOVIEMBRE',short:'NOV',full:'Noviembre'}, {n:12,name:'DICIEMBRE',short:'DIC',full:'Diciembre'}
];


const HR_SHEETS_READ_DEADLINE=performance.now()+75000;
const HR_SHEETS_READ_STATS={attempts:0,successfulRequests:0,quotaRetries:0,responseBytes:0};
function hrRangeBatches(tabs,rangeForTab){
  const batches=[];let batch=[],encodedSize=0;
  for(const tab of tabs){
    const part='ranges='+encodeURIComponent(rangeForTab(tab));
    if(part.length>6000)throw new Error('HR_SOURCE_RANGE_URL_TOO_LONG');
    if(batch.length&&(batch.length>=64||encodedSize+part.length+1>6000)){batches.push(batch);batch=[];encodedSize=0;}
    batch.push(tab);encodedSize+=part.length+1;
  }
  if(batch.length)batches.push(batch);
  return batches;
}
function hrRangeForTab(title,metadata,maxColumn,maxRow){
  const column=String(maxColumn||'').toUpperCase();
  if(!/^[A-Z]{1,3}$/.test(column)||!Number.isSafeInteger(maxRow)||maxRow<1)throw new Error('HR_SOURCE_RANGE_LIMIT_INVALID');
  if(typeof title!=='string'||!title.length||!Array.isArray(metadata?.sheets))throw new Error('HR_SOURCE_RANGE_GRID_METADATA_INVALID');
  const matches=metadata.sheets.filter(sheet=>sheet.properties?.title===title);
  const grid=matches.length===1?matches[0].properties.gridProperties:null;
  if(!Number.isSafeInteger(grid?.rowCount)||grid.rowCount<1||!Number.isSafeInteger(grid?.columnCount)||grid.columnCount<1)throw new Error('HR_SOURCE_RANGE_GRID_METADATA_INVALID');
  const configuredColumn=[...column].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0);
  let remaining=Math.min(configuredColumn,grid.columnCount),lastColumn='';
  while(remaining>0){remaining--;lastColumn=String.fromCharCode(65+remaining%26)+lastColumn;remaining=Math.floor(remaining/26);}
  // Bounds are the intersection at metadata observation; response count/order/title/bounds remain exact.
  return "'"+title.replace(/'/g,"''")+"'!A1:"+lastColumn+Math.min(maxRow,grid.rowCount);
}
function validateHrRangeResponse(response,ranges){
  const normalize=range=>{
    const text=String(range||''),split=text.lastIndexOf('!');
    if(split<1)return '';
    let title=text.slice(0,split);
    if(title.startsWith("'")&&title.endsWith("'"))title=title.slice(1,-1).replace(/''/g,"'");
    return title+'!'+text.slice(split+1).toUpperCase();
  };
  if(!Array.isArray(response?.valueRanges)||response.valueRanges.length!==ranges.length)throw new Error('HR_SOURCE_RANGE_RESPONSE_INCOMPLETE');
  for(let i=0;i<ranges.length;i++){
    if(normalize(response.valueRanges[i]?.range)!==normalize(ranges[i]))throw new Error('HR_SOURCE_RANGE_RESPONSE_MISMATCH');
    if(response.valueRanges[i].values!==undefined&&!Array.isArray(response.valueRanges[i].values))throw new Error('HR_SOURCE_RANGE_VALUES_INVALID');
  }
  return response;
}
async function readSheetsJson(url,options={},io={}){
  if(String(options.method||'GET').toUpperCase()!=='GET')throw new Error('HR_SOURCE_READ_METHOD_REQUIRED');
  const fetchImpl=io.fetchImpl||fetch,now=io.now||(()=>performance.now()),wait=io.wait||(ms=>new Promise(resolve=>setTimeout(resolve,ms)));
  const random=io.random||Math.random,wallNow=io.wallNow||Date.now;
  const deadlineAt=io.deadlineAt??HR_SHEETS_READ_DEADLINE,stats=io.stats||HR_SHEETS_READ_STATS;
  let attempts=0,quotaSeen=false;
  const failure=()=>{
    const code=quotaSeen?'HR_SOURCE_READ_QUOTA_EXHAUSTED':'HR_SOURCE_READ_DEADLINE_EXCEEDED';
    const error=new Error(code);error.code=code;
    error.hrSourceFailure={schemaVersion:'cxorbia.hr-source-read-failure.v1',code,upstreamStatus:quotaSeen?429:null,attempts,readOnly:true};
    return error;
  };
  while(attempts<7){
    const remaining=deadlineAt-now();
    if(remaining<=0)throw failure();
    attempts++;stats.attempts++;
    const signal=AbortSignal.timeout(Math.max(1,Math.min(15000,Math.floor(remaining))));
    let response;
    try{
      response=await fetchImpl(url,{...options,method:'GET',signal});
    }catch(error){
      if(signal.aborted||error?.name==='TimeoutError'||now()>=deadlineAt)throw failure();
      throw error;
    }
    if(response.status===429)quotaSeen=true;
    let body=null;
    try{body=await response.json();}
    catch(error){
      if(signal.aborted||error?.name==='TimeoutError'||now()>=deadlineAt)throw failure();
      if(response.ok)throw new Error('HR_SOURCE_READ_JSON_INVALID');
    }
    if(signal.aborted||now()>=deadlineAt)throw failure();
    if(response.ok){
      stats.successfulRequests++;stats.responseBytes+=Buffer.byteLength(JSON.stringify(body),'utf8');
      return body;
    }
    if(response.status!==429)throw new Error('HTTP_'+response.status+':'+JSON.stringify(body||{}).slice(0,300));
    if(attempts>=7)throw failure();
    const retryHeader=String(response.headers?.get?.('retry-after')||'').trim();
    let retryAfter=0;
    if(/^\d+(\.\d+)?$/.test(retryHeader))retryAfter=Number(retryHeader)*1000;
    else if(retryHeader){const date=Date.parse(retryHeader);if(Number.isFinite(date))retryAfter=Math.max(0,date-wallNow());}
    const backoff=Math.min(32000,1000*2**(attempts-1)+Math.floor(random()*1000));
    const delay=Math.max(backoff,retryAfter);
    if(!Number.isFinite(delay)||now()+delay>=deadlineAt)throw failure();
    stats.quotaRetries++;await wait(delay);
  }
  throw failure();
}
function reportHrSourceFailure(error){
  if(error?.hrSourceFailure?.schemaVersion==='cxorbia.hr-source-read-failure.v1'){
    console.error('CXORBIA_HR_SOURCE_FAILURE='+JSON.stringify(error.hrSourceFailure));
  }else console.error(error);
}

function fail(message){throw new Error(message);}
function pad(value){return String(value).padStart(2,'0');}
function safeHash(value,prefix){const raw=String(value||'').trim().toLowerCase();return raw?`${prefix}_${crypto.createHash('sha256').update(raw).digest('hex').slice(0,10)}`:'';}
function b64url(input){return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');}
function serviceAccountInfo(){try{const value=SERVICE_ACCOUNT_JSON?JSON.parse(SERVICE_ACCOUNT_JSON):{};return {type:value.type||'',projectId:value.project_id||'',clientEmail:value.client_email||''};}catch{return {type:'',projectId:'',clientEmail:''};}}
function signJwt(sa){const now=Math.floor(Date.now()/1000);const unsigned=`${b64url(JSON.stringify({alg:'RS256',typ:'JWT'}))}.${b64url(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/spreadsheets.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}))}`;const signer=crypto.createSign('RSA-SHA256');signer.update(unsigned);signer.end();return `${unsigned}.${signer.sign(sa.private_key).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}`;}
async function oauthToken(fetchImpl=fetch,serviceAccountJson=SERVICE_ACCOUNT_JSON){
  if(!serviceAccountJson){
    // Cloud Run supplies the same read-only Sheets identity already used by the
    // independently executed live provider registry. No new credential or HR write.
    const response=await fetchImpl('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',{headers:{'Metadata-Flavor':'Google','Cache-Control':'no-store'}});
    if(!response.ok)fail(`Cloud Run metadata token unavailable: HTTP ${response.status}`);
    const json=await response.json();
    if(!json.access_token)fail('Cloud Run metadata access token missing');
    return {token:json.access_token,clientEmail:'cloud-run-runtime-service-account'};
  }
  const sa=JSON.parse(serviceAccountJson);
  if(sa.type!=='service_account')fail('Secret is not a service_account JSON.');
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:signJwt(sa)});
  const response=await fetchImpl('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Cache-Control':'no-store'},body});
  const json=await response.json();
  if(!response.ok)fail(`Google OAuth failed: HTTP ${response.status} ${JSON.stringify(json).slice(0,300)}`);
  if(!json.access_token)fail('Google OAuth token missing');
  return {token:json.access_token,clientEmail:sa.client_email};
}
async function sheetsGet(pathAndQuery,token){return readSheetsJson(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${pathAndQuery}`,{headers:{Authorization:`Bearer ${token}`,'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});}

function candidateTabs(){const [startYear,startMonth]=EARLIEST_PERIOD.split('-').map(Number);const local=tenantYearMonth();let endYear=local.year,endMonth=local.month+1;if(endMonth>12){endMonth-=12;endYear+=1;}const tabs=[];for(let year=startYear;year<endYear||(year===endYear&&startMonth<=endMonth);year++){const first=year===startYear?startMonth:1;const last=year===endYear?endMonth:12;for(let monthNumber=first;monthNumber<=last;monthNumber++){const month=MONTHS[monthNumber-1],yy=String(year).slice(-2);for(const country of ['GT','HN']){const title=`${month.name} ${yy}${country==='HN'?' HN':''}`;tabs.push({country,year,month:month.n,monthName:month.full,label:`${month.short} ${year}`,fullLabel:`${month.full} ${year}`,key:`${year}-${pad(month.n)}`,tabTitle:title});}}}return tabs;}

function parseCsv(text){const rows=[];let row=[],field='',quoted=false;for(let index=0;index<text.length;index++){const char=text[index];if(quoted){if(char==='"'&&text[index+1]==='"'){field+='"';index++;}else if(char==='"')quoted=false;else field+=char;}else if(char==='"')quoted=true;else if(char===','){row.push(field);field='';}else if(char==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=char;}if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows;}
async function fetchGvizTab(tab){const nonce=`${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;const params=new URLSearchParams({tqx:'out:csv',sheet:tab.tabTitle,range:`A1:${MAX_COL}${MAX_ROW}`,tq:'select *',_cxnonce:nonce});const url=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?${params}`;const response=await fetch(url,{redirect:'follow',headers:{'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache','Expires':'0','User-Agent':'CXOrbia-Phase-A-R20/1.0'}});const type=response.headers.get('content-type')||'';const text=await response.text();if(!response.ok||!type.includes('text/csv')||/^<!doctype html/i.test(text.trim())||/google visualization api query language/i.test(text.toLowerCase()))return null;const values=parseCsv(text).slice(0,MAX_ROW);return values.length?{range:tab.tabTitle,values,nonce}:null;}
async function mapLimit(items,limit,mapper){const results=new Array(items.length);let cursor=0;async function worker(){while(true){const index=cursor++;if(index>=items.length)return;try{results[index]=await mapper(items[index],index);}catch(error){results[index]={error:String(error?.message||error)};}}}await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));return results;}

async function readFromSheetsApi(){
  const {token,clientEmail}=await oauthToken();
  const metadata=await sheetsGet('?fields=properties(title),sheets(properties(title,index,gridProperties(rowCount,columnCount)))',token);
  const tabs=resolveLiveMonthTabs((metadata.sheets||[]).map(sheet=>({title:sheet.properties?.title,index:sheet.properties?.index})));
  if(!tabs.length)fail('No monthly HR tabs detected through Sheets API.');
  const rangeForTab=tab=>hrRangeForTab(tab.tabTitle,metadata,MAX_COL,MAX_ROW);
  const plannedBatches=hrRangeBatches(tabs,rangeForTab),valueRanges=[];
  for(let index=0;index<plannedBatches.length;index+=2){
    const batches=plannedBatches.slice(index,index+2);
    const results=await Promise.allSettled(batches.map(async batch=>{
      const ranges=batch.map(rangeForTab),query=ranges.map(range=>'ranges='+encodeURIComponent(range)).join('&');
      const response=await sheetsGet('/values:batchGet?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&'+query,token);
      return validateHrRangeResponse(response,ranges);
    }));
    const failure=results.find(result=>result.status==='rejected');if(failure)throw failure.reason;
    for(const result of results)valueRanges.push(...result.value.valueRanges);
  }
  return {accessMode:'sheets_api_service_account',clientEmail,title:metadata.properties?.title||'HR Guatemala - Sincronizacion Google Sheets',tabs,valueRanges,cacheBustApplied:true};
}
async function readFromGvizCsv(apiError){const candidates=candidateTabs();const fetched=await mapLimit(candidates,6,async tab=>({tab,valueRange:await fetchGvizTab(tab)}));const valid=fetched.filter(item=>item?.valueRange&&Array.isArray(item.valueRange.values)&&item.valueRange.values.length);const tabs=valid.map(item=>item.tab),valueRanges=valid.map(item=>item.valueRange);if(!tabs.length)fail(`GViz CSV did not expose any monthly HR tab after Sheets API failure: ${String(apiError?.message||apiError).slice(0,300)}`);return {accessMode:'public_gviz_csv_cache_busted',fallbackReason:String(apiError?.message||apiError||'').slice(0,500),clientEmail:serviceAccountInfo().clientEmail,title:'HR Guatemala - Sincronizacion Google Sheets',tabs,valueRanges,cacheBustApplied:true};}
async function readLiveHr(){try{return await readFromSheetsApi();}catch(error){if(error?.hrSourceFailure||/^HR_SOURCE_RANGE_|^HR_SOURCE_READ_JSON_INVALID/.test(String(error?.message||'')))throw error;if(/^HR_MONTH_(YEAR_UNRESOLVED|YEAR_AMBIGUOUS|DUPLICATE):/.test(String(error?.message||error)))throw error;console.warn('[HR live] Sheets API unavailable; using per-tab GViz CSV read-only fallback.');console.warn(String(error?.message||error).slice(0,800));return readFromGvizCsv(error);}}

function keyText(value){return normalizedText(value).replace(/[^a-z0-9ñ]+/g,' ').replace(/\s+/g,' ').trim();}

// Resolve declared source labels on a private copy. Provider hashes, writer
// guards and diagnostics continue to refer to the original workbook headers.
export function projectReadHeader(row, columnMap, country) {
  const rules = columnMap.readHeaderAliases;
  if (!rules?.length) return row;
  const labels = row.map(keyText);
  const matchesField = (label, field) =>
    columnMap.columns[field]?.aliases.some(alias => keyText(alias) === label);
  return row.map((original, index) => {
    const matches = rules.filter(rule =>
      labels[index] === keyText(rule.label) &&
      (!rule.countries || rule.countries.includes(country)) &&
      (!rule.previousField || matchesField(labels[index - 1], rule.previousField)) &&
      (!rule.nextField || matchesField(labels[index + 1], rule.nextField)));
    if (!matches.length) return original;
    const targets = new Set(matches.map(rule => rule.field));
    if (targets.size !== 1 || !columnMap.columns[matches[0].field]?.aliases?.[0]) {
      throw new Error('MAPPING_FAILURE:READ_HEADER_ALIAS_CONFLICT');
    }
    return columnMap.columns[matches[0].field].aliases[0];
  });
}
/* R20_TAB_SCOPED_HEADER_VARIANT — supports explicit full headers and declared tab-scoped compact headers without silent inference. */
function headerVariants(columnMap){
  const configured=Array.isArray(columnMap?.headerVariants)?columnMap.headerVariants:[];
  if(configured.length)return configured;
  return [{id:'full_identity',required:columnMap?.headerSignature||['País','ID CINEMA','Shopping'],countrySource:'column',cinemaIdSource:'column'}];
}
function findHeader(values,tab,columnMap){
  const variants=headerVariants(columnMap);
  for(let index=0;index<Math.min(values.length,14);index++){
    const row=values[index]||[],cells=projectReadHeader(row,columnMap,tab?.country).map(keyText);
    for(const variant of variants){
      const allowedCountries=(variant.allowedCountries||[]).map(value=>String(value||'').trim().toUpperCase()).filter(Boolean);
      if(allowedCountries.length&&!allowedCountries.includes(String(tab?.country||'').trim().toUpperCase()))continue;
      const requiresAbsent=(variant.requiresAbsent||[]).map(keyText).filter(Boolean);
      if(requiresAbsent.some(needle=>cells.includes(needle)))continue;
      const required=(variant.required||[]).map(keyText).filter(Boolean);
      if(required.length&&required.every(needle=>cells.includes(needle))){
        return {index,row,cells,variantId:variant.id||'unknown',countrySource:variant.countrySource||'column',cinemaIdSource:variant.cinemaIdSource||'column',shoppingSource:variant.shoppingSource||'column',duplicateColumns:{}};
      }
    }
  }
  return null;
}
function resolveColumn(header,aliases,name,spec={}){
  const needles=aliases.map(keyText).filter(Boolean);
  const decide=hits=>{
    if(hits.length===1)return hits[0];
    if(hits.length>1){
      if(spec.duplicatePolicy==='coalesce_equal_or_single_nonempty'){
        header.duplicateColumns[name]=hits;
        return hits[hits.length-1];
      }
      return -2;
    }
    return null;
  };
  for(const needle of needles){
    const result=decide(header.cells.reduce((out,value,index)=>{if(value===needle)out.push(index);return out;},[]));
    if(result!==null)return result;
  }
  for(const needle of needles){
    const result=decide(header.cells.reduce((out,value,index)=>{if(value===needle||value.startsWith(needle+' ')||value.endsWith(' '+needle))out.push(index);return out;},[]));
    if(result!==null)return result;
  }
  return -1;
}
function cell(row,index){return index>=0?String(row?.[index]??'').trim():'';}
function duplicateValues(row,header,name){return (header.duplicateColumns?.[name]||[]).map(index=>cell(row,index)).filter(Boolean);}
function mappedColumnConflict(row,header,name){return new Set(duplicateValues(row,header,name).map(normalizedText)).size>1;}
function mappedCell(row,columns,header,name){const values=duplicateValues(row,header,name);return values.length?values[values.length-1]:cell(row,columns[name]);}
function isVisitRow(row,columns,header,tab){
  const shopping=mappedCell(row,columns,header,'shopping');
  const city=mappedCell(row,columns,header,'ciudad');
  if(!shopping||!city)return false;
  if(header.countrySource==='tab_name')return Boolean(tab?.country);
  return Boolean(mappedCell(row,columns,header,'pais')&&mappedCell(row,columns,header,'idCinema'));
}
const SHOPPER_UNASSIGNED_PLACEHOLDER=/^(p x asignar|por asignar|pendiente|sin asignar|no asignado|n\/a|na|ninguno|-|0|false)$/;
const SHOPPER_NON_IDENTITY_STATUS=new Set(['fallida','fallido','visita fallida']);
function isShopperAssigned(value){const text=normalizedText(value);if(!text)return false;if(SHOPPER_UNASSIGNED_PLACEHOLDER.test(text))return false;if(text.includes('p x asignar'))return false;if(SHOPPER_NON_IDENTITY_STATUS.has(text))return false;return true;}
function assignmentSelfTest(){
  const cases=[
    {label:'operational-fallida',value:'FALLIDA',assigned:false,shopperId:null},
    {label:'human-simple',value:'Ana',assigned:true},
    {label:'human-spaces',value:'María López',assigned:true},
    {label:'representative-code',value:'SHOPPER GT 001',assigned:true},
    ...['p x asignar','por asignar','pendiente','sin asignar','no asignado','n/a','na','ninguno','-','0','false',''].map(value=>({label:`placeholder-${value||'empty'}`,value,assigned:false,shopperId:null})),
    {label:'null',value:null,assigned:false,shopperId:null}
  ];
  const results=cases.map(test=>{
    const assigned=isShopperAssigned(test.value);
    const shopperId=assigned?safeHash(test.value,'shopper_gt'):null;
    const visit=applyCanonicalVisitState({id:test.label,tenantId:'tya',projectId:'cinepolis',periodKey:'2026-09',country:'GT',disponibleDesde:'2026-09-10',hasShopper:assigned,shopperId,shopper:assigned?'Shopper protegido':null,shopperCode:assigned?safeHash(test.value,'TYA_GT').toUpperCase():null});
    return {label:test.label,value:test.value,assigned:visit.canonicalFacets.assigned,available:visit.canonicalFacets.available,shopperId:visit.shopperId||null,shopperProtected:visit.shopper||null};
  });
  const failures=results.filter(row=>{
    const expected=cases.find(test=>test.label===row.label);
    return row.assigned!==expected.assigned || (expected.shopperId===null&&row.shopperId!==null) || (expected.assigned===true&&!row.shopperId);
  });
  const report={decision:failures.length?'HOLD_R20_SHOPPER_ASSIGNMENT_CLASSIFICATION':'PASS_R20_SHOPPER_ASSIGNMENT_CLASSIFICATION',schemaVersion:'cxorbia.tya.r20.assignment-self-test.v1',preSanitization:true,formula:'available = eligible && !assigned && !blocked && !closed',cases:results,failures,safeState:{writes:false,hrWrites:false,firestoreWrites:false,authWrites:false,deploy:false,production:false,realData:false}};
  console.log(JSON.stringify(report,null,2));
  if(failures.length)process.exit(1);
}
function normalizeMoney(value){const text=String(value||'').trim();if(!text)return null;const normalized=text.replace(/[QL\s]/gi,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(/,/g,'.').replace(/[^0-9.-]/g,'');const number=Number(normalized);return Number.isFinite(number)?number:null;}
function serialDate(value){const number=Number(value);if(!Number.isFinite(number)||number<1||number>100000)return null;const date=new Date(Date.UTC(1899,11,30)+Math.floor(number)*86400000);return Number.isNaN(date.getTime())?null:date.toISOString().slice(0,10);}
function shortDate(day,month,period){let year=period.year;if(period.month===12&&month===1)year++;else if(period.month===1&&month===12)year--;const iso=`${year}-${pad(month)}-${pad(day)}`;return validIsoDate(iso)?iso:null;}
function normalizeDate(value,period){if(value==null||value==='')return null;const text=String(value).trim();if(!text)return null;if(/^\d{3,6}(?:\.\d+)?$/.test(text))return serialDate(text)||text;let match=text.match(/^(20\d{2})[-/]([01]?\d)[-/]([0-3]?\d)(?:\s.*)?$/);if(match){const iso=`${match[1]}-${pad(match[2])}-${pad(match[3])}`;return validIsoDate(iso)?iso:text;}match=text.match(/^([0-3]?\d)[/.-]([01]?\d)[/.-](20\d{2})(?:\s.*)?$/);if(match){const iso=`${match[3]}-${pad(match[2])}-${pad(match[1])}`;return validIsoDate(iso)?iso:text;}match=text.match(/(?:^|\s)([0-3]?\d)[-/.]([01]?\d)$/);if(match)return shortDate(Number(match[1]),Number(match[2]),period)||text;return text;}
function loadColumnMap(){if(!fs.existsSync(COLUMN_MAP_FILE))fail(`Missing column map: ${COLUMN_MAP_FILE}`);const contract=JSON.parse(fs.readFileSync(COLUMN_MAP_FILE,'utf8'));if(contract.contractId!=='tya-hr-column-map-r20-v1'||contract.resolutionPolicy!=='exact_or_unique_anchored_only')fail('Column map identity/policy mismatch.');return contract;}
function loadCinemaRegistry(){if(!fs.existsSync(CINEMA_REGISTRY_FILE))fail(`Missing cinema registry: ${CINEMA_REGISTRY_FILE}`);const registry=JSON.parse(fs.readFileSync(CINEMA_REGISTRY_FILE,'utf8'));if(registry.contractId!=='tya-cinepolis-cinema-identity-r20-v1'||registry.tenantId!=='tya'||registry.projectId!=='cinepolis'||registry.country!=='HN'||registry.resolutionPolicy!=='exact_only'||registry.unknownPolicy!=='hold_build')fail('Cinema registry identity/policy mismatch.');return registry;}
function resolveShoppingIdentity(rawShopping,cinemaId,tab,header,registry){const raw=String(rawShopping||'').trim();if(raw)return {shopping:raw,source:'column',error:null};if(header.shoppingSource!=='project_scoped_cinema_registry')return {shopping:'',source:'missing',error:null};if(String(tab?.country||'').toUpperCase()!==String(registry?.country||'').toUpperCase())return {shopping:'',source:'project_scoped_cinema_registry',error:'cinema_registry_country_scope_mismatch'};const id=String(cinemaId||'').trim();if(!id)return {shopping:'',source:'project_scoped_cinema_registry',error:'cinema_identity_missing'};const shopping=typeof registry?.cinemas?.[id]==='string'?registry.cinemas[id].trim():'';if(!shopping)return {shopping:'',source:'project_scoped_cinema_registry',error:'cinema_identity_unknown'};return {shopping,source:'project_scoped_cinema_registry',registryId:registry.contractId,error:null};}

function parseTab(tab,values,columnMap,cinemaRegistry){
  const header=findHeader(values||[],tab,columnMap);
  if(!header)return {visits:[],issues:[{code:'header_not_found',severity:'critical',tab:tab.tabTitle}],diagnostic:{title:tab.tabTitle,country:tab.country,periodKey:tab.key,rows:0,headerRow:null,columns:{}}};
  const columns={},issues=[];
  for(const [name,spec] of Object.entries(columnMap.columns||{})){
    columns[name]=resolveColumn(header,spec.aliases||[],name,spec);
    const contextualMissing=columns[name]<0&&Array.isArray(spec.contextualMissingAllowedIn)&&spec.contextualMissingAllowedIn.includes(header.variantId);
    if(columns[name]===-2)issues.push({code:'column_ambiguous',severity:spec.critical?'critical':'warning',tab:tab.tabTitle,column:name});
    else if(columns[name]<0&&spec.critical&&!contextualMissing)issues.push({code:'column_missing',severity:'critical',tab:tab.tabTitle,column:name});
    else if(contextualMissing)issues.push({code:'column_contextual_identity',severity:'warning',tab:tab.tabTitle,column:name,headerVariant:header.variantId});
    else if(columns[name]<0)issues.push({code:'column_missing_optional',severity:'warning',tab:tab.tabTitle,column:name});
  }
  if(issues.some(issue=>issue.severity==='critical'))return {visits:[],issues,diagnostic:{title:tab.tabTitle,country:tab.country,periodKey:tab.key,rows:0,headerRow:header.index+1,headerVariant:header.variantId,columns}};
  const visits=[],privateReviewNotes=[],shopperSignals={assigned:0,unassigned:0,placeholder:0},identityRegistrySignals={resolved:0,unknown:0,missing:0},columnDiagnostics={};
  for(const [name,index] of Object.entries(columns))columnDiagnostics[name]={index,header:index>=0?cell(header.row,index):null,nonEmptyVisitRows:0};
  for(let rowIndex=header.index+1;rowIndex<values.length;rowIndex++){
    const row=values[rowIndex]||[],rawValue=name=>mappedCell(row,columns,header,name),city=rawValue('ciudad');
    if(!city)continue;
    // Reconciliation totals place a balance in the city column and an accounting label in the cinema ID.
    const financialLabel = /^(?:efvo\s*-\s*t[cd]|tc\s*-\s*td|max dif ok)$/i.test(rawValue('idCinema'));
    if (financialLabel && /^-?\d+$/.test(city) && !rawValue('quincena') && !rawValue('tipoCompra')) continue;
    const identity=resolveShoppingIdentity(rawValue('shopping'),rawValue('idCinema'),tab,header,cinemaRegistry);
    if(identity.error){if(identity.error==='cinema_identity_unknown')identityRegistrySignals.unknown++;if(identity.error==='cinema_identity_missing')identityRegistrySignals.missing++;issues.push({code:identity.error,severity:'critical',tab:tab.tabTitle,row:rowIndex+1,column:'shopping',cinemaId:rawValue('idCinema')||null,headerVariant:header.variantId});continue;}
    if(identity.source==='project_scoped_cinema_registry')identityRegistrySignals.resolved++;
    const value=name=>name==='shopping'?identity.shopping:rawValue(name);
    if(!value('shopping'))continue;
    if(header.countrySource==='tab_name'&&!tab?.country)continue;
    if(header.countrySource!=='tab_name'&&(!value('pais')||!value('idCinema')))continue;
    const duplicateConflicts=Object.keys(header.duplicateColumns||{}).filter(name=>mappedColumnConflict(row,header,name));if(duplicateConflicts.length){for(const name of duplicateConflicts)issues.push({code:'duplicate_column_conflict',severity:'critical',tab:tab.tabTitle,row:rowIndex+1,column:name});continue;}
    for(const [name,index] of Object.entries(columns))if(index>=0&&cell(row,index))columnDiagnostics[name].nonEmptyVisitRows++;
    const shopperRaw=value('shopper'),hasShopper=isShopperAssigned(shopperRaw);if(hasShopper)shopperSignals.assigned++;else{shopperSignals.unassigned++;if(shopperRaw)shopperSignals.placeholder++;}
    const cinemaId=value('idCinema'),shopping=value('shopping'),visitId=`hr_${tab.key}_${tab.country.toLowerCase()}_${rowIndex+1}_${safeHash([cinemaId,shopping,value('quincena'),value('franja'),rowIndex+1].join('|'),'v').slice(-10)}`,shopperId=hasShopper?safeHash(shopperRaw,`shopper_${tab.country.toLowerCase()}`):null;
    const visit=applyCanonicalVisitState({id:visitId,hrRowId:`${tab.tabTitle}!${rowIndex+1}`,sourceTab:tab.tabTitle,sourceRow:rowIndex+1,tenantId:'tya',projectId:'cinepolis',program:'cinepolis',periodKey:tab.key,periodLabel:tab.label,pais:tab.country,country:tab.country,cinemaId,sucursal:shopping,ciudad:value('ciudad'),quincena:value('quincena'),franja:value('franja'),franjaCode:normalizedText(value('franja')).includes('wknd')?'WKND':'WK',formato:value('formato'),escenario:value('tipoCompra'),tipoCombo:value('tipoCombo'),metodoPago:value('metodoPago'),disponibleDesde:normalizeDate(value('disponibleDesde'),tab),agendada:normalizeDate(value('fechaProgramada'),tab),realizada:normalizeDate(value('fechaRealizada'),tab),cuestFecha:normalizeDate(value('fechaCuestionario'),tab),submittedAt:normalizeDate(value('fechaSubmitido'),tab),controlDia:value('controlDia'),shopperId,shopper:hasShopper?'Shopper protegido':null,shopperCode:hasShopper?safeHash(shopperRaw,`TYA_${tab.country}`).toUpperCase():null,hasShopper,currency:tab.country==='HN'?'L':'Q',honorario:normalizeMoney(value('honorarios')),boleto:normalizeMoney(value('precioBoleto')),comboAmt:normalizeMoney(value('precioCombo')),sourceSafe:true,piiProtected:true});
    const observation=String(value('observacionesRevision')||'').replace(/\r\n?/g,'\n').trim();
    visit.hrReview=deriveHrReviewState({observation,observationDigest:observation?crypto.createHash('sha256').update(observation).digest('hex'):null,mapped:columns.observacionesRevision>=0,visit});
    visits.push(visit);
    // The caller must keep this separate from the public snapshot. Never put
    // free-text review content in source-safe visit rows or public diagnostics.
    if(observation)privateReviewNotes.push({sourceRow:rowIndex+1,observation,observationDigest:visit.hrReview.observationDigest});
  }
  return {visits,privateReviewNotes,issues,diagnostic:{title:tab.tabTitle,country:tab.country,periodKey:tab.key,rows:visits.length,headerRow:header.index+1,headerVariant:header.variantId,countrySource:header.countrySource,cinemaIdSource:header.cinemaIdSource,shoppingSource:header.shoppingSource,identityRegistrySignals,duplicateColumns:header.duplicateColumns,shopperSignals,columnDiagnostics}};
}
function buildPeriods(visits,tabs){const map=new Map();for(const tab of tabs)if(!map.has(tab.key))map.set(tab.key,{key:tab.key,id:`cinepolis-${tab.key}`,projectId:'cinepolis',label:tab.label,fullLabel:tab.fullLabel,year:tab.year,month:tab.month,visits:0,byCountry:{GT:0,HN:0}});for(const visit of visits){const row=map.get(visit.periodKey);if(row){row.visits++;row.byCountry[visit.country]=(row.byCountry[visit.country]||0)+1;}}return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key));}
function buildShoppers(visits){const map=new Map();for(const visit of visits){if(!visit.canonicalFacets?.assigned||!visit.shopperId)continue;const current=map.get(visit.shopperId)||{id:visit.shopperId,shopperId:visit.shopperId,code:visit.shopperCode,nombre:'Shopper protegido',pais:visit.country,ciudad:visit.ciudad||'',estado:null,status:null,rating:null,completion:null,preference:null,honorario:null,perfilCompleto:false,dataLevel:'protected_reference',operationalProfileAvailable:false,fullAuthorizedProfileAvailable:false,visitas:0,realizadas:0,submitidas:0,liquidationCandidates:0,liquidadas:0,pagadas:0,sourceSafe:true,piiProtected:true};current.visitas++;current.realizadas+=visit.canonicalFacets.realized?1:0;current.submitidas+=visit.canonicalFacets.submitted?1:0;current.liquidationCandidates+=visit.canonicalFacets.liquidationCandidate?1:0;current.liquidadas+=visit.canonicalFacets.liquidationConfirmed?1:0;current.pagadas+=visit.canonicalFacets.paymentConfirmed?1:0;map.set(visit.shopperId,current);}return [...map.values()].sort((a,b)=>String(a.code||'').localeCompare(String(b.code||'')));}

async function main(){const columnMap=loadColumnMap(),cinemaRegistry=loadCinemaRegistry(),live=await readLiveHr(),visits=[],issues=[],diagnostics=[];for(let index=0;index<live.tabs.length;index++){const parsed=parseTab(live.tabs[index],live.valueRanges[index]?.values||[],columnMap,cinemaRegistry);visits.push(...parsed.visits);issues.push(...parsed.issues);diagnostics.push(parsed.diagnostic);}const blockers=issues.filter(issue=>issue.severity==='critical');if(blockers.length)fail(`R20 HR mapping HOLD: ${JSON.stringify(blockers).slice(0,5000)}`);const periods=buildPeriods(visits,live.tabs),history=validateCanonicalHistory(visits,periods);if(history.decision!=='PASS_CANONICAL_HISTORY')fail(`R20 canonical history HOLD: ${JSON.stringify(history.issues).slice(0,3000)}`);const shoppers=buildShoppers(visits),summaries=summarizeCanonicalPeriods(visits),byStatus={},byCountry={};for(const visit of visits){byStatus[visit.estado]=(byStatus[visit.estado]||0)+1;byCountry[visit.country]=(byCountry[visit.country]||0)+1;}const counts={periods:periods.length,tabs:live.tabs.length,visits:visits.length,shoppers:shoppers.length,byStatus,byCountry,assigned:visits.filter(v=>v.canonicalFacets.assigned).length,unassigned:visits.filter(v=>!v.canonicalFacets.assigned).length,scheduled:visits.filter(v=>v.canonicalFacets.scheduled).length,realized:visits.filter(v=>v.canonicalFacets.realized).length,questionnaireCompleted:visits.filter(v=>v.canonicalFacets.questionnaire).length,submitted:visits.filter(v=>v.canonicalFacets.submitted).length,liquidationCandidatesPendingFinancialMatch:visits.filter(v=>v.liquidationState==='candidate_pending_financial_match').length,liquidationConfirmed:visits.filter(v=>v.liquidationState==='confirmed').length,paymentConfirmed:visits.filter(v=>v.paymentState==='confirmed').length,reviewRequired:visits.filter(v=>v.reviewRequired===true).length};const info=serviceAccountInfo();const snapshot={generatedAt:GENERATED_AT,buildLabel:process.env.CXORBIA_DEV_BUILD_LABEL||'tya-live-hr-source-safe-r20',tenantId:'tya',tenantName:'TyA',projectId:'cinepolis',projectName:'Cinépolis',source:{type:'google_sheets_live_multitab',accessMode:live.accessMode,fallbackReason:live.fallbackReason||null,title:live.title,spreadsheetIdMasked:`${SHEET_ID.slice(0,6)}...${SHEET_ID.slice(-4)}`,serviceAccountProject:info.projectId||'cxorbia-backend-dev',serviceAccountEmailMasked:(live.clientEmail||'').replace(/^[^@]+/,'***'),cacheBustApplied:live.cacheBustApplied===true,sourceSafe:true,piiExcluded:['nombre_shopper','telefono','mail','dpi','banco','direccion_shopper','observaciones','hr_url_privada','workbook_crudo'],semanticNormalizer:'r15g+r20',columnMapContract:columnMap.contractId,cinemaIdentityRegistry:cinemaRegistry.contractId,columnResolver:columnMap.resolutionPolicy,mappingFailClosed:true,dateFormat:'YYYY-MM-DD',submissionLiquidationSeparated:true,canonicalStateAcrossAllDetectedPeriods:true,buildTimeSnapshot:true,runtimeLiveSync:false},tenantConfig:{tenantId:'tya',tenantName:'TyA',configurable:true},projectConfig:{projectId:'cinepolis',projectName:'Cinépolis',configurable:true,countries:['GT','HN'],questionnaireSource:'TyAOnline',hrSourceType:'google_sheets_live_multitab',scenarioDimensions:[{key:'escenario',label:'Medio de compra',icon:'🎟️',sourceField:'tipoCompra'},{key:'tipoCombo',label:'Combo',icon:'🍿',sourceField:'tipoCombo'}]},sourceSafe:true,imported:false,production:false,periods,visits,shoppers,counts,periodOperationalSummary:summaries,tabsRead:diagnostics,issues,normalization:{version:'R20-live',periodCount:periods.length,periodKeys:periods.map(row=>row.key),historyScope:'all_detected_hr_periods',cacheBustApplied:live.cacheBustApplied===true,rules:['sheets_api_or_per_tab_gviz_live_read','contract_driven_column_map','strict_unique_header_resolution','empty_or_placeholder_shopper_is_unassigned','valid_dates_by_period_context','submitted_is_not_liquidated_or_paid','financial_confirmation_requires_external_source','conflicts_require_review']},safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false}};fs.mkdirSync(path.dirname(OUT_FILE),{recursive:true});fs.writeFileSync(OUT_FILE,['/* CXOrbia TyA live HR source-safe R20 payload; no PII/raw workbook. */','window.CX_TYA_HR_SOURCE_SAFE = ',JSON.stringify(snapshot,null,2),';'].join(''),'utf8');fs.mkdirSync(GATE_OUT,{recursive:true});fs.writeFileSync(path.join(GATE_OUT,'hr-header-column-diagnostics.source-safe.json'),JSON.stringify({schemaVersion:'3.0.0',sourceSafe:true,containsDataRows:false,containsPii:false,generatedAt:GENERATED_AT,accessMode:live.accessMode,cacheBustApplied:live.cacheBustApplied===true,historyScope:'all_detected_hr_periods',columnMapContract:columnMap.contractId,tabs:diagnostics,issues,blockers},null,2)+'\n','utf8');console.log(JSON.stringify({decision:'PASS_R20_LIVE_CANONICAL_HR_HISTORY',providerReadStats:{...HR_SHEETS_READ_STATS},outFile:OUT_FILE,accessMode:live.accessMode,cacheBustApplied:live.cacheBustApplied===true,counts,periods:periods.map(row=>row.key),safeState:snapshot.safeState},null,2));}

function reconciliationMappingSelfTest(columnMap, cinemaRegistry) {
  const fields = Object.entries(columnMap.columns);
  const header = fields.map(([name, field]) => name === 'pais' ? '|' : field.aliases[0]);
  header.push('DIRECCIÓN');
  const row = overrides => fields.map(([name]) => overrides[name] ?? '');
  const visit = {pais:'GT', idCinema:'1001', ciudad:'Ciudad QA', shopping:'Sucursal QA', quincena:'Q1', tipoCompra:'APP'};
  const footer = {ciudad:'-4', shopping:'Total QA'};
  const values = [
    header,
    row(visit),
    ...['Efvo - TC', 'Efvo - TD', 'TC-TD', 'max dif ok'].map(idCinema => row({...footer, idCinema})),
    row({...visit, idCinema:'TC-TD', ciudad:'-4'}),
    row({...visit, idCinema:'Efvo - TC', quincena:'', tipoCompra:''})
  ];
  const result = parseTab({country:'GT',key:'2026-11',year:2026,month:11,tabTitle:'QA'}, values, columnMap, cinemaRegistry);
  const kept = result.visits.map(visit => visit.sourceRow);
  if (result.issues.some(issue => issue.severity === 'critical') || kept.join(',') !== '2,7,8') {
    throw new Error('R20 reconciliation mapping regression: ' + JSON.stringify({kept, issues:result.issues.map(issue => issue.code)}));
  }
  return {excludedReconciliationRows:4, retainedVisitRows:kept};
}

function mappingSelfTest(){const columnMap=loadColumnMap(),registry=loadCinemaRegistry();const hnHeader=['País','ID CINEMA','CIUDAD','DIRECCIÓN','Franja Horaria','Formato','Tipo Combo','Tipo Compra','Método Pago','Quincena','Shopper Asignado'];const hn=findHeader([hnHeader],{country:'HN'},columnMap);const known=hn?resolveShoppingIdentity('','2052004',{country:'HN'},hn,registry):{error:'header_not_found'};const unknown=hn?resolveShoppingIdentity('','2099999',{country:'HN'},hn,registry):{error:'header_not_found'};const gtHeader=['País','ID CINEMA','CIUDAD','Shopping','Quincena','Shopper Asignado'];const gt=findHeader([gtHeader],{country:'GT'},columnMap);const gtIdentity=gt?resolveShoppingIdentity('C. Prueba GT','1001',{country:'GT'},gt,registry):{error:'header_not_found'};const pass=hn?.variantId==='project_scoped_cinema_identity'&&known.shopping==='C. Mall Premier'&&known.error===null&&unknown.error==='cinema_identity_unknown'&&gt?.variantId==='full_identity'&&gtIdentity.shopping==='C. Prueba GT'&&gtIdentity.source==='column';const report={decision:pass?'PASS_R20_PROJECT_SCOPED_CINEMA_IDENTITY':'HOLD_R20_PROJECT_SCOPED_CINEMA_IDENTITY',reconciliation:reconciliationMappingSelfTest(columnMap,registry),hnVariant:hn?.variantId||null,known,unknown,gtVariant:gt?.variantId||null,gtIdentity,safeState:{writes:false,hrWrites:false,deploy:false,production:false}};console.log(JSON.stringify(report,null,2));if(!pass)process.exit(1);}
async function providerAuthSelfTest(){
  let tokenCalls=0;
  const mock=async(url,options)=>{
    tokenCalls++;
    if(url!=='http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token'||options?.headers?.['Metadata-Flavor']!=='Google')throw new Error('METADATA_AUTH_SCOPE_MISMATCH');
    return {ok:true,json:async()=>({access_token:'test-metadata-token'})};
  };
  const success=await oauthToken(mock,'');
  if(success.token!=='test-metadata-token'||tokenCalls!==1)throw new Error('METADATA_AUTH_TOKEN_MISSING');
  const rejected=await oauthToken(async()=>({ok:false,status:403}),'').then(()=>false,()=>true);
  if(!rejected)throw new Error('METADATA_AUTH_FAIL_OPEN');
  console.log(JSON.stringify({decision:'PASS_R20_CLOUD_RUN_METADATA_READ_ONLY_AUTH',tokenCalls,negativeRejected:rejected,hrWrites:0,production:false}));
}
if(process.argv.includes('--provider-auth-self-test'))providerAuthSelfTest().catch(error=>{console.error(error);process.exit(1);});
else if(process.argv.includes('--mapping-self-test'))mappingSelfTest();
else if(process.argv.includes('--assignment-self-test'))assignmentSelfTest();
else if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url) main().catch(error=>{reportHrSourceFailure(error);process.exit(1);});

// Reuse the accepted R20 canonical parser for original Excel Graph values.
// Module import must NEVER trigger the legacy Google source reader.
export {parseTab,buildPeriods,buildShoppers};

