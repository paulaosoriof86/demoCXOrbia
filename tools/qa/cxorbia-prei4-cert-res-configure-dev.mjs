import fs from 'node:fs';
import path from 'node:path';
import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId=String(process.env.PROJECT||'').trim();
const tenantId=String(process.env.TENANT_ID||'').trim();
const outDir=String(process.env.CERT_RES_MAT_OUT||'.tmp/prei4-cert-res-materialize');
if(projectId!=='cxorbia-backend-dev')throw new Error('ENVIRONMENT_FAILURE:DEV_PROJECT_REQUIRED');
if(!tenantId)throw new Error('MAPPING_FAILURE:TENANT_ID_REQUIRED');
fs.mkdirSync(outDir,{recursive:true});

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId});
const db=getFirestore();
const ref=db.collection('tenants').doc(tenantId).collection('aiSettings').doc('certification-primary');
const desired={
  status:'active',
  provider:'vertex-ai',
  model:'gemini-2.5-flash',
  location:'us-central1',
  serverProxy:true,
  scope:'tenant',
  projectIds:[],
  useCases:['certification_generation'],
  secretInBrowser:false,
  configAuthority:'cxorbia_pre_i4_cert_res',
  production:false
};
const priorSnap=await ref.get();
const prior=priorSnap.exists?(priorSnap.data()||{}):null;
const stableKeys=Object.keys(desired);
const same=!!prior&&stableKeys.every(k=>JSON.stringify(prior[k])===JSON.stringify(desired[k]));
let writes=0;
if(!same){
  await ref.set({...desired,updatedAt:new Date().toISOString()},{merge:false});
  writes=1;
}
const afterSnap=await ref.get();
if(!afterSnap.exists)throw new Error('PERSISTENCE_FAILURE:AI_SETTING_READBACK_MISSING');
const after=afterSnap.data()||{};
for(const [k,v] of Object.entries(desired)){
  if(JSON.stringify(after[k])!==JSON.stringify(v))throw new Error('PERSISTENCE_FAILURE:AI_SETTING_READBACK_MISMATCH:'+k);
}
const result={
  decision:'PASS_PREI4_CERT_RES_AI_SETTING_CONFIGURED',
  projectId,tenantId,
  settingId:'certification-primary',
  provider:after.provider,
  model:after.model,
  location:after.location,
  serverProxy:after.serverProxy===true,
  writes,
  idempotent:writes===0,
  production:false
};
fs.writeFileSync(path.join(outDir,'ai-setting.json'),JSON.stringify(result,null,2)+'\n');
process.stdout.write(JSON.stringify(result,null,2)+'\n');
