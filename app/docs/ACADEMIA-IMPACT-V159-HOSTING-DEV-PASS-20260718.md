# ACADEMIA — IMPACTO V159 DEV ACTUALIZADA

Fecha: 2026-07-18

## Estado

V159 está desplegada y validada remotamente en Hosting DEV después de las correcciones raíz. Academia debe revisarse visualmente sobre el mismo build antes del freeze.

URL:

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`

No hubo rediseño frontend ni cambio de contenido académico en este bloque. Los cambios fueron de binding, clasificación de datos, estados canónicos, gates, CI y gobierno de release.

## Proyecto, periodo y fuente

- Cinépolis es un proyecto configurable.
- Proyecto y periodo tienen identidades distintas.
- Cambiar periodo debe cambiar visitas, KPIs e histórico.
- HR DEV es un snapshot source-safe fresco de build.
- No debe presentarse como sincronización runtime live.
- Estados preview, revisión, HOLD y activo deben explicarse con honestidad.

## Shoppers y niveles de datos

- La fuente actual tiene 215 shoppers frente a referencia 216.
- R11D gobierna la revisión de la diferencia.
- Una referencia protegida no es un perfil operativo, activo o completo.
- Campos nulos y conteos históricos no autorizan inferir estado, rating o completitud.
- La UI validada muestra 215 referencias protegidas y cero perfiles operativos inventados.
- No se inventan, completan ni eliminan identidades para forzar conteos.

## Finanzas y certificaciones

- Submitido no equivale a liquidado.
- Liquidado no equivale a pagado.
- Junio está ejecutado y permanece en control de liquidación/pago pendiente.
- Pagos confirmados o inferidos: 0.
- Certificaciones presentadas se conservan cuando la fuente lo confirma; faltantes pasan a revisión.

## Integraciones y release

- Hosting DEV está activo.
- Firestore/Auth/Storage/HR writes, Make, Gemini, pagos y producción continúan apagados.
- `hosting_dev_remote_smoke_pass_pending_visual` no equivale a `ACTIVE_BASELINE`.
- Manuales y cursos no deben prometer integraciones live o freeze antes de la aprobación visual.

## Revisión visual por rol

- Admin: contexto, histórico, visitas, shoppers protegidos, finanzas, certificaciones y revisión.
- Shopper: rutas, visitas, certificación, manuales y notificaciones.
- Cliente: panorama, periodo, KPIs e histórico autorizado.
- Academia: listado, búsqueda, categorías, deep links, edición, versionado y archivo/restauración.

## Contenido reusable

- Jerarquía: referencia protegida → perfil operativo → perfil completo autorizado.
- El nivel declarado por la fuente prevalece sobre heurísticas de campos.
- La revisión humana precede cualquier completado de identidad o estado.
- Snapshot, sincronización runtime, deploy DEV, smoke remoto y baseline congelada son estados distintos.

## Estado seguro

Sin contenido que declare producción, sync runtime live, integraciones activas, perfiles shopper completos o pagos confirmados sin evidencia.
