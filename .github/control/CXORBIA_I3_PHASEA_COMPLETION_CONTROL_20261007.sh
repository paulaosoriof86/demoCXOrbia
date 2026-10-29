#!/usr/bin/env bash
set -Eeuo pipefail
MODE="${1:-}"
OUT=".tmp/i3-phasea-completion"
ROOT="https://cxorbia-backend-dev.web.app"
ASSETS=(core/backend-browser-auth.js core/shoppers-store.js core/topbar.js modules/beneficios.js modules/dashboard.js modules/postulaciones.js modules/finanzas.js modules/cert.js modules/misvisitas.js modules/reservas.js modules/soporte.js modules/novedades.js core/backend-bulletins.js adapters/cxorbia-command-adapter-v1.js adapters/cxorbia-cxdata-command-boundary-v1.js adapters/tya-canonical-shopper-portal-v2.js adapters/tya-c6-domain-consistency-bridge.js adapters/tya-protected-auth-hr-authority-bridge-v2.js adapters/tya-c6-unified-human-runtime-v1.js adapters/tya-canonical-reservations-guard-v2.js data/tya-payment-history-source-safe.js adapters/tya-financial-canonical-source-safe-adapter.js styles/layout.css core/backend-firebase.js core/cliente-data.js modules/cliente.js core/ui.js core/router.js adapters/tya-cumulative-read-model-v2.js modules/midia.js modules/visitas.js modules/visita-detalle.js styles/theme.css modules/proyecto-wizard.js modules/cuestionario-shopper.js adapters/tya-live-source-inplace-apply.js index-backend-dev.html core/automations.js modules/automatizaciones.js core/backend-cxdata-finance-read.js core/backend-finance-benefits.js)
case "$MODE" in
source-proof)
  STATUS="$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")"
  case "$STATUS" in
    HOLD_I3_B_CUMULATIVE_SOURCE_PROOF_REQUIRED|HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL) ;;
    *) echo "PHASEA_SOURCE_PROOF_UNAUTHORIZED_STATUS:$STATUS" >&2; exit 1 ;;
  esac
  # A failed source gate must leave an honest receipt and preserve its log.
  trap 'source_rc=$?; jq -n -S --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --argjson exitCode "$source_rc" '\''{decision:"FAIL_I3_CUMULATIVE_SOURCE_PROOF",sourceSha:$source,sourceTree:$tree,exitCode:$exitCode,scope:"SOURCE_CONTRACTS_ONLY_NOT_I3_CERTIFICATION",wholeProductPass:false,liveE2e:"NOT_RUN",moduleMatchPromotions:0,deploys:0,production:false}'\'' > /tmp/i3-phasea-completion-source-proof.json; exit "$source_rc"' ERR
  test "$(jq -r '.productSourceSha' "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_SOURCE"
  test "$(jq -r '.productTreeAuthority' "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_TREE"
  test "$(git rev-parse "$FOCAL_SOURCE^{tree}")" = "$FOCAL_TREE"
  git diff --quiet "$FOCAL_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  # Same pinned SDK as the existing runtime; source fixtures never use remote credentials.
  npm install --no-save --ignore-scripts --package-lock=false firebase-admin@13.4.0
  for f in app/modules/beneficios.js app/modules/dashboard.js app/modules/postulaciones.js app/modules/finanzas.js app/modules/cert.js app/modules/misvisitas.js app/adapters/tya-canonical-shopper-portal-v2.js app/adapters/tya-c6-domain-consistency-bridge.js app/adapters/tya-protected-auth-hr-authority-bridge-v2.js app/adapters/tya-c6-unified-human-runtime-v1.js app/adapters/tya-canonical-reservations-guard-v2.js app/adapters/tya-financial-canonical-source-safe-adapter.js; do node --check "$f"; done
  # G04: execute the exact sealed A04/C01 regressions in this existing source-only lane.
  node tools/qa/cxorbia-i3-a04-c01-focal.test.cjs . | tee /tmp/i3-a04-c01-focal-source-test.log
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-canonical-visible-identity.test.mjs | tee /tmp/i3-a04-canonical-visible-identity-test.log
  # G05: source-only reader/writer, receipt, UI and unchanged identity/read regressions.
  node tools/qa/cxorbia-i3-g05-observation-no-writes.test.cjs . | tee /tmp/i3-g05-source-1.log
  node tools/qa/cxorbia-i3-g05-writer-receipts.test.cjs . | tee /tmp/i3-g05-source-2.log
  node tools/qa/cxorbia-i3-g05-sync-command-ui.test.cjs . | tee /tmp/i3-g05-source-3.log
  node --test --test-name-pattern="bounded visit workers" backend/runtime/hr-live-service/test/cxorbia-gate7-operational-assignment.test.mjs | tee /tmp/i3-g05-source-4.log
  node --test backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs backend/runtime/hr-live-service/test/cxorbia-vrm134-runtime-latency.test.mjs tools/qa/cxorbia-i3-b1-cold-login-parallel-source.test.mjs | tee /tmp/i3-g05-source-5.log
  grep -Fq "data-dashboard-actions" app/modules/dashboard.js
  grep -Fq "c6PrimarySurfacePreserved" app/adapters/tya-c6-domain-consistency-bridge.js
  grep -Fq "canonicalBaseSucursales" app/adapters/tya-canonical-reservations-guard-v2.js
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-phasea-completion-source-contract.test.mjs
node --test tools/qa/cxorbia-i3-a05-atomic-session-publication-source.test.mjs | tee /tmp/i3-phasea-completion-source-test.log
  node --check app/core/shoppers-store.js
  node tools/qa/cxorbia-i3-vrm280-exact-shopper-session-fallback.test.mjs | tee /tmp/i3-vrm280-exact-shopper-session-source-test.log
  node --test tools/qa/cxorbia-i3-d02-document-extraction-source.test.mjs | tee /tmp/i3-d02-document-extraction-source-test.log
  node --test tools/qa/cxorbia-i3-d03-ai-generation-source.test.mjs | tee /tmp/i3-d03-ai-generation-source-test.log
  node --test tools/qa/cxorbia-i3-d04-versioned-bank-review.test.mjs tools/qa/cxorbia-i3-e04-benchmark-source.test.mjs | tee /tmp/i3-d04-e04-parallel-source-proof.log
  node --test tools/qa/cxorbia-i3-admin-client-readonly-preview.test.mjs | tee /tmp/i3-admin-client-preview-source-proof.log
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-d03-document-source-metadata.test.mjs | tee /tmp/i3-d03-document-source-metadata.log
  node --test backend/runtime/hr-live-service/test/cxorbia-vrm261-264-source-contract.test.mjs | tee /tmp/i3-vrm261-264-source-test.log
  # B7: independent Firestore emulator gate; no DEV/production writes.
  node --check tools/qa/cxorbia-i3-b7-exact-notification-firestore-rules.test.mjs
  npm install --no-save --ignore-scripts --package-lock=false firebase@12.4.0 @firebase/rules-unit-testing@5.0.2 firebase-tools@latest
  if [ -n "${JAVA_HOME_21_X64:-}" ]; then export JAVA_HOME="$JAVA_HOME_21_X64"; export PATH="$JAVA_HOME/bin:$PATH"; fi
  node -e "require('fs').writeFileSync('firebase.i3-b7-emulator.json', JSON.stringify({firestore:{rules:'firestore.rules'},emulators:{firestore:{port:8080}}}))"
  ./node_modules/.bin/firebase emulators:exec --config firebase.i3-b7-emulator.json --project demo-cxorbia-b7-ruleproof --only firestore "node --test tools/qa/cxorbia-i3-b7-exact-notification-firestore-rules.test.mjs" | tee /tmp/i3-b7-emulator-proof.log
  node --test backend/runtime/hr-live-service/test/cxorbia-vrm268-269-source-contract.test.mjs | tee /tmp/i3-vrm268-269-source-test.log
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-transversal-shopper-actions.test.mjs | tee /tmp/i3-b1-oct07-source-test.log
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-oct08-b1-b3-source.test.mjs | tee /tmp/i3-oct08-b1-b3-source-test.log
  # VRM-285 exact approved resources viewer owner + UI regression, no data writes.
  if [[ "$FOCAL_SOURCE" == "2c1c5951596a2dd260f02a744b21aa2cb46b17da" ]]; then
    test "$(git rev-parse "$FOCAL_SOURCE:app/modules/documentos.js")" = "c0eefe84d7d4f220c25dfd058e5712ec84556c42"
    test "$(git rev-parse "$FOCAL_SOURCE:tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs")" = "dcc13d368923c11085e70de715e6d940f8395dc1"
    node --check app/modules/documentos.js
    node --test tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs
  fi
  MATRIX="$(jq -r '.moduleTruthPath' "$CANDIDATE_DESCRIPTOR")"
  COUNTS="$(jq -c '[.modules[].classification] | group_by(.) | map({key:.[0],value:length}) | from_entries' "$MATRIX")"
  jq -n -S --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --arg status "$STATUS" --argjson counts "$COUNTS" '{decision:"PASS_I3_B_CUMULATIVE_SOURCE_PROOF",sourceSha:$source,sourceTree:$tree,status:$status,scope:"SOURCE_CONTRACTS_ONLY_NOT_I3_CERTIFICATION",recordedModuleClassificationCounts:$counts,wholeProductPass:false,liveE2e:"NOT_RUN",moduleMatchPromotions:0,clickE2ERequired:true,deploys:0,production:false}' > /tmp/i3-phasea-completion-source-proof.json
  trap - ERR
  cat /tmp/i3-phasea-completion-source-proof.json
  ;;
preflight)
  mkdir -p "$OUT"
  test "$PROJECT" = "cxorbia-backend-dev"
  test "$SERVICE" = "cxorbia-live-hr-dev"
  test "$HOSTING_SITE" = "cxorbia-backend-dev"
  test "$FIREBASE_HOSTING_TARGET" = "cxorbia-dev"
  test "$(jq -r '.production' "$CANDIDATE_DESCRIPTOR")" = "DO_NOT_TOUCH"
  STATUS="$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")"
  if [[ "$STATUS" != "HOLD_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION_REQUIRED" && "$STATUS" != "HOLD_I3_PHASEA_CUMULATIVE_DEV_READBACK_ONLY_REQUIRED" ]]; then
    echo "PHASEA_UNAUTHORIZED_STATUS:$STATUS" >&2; exit 1
  fi
  if [[ "$STATUS" == "HOLD_I3_PHASEA_CUMULATIVE_DEV_READBACK_ONLY_REQUIRED" ]]; then
    test "$(jq -r '.i3PhaseADevReadbackTarget.production' "$CANDIDATE_DESCRIPTOR")" = "false"
    test "$(jq -r '.i3PhaseADevReadbackTarget.sourceSha' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_SOURCE"
    test "$(jq -r '.i3PhaseADevReadbackTarget.sourceTree' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_TREE"
    test "$(jq -r '.i3PhaseADevReadbackTarget.project' "$CANDIDATE_DESCRIPTOR")" = "cxorbia-backend-dev"
    test "$(jq -r '.i3PhaseADevReadbackTarget.materializationRunId // 0' "$CANDIDATE_DESCRIPTOR")" -gt 0
  fi
  test "$(jq -r '.productSourceSha' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_SOURCE"
  test "$(jq -r '.productTreeAuthority' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_TREE"
  test "$(git rev-parse "$PHASEA_SOURCE^{tree}")" = "$PHASEA_TREE"
  git diff --quiet "$PHASEA_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-phasea-completion-source-contract.test.mjs | tee "$OUT/source-test.log"
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-transversal-shopper-actions.test.mjs | tee "$OUT/b1-oct07-source-test.log"
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-oct08-b1-b3-source.test.mjs | tee "$OUT/oct08-b1-b3-source-test.log"
  PREDECESSOR_SOURCE="$(jq -r '.predecessorProductSourceSha' "$CANDIDATE_DESCRIPTOR")"
  # VRM-282/283/284 A09-B11: admit only the approved administrative HR command
  # entrypoint at its exact immutable source/blob. Preserve the predecessor
  # freeze for visita-detalle and every other candidate (fail closed on drift).
  for protected in app/modules/visitas.js app/modules/visita-detalle.js; do
    if [[ "$protected" == "app/modules/visitas.js" && "$PHASEA_SOURCE" == "cf94910dc3742e797b63f26e93166be388544021" ]]; then
      test "$(git rev-parse "$PHASEA_SOURCE:$protected")" = "c91bcd42c51b96ac266bb37967c2d2103735683b"
      test "$(git rev-parse "$PHASEA_SOURCE:tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs")" = "6e79255dcd76fa9dedf9d4e35981c9de6fac2298"
      node --check "$protected"
      node --test tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs
    elif [[ "$protected" == "app/modules/visitas.js" && "$PHASEA_SOURCE" == "68bf2522458fb48144eaa370c1a0bac516d96870" ]]; then
      test "$(git rev-parse "$PHASEA_SOURCE:$protected")" = "0d3e9f097c34076634c24e28efe7a1671c49c1d5"
      test "$(git rev-parse "$PHASEA_SOURCE:tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs")" = "6ff6ba738359375606251036c9e087e489d30db2"
      node --check "$protected"
      node --test tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs
    elif [[ "$protected" == "app/modules/visitas.js" && "$PHASEA_SOURCE" == "60b092d1f1a150e8e48c213695825dcbbaed7be4" ]]; then
      test "$(git rev-parse "$PHASEA_SOURCE:$protected")" = "b193c11d708667be9bf4ab586d903f47e69ab8c3"
      test "$(git rev-parse "$PHASEA_SOURCE:tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs")" = "ba3fc7fef5001089c18d95ed20fc5ac410aacfbc"
      node --check "$protected"
      node --test tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs
    elif [[ "$protected" == "app/modules/visitas.js" && "$PHASEA_SOURCE" == "f40d5d8bc6aa45a9c7ac3f2bfb0bd0a197a52251" ]]; then
      test "$(git rev-parse "$PHASEA_SOURCE:$protected")" = "8aea3a23e64dd186bee5d6639142859b7d53892f"
      node --check "$protected"
      node --test tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs
    else
      test "$(git rev-parse "$PREDECESSOR_SOURCE:$protected")" = "$(git rev-parse "$PHASEA_SOURCE:$protected")"
    fi
  done
  # VRM-285 exact approved resources viewer owner + UI regression, no data writes.
  if [[ "$PHASEA_SOURCE" == "2c1c5951596a2dd260f02a744b21aa2cb46b17da" ]]; then
    test "$(git rev-parse "$PHASEA_SOURCE:app/modules/documentos.js")" = "c0eefe84d7d4f220c25dfd058e5712ec84556c42"
    test "$(git rev-parse "$PHASEA_SOURCE:tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs")" = "dcc13d368923c11085e70de715e6d940f8395dc1"
    node --check app/modules/documentos.js
    node --test tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs
  fi
  node tools/qa/cxorbia-i3-canonical-candidate-authority-guard.mjs > "$OUT/canonical-authority.json"
  jq -e '.moduleTruthReadback.sourceAligned==true and .moduleTruthReadback.domainCount==21 and .moduleBlobReadback.pass==true' "$OUT/canonical-authority.json" >/dev/null
  # Install the pre-existing Firebase CLI in the same approved runner before the one DEV build.
  npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest >/dev/null 2>&1
  git archive --format=tar "$PHASEA_SOURCE" > "$OUT/cxorbia-phasea-source.tar"
  sha256sum "$OUT/cxorbia-phasea-source.tar" > "$OUT/cxorbia-phasea-source.tar.sha256"
  SOURCE_DIR="$RUNNER_TEMP/cxorbia-phasea-source";rm -rf "$SOURCE_DIR";mkdir -p "$SOURCE_DIR"
  tar -xf "$OUT/cxorbia-phasea-source.tar" -C "$SOURCE_DIR"
  echo "PHASEA_SOURCE_DIR=$SOURCE_DIR" >> "$GITHUB_ENV"
  ;;
materialize)
  # One existing Phase A runner: one build, one runtime, one Hosting + Firestore rules publish. DEV only.
  test "$PROJECT" = "cxorbia-backend-dev"
  test "$SERVICE" = "cxorbia-live-hr-dev"
  test "$HOSTING_SITE" = "cxorbia-backend-dev"
  test "$FIREBASE_HOSTING_TARGET" = "cxorbia-dev"
  sha256sum -c "$OUT/cxorbia-phasea-source.tar.sha256"
  IMAGE_URI="gcr.io/$PROJECT/$SERVICE:i3-phasea-$(printf '%s' "$PHASEA_SOURCE"|cut -c1-12)-$GITHUB_RUN_ID"
  gcloud builds submit "$PHASEA_SOURCE_DIR" --project "$PROJECT" --config "$PHASEA_SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE_URI" --quiet
  gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE_URI" --min-instances=1 --max-instances=1 --update-env-vars "$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE" --quiet
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/runtime.json"
  REVISION="$(jq -r '.status.latestReadyRevisionName // empty' "$OUT/runtime.json")"
  test -n "$REVISION"
  gcloud run revisions describe "$REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/revision.json"
  RAW="$(jq -r '.status.imageDigest // empty' "$OUT/revision.json")"
  case "$RAW" in sha256:*) DIGEST="$RAW" ;; *@sha256:*) DIGEST="sha256:$(printf '%s' "$RAW"|sed 's/.*@sha256://')" ;; *) echo RUNTIME_DIGEST_UNAVAILABLE >&2; exit 1 ;; esac
  URL="$(jq -r '.status.url // empty' "$OUT/runtime.json")"
  test -n "$URL"
  curl -fsS --retry 8 "$URL/health" > "$OUT/health.json"
  jq -e '.ok==true and .production==false and .hrWrites==false' "$OUT/health.json" >/dev/null
  (cd "$PHASEA_SOURCE_DIR" && "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "firestore:rules,hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive) | tee "$OUT/dev-deploy.log"
  TOKEN="$(gcloud auth print-access-token)"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$OUT/hosting.json"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/projects/$PROJECT/releases/cloud.firestore" > "$OUT/firestore-release.json"
  RULESET="$(jq -r '.rulesetName // empty' "$OUT/firestore-release.json")"
  test -n "$RULESET"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/$RULESET" > "$OUT/firestore-ruleset.json"
  jq -e '.source.files|length>0' "$OUT/firestore-ruleset.json" >/dev/null
  echo "PHASEA_RUNTIME=$REVISION" >> "$GITHUB_ENV"
  echo "PHASEA_DIGEST=$DIGEST" >> "$GITHUB_ENV"
  echo "PHASEA_RULESET=$RULESET" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_VERSION=$(jq -r '.release.version.name // empty' "$OUT/hosting.json")" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_RELEASE=$(jq -r '.release.name // empty' "$OUT/hosting.json")" >> "$GITHUB_ENV"
  ;;


readback)
  # READ ONLY: certify exactly the already-published artifact; never rebuild or deploy.
  test "$PROJECT" = "cxorbia-backend-dev"
  test "$SERVICE" = "cxorbia-live-hr-dev"
  test "$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")" = "HOLD_I3_PHASEA_CUMULATIVE_DEV_READBACK_ONLY_REQUIRED"
  TARGET="$OUT/materialization-target.json"
  jq '.i3PhaseADevReadbackTarget' "$CANDIDATE_DESCRIPTOR" > "$TARGET"
  test "$(jq -r '.sourceSha' "$TARGET")" = "$PHASEA_SOURCE"
  test "$(jq -r '.sourceTree' "$TARGET")" = "$PHASEA_TREE"
  test "$(jq -r '.project' "$TARGET")" = "$PROJECT"
  test "$(jq -r '.production' "$TARGET")" = "false"
  BUILD="$(jq -r '.cloudBuildId // empty' "$TARGET")"
  test -n "$BUILD"
  gcloud builds describe "$BUILD" --project "$PROJECT" --format=json > "$OUT/build-existing.json"
  test "$(jq -r '.status' "$OUT/build-existing.json")" = "SUCCESS"
  IMAGE_URI="$(jq -r '.imageUri' "$TARGET")"
  jq -e --arg u "$IMAGE_URI" '(.images // []) | index($u) != null' "$OUT/build-existing.json" >/dev/null
  EXPECTED_REV="$(jq -r '.runtimeRevision' "$TARGET")"
  EXPECTED_DIGEST="$(jq -r '.runtimeDigest' "$TARGET")"
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/runtime.json"
  test "$(jq -r '.status.latestReadyRevisionName' "$OUT/runtime.json")" = "$EXPECTED_REV"
  gcloud run revisions describe "$EXPECTED_REV" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/revision.json"
  RAW="$(jq -r '.status.imageDigest // empty' "$OUT/revision.json")"
  case "$RAW" in sha256:*) DIGEST="$RAW";; *@sha256:*) DIGEST="sha256:$(printf '%s' "$RAW"|sed 's/.*@sha256://')";; *) exit 1;; esac
  test "$DIGEST" = "$EXPECTED_DIGEST"
  TOKEN="$(gcloud auth print-access-token)"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$OUT/hosting.json"
  test "$(jq -r '.release.version.name' "$OUT/hosting.json")" = "$(jq -r '.hostingVersion' "$TARGET")"
  test "$(jq -r '.release.name' "$OUT/hosting.json")" = "$(jq -r '.hostingRelease' "$TARGET")"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/projects/$PROJECT/releases/cloud.firestore" > "$OUT/firestore-release.json"
  RULESET="$(jq -r '.rulesetName // empty' "$OUT/firestore-release.json")"
  test "$RULESET" = "$(jq -r '.firestoreRuleset' "$TARGET")"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/$RULESET" > "$OUT/firestore-ruleset.json"
  echo "PHASEA_RUNTIME=$EXPECTED_REV" >> "$GITHUB_ENV"
  echo "PHASEA_DIGEST=$DIGEST" >> "$GITHUB_ENV"
  echo "PHASEA_RULESET=$RULESET" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_VERSION=$(jq -r '.hostingVersion' "$TARGET")" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_RELEASE=$(jq -r '.hostingRelease' "$TARGET")" >> "$GITHUB_ENV"
  ;;

proof)
  sha256sum -c "$OUT/cxorbia-phasea-source.tar.sha256"
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/runtime-final.json"
  test "$(jq -r '.status.latestReadyRevisionName // empty' "$OUT/runtime-final.json")" = "$PHASEA_RUNTIME"
  jq -j '[.source.files[] | select(.name=="firestore.rules") | .content][0] // empty' "$OUT/firestore-ruleset.json" > "$OUT/firestore-remote.rules"
  cmp "$OUT/firestore-remote.rules" "$PHASEA_SOURCE_DIR/firestore.rules"
  for p in "${ASSETS[@]}";do remote="$OUT/remote-$(echo "$p"|tr '/' '_')";curl -fsSL --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/$p?proof=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote";test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$PHASEA_SOURCE:app/$p"|sha256sum|awk '{print $1}')";done
  curl -fsS --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&i3=$GITHUB_RUN_ID" > "$OUT/hr-meta.json";HR="$(jq -r '.revision // empty' "$OUT/hr-meta.json")";[[ "$HR" =~ ^[0-9a-f]{64}$ ]];jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .hrWrites==false and .production==false' "$OUT/hr-meta.json" >/dev/null
  jq -n -S --arg source "$PHASEA_SOURCE" --arg tree "$PHASEA_TREE" --arg runtime "$PHASEA_RUNTIME" --arg digest "$PHASEA_DIGEST" --arg hosting "$PHASEA_HOSTING_VERSION" --arg release "$PHASEA_HOSTING_RELEASE" --arg hr "$HR" --arg rules "$PHASEA_RULESET" --arg artifact "sha256:$(cut -d' ' -f1 "$OUT/cxorbia-phasea-source.tar.sha256")" '{decision:"PASS_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION",sourceSha:$source,sourceTree:$tree,artifactDigest:$artifact,sourceArtifact:"cxorbia-phasea-source.tar",runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hostingRelease:$release,firestoreRuleset:$rules,hrRevision:$hr,builds:1,runtimeDeploys:1,hostingDeploys:1,firestoreRulesDeploys:1,hrWrites:0,production:false}' > "$OUT/result.json";cat "$OUT/result.json"
  ;;
*) exit 2;;
esac

