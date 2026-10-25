#!/usr/bin/env bash
set -Eeuo pipefail
D="${1:-.tmp/prei4-cert-res-provider-activate}"
rm -rf "$D"; mkdir -p "$D"

test "${PROJECT:-}" = "cxorbia-backend-dev"
ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1)"
test -n "$ACTIVE_ACCOUNT"
printf '%s\n' "$ACTIVE_ACCOUNT" > "$D/active-account.txt"

relevant_services() {
  gcloud services list --enabled --project "$PROJECT" --format='value(config.name)' \
    | grep -E '^(aiplatform.googleapis.com|firebasestorage.googleapis.com|storage.googleapis.com|firestore.googleapis.com)$' \
    | sort || true
}
relevant_services > "$D/services-before.txt"

TOKEN="$(gcloud auth print-access-token)"
PERM_URL="https://cloudresourcemanager.googleapis.com/v1/projects/$PROJECT:testIamPermissions"
PERM_BODY='{"permissions":["serviceusage.services.enable","firebasestorage.defaultBucket.create","aiplatform.endpoints.predict","firebaserules.rulesets.create","firebaserules.releases.create","storage.buckets.create","storage.objects.create","storage.objects.get"]}'
PERM_CODE="$(curl -sS -o "$D/permissions-before.json" -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' --data "$PERM_BODY" "$PERM_URL" || true)"
test "$PERM_CODE" = "200"
for p in serviceusage.services.enable firebasestorage.defaultBucket.create aiplatform.endpoints.predict firebaserules.rulesets.create firebaserules.releases.create storage.buckets.create storage.objects.create storage.objects.get; do
  jq -e --arg p "$p" '.permissions // [] | index($p) != null' "$D/permissions-before.json" >/dev/null
done

enabled_count=0
for svc in aiplatform.googleapis.com firebasestorage.googleapis.com; do
  if ! grep -qx "$svc" "$D/services-before.txt"; then
    gcloud services enable "$svc" --project "$PROJECT" --quiet
    enabled_count=$((enabled_count+1))
  fi
done

for i in $(seq 1 30); do
  relevant_services > "$D/services-after.txt"
  if grep -qx 'aiplatform.googleapis.com' "$D/services-after.txt" && grep -qx 'firebasestorage.googleapis.com' "$D/services-after.txt"; then break; fi
  sleep 2
done
grep -qx 'aiplatform.googleapis.com' "$D/services-after.txt"
grep -qx 'firebasestorage.googleapis.com' "$D/services-after.txt"

TOKEN="$(gcloud auth print-access-token)"
DEFAULT_URL="https://firebasestorage.googleapis.com/v1alpha/projects/$PROJECT/defaultBucket"
BEFORE_CODE="$(curl -sS -o "$D/default-bucket-before.json" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$DEFAULT_URL" || true)"
printf '%s\n' "$BEFORE_CODE" > "$D/default-bucket-before-http.txt"

bucket_created=false
if [ "$BEFORE_CODE" = "404" ]; then
  CREATE_CODE="$(curl -sS -o "$D/default-bucket-create.json" -w '%{http_code}' -X POST \
    -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
    --data '{"location":"US-CENTRAL1"}' "$DEFAULT_URL" || true)"
  printf '%s\n' "$CREATE_CODE" > "$D/default-bucket-create-http.txt"
  case "$CREATE_CODE" in
    200|201) bucket_created=true ;;
    409) bucket_created=false ;;
    *) cat "$D/default-bucket-create.json" >&2; exit 41 ;;
  esac
elif [ "$BEFORE_CODE" = "200" ]; then
  bucket_created=false
else
  cat "$D/default-bucket-before.json" >&2 || true
  exit 42
fi

for i in $(seq 1 30); do
  AFTER_CODE="$(curl -sS -o "$D/default-bucket-after.json" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$DEFAULT_URL" || true)"
  [ "$AFTER_CODE" = "200" ] && break
  sleep 2
done
test "$AFTER_CODE" = "200"
BUCKET_NAME="$(jq -r '.bucket.name // .name // empty' "$D/default-bucket-after.json")"
BUCKET_LOCATION="$(jq -r '.location // empty' "$D/default-bucket-after.json")"
test -n "$BUCKET_NAME"
test -n "$BUCKET_LOCATION"

VERTEX_URL="https://us-central1-aiplatform.googleapis.com/v1/projects/$PROJECT/locations/us-central1/publishers/google/models/gemini-2.5-flash"
VERTEX_CODE="$(curl -sS -o "$D/vertex-after.json" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$VERTEX_URL" || true)"
printf '%s\n' "$VERTEX_CODE" > "$D/vertex-after-http.txt"
test "$VERTEX_CODE" != "403"

jq -n -S \
  --arg account "$ACTIVE_ACCOUNT" \
  --arg bucket "$BUCKET_NAME" \
  --arg location "$BUCKET_LOCATION" \
  --arg vertexHttp "$VERTEX_CODE" \
  --argjson servicesEnabledThisRun "$enabled_count" \
  --argjson bucketCreated "$bucket_created" \
  '{
    decision:"PASS_PREI4_CERT_RES_DEV_PROVIDER_ACTIVATED",
    projectId:"cxorbia-backend-dev",
    activeAccount:$account,
    services:{aiplatform:true,firebasestorage:true},
    servicesEnabledThisRun:$servicesEnabledThisRun,
    defaultFirebaseStorageBucket:{present:true,name:$bucket,location:$location,createdThisRun:$bucketCreated},
    vertexModelProbeHttp:$vertexHttp,
    iamReadback:true,
    production:false
  }' > "$D/result.json"
cat "$D/result.json"
