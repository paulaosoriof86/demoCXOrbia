# ACLARACIÓN PAQUETE CLAUDE R21 — CONTRATOS INYECTADOS EN BUILD

Fecha: 2026-07-18  
Estado: `PAQUETE_CORREGIDO_NO_CAMBIO_ARQUITECTURA`

## Hallazgo

El primer paquete autocontenido entregado a Claude incluyó la fuente frontend V159, pero no incluyó el adapter generado durante el build R21 ni un harness equivalente. Por eso, al inspeccionar únicamente `app/core/data.js`, Claude no encontró:

- `CX.data.availableVisits()`;
- `CX.data.postulationEligibility()`;
- `visitFacets().available`;
- `visitFacets().eligibilityBlocked`;
- `CX.tenantProfile`.

La observación de Claude era correcta respecto al contenido del paquete recibido. No demuestra que los contratos R21 no existan en el runtime integrado: los gates validaron que el builder genera `app/adapters/tya-phase-a-source-safe-dev-adapter-r18a.js`, lo inserta después de la capa de datos y antes de `router.js`/`app.js`, y expone los contratos R21.

## Decisión arquitectónica

No se autoriza a Claude a modificar `app/core/data.js` para recrear esos contratos. Tampoco se autoriza una segunda lógica de negocio en `visitas.js`, `visita-detalle.js` o `app.js`.

Los conteos 44/39/5/4 no son datos para inventar ni fixtures de producción. Son resultados sanitizados de aceptación: 44 visitas, 39 asignadas, 5 sin asignar, 4 publicables y 1 bloqueada.

## Corrección del paquete

Se generó un paquete corregido que incluye, únicamente para prueba local de Claude:

- `app/index-claude-r21.html`;
- `app/_claude-test/r21-runtime-contracts.js`.

El harness reproduce la forma pública del adapter y una muestra sanitizada sin PII. No escribe, no persiste y debe excluirse de la candidata final. Claude debe modificar solo los archivos frontend localizados y entregar la app basada en `app/index.html`.

## Regla futura

Todo paquete Claude que dependa de contratos inyectados en build debe incluir uno de estos elementos:

1. el build exacto con adapter ya generado; o
2. un harness autocontenido, claramente marcado como no entregable.

Nunca volver a afirmar que un paquete fuente aislado contiene contratos build-time sin incluirlos o demostrar su carga.

## Clasificación

- Reusable CXOrbia: separación entre fuente frontend, adapter build-time y harness de desarrollo.
- Exclusivo TyA: muestra 44/39/5/4 y reglas Q1/Q2/P1Q.
- Claude/prototipo: consumir contratos, no crearlos.
- Academia: sin cambio de contenido funcional; sí requiere trazabilidad de arquitectura para manuales técnicos internos.
- Sin impacto producción: no deploy, merge, import ni writes.
