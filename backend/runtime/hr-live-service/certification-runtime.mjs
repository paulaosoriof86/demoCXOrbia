import crypto from 'node:crypto';

const OPERATOR_ROLES=new Set(['super','admin','ops','coordinador']);
const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const cleanKey=v=>str(v).replace(/[^a-zA-Z0-9._:-]+/g,'_').slice(0,180);
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const iso=()=>new Date().toISOString();

export function certificationRouteScope(pathname){
  const m=str(pathname).match(/^\/api\/tenants\/([^/]+)\/projects\/([^/]+)\/certifications\/(ai-generate|attempt|recertify)$/);
  return m?{tenantId:decodeURIComponent(m[1]),projectId:decodeURIComponent(m[2]),action:m[3]}:null;
}
export function isCertificationRuntimePath(pathname){return !!certificationRouteScope(pathname);}

function canonicalBank(bank={}){
  return {
    preguntas:arr(bank.preguntas).map(q=>({q:str(q?.q),ops:arr(q?.ops).map(str),correcta:str(q?.correcta),exp:str(q?.exp)})),
    gate:Number(bank.gate||80),
    contentRevision:str(bank.contentRevision||'')
  };
}
export function certificationBankFingerprint(bank={}){
  const normalized=canonicalBank(bank);
  return normalized.contentRevision||sha(normalized);
}
export function calculateCertificationAttempt(bank={},answers=[]){
  const questions=arr(bank.preguntas);
  if(!questions.length)throw new Error('CERT_BANK_EMPTY');
  if(!Array.isArray(answers)||answers.length!==questions.length)throw new Error('CERT_ANSWERS_INCOMPLETE');
  let correct=0;
  const feedback=questions.map((q,i)=>{
    const selected=str(answers[i]),expected=str(q?.correcta);
    const ok=selected.toLocaleLowerCase('es')===expected.toLocaleLowerCase('es');
    if(ok)correct++;
    return {index:i,ok,selected,correcta:expected,exp:str(q?.exp)};
  });
  const score=Math.round(correct/questions.length*100);
  const gate=Math.max(1,Math.min(100,Number(bank.gate||80)));
  return {score,gate,pass:score>=gate,correct,total:questions.length,feedback};
}
export function historicalCarryoverDecision({records=[],bank={},projectId='',shopperId='',recertifications=[],now=Date.now()}={}){
  const equivalence=new Set([...arr(bank.historicalEquivalenceKeys),...arr(bank.equivalenceKeys),bank.certificationId,bank.sourceCertificationId,bank.contentRevision].map(str).filter(Boolean));
  const activeRecert=arr(recertifications).filter(r=>{
    if(str(r?.status||'active')!=='active')return false;
    if(str(r?.scope)==='all')return true;
    return arr(r?.targetShopperIds).map(str).includes(str(shopperId));
  }).sort((a,b)=>str(b?.createdAt).localeCompare(str(a?.createdAt)))[0]||null;
  const sorted=arr(records).slice().sort((a,b)=>str(b?.sourceApprovedAt||b?.presentedAt).localeCompare(str(a?.sourceApprovedAt||a?.presentedAt)));
  if(activeRecert)return {state:'recertification_required',eligibilityGranted:false,record:null,recertification:activeRecert};
  let sawApproved=false,sawExpired=false,sawNonEquivalent=false,sawFailed=false;
  for(const r of sorted){
    const status=str(r?.sourceLegacyStatus).toLowerCase();
    if(status==='failed'){sawFailed=true;continue;}
    if(status!=='approved')continue;
    sawApproved=true;
    if(str(r?.projectId)!==str(projectId)){sawNonEquivalent=true;continue;}
    const keys=[r?.sourceCertificationId,r?.certificationId,r?.sourceSnapshotSha256,r?.contentRevision].map(str).filter(Boolean);
    if(!keys.some(k=>equivalence.has(k))){sawNonEquivalent=true;continue;}
    const expiry=Date.parse(str(r?.validUntil||bank?.carryoverValidUntil)||'');
    if(Number.isFinite(expiry)&&expiry<now){sawExpired=true;continue;}
    return {state:'valid_reusable',eligibilityGranted:true,record:r,recertification:null};
  }
  if(sawExpired)return {state:'expired',eligibilityGranted:false,record:null,recertification:null};
  if(sawApproved&&sawNonEquivalent)return {state:'non_equivalent',eligibilityGranted:false,record:null,recertification:null};
  if(sawFailed)return {state:'failed',eligibilityGranted:false,record:null,recertification:null};
  return {state:sorted.length?'pending':'none',eligibilityGranted:false,record:null,recertification:null};
}

async function readJson(req,maxBytes=160000){
  let size=0,raw='';
  for await(const chunk of req){
    size+=chunk.length;
    if(size>maxBytes)throw new Error('REQUEST_TOO_LARGE');
    raw+=chunk;
  }
  if(!raw.trim())return {};
  try{return JSON.parse(raw);}catch(_){throw new Error('INVALID_JSON');}
}
function projectRef(db,scope){return db.collection('tenants').doc(scope.tenantId).collection('projects').doc(scope.projectId);}
function resourcesCol(db,scope){return db.collection('tenants').doc(scope.tenantId).collection('resources');}
function deterministicBankId(scope,periodId){return ('certbank-'+scope.projectId+'-'+str(periodId||'period')).replace(/[^a-zA-Z0-9_-]+/g,'-');}
async function loadPublishedBank(db,scope,body){
  const rid=str(body.bankResourceId)||deterministicBankId(scope,body.periodId);
  const snap=await resourcesCol(db,scope).doc(rid).get();
  if(!snap.exists)throw new Error('CERT_BANK_NOT_FOUND');
  const resource={id:snap.id,...(snap.data()||{})};
  if(resource.status!=='active'||resource.resourceType!=='certification_bank'||str(resource.projectId)!==scope.projectId)throw new Error('CERT_BANK_SCOPE_MISMATCH');
  if(body.periodId&&resource.periodId&&str(resource.periodId)!==str(body.periodId))throw new Error('CERT_BANK_PERIOD_MISMATCH');
  const bank=resource.bank||{};
  if(!['published','confirmed'].includes(str(bank.estado).toLowerCase()))throw new Error('CERT_BANK_NOT_PUBLISHED');
  if(!arr(bank.preguntas).length)throw new Error('CERT_BANK_EMPTY');
  return {resource,bank,fingerprint:certificationBankFingerprint(bank)};
}
async function activeRecertifications(db,scope,shopperId){
  const snap=await projectRef(db,scope).collection('certificationRecertifications').get();
  return snap.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(r=>{
    if(str(r.status||'active')!=='active')return false;
    if(str(r.scope)==='all')return true;
    return arr(r.targetShopperIds).map(str).includes(str(shopperId));
  });
}
let tokenCache={token:'',expiresAt:0};
async function metadataToken(){
  if(tokenCache.token&&Date.now()<tokenCache.expiresAt-60000)return tokenCache.token;
  const r=await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',{headers:{'Metadata-Flavor':'Google'}});
  if(!r.ok)throw new Error('VERTEX_RUNTIME_TOKEN_'+r.status);
  const j=await r.json();
  tokenCache={token:str(j.access_token),expiresAt:Date.now()+Number(j.expires_in||300)*1000};
  if(!tokenCache.token)throw new Error('VERTEX_RUNTIME_TOKEN_EMPTY');
  return tokenCache.token;
}
async function resolveAiSetting(db,scope){
  const snap=await db.collection('tenants').doc(scope.tenantId).collection('aiSettings').get();
  const active=snap.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(x=>{
    if(str(x.status).toLowerCase()!=='active'||x.serverProxy!==true)return false;
    const projects=arr(x.projectIds).map(str).filter(Boolean);
    return !projects.length||projects.includes(scope.projectId);
  }).sort((a,b)=>{
    const ap=arr(a.projectIds).map(str).includes(scope.projectId)?1:0,bp=arr(b.projectIds).map(str).includes(scope.projectId)?1:0;
    return bp-ap||str(b.updatedAt).localeCompare(str(a.updatedAt));
  });
  const setting=active[0];
  if(!setting)throw new Error('AI_PROVIDER_NOT_CONFIGURED');
  if(!['vertex','vertex-ai','google-vertex'].includes(str(setting.provider).toLowerCase()))throw new Error('AI_PROVIDER_NOT_VERTEX');
  const model=str(setting.model),location=str(setting.location||'us-central1');
  if(!/^gemini-[a-z0-9.-]+$/i.test(model))throw new Error('AI_MODEL_INVALID');
  if(!/^[a-z0-9-]+$/i.test(location))throw new Error('AI_LOCATION_INVALID');
  return {id:setting.id,provider:'vertex-ai',model,location};
}
function normalizeGeneratedQuestions(raw,count){
  let parsed;
  try{parsed=JSON.parse(str(raw).replace(/^\x60\x60\x60json\s*|\x60\x60\x60\s*$/g,'').trim());}catch(_){throw new Error('AI_PROVIDER_RESPONSE_NOT_JSON');}
  const questions=arr(Array.isArray(parsed)?parsed:parsed?.preguntas).slice(0,count).map(q=>({
    q:str(q?.q||q?.pregunta),ops:arr(q?.ops||q?.opciones).map(str).filter(Boolean).slice(0,6),
    correcta:str(q?.correcta||q?.respuestaCorrecta),exp:str(q?.exp||q?.explicacion)
  })).filter(q=>q.q&&q.ops.length>=2&&q.correcta&&q.ops.includes(q.correcta));
  if(!questions.length)throw new Error('AI_PROVIDER_RESPONSE_INVALID');
  return questions;
}
async function generateBank(db,scope,body){
  const sourceText=str(body.sourceText),questionCount=Math.max(3,Math.min(30,Number(body.questionCount||10))),gate=Math.max(1,Math.min(100,Number(body.gate||80)));
  if(sourceText.length<40)throw new Error('AI_SOURCE_TEXT_REQUIRED');
  if(sourceText.length>60000)throw new Error('AI_SOURCE_TEXT_TOO_LARGE');
  const setting=await resolveAiSetting(db,scope),token=await metadataToken();
  const prompt=[
    'Genera un banco de certificación para mystery shopping usando EXCLUSIVAMENTE el instructivo proporcionado.',
    'Devuelve SOLO JSON válido con forma {"preguntas":[{"q":"...","ops":["..."],"correcta":"...","exp":"..."}]}.',
    'Cada pregunta debe tener 4 opciones plausibles, exactamente una correcta incluida literalmente en ops, y una explicación breve.',
    'No inventes requisitos que no estén en la fuente. Si la fuente es insuficiente, genera menos preguntas en lugar de inventar.',
    'Cantidad objetivo: '+questionCount+'. Requisito mínimo informado: '+gate+'%.',
    'INSTRUCTIVO:\n'+sourceText
  ].join('\n');
  const project=process.env.GOOGLE_CLOUD_PROJECT||'cxorbia-backend-dev';
  const endpoint='https://'+setting.location+'-aiplatform.googleapis.com/v1/projects/'+encodeURIComponent(project)+'/locations/'+encodeURIComponent(setting.location)+'/publishers/google/models/'+encodeURIComponent(setting.model)+':generateContent';
  const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.15,maxOutputTokens:5000,responseMimeType:'application/json'}})});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error('AI_PROVIDER_HTTP_'+response.status+':'+str(payload?.error?.message).slice(0,300));
  const raw=arr(payload?.candidates?.[0]?.content?.parts).map(p=>str(p?.text)).join('\n');
  const preguntas=normalizeGeneratedQuestions(raw,questionCount),contentRevision=sha({preguntas,gate});
  return {providerAck:true,provider:setting.provider,model:setting.model,location:setting.location,settingId:setting.id,preguntas,gate,contentRevision};
}
function requestId(req,body){return cleanKey(req.headers['idempotency-key']||body.idempotencyKey);}
async function saveAttempt(db,scope,principal,body,sourceRevision,idem){
  if(str(principal.role)!=='shopper'||!str(principal.shopperId))throw new Error('CERT_ATTEMPT_SHOPPER_REQUIRED');
  if(!idem)throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  const {resource,bank,fingerprint}=await loadPublishedBank(db,scope,body),calc=calculateCertificationAttempt(bank,body.answers),recerts=await activeRecertifications(db,scope,principal.shopperId);
  const createdAt=iso(),docId='attempt-'+sha([scope.tenantId,scope.projectId,principal.shopperId,idem]).slice(0,28),ref=projectRef(db,scope).collection('certifications').doc(docId);
  let replay=false,item=null;
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(snap.exists){replay=true;item={id:snap.id,...(snap.data()||{})};return;}
    item={recordType:'certification_attempt',tenantId:scope.tenantId,projectId:scope.projectId,periodId:str(body.periodId||resource.periodId),shopperId:str(principal.shopperId),bankResourceId:resource.id,bankFingerprint:fingerprint,contentRevision:str(bank.contentRevision||fingerprint),score:calc.score,gate:calc.gate,pass:calc.pass,status:calc.pass?'certified':'failed',eligibilityGranted:calc.pass,currentCertification:calc.pass,recertificationSatisfied:calc.pass&&recerts.length>0,recertificationRequestIds:recerts.map(r=>r.id),sourceRevision:str(sourceRevision||''),answersHash:sha(body.answers),idempotencyKeyHash:sha(idem),providerAck:true,createdAt,createdByUid:str(principal.uid),updatedAt:createdAt};
    tx.create(ref,item);
  });
  return {item,calc,idempotentReplay:replay};
}
async function saveRecertification(db,scope,principal,body,idem){
  if(!OPERATOR_ROLES.has(str(principal.role)))throw new Error('RECERT_OPERATOR_REQUIRED');
  const targetScope=str(body.scope)==='one'?'one':'all',shopperId=str(body.shopperId);
  if(targetScope==='one'&&!shopperId)throw new Error('RECERT_SHOPPER_REQUIRED');
  const days=Math.max(1,Math.min(90,Number(body.days||7))),reason=str(body.reason);
  if(!reason)throw new Error('RECERT_REASON_REQUIRED');
  if(!idem)throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  const docId='recert-'+sha([scope.tenantId,scope.projectId,idem]).slice(0,28),ref=projectRef(db,scope).collection('certificationRecertifications').doc(docId);
  let replay=false,item=null;
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);if(snap.exists){replay=true;item={id:snap.id,...(snap.data()||{})};return;}
    const createdAt=iso(),dueAt=new Date(Date.now()+days*86400000).toISOString();
    item={tenantId:scope.tenantId,projectId:scope.projectId,periodId:str(body.periodId),scope:targetScope,targetShopperIds:targetScope==='one'?[shopperId]:[],reason,days,dueAt,status:'active',createdAt,createdByUid:str(principal.uid),createdByRole:str(principal.role),providerAck:true,idempotencyKeyHash:sha(idem)};
    tx.create(ref,item);
  });
  return {item,idempotentReplay:replay};
}
function errorStatus(message){
  if(/AUTH_FAILURE|OPERATOR_REQUIRED|SHOPPER_REQUIRED/.test(message))return 403;
  if(/NOT_FOUND/.test(message))return 404;
  if(/INVALID|INCOMPLETE|EMPTY|MISMATCH|NOT_PUBLISHED|TOO_LARGE|NOT_CONFIGURED|REQUIRED/.test(message))return 400;
  if(/AI_PROVIDER_HTTP_4/.test(message))return 502;
  return 500;
}

export async function maybeHandleCertificationRuntimeRequest(req,res,url,{ensureAdmin,verifyPrincipal,sendJson,currentSourceRevision}){
  const scope=certificationRouteScope(url.pathname);if(!scope)return false;
  if(req.method!=='POST'){sendJson(res,405,{ok:false,error:'method_not_allowed',production:false});return true;}
  try{
    const principal=await verifyPrincipal(req,scope),{db}=ensureAdmin(),body=await readJson(req),idem=requestId(req,body);
    if(scope.action==='ai-generate'){
      if(!OPERATOR_ROLES.has(str(principal.role)))throw new Error('AI_OPERATOR_REQUIRED');
      const result=await generateBank(db,scope,body);
      sendJson(res,200,{ok:true,status:'committed',committed:true,successUiAllowed:true,...result,writes:0,hrWrites:0,production:false});return true;
    }
    if(scope.action==='attempt'){
      const saved=await saveAttempt(db,scope,principal,body,currentSourceRevision?.(),idem);
      sendJson(res,200,{ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,item:saved.item,score:saved.calc.score,gate:saved.calc.gate,pass:saved.calc.pass,feedback:saved.calc.feedback,idempotentReplay:saved.idempotentReplay,providerWrites:saved.idempotentReplay?0:1,hrWrites:0,production:false});return true;
    }
    if(scope.action==='recertify'){
      const saved=await saveRecertification(db,scope,principal,body,idem);
      sendJson(res,200,{ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,item:saved.item,idempotentReplay:saved.idempotentReplay,providerWrites:saved.idempotentReplay?0:1,hrWrites:0,production:false});return true;
    }
  }catch(error){
    const code=str(error?.message||error);
    sendJson(res,errorStatus(code),{ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,code,production:false});return true;
  }
  return true;
}
