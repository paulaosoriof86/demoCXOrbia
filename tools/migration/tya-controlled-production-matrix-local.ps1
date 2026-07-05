param(
  [string]$SanitizedSummaryPath = "",
  [string]$OutputDir = "_diagnosticos/tya-release-readiness",
  [ValidateSet("markdown", "json")]
  [string]$Format = "markdown"
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "== $Message =="
}

Write-Host "================================================================================"
Write-Host "CXOrbia TyA - Controlled production matrix preview"
Write-Host "No deploy. No produccion. No merge. No import real. No proveedores reales."
Write-Host "================================================================================"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js no esta disponible en PATH."
}

if (-not (Test-Path "tools/migration/tya-controlled-production-matrix-preview.mjs")) {
  throw "No se encontro el generador de matriz."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$extension = if ($Format -eq "json") { "json" } else { "md" }
$outputPath = Join-Path $OutputDir "06-controlled-production-matrix-$stamp.$extension"

Write-Step "Generar matriz"
$args = @("tools/migration/tya-controlled-production-matrix-preview.mjs", "--output", $outputPath, "--format", $Format)
if ($SanitizedSummaryPath -and $SanitizedSummaryPath.Trim().Length -gt 0) {
  if (-not (Test-Path $SanitizedSummaryPath)) { throw "No se encontro SanitizedSummaryPath: $SanitizedSummaryPath" }
  $args += @("--input", $SanitizedSummaryPath)
  Write-Host "Usando summary: $SanitizedSummaryPath"
} else {
  Write-Host "Sin summary local. Se genera matriz conservadora con blockers conocidos."
}

& node @args
$exit = $LASTEXITCODE
if ($exit -eq 1) { throw "Generador fallo con codigo $exit" }
if ($exit -eq 2) { Write-Host "Matriz generada con issues de validacion/revision. Revisar salida." }

Write-Step "Salida"
Write-Host "Controlled production matrix: $outputPath"
Write-Host "Estado: matriz preview generada. No implica produccion, deploy, merge ni activacion real."
