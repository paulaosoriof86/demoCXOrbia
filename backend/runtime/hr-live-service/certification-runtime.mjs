import crypto from 'node:crypto';

const OPERATOR_ROLES=new Set(['super','admin','ops','coordinador']);
const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const cleanKey=v=>str(v).replace(/[^a-zA-Z0-9._:-]+/g,'_').slice(0,180);
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const iso=()=>new Date().toISOString();

export function certificationRouteScope(pathname){
  const m=str(pathname).match(/^\/api\/tenants\/([^/]+)\/projects\/([^/]+)\/certifications\/(ai-generate|attempt|recertify|publish|configure|retire)$/);
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
 return {sourceText,sourceSha256,sourceTitle,documentSource:JSON.parse(JSON.stringify(body.documentSource||{})),manual};
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
export async function persistGeneratedDraft(db,scope,principal,body,input,generated,idem){
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
  if(str(existing.status).toLowerCase()==='deleted'||str(existingBank.estado).toLowerCase()==='withdrawn')throw new Error('AI_PERSISTENCE_DRAFT_RETIRED');
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
/* D03: give Gemini 2.5 Flash an explicit low-latency, bounded JSON budget before Hosting's 60s limit. */
export function vertexCertificationGenerationConfig(model){
 const config={temperature:0.15,maxOutputTokens:8192,responseMimeType:'application/json'};
 if(/^gemini-2\.5-flash(?:$|[-.])/i.test(str(model)))config.thinkingConfig={thinkingBudget:0};
 return config;
}
export function vertexCertificationRemainingMs(startedAt,now=Date.now()){
 return Math.max(0,48000-Math.max(0,now-startedAt));
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
  const vertexStartedAt=Date.now();
  const {preguntas,attempts}=await boundedVertexQuestionRetry(async attempt=>{
    const remainingMs=vertexCertificationRemainingMs(vertexStartedAt);
    if(remainingMs<7000)throw new Error('AI_PROVIDER_DEADLINE_EXCEEDED');
    const requestPrompt=attempt===1?prompt:prompt+'\nLa primera salida no cumplió el JSON o la cantidad y estructura requeridas. Responde nuevamente en JSON válido, con exactamente '+questionCount+' preguntas únicas, cuatro opciones por pregunta y explicación breve. Usa solo el mismo instructivo; no inventes preguntas para completar.';
    let response;
    try{response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:requestPrompt}]}],generationConfig:vertexCertificationGenerationConfig(setting.model)}),signal:AbortSignal.timeout(remainingMs)});}
    catch(error){if(['TimeoutError','AbortError'].includes(str(error?.name)))throw new Error('AI_PROVIDER_DEADLINE_EXCEEDED');throw error;}
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

// D05: the existing certification runtime owns publication, configuration and withdrawal.
// Policy aliases are stored by the existing project/period provider; no browser matrix
// or caller-supplied author/reviewer is an authorization source.
const CERT_BANK_LIFECYCLE_ACTIONS=new Set(['publish','configure','retire']);
const CERT_REVIEW_POLICIES=new Set(['authorized_admin','maker_checker','distinct_reviewer','two_person']);
const stableBankValue=value=>Array.isArray(value)?value.map(stableBankValue):
  value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableBankValue(value[key])])):value;
const lifecycleDigest=value=>sha(stableBankValue(value));
function explicitCertificationPolicy(row={},authority){
  const configured=['certificationReviewPolicy','certReviewPolicy'].filter(key=>Object.hasOwn(row,key));
  if(!configured.length)return null;
  const values=configured.map(key=>{
    if(typeof row[key]!=='string')throw new Error('CERT_REVIEW_POLICY_INVALID');
    const value=row[key].trim().toLowerCase();
    if(!CERT_REVIEW_POLICIES.has(value))throw new Error('CERT_REVIEW_POLICY_INVALID');
    return value==='authorized_admin'?'authorized_admin':'distinct_reviewer';
  });
  if(new Set(values).size!==1)throw new Error('CERT_REVIEW_POLICY_ALIAS_CONFLICT');
  return {mode:values[0],requiresDistinctReviewer:values[0]==='distinct_reviewer',authority,
    fields:configured,version:row.version??null};
}
export function resolveCertificationReviewPolicy(project={},period=null){
  // Validate every explicit value, even when an exact period has an override.
  const inherited=explicitCertificationPolicy(project,'firestore_project');
  const specific=period?explicitCertificationPolicy(period,'firestore_period'):null;
  return specific||inherited||{mode:'authorized_admin',requiresDistinctReviewer:false,
    authority:'existing_default_authorized_admin',fields:[],version:null};
}
export function certificationPeriodDocumentIds(projectId,periodId){
  const project=str(projectId),period=str(periodId);
  if(!project||!period||project.includes('/')||period.includes('/'))throw new Error('CERT_BANK_SCOPE_INVALID');
  // Exact legacy alias documented by CX.data._periodDisplayId; no fuzzy lookup.
  const month=/^\d{4}-(0[1-9]|1[0-2])$/;
  if(month.test(period))return [period,project+'-'+period];
  const suffix=period.startsWith(project+'-')?period.slice(project.length+1):'';
  return month.test(suffix)?[period,suffix]:[period];
}
function certificationPeriodDisplayId(projectId,row,documentId){
  const id=str(row?.periodId||row?.id||documentId);
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(id)?projectId+'-'+id:id;
}
function lifecycleReadbackValue(item){
  return {id:item.id,tenantId:item.tenantId??null,projectId:item.projectId,periodId:item.periodId,
    resourceType:item.resourceType,tipo:item.tipo,status:item.status,version:item.version,n:item.n,
    bank:item.bank,createdByUid:item.createdByUid??null,updatedByUid:item.updatedByUid,
    lastIdempotencyKey:item.lastIdempotencyKey};
}
function validateBankForPublication(bank){
  const questions=arr(bank.preguntas);
  if(!questions.length)throw new Error('CERT_BANK_EMPTY');
  if(bank.requestedQuestionCount!==undefined&&questions.length!==Number(bank.requestedQuestionCount))
    throw new Error('CERT_BANK_QUESTION_COUNT_MISMATCH');
  if(!str(bank.generadoPorUid)||!str(bank.contentRevision))throw new Error('CERT_BANK_AUTHOR_AND_REVISION_REQUIRED');
  if(!Number.isFinite(Number(bank.gate))||Number(bank.gate)<1||Number(bank.gate)>100)throw new Error('CERT_BANK_GATE_INVALID');
  for(const q of questions){
    if(!q||typeof q.q!=='string'||!q.q.trim()||!Array.isArray(q.ops)||q.ops.length<2
      ||q.ops.some(option=>typeof option!=='string'||!option.trim())||!q.ops.includes(q.correcta))
      throw new Error('CERT_BANK_QUESTION_INVALID');
  }
}
export async function saveCertificationBankLifecycle(db,scope,principal,body,action,idem){
  if(!CERT_BANK_LIFECYCLE_ACTIONS.has(action))throw new Error('CERT_BANK_ACTION_INVALID');
  if(!['super','admin'].includes(str(principal?.role))||!str(principal?.uid)||str(principal?.namespace)!=='staff')
    throw new Error('AUTH_FAILURE:CERT_BANK_AUTHORIZED_ADMIN_REQUIRED');
  const allowed=new Set(['bankResourceId','periodId','expectedVersion','expectedContentRevision','idempotencyKey',
    ...(action==='configure'?['gate','required']:[])]);
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!allowed.has(key)))
    throw new Error('CERT_BANK_PAYLOAD_INVALID');
  const rid=str(body.bankResourceId),periodId=str(body.periodId),expectedVersion=body.expectedVersion,
    expectedContentRevision=str(body.expectedContentRevision),actorUid=str(principal.uid);
  if(!rid||rid.includes('/')||rid.length>180||!Number.isInteger(expectedVersion)||expectedVersion<1
    ||!expectedContentRevision||!idem)throw new Error('CERT_BANK_EXPECTED_VERSION_AND_IDEMPOTENCY_REQUIRED');
  const periodIds=certificationPeriodDocumentIds(scope.projectId,periodId);
  if(action==='configure'&&(!Number.isInteger(body.gate)||body.gate<1||body.gate>100||typeof body.required!=='boolean'))
    throw new Error('CERT_BANK_CONFIGURATION_INVALID');
  const tenant=db.collection('tenants').doc(scope.tenantId),project=projectRef(db,scope),ref=resourcesCol(db,scope).doc(rid);
  const receiptRef=tenant.collection('commandReceipts').doc('cert-bank-'+sha([scope.tenantId,scope.projectId,actorUid,idem]).slice(0,32));
  const digest=lifecycleDigest({scope:{tenantId:scope.tenantId,projectId:scope.projectId},action,actorUid,rid,periodId,
    expectedVersion,expectedContentRevision,...(action==='configure'?{gate:body.gate,required:body.required}:{})});
  let replay=false,receipt=null;
  await db.runTransaction(async tx=>{
    const prior=await tx.get(receiptRef),current=await tx.get(ref),projectSnap=await tx.get(project);
    const memberSnap=await tx.get(tenant.collection('users').doc(actorUid));
    const periodSnaps=[];for(const id of periodIds)periodSnaps.push(await tx.get(project.collection('periods').doc(id)));
    if(!memberSnap.exists)throw new Error('AUTH_FAILURE:CERT_BANK_MEMBERSHIP_REQUIRED');
    const member=memberSnap.data()||{};
    if(member.active===false||str(member.status||'active').toLowerCase()==='inactive'
      ||str(member.role).toLowerCase()!==str(principal.role)
      ||str(member.authNamespace).toLowerCase()!==str(principal.namespace)
      ||(member.tenantId!==undefined&&str(member.tenantId)!==scope.tenantId)
      ||(principal.role!=='super'&&!arr(member.projectIds).map(str).includes(scope.projectId)))
      throw new Error('AUTH_FAILURE:CERT_BANK_PROJECT_MEMBERSHIP_DENIED');
    if(!projectSnap.exists)throw new Error('CERT_BANK_PROJECT_NOT_FOUND');
    const projectData=projectSnap.data()||{};
    if((projectData.tenantId!==undefined&&str(projectData.tenantId)!==scope.tenantId)
      ||(projectData.projectId!==undefined&&str(projectData.projectId)!==scope.projectId))
      throw new Error('CERT_BANK_PROJECT_SCOPE_MISMATCH');
    const foundPeriods=periodSnaps.filter(snap=>snap.exists);
    if(foundPeriods.length>1)throw new Error('CERT_REVIEW_POLICY_PERIOD_AMBIGUOUS');
    const periodSnap=foundPeriods[0]||null,periodData=periodSnap?.data()||null;
    if(periodData&&((periodData.tenantId!==undefined&&str(periodData.tenantId)!==scope.tenantId)
      ||(periodData.projectId!==undefined&&str(periodData.projectId)!==scope.projectId)
      ||certificationPeriodDisplayId(scope.projectId,periodData,periodSnap.id)!==certificationPeriodDisplayId(scope.projectId,{},periodId)))
      throw new Error('CERT_REVIEW_POLICY_PERIOD_SCOPE_MISMATCH');
    const policy=resolveCertificationReviewPolicy(projectData,periodData);
    if(!current.exists)throw new Error('CERT_BANK_NOT_FOUND');
    const value=current.data()||{},bank=value.bank||{};
    if((value.id!==undefined&&str(value.id)!==rid)||(value.tenantId!==undefined&&str(value.tenantId)!==scope.tenantId)
      ||value.resourceType!=='certification_bank'||value.tipo!=='certification_bank'
      ||str(value.projectId)!==scope.projectId||str(value.periodId)!==periodId)
      throw new Error('CERT_BANK_SCOPE_MISMATCH');
    if(prior.exists){
      const saved=prior.data()||{};
      if(saved.commandDigest!==digest)throw new Error('CERT_BANK_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
      if(saved.status!=='committed')throw new Error('CERT_BANK_RECEIPT_INCOMPLETE');
      receipt=saved;replay=true;return;
    }
    if(value.version!==expectedVersion||str(bank.contentRevision)!==expectedContentRevision)
      throw new Error('CERT_BANK_EXPECTED_VERSION_CONFLICT');
    if(value.status!=='active'||!['pending_review','published','confirmed'].includes(str(bank.estado)))
      throw new Error('CERT_BANK_ACTIVE_STATE_REQUIRED');
    if(action==='publish'&&bank.estado!=='pending_review')throw new Error('CERT_BANK_PENDING_REVIEW_REQUIRED');
    if(action!=='retire'){
      validateBankForPublication(bank);
      if(policy.requiresDistinctReviewer&&str(bank.generadoPorUid)===actorUid)
        throw new Error('CERT_REVIEW_DISTINCT_REVIEWER_REQUIRED');
    }
    const at=iso(),version=expectedVersion+1,nextBank={...bank};
    if(action==='publish')Object.assign(nextBank,{estado:'published',revisadoPorUid:actorUid,revisadoPor:actorUid,publishedAt:at});
    if(action==='configure')Object.assign(nextBank,{gate:body.gate,required:body.required,previousContentRevision:bank.contentRevision,
      contentRevision:lifecycleDigest({previous:bank.contentRevision,gate:body.gate,required:body.required,questions:bank.preguntas}),
      configuredAt:at,configuredByUid:actorUid});
    if(action==='retire')Object.assign(nextBank,{estado:'withdrawn',withdrawnAt:at,withdrawnByUid:actorUid});
    if(action==='publish'||(action==='configure'&&['published','confirmed'].includes(bank.estado))){
      nextBank.publicationAuthority={schemaVersion:'cxorbia.certification-publication.v1',action,authorUid:str(bank.generadoPorUid),
        reviewerUid:actorUid,actorRole:principal.role,policy,sourceVersion:expectedVersion,
        sourceContentRevision:expectedContentRevision,contentRevision:nextBank.contentRevision,receiptId:receiptRef.id};
    }
    const next={...value,id:rid,tenantId:scope.tenantId,bank:nextBank,version,status:action==='retire'?'deleted':'active',
      updatedAt:at,updatedByUid:actorUid,lastIdempotencyKey:idem};
    if(action==='retire')Object.assign(next,{deletedAt:at,deletedByUid:actorUid});
    receipt={status:'committed',commandType:'certification.'+action,commandDigest:digest,tenantId:scope.tenantId,
      projectId:scope.projectId,periodId,entityType:'certification_bank',entityId:rid,entityVersion:version,
      fromVersion:expectedVersion,fromState:bank.estado,toState:nextBank.estado,authorUid:str(bank.generadoPorUid),
      actorUid,actorRole:principal.role,reviewPolicy:policy,contentRevision:nextBank.contentRevision,
      readbackDigest:lifecycleDigest(lifecycleReadbackValue(next)),providerAck:true,attemptWrites:0,hrWrites:0,updatedAt:at};
    tx.set(ref,next,{merge:false});tx.set(receiptRef,receipt,{merge:false});
  });
  const readback=await ref.get(),receiptReadback=await receiptRef.get();
  if(!readback.exists||!receiptReadback.exists)throw new Error('CERT_BANK_DURABLE_READBACK_MISSING');
  const raw=readback.data()||{},savedReceipt=receiptReadback.data()||{};
  if(raw.id!==readback.id)throw new Error('CERT_BANK_DURABLE_READBACK_MISMATCH');
  const item={...raw,id:readback.id};
  if(item.version!==receipt.entityVersion||savedReceipt.commandDigest!==digest
    ||lifecycleDigest(savedReceipt)!==lifecycleDigest(receipt)||lifecycleDigest(lifecycleReadbackValue(item))!==receipt.readbackDigest)
    throw new Error('CERT_BANK_DURABLE_READBACK_MISMATCH');
  return {item,readbackVerified:true,idempotentReplay:replay,providerWrites:replay?0:2,
    attemptWrites:0,hrWrites:0,receipt:{id:receiptRef.id,...savedReceipt}};
}

function errorStatus(message){
  if(/CERT_BANK_EXPECTED_VERSION_CONFLICT|CERT_BANK_IDEMPOTENCY_REUSE|AI_PERSISTENCE_DRAFT_RETIRED/.test(message))return 409;
  if(/CERT_REVIEW_DISTINCT_REVIEWER_REQUIRED/.test(message))return 403;
  if(/CERT_REVIEW_POLICY_/.test(message))return 400;
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
    if(CERT_BANK_LIFECYCLE_ACTIONS.has(scope.action)){
      const saved=await saveCertificationBankLifecycle(db,scope,principal,body,scope.action,idem);
      sendJson(res,200,{ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,...saved,production:false});return true;
    }
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
