# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R3`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado único vigente

`I5_R2_PASS__I5_R3_ACTIVE__90_10`. I1–I4 permanecen `PASS/FROZEN`; I5-R1 e I5-R2 están cerrados. El siguiente bloque único es `I5-R3_CRITICAL_PRODUCT_ACCEPTANCE_RECONCILIATION`.

No generar nueva candidata, rama, PR o metodología. No reconstruir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas, certificaciones o Academia por defecto.

## Producto funcional congelado

Source funcional exacto: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

- Hosting same-build: run `32328316954`, artifact `9392151808`, remote parity PASS.
- Staff/Admin provider-backed: run `32329139725`, artifact `9392431939`, runtime PASS.
- Read-only live authority más reciente: request `i5-existing-project-precutover-staff-live-authority-readonly-20260820-01`, run `32342457328`, artifact `9396828201`, 15 periodos, 660 visitas, 200 shoppers, reload/new-tab estable.
- Shopper histórico: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`; no reejecutar/resetear sin P0 nuevo.
- Finanzas: mayo 44/44 pagadas; junio 2/44 pagadas + 42 pendientes + Q451; `liquidada != pagada`.

## Cambio de control-plane cerrado en R2

La ruta PREPROD/Project Creator quedó definitivamente superseded. La topología canónica es `PROMOTE_EXISTING_CLEAN_PROJECT` sobre `cxorbia-backend-dev`.

Se agregaron controles persistentes para que una nueva conversación no reactive trabajo muerto:

- `backend/config/cxorbia-phase-a-continuity-lock.json`;
- `backend/config/cxorbia-consumed-one-shot-gates.json`;
- `backend/config/cxorbia-evidence-aliases.json`;
- `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`;
- `tools/production/validate-production-promotion-gates.js`.

El cutover no autoriza business/data writes. Deploy/cutover y data/provider writes permanecen gates separados.

## Frontend / Claude — siguiente criterio

R3 **no autoriza un rediseño ni cambios preventivos**. Debe demostrar en el producto exacto:

- HR/hoja de ruta viva sin clones ni fallback demo/stale;
- shoppers visibles según scope;
- visitas actuales e históricas visibles;
- Finanzas con semántica canónica;
- multirol/RBAC;
- reload/nueva sesión;
- same-artifact/no-rebuild.

Si R3 demuestra un P0 frontend reproducible, documentar por archivo/módulo para Claude y corregir solo ese hallazgo bajo la regla vigente. No tocar `/app/modules` o `/app/core` por asociación.

Hallazgo histórico no bloqueante preservado: `modules/cliente-extra.js` / exports PDF-XLSX-PPTX sigue separado y solo se reabre si evidencia de aceptación demuestra impacto Phase A.

## Academia

Sin reconstrucción en R2. R3 debe registrar impacto solo si el comportamiento real observado cambia manuales, cursos, rutas por rol o notificaciones. HR viva, estados financieros honestos y permisos reales siguen siendo la fuente para Academia.

## Seguridad

0 deploy productivo, 0 merge, 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes. Producción no autorizada. `tya-plataforma` permanece intacto.

## Historial superseded

El blocker `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` y el target `cxorbia-preprod-20260819` pertenecen al epoch histórico `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`. Se conservan como evidencia, **no como pendiente ni siguiente acción**.
