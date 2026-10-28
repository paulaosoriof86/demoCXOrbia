#!/usr/bin/env bash
# VRM-290: materialize only the source-proven HR-route UI in DEV Hosting.
# Invoked solely by the canonical I3 workflow's gated reusable job.
set -Eeuo pipefail

MODE="${1:-}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

SOURCE="19ac62bb9cd6828b736f6347371183b42b518b5e"
TREE="9bc6f9df8a10a83959fde1abbf6554ac5cb86e9c"
PREDECESSOR="77fd283349ce46033a95235fd2fae632e856fe35"
OLD_SHA="981a0a933385df49d8ad2330f522e11ca6d0605198f8c1f3546d311f5e9b84f5"
NEW_SHA="b432d5bb6087969ad42bbf6c700bcb14a49d225cded0191c4586f46991b110c0"
EXPECTED_HOSTING="sites/cxorbia-backend-dev/versions/a1cd7ecc1a12db34"
EXPECTED_RUNTIME="cxorbia-live-hr-dev-00327-xsc"
DEV_URL="https://cxorbia-backend-dev.web.app"
OUT=".tmp/i3-vrm290-dev-hosting"

get_meta() {
  local tag="$1" destination="$2"
  curl --fail --silent --show-error --retry 3 --max-time 50 \
    -H 'Cache-Control: no-cache, no-store, max-age=0' \
    "$DEV_URL/api/tya/cinepolis/hr-live?format=meta&fresh=1&vrm290=$tag-$GITHUB_RUN_ID" -o "$destination"
  jq -e '.ok == true and .production == false and .hrWrites == false and .revisionStable == true and .sourceSafe == true and .sourceAccessMode == "public_gviz_csv_cache_busted" and .refreshError == null and (.revision|length)==64 and (.sourceReadAt|length)>0' "$destination" >/dev/null
}

hosting_state() {
  local destination="$1" token
  token="$(gcloud auth print-access-token)"
  curl --fail --silent --show-error -H "Authorization: Bearer $token" \
    'https://firebasehosting.googleapis.com/v1beta1/sites/cxorbia-backend-dev/channels/live' -o "$destination"
}

runtime_state() {
  local destination="$1"
  gcloud run services describe cxorbia-live-hr-dev \
    --project cxorbia-backend-dev --region us-central1 --format=json > "$destination"
  jq -e --arg revision "$EXPECTED_RUNTIME" \
    '.status.latestReadyRevisionName == $revision and ([.status.traffic[] | select(.revisionName==$revision and .percent==100)]|length)==1' "$destination" >/dev/null
}

served_file() {
  local file="$1" destination="$2"
  curl --fail --silent --show-error --retry 5 --retry-delay 1 \
    -H 'Cache-Control: no-cache, no-store, max-age=0' \
    "$DEV_URL/$file?vrm290=$GITHUB_RUN_ID" -o "$destination"
}

case "$MODE" in
  preflight)
    mkdir -p "$OUT"
    test "$(jq -r '.status' CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json)" = HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL
    test "$(jq -r '.productSourceSha' CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json)" = "$SOURCE"
    test "$(jq -r '.productTreeAuthority' CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json)" = "$TREE"
    test "$(jq -r '.production' CXORBIA_RECOVERY_EXECUTION_CURRENT.json)" = DO_NOT_TOUCH
    test "$(jq -r '.authorizationI4' CXORBIA_RECOVERY_EXECUTION_CURRENT.json)" = false
    test "$(git rev-parse "$SOURCE^{tree}")" = "$TREE"
    git merge-base --is-ancestor "$SOURCE" HEAD
    test "$(git diff --name-only "$PREDECESSOR" "$SOURCE" -- app)" = app/modules/operacion-extra.js
    test "$(git diff --name-only "$PREDECESSOR" "$SOURCE" -- firestore.rules storage.rules firebase.json .firebaserc)" = ''
    test "$(git show "$PREDECESSOR:app/modules/operacion-extra.js" | sha256sum | cut -d' ' -f1)" = "$OLD_SHA"
    test "$(git show "$SOURCE:app/modules/operacion-extra.js" | sha256sum | cut -d' ' -f1)" = "$NEW_SHA"
    test "$(jq -r '.hosting.public' firebase.json)" = app
    test "$(jq -r '.hosting.target' firebase.json)" = cxorbia-dev
    test "$(jq -r '.projects.default' .firebaserc)" = cxorbia-backend-dev
    node --test tools/qa/cxorbia-i3-g03-rutas-effective-hr-source-truth.test.mjs
    SOURCE_DIR="$(mktemp -d)"
    git archive "$SOURCE" | tar -x -C "$SOURCE_DIR"
    test "$(sha256sum "$SOURCE_DIR/app/modules/operacion-extra.js" | cut -d' ' -f1)" = "$NEW_SHA"
    echo "VRM290_SOURCE_DIR=$SOURCE_DIR" >> "$GITHUB_ENV"
    served_file modules/operacion-extra.js "$OUT/served-before.js"
    test "$(sha256sum "$OUT/served-before.js" | cut -d' ' -f1)" = "$OLD_SHA"
    get_meta pre "$OUT/hr-before.json"
    jq -n --arg source "$SOURCE" --arg tree "$TREE" --arg old "$OLD_SHA" --arg new "$NEW_SHA" \
      '{decision:"PASS_VRM290_HOSTING_DEV_FOCAL_PREFLIGHT",sourceSha:$source,sourceTree:$tree,servedBeforeSha256:$old,sourceTargetSha256:$new,production:false}' > "$OUT/preflight.json"
    ;;
  materialize)
    test -n "${VRM290_SOURCE_DIR:-}"
    test -f "$OUT/preflight.json"
    runtime_state "$OUT/runtime-before.json"
    hosting_state "$OUT/hosting-before.json"
    test "$(jq -r '.release.version.name' "$OUT/hosting-before.json")" = "$EXPECTED_HOSTING"
    served_file modules/operacion-extra.js "$OUT/served-immediately-before.js"
    test "$(sha256sum "$OUT/served-immediately-before.js" | cut -d' ' -f1)" = "$OLD_SHA"
    npm install --no-save --ignore-scripts --package-lock=false firebase-tools@14.12.0 >/dev/null
    (cd "$VRM290_SOURCE_DIR" && "$ROOT/node_modules/.bin/firebase" deploy \
      --config firebase.json --only hosting:cxorbia-dev \
      --project cxorbia-backend-dev --non-interactive) | tee "$OUT/hosting-deploy.log"
    runtime_state "$OUT/runtime-after.json"
    hosting_state "$OUT/hosting-after.json"
    HOSTING_AFTER="$(jq -r '.release.version.name' "$OUT/hosting-after.json")"
    test -n "$HOSTING_AFTER"
    test "$HOSTING_AFTER" != "$EXPECTED_HOSTING"
    for file in index-backend-dev.html modules/operacion-extra.js modules/cert.js core/backend-firebase.js adapters/tya-protected-auth-hr-authority-bridge-v2.js; do
      target="$OUT/served-$(echo "$file" | tr / -)"
      served_file "$file" "$target"
      cmp -s "$VRM290_SOURCE_DIR/app/$file" "$target"
    done
    get_meta post "$OUT/hr-after.json"
    jq -n --arg source "$SOURCE" --arg tree "$TREE" --arg before "$EXPECTED_HOSTING" \
      --arg after "$HOSTING_AFTER" --arg runtime "$EXPECTED_RUNTIME" \
      --arg hrBefore "$(jq -r '.revision' "$OUT/hr-before.json")" \
      --arg hrAfter "$(jq -r '.revision' "$OUT/hr-after.json")" \
      '{decision:"PASS_VRM290_EXACT_DEV_HOSTING_ONLY",sourceSha:$source,sourceTree:$tree,hostingBefore:$before,hostingVersion:$after,runtimeRevision:$runtime,hrRevisionBefore:$hrBefore,hrRevisionAfter:$hrAfter,hostingDeploys:1,cloudRunBuilds:0,cloudRunDeploys:0,firestoreRulesDeploys:0,authWrites:0,hrWrites:0,production:false,gate20:"HOLD",gate21:"HOLD",humanAcceptance:"PENDING",terminalEligible:false}' > "$OUT/result.json"
    ;;
  *)
    echo 'Usage: script {preflight|materialize}' >&2
    exit 2
    ;;
esac
