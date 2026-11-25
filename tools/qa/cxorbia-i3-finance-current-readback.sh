#!/usr/bin/env bash
set -Eeuo pipefail
[[ "$CXORBIA_I3_FINANCE_MODE" == READONLY_SEP_ADVANCES || "$CXORBIA_I3_FINANCE_MODE" == APPLY_NOV_ADVANCE_METADATA || "$CXORBIA_I3_FINANCE_MODE" == READONLY_C09_C10_CURRENT_UI ]]
FINANCE_PUBLIC_OUT="$FINAL_FOCAL_OUT/readonly"
[[ "$CXORBIA_I3_FINANCE_MODE" != APPLY_NOV_ADVANCE_METADATA ]] || FINANCE_PUBLIC_OUT="$FINAL_FOCAL_OUT/metadata"
[[ "$CXORBIA_I3_FINANCE_MODE" != READONLY_C09_C10_CURRENT_UI ]] || FINANCE_PUBLIC_OUT="$FINAL_FOCAL_OUT/ui-readonly"
test "$PROJECT" = cxorbia-backend-dev
test "$HOSTING_SITE" = cxorbia-backend-dev
R="$(jq -r '.currentMaterialization.runtimeRevision' "$CANDIDATE_DESCRIPTOR")"
H="$(jq -r '.currentMaterialization.hostingVersion' "$CANDIDATE_DESCRIPTOR")"
gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format='json(status.latestReadyRevisionName,status.traffic)' > "$FINAL_FOCAL_OUT/runtime-after.json"
jq -e --arg r "$R" '.status.latestReadyRevisionName==$r and ([.status.traffic[]|select(.percent>0)|.percent]|add)==100 and all(.status.traffic[]|select(.percent>0);.revisionName==$r)' "$FINAL_FOCAL_OUT/runtime-after.json" >/dev/null
TOKEN="$(gcloud auth print-access-token)"
curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$FINAL_FOCAL_OUT/hosting-after.json"
test "$(jq -r '.release.version.name' "$FINAL_FOCAL_OUT/hosting-after.json")" = "$H"
jq -n --arg source "$FOCAL_SOURCE" --arg runtime "$R" --arg hosting "$H" '{decision:"PASS_CURRENT_FINANCE_DEV_IDENTITY_READBACK",sourceSha:$source,runtimeRevision:$runtime,hostingVersion:$hosting,runtimeTrafficExact:true,hostingBeforeAfterSame:true,production:false,deploys:0}' > "$FINANCE_PUBLIC_OUT/identity-live-readback.json"
