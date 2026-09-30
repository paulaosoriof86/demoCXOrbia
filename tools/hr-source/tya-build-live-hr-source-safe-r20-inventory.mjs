#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — HR source-safe R20 via verified tab inventory + GViz gid.

  Reads only the 28 monthly GT/HN tabs listed in the source-safe inventory.
  Each tab is fetched read-only by numeric gid with an independent cache-busting
  nonce. The access mode is published as verified only after the inventory,
  header variants, canonical history and expected counts all pass fail-closed.

  No PII, raw workbook, writes, imports, providers, production or payments.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  applyCanonicalVisitState,
  summarizeCanonicalPeriods,
  validateCanonicalHistory,
  normalizedText,
  validIsoDate
} from './tya-canonical-visit-state-r20.mjs';

const SHEET_ID=process.env.CXORBIA_HR_LIVE_SHEET_ID||'1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const OUT_FILE=process.env.CXORBIA_HR_SOURCE_SAFE_OUT||'app/data/tya-hr-source-safe-periods.js';
const MAX_ROW=Number(process.env.CXORBIA_HR_LIVE_MAX_ROW||140);
const MAX_COL=process.env.CXORBIA_HR_LIVE_MAX_COL||'AI';
const INVENTORY_FILE=path.resolve('backend/contracts/tya-hr-tab-inventory-r20-v1.json');
const COLUMN_MAP_FILE=path.resolve('backend/contracts/tya-hr-column-map-r20-v1.json');
const GATE_OUT=path.resolve(process.env.CXORBIA_GATE_OUT||'.tmp/r20-source-safe-gates');
const GENERATED_AT=new Date().toISOString();

function fail(message){throw new Error(message);}
function pad(value){return String(value).padStart(2,'0');}
function safeHash(value,prefix){const raw=String(value||'').trim().toLowerCase();return raw?`${prefix}_${crypto.createHash('sha256').update(raw).digest('hex').slice(0,10)}`:'';}
function parseCsv(text){const rows=[];let row=[],field='',quoted=false;for(let index=0;index<text.length;index++){const char=text[index];if(quoted){if(char==='"'&&text[index+1]==='"'){field+='"';index++;}else if(char==='"')quoted=false;else field+=char;}else if(char==='"')quoted=true;else if(char===','){row.push(field);field='';}else if(char==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=char;}if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows;}
function keyText(value){return normalizedText(value).replace(/[^a-z0-9ñ]+/g,' ').replace(/\s+/g,' ').trim();}
function cell(row,index){return index>=0?String(row?.[index]??'').trim():'';}
function isShopperAssigned(value){const text=normalizedText(value);if(!text)return false;if(/^(p x asignar|por asignar|pendiente|sin asignar|no asignado|n\/a|na|ninguno|-|0|false)$/.test(text))return false;return !text.includes('p x asignar');}
function normalizeMoney(value){const text=String(value||'').trim();if(!text)return null;const normalized=text.replace(/[QL\s]/gi,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(/,/g,'.').replace(/[^0-9.-]/g,'');const number=Number(normalized);return Number.isFinite(number)?number:null;}
function serialDate(value){const number=Number(value);if(!Number.isFinite(number)||number<1||number>100000)return null;const date=new Date(Date.UTC(1899,11,30)+Math.floor(number)*86400000);return Number.isNaN(date.getTime())?null:date.toISOString().slice(0,10);}
function shortDate(day,month,period){let year=Number(period.periodKey.slice(0,4));const periodMonth=Number(period.periodKey.slice(5,7));if(periodMonth===12&&month===1)year++;else if(periodMonth===1&&month===12)year--;const iso=`${year}-${pad(month)}-${pad(day)}`;return validIsoDate(iso)?iso:null;}
function normalizeDate(value,period){if(value==null||value==='')return null;const text=String(value).trim();if(!text)return null;if(/^\d{3,6}(?:\.\d+)?$/.test(text))return serialDate(text)||text;let match=text.match(/^(20\d{2})[-/]([01]?\d)[-/]([0-3]?\d)(?:\s.*)?$/);if(match){const iso=`${match[1]}-${pad(match[2])}-${pad(match[3])}`;return validIsoDate(iso)?iso:text;}match=text.match(/^([0-3]?\d)[/.-]([01]?\d)[/.-](20\d{2})(?:\s.*)?$/);if(match){const iso=`${match[3]}-${pad(match[2])}-${pad(match[1])}`;return validIsoDate(iso)?iso:text;}match=text.match(/(?:^|\s)([0-3]?\d)[-/.]([01]?\d)$/);if(match)return shortDate(Number(match[1]),Number(match[2]),period)||text;return text;}

function loadJson(file,id){if(!fs.existsSync(file))fail(`Missing contract: ${file}`);const value=JSON.parse(fs.readFileSync(file,'utf8'));if(value.contractId!==id)fail(`Contract identity mismatch: ${file}`);return value;}
function enrichTab(tab){const [year,month]=String(tab.periodKey).split('-').map(Number);const labels=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];const full=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];return {...tab,year,month,label:`${labels[month-1]} ${year}`,fullLabel:`${full[month-1]} ${year}`};}
async function fetchTab(tab){const nonce=`${Date.now()}-${tab.gid}-${crypto.randomBytes(6).toString('hex')}`;const params=new URLSearchParams({tqx:'out:csv',gid:String(tab.gid),range:`A1:${MAX_COL}${MAX_ROW}`,tq:'select *',_cxnonce:nonce});const response=await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?${params}`,{redirect:'follow',headers:{'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache','Expires':'0','User-Agent':'CXOrbia-Phase-A-R20/1.1'}});const type=response.headers.get('content-type')||'',text=await response.text();if(!response.ok||!type.includes('text/csv')||/^<!doctype html/i.test(text.trim())||/google visualization api query language/i.test(text.toLowerCase()))fail(`GViz gid read failed for ${tab.title}: HTTP ${response.status} ${type}`);const values=parseCsv(text).slice(0,MAX_ROW);if(!values.length)fail(`GViz gid returned no rows for ${tab.title}`);return {values,nonce,gid:Number(tab.gid),cacheBustApplied:true};}
async function mapLimit(items,limit,mapper){const results=new Array(items.length);let cursor=0;async function worker(){while(true){const index=cursor++;if(index>=items.length)return;results[index]=await mapper(items[index],index);}}await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));return results;}

/* R20_TAB_SCOPED_HEADER_VARIANT — shared canonical resolver semantics. */
function headerVariants(columnMap){const configured=Array.isArray(columnMap?.headerVariants)?columnMap.headerVariants:[];if(configured.length)return configured;return [{id:'full_identity',required:columnMap?.headerSignature||['País','ID CINEMA','Shopping'],countrySource:'column',cinemaIdSource:'column'}];}
function findHeader(values,tab,columnMap){const variants=headerVariants(columnMap);for(let index=0;index<Math.min(values.length,14);index++){const row=values[index]||[],cells=row.map(keyText);for(const variant of variants){const required=(variant.required||[]).map(keyText).filter(Boolean);if(required.length&&required.every(needle=>cells.includes(needle))){return {index,row,cells,variantId:variant.id||'unknown',countrySource:variant.countrySource||'column',cinemaIdSource:variant.cinemaIdSource||'column',duplicateColumns:{},tabTitle:tab.title};}}}return null;}
function resolveColumn(header,aliases,name,spec={}){const needles=aliases.map(keyText).filter(Boolean);const decide=hits=>{if(hits.length===1)return hits[0];if(hits.length>1){if(spec.duplicatePolicy==='coalesce_equal_or_single_nonempty'){header.duplicateColumns[name]=hits;return hits[hits.length-1];}return -2;}return null;};for(const needle of needles){const result=decide(header.cells.reduce((out,value,index)=>{if(value===needle)out.push(index);return out;},[]));if(result!==null)return result;}for(const needle of needles){const result=decide(header.cells.reduce((out,value,index)=>{if(value===needle||value.startsWith(`${needle} `)||value.endsWith(` ${needle}`))out.push(index);return out;},[]));if(result!==null)return result;}return -1;}
function duplicateValues(row,header,name){return (header.duplicateColumns?.[name]||[]).map(index=>cell(row,index)).filter(Boolean);}
function mappedColumnConflict(row,header,name){return new Set(duplicateValues(row,header,name).map(normalizedText)).size>1;}
function mappedCell(row,columns,header,name){const values=duplicateValues(row,header,name);return values.length?values[values.length-1]:cell(row,columns[name]);}
function isVisitRow(row,columns,header,tab){const shopping=mappedCell(row,columns,header,'shopping');const city=mappedCell(row,columns,header,'ciudad');if(!shopping||!city)return false;if(header.countrySource==='tab_name')return Boolean(tab?.country);return Boolean(mappedCell(row,columns,header,'pais')&&mappedCell(row,columns,header,'idCinema'));}

function parseTab(tab,values,columnMap){
  const header=findHeader(values||[],tab,columnMap);
  if(!header)return {visits:[],issues:[{code:'header_not_found',severity:'critical',tab:tab.title}],diagnostic:{title:tab.title,gid:tab.gid,country:tab.country,periodKey:tab.periodKey,rows:0,headerRow:null,headerVariant:null,columns:{}}};
  const columns={},issues=[];
  for(const [name,spec] of Object.entries(columnMap.columns||{})){
    columns[name]=resolveColumn(header,spec.aliases||[],name,spec);
    const contextualMissing=columns[name]<0&&Array.isArray(spec.contextualMissingAllowedIn)&&spec.contextualMissingAllowedIn.includes(header.variantId);
    if(columns[name]===-2)issues.push({code:'column_ambiguous',severity:spec.critical?'critical':'warning',tab:tab.title,column:name});
    else if(columns[name]<0&&spec.critical&&!contextualMissing)issues.push({code:'column_missing',severity:'critical',tab:tab.title,column:name});
    else if(contextualMissing)issues.push({code:'column_contextual_identity',severity:'warning',tab:tab.title,column:name,headerVariant:header.variantId});
    else if(columns[name]<0)issues.push({code:'column_missing_optional',severity:'warning',tab:tab.title,column:name});
  }
  if(issues.some(issue=>issue.severity==='critical'))return {visits:[],issues,diagnostic:{title:tab.title,gid:tab.gid,country:tab.country,periodKey:tab.periodKey,rows:0,headerRow:header.index+1,headerVariant:header.variantId,countrySource:header.countrySource,cinemaIdSource:header.cinemaIdSource,duplicateColumns:header.duplicateColumns,columns}};
  const visits=[],shopperSignals={assigned:0,unassigned:0,placeholder:0},columnDiagnostics={};
  for(const [name,index] of Object.entries(columns))columnDiagnostics[name]={index,header:index>=0?cell(header.row,index):null,nonEmptyVisitRows:0};
  for(let rowIndex=header.index+1;rowIndex<values.length;rowIndex++){
    const row=values[rowIndex]||[];
    if(!isVisitRow(row,columns,header,tab))continue;
    const duplicateConflicts=Object.keys(header.duplicateColumns||{}).filter(name=>mappedColumnConflict(row,header,name));
    if(duplicateConflicts.length){for(const name of duplicateConflicts)issues.push({code:'duplicate_column_conflict',severity:'critical',tab:tab.title,row:rowIndex+1,column:name});continue;}
    const value=name=>mappedCell(row,columns,header,name);
    for(const [name,index] of Object.entries(columns))if(index>=0&&cell(row,index))columnDiagnostics[name].nonEmptyVisitRows++;
    const shopperRaw=value('shopper'),hasShopper=isShopperAssigned(shopperRaw);
    if(hasShopper)shopperSignals.assigned++;else{shopperSignals.unassigned++;if(shopperRaw)shopperSignals.placeholder++;}
    const cinemaId=value('idCinema'),shopping=value('shopping');
    const visitId=`hr_${tab.periodKey}_${tab.country.toLowerCase()}_${rowIndex+1}_${safeHash([cinemaId,shopping,value('quincena'),value('franja'),rowIndex+1].join('|'),'v').slice(-10)}`;
    const shopperId=hasShopper?safeHash(shopperRaw,`shopper_${tab.country.toLowerCase()}`):null;
    visits.push(applyCanonicalVisitState({id:visitId,hrRowId:`${tab.title}!${rowIndex+1}`,sourceTab:tab.title,sourceRow:rowIndex+1,tenantId:'tya',projectId:'cinepolis',program:'cinepolis',periodKey:tab.periodKey,periodLabel:tab.label,pais:tab.country,country:tab.country,cinemaId,sucursal:shopping,ciudad:value('ciudad'),quincena:value('quincena'),franja:value('franja'),franjaCode:normalizedText(value('franja')).includes('wknd')?'WKND':'WK',formato:value('formato'),escenario:value('tipoCompra'),tipoCombo:value('tipoCombo'),metodoPago:value('metodoPago'),disponibleDesde:normalizeDate(value('disponibleDesde'),tab),agendada:normalizeDate(value('fechaProgramada'),tab),realizada:normalizeDate(value('fechaRealizada'),tab),cuestFecha:normalizeDate(value('fechaCuestionario'),tab),submittedAt:normalizeDate(value('fechaSubmitido'),tab),controlDia:value('controlDia'),shopperId,shopper:hasShopper?'Shopper protegido':null,shopperCode:hasShopper?safeHash(shopperRaw,`TYA_${tab.country}`).toUpperCase():null,hasShopper,currency:tab.country==='HN'?'L':'Q',honorario:normalizeMoney(value('honorarios')),boleto:normalizeMoney(value('precioBoleto')),comboAmt:normalizeMoney(value('precioCombo')),sourceSafe:true,piiProtected:true}));
  }
  return {visits,issues,diagnostic:{title:tab.title,gid:tab.gid,country:tab.country,periodKey:tab.periodKey,rows:visits.length,headerRow:header.index+1,headerVariant:header.variantId,countrySource:header.countrySource,cinemaIdSource:header.cinemaIdSource,duplicateColumns:header.duplicateColumns,shopperSignals,columnDiagnostics}};
}

function buildPeriods(visits,tabs){const map=new Map();for(const tab of tabs)if(!map.has(tab.periodKey))map.set(tab.periodKey,{key:tab.periodKey,id:`cinepolis-${tab.periodKey}`,projectId:'cinepolis',label:tab.label,fullLabel:tab.fullLabel,year:tab.year,month:tab.month,visits:0,byCountry:{GT:0,HN:0}});for(const visit of visits){const row=map.get(visit.periodKey);if(row){row.visits++;row.byCountry[visit.country]=(row.byCountry[visit.country]||0)+1;}}return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key));}
function buildShoppers(visits){const map=new Map();for(const visit of visits){if(!visit.canonicalFacets?.assigned||!visit.shopperId)continue;const current=map.get(visit.shopperId)||{id:visit.shopperId,shopperId:visit.shopperId,code:visit.shopperCode,nombre:'Shopper protegido',pais:visit.country,ciudad:visit.ciudad||'',estado:null,status:null,rating:null,completion:null,preference:null,honorario:null,perfilCompleto:false,dataLevel:'protected_reference',operationalProfileAvailable:false,fullAuthorizedProfileAvailable:false,visitas:0,realizadas:0,submitidas:0,liquidationCandidates:0,liquidadas:0,pagadas:0,sourceSafe:true,piiProtected:true};current.visitas++;current.realizadas+=visit.canonicalFacets.realized?1:0;current.submitidas+=visit.canonicalFacets.submitted?1:0;current.liquidationCandidates+=visit.canonicalFacets.liquidationCandidate?1:0;current.liquidadas+=visit.canonicalFacets.liquidationConfirmed?1:0;current.pagadas+=visit.canonicalFacets.paymentConfirmed?1:0;map.set(visit.shopperId,current);}return [...map.values()].sort((a,b)=>String(a.code||'').localeCompare(String(b.code||'')));}

function verifyInventoryAndCounts(inventory,tabs,fetches,periods,visits,diagnostics,counts,columnMap){
  const expected=inventory.historyScope||{};
  const periodKeys=[...new Set(tabs.map(tab=>tab.periodKey))].sort();
  const issues=[];
  if(tabs.length!==Number(expected.countryTabs))issues.push({code:'inventory_tab_count_mismatch',expected:expected.countryTabs,observed:tabs.length});
  if(periodKeys.length!==Number(expected.periodCount))issues.push({code:'inventory_period_count_mismatch',expected:expected.periodCount,observed:periodKeys.length});
  if(periods.length!==Number(expected.periodCount))issues.push({code:'built_period_count_mismatch',expected:expected.periodCount,observed:periods.length});
  if(visits.length!==Number(expected.visitsExpectedFromCurrentStructure))issues.push({code:'visit_count_mismatch',expected:expected.visitsExpectedFromCurrentStructure,observed:visits.length});
  if(fetches.length!==tabs.length||fetches.some(item=>!item?.cacheBustApplied||!item?.nonce||!Number.isFinite(item?.gid)))issues.push({code:'gid_cache_bust_evidence_incomplete'});
  const uniqueNonces=new Set(fetches.map(item=>item.nonce));
  if(uniqueNonces.size!==fetches.length)issues.push({code:'gid_cache_bust_nonce_not_unique',observed:uniqueNonces.size,expected:fetches.length});
  const variants=headerVariants(columnMap);
  const variantById=new Map(variants.map(variant=>[variant.id,variant]));
  const unresolvedHeaders=diagnostics.filter(item=>!item.headerVariant||!variantById.has(item.headerVariant));
  if(unresolvedHeaders.length)issues.push({code:'header_variant_unresolved',tabs:unresolvedHeaders.map(item=>item.title)});
  const identityMismatches=diagnostics.filter(item=>{const variant=variantById.get(item.headerVariant);return variant&&(item.countrySource!==variant.countrySource||item.cinemaIdSource!==variant.cinemaIdSource);});
  if(identityMismatches.length)issues.push({code:'header_variant_identity_source_mismatch',tabs:identityMismatches.map(item=>({title:item.title,variant:item.headerVariant,countrySource:item.countrySource,cinemaIdSource:item.cinemaIdSource}))});
  const julyGt=diagnostics.find(item=>item.title==='JULIO 26');
  const julyHn=diagnostics.find(item=>item.title==='JULIO 26 HN');
  const invalidPeriods=periods.filter(item=>item.visits!==44||item.byCountry?.GT!==34||item.byCountry?.HN!==10);
  if(invalidPeriods.length)issues.push({code:'period_country_totals_mismatch',periods:invalidPeriods.map(item=>({key:item.key,visits:item.visits,byCountry:item.byCountry}))});
  if(counts.byCountry?.GT!==476||counts.byCountry?.HN!==140)issues.push({code:'country_totals_mismatch',observed:counts.byCountry});
  if(issues.length)fail(`R20 verified inventory HOLD: ${JSON.stringify(issues).slice(0,5000)}`);
  return {verified:true,periodKeys,expected:{periods:Number(expected.periodCount),tabs:Number(expected.countryTabs),visits:Number(expected.visitsExpectedFromCurrentStructure)},observed:{periods:periods.length,tabs:tabs.length,visits:visits.length,byCountry:counts.byCountry},cacheBustByGid:true,uniqueNonceCount:uniqueNonces.size,headerVariants:{allowed:[...variantById.keys()],july26Observed:julyGt?.headerVariant||null,july26HnObserved:julyHn?.headerVariant||null}};
}

async function main(){
  const inventory=loadJson(INVENTORY_FILE,'tya-hr-tab-inventory-r20-v1');
  const columnMap=loadJson(COLUMN_MAP_FILE,'tya-hr-column-map-r20-v1');
  if(columnMap.resolutionPolicy!=='exact_or_unique_anchored_only')fail('Column map resolution policy mismatch.');
  const tabs=inventory.tabs.map(enrichTab).sort((a,b)=>a.periodKey.localeCompare(b.periodKey)||a.country.localeCompare(b.country));
  const fetches=await mapLimit(tabs,6,fetchTab);
  const visits=[],issues=[],diagnostics=[];
  for(let index=0;index<tabs.length;index++){
    const parsed=parseTab(tabs[index],fetches[index].values,columnMap);
    visits.push(...parsed.visits);
    issues.push(...parsed.issues);
    diagnostics.push({...parsed.diagnostic,cacheBustApplied:fetches[index].cacheBustApplied,nonceHash:crypto.createHash('sha256').update(fetches[index].nonce).digest('hex').slice(0,12)});
  }
  const blockers=issues.filter(issue=>issue.severity==='critical');
  if(blockers.length)fail(`R20 HR mapping HOLD: ${JSON.stringify(blockers).slice(0,5000)}`);
  const periods=buildPeriods(visits,tabs);
  const history=validateCanonicalHistory(visits,periods);
  if(history.decision!=='PASS_CANONICAL_HISTORY')fail(`R20 canonical history HOLD: ${JSON.stringify(history.issues).slice(0,3000)}`);
  const shoppers=buildShoppers(visits),summaries=summarizeCanonicalPeriods(visits),byStatus={},byCountry={};
  for(const visit of visits){byStatus[visit.estado]=(byStatus[visit.estado]||0)+1;byCountry[visit.country]=(byCountry[visit.country]||0)+1;}
  const counts={periods:periods.length,tabs:tabs.length,visits:visits.length,shoppers:shoppers.length,byStatus,byCountry,assigned:visits.filter(v=>v.canonicalFacets.assigned).length,unassigned:visits.filter(v=>!v.canonicalFacets.assigned).length,scheduled:visits.filter(v=>v.canonicalFacets.scheduled).length,realized:visits.filter(v=>v.canonicalFacets.realized).length,questionnaireCompleted:visits.filter(v=>v.canonicalFacets.questionnaire).length,submitted:visits.filter(v=>v.canonicalFacets.submitted).length,liquidationCandidatesPendingFinancialMatch:visits.filter(v=>v.liquidationState==='candidate_pending_financial_match').length,liquidationConfirmed:visits.filter(v=>v.liquidationState==='confirmed').length,paymentConfirmed:visits.filter(v=>v.paymentState==='confirmed').length,reviewRequired:visits.filter(v=>v.reviewRequired===true).length};
  const inventoryVerification=verifyInventoryAndCounts(inventory,tabs,fetches,periods,visits,diagnostics,counts,columnMap);
  const accessMode='public_gviz_gid_verified_inventory';
  const snapshot={generatedAt:GENERATED_AT,buildLabel:process.env.CXORBIA_DEV_BUILD_LABEL||'tya-live-hr-source-safe-r20-gid',tenantId:'tya',tenantName:'TyA',projectId:'cinepolis',projectName:'Cinépolis',source:{type:'google_sheets_live_multitab',accessMode,title:'HR Guatemala - Sincronizacion Google Sheets',spreadsheetIdMasked:inventory.spreadsheetIdMasked,tabInventoryContract:inventory.contractId,tabInventoryVerifiedAt:inventory.verifiedAt,inventoryVerification,cacheBustApplied:true,sourceSafe:true,piiExcluded:['nombre_shopper','telefono','mail','dpi','banco','direccion_shopper','observaciones','hr_url_privada','workbook_crudo'],semanticNormalizer:'r15g+r20',columnMapContract:columnMap.contractId,columnResolver:columnMap.resolutionPolicy,mappingFailClosed:true,dateFormat:'YYYY-MM-DD',submissionLiquidationSeparated:true,canonicalStateAcrossAllDetectedPeriods:true,buildTimeSnapshot:true,runtimeLiveSync:false},tenantConfig:{tenantId:'tya',tenantName:'TyA',configurable:true},projectConfig:{projectId:'cinepolis',projectName:'Cinépolis',configurable:true,countries:['GT','HN'],questionnaireSource:'TyAOnline',hrSourceType:'google_sheets_live_multitab'},sourceSafe:true,imported:false,production:false,periods,visits,shoppers,counts,periodOperationalSummary:summaries,tabsRead:diagnostics,issues,normalization:{version:'R20-gid',periodCount:periods.length,periodKeys:periods.map(row=>row.key),historyScope:'all_verified_hr_periods',cacheBustApplied:true,rules:['verified_gid_inventory','per_tab_gviz_live_read','canonical_header_variants','contextual_missing_identity','coalesce_equal_or_single_nonempty','contract_driven_column_map','strict_unique_header_resolution','empty_or_placeholder_shopper_is_unassigned','valid_dates_by_period_context','submitted_is_not_liquidated_or_paid','financial_confirmation_requires_external_source','conflicts_require_review']},safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false}};
  fs.mkdirSync(path.dirname(OUT_FILE),{recursive:true});
  fs.writeFileSync(OUT_FILE,['/* CXOrbia TyA live HR source-safe R20 payload by verified gid; no PII/raw workbook. */','window.CX_TYA_HR_SOURCE_SAFE = ',JSON.stringify(snapshot,null,2),';'].join(''),'utf8');
  fs.mkdirSync(GATE_OUT,{recursive:true});
  fs.writeFileSync(path.join(GATE_OUT,'hr-header-column-diagnostics.source-safe.json'),JSON.stringify({schemaVersion:'4.1.0',sourceSafe:true,containsDataRows:false,containsPii:false,generatedAt:GENERATED_AT,accessMode,historyScope:'all_verified_hr_periods',tabInventoryContract:inventory.contractId,columnMapContract:columnMap.contractId,inventoryVerification,tabs:diagnostics,issues,blockers},null,2)+'\n','utf8');
  console.log(JSON.stringify({decision:'PASS_R20_GID_CANONICAL_HR_HISTORY',outFile:OUT_FILE,accessMode,counts,periods:periods.map(row=>row.key),inventoryVerification,safeState:snapshot.safeState},null,2));
}

main().catch(error=>{console.error(`R20_GID_HR_BUILD_HOLD: ${String(error?.message||error)}`);process.exit(1);});
