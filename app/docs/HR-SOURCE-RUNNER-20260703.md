# HR Source runner

Fecha: 2026-07-03

Archivo agregado:

- `tools/hr-source/run-tya-hr-source-private-flow-check.ps1`

Objetivo:

- Ejecutar la validacion local HR Source privada.
- Generar reporte en Descargas.
- Mantener la importacion bloqueada.

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.

Uso local:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\hr-source\run-tya-hr-source-private-flow-check.ps1
```
