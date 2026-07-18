#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${CXORBIA_OUT_DIR:-.tmp/r15g-dev-deploy}"
REQUEST_FILE="${CXORBIA_EXECUTION_REQUEST:-backend/config/phase-a-hosting-dev-execution-request-v1.json}"
DEV_URL="${CXORBIA_DEV_ROOT_URL:-https://cxorbia-backend-dev.web.app}"
PROJECT_ID="${FIREBASE_PROJECT_ID:-cxorbia-backend-dev}"
HOSTING_TARGET="${FIREBASE_HOSTING_TARGET:-cxorbia-dev}"
BUILD_LABEL="${CXORBIA_V159_BUILD_LABEL:-v159-r18d-source-safe-20260717-dev}"
mkdir -p "$OUT_DIR"

cleanup() {
  rm -f "$OUT_DIR/firebase-service-account.json"
  if [ -f "$OUT_DIR/server.pid" ]; then
    kill "$(cat "$OUT_DIR/server.pid")" 2>/dev/null || true
  fi
}
trap cleanup EXIT

validate_authorization() {
  test "$(git branch --show-current)" = "docs-tya-v6-v71-audit"
  test "$(git rev-parse HEAD)" = "$GITHUB_SHA"

  if [ "${CXORBIA_EVENT_NAME:-}" = "workflow_dispatch" ]; then
    test "${CXORBIA_MANUAL_CONFIRM:-}" = "DEPLOY_DEV_ROOT_R15G"
  elif [ "${CXORBIA_EVENT_NAME:-}" = "push" ]; then
    test -n "${CXORBIA_EVENT_BEFORE:-}"
    test -s "$REQUEST_FILE"
    mapfile -t changed < <(git diff --name-only "$CXORBIA_EVENT_BEFORE" "$GITHUB_SHA")
    test "${#changed[@]}" -eq 1
    test "${changed[0]}" = "$REQUEST_FILE"
  else
    echo "Unsupported event: ${CXORBIA_EVENT_NAME:-missing}" >&2
    exit 1
  fi

  node <<'NODE'
  const fs = require('fs');
  const eventName = process.env.CXORBIA_EVENT_NAME;
  const registry = JSON.parse(fs.readFileSync('backend/contracts/prototype-baseline-registry-v1.json','utf8'));
  const runtime = registry.currentRuntime || {};
  const manifest = JSON.parse(fs.readFileSync(runtime.manifestFile,'utf8'));
  const buildLock = fs.readFileSync('app/core/build-lock.js','utf8');
  const expected = {
    repository:'paulaosoriof86/demoCXOrbia', branch:'docs-tya-v6-v71-audit', runtimeVersion:'V159',
    targetProject:'cxorbia-backend-dev', hostingTarget:'cxorbia-dev', confirm:'DEPLOY_DEV_ROOT_R15G', scope:'hosting_dev_only'
  };
  const fail = message => { throw new Error(message); };
  if (registry.repository !== expected.repository) fail('repository mismatch');
  if (registry.integrationBranch !== expected.branch) fail('integration branch mismatch');
  if (runtime.version !== expected.runtimeVersion) fail('runtime version mismatch');
  if (runtime.status !== 'empalmed_pending_post_gates') fail('runtime state is not deploy-eligible');
  if (runtime.accepted !== true || runtime.empalmed !== true || runtime.active !== false) fail('runtime transition evidence mismatch');
  if (manifest.version !== runtime.version || manifest.candidateSha256 !== runtime.sourceZipSha256 || manifest.aggregateSha256 !== runtime.aggregateSha256) fail('manifest/runtime mismatch');
  for (const value of [runtime.manifestFile,runtime.sourceZipSha256,runtime.aggregateSha256]) if (!value || !buildLock.includes(value)) fail('build lock mismatch');
  if (eventName === 'push') {
    const request = JSON.parse(fs.readFileSync(process.env.CXORBIA_EXECUTION_REQUEST,'utf8'));
    if (request.schemaVersion !== '1.0.0' || request.status !== 'authorized_once' || request.authorizedBy !== 'Paula') fail('request authorization mismatch');
    if (request.authorizationSource !== 'current_conversation_2026-07-18' || request.confirm !== expected.confirm || request.scope !== expected.scope) fail('request scope mismatch');
    if (request.repository !== expected.repository || request.branch !== expected.branch) fail('request repository/branch mismatch');
    if (request.targetProject !== expected.targetProject || request.hostingTarget !== expected.hostingTarget) fail('request hosting target mismatch');
    if (request.baseHead !== process.env.CXORBIA_EVENT_BEFORE) fail('request is not bound to previous HEAD');
    if (request.runtimeVersion !== runtime.version || request.sourceZipSha256 !== runtime.sourceZipSha256 || request.manifestFile !== runtime.manifestFile || request.aggregateSha256 !== runtime.aggregateSha256 || request.empalmeCommit !== runtime.empalmeCommit) fail('request runtime evidence mismatch');
  }
  console.log(JSON.stringify({ok:true,decision:'PASS_HOSTING_DEV_EXECUTION_AUTHORIZATION',eventName,runtimeVersion:runtime.version,targetProject:expected.targetProject,hostingTarget:expected.hostingTarget,production:false,dataWrites:false},null,2));
NODE
}

build_exact_runtime() {
  node tools/qa/verify-fast-lane-promotion-policy.mjs
  node tools/qa/verify-prototype-baseline-atomicity.mjs
  node tools/release/tya-v159-empalme-directo-verify.mjs
  node --check app/core/build-lock.js
  git diff --check

  CXORBIA_HR_SOURCE_SAFE_OUT=app/data/tya-hr-source-safe-periods.js \
  CXORBIA_HR_LIVE_MAX_ROW=140 \
  CXORBIA_HR_LIVE_MAX_COL=AI \
  CXORBIA_DEV_BUILD_LABEL="$BUILD_LABEL" \
  node tools/hr-source/tya-build-live-hr-source-safe-r15g.mjs

  node tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs \
    --input app/data/tya-hr-source-safe-periods.js \
    --out app/data/tya-hr-source-safe-periods.js \
    --report-dir "$OUT_DIR/r18a-canonicalization"

  node tools/reconciliation/tya-apply-existing-r11d-r14c-certification-r18b.mjs \
    --payload app/data/tya-hr-source-safe-periods.js \
    --out app/data/tya-hr-source-safe-periods.js \
    --report-dir "$OUT_DIR/r18b-existing-overlays"

  node <<'NODE'
  const fs = require('fs');
  const rows = JSON.parse(fs.readFileSync('backend/config/phase-a-financial-review-queue-r14c.source-safe.json','utf8'));
  if (!Array.isArray(rows) || rows.length !== 92) throw new Error('Expected 92 approved R14C review items.');
  const normalized = rows.map((item,index)=>({...item,key:item.key || `r14c_control:${item.type || 'review'}:${item.entityId || 'source'}:${String(index+1).padStart(3,'0')}`,sourceSafe:true}));
  if (new Set(normalized.map(item=>item.key)).size !== normalized.length) throw new Error('R14C stable keys are not unique.');
  fs.writeFileSync(process.env.CXORBIA_OUT_DIR + '/r14c-review-queue-stable.source-safe.json',JSON.stringify(normalized,null,2)+'\n','utf8');
NODE

  node tools/release/tya-source-safe-binding-build-r18a.mjs \
    --html app/index.html \
    --out "$OUT_DIR/source-safe-binding"

  node tools/release/tya-visible-overlays-build-r18d.mjs \
    --html app/index.html \
    --r14c-queue "$OUT_DIR/r14c-review-queue-stable.source-safe.json" \
    --out "$OUT_DIR/visible-overlay-build"

  node <<'NODE'
  const fs = require('fs');
  const raw = fs.readFileSync('app/data/tya-hr-source-safe-periods.js','utf8');
  const prefix = 'window.CX_TYA_HR_SOURCE_SAFE = ';
  const snapshot = JSON.parse(raw.slice(raw.indexOf(prefix)+prefix.length,raw.lastIndexOf(';')));
  const current = Number(snapshot.counts?.shoppers ?? snapshot.shoppers?.length ?? 0);
  if (!Number.isInteger(current) || current <= 0 || current !== Number(snapshot.shoppers?.length || 0)) throw new Error('Invalid shopper source count.');
  const proof = {
    schemaVersion:'1.0.0',environment:'dev',build:process.env.CXORBIA_V159_BUILD_LABEL,commit:process.env.GITHUB_SHA,
    tenantId:'tya',projectId:'cinepolis',expectedPeriods:14,expectedVisits:616,currentSourceShoppers:current,currentPeriodVisits:44,
    visibleDataGate:true,hostingOnly:true,firestoreWrites:false,authWrites:false,storageWrites:false,hrWrites:false,imports:false,
    rules:false,functions:false,make:false,gemini:false,payments:false,production:false,generatedAt:new Date().toISOString()
  };
  fs.writeFileSync('app/cxorbia-v159-dev-build-proof.json',JSON.stringify(proof,null,2)+'\n','utf8');
  fs.writeFileSync(process.env.CXORBIA_OUT_DIR + '/build-proof.json',JSON.stringify(proof,null,2)+'\n','utf8');
  fs.writeFileSync(process.env.CXORBIA_OUT_DIR + '/shopper-drift-review.json',JSON.stringify({currentSourceShoppers:current,auditedReference:216,decision:current===216?'MATCH_REFERENCE':'REVIEW_DRIFT_VISUAL_ALLOWED',r11dReviewRequired:current!==216,historicalShopperMaterialization:false,deleteHistoricalShoppers:false,production:false},null,2)+'\n','utf8');
NODE
}

run_local_gates() {
  npm init -y >/dev/null
  npm i -D playwright@1.47.2
  npx playwright install --with-deps chromium
  python3 -m http.server 4173 --bind 127.0.0.1 --directory app > "$OUT_DIR/server.log" 2>&1 &
  echo $! > "$OUT_DIR/server.pid"
  for attempt in $(seq 1 30); do
    curl -fsS 'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible' >/dev/null && break
    [ "$attempt" -eq 30 ] && { cat "$OUT_DIR/server.log" || true; exit 1; }
    sleep 1
  done
  export CXORBIA_BASE_URL='http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible'
  export CXORBIA_EXPECT_TENANT_ID=tya CXORBIA_EXPECT_PROJECT_ID=cinepolis CXORBIA_EXPECT_PERIODS=14 CXORBIA_EXPECT_VISITS=616 CXORBIA_EXPECT_SHOPPERS=216 CXORBIA_EXPECT_VISITS_PER_PERIOD=44 CXORBIA_MAX_SOURCE_AGE_HOURS=24
  node tools/qa/tya-source-semantics-r15g-gate.mjs --out "$OUT_DIR/local-source-semantics"
  node tools/qa/tya-phase-a-source-safe-visual-smoke.mjs --out "$OUT_DIR/local-role-smoke"
  node tools/qa/tya-project-period-kpi-history-gate.mjs --out "$OUT_DIR/local-project-period-kpi-history"
  node tools/qa/tya-phase-a-visible-overlays-smoke-r18d.mjs --out "$OUT_DIR/local-visible-overlays"
}

validate_and_deploy() {
  if [ -z "${FIREBASE_SERVICE_ACCOUNT_JSON:-}" ]; then echo 'Missing FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV.' >&2; exit 1; fi
  printf '%s' "$FIREBASE_SERVICE_ACCOUNT_JSON" > "$OUT_DIR/firebase-service-account.json"
  chmod 600 "$OUT_DIR/firebase-service-account.json"
  node <<'NODE'
  const fs=require('fs');
  const value=JSON.parse(fs.readFileSync(process.env.CXORBIA_OUT_DIR + '/firebase-service-account.json','utf8'));
  if(value.type!=='service_account' || value.project_id!=='cxorbia-backend-dev' || !String(value.client_email||'').endsWith('@cxorbia-backend-dev.iam.gserviceaccount.com')) throw new Error('Firebase DEV credential mismatch.');
NODE
  export GOOGLE_APPLICATION_CREDENTIALS="$GITHUB_WORKSPACE/$OUT_DIR/firebase-service-account.json"
  npx --yes firebase-tools@latest hosting:sites:list --project "$PROJECT_ID" --json > "$OUT_DIR/hosting-sites.json"
  grep -q 'cxorbia-backend-dev' "$OUT_DIR/hosting-sites.json"
  npx --yes firebase-tools@latest deploy --only "hosting:$HOSTING_TARGET" --project "$PROJECT_ID" --non-interactive --json 2>&1 | tee "$OUT_DIR/firebase-deploy-output.txt"
}

verify_remote_with_propagation_poll() {
  local proof_url="$DEV_URL/cxorbia-v159-dev-build-proof.json"
  local verified=false
  for attempt in $(seq 1 18); do
    local candidate="$OUT_DIR/remote-build-proof-attempt-${attempt}.json"
    if curl -fsSL --max-time 30 -H 'Cache-Control: no-cache' "${proof_url}?build=${BUILD_LABEL}&attempt=${attempt}&ts=$(date +%s)" > "$candidate"; then
      if node - "$candidate" <<'NODE'
      const fs=require('fs');
      const file=process.argv[2];
      let proof;
      try { proof=JSON.parse(fs.readFileSync(file,'utf8')); } catch { process.exit(2); }
      const expected={build:process.env.CXORBIA_V159_BUILD_LABEL,commit:process.env.GITHUB_SHA};
      if(proof.environment!=='dev' || proof.build!==expected.build || proof.commit!==expected.commit || proof.tenantId!=='tya' || proof.projectId!=='cinepolis') process.exit(3);
      if(proof.hostingOnly!==true || proof.firestoreWrites!==false || proof.authWrites!==false || proof.storageWrites!==false || proof.hrWrites!==false || proof.imports!==false || proof.rules!==false || proof.functions!==false || proof.make!==false || proof.gemini!==false || proof.payments!==false || proof.production!==false) process.exit(4);
NODE
      then
        cp "$candidate" "$OUT_DIR/remote-build-proof.json"
        verified=true
        break
      fi
    fi
    sleep 5
  done
  if [ "$verified" != true ]; then
    echo 'Remote exact build proof did not converge after propagation polling.' >&2
    exit 1
  fi

  export CXORBIA_BASE_URL="$DEV_URL/index.html?cxTyaPhaseA=1&r18d=visible"
  curl -fsSIL -H 'Cache-Control: no-cache' "$DEV_URL" > "$OUT_DIR/dev-root-headers.txt"
  node tools/qa/tya-source-semantics-r15g-gate.mjs --out "$OUT_DIR/remote-source-semantics"
  node tools/qa/tya-phase-a-source-safe-visual-smoke.mjs --out "$OUT_DIR/remote-role-smoke"
  node tools/qa/tya-project-period-kpi-history-gate.mjs --out "$OUT_DIR/remote-project-period-kpi-history"
  node tools/qa/tya-phase-a-visible-overlays-smoke-r18d.mjs --out "$OUT_DIR/remote-visible-overlays"
  printf '{"ok":true,"decision":"PASS_R15G_HOSTING_DEV_AND_REMOTE_SMOKE","build":"%s","commit":"%s"}\n' "$BUILD_LABEL" "$GITHUB_SHA" > "$OUT_DIR/final-status.json"
}

export CXORBIA_OUT_DIR="$OUT_DIR" CXORBIA_V159_BUILD_LABEL="$BUILD_LABEL" CXORBIA_EXECUTION_REQUEST="$REQUEST_FILE"
validate_authorization
build_exact_runtime
run_local_gates
validate_and_deploy
verify_remote_with_propagation_poll
