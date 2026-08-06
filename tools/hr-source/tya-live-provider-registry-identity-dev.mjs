#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SHEET_ID=process.env.CXORBIA_HR_LIVE_SHEET_ID||'1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const REGISTRY_OUT=path.resolve(process.env.CXORBIA_HR_TAB_REGISTRY||'.tmp/live-hr-tab-registry.source-safe.json');
const IDENTITY_OUT=process.env.CXORBIA_HR_OPERATIONAL_IDENTITY_OUT?path.resolve(process.env.CXORBIA_HR_OPERATIONAL_IDENTITY_OUT):null;
const SERVICE_ACCOUNT_JSON=process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'';
const MAX_ROW=Number(process.env.CXORBIA_HR_LIVE_MAX_ROW||140);
const MAX_COL=process.env.CXORBIA_HR_LIVE_MAX_COL||'AI';
const COLUMN_MAP=JSON.parse(fs.readFileSync(path.resolve('backend/contracts/tya-hr-column-map-r20-v1.json'),'utf8'));
const MONTH_NAMES=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];

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
  return json(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${pathAndQuery}`,{headers:{Authorization:`Bearer ${token}`,'Cache-Control':'no-store'}});
}
function normalized(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').replace(/\s+/g,' ').trim();}
function parseTab(title){
  const clean=String(title||'').trim().replace(/\s+/g,' ').toUpperCase();
  const m=clean.match(/^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|SETIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(\d{2})(?:\s+(HN))?$/);
  if(!m)return null;
  const canonicalMonth=m[1]==='SETIEMBRE'?'SEPTIEMBRE':m[1];
  const month=MONTH_NAMES.indexOf(canonicalMonth)+1;
  const year=2000+Number(m[2]);
  return {title:String(title),country:m[3]==='HN'?'HN':'GT',periodKey:`${year}-${String(month).padStart(2,'0')}`};
}
function currentPeriodDescriptor(){
  const explicit=String(process.env.CXORBIA_EXPECTED_CURRENT_PERIOD||'').trim();
  const match=explicit.match(/^(20\d{2})-(0[1-9]|1[0-2])$/);
  const now=new Date();
  const year=match?Number(match[1]):now.getUTCFullYear();
  const month=match?Number(match[2]):now.getUTCMonth()+1;
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
function shopperColumn(header){
  const aliases=(COLUMN_MAP.columns?.shopper?.aliases||['Shopper Asignado']).map(normalized);
  for(const alias of aliases){const hits=[];header.cells.forEach((v,i)=>{if(v===alias)hits.push(i);});if(hits.length===1)return hits[0];if(hits.length>1)throw new Error('ambiguous_shopper_column');}
  throw new Error('shopper_column_missing');
}

async function main(){
  const auth=await accessToken();
  const meta=await sheets('?fields=properties(title),sheets(properties(title,index))',auth.token);
  const title=String(meta.properties?.title||'');
  if(title!=='HR Guatemala - Sincronizacion Google Sheets')throw new Error(`canonical_hr_title_mismatch:${title}`);
  const monthly=(meta.sheets||[]).map(s=>parseTab(s.properties?.title)).filter(Boolean);
  if(!monthly.length)throw new Error('canonical_monthly_tabs_missing');
  const monthlyTabs=monthly.map(x=>x.title);
  const current=currentPeriodDescriptor();
  const now=new Date().toISOString();
  const registry={
    schemaVersion:'cxorbia.tya-live-hr-tab-registry.v1',observedAt:now,sourceTitle:title,sourceSafe:true,
    providerMetadataReadOnly:true,autoDiscovery:true,registryMode:'live_provider_metadata_auto_refresh',
    monthlyTabs,nonMonthlyTabs:(meta.sheets||[]).map(s=>String(s.properties?.title||'')).filter(t=>!monthlyTabs.includes(t)),
    currentCalendarPeriodKey:current.periodKey,requiredCurrentPeriodTabs:current.tabs,
    requiredCurrentPeriodTabsPresent:current.tabs.every(tab=>monthlyTabs.includes(tab)),
    provider:{mode:auth.mode,principalMasked:String(auth.principal||'').replace(/^[^@]+/,'***')},
    safety:{pii:false,hrWrites:0,firestoreWrites:0,authWrites:0,production:false,merge:false}
  };
  fs.mkdirSync(path.dirname(REGISTRY_OUT),{recursive:true});
  fs.writeFileSync(REGISTRY_OUT,JSON.stringify(registry,null,2)+'\n','utf8');

  let identityCount=0;
  if(IDENTITY_OUT){
    const identities=new Map();
    for(let start=0;start<monthly.length;start+=8){
      const batch=monthly.slice(start,start+8);
      const q=batch.map(tab=>`ranges=${encodeURIComponent(`'${tab.title.replace(/'/g,"''")}'!A1:${MAX_COL}${MAX_ROW}`)}`).join('&');
      const data=await sheets(`/values:batchGet?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&${q}`,auth.token);
      (data.valueRanges||[]).forEach((vr,idx)=>{
        const tab=batch[idx];const values=Array.isArray(vr.values)?vr.values:[];const header=findHeader(values);if(!header)return;
        const col=shopperColumn(header);
        for(let r=header.index+1;r<values.length;r++){
          const displayName=String(values[r]?.[col]??'').trim().replace(/\s+/g,' ');if(!assigned(displayName))continue;
          const shopperId=safeHash(displayName,`shopper_${tab.country.toLowerCase()}`);if(!shopperId)continue;
          const prior=identities.get(shopperId);
          if(prior&&normalized(prior.displayName)!==normalized(displayName))throw new Error(`shopper_hash_identity_conflict:${shopperId}`);
          if(!prior)identities.set(shopperId,{shopperId,displayName,country:tab.country});
        }
      });
    }
    const overlay={schemaVersion:'cxorbia.tya-dev-operational-display-identity.v1',generatedAt:now,sourceTitle:title,displayIdentityOnly:true,containsContactData:false,containsGovernmentId:false,containsBankData:false,containsCredentials:false,identities:[...identities.values()].sort((a,b)=>a.shopperId.localeCompare(b.shopperId)),safety:{devOnly:true,hrWrites:0,firestoreWrites:0,authWrites:0,production:false,merge:false}};
    identityCount=overlay.identities.length;fs.mkdirSync(path.dirname(IDENTITY_OUT),{recursive:true});fs.writeFileSync(IDENTITY_OUT,JSON.stringify(overlay,null,2)+'\n','utf8');
  }
  console.log(JSON.stringify({decision:'PASS_LIVE_PROVIDER_REGISTRY_AND_DEV_DISPLAY_IDENTITY',providerMode:auth.mode,totalTabs:(meta.sheets||[]).length,monthlyTabs:monthly.length,latestMonthlyTab:monthlyTabs.at(-1)||null,currentCalendarPeriodKey:current.periodKey,requiredCurrentPeriodTabsPresent:registry.requiredCurrentPeriodTabsPresent,identityCount,writes:0,production:false}));
}
main().catch(e=>{console.error(e.stack||e);process.exit(1);});
