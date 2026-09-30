#!/usr/bin/env bash
set -Eeuo pipefail
: "${PREI4_004_SOURCE:?}" "${PREI4_004_TREE:?}" "${PREI4_004_RESUME_OUT:?}" "${PREI4_004_ROOT:?}"
test "$PREI4_004_SOURCE" = "4a39b26f6dcdff8f4dcd446b0141a7d3b1dc01d7"
test "$PREI4_004_TREE" = "3cdf4b1b3e6b6316e89f9bd249606f081258d07a"
test "$(git rev-parse "$PREI4_004_SOURCE^{tree}")" = "$PREI4_004_TREE"
mkdir -p "$PREI4_004_RESUME_OUT/source-guard" "$PREI4_004_RESUME_OUT/cache-diagnostic"

export CUM_SOURCE="$PREI4_004_SOURCE" CUM_TREE="$PREI4_004_TREE"
export CUM_BASE="c487449e5187d7219033c54fa1ac3db5fb6c822e"
export CUM_LEDGER="CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V153_2026-09-30.json"
export CUM_MATRIX="RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json"
export CUM_OUT="$PREI4_004_RESUME_OUT/source-guard"
export CUM_EXPECTED_DELTA_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs","backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs"]'
export CUM_ALLOWED_PENDING_MODULES_JSON='["canonical-hr-state-adapters","finance-core-liquidation-costs","persistence-command-ack-boundary","phase-a-supporting-core","projects-periods-hr-source-wizard-multiproject"]'
export CUM_EXPECTED_PENDING_FILES_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs"]'
node tools/qa/cxorbia-prei4-cumulative-regression-source-guard.mjs | tee "$CUM_OUT/console.log"
test "$(jq -r '.decision' "$CUM_OUT/result.json")" = "PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD"

npm install --no-save --ignore-scripts --package-lock=false firebase-admin@13.4.0 >/dev/null 2>&1
export PREI4_004_DIAG_OUT="$PREI4_004_RESUME_OUT/cache-diagnostic"
node --check tools/qa/cxorbia-prei4-admin004-finance-config-cache-diagnostic.mjs
node tools/qa/cxorbia-prei4-admin004-finance-config-cache-diagnostic.mjs | tee "$PREI4_004_RESUME_OUT/cache-diagnostic.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/cache-diagnostic/result.json")" = "PASS_PREI4_ADMIN_004_RUNTIME_PROJECT_CONFIG_CACHE_DIAGNOSTIC"
test "$(jq -r '.writes' "$PREI4_004_RESUME_OUT/cache-diagnostic/result.json")" = "0"
test "$(jq -r '.builds' "$PREI4_004_RESUME_OUT/cache-diagnostic/result.json")" = "0"
test "$(jq -r '.deploys' "$PREI4_004_RESUME_OUT/cache-diagnostic/result.json")" = "0"
