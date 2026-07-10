# Academia — impacto auditoría V97

Fecha: 2026-07-10

## Avance confirmado

V97 profundiza seis lecciones existentes sin crear una Academia paralela:

- `mg1` a `mg4` para administración;
- `smg1` y `smg2` para shopper.

La expansión agrega problema que resuelve, flujo, botones, validación y errores frecuentes.

También incorpora para cursos personalizados:

- duplicación;
- archivado;
- restauración;
- versión;
- `auditRef`;
- log local;
- vista de archivados.

Se corrigió el uso de la audiencia seleccionada al editar o crear contenido.

## Pendientes netos

1. Sustituir `delCourse()` hard delete por soft-delete y auditoría.
2. Restaurar a borrador/revisión, no directamente a publicado preview.
3. Incorporar estados en revisión, aprobado, publicado preview, publicado y archivado.
4. Exigir motivo en toda transición sensible.
5. Aplicar permiso por acción y rol/persona efectivos.
6. Generar notificaciones por asignación, actualización y nueva versión.
7. Mantener acceso persistente a rutas/cursos/solicitud de capacitación.
8. Actualizar manuales que aún enseñan API keys, webhooks o configuración sensible.
9. Auditar contenidos de cliente y otros roles no profundizados por V97.
10. Generalizar contenidos específicos de país/cliente.
11. Rotular auditoría/persistencia local como preview.
12. Eliminar `_purgeTestArtifacts()` del producto.

## Regla transversal

Todo cambio posterior en datos, integraciones, permisos, finanzas, certificaciones o PWA debe revisar manual, curso, lección, checklist, glosario, errores frecuentes, ruta por rol y notificación.

## Clasificación

- Reusable CXOrbia: ciclo de vida, auditoría, versionado, rutas y notificaciones.
- Exclusivo cliente: no incorporar al core; manejar por configuración/backend.
- Claude/prototipo: completar brechas con diff mínimo.
- Academia: impacto alto.
- Sin impacto Claude: proveedor IA real y persistencia backend real.