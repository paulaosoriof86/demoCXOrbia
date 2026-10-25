# Academia — contrato profundo y pendiente neto V106 / R8

Academia no se considera resuelta por tener cursos y textos. Debe ser un subsistema administrable, segmentado, auditado e integrado a los flujos reales.

## Existente que se preserva

- cursos profundos estáticos para Admin, Shopper y Cliente;
- lecciones, pasos, checklists, glosario y errores frecuentes;
- crear, editar y duplicar cursos personalizados;
- estados locales de borrador, revisión, aprobación, publicación preview, archivo y eliminación;
- motivo al archivar/eliminar;
- restauración/versionado local;
- `contentVersion`, `workflowVersion` y auditRefs locales;
- CRUD lógico básico de lecciones;
- permisos de acción declarados;
- notificación in-app local;
- manuales in-app con creación/edición básica.

No reescribir ni perder estas capacidades.

## Scope obligatorio

Cada entidad debe admitir scope opcional:

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

Arreglo vacío significa global. No se deben inventar cursos GT/HN; se debe soportar la segmentación.

## Entidades administrables

Cursos, lecciones, manuales, rutas de aprendizaje, glosario, FAQ, checklists, recursos, solicitudes de capacitación y paquetes/módulos relacionados deben permitir crear, editar, duplicar cuando aplique, versionar, archivar, restaurar, scope, estado, actor, timestamps y auditRef. No hard-delete de contenido histórico crítico.

## Workflow humano

`draft → ai_draft → human_review_required/pending_review → approved_preview → pending_backend → confirmed/published → archived`

- creator, reviewer y approver como IDs autenticados;
- separación de funciones configurable;
- impedir autoaprobación cuando la política lo prohíba;
- motivo/observación;
- IA solo propone;
- botón y handler validan la misma acción/contexto.

## Permisos

Acciones mínimas: create, edit, review, approve, publish, duplicate, archive, restore y delete controlado para curso/lección/manual/checklist/glosario/ruta.

No combinar permiso válido con `role==='admin'`. Roles personalizados autorizados deben operar. Call-sites con tenant, proyecto, país, entityType y entityId reales.

## Rutas de aprendizaje

Prerrequisitos, requerido/opcional, orden, fecha límite, estado, progreso por usuario/rol/proyecto, reentrenamiento por versión, evidencia de finalización y certificación asociada.

## Backfill obligatorio

Actualizar contenido sobre:

1. modos demo/source-safe/connected y aislamiento de fixtures;
2. Portal Cliente sin fuente;
3. proyecto vs periodo; activo vs histórico;
4. liquidación, pago, honorario, boleto, combo, lote y movimiento;
5. certificación, práctica, carryover, segundo actor y publicación;
6. permisos/scope por entidad;
7. reviewQueue/conflictos;
8. importadores dry-run, duplicados y campos protegidos;
9. plan Firestore R6 y executor R8: plan, preflight, target limpio, autorización, Emulator, ejecución, verificación y rollback;
10. in-app, outbox, requested, envío confirmado y failed;
11. archivo/restauración y auditoría;
12. multi-tenant/proyecto configurable.

## Notificaciones

Curso asignado, lección/manual actualizado, nueva versión, capacitación solicitada/programada/completada, revisión pendiente, aprobación/publicación y reentrenamiento. Distinguir in-app, outbox y envío externo confirmado.

## Acceso persistente

Evaluar topbar o equivalente para mi ruta, pendientes, ayuda por módulo, manuales, novedades y solicitar capacitación.

## Criterio de aceptación

Academia queda resuelta solo con entidades administrables, scope/filtros, permisos contextuales, actores autenticados, lifecycle/versionado, rutas/progreso, backfill por módulos, notificaciones honestas y smoke Admin/rol personalizado/Shopper/Cliente. El contenido debe incluir pasos, checklists, errores, estados y validaciones, no descripciones superficiales.
