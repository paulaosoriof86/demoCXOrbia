import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const rulesPath = path.join(repoRoot, "firestore.rules");

function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

if (!fs.existsSync(rulesPath)) fail("No existe firestore.rules", { rulesPath });

const rules = fs.readFileSync(rulesPath, "utf8");

const requiredSnippets = [
  "allow create, update: if tenantAllowed(tenantId) && isAdmin();",
  "allow delete: if tenantAllowed(tenantId) && isSuper();",
  "match /shopperStats/{shopperIdParam}",
  "match /periods/{periodId}",
  "match /hrImports/{importId}",
  "match /branches/{branchId}",
  "match /applications/{applicationId}",
  "match /notifications/{notificationId}",
  "match /responsibilityLog/{logId}"
];

const missing = requiredSnippets.filter((snippet) => !rules.includes(snippet));

const forbidden = [];
if (!rules.includes("match /{document=**}")) forbidden.push("missing-default-deny");
if (!rules.includes("allow read, write: if false;")) forbidden.push("missing-default-deny-rule");

if (missing.length || forbidden.length) fail("Rules V58 seed coverage incompleta", { missing, forbidden });

console.log(JSON.stringify({
  ok: true,
  rulesPath,
  requiredSnippets
}, null, 2));