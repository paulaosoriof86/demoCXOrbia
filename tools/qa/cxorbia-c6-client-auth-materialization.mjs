import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import admin from 'firebase-admin';

const mode=String(process.argv.find(x=>x.startsWith('--mode='))||'--mode=snapshot').split('=')[1];
const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId='tya';
const projectId='cinepolis';
const role='cliente';
const authNamespace='staff';
const login='cinepolis.cliente';
const uid='cxorbia-c6-client-tya-cinepolis-v1';
const managedBy='cxorbia-c6-client-auth-materialization-v1';
const displayName='Portal Cliente Cinépolis · CXOrbia DEV';
const snapshotPath=process.env.CXORBIA_CLIENT_AUTH_PRIVATE_SNAPSHOT||'.tmp/c6-client-auth-materialization/private-snapshot.json';
const privateCredentialPath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-client-auth-materialization/private-e2e.json';
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const saPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;

const text=v=>String(v??'').trim();
const list=v=>Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean):(typeof v==='string'?v.split(',').map(x=>x.trim()).filter(Boolean):[]);
const sha256=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const stable=value=>JSON.stringify(value,Object.keys(value||{}).sort());
const targetFingerprint=sha256(`${uid}\0${tenantId}\0${authNamespace}\0${login}`);
const internalEmail=sha256(`${tenantId}\0${authNamespace}\0${login.toLowerCase()}`).slice(0,48)+'@auth.cxorbia.invalid';
const requiredClaims={
  role,
  authNamespace,
  tenantId,
  tenants:[tenantId],
  projectId,
  projectIds:[projectId],
  clientId:projectId,
  managedBy,
  credentialVersion:1
};

function fail(code,detail={}){
  const err=new Error(code);
  err.code=code;
  err.detail=detail;
  throw err;
}
function output(payload){
  console.log(JSON.stringify({
    ...payload,
    targetFingerprint,
    tenantId,
    projectId,
    role,
    authNamespace,
    credentialsExposed:false,
    tokensExposed:false,
    firestoreWrites:0,
    hrWrites:0,
    rulesDeploys:0,
    storageWrites:0,
    hostingDeploys:0,
    cloudRunDeploys:0,
    makeWrites:0,
    geminiCalls:0,
    paymentsWrites:0,
    merge:false,
    production:false
  }));
}
function claimsExact(claims={}){
  return claims.role===role&&claims.authNamespace===authNamespace&&claims.tenantId===tenantId&&
    claims.projectId===projectId&&claims.clientId===projectId&&claims.managedBy===managedBy&&
    Number(claims.credentialVersion)===1&&
    JSON.stringify(list(claims.tenants).sort())===JSON.stringify([tenantId])&&
    JSON.stringify(list(claims.projectIds).sort())===JSON.stringify([projectId]);
}
function clientScopeValid(claims={}){
  const r=text(claims.role).toLowerCase();
  return ['cliente','client'].includes(r)&&text(claims.authNamespace).toLowerCase()==='staff'&&
    (claims.tenantId===tenantId||list(claims.tenants).includes(tenantId))&&
    (claims.projectId===projectId||list(claims.projectIds).includes(projectId));
}
function publicUser(user){
  if(!user)return null;
  return {
    uidFingerprint:sha256(user.uid),
    emailFingerprint:sha256(user.email||''),
    disabled:Boolean(user.disabled),
    displayNameMatches:user.displayName===displayName,
    claimsExact:claimsExact(user.customClaims||{}),
    claimsDigest:sha256(stable(user.customClaims||{})),
    creationTime:user.metadata?.creationTime||null,
    lastSignInTime:user.metadata?.lastSignInTime||null
  };
}
function derivePassword(sa){
  const raw=crypto.createHmac('sha256',Buffer.from(sa.private_key,'utf8'))
    .update(`cxorbia-c6-client-password-v1\0${tenantId}\0${projectId}\0${login}`,'utf8')
    .digest('base64url');
  return `Cx!${raw.slice(0,29)}9a`;
}
async function getTarget(auth){
  let byUid=null,byEmail=null;
  try{byUid=await auth.getUser(uid);}catch(e){if(e.code!=='auth/user-not-found')throw e;}
  try{byEmail=await auth.getUserByEmail(internalEmail);}catch(e){if(e.code!=='auth/user-not-found')throw e;}
  if(byUid&&byEmail&&byUid.uid!==byEmail.uid)fail('TARGET_UID_EMAIL_COLLISION');
  const user=byUid||byEmail||null;
  if(user&&(user.uid!==uid||user.email!==internalEmail))fail('TARGET_IDENTITY_COLLISION');
  return user;
}
async function listClientScope(auth){
  const rows=[];
  let pageToken;
  do{
    const page=await auth.listUsers(1000,pageToken);
    for(const user of page.users){
      if(clientScopeValid(user.customClaims||{}))rows.push({uidFingerprint:sha256(user.uid),claimsDigest:sha256(stable(user.customClaims||{})),disabled:Boolean(user.disabled)});
    }
    pageToken=page.pageToken;
  }while(pageToken);
  rows.sort((a,b)=>a.uidFingerprint.localeCompare(b.uidFingerprint));
  return {count:rows.length,digest:sha256(JSON.stringify(rows))};
}
async function firebaseWebConfig(){
  const response=await fetch(remoteRoot+'/__/firebase/init.js',{headers:{'cache-control':'no-cache'}});
  if(!response.ok)fail('FIREBASE_INIT_HTTP_'+response.status);
  const source=await response.text();
  let config=null;
  const fake={apps:[],initializeApp(value){config=value;this.apps.push({});return{};},app(){return{options:config};}};
  try{vm.runInNewContext(source,{firebase:fake,window:{},self:{}},{timeout:2000});}catch{fail('FIREBASE_INIT_PARSE_FAILED');}
  if(!config?.apiKey||config.projectId!==expectedProject)fail('FIREBASE_WEB_CONFIG_MISMATCH');
  return config;
}
async function passwordSignIn(password){
  const cfg=await firebaseWebConfig();
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(cfg.apiKey)}`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:internalEmail,password,returnSecureToken:true})
  });
  if(!response.ok)return false;
  const body=await response.json();
  return Boolean(body?.idToken);
}

if(!saPath||!fs.existsSync(saPath))fail('SERVICE_ACCOUNT_REQUIRED');
const sa=JSON.parse(fs.readFileSync(saPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('WRONG_SERVICE_ACCOUNT');
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const auth=admin.auth();
const password=derivePassword(sa);

if(mode==='snapshot'){
  const target=await getTarget(auth);
  if(target&&(!claimsExact(target.customClaims||{})||target.displayName!==displayName))fail('RESERVED_TARGET_ALREADY_OCCUPIED');
  const scope=await listClientScope(auth);
  const privateSnapshot={
    schemaVersion:'cxorbia.c6.client-auth-private-snapshot.v1',
    generatedAt:new Date().toISOString(),
    targetFingerprint,
    targetExisted:Boolean(target),
    target:target?{
      uid:target.uid,
      email:target.email,
      displayName:target.displayName||null,
      disabled:Boolean(target.disabled),
      customClaims:target.customClaims||{},
      creationTime:target.metadata?.creationTime||null,
      lastSignInTime:target.metadata?.lastSignInTime||null
    }:null,
    clientScopeBefore:scope
  };
  fs.mkdirSync(path.dirname(snapshotPath),{recursive:true});
  fs.writeFileSync(snapshotPath,JSON.stringify(privateSnapshot,null,2)+'\n',{encoding:'utf8',mode:0o600});
  output({
    schemaVersion:'cxorbia.c6.client-auth-snapshot.v1',
    decision:'PASS_C6_CLIENT_AUTH_PREWRITE_SNAPSHOT',
    targetExisted:Boolean(target),
    target:publicUser(target),
    clientScopeBefore:scope,
    authWrites:0,
    credentialCreates:0,
    passwordChanges:0,
    passwordResets:0
  });
  process.exit(0);
}

if(!fs.existsSync(snapshotPath))fail('PRIVATE_SNAPSHOT_REQUIRED');
const snapshot=JSON.parse(fs.readFileSync(snapshotPath,'utf8'));
if(snapshot.targetFingerprint!==targetFingerprint)fail('SNAPSHOT_TARGET_MISMATCH');

if(mode==='apply'){
  let target=await getTarget(auth);
  let authWrites=0,credentialCreates=0,claimsWrites=0;
  if(!target){
    if(snapshot.targetExisted)fail('PREVIOUS_TARGET_DISAPPEARED');
    target=await auth.createUser({uid,email:internalEmail,password,displayName,disabled:false,emailVerified:false});
    authWrites++;credentialCreates++;
    await auth.setCustomUserClaims(uid,requiredClaims);
    authWrites++;claimsWrites++;
    target=await auth.getUser(uid);
  }else{
    if(!claimsExact(target.customClaims||{})||target.displayName!==displayName||target.disabled)fail('EXISTING_TARGET_NOT_EXACT_IDEMPOTENT_STATE');
  }
  const signIn=await passwordSignIn(password);
  if(!signIn)fail('CLIENT_PASSWORD_SIGNIN_FAILED_AFTER_APPLY');
  output({
    schemaVersion:'cxorbia.c6.client-auth-apply.v1',
    decision:authWrites===0?'PASS_C6_CLIENT_AUTH_IDEMPOTENT_NOOP':'PASS_C6_CLIENT_AUTH_MATERIALIZED',
    target:publicUser(target),
    passwordSignIn:true,
    authWrites,
    credentialCreates,
    claimsWrites,
    passwordChanges:0,
    passwordResets:0
  });
  process.exit(0);
}

if(mode==='readback'){
  const target=await getTarget(auth);
  if(!target||!claimsExact(target.customClaims||{})||target.displayName!==displayName||target.disabled)fail('CLIENT_AUTH_READBACK_MISMATCH');
  const signIn=await passwordSignIn(password);
  if(!signIn)fail('CLIENT_AUTH_READBACK_SIGNIN_FAILED');
  const scope=await listClientScope(auth);
  const expectedCount=Number(snapshot.clientScopeBefore?.count||0)+(snapshot.targetExisted?0:1);
  if(scope.count!==expectedCount)fail('CLIENT_SCOPE_COUNT_MISMATCH',{observed:scope.count,expected:expectedCount});
  fs.mkdirSync(path.dirname(privateCredentialPath),{recursive:true});
  fs.writeFileSync(privateCredentialPath,JSON.stringify({
    schemaVersion:'cxorbia.c6.e2e-private-credentials.v9',
    client:{login,password,namespace:authNamespace,role,tenantId,projectIds:[projectId]}
  },null,2)+'\n',{encoding:'utf8',mode:0o600});
  output({
    schemaVersion:'cxorbia.c6.client-auth-readback.v1',
    decision:'PASS_C6_CLIENT_AUTH_READBACK',
    target:publicUser(target),
    passwordSignIn:true,
    clientScopeAfter:scope,
    expectedClientScopeCount:expectedCount,
    authWrites:0,
    credentialCreates:0,
    passwordChanges:0,
    passwordResets:0
  });
  process.exit(0);
}

if(mode==='rollback-dry-run'){
  const current=await getTarget(auth);
  let action='none';
  if(!snapshot.targetExisted){
    if(!current)action='already_absent';
    else{
      if(!claimsExact(current.customClaims||{})||current.displayName!==displayName)fail('ROLLBACK_TARGET_NOT_MANAGED');
      action='delete_created_user';
    }
  }else{
    if(!current||current.uid!==snapshot.target.uid)fail('ROLLBACK_EXISTING_TARGET_MISSING');
    action='preserve_preexisting_exact_user';
  }
  output({
    schemaVersion:'cxorbia.c6.client-auth-rollback-plan.v1',
    decision:'PASS_C6_CLIENT_AUTH_ROLLBACK_EXACT_DRY_RUN',
    action,
    preStateTargetExisted:Boolean(snapshot.targetExisted),
    currentTargetExists:Boolean(current),
    canRollbackExactly:true,
    authWrites:0,
    credentialCreates:0,
    passwordChanges:0,
    passwordResets:0
  });
  process.exit(0);
}

if(mode==='rollback'){
  const current=await getTarget(auth);
  let action='none',authWrites=0;
  if(!snapshot.targetExisted){
    if(current){
      if(!claimsExact(current.customClaims||{})||current.displayName!==displayName)fail('ROLLBACK_TARGET_NOT_MANAGED');
      await auth.deleteUser(current.uid);
      authWrites++;action='deleted_created_user';
    }else action='already_absent';
    const after=await getTarget(auth);
    if(after)fail('ROLLBACK_DELETE_NOT_EFFECTIVE');
  }else{
    if(!current||current.uid!==snapshot.target.uid)fail('ROLLBACK_PREEXISTING_TARGET_MISSING');
    const same=claimsExact(current.customClaims||{})&&current.displayName===snapshot.target.displayName&&Boolean(current.disabled)===Boolean(snapshot.target.disabled);
    if(!same)fail('ROLLBACK_PREEXISTING_STATE_CHANGED');
    action='preserved_preexisting_exact_user';
  }
  output({
    schemaVersion:'cxorbia.c6.client-auth-rollback.v1',
    decision:'PASS_C6_CLIENT_AUTH_ROLLBACK_EXACT',
    action,
    restoredPreState:true,
    authWrites,
    credentialCreates:0,
    passwordChanges:0,
    passwordResets:0
  });
  process.exit(0);
}

fail('UNKNOWN_MODE_'+mode);
