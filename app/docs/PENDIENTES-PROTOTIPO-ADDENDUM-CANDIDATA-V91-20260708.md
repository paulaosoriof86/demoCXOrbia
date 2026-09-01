# Pendientes prototipo addendum candidata V91

Fecha: 2026-07-08  
Origen: auditoria forense de `Prototype development request CXOrbia V91.zip`  
Estado: pendiente Claude/prototipo o parche UI controlado futuro. Backend no debe cerrar estos puntos como resueltos.

## P0 - No perder production copy guard

`app/index.html` del ZIP V91 no incluye `core/production-copy-guard.js`. En el repo actual ese guard existe y debe conservarse.

Accion requerida en empalme:

- conservar `<script src="core/production-copy-guard.js"></script>` despues de `core/ui.js` y antes de modulos;
- agregar scripts `modules/diagnostico.js` y `modules/administrabilidad.js` sin eliminar el guard.

## P0 - Copy honesto residual

Residuos detectados en inspeccion estatica:

- `modules/automatizaciones.js`: `Payload de prueba enviado`.
- `modules/correo.js`: `Cuestionario enviado` y cuerpo indicando que el cuestionario fue enviado desde la plataforma.
- `modules/dashboard.js`: `WhatsApp enviado`.
- `modules/postulaciones.js`: `WhatsApp enviado` y `HR sincronizada`.
- `modules/shoppers.js`: `Cuestionario enviado tarde`.

Debe corregirse a preparado, pendiente backend/gate, preview o realizado/completado, segun contexto.

## P0 - Academia admin actions

La candidata V91 no deja visibles acciones administrativas completas en Academia.

Faltan o no estan visibles:

- archivar/soft-delete;
- duplicar;
- versionar;
- cambiar estado;
- pedir revision;
- publicar solo con revision humana;
- asignar rol/proyecto por curso/manual/checklist/glosario;
- motivo/auditRef para acciones criticas.

Existe codigo de editar/eliminar con `.acad-edit`, pero las tarjetas de curso no renderizan botones `.acad-edit`, por lo que no es accion visible.

## P0 - Crear con IA en Academia

El boton `Crear con IA` parece no estar cableado correctamente. El codigo contiene una expresion suelta hacia el modal de IA en vez de un listener claro a `#acadNew`.

Requiere smoke visual.

## P1 - Docs del ZIP no reemplazan docs vivos

`RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md` dentro del ZIP estan desactualizados. No deben reemplazar los docs vivos del repo.

## P1 - Finanzas/pagos

Revisar textos de `Pagado`, `Marcar pagado`, `egreso generado` y estados demo para evitar que se lean como pagos reales sin cruce financiero/backend.

## P1 - Integraciones/HR/correo

Revisar estados como conectado, sincronizado, en vivo, enviado o notificado para diferenciar demo/local/preview de provider real.

## Estado

Este addendum no toca UI ni backend real. Sirve para evitar que la candidata V91 sea aceptada superficialmente.
