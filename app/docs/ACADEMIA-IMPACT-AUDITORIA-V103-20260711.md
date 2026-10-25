# IMPACTO EN ACADEMIA — AUDITORÍA V103

Fecha: 2026-07-11

## Avances preservables

- versiones de contenido/workflow y auditRef;
- soft-delete y restauración de lecciones;
- motivo de restauración;
- estados editoriales y permisos de revisión/aprobación como base;
- copy de postulación/HR parcialmente corregido.

## Pendientes obligatorios

1. Mostrar controles mediante `CX.permissions.can(...)`, no por shell `role==='admin'`.
2. Pasar contexto tenant/proyecto/país/entidad a crear, editar, duplicar, archivar, restaurar, revisar, aprobar y publicar.
3. Separar práctica de certificación real:
   - `approved_preview` = práctica;
   - `pending_backend` = pendiente;
   - solo `confirmed/published` o carryover válido habilita visitas.
4. Revisor debe ser un segundo usuario autenticado y autorizado, no nombre libre.
5. Manuales deben explicar:
   - fuente real vs demo;
   - liquidada vs pagada;
   - permisos multipaís;
   - gates y estados estructurados;
   - cancelación/archivo de visitas HR;
   - outbox vs notificación enviada;
   - IA preferida vs proveedor conectado.
6. Retirar instrucciones para pegar API keys y afirmaciones de Make/Gemini activos.
7. Actualizar rutas por rol, notificaciones y checklists con los cambios anteriores.

## Regla reusable

Academia no puede afirmar importación, publicación, certificación, notificación, pago o sincronización real sin evidencia backend y gate confirmado. TyA/Cinépolis se mantiene como configuración/ejemplo de tenant, nunca como lógica global.