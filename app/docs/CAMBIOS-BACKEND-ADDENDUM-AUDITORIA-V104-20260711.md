# Cambios backend — addendum auditoría V104

Este bloque no modifica backend ni runtime. Registra la auditoría forense de la nueva candidata frontend V104 y corrige el paquete de trabajo para Claude.

## Documentado

- identidad V104 y delta real V103→V104;
- validación estructural;
- manifest y smoke inválidos;
- avances válidos a preservar;
- P0/P1 pendientes;
- separación Claude frontend vs R5 backend;
- patrones backend reutilizables traducidos a requisitos de producto;
- mejoras locales R5 pendientes de consolidación genérica;
- Academia, manuales, rutas y notificaciones;
- criterios de aceptación de la siguiente candidata.

## Estado backend protegido

R5 continúa como baseline operativa de ChatGPT/Codex. No se empalma V104. Snapshot, adapters, periodos, liquidaciones, carryover, importadores, reviewQueue, auditEvents, validadores y source lock permanecen sin cambios.

## Clasificación

- Reusable CXOrbia: modos de datos, estados de fuente, llaves estables, pagos, certificaciones, dry-run, permisos y auditoría.
- Exclusivo TyA: R5 y sus conteos/datos no se entregan a Claude.
- Claude/prototipo: correcciones acumuladas V104.
- Academia: impacto alto y pendiente.
- Sin impacto Claude: runtime, contracts, tools, workflows, Firebase y proveedores.

## Estado seguro

Sin empalme, merge, deploy, import, writes, pagos ni producción.
