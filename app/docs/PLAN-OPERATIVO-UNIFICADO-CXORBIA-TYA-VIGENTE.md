# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Iteración activa / currentIteration:** `I5-R4`  
**Score formal:** `93/100`  
**Producción autorizada:** `NO`

## 1. Regla de continuidad

Este es el plan formal único hacia producción. No se reconstruye desde una conversación ni se sustituye por un roadmap nuevo ante bloqueos intermedios.

El estado machine-readable vive en `backend/config/cxorbia-phase-a-continuity-lock.json`. Toda conversación nueva toma la acción exclusivamente de `currentIteration`. Si existe contradicción: `CONTINUITY_DRIFT_BLOCKED`, reconciliar control-plane antes de trabajo funcional.

I1–I4 permanecen `PASS/FROZEN` sobre `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. I5-R1, R2 y R3 están cerrados. Solo un `P0_PROVEN` nuevo y reproducible permite reabrir producto congelado.

## 2. Topología productiva canónica

`PROMOTE_EXISTING_CLEAN_PROJECT` sobre `cxorbia-backend-dev`.

- Hosting target: `cxorbia-dev`.
- Hosting site: `cxorbia-backend-dev`.
- URL futura productiva: `https://cxorbia-backend-dev.web.app`.
- Cloud Run: `cxorbia-live-hr-dev`, `us-central1`.
- `cxorbia-tya-dev-260729-c4`: sandbox.
- `tya-plataforma`: legacy preservado hasta cutover explícito.
- `cxorbia-preprod-20260819`: `SUPERSEDED`; no crear.

## 3. Causas raíz registradas

1. RC01 `CANONICAL_STATE_DRIFT` — **PASS R2**.
2. RC02 `PLAN_LOSS_ACROSS_CONVERSATIONS` — **PASS R1**.
3. RC03 `PROMOTION_CONTRACT_VS_ADHOC_TOPOLOGY_DRIFT` — **PASS R1**.
4. RC04 `PROMOTION_VALIDATOR_SCHEMA_MISMATCH` — **PASS R1/R2**.
5. RC05 `ONE_SHOT_GATE_STATE_DRIFT_OR_STALE_REQUESTS` — **PASS R2**.
6. RC06 `EVIDENCE_NAMING_MISMATCH_CAUSING_REDUNDANT_RERUNS` — **PASS R2**.
7. RC07 `LIVE_HR_CLONE_STALE_OR_DEMO_FALLBACK_RISK` — **PASS R3**.
8. RC08 `SHOPPER_VISIT_SCOPE_VISIBILITY_RISK` — **PASS R3**.
9. RC09 `FINANCE_PAYMENT_SEMANTICS_REGRESSION_RISK` — **PASS R3**.
10. RC10 `MULTIROLE_HARNESS_OR_CREDENTIAL_STALENESS` — **PASS R3**.
11. RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT` — **ACTIVA R4**.
12. RC12 `POST_PRODUCTION_OBSERVABILITY_AND_SYNC_REGRESSION_RISK` — pendiente G2.

Ninguna causa crítica RC01–RC11 puede quedar abierta antes de G1.

## 4. Plan cerrado de seis iteraciones

| Iteración | Peso | Objetivo | Estado | Salida obligatoria |
|---|---:|---|---|---|
| `I5-R1` | 2 | Persistencia del plan y validadores fail-closed | **PASS** | `CANONICAL_CONTINUITY_AND_VALIDATOR_LOCK_PASS` |
| `I5-R2` | 3 | Cierre deriva documental/control-plane | **PASS** | `CONTINUITY_DRIFT_AUDIT_PASS` |
| `I5-R3` | 3 | Aceptación crítica del producto exacto | **PASS** | `CRITICAL_PRODUCT_ACCEPTANCE_PASS` |
| `I5-R4` | 2 | Auditoría independiente post-remediación | **ACTIVA** | `ROOT_CAUSE_CLOSED_PASS` |
| `I5-G1` | 3 | Autorización explícita + cutover mismo artefacto | PENDIENTE AUTORIZACIÓN | `PRODUCTION_CUTOVER_EXECUTED` |
| `I5-G2` | 2 | Smoke/hypercare/rollback/freeze | PENDIENTE | `PRODUCTION_FROZEN_PASS_100` |

Total I5 = 15 puntos. Score actual 93/100.

## 5. I5-R1/R2 — cerrados

R1 persiste el plan y los validadores. R2 eliminó estados competidores sin tocar producto frozen:

- CAMBIOS/RESUMEN/PENDIENTES sincronizados;
- PREPROD/Project Creator marcado `SUPERSEDED`;
- `cxorbia-consumed-one-shot-gates.json` impide reactivar IDs consumidos;
- `cxorbia-evidence-aliases.json` evita reruns por nomenclatura;
- continuidad valida también documentos raíz y controles nuevos;
- promoción mantiene cutover separado de business/data writes;
- evidencia productiva usa referencias directas, no clases M indefinidas.

## 6. I5-R3 — cerrado `CRITICAL_PRODUCT_ACCEPTANCE_PASS`

Matriz terminal: `backend/config/cxorbia-r3-critical-product-acceptance.json`.

Sobre exactamente el source `f9802f...` ya materializado quedaron PASS:

- `ROADMAP_LIVE_NO_CLONES`;
- `SHOPPERS_VISIBLE_EXPECTED_SCOPE`;
- `VISITS_CURRENT_AND_HISTORY_VISIBLE`;
- `FINANCE_CANONICAL_SEMANTICS`;
- `MULTIROLE_SCOPE_PASS`;
- `RELOAD_SESSION_PASS`;
- `NO_DEMO_OR_STALE_FALLBACK`;
- `SAME_ARTIFACT_PASS`.

Evidencia crítica:

- Staff/Admin actual run `32342457328`, artifact `9396828201`: 15 periodos, 660 visitas, 200 shoppers, 2025-06→2026-08, reload/new-tab estable, exact crosswalk, no fuzzy matching, 0 writes/deploy.
- Shopper histórico: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`, reutilizado sin reset/reproceso.
- Cliente actual run `32400495121`, artifact `9418300899`: login único canónico, scope tenant/proyecto correcto, `cli_dashboard` PASS.
- Multirol: `PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.
- Finanzas: mayo 44/44 pagadas; junio 2/44 pagadas, 42 pendientes, Q451; `conciliada_pendiente_pago != pagada`.
- Same artifact: Hosting same-build PASS y comparación del source lock al head de reconciliación sin cambios runtime productivos.

Dos HOLD previos de R3 fueron harness stale con `productP0Proven=false` y quedaron consumidos. No se demostró P0 de producto.

## 7. I5-R4 — auditoría definitiva activa

Objetivo: verificar **después** de las remediaciones que el conjunto completo no contiene una causa crítica abierta. No es una nueva auditoría general ni una reejecución indiscriminada de I1–I4/R3.

R4 debe comprobar fail-closed:

1. RC01–RC10 están PASS y cada PASS tiene evidencia vigente/reutilizable.
2. RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT` cierra PASS.
3. el source `f9802f...` sigue siendo el producto a promover y no hubo rebuild.
4. rollback está listo y puede ser revalidado sin ejecutar producción.
5. continuity lock, índice, checkpoint, plan, tracker, root docs, ledger, aliases y promotion evidence están coherentes.
6. `CRITICAL_PRODUCT_ACCEPTANCE_PASS` no depende de un HOLD de harness mal clasificado.
7. no existe `P0_PROVEN` nuevo.
8. `EXPLICIT_CUTOVER_AUTHORIZATION` sigue PENDING y business/data writes siguen no autorizados.

Único PASS aceptable: `ROOT_CAUSE_CLOSED_PASS` → 95/100.

Si R4 falla, corregir solo la causa concreta y repetir R4; no crear plan nuevo, nueva candidata, rama, PR, PREPROD ni rebuild.

## 8. I5-G1 — producción

Solo después de `ROOT_CAUSE_CLOSED_PASS` se consume autorización explícita de cutover. Mismo artefacto, no rebuild, rollback preparado, legacy intacto hasta confirmar PASS. **La autorización de cutover/deploy no autoriza business/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes.**

Al ejecutarse: 98/100.

## 9. I5-G2 — post-producción inmediata

Smoke/hypercare sobre producción real: login/roles, HR viva, shoppers, visitas, Finanzas, reload/nueva sesión, cross-tenant/scope, no fallback demo/stale, sincronización HR/plataforma sin duplicados/overwrites silenciosos y errores/métricas runtime. P0 → rollback inmediato + corrección focalizada. `PRODUCTION_FROZEN_PASS_100` cierra Phase A.

## 10. Conteo comprometido

- R1–R3 ya PASS = 93/100.
- R4 es la única iteración pendiente para cerrar/auditar causas raíz = 95/100.
- G1 = producción efectiva = 98/100, solo con autorización explícita.
- G2 = cierre estable = 100/100.

No se agregan iteraciones por conversación nueva, explicación, reauditoría general o nomenclatura distinta. Solo un P0 reproducible o dependencia externa real puede agregar una reparación focal dentro de este mismo plan.

## 11. Seguridad y circuit breaker

Prohibido: nueva candidata/rama/PR/workflow; nuevo PREPROD; Project Creator por ruta descartada; reabrir I1–I4/R3 sin P0; rebuild; cutover antes de R4 PASS; producción sin autorización explícita; fallback demo/stale; overwrite silencioso HR/plataforma; afirmar PASS sin evidencia terminal.

Epoch anterior preservado como historia: `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`, `currentIteration=I5-R3`.
