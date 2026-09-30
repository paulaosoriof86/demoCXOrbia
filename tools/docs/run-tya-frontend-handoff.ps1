param(
  [string]$Repo = "C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630",
  [string]$Branch = "docs-tya-v6-v71-audit"
)

$ErrorActionPreference = "Stop"

$StartedAt = Get-Date
$ReportFile = Join-Path $env:USERPROFILE ("Downloads\CXORBIA_TYA_FRONTEND_HANDOFF_{0}.txt" -f $StartedAt.ToString("yyyyMMdd_HHmmss"))

Start-Transcript -Path $ReportFile -Force | Out-Null
try {
  Write-Host "CXOrbia - TyA frontend handoff"
  Write-Host "Repo: $Repo"
  Write-Host "Rama: $Branch"
  Write-Host "Restricciones: sin deploy, sin carga, sin escritura"

  if (!(Test-Path $Repo)) { throw "No encontre el repo: $Repo" }
  Set-Location $Repo
  git fetch origin
  git checkout $Branch
  git pull origin $Branch
  node --version
  node .\tools\docs\build-tya-frontend-handoff.mjs
  Write-Host "Salida: tmp\tya-frontend-handoff"
}
finally {
  Stop-Transcript | Out-Null
  Write-Host "Reporte: $ReportFile"
}
