# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-21  
**SYNC_EPOCH:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**PHASE_A:** `98/100`  
**ACTIVE_BLOCKER:** `G2B_RECOVERY_NO_PROVIDER_SIDE_EFFECT_NEW_EXPLICIT_DECISION_REQUIRED`

## Orden canónico obligatorio
1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `app/docs/evidence/I5-G2B-P0-WRITEPATH-RECOVERY-LATEST.json`.
3. `backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-request.json`.
4. `backend/config/cxorbia-consumed-one-shot-gates.json`.
5. `app/docs/evidence/I5-G2B-PROVIDER-FORENSIC-READINESS-LATEST.json`.
6. `app/docs/evidence/I5-G2B-ATOMIC-CONTINUITY-SYNC-LATEST.json`.
7. `backend/config/cxorbia-g2a-production-readonly-smoke.json`, `backend/config/cxorbia-g1-production-cutover.json` y `backend/config/cxorbia-r4-root-cause-closure.json`.
8. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`, `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md` y `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
9. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.
10. Addenda históricos, Academia, PR #7 y otros mirrors solo como evidencia/contexto; no pueden reactivar one-shots ni reemplazar el estado anterior.

## Estado único
I1–I4, R1–R4 y G1 permanecen PASS/FROZEN. G2-A permanece PASS/FROZEN. G2-B sigue siendo el único frente restante.

La recuperación terminal más reciente es `i5-g2b-p0-writepath-recovery-20260821-02` con decisión `RECOVERY_NO_PROVIDER_SIDE_EFFECT`: Cloud Run y Hosting quedaron en el mismo baseline, no hubo Cloud Build/Cloud Run/Hosting efectivo ni writes de negocio. El provider lane forense posterior quedó `FORENSIC_PROVIDER_LANE_READY`, con cero provider writes.

## Autoridad de eventos
`backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-execute.json` es un **artefacto histórico inmutable de evento**. Sus flags internos no son autoridad de estado después del receipt terminal y no autorizan replay. No se modifica durante esta sincronización porque su ruta dispara el workflow de recovery.

`backend/config/cxorbia-g2b-live-synthetic-acceptance-request.json` conserva la autorización sintética histórica, pero **no es autoridad de ejecución actual**: el stage continúa bloqueado hasta demostrar `RECOVERY_PASS_FULL`.

## Próximo gate
`REQUIRE_NEW_EXPLICIT_RECOVERY_DECISION_AFTER_ATOMIC_CONTINUITY_SYNC`.

No existe autorización actual para otro deploy/recovery, replay ni stage sintético. No G3, nueva candidata, rama, PR, workflow, PREPROD, HR externa, datos/credenciales reales, pagos, Make, Gemini o merge.
