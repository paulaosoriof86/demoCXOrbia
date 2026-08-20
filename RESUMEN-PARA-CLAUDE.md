# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R4`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado único vigente

`I5_R3_PASS__I5_R4_ACTIVE__93_7`. I1–I4 permanecen `PASS/FROZEN`; I5-R1, I5-R2 e I5-R3 están cerrados. El siguiente bloque único es `I5-R4_INDEPENDENT_ROOT_CAUSE_CLOSURE_AUDIT`.

No generar nueva candidata, rama, PR o metodología. No reconstruir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas, certificaciones o Academia por defecto.

## Producto funcional congelado

Source funcional exacto: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

- Hosting same-build: run `32328316954`, artifact `9392151808`, remote parity PASS.
- Staff/Admin actual: run `32342457328`, artifact `9396828201`, 15 periodos, 660 visitas, 200 shoppers, latest `2026-08`, reload/new-tab estable, `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.
- Shopper histórico: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`; exact identity/profile/membership/crosswalk/historyE2E; no reejecutar/resetear sin P0 nuevo.
- Cliente actual: run `32400495121`, artifact `9418300899`, `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`; login único canónico, tenant `tya`, proyecto `cinepolis`, HR authority aplicada, `cli_dashboard` sin excepción.
- Multirol: `PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES` reutilizado y reforzado con Staff/Cliente actuales.
- Finanzas: mayo 44/44 pagadas; junio 2/44 pagadas + 42 pendientes + Q451; `conciliada_pendiente_pago != pagada`.
- Same artifact: comparación del source lock al head de reconciliación sin cambios runtime de producto; solo docs/control/QA/workflows.

Matriz terminal: `backend/config/cxorbia-r3-critical-product-acceptance.json`.

## I5-R3 cerrado

Los ocho criterios críticos están PASS:

- `ROADMAP_LIVE_NO_CLONES`;
- `SHOPPERS_VISIBLE_EXPECTED_SCOPE`;
- `VISITS_CURRENT_AND_HISTORY_VISIBLE`;
- `FINANCE_CANONICAL_SEMANTICS`;
- `MULTIROLE_SCOPE_PASS`;
- `RELOAD_SESSION_PASS`;
- `NO_DEMO_OR_STALE_FALLBACK`;
- `SAME_ARTIFACT_PASS`.

RC07–RC10 pasan a PASS. No se demostró P0 de producto.

Los HOLD previos de R3 fueron deuda del harness, no del frontend/producto:

- stale Shopper credential en multirole, `productP0Proven=false`;
- selector obsoleto `#cxIntegratedAuthStep` en Client diagnostic, `productP0Proven=false`.

El segundo se corrigió **solo en QA** (`tools/qa/tya-c6-client-route-wait-diagnostic.mjs`) para usar `#loginForm/#lgUser/#lgPass/#lgSubmit`, y Client pasó. No se modificó `/app/modules`, `/app/core`, `/app/adapters` ni `/app/data` por ese hallazgo.

## Frontend / Claude — R4

R4 **no autoriza rediseño ni cambios preventivos**. Es auditoría de cierre de causas raíz y same-artifact/rollback. Claude solo recibe un nuevo ajuste frontend si R4 demuestra un `P0_PROVEN` reproducible por archivo/módulo.

No existe P0 frontend activo al cierre R3.

Hallazgo histórico no bloqueante preservado: `modules/cliente-extra.js` / exports PDF-XLSX-PPTX; solo reabrir si evidencia posterior demuestra impacto Phase A.

## Academia

R3 no cambió rutas funcionales, estados, manuales ni contenido de cursos; por tanto no requiere reconstrucción de Academia. Sí quedan reafirmadas como verdad futura:

- HR viva como autoridad operacional;
- roles/scopes reales Staff, Shopper y Cliente;
- historia completa de visitas/shoppers;
- semántica financiera honesta: liquidación no equivale a pago.

## Siguiente bloque exacto

`I5-R4_INDEPENDENT_ROOT_CAUSE_CLOSURE_AUDIT` debe auditar RC01–RC10, cerrar RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT`, validar rollback/control-plane/validators y confirmar cero P0 nuevo.

Salida requerida: `ROOT_CAUSE_CLOSED_PASS` → 95/100. Solo después puede pedirse autorización explícita de cutover G1.

## Seguridad

0 deploy productivo, 0 merge, 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes en R3. Producción no autorizada. `tya-plataforma` permanece intacto. Cutover y business/data writes son gates separados.

## Historial superseded

El blocker `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` y el target `cxorbia-preprod-20260819` pertenecen al epoch histórico `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`. Se conservan como evidencia, **no como pendiente ni siguiente acción**.

Epoch anterior inmediato: `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`, `currentIteration=I5-R3`.
