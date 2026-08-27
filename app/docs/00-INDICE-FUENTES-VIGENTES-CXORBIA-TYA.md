# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-26  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**F3_PROMOTION_EPOCH:** `RC15-F3-PROVIDER-PROMOTION-20260826-01`  
**F4_RECOVERY_EPOCH:** `RC15-F4-G2B-RECOVERY-STOP-20260826-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`  
**currentMasterPhase:** `F4_G2B_RECOVERY_ONE_SHOT`  
**currentMasterStep:** `F4_TERMINAL_STOP_MECHANISM_P0_POST_HOSTING_READBACK_NOT_STABILIZED`  
**M1:** `CLOSED_PASS`  
**M2/F0:** `CLOSED_PASS_4_OF_4`  
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`  
**F3:** `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`  
**F4:** `TERMINAL_STOP_MECHANISM_P0_POST_HOSTING_READBACK_NOT_STABILIZED`  
**NEXT:** `WAITING_EXPLICIT_PLAN_CHANGE_OR_READONLY_RECERTIFICATION_DECISION`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `76/100`

M3 y F3 permanecen terminales. F4 consumió su único intento autorizado y **no obtuvo `RECOVERY_PASS_FULL`**. La causa terminal es `MECHANISM_P0`, no `PRODUCT_P0`: el post-readback de Hosting comenzó inmediatamente después de un deploy exitoso, recibió un adapter que no contenía los dos marcadores obligatorios del source-fix y falló antes de ejecutar el smoke API de Hosting. El gate no tenía espera/retry por mismatch de contenido ni binding a la versión de Hosting recién liberada.

## Autoridad canónica viva

1. master plan V1.1 congelado y su hash;
2. `backend/config/cxorbia-phase-a-continuity-lock.json`;
3. `app/docs/evidence/RC15-F4-G2B-RECOVERY-STOP-LATEST.json`;
4. `backend/config/cxorbia-provider-promotion-mechanism-v1.json` blob `f1c265164b7bc697ecb5cd9b247c334afd76a5f2`;
5. autorización F4 y lease single-use ya consumidos;
6. evidencia terminal F3/M3 + tombstones + consumed ledger + aliases;
7. checkpoint/Claude/Pendientes como mirrors;
8. progress lock para porcentaje real.

## Resultado F4

Run `33032334162`; trigger HEAD `7f4e51dcfa7c1d275b788d369e3c1b0b3e8691c9`; commit de consumo de lease `af59bc65bf36d0c43cd14bd23eea007b1dc79ed7`.

PASS: autoridad estructurada, source-fix semántico, autenticación GCP, provider preflight read-only, Cloud Build, Cloud Run update, smoke directo Cloud Run y deploy Hosting. Cloud Run quedó observado en `cxorbia-live-hr-dev-00012-gw9`, 100% tráfico, con digest `sha256:4e2cd8cbd8d7b28a2abada2ea5060b58691f5582e871220afe141c4824027970`.

STOP: la certificación estática de Hosting observó contenido sin los marcadores `YES_PAULA_20260820_G2B_SYNTHETIC` y `cxorbia-command-http-transport-v1.js`; el source-fix exacto sí contiene ambos. El smoke API de Hosting y el provider post-readback no se ejecutaron.

## Seguridad y estado

Lease `F4-G2B-PROVIDER-LEASE-20260826-01`: consumido single-use. Budget consumido: Cloud Build 1/1, Cloud Run update 1/1, Hosting deploy 1/1. Retry automático: 0/0. No se ejecutó comando sintético autenticado. Firestore/Auth/Storage/HR externa/datos reales/credenciales reales/pagos/Rules/Make/Gemini/merge = 0.

El preflight certificó residuo sintético cero antes de las mutaciones; el residuo post-recovery **no quedó certificado** porque el post-readback fue omitido tras el STOP. La situación actual de Hosting después de la propagación queda `NOT_CERTIFIED_BY_F4_TERMINAL_EVIDENCE`.

PR #7 permanece cerrado/no mergeado. F5 sigue bloqueado. No existe retry ni nueva mutación provider autorizada. El siguiente movimiento requiere decisión explícita de Paula sobre cambio de plan o recertificación estrictamente read-only.
