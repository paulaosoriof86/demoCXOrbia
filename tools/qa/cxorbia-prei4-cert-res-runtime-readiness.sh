#!/usr/bin/env bash
set -Eeuo pipefail
D="${1:-.tmp/prei4-cert-res-runtime-readiness}"
rm -rf "$D"; mkdir -p "$D"
test "${PROJECT:-}" = "cxorbia-backend-dev"
test "${REGION:-}" = "us-central1"
test "${SERVICE:-}" = "cxorbia-live-hr-dev"

gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$D/runtime-service.json"
REV="$(jq -r '.status.latestReadyRevisionName // empty' "$D/runtime-service.json")"
URL="$(jq -r '.status.url // empty' "$D/runtime-service.json")"
SA="$(jq -r '.spec.template.spec.serviceAccountName // .spec.template.spec.serviceAccount // empty' "$D/runtime-service.json")"
test -n "$REV"; test -n "$URL"; test -n "$SA"
printf '%s\n' "$REV" > "$D/runtime-revision-name.txt"
printf '%s\n' "$SA" > "$D/runtime-service-account.txt"

gcloud run revisions describe "$REV" --project "$PROJECT" --region "$REGION" --format=json > "$D/runtime-revision.json"
RAW="$(jq -r '.status.imageDigest // empty' "$D/runtime-revision.json")"
if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; elif [[ "$RAW" == *@sha256:* ]]; then DIGEST="sha256:${RAW##*@sha256:}"; else echo "runtime digest unresolved" >&2; exit 31; fi

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1)"
printf '%s\n' "$ACTIVE_ACCOUNT" > "$D/diagnostic-active-account.txt"

SAME_IDENTITY=false
if [ "$SA" = "$ACTIVE_ACCOUNT" ]; then SAME_IDENTITY=true; fi

TOKEN="$(gcloud auth print-access-token)"
GEN_URL="https://us-central1-aiplatform.googleapis.com/v1/projects/$PROJECT/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent"
PAYLOAD='{"contents":[{"role":"user","parts":[{"text":"Return exactly the JSON object {\"cxorbiaProbe\":true}. Do not add markdown."}]}],"generationConfig":{"temperature":0,"maxOutputTokens":64,"responseMimeType":"application/json"}}'
GEN_CODE="$(curl -sS -o "$D/vertex-generate-content.json" -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' --data "$PAYLOAD" "$GEN_URL" || true)"
printf '%s\n' "$GEN_CODE" > "$D/vertex-generate-content-http.txt"
test "$GEN_CODE" = "200"
TEXT="$(jq -r '.candidates[0].content.parts[0].text // empty' "$D/vertex-generate-content.json")"
test -n "$TEXT"
printf '%s\n' "$TEXT" > "$D/vertex-generated-text.txt"

jq -n -S   --arg runtimeServiceAccount "$SA"   --arg diagnosticAccount "$ACTIVE_ACCOUNT"   --arg runtimeRevision "$REV"   --arg runtimeDigest "$DIGEST"   --arg runtimeUrl "$URL"   --arg generateHttp "$GEN_CODE"   --argjson sameIdentity "$SAME_IDENTITY"   '{
    decision:(if $sameIdentity then "PASS_PREI4_CERT_RES_RUNTIME_VERTEX_READY" else "HOLD_RUNTIME_IDENTITY_PERMISSION_PROOF_REQUIRED" end),
    projectId:"cxorbia-backend-dev",
    runtimeService:"cxorbia-live-hr-dev",
    runtimeServiceAccount:$runtimeServiceAccount,
    diagnosticAccount:$diagnosticAccount,
    sameIdentity:$sameIdentity,
    runtimeRevision:$runtimeRevision,
    runtimeDigest:$runtimeDigest,
    runtimeUrl:$runtimeUrl,
    vertexGenerateContentHttp:$generateHttp,
    providerBackedGeneration:true,
    writes:0,
    deploys:0,
    production:false
  }' > "$D/result.json"
cat "$D/result.json"
