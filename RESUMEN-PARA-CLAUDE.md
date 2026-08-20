# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4-PROTECTED-RUNTIME-CLOSED-38`

## Estado único vigente

`I4_CLOSED_PASS__I5_PREPRODUCTION_AND_GO_LIVE` — **85% formal / 15% pendiente**. I1–I4 están congelados. No generar nueva candidata, no reauditar y no reconstruir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas o Academia.

## Producto funcional congelado

El source de producto que cerró I4 es exactamente `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

- Hosting DEV same-build: run `32328316954`, artifact `9392151808`, exact remote parity PASS.
- Staff/Admin provider-backed read-only: run `32329139725`, artifact `9392431939`, `PASS_READONLY_POST_GATES` y runtime Staff/Admin PASS.
- Shopper real: reutilizar `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`; no reejecutar ni resetear por defecto.
- Finanzas: Mayo 44/44; Junio 2/44, 42 pendientes, Q451; `liquidada != pagada`.
- Multi-proyecto/no-code: PASS protegido; Cinépolis sigue configurable por `tenantId + projectId`.

Los commits posteriores a `f9802f...` hasta `8831723a...` solo cerraron requests/gates y no tocaron `app/`; los commits posteriores de este epoch son documentación. No existe motivo para rehacer módulos.

## Qué debe preservar Claude/prototipo

- `app/index-backend-dev.html` es el carril humano real: Auth → claims/membership → identidad exacta → perfil protegido → HR viva → overlays → `CX.data` → módulos.
- `app/index.html` y source-safe sirven como artefactos/diagnóstico, no sustituyen prueba provider-backed.
- Exact identity/crosswalk; `fuzzyMatching=false`; conflictos a revisión.
- HR/plataforma conservan semántica y trazabilidad: una asignación HR no se inventa como postulación.
- Acciones mutables pasan por command/provider ACK; preview/read-only no equivale a ejecución.
- Finanzas mantienen estados honestos; liquidación no confirma pago.
- Requests one-shot ya consumidos no deben aparecer como pendientes operativos.

## Frontend

I4 no produjo una tarea frontend nueva. Solo PREPROD/UAT puede abrir un ajuste si existe diferencia visible reproducible y localizada que no provenga de datos/Auth/runtime.

La brecha histórica PDF/XLSX/PPTX de `modules/cliente-extra.js` continúa separada; no fue causa de I4 y no debe bloquearse o corregirse por asociación sin clasificación de alcance.

## Academia

No reconstruir. La alineación de I4 está en `app/docs/ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`: autoridad runtime única, identidad exacta, HR/plataforma, pagos honestos y command/provider ACK. En I5 actualizar/publicar solo si PREPROD/UAT demuestra diferencia real.

## Frontera actual

`I5_1_PREPRODUCTION_READINESS_AND_UAT_PLAN_READONLY`.

Claude no debe iniciar cambios de producto por esta etapa. Backend prepara regresión, seguridad, scopes, rollback y UAT; PREPROD/PRODUCCIÓN requieren autorización específica.
