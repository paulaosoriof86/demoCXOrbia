# CAMBIOS-BACKEND.md

## 2026-07-03 - Instruccion local pipeline seguro TyA

- Se agrego app/docs/INSTRUCCION-LOCAL-PIPELINE-SEGURO-TYA-20260703.md.
- El documento contiene un bloque unico PowerShell para validar localmente el pipeline seguro.
- La instruccion sincroniza rama, valida Node, ejecuta el pipeline y reporta salidas esperadas.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0.
- Mejora para Claude: la validacion local confirma los estados que el prototipo debe mostrar como preview, warning, bloqueado o pendiente backend.

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
