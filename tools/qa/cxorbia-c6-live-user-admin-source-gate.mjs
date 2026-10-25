#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const json=(p)=>JSON.parse(read(p));
const sha=(v)=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fail=(m)=>{throw new Error(m);};

const contractPath='backend/contracts/c6-live-user-admin-v1.json';
const targetsPath='backend/config/c6-staff-bootstrap-targets-v1.json';
const materializedPath='app/docs/evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json';
const serverPath='backend/runtime/hr-live-service/server.mjs';
const handlerPath='backend/runtime/hr-live-service/user-admin.mjs';
const packagePath='backend/runtime/hr-live-service/package.json';
const dockerPath='backend/runtime/hr-live-service/Dockerfile';
const firebasePath='firebase.json';

const c=json(contractPath),t=json(targetsPath),m=json(materializedPath),pkg=json(packagePath),fb=json(firebasePath);
const server=read(serverPath),handler=read(handlerPath),docker=read(dockerPath);

if(c.schemaVersion!=='cxorbia.c6.live-user-admin.contract.v1.1')fail('contract_schema');
if(c.projectEntitlementContract?.selectionRequiredOnCreate!==true||c.projectEntitlementContract?.selectionEditableAfterCreate!==true)fail('scope_ui_contract');
if(c.projectEntitlementContract?.wildcardAllowed!==false||c.projectEntitlementContract?.futureProjectSilentInheritance!==false)fail('scope_wildcard_contract');
if(c.frontendIntegration?.createMustAskProjectScope!==true||c.frontendIntegration?.editMustAllowProjectScopeChange!==true)fail('frontend_scope_contract');
if(c.sourceSafe?.providerWritesAuthorizedByThisContract!==false||c.sourceSafe?.deployAuthorizedByThisContract!==false||c.sourceSafe?.productionAuthorizedByThisContract!==false)fail('unsafe_contract');

if(t.schemaVersion!=='cxorbia.c6.staff-bootstrap-targets.v1'||t.entitlementDecision!=='TYA_COMPLETE_FOR_ALL_FOUR')fail('target_schema');
if(!Array.isArray(t.targets)||t.targets.length!==4)fail('target_count');
if(t.targets.some(x=>x.entitlementMode!=='TYA_COMPLETE'))fail('target_entitlement');
if(t.sourceSafe?.providerReads!==0||t.sourceSafe?.providerWrites!==0||t.sourceSafe?.authWrites!==0||t.sourceSafe?.firestoreWrites!==0||t.sourceSafe?.production!==false)fail('target_safety');

const canonicalProjectId=String(m?.target?.canonicalProjectId||'');
if(m?.decision!=='PASS_R17N_POST_MATERIALIZATION_READONLY_AND_CXDATA_SMOKE'||m?.cxdataSmoke?.projects!==1||canonicalProjectId!=='cinepolis'||m?.cxdataSmoke?.currentProjectId!==canonicalProjectId)fail('canonical_project_inventory');
if(JSON.stringify(t.canonicalProjectInventory?.sourceSafeCurrentProjectIds)!==JSON.stringify([canonicalProjectId]))fail('target_project_inventory');

for(const row of t.targets){
  if(!/^[A-D]$/.test(row.targetAlias)||!['super','admin','ops'].includes(row.role))fail('target_alias_role');
  if(!/^[a-f0-9]{64}$/.test(row.ownerIdentityAnchor)||!/^[a-f0-9]{64}$/.test(row.ownerRoleBindingDigest)||!/^[a-f0-9]{64}$/.test(row.expectedClaimsDigest))fail('digest_format');
  const expectedBinding=sha(`cxorbia-owner-role-v1\0tya\0${row.role}\0${row.ownerIdentityAnchor}`);
  if(expectedBinding!==row.ownerRoleBindingDigest)fail(`owner_binding_digest_${row.targetAlias}`);
  const claims={authNamespace:'staff',projectIds:[canonicalProjectId],role:row.role,tenantId:'tya'};
  if(sha(JSON.stringify(claims))!==row.expectedClaimsDigest)fail(`claims_digest_${row.targetAlias}`);
}
if(t.targets[0].ownerIdentityAnchor!==t.targets[1].ownerIdentityAnchor)fail('same_owner_A_B_binding_expected');

for(const required of [
  "import { isLiveUserAdminPath, maybeHandleLiveUserAdminRequest } from './user-admin.mjs';",
  "Access-Control-Allow-Methods','GET, POST, PATCH, OPTIONS'",
  'liveUserAdminSourceReady:true'
]) if(!server.includes(required))fail('server_missing:'+required);
for(const required of [
  "selectionRequiredOnCreate",
  "selectionEditableAfterCreate"
]) if(!read(contractPath).includes(required))fail('contract_text_missing:'+required);
for(const required of [
  "const ENTITLEMENT_MODES=new Set(['TYA_COMPLETE','SPECIFIC_PROJECTS'])",
  "scopeReviewRequired",
  "resolveEntitlement",
  "auth.verifyIdToken(raw,true)",
  "String(token.role||'')!=='super'",
  "auth.setCustomUserClaims",
  "writeAudit",
  "disabled:true",
  "futureProject"
]){
  if(required==='futureProject')continue;
  if(!handler.includes(required))fail('handler_missing:'+required);
}
if(handler.includes("projectIds:['cinepolis']")||handler.includes('projectIds: [\"cinepolis\"]'))fail('hardcoded_project_scope');
if(!pkg.dependencies||pkg.dependencies['firebase-admin']!=='13.4.0')fail('firebase_admin_dependency');
if(!docker.includes('npm install --omit=dev --ignore-scripts')||!docker.includes('user-admin.mjs'))fail('docker_packaging');
const rewrites=fb?.hosting?.rewrites||[];
if(!rewrites.some(r=>r?.source==='/api/tenants/**'&&r?.run?.serviceId==='cxorbia-live-hr-dev'))fail('hosting_user_admin_rewrite');

const report={
  schemaVersion:'cxorbia.c6.live-user-admin-source-gate.v1',
  generatedAt:new Date().toISOString(),
  decision:'PASS_C6_STAFF_TARGET_DIGEST_AND_LIVE_USER_ADMIN_BACKEND_SOURCE_ONLY',
  canonicalProjectIds:[canonicalProjectId],
  targets:t.targets.length,
  scopeRequiredOnCreate:true,
  scopeEditable:true,
  futureProjectSilentInheritance:false,
  backendExecutableSource:true,
  staticGate:true,
  providerReads:0,
  providerWrites:0,
  authWrites:0,
  firestoreWrites:0,
  deploys:0,
  merge:false,
  production:false
};
console.log(JSON.stringify(report,null,2));
