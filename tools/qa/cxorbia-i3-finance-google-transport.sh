#!/usr/bin/env bash
# Google transport for the existing read-only Finance job on its original producer.
set -Eeuo pipefail
shopt -s inherit_errexit
umask 077
: "${CXORBIA_TRANSPORT_SHA:?required exact transport commit}"
export PROJECT=cxorbia-backend-dev SERVICE=cxorbia-live-hr-dev REGION=us-central1
export GCLOUD_PROJECT="$PROJECT" GOOGLE_CLOUD_QUOTA_PROJECT="$PROJECT"
export HOSTING_SITE="$PROJECT" HOSTING_URL="https://$PROJECT.web.app"
export FOCAL_SOURCE=1691a76a7bc095ad4bf444aa0db76df2f359a5f0 FOCAL_TREE=3725071a72014d6b891648ab5d2eeef9638276ac
export CANDIDATE_DESCRIPTOR=CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json
export FIN_RUNNER=tools/qa/cxorbia-prei4-final-focal-finance-live.mjs
export CXORBIA_I3_FINANCE_MODE=READONLY_C09_C10_CURRENT_UI
producer=12f9ea2058e34085a4c668a1bfd3147fcdf266a4
[[ "$(git rev-parse HEAD)" == "$producer" && "$(git rev-parse "$FOCAL_SOURCE^{tree}")" == "$FOCAL_TREE" ]]
[[ "$(gcloud config get-value project)" == "$PROJECT" ]]
[[ -z "${GITHUB_ACTIONS:-}" && -z "${GITHUB_RUN_ID:-}" ]]
for path in tools/qa/cxorbia-i3-{finance-ui-readonly,google-qa-execution}.mjs; do
  [[ "$(git hash-object "$path")" == "$(git rev-parse "$CXORBIA_TRANSPORT_SHA:$path")" ]]
done
export FINAL_FOCAL_OUT
FINAL_FOCAL_OUT="$(mktemp -d "${TMPDIR:-/tmp}/cxorbia-finance-google.XXXXXXXX")"
export PERIOD_ID
PERIOD_ID="$(jq -er '.cashPeriodId' docs/checkpoints/CXORBIA_I3_C09_C10_ADVANCE_UI_READONLY_SCOPE_20261125.json)"
[[ "$(node -p 'process.versions.node.split(".")[0]')" == 24 ]] || { echo 'ENVIRONMENT_FAILURE:FINANCE_NODE_24_REQUIRED' >&2; exit 1; }
# Read and execute the producer workflow's existing source and live identity guards.
WORKFLOW=.github/workflows/cxorbia-recovery-i3-dev-certification.yml
git show "$producer:$WORKFLOW" > "$FINAL_FOCAL_OUT/workflow.yml"
python3 - "$FINAL_FOCAL_OUT" <<'PY'
import pathlib,sys,yaml
folder=pathlib.Path(sys.argv[1])
steps=yaml.safe_load((folder/'workflow.yml').read_text())['jobs']['i3-finance-focal-reproof']['steps']
for name,marker in [('source','git diff --quiet'),('live','gcloud run revisions describe')]:
    scripts=[s['run'] for s in steps if marker in s.get('run','')]
    if len(scripts)!=1: raise SystemExit('SOURCE_FAILURE:GOOGLE_FINANCE_WORKFLOW_GUARD')
    (folder/(name+'.sh')).write_text(scripts[0])
PY
bash "$FINAL_FOCAL_OUT/source.sh"
bash "$FINAL_FOCAL_OUT/live.sh"
jq -e --arg r "$(jq -er '.currentMaterialization.runtimeRevision' "$CANDIDATE_DESCRIPTOR")" \
  '([.status.traffic[]|select(.percent>0)|.percent]|add)==100 and all(.status.traffic[]|select(.percent>0);.revisionName==$r)' "$FINAL_FOCAL_OUT/runtime.json" >/dev/null
node --input-type=module -e 'for(const [p,v] of [["firebase-admin","13.4.0"],["playwright","1.56.1"],["pdfjs-dist","3.11.174"]]){const fs=await import("node:fs");if(JSON.parse(fs.readFileSync("node_modules/"+p+"/package.json")).version!==v)throw Error("ENVIRONMENT_FAILURE:FINANCE_DEPENDENCY_VERSION")};const{chromium}=await import("playwright");const b=await chromium.launch({headless:true});await b.close()'
# A create-only generation is issued by Google. It remains distinct from Actions IDs.
uuid="$(python3 -c 'import uuid;print(uuid.uuid4())')"
prefix="gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-qa/$uuid"
jq -n --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --arg control "$producer" --arg transport "$CXORBIA_TRANSPORT_SHA" \
  '{schemaVersion:"cxorbia.i3.google-qa-start.v1",provider:"GOOGLE_CLOUD_SHELL",project:"cxorbia-backend-dev",repository:"paulaosoriof86/demoCXOrbia",branch:"recovery/cxorbia-phase-a-20260831",job:"i3-finance-focal-reproof",attempt:1,production:false,sourceSha:$source,sourceTree:$tree,controlSha:$control,transportSha:$transport}' > "$FINAL_FOCAL_OUT/start.json"
put() {
  local src="$1" dest="$2" gen
  gcloud storage cp --if-generation-match=0 "$src" "$dest" >&2 || return
  gen="$(gcloud storage objects describe "$dest" --raw --format='value(generation)')" || return
  [[ "$gen" =~ ^[1-9][0-9]+$ ]] || return 1
  gcloud storage cat "$dest#$gen" | cmp -s "$src" - || return
  printf '%s#%s\n' "$dest" "$gen"
}
export CXORBIA_GOOGLE_QA_START
CXORBIA_GOOGLE_QA_START="$(put "$FINAL_FOCAL_OUT/start.json" "$prefix/start.json")"
printf 'START %s\n' "$CXORBIA_GOOGLE_QA_START"
status=0
bash tools/qa/cxorbia-i3-finance-focal-execute.sh > "$FINAL_FOCAL_OUT/job.log" 2>&1 || status=$?
public="$FINAL_FOCAL_OUT/ui-readonly"
test -f "$public/finance-ui-readonly.json"
readback_status=0
if [[ ! -f "$public/identity-live-readback.json" ]]; then
  bash tools/qa/cxorbia-i3-finance-current-readback.sh || readback_status=$?
fi
if [[ ! -f "$public/identity-live-readback.json" ]]; then
  [[ "$readback_status" != 0 ]] || readback_status=1
  jq -n --arg source "$FOCAL_SOURCE" --argjson code "$readback_status" \
    '{decision:"HOLD_CURRENT_FINANCE_DEV_IDENTITY_READBACK",sourceSha:$source,readbackExitCode:$code,error:"ENVIRONMENT_FAILURE:GOOGLE_FINANCE_IDENTITY_READBACK_FAILED",runtimeTrafficExact:null,hostingBeforeAfterSame:null,production:false,deploys:0}' > "$public/identity-live-readback.json"
fi
[[ "$status" != 0 || "$readback_status" == 0 ]] || status="$readback_status"
# Only the runner's public receipt and the sibling identity seal enter this bundle.
# Any encrypted PDF diagnostic is archived as encrypted bytes with a create-only object.
objects="$FINAL_FOCAL_OUT/encrypted-pdf-objects.jsonl"
archive_errors="$FINAL_FOCAL_OUT/encrypted-pdf-archive-errors.jsonl"
: > "$objects"
: > "$archive_errors"
archive_error() {
  jq -cn --arg entry "$1" --arg code "$2" '{entry:(if $entry=="" then null else $entry end),code:$code}' >> "$archive_errors"
  [[ "$status" != 0 ]] || status=1
}
while IFS= read -r -d '' encrypted; do
  entry="$(basename "$encrypted")"
  if [[ ! "$entry" =~ ^private-session-[01]-(movements|dashboard)-pdf\.envelope\.json$ ]]; then
    archive_error '' SOURCE_FAILURE:GOOGLE_FINANCE_PRIVATE_EVIDENCE_NAME
    continue
  fi
  encrypted_hash="$(sha256sum "$encrypted")"; encrypted_hash="${encrypted_hash%% *}"
  if ! jq -e --arg entry "$entry" --arg hash "$encrypted_hash" '.failurePdf.privateEvidence | .entry==$entry and .sha256==$hash and .encrypted==true and .algorithm=="RSA-OAEP-SHA256+AES-256-GCM"' "$public/finance-ui-readonly.json" >/dev/null; then
    archive_error "$entry" SOURCE_FAILURE:GOOGLE_FINANCE_PRIVATE_EVIDENCE_LOCAL_BINDING
    continue
  fi
  if encrypted_uri="$(put "$encrypted" "$prefix/$entry")"; then
    jq -cn --arg entry "$entry" --arg uri "$encrypted_uri" --arg generation "${encrypted_uri##*#}" --arg hash "$encrypted_hash" \
      '{entry:$entry,uri:$uri,generation:$generation,sha256:$hash}' >> "$objects"
  else
    archive_error "$entry" PROVIDER_FAILURE:GOOGLE_FINANCE_PRIVATE_EVIDENCE_ARCHIVE
  fi
done < <(find "$public" -type f -name 'private-session-*-pdf.envelope.json' -print0)
python3 - "$public" "$CXORBIA_GOOGLE_QA_START" "$status" "$objects" "$archive_errors" > "$FINAL_FOCAL_OUT/result.json" <<'PY'
import pathlib,sys,hashlib,json
folder=pathlib.Path(sys.argv[1])
def content(name):
    data=(folder/name).read_bytes()
    return data.decode('utf-8'),hashlib.sha256(data).hexdigest()
result,rhash=content('finance-ui-readonly.json')
seal,shash=content('identity-live-readback.json')
assert json.loads(result)['privateDataExposed'] is False
def lines(name):
    return [json.loads(line) for line in pathlib.Path(name).read_text().splitlines() if line.strip()]
print(json.dumps(dict(schemaVersion='cxorbia.i3.google-finance-result.v1',startUri=sys.argv[2],exitCode=int(sys.argv[3]),
                      resultText=result,resultSha256=rhash,identityReadbackText=seal,sealSha256=shash,
                      encryptedPdfObjects=lines(sys.argv[4]),encryptedPdfArchiveErrors=lines(sys.argv[5]))))
PY
uri="$(put "$FINAL_FOCAL_OUT/result.json" "$prefix/result.json")"
printf 'RESULT %s\n' "$uri"
jq '{decision,stage,failureStage,error,independentAdminSessions,production,financialMutationRequestsDispatched}' "$public/finance-ui-readonly.json"
exit "$status"
