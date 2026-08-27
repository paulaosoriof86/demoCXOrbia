# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-26  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**F3_PROMOTION_EPOCH:** `RC15-F3-PROVIDER-PROMOTION-20260826-01`  
**F4_RECOVERY_EPOCH:** `RC15-F4-G2B-RECOVERY-PASS-20260826-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`  
**currentMasterPhase:** `F5_LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`  
**currentMasterStep:** `F4_RECOVERY_PASS_FULL_READONLY_RECERTIFIED`  
**M1:** `CLOSED_PASS`  
**M2/F0:** `CLOSED_PASS_4_OF_4`  
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`  
**F3:** `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`  
**F4:** `CLOSED_PASS_RECOVERY_PASS_FULL_READONLY_RECERTIFIED`  
**NEXT:** `F5_WAITING_EXPLICIT_SYNTHETIC_ACCEPTANCE_AUTHORIZATION`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `81/100`

## Autoridad canónica viva

1. master plan V1.1 congelado, blob `0ea2cd9802e687938086886d8d03648f105a7d64`;
2. `backend/config/cxorbia-phase-a-continuity-lock.json`;
3. `app/docs/evidence/RC15-F4-G2B-READONLY-RECERTIFICATION-LATEST.json`;
4. evidencia histórica STOP F4, autorización F4 y lease single-use consumido;
5. evidencia terminal F3/M3 + tombstones + consumed ledger + aliases;
6. checkpoint, progress lock, Claude y Pendientes como mirrors;
7. PR #7 permanece mirror-only, cerrado y no mergeado.

## F4 cerrado PASS

El único intento mutante F4 sigue siendo el run `33032334162`; no se repitió. Ese intento produjo Build `79883a26-7118-4fa7-9947-3198a45b1661`, revisión Cloud Run `cxorbia-live-hr-dev-00012-gw9`, digest `sha256:4e2cd8cbd8d7b28a2abada2ea5060b58691f5582e871220afe141c4824027970` y deploy Hosting exitoso.

El STOP posterior `MECHANISM_P0 — POST_HOSTING_READBACK_NOT_STABILIZED` quedó resuelto por recertificación **estrictamente read-only** run `33034673610`, sobre HEAD `ed282aa8932d259cf5340f8007fc22fa90b2ef34`, sin Build, deploy, lease, provider mutation ni comando sintético autenticado.

La recertificación comprobó:
- Cloud Run sigue exactamente en `cxorbia-live-hr-dev-00012-gw9`, digest esperado y 100% tráfico;
- `/health` reporta G2-B ready/enabled/synthetic-only;
- Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`, versión `afe292cfcbbc6005`;
- adapter remoto y source-fix tienen SHA-256 idéntico `9d69d0d0db42e3f2b93cc893f2da1ed0b2e753403d3f46a9a8537dbe994c82b0`;
- API por Hosting responde 401 `G2B_SYNTHETIC_AUTHORIZATION_REQUIRED` sin autenticación;
- residuo sintético post-recovery = 0 en visits, postulations, receipts, audit, shoppers y Auth.

Resultado acumulativo: `RECOVERY_PASS_FULL`. El STOP histórico se preserva como evidencia de mecanismo; no se reescribe ni se convierte retroactivamente en fallo de producto.

## Seguridad

Recertificación: provider mutations 0; Cloud Build 0; Cloud Run update 0; Hosting deploy 0; lease emitido/reutilizado 0; comandos sintéticos autenticados 0. Firestore/Auth/Storage/HR externa/datos reales/credenciales/pagos/Rules/Make/Gemini/merge = 0.

## Siguiente exacto

`F5_WAITING_EXPLICIT_SYNTHETIC_ACCEPTANCE_AUTHORIZATION`.

F5 es la aceptación sintética integral real y requiere autorización específica nueva. No está autorizada por el cierre read-only de F4. No ejecutar F5, deploy, rebuild, merge ni provider writes por inferencia.
