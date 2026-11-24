#!/usr/bin/env bash
set -Eeuo pipefail
mkdir -p "$FOCAL_OUT"
test "$(jq -r '.productSourceSha' "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_SOURCE"
test "$(jq -r '.productTreeAuthority' "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_TREE"
test "$(git rev-parse "$FOCAL_SOURCE^{tree}")" = "$FOCAL_TREE"
git merge-base --is-ancestor "$FOCAL_SOURCE" HEAD
git diff --quiet "$FOCAL_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
if [[ "$ACTIVE_STATUS" == "HOLD_VRM134_A05_DEV_MATERIALIZATION_REQUIRED" ]]; then
  node --check backend/runtime/hr-live-service/server.mjs
  node --test backend/runtime/hr-live-service/test/cxorbia-vrm134-runtime-latency.test.mjs | tee "$FOCAL_OUT/vrm134-a05-source-tests.log"
fi
node tools/qa/cxorbia-vrm154-156-frontend-source-contract.mjs > "$FOCAL_OUT/source-contract.json"
test "$(jq -r '.decision' "$FOCAL_OUT/source-contract.json")" = "PASS_VRM154_156_FRONTEND_SOURCE_CONTRACT"
node tools/qa/tya-c6-canonical-finance-read-model-gate.mjs > "$FOCAL_OUT/vrm174-finance-read-model.json"
test "$(jq -r '.decision' "$FOCAL_OUT/vrm174-finance-read-model.json")" = "PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS"
test "$(jq -r '[.assertions[]|select(.name=="vrm174_duplicate_hrrow_exact_doc_payment_authority_preserved")][0].ok' "$FOCAL_OUT/vrm174-finance-read-model.json")" = "true"
if [[ "$ACTIVE_STATUS" == "HOLD_I3_CERT_CARRYOVER_DEV_MATERIALIZATION_REQUIRED" || "$ACTIVE_STATUS" == "HOLD_I3_VRM317_D06_DEV_MATERIALIZATION_REQUIRED" || "$ACTIVE_STATUS" == "HOLD_I3_VRM318_D06_DEV_MATERIALIZATION_REQUIRED" || "$ACTIVE_STATUS" == "HOLD_I3_VRM319_D06_DEV_MATERIALIZATION_REQUIRED" || "$ACTIVE_STATUS" == "HOLD_I3_VRM320_B3_DEV_MATERIALIZATION_REQUIRED" ]]; then
  node --test tools/qa/cxorbia-i3-certification-project-continuity.test.mjs | tee "$FOCAL_OUT/vrm316-cert-carryover-source-tests.log"
  node --check app/core/backend-certifications.js
  node --check app/modules/cert.js
fi
if [[ "$ACTIVE_STATUS" == "HOLD_I3_VRM320_B3_DEV_MATERIALIZATION_REQUIRED" ]]; then
  node --check app/modules/misvisitas.js
  node --test tools/qa/cxorbia-i3-work-uat-misvisitas-payment-source.test.mjs tools/qa/cxorbia-i3-d06-misvisitas-cross-period-classification.test.mjs | tee "$FOCAL_OUT/vrm320-b3-source-tests.log"
fi
node --check app/modules/midia.js
node --test backend/runtime/hr-live-service/test/cxorbia-vrm256-midia-current-period.test.mjs | tee "$FOCAL_OUT/vrm256-midia-current-period.log"
grep -Fq "PASS_VRM256_MIDIA_CURRENT_PERIOD_SOURCE" "$FOCAL_OUT/vrm256-midia-current-period.log"
node --check app/modules/beneficios.js
node --test backend/runtime/hr-live-service/test/cxorbia-vrm257-benefits-payment-label.test.mjs | tee "$FOCAL_OUT/vrm257-benefits-payment-label.log"
grep -Fq "PASS_VRM257_BENEFITS_PAYMENT_LABEL_SOURCE" "$FOCAL_OUT/vrm257-benefits-payment-label.log"
node --test backend/runtime/hr-live-service/test/cxorbia-vrm259-postulations-rail-badge.test.mjs | tee "$FOCAL_OUT/vrm259-postulations-rail-badge.log"
grep -Fq "PASS_VRM259_POSTULATIONS_RAIL_BADGE_SOURCE" "$FOCAL_OUT/vrm259-postulations-rail-badge.log"
node --test backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs > "$FOCAL_OUT/finance-regression.log"
node tools/qa/tya-cumulative-read-model-regression-gate.mjs app/adapters/tya-cumulative-read-model-v2.js > "$FOCAL_OUT/vrm168-regression.json"
test "$(jq -r '.decision' "$FOCAL_OUT/vrm168-regression.json")" = "PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE"
test "$(jq -r '[.assertions[]|select(.name=="vrm168_missing_transient_identity_promotes_exact_visit_crosswalk")][0].ok' "$FOCAL_OUT/vrm168-regression.json")" = "true"
test "$(jq -r '[.assertions[]|select(.name=="vrm168_existing_hr_identity_preserves_conflict_review")][0].ok' "$FOCAL_OUT/vrm168-regression.json")" = "true"
test "$(jq -r '[.assertions[]|select(.name=="vrm258_authorized_alias_keeps_canonical_display_name")][0].ok' "$FOCAL_OUT/vrm168-regression.json")" = "true"
if [[ "$ACTIVE_STATUS" == "HOLD_I3_S1_AUTO_COMPATIBLE_IDENTITY_DEV_MATERIALIZATION_REQUIRED" || "$ACTIVE_STATUS" == "HOLD_VRM307_DEV_MATERIALIZATION_REQUIRED" || "$ACTIVE_STATUS" == "HOLD_VRM308_DEV_MATERIALIZATION_REQUIRED" || "$ACTIVE_STATUS" == "HOLD_VRM309_DEV_MATERIALIZATION_REQUIRED" ]]; then
  node --test backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs tools/qa/cxorbia-i3-g05-writer-receipts.test.cjs tools/qa/cxorbia-i3-vrm304-adjudicated-supersession.test.mjs tools/qa/cxorbia-i3-vrm308-hn-country-alias-normalization.test.mjs > "$FOCAL_OUT/s1-auto-identity-contract-tests.log"
fi
node --test tools/qa/cxorbia-i3-gthn-canonical-consumers.test.mjs tools/qa/cxorbia-i3-b14-make-graph-provider.test.mjs tools/qa/cxorbia-i3-f2-predeploy-proven-predecessor.test.mjs > "$FOCAL_OUT/gthn-source-tests.log"
