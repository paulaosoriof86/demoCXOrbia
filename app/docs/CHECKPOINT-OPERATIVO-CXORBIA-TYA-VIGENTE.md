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

Esto prueba que la plataforma ya no depende de conteos fijos ni de un snapshot histórico como verdad operativa. Cada cambio sigue dependiendo de que exista primero en la HR del proyecto correspondiente.

## Hallazgos de validación visual

La misma prueba identificó diferencias reproducibles:

- carga inicial lenta;
- recargas automáticas repetidas aun sin un cambio operativo intencional;
- Panorama cambia el rótulo de periodo, pero conserva información visual prácticamente igual;
- los cuatro reportes operativos del portal cliente quedaron `Pendiente de fuente` y sus exportaciones se deshabilitaron;
- las solicitudes de diseño de reportes —branding del tenant, logo, colores, tipografía y gráficas— todavía no están implementadas;
- los reportes administrativos, edición real de columnas e impresión/exportación del artefacto continúan pendientes frontend.

## Causas raíz demostradas

### A. Recargas falsas y lentitud

El servicio calculaba la revisión SHA-256 sobre el snapshot completo, incluyendo marcas temporales regeneradas como `generatedAt` y `sourceSnapshotAt`. Por ello una reconstrucción sin cambios de negocio podía producir una revisión distinta. El watcher interpretaba esa diferencia como cambio de HR y ejecutaba `location.reload()`.

Además, el script live inicial podía esperar una reconstrucción completa de la fuente cuando expiraba el cache.

### B. Reportes cliente bloqueados

El despliegue live reemplazó el payload congelado por la HR runtime, pero no cargó la proyección `window.CX_TYA_CORTE1_REPORTS` que consume `modules/cliente-extra.js`. El módulo actuó correctamente en fail-closed: mostró `Pendiente de fuente` y deshabilitó PDF/Excel/PPT.

### C. Panorama por periodo

Panorama usa resultados de cuestionario validados —score, NPS y secciones—, no solo conteos operativos. Mayo y julio tienen el mismo universo programado de 22 sucursales y 44 visitas, y actualmente no existe fuente conectada de scores por sección. Por eso varias tarjetas pueden coincidir o permanecer `Pendiente de fuente`; falta una mejora frontend para distinguir con claridad los resultados operativos por periodo de los resultados de evaluación aún no disponibles.

## Correcciones focalizadas aplicadas

Sin modificar `app/modules/**` ni `app/core/**`:

- `backend/runtime/hr-live-service/server.mjs`:
  - revisión estable que excluye marcas temporales volátiles;
  - cache bootstrap desde la lectura construida en el deploy;
  - respuesta rápida con actualización en segundo plano;
  - lectura fresca explícita para el watcher;
  - cache DEV de 55 segundos y una sola instancia para evitar revisiones divergentes.
- `app/adapters/tya-live-source-refresh-watch.js`:
  - recarga únicamente ante una revisión estable realmente distinta;
  - guard de sesión para no recargar repetidamente la misma revisión.
- `app/adapters/tya-corte1-report-projection-live.js`:
  - proyección runtime de reportes desde el mismo snapshot HR que consume `CX.data`;
  - cuatro reportes operativos disponibles;
  - planes de acción, brechas y scorecard continúan honestamente pendientes de fuente.
- `tools/release/tya-source-safe-live-binding-build-r22.mjs`:
  - carga la proyección live antes del watcher.

Commits funcionales:

- `433e057d19173863b3a9595ab5f39abcc2566304`;
- `29a3a4e893777e371d49b15f2b97ad92890a0a3d`;
- `075342e70a1a121c32cd1f3d61c8ad6c0048cd5e`;
- `42f1c1f9c9f142c34ee92224af425712c7c1e396`.

## Último despliegue DEV

Run `29794082358`, job `88521746632`:

- checkout y autorización: PASS;
- lectura HR viva y gates: PASS;
- build de imagen: PASS;
- Cloud Run DEV: PASS;
- smoke directo: PASS;
- build exacto same-origin: PASS;
- Hosting DEV: PASS;
- smoke same-origin: PASS;
- proyección live de reportes presente: PASS;
- revisión estable presente: PASS;
- decisión: `PASS_LIVE_HR_STABLE_REVISION_AND_LIVE_REPORTS_DEV_DEPLOY`.

Source HEAD desplegado: `42f1c1f9c9f142c34ee92224af425712c7c1e396`.

Artefacto: `8481386393`; digest `sha256:0a278c92c608e5e4887f9692e12cfa9dac2ea487c3e9badfb960e9d4bae3e54e`.

La revisión observada en el smoke fue `2e9f7c272989772252603ac17fb209b081d697794a70c5f621bb3ffe2c4ddf3a`. Los conteos observados siguen siendo evidencia temporal, no constantes operativas.

## Confirmado

- HR viva read-only funciona con cambios reales.
- KPI y disponibilidad shopper reaccionan a la HR.
- Revisión estable y prevención de recarga repetida están desplegadas.
- Proyección live de reportes está cargada en Hosting DEV.
- Sin producción, imports, pagos ni escrituras HR/Firestore/Auth/Storage.

## Pendiente real

1. Validación visual del nuevo despliegue:
   - carga inicial;
   - ausencia de recargas sin cambio real;
   - una sola recarga cuando la HR cambie;
   - cuatro reportes disponibles y PDF/Excel/PPT habilitados.
2. Confirmar que KPI, modal, histórico y reportes usan la misma revisión/facets.
3. Corregir frontend de Panorama para diferenciar información operativa por periodo y resultados de cuestionario pendientes.
4. Implementar en frontend el diseño de reportes solicitado: logo, colores, tipografía, gráficas y composición/exportación real por rol.
5. Retirar el workflow temporal de `main` después de cerrar DEV.
6. Congelar Corte 1 únicamente con `APROBADO`.

## Siguiente bloque exacto

`REVALIDAR DEV ESTABILIDAD Y REPORTES → LOCALIZAR DIFERENCIAS FRONTEND DE PANORAMA/DISEÑO/ADMIN → CORRECCIONES FOCALIZADAS → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.