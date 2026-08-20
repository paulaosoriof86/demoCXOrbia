# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_R2_PASS__I5_R3_ACTIVE__90_10`  
**currentIteration:** `I5-R3`

## 1. Orden obligatorio vigente

Leer siempre en este orden antes de responder o actuar:

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — estado machine-readable y `currentIteration`.
2. `backend/config/cxorbia-consumed-one-shot-gates.json` — requests consumidos que no pueden reactivarse.
3. `backend/config/cxorbia-evidence-aliases.json` — equivalencias históricas que no crean reruns.
4. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`.
5. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`.
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
8. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
9. `backend/config/cxorbia-production-promotion-contract.json`.
10. `backend/config/cxorbia-production-promotion-gate-evidence.json`.
11. `SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md` y addenda maestras vigentes de continuidad, empalme, Academia, patrones reutilizables y antidesvío.
12. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
13. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y sus addenda vigentes.
14. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

Validadores obligatorios:

- `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`;
- `tools/production/validate-production-promotion-gates.js`.

## 2. Regla anti-pérdida de plan

El plan no se reconstruye desde la conversación. El siguiente bloque se obtiene exclusivamente de `backend/config/cxorbia-phase-a-continuity-lock.json.currentIteration`.

Si dos fuentes operativas contradicen `SYNC_EPOCH`, `PLAN_ID`, `currentIteration`, topología productiva o source lock funcional, declarar `CONTINUITY_DRIFT_BLOCKED` y reconciliar control-plane antes de trabajo funcional. No reabrir I1–I4, no crear otra metodología/candidata/rama/PR y no ejecutar producción.

## 3. Estado vivo

- I1–I4: `PASS/FROZEN`, 85/85.
- I5-R1: `PASS`, 2/2.
- I5-R2: `PASS`, 3/3 — `CONTINUITY_DRIFT_AUDIT_PASS`.
- Score formal: **90/100**.
- Iteración activa: `I5-R3_CRITICAL_PRODUCT_ACCEPTANCE_RECONCILIATION`.
- Producción autorizada: no.
- Source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

## 4. Topología productiva canónica

`PROMOTE_EXISTING_CLEAN_PROJECT`:

- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev` / `us-central1`.

`cxorbia-preprod-20260819` no es canónico, nunca fue creado y su ruta Project Creator está `SUPERSEDED`. `cxorbia-tya-dev-260729-c4` es sandbox. `tya-plataforma` es legacy intacto hasta cutover explícito.

## 5. Cierre I5-R2

Quedaron cerradas RC01, RC05 y RC06 mediante:

- sincronización de CAMBIOS/RESUMEN/PENDIENTES con el plan vivo;
- ledger inmutable de one-shot gates consumidos;
- alias registry de evidencia histórica;
- validador de continuidad ampliado;
- separación estricta entre autorización de cutover y autorización de business/data writes;
- retiro de etiquetas M3/M4/M5/M6/M8 no definidas de la evidencia de promoción.

La ruta histórica PREPROD/Project Creator permanece solo como historial y no puede convertirse en siguiente acción por deriva de documentos o conversación.

## 6. Siguiente bloque exacto — I5-R3

Debe probar/reconciliar, sobre el mismo source funcional:

- `ROADMAP_LIVE_NO_CLONES`;
- `SHOPPERS_VISIBLE_EXPECTED_SCOPE`;
- `VISITS_CURRENT_AND_HISTORY_VISIBLE`;
- `FINANCE_CANONICAL_SEMANTICS`;
- `MULTIROLE_SCOPE_PASS`;
- `RELOAD_SESSION_PASS`;
- `NO_DEMO_OR_STALE_FALLBACK`;
- `SAME_ARTIFACT_PASS`.

Salida obligatoria: `CRITICAL_PRODUCT_ACCEPTANCE_PASS`. Solo un P0 reproducible abre corrección focalizada.

## 7. Plan bounded restante

1. `I5-R3` — 3 pts — aceptación crítica producto — 93% al PASS.
2. `I5-R4` — 2 pts — auditoría definitiva post-remediación — 95% al PASS.
3. `I5-G1` — 3 pts — autorización + cutover — 98% al ejecutar producción.
4. `I5-G2` — 2 pts — smoke/hypercare/freeze — 100% al PASS.

## 8. Circuit breaker

- No nueva candidata/rama/PR/workflow por rutina.
- No PREPROD adicional ni Project Creator por la ruta descartada.
- No reabrir I1–I4 sin `P0_PROVEN` nuevo.
- No rebuild antes del cutover.
- No producción antes de `ROOT_CAUSE_CLOSED_PASS` + autorización explícita.
- Cutover no autoriza business/data writes.
- No fallback silencioso demo/stale.
- No overwrite silencioso de conflictos HR/plataforma.
- No declarar avance sin evidencia terminal.

## 9. Mantenimiento obligatorio

Después de cada iteración terminal: actualizar continuity lock, Execution State, Source Lock, Checkpoint, Plan, tracker, CAMBIOS/RESUMEN/PENDIENTES y PR #7 al mismo epoch; ejecutar validadores; solo entonces cambiar `currentIteration`.
