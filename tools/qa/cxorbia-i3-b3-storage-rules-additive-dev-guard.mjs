#!/usr/bin/env node
/* Fail-closed I3 B3 release-composition guard. It authorizes only the exact
   additive DEV Storage rule for a scoped Shopper visit-evidence object.
   The existing resource permissions and final deny rule must be unchanged. */
import fs from 'node:fs';
import crypto from 'node:crypto';

const [beforePath,sourcePath,outPath]=process.argv.slice(2);
if(!beforePath||!sourcePath||!outPath)throw Error('SOURCE_FAILURE:STORAGE_GUARD_INPUTS_REQUIRED');
const before=fs.readFileSync(beforePath,'utf8'),source=fs.readFileSync(sourcePath,'utf8');
const digest=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
const beforeDigest=digest(before),expectedBefore='6c9c6b3e5ce4ec031df63c986c98b8d79981586a7dc7425daaab790500b7d378';
const normalize=s=>s.replace(/\r\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
const shopperBlock=/    function shopper\(\) \{[\s\S]*?(?=    function projectAssigned)/;
const evidenceBlock=/    match \/tenants\/\{tenantId\}\/projects\/\{projectId\}\/periods\/\{periodId\}\/visits\/\{visitId\}\/evidence\/\{evidenceId\}\/\{fileName\} \{[\s\S]*?(?=    match \/tenants\/\{tenantId\}\/projects\/\{projectId\}\/periods\/\{periodId\}\/resources)/;
const report={schemaVersion:'cxorbia.i3.b3.storage-rules-additive-dev-guard.v1',decision:'HOLD',
  beforeSha256:beforeDigest,sourceSha256:digest(source),beforeBytes:before.length,sourceBytes:source.length,
  beforeExactFrozen:false,onlyShopperEvidenceAdditive:false,existingResourcesPreserved:false,failClosedPreserved:false,
  crossTenantWritesAllowed:false,production:false};
try{
  report.beforeExactFrozen=beforeDigest===expectedBefore;
  if(!report.beforeExactFrozen)throw Error('RELEASE_COMPOSITION_FAILURE:DEPLOYED_STORAGE_RULES_DRIFT');
  if(!(shopperBlock.test(source)&&evidenceBlock.test(source))||shopperBlock.test(before)||evidenceBlock.test(before))
    throw Error('RELEASE_COMPOSITION_FAILURE:SHOPPER_EVIDENCE_DELTA_MISMATCH');
  const prior=normalize(source.replace(shopperBlock,'').replace(evidenceBlock,''));
  report.onlyShopperEvidenceAdditive=prior===normalize(before);
  if(!report.onlyShopperEvidenceAdditive)throw Error('RELEASE_COMPOSITION_FAILURE:STORAGE_NONADDITIVE_DIFF');
  const resourceStart='    match /tenants/{tenantId}/projects/{projectId}/periods/{periodId}/resources/{resourceId}/{fileName} {';
  const resourceEnd='    match /{allPaths=**} {';
  const resource=s=>s.slice(s.indexOf(resourceStart),s.indexOf(resourceEnd));
  report.existingResourcesPreserved=before.includes(resourceStart)&&source.includes(resourceStart)&&resource(before)===resource(source);
  report.failClosedPreserved=before.includes('allow read, write: if false;')&&source.includes('allow read, write: if false;')
    &&!source.includes('allow read, write: if true;');
  report.crossTenantWritesAllowed=source.includes('allow write: if true;')||source.includes('allow create: if true;');
  if(!report.existingResourcesPreserved||!report.failClosedPreserved||report.crossTenantWritesAllowed)
    throw Error('RELEASE_COMPOSITION_FAILURE:STORAGE_PERMISSION_BOUNDARY_CHANGED');
  report.decision='PASS_I3_B3_STORAGE_RULES_ONLY_ADDITIVE_DEV';
}catch(error){report.error=String(error?.message||error);process.exitCode=2;}
fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report));
