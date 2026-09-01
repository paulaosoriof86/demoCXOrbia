# TyA local safe pipeline

Fecha: 2026-07-03

Archivo agregado:

- `tools/migration/run-tya-local-safe-pipeline.ps1`

Objetivo:

- Encadenar HR Source preview, preview multitab, contrato DEV, validacion y matriz de gates.
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
- Genera matriz de gates DEV/Staging/Produccion.
- Genera reporte local en Descargas.

Salidas principales:

- `tmp/hr-source-private-flow-check/`
- `tmp/hr-source-private/multitab-preview/`
- `tmp/tya-dev-import-contract/`
- `tmp/tya-dev-import-contract-validation/`
- `tmp/tya-production-gates-matrix/`

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canImport permanece false.

Mejora para Claude:

- El prototipo debe reflejar la matriz de gates de forma visual, separando preview, importacion DEV, staging y produccion.
- No debe permitir que una vista de preview se interprete como importacion real.

Uso local:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\migration\run-tya-local-safe-pipeline.ps1
```
