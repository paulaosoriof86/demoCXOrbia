#!/usr/bin/env bash
# Existing canonical I3 workflow invokes this scoped DEV transport only on explicit dispatch.
# PREPARED_SOURCE_ONLY: no run authorizes materialization without a later Paula-approved dispatch.
set -Eeuo pipefail

MODE="${1:-}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
SOURCE="a2be5a77a4c0008ec374c17f42d5da27070e1ed6"
TREE="eb8734a450c14d510a9a9924b39cb826caacf510"
PREDECESSOR="308c69e3756e3e80577856009901934ce5f52fba"
PROJECT="cxorbia-backend-dev"
SERVICE="cxorbia-live-hr-dev"
REGION="us-central1"
SITE="cxorbia-backend-dev"
OLD_REV="cxorbia-live-hr-dev-00327-xsc"
OLD_HOSTING="sites/cxorbia-backend-dev/versions/a1cd7ecc1a12db34"
CHANNEL="i3-a2be-${GITHUB_RUN_ID:?}"
OUT=".tmp/i3-a2be-twin-dev"
mkdir -p "$OUT"

service_state() {
  gcloud run services describe "$SERVICE" --project "$PROJECT" \
    --region "$REGION" --format=json > "$1"
}

hosting_state() {
  local token
  token="$(gcloud auth print-access-token)"
  curl -fsS --max-time 45 -H "Authorization: Bearer $token" \
    "https://firebasehosting.googleapis.com/v1beta1/sites/$SITE/channels/live" -o "$1"
}

assert_old_traffic() {
  jq -e --arg old "$OLD_REV" \
    '([.status.traffic[]|select(.revisionName==$old and .percent==100)]|length)==1' "$1" >/dev/null
}

preflight() {
  test "${GITHUB_REF_NAME:-}" = 'recovery/cxorbia-phase-a-20260831'
  test "${GITHUB_EVENT_NAME:-}" = push
  test "$(jq -r '.preflightAuthorized' .github/control/CXORBIA_I3_A2BE_DEV_REQUEST_20261029.json)" = true
  test "$(jq -r '.sourceSha' .github/control/CXORBIA_I3_A2BE_DEV_REQUEST_20261029.json)" = "$SOURCE"
  test "$(jq -r '.sourceTree' .github/control/CXORBIA_I3_A2BE_DEV_REQUEST_20261029.json)" = "$TREE"
  test "$(jq -r '.productSourceSha' CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json)" = "$SOURCE"
  test "$(jq -r '.productTreeAuthority' CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json)" = "$TREE"
  test "$(jq -r '.status' CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json)" = HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL
  test "$(jq -r '.productSourceSha' CXORBIA_RECOVERY_EXECUTION_CURRENT.json)" = "$SOURCE"
  test "$(jq -r '.productTree' CXORBIA_RECOVERY_EXECUTION_CURRENT.json)" = "$TREE"
  test "$(jq -r '.production' CXORBIA_RECOVERY_EXECUTION_CURRENT.json)" = DO_NOT_TOUCH
  test "$(jq -r '.authorizationI4' CXORBIA_RECOVERY_EXECUTION_CURRENT.json)" = false
  test "$(git rev-parse "$SOURCE^{tree}")" = "$TREE"
  git merge-base --is-ancestor "$SOURCE" HEAD
  git diff --quiet "$SOURCE" HEAD -- app backend tools firebase.json .firebaserc firestore.rules storage.rules
  git diff --quiet "$PREDECESSOR" "$SOURCE" -- firebase.json .firebaserc firestore.rules storage.rules
  test "$(jq -r '.hosting.target' firebase.json)" = cxorbia-dev
  test "$(jq -r '.projects.default' .firebaserc)" = "$PROJECT"
  node --test tools/qa/cxorbia-i3-adjudication-contact-frequency.test.mjs \
    tools/qa/cxorbia-i3-hr-strong-name-review.test.mjs \
    tools/qa/cxorbia-i3-available-visits-active-period-scope.test.mjs \
    tools/qa/cxorbia-i3-shopper-first-login-profile-review.test.mjs \
    > "$OUT/source-tests.log"
  service_state "$OUT/runtime-before.json"
  hosting_state "$OUT/hosting-before.json"
  assert_old_traffic "$OUT/runtime-before.json"
  test "$(jq -r '.release.version.name' "$OUT/hosting-before.json")" = "$OLD_HOSTING"
  local source_dir
  source_dir="$(mktemp -d)"
  git archive "$SOURCE" | tar -x -C "$source_dir"
  test "$(git hash-object "$source_dir/backend/runtime/cxorbia-shopper-command-provider-v1.mjs")" = \
    "$(git rev-parse "$SOURCE:backend/runtime/cxorbia-shopper-command-provider-v1.mjs")"
  test "$(git hash-object "$source_dir/app/index-backend-dev.html")" = \
    "$(git rev-parse "$SOURCE:app/index-backend-dev.html")"
  test "$(jq -r '.hosting.target' "$source_dir/firebase.json")" = cxorbia-dev
  echo "CX_A2BE_SOURCE_DIR=$source_dir" >> "$GITHUB_ENV"
  jq -n --arg source "$SOURCE" --arg tree "$TREE" --arg previousRuntime "$OLD_REV" \
    --arg previousHosting "$OLD_HOSTING" \
    '{decision:"PASS_I3_A2BE_TWIN_DEV_PREFLIGHT_ONLY",productSourceSha:$source,
      productSourceTree:$tree,priorRuntimeRevision:$previousRuntime,
      priorHostingVersion:$previousHosting,sourceChecks:"PASS",
      runtimeDeploys:0,hostingDeploys:0,authWrites:0,rulesWrites:0,hrWrites:0,
      providerWrites:0,production:false,gate20:"HOLD",gate21:"HOLD"}' > "$OUT/preflight.json"
}

materialize() {
  test "${CX_A2BE_SOURCE_DIR:-}" != ''
  test -s "$OUT/preflight.json"
  test "${GITHUB_EVENT_NAME:-}" = push
  test "$(jq -r '.materializeAuthorized' .github/control/CXORBIA_I3_A2BE_DEV_REQUEST_20261029.json)" = true
  test "${CX_A2BE_EXPLICIT_DEV_APPROVAL:-}" = 'PAULA_APPROVED_A2BE_PAIR_DEV_ONLY'
  service_state "$OUT/runtime-immediately-before.json"
  hosting_state "$OUT/hosting-immediately-before.json"
  assert_old_traffic "$OUT/runtime-immediately-before.json"
  test "$(jq -r '.release.version.name' "$OUT/hosting-immediately-before.json")" = "$OLD_HOSTING"

  local image_uri new_rev result_token preview_url preview_version tag_url
  image_uri="gcr.io/$PROJECT/$SERVICE:i3-a2be-$GITHUB_RUN_ID"
  gcloud builds submit "$CX_A2BE_SOURCE_DIR" --project "$PROJECT" \
    --config "$CX_A2BE_SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" \
    --substitutions "_IMAGE=$image_uri" --quiet > "$OUT/build.log" 2>&1
  gcloud run deploy "$SERVICE" --project "$PROJECT" --region "$REGION" \
    --image "$image_uri" --no-traffic --tag "$CHANNEL" --quiet > "$OUT/revision-create.log" 2>&1
  service_state "$OUT/runtime-no-traffic.json"
  assert_old_traffic "$OUT/runtime-no-traffic.json"
  new_rev="$(jq -r '.status.latestCreatedRevisionName // empty' "$OUT/runtime-no-traffic.json")"
  test -n "$new_rev"
  test "$new_rev" != "$OLD_REV"
  gcloud run revisions describe "$new_rev" --project "$PROJECT" --region "$REGION" \
    --format=json > "$OUT/new-revision.json"
  jq -e --arg image "$image_uri" \
    '.spec.containers[0].image==$image and (.status.imageDigest|length)>0' \
    "$OUT/new-revision.json" >/dev/null

  # The tagged zero-traffic revision MUST prove health before any shared DEV
  # traffic changes. Refuse promotion if it cannot be reached independently.
  tag_url="$(jq -r --arg tag "$CHANNEL" \
    '[.status.traffic[]|select(.tag==$tag)|.url][0] // empty' "$OUT/runtime-no-traffic.json")"
  [[ "$tag_url" == https://* ]]
  curl -fsS --retry 4 --retry-delay 2 --max-time 50 \
    "$tag_url/health" -o "$OUT/tagged-revision-health.json"
  jq -e '.ok==true and .production==false and .hrWrites==false' \
    "$OUT/tagged-revision-health.json" >/dev/null

  # Static Hosting Preview is created and byte-checked while the existing DEV
  # provider still has 100% of default traffic. This URL is NEVER I4 LIVE.
  npm install --no-save --ignore-scripts --package-lock=false firebase-tools@14.12.0 \
    > "$OUT/firebase-tools-install.log" 2>&1
  (cd "$CX_A2BE_SOURCE_DIR" && "$ROOT/node_modules/.bin/firebase" hosting:channel:deploy \
    "$CHANNEL" --only cxorbia-dev --project "$PROJECT" --non-interactive --json) \
    > "$OUT/hosting-preview-deploy.json"
  result_token="$(gcloud auth print-access-token)"
  curl -fsS --max-time 45 -H "Authorization: Bearer $result_token" \
    "https://firebasehosting.googleapis.com/v1beta1/sites/$SITE/channels/$CHANNEL" \
    -o "$OUT/hosting-preview-channel.json"
  preview_url="$(jq -r '.url // empty' "$OUT/hosting-preview-channel.json")"
  preview_version="$(jq -r '.release.version.name // empty' "$OUT/hosting-preview-channel.json")"
  [[ "$preview_url" == https://*web.app* ]]
  test -n "$preview_version"
  for file in index-backend-dev.html modules/cert.js modules/documentos.js \
    modules/visitas.js modules/shoppers.js adapters/tya-cumulative-read-model-v2.js; do
    curl -fsS --max-time 60 -H 'Cache-Control: no-store' \
      "$preview_url/$file?a2be=$GITHUB_RUN_ID" -o "$OUT/served-$(echo "$file" | tr / -)"
    cmp -s "$CX_A2BE_SOURCE_DIR/app/$file" "$OUT/served-$(echo "$file" | tr / -)"
  done

  # The existing Hosting rewrite is service-scoped, so protected E2E through
  # Preview requires a *separately approved* brief switch of shared DEV only.
  # Rollback is attempted on ERR and read back; no rollback is ever claimed on
  # failed verification. Runner termination remains a documented residual risk.
  rollback_on_failure() {
    local rc=0
    gcloud run services update-traffic "$SERVICE" --project "$PROJECT" --region "$REGION" \
      --to-revisions "$OLD_REV=100" --quiet > "$OUT/rollback-traffic.log" 2>&1 || rc=$?
    service_state "$OUT/rollback-runtime.json" || rc=$?
    assert_old_traffic "$OUT/rollback-runtime.json" || rc=$?
    if test "$rc" -ne 0; then
      echo 'CRITICAL_HOLD_DEV_TRAFFIC_ROLLBACK_UNVERIFIED' >&2
      return "$rc"
    fi
    echo 'PASS_DEV_TRAFFIC_ROLLBACK_READBACK' > "$OUT/rollback-readback.txt"
  }
  trap rollback_on_failure ERR
  gcloud run services update-traffic "$SERVICE" --project "$PROJECT" --region "$REGION" \
    --to-revisions "$new_rev=100" --quiet > "$OUT/dev-traffic.log" 2>&1
  curl -fsS --retry 5 --retry-delay 2 --max-time 60 \
    "$preview_url/api/tya/cinepolis/hr-live?format=meta&fresh=1&a2be=$GITHUB_RUN_ID" \
    -o "$OUT/preview-provider-meta.json"
  jq -e '.ok==true and .production==false and .hrWrites==false and .revisionStable==true' \
    "$OUT/preview-provider-meta.json" >/dev/null
  service_state "$OUT/runtime-after.json"
  hosting_state "$OUT/hosting-live-after.json"
  jq -e --arg rev "$new_rev" \
    '([.status.traffic[]|select(.revisionName==$rev and .percent==100)]|length)==1' \
    "$OUT/runtime-after.json" >/dev/null
  test "$(jq -r '.release.version.name' "$OUT/hosting-live-after.json")" = "$OLD_HOSTING"
  trap - ERR
  jq -n --arg source "$SOURCE" --arg tree "$TREE" --arg rev "$new_rev" \
    --arg digest "$(jq -r '.status.imageDigest' "$OUT/new-revision.json")" \
    --arg preview "$preview_url" --arg version "$preview_version" \
    --arg old "$OLD_REV" \
    '{decision:"PASS_I3_A2BE_TWIN_DEV_EXACT_PREVIEW_WITH_DEV_RUNTIME",
      sourceSha:$source,sourceTree:$tree,runtimeRevision:$rev,
      runtimeDigest:$digest,priorRuntimeRevision:$old,
      hostingPreviewUrl:$preview,hostingPreviewVersion:$version,
      hostingLiveUnchanged:true,production:false,authWrites:0,rulesWrites:0,
      hrWrites:0,providerWrites:0,gate20:"HOLD",gate21:"HOLD",
      sameArtifactAdminShopperE2E:"PENDING"}' > "$OUT/result.json"
}

case "$MODE" in
  preflight) preflight ;;
  materialize) materialize ;;
  *) echo 'Usage: ... {preflight|materialize}' >&2; exit 2 ;;
esac
