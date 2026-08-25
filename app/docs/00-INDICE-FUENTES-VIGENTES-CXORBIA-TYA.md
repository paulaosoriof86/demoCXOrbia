# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `ACTIVE_MECHANISM_CORRECTED_2_OF_30_TOMBSTONED`  
**NEXT:** `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`  
**PHASE_A:** `98/100`

## Estado canónico

F0 permanece cerrado sobre el inventario M1: 142 hallazgos clasificados, 32 HOLD/P0 acumulados, 2 contenidos y 30 residuales al entrar a M3; exhaustividad 4/4 y cero superficie write-capable sin clasificación.

M3 ya corrige la causa mecánica de desincronización: existe un set de validadores M3 explícitamente autoritativo, separado de los validadores históricos hard-codeados. `CP011` y `CP142` quedaron inertizados **sin ejecución**, por lo que el tratamiento vivo baja de 30 a **28 residuales**. No se fabricó `consumed=true` para autoridades nunca ejecutadas.

## Orden canónico vivo

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — invariantes y seguridad.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` — master plan FROZEN, sin modificación.
3. `app/docs/evidence/RC15-M2-FINITE-F0-CLOSURE-LATEST.json` — universo finito F0/M2.
4. `app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json` — estado operativo M3.
5. `backend/config/cxorbia-validator-authority.json` — único set de validadores autoritativo en M3.
6. `backend/config/cxorbia-historical-authority-tombstones.json` — cola finita e inertizaciones.
7. `backend/config/cxorbia-consumed-one-shot-gates.json` — solo ejecuciones realmente consumidas.
8. `backend/config/cxorbia-evidence-aliases.json` — aliases sin autoridad.
9. checkpoint/execution/source lock y addendum M3.

## Regla anti-desincronización

No reabrir M1/M2, no abrir Tramo 15 y no reinterpretar un request/event/alias o validador histórico como autoridad actual. Los validadores sin sufijo `-m3` listados como superseded en `cxorbia-validator-authority.json` son evidencia histórica y no autoridad de estado.

## Siguiente exacto

`M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`. G2-B permanece terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; M4/F3 solo después de M3 `CLOSED_PASS`. Provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge/frontend writes = 0.
