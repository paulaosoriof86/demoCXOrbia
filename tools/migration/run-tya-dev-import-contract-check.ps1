param(
  [string]$Repo = "C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630",
  [string]$Branch = "docs-tya-v6-v71-audit"
)

$ErrorActionPreference = "Stop"

function Step($Text) {
  Write-Host ""
  Write-Host "== $Text =="
}

$StartedAt = Get-Date
$ReportFile = Join-Path $env:USERPROFILE ("Downloads\CXORBIA_TYA_DEV_IMPORT_CONTRACT_CHECK_{0}.txt" -f $StartedAt.ToString("yyyyMMdd_HHmmss"))

Start-Transcript -Path $ReportFile -Force | Out-Null
try {
  Write-Host "CXOrbia - TyA DEV import contract check"
  Write-Host "Repo: $Repo"
  Write-Host "Rama: $Branch"
  Write-Host "Restricciones: sin deploy, sin Firestore writes, sin importacion"

  Step "Repo"
  if (!(Test-Path $Repo)) { throw "No encontre el repo: $Repo" }
  Set-Location $Repo
  git fetch origin
  git checkout $Branch
  git pull origin $Branch
  Write-Host "HEAD actual: $(git rev-parse --short HEAD)"

  Step "Node"
  node --version

  Step "Archivos requeridos"
  $Required = @(
    "tools\migration\tya-dev-import-contract.mjs",
    "tools\migration\tya-dev-import-contract-validator.mjs",
    "tools\migration\tya-build-staging-preview.ps1"
  )
  foreach ($File in $Required) {
    if (!(Test-Path $File)) { throw "Falta archivo requerido: $File" }
    Write-Host "OK: $File"
  }

  Step "Staging preview"
  $PreviewDir = Join-Path $Repo "tmp\tya-staging-preview"
  if (!(Test-Path $PreviewDir)) { throw "Falta tmp\tya-staging-preview" }
  $env:CXORBIA_TYA_STAGING_PREVIEW_DIR = $PreviewDir

  Step "Generar contrato DEV"
  node .\tools\migration\tya-dev-import-contract.mjs
  Write-Host "Salida contrato: $LASTEXITCODE"

  Step "Validar contrato DEV"
  node .\tools\migration\tya-dev-import-contract-validator.mjs
  if ($LASTEXITCODE -ne 0) { throw "Validador contrato fallo" }

  Step "Reportes"
  Write-Host "tmp\tya-dev-import-contract"
  Write-Host "tmp\tya-dev-import-contract-validation"
  Write-Host "Firestore writes: 0"
  Write-Host "Imports executed: 0"
  Write-Host "Deploy: 0"
}
finally {
  Stop-Transcript | Out-Null
  Write-Host "Reporte: $ReportFile"
}
