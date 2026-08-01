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
const outPath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-real-users-e2e-private/private-e2e.json';
const remoteInitUrl=process.env.CXORBIA_FIREBASE_INIT_URL||'https://cxorbia-backend-dev.web.app/__/firebase/init.js';

function fail(message){
  const safe=String(message||'unknown').replace(/[^A-Z0-9_:-]/gi,'_').slice(0,150);
  if(process.env.OUT_DIR){
    try{fs.mkdirSync(process.env.OUT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.OUT_DIR,'stage'),'select_existing_credentials_v3__'+safe+'\n','utf8');}catch{}
  }
  throw new Error(safe);
}
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLowerCase();
const sha256Hex=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
const internalEmail=(login,namespace)=>sha256Hex(`${tenantId}\0${namespace}\0${norm(login)}`).slice(0,48)+'@auth.cxorbia.invalid';
const list=value=>Array.isArray(value)?value.map(String):(typeof value==='string'?value.split(',').map(x=>x.trim()).filter(Boolean):[]);
function validClaims(claims,namespace){
  const role=norm(claims?.role), claimNs=norm(claims?.authNamespace);
  const tenantOk=claims?.tenantId===tenantId||list(claims?.tenants).includes(tenantId)||role==='super';
  const projectOk=claims?.projectId===canonicalProjectId||list(claims?.projectIds).includes(canonicalProjectId)||role==='super';
  const namespaceOk=(claimNs||(role==='shopper'?'shopper':'staff'))===namespace;
  const roleOk=namespace==='shopper'?role==='shopper'&&text(claims?.shopperId)!=='':['super','admin','ops','coordinador'].includes(role);
  return Boolean(tenantOk&&projectOk&&namespaceOk&&roleOk);
}
function decryptBundle(sa,env,pub,encPriv){
  if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)fail('KEY_FINGERPRINT_MISMATCH');
  const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),Buffer.from(encPriv.saltBase64,'base64'),Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
  const privateDecipher=crypto.createDecipheriv('aes-256-gcm',kek,Buffer.from(encPriv.ivBase64,'base64'));
  privateDecipher.setAuthTag(Buffer.from(encPriv.tagBase64,'base64'));
  const privateDer=Buffer.concat([privateDecipher.update(Buffer.from(encPriv.ciphertextBase64,'base64')),privateDecipher.final()]);
  const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
  const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
  const encrypted=Buffer.from(env.ciphertextBase64,'base64');
  if(encrypted.length<17)fail('CIPHERTEXT_TOO_SHORT');
  const decipher=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));
  decipher.setAAD(Buffer.from(env.aad,'utf8'));
  decipher.setAuthTag(encrypted.subarray(encrypted.length-16));
  const plain=Buffer.concat([decipher.update(encrypted.subarray(0,encrypted.length-16)),decipher.final()]);
  const bytes=env.algorithms?.compression==='gzip'?zlib.gunzipSync(plain):plain;
  return JSON.parse(bytes.toString('utf8'));
}
function firstName(profile){
  const direct=text(profile?.firstName); if(direct)return direct;
  const full=text(profile?.nombre||profile?.name||profile?.displayName);
  return full?full.split(/\s+/)[0]:'';
}
function initialPassword(profile){
  const first=firstName(profile);
  return first?first.charAt(0).toUpperCase()+first.slice(1)+'123*':'';
}
function staffCandidates(record,user,login){
  const values=new Set();
  for(const raw of [login,record?.name,record?.nombre,record?.displayName,record?.firstName,record?.legacyName,record?.personName,user?.displayName]){
    const tokens=norm(raw).split('@')[0].split(/[^a-záéíóúüñ]+/i).filter(Boolean);
    for(const token of tokens){
      const clean=token.replace(/\d+$/,'');
      if(clean)values.add(clean.charAt(0).toUpperCase()+clean.slice(1).toLowerCase()+'123*');
    }
  }
  return [...values];
}
function shopperCandidates(profile){
  const values=new Set();
  const exact=text(profile?.pass||profile?.password);
  if(exact)values.add(exact);
  const initial=initialPassword(profile);
  if(initial)values.add(initial);
  return [...values];
}

for(const required of [credentialPath,envelopePath,publicPath,privatePath])if(!required||!fs.existsSync(required))fail(`REQUIRED_FILE_MISSING:${required||'undefined'}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('WRONG_SERVICE_ACCOUNT');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const envelope=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(envelope.targetProjectId!==expectedProject||envelope.tenantId!==tenantId)fail('ENVELOPE_TARGET_MISMATCH');
const bundle=decryptBundle(sa,envelope,pub,encPriv);
if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion))fail('BUNDLE_CONTRACT_MISMATCH');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const auth=admin.auth();
const db=admin.firestore();

async function webConfig(){
  const response=await fetch(remoteInitUrl,{headers:{'cache-control':'no-cache'}});
  if(!response.ok)fail(`FIREBASE_INIT_HTTP_${response.status}`);
  const source=await response.text();
  let config=null;
  const fake={apps:[],initializeApp(value){config=value;this.apps.push({});return{};},app(){return{options:config};}};
  try{vm.runInNewContext(source,{firebase:fake,window:{},self:{}},{timeout:2000});}catch{fail('FIREBASE_INIT_PARSE_FAILED');}
  if(!config?.apiKey||config.projectId!==expectedProject)fail('FIREBASE_WEB_CONFIG_MISMATCH');
  return config;
}
const firebaseConfig=await webConfig();
async function passwordSignIn(login,password,namespace){
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(firebaseConfig.apiKey)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:internalEmail(login,namespace),password,returnSecureToken:true})
  });
  if(!response.ok)return false;
  const result=await response.json();
  return Boolean(result?.idToken);
}

let staff=null,staffRecords=0,staffAuthMatches=0,staffHashMatches=0;
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
  if(record?.kind!=='user'||norm(record.authNamespace||'staff')!=='staff')continue;
  staffRecords++;
  const login=norm(record.normalizedLogin||record.loginIdentifier),hash=norm(record.passwordHashHex);
  if(!login||!/^[a-f0-9]{64}$/.test(hash))continue;
  let user;try{user=await auth.getUserByEmail(internalEmail(login,'staff'));}catch{continue;}
  if(!validClaims(user.customClaims||{},'staff'))continue;
  staffAuthMatches++;
  for(const candidate of staffCandidates(record,user,login)){
    if(sha256Hex(candidate)!==hash)continue;
    staffHashMatches++;
    if(await passwordSignIn(login,candidate,'staff')){staff={login,password:candidate,namespace:'staff',role:norm(user.customClaims?.role)};break;}
  }
  if(staff)break;
}
if(!staff)fail(`HOLD_STAFF_R${staffRecords}_A${staffAuthMatches}_H${staffHashMatches}`);

const visitsSnap=await db.collection('tenants').doc(tenantId).collection('projects').doc(canonicalProjectId).collection('visits').select('shopperId').get();
const visitCounts=new Map();
for(const doc of visitsSnap.docs){
  const shopperId=text(doc.data()?.shopperId);
  if(shopperId)visitCounts.set(shopperId,(visitCounts.get(shopperId)||0)+1);
}
if(visitsSnap.size<1||visitCounts.size<1)fail(`PROJECT_VISITS_EMPTY_V${visitsSnap.size}_S${visitCounts.size}`);

let shopper=null,shopperRecords=0,authUsers=0,claimHistory=0,profiles=0,hashMatches=0,signIns=0;
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
  if(record?.kind!=='shopper')continue;
  shopperRecords++;
  const login=norm(record.normalizedLogin||record.loginIdentifier),hash=norm(record.passwordHashHex);
  if(!login||!/^[a-f0-9]{64}$/.test(hash))continue;
  let user;try{user=await auth.getUserByEmail(internalEmail(login,'shopper'));}catch{continue;}
  authUsers++;
  const claims=user.customClaims||{},shopperId=text(claims.shopperId);
  if(!validClaims(claims,'shopper')||!visitCounts.has(shopperId))continue;
  claimHistory++;
  const profileDoc=await db.collection('tenants').doc(tenantId).collection('shoppers').doc(shopperId).get();
  if(!profileDoc.exists)continue;
  profiles++;
  const profile=profileDoc.data()||{};
  for(const candidate of shopperCandidates(profile)){
    if(sha256Hex(candidate)!==hash)continue;
    hashMatches++;
    if(!(await passwordSignIn(login,candidate,'shopper')))continue;
    signIns++;
    shopper={login,password:candidate,namespace:'shopper',role:'shopper',shopperId,expectedOwnVisits:visitCounts.get(shopperId)||0};
    break;
  }
  if(shopper)break;
}
if(!shopper)fail(`HOLD_SHOPPER_R${shopperRecords}_U${authUsers}_V${claimHistory}_D${profiles}_H${hashMatches}_S${signIns}_PV${visitsSnap.size}`);

fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify({schemaVersion:'cxorbia.c6.e2e-private-credentials.v5',staff,shopper},null,2)+'\n',{encoding:'utf8',mode:0o600});
console.log(JSON.stringify({decision:'PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION_V3',staffRole:staff.role,shopperRole:shopper.role,shopperOwnVisits:shopper.expectedOwnVisits,projectVisits:visitsSnap.size,projectShoppersWithHistory:visitCounts.size,authWrites:0,passwordChanges:0,valuesExported:false}));
