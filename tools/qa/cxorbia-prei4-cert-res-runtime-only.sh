#!/usr/bin/env bash
set -Eeuo pipefail
D="${CERT_RES_MAT_OUT:-.tmp/prei4-cert-res-runtime-only}"
mkdir -p "$D"
test "${PROJECT:-}" = "cxorbia-backend-dev"
test "${CERT_RES_SOURCE:-}" = "f769041ddd6adacb5bb16b0eeddab7d08b47a7e8"
test "${CERT_RES_TREE:-}" = "d83f57ed07ef684cd274d4b1db3a52d91f4ff400"
test "$(git rev-parse "$CERT_RES_SOURCE^{tree}")" = "$CERT_RES_TREE"
test "$(jq -r '.activeBlocker' "$CANDIDATE_DESCRIPTOR")" = "PREI4_CERT_RES_RUNTIME_ONLY_REMATERIALIZATION_REQUIRED"

git diff --name-only f6c3bb6c038a77eee9cbca8bfbfd1096bfd48cbc "$CERT_RES_SOURCE" -- app backend firestore.rules storage.rules | sort > "$D/product-delta.txt"
printf '%s\n'   backend/runtime/hr-live-service/certification-runtime.mjs   backend/runtime/hr-live-service/test/cxorbia-prei4-cert-res-contract.test.mjs   | sort > "$D/expected-delta.txt"
diff -u "$D/expected-delta.txt" "$D/product-delta.txt"
git diff --quiet f6c3bb6c038a77eee9cbca8bfbfd1096bfd48cbc "$CERT_RES_SOURCE" -- app firestore.rules storage.rules backend/runtime/hr-live-service/Dockerfile backend/runtime/hr-live-service/server.mjs

SOURCE_DIR="$RUNNER_TEMP/cxorbia-prei4-cert-res-runtime-only"
rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
git archive "$CERT_RES_SOURCE" | tar -x -C "$SOURCE_DIR"
node "$SOURCE_DIR/backend/runtime/hr-live-service/test/cxorbia-prei4-cert-res-contract.test.mjs" | tee "$D/contract.log"
grep -q 'PASS_PREI4_CERT_RES_CONTRACT' "$D/contract.log"

IMAGE_URI="gcr.io/${PROJECT}/${SERVICE}:i3-prei4-cert-res-${CERT_RES_SOURCE:0:12}-${GITHUB_RUN_ID}"
echo "$IMAGE_URI" > "$D/image-uri.txt"
gcloud builds submit "$SOURCE_DIR" --project "$PROJECT" --config "$SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE_URI" --quiet

gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE_URI" --min-instances=1 --max-instances=1 --update-env-vars "$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE" --quiet
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$D/runtime.json"
DEV_REVISION="$(jq -r '.status.latestReadyRevisionName // empty' "$D/runtime.json")"
RUNTIME_URL="$(jq -r '.status.url // empty' "$D/runtime.json")"
test -n "$DEV_REVISION"; test -n "$RUNTIME_URL"
gcloud run revisions describe "$DEV_REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$D/runtime-revision.json"
RAW="$(jq -r '.status.imageDigest // empty' "$D/runtime-revision.json")"
if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; elif [[ "$RAW" == *@sha256:* ]]; then DIGEST="sha256:${RAW##*@sha256:}"; else echo "runtime digest unresolved: $RAW" >&2; exit 31; fi
curl -fsS --retry 12 --retry-delay 3 "$RUNTIME_URL/health" > "$D/health.json"
jq -e '.ok==true and .production==false and .hrWrites==false' "$D/health.json" >/dev/null

TOKEN="$(gcloud auth print-access-token)"
curl --fail --silent --show-error -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$D/hosting-live-channel.json"
test "$(jq -r '.release.version.name // empty' "$D/hosting-live-channel.json")" = "sites/cxorbia-backend-dev/versions/a0054d58a85a7d43"

PASS=0
for i in $(seq 1 36); do
  curl -fsS --retry 3 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$HOSTING_URL/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&certres=$GITHUB_RUN_ID-$i" > "$D/hr-meta.json"
  if jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .shopperReconciliation.providerAck==true and .visitReconciliation.providerAck==true and .hrWrites==false and .production==false and .refreshError==null' "$D/hr-meta.json" >/dev/null; then PASS=1; break; fi
  sleep 5
done
test "$PASS" = "1"
HR_REVISION="$(jq -r '.revision // empty' "$D/hr-meta.json")"
[[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]

PROJECT_ID="$PROJECT_ID" TENANT_ID="$TENANT_ID" HOSTING_URL="$HOSTING_URL" CERT_RES_SOURCE="$CERT_RES_SOURCE" CERT_RES_MAT_OUT="$D" node tools/qa/cxorbia-prei4-cert-res-live.mjs | tee "$D/live-console.log"
test "$(jq -r '.decision' "$D/cert-res-live.json")" = "PASS_PREI4_CERT_RES_CUMULATIVE_DEV_LIVE"
test "$(jq -r '.cert001.decision' "$D/cert-res-live.json")" = "PASS_PREI4_CERT_001_LIVE"
test "$(jq -r '.cert002.recertification.decision' "$D/cert-res-live.json")" = "PASS_PREI4_CERT_002_LIVE"
test "$(jq -r '.res001.decision' "$D/cert-res-live.json")" = "PASS_PREI4_RES_001_LIVE"
test "$(jq -r '[.cleanup.attempt,.cleanup.recert,.cleanup.bank,.cleanup.resource,.cleanup.binary]|all' "$D/cert-res-live.json")" = "true"

jq -n -S --arg source "$CERT_RES_SOURCE" --arg tree "$CERT_RES_TREE" --arg runtime "$DEV_REVISION" --arg digest "$DIGEST" --arg hr "$HR_REVISION" --slurpfile live "$D/cert-res-live.json"   '{decision:"PASS_PREI4_CERT_RES_RUNTIME_ONLY_CLOSURE",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:"sites/cxorbia-backend-dev/versions/a0054d58a85a7d43",hrRevision:$hr,p0:{"PREI4-CERT-001":"PASS_LIVE","PREI4-CERT-002":"PASS_LIVE","PREI4-RES-001":"PASS_LIVE"},preflightCleanup:$live[0].preflightCleanup,fixtureCleanup:$live[0].cleanup,builds:1,runtimeDeploys:1,hostingDeploys:0,rulesDeploys:0,hrWrites:0,production:false}' > "$D/result.json"
cat "$D/result.json"
