# RUNBOOK-PIPELINE-FINANCIERO-TYA-DRY-RUN-20260629

## Objetivo

Ejecutar en una sola corrida el pipeline financiero TyA en modo dry-run, sin escribir Firestore.

## Script principal

```text
firebase/client-write-tools/run-financial-tya-pipeline-dry-run.mjs
```

## Qué ejecuta

1. Transformación estricta del Excel financiero TyA.
2. Validación de salida strict dry-run.
3. Cruce contra HR V4 si el JSON existe localmente.
4. Write-plan dry-run si existe crosscheck.
5. Reporte consolidado.

## Entradas

Obligatoria:

```text
--file="RUTA_EXCEL"
```

Opcional:

```text
--hr="firebase/private-output/hr-tya-historico-good-firestore-transform-v4.json"
```

## Salidas principales

```text
firebase/private-output/financial-tya-pipeline-dry-run.json
firebase/private-output/financial-tya-pipeline-dry-run-summary.md
```

También conserva las salidas de cada paso:

```text
financial-tya-strict-dry-run.json
financial-tya-strict-dry-run-summary.md
financial-tya-strict-dry-run-issues.csv
financial-tya-strict-dry-run-shopper-aliases.csv
financial-tya-strict-dry-run-validation.json
financial-tya-strict-vs-hr-v4-crosscheck.json
financial-tya-strict-vs-hr-v4-crosscheck-summary.md
financial-tya-strict-vs-hr-v4-crosscheck-issues.csv
financial-tya-write-plan-dry-run.json
financial-tya-write-plan-dry-run-summary.md
```

## Estados posibles

- `OK`: pipeline sin issues relevantes.
- `REVIEW`: pipeline ejecutado, pero requiere revisión de aliases, issues o skips.
- `FAIL`: error fuerte; no avanzar.

En esta etapa, `REVIEW` es normal y esperado porque hay nombres históricos, liquidaciones y movimientos que deben revisarse manualmente.

## PowerShell sugerido

```powershell
$ErrorActionPreference = "Stop"

$repo = Get-ChildItem -Path $env:USERPROFILE -Directory -Filter "demoCXOrbia" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $repo) { throw "No encontré demoCXOrbia." }
Set-Location $repo.FullName

git checkout feat/firebase-backend-dev-config-20260627
git pull

$toolDir = Join-Path $repo.FullName "firebase\client-write-tools"
npm --prefix $toolDir install

$excel = Get-ChildItem -Path $env:USERPROFILE -File -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "*Ingresos*Egresos*Presupuesto*Paula*.xlsx" -and $_.Name -notlike "~$*" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $excel) { throw "No encontré el Excel financiero." }

node firebase/client-write-tools/run-financial-tya-pipeline-dry-run.mjs --file="$($excel.FullName)"

$report = Join-Path $repo.FullName "firebase\private-output\financial-tya-pipeline-dry-run-summary.md"
if (-not (Test-Path $report)) { throw "No se generó el reporte." }
Get-Content $report -Raw -Encoding UTF8 | Set-Clipboard
Write-Host "Reporte copiado al portapapeles:" $report
```

## Restricción central

Este pipeline no escribe Firestore y no debe convertirse en carga real sin autorización explícita.

## Restricciones conservadas

- Sin escritura Firestore.
- Sin importación real.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin adapter global.
- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
