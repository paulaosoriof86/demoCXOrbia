#!/usr/bin/env bash
set -Eeuo pipefail
D="${1:-.tmp/prei4-cert-res-capability}"
rm -rf "$D"; mkdir -p "$D"

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1)"
printf '%s\n' "$ACTIVE_ACCOUNT" > "$D/active-account.txt"

gcloud services list --enabled --project "$PROJECT" --format='value(config.name)' \
  | grep -E '^(aiplatform.googleapis.com|storage.googleapis.com|firebasestorage.googleapis.com|firestore.googleapis.com)$' \
  | sort > "$D/enabled-relevant-services.txt" || true

set +e
gcloud storage buckets list --project "$PROJECT" --format=json > "$D/storage-buckets.raw.json" 2> "$D/storage-buckets.err"
BUCKET_RC=$?
set -e
if [ "$BUCKET_RC" -eq 0 ]; then
  jq '[.[] | {name,location,storageClass}]' "$D/storage-buckets.raw.json" > "$D/storage-buckets.json"
else
  printf '[]\n' > "$D/storage-buckets.json"
fi

set +e
gcloud projects get-iam-policy "$PROJECT" \
  --flatten='bindings[].members' \
  --filter="bindings.members:serviceAccount:$ACTIVE_ACCOUNT" \
  --format=json > "$D/active-account-iam.json" 2> "$D/active-account-iam.err"
IAM_RC=$?
set -e
if [ "$IAM_RC" -ne 0 ]; then printf '[]\n' > "$D/active-account-iam.json"; fi

TOKEN="$(gcloud auth print-access-token)"
VERTEX_URL="https://$REGION-aiplatform.googleapis.com/v1/projects/$PROJECT/locations/$REGION/publishers/google/models/gemini-2.5-flash"
VERTEX_CODE="$(curl -sS -o "$D/vertex-model-probe.json" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$VERTEX_URL" || true)"
printf '%s\n' "$VERTEX_CODE" > "$D/vertex-model-http-code.txt"

AI_URL="https://firestore.googleapis.com/v1/projects/$PROJECT/databases/(default)/documents/tenants/$TENANT_ID/aiSettings?pageSize=20"
AI_CODE="$(curl -sS -o "$D/ai-settings.raw.json" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$AI_URL" || true)"
printf '%s\n' "$AI_CODE" > "$D/ai-settings-http-code.txt"
if [ "$AI_CODE" = "200" ]; then
  jq '[.documents[]? | {
    id:(.name|split("/")|last),
    provider:(.fields.provider.stringValue // null),
    model:(.fields.model.stringValue // null),
    status:(.fields.status.stringValue // null),
    clientCallable:(.fields.clientCallable.booleanValue // false)
  }]' "$D/ai-settings.raw.json" > "$D/ai-settings-safe.json"
else
  printf '[]\n' > "$D/ai-settings-safe.json"
fi

CERT_URL="https://firestore.googleapis.com/v1/projects/$PROJECT/databases/(default)/documents/tenants/$TENANT_ID/projects/$PROJECT_ID/certifications?pageSize=100"
CERT_CODE="$(curl -sS -o "$D/certifications.raw.json" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$CERT_URL" || true)"
printf '%s\n' "$CERT_CODE" > "$D/certifications-http-code.txt"
if [ "$CERT_CODE" = "200" ]; then
  jq '{count:(.documents // [] | length), ids:[.documents[]?.name|split("/")|last]}' "$D/certifications.raw.json" > "$D/certifications-safe.json"
else
  printf '{"count":0,"ids":[]}\n' > "$D/certifications-safe.json"
fi

VERTEX_ENABLED=false
STORAGE_API_ENABLED=false
FIREBASE_STORAGE_API_ENABLED=false
FIRESTORE_ENABLED=false
grep -qx 'aiplatform.googleapis.com' "$D/enabled-relevant-services.txt" && VERTEX_ENABLED=true || true
grep -qx 'storage.googleapis.com' "$D/enabled-relevant-services.txt" && STORAGE_API_ENABLED=true || true
grep -qx 'firebasestorage.googleapis.com' "$D/enabled-relevant-services.txt" && FIREBASE_STORAGE_API_ENABLED=true || true
grep -qx 'firestore.googleapis.com' "$D/enabled-relevant-services.txt" && FIRESTORE_ENABLED=true || true
BUCKET_COUNT="$(jq 'length' "$D/storage-buckets.json")"
ACTIVE_AI_COUNT="$(jq '[.[]|select(.status=="active")]|length' "$D/ai-settings-safe.json")"

jq -n -S \
  --arg account "$ACTIVE_ACCOUNT" \
  --argjson vertexEnabled "$VERTEX_ENABLED" \
  --argjson storageApiEnabled "$STORAGE_API_ENABLED" \
  --argjson firebaseStorageApiEnabled "$FIREBASE_STORAGE_API_ENABLED" \
  --argjson firestoreEnabled "$FIRESTORE_ENABLED" \
  --arg vertexHttp "$VERTEX_CODE" \
  --arg aiSettingsHttp "$AI_CODE" \
  --arg certificationsHttp "$CERT_CODE" \
  --argjson bucketCount "$BUCKET_COUNT" \
  --argjson activeAiCount "$ACTIVE_AI_COUNT" \
  --slurpfile buckets "$D/storage-buckets.json" \
  --slurpfile ai "$D/ai-settings-safe.json" \
  --slurpfile cert "$D/certifications-safe.json" \
  '{
    decision:"PREI4_CERT_RES_PROVIDER_CAPABILITY_DIAGNOSTIC",
    activeAccount:$account,
    services:{vertexAI:$vertexEnabled,cloudStorage:$storageApiEnabled,firebaseStorage:$firebaseStorageApiEnabled,firestore:$firestoreEnabled},
    vertexModelProbeHttp:$vertexHttp,
    aiSettingsHttp:$aiSettingsHttp,
    certificationReadHttp:$certificationsHttp,
    storageBucketCount:$bucketCount,
    storageBuckets:$buckets[0],
    activeAiSettingCount:$activeAiCount,
    aiSettings:$ai[0],
    certifications:$cert[0],
    writes:0,deploys:0,production:false
  }' > "$D/result.json"
cat "$D/result.json"
