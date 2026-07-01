import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const schemaPath = path.join(repoRoot, "firebase", "schema", "cxorbia-v58-hr-projects-model.json");
const seedPath = path.join(repoRoot, "firebase", "seeds", "cxorbia-v58-tya-julio-pilot-seed.json");

function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) fail("No existe schema", { schemaPath });
if (!fs.existsSync(seedPath)) fail("No existe seed", { seedPath });

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

if (seed.seedType !== "dev-no-real-data") {
  fail("Seed no declara tipo dev-no-real-data", { seedType: seed.seedType });
}

if (seed.tenantId !== "tya") {
  fail("Seed no esta segmentado para tenant tya", { tenantId: seed.tenantId });
}

if (!Array.isArray(seed.documents) || seed.documents.length < 1) {
  fail("Seed no contiene documentos");
}

const requiredPrefixes = [
  "tenants/tya",
  "tenants/tya/projects/",
  "tenants/tya/projects/",
  "tenants/tya/shoppers/",
  "tenants/tya/shopperStats/"
];

const paths = seed.documents.map((doc) => doc.path);
const invalidPath = paths.find((p) => !p.startsWith("tenants/tya"));
if (invalidPath) fail("Documento fuera de tenant tya", { invalidPath });

const requiredExactOrIncludes = [
  "tenants/tya",
  "/periods/",
  "/visits/",
  "/applications/",
  "/shoppers/",
  "/shopperStats/"
];

const missing = requiredExactOrIncludes.filter((needle) => {
  if (needle === "tenants/tya") return !paths.includes(needle);
  return !paths.some((p) => p.includes(needle));
});

if (missing.length) {
  fail("Seed piloto incompleto", { missing, paths });
}

const docsWithoutData = seed.documents.filter((doc) => !doc.data || typeof doc.data !== "object").map((doc) => doc.path);
if (docsWithoutData.length) {
  fail("Hay documentos sin data", { docsWithoutData });
}

const realDataRisk = JSON.stringify(seed).match(/\b(dpi|nit|cuenta bancaria|iban|password real|telefono real)\b/i);
if (realDataRisk) {
  fail("Seed parece contener dato sensible o real", { match: realDataRisk[0] });
}

console.log(JSON.stringify({
  ok: true,
  schemaVersion: schema.version,
  seedId: seed.seedId,
  seedType: seed.seedType,
  documentCount: seed.documents.length,
  paths
}, null, 2));
