# TyA DEV import contract runner

Fecha: 2026-07-03

Archivo agregado:

- `tools/migration/run-tya-dev-import-contract-check.ps1`

Objetivo:

- Generar contrato DEV bloqueado.
- Validar contrato DEV en la misma ejecucion.
- Evitar pasos manuales separados.
- Generar reporte local en Descargas.

Flujo:

- Sincroniza rama.
- Valida Node.
- Valida archivos requeridos.
- Valida staging preview local.
- Ejecuta `tya-dev-import-contract.mjs`.
- Ejecuta `tya-dev-import-contract-validator.mjs`.
- Imprime resumen de contrato y validacion.

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.

Uso local:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\migration\run-tya-dev-import-contract-check.ps1
```
