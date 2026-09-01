# PENDIENTES PROTOTIPO - Readiness bucket evaluator TyA

Fecha: 2026-07-10

## Pendientes para Claude/prototipo

Claude debe reflejar el readiness bucket evaluator sin simular backend real:

1. Mostrar readiness por modulo: proyecto/periodo, source, usuarios, academia, certificaciones, shoppers, visitas, liquidaciones, reviewQueue, auditEvents, integraciones y CX.data.
2. Separar `GO_READY`, `WARNING_READY` y `NO_GO_BLOCKER` con mensajes claros.
3. Mostrar `BACKEND_PREPARED` cuando backend ya dejo contrato/adapter/gate y solo falta representacion UI.
4. Mostrar `CLAUDE_REQUIRED` cuando el ajuste corresponde al prototipo y no al backend.
5. No afirmar que TyA real esta conectado si el gate no paso.
6. No hardcodear TyA, Cinépolis, paises, periodos, cursos, certificaciones o reglas como unica estructura del producto.
7. Mantener TyA como seed/configuracion editable, no como motor fijo.
8. Incluir texto honesto para Make/Gemini/pagos/outbox: preparado, gate-off, no enviado/no escrito.
9. En Academia, explicar readiness y gates por rol/persona.
10. En configuracion de tenant/proyecto, impedir avanzar si source, roles, periodo y gates minimos estan incompletos.

## Auditoria siguiente candidata

Al revisar la nueva candidata, verificar que no solo haya mejoras visuales. Debe existir representacion operacional de readiness/gates y separacion TyA especifico vs reusable CXOrbia.
