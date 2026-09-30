import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const loaderPath = path.join(repoRoot, "firebase", "client-write-tools", "load-cxorbia-v58-pilot-seed-dev.mjs");

function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(loaderPath)) fail("No existe loader", { loaderPath });
const text = fs.readFileSync(loaderPath, "utf8");

const requiredSnippets = [
  "CXORBIA_SEED_MODE",
  "dry-run",
  "CXORBIA_LOAD_V58_PILOT_SEED",
  "YES_PAULA_LOAD_V58_PILOT_SEED_DEV",
  "dev-no-real-data",
  "tenants/tya",
  "No se escribio en Firestore",
  "method: \"PATCH\""
];

const missing = requiredSnippets.filter((snippet) => !text.includes(snippet));
const forbidden = [];
if (/process\.env\.GOOGLE_APPLICATION_CREDENTIALS/.test(text)) forbidden.push("GOOGLE_APPLICATION_CREDENTIALS");
if (/serviceAccount|private_key|client_email/.test(text)) forbidden.push("service-account");
if (/delete\s*\(/i.test(text) || /method:\s*["']DELETE["']/.test(text)) forbidden.push("delete");

if (missing.length || forbidden.length) fail("Loader no cumple controles", { missing, forbidden });

console.log(JSON.stringify({ ok: true, loaderPath, requiredSnippets }, null, 2));
