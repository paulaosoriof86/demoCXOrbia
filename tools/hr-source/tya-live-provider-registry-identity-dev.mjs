#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { resolveLiveMonthTabs } from './tya-resolve-live-month-tabs.mjs';

const SHEET_ID=process.env.CXORBIA_HR_LIVE_SHEET_ID||'1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const REGISTRY_OUT=path.resolve(process.env.CXORBIA_HR_TAB_REGISTRY||'.tmp/live-hr-tab-registry.source-safe.json');
const IDENTITY_OUT=process.env.CXORBIA_HR_OPERATIONAL_IDENTITY_OUT?path.resolve(process.env.CXORBIA_HR_OPERATIONAL_IDENTITY_OUT):null;
const SERVICE_ACCOUNT_JSON=process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'';
const MAX_ROW=Number(process.env.CXORBIA_HR_LIVE_MAX_ROW||140);
const MAX_COL=process.env.CXORBIA_HR_LIVE_MAX_COL||'AI';
const COLUMN_MAP=JSON.parse(fs.readFileSync(path.resolve('backend/contracts/tya-hr-column-map-r20-v1.json'),'utf8'));
const MONTH_NAMES=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];


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

function b64url(input){return Buffer.from(input).toString('base64url');}
function signJwt(sa){
  const now=Math.floor(Date.now()/1000);
  const unsigned=`${b64url(JSON.stringify({alg:'RS256',typ:'JWT'}))}.${b64url(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/spreadsheets.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+1800}))}`;
  const signer=crypto.createSign('RSA-SHA256');signer.update(unsigned);signer.end();
  return `${unsigned}.${signer.sign(sa.private_key).toString('base64url')}`;
}
async function json(url,options={}){
  const r=await fetch(url,options);let body=null;try{body=await r.json();}catch{}
  if(!r.ok)throw new Error(`HTTP_${r.status}:${JSON.stringify(body||{}).slice(0,300)}`);
  return body;
}
async function accessToken(){
  if(SERVICE_ACCOUNT_JSON){
    const sa=JSON.parse(SERVICE_ACCOUNT_JSON);
    if(sa.type!=='service_account'||!sa.client_email||!sa.private_key)throw new Error('service_account_json_invalid');
    const token=await json('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:signJwt(sa)})});
    if(!token.access_token)throw new Error('oauth_access_token_missing');
    return {token:token.access_token,principal:sa.client_email,mode:'service_account_json'};
  }
  const token=await json('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',{headers:{'Metadata-Flavor':'Google'}});
  const emailResponse=await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email',{headers:{'Metadata-Flavor':'Google'}});
  const principal=emailResponse.ok?(await emailResponse.text()).trim():'cloud-run-runtime-service-account';
  if(!token.access_token)throw new Error('metadata_access_token_missing');
  return {token:token.access_token,principal,mode:'cloud_run_metadata'};
}
async function sheets(pathAndQuery,token){
  return readSheetsJson(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${pathAndQuery}`,{headers:{Authorization:`Bearer ${token}`,'Cache-Control':'no-store'}});
}
function normalized(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').replace(/\s+/g,' ').trim();}
function currentPeriodDescriptor(){
  const explicit=String(process.env.CXORBIA_EXPECTED_CURRENT_PERIOD||'').trim();
  const match=explicit.match(/^(20\d{2})-(0[1-9]|1[0-2])$/);
  const timezone=process.env.CXORBIA_TENANT_TIMEZONE||'America/Guatemala';
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  const year=match?Number(match[1]):Number(parts.year);
  const month=match?Number(match[2]):Number(parts.month);
  const yy=String(year).slice(-2);
  const monthName=MONTH_NAMES[month-1];
  return {periodKey:`${year}-${String(month).padStart(2,'0')}`,tabs:[`${monthName} ${yy}`,`${monthName} ${yy} HN`]};
}
function assigned(value){
  const text=normalized(value);if(!text)return false;
  if(/^(p x asignar|por asignar|pendiente|sin asignar|no asignado|n a|na|ninguno|0|false)$/.test(text))return false;
  return !text.includes('p x asignar');
}
function safeHash(value,prefix){const raw=String(value||'').trim().toLowerCase();return raw?`${prefix}_${crypto.createHash('sha256').update(raw).digest('hex').slice(0,10)}`:'';}
function findHeader(values){
  const variants=Array.isArray(COLUMN_MAP.headerVariants)?COLUMN_MAP.headerVariants:[];
  for(let i=0;i<Math.min(values.length,14);i++){
    const cells=(values[i]||[]).map(normalized);
    for(const variant of variants){
      const required=(variant.required||[]).map(normalized).filter(Boolean);
      if(required.length&&required.every(x=>cells.includes(x)))return {index:i,cells};
    }
  }
  return null;
}
function mappedColumn(header,key,{required=false}={}){
  const aliases=(COLUMN_MAP.columns?.[key]?.aliases||[]).map(normalized);
  for(const alias of aliases){
    const hits=[];header.cells.forEach((v,i)=>{if(v===alias)hits.push(i);});
    if(hits.length===1)return hits[0];
    if(hits.length>1)throw new Error('ambiguous_'+key+'_column');
  }
  if(required)throw new Error(key+'_column_missing');
  return -1;
}
function shopperColumn(header){return mappedColumn(header,'shopper',{required:true});}
function phoneValue(value){return String(value??'').trim().replace(/\.0$/,'').replace(/\s+/g,'');}
function emailValue(value){return String(value??'').trim().toLowerCase();}

async function main(){
  const auth=await accessToken();
  const meta=await sheets('?fields=properties(title),sheets(properties(title,index,gridProperties(rowCount,columnCount)))',auth.token);
  const title=String(meta.properties?.title||'');
  if(title!=='HR Guatemala - Sincronizacion Google Sheets')throw new Error(`canonical_hr_title_mismatch:${title}`);
  const monthly=resolveLiveMonthTabs((meta.sheets||[]).map(s=>({title:s.properties?.title,index:s.properties?.index}))).map(tab=>({title:tab.tabTitle,country:tab.country,periodKey:tab.key}));
  if(!monthly.length)throw new Error('canonical_monthly_tabs_missing');
  const monthlyTabs=monthly.map(x=>x.title);
  const current=currentPeriodDescriptor();
  const currentMonthly=monthly.filter(tab=>tab.periodKey===current.periodKey);
  const currentByCountry=new Map(currentMonthly.map(tab=>[tab.country,tab.title]));
  const currentPeriodPresent=currentByCountry.has('GT')&&currentByCountry.has('HN');
  const now=new Date().toISOString();
  const registry={
    schemaVersion:'cxorbia.tya-live-hr-tab-registry.v1',observedAt:now,sourceTitle:title,sourceSafe:true,
    providerMetadataReadOnly:true,autoDiscovery:true,registryMode:'live_provider_metadata_auto_refresh',
    monthlyTabs,nonMonthlyTabs:(meta.sheets||[]).map(s=>String(s.properties?.title||'')).filter(t=>!monthlyTabs.includes(t)),
    currentCalendarPeriodKey:current.periodKey,
    requiredCurrentPeriodTabs:currentPeriodPresent?[currentByCountry.get('GT'),currentByCountry.get('HN')]:current.tabs,
    requiredCurrentPeriodTabsPresent:currentPeriodPresent,
    provider:{mode:auth.mode,principalMasked:String(auth.principal||'').replace(/^[^@]+/,'***')},
    safety:{pii:false,hrWrites:0,firestoreWrites:0,authWrites:0,production:false,merge:false}
  };
  fs.mkdirSync(path.dirname(REGISTRY_OUT),{recursive:true});
  fs.writeFileSync(REGISTRY_OUT,JSON.stringify(registry,null,2)+'\n','utf8');

  let identityCount=0;
  if(IDENTITY_OUT){
    const identities=new Map(),identityTabs=[...monthly].sort((a,b)=>a.periodKey.localeCompare(b.periodKey)||a.country.localeCompare(b.country));
    // At most two bounded batchGet requests per wave; preserve chronological identity authority.
    const rangeForTab=tab=>hrRangeForTab(tab.title,meta,MAX_COL,MAX_ROW);
    const plannedBatches=hrRangeBatches(identityTabs,rangeForTab);
    for(let start=0;start<plannedBatches.length;start+=2){
      const batches=plannedBatches.slice(start,start+2);
      const results=await Promise.allSettled(batches.map(async batch=>{
        const ranges=batch.map(rangeForTab),q=ranges.map(range=>`ranges=${encodeURIComponent(range)}`).join('&');
        const response=await sheets(`/values:batchGet?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&${q}`,auth.token);
        return validateHrRangeResponse(response,ranges);
      }));
      const failure=results.find(result=>result.status==='rejected');
      if(failure)throw failure.reason;
      for(const [batchIndex,result] of results.entries()){
        const batch=batches[batchIndex],data=result.value;
        (data.valueRanges||[]).forEach((vr,idx)=>{
          const tab=batch[idx],values=Array.isArray(vr.values)?vr.values:[],header=findHeader(values);if(!header)return;
          const shopperCol=shopperColumn(header),phoneCol=mappedColumn(header,'telefono'),mailCol=mappedColumn(header,'mail');
          for(let r=header.index+1;r<values.length;r++){
            const displayName=String(values[r]?.[shopperCol]??'').trim().replace(/\s+/g,' ');if(!assigned(displayName))continue;
            const shopperId=safeHash(displayName,`shopper_${tab.country.toLowerCase()}`);if(!shopperId)continue;
            const phone=phoneCol>=0?phoneValue(values[r]?.[phoneCol]):'',email=mailCol>=0?emailValue(values[r]?.[mailCol]):'';
            const prior=identities.get(shopperId);
            if(prior&&normalized(prior.displayName)!==normalized(displayName))throw new Error(`shopper_hash_identity_conflict:${shopperId}`);
            identities.set(shopperId,{shopperId,displayName,country:tab.country,phone:phone||prior?.phone||'',whatsapp:phone||prior?.whatsapp||prior?.phone||'',email:email||prior?.email||'',lastObservedPeriodKey:tab.periodKey});
          }
        });
      }
    }
    const overlay={schemaVersion:'cxorbia.tya-operational-shopper-identity.v2',generatedAt:now,sourceTitle:title,displayIdentityOnly:false,containsContactData:true,contactDataOptional:true,containsGovernmentId:false,containsBankData:false,containsCredentials:false,identities:[...identities.values()].sort((a,b)=>a.shopperId.localeCompare(b.shopperId)),safety:{devOnly:true,ephemeralRuntimeFile:true,rawValuesLogged:false,hrWrites:0,firestoreWrites:0,authWrites:0,production:false,merge:false}};
    identityCount=overlay.identities.length;fs.mkdirSync(path.dirname(IDENTITY_OUT),{recursive:true});fs.writeFileSync(IDENTITY_OUT,JSON.stringify(overlay,null,2)+'\n','utf8');
  }
  console.log(JSON.stringify({decision:'PASS_LIVE_PROVIDER_REGISTRY_AND_DEV_DISPLAY_IDENTITY',providerMode:auth.mode,totalTabs:(meta.sheets||[]).length,monthlyTabs:monthly.length,latestMonthlyTab:monthlyTabs.at(-1)||null,currentCalendarPeriodKey:current.periodKey,requiredCurrentPeriodTabsPresent:registry.requiredCurrentPeriodTabsPresent,identityCount,providerReadStats:{...HR_SHEETS_READ_STATS},writes:0,production:false}));
}
main().catch(error=>{reportHrSourceFailure(error);process.exit(1);});

