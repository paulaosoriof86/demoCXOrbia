#!/usr/bin/env bash
set -Eeuo pipefail
case "${1:?mode}" in
 pre)
   CURRENT="$(jq -er '.release.version.name' "$EVIDENCE/hosting-before.json")"
   if git log -1 --pretty=%B | grep -Fq '[i3-router-reproof-after-cdn]'; then
     PROOF=docs/checkpoints/CXORBIA_I3_ROUTER_CDN_AFTER_DEPLOY_20261122.json
     test -s "$PROOF"
     test "$(jq -r '.sourceSha' "$PROOF")" = "$SOURCE"
     test "$(jq -r '.sourceTree' "$PROOF")" = "$SOURCE_TREE"
     test "$(jq -r '.hostingAfter' "$PROOF")" = "$CURRENT"
     test "$(jq -r '.runtimeRevision' "$PROOF")" = "$EXPECTED_RUNTIME_REVISION"
     test "$(jq -r '.status' "$PROOF")" = "PUBLISHED_DEV_PENDING_FRESHNESS_READBACK"
     echo "HOSTING_DEPLOYS=0" >> "$GITHUB_ENV"
   else
     test "$CURRENT" = "$(jq -er '.currentMaterialization.hostingVersion' "$CANDIDATE_DESCRIPTOR")"
     echo "HOSTING_DEPLOYS=1" >> "$GITHUB_ENV"
   fi
   ;;
 version)
   BEFORE="${2:?before}"; AFTER="${3:?after}"
   test -n "$BEFORE" && test -n "$AFTER"
   case "${HOSTING_DEPLOYS:?mode}" in
     0) test "$AFTER" = "$BEFORE";;
     1) test "$AFTER" != "$BEFORE";;
     *) echo "ENVIRONMENT_FAILURE:INVALID_HOSTING_DEPLOY_COUNT" >&2; exit 1;;
   esac
   ;;
 assets)
   for FILE in $ASSET_FILES; do
     TARGET="$EVIDENCE/served-$(printf '%s' "$FILE" | tr '/' '-')"
     PASS=0
     for ATTEMPT in 1 2 3 4 5 6 7 8 9 10 11 12; do
       if curl -fsS --retry 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$HOSTING_URL/$FILE?i3=$GITHUB_RUN_ID-$ATTEMPT" -o "$TARGET" && cmp -s "$SOURCE_DIR/app/$FILE" "$TARGET"; then PASS=1; break; fi
       sleep 3
     done
     if test "$PASS" -ne 1; then
       echo "RELEASE_COMPOSITION_FAILURE:HOSTING_ASSET_BYTE_MISMATCH:$FILE" >&2
       sha256sum "$SOURCE_DIR/app/$FILE" "$TARGET" >&2 || true
       exit 1
     fi
   done
   ;;
 *) echo "ENVIRONMENT_FAILURE:UNKNOWN_HOSTING_READBACK_MODE" >&2; exit 1;;
esac
