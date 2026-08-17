import fs from 'node:fs';
import admin from 'firebase-admin';

const requestPath='backend/config/corte6-auth-mapping-capability-readonly-request.json';
const request=JSON.parse(fs.readFileSync(requestPath,'utf8').replace(/^\uFEFF/,''));
const targetBHandoffMode=
  request.handoffPurpose==='TARGET_B_EXISTING_ADMIN_CREDENTIAL_RECOVERY' &&
  request.expectedTargetAlias==='B' &&
  request.expectedRole==='admin';

if(targetBHandoffMode){
  await import('./cxorbia-i3-admin-target-b-credential-handoff-readonly.mjs');
}else{
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
  let legacyIdPresent=0, legacyIdEqualsDocumentId=0, legacyIdEqualsIdField=0, legacyIdEqualsShopperIdField=0;
  for(const doc of snap.docs){
    const d=doc.data()||{};
    for(const k of Object.keys(d)){
      keyCounts[k]=(keyCounts[k]||0)+1;
      if(candidate.test(k)||sourceLike.test(k))candidateCounts[k]=(candidateCounts[k]||0)+1;
    }
    if(typeof d.legacyShopperId==='string'&&d.legacyShopperId){
      legacyIdPresent++;
      if(d.legacyShopperId===doc.id)legacyIdEqualsDocumentId++;
      if(typeof d.id==='string'&&d.legacyShopperId===d.id)legacyIdEqualsIdField++;
      if(typeof d.shopperId==='string'&&d.legacyShopperId===d.shopperId)legacyIdEqualsShopperIdField++;
    }
  }
  const stableMappingShape={legacyIdPresent,legacyIdEqualsDocumentId,legacyIdEqualsIdField,legacyIdEqualsShopperIdField,allLegacyIdsEqualDocumentId:legacyIdPresent>0&&legacyIdEqualsDocumentId===legacyIdPresent};
  const result={schemaVersion:'cxorbia.corte6.auth-mapping-capability-readonly.v2',generatedAt:new Date().toISOString(),projectId:expectedProject,tenantId,shopperDocuments:snap.size,documentIdAvailable:snap.size,fieldPresence:Object.fromEntries(Object.entries(keyCounts).sort(([a],[b])=>a.localeCompare(b))),stableIdCandidateFieldPresence:Object.fromEntries(Object.entries(candidateCounts).sort(([a],[b])=>a.localeCompare(b))),stableMappingShape,safety:{providerWrites:0,firestoreWrites:0,authWrites:0,valuesExported:false,piiExported:false,secretsExported:false,production:false,merge:false}};
  fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
  console.log(JSON.stringify({decision:'PASS_READONLY_AUTH_MAPPING_CAPABILITY_V2',shopperDocuments:snap.size,stableMappingShape,providerWrites:0,valuesExported:false}));
}
