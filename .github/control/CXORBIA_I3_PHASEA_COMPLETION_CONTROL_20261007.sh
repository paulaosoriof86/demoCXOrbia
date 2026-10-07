#!/usr/bin/env bash
set -Eeuo pipefail
MODE="${1:-}"
OUT=".tmp/i3-phasea-completion"
ROOT="https://cxorbia-backend-dev.web.app"
ASSETS=(modules/beneficios.js modules/dashboard.js modules/postulaciones.js modules/finanzas.js modules/cert.js modules/misvisitas.js adapters/tya-canonical-shopper-portal-v2.js adapters/tya-c6-domain-consistency-bridge.js adapters/tya-canonical-reservations-guard-v2.js data/tya-payment-history-source-safe.js adapters/tya-financial-canonical-source-safe-adapter.js styles/layout.css)
case "$MODE" in
source-proof)
  test "$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")" = "HOLD_I3_B_CUMULATIVE_SOURCE_PROOF_REQUIRED"
  test "$(jq -r '.productSourceSha' "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_SOURCE"
  test "$(jq -r '.productTreeAuthority' "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_TREE"
  test "$(git rev-parse "$FOCAL_SOURCE^{tree}")" = "$FOCAL_TREE"
  git diff --quiet "$FOCAL_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  for f in app/modules/beneficios.js app/modules/dashboard.js app/modules/postulaciones.js app/modules/finanzas.js app/modules/cert.js app/modules/misvisitas.js app/adapters/tya-canonical-shopper-portal-v2.js app/adapters/tya-c6-domain-consistency-bridge.js app/adapters/tya-canonical-reservations-guard-v2.js app/adapters/tya-financial-canonical-source-safe-adapter.js; do node --check "$f"; done
  grep -Fq "data-dashboard-actions" app/modules/dashboard.js
  grep -Fq "c6PrimarySurfacePreserved" app/adapters/tya-c6-domain-consistency-bridge.js
  grep -Fq "canonicalBaseSucursales" app/adapters/tya-canonical-reservations-guard-v2.js
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-phasea-completion-source-contract.test.mjs | tee /tmp/i3-phasea-completion-source-test.log
  node --test backend/runtime/hr-live-service/test/cxorbia-vrm261-264-source-contract.test.mjs | tee /tmp/i3-vrm261-264-source-test.log
  jq -n -S --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" '{decision:"PASS_I3_B_CUMULATIVE_SOURCE_PROOF",sourceSha:$source,sourceTree:$tree,trueFunctionalDefects:0,clickE2ERequired:true,deploys:0,production:false}' > /tmp/i3-phasea-completion-source-proof.json
  cat /tmp/i3-phasea-completion-source-proof.json
  ;;
preflight)
  mkdir -p "$OUT"
  test "$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")" = "HOLD_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION_REQUIRED"
  test "$(jq -r '.productSourceSha' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_SOURCE"
  test "$(jq -r '.productTreeAuthority' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_TREE"
  test "$(git rev-parse "$PHASEA_SOURCE^{tree}")" = "$PHASEA_TREE"
  git diff --quiet "$PHASEA_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-phasea-completion-source-contract.test.mjs | tee "$OUT/source-test.log"
  SOURCE_DIR="$RUNNER_TEMP/cxorbia-phasea-source";rm -rf "$SOURCE_DIR";mkdir -p "$SOURCE_DIR";git archive "$PHASEA_SOURCE" | tar -x -C "$SOURCE_DIR";echo "PHASEA_SOURCE_DIR=$SOURCE_DIR" >> "$GITHUB_ENV"
  ;;
materialize)
  EXPECTED_RUNTIME="$(jq -r '.currentMaterialization.runtimeRevision' "$CANDIDATE_DESCRIPTOR")"
  EXPECTED_DIGEST="$(jq -r '.currentMaterialization.runtimeDigest' "$CANDIDATE_DESCRIPTOR")"
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/runtime.json"
  test "$(jq -r '.status.latestReadyRevisionName' "$OUT/runtime.json")" = "$EXPECTED_RUNTIME"
  gcloud run revisions describe "$EXPECTED_RUNTIME" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/revision.json"
  RAW="$(jq -r '.status.imageDigest // empty' "$OUT/revision.json")";[[ "$RAW" == sha256:* ]]&&DIGEST="$RAW"||DIGEST="sha256:${RAW##*@sha256:}";test "$DIGEST" = "$EXPECTED_DIGEST"
  MATCH=1
  for p in "${ASSETS[@]}"; do remote="$OUT/pre-$(echo "$p"|tr '/' '_')";curl -fsSL --retry 4 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/$p?pre=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"||MATCH=0;if [[ "$MATCH" = 1 ]]&&[[ "$(sha256sum "$remote"|awk '{print $1}')" != "$(git show "$PHASEA_SOURCE:app/$p"|sha256sum|awk '{print $1}')" ]];then MATCH=0;fi;done
  DEPLOYED=0
  if [[ "$MATCH" != 1 ]];then cd "$PHASEA_SOURCE_DIR";"$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$OUT/hosting-deploy.log";cd "$GITHUB_WORKSPACE";DEPLOYED=1;fi
  TOKEN="$(gcloud auth print-access-token)";curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$OUT/hosting.json"
  echo "PHASEA_HOSTING_VERSION=$(jq -r '.release.version.name' "$OUT/hosting.json")" >> "$GITHUB_ENV";echo "PHASEA_HOSTING_RELEASE=$(jq -r '.release.name' "$OUT/hosting.json")" >> "$GITHUB_ENV";echo "PHASEA_HOSTING_DEPLOYED=$DEPLOYED" >> "$GITHUB_ENV";echo "PHASEA_RUNTIME=$EXPECTED_RUNTIME" >> "$GITHUB_ENV";echo "PHASEA_DIGEST=$EXPECTED_DIGEST" >> "$GITHUB_ENV"
  ;;
proof)
  for p in "${ASSETS[@]}";do remote="$OUT/remote-$(echo "$p"|tr '/' '_')";curl -fsSL --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/$p?proof=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote";test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$PHASEA_SOURCE:app/$p"|sha256sum|awk '{print $1}')";done
  curl -fsS --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&i3=$GITHUB_RUN_ID" > "$OUT/hr-meta.json";HR="$(jq -r '.revision // empty' "$OUT/hr-meta.json")";[[ "$HR" =~ ^[0-9a-f]{64}$ ]];jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .hrWrites==false and .production==false' "$OUT/hr-meta.json" >/dev/null
  jq -n -S --arg source "$PHASEA_SOURCE" --arg tree "$PHASEA_TREE" --arg runtime "$PHASEA_RUNTIME" --arg digest "$PHASEA_DIGEST" --arg hosting "$PHASEA_HOSTING_VERSION" --arg release "$PHASEA_HOSTING_RELEASE" --arg hr "$HR" --argjson hostingDeploys "$PHASEA_HOSTING_DEPLOYED" '{decision:"PASS_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hostingRelease:$release,hrRevision:$hr,builds:0,runtimeDeploys:0,hostingDeploys:$hostingDeploys,hrWrites:0,production:false}' > "$OUT/result.json";cat "$OUT/result.json"
  ;;
*) exit 2;;
esac
