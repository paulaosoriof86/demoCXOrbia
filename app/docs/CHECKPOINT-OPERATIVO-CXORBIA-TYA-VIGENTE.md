# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_LIVE_HR_DEV_DEPLOY_PASS_PENDING_LIVE_CHANGE_AND_VISUAL`

## Estado comprobado

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V161C/R21.
- V164 y Corte 1A están integrados.
- Cloud Run DEV read-only y Hosting DEV ya fueron desplegados.
- El smoke directo y el smoke same-origin pasaron.
- Corte 1 todavía no se congela.
- Corte 2 continúa bloqueado.

## Modelo operativo vigente

- Cada proyecto tiene su propia hoja de ruta.
- Los cambios manuales en HR deben reflejarse en CXOrbia.
- Escrituras futuras plataforma→HR requieren gate separado.
- El cuestionario es configurable por proyecto o visita: CXOrbia, TyAOnline, plataforma externa, enlace general o enlace individual.
- TyAOnline es un posible proveedor de cuestionarios, no el sincronizador general de HR.

## Corte 1A integrado

- Contrato de lectura HR runtime source-safe.
- Servicio server-side read-only.
- Adapter y watcher de actualización.
- Binding R22 con endpoint live same-origin.
- Gates de lectura y predeploy.

Evidencia previa:

- `cxorbia/live-hr-read-probe`: SUCCESS.
- `cxorbia/live-hr-runtime-predeploy`: SUCCESS.

## Despliegue final

Run `29787549700`, job `88515846949`:

- checkout y autorización: PASS;
- autenticación DEV: PASS;
- lectura HR viva y gates: PASS;
- build de imagen: PASS;
- Cloud Run DEV: PASS;
- smoke directo: PASS;
- build exacto same-origin: PASS;
- Hosting DEV: PASS;
- smoke same-origin: PASS;
- decisión: `PASS_LIVE_HR_RUNTIME_DEV_DEPLOY`.

Source HEAD desplegado: `15c6e909c5f7002e566474726cc04c5c4f6cafe0`.

La lectura comprobada en Hosting reportó revisión `9bb38bf469651e3cbf572b9b19fbe7d5360f3d1ea424e20f1ff5eac874746ce1`, 14 periodos y 616 visitas. Estos conteos son evidencia de esa lectura exacta, no valores permanentes.

## Corrección focalizada aplicada

El primer smoke same-origin falló porque Hosting enviaba `/api/tya/cinepolis/hr-live` y el servicio solo aceptaba la ruta interna `/v1/tenants/tya/projects/cinepolis/hr-live`.

Se corrigió `backend/runtime/hr-live-service/server.mjs` para aceptar ambas rutas sobre el mismo handler y revisión canónica.

Commit: `15c6e909c5f7002e566474726cc04c5c4f6cafe0`.

No se tocaron `app/modules/**` ni `app/core/**`.

## Confirmado

- V164 y Corte 1A empalmados.
- HR actual leída server-side en runtime source-safe.
- Cloud Run DEV y Hosting DEV desplegados.
- Endpoint live same-origin operativo.
- Smoke remoto completo aprobado.
- Sin producción, imports, pagos ni escrituras.

## Pendiente real

- Probar un cambio posterior real en HR y comprobar nueva revisión.
- Verificar KPI, modal, histórico y reportes con la misma revisión y facets.
- Corregir `Sin submitir` frente a `Pend. cuestionario` si la inconsistencia persiste.
- Validar Panorama por periodo.
- Corregir reportes Admin, exportación, branding y gráficas.
- Validación visual de Paula.
- Retirar workflow temporal de `main`.
- Congelar Corte 1 únicamente con `APROBADO`.

## Siguiente paso exacto

`PRUEBA DE CAMBIO REAL EN HR → VERIFICAR NUEVA REVISIÓN Y REPROYECCIÓN → VALIDACIÓN VISUAL → CORRECCIONES FOCALIZADAS → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.