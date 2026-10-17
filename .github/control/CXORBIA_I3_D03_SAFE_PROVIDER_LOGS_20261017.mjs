import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const project='cxorbia-backend-dev';
const filter='resource.type="cloud_run_revision" AND resource.labels.service_name="cxorbia-live-hr-dev" AND timestamp>="2026-10-17T19:51:00Z" AND timestamp<="2026-10-17T19:53:00Z" AND "CXORBIA_CERT_VERTEX_SAFE_DIAGNOSTIC"';
const raw=execFileSync('gcloud',['logging','read',filter,'--project',project,'--limit=30','--format=json'],{encoding:'utf8',timeout:60000,maxBuffer:4000000});
const logs=JSON.parse(raw);
const rows=[],marker='CXORBIA_CERT_VERTEX_SAFE_DIAGNOSTIC ';
for(const entry of Array.isArray(logs)?logs:[]){
 const source=[entry?.textPayload,entry?.jsonPayload?.message,entry?.jsonPayload?.log].filter(x=>typeof x==='string').join(' ');
 const at=source.indexOf(marker);if(at<0)continue;
 try{
  const payload=JSON.parse(source.slice(at+marker.length).trim().split(String.fromCharCode(10))[0]);
  rows.push({timestamp:String(entry.timestamp||''),providerStatus:Number(payload.httpStatus||0),code:String(payload.code||'').slice(0,80),attempt:Number(payload.attempt||0),finishReason:String(payload.finishReason||''),candidateCount:Number(payload.candidateCount||0),responseMimeType:String(payload.responseMimeType||''),transportMimeType:String(payload.transportMimeType||''),textChars:Number(payload.textChars||0),outputTokens:payload.outputTokens??null,groundingTextLogged:false});
 }catch(_){}
}
const result={schemaVersion:'cxorbia.i3.d03.safe-provider-diagnostic.v1',decision:rows.length?'PASS_D03_SAFE_PROVIDER_DIAGNOSTIC':'HOLD_D03_SAFE_PROVIDER_DIAGNOSTIC_UNAVAILABLE',classification:'PROVIDER_FAILURE',runNumber:1768,sourceSha:'a4434a1f223dd6da1468890c99db7339808c1cab',runtimeRevision:'cxorbia-live-hr-dev-00309-kvp',records:rows,readOnly:true,writes:0,deploys:0,production:false};
const runtime=JSON.parse(execFileSync('gcloud',['run','services','describe','cxorbia-live-hr-dev','--project',project,'--region','us-central1','--format=json'],{encoding:'utf8',timeout:60000,maxBuffer:4000000}));
result.runtimeTimeoutSeconds=Number(runtime?.spec?.template?.spec?.timeoutSeconds||runtime?.template?.spec?.timeoutSeconds||0);
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:project});
const settings=await getFirestore().collection('tenants').doc('tya').collection('aiSettings').get();
const allowed=settings.docs.map(doc=>doc.data()||{}).filter(x=>x.status==='active'&&x.serverProxy===true&&( !Array.isArray(x.projectIds)||!x.projectIds.length||x.projectIds.includes('cinepolis')));
allowed.sort((a,b)=>Number(Array.isArray(b.projectIds)&&b.projectIds.includes('cinepolis'))-Number(Array.isArray(a.projectIds)&&a.projectIds.includes('cinepolis'))||String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
const chosen=allowed[0]||{};
result.aiSetting={exists:!!allowed.length,provider:String(chosen.provider||''),model:String(chosen.model||''),location:String(chosen.location||''),scopedToProject:Array.isArray(chosen.projectIds)&&chosen.projectIds.includes('cinepolis')};
const requestFilter='resource.type="cloud_run_revision" AND resource.labels.service_name="cxorbia-live-hr-dev" AND timestamp>="2026-10-17T19:51:00Z" AND timestamp<="2026-10-17T19:53:00Z" AND httpRequest.requestUrl:"certifications/ai-generate"';
const requestLogRaw=execFileSync('gcloud',['logging','read',requestFilter,'--project',project,'--limit=25','--format=json'],{encoding:'utf8',timeout:60000,maxBuffer:4000000});
result.requestMetrics=(JSON.parse(requestLogRaw)||[]).map(x=>({timestamp:String(x.timestamp||''),status:Number(x.httpRequest?.status||0),latency:String(x.httpRequest?.latency||''),method:String(x.httpRequest?.requestMethod||'')})).filter(x=>x.status);
const sourceSha='a4434a1f223dd6da1468890c99db7339808c1cab',documentSha='3654d624896f3517c39136b29f6c37542d8a128f9d8d9d8a616693f039753454';
const idem='i3-d03-live:'+sourceSha.slice(0,12)+':'+documentSha.slice(0,12)+':q15';
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const resourceId='certbank-cinepolis-cinepolis-2026-09-ai-'+documentSha.slice(0,12);
const receiptId='cert-ai-'+hash(['tya','cinepolis',idem].join(String.fromCharCode(0))).slice(0,32);
const tenant=getFirestore().collection('tenants').doc('tya');
const resourceRef=tenant.collection('resources').doc(resourceId),receiptRef=tenant.collection('commandReceipts').doc(receiptId);
const [rs,cs]=await Promise.all([resourceRef.get(),receiptRef.get()]);
const bank=(rs.data()||{}).bank||{},receipt=cs.data()||{};
const check={resourceExists:rs.exists,receiptExists:cs.exists,resourceId,receiptId,
  status:String(bank.estado||''),questionCount:Array.isArray(bank.preguntas)?bank.preguntas.length:0,
  documentHashMatches:String(bank.documentSource?.source_sha256||'')===documentSha,
  receiptStatus:String(receipt.status||''),receiptEntityMatches:String(receipt.entityId||'')===resourceId,
  receiptCommandMatches:String(receipt.commandType||'')==='certification.ai-generate',
  generationAttempts:Number(bank.generationAttempts||0),readOnly:true,production:false};
check.pendingReviewAckProven=check.resourceExists&&check.receiptExists&&check.status==='pending_review'&&check.questionCount===15&&check.documentHashMatches&&check.receiptStatus==='committed'&&check.receiptEntityMatches&&check.receiptCommandMatches;
if(rs.exists){const again=await resourceRef.get();check.stableReadback=again.exists&&Number(again.data()?.version||0)===Number(rs.data()?.version||0)&&String(again.data()?.bank?.contentRevision||'')===String(bank.contentRevision||'');}
result.pendingReviewReadback=check;
const out=(process.env.PHASEA_LIVE_OUT||'.tmp/phasea-representative-live')+'/d03/provider-diagnostic.json';
fs.mkdirSync(out.slice(0,out.lastIndexOf('/')),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+String.fromCharCode(10));
console.log(JSON.stringify(result,null,2));
if(!rows.length)process.exitCode=2;
