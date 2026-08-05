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
const managedBy='cxorbia-c6-client-auth-materialization-v2';
const legacyManagedBy='cxorbia-c6-client-auth-materialization-v1';
const displayName='Portal Cliente Cinépolis · CXOrbia DEV';
const membershipPath=`tenants/${tenantId}/users/${uid}`;
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
  credentialVersion:2
};
const requiredMembership={
  schemaVersion:'cxorbia.tenant-user-membership.v1',
  uid,
  userId:uid,
  tenantId,
  role,
  authNamespace,
  projectId,
  projectIds:[projectId],
  clientId:projectId,
  status:'active',
  managedBy
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
    membershipPathFingerprint:sha256(membershipPath),
    credentialsExposed:false,
    tokensExposed:false,
    authUserCreates:0,
    passwordChanges:0,
    passwordResets:0,
    firestoreBusinessWrites:0,
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
function claimsProjection(claims={}){
  return {
    role:text(claims.role).toLowerCase(),
    authNamespace:text(claims.authNamespace).toLowerCase(),
    tenantId:text(claims.tenantId),
    tenants:list(claims.tenants).sort(),
    projectId:text(claims.projectId),
    projectIds:list(claims.projectIds).sort(),
    clientId:text(claims.clientId),
    managedBy:text(claims.managedBy),
    credentialVersion:Number(claims.credentialVersion||0)
  };
}
function claimsExact(claims={}){
  const p=claimsProjection(claims);
  return p.role===role&&p.authNamespace===authNamespace&&p.tenantId===tenantId&&
    JSON.stringify(p.tenants)===JSON.stringify([tenantId])&&p.projectId===projectId&&
    JSON.stringify(p.projectIds)===JSON.stringify([projectId])&&p.clientId===projectId&&
    [managedBy,legacyManagedBy].includes(p.managedBy)&&[1,2].includes(p.credentialVersion);
}
function membershipProjection(data={}){
  return {
    schemaVersion:text(data.schemaVersion),uid:text(data.uid),userId:text(data.userId),tenantId:text(data.tenantId),
    role:text(data.role).toLowerCase(),authNamespace:text(data.authNamespace).toLowerCase(),
    projectId:text(data.projectId),projectIds:list(data.projectIds).sort(),clientId:text(data.clientId),
    status:text(data.status).toLowerCase(),managedBy:text(data.managedBy)
  };
}
function membershipExact(data={}){
  const p=membershipProjection(data);
  return p.uid===uid&&p.userId===uid&&p.tenantId===tenantId&&p.role===role&&
    p.authNamespace===authNamespace&&p.projectId===projectId&&
    JSON.stringify(p.projectIds)===JSON.stringify([projectId])&&p.clientId===projectId&&
    p.status==='active'&&[managedBy,legacyManagedBy].includes(p.managedBy);
}
function publicUser(user){
  if(!user)return null;
  return {
    uidFingerprint:sha256(user.uid),emailFingerprint:sha256(user.email||''),disabled:Boolean(user.disabled),
    displayNameMatches:user.displayName===displayName,claimsExact:claimsExact(user.customClaims||{}),
    claimsDigest:sha256(stable(user.customClaims||{})),creationTime:user.metadata?.creationTime||null,
    lastSignInTime:user.metadata?.lastSignInTime||null
  };
}
function publicMembership(exists,data){
  return {exists:Boolean(exists),membershipExact:exists&&membershipExact(data||{}),membershipDigest:exists?sha256(stable(data||{})):null};
}
function derivePassword(sa){
  const raw=crypto.createHmac('sha256',Buffer.from(sa.private_key,'utf8'))
    .update(`cxorbia-c6-client-password-v1\0${tenantId}\0${projectId}\0${login}`,'utf8').digest('base64url');
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
async function listPotentialClientIdentities(auth){
  const rows=[];let pageToken;
  do{
    const page=await auth.listUsers(1000,pageToken);
    for(const user of page.users){
      const c=user.customClaims||{};
      const potential=user.uid===uid||user.email===internalEmail||
        [managedBy,legacyManagedBy].includes(text(c.managedBy))||
        (['cliente','client'].includes(text(c.role).toLowerCase())&&(text(c.clientId)===projectId||list(c.projectIds).includes(projectId)));
      if(potential)rows.push({uidFingerprint:sha256(user.uid),emailFingerprint:sha256(user.email||''),canonical:user.uid===uid&&user.email===internalEmail,claimsExact:claimsExact(c),disabled:Boolean(user.disabled)});
    }
    pageToken=page.pageToken;
  }while(pageToken);
  rows.sort((a,b)=>a.uidFingerprint.localeCompare(b.uidFingerprint));
  return rows;
}
async function firebaseWebConfig(){
  const response=await fetch(remoteRoot+'/__/firebase/init.js',{headers:{'cache-control':'no-cache'}});
  if(!response.ok)fail('FIREBASE_INIT_HTTP_'+response.status);
  const source=await response.text();let config=null;
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
  const body=await response.json();return Boolean(body?.idToken);
}
async function membershipState(db){
  const ref=db.doc(membershipPath);const snap=await ref.get();
  return {ref,exists:snap.exists,data:snap.exists?(snap.data()||{}):null};
}

if(!saPath||!fs.existsSync(saPath))fail('SERVICE_ACCOUNT_REQUIRED');
const sa=JSON.parse(fs.readFileSync(saPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('WRONG_SERVICE_ACCOUNT');
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const auth=admin.auth();const db=admin.firestore();const password=derivePassword(sa);

if(mode==='snapshot'){
  const target=await getTarget(auth);
  if(!target)fail('EXISTING_CANONICAL_CLIENT_IDENTITY_REQUIRED');
  if(target.disabled)fail('CANONICAL_CLIENT_DISABLED');
  if(target.displayName!==displayName)fail('CANONICAL_CLIENT_DISPLAY_NAME_DRIFT');
  const potentials=await listPotentialClientIdentities(auth);
  const canonicalCount=potentials.filter(x=>x.canonical).length;
  if(canonicalCount!==1)fail('CANONICAL_CLIENT_TARGET_NOT_UNIQUE',{canonicalCount,potentialCount:potentials.length});
  const signIn=await passwordSignIn(password);
  if(!signIn)fail('EXISTING_CANONICAL_CLIENT_PASSWORD_SIGNIN_FAILED');
  const membership=await membershipState(db);
  const privateSnapshot={
    schemaVersion:'cxorbia.c6.client-auth-membership-private-snapshot.v2',generatedAt:new Date().toISOString(),targetFingerprint,
    target:{uid:target.uid,email:target.email,displayName:target.displayName||null,disabled:Boolean(target.disabled),customClaims:target.customClaims||{}},
    membership:{path:membershipPath,existed:membership.exists,data:membership.data},potentialClientIdentities:potentials
  };
  fs.mkdirSync(path.dirname(snapshotPath),{recursive:true});
  fs.writeFileSync(snapshotPath,JSON.stringify(privateSnapshot,null,2)+'\n',{encoding:'utf8',mode:0o600});
  output({schemaVersion:'cxorbia.c6.client-auth-membership-snapshot.v2',decision:'PASS_C6_CLIENT_AUTH_MEMBERSHIP_PREWRITE_SNAPSHOT',
    targetUnique:true,potentialClientIdentityCount:potentials.length,target:publicUser(target),membership:publicMembership(membership.exists,membership.data),
    passwordSignIn:true,authWrites:0,claimsWrites:0,membershipWrites:0,firestoreWrites:0});
  process.exit(0);
}

if(!fs.existsSync(snapshotPath))fail('PRIVATE_SNAPSHOT_REQUIRED');
const snapshot=JSON.parse(fs.readFileSync(snapshotPath,'utf8'));
if(snapshot.targetFingerprint!==targetFingerprint||snapshot.target?.uid!==uid||snapshot.membership?.path!==membershipPath)fail('SNAPSHOT_TARGET_MISMATCH');

if(mode==='apply'){
  let target=await getTarget(auth);
  if(!target)fail('CANONICAL_CLIENT_DISAPPEARED');
  if(target.disabled||target.displayName!==displayName)fail('CANONICAL_CLIENT_IDENTITY_DRIFT');
  let authWrites=0,claimsWrites=0,membershipWrites=0;
  if(!claimsExact(target.customClaims||{})){
    const merged={...(target.customClaims||{}),...requiredClaims};
    await auth.setCustomUserClaims(uid,merged);authWrites++;claimsWrites++;
    target=await auth.getUser(uid);
  }
  const membership=await membershipState(db);
  if(!membership.exists||!membershipExact(membership.data||{})){
    await membership.ref.set(requiredMembership,{merge:true});membershipWrites++;
  }
  const signIn=await passwordSignIn(password);
  if(!signIn)fail('CLIENT_PASSWORD_SIGNIN_FAILED_AFTER_REPAIR');
  const finalMembership=await membershipState(db);
  if(!claimsExact(target.customClaims||{})||!membershipExact(finalMembership.data||{}))fail('CLIENT_REPAIR_READBACK_MISMATCH');
  output({schemaVersion:'cxorbia.c6.client-auth-membership-apply.v2',
    decision:authWrites===0&&membershipWrites===0?'PASS_C6_CLIENT_AUTH_MEMBERSHIP_IDEMPOTENT_NOOP':'PASS_C6_CLIENT_AUTH_MEMBERSHIP_REPAIRED',
    target:publicUser(target),membership:publicMembership(finalMembership.exists,finalMembership.data),passwordSignIn:true,
    authWrites,claimsWrites,membershipWrites,firestoreWrites:membershipWrites});
  process.exit(0);
}

if(mode==='readback'){
  const target=await getTarget(auth);const membership=await membershipState(db);
  if(!target||target.disabled||target.displayName!==displayName||!claimsExact(target.customClaims||{}))fail('CLIENT_AUTH_READBACK_MISMATCH');
  if(!membership.exists||!membershipExact(membership.data||{}))fail('CLIENT_MEMBERSHIP_READBACK_MISMATCH');
  const signIn=await passwordSignIn(password);if(!signIn)fail('CLIENT_AUTH_READBACK_SIGNIN_FAILED');
  let existing={schemaVersion:'cxorbia.c6.e2e-private-credentials.v10'};
  try{existing=JSON.parse(fs.readFileSync(privateCredentialPath,'utf8'));}catch{}
  existing.schemaVersion='cxorbia.c6.e2e-private-credentials.v10';
  existing.client={login,password,namespace:authNamespace,role,tenantId,projectIds:[projectId]};
  fs.mkdirSync(path.dirname(privateCredentialPath),{recursive:true});
  fs.writeFileSync(privateCredentialPath,JSON.stringify(existing,null,2)+'\n',{encoding:'utf8',mode:0o600});
  const readbackDecision=process.env.CXORBIA_PRIVATE_COMPAT_DIR
    ? 'PASS_C6_CLIENT_AUTH_READBACK'
    : 'PASS_C6_CLIENT_AUTH_MEMBERSHIP_READBACK';
  output({schemaVersion:'cxorbia.c6.client-auth-membership-readback.v2',decision:readbackDecision,
    canonicalDecision:'PASS_C6_CLIENT_AUTH_MEMBERSHIP_READBACK',compatibilityAlias:readbackDecision!=='PASS_C6_CLIENT_AUTH_MEMBERSHIP_READBACK',
    target:publicUser(target),membership:publicMembership(true,membership.data),passwordSignIn:true,
    authWrites:0,claimsWrites:0,membershipWrites:0,firestoreWrites:0});
  process.exit(0);
}

if(mode==='rollback-dry-run'){
  const target=await getTarget(auth);const membership=await membershipState(db);
  if(!target)fail('ROLLBACK_TARGET_MISSING');
  output({schemaVersion:'cxorbia.c6.client-auth-membership-rollback-plan.v2',decision:'PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT_DRY_RUN',
    canRollbackExactly:true,restoreClaimsDigest:sha256(stable(snapshot.target.customClaims||{})),
    membershipAction:snapshot.membership.existed?'restore_snapshot_document':(membership.exists?'delete_created_membership':'already_absent'),
    authWrites:0,claimsWrites:0,membershipWrites:0,firestoreWrites:0});
  process.exit(0);
}

if(mode==='rollback'){
  const target=await getTarget(auth);if(!target)fail('ROLLBACK_TARGET_MISSING');
  let authWrites=0,membershipWrites=0;
  const currentClaims=target.customClaims||{};
  if(stable(currentClaims)!==stable(snapshot.target.customClaims||{})){
    await auth.setCustomUserClaims(uid,snapshot.target.customClaims||null);authWrites++;
  }
  const membership=await membershipState(db);
  if(snapshot.membership.existed){
    if(stable(membership.data||{})!==stable(snapshot.membership.data||{})){
      await membership.ref.set(snapshot.membership.data||{});membershipWrites++;
    }
  }else if(membership.exists){
    await membership.ref.delete();membershipWrites++;
  }
  const after=await getTarget(auth);const membershipAfter=await membershipState(db);
  if(stable(after?.customClaims||{})!==stable(snapshot.target.customClaims||{}))fail('ROLLBACK_CLAIMS_NOT_RESTORED');
  if(Boolean(membershipAfter.exists)!==Boolean(snapshot.membership.existed))fail('ROLLBACK_MEMBERSHIP_EXISTENCE_NOT_RESTORED');
  if(snapshot.membership.existed&&stable(membershipAfter.data||{})!==stable(snapshot.membership.data||{}))fail('ROLLBACK_MEMBERSHIP_NOT_RESTORED');
  output({schemaVersion:'cxorbia.c6.client-auth-membership-rollback.v2',decision:'PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT',
    restoredPreState:true,authWrites,claimsWrites:authWrites,membershipWrites,firestoreWrites:membershipWrites});
  process.exit(0);
}

fail('UNKNOWN_MODE_'+mode);
