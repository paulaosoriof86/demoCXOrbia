# DEV import dry-run package TyA

Fecha: 2026-07-03
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Preparar un paquete de lectura/listo para revision antes de cualquier importacion DEV. Este paquete NO escribe Firestore y NO importa datos.

## Archivo tecnico creado

- `tools/migration/tya-build-dev-import-dry-run-package.mjs`

## Entradas esperadas

- `tmp/tya-canonical-staging/tyaCanonicalStagingPlan.json`
- `tmp/tya-firestore-write-plan/writePlanManifest.json`
- `tmp/tya-firestore-write-plan/importGate.json`

## Salidas locales

En:

```text
tmp/tya-dev-import-dry-run-package
```

Genera:

- `tyaDevImportDryRunPackage.json`
- `tyaDevImportDryRunPackage.md`

## Que consolida

- Estado de readiness.
- Conteos canonicos.
- Conteos del write plan.
- Bloqueantes criticos.
- Warnings.
- Autorizacion requerida.
- Proximos pasos.

## Gates

El paquete permanece bloqueado si existen:

- DPI/PII sin politica.
- `questionnaire_marks` duplicado.
- liquidaciones sin cruce financiero.
- notificaciones sin destinatario canonico.
- periodos/tablas en revision.
- falta plan canonico.
- falta write plan.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.
- canImport: false.
- canWriteToFirestore: false.
- executeAllowed: false.

## Uso local futuro

Desde la raiz del repo:

```powershell
node .\tools\migration\tya-build-dev-import-dry-run-package.mjs
```

No autoriza escritura. Si algun dia se crea escritura DEV real, debe ser otro runner separado, con autorizacion explicita de Paula y rollback probado.
