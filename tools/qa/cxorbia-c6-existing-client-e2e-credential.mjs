import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId='tya';
const projectId='cinepolis';
const authNamespace='staff';
const role='cliente';
const login='cinepolis.cliente';
const uid='cxorbia-c6-client-tya-cinepolis-v1';
const membershipPath=`tenants/${tenantId}/users/${uid}`;
const outPath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-users-e2e-private/private-e2e.json';
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const saPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;

const text=v=>String(v??'').trim();
const list=v=>Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean):(typeof v==='string'?v.split(',').map(x=>x.trim()).filter(Boolean):[]);
const sha256=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const internalEmail=sha256(`${tenantId}\0${authNamespace}\0${login.toLowerCase()}`).slice(0,48)+'@auth.cxorbia.invalid';
const derivePassword=sa=>{
  const raw=crypto.createHmac('sha256',Buffer.from(sa.private_key,'utf8'))
    .update(`cxorbia-c6-client-password-v1\0${tenantId}\0${projectId}\0${login}`,'utf8').digest('base64url');
  return `Cx!${raw.slice(0,29)}9a`;
};
function safeHold(reason){
  console.log(JSON.stringify({decision:'HOLD_C6_EXISTING_CANONICAL_CLIENT_NOT_READY',reason:String(reason).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,180),
    authWrites:0,passwordChanges:0,passwordResets:0,membershipWrites:0,valuesExported:false,credentialsExposed:false,production:false}));
  process.exit(0);
}
function claimsValid(c={}){
  return ['cliente','client'].includes(text(c.role).toLowerCase())&&text(c.authNamespace).toLowerCase()==='staff'&&
    (c.tenantId===tenantId||list(c.tenants).includes(tenantId))&&
    (c.projectId===projectId||list(c.projectIds).includes(projectId))&&text(c.clientId)===projectId;
}
function membershipValid(d={}){
  return text(d.uid)===uid&&text(d.userId)===uid&&text(d.tenantId)===tenantId&&
    ['cliente','client'].includes(text(d.role).toLowerCase())&&text(d.authNamespace).toLowerCase()==='staff'&&
    (text(d.projectId)===projectId||list(d.projectIds).includes(projectId))&&text(d.clientId)===projectId&&text(d.status).toLowerCase()==='active';
}
async function firebaseWebConfig(){
  const response=await fetch(remoteRoot+'/__/firebase/init.js',{headers:{'cache-control':'no-cache'}});
  if(!response.ok)throw new Error(`FIREBASE_INIT_HTTP_${response.status}`);
  const source=await response.text();let config=null;
  const fake={apps:[],initializeApp(value){config=value;this.apps.push({});return{};},app(){return{options:config};}};
  vm.runInNewContext(source,{firebase:fake,window:{},self:{}},{timeout:2000});
  if(!config?.apiKey||config.projectId!==expectedProject)throw new Error('FIREBASE_WEB_CONFIG_MISMATCH');
  return config;
}
async function passwordSignIn(password){
  const cfg=await firebaseWebConfig();
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(cfg.apiKey)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:internalEmail,password,returnSecureToken:true})
  });
  if(!response.ok)return false;
  const result=await response.json();return Boolean(result?.idToken);
}

if(!saPath||!fs.existsSync(saPath))safeHold('SERVICE_ACCOUNT_REQUIRED');
let sa;try{sa=JSON.parse(fs.readFileSync(saPath,'utf8'));}catch{safeHold('SERVICE_ACCOUNT_INVALID_JSON');}
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')safeHold('WRONG_SERVICE_ACCOUNT');
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const auth=admin.auth();const db=admin.firestore();
let byUid=null,byEmail=null;
try{byUid=await auth.getUser(uid);}catch(e){if(e.code!=='auth/user-not-found')safeHold(e.code||'AUTH_UID_LOOKUP_FAILED');}
try{byEmail=await auth.getUserByEmail(internalEmail);}catch(e){if(e.code!=='auth/user-not-found')safeHold(e.code||'AUTH_EMAIL_LOOKUP_FAILED');}
if(!byUid&&!byEmail)safeHold('CANONICAL_CLIENT_IDENTITY_MISSING');
if(byUid&&byEmail&&byUid.uid!==byEmail.uid)safeHold('CANONICAL_CLIENT_UID_EMAIL_COLLISION');
const user=byUid||byEmail;
if(user.uid!==uid||user.email!==internalEmail)safeHold('CANONICAL_CLIENT_IDENTITY_DRIFT');
if(user.disabled)safeHold('CANONICAL_CLIENT_DISABLED');
if(!claimsValid(user.customClaims||{}))safeHold('CANONICAL_CLIENT_CLAIMS_INVALID');
const membership=await db.doc(membershipPath).get();
if(!membership.exists||!membershipValid(membership.data()||{}))safeHold('CANONICAL_CLIENT_MEMBERSHIP_INVALID');
const password=derivePassword(sa);
if(!(await passwordSignIn(password)))safeHold('CANONICAL_CLIENT_PASSWORD_SIGNIN_FAILED');
let existing={schemaVersion:'cxorbia.c6.e2e-private-credentials.v10'};
try{existing=JSON.parse(fs.readFileSync(outPath,'utf8'));}catch{}
existing.schemaVersion='cxorbia.c6.e2e-private-credentials.v10';
existing.client={login,password,namespace:authNamespace,role,tenantId,projectIds:[projectId]};
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify(existing,null,2)+'\n',{encoding:'utf8',mode:0o600});
console.log(JSON.stringify({decision:'PASS_C6_EXISTING_CANONICAL_CLIENT_CREDENTIAL_SELECTION',role,namespace:authNamespace,tenantId,projectScope:true,
  identityFingerprint:sha256(uid),membershipFingerprint:sha256(membershipPath),claimsValid:true,membershipValid:true,passwordSignIn:true,
  authWrites:0,passwordChanges:0,passwordResets:0,membershipWrites:0,valuesExported:false,credentialsExposed:false,production:false}));
