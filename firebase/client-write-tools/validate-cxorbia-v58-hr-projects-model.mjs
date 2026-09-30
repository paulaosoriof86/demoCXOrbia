import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const schemaPath = path.join(repoRoot, "firebase", "schema", "cxorbia-v58-hr-projects-model.json");

function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  fail("No existe schema", { schemaPath });
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const requiredCollections = [
  "tenants/{tenantId}",
  "tenants/{tenantId}/projects/{projectId}",
  "tenants/{tenantId}/projects/{projectId}/periods/{periodId}",
  "tenants/{tenantId}/projects/{projectId}/hrImports/{importId}",
  "tenants/{tenantId}/projects/{projectId}/branches/{branchId}",
  "tenants/{tenantId}/projects/{projectId}/visits/{visitId}",
  "tenants/{tenantId}/projects/{projectId}/applications/{applicationId}",
  "tenants/{tenantId}/shoppers/{shopperId}",
  "tenants/{tenantId}/shopperStats/{shopperId}",
  "tenants/{tenantId}/projects/{projectId}/notifications/{notificationId}",
  "tenants/{tenantId}/projects/{projectId}/responsibilityLog/{logId}"
];

const missing = requiredCollections.filter((key) => !schema.collections || !schema.collections[key]);
const invalidRequiredFields = [];

for (const [key, def] of Object.entries(schema.collections || {})) {
  if (!Array.isArray(def.requiredFields) || def.requiredFields.length < 1) {
    invalidRequiredFields.push(key);
  }
}

const rules = schema.rules || {};
const requiredRules = [
  "noRealDataInSchema",
  "allCollectionsSegmentedByTenant",
  "projectDataUnderTenantProject",
  "bankAndNdaDataMustBeEncryptedWhenReal",
  "demoDataMustNotPolluteTenantTya"
];

const missingRules = requiredRules.filter((key) => rules[key] !== true);

if (missing.length || invalidRequiredFields.length || missingRules.length) {
  fail("Schema V58 incompleto", { missing, invalidRequiredFields, missingRules });
}

console.log(JSON.stringify({
  ok: true,
  schemaPath,
  requiredCollections,
  requiredRules
}, null, 2));
