#!/usr/bin/env bash
set -euo pipefail
OUT="${CXORBIA_OUT_DIR:-.tmp/r21-dev-deploy}"
LABEL="${CXORBIA_RUNTIME_BUILD_LABEL:-v161c-r21-source-safe-20260719-dev}"
BASE_URL="${CXORBIA_BASE_URL:-http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible}"
mkdir -p "$OUT"
node tools/qa/verify-fast-lane-promotion-policy.mjs
node tools/qa/verify-prototype-baseline-atomicity.mjs
node tools/release/tya-v161c-empalme-directo-verify.mjs
CXORBIA_HR_SOURCE_SAFE_OUT=app/data/tya-hr-source-safe-periods.js CXORBIA_HR_LIVE_MAX_ROW=140 CXORBIA_HR_LIVE_MAX_COL=AI CXORBIA_HR_EARLIEST_PERIOD=2025-06 CXORBIA_GATE_OUT="$OUT/r20-source" node tools/hr-source/tya-build-live-hr-source-safe-r20.mjs
node tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs --input app/data/tya-hr-source-safe-periods.js --out app/data/tya-hr-source-safe-periods.js --inventory backend/contracts/tya-hr-tab-inventory-r20-v1.json --report-dir "$OUT/inventory"
node tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs --input app/data/tya-hr-source-safe-periods.js --out app/data/tya-hr-source-safe-periods.js --report-dir "$OUT/r18a"
node tools/hr-source/tya-reapply-canonical-state-r20.mjs --input app/data/tya-hr-source-safe-periods.js --out app/data/tya-hr-source-safe-periods.js --report-dir "$OUT/r21"
node tools/release/tya-source-safe-binding-build-r18a.mjs --html app/index.html --out "$OUT/binding"
node tools/qa/tya-r18a-canonical-assets-integration-validate.mjs --payload app/data/tya-hr-source-safe-periods.js --adapter app/adapters/tya-phase-a-source-safe-dev-adapter-r18a.js --out "$OUT/integration"
CXORBIA_RUNTIME_BUILD_LABEL="$LABEL" CXORBIA_OUT_DIR="$OUT" node tools/release/tya-r21-write-build-proof.mjs
export CXORBIA_EXPECT_TENANT_ID=tya CXORBIA_EXPECT_PROJECT_ID=cinepolis CXORBIA_EXPECT_PERIODS=14 CXORBIA_EXPECT_VISITS=616 CXORBIA_EXPECT_SHOPPERS=216 CXORBIA_MAX_SOURCE_AGE_HOURS=24
node tools/qa/tya-postulation-eligibility-r21-gate.mjs --out "$OUT/postulation"
node tools/qa/tya-source-semantics-r21-gate.mjs --base-url "$BASE_URL" --out "$OUT/semantics"
node tools/qa/tya-phase-a-source-safe-visual-smoke.mjs --base-url "$BASE_URL" --out "$OUT/roles-academy"
