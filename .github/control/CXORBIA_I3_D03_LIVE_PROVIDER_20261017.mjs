import fs from 'node:fs';
import crypto from 'node:crypto';
import {GoogleAuth} from 'google-auth-library';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

const OUT=process.env.D03_OUT||'.tmp/i3-d03-live';
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev');
const TENANT=String(process.env.TENANT_ID||'tya');
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis');
const PERIOD=String(process.env.PERIOD_ID||'cinepolis-2026-09');
const descriptor=JSON.parse(fs.readFileSync(process.env.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const SOURCE=String(process.env.D03_SOURCE||process.env.FOCAL_SOURCE||descriptor.productSourceSha||'');
const SOURCE_TREE=String(process.env.D03_TREE||process.env.FOCAL_TREE||descriptor.productTreeAuthority||'');
const FILE_ID=String(process.env.D03_DRIVE_FILE_ID||'122rCkfD-vNgs39LwT7jGfYBVLg57ur82');
const EXPECTED_SHA=String(process.env.D03_SOURCE_SHA256||'3654d624896f3517c39136b29f6c37542d8a128f9d8d9d8a616693f039753454').toLowerCase();
const EXPECTED_RUNTIME=String(process.env.D03_RUNTIME_REVISION||descriptor.currentMaterialization?.runtimeRevision||'');
const EXPECTED_HOSTING=String(process.env.D03_HOSTING_VERSION||descriptor.currentMaterialization?.hostingVersion||'');
const QUESTION_COUNT=15;
const str=v=>String(v==null?'':v).trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.d03.live-provider.v1',decision:'HOLD',classification:null,code:null,sourceSha:SOURCE,sourceTree:SOURCE_TREE,driveFileId:FILE_ID,expectedSourceSha256:EXPECTED_SHA,questionCount:QUESTION_COUNT,runtimeRevision:EXPECTED_RUNTIME,hostingVersion:EXPECTED_HOSTING,sourceAccess:{},parser:{},provider:{},persistence:{},writes:{auth:0,hr:0,provider:0},deploys:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
const safeError=e=>str(e?.message||e).replace(/Bearer\s+[A-Za-z0-9._-]+/g,'Bearer [redacted]').slice(0,360);
function classify(message){
 if(/AUTH_FAILURE|DRIVE_SOURCE_ACCESS|TOKEN_EXCHANGE|ADMIN_MISSING/.test(message))return 'AUTH_FAILURE';
 if(/SOURCE_FAILURE|SOURCE_SHA|SOURCE_EMPTY|DRIVE_SOURCE_HASH/.test(message))return 'SOURCE_FAILURE';
 if(/AI_PROVIDER|VERTEX/.test(message))return 'PROVIDER_FAILURE';
 if(/PERSISTENCE|READBACK|IDEMPOTENCY|EXISTING_DRAFT/.test(message))return 'PERSISTENCE_FAILURE';
 return 'FUNCTIONAL_DEFECT';
}
async function fail(error){
 const message=safeError(error);result.classification=classify(message);result.code=message.split(':').slice(0,2).join(':')||message;result.decision='HOLD_I3_D03_LIVE_PROVIDER';save();console.log(JSON.stringify(result,null,2));process.exitCode=2;
}
try{
 if(!SOURCE||!SOURCE_TREE||!FILE_ID||!/^[0-9a-f]{64}$/.test(EXPECTED_SHA))throw new Error('SOURCE_FAILURE:D03_INPUT_CONTRACT');
 const credPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;if(!credPath||!fs.existsSync(credPath))throw new Error('AUTH_FAILURE:D03_GCP_CREDENTIAL_FILE_REQUIRED');
 const cred=JSON.parse(fs.readFileSync(credPath,'utf8'));result.serviceAccountEmail=str(cred.client_email);if(!result.serviceAccountEmail)throw new Error('AUTH_FAILURE:D03_SERVICE_ACCOUNT_EMAIL_MISSING');
 const driveAuth=new GoogleAuth({credentials:cred,scopes:['https://www.googleapis.com/auth/drive.readonly']});
 const driveClient=await driveAuth.getClient(),driveHeaders=await driveClient.getRequestHeaders();
 const bearer=driveHeaders.Authorization||driveHeaders.authorization;if(!bearer)throw new Error('AUTH_FAILURE:D03_DRIVE_TOKEN_MISSING');
 const dr=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(FILE_ID)+'?alt=media',{headers:{Authorization:bearer},signal:AbortSignal.timeout(45000)});
 result.sourceAccess.httpStatus=dr.status;
 if(!dr.ok)throw new Error('AUTH_FAILURE:D03_DRIVE_SOURCE_ACCESS_'+dr.status);
 const bytes=Buffer.from(await dr.arrayBuffer()),observedSha=sha(bytes);
 result.sourceAccess={httpStatus:dr.status,bytes:bytes.length,sha256:observedSha,exactHash:observedSha===EXPECTED_SHA};
 if(observedSha!==EXPECTED_SHA)throw new Error('SOURCE_FAILURE:D03_DRIVE_SOURCE_HASH_MISMATCH');
 const pdf=await pdfjsLib.getDocument({data:new Uint8Array(bytes),disableFontFace:true,useSystemFonts:true,isEvalSupported:false}).promise;
 const pages=[];
 for(let n=1;n<=pdf.numPages;n++){
  const page=await pdf.getPage(n),content=await page.getTextContent();
  const text=arr(content.items).map(x=>str(x?.str)).filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  pages.push('[Página '+n+']\n'+text);
 }
 const sourceText=pages.join('\n\n'),letters=(sourceText.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g)||[]).length,ratio=sourceText.length?letters/sourceText.length:0;
 const sufficient=pdf.numPages>=2&&sourceText.length>=1500&&ratio>=0.45;
 result.parser={parser:'pdfjs-3.11.174',pageCount:pdf.numPages,textChars:sourceText.length,letterRatio:Number(ratio.toFixed(3)),quality:sufficient?'high':'insufficient',sufficient,ocrExecuted:false};
 if(!sufficient)throw new Error('SOURCE_FAILURE:D03_PDF_TEXT_QUALITY_INSUFFICIENT');

 if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
 const fbAuth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
 const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
 let admin=null;
 for(const m of members.filter(x=>x.active===true&&['super','admin'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper'&&(str(x.role).toLowerCase()==='super'||arr(x.projectIds).map(String).includes(PROGRAM)))){
  try{const u=await fbAuth.getUser(m.id);if(!u.disabled){admin=m;break;}}catch(_){}
 }
 if(!admin)throw new Error('AUTH_FAILURE:D03_ADMIN_MISSING');
 const init=await fetch(HOST+'/__/firebase/init.json',{cache:'no-store'});if(!init.ok)throw new Error('AUTH_FAILURE:D03_FIREBASE_INIT_'+init.status);
 const apiKey=str((await init.json())?.apiKey);if(!apiKey)throw new Error('AUTH_FAILURE:D03_FIREBASE_API_KEY_MISSING');
 const custom=await fbAuth.createCustomToken(admin.id);
 const ex=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(apiKey),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true}),signal:AbortSignal.timeout(30000)});
 const exBody=await ex.json().catch(()=>({}));if(!ex.ok||!exBody.idToken)throw new Error('AUTH_FAILURE:D03_TOKEN_EXCHANGE_'+ex.status);
 const idToken=exBody.idToken;
 const idem='i3-d03-live:'+SOURCE.slice(0,12)+':'+EXPECTED_SHA.slice(0,12)+':q15';
 const resourceId=('certbank-'+PROGRAM+'-'+PERIOD+'-ai-'+EXPECTED_SHA.slice(0,12)).replace(/[^a-zA-Z0-9_-]+/g,'-');
 const receiptId='cert-ai-'+sha(TENANT+'\0'+PROGRAM+'\0'+idem).slice(0,32);
 const resourceRef=tenant.collection('resources').doc(resourceId),receiptRef=tenant.collection('commandReceipts').doc(receiptId);
 const [beforeResource,beforeReceipt]=await Promise.all([resourceRef.get(),receiptRef.get()]);
 if(beforeResource.exists!==beforeReceipt.exists)throw new Error('PERSISTENCE_FAILURE:D03_EXISTING_DRAFT_RECEIPT_MISMATCH');
 if(beforeResource.exists){
  const bank=(beforeResource.data()||{}).bank||{},receipt=beforeReceipt.data()||{};
  if(str(bank.estado)!=='pending_review'||str(bank.documentSource?.source_sha256)!==EXPECTED_SHA||arr(bank.preguntas).length!==QUESTION_COUNT||str(receipt.entityId)!==resourceId||str(receipt.commandType)!=='certification.ai-generate')throw new Error('PERSISTENCE_FAILURE:D03_EXISTING_DRAFT_WITHOUT_EXACT_QA_RECEIPT');
 }
 const body={sourceText,questionCount:QUESTION_COUNT,gate:80,periodId:PERIOD,certificationName:'Banco IA pendiente de revisión',sourceSha256:EXPECTED_SHA,sourceTitle:'Instructivo Shopper.pdf',documentSource:{mode:'attachment',name:'Instructivo Shopper.pdf',format:'pdf',mime:'application/pdf',size:bytes.length,source_sha256:EXPECTED_SHA,parser:'pdfjs-3.11.174',extraction_quality:{label:'high',score:95,sufficient:true,textChars:sourceText.length,pageCount:pdf.numPages},ocrExecuted:false,driveFileId:FILE_ID}};
 const endpoint=HOST+'/api/tenants/'+encodeURIComponent(TENANT)+'/projects/'+encodeURIComponent(PROGRAM)+'/certifications/ai-generate';
 const call=async()=>{const r=await fetch(endpoint,{method:'POST',cache:'no-store',headers:{authorization:'Bearer '+idToken,'content-type':'application/json','idempotency-key':idem},body:JSON.stringify(body),signal:AbortSignal.timeout(180000)});const j=await r.json().catch(()=>({}));if(!r.ok||j?.ok!==true)throw new Error(str(j?.code||j?.error||('AI_PROVIDER_HTTP_'+r.status)));return j;};
 const first=await call();
 if(beforeResource.exists!==true){
  if(first.idempotentReplay===true||Number(first.providerWrites)!==2||first.aiProviderAck!==true||first.readbackVerified!==true)throw new Error('PERSISTENCE_FAILURE:D03_FIRST_COMMIT_ACK_MISMATCH');
  if(Number(first.generationAttempts||0)!==1)throw new Error('PROVIDER_FAILURE:D03_VERTEX_GENERATION_ATTEMPTS_'+String(first.generationAttempts||0));
 }else if(first.idempotentReplay!==true||Number(first.providerWrites||0)!==0)throw new Error('PERSISTENCE_FAILURE:D03_EXISTING_EXACT_REPLAY_MISMATCH');
 const questions=arr(first.preguntas),pageRefs=questions.map(q=>Number((str(q?.fuente).match(/p[aá]gina\s+(\d+)/i)||[])[1]||0));
 if(questions.length!==QUESTION_COUNT||pageRefs.some(n=>n<1||n>pdf.numPages)||questions.some(q=>arr(q?.ops).length!==4||!str(q?.correcta)||!arr(q?.ops).map(str).includes(str(q?.correcta))||!str(q?.exp)||!str(q?.fuente)))throw new Error('FUNCTIONAL_DEFECT:D03_GROUNDED_QUESTION_SHAPE');
 const [resourceRb,receiptRb]=await Promise.all([resourceRef.get(),receiptRef.get()]);
 if(!resourceRb.exists||!receiptRb.exists)throw new Error('PERSISTENCE_FAILURE:D03_DIRECT_READBACK_MISSING');
 const record=resourceRb.data()||{},bank=record.bank||{},receipt=receiptRb.data()||{};
 if(str(bank.estado)!=='pending_review'||str(bank.documentSource?.source_sha256)!==EXPECTED_SHA||arr(bank.preguntas).length!==QUESTION_COUNT||str(receipt.status)!=='committed'||str(receipt.entityId)!==resourceId)throw new Error('PERSISTENCE_FAILURE:D03_DIRECT_READBACK_MISMATCH');
 const versionBeforeReplay=Number(record.version||0),contentRevision=str(bank.contentRevision);
 const replay=await call();
 const resourceAfter=await resourceRef.get(),bankAfter=(resourceAfter.data()||{}).bank||{};
 if(replay.idempotentReplay!==true||Number(replay.providerWrites||0)!==0||Number(resourceAfter.data()?.version||0)!==versionBeforeReplay||str(bankAfter.contentRevision)!==contentRevision||arr(bankAfter.preguntas).length!==QUESTION_COUNT)throw new Error('PERSISTENCE_FAILURE:D03_IDEMPOTENT_REPLAY_MISMATCH');
 result.decision='PASS_I3_D03_LIVE_VERTEX_PENDING_REVIEW';
 result.classification='PASS';result.code=null;
 result.admin={role:str(admin.role),uidSha256:sha(admin.id)};
 result.provider={aiProviderAck:first.aiProviderAck===true,provider:str(first.provider),model:str(first.model),location:str(first.location),generationAttempts:Number(first.generationAttempts||0),actualVertexGenerationThisRun:beforeResource.exists!==true};
 result.persistence={resourceId,receiptId,state:str(bank.estado),questionCount:arr(bank.preguntas).length,sourceReferenceCount:pageRefs.filter(Boolean).length,contentRevision,resourceVersion:versionBeforeReplay,firstProviderWrites:Number(first.providerWrites||0),replayProviderWrites:Number(replay.providerWrites||0),idempotentReplay:replay.idempotentReplay===true,readbackVerified:true,noDuplicate:true};
 result.writes={auth:0,hr:0,provider:beforeResource.exists?0:Number(first.providerWrites||0)};
 save();console.log(JSON.stringify(result,null,2));
}catch(error){await fail(error);}
