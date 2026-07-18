# ACADEMIA — IMPACTO V159 HOSTING DEV PASS

Fecha: 2026-07-18

## Estado

V159 ya está desplegada y validada remotamente en Hosting DEV. Academia debe revisarse visualmente sobre el mismo build antes del freeze.

URL:

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`

No hubo rediseño frontend ni cambio de contenido académico en este bloque. Los cambios fueron de binding, estados canónicos, gates, CI y gobierno de release.

## Contenido que debe permanecer correcto

### Proyecto y periodo

- Cinépolis es un proyecto configurable.
- Proyecto y periodo tienen identidades distintas.
- Cambiar periodo debe cambiar visitas, KPIs e histórico.

### Fuente y sincronización

- HR DEV es un snapshot source-safe fresco de build.
- No debe presentarse como sincronización runtime live.
- Estados preview, revisión, HOLD y activo deben explicarse con honestidad.

### Shoppers

- La fuente actual tiene 215 shoppers frente a referencia 216.
- R11D gobierna la revisión.
- No se inventan, completan ni eliminan identidades para forzar conteos.

### Finanzas y certificaciones

- Submitido no equivale a liquidado.
- Liquidado no equivale a pagado.
- Junio está ejecutado y permanece en control de liquidación/pago pendiente.
- Pagos confirmados o inferidos: 0.
- Certificaciones presentadas se conservan cuando la fuente lo confirma; faltantes pasan a revisión.

### Integraciones

- Hosting DEV está activo.
- Firestore/Auth/Storage/HR writes, Make, Gemini, pagos y producción continúan apagados.
- Manuales y cursos no deben prometer proveedores o automatizaciones live.

## Revisión visual por rol

Validar:

- Admin: contexto, histórico, visitas, finanzas, certificaciones y revisión.
- Shopper: rutas, visitas, certificación, manuales y notificaciones.
- Cliente: panorama, periodo, KPIs e histórico autorizado.
- Academia: listado, búsqueda, categorías, deep links, edición, versionado y archivo/restauración.

## Actualización futura

Solo se modifica Academia si la revisión visual demuestra una diferencia real de comportamiento. Todo hallazgo debe relacionar módulo, rol, manual/curso, checklist, error frecuente y notificación afectada.

## Estado seguro

Sin contenido que declare producción, sync runtime live, proveedores activos o pagos confirmados sin evidencia.
