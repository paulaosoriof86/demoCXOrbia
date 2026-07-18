#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — live HR source-safe builder R20.

  Lee la HR multi-tab completa desde Sheets API read-only cuando hay credencial
  disponible y, como fallback, descarga un XLSX público con cache-busting y
  encabezados no-cache. Usa un contrato único de columnas y la misma máquina
  canónica para todos los periodos detectados.

  No escribe HR/Firestore/Storage, no importa, no activa proveedores, no paga y
  excluye PII del payload y de los diagnósticos.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  unzipXlsx,
  sharedStrings,
  workbookSheets,
  worksheetRows
} from './tya-hr-source-xlsx-lite.mjs';
import {
  applyCanonicalVisitState,
  summarizeCanonicalPeriods,
  validateCanonicalHistory,
  normalizedText,
  validIsoDate
} from './tya-canonical-visit-state-r20.mjs';

const SHEET_ID = process.env.CXORBIA_HR_LIVE_SHEET_ID || '1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const OUT_FILE = process.env.CXORBIA_HR_SOURCE_SAFE_OUT || 'app/data/tya-hr-source-safe-periods.js';
const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '';
const RANGE_MAX_ROW = Number(process.env.CXORBIA_HR_LIVE_MAX_ROW || 140);
const RANGE_MAX_COL = process.env.CXORBIA_HR_LIVE_MAX_COL || 'AI';
const COLUMN_MAP_FILE = path.resolve('backend/contracts/tya-hr-column-map-r20-v1.json');
const GATE_OUT = path.resolve(process.env.CXORBIA_GATE_OUT || '.tmp/r20-source-safe-gates');
const NOW = new Date().toISOString();

const MONTHS = {
  ENERO:{n:1,short:'ENE',full:'Enero'}, FEBRERO:{n:2,short:'FEB',full:'Febrero'},
  MARZO:{n:3,short:'MAR',full:'Marzo'}, ABRIL:{n:4,short:'ABR',full:'Abril'},
  MAYO:{n:5,short:'MAY',full:'Mayo'}, JUNIO:{n:6,short:'JUN',full:'Junio'},
  JULIO:{n:7,short:'JUL',full:'Julio'}, AGOSTO:{n:8,short:'AGO',full:'Agosto'},
  SEPTIEMBRE:{n:9,short:'SEP',full:'Septiembre'}, SETIEMBRE:{n:9,short:'SEP',full:'Septiembre'},
  OCTUBRE:{n:10,short:'OCT',full:'Octubre'}, NOVIEMBRE:{n:11,short:'NOV',full:'Noviembre'},
  DICIEMBRE:{n:12,short:'DIC',full:'Diciembre'}
};

function fail(message){ throw new Error(message); }
function safeHash(value,prefix){
  const raw=String(value||'').trim().toLowerCase();
  if(!raw)return '';
  return `${prefix}_${crypto.createHash('sha256').update(raw).digest('hex').slice(0,10)}`;
}
function b64url(input){return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');}
function safeServiceAccountInfo(){
  try{const sa=SERVICE_ACCOUNT_JSON?JSON.parse(SERVICE_ACCOUNT_JSON):{};return {type:sa.type||'',clientEmail:sa.client_email||'',projectId:sa.project_id||''};}
  catch{return {type:'',clientEmail:'',projectId:''};}
}
function signJwt(sa){
  const now=Math.floor(Date.now()/1000);
  const unsigned=`${b64url(JSON.stringify({alg:'RS256',typ:'JWT'}))}.${b64url(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/spreadsheets.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}))}`;
  const signer=crypto.createSign('RSA-SHA256');signer.update(unsigned);signer.end();
  return `${unsigned}.${signer.sign(sa.private_key).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}`;
}
async function tokenFromServiceAccount(){
  if(!SERVICE_ACCOUNT_JSON)fail('Missing FIREBASE_SERVICE_ACCOUNT_JSON env.');
  const sa=JSON.parse(SERVICE_ACCOUNT_JSON);
  if(sa.type!=='service_account')fail('Secret is not a service_account JSON.');
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:signJwt(sa)});
  const res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  const json=await res.json();
  if(!res.ok)fail(`Google OAuth failed: HTTP ${res.status} ${JSON.stringify(json).slice(0,200)}`);
  return {token:json.access_token,clientEmail:sa.client_email};
}
async function sheetsGet(pathAndQuery,token){
  const res=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${pathAndQuery}`,{headers:{Authorization:`Bearer ${token}`,'Cache-Control':'no-cache'}});
  const json=await res.json();
  if(!res.ok)fail(`Sheets API failed: HTTP ${res.status} ${JSON.stringify(json).slice(0,500)}`);
  return json;
}

function parseTabName(title){
  const clean=String(title||'').trim().replace(/\s+/g,' ').toUpperCase();
  const match=clean.match(/^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|SETIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(\d{2})(?:\s+(HN))?$/);
  if(!match)return null;
  const month=MONTHS[match[1]],year=2000+Number(match[2]),country=match[3]==='HN'?'HN':'GT';
  return {country,year,month:month.n,monthName:month.full,label:`${month.short} ${year}`,fullLabel:`${month.full} ${year}`,key:`${year}-${String(month.n).padStart(2,'0')}`,tabTitle:title};
}
function keyText(value){return normalizedText(value).replace(/[^a-z0-9ñ]+/g,' ').replace(/\s+/g,' ').trim();}
function findHeader(values){
  for(let index=0;index<Math.min(values.length,14);index++){
    const row=values[index]||[],cells=row.map(keyText);
    if(cells.includes('pais')&&cells.some(value=>value.includes('shopping')))return {index,row,cells};
  }
  return null;
}
function resolveColumn(header,aliases){
  const cells=header.cells,needles=aliases.map(keyText).filter(Boolean);
  for(const needle of needles){
    const hits=cells.reduce((out,value,index)=>{if(value===needle)out.push(index);return out;},[]);
    if(hits.length===1)return hits[0];
    if(hits.length>1)return -2;
  }
  for(const needle of needles){
    const hits=cells.reduce((out,value,index)=>{if(value===needle||value.startsWith(`${needle} `)||value.endsWith(` ${needle}`))out.push(index);return out;},[]);
    if(hits.length===1)return hits[0];
    if(hits.length>1)return -2;
  }
  return -1;
}
function cell(row,index){return index>=0?String(row?.[index]??'').trim():'';}
function visitRow(row,columns){return Boolean(cell(row,columns.pais)&&cell(row,columns.shopping)&&cell(row,columns.idCinema));}
function isShopperAssigned(value){
  const text=normalizedText(value);
  if(!text)return false;
  if(/^(p x asignar|por asignar|pendiente|sin asignar|no asignado|n\/a|na|ninguno|-|0|false)$/.test(text))return false;
  return !text.includes('p x asignar');
}
function normalizeMoney(value){
  const text=String(value||'').trim();if(!text)return null;
  const number=Number(text.replace(/[QL\s]/gi,'').replace(/,/g,'.').replace(/[^0-9.-]/g,''));
  return Number.isFinite(number)?number:null;
}
function pad(value){return String(value).padStart(2,'0');}
function serialDate(value){
  const number=Number(value);if(!Number.isFinite(number)||number<1||number>100000)return null;
  const date=new Date(Date.UTC(1899,11,30)+Math.floor(number)*86400000);
  return Number.isNaN(date.getTime())?null:date.toISOString().slice(0,10);
}
function inferShortDate(day,month,period){
  let year=period.year;
  if(period.month===12&&month===1)year+=1;
  else if(period.month===1&&month===12)year-=1;
  const iso=`${year}-${pad(month)}-${pad(day)}`;
  return validIsoDate(iso)?iso:null;
}
function normalizeDate(value,period){
  if(value==null||value==='')return null;
  const text=String(value).trim();if(!text)return null;
  if(/^\d{3,6}(?:\.\d+)?$/.test(text))return serialDate(text)||text;
  let match=text.match(/^(20\d{2})[-/]([01]?\d)[-/]([0-3]?\d)(?:\s.*)?$/);
  if(match){const iso=`${match[1]}-${pad(match[2])}-${pad(match[3])}`;return validIsoDate(iso)?iso:text;}
  match=text.match(/^([0-3]?\d)[/.-]([01]?\d)[/.-](20\d{2})(?:\s.*)?$/);
  if(match){const iso=`${match[3]}-${pad(match[2])}-${pad(match[1])}`;return validIsoDate(iso)?iso:text;}
  match=text.match(/(?:^|\s)([0-3]?\d)[-/.]([01]?\d)$/);
  if(match)return inferShortDate(Number(match[1]),Number(match[2]),period)||text;
  return text;
}

function loadColumnMap(){
  if(!fs.existsSync(COLUMN_MAP_FILE))fail(`R20 column map missing: ${COLUMN_MAP_FILE}`);
  const contract=JSON.parse(fs.readFileSync(COLUMN_MAP_FILE,'utf8'));
  if(contract.contractId!=='tya-hr-column-map-r20-v1'||contract.resolutionPolicy!=='exact_or_unique_anchored_only')fail('R20 column map identity/policy mismatch.');
  return contract;
}

async function readFromSheetsApi(){
  const {token,clientEmail}=await tokenFromServiceAccount();
  const meta=await sheetsGet('?fields=properties(title,timeZone,locale),sheets(properties(title,index,gridProperties(rowCount,columnCount)))',token);
  const tabs=(meta.sheets||[]).map(sheet=>parseTabName(sheet.properties?.title)).filter(Boolean);
  if(!tabs.length)fail('No valid HR month tabs detected.');
  const ranges=tabs.map(tab=>`'${tab.tabTitle.replace(/'/g,"''")}'!A1:${RANGE_MAX_COL}${RANGE_MAX_ROW}`);
  const valueRanges=[];
  for(let index=0;index<ranges.length;index+=8){
    const query=ranges.slice(index,index+8).map(range=>`ranges=${encodeURIComponent(range)}`).join('&');
    const json=await sheetsGet(`/values:batchGet?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&${query}`,token);
    valueRanges.push(...(json.valueRanges||[]));
  }
  return {accessMode:'sheets_api_service_account',clientEmail,title:meta.properties?.title||'HR Guatemala - Sincronizacion Google Sheets',tabs,valueRanges,cacheBust:null};
}
async function readFromPublicXlsxExport(apiError){
  const cacheBust=`${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const url=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx&cacheBust=${encodeURIComponent(cacheBust)}`;
  const res=await fetch(url,{redirect:'follow',headers:{'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache','Expires':'0'}});
  const buffer=Buffer.from(await res.arrayBuffer()),contentType=res.headers.get('content-type')||'';
  if(!res.ok)fail(`XLSX export failed: HTTP ${res.status} ${contentType}`);
  if(buffer.length<4||buffer[0]!==0x50||buffer[1]!==0x4b)fail(`XLSX export did not return a ZIP workbook: ${contentType}`);
  const files=unzipXlsx(buffer),shared=sharedStrings(files),sheets=workbookSheets(files);
  const tabs=sheets.map(sheet=>parseTabName(sheet.name)).filter(Boolean);
  if(!tabs.length)fail('No valid HR month tabs detected in XLSX export.');
  const valueRanges=tabs.map(tab=>{const sheet=sheets.find(item=>item.name===tab.tabTitle);return {range:tab.tabTitle,values:worksheetRows(files,sheet,shared).slice(0,RANGE_MAX_ROW)};});
  return {accessMode:'public_xlsx_export_fallback_cache_busted',fallbackReason:String(apiError?.message||apiError||'').slice(0,500),clientEmail:safeServiceAccountInfo().clientEmail||'',title:'HR Guatemala - Sincronizacion Google Sheets',tabs,valueRanges,cacheBust};
}
async function readLiveHr(){
  try{return await readFromSheetsApi();}
  catch(error){console.warn('[HR live] Sheets API unavailable; using cache-busted public XLSX read-only fallback.');console.warn(String(error?.message||error).slice(0,800));return readFromPublicXlsxExport(error);}
}

function parseTab(tab,values,columnMap){
  const header=findHeader(values||[]);
  if(!header)return {visits:[],issues:[{code:'header_not_found',severity:'critical',tab:tab.tabTitle}],diagnostic:{title:tab.tabTitle,country:tab.country,periodKey:tab.key,rows:0,headerRow:null,columns:{}}};
  const columns={},issues=[];
  for(const [name,spec] of Object.entries(columnMap.columns||{})){
    columns[name]=resolveColumn(header,spec.aliases||[]);
    if(columns[name]===-2)issues.push({code:'column_ambiguous',severity:spec.critical?'critical':'warning',tab:tab.tabTitle,column:name});
    else if(columns[name]<0&&spec.critical)issues.push({code:'column_missing',severity:'critical',tab:tab.tabTitle,column:name});
    else if(columns[name]<0)issues.push({code:'column_missing_optional',severity:'warning',tab:tab.tabTitle,column:name});
  }
  if(issues.some(issue=>issue.severity==='critical'))return {visits:[],issues,diagnostic:{title:tab.tabTitle,country:tab.country,periodKey:tab.key,rows:0,headerRow:header.index+1,columns}};

  const visits=[];
  const shopperSignals={assigned:0,unassigned:0,placeholder:0};
  const columnDiagnostics={};
  for(const [name,index] of Object.entries(columns))columnDiagnostics[name]={index,header:index>=0?cell(header.row,index):null,nonEmptyVisitRows:0};
  for(let rowIndex=header.index+1;rowIndex<values.length;rowIndex++){
    const row=values[rowIndex]||[];if(!visitRow(row,columns))continue;
    for(const [name,index] of Object.entries(columns))if(index>=0&&cell(row,index))columnDiagnostics[name].nonEmptyVisitRows+=1;
    const shopperRaw=cell(row,columns.shopper),hasShopper=isShopperAssigned(shopperRaw);
    if(hasShopper)shopperSignals.assigned+=1;else{shopperSignals.unassigned+=1;if(shopperRaw)shopperSignals.placeholder+=1;}
    const cinemaId=cell(row,columns.idCinema),shopping=cell(row,columns.shopping);
    const visitId=`hr_${tab.key}_${tab.country.toLowerCase()}_${rowIndex+1}_${safeHash([cinemaId,shopping,cell(row,columns.quincena),cell(row,columns.franja),rowIndex+1].join('|'),'v').slice(-10)}`;
    const shopperId=hasShopper?safeHash(shopperRaw,`shopper_${tab.country.toLowerCase()}`):null;
    const visit={
      id:visitId,hrRowId:`${tab.tabTitle}!${rowIndex+1}`,sourceTab:tab.tabTitle,sourceRow:rowIndex+1,
      tenantId:'tya',projectId:'cinepolis',program:'cinepolis',periodKey:tab.key,periodLabel:tab.label,
      pais:tab.country,country:tab.country,cinemaId,sucursal:shopping,ciudad:cell(row,columns.ciudad),
      quincena:cell(row,columns.quincena),franja:cell(row,columns.franja),franjaCode:normalizedText(cell(row,columns.franja)).includes('wknd')?'WKND':'WK',
      formato:cell(row,columns.formato),escenario:cell(row,columns.tipoCompra),tipoCombo:cell(row,columns.tipoCombo),metodoPago:cell(row,columns.metodoPago),
      disponibleDesde:normalizeDate(cell(row,columns.disponibleDesde),tab),agendada:normalizeDate(cell(row,columns.fechaProgramada),tab),
      realizada:normalizeDate(cell(row,columns.fechaRealizada),tab),cuestFecha:normalizeDate(cell(row,columns.fechaCuestionario),tab),
      submittedAt:normalizeDate(cell(row,columns.fechaSubmitido),tab),controlDia:cell(row,columns.controlDia),
      shopperId,shopper:hasShopper?'Shopper protegido':null,shopperCode:hasShopper?safeHash(shopperRaw,`TYA_${tab.country}`).toUpperCase():null,hasShopper,
      currency:tab.country==='HN'?'L':'Q',honorario:normalizeMoney(cell(row,columns.honorarios)),boleto:normalizeMoney(cell(row,columns.precioBoleto)),comboAmt:normalizeMoney(cell(row,columns.precioCombo)),
      sourceSafe:true,piiProtected:true
    };
    visits.push(applyCanonicalVisitState(visit));
  }
  return {visits,issues,diagnostic:{title:tab.tabTitle,country:tab.country,periodKey:tab.key,rows:visits.length,headerRow:header.index+1,shopperSignals,columnDiagnostics}};
}

function buildShoppers(visits){
  const map=new Map();
  for(const visit of visits){
    if(!visit.canonicalFacets?.assigned||!visit.shopperId)continue;
    const current=map.get(visit.shopperId)||{id:visit.shopperId,shopperId:visit.shopperId,code:visit.shopperCode,nombre:'Shopper protegido',pais:visit.country,ciudad:visit.ciudad||'',estado:null,status:null,rating:null,completion:null,preference:null,honorario:null,perfilCompleto:false,dataLevel:'protected_reference',operationalProfileAvailable:false,fullAuthorizedProfileAvailable:false,visitas:0,realizadas:0,submitidas:0,liquidationCandidates:0,liquidadas:0,pagadas:0,sourceSafe:true,piiProtected:true};
    current.visitas+=1;current.realizadas+=visit.canonicalFacets.realized?1:0;current.submitidas+=visit.canonicalFacets.submitted?1:0;current.liquidationCandidates+=visit.canonicalFacets.liquidationCandidate?1:0;current.liquidadas+=visit.canonicalFacets.liquidationConfirmed?1:0;current.pagadas+=visit.canonicalFacets.paymentConfirmed?1:0;
    map.set(visit.shopperId,current);
  }
  return [...map.values()].sort((a,b)=>String(a.code||'').localeCompare(String(b.code||'')));
}
function buildPeriods(visits,tabs){
  const map=new Map();
  for(const tab of tabs){if(!map.has(tab.key))map.set(tab.key,{key:tab.key,id:`cinepolis-${tab.key}`,projectId:'cinepolis',label:tab.label,fullLabel:tab.fullLabel,year:tab.year,month:tab.month,visits:0,byCountry:{GT:0,HN:0}});}
  for(const visit of visits){const row=map.get(visit.periodKey);if(!row)continue;row.visits+=1;row.byCountry[visit.country]=(row.byCountry[visit.country]||0)+1;}
  return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key));
}

async function main(){
  const columnMap=loadColumnMap(),live=await readLiveHr(),visits=[],issues=[],diagnostics=[];
  live.valueRanges.forEach((range,index)=>{
    const tab=live.tabs[index],parsed=parseTab(tab,range.values||[],columnMap);
    visits.push(...parsed.visits);issues.push(...parsed.issues);diagnostics.push(parsed.diagnostic);
  });
  const blockers=issues.filter(issue=>issue.severity==='critical');
  if(blockers.length)fail(`R20 HR mapping HOLD: ${JSON.stringify(blockers).slice(0,4000)}`);
  const periods=buildPeriods(visits,live.tabs),history=validateCanonicalHistory(visits,periods);
  if(history.decision!=='PASS_CANONICAL_HISTORY')fail(`R20 canonical history HOLD: ${JSON.stringify(history.issues).slice(0,3000)}`);
  const shoppers=buildShoppers(visits),summaries=summarizeCanonicalPeriods(visits),byStatus={},byCountry={};
  for(const visit of visits){byStatus[visit.estado]=(byStatus[visit.estado]||0)+1;byCountry[visit.country]=(byCountry[visit.country]||0)+1;}
  const counts={periods:periods.length,tabs:live.tabs.length,visits:visits.length,shoppers:shoppers.length,byStatus,byCountry,assigned:visits.filter(v=>v.canonicalFacets.assigned).length,unassigned:visits.filter(v=>!v.canonicalFacets.assigned).length,scheduled:visits.filter(v=>v.canonicalFacets.scheduled).length,realized:visits.filter(v=>v.canonicalFacets.realized).length,questionnaireCompleted:visits.filter(v=>v.canonicalFacets.questionnaire).length,submitted:visits.filter(v=>v.canonicalFacets.submitted).length,liquidationCandidatesPendingFinancialMatch:visits.filter(v=>v.liquidationState==='candidate_pending_financial_match').length,liquidationConfirmed:visits.filter(v=>v.liquidationState==='confirmed').length,paymentConfirmed:visits.filter(v=>v.paymentState==='confirmed').length,reviewRequired:visits.filter(v=>v.reviewRequired===true).length};
  const snapshot={generatedAt:NOW,buildLabel:process.env.CXORBIA_DEV_BUILD_LABEL||'tya-live-hr-source-safe-r20',tenantId:'tya',tenantName:'TyA',projectId:'cinepolis',projectName:'Cinépolis',source:{type:'google_sheets_live_multitab',accessMode:live.accessMode,fallbackReason:live.fallbackReason||null,title:live.title,spreadsheetIdMasked:`${SHEET_ID.slice(0,6)}...${SHEET_ID.slice(-4)}`,serviceAccountProject:safeServiceAccountInfo().projectId||'cxorbia-backend-dev',serviceAccountEmailMasked:(live.clientEmail||'').replace(/^[^@]+/,'***'),cacheBustApplied:Boolean(live.cacheBust),sourceSafe:true,piiExcluded:['telefono','mail','dpi','banco','direccion_shopper','hr_url_privada','workbook_crudo'],semanticNormalizer:'r15g+r20',columnMapContract:columnMap.contractId,columnResolver:columnMap.resolutionPolicy,mappingFailClosed:true,dateFormat:'YYYY-MM-DD',submissionLiquidationSeparated:true,canonicalStateAcrossAllDetectedPeriods:true,buildTimeSnapshot:true,runtimeLiveSync:false},tenantConfig:{tenantId:'tya',tenantName:'TyA',configurable:true},projectConfig:{projectId:'cinepolis',projectName:'Cinépolis',configurable:true,countries:['GT','HN'],questionnaireSource:'TyAOnline',hrSourceType:'google_sheets_live_multitab'},sourceSafe:true,imported:false,production:false,periods,visits,shoppers,counts,periodOperationalSummary:summaries,tabsRead:diagnostics,issues,normalization:{version:'R20-fresh',periodCount:periods.length,periodKeys:periods.map(row=>row.key),historyScope:'all_detected_hr_periods',cacheBustApplied:Boolean(live.cacheBust),rules:['fresh_read_or_service_account','contract_driven_column_map','strict_unique_header_resolution','empty_or_placeholder_shopper_is_unassigned','valid_dates_by_period_context','submitted_is_not_liquidated_or_paid','financial_confirmation_requires_external_source','conflicts_require_review']},safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false}};
  fs.mkdirSync(path.dirname(OUT_FILE),{recursive:true});
  fs.writeFileSync(OUT_FILE,['/* CXOrbia TyA live HR source-safe R20 payload; no PII/raw workbook. */','window.CX_TYA_HR_SOURCE_SAFE = ',JSON.stringify(snapshot,null,2),';'].join(''),'utf8');
  fs.mkdirSync(GATE_OUT,{recursive:true});
  fs.writeFileSync(path.join(GATE_OUT,'hr-header-column-diagnostics.source-safe.json'),JSON.stringify({schemaVersion:'2.0.0',sourceSafe:true,containsDataRows:false,containsPii:false,generatedAt:NOW,accessMode:live.accessMode,cacheBustApplied:Boolean(live.cacheBust),historyScope:'all_detected_hr_periods',columnMapContract:columnMap.contractId,tabs:diagnostics,issues,blockers},null,2)+'\n','utf8');
  console.log(JSON.stringify({decision:'PASS_R20_FRESH_CANONICAL_HR_HISTORY',outFile:OUT_FILE,accessMode:live.accessMode,cacheBustApplied:Boolean(live.cacheBust),counts,periods:periods.map(row=>row.key),safeState:snapshot.safeState},null,2));
}

main().catch(error=>{console.error(`R20_LIVE_HR_BUILD_HOLD: ${String(error?.message||error)}`);process.exit(1);});
