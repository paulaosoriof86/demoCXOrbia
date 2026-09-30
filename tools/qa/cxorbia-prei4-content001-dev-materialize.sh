#!/usr/bin/env bash
set -Eeuo pipefail
: "${PREI4_CONTENT001_SOURCE:?}" "${PREI4_CONTENT001_TREE:?}" "${PREI4_CONTENT001_OUT:?}" "${PREI4_CONTENT001_ROOT:?}"
test "$PREI4_CONTENT001_SOURCE" = "a29b8ad89391fb5537d1cbf765ef6ec86f775608"
test "$PREI4_CONTENT001_TREE" = "ea8846d254d1901ac1101c182098c46f995f1141"
test "$(git rev-parse "$PREI4_CONTENT001_SOURCE^{tree}")" = "$PREI4_CONTENT001_TREE"
mkdir -p "$PREI4_CONTENT001_OUT"

export CUM_SOURCE="$PREI4_CONTENT001_SOURCE" CUM_TREE="$PREI4_CONTENT001_TREE"
export CUM_BASE="c487449e5187d7219033c54fa1ac3db5fb6c822e"
export CUM_LEDGER="CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V170_2026-09-30.json"
export CUM_MATRIX="RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json"
export CUM_OUT="$PREI4_CONTENT001_OUT/source-guard"
export CUM_EXPECTED_DELTA_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-c6-unified-human-runtime-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/cuestionario-shopper.js","app/modules/finanzas.js","app/modules/misvisitas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs","backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs","backend/runtime/hr-live-service/test/cxorbia-prei4-project-questionnaire-config.test.mjs","backend/runtime/hr-live-service/test/cxorbia-prei4-shopper-progressive-route.test.mjs"]'
export CUM_ALLOWED_PENDING_MODULES_JSON='["canonical-hr-state-adapters","finance-core-liquidation-costs","human-runtime-domain-consistency","persistence-command-ack-boundary","phase-a-supporting-core","projects-periods-hr-source-wizard-multiproject","questionnaire-shopper","shoppers-mi-visitas-profile"]'
export CUM_EXPECTED_PENDING_FILES_JSON='["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/tya-c6-unified-human-runtime-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/modules/cuestionario-shopper.js","app/modules/finanzas.js","app/modules/misvisitas.js","app/modules/proyectos.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs"]'
mkdir -p "$CUM_OUT"
node tools/qa/cxorbia-prei4-cumulative-regression-source-guard.mjs | tee "$CUM_OUT/console.log"
test "$(jq -r '.decision' "$CUM_OUT/result.json")" = "PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD"
node --check app/modules/cuestionario-shopper.js
node --check app/modules/misvisitas.js
node backend/runtime/hr-live-service/test/cxorbia-prei4-project-questionnaire-config.test.mjs
node backend/runtime/hr-live-service/test/cxorbia-prei4-shopper-progressive-route.test.mjs

SOURCE_DIR="$RUNNER_TEMP/cxorbia-prei4-content001-source"
rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
trap 'rm -rf "$SOURCE_DIR"' EXIT
git archive "$PREI4_CONTENT001_SOURCE" | tar -x -C "$SOURCE_DIR"

npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
npx playwright install chromium >/dev/null 2>&1

TOKEN="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_CONTENT001_OUT/hosting-before.json"
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_CONTENT001_OUT/runtime-before.json"

BUILD_COUNT=0
RUNTIME_DEPLOY_COUNT=0
HOSTING_DEPLOY_COUNT=0
REUSED_EXISTING=false
cp "$PREI4_CONTENT001_OUT/runtime-before.json" "$PREI4_CONTENT001_OUT/runtime-after.json"
REV="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_CONTENT001_OUT/runtime-after.json")"; test -n "$REV"
test "$REV" = "cxorbia-live-hr-dev-00230-c5m"
gcloud run revisions describe "$REV" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_CONTENT001_OUT/runtime-revision.json"
RAW="$(jq -r '.status.imageDigest // empty' "$PREI4_CONTENT001_OUT/runtime-revision.json")"
if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; elif [[ "$RAW" == *@sha256:* ]]; then DIGEST="sha256:${RAW##*@sha256:}"; else exit 1; fi
test "$DIGEST" = "sha256:5ece6bb303b6af2d1ad6b08cf40ebfccaa18e14ea604a5ea7b07c5ae1c650a95"
test "$(git rev-parse d8874bd952a70ce15b40560c8f17b2d47f53c152:backend/runtime/hr-live-service/server.mjs)" = "$(git rev-parse "$PREI4_CONTENT001_SOURCE:backend/runtime/hr-live-service/server.mjs")"
URL="$(jq -r '.status.url // empty' "$PREI4_CONTENT001_OUT/runtime-after.json")"

cd "$SOURCE_DIR"
"$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$PREI4_CONTENT001_OUT/hosting-deploy.log"
cd "$GITHUB_WORKSPACE"
HOSTING_DEPLOY_COUNT=1
TOKEN="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_CONTENT001_OUT/hosting-after.json"
HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$PREI4_CONTENT001_OUT/hosting-after.json")"; test -n "$HOSTING_VERSION"

curl -fsS --retry 10 --retry-delay 3 "$URL/health" > "$PREI4_CONTENT001_OUT/health.json"
jq -e '.ok==true and .production==false and .hrWrites==false and .shopperReconciliationReady==true and .visitReconciliationReady==true' "$PREI4_CONTENT001_OUT/health.json" >/dev/null

for p in app/modules/proyectos.js app/adapters/tya-live-source-inplace-apply.js app/modules/cuestionario-shopper.js app/modules/misvisitas.js; do
  rel="${p#app/}"; remote="$PREI4_CONTENT001_OUT/served_$(echo "$rel"|tr '/' '_')"
  expected="$(git show "$PREI4_CONTENT001_SOURCE:$p"|sha256sum|awk '{print $1}')"
  parity=0
  for attempt in $(seq 1 15); do
    curl -fsSL --retry 5 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/$rel?content002=$GITHUB_RUN_ID-$attempt-$(date +%s%N)" -o "$remote"
    actual="$(sha256sum "$remote"|awk '{print $1}')"
    if [ "$actual" = "$expected" ]; then parity=1; break; fi
    sleep 4
  done
  test "$parity" = 1
done

ok=0
for i in $(seq 1 15); do
  curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&fresh=1&content001=$GITHUB_RUN_ID-$i" > "$PREI4_CONTENT001_OUT/hr-meta.json"
  if jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .refreshError==null and .shopperReconciliation.providerAck==true and .visitReconciliation.providerAck==true and .hrWrites==false and .production==false' "$PREI4_CONTENT001_OUT/hr-meta.json" >/dev/null; then ok=1; break; fi
  sleep 15
done
test "$ok" = 1
HR_REVISION="$(jq -r '.revision // empty' "$PREI4_CONTENT001_OUT/hr-meta.json")"; [[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]

mkdir -p "$PREI4_CONTENT001_OUT/post002" "$PREI4_CONTENT001_OUT/admin003" "$PREI4_CONTENT001_OUT/finance" "$PREI4_CONTENT001_OUT/questionnaire"
PREI4_002_LIVE_OUT="$PREI4_CONTENT001_OUT/post002" PREI4_002_ROOT="$PREI4_CONTENT001_ROOT" PREI4_002_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_002_TREE="$PREI4_CONTENT001_TREE" PREI4_002_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/post002.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/post002/result.json")" = "PASS_PREI4_ADMIN_002_HOSTING_LIVE"
PREI4_003_LIVE_OUT="$PREI4_CONTENT001_OUT/admin003" PREI4_003_ROOT="$PREI4_CONTENT001_ROOT" PREI4_003_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_003_TREE="$PREI4_CONTENT001_TREE" PREI4_003_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin003-cumulative-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/admin003.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/admin003/result.json")" = "PASS_PREI4_ADMIN_003_CUMULATIVE_LIVE"
PREI4_004_OUT="$PREI4_CONTENT001_OUT/finance" PREI4_004_ROOT="$PREI4_CONTENT001_ROOT" PREI4_004_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_004_TREE="$PREI4_CONTENT001_TREE" PREI4_004_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin004-cumulative-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/finance.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/finance/result.json")" = "PASS_PREI4_ADMIN_004_CUMULATIVE_LIVE"
PREI4_CONTENT001_OUT="$PREI4_CONTENT001_OUT/questionnaire" PREI4_CONTENT001_ROOT="$PREI4_CONTENT001_ROOT" PREI4_CONTENT001_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_CONTENT001_TREE="$PREI4_CONTENT001_TREE" PREI4_CONTENT001_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-content001-live-proof.mjs | tee "$PREI4_CONTENT001_OUT/questionnaire.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/questionnaire/result.json")" = "PASS_PREI4_CONTENT002_AUTHENTICATED_SHOPPER_PROGRESSIVE_ROUTE"

jq -n -S \
  --arg source "$PREI4_CONTENT001_SOURCE" --arg tree "$PREI4_CONTENT001_TREE" \
  --arg runtime "$REV" --arg digest "$DIGEST" --arg hosting "$HOSTING_VERSION" --arg hr "$HR_REVISION" \
  --arg post "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/post002/result.json")" \
  --arg identity "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/admin003/result.json")" \
  --arg finance "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/finance/result.json")" \
  --arg questionnaire "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/questionnaire/result.json")" \
  --argjson builds "$BUILD_COUNT" --argjson runtimeDeploys "$RUNTIME_DEPLOY_COUNT" --argjson hostingDeploys "$HOSTING_DEPLOY_COUNT" --argjson reused "$REUSED_EXISTING" \
  '{decision:"PASS_PREI4_CONTENT002_CUMULATIVE_DEV_LIVE",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:$hr,closedRegression:{postulations:$post,identity:$identity,finance:$finance},questionnaire:$questionnaire,builds:$builds,runtimeDeploys:$runtimeDeploys,hostingDeploys:$hostingDeploys,reusedExistingMaterialization:$reused,rulesDeploys:0,externalPaymentWrites:0,bankWrites:0,hrWrites:0,production:false}' > "$PREI4_CONTENT001_OUT/receipt.json"
