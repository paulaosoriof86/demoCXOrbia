# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R3`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado

**Score formal: 90% / 10% pendiente.** I1–I4 `PASS/FROZEN`; I5-R1 e I5-R2 PASS. Producción no está autorizada. El pendiente activo único del plan es `I5-R3_CRITICAL_PRODUCT_ACCEPTANCE_RECONCILIATION`.

## No reabrir

No nueva candidata, rama, PR, workflow o metodología. No reconstruir Auth, Shopper, Finance, multi-proyecto/no-code, documentos, reservas, certificaciones o Academia. Solo un `P0_PROVEN` nuevo y reproducible puede abrir una corrección focalizada.

## I5-R3 — pendientes obligatorios

Sobre exactamente `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, demostrar/reconciliar evidencia terminal de:

1. `ROADMAP_LIVE_NO_CLONES` — HR/hoja de ruta viva; sin clon, demo o stale fallback silencioso.
2. `SHOPPERS_VISIBLE_EXPECTED_SCOPE` — shoppers históricos/reales visibles según tenant/proyecto/rol.
3. `VISITS_CURRENT_AND_HISTORY_VISIBLE` — visitas actuales e históricas coherentes.
4. `FINANCE_CANONICAL_SEMANTICS` — mayo 44/44 pagadas; junio 2/44 pagadas + 42 pendientes + Q451; `liquidada != pagada`.
5. `MULTIROLE_SCOPE_PASS` — Admin/Staff/Shopper/Cliente según scope autorizado.
6. `RELOAD_SESSION_PASS` — reload/nueva sesión no cambia autoridad, identidad ni alcance.
7. `NO_DEMO_OR_STALE_FALLBACK`.
8. `SAME_ARTIFACT_PASS` — sin rebuild.

Salida obligatoria: `CRITICAL_PRODUCT_ACCEPTANCE_PASS` o un P0 concreto con evidencia reproducible y corrección focalizada. No auditoría general nueva.

## Controles anti-bucle ya cerrados

- Continuity lock machine-readable.
- Ledger de requests one-shot consumidos.
- Alias registry para evidencia histórica.
- Validador de continuidad que incluye CAMBIOS/RESUMEN/PENDIENTES.
- Ruta PREPROD/Project Creator marcada `SUPERSEDED`.
- Cutover separado de business/data writes.

## Pendientes posteriores bounded

- I5-R4: auditoría final post-remediación → `ROOT_CAUSE_CLOSED_PASS` → 95%.
- I5-G1: autorización explícita + cutover mismo artefacto → 98%.
- I5-G2: smoke/hypercare/rollback/freeze → 100%.

## Frontend separado

`modules/cliente-extra.js` / exports PDF-XLSX-PPTX sigue como hallazgo histórico separado; no es P0 activo. Cualquier hallazgo nuevo de R3 se documenta por archivo/módulo para Claude; backend no parchea UI.

## Academia

Sin pendiente de reconstrucción. Solo actualizar si R3 demuestra cambio real que afecte manuales, cursos, rutas por rol o notificaciones.

## Seguridad

0 deploy productivo, 0 merge, 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes. Legacy intacto. Producción no autorizada.

## Historial superseded

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` y `cxorbia-preprod-20260819` son evidencia histórica del epoch `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`; **no son pendientes activos y no deben reemitirse**.
