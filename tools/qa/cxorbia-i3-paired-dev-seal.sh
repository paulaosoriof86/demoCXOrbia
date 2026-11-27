#!/usr/bin/env bash
set -Eeuo pipefail
case "${1:-}" in
strict-hr)
# Both executors use the same two probes. Each admitted probe issues one GET.
correlation="${CXORBIA_PAIRED_BUILD_ID:-${GITHUB_RUN_ID:?Missing native run identity}}"
[[ "$correlation" =~ ^[A-Za-z0-9_-]+$ ]]
probe_dir="$(mktemp -d "$FOCAL_OUT/.hr-probe.XXXXXX")"
trap 'rm -rf "$probe_dir"' EXIT
for format in meta json; do
  case "$format" in
    meta) file=hr-meta.json ;;
    json) file=hr-live.json ;;
  esac
  response="$probe_dir/$file"
  rc=0
  (umask 077; node tools/qa/cxorbia-i3-paired-hr-identity.mjs "$correlation" "seal-$format" > "$probe_dir/headers")
  status="$(curl -H "@$probe_dir/headers" -sS --retry 0 --connect-timeout 10 --max-time 120 \
    -H 'Cache-Control: no-cache, no-store, max-age=0' -o "$response" -w '%{http_code}' \
    "$HOSTING_URL/api/$TENANT_ID/$PROJECT_ID/hr-live?format=$format&vrm154156=$correlation")" || rc=$?
  classification=''
  transient=false
  marker=''
  if [[ -s "$response" ]]; then
    marker="$(jq -er --arg status "$status" '
      select(type=="object" and ($status!="200" or .ok==false or .error!=null)) |
      [.message,.code,.error,(.error | objects | .code,.message)] |
      map(strings | capture("^(?<kind>MAPPING_FAILURE|AUTH_FAILURE|PERSISTENCE_FAILURE|PROVIDER_FAILURE)(:|$)").kind) |
      first // empty' "$response" 2>/dev/null || true)"
  fi
  if ((rc != 0)); then
    classification=PROVIDER_FAILURE
    case "$rc" in 6|7|18|28|52|55|56) transient=true ;; esac
  elif [[ "$status" == 401 || "$status" == 403 ]]; then
    classification=AUTH_FAILURE
  elif [[ -n "$marker" || "$status" != 200 ]]; then
    classification="${marker:-PROVIDER_FAILURE}"
    if [[ "$classification" == PROVIDER_FAILURE && "$status" =~ ^(408|429|5[0-9]{2})$ ]]; then transient=true; fi
  elif [[ ! -s "$response" ]]; then
    classification=FUNCTIONAL_DEFECT
  elif [[ "$format" == meta ]]; then
    if ! jq -se 'length==1 and (.[0]|.ok==true and .revisionStable==true and .sourceSafe==true and .hrWrites==false and .production==false and (.revision|type=="string" and test("^[a-f0-9]{64}$")))' "$response" >/dev/null 2>&1; then
      classification=FUNCTIONAL_DEFECT
    fi
  elif ! jq -se 'length==1 and (.[0]|.sourceSafe==true and .production==false and (.projectConfig.scenarioDimensions|length)>=2 and ([.visits[]|select((.escenario//"")!="" and (.tipoCombo//"")!="")]|length)>0)' "$response" >/dev/null 2>&1; then
    classification=FUNCTIONAL_DEFECT
  fi
  if [[ -n "$classification" ]]; then
    body_hash=''
    if [[ -f "$response" ]]; then body_hash="$(sha256sum "$response" | cut -d' ' -f1)"; fi
    jq -n --arg bodyHash "$body_hash" --arg source "${FOCAL_SOURCE:-}" --arg run "$correlation" --arg tenant "$TENANT_ID" --arg project "$PROJECT_ID" \
      --arg probe "$format" --arg http "$status" --arg classification "$classification" \
      --argjson curlExit "$rc" --argjson transient "$transient" \
      '{runId:$run,tenantId:$tenant,projectId:$project,probe:$probe,httpStatus:$http,curlExit:$curlExit,classification:$classification,transient:$transient,automaticRetries:0,sourceSha:(if ($source|test("^[a-f0-9]{40}$")) then $source else null end),bodySha256:(if $bodyHash=="" then null else $bodyHash end),quarantineSameAttempt:($classification=="MAPPING_FAILURE" or $classification=="AUTH_FAILURE")}' > "$FOCAL_OUT/strict-hr-failure.json"
    exit 1
  fi
  mv "$response" "$FOCAL_OUT/$file"
done
echo "HR_REVISION=$(jq -er .revision "$FOCAL_OUT/hr-meta.json")" >> "$GITHUB_ENV"
;;
receipt)
set -Eeuo pipefail
DECISION="PASS_VRM154_156_EXACT_DEV_MATERIALIZATION"
case "$ACTIVE_STATUS" in
  HOLD_I3_F3_DEV_MATERIALIZED_ENV_REQUIRED) DECISION=PASS_I3_F3_SAME_ARTIFACT_ENV_REPAIR ;;
  HOLD_I3_F09_DEV_MATERIALIZED_C3_REPROOF_PENDING) DECISION=PASS_I3_F09_SAME_ARTIFACT_ENV_REPAIR ;;
  HOLD_VRM134_A05_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM134_A05_EXACT_DEV_MATERIALIZATION ;;
  HOLD_V190_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_V190_EXACT_DEV_MATERIALIZATION ;;
  HOLD_REJECTED_PHASEA_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_REJECTED_PHASEA_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM216_SHARED_IDEMPOTENCY_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM216_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM217_219_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM217_219_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM306_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM306_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM307_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM307_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM308_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM308_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM249_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM249_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM174_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_I3_VRM174_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM256_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM256_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM257_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM257_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM258_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM258_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM259_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM259_EXACT_DEV_MATERIALIZATION ;;
  HOLD_HUMAN_VISUAL_CHECKPOINT_REQUIRED_BEFORE_FURTHER_PRODUCT_MUTATION) DECISION=PASS_HUMAN_VISUAL_CHECKPOINT_EXACT_DEV_MATERIALIZATION ;;
  HOLD_VRM309_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM309_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_B11_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_I3_B11_HR_DATE_SEMANTICS_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_CERT_CARRYOVER_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM316_CERT_CARRYOVER_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM317_D06_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM317_D06_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM318_D06_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM318_D06_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM319_D06_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM319_D06_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM320_B3_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_VRM320_B3_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_F09_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_I3_F09_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM143_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_I3_VRM143_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM350_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_I3_VRM350_EXACT_DEV_MATERIALIZATION ;;
  HOLD_I3_VRM358_DEV_MATERIALIZATION_REQUIRED) DECISION=PASS_I3_VRM358_EXACT_DEV_MATERIALIZATION ;;
   HOLD_I3_F2_EXCEL_OPERATIONAL_READER_SOURCE_ONLY_PENDING_DEV_6_OF_21) DECISION=PASS_I3_F2_READER_SOURCE_DEV_MATERIALIZATION ;;
  HOLD_I3_GTHN_PENDING_DEV) DECISION=PASS_I3_GTHN_EXACT_DEV_MATERIALIZATION ;;
esac
jq -n -S --arg d "$DECISION" --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --arg runtime "$DEV_REVISION" --arg digest "$RUNTIME_DIGEST" --arg hosting "$HOSTING_VERSION_NAME" --arg hostingRelease "$HOSTING_RELEASE_NAME" --arg hr "$HR_REVISION" --argjson reuse "$PAIR_ENV_ONLY" --argjson b "$(jq -er .builds "$FOCAL_OUT/build.json")" '{decision:$d,sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hostingRelease:$hostingRelease,hrRevision:$hr,builds:$b,runtimeDeploys:1,hostingDeploys:(if $reuse then 0 else 1 end),storageRulesDeploys:0,scenarioDimensionsProven:true,production:false}' > "$FOCAL_OUT/result.json"
if test -f "$FOCAL_OUT/build-resume.json"; then jq --slurpfile resume "$FOCAL_OUT/build-resume.json" '.+{buildProvenance:$resume[0]}' "$FOCAL_OUT/result.json" > "$FOCAL_OUT/next.json"; mv "$FOCAL_OUT/next.json" "$FOCAL_OUT/result.json"; fi
if test -f "$FOCAL_OUT/hr-history-seed.json"; then node tools/qa/cxorbia-i3-hr-period-window-dev-readback.mjs; fi
;;
verify)
set -Eeuo pipefail
TOKEN="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/projects/$PROJECT/releases/cloud.firestore" > "$FOCAL_OUT/rules-after.json"
if [[ "$FOCAL_SOURCE" == 5d681a6e3012d8651c39513a3fb2cc867ba2cd08 ]]; then
  node tools/release/cxorbia-corte6-firestore-rules-deploy.mjs --i3-paired verify
else
  test "$(jq -r '.rulesetName' "$FOCAL_OUT/rules-before.json")" = "$(jq -r '.rulesetName' "$FOCAL_OUT/rules-after.json")"
fi
curl -fsSL -H 'Cache-Control: no-cache' https://tya-plataforma.web.app/ -o "$FOCAL_OUT/production-after.html"
cmp -s "$FOCAL_OUT/production-before.html" "$FOCAL_OUT/production-after.html"
CXORBIA_I3_QA_SCOPE=PAIRED_DEV_RECEIPT node tools/qa/cxorbia-i3-hr-ack-exact-same-revision.mjs
cat "$FOCAL_OUT/result.json"
if [[ "$ACTIVE_STATUS" == HOLD_I3_VRM358_DEV_MATERIALIZATION_REQUIRED ]]; then
  CXORBIA_I3_QA_SCOPE=B14_BINDING_READBACK_DEV node tools/qa/cxorbia-i3-hr-ack-exact-same-revision.mjs "$FOCAL_OUT/hr-meta.json" "$FOCAL_OUT/b14-binding/b14-binding-repair.json" "$FOCAL_OUT/b14-binding/runtime-binding-readback.json"
  QA_OUT="$FOCAL_OUT/hr-after" CXORBIA_I3_QA_SCOPE=HR_DURABLE_REVISION_READONLY node tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs
elif [[ "$ACTIVE_STATUS" == HOLD_I3_GTHN_PENDING_DEV || "$ACTIVE_STATUS" == HOLD_I3_F3_DEV_MATERIALIZED_ENV_REQUIRED ]]; then
  QA_OUT="$FOCAL_OUT/hr-after" CXORBIA_I3_QA_SCOPE=EXCEL_CANONICAL_ID_READONLY node tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs
 elif [[ "$ACTIVE_STATUS" == HOLD_I3_F2_EXCEL_OPERATIONAL_READER_SOURCE_ONLY_PENDING_DEV_6_OF_21 ]]; then
   QA_OUT="$FOCAL_OUT/hr-after" CXORBIA_I3_QA_SCOPE=HR_DURABLE_REVISION_READONLY node tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs
elif [[ "$ACTIVE_STATUS" == HOLD_I3_VRM143_DEV_MATERIALIZATION_REQUIRED || "$ACTIVE_STATUS" == HOLD_I3_VRM350_DEV_MATERIALIZATION_REQUIRED ]]; then
  QA_OUT="$FOCAL_OUT/hr-after" CXORBIA_I3_QA_SCOPE=HR_DURABLE_REVISION_READONLY node tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs
  EXPECTED_HR_REVISION="$HR_REVISION" QA_OUT="$FOCAL_OUT/notifications" CXORBIA_I3_QA_SCOPE=VRM143_NOTIFICATION_CYCLE CXORBIA_I3_QA_ISOLATED_WRITE_GATE=PAULA_AUTHORIZED_VRM143_DEV_ONLY node tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs
else
EXPECTED_HR_REVISION="$HR_REVISION" QA_OUT="$FOCAL_OUT/f09" CXORBIA_I3_QA_SCOPE=F09_CLIENT_COLLABORATION CXORBIA_I3_QA_ISOLATED_WRITE_GATE=PAULA_AUTHORIZED_F09_DEV_ONLY node tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs
fi
;;
*) echo "Unsupported paired seal command" >&2; exit 2;;
esac
