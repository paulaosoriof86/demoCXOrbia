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
# Revalidate the entire pin against the committed canonical receipt, including all
# current assets. A locally shortened map/count cannot bypass the source authority.
EXPECTED_COUNT="$(A08_PIN_FILE="$P" node --input-type=module <<'NODE'
import fs from 'node:fs';
import {loadA08Pin,assertA08ServedInventory} from './tools/qa/cxorbia-i3-a08-current-artifact-pin.mjs';
const pin=JSON.parse(fs.readFileSync(process.env.A08_PIN_FILE,'utf8')),canonical=loadA08Pin();
for(const key of ['decision','sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','firestoreRuleset','receiptPath','receiptGitBlob','controlHead','verifiedServedAssetCount','servedInventorySha256','production','i4Authorized'])
  if(pin[key]!==canonical[key])throw Error('RELEASE_COMPOSITION_FAILURE:A08_CANONICAL_PIN_DESYNC');
assertA08ServedInventory(canonical.servedSha256,pin.servedSha256);
console.log(canonical.verifiedServedAssetCount);
NODE
)"
[[ "$EXPECTED_COUNT" =~ ^[1-9][0-9]*$ ]]
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
  test "$N" = "$EXPECTED_COUNT"
fi
OUT_FILE="$O/same-artifact-preflight.json"
if [[ "$PHASE" = after ]]; then OUT_FILE="$O/same-artifact-after.json"; fi
A08_PIN_FILE="$P" A08_PHASE="$PHASE" A08_STORAGE_RULESET="$STORAGE_RULESET" A08_FETCHED_COUNT="$N" A08_OUT_FILE="$OUT_FILE" node --input-type=module <<'NODE'
import fs from 'node:fs';
import {assertA08ServedInventory,assertA08AssetSeal} from './tools/qa/cxorbia-i3-a08-current-artifact-pin.mjs';
const out='.tmp/cxorbia-i3-two-keepers-role-e2e-readonly';
const pin=JSON.parse(fs.readFileSync(process.env.A08_PIN_FILE,'utf8')),phase=process.env.A08_PHASE;
const keys=['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','firestoreRuleset','receiptPath','receiptGitBlob','controlHead'];
let observed={};
if(phase==='before'){
  const lines=fs.readFileSync(out+'/served-assets.sha256','utf8').trim().split('\n');
  for(const line of lines){const match=line.match(/^([A-Za-z0-9_./-]+) ([a-f0-9]{64})$/);
    if(!match||Object.hasOwn(observed,match[1]))throw Error('RELEASE_COMPOSITION_FAILURE:A08_SERVED_ASSET_READBACK_INVALID');
    observed[match[1]]=match[2];
  }
}else{
  const before=JSON.parse(fs.readFileSync(out+'/same-artifact-preflight.json','utf8'));
  assertA08AssetSeal(pin,before);
  if(before.phase!=='before'||keys.some(key=>before[key]!==pin[key])||before.storageRuleset!==process.env.A08_STORAGE_RULESET)
    throw Error('RELEASE_COMPOSITION_FAILURE:A08_BEFORE_SEAL_DESYNC');
  // The shell has just rechecked the identical FINALIZED Hosting version, runtime
  // revision/digest/traffic and rule releases. Reuse its complete prior byte proof.
  observed=before.servedSha256;
}
const inventory=assertA08ServedInventory(pin.servedSha256,observed);
const seal={decision:'PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT',phase,...Object.fromEntries(keys.map(key=>[key,pin[key]])),
  storageRuleset:process.env.A08_STORAGE_RULESET,...inventory,servedAssetsMatch:inventory.verifiedServedAssetCount,
  servedAssetsFetchedThisPhase:Number(process.env.A08_FETCHED_COUNT),
  assetReadbackMode:phase==='before'?'CURRENT_HOSTING_FETCH':'REUSED_BEFORE_ON_IDENTICAL_FINALIZED_HOSTING_VERSION',
  builds:0,deploys:0,hrWrites:0,production:false};
assertA08AssetSeal(pin,seal);
fs.writeFileSync(process.env.A08_OUT_FILE,JSON.stringify(seal,null,2)+'\n');
NODE
