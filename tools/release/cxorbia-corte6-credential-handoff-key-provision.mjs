import fs from 'node:fs';
import crypto from 'node:crypto';

const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const publicOut=process.env.CXORBIA_HANDOFF_PUBLIC_OUT||'backend/secure/corte6-credential-handoff-public.json';
const privateOut=process.env.CXORBIA_HANDOFF_PRIVATE_OUT||'backend/secure/corte6-credential-handoff-private.enc.json';
if(!credentialPath||!fs.existsSync(credentialPath))throw new Error('credential_missing');
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string'||!sa.private_key.includes('PRIVATE KEY'))throw new Error('wrong_or_invalid_service_account');

const {publicKey,privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:3072,publicExponent:0x10001,publicKeyEncoding:{type:'spki',format:'der'},privateKeyEncoding:{type:'pkcs8',format:'der'}});
const fingerprint=crypto.createHash('sha256').update(publicKey).digest('hex');
const salt=crypto.randomBytes(32);
const iv=crypto.randomBytes(12);
const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
const cipher=crypto.createCipheriv('aes-256-gcm',kek,iv);
const ciphertext=Buffer.concat([cipher.update(privateKey),cipher.final()]);
const tag=cipher.getAuthTag();

const publicDoc={schemaVersion:'cxorbia.corte6.credential-handoff-public.v1',generatedAt:new Date().toISOString(),projectId:expectedProject,algorithm:'RSA-OAEP-3072-SHA256+A256GCM',publicKeySpkiBase64:publicKey.toString('base64'),fingerprintSha256:fingerprint,usage:'encrypt_local_legacy_credential_hash_bundle_only',safety:{containsPrivateKey:false,containsProviderSecret:false,containsCredentials:false}};
const privateDoc={schemaVersion:'cxorbia.corte6.credential-handoff-private-encrypted.v1',generatedAt:publicDoc.generatedAt,projectId:expectedProject,algorithm:'RSA-OAEP-3072-SHA256',kekDerivation:'HKDF-SHA256-existing-dev-service-account-secret-v1',fingerprintSha256:fingerprint,saltBase64:salt.toString('base64'),ivBase64:iv.toString('base64'),tagBase64:tag.toString('base64'),ciphertextBase64:ciphertext.toString('base64'),safety:{privateKeyEncryptedAtRest:true,rawPrivateKeyWrittenToDisk:false,providerWrites:0,credentialValuesIncluded:false}};
fs.mkdirSync('backend/secure',{recursive:true});
fs.writeFileSync(publicOut,JSON.stringify(publicDoc,null,2)+'\n','utf8');
fs.writeFileSync(privateOut,JSON.stringify(privateDoc,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:'PASS_C6_CREDENTIAL_HANDOFF_KEY_PROVISION',projectId:expectedProject,algorithm:publicDoc.algorithm,fingerprintSha256:fingerprint,providerWrites:0,privateKeyEncryptedAtRest:true,rawPrivateKeyWrittenToDisk:false}));
