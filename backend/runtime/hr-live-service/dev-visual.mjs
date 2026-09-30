import crypto from 'node:crypto';

export const DEV_VISUAL_VIEW='full-profile';
const FIRESTORE_PROJECT=process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT||'cxorbia-backend-dev';
const TOKEN_HASH=String(process.env.CXORBIA_DEV_VISUAL_PROFILE_TOKEN_SHA256||'').trim().toLowerCase();
const EXPIRES_AT=String(process.env.CXORBIA_DEV_VISUAL_PROFILE_TOKEN_EXPIRES_AT||'').trim();
const METADATA_TOKEN_URL='http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';

function timingSafeHexEqual(a,b){
  try{
    const aa=Buffer.from(String(a||''),'hex');
    const bb=Buffer.from(String(b||''),'hex');
    return aa.length===bb.length&&aa.length>0&&crypto.timingSafeEqual(aa,bb);
  }catch(_){ return false; }
}
function tokenValid(raw){
  if(!TOKEN_HASH||!raw) return false;
  if(EXPIRES_AT&&Date.now()>=Date.parse(EXPIRES_AT)) return false;
  const actual=crypto.createHash('sha256').update(String(raw)).digest('hex');
  return timingSafeHexEqual(actual,TOKEN_HASH);
}
function bearer(req){
  const value=String(req.headers.authorization||'');
  const m=value.match(/^Bearer\s+(.+)$/i);
  return m?m[1].trim():'';
}
async function metadataAccessToken(){
  const response=await fetch(METADATA_TOKEN_URL,{headers:{'Metadata-Flavor':'Google'},cache:'no-store'});
  if(!response.ok) throw new Error(`metadata_token_${response.status}`);
  const json=await response.json();
  if(!json?.access_token) throw new Error('metadata_token_missing');
  return json.access_token;
}
function decodeValue(v){
  if(!v||typeof v!=='object') return null;
  if(Object.prototype.hasOwnProperty.call(v,'nullValue')) return null;
  if(Object.prototype.hasOwnProperty.call(v,'stringValue')) return v.stringValue;
  if(Object.prototype.hasOwnProperty.call(v,'booleanValue')) return v.booleanValue;
  if(Object.prototype.hasOwnProperty.call(v,'integerValue')) return Number(v.integerValue);
  if(Object.prototype.hasOwnProperty.call(v,'doubleValue')) return Number(v.doubleValue);
  if(Object.prototype.hasOwnProperty.call(v,'timestampValue')) return v.timestampValue;
  if(Object.prototype.hasOwnProperty.call(v,'referenceValue')) return v.referenceValue;
  if(Object.prototype.hasOwnProperty.call(v,'bytesValue')) return v.bytesValue;
  if(Object.prototype.hasOwnProperty.call(v,'geoPointValue')) return v.geoPointValue;
  if(v.arrayValue) return (v.arrayValue.values||[]).map(decodeValue);
  if(v.mapValue){
    const out={};
    for(const [k,val] of Object.entries(v.mapValue.fields||{})) out[k]=decodeValue(val);
    return out;
  }
  return null;
}
function decodeDocument(doc){
  const out={};
  for(const [k,v] of Object.entries(doc?.fields||{})) out[k]=decodeValue(v);
  const id=String(doc?.name||'').split('/').at(-1)||out.id||null;
  if(id&&!out.id) out.id=id;
  return out;
}
function encodePath(path){ return String(path).split('/').map(encodeURIComponent).join('/'); }
async function listCollection(accessToken,relativePath){
  const rows=[];
  let pageToken='';
  do{
    const query=new URLSearchParams({pageSize:'300'});
    if(pageToken) query.set('pageToken',pageToken);
    const url=`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIRESTORE_PROJECT)}/databases/(default)/documents/${encodePath(relativePath)}?${query.toString()}`;
    const response=await fetch(url,{headers:{Authorization:`Bearer ${accessToken}`,Accept:'application/json'},cache:'no-store'});
    const text=await response.text();
    let json={};
    try{json=text?JSON.parse(text):{};}catch{}
    if(!response.ok){
      if(response.status===404) return [];
      throw new Error(`firestore_list_${relativePath.replaceAll('/','_')}_${response.status}`);
    }
    rows.push(...(json.documents||[]).map(decodeDocument));
    pageToken=String(json.nextPageToken||'');
  }while(pageToken);
  return rows;
}
function sameId(v,id){ return String(v||'')===String(id||''); }

export async function maybeHandleDevVisualRequest(req,res,url,{sendJson}){
  if(url.searchParams.get('view')!==DEV_VISUAL_VIEW) return false;
  if(req.method!=='GET'){
    sendJson(res,405,{ok:false,error:'method_not_allowed'});
    return true;
  }
  const raw=bearer(req);
  if(!tokenValid(raw)){
    sendJson(res,401,{ok:false,error:'dev_visual_authorization_required',readOnly:true,production:false});
    return true;
  }
  const scope=String(url.searchParams.get('scope')||'admin').trim().toLowerCase();
  const requestedShopperId=String(url.searchParams.get('shopperId')||'').trim();
  if(!['admin','shopper'].includes(scope)|| (scope==='shopper'&&!requestedShopperId)){
    sendJson(res,400,{ok:false,error:'invalid_visual_scope',readOnly:true,production:false});
    return true;
  }
  try{
    const accessToken=await metadataAccessToken();
    const [shoppersAll,visitsAll,postulationsAll,applicationsAll,certificationsAll,liquidationsAll]=await Promise.all([
      listCollection(accessToken,'tenants/tya/shoppers'),
      listCollection(accessToken,'tenants/tya/projects/cinepolis/visits'),
      listCollection(accessToken,'tenants/tya/projects/cinepolis/postulations'),
      listCollection(accessToken,'tenants/tya/projects/cinepolis/applications'),
      listCollection(accessToken,'tenants/tya/projects/cinepolis/certifications'),
      listCollection(accessToken,'tenants/tya/projects/cinepolis/liquidations')
    ]);
    let shoppers=shoppersAll,visits=visitsAll,postulations=postulationsAll,applications=applicationsAll,certifications=certificationsAll,liquidations=liquidationsAll;
    if(scope==='shopper'){
      shoppers=shoppersAll.filter(s=>sameId(s.shopperId||s.id,requestedShopperId));
      visits=visitsAll.filter(v=>sameId(v.shopperId,requestedShopperId)||String(v.estado||v.status||'').toLowerCase()==='disponible');
      postulations=postulationsAll.filter(v=>sameId(v.shopperId,requestedShopperId));
      applications=applicationsAll.filter(v=>sameId(v.shopperId,requestedShopperId));
      certifications=certificationsAll.filter(v=>sameId(v.shopperId,requestedShopperId));
      liquidations=liquidationsAll.filter(v=>sameId(v.shopperId,requestedShopperId));
      if(!shoppers.length){
        sendJson(res,404,{ok:false,error:'shopper_not_found',readOnly:true,production:false});
        return true;
      }
    }
    sendJson(res,200,{
      ok:true,
      schemaVersion:'cxorbia.corte6.dev-full-visual-snapshot.v1',
      generatedAt:new Date().toISOString(),
      tenantId:'tya',
      projectId:'cinepolis',
      source:'firestore-server-side-dev-visual',
      scope,
      shopperId:scope==='shopper'?requestedShopperId:null,
      shoppers,visits,postulations,applications,certifications,liquidations,
      counts:{shoppers:shoppers.length,visits:visits.length,postulations:postulations.length,applications:applications.length,certifications:certifications.length,liquidations:liquidations.length},
      contract:{browserFirebaseCredentialsRequired:false,serverSideTechnicalIdentity:true,fullProfileVisual:true,readOnly:true,tokenExpiresAt:EXPIRES_AT||null},
      safety:{providerWrites:0,firestoreWrites:0,authWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false}
    });
  }catch(error){
    console.error('[CX.dev-visual] '+String(error?.message||error));
    sendJson(res,503,{ok:false,error:'dev_visual_read_failed',message:String(error?.message||error).slice(0,180),readOnly:true,production:false});
  }
  return true;
}
