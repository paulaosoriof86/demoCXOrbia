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
$ReportFile = Join-Path $env:USERPROFILE ("Downloads\CXORBIA_TYA_LOCAL_SAFE_PIPELINE_{0}.txt" -f $StartedAt.ToString("yyyyMMdd_HHmmss"))

Start-Transcript -Path $ReportFile -Force | Out-Null
try {
  Write-Host "============================================================"
  Write-Host "CXOrbia - TyA local safe pipeline"
  Write-Host "Fecha local: $($StartedAt.ToString('yyyy-MM-dd HH:mm:ss'))"
  Write-Host "Repo: $Repo"
  Write-Host "Rama: $Branch"
  Write-Host "Restricciones: sin deploy, sin Firestore writes, sin importacion"
  Write-Host "============================================================"

  Step "Validar repo y sincronizar rama"
  if (!(Test-Path $Repo)) { throw "No encontre el repo: $Repo" }
  Set-Location $Repo
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
    "tools\hr-source\tya-hr-source-private-flow-check.mjs",
    "tools\hr-source\tya-hr-source-multitab-preview.mjs",
    "tools\migration\tya-dev-import-contract.mjs",
    "tools\migration\tya-dev-import-contract-validator.mjs",
    "tools\migration\tya-production-gates-matrix.mjs",
    "tools\migration\run-tya-dev-import-contract-check.ps1"
  )
  foreach ($File in $Required) {
    if (!(Test-Path $File)) { throw "Falta archivo requerido: $File" }
    Write-Host "OK existe: $File"
  }

  Step "Validar staging preview"
  $PreviewDir = Join-Path $Repo "tmp\tya-staging-preview"
  if (!(Test-Path $PreviewDir)) {
    throw "No existe tmp\tya-staging-preview. Ejecuta primero el staging preview TyA."
  }
  Write-Host "OK staging preview: $PreviewDir"
  $env:CXORBIA_TYA_STAGING_PREVIEW_DIR = $PreviewDir

  Step "HR Source private flow check"
  node .\tools\hr-source\tya-hr-source-private-flow-check.mjs
  $FlowExit = $LASTEXITCODE
  Write-Host "Salida HR private flow: $FlowExit"
  if ($FlowExit -ne 0) {
    Write-Host "HR private flow quedo con warning/bloqueo. Continua pipeline seguro para contrato bloqueado."
  }

  Step "HR Source multitab preview"
  node .\tools\hr-source\tya-hr-source-multitab-preview.mjs
  $MultitabExit = $LASTEXITCODE
  Write-Host "Salida multitab preview: $MultitabExit"
  if ($MultitabExit -ne 0) {
    Write-Host "Multitab preview quedo con warning/bloqueo. Continua contrato bloqueado."
  }

  Step "Contrato DEV bloqueado"
  node .\tools\migration\tya-dev-import-contract.mjs
  $ContractExit = $LASTEXITCODE
  Write-Host "Salida contrato DEV: $ContractExit"
  if ($ContractExit -ne 0) {
    Write-Host "Contrato DEV reporto estado bloqueado. Esto es esperado si hay gates pendientes."
  }

  Step "Validar contrato DEV"
  node .\tools\migration\tya-dev-import-contract-validator.mjs
  $ValidatorExit = $LASTEXITCODE
  Write-Host "Salida validador contrato: $ValidatorExit"
  if ($ValidatorExit -ne 0) { throw "Validador del contrato DEV fallo. Revisar reporte." }

  Step "Matriz de gates DEV/Staging/Produccion"
  node .\tools\migration\tya-production-gates-matrix.mjs
  $GatesExit = $LASTEXITCODE
  Write-Host "Salida matriz gates: $GatesExit"
  if ($GatesExit -ne 0) { throw "Matriz de gates fallo. Revisar reporte." }

  Step "Resumen de reportes"
  $ReportDirs = @(
    "tmp\hr-source-private-flow-check",
    "tmp\hr-source-private\multitab-preview",
    "tmp\tya-dev-import-contract",
    "tmp\tya-dev-import-contract-validation",
    "tmp\tya-production-gates-matrix"
  )
  foreach ($Dir in $ReportDirs) {
    $Full = Join-Path $Repo $Dir
    Write-Host "Reporte: $Full"
  }

  Write-Host ""
  Write-Host "Pipeline seguro completado."
  Write-Host "Firestore writes: 0"
  Write-Host "Imports executed: 0"
  Write-Host "Deploy: 0"
}
finally {
  Stop-Transcript | Out-Null
  Write-Host ""
  Write-Host "Reporte copiado en: $ReportFile"
  try { Get-Content -Path $ReportFile -Raw -Encoding UTF8 | Set-Clipboard } catch {}
}
