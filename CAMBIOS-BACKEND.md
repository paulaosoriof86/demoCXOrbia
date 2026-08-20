# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## 2026-08-20 — I5-G2 · LIVE-IN-PLATFORM ACCEPTANCE LOCK

### Estado preservado
G1 permanece `PRODUCTION_CUTOVER_EXECUTED`; avance 98/100; producción `https://cxorbia-backend-dev.web.app`; source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; sin rebuild, redeploy, merge ni business/data writes.

### Cambio de control-plane
Se incorporó dentro del G2 existente, sin crear G3:
- G2-A `PRODUCTION_REMOTE_MULTIROLE_READONLY_SMOKE`;
- G2-B `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`.

G2-B es requisito de cierre: pruebas integrales con datos ficticios dentro de la misma plataforma productiva, visibles para Paula, con prefijo `CXORBIA_E2E_SYNTH_`, cleanup y post-clean readback. Cobertura: hoja de ruta/navegación, Admin, Shopper, Cliente, perfiles/histórico/certificaciones, HR viva/histórica, visitas, cuestionarios/evidencias, Finanzas sin pago real, reload/new-tab, scopes/cross-tenant, sincronización HR↔plataforma y observabilidad.

### Límite de autorización
El mensaje que pidió incorporar estas pruebas al plan **no autoriza sus writes**. Business/data writes, HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild y merge continúan en 0/no autorizados. G2-B queda `PENDING_NARROW_WRITE_AUTHORIZATION`.

### Validador
`tools/qa/verify-phase-a-live-execution-checkpoint.mjs` deja de fijar el epoch/85-15/preproducción del 19 de agosto y pasa a validar el continuity lock vivo y el estado G2 actual. Esto corrige deuda de harness, no producto.

### Archivos
- actualizado `backend/config/cxorbia-phase-a-continuity-lock.json`;
- creado `backend/config/cxorbia-g2-live-in-platform-acceptance-plan.json`;
- sincronizados índice, checkpoint y plan operativo;
- actualizado `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`;
- sincronizados `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`;
- creado `app/docs/ACADEMIA-ADDENDUM-I5-G2-LIVE-IN-PLATFORM-ACCEPTANCE-20260820.md`.

### Clasificación
- **Reusable CXOrbia:** patrón de aceptación sintética in-platform con tagging, cleanup y readback.
- **Exclusivo TyA:** cobertura HR/visitas/finanzas/roles de TyA.
- **Claude/prototipo:** sin cambios de UI/runtime; observaciones futuras se documentarán por módulo si aparecen.
- **Academia:** pruebas reales de rutas/roles pueden ajustar manuales solo si revelan una diferencia funcional.
- **Sin impacto Claude:** control-plane y validador.
