#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const TENANT='tya',NS='staff';
const paths={
  envelope:'backend/private-inbox/c6-staff-private-execution-handoff.enc.json',
  publicKey:'backend/secure/corte6-credential-handoff-public.json',
  contract:'backend/contracts/c6-staff-private-execution-handoff-v1.json',
  collision:'backend/config/c6-staff-provider-collision-targets-v1.json',
  targets:'backend/config/c6-staff-bootstrap-targets-v1.json',
  dRebase:'backend/contracts/c6-staff-d-technical-login-rebase-v1.json',
  runtime:'backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs'
};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const ownerBinding=(anchor,digest)=>sha(`cxorbia-owner-login-bind-v1\0${TENANT}\0${anchor}\0${digest}`);
for(const p of Object.values(paths))ensure(fs.existsSync(p),`SOURCE_MISSING_${p}`);
const envelope=readJson(paths.envelope),pub=readJson(paths.publicKey),contract=readJson(paths.contract),collision=readJson(paths.collision),targets=readJson(paths.targets),dRebase=readJson(paths.dRebase),runtime=fs.readFileSync(paths.runtime,'utf8');
ensure(envelope.schemaVersion==='cxorbia.c6.staff-private-execution-handoff-envelope.v1','ENVELOPE_SCHEMA');
ensure(envelope.targetProjectId==='cxorbia-backend-dev'&&envelope.tenantId===TENANT&&envelope.authNamespace===NS,'ENVELOPE_TARGET');
ensure(envelope.aad==='cxorbia-c6-staff-private-execution-handoff-v1','ENVELOPE_AAD');
ensure(pub.fingerprintSha256===envelope.keyFingerprintSha256&&pub.allowedDomains?.includes(envelope.aad),'KEY_POLICY');
ensure(envelope.algorithms?.keyWrap==='RSA-OAEP-3072-SHA256'&&envelope.algorithms?.content==='A256GCM'&&envelope.algorithms?.compression==='gzip','ALGORITHMS');
ensure(JSON.stringify(envelope.targetAliases)===JSON.stringify(['A','B','C']),'ENVELOPE_ALIASES');
ensure(typeof envelope.wrappedKeyBase64==='string'&&Buffer.from(envelope.wrappedKeyBase64,'base64').length===384,'WRAPPED_KEY_LENGTH');
ensure(typeof envelope.ivBase64==='string'&&Buffer.from(envelope.ivBase64,'base64').length===12,'IV_LENGTH');
ensure(typeof envelope.ciphertextBase64==='string'&&Buffer.from(envelope.ciphertextBase64,'base64').length>16,'CIPHERTEXT_LENGTH');
for(const k of ['rawPiiPersisted','rawLoginPersisted','rawEmailPersisted','uidPersisted','passwordPersisted','passwordHashPersisted','rawNamePersisted'])ensure(envelope[k]===false,`ENVELOPE_PRIVACY_${k}`);
ensure(contract.schemaVersion==='cxorbia.c6.staff-private-execution-handoff.v1','CONTRACT_SCHEMA');
ensure(contract.writeBoundary?.writesAuthorizedByThisContract===false&&contract.writeBoundary?.authWritesMaxPreserved===14&&contract.writeBoundary?.firestoreWritesMaxPreserved===16&&contract.writeBoundary?.authDeletes===0&&contract.writeBoundary?.firestoreDeletes===0,'WRITE_BOUNDARY');
const cm=new Map(collision.targets.map(x=>[x.targetAlias,x])),tm=new Map(targets.targets.map(x=>[x.targetAlias,x]));
for(const alias of ['A','B','C']){
  const c=cm.get(alias),t=tm.get(alias),v=contract.targetValidation?.[alias];
  ensure(c&&t&&v,`ABC_SOURCE_${alias}`);
  ensure(c.technicalLoginDigest===v.technicalLoginDigest&&c.ownerTechnicalBindingDigest===v.ownerTechnicalBindingDigest,'ABC_DIGEST_DRIFT_'+alias);
  ensure(c.ownerIdentityAnchor===t.ownerIdentityAnchor&&c.role===t.role,'ABC_OWNER_ROLE_DRIFT_'+alias);
}
const cD=cm.get('D'),tD=tm.get('D'),der=dRebase.canonicalVisibleLoginDerivation;
ensure(cD&&tD&&der?.version==='cxorbia-canonical-visible-login-v1','D_SOURCE');
const seed=sha(`${der.version}\0${TENANT}\0${NS}\0D\0${tD.ownerIdentityAnchor}\0${tD.ownerRoleBindingDigest}\0${tD.role}`);
let dVisible=`cxu-${seed.slice(0,24)}`;
const dDigest=sha(`${TENANT}\0${NS}\0${dVisible.trim().toLowerCase()}`);
ensure(dDigest===cD.technicalLoginDigest&&dDigest===dRebase.replacement.technicalLoginDigest,'D_DIGEST');
ensure(ownerBinding(tD.ownerIdentityAnchor,dDigest)===cD.ownerTechnicalBindingDigest&&cD.ownerTechnicalBindingDigest===dRebase.replacement.ownerTechnicalBindingDigest,'D_BINDING');
dVisible='';
ensure(runtime.includes('decryptEnvelope')&&runtime.includes('HANDOFF_DIGEST_')&&runtime.includes("byAlias.set('D',deriveD"),'RUNTIME_HANDOFF_CONTRACT');
const publicKey=crypto.createPublicKey({key:Buffer.from(pub.publicKeySpkiBase64,'base64'),format:'der',type:'spki'});
const synthetic=crypto.publicEncrypt({key:publicKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},crypto.randomBytes(32));
ensure(synthetic.length===384,'PUBLIC_KEY_SYNTHETIC_WRAP');
const report={schemaVersion:'cxorbia.c6.staff-private-execution-handoff.source-gate.v1',generatedAt:new Date().toISOString(),decision:'PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF_SOURCE_GATE',envelope:{schema:true,keyFingerprint:true,aad:true,algorithms:true,targetAliases:['A','B','C'],encryptedAtRest:true},targetValidation:{A:'FROZEN_SOURCE_SAFE',B:'FROZEN_SOURCE_SAFE',C:'FROZEN_SOURCE_SAFE',D:'DETERMINISTIC_REGENERATION_PASS'},runtime:{memoryOnly:true,exactDigestValidationRequired:true,ownerBindingValidationRequired:true,providerAccessRequired:false},safety:{providerReads:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,deletes:0,deploys:0,merge:false,production:false,rawLoginEmitted:false,rawLoginPersisted:false,emailPersisted:false,uidPersisted:false,passwordPersisted:false,passwordHashPersisted:false,rawNamePersisted:false}};
console.log(JSON.stringify(report));
