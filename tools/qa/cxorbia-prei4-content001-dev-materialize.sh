#!/usr/bin/env bash
set -Eeuo pipefail
: "${PREI4_CONTENT001_SOURCE:?}" "${PREI4_CONTENT001_TREE:?}" "${PREI4_CONTENT001_OUT:?}" "${PREI4_CONTENT001_ROOT:?}"
CONFIG="CXORBIA_PREI4_V176_REPROOF_CONFIG_2026-09-30.json"
test "$(jq -r '.sourceSha' "$CONFIG")" = "$PREI4_CONTENT001_SOURCE"
test "$(jq -r '.sourceTree' "$CONFIG")" = "$PREI4_CONTENT001_TREE"
test "$(git rev-parse "$PREI4_CONTENT001_SOURCE^{tree}")" = "$PREI4_CONTENT001_TREE"
mkdir -p "$PREI4_CONTENT001_OUT"

export CUM_SOURCE="$PREI4_CONTENT001_SOURCE" CUM_TREE="$PREI4_CONTENT001_TREE"
export CUM_BASE="c487449e5187d7219033c54fa1ac3db5fb6c822e"
export CUM_LEDGER="CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V176_2026-09-30.json"
export CUM_MATRIX="RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json"
export CUM_OUT="$PREI4_CONTENT001_OUT/source-guard"
export CUM_EXPECTED_DELTA_JSON="$(jq -c '.expectedDelta' "$CONFIG")"
export CUM_ALLOWED_PENDING_MODULES_JSON="$(jq -c '.allowedPendingModules' "$CONFIG")"
export CUM_EXPECTED_PENDING_FILES_JSON="$(jq -c '.expectedPendingFiles' "$CONFIG")"
export CUM_ALLOWED_HR008_SUCCESSOR_OWNERS_JSON="$(jq -c '.allowedHr008SuccessorOwners // []' "$CONFIG")"
export CUM_ALLOWED_POST002_SUCCESSOR_OWNERS_JSON="$(jq -c '.allowedPost002SuccessorOwners' "$CONFIG")"
export CUM_ALLOWED_ADMIN003_SUCCESSOR_OWNERS_JSON="$(jq -c '.allowedAdmin003SuccessorOwners' "$CONFIG")"
mkdir -p "$CUM_OUT"
node tools/qa/cxorbia-prei4-cumulative-regression-source-guard.mjs | tee "$CUM_OUT/console.log"
test "$(jq -r '.decision' "$CUM_OUT/result.json")" = "PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD"
while IFS= read -r p; do
  case "$p" in *.js|*.mjs) node --check "$p" ;; esac
done < <(jq -r '.expectedPendingFiles[]' "$CONFIG")
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

BUILD_COUNT=1
RUNTIME_DEPLOY_COUNT=1
HOSTING_DEPLOY_COUNT=1
REUSED_EXISTING=false
CURRENT_SOURCE="$(jq -r '[.spec.template.spec.containers[0].env[]? | select(.name=="CXORBIA_RECOVERY_SOURCE_SHA") | .value][0] // empty' "$PREI4_CONTENT001_OUT/runtime-before.json")"
HOSTING_MATCH=1
while IFS= read -r p; do
  rel="${p#app/}"; expected="$(git show "$PREI4_CONTENT001_SOURCE:$p"|sha256sum|awk '{print $1}')"
  probe="$PREI4_CONTENT001_OUT/reuse_probe_$(echo "$rel"|tr '/' '_')"
  if ! curl -fsSL --retry 3 --retry-delay 1 -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/$rel?prei4reuse=$GITHUB_RUN_ID-$(date +%s%N)" -o "$probe"; then HOSTING_MATCH=0; break; fi
  actual="$(sha256sum "$probe"|awk '{print $1}')"
  if [ "$actual" != "$expected" ]; then HOSTING_MATCH=0; break; fi
done < <(jq -r '.expectedPendingFiles[] | select(startswith("app/"))' "$CONFIG")
if [ "$CURRENT_SOURCE" = "$PREI4_CONTENT001_SOURCE" ] && [ "$HOSTING_MATCH" = 1 ]; then
  BUILD_COUNT=0
  RUNTIME_DEPLOY_COUNT=0
  HOSTING_DEPLOY_COUNT=0
  REUSED_EXISTING=true
  cp "$PREI4_CONTENT001_OUT/runtime-before.json" "$PREI4_CONTENT001_OUT/runtime-after.json"
  cp "$PREI4_CONTENT001_OUT/hosting-before.json" "$PREI4_CONTENT001_OUT/hosting-after.json"
else
  IMAGE_URI="gcr.io/${PROJECT}/${SERVICE}:prei4-v176-${PREI4_CONTENT001_SOURCE:0:12}-${GITHUB_RUN_ID}"
  echo "$IMAGE_URI" > "$PREI4_CONTENT001_OUT/image-uri.txt"
  gcloud builds submit "$SOURCE_DIR" --project "$PROJECT" --config "$SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE_URI" --quiet | tee "$PREI4_CONTENT001_OUT/runtime-build.log"
  VISIT_RECONCILIATION_CONCURRENCY="$(jq -r '.runtimeVisitReconciliationConcurrency // 16' "$CONFIG")"
  gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE_URI" --min-instances=1 --max-instances=1 --update-env-vars "$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE,CXORBIA_RECOVERY_SOURCE_SHA=$PREI4_CONTENT001_SOURCE,CXORBIA_VISIT_RECONCILIATION_CONCURRENCY=$VISIT_RECONCILIATION_CONCURRENCY" --quiet
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_CONTENT001_OUT/runtime-after.json"
  cd "$SOURCE_DIR"
  "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$PREI4_CONTENT001_OUT/hosting-deploy.log"
  cd "$GITHUB_WORKSPACE"
  TOKEN="$(gcloud auth print-access-token)"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_CONTENT001_OUT/hosting-after.json"
fi
REV="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_CONTENT001_OUT/runtime-after.json")"; test -n "$REV"
gcloud run revisions describe "$REV" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_CONTENT001_OUT/runtime-revision.json"
RAW="$(jq -r '.status.imageDigest // empty' "$PREI4_CONTENT001_OUT/runtime-revision.json")"
if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; elif [[ "$RAW" == *@sha256:* ]]; then DIGEST="sha256:${RAW##*@sha256:}"; else exit 1; fi
URL="$(jq -r '.status.url // empty' "$PREI4_CONTENT001_OUT/runtime-after.json")"; test -n "$URL"
HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$PREI4_CONTENT001_OUT/hosting-after.json")"; test -n "$HOSTING_VERSION"

curl -fsS --retry 10 --retry-delay 3 "$URL/health" > "$PREI4_CONTENT001_OUT/health.json"
jq -e '.ok==true and .production==false and .hrWrites==false' "$PREI4_CONTENT001_OUT/health.json" >/dev/null

while IFS= read -r p; do
  rel="${p#app/}"; remote="$PREI4_CONTENT001_OUT/served_$(echo "$rel"|tr '/' '_')"
  expected="$(git show "$PREI4_CONTENT001_SOURCE:$p"|sha256sum|awk '{print $1}')"
  parity=0
  for attempt in $(seq 1 15); do
    curl -fsSL --retry 5 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/$rel?prei4recovery=$GITHUB_RUN_ID-$attempt-$(date +%s%N)" -o "$remote"
    actual="$(sha256sum "$remote"|awk '{print $1}')"
    if [ "$actual" = "$expected" ]; then parity=1; break; fi
    sleep 4
  done
  test "$parity" = 1
done < <(jq -r '.expectedPendingFiles[] | select(startswith("app/"))' "$CONFIG")

curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&fresh=1&v176fresh=$GITHUB_RUN_ID-$(date +%s%N)" > "$PREI4_CONTENT001_OUT/hr-fresh.json"
jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .refreshError==null and .hrWrites==false and .production==false and (.cacheMs|tonumber)<=15000' "$PREI4_CONTENT001_OUT/hr-fresh.json" >/dev/null
HR_REVISION="$(jq -r '.revision // empty' "$PREI4_CONTENT001_OUT/hr-fresh.json")"; [[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]
ok=0
for i in $(seq 1 240); do
  curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$URL/health?run735reconcile=$GITHUB_RUN_ID-$i" > "$PREI4_CONTENT001_OUT/reconciliation-health.json"
  if jq -e --arg rev "$HR_REVISION" '.ok==true and .lastShopperReconciliation.providerAck==true and .lastShopperReconciliation.sourceRevision==$rev and .lastVisitReconciliation.providerAck==true and .lastVisitReconciliation.sourceRevision==$rev and .hrWrites==false and .production==false' "$PREI4_CONTENT001_OUT/reconciliation-health.json" >/dev/null; then ok=1; break; fi
  sleep 5
done
test "$ok" = 1
curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&v177postreconcile=$GITHUB_RUN_ID" > "$PREI4_CONTENT001_OUT/hr-meta.json"
jq -e --arg rev "$HR_REVISION" '.ok==true and .revision==$rev and .sourceSafe==true and .refreshError==null and .shopperReconciliation.providerAck==true and .shopperReconciliation.sourceRevision==$rev and .visitReconciliation.providerAck==true and .visitReconciliation.sourceRevision==$rev and .hrWrites==false and .production==false' "$PREI4_CONTENT001_OUT/hr-meta.json" >/dev/null
curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?fresh=1&v176availability=$GITHUB_RUN_ID" > "$PREI4_CONTENT001_OUT/hr-live-current.json"
node - "$PREI4_CONTENT001_OUT/hr-live-current.json" <<'NODE'
const fs=require('fs');
const body=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const s=body.snapshot||body.data||body;
const visits=Array.isArray(s.visits)?s.visits:[];
const sep=visits.filter(v=>String(v.periodKey||v.periodId||'').includes('2026-09'));
const avail=sep.filter(v=>!String(v.shopperId||'').trim()&&(v.available===true||/disponible/i.test(String(v.state||v.estado||v.availability||''))));
const pradera=avail.find(v=>/pradera zacapa/i.test(String(v.sucursal||v.cinema||v.cine||'')));
if(!pradera)throw new Error('PROVIDER_FAILURE:V176_EXPECTED_LIVE_AVAILABLE_PRADERA_ZACAPA_NOT_VISIBLE');
fs.writeFileSync(process.argv[2]+'.availability.json',JSON.stringify({periodVisits:sep.length,available:avail.length,branch:pradera.sucursal||pradera.cinema||pradera.cine,shopperId:pradera.shopperId||null,state:pradera.state||pradera.estado||null},null,2)+'\n');
NODE

mkdir -p "$PREI4_CONTENT001_OUT/post002-forensic" "$PREI4_CONTENT001_OUT/post002" "$PREI4_CONTENT001_OUT/admin003" "$PREI4_CONTENT001_OUT/finance" "$PREI4_CONTENT001_OUT/questionnaire"
PREI4_002_OUT="$PREI4_CONTENT001_OUT/post002-forensic" PREI4_002_ROOT="$PREI4_CONTENT001_ROOT" PREI4_002_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_002_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin002-postulation-semantic-forensic.mjs | tee "$PREI4_CONTENT001_OUT/post002-forensic.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/post002-forensic/result.json")" = "PASS_PREI4_ADMIN_002_ROOT_CAUSE_PROVEN"
mkdir -p "$PREI4_CONTENT001_OUT/paula-pradera-cleanup"
node --check tools/qa/cxorbia-prei4-paula-pradera-safe-cleanup.mjs
PREI4_CLEANUP_OUT="$PREI4_CONTENT001_OUT/paula-pradera-cleanup" PREI4_CLEANUP_ROOT="$PREI4_CONTENT001_ROOT" PREI4_CLEANUP_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_CLEANUP_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-paula-pradera-safe-cleanup.mjs | tee "$PREI4_CONTENT001_OUT/paula-pradera-cleanup.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/paula-pradera-cleanup/result.json")" = "PASS_PREI4_PAULA_PRADERA_SAFE_CLEANUP"
PREI4_002_LIVE_OUT="$PREI4_CONTENT001_OUT/post002" PREI4_002_ROOT="$PREI4_CONTENT001_ROOT" PREI4_002_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_002_TREE="$PREI4_CONTENT001_TREE" PREI4_002_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/post002.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/post002/result.json")" = "PASS_PREI4_ADMIN_002_HOSTING_LIVE"
PREI4_003_LIVE_OUT="$PREI4_CONTENT001_OUT/admin003" PREI4_003_ROOT="$PREI4_CONTENT001_ROOT" PREI4_003_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_003_TREE="$PREI4_CONTENT001_TREE" PREI4_003_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin003-cumulative-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/admin003.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/admin003/result.json")" = "PASS_PREI4_ADMIN_003_CUMULATIVE_LIVE"
PREI4_004_LIVE_OUT="$PREI4_CONTENT001_OUT/finance" PREI4_004_ROOT="$PREI4_CONTENT001_ROOT" PREI4_004_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_004_TREE="$PREI4_CONTENT001_TREE" PREI4_004_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin004-cumulative-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/finance.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/finance/result.json")" = "PASS_PREI4_ADMIN_004_CUMULATIVE_LIVE"
PREI4_CONTENT001_OUT="$PREI4_CONTENT001_OUT/questionnaire" PREI4_CONTENT001_ROOT="$PREI4_CONTENT001_ROOT" PREI4_CONTENT001_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_CONTENT001_TREE="$PREI4_CONTENT001_TREE" PREI4_CONTENT001_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-content001-live-proof.mjs | tee "$PREI4_CONTENT001_OUT/questionnaire.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/questionnaire/result.json")" = "PASS_PREI4_CONTENT002_AUTHENTICATED_SHOPPER_PROGRESSIVE_ROUTE"

mkdir -p "$PREI4_CONTENT001_OUT/final-focal/browser" "$PREI4_CONTENT001_OUT/final-focal/cert"
FINAL_FOCAL_OUT="$PREI4_CONTENT001_OUT/final-focal" node tools/qa/cxorbia-prei4-final-focal-source-contracts.mjs | tee "$PREI4_CONTENT001_OUT/final-focal/source-console.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/final-focal/source-contracts.json")" = "PASS_PREI4_FINAL_FOCAL_SOURCE"
node backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs | tee "$PREI4_CONTENT001_OUT/final-focal/shopper-provider-tests.log"
node backend/runtime/hr-live-service/test/cxorbia-gate7-operational-assignment.test.mjs | tee "$PREI4_CONTENT001_OUT/final-focal/operational-provider-tests.log"

PREI4_OUT="$PREI4_CONTENT001_OUT/final-focal/browser" CXORBIA_PREI4_ROOT="$PREI4_CONTENT001_ROOT" CXORBIA_PREI4_SOURCE_SHA="$PREI4_CONTENT001_SOURCE" node tools/qa/cxorbia-pre-i4-focal-remote-browser.mjs | tee "$PREI4_CONTENT001_OUT/final-focal/browser-console.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/final-focal/browser/browser-focal.json")" = "PASS_PRE_I4_FOCAL_HUMAN_BROWSER"
test "$(jq -r '.sourceSha' "$PREI4_CONTENT001_OUT/final-focal/browser/browser-focal.json")" = "$PREI4_CONTENT001_SOURCE"
test "$(jq -r '.hrRevision' "$PREI4_CONTENT001_OUT/final-focal/browser/browser-focal.json")" = "$HR_REVISION"
test "$(jq -r '.admin.refreshPreserved' "$PREI4_CONTENT001_OUT/final-focal/browser/browser-focal.json")" = "true"
test "$(jq -r '.shopper.refreshPreserved' "$PREI4_CONTENT001_OUT/final-focal/browser/browser-focal.json")" = "true"

PROJECT="$PROJECT" HOSTING_URL="$PREI4_CONTENT001_ROOT" SOURCE_SHA="$PREI4_CONTENT001_SOURCE" FINAL_FOCAL_OUT="$PREI4_CONTENT001_OUT/final-focal" node tools/qa/cxorbia-prei4-final-focal-finance-live.mjs | tee "$PREI4_CONTENT001_OUT/final-focal/finance-console.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/final-focal/finance-live.json")" = "PASS_PREI4_FINAL_FOCAL_FINANCE"
test "$(jq -r '.cleanup' "$PREI4_CONTENT001_OUT/final-focal/finance-live.json")" = "true"

PROJECT_ID="$PROJECT_ID" TENANT_ID="$TENANT_ID" HOSTING_URL="$PREI4_CONTENT001_ROOT" CERT_RES_SOURCE="$PREI4_CONTENT001_SOURCE" CERT_RES_MAT_OUT="$PREI4_CONTENT001_OUT/final-focal/cert" node tools/qa/cxorbia-prei4-cert-res-live.mjs | tee "$PREI4_CONTENT001_OUT/final-focal/cert-console.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/final-focal/cert/cert-res-live.json")" = "PASS_PREI4_CERT_RES_CUMULATIVE_DEV_LIVE"
test "$(jq -r '.cert001.decision' "$PREI4_CONTENT001_OUT/final-focal/cert/cert-res-live.json")" = "PASS_PREI4_CERT_001_LIVE"
test "$(jq -r '.cert002.recertification.decision' "$PREI4_CONTENT001_OUT/final-focal/cert/cert-res-live.json")" = "PASS_PREI4_CERT_002_LIVE"
test "$(jq -r '[.cleanup.attempt,.cleanup.recert,.cleanup.bank,.cleanup.resource,.cleanup.binary]|all' "$PREI4_CONTENT001_OUT/final-focal/cert/cert-res-live.json")" = "true"

jq -n -S \
  --arg source "$PREI4_CONTENT001_SOURCE" --arg tree "$PREI4_CONTENT001_TREE" --arg hr "$HR_REVISION" \
  --slurpfile sourceProof "$PREI4_CONTENT001_OUT/final-focal/source-contracts.json" \
  --slurpfile browser "$PREI4_CONTENT001_OUT/final-focal/browser/browser-focal.json" \
  --slurpfile financeLive "$PREI4_CONTENT001_OUT/final-focal/finance-live.json" \
  --slurpfile certLive "$PREI4_CONTENT001_OUT/final-focal/cert/cert-res-live.json" \
  '{schemaVersion:"cxorbia.prei4.final-focal-receipt.v1",decision:"PASS_PREI4_VRM121_135_FINAL_FOCAL",sourceSha:$source,sourceTree:$tree,hrRevision:$hr,sourceProof:$sourceProof[0].decision,browser:$browser[0].decision,finance:$financeLive[0].decision,financeCleanup:$financeLive[0].cleanup,certification:$certLive[0].decision,certificationCleanup:$certLive[0].cleanup,builds:0,runtimeDeploys:0,hostingDeploys:0,rulesDeploys:0,hrWrites:0,production:false,next:"SHORT_HUMAN_VISUAL_RETEST"}' > "$PREI4_CONTENT001_OUT/final-focal/receipt.json"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/final-focal/receipt.json")" = "PASS_PREI4_VRM121_135_FINAL_FOCAL"

jq -n -S \
  --arg source "$PREI4_CONTENT001_SOURCE" --arg tree "$PREI4_CONTENT001_TREE" \
  --arg runtime "$REV" --arg digest "$DIGEST" --arg hosting "$HOSTING_VERSION" --arg hr "$HR_REVISION" \
  --arg post "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/post002/result.json")" \
  --arg identity "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/admin003/result.json")" \
  --arg finance "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/finance/result.json")" \
  --arg questionnaire "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/questionnaire/result.json")" \
  --argjson builds "$BUILD_COUNT" --argjson runtimeDeploys "$RUNTIME_DEPLOY_COUNT" --argjson hostingDeploys "$HOSTING_DEPLOY_COUNT" --argjson reused "$REUSED_EXISTING" \
  '{decision:"PASS_PREI4_V176_CUMULATIVE_DEV_LIVE",legacyDecision:"PASS_PREI4_CONTENT002_CUMULATIVE_DEV_LIVE",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:$hr,closedRegression:{postulations:$post,identity:$identity,finance:$finance},questionnaire:$questionnaire,builds:$builds,runtimeDeploys:$runtimeDeploys,hostingDeploys:$hostingDeploys,reusedExistingMaterialization:$reused,rulesDeploys:0,externalPaymentWrites:0,bankWrites:0,hrWrites:0,production:false}' > "$PREI4_CONTENT001_OUT/receipt.json"
