import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const seedPath = path.join(repoRoot, "firebase", "seeds", "cxorbia-v58-tya-julio-pilot-seed.json");
const configCandidates = [
  path.join(repoRoot, "app", "core", "backend-config-preview-dev.js"),
  path.join(repoRoot, "app", "core", "backend-config.js")
];

const AUTH_EMAIL = process.env.CXORBIA_DEV_EMAIL || "admin.tya.dev@cxorbia-dev.example.com";
const AUTH_PASSWORD = process.env.CXORBIA_DEV_PASSWORD || "";
const AUTHORIZATION = process.env.CXORBIA_SMOKE_V58_PILOT_SEED_READ || "";

function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
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

function safeFirebaseAuthError(body) {
  return {
    code: body?.error?.code,
    status: body?.error?.status,
    message: body?.error?.message
  };
}

async function signIn(apiKey, email, password) {
  if (!password) fail("Falta CXORBIA_DEV_PASSWORD para smoke read-only. No se pedira secreto por consola.");
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.idToken) {
    fail("Auth DEV fallo para smoke read-only", {
      status: res.status,
      email,
      firebaseAuthError: safeFirebaseAuthError(body),
      secretPrinted: false
    });
  }
  return body.idToken;
}

async function readDocument(projectId, token, docPath) {
  const encodedPath = docPath.split("/").map(encodeURIComponent).join("/");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${encodedPath}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` }
  });
  const body = await res.text();
  return {
    ok: res.ok,
    path: docPath,
    status: res.status,
    exists: res.status === 200,
    body: res.ok ? undefined : body.slice(0, 500)
  };
}

async function main() {
  if (AUTHORIZATION !== "YES_PAULA_SMOKE_V58_PILOT_SEED_READ_DEV") {
    fail("Falta autorizacion exacta para smoke read-only", {
      required: "CXORBIA_SMOKE_V58_PILOT_SEED_READ=YES_PAULA_SMOKE_V58_PILOT_SEED_READ_DEV"
    });
  }
  if (!fs.existsSync(seedPath)) fail("No existe seed piloto", { seedPath });
  const seed = JSON.parse(readText(seedPath));
  if (seed.seedType !== "dev-no-real-data") fail("Seed no es dev-no-real-data", { seedType: seed.seedType });
  if (seed.tenantId !== "tya") fail("Seed no es tenant tya", { tenantId: seed.tenantId });
  if (!Array.isArray(seed.documents) || seed.documents.length < 1) fail("Seed sin documentos");

  const config = loadConfig();
  const token = await signIn(config.apiKey, AUTH_EMAIL, AUTH_PASSWORD);
  const reads = [];
  for (const doc of seed.documents) reads.push(await readDocument(config.projectId, token, doc.path));
  const failed = reads.filter((item) => !item.ok || !item.exists);
  if (failed.length) {
    fail("Smoke read-only encontro documentos faltantes o bloqueados", {
      projectId: config.projectId,
      configSource: config.source,
      failed,
      reads,
      secretPrinted: false
    });
  }
  console.log(JSON.stringify({
    ok: true,
    smoke: "cxorbia-v58-pilot-seed-read-dev",
    mode: "read-only",
    tenantId: seed.tenantId,
    projectId: config.projectId,
    configSource: config.source,
    documentCount: seed.documents.length,
    reads,
    secretPrinted: false
  }, null, 2));
}

main().catch((error) => fail("Error inesperado smoke read-only", {
  error: String(error && error.stack ? error.stack : error),
  secretPrinted: false
}));
