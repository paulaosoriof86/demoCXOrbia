import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const adapterPath = path.join(repoRoot, "app", "core", "backend-firebase.js");

function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(adapterPath)) fail("No existe backend-firebase.js", { adapterPath });
const text = fs.readFileSync(adapterPath, "utf8");

const requiredSnippets = [
  "normalizeProject",
  "normalizeShopper",
  "normalizeVisit",
  "normalizeApplication",
  "subCol(projectId, 'applications')",
  "postulations.concat(applications)",
  "estado: v.estado || v.status || 'disponible'",
  "disponibleDesde: v.disponibleDesde || v.availableFrom || ''",
  "honorario: v.honorario || fee.amount || 0",
  "currency: v.currency || fee.currency || ''",
  "fechaProp: a.fechaProp || a.proposedDate || ''"
];

const missing = requiredSnippets.filter((snippet) => !text.includes(snippet));
const forbidden = [];
if (/serviceAccount|private_key|client_email/.test(text)) forbidden.push("service-account");
if (/process\.env\.GOOGLE_APPLICATION_CREDENTIALS/.test(text)) forbidden.push("GOOGLE_APPLICATION_CREDENTIALS");
if (/method:\s*["']DELETE["']/.test(text)) forbidden.push("delete-method");

if (missing.length || forbidden.length) fail("Adapter no cumple normalizacion V59", { missing, forbidden });

console.log(JSON.stringify({
  ok: true,
  adapterPath,
  requiredSnippets
}, null, 2));
