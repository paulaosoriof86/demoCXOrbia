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

export function withDocumentId(docId,item={}){
  const id=str(docId);
  if(!id)throw new Error('PERSISTENCE_DOCUMENT_ID_REQUIRED');
  return {id,...(item||{})};
}

function canonicalBank(bank={}){
  return {
    preguntas:arr(bank.preguntas).map(q=>({q:str(q?.q),ops:arr(q?.ops).map(str),correcta:str(q?.correcta),exp:str(q?.exp),fuente:str(q?.fuente||q?.sourceRef)})),
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
export function vertexCertificationSafeDiagnostic(payload={},httpStatus=0,responseContentType=''){
  const candidate=arr(payload?.candidates)[0]||{},parts=arr(candidate?.content?.parts);
  const finishReason=str(candidate.finishReason||'UNSPECIFIED').replace(/[^a-zA-Z0-9_]/g,'').slice(0,50);
  const contentTypes=parts.map(p=>str(p?.inlineData?.mimeType)).filter(x=>/^[a-z]+\/[a-z0-9.+-]+$/i.test(x)).slice(0,4);
  const used=Number(payload?.usageMetadata?.candidatesTokenCount);
  return {httpStatus:Number(httpStatus)||0,finishReason,candidateCount:arr(payload?.candidates).length,
    responseMimeType:'application/json',transportMimeType:str(responseContentType).split(';')[0].toLowerCase()==='application/json'?'application/json':'other',
    contentRole:str(candidate?.content?.role).slice(0,20),partCount:parts.length,textPartCount:parts.filter(p=>typeof p?.text==='string').length,
    textChars:parts.reduce((n,p)=>n+(typeof p?.text==='string'?p.text.length:0),0),inlineMimeTypes:contentTypes,
    outputTokens:Number.isFinite(used)&&used>=0?used:null,groundingTextLogged:false};
}
export function normalizeGeneratedQuestions(raw,count){
  let parsed;
  try{parsed=JSON.parse(str(raw).replace(/^\x60\x60\x60json\s*|\x60\x60\x60\s*$/g,'').trim());}catch(_){throw new Error('AI_PROVIDER_RESPONSE_NOT_JSON');}
  const questions=arr(Array.isArray(parsed)?parsed:parsed?.preguntas).slice(0,count).map(q=>({
    q:str(q?.q||q?.pregunta),ops:arr(q?.ops||q?.opciones).map(str).filter(Boolean).slice(0,6),
    correcta:str(q?.correcta||q?.respuestaCorrecta),exp:str(q?.exp||q?.explicacion),fuente:str(q?.fuente||q?.sourceRef||q?.referencia)
  })).filter(q=>q.q&&q.ops.length>=2&&q.correcta&&q.ops.includes(q.correcta));
  if(!questions.length)throw new Error('AI_PROVIDER_RESPONSE_INVALID');
  if(questions.length!==count)throw new Error('AI_QUESTION_COUNT_INCOMPLETE:'+questions.length+'/'+count);
  return questions;
}

/* R08 P0: exact source-grounded bank, no invented filler or silent partial output. */
export function validateVertexQuestionSet(questions,count){
 if(!Array.isArray(questions)||questions.length!==count)throw new Error('AI_QUESTION_COUNT_INCOMPLETE');
 const seen=new Set();
 for(let i=0;i<questions.length;i++){
  const q=questions[i]||{},answer=str(q.correcta),options=arr(q.ops).map(str);
  const key=str(q.q).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
  if(!key||options.length!==4||new Set(options.map(v=>v.toLowerCase())).size!==4||!answer||!options.includes(answer)||!str(q.exp)||!str(q.fuente))
    throw new Error('AI_QUESTION_INVALID_SHAPE:'+i);
  if(seen.has(key))throw new Error('AI_QUESTION_DUPLICATE:'+i);
  seen.add(key);
 }
 return questions;
}

export function validateQuestionSourceReferences(questions,sourceText){
 const text=str(sourceText),pages=new Set([...text.matchAll(/\[Página\s+(\d+)\]/gi)].map(m=>m[1]));
 for(let i=0;i<arr(questions).length;i++){
  const ref=str(questions[i]?.fuente),page=(ref.match(/p[aá]gina\s+(\d+)/i)||[])[1];
  if(!ref)throw new Error('AI_QUESTION_SOURCE_REFERENCE_REQUIRED:'+i);
  if(pages.size){
   if(!page||!pages.has(page))throw new Error('AI_QUESTION_SOURCE_REFERENCE_INVALID:'+i);
  }else{
   const normalizedRef=ref.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   const normalizedText=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   if(normalizedRef.length<8||!normalizedText.includes(normalizedRef))throw new Error('AI_QUESTION_SOURCE_REFERENCE_INVALID:'+i);
  }
 }
 return questions;
}

function generationInput(body={}){
 const sourceText=str(body.sourceText),sourceSha256=str(body.sourceSha256||body.documentSource?.source_sha256).toLowerCase(),sourceTitle=str(body.sourceTitle||body.documentSource?.name||'Fuente de certificación');
 const quality=body.documentSource?.extraction_quality||body.extraction_quality||{},manual=str(body.documentSource?.mode)==='manual_text';
 if(sourceText.length<40)throw new Error('AI_INPUT_SOURCE_TEXT_REQUIRED');
 if(sourceText.length>60000)throw new Error('AI_INPUT_SOURCE_TEXT_TOO_LARGE');
 if(!/^[0-9a-f]{64}$/.test(sourceSha256))throw new Error('AI_INPUT_SOURCE_SHA256_REQUIRED');
 if(!manual&&quality.sufficient!==true)throw new Error('AI_INPUT_PARSER_QUALITY_INSUFFICIENT');
 return {sourceText,sourceSha256,sourceTitle,documentSource:clean(body.documentSource||{}),manual};
}
function generatedDraftId(scope,body,input){
 const period=str(body.periodId||'period'),suffix=input.sourceSha256.slice(0,12);
 return ('certbank-'+scope.projectId+'-'+period+'-ai-'+suffix).replace(/[^a-zA-Z0-9_-]+/g,'-');
}
function generationDigest(scope,body,input){
 return sha({tenantId:scope.tenantId,projectId:scope.projectId,periodId:str(body.periodId),sourceSha256:input.sourceSha256,questionCount:Number(body.questionCount||15),gate:Number(body.gate||80)});
}
function generationReceipt(db,scope,idem){
 return db.collection('tenants').doc(scope.tenantId).collection('commandReceipts').doc('cert-ai-'+sha(scope.tenantId+'\0'+scope.projectId+'\0'+idem).slice(0,32));
}
async function generationReplay(db,scope,body,input,idem){
 if(!idem)throw new Error('AI_PERSISTENCE_IDEMPOTENCY_REQUIRED');
 const receiptRef=generationReceipt(db,scope,idem),snap=await receiptRef.get();
 if(!snap.exists)return null;
 const receipt=snap.data()||{},digest=generationDigest(scope,body,input);
 if(str(receipt.commandDigest)!==digest)throw new Error('AI_PERSISTENCE_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
 if(str(receipt.status)!=='committed'||!str(receipt.entityId))throw new Error('AI_PERSISTENCE_RECEIPT_INCOMPLETE');
 const rb=await resourcesCol(db,scope).doc(str(receipt.entityId)).get();
 if(!rb.exists)throw new Error('AI_PERSISTENCE_READBACK_MISSING');
 const item={id:rb.id,...(rb.data()||{})},bank=item.bank||{};
 if(str(bank.estado)!=='pending_review'||str(bank.documentSource?.source_sha256)!==input.sourceSha256)throw new Error('AI_PERSISTENCE_READBACK_MISMATCH');
 return {item,idempotentReplay:true,providerWrites:0,receipt:{id:snap.id,...receipt}};
}
async function persistGeneratedDraft(db,scope,principal,body,input,generated,idem){
 if(!idem)throw new Error('AI_PERSISTENCE_IDEMPOTENCY_REQUIRED');
 const id=generatedDraftId(scope,body,input),ref=resourcesCol(db,scope).doc(id),receiptRef=generationReceipt(db,scope,idem),digest=generationDigest(scope,body,input),createdAt=iso();
 let replay=false,providerWrites=0,receiptId=receiptRef.id;
 await db.runTransaction(async tx=>{
  const prior=await tx.get(receiptRef);
  if(prior.exists){
   const p=prior.data()||{};
   if(str(p.commandDigest)!==digest)throw new Error('AI_PERSISTENCE_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
   if(str(p.status)==='committed'){replay=true;return;}
  }
  const current=await tx.get(ref),existing=current.exists?(current.data()||{}):{},existingBank=existing.bank||{};
  if(['published','confirmed'].includes(str(existingBank.estado).toLowerCase()))throw new Error('AI_PERSISTENCE_DRAFT_ALREADY_PUBLISHED');
  const version=Math.max(0,Number(existing.version||0))+1,certificationId=str(existingBank.certificationId)||('ai-'+input.sourceSha256.slice(0,12));
  const bank={certificationId,certificationName:str(body.certificationName)||'Banco IA pendiente de revisión',preguntas:generated.preguntas,requestedQuestionCount:generated.requestedQuestionCount,gate:generated.gate,fecha:createdAt.slice(0,10),generadoPorUid:str(principal.uid),estado:'pending_review',provider:generated.provider,model:generated.model,providerAck:true,contentRevision:generated.contentRevision,generatedAt:createdAt,generationAttempts:generated.generationAttempts,documentSource:{...input.documentSource,name:input.sourceTitle,source_sha256:input.sourceSha256,ocrExecuted:input.documentSource?.ocrExecuted===true}};
  const record={...existing,resourceType:'certification_bank',tipo:'certification_bank',projectId:scope.projectId,periodId:str(body.periodId),status:'active',n:bank.certificationName,bank,version,updatedAt:createdAt,updatedByUid:str(principal.uid),createdAt:existing.createdAt||createdAt,createdByUid:existing.createdByUid||str(principal.uid),visibleRoles:['super','admin','ops','coordinador','shopper'],targetAll:false};
  tx.set(ref,record);
  tx.set(receiptRef,{status:'committed',commandDigest:digest,entityType:'certification_bank',entityId:id,entityVersion:version,commandType:'certification.ai-generate',providerAck:true,actorUid:str(principal.uid),updatedAt:createdAt});
  providerWrites=2;
 });
 const rb=await ref.get(),receiptRb=await receiptRef.get();
 if(!rb.exists||!receiptRb.exists)throw new Error('AI_PERSISTENCE_READBACK_MISSING');
 const item={id:rb.id,...(rb.data()||{})},bank=item.bank||{};
 if(str(bank.estado)!=='pending_review'||str(bank.contentRevision)!==str(generated.contentRevision)||str(bank.documentSource?.source_sha256)!==input.sourceSha256||arr(bank.preguntas).length!==generated.requestedQuestionCount)throw new Error('AI_PERSISTENCE_READBACK_MISMATCH');
 return {item,idempotentReplay:replay,providerWrites:replay?0:providerWrites,receipt:{id:receiptRb.id,...(receiptRb.data()||{})}};
}
export async function boundedVertexQuestionRetry(request,count,{onInvalid=()=>{}}={}){
 if(typeof request!=='function')throw new Error('AI_PROVIDER_REQUEST_REQUIRED');
 for(let attempt=1;attempt<=2;attempt++){
  /* HTTP/auth/provider failures reject immediately; only invalid response content is retried. */
  const response=await request(attempt);
  try{return {preguntas:validateVertexQuestionSet(normalizeGeneratedQuestions(response?.raw,count),count),attempts:attempt};}
  catch(error){
   onInvalid({code:str(error?.message).split(':')[0],diagnostic:response?.diagnostic||{},attempt});
   if(attempt===2)throw error;
  }
 }
 throw new Error('AI_PROVIDER_RESPONSE_INVALID');
}
async function generateBank(db,scope,body,input=generationInput(body)){
  const sourceText=input.sourceText,questionCount=Math.max(3,Math.min(30,Number(body.questionCount||10))),gate=Math.max(1,Math.min(100,Number(body.gate||80)));
  const setting=await resolveAiSetting(db,scope),token=await metadataToken();
  const prompt=[
    'Genera un banco de certificación para mystery shopping usando EXCLUSIVAMENTE el instructivo proporcionado.',
    'Devuelve SOLO JSON válido con forma {"preguntas":[{"q":"...","ops":["..."],"correcta":"...","exp":"...","fuente":"[Página N]"}]}.',
    'Cada pregunta debe tener 4 opciones plausibles, exactamente una correcta incluida literalmente en ops, una explicación breve y una referencia fuente a una página real del instructivo.',
    'No inventes requisitos que no estén en la fuente.',
    'Devuelve exactamente '+questionCount+' preguntas válidas y distintas, todas sustentadas en el instructivo. Si el material no alcanza, no inventes contenido para completar la cantidad.',
    'Cantidad requerida: '+questionCount+'. Requisito mínimo informado: '+gate+'%.',
    'INSTRUCTIVO:\n'+sourceText
  ].join('\n');
  const project=process.env.GOOGLE_CLOUD_PROJECT||'cxorbia-backend-dev';
  const endpoint='https://'+setting.location+'-aiplatform.googleapis.com/v1/projects/'+encodeURIComponent(project)+'/locations/'+encodeURIComponent(setting.location)+'/publishers/google/models/'+encodeURIComponent(setting.model)+':generateContent';
  const {preguntas,attempts}=await boundedVertexQuestionRetry(async attempt=>{
    const requestPrompt=attempt===1?prompt:prompt+'\nLa primera salida no cumplió el JSON o la cantidad y estructura requeridas. Responde nuevamente en JSON válido, con exactamente '+questionCount+' preguntas únicas, cuatro opciones por pregunta y explicación breve. Usa solo el mismo instructivo; no inventes preguntas para completar.';
    const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:requestPrompt}]}],generationConfig:{temperature:0.15,maxOutputTokens:attempt===1?5000:8192,responseMimeType:'application/json'}})});
    const payload=await response.json().catch(()=>({}));
    const diagnostic=vertexCertificationSafeDiagnostic(payload,response.status,response.headers?.get?.('content-type'));
    if(!response.ok){
      console.warn('CXORBIA_CERT_VERTEX_SAFE_DIAGNOSTIC '+JSON.stringify({...diagnostic,attempt,code:'AI_PROVIDER_HTTP_ERROR'}));
      throw new Error('AI_PROVIDER_HTTP_'+response.status);
    }
    return {raw:arr(payload?.candidates?.[0]?.content?.parts).map(p=>str(p?.text)).join('\n'),diagnostic};
  },questionCount,{onInvalid:({code,diagnostic,attempt})=>{
    console.warn('CXORBIA_CERT_VERTEX_SAFE_DIAGNOSTIC '+JSON.stringify({...diagnostic,attempt,code}));
  }});
  validateQuestionSourceReferences(preguntas,sourceText);
  const contentRevision=sha({preguntas,gate,sourceSha256:input.sourceSha256});
  return {aiProviderAck:true,providerAck:true,provider:setting.provider,model:setting.model,location:setting.location,settingId:setting.id,preguntas,requestedQuestionCount:questionCount,gate,contentRevision,generationAttempts:attempts,sourceSha256:input.sourceSha256,sourceTitle:input.sourceTitle};
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
  return {item:withDocumentId(docId,item),calc,idempotentReplay:replay};
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
  return {item:withDocumentId(docId,item),idempotentReplay:replay};
}
function errorStatus(message){
  if(/AUTH_FAILURE|OPERATOR_REQUIRED|SHOPPER_REQUIRED/.test(message))return 403;
  if(/NOT_FOUND/.test(message))return 404;
  if(/AI_INPUT_|INVALID|INCOMPLETE|EMPTY|MISMATCH|NOT_PUBLISHED|TOO_LARGE|NOT_CONFIGURED|REQUIRED/.test(message))return 400;
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
      const input=generationInput(body);
      const replay=await generationReplay(db,scope,body,input,idem);
      if(replay){
        const bank=replay.item.bank||{};
        sendJson(res,200,{ok:true,status:'committed',committed:true,providerAck:true,aiProviderAck:true,readbackVerified:true,successUiAllowed:true,item:replay.item,preguntas:arr(bank.preguntas),requestedQuestionCount:Number(bank.requestedQuestionCount||arr(bank.preguntas).length),gate:Number(bank.gate||80),contentRevision:str(bank.contentRevision),provider:str(bank.provider),model:str(bank.model),sourceSha256:input.sourceSha256,idempotentReplay:true,providerWrites:0,writes:0,hrWrites:0,production:false});return true;
      }
      const result=await generateBank(db,scope,body,input),saved=await persistGeneratedDraft(db,scope,principal,body,input,result,idem);
      sendJson(res,200,{ok:true,status:'committed',committed:true,providerAck:true,aiProviderAck:result.aiProviderAck===true,readbackVerified:true,successUiAllowed:true,...result,item:saved.item,idempotentReplay:saved.idempotentReplay,providerWrites:saved.providerWrites,writes:saved.providerWrites,hrWrites:0,production:false});return true;
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
