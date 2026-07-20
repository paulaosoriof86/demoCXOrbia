#!/usr/bin/env bash
set -euo pipefail
OUT="${CXORBIA_OUT_DIR:-.tmp/v164-corte1-dev-deploy}"
LABEL="${CXORBIA_RUNTIME_BUILD_LABEL:-v164-corte1-reportes-20260720-dev}"
BASE_URL="${CXORBIA_BASE_URL:-http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible}"
FROZEN_SOURCE_URL="${CXORBIA_FROZEN_SOURCE_URL:-}"
mkdir -p "$OUT"
node tools/qa/verify-fast-lane-promotion-policy.mjs
node tools/qa/verify-prototype-baseline-atomicity.mjs
node tools/qa/verify-v164-corte1-reportes-lock.mjs
node --check app/modules/cliente-extra.js
node --check app/vendor/pptxgenjs.min.js
node tools/qa/tya-corte1-report-frontend-consumer-acceptance.mjs --out "$OUT/report-frontend-acceptance"
node tools/qa/tya-corte1-report-frontend-runtime-gate.mjs --out "$OUT/report-frontend-runtime"
if [[ -n "$FROZEN_SOURCE_URL" ]]; then
  mkdir -p "$OUT/frozen-source"
  curl -fsSL -H 'Cache-Control: no-cache' "$FROZEN_SOURCE_URL?ts=$(date +%s)" -o app/data/tya-hr-source-safe-periods.js
  cp app/data/tya-hr-source-safe-periods.js "$OUT/frozen-source/tya-hr-source-safe-periods.js"
else
  CXORBIA_HR_SOURCE_SAFE_OUT=app/data/tya-hr-source-safe-periods.js CXORBIA_HR_LIVE_MAX_ROW=140 CXORBIA_HR_LIVE_MAX_COL=AI CXORBIA_HR_EARLIEST_PERIOD=2025-06 CXORBIA_GATE_OUT="$OUT/r20-source" node tools/hr-source/tya-build-live-hr-source-safe-r20.mjs
  node tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs --input app/data/tya-hr-source-safe-periods.js --out app/data/tya-hr-source-safe-periods.js --inventory backend/contracts/tya-hr-tab-inventory-r20-v1.json --report-dir "$OUT/inventory"
  node tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs --input app/data/tya-hr-source-safe-periods.js --out app/data/tya-hr-source-safe-periods.js --report-dir "$OUT/r18a"
  node tools/hr-source/tya-reapply-canonical-state-r20.mjs --input app/data/tya-hr-source-safe-periods.js --out app/data/tya-hr-source-safe-periods.js --report-dir "$OUT/r21"
fi
node tools/qa/tya-corte1-context-history-reports-gate.mjs --payload app/data/tya-hr-source-safe-periods.js --contract backend/contracts/phase-a-corte1-context-history-reports-v1.json --frontend app/modules/cliente-extra.js --out "$OUT/corte1-context"
node tools/release/tya-source-safe-binding-build-r18a.mjs --html app/index.html --out "$OUT/binding"
node tools/release/tya-corte1-report-projection-build.mjs --payload app/data/tya-hr-source-safe-periods.js --contract backend/contracts/phase-a-corte1-context-history-reports-v1.json --html app/index.html --out app/adapters/tya-corte1-report-projection.js --report-dir "$OUT/report-projection-build"
node - "$OUT/report-projection-build/report.json" <<'NODE'
const fs=require('fs');
const report=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const expected={visits:616,assigned:611,unassigned:5,performed:592,questionnaire:590,submitted:527,paymentConfirmed:0};
for(const [key,want] of Object.entries(expected))if(Number(report.totals?.[key])!==want)throw new Error(`approved snapshot mismatch ${key}: ${report.totals?.[key]}/${want}`);
console.log(JSON.stringify({ok:true,decision:'PASS_V164_APPROVED_SOURCE_TOTALS',totals:report.totals},null,2));
NODE
node tools/qa/tya-r18a-canonical-assets-integration-validate.mjs --payload app/data/tya-hr-source-safe-periods.js --adapter app/adapters/tya-phase-a-source-safe-dev-adapter-r18a.js --out "$OUT/integration"
export CXORBIA_EXPECT_TENANT_ID=tya CXORBIA_EXPECT_PROJECT_ID=cinepolis CXORBIA_EXPECT_PERIODS=14 CXORBIA_EXPECT_VISITS=616 CXORBIA_EXPECT_SHOPPERS=216 CXORBIA_MAX_SOURCE_AGE_HOURS=168
node tools/qa/tya-postulation-eligibility-r21-gate.mjs --out "$OUT/postulation"
node tools/qa/tya-source-semantics-r21-gate.mjs --base-url "$BASE_URL" --out "$OUT/semantics"
node tools/qa/tya-corte1-report-projection-browser-gate.mjs --base-url "$BASE_URL" --out "$OUT/report-browser"
node tools/qa/tya-phase-a-source-safe-visual-smoke.mjs --base-url "$BASE_URL" --out "$OUT/roles-academy"
CXORBIA_RUNTIME_BUILD_LABEL="$LABEL" CXORBIA_OUT_DIR="$OUT" node tools/release/tya-r21-write-build-proof.mjs
