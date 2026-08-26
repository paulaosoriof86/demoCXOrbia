# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `MECHANISM_CERTIFIED_BASE + QUEUE_INTEGRITY_REPAIRED + CP108_TOMBSTONED + CONCURRENT_WRITER_ROOTFIX_MATERIALIZED`  
**NEXT:** `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_27`  
**PHASE_A:** `98/100`

## Estado canónico

F0 permanece cerrado: 142 hallazgos clasificados, 32 HOLD/P0 acumulados, 2 contenidos y 30 residuales al entrar a M3; exhaustividad 4/4 y cero superficie write-capable sin clasificación. CP011, CP142 y CP108 están `INERTIZED_WITHOUT_EXECUTION`; quedan 27 residuales.

La cola finita M3 está reconciliada contra la evidencia M2/F0 bloqueada. El validador activo exige cardinalidad, unicidad, aritmética, exclusión de completados y membresía exacta.

Se demostró además un defecto separado del contador: el restore `c74779105700714efc5d7ad75756a676dd6a8c7a` reactivó workflows históricos. El run `32917331228` de `.github/workflows/cxorbia-phase-a-live-hr-read-probe.yml`, disparado por `push`, conservaba `contents: write` y un `git push` directo a la rama viva y produjo el commit bot `f164110bfe09fc817a451e9e3bb6f4503578c164`. La reparación vigente cuarentena únicamente los 22 workflows históricos del conjunto M3 ya identificado, reutilizando el blob inerte `db925bb2823aa52ddfe36343567e6be5aace8f65`; no restaura ni modifica runtime/tools funcionales. El validador canónico falla cerrado si cualquiera de esos 22 workflows deja de coincidir exactamente con el estado inerte.

Provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge/frontend writes = 0 en este rootfix. El backlog permanece en 27 porque este bloque corrige un bloqueo reproducible del mecanismo y no se contabiliza como tombstone adicional.

## Orden canónico vivo

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — autoridad dinámica e invariantes.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` — master plan FROZEN e inmutable.
3. `app/docs/evidence/RC15-M2-FINITE-F0-CLOSURE-LATEST.json` — universo finito F0/M2.
4. `app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json` — estado operativo M3.
5. `app/docs/evidence/RC15-M3-MECHANISM-CERTIFICATION-LATEST.json` — certificación base histórica del mecanismo.
6. `app/docs/evidence/RC15-M3-QUEUE-INTEGRITY-REPAIR-LATEST.json` — reparación de cardinalidad/membresía.
7. `app/docs/evidence/RC15-M3-CP108-TOMBSTONE-LATEST.json` — tombstone CP108.
8. `app/docs/evidence/RC15-M3-CONCURRENT-WRITER-ROOTFIX-LATEST.json` — evidencia causal y rootfix de la carrera de escritura.
9. `backend/config/cxorbia-validator-authority.json` — set de validadores autoritativo M3.
10. `backend/config/cxorbia-historical-authority-tombstones.json` — cola finita e inertizaciones.
11. `backend/config/cxorbia-consumed-one-shot-gates.json` — solo ejecuciones realmente consumidas.
12. `backend/config/cxorbia-evidence-aliases.json` — aliases sin autoridad.
13. checkpoint/execution/source lock y mirrors obligatorios.
14. `CAMBIOS-BACKEND-M3-CONCURRENT-WRITER-ROOTFIX-20260825.md` — addendum de cambios de este rootfix.

## Regla anti-desincronización

Toda materialización canónica M3 usa un único commit Git atómico + readback remoto + gate source-only. Durante M3 los 22 workflows históricos identificados quedan fijados al estado `workflow_dispatch` + `contents: read` + `if:false`; una restauración amplia de workflows queda invalidada por el gate canónico. El único workflow automático requerido para materializaciones M3 es `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`, que no tiene provider access ni permiso de escritura de contenidos.

Ninguna iteración se considera avance de backlog si `currentResidualHolds` no disminuye, salvo bloqueo reproducible del mecanismo. `productionState.functionalSourceLock` sigue separado del HEAD de control-plane. Provider preflight permanece fuera de M3.

## Siguiente exacto

Completar readback remoto + gate source-only del rootfix y, si el HEAD permanece estable sin commit de bot ni workflow histórico automático, continuar exclusivamente la cola M2 bloqueada de 27 residuales. No reabrir M1/M2, no Tramo 15, no nueva metodología. M4/F3 solo después de M3 `CLOSED_PASS`.
