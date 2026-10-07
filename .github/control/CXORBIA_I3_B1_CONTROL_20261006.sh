#!/usr/bin/env bash
set -Eeuo pipefail
MODE="${1:-}"
PREDECESSOR_SOURCE="6232caedfcfd1e0136b5ece5f55bfaa0c1b3934a"
B1_OUT=".tmp/i3-b1-materialization"
B1_ROOT="https://cxorbia-backend-dev.web.app"
EXPECTED_RUNTIME_REVISION="cxorbia-live-hr-dev-00273-6p9"
EXPECTED_RUNTIME_DIGEST="sha256:0d4ee89f75e759fa96e0f6e2a706aac3c7b73b7162e93da30653b47a0ee7bfc1"
EXPECTED_HR_REVISION="f77e740a8f8c92f48ded256276e03c15594711ce57204381b672d61c19aa9305"
case "$MODE" in
source-proof)
  test "$FOCAL_SOURCE" = "17373b4f79a68fed4155fed67aa23d3306fda2e2"
  test "$FOCAL_TREE" = "8bba316baa878ca37928404586d882a06734e628"
  test "$(git rev-parse "$FOCAL_SOURCE^{tree}")" = "$FOCAL_TREE"
  git merge-base --is-ancestor "$PREDECESSOR_SOURCE" "$FOCAL_SOURCE"
  git diff --quiet "$FOCAL_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  mapfile -t changed < <(git diff --name-only "$PREDECESSOR_SOURCE" "$FOCAL_SOURCE" -- app backend | sort)
  printf '%s\n' "${changed[@]}" > /tmp/b1-changed.txt
  test "$(wc -l < /tmp/b1-changed.txt | tr -d ' ')" = "5"
  grep -Fxq 'app/modules/midia.js' /tmp/b1-changed.txt
  grep -Fxq 'app/modules/misvisitas.js' /tmp/b1-changed.txt
  grep -Fxq 'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js' /tmp/b1-changed.txt
  grep -Fxq 'backend/runtime/hr-live-service/test/cxorbia-b1-canonical-visible-identity.test.mjs' /tmp/b1-changed.txt
  grep -Fxq 'backend/runtime/hr-live-service/test/cxorbia-b1-transversal-shopper-actions.test.mjs' /tmp/b1-changed.txt
  node --check app/modules/midia.js
  node --check app/modules/misvisitas.js
  node --check app/adapters/tya-protected-auth-hr-authority-bridge-v2.js
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-canonical-visible-identity.test.mjs
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-transversal-shopper-actions.test.mjs
  node --test backend/runtime/hr-live-service/test/cxorbia-prei4-shopper-progressive-route.test.mjs
  node --test backend/runtime/hr-live-service/test/cxorbia-gate9-postulation-immediate.test.mjs
  jq -n -S --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --arg predecessor "$PREDECESSOR_SOURCE" '{decision:"PASS_B1_TRANSVERSAL_SHOPPER_ACTION_SOURCE_PROOF",sourceSha:$source,sourceTree:$tree,predecessorSha:$predecessor,changedFiles:["app/modules/midia.js","app/modules/misvisitas.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","backend/runtime/hr-live-service/test/cxorbia-b1-transversal-shopper-actions.test.mjs"],productWrites:0,deploys:0,production:false}' > /tmp/b1-source-proof.json
  cat /tmp/b1-source-proof.json
  ;;
preflight)
  mkdir -p "$B1_OUT"
  test "$B1_SOURCE" = "17373b4f79a68fed4155fed67aa23d3306fda2e2"
  test "$B1_TREE" = "8bba316baa878ca37928404586d882a06734e628"
  test "$(git rev-parse "$B1_SOURCE^{tree}")" = "$B1_TREE"
  test "$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")" = "HOLD_B1_DEV_MATERIALIZATION_REQUIRED"
  git diff --quiet "$B1_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  node --check app/core/router.js
  node --check app/modules/midia.js
  node --check app/modules/misvisitas.js
  node --check app/adapters/tya-protected-auth-hr-authority-bridge-v2.js
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-canonical-visible-identity.test.mjs
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-transversal-shopper-actions.test.mjs | tee "$B1_OUT/source-test.log"
  SOURCE_DIR="$RUNNER_TEMP/cxorbia-b1-source"; rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
  git archive "$B1_SOURCE" | tar -x -C "$SOURCE_DIR"
  echo "B1_SOURCE_DIR=$SOURCE_DIR" >> "$GITHUB_ENV"
  ;;
materialize)
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$B1_OUT/runtime.json"
  test "$(jq -r '.status.latestReadyRevisionName // empty' "$B1_OUT/runtime.json")" = "$EXPECTED_RUNTIME_REVISION"
  gcloud run revisions describe "$EXPECTED_RUNTIME_REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$B1_OUT/runtime-revision.json"
  RAW="$(jq -r '.status.imageDigest // empty' "$B1_OUT/runtime-revision.json")"
  if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; else DIGEST="sha256:${RAW##*@sha256:}"; fi
  test "$DIGEST" = "$EXPECTED_RUNTIME_DIGEST"
  MATCH=1
  for p in core/router.js modules/midia.js modules/misvisitas.js adapters/tya-protected-auth-hr-authority-bridge-v2.js; do
    remote="$B1_OUT/pre-$(echo "$p" | tr '/' '_')"
    curl -fsSL --retry 4 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$B1_ROOT/$p?pre=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote" || MATCH=0
    if [[ "$MATCH" = "1" ]] && [[ "$(sha256sum "$remote"|awk '{print $1}')" != "$(git show "$B1_SOURCE:app/$p" | sha256sum | awk '{print $1}')" ]]; then MATCH=0; fi
  done
  DEPLOYED=0
  if [[ "$MATCH" != "1" ]]; then
    cd "$B1_SOURCE_DIR"
    "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$B1_OUT/hosting-deploy.log"
    cd "$GITHUB_WORKSPACE"
    DEPLOYED=1
  fi
  TOKEN="$(gcloud auth print-access-token)"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$B1_OUT/hosting-live-channel.json"
  HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$B1_OUT/hosting-live-channel.json")"; test -n "$HOSTING_VERSION"
  HOSTING_RELEASE="$(jq -r '.release.name // empty' "$B1_OUT/hosting-live-channel.json")"; test -n "$HOSTING_RELEASE"
  echo "B1_HOSTING_VERSION=$HOSTING_VERSION" >> "$GITHUB_ENV"
  echo "B1_HOSTING_RELEASE=$HOSTING_RELEASE" >> "$GITHUB_ENV"
  echo "B1_HOSTING_DEPLOYED=$DEPLOYED" >> "$GITHUB_ENV"
  ;;
proof)
  for p in core/router.js modules/midia.js modules/misvisitas.js adapters/tya-protected-auth-hr-authority-bridge-v2.js adapters/tya-canonical-shopper-portal-v2.js styles/layout.css; do
    remote="$B1_OUT/remote-$(echo "$p" | tr '/' '_')"
    curl -fsSL --retry 8 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$B1_ROOT/$p?proof=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"
    test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$B1_SOURCE:app/$p" | sha256sum | awk '{print $1}')"
  done
  curl -fsS --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$B1_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&b1=$GITHUB_RUN_ID" > "$B1_OUT/hr-meta.json"
  HR_REVISION="$(jq -r '.revision // empty' "$B1_OUT/hr-meta.json")"
  [[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]
  jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .hrWrites==false and .production==false' "$B1_OUT/hr-meta.json" >/dev/null
  jq -n -S --arg source "$B1_SOURCE" --arg tree "$B1_TREE" --arg runtime "$EXPECTED_RUNTIME_REVISION" --arg digest "$EXPECTED_RUNTIME_DIGEST" --arg hosting "$B1_HOSTING_VERSION" --arg release "$B1_HOSTING_RELEASE" --arg hr "$HR_REVISION" --arg previousHr "$EXPECTED_HR_REVISION" --argjson hostingDeploys "$B1_HOSTING_DEPLOYED" '{decision:"PASS_B1_EXACT_DEV_HOSTING_MATERIALIZATION",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hostingRelease:$release,hrRevision:$hr,previousHrRevision:$previousHr,hrRevisionDriftAllowed:true,builds:0,runtimeDeploys:0,hostingDeploys:$hostingDeploys,storageRulesDeploys:0,hrWrites:0,production:false}' > "$B1_OUT/result.json"
  cat "$B1_OUT/result.json"
  ;;
*) echo "unknown mode: $MODE" >&2; exit 2 ;;
esac
