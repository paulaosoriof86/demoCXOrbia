#!/usr/bin/env bash
set -Eeuo pipefail
: "${PREI4_CONTENT001_SOURCE:?}" "${PREI4_CONTENT001_TREE:?}" "${PREI4_CONTENT001_OUT:?}" "${PREI4_CONTENT001_ROOT:?}"
test "$PREI4_CONTENT001_SOURCE" = "2cff3441f126d7d805932127bb9de9289ba273ad"
test "$PREI4_CONTENT001_TREE" = "3c7b6736e2b5884e28bc87ed9b7dd346e1fd3b8a"
test "$(git rev-parse "$PREI4_CONTENT001_SOURCE^{tree}")" = "$PREI4_CONTENT001_TREE"
mkdir -p "$PREI4_CONTENT001_OUT"

export CUM_SOURCE="$PREI4_CONTENT001_SOURCE" CUM_TREE="$PREI4_CONTENT001_TREE"
export CUM_BASE="c487449e5187d7219033c54fa1ac3db5fb6c822e"
export CUM_LEDGER="CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V176_2026-09-30.json"
export CUM_MATRIX="RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json"
export CUM_OUT="$PREI4_CONTENT001_OUT/source-guard"
export CUM_EXPECTED_DELTA_JSON='["app/adapters/cxorbia-canonical-write-firewall-v1.js","app/adapters/cxorbia-command-adapter-v1.js","app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/cxorbia-provider-identity-link-runtime-v1.js","app/adapters/cxorbia-shopper-admin-command-contract-v1.js","app/adapters/tya-c6-unified-human-runtime-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-canonical-shopper-portal-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/core/backend-browser-auth.js","app/core/router.js","app/modules/beneficios.js","app/modules/cuestionario-shopper.js","app/modules/finanzas.js","app/modules/midia.js","app/modules/misvisitas.js","app/modules/operacion-extra.js","app/modules/postulaciones.js","app/modules/proyectos.js","app/modules/reservas.js","app/modules/shoppers.js","app/modules/visitas.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/cxorbia-shopper-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs","backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs","backend/runtime/hr-live-service/test/cxorbia-prei4-project-questionnaire-config.test.mjs","backend/runtime/hr-live-service/test/cxorbia-prei4-shopper-progressive-route.test.mjs"]'
export CUM_ALLOWED_PENDING_MODULES_JSON='["auth-protected-data-runtime","benefits","canonical-hr-state-adapters","core-config-data-router-permissions","dashboard-operation","finance-core-liquidation-costs","human-runtime-domain-consistency","identity-membership-roll-forward","persistence-command-ack-boundary","phase-a-supporting-core","projects-periods-hr-source-wizard-multiproject","questionnaire-shopper","reports-admin-shopper","shoppers-mi-visitas-profile","visits-review-postulations-reservations"]'
export CUM_EXPECTED_PENDING_FILES_JSON='["app/adapters/cxorbia-canonical-write-firewall-v1.js","app/adapters/cxorbia-command-adapter-v1.js","app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/cxorbia-provider-identity-link-runtime-v1.js","app/adapters/cxorbia-shopper-admin-command-contract-v1.js","app/adapters/tya-c6-unified-human-runtime-v1.js","app/adapters/tya-canonical-finance-read-model-v2.js","app/adapters/tya-canonical-shopper-portal-v2.js","app/adapters/tya-live-source-inplace-apply.js","app/adapters/tya-protected-auth-hr-authority-bridge-v2.js","app/core/backend-browser-auth.js","app/core/router.js","app/modules/beneficios.js","app/modules/cuestionario-shopper.js","app/modules/finanzas.js","app/modules/midia.js","app/modules/misvisitas.js","app/modules/operacion-extra.js","app/modules/postulaciones.js","app/modules/proyectos.js","app/modules/reservas.js","app/modules/shoppers.js","app/modules/visitas.js","backend/runtime/cxorbia-finance-command-provider-v1.mjs","backend/runtime/cxorbia-shopper-command-provider-v1.mjs","backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs","backend/runtime/hr-live-service/server.mjs"]'
export CUM_ALLOWED_POST002_SUCCESSOR_OWNERS_JSON='["app/modules/misvisitas.js","app/modules/postulaciones.js"]'
export CUM_ALLOWED_ADMIN003_SUCCESSOR_OWNERS_JSON='["app/modules/shoppers.js","backend/runtime/cxorbia-shopper-command-provider-v1.mjs"]'
mkdir -p "$CUM_OUT"
node tools/qa/cxorbia-prei4-cumulative-regression-source-guard.mjs | tee "$CUM_OUT/console.log"
test "$(jq -r '.decision' "$CUM_OUT/result.json")" = "PASS_PREI4_CUMULATIVE_REGRESSION_SOURCE_GUARD"
for p in app/adapters/cxorbia-canonical-write-firewall-v1.js app/adapters/cxorbia-command-adapter-v1.js app/adapters/cxorbia-cxdata-command-boundary-v1.js app/adapters/cxorbia-provider-identity-link-runtime-v1.js app/adapters/cxorbia-shopper-admin-command-contract-v1.js app/adapters/tya-c6-unified-human-runtime-v1.js app/adapters/tya-canonical-finance-read-model-v2.js app/adapters/tya-canonical-shopper-portal-v2.js app/adapters/tya-live-source-inplace-apply.js app/adapters/tya-protected-auth-hr-authority-bridge-v2.js app/core/backend-browser-auth.js app/core/router.js app/modules/beneficios.js app/modules/cuestionario-shopper.js app/modules/finanzas.js app/modules/midia.js app/modules/misvisitas.js app/modules/operacion-extra.js app/modules/postulaciones.js app/modules/proyectos.js app/modules/reservas.js app/modules/shoppers.js app/modules/visitas.js backend/runtime/cxorbia-finance-command-provider-v1.mjs backend/runtime/cxorbia-shopper-command-provider-v1.mjs backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs backend/runtime/hr-live-service/server.mjs; do node --check "$p"; done
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
HOSTING_DEPLOY_COUNT=0
REUSED_EXISTING=false
IMAGE_URI="gcr.io/${PROJECT}/${SERVICE}:prei4-v176-${PREI4_CONTENT001_SOURCE:0:12}-${GITHUB_RUN_ID}"
echo "$IMAGE_URI" > "$PREI4_CONTENT001_OUT/image-uri.txt"
gcloud builds submit "$SOURCE_DIR" --project "$PROJECT" --config "$SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE_URI" --quiet | tee "$PREI4_CONTENT001_OUT/runtime-build.log"
gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE_URI" --min-instances=1 --max-instances=1 --update-env-vars "$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE" --quiet
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_CONTENT001_OUT/runtime-after.json"
REV="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_CONTENT001_OUT/runtime-after.json")"; test -n "$REV"
gcloud run revisions describe "$REV" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_CONTENT001_OUT/runtime-revision.json"
RAW="$(jq -r '.status.imageDigest // empty' "$PREI4_CONTENT001_OUT/runtime-revision.json")"
if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; elif [[ "$RAW" == *@sha256:* ]]; then DIGEST="sha256:${RAW##*@sha256:}"; else exit 1; fi
URL="$(jq -r '.status.url // empty' "$PREI4_CONTENT001_OUT/runtime-after.json")"; test -n "$URL"

cd "$SOURCE_DIR"
"$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$PREI4_CONTENT001_OUT/hosting-deploy.log"
cd "$GITHUB_WORKSPACE"
HOSTING_DEPLOY_COUNT=1
TOKEN="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_CONTENT001_OUT/hosting-after.json"
HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$PREI4_CONTENT001_OUT/hosting-after.json")"; test -n "$HOSTING_VERSION"

curl -fsS --retry 10 --retry-delay 3 "$URL/health" > "$PREI4_CONTENT001_OUT/health.json"
jq -e '.ok==true and .production==false and .hrWrites==false' "$PREI4_CONTENT001_OUT/health.json" >/dev/null

for p in app/adapters/cxorbia-canonical-write-firewall-v1.js app/adapters/cxorbia-command-adapter-v1.js app/adapters/cxorbia-cxdata-command-boundary-v1.js app/adapters/cxorbia-provider-identity-link-runtime-v1.js app/adapters/cxorbia-shopper-admin-command-contract-v1.js app/adapters/tya-c6-unified-human-runtime-v1.js app/adapters/tya-canonical-finance-read-model-v2.js app/adapters/tya-canonical-shopper-portal-v2.js app/adapters/tya-live-source-inplace-apply.js app/adapters/tya-protected-auth-hr-authority-bridge-v2.js app/core/backend-browser-auth.js app/core/router.js app/modules/beneficios.js app/modules/cuestionario-shopper.js app/modules/finanzas.js app/modules/midia.js app/modules/misvisitas.js app/modules/operacion-extra.js app/modules/postulaciones.js app/modules/proyectos.js app/modules/reservas.js app/modules/shoppers.js app/modules/visitas.js; do
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

curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&fresh=1&v176fresh=$GITHUB_RUN_ID-$(date +%s%N)" > "$PREI4_CONTENT001_OUT/hr-fresh.json"
jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .refreshError==null and .hrWrites==false and .production==false and (.cacheMs|tonumber)<=15000' "$PREI4_CONTENT001_OUT/hr-fresh.json" >/dev/null
HR_REVISION="$(jq -r '.revision // empty' "$PREI4_CONTENT001_OUT/hr-fresh.json")"; [[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]
ok=0
for i in $(seq 1 24); do
  curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_CONTENT001_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&v176reconcile=$GITHUB_RUN_ID-$i" > "$PREI4_CONTENT001_OUT/hr-meta.json"
  if jq -e --arg rev "$HR_REVISION" '.ok==true and .revision==$rev and .sourceSafe==true and .refreshError==null and .shopperReconciliation.providerAck==true and .visitReconciliation.providerAck==true and .hrWrites==false and .production==false' "$PREI4_CONTENT001_OUT/hr-meta.json" >/dev/null; then ok=1; break; fi
  sleep 5
done
test "$ok" = 1
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

mkdir -p "$PREI4_CONTENT001_OUT/post002" "$PREI4_CONTENT001_OUT/admin003" "$PREI4_CONTENT001_OUT/finance" "$PREI4_CONTENT001_OUT/questionnaire"
PREI4_002_LIVE_OUT="$PREI4_CONTENT001_OUT/post002" PREI4_002_ROOT="$PREI4_CONTENT001_ROOT" PREI4_002_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_002_TREE="$PREI4_CONTENT001_TREE" PREI4_002_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/post002.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/post002/result.json")" = "PASS_PREI4_ADMIN_002_HOSTING_LIVE"
PREI4_003_LIVE_OUT="$PREI4_CONTENT001_OUT/admin003" PREI4_003_ROOT="$PREI4_CONTENT001_ROOT" PREI4_003_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_003_TREE="$PREI4_CONTENT001_TREE" PREI4_003_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin003-cumulative-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/admin003.log"
test "$(jq -r '.decision' "$PREI4_CONTENT001_OUT/admin003/result.json")" = "PASS_PREI4_ADMIN_003_CUMULATIVE_LIVE"
PREI4_004_LIVE_OUT="$PREI4_CONTENT001_OUT/finance" PREI4_004_ROOT="$PREI4_CONTENT001_ROOT" PREI4_004_SOURCE="$PREI4_CONTENT001_SOURCE" PREI4_004_TREE="$PREI4_CONTENT001_TREE" PREI4_004_HR_REVISION="$HR_REVISION" node tools/qa/cxorbia-prei4-admin004-cumulative-live-reproof.mjs | tee "$PREI4_CONTENT001_OUT/finance.log"
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
  '{decision:"PASS_PREI4_V176_CUMULATIVE_DEV_LIVE",legacyDecision:"PASS_PREI4_CONTENT002_CUMULATIVE_DEV_LIVE",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:$hr,closedRegression:{postulations:$post,identity:$identity,finance:$finance},questionnaire:$questionnaire,builds:$builds,runtimeDeploys:$runtimeDeploys,hostingDeploys:$hostingDeploys,reusedExistingMaterialization:$reused,rulesDeploys:0,externalPaymentWrites:0,bankWrites:0,hrWrites:0,production:false}' > "$PREI4_CONTENT001_OUT/receipt.json"
