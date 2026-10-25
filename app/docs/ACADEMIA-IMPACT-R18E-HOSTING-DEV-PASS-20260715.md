# ACADEMIA — IMPACTO R18E HOSTING DEV PASS

Fecha: 2026-07-15

## Clasificación

`Academia`: sin cambio funcional de módulo, curso, lección, manual, ruta por rol o notificación.

## Qué ocurrió

- Se desplegó en Firebase Hosting DEV una copia source-safe V131 con los overlays R18D.
- Se verificó remotamente Finanzas, Shoppers y Certificación.
- No se conectó backend persistente ni se ejecutaron writes/imports.

## Qué debe mantenerse en contenidos y manuales

- Hosting DEV visible no equivale a producción.
- Snapshot source-safe no equivale a importación ni sincronización activa.
- Liquidación, control financiero y pago son estados distintos.
- Certificación en HOLD no equivale a aprobación ni debe provocar una nueva solicitud automática.
- Proyecto y periodo permanecen separados.
- Los atributos ausentes en la fuente source-safe no deben inferirse.

## Estado

- No se modifica `app/modules/academia.js`.
- No se requiere paquete Claude por R18E.
- La revisión visual humana puede generar observaciones de copy o representación, que deberán acumularse sin reabrir backend ya validado.
