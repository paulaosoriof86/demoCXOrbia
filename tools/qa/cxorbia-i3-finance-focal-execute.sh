#!/usr/bin/env bash
# Existing finance job dispatch. Keeps legacy scopes intact; no new workflow/job.
set -Eeuo pipefail
FOUT=$FINAL_FOCAL_OUT
export SOURCE_SHA="$FOCAL_SOURCE" FINAL_FOCAL_PERIOD_ID="$PERIOD_ID"
STATUS="$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")"
case "$CXORBIA_I3_FINANCE_MODE" in
  READONLY_C09_C10_CURRENT_UI)
    export FINAL_FOCAL_PERIOD_ID="$(jq -er '.cashPeriodId' docs/checkpoints/CXORBIA_I3_C09_C10_ADVANCE_UI_READONLY_SCOPE_20261125.json)"
    node --test tools/qa/cxorbia-i3-finance-ui-readonly.test.mjs tools/qa/cxorbia-i3-finance-ui-typed.test.mjs
    node "$FIN_RUNNER"
    jq -e '.decision=="PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE" and .independentAdminSessions==2 and .financialDocumentsStable and .committedMetadataReceiptVerified and .newSessionParity and .providerCommandsExecuted==0 and .financialMutationRequestsDispatched==0 and .network.unexpectedDenied==0 and .privateDataExposed==false and .production==false and .newDomainMatches==0 and .phaseAComplete==false' "$FOUT/ui-readonly/finance-ui-readonly.json" >/dev/null
    bash tools/qa/cxorbia-i3-finance-current-readback.sh
    ;;
  APPLY_NOV_ADVANCE_METADATA)
    node "$FIN_RUNNER"
    bash tools/qa/cxorbia-i3-finance-current-readback.sh
    ;;
  READONLY_SEP_ADVANCES)
    FINAL_FOCAL_OUT="$FOUT/readonly" node "$FIN_RUNNER" | tee "$FOUT/console.log"
    jq -e '.decision=="PASS_FINANCE_READONLY_CURRENT_MANIFEST" and .sameDocumentsStable and .privateDataExposed==false and .providerCommandsExecuted==0 and .production==false and .newDomainMatches==0' "$FOUT/readonly/finance-readonly.json" >/dev/null
    bash tools/qa/cxorbia-i3-finance-current-readback.sh
    ;;
  '')
    if [[ "$STATUS" == HOLD_I3_VRM174_HISTORICAL_PAYMENT_REPROOF_REQUIRED ]]; then
      VRM174_OUT="$FOUT/historical" node tools/qa/cxorbia-i3-vrm174-historical-payment-live.mjs | tee "$FOUT/console.log"
      R="$FOUT/historical/result.json"
      jq -e '.decision=="PASS_I3_VRM174_HISTORICAL_PAYMENT_LIVE" and .writes==0 and .hrWrites==0 and .production==false' "$R" >/dev/null
    else
      FINAL_FOCAL_OUT="$FOUT/live" node "$FIN_RUNNER" | tee "$FOUT/console.log"
      R="$FOUT/live/finance-live.json"
      jq -e '.decision=="PASS_PREI4_FINAL_FOCAL_FINANCE" and .durableProjection==true and .idempotentReplay==true and .cleanup==true and .hrWrites==0 and .production==false' "$R" >/dev/null
    fi
    ;;
  *) echo 'SOURCE_FAILURE:UNKNOWN_FINANCE_FOCAL_MODE' >&2; exit 1;;
esac
