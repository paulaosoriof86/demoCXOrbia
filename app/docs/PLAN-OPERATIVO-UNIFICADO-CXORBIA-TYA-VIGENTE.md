# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Iteración activa / currentIteration:** `I5-R3`  
**Score formal:** `90/100`  
**Producción autorizada:** `NO`

## 1. Regla de continuidad

Este es el plan formal único hacia producción. No se reconstruye desde una conversación ni se sustituye por un roadmap nuevo ante bloqueos intermedios.

El estado machine-readable vive en `backend/config/cxorbia-phase-a-continuity-lock.json`. Toda conversación nueva toma la acción exclusivamente de `currentIteration`. Si existe contradicción: `CONTINUITY_DRIFT_BLOCKED`, reconciliar control-plane antes de trabajo funcional.

I1–I4 permanecen `PASS/FROZEN` sobre `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Solo un `P0_PROVEN` nuevo y reproducible permite reabrirlos.

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
7. RC07 `LIVE_HR_CLONE_STALE_OR_DEMO_FALLBACK_RISK` — **ACTIVA R3**.
8. RC08 `SHOPPER_VISIT_SCOPE_VISIBILITY_RISK` — **ACTIVA R3**.
9. RC09 `FINANCE_PAYMENT_SEMANTICS_REGRESSION_RISK` — **ACTIVA R3**.
10. RC10 `MULTIROLE_HARNESS_OR_CREDENTIAL_STALENESS` — **ACTIVA R3**.
11. RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT` — pendiente R4.
12. RC12 `POST_PRODUCTION_OBSERVABILITY_AND_SYNC_REGRESSION_RISK` — pendiente G2.

Ninguna causa crítica RC01–RC11 puede quedar abierta antes de G1.

## 4. Plan cerrado de seis iteraciones

| Iteración | Peso | Objetivo | Estado | Salida obligatoria |
|---|---:|---|---|---|
| `I5-R1` | 2 | Persistencia del plan y validadores fail-closed | **PASS** | `CANONICAL_CONTINUITY_AND_VALIDATOR_LOCK_PASS` |
| `I5-R2` | 3 | Cierre deriva documental/control-plane | **PASS** | `CONTINUITY_DRIFT_AUDIT_PASS` |
| `I5-R3` | 3 | Aceptación crítica del producto exacto | **ACTIVA** | `CRITICAL_PRODUCT_ACCEPTANCE_PASS` |
| `I5-R4` | 2 | Auditoría independiente post-remediación | PENDIENTE | `ROOT_CAUSE_CLOSED_PASS` |
| `I5-G1` | 3 | Autorización explícita + cutover mismo artefacto | PENDIENTE AUTORIZACIÓN | `PRODUCTION_CUTOVER_EXECUTED` |
| `I5-G2` | 2 | Smoke/hypercare/rollback/freeze | PENDIENTE | `PRODUCTION_FROZEN_PASS_100` |

Total I5 = 15 puntos. Score actual 90/100.

## 5. I5-R2 — cerrado

R2 eliminó estados competidores sin tocar producto frozen:

- CAMBIOS/RESUMEN/PENDIENTES sincronizados;
- PREPROD/Project Creator marcado `SUPERSEDED`;
- `cxorbia-consumed-one-shot-gates.json` impide reactivar IDs consumidos;
- `cxorbia-evidence-aliases.json` evita reruns por nomenclatura;
- continuidad valida también documentos raíz y controles nuevos;
- promoción mantiene cutover separado de business/data writes;
- evidencia productiva usa referencias directas, no clases M indefinidas.

## 6. I5-R3 — bloque activo

Sobre exactamente el source `f9802f...` ya materializado, demostrar o reutilizar evidencia terminal suficiente para:

- `ROADMAP_LIVE_NO_CLONES`: HR/hoja de ruta viva, sin clonación ni fallback silencioso.
- `SHOPPERS_VISIBLE_EXPECTED_SCOPE`: shoppers históricos/reales visibles según rol/proyecto.
- `VISITS_CURRENT_AND_HISTORY_VISIBLE`: visitas actuales e históricas visibles y coherentes.
- `FINANCE_CANONICAL_SEMANTICS`: mayo 44/44 pagadas; junio 2/44 pagadas + 42 pendientes + Q451; `liquidada != pagada`.
- `MULTIROLE_SCOPE_PASS`: Admin/Staff/Shopper/Cliente según scope real autorizado.
- `RELOAD_SESSION_PASS`: reload/nueva sesión no cambia fuente, identidad ni alcance.
- `NO_DEMO_OR_STALE_FALLBACK`.
- `SAME_ARTIFACT_PASS`.

Solo una brecha terminal real abre corrección focalizada. No se reabre I1–I4 por defecto.

## 7. I5-R4 — auditoría definitiva

Después de R3, auditar todas las causas remediadas. Único PASS aceptable: `ROOT_CAUSE_CLOSED_PASS`, exigiendo RC01–RC11 cerradas/no aplicables con evidencia, cero P0 abierto, misma build, rollback listo y control-plane coherente. Si falla, corregir solo la causa concreta y repetir R4; no crear plan nuevo.

## 8. I5-G1 — producción

Solo después de `ROOT_CAUSE_CLOSED_PASS` se consume autorización explícita de cutover. Mismo artefacto, no rebuild, rollback preparado, legacy intacto hasta confirmar PASS. **La autorización de cutover/deploy no autoriza business/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes.**

Al ejecutarse: 98/100.

## 9. I5-G2 — post-producción inmediata

Smoke/hypercare sobre producción real: login/roles, HR viva, shoppers, visitas, Finanzas, reload/nueva sesión, cross-tenant/scope, no fallback demo/stale, sincronización HR/plataforma sin duplicados/overwrites silenciosos y errores/métricas runtime. P0 → rollback inmediato + corrección focalizada. `PRODUCTION_FROZEN_PASS_100` cierra Phase A.

## 10. Conteo comprometido

- R1–R4: cuatro iteraciones totales para cerrar/auditar causas raíz; R1 y R2 ya PASS.
- G1: quinta iteración total para producción efectiva.
- G2: sexta para cierre estable 100/100.

No se agregan iteraciones por conversación nueva, explicación, reauditoría general o nomenclatura distinta. Solo un P0 reproducible o dependencia externa real puede agregar un bloque focalizado dentro de este mismo plan.

## 11. Seguridad y circuit breaker

Prohibido: nueva candidata/rama/PR/workflow; nuevo PREPROD; Project Creator por ruta descartada; reabrir I1–I4 sin P0; rebuild; cutover antes de R4 PASS; producción sin autorización explícita; fallback demo/stale; overwrite silencioso HR/plataforma; afirmar PASS sin evidencia terminal.
