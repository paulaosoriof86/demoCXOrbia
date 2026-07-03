# Firestore write plan TyA / Cinépolis

Fecha: 2026-07-03
Estado: plan local sin escritura Firestore.

## Archivo agregado

- `tools/migration/tya-build-firestore-write-plan.ps1`

## Propósito

Preparar el siguiente paso de backend después del staging preview: convertir los archivos locales de preview en un plan explícito de escritura Firestore.

Este plan no escribe Firestore. Solo genera rutas, operaciones y payloads candidatos para revisión.

## Entradas esperadas

Carpeta local generada por el staging preview:

```text
tmp/tya-staging-preview
```

Debe contener:

- `migrationBatch.json`
- `firestorePathsPlan.json`
- `rollbackPlan.json`
- `previewVisits.jsonl`
- `previewSubmitidos.jsonl`
- `previewLiquidationCandidates.jsonl`
- `previewShoppers.jsonl`
- `previewPostulations.jsonl`
- `previewNotifications.jsonl`
- `validationIssues.jsonl`

## Salidas generadas

En `tmp/tya-firestore-write-plan`:

- `firestoreWritePlan.jsonl`
- `importGate.json`
- `writePlanManifest.json`
- `writePlanSample.json`
- `writePlanReport.md`

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Execute allowed: false.
- DPI included: false.
- Si el preview contiene PII local, el plan se bloquea salvo flag local explícito.
- El gate queda bloqueado si existen issues críticos.

## Gate de importación

El archivo `importGate.json` siempre deja:

```json
{
  "canWriteToFirestore": false,
  "requiresExplicitAuthorization": true,
  "requiredAuthorizationText": "PAULA_AUTORIZA_DEV_STAGING_WRITE"
}
```

La autorización real se implementará en un importador DEV separado, no en este script.

## Uso local

```powershell
$Repo = "C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630"
Set-Location $Repo
powershell -ExecutionPolicy Bypass -File .\tools\migration\tya-build-firestore-write-plan.ps1
```

## Siguiente paso

Cuando el plan esté revisado:

1. Resolver críticos activos.
2. Confirmar política DPI y cuestionarios.
3. Validar que las rutas correspondan al tenant/proyecto correcto.
4. Crear importador DEV con escritura deshabilitada por defecto.
5. Activar escritura solo con autorización explícita y rollback.
