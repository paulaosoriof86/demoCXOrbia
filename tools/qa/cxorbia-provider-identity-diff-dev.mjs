#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const HR_PATH=path.resolve(process.env.HR_FRESH_PATH||'.tmp/recovery-i3-p0-validation/hr-fresh.json');
const REGISTRY_PATH=path.resolve(process.env.PROVIDER_IDENTITY_PATH||'.tmp/recovery-i3-p0-validation/provider-identities.raw.json');
const OUT_PATH=path.resolve(process.env.IDENTITY_DIFF_OUT||'.tmp/recovery-i3-p0-validation/provider-identity-diff.json');
const SERVICE_ACCOUNT_JSON=process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'';
const SHEET_ID=process.env.CXORBIA_HR_LIVE_SHEET_ID||'1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const CURRENT_PERIOD=process.env.PERIOD_KEY||'2026-09';
const MAX_ROW=Number(process.env.CXORBIA_HR_LIVE_MAX_ROW||140);
const MAX_COL=process.env.CXORBIA_HR_LIVE_MAX_COL||'AI';
const MAP=JSON.parse(fs.readFileSync('backend/contracts/tya-hr-column-map-r20-v1.json','utf8'));
const MONTHS=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').replace(/\s+/g,' ').trim();
const fp=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex').slice(0,24);
const b64url=input=>Buffer.from(input).toString('base64url');
function parseTab(title){const c=String(title||'').trim().replace(/\s+/g,' ').toUpperCase(),m=c.match(/^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|SETIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(\d{2})(?:\s+(HN))?$/);if(!m)return null;const mn=m[1]==='SETIEMBRE'?'SEPTIEMBRE':m[1],month=MONTHS.indexOf(mn)+1;return {title:String(title),country:m[3]==='HN'?'HN':'GT',periodKey:`${2000+Number(m[2])}-${String(month).padStart(2,'0')}`};}
function signJwt(sa){const now=Math.floor(Date.now()/1000),u=`${b64url(JSON.stringify({alg:'RS256',typ:'JWT'}))}.${b64url(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/spreadsheets.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+1800}))}`;const signer=crypto.createSign('RSA-SHA256');signer.update(u);signer.end();return `${u}.${signer.sign(sa.private_key).toString('base64url')}`;}
async function json(url,options={}){const r=await fetch(url,options);let body=null;try{body=await r.json();}catch{}if(!r.ok)throw new Error(`HTTP_${r.status}:${JSON.stringify(body||{}).slice(0,300)}`);return body;}
async function token(){const sa=JSON.parse(SERVICE_ACCOUNT_JSON);if(sa.type!=='service_account'||!sa.client_email||!sa.private_key)throw new Error('service_account_json_invalid');const body=await json('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:signJwt(sa)})});if(!body.access_token)throw new Error('oauth_access_token_missing');return body.access_token;}
async function sheets(suffix,t){return json(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${suffix}`,{headers:{Authorization:`Bearer ${t}`,'Cache-Control':'no-store'}});}
function findHeader(values){for(let i=0;i<Math.min(values.length,14);i++){const cells=(values[i]||[]).map(norm);for(const variant of MAP.headerVariants||[]){const req=(variant.required||[]).map(norm);if(req.length&&req.every(x=>cells.includes(x)))return {index:i,cells,variant};}}return null;}
function columnIndex(header,key){for(const alias of (MAP.columns?.[key]?.aliases||[]).map(norm)){const hits=[];header.cells.forEach((v,i)=>{if(v===alias)hits.push(i);});if(hits.length===1)return hits[0];}return -1;}
function criticalGaps(header,row){const gaps=[];for(const [key,spec] of Object.entries(MAP.columns||{})){if(spec.critical!==true)continue;const idx=columnIndex(header,key);if(idx<0){const allowed=Array.isArray(spec.contextualMissingAllowedIn)&&spec.contextualMissingAllowedIn.includes(header.variant.id);if(!allowed)gaps.push(`${key}:header_missing`);continue;}if(!String(row?.[idx]??'').trim())gaps.push(`${key}:value_missing`);}return gaps;}

async function main(){
  if(!SERVICE_ACCOUNT_JSON)throw new Error('service_account_json_missing');
  const hr=JSON.parse(fs.readFileSync(HR_PATH,'utf8'));
  const registry=JSON.parse(fs.readFileSync(REGISTRY_PATH,'utf8'));
  const canonicalIds=new Set((hr.shoppers||[]).map(s=>String(s.shopperId||s.id||'')).filter(Boolean));
  const provider=(registry.identities||[]).filter(x=>x?.shopperId);
  const providerIds=new Set(provider.map(x=>String(x.shopperId)));
  const extra=provider.filter(x=>!canonicalIds.has(String(x.shopperId)));
  const missing=[...canonicalIds].filter(id=>!providerIds.has(id));
  const t=await token();
  const meta=await sheets('?fields=properties(title),sheets(properties(title,index))',t);
  const monthly=(meta.sheets||[]).map(s=>parseTab(s.properties?.title)).filter(Boolean);
  const extras=[];
  for(const identity of extra){
    const target=norm(identity.displayName),occ=[];
    for(let start=0;start<monthly.length;start+=8){
      const batch=monthly.slice(start,start+8),q=batch.map(tab=>`ranges=${encodeURIComponent(`'${tab.title.replace(/'/g,"''")}'!A1:${MAX_COL}${MAX_ROW}`)}`).join('&');
      const data=await sheets(`/values:batchGet?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&${q}`,t);
      (data.valueRanges||[]).forEach((vr,idx)=>{const tab=batch[idx],values=Array.isArray(vr.values)?vr.values:[],header=findHeader(values);if(!header)return;const shopperIdx=columnIndex(header,'shopper');if(shopperIdx<0)return;for(let r=header.index+1;r<values.length;r++){const row=values[r]||[];if(norm(row[shopperIdx])!==target)continue;const gaps=criticalGaps(header,row);occ.push({periodKey:tab.periodKey,country:tab.country,sourceRow:r+1,headerVariant:header.variant.id,missingCritical:gaps,nonEmptyCells:row.filter(v=>String(v??'').trim()).length});}});
    }
    const current=occ.some(o=>o.periodKey===CURRENT_PERIOD),allIncomplete=occ.length>0&&occ.every(o=>o.missingCritical.length>0);
    extras.push({identityFingerprint:fp(identity.shopperId),country:String(identity.country||''),occurrenceCount:occ.length,periodKeys:[...new Set(occ.map(o=>o.periodKey))].sort(),currentPeriodOccurrence:current,occurrences:occ,classification:current?'CURRENT_PROVIDER_IDENTITY_NOT_CANONICAL':allIncomplete?'HISTORICAL_PROVIDER_ORPHAN_INCOMPLETE_ROW':'HISTORICAL_PROVIDER_IDENTITY_NOT_CANONICAL_REVIEW'});
  }
  const classifications=[...new Set(extras.map(x=>x.classification))];
  const result={decision:extra.length===1&&missing.length===0?'PASS_PROVIDER_CANONICAL_IDENTITY_DIFF_EXPLAINED':'PROVIDER_FAILURE',sourceRevision:String(hr?._runtime?.revision||''),canonicalShopperCount:canonicalIds.size,providerDisplayIdentityCount:providerIds.size,extraProviderIdentityCount:extra.length,missingProviderIdentityCount:missing.length,extraIdentities:extras,classifications,piiIncluded:false,providerWrites:0,hrWrites:0,firestoreWrites:0,authWrites:0,production:false};
  fs.mkdirSync(path.dirname(OUT_PATH),{recursive:true});fs.writeFileSync(OUT_PATH,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(result.decision!=='PASS_PROVIDER_CANONICAL_IDENTITY_DIFF_EXPLAINED')process.exit(1);
}
main().catch(e=>{console.error(e.stack||e);process.exit(1);});
