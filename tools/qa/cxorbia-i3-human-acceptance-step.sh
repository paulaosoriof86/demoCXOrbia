#!/usr/bin/env bash
set -Eeuo pipefail
mkdir -p "$OUT/full-human-acceptance" "$OUT/semantic" "$OUT/gate20"
if [[ "$CX_I3_BENEFITS_ONLY" != 1 ]]; then
CXORBIA_I3_QA_SCOPE=B14_CAPABILITY_ONLY node tools/qa/cxorbia-i3-hr-ack-exact-same-revision.mjs "$OUT/b14-capability" "$HOSTING_URL" "$TENANT_ID" "$PROJECT_ID" "$GITHUB_RUN_ID"
if [[ "$(jq -r '.f09LiveVerificationPending // false' "$CANDIDATE_DESCRIPTOR")" == true ]]; then
  FOCAL_SOURCE="$I3_CERTIFICATION_SOURCE_SHA" FOCAL_TREE="$I3_CERTIFICATION_SOURCE_TREE" EXPECTED_HR_REVISION="$CURRENT_LIVE_HR_REVISION" QA_OUT="$OUT/f09" CXORBIA_I3_QA_SCOPE=F09_CLIENT_COLLABORATION CXORBIA_I3_QA_ISOLATED_WRITE_GATE=PAULA_AUTHORIZED_F09_DEV_ONLY node tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs || jq -e '.decision=="HOLD" and .hrBefore==env.CURRENT_LIVE_HR_REVISION and .cleanup.ok and .cleanup.remainingDocuments==0 and .cleanup.remainingAuth==0 and .realProjectPeriodUnchanged and .productionIndexUnchanged and .runtimeTrafficExact and .hrBefore==.hrAfter' "$OUT/f09/result.json" >/dev/null
fi
fi
PROJECT="$PROJECT" HOSTING_URL="$HOSTING_URL" TENANT_ID="$TENANT_ID" PROJECT_ID="$PROJECT_ID" I3_CERTIFICATION_SOURCE_SHA="$I3_CERTIFICATION_SOURCE_SHA" SOURCE_DIR="$SOURCE_DIR" CX_I3_PINNED_HR_FILE="$OUT/hr-current-live.json" CX_I3_PINNED_HR_REVISION="$CURRENT_LIVE_HR_REVISION" ACCEPTANCE_OUT="$OUT/full-human-acceptance" node RECOVERY-I3-HUMAN-LIVE-ACCEPTANCE-20260918.mjs
if [[ "$CX_I3_BENEFITS_ONLY" == 1 ]]; then
  jq -e '.decision=="PASS_I3_BENEFITS_READONLY_DOMAIN_ONLY" and .fullHumanAcceptance==false' "$OUT/full-human-acceptance/human-live-acceptance.json" >/dev/null
  exit 0
fi
test "$(jq -r '.decision' "$OUT/full-human-acceptance/human-live-acceptance.json")" = "PASS_I3_HUMAN_LIVE_ACCEPTANCE"
test "$(jq -r '.sourceSha' "$OUT/full-human-acceptance/human-live-acceptance.json")" = "$I3_CERTIFICATION_SOURCE_SHA"
test "$(jq -r '.sourceRevision' "$OUT/full-human-acceptance/human-live-acceptance.json")" = "$CURRENT_LIVE_HR_REVISION"
test "$(jq -r '.decision' "$OUT/full-human-acceptance/i3-functional-probes.json")" = "PASS_I3_ATOMIC_FUNCTIONAL_PROBES"
test "$(jq -r '.routeInventory.expectedRoleRouteEntries' "$OUT/full-human-acceptance/human-live-acceptance.json")" = "56"
test "$(jq '[.routes[]|select(.undefinedVisible==true or .technicalVisible==true or .qaReservationVisible==true)]|length' "$OUT/full-human-acceptance/human-live-acceptance.json")" = "0"
test "$(jq -r '.probe.reservations.ok' "$OUT/full-human-acceptance/i3-functional-probes.json")" = "true"
test "$(jq '.probe.reservations.qaResidueIds|length' "$OUT/full-human-acceptance/i3-functional-probes.json")" = "0"
