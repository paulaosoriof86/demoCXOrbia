#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import vm from 'node:vm';
import admin from 'firebase-admin';

const root=process.cwd();
const requestPath=process.argv[2]||'backend/config/corte6-human-login-shopper-identity-audit.json';
const outDir=path.join(root,'.tmp/c6-human-login-shopper-identity-audit');
const genericDir=path.join(root,'.tmp/cxorbia-readonly-post-gates-runner');
const privateDir=path.join(root,'.tmp/c6-human-login-shopper-identity-private');
const tenantId='tya';
const projectId='cinepolis';
const expectedProject='cxorbia-backend-dev';
const saPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const encryptedPrivatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');

const text=v=>String(v??'').trim();
const norm=v=>text(v).toLowerCase();
const list=v=>Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean):(typeof v==='string'?v.split(',').map(x=>x.trim()).filter(Boolean):[]);
const sha256=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const ascii=v=>norm(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9.]+/g,'');
const fingerprint=v=>sha256(v).slice(0,16);
const safeCount=v=>Number.isFinite(Number(v))?Number(v):0;
const requiredFiles=[requestPath,saPath,envelopePath,publicPath,encryptedPrivatePath].filter(Boolean);
const blockers=[];
const checks=[];
const addBlocker=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);
const ensure=(condition,code,detail='')=>{if(!condition)addBlocker(code,detail);else checks.push(detail?`${code}:${detail}`:code);};

fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync(genericDir,{recursive:true});
fs.mkdirSync(privateDir,{recursive:true});

for(const file of requiredFiles)ensure(fs.existsSync(path.join(root,file))||fs.existsSync(file),'required_file_present',file);
if(blockers.length) finish('HOLD_C6_HUMAN_LOGIN_SHOPPER_IDENTITY_AUDIT');

const request=JSON.parse(fs.readFileSync(path.join(root,requestPath),'utf8'));
const head=process.env.GITHUB_SHA||'';
ensure(request.schemaVersion==='cxorbia.c6.human-login-shopper-identity-audit.v1','request_schema_exact');
ensure(request.repository==='paulaosoriof86/demoCXOrbia','repository_exact');
ensure(request.branch==='docs-tya-v6-v71-audit','branch_exact');
ensure(Number(request.pullRequest)===7,'pull_request_exact');
ensure(request.enabled===true&&request.consumed===false&&request.status==='authorized_execute_once','request_enabled_once');
ensure(Number(request.allowedExecutions)===1,'allowed_executions_one');
ensure(request.authorizedBy==='Paula','authorized_by_paula');
ensure(request.targetHeadSha&&request.targetHeadSha===process.env.CXORBIA_AUDIT_TARGET_HEAD,'target_head_exact');
ensure(request.providerReads===true&&request.providerWrites===false,'provider_readonly_exact');
for(const key of ['repositoryWrites','dataWrites','deploy','merge','production','firestoreWrites','authWrites','passwordChanges','passwordResets','rulesWrites','storageWrites','hrWrites','make','gemini','payments']){
  ensure(request.safeState?.[key]===false,'safe_state_false',key);
}
if(blockers.length) finish('HOLD_C6_HUMAN_LOGIN_SHOPPER_IDENTITY_AUDIT');

const sa=JSON.parse(fs.readFileSync(saPath,'utf8'));
ensure(sa.project_id===expectedProject&&typeof sa.private_key==='string','service_account_target_exact');
if(blockers.length) finish('HOLD_C6_HUMAN_LOGIN_SHOPPER_IDENTITY_AUDIT');

function decryptEnvelope(env,pub,encPriv){
  if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)throw new Error('KEY_FINGERPRINT_MISMATCH');
  const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),Buffer.from(encPriv.saltBase64,'base64'),Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
  const privateDecipher=crypto.createDecipheriv('aes-256-gcm',kek,Buffer.from(encPriv.ivBase64,'base64'));
  privateDecipher.setAuthTag(Buffer.from(encPriv.tagBase64,'base64'));
  const privateDer=Buffer.concat([privateDecipher.update(Buffer.from(encPriv.ciphertextBase64,'base64')),privateDecipher.final()]);
  const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
  const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
  const encrypted=Buffer.from(env.ciphertextBase64,'base64');
  const decipher=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));
  decipher.setAAD(Buffer.from(env.aad,'utf8'));
  decipher.setAuthTag(encrypted.subarray(encrypted.length-16));
  const plain=Buffer.concat([decipher.update(encrypted.subarray(0,encrypted.length-16)),decipher.final()]);
  return JSON.parse((env.algorithms?.compression==='gzip'?zlib.gunzipSync(plain):plain).toString('utf8'));
}

const env=JSON.parse(fs.readFileSync(path.join(root,envelopePath),'utf8'));
const pub=JSON.parse(fs.readFileSync(path.join(root,publicPath),'utf8'));
const encPriv=JSON.parse(fs.readFileSync(path.join(root,encryptedPrivatePath),'utf8'));
const bundle=decryptEnvelope(env,pub,encPriv);
ensure(['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion),'credential_bundle_contract');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const auth=admin.auth();
const db=admin.firestore();

async function firebaseWebConfig(){
  const response=await fetch(remoteRoot+'/__/firebase/init.js',{headers:{'cache-control':'no-cache'}});
  if(!response.ok)throw new Error(`FIREBASE_INIT_HTTP_${response.status}`);
  const source=await response.text();let config=null;
  const fake={apps:[],initializeApp(value){config=value;this.apps.push({});return{};},app(){return{options:config};}};
  vm.runInNewContext(source,{firebase:fake,window:{},self:{}},{timeout:2000});
  if(!config?.apiKey||config.projectId!==expectedProject)throw new Error('FIREBASE_WEB_CONFIG_MISMATCH');
  return config;
}
const webConfig=await firebaseWebConfig();

const internalEmail=(login,namespace)=>sha256(`${tenantId}\0${namespace}\0${norm(login)}`).slice(0,48)+'@auth.cxorbia.invalid';
async function passwordSignIn(login,password,namespace){
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(webConfig.apiKey)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:internalEmail(login,namespace),password,returnSecureToken:true})
  });
  return response.ok;
}
async function listAllAuthUsers(){
  const users=[];let pageToken;
  do{const page=await auth.listUsers(1000,pageToken);users.push(...page.users);pageToken=page.pageToken;}while(pageToken);
  return users;
}

const [authUsers,shopperSnap,membershipSnap]=await Promise.all([
  listAllAuthUsers(),
  db.collection('tenants').doc(tenantId).collection('shoppers').get(),
  db.collection('tenants').doc(tenantId).collection('users').get()
]);
const authByEmail=new Map(authUsers.map(user=>[norm(user.email),user]));
const profiles=new Map(shopperSnap.docs.map(doc=>[doc.id,{id:doc.id,...(doc.data()||{})}]));
const memberships=new Map(membershipSnap.docs.map(doc=>[doc.id,{id:doc.id,...(doc.data()||{})}]));
const records=Array.isArray(bundle.records)?bundle.records:[];
const shopperRecords=records.filter(record=>record?.kind==='shopper');
const loginCounts=new Map();
for(const record of shopperRecords){const login=norm(record.normalizedLogin||record.loginIdentifier);if(login)loginCounts.set(login,(loginCounts.get(login)||0)+1);}

function firstNameOf(...sources){
  for(const source of sources){
    const direct=text(source?.firstName||source?.primerNombre||source?.nombre1);if(direct)return direct.split(/\s+/)[0];
    const full=text(source?.nombre||source?.name||source?.displayName||source?.legacyName);if(full)return full.split(/\s+/)[0];
  }
  return '';
}
function surnameTokensOf(...sources){
  const tokens=[];
  for(const source of sources){
    for(const raw of [source?.lastName,source?.apellido,source?.apellidos,source?.surname,source?.familyName]){
      for(const token of text(raw).split(/\s+/).filter(Boolean))tokens.push(ascii(token));
    }
    const full=text(source?.nombre||source?.name||source?.displayName||source?.legacyName);
    if(full){const parts=full.split(/\s+/).filter(Boolean);for(const token of parts.slice(1))tokens.push(ascii(token));}
  }
  return [...new Set(tokens.filter(Boolean))];
}
function initialPassword(firstName){
  const first=text(firstName);if(!first)return '';
  return first.charAt(0).toUpperCase()+first.slice(1).toLowerCase()+'123*';
}
function claimsStatus(user){
  const c=user?.customClaims||{};
  const role=norm(c.role),ns=norm(c.authNamespace||'shopper');
  const tenant=(c.tenantId===tenantId||list(c.tenants).includes(tenantId));
  const project=(c.projectId===projectId||list(c.projectIds).includes(projectId));
  const shopperId=text(c.shopperId);
  return {role:role==='shopper',namespace:ns==='shopper',tenant,project,shopperId,valid:role==='shopper'&&ns==='shopper'&&tenant&&project&&Boolean(shopperId)};
}
function membershipStatus(user,claims){
  const doc=memberships.get(user?.uid)||null;
  if(!doc)return {exists:false,valid:false};
  const role=norm(doc.role)==='shopper';
  const namespace=norm(doc.authNamespace||'shopper')==='shopper';
  const tenant=(text(doc.tenantId)===tenantId||list(doc.tenants).includes(tenantId));
  const project=(text(doc.projectId)===projectId||list(doc.projectIds).includes(projectId));
  const status=!doc.status||norm(doc.status)==='active';
  const shopperId=!text(doc.shopperId)||text(doc.shopperId)===claims.shopperId;
  const identity=(!text(doc.uid)||text(doc.uid)===user.uid)&&(!text(doc.userId)||text(doc.userId)===user.uid);
  return {exists:true,valid:role&&namespace&&tenant&&project&&status&&shopperId&&identity};
}
function paulaMarker(...sources){
  const value=sources.map(source=>[
    source?.normalizedLogin,source?.loginIdentifier,source?.firstName,source?.lastName,source?.nombre,source?.name,source?.displayName,source?.legacyName
  ].map(text).join(' ')).join(' ').toLowerCase();
  return value.includes('paula')&&(value.includes('osorio')||value.includes('paula.'));
}

const rows=[];
const mappedProfiles=new Set();
for(const record of shopperRecords){
  const login=norm(record.normalizedLogin||record.loginIdentifier);
  const loginUnique=Boolean(login)&&loginCounts.get(login)===1;
  const user=login?authByEmail.get(norm(internalEmail(login,'shopper'))):null;
  const claims=user?claimsStatus(user):{role:false,namespace:false,tenant:false,project:false,shopperId:'',valid:false};
  const profile=claims.shopperId?profiles.get(claims.shopperId):null;
  if(profile)mappedProfiles.add(profile.id);
  const membership=user?membershipStatus(user,claims):{exists:false,valid:false};
  const firstName=firstNameOf(profile,record);
  const surnames=surnameTokensOf(profile,record);
  const parts=ascii(login).split('.').filter(Boolean);
  const loginPattern=parts.length===2&&parts[0]===ascii(firstName)&&surnames.includes(parts[1]);
  const patternPassword=initialPassword(firstName);
  const hash=norm(record.passwordHashHex);
  const patternHashMatch=Boolean(patternPassword)&&/^[a-f0-9]{64}$/.test(hash)&&sha256(patternPassword)===hash;
  const exactPassword=text(profile?.pass||profile?.password);
  const exactHashMatch=Boolean(exactPassword)&&/^[a-f0-9]{64}$/.test(hash)&&sha256(exactPassword)===hash;
  let passwordSignInCompatible=false;
  if(user&&login&&(patternHashMatch||exactHashMatch)){
    passwordSignInCompatible=await passwordSignIn(login,patternHashMatch?patternPassword:exactPassword,'shopper');
  }
  const fullReady=loginUnique&&Boolean(user)&&claims.valid&&Boolean(profile)&&membership.valid&&passwordSignInCompatible;
  rows.push({
    fp:fingerprint(`${login}\0${claims.shopperId||''}`),
    loginUnique,authUser:Boolean(user),claimsValid:claims.valid,membershipExists:membership.exists,membershipValid:membership.valid,
    projectValid:claims.project,profileExists:Boolean(profile),loginPattern,passwordPattern:patternHashMatch,passwordCompatible:passwordSignInCompatible,
    exactPasswordException:!patternHashMatch&&exactHashMatch,fullReady,paula:paulaMarker(record,profile)
  });
}

const paulaStaffRows=[];
for(const record of records.filter(record=>record?.kind==='user'&&paulaMarker(record))){
  const login=norm(record.normalizedLogin||record.loginIdentifier);
  const namespace=norm(record.authNamespace||'staff')||'staff';
  const user=login?authByEmail.get(norm(internalEmail(login,namespace))):null;
  const claims=user?.customClaims||{};
  const role=norm(claims.role);
  const claimsValid=Boolean(user)&&['super','admin','ops','coordinador'].includes(role)&&
    (role==='super'||claims.tenantId===tenantId||list(claims.tenants).includes(tenantId));
  const membership=user?memberships.get(user.uid)||null:null;
  const membershipValid=Boolean(membership)&&(!membership.status||norm(membership.status)==='active')&&
    (text(membership.tenantId)===tenantId||list(membership.tenants).includes(tenantId));
  const first=firstNameOf(record,user);
  const candidate=initialPassword(first);
  const hash=norm(record.passwordHashHex);
  const patternHashMatch=Boolean(candidate)&&/^[a-f0-9]{64}$/.test(hash)&&sha256(candidate)===hash;
  const passwordCompatible=Boolean(user)&&patternHashMatch?await passwordSignIn(login,candidate,namespace):false;
  paulaStaffRows.push({authUser:Boolean(user),claimsValid,membershipValid,passwordPattern:patternHashMatch,passwordCompatible,fullReady:Boolean(user)&&claimsValid&&membershipValid&&passwordCompatible});
}

const count=key=>rows.filter(row=>row[key]===true).length;
const exceptions={
  duplicateLogin:rows.filter(row=>!row.loginUnique).map(row=>row.fp),
  missingAuth:rows.filter(row=>!row.authUser).map(row=>row.fp),
  invalidClaims:rows.filter(row=>row.authUser&&!row.claimsValid).map(row=>row.fp),
  missingMembership:rows.filter(row=>!row.membershipExists).map(row=>row.fp),
  invalidMembership:rows.filter(row=>row.membershipExists&&!row.membershipValid).map(row=>row.fp),
  missingProfile:rows.filter(row=>!row.profileExists).map(row=>row.fp),
  loginPatternException:rows.filter(row=>!row.loginPattern).map(row=>row.fp),
  passwordPatternException:rows.filter(row=>!row.passwordPattern).map(row=>row.fp),
  passwordNotCompatible:rows.filter(row=>!row.passwordCompatible).map(row=>row.fp),
  notFullyReady:rows.filter(row=>!row.fullReady).map(row=>row.fp)
};
const paulaShopperRows=rows.filter(row=>row.paula);
const paulaRows=[...paulaStaffRows,...paulaShopperRows];
const paulaIdentity={
  candidates:paulaRows.length,
  staffCandidates:paulaStaffRows.length,
  shopperCandidates:paulaShopperRows.length,
  authUsers:paulaRows.filter(row=>row.authUser).length,
  claimsValid:paulaRows.filter(row=>row.claimsValid).length,
  membershipsValid:paulaRows.filter(row=>row.membershipValid).length,
  passwordPatternCompatible:paulaRows.filter(row=>row.passwordPattern).length,
  passwordSignInCompatible:paulaRows.filter(row=>row.passwordCompatible).length,
  fullReady:paulaRows.filter(row=>row.fullReady).length,
  ambiguous:paulaRows.length!==1
};

const summary={
  schemaVersion:'cxorbia.c6.human-login-shopper-identity-audit.result.v1',
  generatedAt:new Date().toISOString(),
  decision:'PASS_C6_HUMAN_LOGIN_SHOPPER_IDENTITY_AUDIT_WITH_FINDINGS',
  source:{tenantId,projectId,firestoreProfiles:profiles.size,firestoreMemberships:memberships.size,authUsersTotal:authUsers.length,credentialShopperRecords:shopperRecords.length},
  shopperMatrix:{
    records:rows.length,uniqueLogin:count('loginUnique'),authUser:count('authUser'),claimsValid:count('claimsValid'),membershipExists:count('membershipExists'),
    membershipValid:count('membershipValid'),projectValid:count('projectValid'),profileExists:count('profileExists'),mappedProfiles:mappedProfiles.size,
    profilesWithoutCredentialMapping:Math.max(0,profiles.size-mappedProfiles.size),nameDotSurnamePattern:count('loginPattern'),
    nombre123PatternHash:count('passwordPattern'),passwordSignInCompatible:count('passwordCompatible'),exactPasswordExceptions:count('exactPasswordException'),fullyReady:count('fullReady')
  },
  exceptionCounts:Object.fromEntries(Object.entries(exceptions).map(([key,value])=>[key,value.length])),
  exceptionFingerprints:exceptions,
  paulaIdentity,
  safety:{providerReads:true,providerWrites:false,repositoryWrites:false,dataWrites:false,authWrites:0,passwordChanges:0,passwordResets:0,firestoreWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,deploy:false,merge:false,production:false,credentialsExposed:false,passwordsExported:false,rawLoginsExported:false,rawNamesExported:false}
};
checks.push('SHOPPER_MATRIX_COMPLETE_SOURCE_SAFE','PAULA_IDENTITY_INCLUDED_SOURCE_SAFE','PASSWORD_VALUES_NOT_EXPORTED','PROVIDER_READONLY');
finish('PASS_READONLY_POST_GATES',summary);

function finish(status,summaryValue=null){
  const report={
    schemaVersion:'cxorbia.readonly-post-gates-report.v1',runner:'CXORBIA_READONLY_POST_GATES_RUNNER',generatedAt:new Date().toISOString(),
    status,requestId:request?.requestId||null,requestCommitSha:head||null,targetHeadSha:request?.targetHeadSha||null,
    profile:'C6_HUMAN_LOGIN_SHOPPER_IDENTITY_AUDIT',checks,blockers,summary:summaryValue,
    safeState:{repositoryWrites:false,dataWrites:false,deploy:false,merge:false,production:false,imports:false,payments:false,make:false,gemini:false,firestoreWrites:false,authWrites:false,storageWrites:false,hrWrites:false}
  };
  fs.writeFileSync(path.join(genericDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(summaryValue||report,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.md'),[
    '# C6 Human Login + Shopper Identity Audit','',`Decision: **${summaryValue?.decision||status}**`,'',
    'Source-safe aggregate only. No raw login, name, password, token, email or UID is exported.','',
    `Blockers: ${blockers.length}`
  ].join('\n')+'\n','utf8');
  try{fs.rmSync(privateDir,{recursive:true,force:true});}catch{}
  if(status!=='PASS_READONLY_POST_GATES')process.exit(1);
}
