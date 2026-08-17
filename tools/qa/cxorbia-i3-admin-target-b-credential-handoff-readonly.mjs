import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId='tya',projectId='cinepolis';
const requestPath='backend/config/corte6-auth-mapping-capability-readonly-request.json';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const out=process.env.CXORBIA_AUTH_MAPPING_OUT||'app/docs/evidence/CORTE6-AUTH-MAPPING-CAPABILITY-READONLY-LATEST.json';
const privateDir='.tmp/i3-admin-target-b-private',privateCredential=path.join(privateDir,'credential.json');
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const norm=v=>String(v??'').trim().toLowerCase();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));

ensure(credentialPath&&fs.existsSync(credentialPath),'TARGET_B_SERVICE_ACCOUNT_MISSING');
const request=readJson(requestPath),sa=readJson(credentialPath);
ensure(request.handoffPurpose==='TARGET_B_EXISTING_ADMIN_CREDENTIAL_RECOVERY'&&request.expectedTargetAlias==='B'&&request.expectedRole==='admin','TARGET_B_SCOPE');
ensure(request.scope==='target_b_existing_admin_credential_recovery_readonly_encrypted_handoff','TARGET_B_REQUEST_SCOPE');
ensure(request.providerWrites===0&&request.authWrites===0&&request.firestoreWrites===0&&request.production===false&&request.merge===false,'TARGET_B_WRITE_BUDGET');
ensure(typeof request.handoffPublicKeyPem==='string'&&request.handoffPublicKeyPem.includes('BEGIN PUBLIC KEY'),'TARGET_B_PUBLIC_KEY_MISSING');
ensure(sa.project_id===expectedProject&&typeof sa.private_key==='string','TARGET_B_SERVICE_ACCOUNT_INVALID');
fs.mkdirSync(privateDir,{recursive:true});

let login='',password='';
try{
  const selector=spawnSync(process.execPath,['tools/qa/cxorbia-c6-canonical-staff-admin-e2e-credential.mjs'],{env:{...process.env,CXORBIA_C6_ACTION:'C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF',CXORBIA_E2E_PRIVATE_CREDENTIALS:privateCredential},encoding:'utf8'});
  ensure(selector.status===0,'TARGET_B_CANONICAL_SELECTOR_FAILED');
  const selected=JSON.parse(String(selector.stdout||'').trim().split(/\r?\n/).filter(Boolean).at(-1)||'{}');
  ensure(selected.decision==='PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY'&&selected.canonicalTargetAlias==='B'&&selected.staffRole==='admin'&&selected.authWrites===0&&selected.passwordChanges===0,'TARGET_B_SELECTOR_NOT_PASS');
  const privateData=readJson(privateCredential);login=norm(privateData?.staff?.login);password=String(privateData?.staff?.password||'');
  ensure(login&&password.length>=12,'TARGET_B_PRIVATE_CREDENTIAL_MISSING');

  const collision=readJson('backend/config/c6-staff-provider-collision-targets-v1.json');
  const b=(collision.targets||[]).find(x=>x.targetAlias==='B');
  const technicalLoginDigest=sha(`${tenantId}\0staff\0${login}`),providerEmail=`${technicalLoginDigest.slice(0,48)}@auth.cxorbia.invalid`;
  ensure(b?.role==='admin'&&technicalLoginDigest===b.technicalLoginDigest&&sha(providerEmail)===b.providerEmailSha256,'TARGET_B_TECHNICAL_BINDING_DRIFT');

  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
  const user=await admin.auth().getUserByEmail(providerEmail),claims=user.customClaims||{};
  ensure(user.disabled!==true&&norm(claims.authNamespace)==='staff'&&norm(claims.role)==='admin'&&norm(claims.tenantId)===tenantId,'TARGET_B_AUTH_STATE_DRIFT');
  ensure(Array.isArray(claims.projectIds)&&claims.projectIds.map(String).includes(projectId)&&!String(claims.shopperId||'').trim(),'TARGET_B_SCOPE_DRIFT');

  const initRes=await fetch('https://cxorbia-backend-dev.web.app/__/firebase/init.json',{redirect:'follow'});ensure(initRes.ok,'TARGET_B_FIREBASE_INIT_UNAVAILABLE');
  const webConfig=await initRes.json();ensure(webConfig?.apiKey,'TARGET_B_FIREBASE_API_KEY_MISSING');
  const signInRes=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(webConfig.apiKey)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:providerEmail,password,returnSecureToken:true})});
  let signIn={};try{signIn=await signInRes.json();}catch{}
  ensure(signInRes.ok&&String(signIn.localId||'')===String(user.uid),'TARGET_B_FIREBASE_CREDENTIAL_REJECTED');

  const publicKey=crypto.createPublicKey(request.handoffPublicKeyPem),publicDer=publicKey.export({type:'spki',format:'der'});
  const aesKey=crypto.randomBytes(32),iv=crypto.randomBytes(12);
  const plaintext=Buffer.from(JSON.stringify({schemaVersion:'cxorbia.i3.admin-target-b.private-credential-handoff.v1',targetAlias:'B',role:'admin',login,password}),'utf8');
  const cipher=crypto.createCipheriv('aes-256-gcm',aesKey,iv),ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]),tag=cipher.getAuthTag();
  const wrappedKey=crypto.publicEncrypt({key:publicKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},aesKey);
  const result={schemaVersion:'cxorbia.i3.admin-target-b.credential-recovery-readonly.v1',generatedAt:new Date().toISOString(),decision:'PASS_I3_ADMIN_TARGET_B_EXISTING_CREDENTIAL_VERIFIED_AND_ENCRYPTED_HANDOFF',projectId:expectedProject,tenantId,canonicalProjectId:projectId,target:{alias:'B',role:'admin',exactTechnicalBinding:true,authEnabled:true,claimsExact:true,firebasePasswordSignIn:true},handoff:{algorithm:'RSA-OAEP-SHA256+AES-256-GCM',publicKeyFingerprintSha256:crypto.createHash('sha256').update(publicDer).digest('hex'),wrappedKeyBase64:wrappedKey.toString('base64'),ivBase64:iv.toString('base64'),tagBase64:tag.toString('base64'),ciphertextBase64:ciphertext.toString('base64')},safety:{providerReads:true,providerWrites:0,authReads:1,authSignIns:1,authWrites:0,passwordChanges:0,passwordResets:0,firestoreReads:0,firestoreWrites:0,shopperReads:0,shopperWrites:0,historicalCredentialAccess:0,otherIdentitiesModified:0,piiExported:false,credentialValuesExported:false,plaintextCredentialPersisted:false,tokensPersisted:false,tokensLogged:false,secretsExported:false,production:false,merge:false},nextGate:'HUMAN_PAULA_ADMIN_LOGIN_AND_LEGAL_V04_ACCEPTANCE'};
  const serialized=JSON.stringify(result);ensure(!serialized.includes(login)&&!serialized.includes(password),'TARGET_B_PLAINTEXT_LEAK');
  fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
  console.log(JSON.stringify({decision:result.decision,targetAlias:'B',role:'admin',firebasePasswordSignIn:true,authWrites:0,passwordChanges:0,passwordResets:0,shopperReads:0,historicalCredentialAccess:0,credentialValuesExported:false}));
  plaintext.fill(0);aesKey.fill(0);
}finally{login='';password='';try{fs.rmSync(privateDir,{recursive:true,force:true});}catch{}}
