$ErrorActionPreference = "Stop"

param(
  [string]$Repo = "C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630",
  [string]$Branch = "docs-tya-v6-v71-audit"
)

function Step($Text) {
  Write-Host ""
  Write-Host "== $Text =="
}

$StartedAt = Get-Date
$ReportRoot = Join-Path $env:USERPROFILE "Downloads"
$ReportFile = Join-Path $ReportRoot ("CXORBIA_HR_SOURCE_PRIVATE_FLOW_CHECK_{0}.txt" -f $StartedAt.ToString("yyyyMMdd_HHmmss"))

Start-Transcript -Path $ReportFile -Force | Out-Null
try {
  Write-Host "============================================================"
  Write-Host "CXOrbia - HR Source private flow check"
  Write-Host "Fecha local: $($StartedAt.ToString('yyyy-MM-dd HH:mm:ss'))"
  Write-Host "Repo: $Repo"
  Write-Host "Rama: $Branch"
  Write-Host "Restricciones: sin deploy, sin Firestore writes, sin importacion"
  Write-Host "============================================================"

  Step "Validar repo"
  if (!(Test-Path $Repo)) { throw "No encontre el repo: $Repo" }
  Set-Location $Repo

  Step "Sincronizar rama"
  git fetch origin
  git checkout $Branch
  git pull origin $Branch
  $Head = git rev-parse --short HEAD
  Write-Host "HEAD actual: $Head"

  Step "Validar Node"
  $NodeVersion = node --version
  Write-Host "Node: $NodeVersion"

  Step "Validar archivos requeridos"
  $Required = @(
    "tools\hr-source\tya-hr-source-private-registry.mjs",
    "tools\hr-source\tya-hr-source-dev-server.mjs",
    "tools\hr-source\tya-hr-source-private-flow-check.mjs",
    "tools\hr-source\tya-hr-source-xlsx-lite.mjs",
    "tools\hr-source\tya-hr-source-multitab-preview.mjs"
  )
  foreach ($File in $Required) {
    if (!(Test-Path $File)) { throw "Falta archivo requerido: $File" }
    Write-Host "OK existe: $File"
  }

  Step "Validar staging preview"
  $PreviewDir = Join-Path $Repo "tmp\tya-staging-preview"
  if (!(Test-Path $PreviewDir)) {
    throw "No existe tmp\tya-staging-preview. Ejecuta primero el staging preview de migracion TyA."
  }
  Write-Host "OK staging preview: $PreviewDir"

  Step "Validar fuente privada"
  $PrivateDir = Join-Path $Repo "tmp\hr-source-private"
  $SafeRegistry = Join-Path $PrivateDir "sources.safe.json"
  $SecretRegistry = Join-Path $PrivateDir "sources.secrets.local.json"
  if (!(Test-Path $SafeRegistry) -or !(Test-Path $SecretRegistry)) {
    Write-Host "No encontre fuente privada registrada."
    Write-Host "El script puede usar CXORBIA_HR_SOURCE_URL si la definiste solo para esta sesion."
  } else {
    Write-Host "OK registro seguro local: $SafeRegistry"
    Write-Host "OK registro privado local: $SecretRegistry"
  }

  Step "Ejecutar flow check privado"
  $env:CXORBIA_TYA_STAGING_PREVIEW_DIR = $PreviewDir
  node .\tools\hr-source\tya-hr-source-private-flow-check.mjs

  Step "Resultado"
  $FlowDir = Join-Path $Repo "tmp\hr-source-private-flow-check"
  Write-Host "Reporte flow check: $FlowDir"
  Write-Host "Firestore writes: 0"
  Write-Host "Imports executed: 0"
  Write-Host "Deploy: 0"

  if (Test-Path (Join-Path $FlowDir "hrSourcePrivateFlowCheck.md")) {
    Write-Host ""
    Write-Host "Resumen generado:"
    Get-Content -Path (Join-Path $FlowDir "hrSourcePrivateFlowCheck.md") -Encoding UTF8
  }
}
finally {
  Stop-Transcript | Out-Null
  Write-Host ""
  Write-Host "Reporte copiado en: $ReportFile"
  try { Get-Content -Path $ReportFile -Raw -Encoding UTF8 | Set-Clipboard } catch {}
}
