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
$ReportFile = Join-Path $env:USERPROFILE ("Downloads\CXORBIA_TYA_LOCAL_SAFE_PIPELINE_{0}.txt" -f $StartedAt.ToString("yyyyMMdd_HHmmss"))

Start-Transcript -Path $ReportFile -Force | Out-Null
try {
  Write-Host "CXOrbia - TyA local safe pipeline"
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
    "tools\backend\cx-data-contract-scan.mjs",
    "tools\backend\cx-backend-contract-check.mjs",
    "tools\hr-source\tya-hr-source-private-flow-check.mjs",
    "tools\hr-source\tya-hr-source-multitab-preview.mjs",
    "tools\migration\tya-dev-import-contract.mjs",
    "tools\migration\tya-dev-import-contract-validator.mjs",
    "tools\migration\tya-production-gates-matrix.mjs",
    "tools\migration\tya-dev-readiness-report.mjs"
  )
  foreach ($File in $Required) {
    if (!(Test-Path $File)) { throw "Falta archivo requerido: $File" }
    Write-Host "OK: $File"
  }

  Step "CX.data contract scan"
  node .\tools\backend\cx-data-contract-scan.mjs
  if ($LASTEXITCODE -ne 0) { throw "CX.data contract scan fallo" }

  Step "Backend contract check"
  node .\tools\backend\cx-backend-contract-check.mjs
  if ($LASTEXITCODE -ne 0) { throw "Backend contract check fallo" }

  Step "Staging preview"
  $PreviewDir = Join-Path $Repo "tmp\tya-staging-preview"
  if (!(Test-Path $PreviewDir)) { throw "Falta tmp\tya-staging-preview" }
  $env:CXORBIA_TYA_STAGING_PREVIEW_DIR = $PreviewDir

  Step "HR private flow"
  node .\tools\hr-source\tya-hr-source-private-flow-check.mjs
  Write-Host "Salida: $LASTEXITCODE"

  Step "HR multitab preview"
  node .\tools\hr-source\tya-hr-source-multitab-preview.mjs
  Write-Host "Salida: $LASTEXITCODE"

  Step "Contrato DEV"
  node .\tools\migration\tya-dev-import-contract.mjs
  Write-Host "Salida: $LASTEXITCODE"

  Step "Validador contrato DEV"
  node .\tools\migration\tya-dev-import-contract-validator.mjs
  if ($LASTEXITCODE -ne 0) { throw "Validador contrato fallo" }

  Step "Matriz gates"
  node .\tools\migration\tya-production-gates-matrix.mjs
  if ($LASTEXITCODE -ne 0) { throw "Matriz gates fallo" }

  Step "Readiness report"
  node .\tools\migration\tya-dev-readiness-report.mjs
  if ($LASTEXITCODE -ne 0) { throw "Readiness report fallo" }

  Step "Reportes"
  Write-Host "tmp\cx-data-contract-scan"
  Write-Host "tmp\cx-backend-contract-check"
  Write-Host "tmp\hr-source-private-flow-check"
  Write-Host "tmp\hr-source-private\multitab-preview"
  Write-Host "tmp\tya-dev-import-contract"
  Write-Host "tmp\tya-dev-import-contract-validation"
  Write-Host "tmp\tya-production-gates-matrix"
  Write-Host "tmp\tya-dev-readiness-report"

  Write-Host "Firestore writes: 0"
  Write-Host "Imports executed: 0"
  Write-Host "Deploy: 0"
}
finally {
  Stop-Transcript | Out-Null
  Write-Host "Reporte: $ReportFile"
}
