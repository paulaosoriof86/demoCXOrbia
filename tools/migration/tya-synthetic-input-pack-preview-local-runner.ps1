param(
  [string]$ManifestPath = "tools/migration/synthetic-fixtures/phase-a/synthetic-input-pack-manifest.phase-a.preview.json",
  [string]$OutputDir = "_diagnosticos/tya-synthetic-pack",
  [switch]$ExecuteValidators,
  [switch]$SkipReadinessMap
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "== $Message =="
}

Write-Host "================================================================================"
Write-Host "CXOrbia TyA - Synthetic input pack preview local runner"
Write-Host "No deploy. No produccion. No escrituras reales. No proveedores reales."
Write-Host "================================================================================"

if (-not (Test-Path "app/contracts/synthetic-input-pack-preview-phase-a.tya.contract.json")) {
  throw "No se encontro el contrato synthetic-input-pack-preview-phase-a. Ejecuta este script desde la raiz del repo."
}

if (-not (Test-Path $ManifestPath)) {
  throw "No se encontro el manifest: $ManifestPath"
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js no esta disponible en PATH."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$mode = if ($ExecuteValidators) { "execute_preview" } else { "structure_preview" }
$runnerOutput = Join-Path $OutputDir "synthetic-pack-runner-$mode-$stamp.json"
$readinessOutput = Join-Path $OutputDir "synthetic-pack-readiness-map-$mode-$stamp.json"

Write-Step "Ejecutar runner synthetic pack"
$runnerArgs = @("tools/migration/tya-synthetic-input-pack-preview-runner.mjs", "--input", $ManifestPath)
if ($ExecuteValidators) {
  $runnerArgs += "--execute"
  Write-Host "Modo: validadores locales preview. No debe escribir ni llamar proveedores."
} else {
  Write-Host "Modo: estructura solamente. No ejecuta validadores."
}

& node @runnerArgs | Tee-Object -FilePath $runnerOutput
if ($LASTEXITCODE -ne 0) {
  throw "Runner termino con codigo $LASTEXITCODE. Revisa: $runnerOutput"
}

if (-not $SkipReadinessMap) {
  Write-Step "Mapear resultado a readiness preview"
  if (-not (Test-Path "tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs")) {
    throw "No se encontro el mapper readiness."
  }
  & node "tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs" --input $runnerOutput --output $readinessOutput
  if ($LASTEXITCODE -ne 0) {
    throw "Readiness mapper termino con codigo $LASTEXITCODE. Revisa: $readinessOutput"
  }
}

Write-Step "Salidas"
Write-Host "Runner report: $runnerOutput"
if (-not $SkipReadinessMap) { Write-Host "Readiness map: $readinessOutput" }
Write-Host "Estado: bloque local preview completado. No implica importacion ni salida a produccion."
