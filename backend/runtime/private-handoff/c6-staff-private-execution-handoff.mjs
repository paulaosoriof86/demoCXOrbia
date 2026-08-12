import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const TENANT='tya';
const NS='staff';
const DEFAULT_ENVELOPE='backend/private-inbox/c6-staff-private-execution-handoff.enc.json';
const DEFAULT_PUBLIC='backend/secure/corte6-credential-handoff-public.json';
const DEFAULT_PRIVATE='backend/secure/corte6-credential-handoff-private.enc.json';
const DEFAULT_CONTRACT='backend/contracts/c6-staff-private-execution-handoff-v1.json';
const DEFAULT_COLLISION='backend/config/c6-staff-provider-collision-targets-v1.json';
const DEFAULT_D_REBASE='backend/contracts/c6-staff-d-technical-login-rebase-v1.json';

const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const norm=v=>String(v??'').trim().toLowerCase();
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const loginDigest=v=>sha(`${TENANT}\0${NS}\0${norm(v)}`);
const ownerBinding=(anchor,digest)=>sha(`cxorbia-owner-login-bind-v1\0${TENANT}\0${anchor}\0${digest}`);

function deriveD(dRebase,collisionD){
  const d=dRebase.canonicalVisibleLoginDerivation;
  ensure(d?.version==='cxorbia-canonical-visible-login-v1','D_DERIVATION_VERSION');
  const seed=sha(`${d.version}\0${TENANT}\0${NS}\0D\0${collisionD.ownerIdentityAnchor}\0${collisionD.ownerRoleBindingDigest||''}\0${collisionD.role}`);
  const visibleLogin=`cxu-${seed.slice(0,24)}`;
  const digest=loginDigest(visibleLogin);
  ensure(digest===dRebase.replacement.technicalLoginDigest,'D_TECHNICAL_DIGEST');
  ensure(ownerBinding(collisionD.ownerIdentityAnchor,digest)===dRebase.replacement.ownerTechnicalBindingDigest,'D_OWNER_BINDING');
  return visibleLogin;
}

function decryptEnvelope({serviceAccount,envelope,pub,encPriv}){
  ensure(serviceAccount?.type==='service_account'&&serviceAccount?.project_id==='cxorbia-backend-dev'&&serviceAccount?.private_key,'SERVICE_ACCOUNT_INVALID');
  ensure(pub.projectId==='cxorbia-backend-dev'&&encPriv.projectId==='cxorbia-backend-dev'&&envelope.targetProjectId==='cxorbia-backend-dev','HANDOFF_PROJECT_MISMATCH');
  ensure(pub.fingerprintSha256===encPriv.fingerprintSha256&&pub.fingerprintSha256===envelope.keyFingerprintSha256,'HANDOFF_KEY_FINGERPRINT');
  ensure(pub.allowedDomains?.includes(envelope.aad),'HANDOFF_AAD_NOT_ALLOWED');
  const salt=Buffer.from(encPriv.saltBase64,'base64');
  const ivPriv=Buffer.from(encPriv.ivBase64,'base64');
  const tagPriv=Buffer.from(encPriv.tagBase64,'base64');
  const ciphertextPriv=Buffer.from(encPriv.ciphertextBase64,'base64');
  const kek=crypto.hkdfSync('sha256',Buffer.from(serviceAccount.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
  const decipher=crypto.createDecipheriv('aes-256-gcm',kek,ivPriv);
  decipher.setAuthTag(tagPriv);
  const privateDer=Buffer.concat([decipher.update(ciphertextPriv),decipher.final()]);
  const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
  const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(envelope.wrappedKeyBase64,'base64'));
  const encrypted=Buffer.from(envelope.ciphertextBase64,'base64');
  ensure(encrypted.length>16,'HANDOFF_CIPHERTEXT_SHORT');
  const tag=encrypted.subarray(encrypted.length-16);
  const ct=encrypted.subarray(0,encrypted.length-16);
  const dec=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(envelope.ivBase64,'base64'));
  dec.setAAD(Buffer.from(envelope.aad,'utf8'));
  dec.setAuthTag(tag);
  const compressed=Buffer.concat([dec.update(ct),dec.final()]);
  rawAes.fill(0);
  const plain=envelope.algorithms?.compression==='gzip'?zlib.gunzipSync(compressed):compressed;
  try{return JSON.parse(plain.toString('utf8'));}finally{plain.fill(0);compressed.fill(0);privateDer.fill(0);}
}

export function loadStaffPrivateExecutionHandoff(options={}){
  const credentialPath=options.credentialPath||process.env.GOOGLE_APPLICATION_CREDENTIALS;
  ensure(credentialPath&&fs.existsSync(credentialPath),'SERVICE_ACCOUNT_PATH_MISSING');
  const paths={
    envelope:options.envelopePath||DEFAULT_ENVELOPE,
    publicKey:options.publicKeyPath||DEFAULT_PUBLIC,
    privateKey:options.privateKeyPath||DEFAULT_PRIVATE,
    contract:options.contractPath||DEFAULT_CONTRACT,
    collision:options.collisionPath||DEFAULT_COLLISION,
    dRebase:options.dRebasePath||DEFAULT_D_REBASE
  };
  for(const p of Object.values(paths))ensure(fs.existsSync(p),`HANDOFF_SOURCE_MISSING_${p}`);
  const sa=readJson(credentialPath),envelope=readJson(paths.envelope),pub=readJson(paths.publicKey),encPriv=readJson(paths.privateKey),contract=readJson(paths.contract),collision=readJson(paths.collision),dRebase=readJson(paths.dRebase);
  ensure(contract.schemaVersion==='cxorbia.c6.staff-private-execution-handoff.v1','HANDOFF_CONTRACT_SCHEMA');
  ensure(envelope.schemaVersion==='cxorbia.c6.staff-private-execution-handoff-envelope.v1','HANDOFF_ENVELOPE_SCHEMA');
  ensure(envelope.tenantId===TENANT&&envelope.authNamespace===NS,'HANDOFF_NAMESPACE');
  const payload=decryptEnvelope({serviceAccount:sa,envelope,pub,encPriv});
  ensure(payload.schemaVersion==='cxorbia.c6.staff-private-execution-handoff.payload.v1'&&payload.tenantId===TENANT&&payload.authNamespace===NS,'HANDOFF_PAYLOAD_SCHEMA');
  ensure(JSON.stringify(payload.targets?.map(x=>x.targetAlias))===JSON.stringify(['A','B','C']),'HANDOFF_ALIAS_SET');
  const byAlias=new Map();
  const collisionMap=new Map(collision.targets.map(x=>[x.targetAlias,x]));
  for(const row of payload.targets){
    ensure(typeof row.visibleLogin==='string'&&row.visibleLogin.length>0,`HANDOFF_VALUE_MISSING_${row.targetAlias}`);
    const cfg=collisionMap.get(row.targetAlias),expected=contract.targetValidation[row.targetAlias];
    ensure(cfg&&expected,`HANDOFF_TARGET_CONFIG_${row.targetAlias}`);
    const digest=loginDigest(row.visibleLogin);
    ensure(digest===expected.technicalLoginDigest&&digest===cfg.technicalLoginDigest,`HANDOFF_DIGEST_${row.targetAlias}`);
    ensure(ownerBinding(cfg.ownerIdentityAnchor,digest)===expected.ownerTechnicalBindingDigest&&expected.ownerTechnicalBindingDigest===cfg.ownerTechnicalBindingDigest,`HANDOFF_OWNER_BIND_${row.targetAlias}`);
    byAlias.set(row.targetAlias,norm(row.visibleLogin));
  }
  const dCfg=collisionMap.get('D');
  ensure(dCfg,'HANDOFF_D_CONFIG');
  byAlias.set('D',deriveD(dRebase,dCfg));
  let disposed=false;
  return {
    getVisibleLogin(alias){ensure(!disposed,'HANDOFF_DISPOSED');ensure(byAlias.has(alias),'HANDOFF_ALIAS_UNKNOWN');return byAlias.get(alias);},
    diagnostics:{schemaVersion:'cxorbia.c6.staff-private-execution-handoff.runtime-diagnostics.v1',targetsValidated:['A','B','C','D'],abcEncryptedAtRest:true,dDeterministic:true,providerAccess:0,serializedPlaintext:false},
    dispose(){for(const k of byAlias.keys())byAlias.set(k,'');byAlias.clear();disposed=true;}
  };
}
