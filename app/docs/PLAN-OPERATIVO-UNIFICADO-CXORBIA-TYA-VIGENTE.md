# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R4-ROOT-CAUSE-CLOSED-PASS-46`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Iteración activa / currentIteration:** `I5-G1`  
**Score formal:** `95/100`  
**Producción autorizada:** `NO`

## 1. Regla de continuidad

Este es el plan formal único hacia producción. No se reconstruye desde una conversación ni se sustituye por un roadmap nuevo ante bloqueos intermedios o cortes de sesión.

El estado machine-readable vive en `backend/config/cxorbia-phase-a-continuity-lock.json`. Toda conversación nueva toma la acción exclusivamente de `currentIteration`. El recibo terminal `backend/config/cxorbia-r4-root-cause-closure.json` preserva `ROOT_CAUSE_CLOSED_PASS` aunque una conversación no alcance a responder.

PR #7 es mirror no autoritativo. Si un mirror queda stale: `CONTINUITY_DRIFT_BLOCKED`, reconciliar control-plane/metadata y continuar; nunca reejecutar un bloque cerrado ni revivir un request consumido.

I1–I4 permanecen `PASS/FROZEN` sobre `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. I5-R1, R2, R3 y R4 están cerrados. Solo un `P0_PROVEN` nuevo y reproducible permite reabrir producto o una iteración de causa raíz.

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
11. RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT` — **PASS R4**.
12. RC12 `POST_PRODUCTION_OBSERVABILITY_AND_SYNC_REGRESSION_RISK` — pendiente G2.

RC01–RC11 están cerradas antes de G1.

## 4. Plan cerrado de seis iteraciones

| Iteración | Peso | Objetivo | Estado | Salida obligatoria |
|---|---:|---|---|---|
| `I5-R1` | 2 | Persistencia del plan y validadores fail-closed | **PASS** | `CANONICAL_CONTINUITY_AND_VALIDATOR_LOCK_PASS` |
| `I5-R2` | 3 | Cierre deriva documental/control-plane | **PASS** | `CONTINUITY_DRIFT_AUDIT_PASS` |
| `I5-R3` | 3 | Aceptación crítica del producto exacto | **PASS** | `CRITICAL_PRODUCT_ACCEPTANCE_PASS` |
| `I5-R4` | 2 | Auditoría independiente post-remediación | **PASS** | `ROOT_CAUSE_CLOSED_PASS` |
| `I5-G1` | 3 | Autorización explícita + cutover mismo artefacto | **PENDIENTE AUTORIZACIÓN** | `PRODUCTION_CUTOVER_EXECUTED` |
| `I5-G2` | 2 | Smoke/hypercare/rollback/freeze | PENDIENTE | `PRODUCTION_FROZEN_PASS_100` |

Total I5 = 15 puntos. Score actual 95/100.

## 5. R1/R2 — cerrados

R1 persiste el plan y los validadores. R2 eliminó estados competidores sin tocar producto frozen:

- documentos raíz reconciliados;
- PREPROD/Project Creator `SUPERSEDED`;
- ledger one-shot impide reactivar IDs consumidos;
- aliases evitan reruns por nomenclatura;
- continuidad fail-closed;
- cutover separado de business/data writes.

## 6. R3 — cerrado `CRITICAL_PRODUCT_ACCEPTANCE_PASS`

Matriz terminal: `backend/config/cxorbia-r3-critical-product-acceptance.json`.

PASS sobre el source `f9802f...`:

- HR viva sin clones/fallback demo/stale;
- shoppers y visitas visibles según scope;
- Finanzas canónicas;
- multirol/RBAC;
- reload/nueva sesión;
- same artifact/no rebuild.

Evidencia: Staff/Admin run `32342457328` / artifact `9396828201`; Shopper exacto congelado; Client run `32400495121` / artifact `9418300899`; all-role PASS; mayo 44/44, junio 2/44 +42 +Q451; Hosting same-build run `32328316954` / artifact `9392151808`.

Los HOLD R3 fueron harness stale con `productP0Proven=false`; están consumidos y no autorizan rerun.

## 7. R4 — cerrado `ROOT_CAUSE_CLOSED_PASS`

Recibo terminal: `backend/config/cxorbia-r4-root-cause-closure.json`.

R4 auditó post-remediación sin reejecución indiscriminada:

1. RC01–RC10 siguen PASS.
2. RC11 cerró PASS.
3. `f9802f...` sigue siendo el artefacto a promover.
4. compare source→HEAD pre-cierre: 131 commits, 0 runtime product drift en scopes protegidos.
5. GitHub Actions run `32403468692`, job `96536915288`: `GO_CANONICAL_CONTINUITY_LOCKED_RUNTIME_UNCHANGED`, `CONTINUITY_LOCK_PASS`, runtime drift 0.
6. rollback permanece ready/revalidado antes de cutover.
7. gates técnicos de promoción 5/5 PASS.
8. cero P0 nuevo.
9. autorización explícita de cutover permanece PENDING.
10. business/data writes permanecen no autorizados.

## 8. G1 — producción, PENDING AUTHORIZATION

Solo después de `ROOT_CAUSE_CLOSED_PASS` se puede consumir autorización explícita de cutover. Ese es el estado actual.

Una autorización G1 permite únicamente:

- promoción/cutover del mismo artefacto `f9802f...`;
- topología `PROMOTE_EXISTING_CLEAN_PROJECT`;
- rollback preparado;
- sin rebuild.

No autoriza merge ni business/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes. Esos gates permanecen separados.

Al ejecutarse: 98/100.

## 9. G2 — post-producción inmediata

Smoke/hypercare sobre producción real: login/roles, HR viva, shoppers, visitas, Finanzas, reload/nueva sesión, cross-tenant/scope, no fallback demo/stale, sincronización HR/plataforma sin duplicados/overwrites silenciosos y errores/métricas runtime. P0 → rollback inmediato + corrección focalizada. `PRODUCTION_FROZEN_PASS_100` cierra Phase A.

## 10. Protección definitiva contra pausas/bucles

- Evidencia terminal se persiste antes del handoff conversacional.
- Una conversación interrumpida no invalida el último PASS.
- PR body y documentos secundarios son mirrors, no autoridad del siguiente paso.
- HEAD se resuelve dinámicamente.
- Consumed request ledger es inmutable.
- Aliases no crean trabajo nuevo.
- Si la documentación queda parcialmente sincronizada, la siguiente sesión termina la reconciliación y no repite la iteración.
- Una conversación nueva, explicación o nomenclatura distinta no crea una iteración adicional.

## 11. Conteo comprometido

- R1–R4 PASS = **95/100**.
- G1 = producción efectiva = 98/100, solo con autorización explícita.
- G2 = cierre estable = 100/100.

## 12. Seguridad y circuit breaker

Prohibido: nueva candidata/rama/PR/workflow; nuevo PREPROD; Project Creator por ruta descartada; reabrir I1–I4/R1–R4 sin P0; rebuild; producción sin autorización explícita; fallback demo/stale; overwrite silencioso HR/plataforma; afirmar PASS sin evidencia terminal.

Epoch anterior: `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`, `currentIteration=I5-R4`.
