import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const configCandidates = [
  path.join(repoRoot, "app", "core", "backend-config-preview-dev.js"),
  path.join(repoRoot, "app", "core", "backend-config.js")
];

const AUTH_EMAIL = process.env.CXORBIA_DEV_EMAIL || "admin.tya.dev@cxorbia-dev.example.com";
const AUTH_PASSWORD = process.env.CXORBIA_DEV_PASSWORD || "";
const AUTHORIZATION = process.env.CXORBIA_SMOKE_SPRINT3_ACTIONS || "";
const TENANT_ID = process.env.CXORBIA_TENANT_ID || "tya";
const PROJECT_ID = process.env.CXORBIA_PROJECT_ID || "cinepolis-abril-26";
const REQUIRED_AUTHORIZATION = "YES_PAULA_SMOKE_SPRINT3_OPERATION_ACTIONS_DEV";

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
  if (!password) fail("Falta CXORBIA_DEV_PASSWORD para smoke Sprint 3. No se pedira secreto por consola.");
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.idToken) {
    fail("Auth DEV fallo para smoke Sprint 3", {
      status: res.status,
      email,
      firebaseAuthError: safeFirebaseAuthError(body),
      secretPrinted: false
    });
  }
  return body.idToken;
}

function docUrl(projectId, docPath) {
  const encodedPath = docPath.split("/").map(encodeURIComponent).join("/");
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${encodedPath}`;
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number" && Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === "number") return { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object") {
    const fields = {};
    for (const [key, item] of Object.entries(value)) fields[key] = toFirestoreValue(item);
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) fields[key] = toFirestoreValue(value);
  return { fields };
}

async function readDocument(projectId, token, docPath) {
  const res = await fetch(docUrl(projectId, docPath), {
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

async function createDocument(projectId, token, docPath, data) {
  const parts = docPath.split("/");
  const docId = parts.pop();
  const parentPath = parts.join("/");
  const url = `${docUrl(projectId, parentPath)}?documentId=${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(toFirestoreFields(data))
  });
  const body = await res.text();
  return {
    ok: res.ok,
    path: docPath,
    status: res.status,
    body: res.ok ? undefined : body.slice(0, 500)
  };
}

async function main() {
  if (AUTHORIZATION !== REQUIRED_AUTHORIZATION) {
    fail("Falta autorizacion exacta para smoke Sprint 3", {
      required: `CXORBIA_SMOKE_SPRINT3_ACTIONS=${REQUIRED_AUTHORIZATION}`
    });
  }

  const config = loadConfig();
  const token = await signIn(config.apiKey, AUTH_EMAIL, AUTH_PASSWORD);
  const projectRead = await readDocument(config.projectId, token, `tenants/${TENANT_ID}/projects/${PROJECT_ID}`);
  if (!projectRead.ok || !projectRead.exists) {
    fail("No se pudo leer el proyecto base antes del smoke Sprint 3", {
      projectId: config.projectId,
      tenantId: TENANT_ID,
      cxProjectId: PROJECT_ID,
      projectRead,
      secretPrinted: false
    });
  }

  const stamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const actionId = `act-smoke-sprint3-${stamp}`;
  const common = {
    tenantId: TENANT_ID,
    projectId: PROJECT_ID,
    actionId,
    actionType: "smokeSprint3ResponsibilityLog",
    entityType: "visit",
    entityId: "smoke-visit-no-real-data",
    status: "requested",
    createdAt: new Date().toISOString(),
    createdBy: AUTH_EMAIL,
    source: "smoke-cxorbia-sprint3-operation-actions-dev",
    payload: {
      smoke: true,
      noRealData: true,
      mutatesOperationalEntity: false
    }
  };

  const writes = [
    [
      `tenants/${TENANT_ID}/operationActionLocks/lock-${actionId}`,
      { ...common, idempotencyKey: `lock-${actionId}` }
    ],
    [
      `tenants/${TENANT_ID}/operationActions/${actionId}`,
      { ...common, idempotencyKey: `lock-${actionId}` }
    ],
    [
      `tenants/${TENANT_ID}/operationEvents/evt-${actionId}`,
      { ...common, eventId: `evt-${actionId}`, eventType: "actionRequested" }
    ],
    [
      `tenants/${TENANT_ID}/entityAuditTrail/audit-${actionId}`,
      { ...common, auditId: `audit-${actionId}`, auditType: "operationActionRequested" }
    ],
    [
      `tenants/${TENANT_ID}/projects/${PROJECT_ID}/responsibilityLog/resp-${actionId}`,
      { ...common, responsibilityId: `resp-${actionId}`, responsibilityType: "operationActionRequested" }
    ]
  ];

  const created = [];
  for (const [docPath, data] of writes) created.push(await createDocument(config.projectId, token, docPath, data));
  const failedWrites = created.filter((item) => !item.ok);
  if (failedWrites.length) {
    fail("Smoke Sprint 3 encontro escrituras bloqueadas", {
      projectId: config.projectId,
      configSource: config.source,
      tenantId: TENANT_ID,
      cxProjectId: PROJECT_ID,
      failedWrites,
      created,
      secretPrinted: false
    });
  }

  const reads = [];
  for (const [docPath] of writes) reads.push(await readDocument(config.projectId, token, docPath));
  const failedReads = reads.filter((item) => !item.ok || !item.exists);
  if (failedReads.length) {
    fail("Smoke Sprint 3 escribio pero no pudo leer todos los documentos", {
      projectId: config.projectId,
      configSource: config.source,
      tenantId: TENANT_ID,
      cxProjectId: PROJECT_ID,
      failedReads,
      reads,
      secretPrinted: false
    });
  }

  console.log(JSON.stringify({
    ok: true,
    smoke: "cxorbia-sprint3-operation-actions-dev",
    mode: "write-log-only",
    mutatesOperationalEntity: false,
    tenantId: TENANT_ID,
    cxProjectId: PROJECT_ID,
    firebaseProjectId: config.projectId,
    configSource: config.source,
    createdDocumentCount: created.length,
    created,
    reads,
    secretPrinted: false
  }, null, 2));
}

main().catch((error) => fail("Error inesperado smoke Sprint 3", {
  error: String(error && error.stack ? error.stack : error),
  secretPrinted: false
}));
