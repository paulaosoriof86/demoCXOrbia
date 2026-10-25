import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const rulesPath = path.join(repoRoot, "firestore.rules");

const requiredMatches = [
  "bulletins",
  "bulletinReads",
  "automations",
  "integrationSettings",
  "automationLogs",
  "aiSettings",
  "aiLogs",
  "resources"
];

function result(payload, exitCode) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(exitCode);
}

if (!fs.existsSync(rulesPath)) {
  result({
    ok: false,
    error: "firestore.rules no existe",
    rulesPath
  }, 1);
}

const rules = fs.readFileSync(rulesPath, "utf8");

function findMatch(collection) {
  const re = new RegExp("match\\s+/" + collection + "/\\{[^}]+\\}\\s*\\{");
  return rules.search(re);
}

const ordering = {};
for (const collection of requiredMatches) {
  ordering[collection] = findMatch(collection);
}

const missing = requiredMatches.filter((collection) => ordering[collection] < 0);
const automationsIndex = ordering.automations;
const auditLogsIndex = findMatch("auditLogs");

const insertedAfterAutomations = [
  "integrationSettings",
  "automationLogs",
  "aiSettings",
  "aiLogs",
  "resources"
].every((collection) => {
  const idx = ordering[collection];
  return idx > automationsIndex && (auditLogsIndex < 0 || idx < auditLogsIndex);
});

if (missing.length > 0 || !insertedAfterAutomations) {
  result({
    ok: false,
    missing,
    insertedAfterAutomations,
    ordering,
    auditLogsIndex
  }, 1);
}

result({
  ok: true,
  requiredMatches,
  insertedAfterAutomations,
  ordering,
  auditLogsIndex
}, 0);
