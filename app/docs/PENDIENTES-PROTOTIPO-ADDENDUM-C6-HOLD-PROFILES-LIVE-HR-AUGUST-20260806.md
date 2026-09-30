# PENDIENTES PROTOTIPO — Addendum C6 perfiles HOLD y HR viva agosto

**Fecha:** 2026-08-06

## P0 antes de producción

1. Corregir la lectura de metadata provider para autodetectar pestañas nuevas.
2. Confirmar en runtime vivo `AGOSTO 26` y `AGOSTO 26 HN`.
3. Reconstruir todos los periodos desde HR viva y publicar una sola `sourceRevision` transversal.
4. Probar que una modificación de un periodo histórico cambia Dashboard, Histórico, Visitas, Finanzas y portal correspondiente sin editar un snapshot fijo.
5. Prohibir que archivos `through-july`, period lists o materializaciones Firestore actúen como autoridad.

## Identidades pendientes

- Recuperar nombres y actividad de los 12 perfiles de apellido y el perfil multi-Auth mediante ruta privada controlada.
- Paula decide cuáles perfiles antiguos pasan a `ARCHIVE_LEGACY_NO_AUTH`.
- Preservar visitas, certificaciones, liquidaciones y auditoría aunque se excluyan del repair Auth.
- No borrar, fusionar ni seleccionar candidatos automáticamente.

## P1/P2

- Mostrar fecha de actualización y revisión de fuente de manera comprensible por rol.
- Diferenciar `dato vivo`, `último dato válido` y `fuente degradada`.
- Documentar el ciclo mensual sin nombres de mes hardcodeados.

## Estado

Sin cambios frontend ejecutados. Producción sigue bloqueada por autoridad HR agosto y decisión de los 13 HOLD.
