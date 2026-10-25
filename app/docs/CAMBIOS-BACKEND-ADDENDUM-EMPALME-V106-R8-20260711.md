# Cambios backend — empalme V106 / R8

## Empalme

- R5 se usó como base operativa protegida.
- El frontend V106 se superpuso completo sin borrar archivos backend-only.
- Se incorporó el plan Firestore R6.
- Se regeneró la entrada source-safe desde el `index.html` V106.
- Se preservaron `core/tya-phase-a-*`, `data/tya-*`, contratos, tools, workflows y validadores.

## Executor R8

Se agregó un executor Firestore fail-closed:

- preflight por defecto;
- ejecución solo para Emulator con gates explícitos;
- `dev_clean` bloqueado en v1 hasta autorización separada y evidencia de base nueva/vacía;
- producción prohibida;
- `create` + `exists=false`;
- bloqueo si cualquier path ya existe;
- lotes máximo 400;
- reporte sin datos crudos;
- 0 rollback automático.

Validador R8: 5/5 PASS; preflight válido, ejecución sin gates bloqueada, intento dev_clean bloqueado, plan alterado bloqueado, 0 writes.

## Estado

Baseline continuidad local V106/R8 lista. Source lock final, smoke, import, materialización, deploy y producción siguen en HOLD.
