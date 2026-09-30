param(
  [Parameter(Mandatory=$true)]
  [string]$SnapshotReportPath,
  [string]$OutputDir = "_diagnosticos/tya-release-readiness",
  [ValidateSet("markdown", "json_summary")]
  [string]$Format = "markdown"
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "== $Message =="
}

Write-Host "================================================================================"
Write-Host "CXOrbia TyA - Release readiness sanitized report"
Write-Host "No deploy. No produccion. No datos sensibles. No proveedores reales."
Write-Host "================================================================================"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js no esta disponible en PATH."
}

if (-not (Test-Path $SnapshotReportPath)) {
  throw "No se encontro el reporte snapshot: $SnapshotReportPath"
}

if (-not (Test-Path "tools/migration/tya-release-readiness-sanitized-report.mjs")) {
  throw "No se encontro el generador de reporte sanitizado."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$extension = if ($Format -eq "json_summary") { "json" } else { "md" }
$outputPath = Join-Path $OutputDir "05-release-readiness-sanitized-report-$stamp.$extension"

Write-Step "Generar reporte sanitizado"
& node "tools/migration/tya-release-readiness-sanitized-report.mjs" --input $SnapshotReportPath --output $outputPath --format $Format
if ($LASTEXITCODE -ne 0) {
  throw "Generador termino con codigo $LASTEXITCODE"
}

Write-Step "Salida"
Write-Host "Sanitized report: $outputPath"
Write-Host "Estado: reporte sanitizado generado localmente. No implica produccion, deploy, merge ni activacion real."
