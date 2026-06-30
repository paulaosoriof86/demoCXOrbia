# RUNBOOK-FINANCE-BENEFITS-FULL-PIPELINE-20260629

## Objetivo

Ejecutar de una sola vez el flujo completo de beneficios shopper desde HR V4:

```text
HR V4
→ shopperBenefits dry-run
→ validación shopperBenefits
→ write-plan dry-run
→ validación write-plan
```

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

node firebase/client-write-tools/run-finance-benefits-full-pipeline-dry-run.mjs --file="$hr"

$report = Join-Path $repo.FullName "firebase\private-output\finance-benefits-full-pipeline-dry-run-summary.md"
if (-not (Test-Path $report)) { throw "No se generó el reporte." }
Get-Content $report -Raw -Encoding UTF8 | Set-Clipboard
Write-Host "Reporte copiado al portapapeles:" $report
```

## Archivos generados

```text
firebase/private-output/finance-benefits-from-hr-v4-dry-run.json
firebase/private-output/finance-benefits-from-hr-v4-dry-run-summary.md
firebase/private-output/finance-benefits-from-hr-v4-validation.json
firebase/private-output/finance-benefits-from-hr-v4-validation-summary.md
firebase/private-output/finance-benefits-write-plan-dry-run.json
firebase/private-output/finance-benefits-write-plan-dry-run-summary.md
firebase/private-output/finance-benefits-write-plan-validation.json
firebase/private-output/finance-benefits-write-plan-validation-summary.md
firebase/private-output/finance-benefits-full-pipeline-dry-run.json
firebase/private-output/finance-benefits-full-pipeline-dry-run-summary.md
```

## Cómo interpretar

- `OK`: se puede pasar a revisión de carga DEV.
- `REVIEW`: no hay error crítico, pero hay puntos que Paula debe aprobar.
- `FAIL`: no cargar nada.

## Gate

No cargar `shopperBenefits` a Firestore DEV sin autorización explícita de Paula.

## No hace

- No escribe Firestore.
- No publica reglas.
- No activa adapter.
- No toca frontend.
- No toca producción.
