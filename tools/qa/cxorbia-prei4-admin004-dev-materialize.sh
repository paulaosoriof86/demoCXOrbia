#!/usr/bin/env bash
set -Eeuo pipefail
: "${PREI4_004_SOURCE:?}" "${PREI4_004_TREE:?}" "${PREI4_004_OUT:?}" "${PREI4_004_ROOT:?}"
test "$PREI4_004_SOURCE" = "00ca442a9628805267835230fd1028d7844a690d"
test "$PREI4_004_TREE" = "48aab5458926e3167dfc7b806a49902f8f1769ee"
test "$(git rev-parse "$PREI4_004_SOURCE^{tree}")" = "$PREI4_004_TREE"
test "$GITHUB_RUN_ATTEMPT" = "1"
mkdir -p "$PREI4_004_OUT"
export CUM_SOURCE="$PREI4_004_SOURCE" CUM_TREE="$PREI4_004_TREE"
export CUM_BASE="c487449e5187d7219033c54fa1ac3db5fb6c822e"
export CUM_LEDGER="CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V138_2026-09-29.json"
export CUM_MATRIX="RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json"
export CUM_OUT="$PREI4_004_OUT/source-guard"
export CUM_EXPECTED_DELTA_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs","backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs"]'
export CUM_ALLOWED_PENDING_MODULES_JSON='["canonical-hr-state-adapters","finance-core-liquidation-costs","persistence-command-ack-boundary","phase-a-supporting-core","projects-periods-hr-source-wizard-multiproject"]'
export CUM_EXPECTED_PENDING_FILES_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/finanzas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs"]'
mkdir -p "$CUM_OUT"
node tools/qa/cxorbia-prei4-cumulative-regression-source-guard.mjs | tee "$CUM_OUT/console.log"
test "$(jq -r '.decision' "$CUM_OUT/result.json")" = "PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD"

SOURCE_DIR="$RUNNER_TEMP/cxorbia-prei4-admin004-source"
rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
trap 'rm -rf "$SOURCE_DIR"' EXIT
git archive "$PREI4_004_SOURCE" | tar -x -C "$SOURCE_DIR"

npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
npx playwright install chromium >/dev/null 2>&1

TOKEN="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_004_OUT/hosting-before.json"
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_OUT/runtime-before.json"

IMAGE_URI="gcr.io/${PROJECT}/${SERVICE}:prei4-admin004-${PREI4_004_SOURCE:0:12}-${GITHUB_RUN_ID}"
echo "$IMAGE_URI" > "$PREI4_004_OUT/image-uri.txt"
gcloud builds submit "$SOURCE_DIR" --project "$PROJECT" --config "$SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE_URI" --quiet | tee "$PREI4_004_OUT/runtime-build.log"
gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE_URI" --min-instances=1 --max-instances=1 --update-env-vars "$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE" --quiet
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_OUT/runtime-after.json"
REV="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_004_OUT/runtime-after.json")"; test -n "$REV"
gcloud run revisions describe "$REV" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_004_OUT/runtime-revision.json"
RAW="$(jq -r '.status.imageDigest // empty' "$PREI4_004_OUT/runtime-revision.json")"
if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; elif [[ "$RAW" == *@sha256:* ]]; then DIGEST="sha256:${RAW##*@sha256:}"; else exit 1; fi
URL="$(jq -r '.status.url // empty' "$PREI4_004_OUT/runtime-after.json")"
curl -fsS --retry 10 --retry-delay 3 "$URL/health" > "$PREI4_004_OUT/health.json"
jq -e '.ok==true and .production==false and .hrWrites==false and .shopperReconciliationReady==true and .visitReconciliationReady==true' "$PREI4_004_OUT/health.json" >/dev/null

cd "$SOURCE_DIR"
"$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$PREI4_004_OUT/hosting-deploy.log"
cd "$GITHUB_WORKSPACE"
TOKEN="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_004_OUT/hosting-after.json"
HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$PREI4_004_OUT/hosting-after.json")"; test -n "$HOSTING_VERSION"

for p in app/adapters/cxorbia-cxdata-command-boundary-v1.js app/adapters/tya-canonical-finance-read-model-v2.js app/adapters/tya-live-source-inplace-apply.js app/adapters/tya-protected-auth-hr-authority-bridge-v2.js app/modules/finanzas.js app/modules/proyectos.js; do
 rel="${p#app/}"; remote="$PREI4_004_OUT/served_$(echo "$rel"|tr '/' '_')"
 curl -fsSL --retry 10 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_004_ROOT/$rel?prei4004=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"
 test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$PREI4_004_SOURCE:$p"|sha256sum|awk '{print $1}')"
done

ok=0
for i in $(seq 1 15); do
 curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_004_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&fresh=1&prei4004mat=$GITHUB_RUN_ID-$i" > "$PREI4_004_OUT/hr-meta.json"
 if jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .refreshError==null and .shopperReconciliation.providerAck==true and .visitReconciliation.providerAck==true and .hrWrites==false and .production==false' "$PREI4_004_OUT/hr-meta.json" >/dev/null; then ok=1; break; fi
 sleep 15
done
test "$ok" = 1
HR_REVISION="$(jq -r '.revision // empty' "$PREI4_004_OUT/hr-meta.json")"; [[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]
export PREI4_004_HR_REVISION="$HR_REVISION"

mkdir -p "$PREI4_004_OUT/post002" "$PREI4_004_OUT/admin003"
PREI4_002_LIVE_OUT="$PREI4_004_OUT/post002" PREI4_002_ROOT="$PREI4_004_ROOT" PREI4_002_SOURCE="$PREI4_004_SOURCE" PREI4_002_TREE="$PREI4_004_TREE" PREI4_002_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs | tee "$PREI4_004_OUT/post002.log"
test "$(jq -r '.decision' "$PREI4_004_OUT/post002/result.json")" = "PASS_PREI4_ADMIN_002_HOSTING_LIVE"
PREI4_003_LIVE_OUT="$PREI4_004_OUT/admin003" PREI4_003_ROOT="$PREI4_004_ROOT" PREI4_003_SOURCE="$PREI4_004_SOURCE" PREI4_003_TREE="$PREI4_004_TREE" PREI4_003_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin003-cumulative-live-reproof.mjs | tee "$PREI4_004_OUT/admin003.log"
test "$(jq -r '.decision' "$PREI4_004_OUT/admin003/result.json")" = "PASS_PREI4_ADMIN_003_CUMULATIVE_LIVE"

node --check tools/qa/cxorbia-prei4-admin004-cumulative-live-reproof.mjs
node tools/qa/cxorbia-prei4-admin004-cumulative-live-reproof.mjs | tee "$PREI4_004_OUT/finance-live.log"
test "$(jq -r '.decision' "$PREI4_004_OUT/result.json")" = "PASS_PREI4_ADMIN_004_CUMULATIVE_LIVE"
test "$(jq -r '.externalPaymentExecuted' "$PREI4_004_OUT/result.json")" = "false"
test "$(jq -r '.externalPaymentWrites' "$PREI4_004_OUT/result.json")" = "0"
test "$(jq -r '.bankWrites' "$PREI4_004_OUT/result.json")" = "0"
test "$(jq -r '.hrWrites' "$PREI4_004_OUT/result.json")" = "0"

jq -n -S --arg source "$PREI4_004_SOURCE" --arg tree "$PREI4_004_TREE" --arg runtime "$REV" --arg digest "$DIGEST" --arg hosting "$HOSTING_VERSION" --arg hr "$HR_REVISION" --arg post "$(jq -r '.decision' "$PREI4_004_OUT/post002/result.json")" --arg identity "$(jq -r '.decision' "$PREI4_004_OUT/admin003/result.json")" --arg finance "$(jq -r '.decision' "$PREI4_004_OUT/result.json")" '{decision:"PASS_PREI4_ADMIN_004_CUMULATIVE_DEV_LIVE",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:$hr,closedRegression:{postulations:$post,identity:$identity},finance:$finance,builds:1,runtimeDeploys:1,hostingDeploys:1,rulesDeploys:0,externalPaymentWrites:0,bankWrites:0,hrWrites:0,production:false}' > "$PREI4_004_OUT/receipt.json"
