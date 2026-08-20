# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-DEFINITIVE-ROOT-CAUSE-PLAN-43`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_R1_PASS__I5_R2_ACTIVE__87_13`

## 1. Orden obligatorio vigente

Leer siempre en este orden antes de responder o actuar:

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — estado machine-readable y `currentIteration`.
2. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`.
3. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`.
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
5. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
7. `backend/config/cxorbia-production-promotion-contract.json`.
8. `backend/config/cxorbia-production-promotion-gate-evidence.json`.
9. `SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md` y addenda maestras vigentes de continuidad, empalme, Academia, patrones reutilizables y antidesvío.
10. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
11. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y sus addenda vigentes.
12. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

Los validadores obligatorios del control-plane son:

- `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`;
- `tools/production/validate-production-promotion-gates.js`.

## 2. Regla anti-pérdida de plan

El plan no se reconstruye desde la conversación. El siguiente bloque se obtiene exclusivamente de `backend/config/cxorbia-phase-a-continuity-lock.json.currentIteration`.

Si dos fuentes operativas contradicen `SYNC_EPOCH`, `PLAN_ID`, `currentIteration`, topología productiva o source lock funcional, declarar:

`CONTINUITY_DRIFT_BLOCKED`

Acción permitida: reconciliar documentación/control-plane. Acción prohibida: reabrir I1–I4, iniciar otra metodología, crear otra candidata/rama/PR o ejecutar producción.

## 3. Estado vivo

- I1–I4: `PASS/FROZEN`, 85/85.
- I5-R1: `PASS`, 2/2.
- Score formal: **87/100**.
- Iteración activa: `I5-R2_CONTROL_PLANE_AND_DOCUMENT_DRIFT_CLOSURE`.
- Producción autorizada: no.
- Source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

## 4. Topología productiva canónica

`PROMOTE_EXISTING_CLEAN_PROJECT`:

- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev` / `us-central1`.

`cxorbia-preprod-20260819` no es canónico, nunca fue creado y no debe crearse. `cxorbia-tya-dev-260729-c4` es sandbox. `tya-plataforma` es legacy intacto hasta cutover explícito.

## 5. Plan bounded restante

1. `I5-R2` — 3 pts — control-plane/document drift — salida `CONTINUITY_DRIFT_AUDIT_PASS`.
2. `I5-R3` — 3 pts — aceptación crítica producto — salida `CRITICAL_PRODUCT_ACCEPTANCE_PASS`.
3. `I5-R4` — 2 pts — auditoría definitiva post-remediación — salida `ROOT_CAUSE_CLOSED_PASS`.
4. `I5-G1` — 3 pts — autorización + cutover — salida `PRODUCTION_CUTOVER_EXECUTED`.
5. `I5-G2` — 2 pts — smoke/hypercare — salida `PRODUCTION_FROZEN_PASS_100`.

Causas raíz quedan cerradas/auditadas al final de R4; producción en G1; freeze estable 100 en G2.

## 6. Aceptación crítica que no puede omitirse

Antes del cutover debe existir evidencia terminal sobre el mismo artefacto para HR viva sin clones/fallback, shoppers, visitas, Finanzas, multirol/RBAC, reload/nueva sesión, no demo/stale, same-artifact/no-rebuild y rollback.

## 7. Circuit breaker

- No nueva candidata/rama/PR/workflow por rutina.
- No nuevo PREPROD ni Project Creator por ruta descartada.
- No reabrir I1–I4 sin `P0_PROVEN` nuevo.
- No rebuild antes del cutover.
- No producción antes de `ROOT_CAUSE_CLOSED_PASS` + autorización explícita.
- No fallback silencioso demo/stale.
- No overwrite silencioso de conflictos HR/plataforma.
- No declarar avance sin evidencia terminal.

## 8. Mantenimiento obligatorio

Después de cada iteración terminal:

1. actualizar continuity lock;
2. actualizar Execution State, Checkpoint, Plan y tracker al mismo epoch;
3. actualizar PR #7;
4. reconciliar CAMBIOS/RESUMEN/PENDIENTES/addenda;
5. ejecutar validadores;
6. solo entonces cambiar `currentIteration`.
