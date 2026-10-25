param(
  [string]$ManifestPath = "tools/migration/synthetic-fixtures/phase-a/synthetic-input-pack-manifest.phase-a.preview.json",
  [string]$OutputDir = "_diagnosticos/tya-release-readiness",
  [switch]$ExecuteValidators,
  [string]$PrototypeP0Status = "pending"
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "== $Message =="
}

Write-Host "================================================================================"
Write-Host "CXOrbia TyA - Synthetic pack to release readiness preview chain"
Write-Host "No deploy. No produccion. No escrituras reales. No proveedores reales."
Write-Host "================================================================================"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js no esta disponible en PATH."
}

$requiredFiles = @(
  "tools/migration/tya-synthetic-input-pack-preview-runner.mjs",
  "tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs",
  "tools/migration/tya-readiness-map-to-release-snapshot-preview-bridge.mjs",
  "tools/migration/tya-release-readiness-snapshot-preview-validator.mjs",
  "app/contracts/readiness-map-to-release-snapshot-bridge-phase-a.tya.contract.json",
  "app/contracts/release-readiness-snapshot-preview-phase-a.tya.contract.json",
  $ManifestPath
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) { throw "Falta archivo requerido: $file" }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$mode = if ($ExecuteValidators) { "execute_preview" } else { "structure_preview" }
$runnerOutput = Join-Path $OutputDir "01-synthetic-pack-runner-$mode-$stamp.json"
$mapOutput = Join-Path $OutputDir "02-synthetic-pack-readiness-map-$mode-$stamp.json"
$snapshotInput = Join-Path $OutputDir "03-release-readiness-snapshot-input-$mode-$stamp.json"
$snapshotReport = Join-Path $OutputDir "04-release-readiness-snapshot-report-$mode-$stamp.json"

Write-Step "1. Synthetic input pack runner"
$runnerArgs = @("tools/migration/tya-synthetic-input-pack-preview-runner.mjs", "--input", $ManifestPath)
if ($ExecuteValidators) { $runnerArgs += "--execute" }
& node @runnerArgs | Tee-Object -FilePath $runnerOutput
if ($LASTEXITCODE -ne 0) { throw "Synthetic runner termino con codigo $LASTEXITCODE" }

Write-Step "2. Synthetic pack readiness map"
& node "tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs" --input $runnerOutput --output $mapOutput
$mapExit = $LASTEXITCODE
if ($mapExit -eq 1) { throw "Readiness mapper fallo con codigo $mapExit" }
if ($mapExit -eq 2) { Write-Host "Mapper reporto estado bloqueado/revision. Se continua para generar snapshot preview con blockers." }

Write-Step "3. Bridge a release readiness snapshot input"
& node "tools/migration/tya-readiness-map-to-release-snapshot-preview-bridge.mjs" --input $mapOutput --output $snapshotInput --prototypeP0Status $PrototypeP0Status
if ($LASTEXITCODE -ne 0) { throw "Bridge termino con codigo $LASTEXITCODE" }

Write-Step "4. Release readiness snapshot validator"
& node "tools/migration/tya-release-readiness-snapshot-preview-validator.mjs" --input $snapshotInput | Tee-Object -FilePath $snapshotReport
if ($LASTEXITCODE -ne 0) { throw "Release readiness validator termino con codigo $LASTEXITCODE" }

Write-Step "Salidas"
Write-Host "Runner: $runnerOutput"
Write-Host "Map: $mapOutput"
Write-Host "Snapshot input: $snapshotInput"
Write-Host "Snapshot report: $snapshotReport"
Write-Host "Estado: cadena preview completada. No implica produccion, deploy, merge ni activacion real."
