# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-R4-ROOT-CAUSE-CLOSED-PASS-46`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G1`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado

**Score formal: 95% / 5% pendiente.** I1–I4 `PASS/FROZEN`; I5-R1, R2, R3 y R4 PASS. Producción/cutover todavía no están autorizados. El siguiente bloque único es `I5-G1_EXPLICIT_CUTOVER_AND_PRODUCTION_PROMOTION`, pendiente de autorización explícita de Paula.

## No reabrir

No nueva candidata, rama, PR, workflow o metodología. No reconstruir Auth, Shopper, Finance, multi-proyecto/no-code, documentos, reservas, certificaciones o Academia. Solo un `P0_PROVEN` nuevo y reproducible puede abrir una corrección focalizada o reabrir R1–R4.

Una conversación interrumpida, respuesta no visible, PR body stale, diferencia de nombre de evidencia o timeout no son P0 y no autorizan rerun.

## I5-R4 — CERRADO

`ROOT_CAUSE_CLOSED_PASS` persistido en `backend/config/cxorbia-r4-root-cause-closure.json`.

Criterios terminales:

1. RC01–RC10 siguen PASS.
2. RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT` = PASS.
3. Source `f9802f...` preservado sin rebuild.
4. Compare source→HEAD pre-cierre: 131 commits, 0 runtime product drift en scopes protegidos.
5. GitHub Actions run `32403468692`, job `96536915288`: `GO_CANONICAL_CONTINUITY_LOCKED_RUNTIME_UNCHANGED` + `CONTINUITY_LOCK_PASS` + `runtimeChangedCount=0`.
6. Rollback ready/revalidado.
7. 5/5 gates técnicos de promoción PASS.
8. Cero `P0_PROVEN` nuevo.
9. `EXPLICIT_CUTOVER_AUTHORIZATION=PENDING`.
10. business/data/provider writes no autorizados.

## Protección anti-pausa / anti-bucle

- `backend/config/cxorbia-phase-a-continuity-lock.json` es autoridad única de `currentIteration`.
- `backend/config/cxorbia-r4-root-cause-closure.json` hace durable el PASS terminal antes del handoff conversacional.
- PR #7 es mirror no autoritativo y su HEAD se resuelve dinámicamente.
- consumed one-shot requests son inmutables y no se resetean por cambio de conversación.
- aliases no crean trabajo nuevo.
- si una superficie queda atrasada: `CONTINUITY_DRIFT_BLOCKED` → reconciliar control-plane/PR mirror únicamente; no repetir iteraciones ni pruebas congeladas.

## I5-R3 — CERRADO Y CONGELADO

`CRITICAL_PRODUCT_ACCEPTANCE_PASS` permanece reusable:

- `ROADMAP_LIVE_NO_CLONES` PASS;
- `SHOPPERS_VISIBLE_EXPECTED_SCOPE` PASS;
- `VISITS_CURRENT_AND_HISTORY_VISIBLE` PASS;
- `FINANCE_CANONICAL_SEMANTICS` PASS;
- `MULTIROLE_SCOPE_PASS` PASS;
- `RELOAD_SESSION_PASS` PASS;
- `NO_DEMO_OR_STALE_FALLBACK` PASS;
- `SAME_ARTIFACT_PASS` PASS.

No rerun de Shopper histórico ni de requests R3 consumidos sin P0 nuevo.

## Pendiente activo único — I5-G1

Requiere autorización explícita posterior a R4 PASS.

Si Paula autoriza, el alcance permitido es únicamente:

- promoción/cutover del mismo artefacto `f9802f...`;
- strategy `PROMOTE_EXISTING_CLEAN_PROJECT`;
- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev` / site `cxorbia-backend-dev`;
- Cloud Run `cxorbia-live-hr-dev`, `us-central1`;
- rollback preparado;
- no rebuild.

No queda autorizado por G1: merge, business/data/HR/Auth/Firestore/Rules/Storage/Make/Gemini/payment writes.

Salida: `PRODUCTION_CUTOVER_EXECUTED` → 98/100.

## Pendiente posterior bounded

`I5-G2` — smoke/hypercare/rollback/freeze → `PRODUCTION_FROZEN_PASS_100` → 100/100.

## Frontend separado

No existe P0 frontend activo al cierre R4. `modules/cliente-extra.js` / exports PDF-XLSX-PPTX sigue como hallazgo histórico separado y no bloqueante. Backend no parchea UI por asociación.

## Academia

Sin pendiente de reconstrucción por R4. Solo actualizar si G1/G2 demuestra un cambio funcional real que afecte manuales, cursos, rutas por rol o notificaciones.

## Seguridad

R4 cerró con 0 deploy productivo, 0 merge, 0 cutover y 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes. Legacy intacto.

## Historial superseded

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` y `cxorbia-preprod-20260819` son evidencia histórica; no son pendientes activos y no deben reemitirse.

Epoch anterior: `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`, `currentIteration=I5-R4`.
