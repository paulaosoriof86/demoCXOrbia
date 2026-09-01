# CAMBIOS BACKEND — ADDENDUM LIVE HR / CLOUD BUILD DEV

Fecha: 2026-07-20
Estado: `LIVE_HR_CONFIRMED_STABILITY_REPORTS_REDEPLOY_PASS_PENDING_VISUAL`

## Qué se comprobó

Paula validó cambios reales en la HR:

- una fecha de cuestionario modificó el contador operativo;
- una asignación HR retiró la visita del tablero disponible del shopper;
- los KPI de julio reflejan la situación actual de la fuente.

La lectura HR runtime read-only queda funcionalmente confirmada. Los conteos observados no son constantes ni criterios permanentes de aceptación.

## Hallazgos posteriores

1. carga lenta y recargas repetidas;
2. Panorama prácticamente igual al cambiar periodo;
3. reportes operativos del cliente bloqueados como `Pendiente de fuente`;
4. exportaciones PDF/Excel/PPT deshabilitadas;
5. branding, tipografía, logo y gráficas todavía no aplicados;
6. reportes administrativos y edición de columnas todavía pendientes frontend.

## Causas raíz

- La revisión incluía timestamps regenerados y el watcher recargaba sin cambio operativo.
- El script inicial podía esperar una reconstrucción completa de las pestañas HR.
- El build live no cargaba `CX_TYA_CORTE1_REPORTS`; el portal cliente falló cerrado.

## Archivos creados o modificados

### Reusable CXOrbia

- `backend/runtime/hr-live-service/server.mjs`: hash estable, bootstrap, actualización controlada y metadatos de revisión.
- `app/adapters/tya-live-source-refresh-watch.js`: recarga solo ante cambio real y guard anti-loop.
- `app/adapters/tya-corte1-report-projection-live.js`: proyección sanitizada desde el snapshot runtime.
- `tools/release/tya-source-safe-live-binding-build-r22.mjs`: carga la proyección live antes del watcher.

### Claude/prototipo

No se modificaron `app/modules/**` ni `app/core/**`.

Pendientes localizados:

- `app/core/cliente-data.js`;
- `app/modules/cliente.js`;
- `app/modules/cliente-insights.js`, si aplica;
- `app/modules/cliente-extra.js`;
- `app/modules/operacion-extra.js`.

Alcance: Panorama por periodo, reportes Admin, edición real de columnas, exportación del reporte, branding por tenant, logo, paleta, tipografía y gráficas.

### Academia

Actualizar después de la validación visual: lectura viva, revisión de fuente, periodos operativos frente a scores pendientes y exportación por rol.

### Sin impacto Claude

Cloud Build, Cloud Run, Hosting DEV, IAM y workflow temporal.

## Evidencia

Commits funcionales:

- `433e057d19173863b3a9595ab5f39abcc2566304`;
- `29a3a4e893777e371d49b15f2b97ad92890a0a3d`;
- `075342e70a1a121c32cd1f3d61c8ad6c0048cd5e`;
- `42f1c1f9c9f142c34ee92224af425712c7c1e396`.

Run final: `29794082358`.
Job: `88521746632`.
Artefacto: `8481386393`.
Digest: `sha256:0a278c92c608e5e4887f9692e12cfa9dac2ea487c3e9badfb960e9d4bae3e54e`.
Decisión: `PASS_LIVE_HR_STABLE_REVISION_AND_LIVE_REPORTS_DEV_DEPLOY`.

## Seguridad preservada

- Producción: no.
- HR writes: 0.
- Firestore/Auth/Storage writes: 0.
- Imports: 0.
- Pagos: 0.
- Make/Gemini live: no.
- Merge: no.

## Pendiente real

- Revalidar carga y ausencia de recargas sin cambio de HR.
- Confirmar cuatro reportes disponibles y exportaciones funcionales.
- Confirmar una sola actualización ante cambio real.
- Atender Panorama y diseño/administración de reportes desde frontend.
- Retirar el workflow temporal después del cierre DEV.
- Congelar Corte 1 solo con `APROBADO`.

## Siguiente bloque exacto

`REVALIDATE DEV STABILITY AND LIVE REPORTS → FRONTEND FOCUSED FIXES → REMOVE TEMP WORKFLOW → FREEZE CORTE 1`
