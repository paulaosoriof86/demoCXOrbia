# CAMBIOS-BACKEND.md

## 2026-07-03 - Resumen ejecutivo pipeline seguro TyA

- Se agrego app/docs/RESUMEN-EJECUTIVO-PIPELINE-SEGURO-TYA-20260703.md.
- El documento consolida objetivo, rama, script principal, salidas locales, estado esperado, gates bloqueantes, reglas para Claude y continuidad incremental.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0.
- Mejora para Claude: usar el resumen como referencia para reflejar HR Source, estados honestos y matriz de gates en el prototipo visual.

## 2026-07-03 - Pipeline seguro actualizado con matriz de gates

- Se actualizo tools/migration/run-tya-local-safe-pipeline.ps1 para ejecutar tambien tools/migration/tya-production-gates-matrix.mjs.
- Se actualizo app/docs/TYA-LOCAL-SAFE-PIPELINE-20260703.md con la nueva salida tmp/tya-production-gates-matrix.
- El pipeline unico ahora encadena HR Source private flow, preview multitab, contrato DEV, validador de contrato y matriz de gates.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0.
- Mejora para Claude: el prototipo debe reflejar visualmente gates por fase y no confundir preview con importacion real.

## 2026-07-03 - Matriz de gates TyA

- Archivo agregado: tools/migration/tya-production-gates-matrix.mjs.
- Documento agregado: app/docs/TYA-PRODUCTION-GATES-MATRIX-20260703.md.
- Se separan fases: DEV preview, DEV import, staging y produccion.
- Se documentan gates pendientes antes de cualquier escritura o publicacion.
- Se mantiene seguridad: Firestore writes 0, imports executed 0, deploy 0.
- Mejora para Claude: mostrar estados reales de gates y no presentar preview como importacion final.

## 2026-07-03 - Pipeline local seguro TyA y contrato DEV

- Se agrego tools/migration/tya-dev-import-contract.mjs para generar contrato formal de importacion DEV bloqueado.
- Se agrego tools/migration/tya-dev-import-contract-validator.mjs para validar que ningun contrato permita escritura accidental.
- Se agrego tools/migration/run-tya-dev-import-contract-check.ps1 para generar y validar contrato DEV en una sola ejecucion local.
- Se agrego tools/migration/run-tya-local-safe-pipeline.ps1 para encadenar HR Source private flow, preview multitab, contrato DEV y validacion.
- Documentos agregados: app/docs/TYA-DEV-IMPORT-CONTRACT-20260703.md, app/docs/TYA-DEV-IMPORT-CONTRACT-VALIDATOR-20260703.md, app/docs/TYA-DEV-IMPORT-CONTRACT-RUNNER-20260703.md, app/docs/TYA-LOCAL-SAFE-PIPELINE-20260703.md.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0, canWriteToFirestore=false, executeAllowed=false, canImport=false.
- Mejora para Claude documentada: los estados de sincronizacion/importacion deben ser honestos y no deben presentarse como importacion ejecutada hasta autorizacion real.

## 2026-07-03 - HR Source backend DEV, fuente privada y preview local

- Se agrego app/core/backend-hr-source-bridge.js para escuchar eventos del modulo HR Source y llamar un endpoint backend DEV sin tocar la logica de UI.
- Se actualizo app/index-backend-dev.html para cargar HR Source y el bridge en preview backend DEV.
- Se actualizo app/core/backend-config-preview-dev.js para permitir endpoint HR Source local con parametros DEV.
- Se agrego tools/hr-source/tya-hr-source-dev-server.mjs como endpoint local para test, preview y sync-request.
- Se agregaron validadores locales, registro privado local, live check, preview multi-tab XLSX, endpoint con tabs vivos, servidor static preview y runners locales.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0, canImport=false.
