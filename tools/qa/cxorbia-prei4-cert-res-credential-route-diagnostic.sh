#!/usr/bin/env bash
set -Eeuo pipefail
D="${1:-.tmp/prei4-cert-res-credential-route}"
rm -rf "$D"; mkdir -p "$D/private" "$D/safe"
chmod 700 "$D/private"
trap 'rm -rf "$D/private"' EXIT

node <<'NODE'
const fs=require('fs'),crypto=require('crypto');
const dir=process.env.DIAG_DIR;
const candidates=[
  ['dedicated_project_creator',process.env.DEDICATED_CREATOR_JSON||''],
  ['alternate_project_creator',process.env.ALT_CREATOR_JSON||''],
  ['existing_dev_service_account',process.env.EXISTING_DEV_JSON||'']
];
const safe=[];
for(const [route,raw] of candidates){
  let parsed=null; try{parsed=raw?JSON.parse(raw):null;}catch{}
  const shapeValid=Boolean(parsed&&parsed.type==='service_account'&&parsed.client_email&&parsed.private_key&&parsed.token_uri);
  const item={route,present:Boolean(raw),shapeValid};
  if(shapeValid){
    item.credentialProjectId=String(parsed.project_id||'');
    item.clientEmailSha256=crypto.createHash('sha256').update(String(parsed.client_email)).digest('hex');
    fs.writeFileSync(dir+'/private/'+route+'.json',raw,{mode:0o600});
  }
  safe.push(item);
}
fs.writeFileSync(dir+'/safe/candidates.json',JSON.stringify(safe,null,2)+'\n');
NODE

PERM_BODY='{"permissions":["serviceusage.services.enable","serviceusage.services.get","firebasestorage.defaultBucket.create","storage.buckets.create","storage.buckets.get","storage.objects.create","storage.objects.get","firebaserules.rulesets.create","firebaserules.releases.create","aiplatform.endpoints.predict","resourcemanager.projects.get","firebase.projects.get"]}'
for key in "$D"/private/*.json; do
  [ -e "$key" ] || continue
  route="$(basename "$key" .json)"
  cfg="$D/private/gcloud-$route"
  mkdir -p "$cfg"
  (
    export CLOUDSDK_CONFIG="$cfg"
    gcloud auth activate-service-account --key-file="$key" --quiet >/dev/null 2>&1
    gcloud config set project "$PROJECT" --quiet >/dev/null 2>&1
    TOKEN="$(gcloud auth print-access-token)"
    perm_raw="$D/private/$route-permissions.raw.json"
    perm_code="$(curl -sS -o "$perm_raw" -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' --data "$PERM_BODY" "https://cloudresourcemanager.googleapis.com/v1/projects/$PROJECT:testIamPermissions" || true)"
    billing_raw="$D/private/$route-billing.raw.json"
    billing_code="$(curl -sS -o "$billing_raw" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "https://cloudbilling.googleapis.com/v1/projects/$PROJECT/billingInfo" || true)"
    if [ "$perm_code" = "200" ]; then perms="$(jq -c '(.permissions // []) | sort' "$perm_raw")"; else perms='[]'; fi
    if [ "$billing_code" = "200" ]; then billing="$(jq -r '.billingEnabled // false' "$billing_raw")"; else billing='null'; fi
    jq -n -S --arg route "$route" --arg permissionProbeHttp "$perm_code" --arg billingHttp "$billing_code" --argjson permissions "$perms" --argjson billingEnabled "$billing" '{route:$route,permissionProbeHttp:$permissionProbeHttp,grantedPermissions:$permissions,billingHttp:$billingHttp,billingEnabled:$billingEnabled,writes:0,deploys:0,production:false}' > "$D/safe/$route.json"
  )
done

mapfile -t ROUTE_FILES < <(find "$D/safe" -maxdepth 1 -type f -name '*.json' ! -name 'candidates.json' -print | sort)
test "${#ROUTE_FILES[@]}" -ge 1
jq -s -S 'def has($p): (.grantedPermissions|index($p)) != null; map(. + {readiness:{serviceEnable:has("serviceusage.services.enable"),firebaseDefaultBucketCreate:has("firebasestorage.defaultBucket.create"),storageBucketCreate:has("storage.buckets.create"),rulesetCreate:has("firebaserules.rulesets.create"),rulesReleaseCreate:has("firebaserules.releases.create"),vertexPredict:has("aiplatform.endpoints.predict"),projectRead:has("resourcemanager.projects.get")}})' "${ROUTE_FILES[@]}" > "$D/routes.json"

jq -n -S --slurpfile candidates "$D/safe/candidates.json" --slurpfile routes "$D/routes.json" '{decision:"PREI4_CERT_RES_EXISTING_CREDENTIAL_ROUTE_DIAGNOSTIC",candidates:$candidates[0],routes:$routes[0],writes:0,deploys:0,secretsOutput:false,production:false}' > "$D/result.json"
cat "$D/result.json"
