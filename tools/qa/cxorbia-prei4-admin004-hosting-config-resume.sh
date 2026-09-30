#!/usr/bin/env bash
set -Eeuo pipefail
: "${PREI4_004_SOURCE:?}" "${PREI4_004_TREE:?}" "${PREI4_004_RESUME_OUT:?}" "${PREI4_004_ROOT:?}"
test "$PREI4_004_SOURCE" = "4a39b26f6dcdff8f4dcd446b0141a7d3b1dc01d7"
test "$PREI4_004_TREE" = "3cdf4b1b3e6b6316e89f9bd249606f081258d07a"
test "$(git rev-parse "$PREI4_004_SOURCE^{tree}")" = "$PREI4_004_TREE"
mkdir -p "$PREI4_004_RESUME_OUT/source-guard" "$PREI4_004_RESUME_OUT/propagation"

export CUM_SOURCE="$PREI4_004_SOURCE" CUM_TREE="$PREI4_004_TREE"
export CUM_BASE="c487449e5187d7219033c54fa1ac3db5fb6c822e"
export CUM_LEDGER="CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V155_2026-09-30.json"
export CUM_MATRIX="RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json"
export CUM_OUT="$PREI4_004_RESUME_OUT/source-guard"
export CUM_EXPECTED_DELTA_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs","backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs"]'
export CUM_ALLOWED_PENDING_MODULES_JSON='["canonical-hr-state-adapters","finance-core-liquidation-costs","persistence-command-ack-boundary","phase-a-supporting-core","projects-periods-hr-source-wizard-multiproject"]'
export CUM_EXPECTED_PENDING_FILES_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs"]'
node tools/qa/cxorbia-prei4-cumulative-regression-source-guard.mjs | tee "$CUM_OUT/console.log"
test "$(jq -r '.decision' "$CUM_OUT/result.json")" = "PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD"

npm install --no-save --ignore-scripts --package-lock=false firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1\nnpx playwright install chromium >/dev/null 2>&1
export PREI4_004_PROP_OUT="$PREI4_004_RESUME_OUT/propagation"
export PREI4_004_HR_REVISION="0b2f989af18f15ee429a504a4d628cb12b34153fce23bd730c8c74c8228d7877"
node --check tools/qa/cxorbia-prei4-admin004-honorarium-propagation-diagnostic.mjs
node tools/qa/cxorbia-prei4-admin004-honorarium-propagation-diagnostic.mjs | tee "$PREI4_004_RESUME_OUT/propagation.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/propagation/result.json")" = "PASS_PREI4_ADMIN_004_HONORARIUM_PROPAGATION_DIAGNOSTIC"
test "$(jq -r '.writes' "$PREI4_004_RESUME_OUT/propagation/result.json")" = "0"
test "$(jq -r '.builds' "$PREI4_004_RESUME_OUT/propagation/result.json")" = "0"
test "$(jq -r '.deploys' "$PREI4_004_RESUME_OUT/propagation/result.json")" = "0"
