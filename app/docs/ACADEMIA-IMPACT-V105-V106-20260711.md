# Impacto Academia — V105 / build interno V106

## Estado real

Academia ya contiene cursos profundos por audiencia, lecciones, checklists, glosarios, errores frecuentes, creación/edición/duplicación, estados locales, archivo/eliminación lógica/restauración, versiones, auditoría local y permisos declarados. Todo eso se preserva.

## Respuesta a la duda de alcance

Se requieren **ambos**:

1. scope opcional por tenant, proyecto, país, rol, módulo, paquete y nivel;
2. creator/reviewer/approver autenticados y separados según política.

Arreglos de scope vacíos significan contenido global. No es necesario inventar ahora cursos específicos de GT, HN o un proyecto; sí debe existir el modelo, formulario, filtro y visibilidad.

## Pendiente funcional

### Scope

Modelo sugerido:

```js
scope: {
  tenantIds: [],
  projectIds: [],
  countries: [],
  roles: [],
  moduleIds: [],
  packageIds: [],
  levels: []
}
```

### Permisos

- Call-sites con tenant/proyecto/país/entityType/entityId.
- No exigir `role==='admin'` adicional si la acción está autorizada.
- Manuales y categorías con permisos internos, motivo, auditoría, versión, archivo y restauración.
- No hard-delete de contenido histórico crítico.

### Revisión humana

- creatorId, reviewerId y approverId autenticados;
- separación de funciones configurable;
- prevención de auto-aprobación cuando aplique;
- observaciones y cola de revisión;
- estados `ai_draft`, `human_review_required`, `approved_preview`, `pending_backend`, `confirmed/published`.

### Entidades administrables

Glosario, checklist, FAQ, recursos y rutas de aprendizaje deben poder crearse, editarse, versionarse, archivarse, restaurarse, asignarse por scope y auditarse.

### Rutas de aprendizaje

Prerrequisitos, requerido/opcional, orden, fecha límite, progreso por usuario/contexto y reentrenamiento por nueva versión.

### Notificaciones

Separar in-app, outbox y envío externo confirmado para: asignación, actualización, nueva versión, entrenamiento solicitado/programado/completado, revisión, aprobación y publicación.

## Contenido a agregar o actualizar

No reescribir todos los cursos. Crear/actualizar únicamente rutas sobre:

- modos de datos y aislamiento demo;
- Portal Cliente sin fuente;
- liquidación, pago y lotes;
- certificación, carryover y segundo actor;
- scopes y permisos;
- conflictos/reviewQueue;
- importación dry-run;
- plan Firestore R6;
- autorización, ejecución, verificación y rollback;
- copy honesto de integraciones y notificaciones.
