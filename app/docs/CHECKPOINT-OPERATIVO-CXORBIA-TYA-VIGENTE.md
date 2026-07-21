# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_LIVE_HR_CONFIRMED_STABILITY_REPORTS_REDEPLOY_PASS_PENDING_VISUAL`

## Estado comprobado

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V161C/R21.
- V164 y Corte 1A están integrados.
- Cloud Run DEV read-only y Hosting DEV están desplegados.
- La lectura HR viva quedó confirmada con cambios operativos reales realizados por Paula.
- Corte 1 todavía no se congela.
- Corte 2 continúa bloqueado.

## Prueba funcional real de HR viva

Paula confirmó en DEV:

1. al registrar fecha de cuestionario en la HR, el contador operativo cambió;
2. al asignar shopper en la HR, la visita desapareció del tablero de visitas disponibles del shopper;
3. los KPI de julio coinciden con el estado actual observado de la HR.

Esto prueba que la plataforma ya no depende de conteos fijos ni de un snapshot histórico como verdad operativa.

## Hallazgos de validación visual

- carga inicial lenta;
- recargas automáticas repetidas aun sin un cambio operativo intencional;
- Panorama cambia el rótulo de periodo, pero conserva información visual prácticamente igual;
- los cuatro reportes operativos del portal cliente quedaron `Pendiente de fuente` y sus exportaciones se deshabilitaron;
- branding, logo, colores, tipografía y gráficas todavía no están implementados;
- reportes administrativos, edición real de columnas e impresión/exportación del artefacto continúan pendientes frontend.

## Causas raíz demostradas

### Recargas falsas y lentitud

La revisión SHA-256 incluía marcas temporales regeneradas. El watcher interpretaba cada reconstrucción como cambio de HR y ejecutaba `location.reload()`. El script inicial también podía esperar una reconstrucción completa cuando expiraba el cache.

### Reportes cliente bloqueados

El despliegue live cargaba la HR runtime, pero omitía la proyección `window.CX_TYA_CORTE1_REPORTS`. El módulo actuó fail-closed y deshabilitó PDF/Excel/PPT.

### Panorama por periodo

Panorama usa scores/NPS/secciones validados, no solo conteos operativos. Mayo y julio comparten 22 sucursales y 44 visitas, y no existe todavía una fuente conectada de scores por sección. Falta frontend para separar claramente operación del periodo y resultados de evaluación pendientes.

## Correcciones focalizadas aplicadas

Sin modificar `app/modules/**` ni `app/core/**`:

- `backend/runtime/hr-live-service/server.mjs`: revisión estable, bootstrap/cache y actualización controlada;
- `app/adapters/tya-live-source-refresh-watch.js`: recarga solo ante cambio real y guard anti-loop;
- `app/adapters/tya-corte1-report-projection-live.js`: cuatro reportes operativos desde el snapshot live;
- `tools/release/tya-source-safe-live-binding-build-r22.mjs`: carga la proyección live antes del watcher.

Commits funcionales:

- `433e057d19173863b3a9595ab5f39abcc2566304`;
- `29a3a4e893777e371d49b15f2b97ad92890a0a3d`;
- `075342e70a1a121c32cd1f3d61c8ad6c0048cd5e`;
- `42f1c1f9c9f142c34ee92224af425712c7c1e396`.

## Último despliegue DEV

Run `29794082358`, job `88521746632`:

- lectura HR viva y gates: PASS;
- build de imagen: PASS;
- Cloud Run DEV y smoke directo: PASS;
- build same-origin y Hosting DEV: PASS;
- smoke same-origin: PASS;
- proyección live de reportes: PASS;
- revisión estable: PASS;
- decisión: `PASS_LIVE_HR_STABLE_REVISION_AND_LIVE_REPORTS_DEV_DEPLOY`.

Source HEAD desplegado: `42f1c1f9c9f142c34ee92224af425712c7c1e396`.
Artefacto: `8481386393`.
Digest: `sha256:0a278c92c608e5e4887f9692e12cfa9dac2ea487c3e9badfb960e9d4bae3e54e`.
Revisión smoke: `2e9f7c272989772252603ac17fb209b081d697794a70c5f621bb3ffe2c4ddf3a`.

Los conteos observados son evidencia temporal, no constantes operativas.

## Pendiente real

1. Revalidar carga inicial y ausencia de recargas sin cambio real.
2. Confirmar una sola actualización cuando cambie la HR.
3. Confirmar cuatro reportes disponibles y PDF/Excel/PPT habilitados.
4. Confirmar KPI, modal, histórico y reportes sobre una sola revisión/facets.
5. Corregir frontend de Panorama en `app/core/cliente-data.js`, `app/modules/cliente.js` y, si aplica, `app/modules/cliente-insights.js`.
6. Corregir diseño/exportación en `app/modules/cliente-extra.js` y reportes administrativos en `app/modules/operacion-extra.js`.
7. Retirar el workflow temporal de `main` después de cerrar DEV.
8. Congelar Corte 1 únicamente con `APROBADO`.

## Siguiente bloque exacto

`REVALIDAR DEV ESTABILIDAD Y REPORTES → CORRECCIONES FRONTEND FOCALIZADAS → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.
