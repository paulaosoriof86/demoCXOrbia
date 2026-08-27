# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F6-PHASE-A-RELEASE-100-FROZEN-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`  
**currentMasterPhase:** `F7_INTEGRAL_READINESS`  
**currentMasterStep:** `F6_PHASE_A_RELEASE_100_FROZEN`  
**NEXT:** `F7_INTEGRAL_READINESS`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `90/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece exactamente:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

El release Phase A inmutable está identificado por:

- release ID `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`;
- manifest `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
- manifest blob `732dbfd48912b3550c6fb20bc592bd118647263a`;
- manifest SHA-256 `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`;
- runtime release source SHA `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`;
- runtime release tree `f93012599e4ca5195f89f19995251fa91c0d38d9`;
- Cloud Run revision `cxorbia-live-hr-dev-00013-rns`;
- image digest `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`;
- Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`;
- Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`;
- Hosting adapter SHA-256 `9d69d0d0db42e3f2b93cc893f2da1ed0b2e753403d3f46a9a8537dbe994c82b0`.

## Gates cerrados que no se reabren

- M1 `CLOSED_PASS`.
- M2/F0 `CLOSED_PASS_4_OF_4`.
- M3 `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`.
- F3 `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`.
- F4 `CLOSED_PASS_RECOVERY_PASS_FULL_READONLY_RECERTIFIED`.
- F5 `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`.
- F6 `CLOSED_PASS_IMMUTABLE` / `F6_PHASE_A_RELEASE_100_FROZEN`.

F5 one-shot permanece consumido, replay=false. F6 rebuild/redeploy no queda autorizado por continuidad ni por esta actualización documental.

## Seguridad y datos

Durante F6:

- provider access = 0;
- provider writes = 0;
- Cloud Build = 0;
- Cloud Run updates = 0;
- Hosting deploys = 0;
- Firestore writes = 0;
- Auth writes = 0;
- HR externa = 0;
- pagos / Rules / Storage / Make / Gemini = 0;
- data reimport = 0;
- merge = false.

El post-clean F5 permanece en residuo cero. No se conecta la base legacy ni se reimportan datos por sincronización documental.

## PR y control plane

PR #7 permanece cerrado, draft y no mergeado, con función `mirror-only`. El HEAD de `docs-tya-v6-v71-audit` se resuelve dinámicamente; los commits posteriores al release inmutable que solo sincronizan docs/control-plane no sustituyen los SHA del release congelado.

## Hallazgo no bloqueante

Run `33085991102`: `MECHANISM_P1_NON_BLOCKING`, causa `firebase-admin` ausente antes de iniciar el predeploy local. No hubo mutación provider ni deploy. Se corrige como mecanismo sin reabrir F5/F6.

## Siguiente exacto

`F7_INTEGRAL_READINESS` sobre el release exacto congelado.

No crear nueva rama/PR/candidata/workflow ni reauditar Phase A cerrada. F7 solo puede producir `GO`, `GO_WITH_WARNINGS` sin P0, o `HOLD/NO_GO` con evidencia reproducible.
