# TyA local safe pipeline

Fecha: 2026-07-03

Archivo agregado:

- `tools/migration/run-tya-local-safe-pipeline.ps1`

Objetivo:

- Encadenar HR Source preview, preview multitab, contrato DEV y validacion.
- Reducir pasos manuales.
- Mantener todo bloqueado y sin escrituras.

Flujo:

- Sincroniza rama.
- Valida Node.
- Valida archivos requeridos.
- Valida staging preview local.
- Ejecuta HR Source private flow check.
- Ejecuta HR Source multitab preview.
- Genera contrato DEV bloqueado.
- Valida contrato DEV.
- Genera reporte local en Descargas.

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canImport permanece false.

Uso local:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\migration\run-tya-local-safe-pipeline.ps1
```
