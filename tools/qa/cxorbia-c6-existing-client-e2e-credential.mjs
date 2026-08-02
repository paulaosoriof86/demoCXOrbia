import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import vm from 'node:vm';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId='tya';
const canonicalProjectId='cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const outPath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-users-e2e-private/private-e2e.json';
const remoteRoot=process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app';
const remoteInitUrl=process.env.CXORBIA_FIREBASE_INIT_URL||remoteRoot+'/__/firebase/init.js';

const text=v=>String(v??'').trim();
const norm=v=>text(v).toLowerCase();
const list=value=>Array.isArray(value)?value.map(String):(typeof value==='string'?value.split(',').map(x=>x.trim()).filter(Boolean):[]);
const sha256Hex=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
const internalEmail=(login,namespace)=>sha256Hex(`${tenantId}\0${namespace}\0${norm(login)}`).slice(0,48)+'@auth.cxorbia.invalid';

function safeFail(message){
  const safe=String(message||'unknown').replace(/[^A-Z0-9_:-]/gi,'_').slice(0,180);
  console.log(JSON.stringify({
    decision:'HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND',
    reason:safe,
    authWrites:0,
    passwordChanges:0,
    passwordResets:0,
    valuesExported:false,
    credentialsExposed:false,
    production:false
  }));
  process.exit(0);
}

function decryptEnvelope(sa,env,pub,encPriv){
  if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)throw new Error('KEY_FINGERPRINT_MISMATCH');
  const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),Buffer.from(encPriv.saltBase64,'base64'),Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
  const privateDecipher=crypto.createDecipheriv('aes-256-gcm',kek,Buffer.from(encPriv.ivBase64,'base64'));
  privateDecipher.setAuthTag(Buffer.from(encPriv.tagBase64,'base64'));
  const privateDer=Buffer.concat([privateDecipher.update(Buffer.from(encPriv.ciphertextBase64,'base64')),privateDecipher.final()]);
  const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
  const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
  const encrypted=Buffer.from(env.ciphertextBase64,'base64');
  if(encrypted.length<17)throw new Error('CIPHERTEXT_TOO_SHORT');
  const decipher=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));
  decipher.setAAD(Buffer.from(env.aad,'utf8'));
  decipher.setAuthTag(encrypted.subarray(encrypted.length-16));
  const plain=Buffer.concat([decipher.update(encrypted.subarray(0,encrypted.length-16)),decipher.final()]);
  return JSON.parse((env.algorithms?.compression==='gzip'?zlib.gunzipSync(plain):plain).toString('utf8'));
}

function validClientClaims(claims){
  const role=norm(claims?.role),claimNs=norm(claims?.authNamespace);
  const tenantOk=claims?.tenantId===tenantId||list(claims?.tenants).includes(tenantId);
  const projectOk=claims?.projectId===canonicalProjectId||list(claims?.projectIds).includes(canonicalProjectId);
  const namespaceOk=(claimNs||'staff')==='staff';
  return Boolean(tenantOk&&projectOk&&namespaceOk&&['cliente','client'].includes(role));
}

function passwordCandidates(record,user,login){
  const values=new Set();
  const exact=text(record?.pass||record?.password);
  if(exact)values.add(exact);
  for(const raw of [login,record?.name,record?.nombre,record?.displayName,record?.firstName,record?.legacyName,record?.personName,user?.displayName]){
    const tokens=norm(raw).split('@')[0].split(/[^a-záéíóúüñ]+/i).filter(Boolean);
    for(const token of tokens){
      const clean=token.replace(/\d+$/,'');
      if(clean)values.add(clean.charAt(0).toUpperCase()+clean.slice(1).toLowerCase()+'123*');
    }
  }
  return [...values];
}

for(const p of [credentialPath,envelopePath,publicPath,privatePath]){
  if(!p||!fs.existsSync(p))safeFail(`REQUIRED_FILE_MISSING:${p||'undefined'}`);
}
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')safeFail('WRONG_SERVICE_ACCOUNT');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(!env.tenantId)env.tenantId=tenantId;
if(env.targetProjectId!==expectedProject||env.tenantId!==tenantId)safeFail('ENVELOPE_TARGET_MISMATCH');
let bundle;
try{bundle=decryptEnvelope(sa,env,pub,encPriv);}catch(error){safeFail(error?.message||'DECRYPT_FAILED');}
if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion))safeFail('BUNDLE_CONTRACT_MISMATCH');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const auth=admin.auth();

async function firebaseWebConfig(){
  const response=await fetch(remoteInitUrl,{headers:{'cache-control':'no-cache'}});
  if(!response.ok)throw new Error(`FIREBASE_INIT_HTTP_${response.status}`);
  const source=await response.text();let config=null;
  const fake={apps:[],initializeApp(value){config=value;this.apps.push({});return{};},app(){return{options:config};}};
  vm.runInNewContext(source,{firebase:fake,window:{},self:{}},{timeout:2000});
  if(!config?.apiKey||config.projectId!==expectedProject)throw new Error('FIREBASE_WEB_CONFIG_MISMATCH');
  return config;
}
let webConfig;
try{webConfig=await firebaseWebConfig();}catch(error){safeFail(error?.message||'FIREBASE_INIT_FAILED');}
async function passwordSignIn(login,password){
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(webConfig.apiKey)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:internalEmail(login,'staff'),password,returnSecureToken:true})
  });
  if(!response.ok)return false;
  const result=await response.json();
  return Boolean(result?.idToken);
}

let records=0,authMatches=0,claimMatches=0,hashMatches=0,signIns=0,client=null;
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
  if(record?.kind!=='user'||norm(record.authNamespace||'staff')!=='staff')continue;
  records++;
  const login=norm(record.normalizedLogin||record.loginIdentifier),hash=norm(record.passwordHashHex);
  if(!login||!/^[a-f0-9]{64}$/.test(hash))continue;
  let user;
  try{user=await auth.getUserByEmail(internalEmail(login,'staff'));}catch{continue;}
  authMatches++;
  if(!validClientClaims(user.customClaims||{}))continue;
  claimMatches++;
  for(const candidate of passwordCandidates(record,user,login)){
    if(sha256Hex(candidate)!==hash)continue;
    hashMatches++;
    if(!(await passwordSignIn(login,candidate)))continue;
    signIns++;
    client={login,password:candidate,namespace:'staff',role:norm(user.customClaims?.role),tenantId,projectIds:list(user.customClaims?.projectIds||user.customClaims?.projectId)};
    break;
  }
  if(client)break;
}

if(!client)safeFail(`HOLD_CLIENT_R${records}_A${authMatches}_C${claimMatches}_H${hashMatches}_S${signIns}`);
let existing={schemaVersion:'cxorbia.c6.e2e-private-credentials.v8'};
try{existing=JSON.parse(fs.readFileSync(outPath,'utf8'));}catch{}
existing.schemaVersion='cxorbia.c6.e2e-private-credentials.v8';
existing.client=client;
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify(existing,null,2)+'\n',{encoding:'utf8',mode:0o600});
console.log(JSON.stringify({
  decision:'PASS_C6_EXISTING_CLIENT_CREDENTIAL_SELECTION',
  clientRole:client.role,
  namespace:'staff',
  tenantId,
  projectScope:true,
  authWrites:0,
  passwordChanges:0,
  passwordResets:0,
  valuesExported:false,
  credentialsExposed:false,
  production:false
}));
