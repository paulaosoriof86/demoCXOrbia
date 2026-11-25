#!/usr/bin/env bash
# Sourced by the existing Google QA transport with the shared create-only put().
set -Eeuo pipefail
shopt -s inherit_errexit
umask 077
export PROJECT=cxorbia-backend-dev SERVICE=cxorbia-live-hr-dev REGION=us-central1
export GCLOUD_PROJECT="$PROJECT" GOOGLE_CLOUD_QUOTA_PROJECT="$PROJECT" HOSTING_URL="https://$PROJECT.web.app"
export CANDIDATE_DESCRIPTOR=CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json
export CXORBIA_GOOGLE_QA_BRANCH=recovery/cxorbia-phase-a-20260831
producer=12f9ea2058e34085a4c668a1bfd3147fcdf266a4
runner=tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs
[[ "$(git rev-parse HEAD)" == "$producer" && -z "${GITHUB_ACTIONS:-}${GITHUB_RUN_ID:-}" ]]
[[ "$(gcloud config get-value project)" == "$PROJECT" && "$(node -p 'process.versions.node.split(".")[0]')" == 24 ]]
for file in "$runner" tools/qa/cxorbia-i3-{google-qa-execution.mjs,finance-google-transport.sh,d08-google-transport.sh} docs/checkpoints/CXORBIA_I3_D08_2783_ABSENCE_SCOPE_20261125.json; do
  [[ "$(git hash-object "$file")" == "$(git rev-parse "$CXORBIA_TRANSPORT_SHA:$file")" ]]
done
request=$(jq -er '.currentD08UiQaRequest.path' CXORBIA_RECOVERY_EXECUTION_CURRENT.json)
export TENANT_ID PROJECT_ID FOCAL_SOURCE FOCAL_TREE
read -r TENANT_ID PROJECT_ID FOCAL_SOURCE FOCAL_TREE < <(jq -er '[.tenantId,.projectId,.sourceSha,.sourceTree]|@tsv' "$request")
# Preserve the current invocation's checkpoint across Cloud Shell VM reconnects.
mkdir -p "$HOME/.cxorbia-i3-qa"
dir=$(mktemp -d "$HOME/.cxorbia-i3-qa/d08.XXXXXXXX")
export QA_OUT="$dir/evidence" CXORBIA_GOOGLE_QA_ENV="$dir/qa.env"
CXORBIA_I3_QA_SCOPE=D08_PREFLIGHT node "$runner"
while IFS='=' read -r key value; do
  case "$key" in D08_QA_CLEANUP_ONLY|D08_QA_REQUEST|CXORBIA_I3_QA_SCOPE|CXORBIA_I3_QA_ISOLATED_WRITE_GATE|DEV_REVISION|RUNTIME_DIGEST|HOSTING_VERSION_NAME) export "$key=$value";; *) exit 24;; esac
done < "$CXORBIA_GOOGLE_QA_ENV"
[[ "$D08_QA_CLEANUP_ONLY" == false && "$CXORBIA_I3_QA_SCOPE" == D08_ACADEMY_UI ]]
node --input-type=module -e 'import fs from "node:fs";for(const [p,v] of [["firebase-admin","13.4.0"],["playwright","1.56.1"]])if(JSON.parse(fs.readFileSync("node_modules/"+p+"/package.json")).version!==v)throw Error("ENVIRONMENT_FAILURE:D08_PACKAGE_VERSION");const{chromium}=await import("playwright");const b=await chromium.launch();await b.close()'
CXORBIA_I3_QA_SCOPE=D08_ACADEMY_UI_SELF_TEST node "$runner" > "$dir/self-test.json"
uuid=$(python3 -c 'import uuid; print(uuid.uuid4())')
prefix="gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-qa/$uuid"
jq -n --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --arg control "$producer" --arg transport "$CXORBIA_TRANSPORT_SHA" --arg job "$CXORBIA_GOOGLE_QA_JOB" --arg branch "$CXORBIA_GOOGLE_QA_BRANCH" '{schemaVersion:"cxorbia.i3.google-qa-start.v1",provider:"GOOGLE_CLOUD_SHELL",project:"cxorbia-backend-dev",repository:"paulaosoriof86/demoCXOrbia",branch:$branch,job:$job,attempt:1,production:false,sourceSha:$source,sourceTree:$tree,controlSha:$control,transportSha:$transport}' > "$dir/start.json"
export CXORBIA_GOOGLE_QA_START
CXORBIA_GOOGLE_QA_START=$(put "$dir/start.json" "$prefix/start.json")
printf 'START %s\n' "$CXORBIA_GOOGLE_QA_START"
status=0
node "$runner" > "$dir/job.log" 2>&1 || status=$?
printf '%s\n' "$status" > "$dir/worker-exit-code"
if [[ "$status" == 0 ]]; then CXORBIA_I3_QA_SCOPE=D08_VERIFY node "$runner" >> "$dir/job.log" 2>&1 || status=$?; fi
printf '%s\n' "$status" > "$dir/job-exit-code"
test -s "$QA_OUT/result.json"
python3 - "$QA_OUT" "$dir/evidence.zip" <<'PY'
import pathlib, sys, zipfile
root=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as z:
    for f in [root/'result.json',*sorted(root.glob('*.png'))]:
        z.write(f,f.name)
PY
archive=$(put "$dir/evidence.zip" "$prefix/evidence.zip")
archive_hash=$(sha256sum "$dir/evidence.zip"); result_hash=$(sha256sum "$QA_OUT/result.json")
jq -n --arg start "$CXORBIA_GOOGLE_QA_START" --arg archive "$archive" --arg ah "${archive_hash%% *}" --arg rh "${result_hash%% *}" --argjson code "$status" '{schemaVersion:"cxorbia.i3.google-d08-result.v1",startUri:$start,archiveUri:$archive,archiveSha256:$ah,resultSha256:$rh,exitCode:$code}' > "$dir/result.json"
receipt=$(put "$dir/result.json" "$prefix/result.json")
printf 'RESULT %s\n' "$receipt"
exit "$status"
