import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import vm from 'node:vm';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const tenantId = 'tya';
const canonicalProjectId = 'cinepolis';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath = process.env.CXORBIA_CREDENTIAL_ENVELOPE || 'backend/private-inbox/corte6-credential-bundle.enc.json';
const publicPath = 'backend/secure/corte6-credential-handoff-public.json';
const privatePath = 'backend/secure/corte6-credential-handoff-private.enc.json';
const outPath = process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS || '.tmp/c6-users-e2e/private-e2e.json';
const remoteInitUrl = process.env.CXORBIA_FIREBASE_INIT_URL || 'https://cxorbia-backend-dev.web.app/__/firebase/init.js';

function fail(message){ throw new Error(message); }
function sha256Hex(value){ return crypto.createHash('sha256').update(String(value),'utf8').digest('hex'); }
function internalEmail(login, namespace){
  const normalized = String(login || '').trim().toLowerCase();
  return sha256Hex(`${tenantId}\0${namespace}\0${normalized}`).slice(0,48) + '@auth.cxorbia.invalid';
}
function list(value){
  if(Array.isArray(value)) return value.map(String);
  if(typeof value === 'string') return value.split(',').map(x=>x.trim()).filter(Boolean);
  return [];
}
function validClaims(claims, namespace){
  const role=String(claims?.role||'').toLowerCase();
  const ns=String(claims?.authNamespace||'').toLowerCase();
  const tenantOk=claims?.tenantId===tenantId||list(claims?.tenants).includes(tenantId)||role==='super';
  const projectOk=claims?.projectId===canonicalProjectId||list(claims?.projectIds).includes(canonicalProjectId)||role==='super';
  const namespaceOk=(ns||(role==='shopper'?'shopper':'staff'))===namespace;
  const roleOk=namespace==='shopper'
    ? role==='shopper'&&typeof claims?.shopperId==='string'&&claims.shopperId.trim()
    : ['super','admin','ops','coordinador'].includes(role);
  return Boolean(tenantOk&&projectOk&&namespaceOk&&roleOk);
}

for(const p of [credentialPath,envelopePath,publicPath,privatePath]) if(!p||!fs.existsSync(p)) fail(`required_file_missing:${p||'undefined'}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string') fail('wrong_or_invalid_service_account');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(pub.projectId!==expectedProject||encPriv.projectId!==expectedProject||env.targetProjectId!==expectedProject) fail('target_mismatch');
if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256) fail('key_fingerprint_mismatch');

const salt=Buffer.from(encPriv.saltBase64,'base64');
const ivPriv=Buffer.from(encPriv.ivBase64,'base64');
const tag=Buffer.from(encPriv.tagBase64,'base64');
const ciphertextPriv=Buffer.from(encPriv.ciphertextBase64,'base64');
const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
const decipher=crypto.createDecipheriv('aes-256-gcm',kek,ivPriv); decipher.setAuthTag(tag);
const privateDer=Buffer.concat([decipher.update(ciphertextPriv),decipher.final()]);
const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
const encrypted=Buffer.from(env.ciphertextBase64,'base64');
if(encrypted.length<17) fail('ciphertext_too_short');
const authTag=encrypted.subarray(encrypted.length-16);
const ct=encrypted.subarray(0,encrypted.length-16);
const dec=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));
dec.setAAD(Buffer.from(env.aad,'utf8')); dec.setAuthTag(authTag);
const decrypted=Buffer.concat([dec.update(ct),dec.final()]);
const bundleBytes=env.algorithms?.compression==='gzip'?zlib.gunzipSync(decrypted):decrypted;
const bundle=JSON.parse(bundleBytes.toString('utf8'));
if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion)) fail('bundle_contract_mismatch');

if(!admin.apps.length) admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const auth=admin.auth();

async function firebaseWebConfig(){
  const response=await fetch(remoteInitUrl,{headers:{'cache-control':'no-cache'}});
  if(!response.ok) fail(`firebase_init_http_${response.status}`);
  const source=await response.text();
  let captured=null;
  const fakeFirebase={apps:[],initializeApp(config){captured=config;this.apps.push({});return{};},app(){return{options:captured};}};
  vm.runInNewContext(source,{firebase:fakeFirebase,window:{},self:{}},{timeout:2000});
  if(!captured?.apiKey||captured.projectId!==expectedProject) fail('firebase_web_config_mismatch');
  return captured;
}

const webConfig=await firebaseWebConfig();
async function passwordSignIn(login,password,namespace){
  const email=internalEmail(login,namespace);
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(webConfig.apiKey)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})
  });
  if(!response.ok) return false;
  const result=await response.json();
  return Boolean(result?.idToken);
}

function passwordCandidates(login){
  const local=String(login||'').trim().toLowerCase().split('@')[0];
  const tokens=local.split(/[^a-záéíóúüñ]+/i).filter(Boolean);
  const values=new Set();
  for(const token of tokens){
    const clean=token.replace(/\d+$/,'');
    if(!clean) continue;
    const cap=clean.charAt(0).toUpperCase()+clean.slice(1).toLowerCase();
    values.add(cap+'123*');
  }
  const joined=tokens.join('').replace(/\d+$/,'');
  if(joined){
    const cap=joined.charAt(0).toUpperCase()+joined.slice(1).toLowerCase();
    values.add(cap+'123*');
  }
  return [...values];
}

let staff=null;
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
  if(record?.kind!=='user'||String(record.authNamespace||'staff').toLowerCase()!=='staff') continue;
  const login=String(record.normalizedLogin||record.loginIdentifier||'').trim().toLowerCase();
  const hash=String(record.passwordHashHex||'').toLowerCase();
  if(!login||!/^[a-f0-9]{64}$/.test(hash)) continue;
  let user;
  try{ user=await auth.getUserByEmail(internalEmail(login,'staff')); }catch{ continue; }
  if(!validClaims(user.customClaims||{},'staff')) continue;
  for(const candidate of passwordCandidates(login)){
    if(sha256Hex(candidate)!==hash) continue;
    if(!(await passwordSignIn(login,candidate,'staff'))) continue;
    staff={login,password:candidate,namespace:'staff',role:String(user.customClaims?.role||'')};
    break;
  }
  if(staff) break;
}
if(!staff) fail('HOLD_NO_EXISTING_STAFF_PLAINTEXT_CREDENTIAL_MATCH');

const shopperSnap=await db.collection('tenants').doc(tenantId).collection('shoppers').get();
const visitSnap=await db.collection('tenants').doc(tenantId).collection('visits').select('shopperId','projectId','rootProjectId').get();
const visitCounts=new Map();
for(const doc of visitSnap.docs){
  const data=doc.data()||{};
  const shopperId=String(data.shopperId||'');
  if(!shopperId) continue;
  if(data.projectId&&data.projectId!==canonicalProjectId&&data.rootProjectId!==canonicalProjectId) continue;
  visitCounts.set(shopperId,(visitCounts.get(shopperId)||0)+1);
}

let shopper=null;
const shopperCandidates=[];
for(const doc of shopperSnap.docs){
  const data=doc.data()||{};
  const login=String(data.username||data.user||data.login||'').trim();
  const password=String(data.password||data.pass||'');
  if(!login||!password||(visitCounts.get(doc.id)||0)<1) continue;
  shopperCandidates.push({id:doc.id,login,password,visits:visitCounts.get(doc.id)||0});
}
shopperCandidates.sort((a,b)=>b.visits-a.visits||a.id.localeCompare(b.id));
for(const candidate of shopperCandidates){
  let user;
  try{ user=await auth.getUserByEmail(internalEmail(candidate.login,'shopper')); }catch{ continue; }
  const claims=user.customClaims||{};
  if(!validClaims(claims,'shopper')||claims.shopperId!==candidate.id) continue;
  if(!(await passwordSignIn(candidate.login,candidate.password,'shopper'))) continue;
  shopper={login:candidate.login,password:candidate.password,namespace:'shopper',role:'shopper',shopperId:candidate.id,expectedOwnVisits:candidate.visits};
  break;
}
if(!shopper) fail('HOLD_NO_EXISTING_SHOPPER_PLAINTEXT_CREDENTIAL_MATCH');

fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify({schemaVersion:'cxorbia.c6.e2e-private-credentials.v1',staff,shopper},null,2)+'\n',{encoding:'utf8',mode:0o600});
console.log(JSON.stringify({decision:'PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION',staffRole:staff.role,shopperRole:shopper.role,shopperOwnVisits:shopper.expectedOwnVisits,authWrites:0,passwordChanges:0,valuesExported:false}));
