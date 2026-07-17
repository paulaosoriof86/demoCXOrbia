# CXOrbia — ejecución obligatoria

Este archivo se lee antes de cualquier acción en el repositorio.

## Fuente prevalente

La única metodología vigente para empalmes ordinarios es:

`app/docs/ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-20260716.md`

También deben leerse:

- `backend/contracts/integration-lane-architecture-lock-v1.json`;
- `CAMBIOS-BACKEND.md` y sus addenda;
- `RESUMEN-PARA-CLAUDE.md` y sus addenda;
- `PENDIENTES-PROTOTIPO.md` y sus addenda;
- último source lock, tracker Phase A y PR #7.

## Método obligatorio basado en Orbit

Cuando una candidata está auditada GO y no existe P0 demostrado:

1. aplicar directamente el delta auditado sobre `docs-tya-v6-v71-audit` mediante operaciones autenticadas del repositorio;
2. preservar backend, contratos, adapters, tools, overlays TyA, datos source-safe y documentación;
3. generar manifest, build-lock, verificador y registro;
4. crear commit/push verificables;
5. ejecutar gates y smoke después del empalme;
6. solicitar validación visual solo al cerrar el bloque técnico.

Estado GO obligatorio:

`AUDITED_GO_READY_DIRECT_APPLY → APPLY_DELTA_DIRECTLY → EMPALMED_PENDING_POST_GATES → ACTIVE_BASELINE`

No se puede regresar desde GO a planificación, transporte, instalación o nueva metodología.

## Prohibiciones

Queda prohibido usar como requisito de empalme:

- carpeta `incoming/`;
- `EMPALME-*.json`;
- ejecutables `.cmd` o PowerShell para Paula;
- checkout local con ZIP como plano obligatorio;
- workflows, GitHub Actions, Drive, Base64, blobs o trees para transportar la candidata;
- nuevas ramas o PR;
- copias manuales archivo por archivo;
- reauditoría general;
- nueva candidata;
- nueva metodología.

Un bloqueo real debe clasificarse como `P0_PROVEN`, con evidencia reproducible. P1/P2 se documentan y no bloquean.

## Multi-tenant y multi-proyecto

El motor pertenece a CXOrbia. TyA es multi-proyecto, sin proyecto global por defecto y con selección explícita. Cinépolis es solo el primer proyecto operativo; nunca es default ni lógica global. Los siguientes proyectos TyA se crean/configuran desde plataforma y otros tenants reutilizan el motor con políticas propias.

## Control antidesvío

Ningún agente puede sustituir esta metodología por preferencia, demora, tamaño del ZIP o limitación temporal del conector.

Solo puede modificarse cuando existan simultáneamente:

- P0 demostrado;
- evidencia reproducible;
- compatibilidad multi-tenant/multi-proyecto;
- autorización expresa de Paula en la conversación actual;
- actualización conjunta del addendum prevalente, este archivo, contrato, validador y documentación obligatoria.

## Lock actual

V156 está `AUDITED_GO_READY_DIRECT_APPLY`, con 35 archivos modificados y 0 eliminados. La única operación válida es `APPLY_DELTA_DIRECTLY`. Sigue pendiente físicamente hasta tener commit/push, manifest y build-lock V156 verificables.