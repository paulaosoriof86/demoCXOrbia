# ACADEMIA — IMPACTO V159 VISUAL NO APROBADO

Fecha: 2026-07-18

## Estado

Academia no queda aprobada en el Corte 0.

## Hallazgos

1. Cliente tiene contenido creado en catálogo admin, pero no recibe una ruta visible de Academia.
2. Los manuales se muestran como secuencias de lecciones breves, no como documentos/instructivos CXOrbia.
3. El contenido shopper revisado es superficial y no explica con profundidad flujo, decisiones, errores, validaciones, pagos ni relación con HR/TyAOnline.
4. Proyecto y periodo aparecen unidos en Shopper/Cliente, afectando el contexto pedagógico.

## Requisitos reutilizables

- Objeto `Manual` separado de `Curso`.
- Manual consultable y descargable, con versión, rol, proyecto, país, módulo, fecha de actualización y estado.
- Curso con progreso, lecciones y evaluación.
- Ruta de aprendizaje por rol.
- Cliente ve contenido publicado cuando su scope/permiso coincide.
- Shopper ve instructivos del proyecto y manual general, sin información ajena.
- Actualización de manual/curso cuando cambia un flujo operativo.
- Checklists, glosario, errores frecuentes y validación esperada.

## Próximo paso

Después del contrato backend de tenant/rol/proyecto/periodo, Claude debe corregir exposición y formato sin duplicar reglas de negocio.

## Estado seguro

Documentación solamente. Sin cambios de contenido real, publicación automática, IA live, deploy o datos sensibles.
