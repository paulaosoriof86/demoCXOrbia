# RUNBOOK-FINANCE-BENEFITS-HR-V4-DRY-RUN-20260629

## Objetivo

Ejecutar validación local de beneficios shopper generados desde HR V4, sin escribir Firestore.

## Qué valida

- Que cada visita con shopper genere un `shopperBenefit` candidato.
- Que GT use GTQ y Q60 como honorario base.
- Que HN use HNL y L200 como honorario base.
- Que no existan IDs duplicados.
- Que no se mezclen beneficios calculados con pagos reales.
- Que pagos marcados como pagados tengan lote o movimiento para revisión.

## PowerShell

```powershell
$ErrorActionPreference = "Stop"

$repo = Get-ChildItem -Path $env:USERPROFILE -Directory -Filter "demoCXOrbia" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $repo) { throw "No encontré demoCXOrbia." }
Set-Location $repo.FullName

git checkout feat/firebase-backend-dev-config-20260627
git pull

$hr = Join-Path $repo.FullName "firebase\private-output\hr-tya-historico-good-firestore-transform-v4.json"
if (-not (Test-Path $hr)) { throw "No encontré HR V4 en firebase/private-output." }

node firebase/client-write-tools/run-finance-benefits-hr-v4-pipeline-dry-run.mjs --file="$hr"

$report = Join-Path $repo.FullName "firebase\private-output\finance-benefits-hr-v4-pipeline-dry-run-summary.md"
if (-not (Test-Path $report)) { throw "No se generó el reporte." }
Get-Content $report -Raw -Encoding UTF8 | Set-Clipboard
Write-Host "Reporte copiado al portapapeles:" $report
```

## Archivos esperados

```text
firebase/private-output/finance-benefits-from-hr-v4-dry-run.json
firebase/private-output/finance-benefits-from-hr-v4-dry-run-summary.md
firebase/private-output/finance-benefits-from-hr-v4-validation.json
firebase/private-output/finance-benefits-from-hr-v4-validation-summary.md
firebase/private-output/finance-benefits-hr-v4-pipeline-dry-run.json
firebase/private-output/finance-benefits-hr-v4-pipeline-dry-run-summary.md
```

## Gate

No cargar `shopperBenefits` a Firestore DEV hasta que Paula revise el reporte y autorice explícitamente.

## No hace

- No escribe Firestore.
- No publica reglas.
- No activa adapter.
- No toca frontend.
- No toca producción.
