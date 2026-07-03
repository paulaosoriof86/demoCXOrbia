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
$ReportFile = Join-Path $env:USERPROFILE ("Downloads\CXORBIA_TYA_DEV_IMPORT_CONTRACT_CHECK_{0}.txt" -f $StartedAt.ToString("yyyyMMdd_HHmmss"))

Start-Transcript -Path $ReportFile -Force | Out-Null
try {
  Write-Host "============================================================"
  Write-Host "CXOrbia - TyA DEV import contract check"
  Write-Host "Fecha local: $($StartedAt.ToString('yyyy-MM-dd HH:mm:ss'))"
  Write-Host "Repo: $Repo"
  Write-Host "Rama: $Branch"
  Write-Host "Restricciones: sin deploy, sin Firestore writes, sin importacion"
  Write-Host "============================================================"

  Step "Validar repo y rama"
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
    "tools\migration\tya-dev-import-contract.mjs",
    "tools\migration\tya-dev-import-contract-validator.mjs",
    "tools\migration\tya-build-staging-preview.ps1"
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

  Step "Generar contrato DEV bloqueado"
  $env:CXORBIA_TYA_STAGING_PREVIEW_DIR = $PreviewDir
  node .\tools\migration\tya-dev-import-contract.mjs
  $ContractExit = $LASTEXITCODE
  Write-Host "Salida contrato: $ContractExit"
  if ($ContractExit -ne 0) {
    Write-Host "Contrato genero estado bloqueado o con revision requerida. Continua validacion de seguridad."
  }

  Step "Validar contrato DEV"
  node .\tools\migration\tya-dev-import-contract-validator.mjs
  $ValidatorExit = $LASTEXITCODE
  Write-Host "Salida validador: $ValidatorExit"
  if ($ValidatorExit -ne 0) { throw "Validador del contrato DEV fallo. Revisar reporte." }

  Step "Reportes locales"
  $ContractDir = Join-Path $Repo "tmp\tya-dev-import-contract"
  $ValidationDir = Join-Path $Repo "tmp\tya-dev-import-contract-validation"
  Write-Host "Contrato: $ContractDir"
  Write-Host "Validacion: $ValidationDir"
  Write-Host "Firestore writes: 0"
  Write-Host "Imports executed: 0"
  Write-Host "Deploy: 0"

  if (Test-Path (Join-Path $ContractDir "tyaDevImportContract.md")) {
    Write-Host ""
    Write-Host "Resumen contrato:"
    Get-Content -Path (Join-Path $ContractDir "tyaDevImportContract.md") -Encoding UTF8
  }
  if (Test-Path (Join-Path $ValidationDir "tyaDevImportContractValidation.md")) {
    Write-Host ""
    Write-Host "Resumen validacion:"
    Get-Content -Path (Join-Path $ValidationDir "tyaDevImportContractValidation.md") -Encoding UTF8
  }
}
finally {
  Stop-Transcript | Out-Null
  Write-Host ""
  Write-Host "Reporte copiado en: $ReportFile"
  try { Get-Content -Path $ReportFile -Raw -Encoding UTF8 | Set-Clipboard } catch {}
}
