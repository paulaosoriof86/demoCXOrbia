# Resumen para Claude - HR Source V70

Fecha: 2026-07-03

Estado:

- V70 incorpora modulo HR Source para fuente HR por proyecto.
- Backend agrego bridge DEV y endpoint local sin reescribir modulos visuales.
- Preview backend puede recibir respuestas de `test`, `preview` y `sync-request`.
- Se agrego soporte de referencia privada `sourceRef` y URL enmascarada.
- Preview backend puede devolver tabs vivos detectados desde workbook XLSX.
- Sin deploy, sin Firestore writes, sin importacion.
- `canImport` permanece false.

Pendientes para Claude/frontend:

- Mantener interfaz HR Source aprobada.
- No volver a persistir el enlace completo en almacenamiento del navegador.
- En produccion, `sourceRef` debe venir del backend como referencia opaca.
- Mostrar tabs/conteos recibidos del backend sin asumir que todos los periodos vienen de staging.
- Mantener sincronizacion como solicitud bloqueada hasta autorizacion backend.
