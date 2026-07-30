import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId='tya';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const out=process.env.CXORBIA_AUTH_MAPPING_OUT||'app/docs/evidence/CORTE6-AUTH-MAPPING-CAPABILITY-READONLY-LATEST.json';
if(!credentialPath||!fs.existsSync(credentialPath))throw new Error('credential_missing');
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject)throw new Error('wrong_project');
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const snap=await db.collection('tenants').doc(tenantId).collection('shoppers').get();
const keyCounts={};
const candidateCounts={};
const candidate=/^(id|shopperId|legacyId|legacyShopperId|sourceId|sourceRef|externalId|extId|hrRowId|hrRef|originId)$/i;
const sourceLike=/(legacy|source|external|extId|hrRow|shopperId|origin)/i;
for(const doc of snap.docs){
  const d=doc.data()||{};
  for(const k of Object.keys(d)){
    keyCounts[k]=(keyCounts[k]||0)+1;
    if(candidate.test(k)||sourceLike.test(k))candidateCounts[k]=(candidateCounts[k]||0)+1;
  }
}
const result={schemaVersion:'cxorbia.corte6.auth-mapping-capability-readonly.v1',generatedAt:new Date().toISOString(),projectId:expectedProject,tenantId,shopperDocuments:snap.size,documentIdAvailable:snap.size,fieldPresence:Object.fromEntries(Object.entries(keyCounts).sort(([a],[b])=>a.localeCompare(b))),stableIdCandidateFieldPresence:Object.fromEntries(Object.entries(candidateCounts).sort(([a],[b])=>a.localeCompare(b))),safety:{providerWrites:0,firestoreWrites:0,authWrites:0,valuesExported:false,piiExported:false,secretsExported:false,production:false,merge:false}};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:'PASS_READONLY_AUTH_MAPPING_CAPABILITY',shopperDocuments:snap.size,candidateFields:result.stableIdCandidateFieldPresence,providerWrites:0,valuesExported:false}));
