<#
CXOrbia TyA - Local real-data preview preflight helper
Safe helper. No deploy, no production, no imports, no writes, no runtime switch.

Usage examples:
  powershell -ExecutionPolicy Bypass -File tools/contracts/tya-local-realdata-preview-preflight.ps1
  powershell -ExecutionPolicy Bypass -File tools/contracts/tya-local-realdata-preview-preflight.ps1 -InputPath ".tmp/tya-hr-source-private-full-flow/report.json"
  powershell -ExecutionPolicy Bypass -File tools/contracts/tya-local-realdata-preview-preflight.ps1 -InputPath ".tmp/tya-hr-source-private-full-flow/report.json" -ShoppersPath "C:\ruta\shoppers-sanitizados.json" -CertificationsPath "C:\ruta\certificaciones-sanitizadas.json" -LiquidationsPath "C:\ruta\liquidaciones-sanitizadas.json"
#>

param(
  [string]$InputPath = "",
  [string]$ShoppersPath = "",
  [string]$CertificationsPath = "",
  [string]$LiquidationsPath = "",
  [string]$OutDir = ".tmp/tya-local-realdata-preview-preflight"
)

$ErrorActionPreference = "Stop"

Write-Host "CXOrbia TyA - local real-data preview preflight" -ForegroundColor Cyan
Write-Host "Seguro: sin deploy, sin produccion, sin imports, sin writes, sin runtime switch." -ForegroundColor Yellow

if (-not (Test-Path "tools/contracts/tya-local-realdata-preview-preflight.mjs")) {
  throw "No se encontro tools/contracts/tya-local-realdata-preview-preflight.mjs. Ejecutar desde la raiz del repo."
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  throw "Node.js no esta disponible en PATH. Instalar/activar Node antes de ejecutar."
}

$argsList = @("tools/contracts/tya-local-realdata-preview-preflight.mjs", "--out", $OutDir)
if ($InputPath -and $InputPath.Trim().Length -gt 0) {
  $argsList += @("--input", $InputPath)
}
if ($ShoppersPath -and $ShoppersPath.Trim().Length -gt 0) {
  $argsList += @("--shoppers", $ShoppersPath)
}
if ($CertificationsPath -and $CertificationsPath.Trim().Length -gt 0) {
  $argsList += @("--certifications", $CertificationsPath)
}
if ($LiquidationsPath -and $LiquidationsPath.Trim().Length -gt 0) {
  $argsList += @("--liquidations", $LiquidationsPath)
}

Write-Host "Ejecutando preflight..." -ForegroundColor Cyan
& node @argsList
$exit = $LASTEXITCODE

$reportMd = Join-Path $OutDir "local-realdata-preview-preflight-report.md"
$reportJson = Join-Path $OutDir "local-realdata-preview-preflight-report.json"

Write-Host ""
Write-Host "Salida esperada:" -ForegroundColor Cyan
Write-Host "- $reportMd"
Write-Host "- $reportJson"

if (Test-Path $reportMd) {
  Write-Host ""
  Write-Host "Resumen:" -ForegroundColor Cyan
  Get-Content $reportMd | Select-Object -First 80
}

if ($exit -ne 0) {
  Write-Host ""
  Write-Host "Preflight termino con NO-GO o error. Revisar reporte; no hacer deploy ni runtime switch." -ForegroundColor Red
  exit $exit
}

Write-Host ""
Write-Host "Preflight completo. Esto NO autoriza produccion ni runtime switch." -ForegroundColor Green
exit 0
