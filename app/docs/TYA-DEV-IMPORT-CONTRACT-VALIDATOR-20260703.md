# TyA DEV import contract validator

Fecha: 2026-07-03

Archivo agregado:

- `tools/migration/tya-dev-import-contract-validator.mjs`

Objetivo:

- Validar que el contrato DEV de importacion siga bloqueado.
- Impedir que un contrato permita escrituras por accidente.
- Revisar rutas multi-tenant propuestas.
- Revisar gates obligatorios antes de cualquier escritura futura.

Valida:

- `mode=PLAN_ONLY_LOCKED`.
- `tenantId=tya`.
- Firestore writes en 0.
- importsExecuted en 0.
- deploy en 0.
- canWriteToFirestore en false.
- canImport en false.
- executeAllowed en false.
- requiresExplicitFutureApproval en true.
- Todas las colecciones con writeAllowed false.
- Rutas bajo `tenants/tya/projects/{projectId}`.
- Gates minimos presentes.

Salidas locales:

- `tmp/tya-dev-import-contract-validation/tyaDevImportContractValidation.md`
- `tmp/tya-dev-import-contract-validation/tyaDevImportContractValidation.json`

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.

Uso local:

```powershell
node .\tools\migration\tya-dev-import-contract-validator.mjs
```
