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
const crosswalkPath='app/docs/evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json';
const outPath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-users-e2e-private/private-e2e.json';
const remoteInitUrl=process.env.CXORBIA_FIREBASE_INIT_URL||'https://cxorbia-backend-dev.web.app/__/firebase/init.js';

function stageFail(message){
  const safe=String(message||'unknown').replace(/[^A-Z0-9_:-]/gi,'_').slice(0,180);
  if(process.env.OUT_DIR){
    try{fs.mkdirSync(process.env.OUT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.OUT_DIR,'stage'),'select_existing_credentials_v4__'+safe+'\n','utf8');}catch{}
  }
  throw new Error(safe);
}
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLowerCase();
const sha256Hex=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
const internalEmail=(login,namespace)=>sha256Hex(`${tenantId}\0${namespace}\0${norm(login)}`).slice(0,48)+'@auth.cxorbia.invalid';
const list=value=>Array.isArray(value)?value.map(String):(typeof value==='string'?value.split(',').map(x=>x.trim()).filter(Boolean):[]);
const uniq=values=>[...new Set(values.map(text).filter(Boolean))];
const get=(obj,dotted)=>{let cur=obj;for(const key of String(dotted||'').split('.')){if(!cur||typeof cur!=='object'||!Object.prototype.hasOwnProperty.call(cur,key))return undefined;cur=cur[key];}return cur;};
const first=(obj,paths)=>{for(const p of paths){const value=p.includes('.')?get(obj,p):obj?.[p];if(value!==undefined&&value!==null&&(!(typeof value==='string')||value.trim()!==''))return value;}return '';};
function flattenAliases(value){
  const out=[];
  const walk=current=>{
    if(current==null)return;
    if(Array.isArray(current)){current.forEach(walk);return;}
    if(typeof current==='object'){Object.values(current).forEach(walk);return;}
    const value=text(current);if(value)out.push(value);
  };
  walk(value);return uniq(out);
}
function exactTechnicalAliases(profile,docId){
  return uniq([
    docId,
    first(profile,['id','shopperId']),
    first(profile,['legacyShopperId','legacy.shopperId','legacy.id']),
    ...flattenAliases(first(profile,['canonicalLegacyIds','legacyLiveShopperIds','sourceShopperIds','hrShopperIds','identityAliases','aliases','crosswalk.aliases','identity.aliases','profile.aliases']))
  ]);
}
function validClaims(claims,namespace){
  const role=norm(claims?.role), claimNs=norm(claims?.authNamespace);
  const tenantOk=claims?.tenantId===tenantId||list(claims?.tenants).includes(tenantId)||role==='super';
  const projectOk=claims?.projectId===canonicalProjectId||list(claims?.projectIds).includes(canonicalProjectId)||role==='super';
  const namespaceOk=(claimNs||(role==='shopper'?'shopper':'staff'))===namespace;
  const roleOk=namespace==='shopper'?role==='shopper'&&text(claims?.shopperId)!=='':['super','admin','ops','coordinador'].includes(role);
  return Boolean(tenantOk&&projectOk&&namespaceOk&&roleOk);
}
function decryptEnvelope(sa,env,pub,encPriv){
  if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)stageFail('KEY_FINGERPRINT_MISMATCH');
  const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),Buffer.from(encPriv.saltBase64,'base64'),Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
  const decipherPriv=crypto.createDecipheriv('aes-256-gcm',kek,Buffer.from(encPriv.ivBase64,'base64'));
  decipherPriv.setAuthTag(Buffer.from(encPriv.tagBase64,'base64'));
  const privateDer=Buffer.concat([decipherPriv.update(Buffer.from(encPriv.ciphertextBase64,'base64')),decipherPriv.final()]);
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
  const explicit=text(profile?.firstName); if(explicit)return explicit;
  const full=text(profile?.nombre||profile?.name||profile?.displayName); return full?full.split(/\s+/)[0]:'';
}
function initialPassword(firstName){
  const value=text(firstName); return value?value.charAt(0).toUpperCase()+value.slice(1)+'123*':'';
}
function staffPasswordCandidates(record,user,login){
  const values=new Set();
  const raws=[login,record?.name,record?.nombre,record?.displayName,record?.firstName,record?.legacyName,record?.personName,user?.displayName];
  for(const raw of raws){
    const local=norm(raw).split('@')[0];
    const tokens=local.split(/[^a-záéíóúüñ]+/i).filter(Boolean);
    for(const token of tokens){
      const clean=token.replace(/\d+$/,''); if(!clean)continue;
      values.add(clean.charAt(0).toUpperCase()+clean.slice(1).toLowerCase()+'123*');
    }
  }
  return [...values];
}
function shopperPasswordCandidates(profile){
  const values=new Set();
  const exact=text(profile?.pass||profile?.password);
  if(exact)values.add(exact);
  const initial=initialPassword(firstNameOf(profile));
  if(initial)values.add(initial);
  return [...values];
}

for(const p of [credentialPath,envelopePath,publicPath,privatePath,crosswalkPath])if(!p||!fs.existsSync(p))stageFail(`REQUIRED_FILE_MISSING:${p||'undefined'}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')stageFail('WRONG_SERVICE_ACCOUNT');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(env.targetProjectId!==expectedProject||env.tenantId!==tenantId)stageFail('ENVELOPE_TARGET_MISMATCH');
const bundle=decryptEnvelope(sa,env,pub,encPriv);
if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion))stageFail('BUNDLE_CONTRACT_MISMATCH');
const crosswalk=JSON.parse(fs.readFileSync(crosswalkPath,'utf8'));
if(crosswalk.schemaVersion!=='tya.visit-identity-crosswalk.readonly.v2'||crosswalk.target?.projectId!==expectedProject||crosswalk.target?.tenantId!==tenantId)stageFail('VISIT_CROSSWALK_CONTRACT_MISMATCH');
if(crosswalk.policy?.nameMatching!==false||crosswalk.policy?.emailMatching!==false||crosswalk.policy?.phoneMatching!==false)stageFail('VISIT_CROSSWALK_UNSAFE_POLICY');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const auth=admin.auth();
const db=admin.firestore();

async function firebaseWebConfig(){
  const response=await fetch(remoteInitUrl,{headers:{'cache-control':'no-cache'}});
  if(!response.ok)stageFail(`FIREBASE_INIT_HTTP_${response.status}`);
  const source=await response.text();
  let config=null;
  const fake={apps:[],initializeApp(v){config=v;this.apps.push({});return{};},app(){return{options:config};}};
  try{vm.runInNewContext(source,{firebase:fake,window:{},self:{}},{timeout:2000});}catch{stageFail('FIREBASE_INIT_PARSE_FAILED');}
  if(!config?.apiKey||config.projectId!==expectedProject)stageFail('FIREBASE_WEB_CONFIG_MISMATCH');
  return config;
}
const webConfig=await firebaseWebConfig();
async function passwordSignIn(login,password,namespace){
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(webConfig.apiKey)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:internalEmail(login,namespace),password,returnSecureToken:true})
  });
  if(!response.ok)return false;
  const result=await response.json(); return Boolean(result?.idToken);
}

let staff=null, staffRecords=0, staffAuthMatches=0, staffPatternMatches=0;
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
  if(record?.kind!=='user'||norm(record.authNamespace||'staff')!=='staff')continue;
  staffRecords++;
  const login=norm(record.normalizedLogin||record.loginIdentifier), hash=norm(record.passwordHashHex);
  if(!login||!/^[a-f0-9]{64}$/.test(hash))continue;
  let user; try{user=await auth.getUserByEmail(internalEmail(login,'staff'));}catch{continue;}
  if(!validClaims(user.customClaims||{},'staff'))continue;
  staffAuthMatches++;
  for(const candidate of staffPasswordCandidates(record,user,login)){
    if(sha256Hex(candidate)!==hash)continue;
    staffPatternMatches++;
    if(await passwordSignIn(login,candidate,'staff')){staff={login,password:candidate,namespace:'staff',role:norm(user.customClaims?.role)};break;}
  }
  if(staff)break;
}
if(!staff)stageFail(`HOLD_STAFF_R${staffRecords}_A${staffAuthMatches}_P${staffPatternMatches}`);

const shopperSnap=await db.collection('tenants').doc(tenantId).collection('shoppers').get();
const shopperById=new Map();
const aliasToCanonical=new Map();
for(const doc of shopperSnap.docs){
  const profile=doc.data()||{};
  shopperById.set(doc.id,profile);
  for(const alias of exactTechnicalAliases(profile,doc.id)){
    if(!aliasToCanonical.has(alias))aliasToCanonical.set(alias,new Set());
    aliasToCanonical.get(alias).add(doc.id);
  }
}
const plannedToCanonical=new Map();
const canonicalVisitCounts=new Map();
for(const row of Array.isArray(crosswalk.crosswalk)?crosswalk.crosswalk:[]){
  if(row?.action!=='REUSE_EXISTING_CANONICAL_SHOPPER')continue;
  const plannedId=text(row.plannedShopperId), canonicalId=text(row.canonicalShopperId), count=Number(row.hrVisitCount||0);
  if(!plannedId||!canonicalId||!Number.isFinite(count)||count<1)stageFail('VISIT_CROSSWALK_RESOLVED_ROW_INVALID');
  const prior=plannedToCanonical.get(plannedId);
  if(prior&&prior!==canonicalId)stageFail('VISIT_CROSSWALK_PLANNED_ID_CONFLICT');
  plannedToCanonical.set(plannedId,canonicalId);
  canonicalVisitCounts.set(canonicalId,(canonicalVisitCounts.get(canonicalId)||0)+count);
}
if(canonicalVisitCounts.size<1||plannedToCanonical.size<1)stageFail('VISIT_CROSSWALK_HAS_NO_REFERENCED_CANONICAL_SHOPPERS');
if(Number(crosswalk.counts?.conflictRefs||0)!==0)stageFail('VISIT_CROSSWALK_CONFLICT_REFS_PRESENT');
if(Number(crosswalk.counts?.resolvedRefs||0)!==plannedToCanonical.size)stageFail('VISIT_CROSSWALK_RESOLVED_COUNT_MISMATCH');
const sourceReportedUniqueMatchedVisits=Number(crosswalk.counts?.visitMatchesUniqueShopper||0);
if(!Number.isFinite(sourceReportedUniqueMatchedVisits)||sourceReportedUniqueMatchedVisits<1)stageFail('VISIT_CROSSWALK_SOURCE_MATCH_COUNT_INVALID');

function canonicalCandidatesForClaim(claimShopperId){
  const candidates=new Set();
  if(canonicalVisitCounts.has(claimShopperId))candidates.add(claimShopperId);
  const planned=plannedToCanonical.get(claimShopperId);
  if(planned&&canonicalVisitCounts.has(planned))candidates.add(planned);
  const aliases=aliasToCanonical.get(claimShopperId);
  if(aliases?.size===1){
    const aliasCanonical=[...aliases][0];
    if(canonicalVisitCounts.has(aliasCanonical))candidates.add(aliasCanonical);
  }
  return candidates;
}

let shopper=null;
let shopperRecords=0, authUsersFound=0, canonicalClaimTargets=0, profileTargetsFound=0, hashMatches=0, passwordMatches=0, ambiguousTechnicalClaims=0;
let directCanonicalMatches=0, plannedCrosswalkMatches=0, profileAliasMatches=0;
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
  if(record?.kind!=='shopper')continue;
  shopperRecords++;
  const login=norm(record.normalizedLogin||record.loginIdentifier), hash=norm(record.passwordHashHex);
  if(!login||!/^[a-f0-9]{64}$/.test(hash))continue;
  let user; try{user=await auth.getUserByEmail(internalEmail(login,'shopper'));}catch{continue;}
  authUsersFound++;
  const claims=user.customClaims||{}, claimShopperId=text(claims.shopperId);
  if(!validClaims(claims,'shopper'))continue;
  const candidates=canonicalCandidatesForClaim(claimShopperId);
  if(candidates.size>1){ambiguousTechnicalClaims++;continue;}
  if(candidates.size!==1)continue;
  const canonicalShopperId=[...candidates][0];
  const expectedOwnVisits=canonicalVisitCounts.get(canonicalShopperId)||0;
  if(expectedOwnVisits<1)continue;
  canonicalClaimTargets++;
  if(claimShopperId===canonicalShopperId)directCanonicalMatches++;
  else if(plannedToCanonical.get(claimShopperId)===canonicalShopperId)plannedCrosswalkMatches++;
  else profileAliasMatches++;
  const profile=shopperById.get(canonicalShopperId);
  if(!profile)continue;
  profileTargetsFound++;
  for(const candidate of shopperPasswordCandidates(profile)){
    if(sha256Hex(candidate)!==hash)continue;
    hashMatches++;
    if(!(await passwordSignIn(login,candidate,'shopper')))continue;
    passwordMatches++;
    shopper={login,password:candidate,namespace:'shopper',role:'shopper',shopperId:claimShopperId,canonicalShopperId,expectedOwnVisits};
    break;
  }
  if(shopper)break;
}
if(!shopper)stageFail(`HOLD_SHOPPER_R${shopperRecords}_U${authUsersFound}_C${canonicalClaimTargets}_D${profileTargetsFound}_H${hashMatches}_S${passwordMatches}_X${profileAliasMatches}_A${ambiguousTechnicalClaims}`);

fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify({schemaVersion:'cxorbia.c6.e2e-private-credentials.v4',staff,shopper},null,2)+'\n',{encoding:'utf8',mode:0o600});
console.log(JSON.stringify({decision:'PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION_V4',staffRole:staff.role,shopperRole:shopper.role,shopperOwnVisits:shopper.expectedOwnVisits,staffRecordsChecked:staffRecords,shopperRecordsChecked:shopperRecords,claimResolvedThroughCrosswalk:shopper.shopperId!==shopper.canonicalShopperId,claimResolutionLane:shopper.shopperId===shopper.canonicalShopperId?'canonical':plannedToCanonical.get(shopper.shopperId)===shopper.canonicalShopperId?'planned-crosswalk':'profile-technical-alias',visitCrosswalkResolved:Number(crosswalk.counts?.resolvedRefs||0),selectedCanonicalMappedVisitCount:shopper.expectedOwnVisits,sourceReportedUniqueMatchedVisits,directCanonicalMatches,plannedCrosswalkMatches,profileAliasMatches,ambiguousTechnicalClaims,authWrites:0,passwordChanges:0,valuesExported:false}));
