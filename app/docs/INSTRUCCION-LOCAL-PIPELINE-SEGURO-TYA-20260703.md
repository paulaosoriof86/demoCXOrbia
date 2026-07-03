# Instruccion local - Pipeline seguro TyA

Fecha: 2026-07-03

## Objetivo

Ejecutar una sola validacion local segura del pipeline TyA sin deploy, sin Firestore writes y sin importacion.

## Bloque unico PowerShell

Copiar y pegar completo en PowerShell:

```powershell
$ErrorActionPreference = "Stop"

$Repo = "C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630"
$Branch = "docs-tya-v6-v71-audit"
$StartedAt = Get-Date
$ReportFile = Join-Path $env:USERPROFILE ("Downloads\CXORBIA_TYA_PIPELINE_SEGURO_VALIDACION_{0}.txt" -f $StartedAt.ToString("yyyyMMdd_HHmmss"))

Start-Transcript -Path $ReportFile -Force | Out-Null
try {
  Write-Host "============================================================"
  Write-Host "CXOrbia - Validacion local pipeline seguro TyA"
  Write-Host "Fecha local: $($StartedAt.ToString('yyyy-MM-dd HH:mm:ss'))"
  Write-Host "Repo: $Repo"
  Write-Host "Rama: $Branch"
  Write-Host "Restricciones: sin deploy, sin Firestore writes, sin importacion"
  Write-Host "============================================================"

  if (!(Test-Path $Repo)) { throw "No encontre el repo: $Repo" }
  Set-Location $Repo

  Write-Host ""
  Write-Host "== Sincronizar rama =="
  git fetch origin
  git checkout $Branch
  git pull origin $Branch
  git status --short
  $Head = git rev-parse --short HEAD
  Write-Host "HEAD actual: $Head"

  Write-Host ""
  Write-Host "== Validar Node =="
  node --version

  Write-Host ""
  Write-Host "== Ejecutar pipeline seguro =="
  powershell -ExecutionPolicy Bypass -File .\tools\migration\run-tya-local-safe-pipeline.ps1
  if ($LASTEXITCODE -ne 0) { throw "Pipeline seguro finalizo con error. Revisar reportes." }

  Write-Host ""
  Write-Host "== Reportes esperados =="
  $ReportDirs = @(
    "tmp\hr-source-private-flow-check",
    "tmp\hr-source-private\multitab-preview",
    "tmp\tya-dev-import-contract",
    "tmp\tya-dev-import-contract-validation",
    "tmp\tya-production-gates-matrix"
  )
  foreach ($Dir in $ReportDirs) {
    $Full = Join-Path $Repo $Dir
    if (Test-Path $Full) { Write-Host "OK reporte: $Full" } else { Write-Host "WARN no existe aun: $Full" }
  }

  Write-Host ""
  Write-Host "== Seguridad esperada =="
  Write-Host "Firestore writes: 0"
  Write-Host "Imports executed: 0"
  Write-Host "Deploy: 0"
  Write-Host "canImport debe permanecer false"
  Write-Host "executeAllowed debe permanecer false"
}
finally {
  Stop-Transcript | Out-Null
  Write-Host ""
  Write-Host "Reporte principal: $ReportFile"
  try { Get-Content -Path $ReportFile -Raw -Encoding UTF8 | Set-Clipboard } catch {}
}
```

## Que revisar al terminar

- Que el reporte indique Firestore writes 0.
- Que el reporte indique imports executed 0.
- Que el reporte indique deploy 0.
- Que el contrato quede bloqueado si hay gates pendientes.
- Que exista matriz de gates en `tmp/tya-production-gates-matrix`.
- Que no se haya hecho merge ni deploy.

## Resultado correcto aunque haya blockers

Si el pipeline muestra blockers por PII, duplicados, encoding, notificaciones, liquidaciones o gates de produccion, eso es correcto. La finalidad de esta corrida es validar que el pipeline bloquea de forma segura y no ejecuta escrituras.
