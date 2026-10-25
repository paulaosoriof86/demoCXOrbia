$ErrorActionPreference = "Stop"

param(
  [string]$Repo = "C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630",
  [string]$Branch = "docs-tya-v6-v71-audit",
  [int]$StaticPort = 5179,
  [int]$HrPort = 8787
)

function Step($Text) {
  Write-Host ""
  Write-Host "== $Text =="
}

$StartedAt = Get-Date
$ReportFile = Join-Path $env:USERPROFILE ("Downloads\CXORBIA_HR_SOURCE_OPEN_PREVIEW_{0}.txt" -f $StartedAt.ToString("yyyyMMdd_HHmmss"))

Start-Transcript -Path $ReportFile -Force | Out-Null
try {
  Write-Host "============================================================"
  Write-Host "CXOrbia - HR Source preview local"
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

  Step "Validar archivos"
  $Required = @(
    "app\index-backend-dev.html",
    "app\core\backend-hr-source-bridge.js",
    "tools\dev\cxorbia-static-preview-server.mjs",
    "tools\hr-source\tya-hr-source-dev-server.mjs"
  )
  foreach ($File in $Required) {
    if (!(Test-Path $File)) { throw "Falta archivo requerido: $File" }
    Write-Host "OK existe: $File"
  }

  Step "Validar staging preview"
  $PreviewDir = Join-Path $Repo "tmp\tya-staging-preview"
  if (!(Test-Path $PreviewDir)) { throw "No existe tmp\tya-staging-preview" }
  Write-Host "OK staging preview: $PreviewDir"

  Step "Cerrar procesos previos en puertos DEV"
  foreach ($Port in @($StaticPort, $HrPort)) {
    try {
      $Connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
      foreach ($Conn in $Connections) {
        if ($Conn.OwningProcess -and $Conn.OwningProcess -ne $PID) {
          Stop-Process -Id $Conn.OwningProcess -Force -ErrorAction SilentlyContinue
          Write-Host "Proceso previo cerrado en puerto $Port"
        }
      }
    } catch {}
  }

  Step "Iniciar endpoint HR Source DEV"
  $HrArgs = "`$env:CXORBIA_HR_SOURCE_PORT='$HrPort'; `$env:CXORBIA_TYA_STAGING_PREVIEW_DIR='$PreviewDir'; Set-Location '$Repo'; node .\tools\hr-source\tya-hr-source-dev-server.mjs"
  Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $HrArgs
  Start-Sleep -Seconds 2

  Step "Iniciar servidor static preview"
  $StaticArgs = "`$env:CXORBIA_STATIC_PREVIEW_PORT='$StaticPort'; Set-Location '$Repo'; node .\tools\dev\cxorbia-static-preview-server.mjs"
  Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $StaticArgs
  Start-Sleep -Seconds 2

  Step "Abrir preview backend"
  $Url = "http://127.0.0.1:$StaticPort/app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxHrSourceLocal=1"
  Write-Host "URL preview: $Url"
  Start-Process $Url

  Step "Resultado"
  Write-Host "Preview abierto. Revisa modulo Fuente de HR."
  Write-Host "Firestore writes: 0"
  Write-Host "Imports executed: 0"
  Write-Host "Deploy: 0"
  Write-Host ""
  Write-Host "Para cerrar la prueba: cierra las dos ventanas PowerShell que quedaron abiertas."
}
finally {
  Stop-Transcript | Out-Null
  Write-Host ""
  Write-Host "Reporte copiado en: $ReportFile"
  try { Get-Content -Path $ReportFile -Raw -Encoding UTF8 | Set-Clipboard } catch {}
}
