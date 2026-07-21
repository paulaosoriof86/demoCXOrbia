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

La validación visual mostró:

1. carga lenta y recargas repetidas;
2. Panorama prácticamente igual al cambiar periodo;
3. reportes operativos del cliente bloqueados como `Pendiente de fuente`;
4. exportaciones PDF/Excel/PPT deshabilitadas;
5. branding, tipografía, logo y gráficas todavía no aplicados;
6. reportes administrativos y edición de columnas todavía pendientes frontend.

## Causas raíz

### Revisión inestable

La revisión del servicio se calculaba sobre el JSON completo, incluyendo timestamps regenerados. El watcher veía una revisión nueva aunque no hubiera cambiado un dato operativo y recargaba la página.

### Bootstrap lento

El script live inicial podía quedar esperando una reconstrucción completa de las pestañas HR cuando el cache vencía.

### Proyección de reportes ausente en el build live

El nuevo binding runtime cargaba la HR y el adapter canónico, pero no la proyección `CX_TYA_CORTE1_REPORTS` utilizada por el portal cliente. El módulo falló cerrado y bloqueó las exportaciones.

## Archivos creados o modificados

### Reusable CXOrbia

- `backend/runtime/hr-live-service/server.mjs`
  - hash estable sin campos temporales volátiles;
  - bootstrap desde snapshot source-safe construido en deploy;
  - stale-while-refresh para acelerar la carga;
  - `fresh=1` para comprobación explícita;
  - metadatos de revisión estable y origen del cache.
- `app/adapters/tya-live-source-refresh-watch.js`
  - recarga solo ante cambio real de revisión;
  - guard de sesión contra bucles de recarga.
- `app/adapters/tya-corte1-report-projection-live.js`
  - proyección sanitizada de reportes desde el snapshot runtime;
  - periodos, países y sucursales dinámicos;
  - PDF/Excel/PPT habilitados para los cuatro reportes operativos.
- `tools/release/tya-source-safe-live-binding-build-r22.mjs`
  - carga la proyección live antes del watcher.

### Exclusivo cliente

- Endpoint y contexto TyA/Cinépolis en DEV.
- La estructura queda parametrizable por tenant/proyecto; no convierte Cinépolis en lógica global.

### Claude/prototipo

No se modificaron `app/modules/**` ni `app/core/**`.

Permanecen localizados:

- Panorama por periodo;
- reportes Admin;
- edición real de columnas;
- exportación del reporte y no de la página;
- branding por tenant;
- logo, paleta, tipografía y gráficas;
- coherencia de reportes en admin, cliente, shopper y demás roles.

### Academia

Actualizar después de la validación visual:

- lectura viva y revisión de fuente;
- cambio real frente a recarga falsa;
- periodos operativos frente a scores pendientes;
- exportación por alcance y branding.

### Sin impacto Claude

- Cloud Build;
- Cloud Run;
- Hosting DEV;
- IAM;
- workflow temporal en `main`.

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
- Atender Panorama y diseño/administración de reportes desde frontend, por archivo/módulo.
- Retirar el workflow temporal de `main` después del cierre DEV.
- Congelar Corte 1 solo con `APROBADO`.

## Siguiente bloque exacto

`REVALIDATE DEV STABILITY AND LIVE REPORTS → FRONTEND FOCUSED FIXES → REMOVE TEMP WORKFLOW → FREEZE CORTE 1`
