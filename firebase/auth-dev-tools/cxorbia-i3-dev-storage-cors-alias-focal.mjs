#!/usr/bin/env node
/* I3 focal DEV CORS metadata-only: preserve all existing rules; add one alias. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getStorage} from 'firebase-admin/storage';
const PROJECT='cxorbia-backend-dev',BUCKET='cxorbia-backend-dev.firebasestorage.app';
const CANONICAL='https://cxorbia-backend-dev.web.app',ALIAS='https://cxorbia-backend-dev.firebaseapp.com';
const OUT='.tmp/cxorbia-i3-dev-storage-cors-alias-focal';
const arr=x=>Array.isArray(x)?x:[];
const allowed=(row,origin)=>arr(row.origin).includes(origin)&&arr(row.method).includes('GET');
const summary=meta=>({metageneration:String(meta?.metageneration||''),corsEntryCount:arr(meta?.cors).length,
  canonicalGet:arr(meta?.cors).some(r=>allowed(r,CANONICAL)),
  aliasGet:arr(meta?.cors).some(r=>allowed(r,ALIAS))});
const comparable=rows=>JSON.stringify(rows.map(x=>({origin:[...arr(x.origin)].sort(),
  method:[...arr(x.method)].sort(),responseHeader:[...arr(x.responseHeader)].sort(),
  maxAgeSeconds:Number(x.maxAgeSeconds||0)})));
const report={schemaVersion:'cxorbia.i3.dev-cors-alias.focal.v1',iteration:'I3',
  environment:'DEV_ONLY',bucketHash:crypto.createHash('sha256').update(BUCKET).digest('hex').slice(0,16),
  decision:'HOLD_NOT_RUN',before:{},after:{},
  safety:{bucketMetadataWrites:0,storageObjectWrites:0,firestoreWrites:0,
    authWrites:0,hrWrites:0,deploys:0,production:false}};
fs.mkdirSync(OUT,{recursive:true});
try{
  if(process.env.CI!=='true'||process.env.GITHUB_REF_NAME!=='recovery/cxorbia-phase-a-20260831')
    throw Error('ENVIRONMENT_FAILURE:DEV_CORS_BRANCH_REQUIRED');
  const current=JSON.parse(fs.readFileSync('CXORBIA_RECOVERY_EXECUTION_CURRENT.json','utf8'));
  const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
  if(current.production!=='DO_NOT_TOUCH'||current.authorizationI4!==false||
     current.postDeployRunSeal?.sourceSha!==descriptor.productSourceSha||
     descriptor.postDeployRunSeal?.sourceSha!==descriptor.productSourceSha||
     descriptor.postDeployRunSeal?.mode!=='CURRENT_SOURCE_SERVING')
    throw Error('RELEASE_COMPOSITION_FAILURE:DEV_CORS_SOURCE_LOCK');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const bucket=getStorage().bucket(BUCKET);
  const [before]=await bucket.getMetadata();
  const baseline=structuredClone(arr(before.cors));
  fs.writeFileSync(OUT+'/before-cors.json',JSON.stringify(baseline,null,2)+'\n','utf8');
  report.before=summary(before);
  if(!report.before.canonicalGet||baseline.length<1||baseline.length>10)
    throw Error('PROVIDER_FAILURE:DEV_CORS_BASELINE_UNEXPECTED');
  const matching=baseline.map((row,i)=>allowed(row,CANONICAL)?i:-1).filter(i=>i>=0);
  if(matching.length!==1)throw Error('MAPPING_FAILURE:DEV_CORS_CANONICAL_RULE_NOT_UNIQUE');
  const updated=structuredClone(baseline),i=matching[0];
  if(!arr(updated[i].origin).includes(ALIAS)){
    updated[i].origin=[...updated[i].origin,ALIAS];
    await bucket.setCorsConfiguration(updated);
    report.safety.bucketMetadataWrites=1;
  }
  const [after]=await bucket.getMetadata();
  report.after=summary(after);
  if(!report.after.canonicalGet||!report.after.aliasGet||
    report.after.corsEntryCount!==report.before.corsEntryCount||
    comparable(updated)!==comparable(arr(after.cors)))
    throw Error('PROVIDER_FAILURE:DEV_CORS_READBACK_MISMATCH');
  report.decision=report.safety.bucketMetadataWrites===1?
    'PASS_DEV_ALIAS_CORS_PATCHED_AND_READ_BACK':'PASS_DEV_ALIAS_CORS_ALREADY_CONFIGURED';
}catch(error){
  report.decision='HOLD_DEV_ALIAS_CORS_FOCAL';
  const code=String(error?.message||'');
  report.failureCode=/^(?:ENVIRONMENT_FAILURE|RELEASE_COMPOSITION_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE):[A-Z0-9_]+$/.test(code)?
    code:Number(error?.code)===403?'PROVIDER_FAILURE:DEV_BUCKET_CORS_WRITE_DENIED':
    'PROVIDER_FAILURE:DEV_BUCKET_CORS_UNKNOWN';
  process.exitCode=1;
}finally{
  fs.writeFileSync(OUT+'/result.json',JSON.stringify(report,null,2)+'\n','utf8');
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
