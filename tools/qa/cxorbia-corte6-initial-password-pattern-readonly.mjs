import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_PASSWORD_PATTERN_OUT||'app/docs/evidence/CORTE6-INITIAL-PASSWORD-PATTERN-READONLY-LATEST.json';
const tenantId='tya';
const projectId='cinepolis';
function fail(m){throw new Error(m);}
function norm(v){return String(v??'').trim();}
for(const p of [credentialPath,envelopePath,publicPath,privatePath])if(!p||!fs.existsSync(p))fail(`required_file_missing:${p||'undefined'}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('wrong_or_invalid_service_account');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)fail('key_fingerprint_mismatch');
const salt=Buffer.from(encPriv.saltBase64,'base64'),ivPriv=Buffer.from(encPriv.ivBase64,'base64'),tag=Buffer.from(encPriv.tagBase64,'base64'),ciphertextPriv=Buffer.from(encPriv.ciphertextBase64,'base64');
const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
const decipher=crypto.createDecipheriv('aes-256-gcm',kek,ivPriv);decipher.setAuthTag(tag);
const privateDer=Buffer.concat([decipher.update(ciphertextPriv),decipher.final()]);
const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
const encrypted=Buffer.from(env.ciphertextBase64,'base64'),tagContent=encrypted.subarray(encrypted.length-16),ct=encrypted.subarray(0,encrypted.length-16);
const dec=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));dec.setAAD(Buffer.from(env.aad,'utf8'));dec.setAuthTag(tagContent);
const decrypted=Buffer.concat([dec.update(ct),dec.final()]);
const bundleBytes=env.algorithms?.compression==='gzip'?zlib.gunzipSync(decrypted):decrypted;
const bundle=JSON.parse(bundleBytes.toString('utf8'));
if(bundle.targetProjectId!==expectedProject||bundle.tenantId!==tenantId||bundle.canonicalProjectId!==projectId)fail('bundle_contract_mismatch');
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const snap=await db.collection('tenants').doc(tenantId).collection('shoppers').select('legacyShopperId','nombre','name','displayName','firstName').get();
const byLegacy=new Map();
for(const d of snap.docs){const v=d.data()||{},legacy=norm(v.legacyShopperId);if(!legacy)continue;if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);byLegacy.get(legacy).push(v);}
function firstNameOf(v){
  const explicit=norm(v.firstName); if(explicit)return explicit;
  const full=norm(v.nombre||v.name||v.displayName); return full?full.split(/\s+/)[0]:'';
}
function initialPasswordCandidate(firstName){
  const n=norm(firstName); if(!n)return '';
  return n.charAt(0).toUpperCase()+n.slice(1)+'123*';
}
function sha256(s){return crypto.createHash('sha256').update(s,'utf8').digest('hex');}
const counts={bundleShopperRecords:0,exactLegacyMatch:0,nameAvailable:0,patternVerified:0,patternNotVerified:0,missingName:0,legacyMissing:0,legacyAmbiguous:0,badHash:0};
for(const r of Array.isArray(bundle.records)?bundle.records:[]){
  if(!r||r.kind!=='shopper')continue; counts.bundleShopperRecords++;
  const hash=String(r.passwordHashHex||'').toLowerCase(); if(!/^[a-f0-9]{64}$/.test(hash)||r.passwordHashAlgorithm!=='SHA256'||r.passwordHashRounds!==1){counts.badHash++;continue;}
  const matches=byLegacy.get(norm(r.legacyId))||[];
  if(matches.length===0){counts.legacyMissing++;continue;} if(matches.length!==1){counts.legacyAmbiguous++;continue;}
  counts.exactLegacyMatch++;
  const first=firstNameOf(matches[0]); if(!first){counts.missingName++;continue;} counts.nameAvailable++;
  const candidate=initialPasswordCandidate(first);
  if(candidate&&sha256(candidate)===hash)counts.patternVerified++; else counts.patternNotVerified++;
}
const result={schemaVersion:'cxorbia.corte6.initial-password-pattern-readonly.v1',generatedAt:new Date().toISOString(),target:{projectId:expectedProject,tenantId,canonicalProjectId:projectId},patternContract:'CapitalizedFirstName + 123*',hashContract:{algorithm:'SHA256',rounds:1},counts,decision:counts.patternVerified>0?'PASS_SOURCE_SAFE_PATTERN_VERIFICATION_COUNTS':'HOLD_NO_PATTERN_MATCHES',interpretation:'A verified count proves the encrypted legacy password hash equals the historical initial-pattern candidate for those exact legacy-ID-matched profiles. It does not export or persist plaintext and is not a substitute for a password reset if later credential state is uncertain.',safety:{providerReads:true,providerWrites:0,firestoreWrites:0,authWrites:0,passwordChanges:0,hostingDeploys:0,rulesDeploys:0,legacyWrites:0,hrWrites:0,piiExported:false,passwordValuesExported:false,passwordHashesExported:false,secretsExported:false,production:false,merge:false}};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');console.log(JSON.stringify({decision:result.decision,counts,safety:result.safety}));
