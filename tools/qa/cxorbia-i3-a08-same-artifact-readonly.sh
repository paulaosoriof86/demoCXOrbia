#!/usr/bin/env bash
# I3 A08: read-only, exact already-materialized DEV. No historical source fallback.
set -Eeuo pipefail
O=.tmp/cxorbia-i3-two-keepers-role-e2e-readonly
P="${CXORBIA_A08_PIN_PATH:-$O/current-artifact-pin.json}"
PHASE="${CXORBIA_A08_PREFLIGHT_PHASE:-before}"
[[ "$PHASE" = before || "$PHASE" = after ]]
mkdir -p "$O"
test "$PROJECT" = cxorbia-backend-dev
test "$SERVICE" = cxorbia-live-hr-dev
test "$REGION" = us-central1
test "$HOSTING_SITE" = cxorbia-backend-dev
test "$HOSTING_URL" = https://cxorbia-backend-dev.web.app
jq -e '.decision=="PASS_A08_CURRENT_ARTIFACT_PIN" and .production==false and .verifiedServedAssetCount==41' "$P" >/dev/null
S="$(jq -er .sourceSha "$P")"
R="$(jq -er .runtimeRevision "$P")"
D="$(jq -er .runtimeDigest "$P")"
H="$(jq -er .hostingVersion "$P")"
F="$(jq -er .firestoreRuleset "$P")"
test "$S" = "$CXORBIA_PRODUCT_SOURCE_SHA"
test "$(jq -er .controlHead "$P")" = "$(git rev-parse HEAD)"
test "$(git rev-parse "$S^{tree}")" = "$(jq -er .sourceTree "$P")"
test "$(git rev-parse "HEAD:$(jq -er .receiptPath "$P")")" = "$(jq -er .receiptGitBlob "$P")"
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json | jq -e --arg r "$R" '.status.latestReadyRevisionName==$r and ([.status.traffic[]?|select(.revisionName==$r and .percent==100)]|length)==1' >/dev/null
gcloud run revisions describe "$R" --project "$PROJECT" --region "$REGION" --format=json | jq -e --arg s "$S" --arg d "$D" 'any(.spec.containers[0].env[]?;.name=="CXORBIA_RECOVERY_SOURCE_SHA" and .value==$s) and (.status.imageDigest|endswith($d))' >/dev/null
K="$(gcloud auth print-access-token)"
curl -fsS --max-time 45 -H "Authorization: Bearer $K" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" | jq -e --arg h "$H" '.release.version.name==$h' >/dev/null
curl -fsS --max-time 45 -H "Authorization: Bearer $K" "https://firebasehosting.googleapis.com/v1beta1/$H" | jq -e '.status=="FINALIZED"' >/dev/null
curl -fsS --max-time 45 -H "Authorization: Bearer $K" "https://firebaserules.googleapis.com/v1/projects/$PROJECT/releases/cloud.firestore" | jq -e --arg f "$F" '.rulesetName==$f' >/dev/null
STORAGE_RELEASE="projects/$PROJECT/releases/firebase.storage/$PROJECT.firebasestorage.app"
curl -fsS --max-time 45 -H "Authorization: Bearer $K" "https://firebaserules.googleapis.com/v1/$STORAGE_RELEASE" > "$O/storage-release-$PHASE.json"
STORAGE_RULESET="$(jq -er .rulesetName "$O/storage-release-$PHASE.json")"
[[ "$STORAGE_RULESET" =~ ^projects/cxorbia-backend-dev/rulesets/[a-z0-9-]+$ ]]
if [[ "$PHASE" = before ]]; then
  curl -fsS --max-time 45 -H "Authorization: Bearer $K" "https://firebaserules.googleapis.com/v1/$STORAGE_RULESET" > "$O/storage-ruleset-before.json"
  A08_EXPECTED_SOURCE="$S" node --input-type=module <<'NODE'
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const data=JSON.parse(fs.readFileSync('.tmp/cxorbia-i3-two-keepers-role-e2e-readonly/storage-ruleset-before.json','utf8'));
const files=data.source?.files||[];
const rule=files.find(f=>String(f.name||'').endsWith('storage.rules'))||(files.length===1?files[0]:null);
const expected=execFileSync('git',['show',process.env.A08_EXPECTED_SOURCE+':storage.rules'],{encoding:'utf8'});
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
if(typeof rule?.content!=='string'||sha(rule.content)!==sha(expected))throw Error('RELEASE_COMPOSITION_FAILURE:A08_STORAGE_RULES_SOURCE_DRIFT');
fs.writeFileSync('.tmp/cxorbia-i3-two-keepers-role-e2e-readonly/storage-rules-source.json',JSON.stringify({sourceSha256:sha(expected),servedSha256:sha(rule.content),byteParity:true,production:false})+'\n');
NODE
else
  test "$STORAGE_RULESET" = "$(jq -er .rulesetName "$O/storage-release-before.json")"
fi
unset K
N=0
if [[ "$PHASE" = before ]]; then
  T="$(mktemp)"
  trap 'rm -f "$T"' EXIT
  : > "$O/served-assets.sha256"
  while IFS=$'\t' read -r A E; do
    [[ "$A" =~ ^[A-Za-z0-9_./-]+$ && "$A" != *..* && "$A" != /* && "$E" =~ ^[a-f0-9]{64}$ ]]
    test "$(git show "$S:app/$A" | sha256sum | cut -d' ' -f1)" = "$E"
    curl -fsSL --retry 2 --max-time 45 -H 'Cache-Control: no-cache, no-store, max-age=0' "$HOSTING_URL/$A?i3a08=$GITHUB_RUN_ID-$N" -o "$T"
    test "$(sha256sum "$T" | cut -d' ' -f1)" = "$E"
    printf '%s %s\n' "$A" "$E" >> "$O/served-assets.sha256"
    N=$((N+1))
  done < <(jq -r '.servedSha256|to_entries[]|[.key,.value]|@tsv' "$P")
  test "$N" = 41
else
  jq -e '.decision=="PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT" and .servedAssetsMatch==41' "$O/same-artifact-preflight.json" >/dev/null
fi
OUT_FILE="$O/same-artifact-preflight.json"
if [[ "$PHASE" = after ]]; then OUT_FILE="$O/same-artifact-after.json"; fi
jq -n --slurpfile pin "$P" --arg phase "$PHASE" --arg sr "$STORAGE_RULESET" --argjson n "$N" '$pin[0] | {decision:"PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT",phase:$phase,sourceSha:.sourceSha,sourceTree:.sourceTree,runtimeRevision:.runtimeRevision,runtimeDigest:.runtimeDigest,hostingVersion:.hostingVersion,firestoreRuleset:.firestoreRuleset,storageRuleset:$sr,servedAssetsMatch:$n,receiptPath:.receiptPath,receiptGitBlob:.receiptGitBlob,builds:0,deploys:0,hrWrites:0,production:false}' > "$OUT_FILE"
