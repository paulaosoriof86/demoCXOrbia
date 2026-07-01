import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const seedPath = path.join(repoRoot, "firebase", "seeds", "cxorbia-v58-tya-julio-pilot-seed.json");
const configCandidates = [
  path.join(repoRoot, "app", "core", "backend-config-preview-dev.js"),
  path.join(repoRoot, "app", "core", "backend-config.js")
];

const MODE = process.env.CXORBIA_SEED_MODE || "dry-run";
const AUTH_EMAIL = process.env.CXORBIA_DEV_EMAIL || "admin.tya.dev@cxorbia-dev.example.com";
const AUTH_PASSWORD = process.env.CXORBIA_DEV_PASSWORD || "";
const AUTHORIZATION = process.env.CXORBIA_LOAD_V58_PILOT_SEED || "";

function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

function safeFirebaseAuthError(body) {
  const message = String(body?.error?.message || "");
  const code = String(body?.error?.code || "");
  const status = String(body?.error?.status || "");
  return {
    code: code || undefined,
    status: status || undefined,
    message: message || undefined
  };
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractConfigValue(text, key) {
  const patterns = [
    new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`),
    new RegExp(`["']${key}["']\\s*:\\s*["']([^"']+)["']`),
    new RegExp(`${key}\\s*=\\s*["']([^"']+)["']`)
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return "";
}

function loadConfig() {
  for (const candidate of configCandidates) {
    if (!fs.existsSync(candidate)) continue;
    const text = readText(candidate);
    const apiKey = extractConfigValue(text, "apiKey");
    const projectId = extractConfigValue(text, "projectId");
    if (apiKey && projectId) return { apiKey, projectId, source: path.relative(repoRoot, candidate) };
  }
  fail("No se pudo leer apiKey/projectId desde backend config.");
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object") {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toFirestoreValue(v)])) } };
  }
  return { stringValue: String(value) };
}

function toFirestoreDocument(data) {
  return { fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toFirestoreValue(v)])) };
}

async function signIn(apiKey, email, password) {
  if (!password) fail("Falta CXORBIA_DEV_PASSWORD para modo write. No se pedira secreto por consola.");
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.idToken) {
    fail("Auth DEV fallo para cargar seed", {
      status: res.status,
      email,
      firebaseAuthError: safeFirebaseAuthError(body),
      secretPrinted: false
    });
  }
  return body.idToken;
}

function validateSeed(seed) {
  if (seed.seedType !== "dev-no-real-data") fail("Seed no es dev-no-real-data", { seedType: seed.seedType });
  if (seed.tenantId !== "tya") fail("Seed no es tenant tya", { tenantId: seed.tenantId });
  if (!Array.isArray(seed.documents) || seed.documents.length < 1) fail("Seed sin documentos");
  const invalidPath = seed.documents.find((doc) => !String(doc.path || "").startsWith("tenants/tya"));
  if (invalidPath) fail("Seed contiene documento fuera de tenant tya", { path: invalidPath.path });
  const sensitive = JSON.stringify(seed).match(/\b(dpi|nit|iban|cuenta bancaria|password real|telefono real)\b/i);
  if (sensitive) fail("Seed contiene posible dato sensible", { match: sensitive[0] });
}

async function writeDocument(projectId, token, doc) {
  const encodedPath = doc.path.split("/").map(encodeURIComponent).join("/");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${encodedPath}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(toFirestoreDocument(doc.data))
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, path: doc.path, status: res.status, error: text.slice(0, 500) };
  return { ok: true, path: doc.path, status: res.status };
}

async function main() {
  if (!fs.existsSync(seedPath)) fail("No existe seed piloto", { seedPath });
  const seed = JSON.parse(readText(seedPath));
  validateSeed(seed);
  const config = loadConfig();

  const base = {
    ok: true,
    mode: MODE,
    seedId: seed.seedId,
    seedType: seed.seedType,
    tenantId: seed.tenantId,
    projectId: config.projectId,
    configSource: config.source,
    documentCount: seed.documents.length,
    paths: seed.documents.map((doc) => doc.path)
  };

  if (MODE !== "write") {
    console.log(JSON.stringify({ ...base, dryRun: true, message: "Dry-run OK. No se escribio en Firestore." }, null, 2));
    return;
  }

  if (AUTHORIZATION !== "YES_PAULA_LOAD_V58_PILOT_SEED_DEV") {
    fail("Falta autorizacion exacta para escribir seed", { required: "CXORBIA_LOAD_V58_PILOT_SEED=YES_PAULA_LOAD_V58_PILOT_SEED_DEV" });
  }

  const token = await signIn(config.apiKey, AUTH_EMAIL, AUTH_PASSWORD);
  const writes = [];
  for (const doc of seed.documents) writes.push(await writeDocument(config.projectId, token, doc));
  const failed = writes.filter((item) => !item.ok);
  if (failed.length) fail("Algunos documentos no se escribieron", { failed, writes });
  console.log(JSON.stringify({ ...base, dryRun: false, writeOk: true, writes }, null, 2));
}

main().catch((error) => fail("Error inesperado loader seed", { error: String(error && error.stack ? error.stack : error) }));
