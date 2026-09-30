import fs from 'node:fs';
import path from 'node:path';
const requestPath=process.env.CXORBIA_REQUEST_PATH||'backend/config/corte6-hold-profile-live-hr-readonly-request.json';
const privateOut=process.env.CXORBIA_PRIVATE_OUT||'.tmp/c6-hold-profile-live-hr/private.json';
const safeOut=process.env.CXORBIA_SAFE_OUT||'app/docs/evidence/CORTE6-HOLD-PROFILE-LIVE-HR-READONLY-LATEST.json';
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
if(request.mode!=='p0_admin_visible_login_offline_only')throw new Error('P0_OFFLINE_MODE_REQUIRED');
try{
  await import('./cxorbia-p0-admin-visible-login-offline.mjs');
}catch(error){
  const code=String(error?.message||error||'UNKNOWN').replace(/[^A-Z0-9_:\-]/gi,'_').slice(0,160);
  const at=new Date().toISOString();
  fs.mkdirSync(path.dirname(privateOut),{recursive:true});
  fs.mkdirSync(path.dirname(safeOut),{recursive:true});
  fs.writeFileSync(privateOut,JSON.stringify({schemaVersion:'cxorbia.p0.admin-b-offline.failure.private.v1',generatedAt:at,requestId:request.requestId,decision:'HOLD_P0_ADMIN_B_OFFLINE_RECOVERY_FAILED',errorCode:code,providerReads:0},null,2)+'\n','utf8');
  fs.writeFileSync(safeOut,JSON.stringify({schemaVersion:'cxorbia.p0.admin-b-offline.failure.source-safe.v1',generatedAt:at,requestId:request.requestId,decision:'HOLD_P0_ADMIN_B_OFFLINE_RECOVERY_FAILED',errorCode:code,safety:{providerReads:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,deploys:0,merge:false,production:false},nextGate:'SOURCE_ONLY_OFFLINE_FIX_NO_PROVIDER_READ_REQUIRED'},null,2)+'\n','utf8');
  console.log(JSON.stringify({decision:'HOLD_P0_ADMIN_B_OFFLINE_RECOVERY_FAILED',errorCode:code,providerReads:0}));
}
