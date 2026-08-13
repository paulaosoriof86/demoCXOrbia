import fs from 'node:fs';
const requestPath=process.env.CXORBIA_REQUEST_PATH||'backend/config/corte6-hold-profile-live-hr-readonly-request.json';
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
if(request.mode!=='p0_admin_visible_login_offline_only')throw new Error('P0_OFFLINE_MODE_REQUIRED');
await import('./cxorbia-p0-admin-visible-login-offline.mjs');
