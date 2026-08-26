# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `QUEUE_INTEGRITY_REPAIRED + CP108_TOMBSTONED + CONCURRENT_WRITER_ROOTFIX_READBACK_PASS_CLEAN_PROBE_PENDING`  
**NEXT:** `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_27`  
**PHASE_A:** `98/100`

## Estado canónico

F0 permanece cerrado: 142 hallazgos clasificados, 32 HOLD/P0 acumulados, 2 contenidos y 30 residuales al entrar a M3; exhaustividad 4/4 y cero superficie write-capable sin clasificación. CP011, CP142 y CP108 están `INERTIZED_WITHOUT_EXECUTION`; quedan 27 residuales.

La cola finita M3 está reconciliada contra la evidencia M2/F0 bloqueada. El validador activo exige cardinalidad, unicidad, aritmética, exclusión de completados y membresía exacta.

## Rootfix de escritor concurrente

Está demostrado que el restore `c74779105700714efc5d7ad75756a676dd6a8c7a` reactivó `.github/workflows/cxorbia-phase-a-live-hr-read-probe.yml`; el run `32917331228` conservó `contents: write` + `git push` directo y produjo el commit bot `f164110bfe09fc817a451e9e3bb6f4503578c164`.

El rootfix `5b521bffdc083026430f3f43b205d35a17fdec8a` fijó 22 workflows históricos al blob inerte `db925bb2823aa52ddfe36343567e6be5aace8f65` sin tocar runtime/tools funcionales. El readback posterior mantuvo el HEAD estable y el checkpoint canónico M3 pasó en el run `32923311037`.

Ese commit de transición generó 24 runs: 1 PASS canónico y 23 FAIL. La presencia de esos 23 runs no se interpreta como reactivación post-rootfix porque el propio commit cambió las definiciones de workflows que antes tenían trigger `push`. El gate adicional observado `cxorbia-firebase-dev-clean-state-read-only-gate.yml` tiene `contents: read`, cero provider calls y fue disparado porque uno de sus paths observados era precisamente el workflow histórico modificado.

La prueba decisiva siguiente es un commit canónico mínimo que no toca workflows. Solo si esa prueba mantiene la rama sin commit bot y sin auto-runs históricos se declara cerrado el rootfix y se reanuda el backlog 27→26.

Provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge/frontend writes = 0.

## Orden canónico vivo

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — autoridad dinámica e invariantes.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` — master plan FROZEN e inmutable.
3. `app/docs/evidence/RC15-M2-FINITE-F0-CLOSURE-LATEST.json` — universo finito F0/M2.
4. `app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json` — estado operativo M3.
5. `app/docs/evidence/RC15-M3-MECHANISM-CERTIFICATION-LATEST.json` — certificación base histórica.
6. `app/docs/evidence/RC15-M3-QUEUE-INTEGRITY-REPAIR-LATEST.json` — reparación de cardinalidad/membresía.
7. `app/docs/evidence/RC15-M3-CP108-TOMBSTONE-LATEST.json` — tombstone CP108.
8. `app/docs/evidence/RC15-M3-CONCURRENT-WRITER-ROOTFIX-LATEST.json` — evidencia causal, readback y clean probe.
9. `backend/config/cxorbia-validator-authority.json` — set de validadores autoritativo M3.
10. `backend/config/cxorbia-historical-authority-tombstones.json` — cola finita e inertizaciones.
11. `backend/config/cxorbia-consumed-one-shot-gates.json` — solo ejecuciones realmente consumidas.
12. `backend/config/cxorbia-evidence-aliases.json` — aliases sin autoridad.
13. checkpoint/execution/source lock y mirrors obligatorios.
14. `CAMBIOS-BACKEND-M3-CONCURRENT-WRITER-ROOTFIX-20260825.md` — addendum del rootfix.

## Regla anti-desincronización

Toda materialización canónica M3 usa un único commit Git atómico + readback remoto + gate source-only. Durante M3 los 22 workflows históricos identificados quedan fijados al estado `workflow_dispatch` + `contents: read` + `if:false`; una restauración amplia falla en el gate canónico. El único workflow automático esperado en una materialización canónica limpia M3 es `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`.

Ninguna iteración cuenta como avance de backlog si `currentResidualHolds` no disminuye, salvo cierre demostrado de un bloqueo reproducible del mecanismo. `productionState.functionalSourceLock` sigue separado del HEAD de control-plane. Provider preflight permanece fuera de M3.

## Siguiente exacto

Ejecutar y leer la clean probe sin cambios de workflow. Si pasa, documentar `CONCURRENT_WRITER_ROOTFIX_CLOSED_PASS` y continuar exclusivamente la cola M2 bloqueada de 27 residuales. No reabrir M1/M2, no Tramo 15, no nueva metodología. M4/F3 solo después de M3 `CLOSED_PASS`.
