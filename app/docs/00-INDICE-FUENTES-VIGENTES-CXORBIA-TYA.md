# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_R3_PASS__I5_R4_ACTIVE__93_7`  
**currentIteration:** `I5-R4`

## 1. Orden obligatorio vigente

Leer siempre en este orden antes de responder o actuar:

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — estado machine-readable y `currentIteration`.
2. `backend/config/cxorbia-consumed-one-shot-gates.json` — requests consumidos que no pueden reactivarse.
3. `backend/config/cxorbia-evidence-aliases.json` — equivalencias históricas que no crean reruns.
4. `backend/config/cxorbia-r3-critical-product-acceptance.json` — matriz terminal de aceptación crítica R3.
5. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`.
6. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`.
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
8. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
9. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
10. `backend/config/cxorbia-production-promotion-contract.json`.
11. `backend/config/cxorbia-production-promotion-gate-evidence.json`.
12. `SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md` y addenda maestras vigentes de continuidad, empalme, Academia, patrones reutilizables y antidesvío.
13. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
14. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y sus addenda vigentes.
15. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

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
- I5-R3: `PASS`, 3/3 — `CRITICAL_PRODUCT_ACCEPTANCE_PASS`.
- Score formal: **93/100**.
- Iteración activa: `I5-R4_INDEPENDENT_ROOT_CAUSE_CLOSURE_AUDIT`.
- Producción autorizada: **no**.
- Source funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

## 4. Evidencia terminal I5-R3

La matriz `backend/config/cxorbia-r3-critical-product-acceptance.json` cerró PASS los ocho criterios obligatorios:

- `ROADMAP_LIVE_NO_CLONES`;
- `SHOPPERS_VISIBLE_EXPECTED_SCOPE`;
- `VISITS_CURRENT_AND_HISTORY_VISIBLE`;
- `FINANCE_CANONICAL_SEMANTICS`;
- `MULTIROLE_SCOPE_PASS`;
- `RELOAD_SESSION_PASS`;
- `NO_DEMO_OR_STALE_FALLBACK`;
- `SAME_ARTIFACT_PASS`.

Evidencia focal vigente:

- Staff/Admin actual: run `32342457328`, job `96344128319`, artifact `9396828201`; 15 periodos, 660 visitas, 200 shoppers, agosto 2026, reload/new-tab estable, `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.
- Shopper histórico: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`, exact identity/profile/membership/crosswalk/history E2E; no reproceso.
- Cliente actual: run `32400495121`, job `96527305525`, artifact `9418300899`, `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`; login único canónico, tenant `tya`, proyecto `cinepolis`, `cli_dashboard` renderizado sin excepción.
- Multirol congelado: `PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.
- Finanzas: mayo 44/44 pagadas; junio 2/44 pagadas, 42 pendientes, Q451; liquidación y pago son estados separados.
- Same artifact: source `f9802f...` conserva Hosting same-build PASS; comparación hasta el head de reconciliación no detectó cambios en runtime de `app/` fuera de documentación.

No se demostró P0 de producto en R3. Los dos HOLD previos de R3 quedaron clasificados como harness obsoleto y consumidos; no autorizan reabrir producto.

## 5. Topología productiva canónica

`PROMOTE_EXISTING_CLEAN_PROJECT`:

- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev` / `us-central1`.

`cxorbia-preprod-20260819` no es canónico, nunca fue creado y su ruta Project Creator está `SUPERSEDED`. `cxorbia-tya-dev-260729-c4` es sandbox. `tya-plataforma` es legacy intacto hasta cutover explícito.

## 6. Siguiente bloque exacto — I5-R4

Ejecutar auditoría independiente post-remediación, sin rediseñar ni reejecutar áreas congeladas. Debe comprobar:

- RC01–RC10 cerradas con evidencia y sin contradicción;
- RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT` cerrado;
- cero `P0_PROVEN` nuevo;
- continuity/control-plane coherente;
- R3 terminal PASS reutilizable sin reruns;
- rollback listo y mismo artefacto preservado;
- autorización de cutover todavía pendiente y separada de business/data writes.

Salida única para avanzar: `ROOT_CAUSE_CLOSED_PASS` → **95/100**. Un fallo solo autoriza reparación focal de la causa concreta; no un nuevo plan.

## 7. Plan bounded restante

1. `I5-R4` — 2 pts — auditoría definitiva post-remediación — 95% al PASS.
2. `I5-G1` — 3 pts — autorización explícita + cutover mismo artefacto — 98% al ejecutar producción.
3. `I5-G2` — 2 pts — smoke/hypercare/freeze — 100% al PASS.

## 8. Circuit breaker

- No nueva candidata/rama/PR/workflow por rutina.
- No PREPROD adicional ni Project Creator por la ruta descartada.
- No reabrir I1–I4 ni R3 sin `P0_PROVEN` nuevo.
- No rebuild antes del cutover.
- No producción antes de `ROOT_CAUSE_CLOSED_PASS` + autorización explícita.
- Cutover no autoriza business/data writes.
- No fallback silencioso demo/stale.
- No overwrite silencioso de conflictos HR/plataforma.
- No declarar avance sin evidencia terminal.

## 9. Continuidad histórica

Epoch anterior preservado como historia: `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44` / `currentIteration=I5-R3`. Ya no gobierna el siguiente bloque.

Después de cada iteración terminal: actualizar continuity lock, Execution State, Source Lock, Checkpoint, Plan, tracker, CAMBIOS/RESUMEN/PENDIENTES y PR #7 al mismo epoch; ejecutar validadores; solo entonces cambiar `currentIteration`.
