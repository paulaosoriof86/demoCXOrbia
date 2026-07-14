# CXOrbia — fast-lane ejecutable para candidatas de prototipo

Fecha: 2026-07-14

## Por qué existe

Las reglas documentales no evitaron reincidencia. Desde este bloque, una candidata no se acepta por afirmación, checklist o memoria. Debe pasar un gate ejecutable.

## Regla fail-closed

Una candidata no puede convertirse en baseline, source lock ni empalmarse físicamente si falla cualquiera de estos controles:

1. `node --check` de todos los JavaScript.
2. `node docs/verify-manifest.mjs` literal con exit code 0.
3. Un solo `setProgram()` en `core/data.js`.
4. `currentProjectId` y `currentPeriodId` como estados almacenados independientes.
5. `project()` y `period()` no pueden ser aliases.
6. El selector de periodo debe usar `setCurrentPeriod()`.
7. El selector de proyecto debe usar `setCurrentProject()` o su alias único.
8. Mi Día debe usar el periodo activo por defecto y la vista agregada debe ser explícita.
9. Rankings y scoring solo pueden usar ratings numéricos autorizados.

Validador:

`tools/qa/verify-prototype-fastlane-gate.mjs`

Workflow focalizado:

`.github/workflows/cxorbia-prototype-fastlane-gate.yml`

## Flujo obligatorio

1. Extraer candidata.
2. Comparar únicamente contra la baseline inmediata.
3. Ejecutar el gate antes de redactar documentación o pedir otro paquete.
4. PASS: empalmar y documentar una sola vez.
5. FAIL: devolver únicamente los checks fallidos, con máximo tres tareas agrupadas.

## Control de tiempo

- Un solo batch local.
- Workflow máximo de cinco minutos únicamente en rama `phase-a/prototype-candidate-*`.
- No se usa PR #7 para diagnosticar candidatas.
- No se esperan workflows históricos.
- No se relee el repo completo.

## Resultado V112

V112 se verificó con este gate y obtuvo:

`FAIL_PROTOTYPE_FASTLANE_GATE`

PASS:

- Mi Día limitado al periodo activo por defecto.
- Ranking y scoring protegidos por rating numérico.
- Build lock declara V112 sobre V111.
- Sintaxis JavaScript válida.

FAIL:

- manifest literal: 37 diferencias, aggregate no coincide;
- existen dos definiciones de `setProgram()`;
- `currentProjectId` no es almacenamiento independiente, sino accessor derivado;
- `period()` sigue siendo alias de `project()`;
- `periodSel` llama a `setProject()` en lugar de `setCurrentPeriod()`.

Decisión: V112 no se empalma ni se convierte en source lock. V111 continúa como baseline auditada de continuidad. La siguiente corrección debe limitarse a estos fallos.

## Clasificación

- Reusable CXOrbia: gate ejecutable y fail-closed por candidata.
- Exclusivo TyA: ninguno.
- Claude/prototipo: corrección focalizada de V112.
- Academia: sin cambio funcional; conservar contenidos V111/V112.
- Sin impacto Claude: workflow, validador y política CI.
