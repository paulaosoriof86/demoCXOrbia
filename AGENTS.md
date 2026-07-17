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

Un hallazgo solo detiene el empalme si cumple el criterio `P0_PROVEN` del addendum prevalente. Los hallazgos P1/P2 se documentan y no bloquean.

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

Una limitación de herramienta no autoriza una ruta alternativa. Debe registrarse con evidencia, sin pedir acciones manuales a Paula y sin cambiar el estado GO de la candidata.

## Lock actual

V159 está `AUDITED_GO_READY_DIRECT_APPLY`.

- Fuente: `Prototype development request (8).zip`.
- SHA-256: `8ac5b04dda594366e0f27f717ec5f660328b43d9109a44e5df36fdcabcb09bc6`.
- Delta V158→V159: 14 archivos modificados, 0 agregados y 0 eliminados.
- Delta runtime efectivo contra el árbol V156 ya presente en la rama: 17 archivos modificados y 0 eliminados.
- Sintaxis: 67 JS/MJS, 0 errores.
- Scripts locales: 64, 0 faltantes y 0 duplicados.
- Módulos: 49 IDs únicos, 0 duplicados.
- Secretos: 0 coincidencias de firmas verificadas.

La única operación válida sigue siendo `APPLY_DELTA_DIRECTLY`. V159 no está físicamente empalmada hasta tener commit/push, manifest y build-lock verificables. El conector disponible no admite transferencia autenticada de archivos montados y la metodología prohíbe sustituirla por Base64, blobs, trees, workflows o copias manuales.