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
const liveUrl=process.env.CXORBIA_LIVE_HR_URL||remoteRoot+'/api/tya/cinepolis/hr-live?view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&fresh=1';

function stageFail(message){
  const safe=String(message||'unknown').replace(/[^A-Z0-9_:-]/gi,'_').slice(0,180);
  if(process.env.OUT_DIR){
    try{fs.mkdirSync(process.env.OUT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.OUT_DIR,'stage'),'select_existing_credentials_v6__'+safe+'\n','utf8');}catch{}
  }
  throw new Error(safe);
}
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLowerCase();
const sha256Hex=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
const internalEmail=(login,namespace)=>sha256Hex(`${tenantId}\0${namespace}\0${norm(login)}`).slice(0,48)+'@auth.cxorbia.invalid';
const list=value=>Array.isArray(value)?value.map(String):(typeof value==='string'?value.split(',').map(x=>x.trim()).filter(Boolean):[]);
const sourceCoord=v=>{const tab=text(v?.sourceTab),row=text(v?.sourceRow);return tab&&row?`${tab}::${row}`:'';};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function validClaims(claims,namespace){
  const role=norm(claims?.role),claimNs=norm(claims?.authNamespace);
  const tenantOk=claims?.tenantId===tenantId||list(claims?.tenants).includes(tenantId)||role==='super';
  const projectOk=claims?.projectId===canonicalProjectId||list(claims?.projectIds).includes(canonicalProjectId)||role==='super';
  const namespaceOk=(claimNs||(role==='shopper'?'shopper':'staff'))===namespace;
  const roleOk=namespace==='shopper'?role==='shopper'&&text(claims?.shopperId)!=='':['super','admin','ops','coordinador'].includes(role);
  return Boolean(tenantOk&&projectOk&&namespaceOk&&roleOk);
}
function decryptEnvelope(sa,env,pub,encPriv){
  if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)stageFail('KEY_FINGERPRINT_MISMATCH');
  const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),Buffer.from(encPriv.saltBase64,'base64'),Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
  const privateDecipher=crypto.createDecipheriv('aes-256-gcm',kek,Buffer.from(encPriv.ivBase64,'base64'));
  privateDecipher.setAuthTag(Buffer.from(encPriv.tagBase64,'base64'));
  const privateDer=Buffer.concat([privateDecipher.update(Buffer.from(encPriv.ciphertextBase64,'base64')),privateDecipher.final()]);
  const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
  const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
  const encrypted=Buffer.from(env.ciphertextBase64,'base64');
  if(encrypted.length<17)stageFail('CIPHERTEXT_TOO_SHORT');
  const decipher=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));
  decipher.setAAD(Buffer.from(env.aad,'utf8'));
  decipher.setAuthTag(encrypted.subarray(encrypted.length-16));
  const plain=Buffer.concat([decipher.update(encrypted.subarray(0,encrypted.length-16)),decipher.final()]);
  return JSON.parse((env.algorithms?.compression==='gzip'?zlib.gunzipSync(plain):plain).toString('utf8'));
}
function firstNameOf(profile){
  const direct=text(profile?.firstName);if(direct)return direct;
  const full=text(profile?.nombre||profile?.name||profile?.displayName);return full?full.split(/\s+/)[0]:'';
}
function initialPassword(profile){const first=firstNameOf(profile);return first?first.charAt(0).toUpperCase()+first.slice(1)+'123*':'';}
function staffPasswordCandidates(record,user,login){
  const values=new Set();
  for(const raw of [login,record?.name,record?.nombre,record?.displayName,record?.firstName,record?.legacyName,record?.personName,user?.displayName]){
    const tokens=norm(raw).split('@')[0].split(/[^a-záéíóúüñ]+/i).filter(Boolean);
    for(const token of tokens){const clean=token.replace(/\d+$/,'');if(clean)values.add(clean.charAt(0).toUpperCase()+clean.slice(1).toLowerCase()+'123*');}
  }
  return [...values];
}
function shopperPasswordCandidates(profile){
  const values=new Set();
  const exact=text(profile?.pass||profile?.password);if(exact)values.add(exact);
  const initial=initialPassword(profile);if(initial)values.add(initial);
  return [...values];
}
function uniqueIndex(rows,keyFn){
  const map=new Map();
  for(const row of rows){const key=text(keyFn(row));if(!key)continue;if(!map.has(key))map.set(key,[]);map.get(key).push(row);}
  return map;
}
const onlyUnique=(map,key)=>{const rows=map.get(text(key))||[];return rows.length===1?rows[0]:null;};
function exactProtectedVisit(base,indexes){
  const candidates=[];
  const add=value=>{if(value&&!candidates.includes(value))candidates.push(value);};
  add(onlyUnique(indexes.hrRow,base?.hrRowId));
  add(onlyUnique(indexes.coord,sourceCoord(base)));
  add(onlyUnique(indexes.id,base?.visitId||base?.id));
  if(candidates.length===1)return {row:candidates[0],conflict:false};
  if(candidates.length>1){
    const ids=new Set(candidates.map(v=>text(v?.visitId||v?.id)||text(v?.hrRowId)||sourceCoord(v)));
    return ids.size===1?{row:candidates[0],conflict:false}:{row:null,conflict:true};
  }
  return {row:null,conflict:false};
}

for(const p of [credentialPath,envelopePath,publicPath,privatePath])if(!p||!fs.existsSync(p))stageFail(`REQUIRED_FILE_MISSING:${p||'undefined'}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')stageFail('WRONG_SERVICE_ACCOUNT');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(env.targetProjectId!==expectedProject||env.tenantId!==tenantId)stageFail('ENVELOPE_TARGET_MISMATCH');
const bundle=decryptEnvelope(sa,env,pub,encPriv);
if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion))stageFail('BUNDLE_CONTRACT_MISMATCH');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const auth=admin.auth();
const db=admin.firestore();

async function firebaseWebConfig(){
  const response=await fetch(remoteInitUrl,{headers:{'cache-control':'no-cache'}});
  if(!response.ok)stageFail(`FIREBASE_INIT_HTTP_${response.status}`);
  const source=await response.text();let config=null;
  const fake={apps:[],initializeApp(value){config=value;this.apps.push({});return{};},app(){return{options:config};}};
  try{vm.runInNewContext(source,{firebase:fake,window:{},self:{}},{timeout:2000});}catch{stageFail('FIREBASE_INIT_PARSE_FAILED');}
  if(!config?.apiKey||config.projectId!==expectedProject)stageFail('FIREBASE_WEB_CONFIG_MISMATCH');
  return config;
}
const webConfig=await firebaseWebConfig();
async function passwordSignIn(login,password,namespace){
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(webConfig.apiKey)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:internalEmail(login,namespace),password,returnSecureToken:true})});
  if(!response.ok)return false;
  const result=await response.json();return Boolean(result?.idToken);
}
async function fetchLiveHrWithRetry(){
  const maxAttempts=Number(process.env.CXORBIA_LIVE_HR_RETRY_ATTEMPTS||6);
  let lastStatus=0;
  for(let attempt=1;attempt<=maxAttempts;attempt++){
    try{
      const response=await fetch(liveUrl,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});
      lastStatus=response.status;
      if(response.ok)return response;
      if(response.status<500&&response.status!==429)stageFail(`LIVE_HR_HTTP_${response.status}`);
    }catch(error){
      lastStatus=0;
      if(attempt===maxAttempts)stageFail(`LIVE_HR_FETCH_${String(error?.message||error).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,80)}`);
    }
    if(attempt<maxAttempts)await sleep(Math.min(10000,1500*attempt));
  }
  stageFail(`LIVE_HR_HTTP_${lastStatus||'UNAVAILABLE'}_AFTER_${maxAttempts}_ATTEMPTS`);
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
  for(const candidate of staffPasswordCandidates(record,user,login)){
    if(sha256Hex(candidate)!==hash)continue;
    staffHashMatches++;
    if(await passwordSignIn(login,candidate,'staff')){staff={login,password:candidate,namespace:'staff',role:norm(user.customClaims?.role)};break;}
  }
  if(staff)break;
}
if(!staff)stageFail(`HOLD_STAFF_R${staffRecords}_A${staffAuthMatches}_H${staffHashMatches}`);

const liveResponse=await fetchLiveHrWithRetry();
const liveJson=await liveResponse.json();
const liveSnapshot=liveJson?.snapshot||liveJson?.data||liveJson;
const baseVisits=Array.isArray(liveSnapshot?.visits)?liveSnapshot.visits:[];
if(baseVisits.length!==616)stageFail(`LIVE_HR_VISITS_MISMATCH_${baseVisits.length}`);

const protectedSnap=await db.collection('tenants').doc(tenantId).collection('projects').doc(canonicalProjectId).collection('visits').get();
const protectedVisits=protectedSnap.docs.map(doc=>({id:doc.id,...(doc.data()||{})}));
if(protectedVisits.length<1)stageFail('PROTECTED_VISITS_EMPTY');
const indexes={
  id:uniqueIndex(protectedVisits,v=>v?.visitId||v?.id),
  hrRow:uniqueIndex(protectedVisits,v=>v?.hrRowId),
  coord:uniqueIndex(protectedVisits,sourceCoord)
};
const relation=new Map();
let exactVisitMatches=0,visitConflicts=0;
for(const base of baseVisits){
  const match=exactProtectedVisit(base,indexes);
  if(match.conflict){visitConflicts++;continue;}
  if(!match.row)continue;
  exactVisitMatches++;
  const liveShopperId=text(base?.shopperId),protectedShopperId=text(match.row?.shopperId);
  if(!liveShopperId||!protectedShopperId)continue;
  if(!relation.has(liveShopperId))relation.set(liveShopperId,new Set());
  relation.get(liveShopperId).add(protectedShopperId);
}
const uniqueLiveToProtected=new Map();
let identityConflicts=0;
for(const [liveShopperId,targets] of relation){
  if(targets.size===1)uniqueLiveToProtected.set(liveShopperId,[...targets][0]);
  else identityConflicts++;
}
const protectedHistoryCounts=new Map();
for(const base of baseVisits){
  const liveShopperId=text(base?.shopperId),protectedShopperId=uniqueLiveToProtected.get(liveShopperId);
  if(!protectedShopperId)continue;
  protectedHistoryCounts.set(protectedShopperId,(protectedHistoryCounts.get(protectedShopperId)||0)+1);
}
if(exactVisitMatches<1||uniqueLiveToProtected.size<1||protectedHistoryCounts.size<1)stageFail(`PROTECTED_VISIT_RELATION_EMPTY_M${exactVisitMatches}_L${uniqueLiveToProtected.size}_P${protectedHistoryCounts.size}`);
if(identityConflicts>0||visitConflicts>0)stageFail(`PROTECTED_VISIT_RELATION_CONFLICT_V${visitConflicts}_I${identityConflicts}`);

const shopperSnap=await db.collection('tenants').doc(tenantId).collection('shoppers').get();
const shopperById=new Map(shopperSnap.docs.map(doc=>[doc.id,doc.data()||{}]));
let shopper=null;
let shopperRecords=0,authUsers=0,claimHistory=0,profiles=0,hashMatches=0,signIns=0;
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
  if(record?.kind!=='shopper')continue;
  shopperRecords++;
  const login=norm(record.normalizedLogin||record.loginIdentifier),hash=norm(record.passwordHashHex);
  if(!login||!/^[a-f0-9]{64}$/.test(hash))continue;
  let user;try{user=await auth.getUserByEmail(internalEmail(login,'shopper'));}catch{continue;}
  authUsers++;
  const claims=user.customClaims||{},shopperId=text(claims.shopperId);
  if(!validClaims(claims,'shopper')||!protectedHistoryCounts.has(shopperId))continue;
  claimHistory++;
  const profile=shopperById.get(shopperId);if(!profile)continue;
  profiles++;
  for(const candidate of shopperPasswordCandidates(profile)){
    if(sha256Hex(candidate)!==hash)continue;
    hashMatches++;
    if(!(await passwordSignIn(login,candidate,'shopper')))continue;
    signIns++;
    shopper={login,password:candidate,namespace:'shopper',role:'shopper',shopperId,canonicalShopperId:shopperId,expectedOwnVisits:protectedHistoryCounts.get(shopperId)||0};
    break;
  }
  if(shopper)break;
}
if(!shopper)stageFail(`HOLD_SHOPPER_R${shopperRecords}_U${authUsers}_V${claimHistory}_D${profiles}_H${hashMatches}_S${signIns}_M${exactVisitMatches}_L${uniqueLiveToProtected.size}_P${protectedHistoryCounts.size}`);

fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify({schemaVersion:'cxorbia.c6.e2e-private-credentials.v7',staff,shopper},null,2)+'\n',{encoding:'utf8',mode:0o600});
console.log(JSON.stringify({decision:'PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION_V6',staffRole:staff.role,shopperRole:shopper.role,shopperOwnVisits:shopper.expectedOwnVisits,liveVisits:baseVisits.length,protectedVisits:protectedVisits.length,exactVisitMatches,liveShopperRelations:uniqueLiveToProtected.size,protectedShoppersWithHistory:protectedHistoryCounts.size,authWrites:0,passwordChanges:0,valuesExported:false}));
