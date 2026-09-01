# CAMBIOS BACKEND — Corte 6 · HR viva + identidad operativa shopper DEV PASS

**Fecha:** 2026-07-31  
**Estado:** `C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## Autorización consumida
Paula autorizó expresamente un único redeploy del Cloud Run DEV existente `cxorbia-live-hr-dev` y un único redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`, manteniendo la HR con lectura abierta y sin Firestore/HR/Auth/Rules writes, Storage, Make/Gemini, pagos, nuevo proyecto/Hosting, merge ni producción.

Request: `c6-live-hr-shopper-display-dev-redeploy-20260731-01`.

La autorización quedó `consumed_pass` después de exactamente:
- Cloud Run DEV deploy executions: `1`;
- Hosting DEV deploy executions: `1`.

No reutilizar esta autorización.

## Resultado remoto
Decisión: `PASS_C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV`.

Cloud Run:
- servicio: `cxorbia-live-hr-dev`;
- región: `us-central1`;
- revisión: `cxorbia-live-hr-dev-00008-8mf`.

Hosting DEV:
- release: `sites/cxorbia-backend-dev/releases/1785467713768000`;
- version: `sites/cxorbia-backend-dev/versions/22e81c2b783f697a`.

Smoke remoto:
- períodos: `14`;
- visitas: `616`;
- último período HR: `2026-07`;
- auto-discovery mensual: `true`;
- registry mode: `live_provider_metadata_auto_refresh`;
- identidades operativas shopper disponibles para DEV: `208`;
- prompt de credenciales humanas: `false`.

## Solución de raíz
### 1. Meses automáticos
El runtime ya no depende del inventario mensual estático. Antes de cada reconstrucción fresca:
- consulta metadata real de Google Sheets;
- reconstruye el registry de pestañas mensuales;
- filtra cualquier pestaña fantasma del fallback GViz;
- una pestaña mensual futura válida entra sin configuración por chat.

En Cloud Run, la metadata se obtiene con el runtime service account mediante ADC; no se guarda una llave privada en el contenedor.

### 2. Shopper visible sin reintroducir el P0 de credenciales
La validación humana DEV conserva el acceso automático aprobado. No se activa el flujo de Usuario/Contraseña.

La HR viva proyecta únicamente identidad operativa mínima `display_name_only`:
- nombre operativo shopper;
- shopperId estable;
- país y métricas ya source-safe.

Siguen excluidos:
- teléfono/WhatsApp;
- correo;
- DPI/ID;
- banco/cuenta;
- credenciales;
- observaciones privadas y workbook crudo.

El endpoint source-safe por defecto continúa enmascarando nombres; la vista operacional mínima se habilita únicamente en la ruta DEV de validación.

### 3. Aplicación en memoria
`index-backend-dev.html` consume HR viva mediante:
- `app/adapters/tya-live-source-inplace-apply.js`;
- `app/adapters/tya-live-source-refresh-watch.js`.

Se conserva la interfaz `CX.data` y no se modifican módulos UI.

## Archivos creados/modificados
### Reusable CXOrbia
- `tools/hr-source/tya-live-provider-registry-identity-dev.mjs` — metadata provider + registry mensual + overlay display-name-only.
- `backend/runtime/hr-live-service/server.mjs` — auto-month por provider metadata y vista operacional DEV mínima.
- `tools/hr-source/tya-enforce-live-tab-registry.mjs` — acepta registry provider refrescado por ADC y mantiene fail-closed.
- `app/adapters/tya-live-source-inplace-apply.js` — conserva nombre operativo y métricas reales sin PII sensible.
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-predeploy.yml` — gate de auto-month/identity.
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml` — state machine one-shot y evidencia de ejecución.

### Claude/prototipo
- `app/index-backend-dev.html` — únicamente empalme DEV a HR viva; no cambio de diseño ni módulo.
- `app/modules/**`: sin cambios.

### Exclusivo TyA
- provider ID HR Cinépolis;
- servicio/Hosting DEV actuales;
- token de intención DEV para vista operacional mínima.

### Academia
Patrón reusable: fuente viva + auto-discovery mensual + vista humana operacional mínima separada de PII sensible + estado one-shot de infraestructura.

## Seguridad/estado
- HR abierta: preservada.
- Firestore writes: `0`.
- HR writes: `0`.
- Auth writes: `0`.
- Rules writes/deploy: `0`.
- Storage writes: `0`.
- Make/Gemini: `0`.
- pagos: `0`.
- proyectos/Hosting nuevos: `0`.
- merge: `false`.
- producción: `false`.
- datos sensibles shopper expuestos: `false`.

## Siguiente gate exacto
`HUMAN VISUAL ADMIN: NOMBRES SHOPPER + SHOPPER ROLE PICKER/MÓDULOS → FREEZE CORTE 6 SI PASS → FUENTE EXACTA AGOSTO PLATFORM-ORIGIN → DELTA-ONLY AUTORIZADO → PREPROD/CUTOVER`.

No repetir histórico R17N 1,406 ni Auth91/91.
