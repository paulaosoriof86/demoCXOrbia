# CXOrbia - ejecucion obligatoria

Este archivo se lee antes de cualquier accion en el repositorio.

## Fuente prevalente

La metodologia vigente para empalmes ordinarios es:

`app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`

Antes de actuar se debe leer primero:

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- ultimo source lock;
- `CAMBIOS-BACKEND.md` y addenda;
- `RESUMEN-PARA-CLAUDE.md` y addenda;
- `PENDIENTES-PROTOTIPO.md` y addenda;
- estado de PR #7.

## Metodo obligatorio

Cuando una candidata esta auditada GO y no existe P0 demostrado:

1. aplicar directamente el delta auditado sobre `docs-tya-v6-v71-audit`;
2. preservar backend, contratos, adapters, tools, overlays TyA, datos source-safe y documentacion;
3. generar manifest, build-lock, verificador y registro;
4. crear commit/push verificables;
5. ejecutar gates y smoke despues del empalme;
6. solicitar validacion visual solo al cerrar el bloque tecnico.

Estados:

`AUDITED_GO_READY_DIRECT_APPLY -> APPLY_DELTA_DIRECTLY -> EMPALMED_PENDING_POST_GATES -> ACTIVE_BASELINE`

## Prohibiciones

No usar como requisito de empalme:

- carpeta `incoming/`;
- `EMPALME-*.json`;
- ejecutables `.cmd` o PowerShell para Paula;
- workflows, GitHub Actions, Drive, Base64, blobs o trees para transportar la candidata;
- nuevas ramas o PR;
- reauditoria general;
- nueva candidata;
- nueva metodologia.

## Multi-tenant y multi-proyecto

El motor pertenece a CXOrbia. TyA es multi-proyecto, sin proyecto global por defecto y con seleccion explicita. Cinepolis es solo el primer proyecto operativo; nunca es default ni logica global.

## Lock actual

V159 fue aplicada fisicamente por carril file-aware sobre `docs-tya-v6-v71-audit`.

- Fuente operativa: `Prototype development request CXOrbia V159.zip`.
- SHA-256 del adjunto usado: `d9d9e767bf6d9a26e0e084deed5d327d801620c36aee1a9bb3cc0c3db0e54ce2`.
- HEAD_BEFORE: `bf9c8f27500b26d547199d159659b58a42434811`.
- Manifest: `app/docs/MANIFEST-V159-EMPALME-DIRECTO-20260717.json`.
- Build lock: `app/core/build-lock.js`.
- Verificador: `tools/release/tya-v159-empalme-directo-verify.mjs`.
- Estado operativo: `EMPALMED_PENDING_POST_GATES`.

Despues corresponde gates post-empalme, validacion visual y continuidad Phase A. No hacer merge, deploy, produccion, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos sin autorizacion expresa.
