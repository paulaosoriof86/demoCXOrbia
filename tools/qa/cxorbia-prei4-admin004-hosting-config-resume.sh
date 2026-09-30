#!/usr/bin/env bash
set -Eeuo pipefail
: "${PREI4_004_SOURCE:?}" "${PREI4_004_TREE:?}" "${PREI4_004_RESUME_OUT:?}" "${PREI4_004_ROOT:?}"
test "$PREI4_004_SOURCE" = "4a39b26f6dcdff8f4dcd446b0141a7d3b1dc01d7"
test "$PREI4_004_TREE" = "3cdf4b1b3e6b6316e89f9bd249606f081258d07a"
test "$(git rev-parse "$PREI4_004_SOURCE^{tree}")" = "$PREI4_004_TREE"
test "$GITHUB_RUN_ATTEMPT" = "1"
mkdir -p "$PREI4_004_RESUME_OUT/source-guard" "$PREI4_004_RESUME_OUT/post002" "$PREI4_004_RESUME_OUT/admin003" "$PREI4_004_RESUME_OUT/finance"

export CUM_SOURCE="$PREI4_004_SOURCE" CUM_TREE="$PREI4_004_TREE"
export CUM_BASE="c487449e5187d7219033c54fa1ac3db5fb6c822e"
export CUM_LEDGER="CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V152_2026-09-30.json"
export CUM_MATRIX="RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json"
export CUM_OUT="$PREI4_004_RESUME_OUT/source-guard"
export CUM_EXPECTED_DELTA_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs","backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs"]'
export CUM_ALLOWED_PENDING_MODULES_JSON='["canonical-hr-state-adapters","finance-core-liquidation-costs","persistence-command-ack-boundary","phase-a-supporting-core","projects-periods-hr-source-wizard-multiproject"]'
export CUM_EXPECTED_PENDING_FILES_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs"]'
node tools/qa/cxorbia-prei4-cumulative-regression-source-guard.mjs | tee "$CUM_OUT/console.log"
test "$(jq -r '.decision' "$CUM_OUT/result.json")" = "PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD"

npm install --no-save --ignore-scripts --package-lock=false firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
npx playwright install chromium >/dev/null 2>&1
for f in tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs tools/qa/cxorbia-prei4-admin003-cumulative-live-reproof.mjs tools/qa/cxorbia-prei4-admin004-cumulative-live-reproof.mjs; do
  node --check "$f"
  if grep -Eq '(^|[^.[:alnum:]_])firebase\.auth\(' "$f"; then
    echo "ENVIRONMENT_FAILURE:BARE_FIREBASE_AUTH_HELPER:$f" >&2
    exit 1
  fi
done

TOKEN="$(gcloud auth print-access-token)"
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_RESUME_OUT/runtime-before.json"
REV_BEFORE="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_004_RESUME_OUT/runtime-before.json")"
test "$REV_BEFORE" = "cxorbia-live-hr-dev-00229-nxq"
gcloud run revisions describe "$REV_BEFORE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_RESUME_OUT/runtime-revision-before.json"
RAW="$(jq -r '.status.imageDigest // empty' "$PREI4_004_RESUME_OUT/runtime-revision-before.json")"
if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST_BEFORE="$RAW"; else DIGEST_BEFORE="sha256:${RAW##*@sha256:}"; fi
test "$DIGEST_BEFORE" = "sha256:45782480662a18699794811d6e4dd38cf1983e9c6f14eee66ed0b1e585bb9e1b"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_004_RESUME_OUT/hosting-current.json"
HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$PREI4_004_RESUME_OUT/hosting-current.json")"
test "$HOSTING_VERSION" = "sites/cxorbia-backend-dev/versions/4f12336223412365"
for p in app/adapters/cxorbia-cxdata-command-boundary-v1.js app/adapters/tya-canonical-finance-read-model-v2.js app/adapters/tya-live-source-inplace-apply.js app/adapters/tya-protected-auth-hr-authority-bridge-v2.js app/modules/finanzas.js app/modules/proyectos.js; do
  rel="${p#app/}"; remote="$PREI4_004_RESUME_OUT/served_$(echo "$rel"|tr '/' '_')"
  curl -fsSL --retry 10 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_004_ROOT/$rel?prei4004resume=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"
  test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$PREI4_004_SOURCE:$p"|sha256sum|awk '{print $1}')"
done
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_RESUME_OUT/runtime-after.json"
REV_AFTER="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_004_RESUME_OUT/runtime-after.json")"
test "$REV_AFTER" = "$REV_BEFORE"

node --check tools/qa/cxorbia-prei4-admin004-project-config-http-write.mjs
node tools/qa/cxorbia-prei4-admin004-project-config-http-write.mjs | tee "$PREI4_004_RESUME_OUT/project-config-write.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/project-config-write.json")" = "PASS_PREI4_ADMIN_004_PROJECT_CONFIG_ACK"

ok=0
for i in $(seq 1 15); do
  curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_004_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&fresh=1&prei4004resume=$GITHUB_RUN_ID-$i" > "$PREI4_004_RESUME_OUT/hr-meta.json"
  if jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .refreshError==null and .shopperReconciliation.providerAck==true and .visitReconciliation.providerAck==true and .hrWrites==false and .production==false' "$PREI4_004_RESUME_OUT/hr-meta.json" >/dev/null; then ok=1; break; fi
  sleep 15
done
test "$ok" = 1
HR_REVISION="$(jq -r '.revision // empty' "$PREI4_004_RESUME_OUT/hr-meta.json")"; [[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]

PREI4_002_LIVE_OUT="$PREI4_004_RESUME_OUT/post002" PREI4_002_ROOT="$PREI4_004_ROOT" PREI4_002_SOURCE="$PREI4_004_SOURCE" PREI4_002_TREE="$PREI4_004_TREE" PREI4_002_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs | tee "$PREI4_004_RESUME_OUT/post002.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/post002/result.json")" = "PASS_PREI4_ADMIN_002_HOSTING_LIVE"
PREI4_003_LIVE_OUT="$PREI4_004_RESUME_OUT/admin003" PREI4_003_ROOT="$PREI4_004_ROOT" PREI4_003_SOURCE="$PREI4_004_SOURCE" PREI4_003_TREE="$PREI4_004_TREE" PREI4_003_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin003-cumulative-live-reproof.mjs | tee "$PREI4_004_RESUME_OUT/admin003.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/admin003/result.json")" = "PASS_PREI4_ADMIN_003_CUMULATIVE_LIVE"

PREI4_004_LIVE_OUT="$PREI4_004_RESUME_OUT/finance" PREI4_004_ROOT="$PREI4_004_ROOT" PREI4_004_SOURCE="$PREI4_004_SOURCE" PREI4_004_TREE="$PREI4_004_TREE" PREI4_004_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin004-cumulative-live-reproof.mjs | tee "$PREI4_004_RESUME_OUT/finance.log"
test "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/finance/result.json")" = "PASS_PREI4_ADMIN_004_CUMULATIVE_LIVE"
test "$(jq -r '.externalPaymentWrites' "$PREI4_004_RESUME_OUT/finance/result.json")" = "0"
test "$(jq -r '.bankWrites' "$PREI4_004_RESUME_OUT/finance/result.json")" = "0"
test "$(jq -r '.hrWrites' "$PREI4_004_RESUME_OUT/finance/result.json")" = "0"

jq -n -S   --arg source "$PREI4_004_SOURCE" --arg tree "$PREI4_004_TREE" --arg runtime "$REV_AFTER" --arg digest "$DIGEST_BEFORE" --arg hosting "$HOSTING_VERSION" --arg hr "$HR_REVISION"   --arg config "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/project-config-write.json")"   --arg post "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/post002/result.json")"   --arg identity "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/admin003/result.json")"   --arg finance "$(jq -r '.decision' "$PREI4_004_RESUME_OUT/finance/result.json")"   --argjson configWrite "$(jq -r 'if .writeExecuted then 1 else 0 end' "$PREI4_004_RESUME_OUT/project-config-write.json")"   --argjson financeWrites "$(jq -r '.providerAck.providerWrites // 0' "$PREI4_004_RESUME_OUT/finance/result.json")"   '{decision:"PASS_PREI4_ADMIN_004_PROVIDER_NO_DEPLOY_RESUME",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:$hr,projectConfig:$config,closedRegression:{postulations:$post,identity:$identity},finance:$finance,configCommandExecuted:$configWrite,financeProviderWrites:$financeWrites,builds:0,runtimeDeploys:0,hostingDeploys:0,rulesDeploys:0,externalPaymentWrites:0,bankWrites:0,hrWrites:0,production:false}' > "$PREI4_004_RESUME_OUT/receipt.json"
