#!/usr/bin/env bash
# I3 A08: read-only proof of the exact already-materialized DEV artifact.
set -Eeuo pipefail
P=docs/checkpoints/CXORBIA_I3_RUN2587_PRIVATE_HR_BINDING_DEV_READBACK_20261117.json
O=.tmp/cxorbia-i3-two-keepers-role-e2e-readonly
mkdir -p "$O"
S="$(jq -r .sourceSha "$P")" R="$(jq -r .materialization.runtimeRevision "$P")"
D="$(jq -r .materialization.runtimeDigest "$P")" H="$(jq -r .materialization.hostingVersion "$P")"
F="$(jq -r .materialization.firestoreRuleset "$P")"
test "$S" = "$CXORBIA_PRODUCT_SOURCE_SHA"
[[ "$D" =~ ^sha256:[a-f0-9]{64}$ ]]
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json | jq -e --arg r "$R" '.status.latestReadyRevisionName==$r and ([.status.traffic[]?|select(.revisionName==$r and .percent==100)]|length)==1' >/dev/null
gcloud run revisions describe "$R" --project "$PROJECT" --region "$REGION" --format=json | jq -e --arg s "$S" --arg d "$D" 'any(.spec.containers[0].env[]?;.name=="CXORBIA_RECOVERY_SOURCE_SHA" and .value==$s) and (.status.imageDigest|endswith($d))' >/dev/null
K="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $K" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" | jq -e --arg h "$H" '.release.version.name==$h' >/dev/null
curl -fsS -H "Authorization: Bearer $K" "https://firebasehosting.googleapis.com/v1beta1/$H" | jq -e '.status=="FINALIZED"' >/dev/null
curl -fsS -H "Authorization: Bearer $K" "https://firebaserules.googleapis.com/v1/projects/$PROJECT/releases/cloud.firestore" | jq -e --arg f "$F" '.rulesetName==$f' >/dev/null
T="$(mktemp)"; trap 'rm -f "$T"' EXIT
N=0
while IFS=$'\t' read -r A E; do
  [[ "$A" =~ ^[A-Za-z0-9_./-]+$ && "$A" != *..* && "$A" != /* && "$E" =~ ^[a-f0-9]{64}$ ]]
  test "$(git show "$S:app/$A" | sha256sum | cut -d' ' -f1)" = "$E"
  curl -fsSL --retry 3 -H 'Cache-Control: no-cache, no-store, max-age=0' "$HOSTING_URL/$A?i3a08=$GITHUB_RUN_ID-$N" -o "$T"
  test "$(sha256sum "$T" | cut -d' ' -f1)" = "$E"
  printf '%s %s\n' "$A" "$E" >> "$O/served-assets.sha256"
  N=$((N+1))
done < <(jq -r '.servedSha256|to_entries[]|[.key,.value]|@tsv' "$P")
test "$N" = 39
test "$(jq -r .verifiedServedAssetCount "$P")" = 39
jq -n --arg s "$S" --arg r "$R" --arg d "$D" --arg h "$H" --arg f "$F" '{decision:"PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT",sourceSha:$s,runtimeRevision:$r,runtimeDigest:$d,hostingVersion:$h,firestoreRuleset:$f,servedAssetsMatch:39,builds:0,deploys:0,hrWrites:0,production:false}' > "$O/same-artifact-preflight.json"
