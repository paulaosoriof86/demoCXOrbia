# MigrationBatch staging TyA / Cinepolis

Fecha: 2026-07-03
Estado: backend preparado en modo preview local, sin importacion.

## Archivo agregado

- `tools/migration/tya-build-staging-preview.ps1`

## Proposito

Construir un preview local con forma cercana a Firestore staging, sin escribir Firestore y sin importar datos.

El script toma V6 + V7.1, genera un `migrationBatch` local y produce archivos JSON/JSONL para revisar estructura antes de cualquier carga DEV.

## Salidas locales

El script genera en `tmp/tya-staging-preview`:

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
- `stagingPreviewReport.md`

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Frontend tocado: no.
- `/app/modules` tocado: no.
- DPI incluido: no.
- Por defecto, PII queda omitida del preview.
- El flag `-IncludePiiLocal` existe solo para uso local controlado, no para repo.

## Rutas Firestore propuestas

```text
tenants/{tenantId}/migrationBatches/{batchId}
tenants/{tenantId}/migrationBatches/{batchId}/previewVisits/{docId}
tenants/{tenantId}/migrationBatches/{batchId}/previewEvents/{docId}
tenants/{tenantId}/migrationBatches/{batchId}/previewLiquidationCandidates/{docId}
tenants/{tenantId}/migrationBatches/{batchId}/previewShoppers/{docId}
tenants/{tenantId}/migrationBatches/{batchId}/previewNotifications/{docId}
tenants/{tenantId}/migrationBatches/{batchId}/validationIssues/{docId}
tenants/{tenantId}/migrationBatches/{batchId}/rollbackPlan/{docId}
```

## Decisiones de mapeo

### Visitas
Destino futuro operativo:

```text
tenants/tya/projects/cinepolis/visits/{visitId}
```

En esta fase se quedan en preview local/staging. HR manda para visitas, fechas, cuestionarios, submitidos y liquidaciones base.

### Submitidos
Se modelan como eventos `submitted_by_tya`. No son accion del shopper.

### Liquidaciones
Se modelan solo como `previewLiquidationCandidates`. No son deuda final hasta cruce con Excel financiero externo.

### Shoppers
El preview excluye DPI. No fusiona duplicados automaticamente.

### Postulaciones
Se modelan como eventos `postulation`. La equivalencia `platformVisitKey -> hrVisitKey` queda pendiente de mapa canonico.

### Notificaciones
Se modelan como historial hasta resolver destinatario canonico.

## Uso local

```powershell
$Repo = "C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630"
$V6 = Join-Path $env:USERPROFILE "Downloads\ENTREGA_CXORBIA_TYA_MIGRACION_V6_20260703-005828.zip"
$V71 = Join-Path $env:USERPROFILE "Downloads\ENTREGA_CXORBIA_TYA_MIGRACION_V7_1_COMPLEMENTO_RTDB_20260703-023502.zip"
Set-Location $Repo
powershell -ExecutionPolicy Bypass -File .\tools\migration\tya-build-staging-preview.ps1 -V6Zip $V6 -V71Zip $V71
```

## Gate siguiente

Despues de revisar el preview local, el siguiente paso backend sera crear un importador DEV con `--dry-run` por defecto y escritura bloqueada hasta autorizacion explicita.
