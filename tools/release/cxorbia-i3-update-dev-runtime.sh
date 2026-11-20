#!/usr/bin/env bash
set -Eeuo pipefail
image=${1:?Missing deployment image}
[[ "$PROJECT" == cxorbia-backend-dev && "$SERVICE" == cxorbia-live-hr-dev ]]
settings="$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE,CXORBIA_RECOVERY_SOURCE_SHA=$FOCAL_SOURCE"
extra=()
if [[ "$ACTIVE_STATUS" == HOLD_I3_B14_P0_SOURCE_PROVEN_PENDING_RUNTIME_AND_HOSTING_DEV_6_OF_21 ]]; then
  settings+=",CXORBIA_I3_B14_DIRECT_READER_DEV=true,CXORBIA_B14_MAKE_TOOLBOX_URL=https://eu2.make.com/mcp/server/98b29fbe-fbfe-42f2-aeae-e27998eb60c6"
  extra+=(--update-secrets "CXORBIA_B14_MAKE_TOOLBOX_TOKEN=cxorbia-dev-b14-make-toolbox:1")
fi
gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$image" \
  --min-instances=1 --max-instances=1 --update-env-vars "$settings" "${extra[@]}" --quiet
