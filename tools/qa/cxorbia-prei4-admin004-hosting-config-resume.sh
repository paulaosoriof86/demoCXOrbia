#!/usr/bin/env bash
set -Eeuo pipefail
: "${PREI4_004_SOURCE:?}" "${PREI4_004_TREE:?}" "${PREI4_004_RESUME_OUT:?}" "${PREI4_004_ROOT:?}"
test "$PREI4_004_SOURCE" = "61b89fd567c02c651ce1983d8b8f8421d5e70637"
test "$PREI4_004_TREE" = "61344532ed21d88846f8a658fdec320e605c13ab"
test "$(git rev-parse "$PREI4_004_SOURCE^{tree}")" = "$PREI4_004_TREE"
mkdir -p "$PREI4_004_RESUME_OUT/source-guard" "$PREI4_004_RESUME_OUT/post002" "$PREI4_004_RESUME_OUT/admin003" "$PREI4_004_RESUME_OUT/boundary" "$PREI4_004_RESUME_OUT/finance"

export CUM_SOURCE="$PREI4_004_SOURCE" CUM_TREE="$PREI4_004_TREE"
export CUM_BASE="c487449e5187d7219033c54fa1ac3db5fb6c822e"
export CUM_LEDGER="CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V166_2026-09-30.json"
export CUM_MATRIX="RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json"
export CUM_OUT="$PREI4_004_RESUME_OUT/source-guard"
export CUM_EXPECTED_DELTA_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-c6-unified-human-runtime-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs","backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs"]'
export CUM_ALLOWED_PENDING_MODULES_JSON='["canonical-hr-state-adapters","finance-core-liquidation-costs","human-runtime-domain-consistency","persistence-command-ack-boundary","phase-a-supporting-core","projects-periods-hr-source-wizard-multiproject"]'
export CUM_EXPECTED_PENDING_FILES_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-c6-unified-human-runtime-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs"]'
node tools/qa/cxorbia-prei4-cumulative-regression-source-guard.mjs | tee "$CUM_OUT/console.log"
test "$(jq -r '.decision' "$CUM_OUT/result.json")" = "PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD"
test "$(jq -r '.moduleTruth.moduleCount' "$CUM_OUT/result.json")" = "20"
test "$(jq -r '.closedRegressionTests.financeProviderTests' "$CUM_OUT/result.json")" = "7"
test "$(jq -r '.deploys' "$CUM_OUT/result.json")" = "0"
test "$(jq -r '.writes' "$CUM_OUT/result.json")" = "0"

npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
npx playwright install chromium >/dev/null 2>&1

TOKEN="$(gcloud auth print-access-token)"
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_RESUME_OUT/runtime-before.json"
REV_BEFORE="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_004_RESUME_OUT/runtime-before.json")"
test "$REV_BEFORE" = "cxorbia-live-hr-dev-00229-nxq"
gcloud run revisions describe "$REV_BEFORE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_RESUME_OUT/runtime-revision-before.json"
RAW="$(jq -r '.status.imageDigest // empty' "$PREI4_004_RESUME_OUT/runtime-revision-before.json")"
if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST_BEFORE="$RAW"; else DIGEST_BEFORE="sha256:${RAW##*@sha256:}"; fi
test "$DIGEST_BEFORE" = "sha256:45782480662a18699794811d6e4dd38cf1983e9c6f14eee66ed0b1e585bb9e1b"

curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_004_RESUME_OUT/hosting-before.json"
HOSTING_BEFORE="$(jq -r '.release.version.name // empty' "$PREI4_004_RESUME_OUT/hosting-before.json")"
test -n "$HOSTING_BEFORE"

SOURCE_DIR="$RUNNER_TEMP/cxorbia-prei4-admin004-hosting-source"
rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
trap 'rm -rf "$SOURCE_DIR"' EXIT
git archive "$PREI4_004_SOURCE" | tar -x -C "$SOURCE_DIR"

DEPLOY_EXECUTED=0
test "$HOSTING_BEFORE" = "sites/cxorbia-backend-dev/versions/64b485350d1549e2"

TOKEN="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_004_RESUME_OUT/hosting-after.json"
HOSTING_AFTER="$(jq -r '.release.version.name // empty' "$PREI4_004_RESUME_OUT/hosting-after.json")"
test -n "$HOSTING_AFTER"
test "$HOSTING_AFTER" = "$HOSTING_BEFORE"

STATIC_FILES=(
  app/adapters/cxorbia-cxdata-command-boundary-v1.js
  app/adapters/tya-c6-unified-human-runtime-v1.js
  app/adapters/tya-canonical-finance-read-model-v2.js
  app/adapters/tya-live-source-inplace-apply.js
  app/adapters/tya-protected-auth-hr-authority-bridge-v2.js
  app/modules/finanzas.js
  app/modules/proyectos.js
)
for p in "${STATIC_FILES[@]}"; do
  rel="${p#app/}"
  remote="$PREI4_004_RESUME_OUT/served_$(echo "$rel"|tr '/' '_')"
  curl -fsSL --retry 10 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_004_ROOT/$rel?prei4004host=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"
  test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$PREI4_004_SOURCE:$p"|sha256sum|awk '{print $1}')"
done

gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_RESUME_OUT/runtime-after.json"
REV_AFTER="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_004_RESUME_OUT/runtime-after.json")"
test "$REV_AFTER" = "$REV_BEFORE"
gcloud run revisions describe "$REV_AFTER" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_RESUME_OUT/runtime-revision-after.json"
RAW_AFTER="$(jq -r '.status.imageDigest // empty' "$PREI4_004_RESUME_OUT/runtime-revision-after.json")"
if [[ "$RAW_AFTER" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST_AFTER="$RAW_AFTER"; else DIGEST_AFTER="sha256:${RAW_AFTER##*@sha256:}"; fi
test "$DIGEST_AFTER" = "$DIGEST_BEFORE"

ok=0
for i in $(seq 1 15); do
  curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_004_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&fresh=1&prei4004host=$GITHUB_RUN_ID-$i" > "$PREI4_004_RESUME_OUT/hr-meta.json"
  if jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .refreshError==null and .shopperReconciliation.providerAck==true and .visitReconciliation.providerAck==true and .hrWrites==false and .production==false' "$PREI4_004_RESUME_OUT/hr-meta.json" >/dev/null; then ok=1; break; fi
  sleep 15
done
test "$ok" = "1"
HR_REVISION="$(jq -r '.revision // empty' "$PREI4_004_RESUME_OUT/hr-meta.json")"
[[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]

PREI4_002_LIVE_OUT="$PREI4_004_RESUME_OUT/post002" PREI4_002_ROOT="$PREI4_004_ROOT" PREI4_002_SOURCE="$PREI4_004_SOURCE" PREI4_002_TREE="$PREI4_004_TREE" PREI4_002_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs | tee "$PREI4_004_RESUME_OUT/post002.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/post002/result.json")" = "PASS_PREI4_ADMIN_002_HOSTING_LIVE"

PREI4_003_LIVE_OUT="$PREI4_004_RESUME_OUT/admin003" PREI4_003_ROOT="$PREI4_004_ROOT" PREI4_003_SOURCE="$PREI4_004_SOURCE" PREI4_003_TREE="$PREI4_004_TREE" PREI4_003_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin003-cumulative-live-reproof.mjs | tee "$PREI4_004_RESUME_OUT/admin003.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/admin003/result.json")" = "PASS_PREI4_ADMIN_003_CUMULATIVE_LIVE"

PREI4_004_LIVE_OUT="$PREI4_004_RESUME_OUT/finance" PREI4_004_ROOT="$PREI4_004_ROOT" PREI4_004_SOURCE="$PREI4_004_SOURCE" PREI4_004_TREE="$PREI4_004_TREE" PREI4_004_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin004-cumulative-live-reproof.mjs | tee "$PREI4_004_RESUME_OUT/finance.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/finance/result.json")" = "PASS_PREI4_ADMIN_004_CUMULATIVE_LIVE"
test "$(jq -r '.externalPaymentWrites' "$PREI4_004_RESUME_OUT/finance/result.json")" = "0"
test "$(jq -r '.bankWrites' "$PREI4_004_RESUME_OUT/finance/result.json")" = "0"
test "$(jq -r '.hrWrites' "$PREI4_004_RESUME_OUT/finance/result.json")" = "0"

jq -n -S \
  --arg source "$PREI4_004_SOURCE" --arg tree "$PREI4_004_TREE" \
  --arg hostingBefore "$HOSTING_BEFORE" --arg hostingAfter "$HOSTING_AFTER" \
  --arg runtime "$REV_AFTER" --arg digest "$DIGEST_AFTER" --arg hr "$HR_REVISION" \
  --arg post "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/post002/result.json")" \
  --arg identity "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/admin003/result.json")" \
  --arg finance "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/finance/result.json")" \
  --argjson hostingDeployExecuted "$DEPLOY_EXECUTED" \
  --argjson financeProviderWrites "$(jq -r '.providerAck.providerWrites // 0' "$PREI4_004_RESUME_OUT/finance/result.json")" \
  '{decision:"PASS_PREI4_ADMIN_004_NO_DEPLOY_FINANCE_CLOSURE",sourceSha:$source,sourceTree:$tree,hostingVersionBefore:$hostingBefore,hostingVersionAfter:$hostingAfter,hostingDeployExecuted:0,runtimeRevision:$runtime,runtimeDigest:$digest,hrRevision:$hr,closedRegression:{postulations:$post,identity:$identity},finance:$finance,financeProviderWrites:$financeProviderWrites,builds:0,runtimeDeploys:0,hostingDeploys:0,rulesDeploys:0,externalPaymentWrites:0,bankWrites:0,hrWrites:0,production:false}' > "$PREI4_004_RESUME_OUT/receipt.json"
