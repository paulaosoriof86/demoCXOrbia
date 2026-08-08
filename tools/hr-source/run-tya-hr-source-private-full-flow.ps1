# CXOrbia TyA - HR Source private full flow runner
# Fecha: 2026-07-03
# Restricciones: NO deploy, NO importacion, NO Firestore writes, NO produccion

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ExpectedRemote = "paulaosoriof86/demoCXOrbia"
$Branch = "docs-tya-v6-v71-audit"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

function Add-Line($Text){
  Write-Host $Text
  if($script:ReportPath){ $Text | Out-File -FilePath $script:ReportPath -Append -Encoding UTF8 }
}

function Find-GitRootFrom($StartPath) {
  try {
    $root = (git -C $StartPath rev-parse --show-toplevel 2>$null).Trim()
    if ($root) { return $root }
  } catch {}
  return $null
}

function RemoteMatches($Path) {
  try {
    $remote = git -C $Path remote -v | Out-String
    return ($remote -match [regex]::Escape($ExpectedRemote))
  } catch { return $false }
}

function Find-Repo {
  $candidates = New-Object System.Collections.Generic.List[string]
  $pwdRoot = Find-GitRootFrom (Get-Location).Path
  if ($pwdRoot) { $candidates.Add($pwdRoot) }
  $oneDrive = Join-Path $env:USERPROFILE "OneDrive\Documentos\GitHub"
  $docs = Join-Path $env:USERPROFILE "Documentos\GitHub"
  foreach ($root in @($oneDrive,$docs)) {
    if (Test-Path $root) {
      Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "demoCXOrbia*" } | ForEach-Object { $candidates.Add($_.FullName) }
    }
  }
  foreach ($c in ($candidates | Select-Object -Unique)) {
    if ((Test-Path (Join-Path $c ".git")) -and (RemoteMatches $c)) { return $c }
  }
  throw "No encontre repo local con remote $ExpectedRemote."
}

$Repo = Find-Repo
$ReportDir = Join-Path $Repo "tmp\hr-source-private-full-flow"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
$script:ReportPath = Join-Path $ReportDir "runner-private-full-flow-$Stamp.txt"

Add-Line "============================================================"
Add-Line "CXOrbia TyA - HR Source private full flow"
Add-Line "Fecha local: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add-Line "Repo detectado: $Repo"
Add-Line "Rama esperada: $Branch"
Add-Line "Restricciones: NO deploy, NO importacion, NO Firestore writes, NO produccion"
Add-Line "============================================================"

Set-Location $Repo

git fetch origin | Out-Null
git checkout $Branch | Out-Null
git pull --ff-only origin $Branch | Out-Null
$curBranch = (git branch --show-current).Trim()
$head = (git rev-parse HEAD).Trim()
Add-Line "Rama actual: $curBranch"
Add-Line "HEAD: $head"
if($curBranch -ne $Branch){ throw "Rama incorrecta: $curBranch" }

$remote = git remote -v | Out-String
if($remote -notmatch [regex]::Escape($ExpectedRemote)){ throw "Remote incorrecto. Detenido." }

if(-not $env:CXORBIA_HR_SOURCE_URL){
  Add-Line ""
  Add-Line "Pega la URL HR SOLO en esta consola local. No se imprime ni se sube al repo."
  $env:CXORBIA_HR_SOURCE_URL = Read-Host "URL HR privada"
}
if(-not $env:CXORBIA_HR_SOURCE_URL){ throw "No se recibio URL HR privada." }

Add-Line ""
Add-Line "Ejecutando full flow privado..."
node .\tools\hr-source\tya-hr-source-private-full-flow.mjs 2>&1 | Tee-Object -FilePath $script:ReportPath -Append

Add-Line ""
Add-Line "Estado seguro final:"
Add-Line "- Firestore writes: 0"
Add-Line "- Imports executed: 0"
Add-Line "- Deploy: 0"
Add-Line "- Produccion: 0"
Add-Line "- canImport esperado: false"
Add-Line ""
Add-Line "Reporte runner: $script:ReportPath"
Add-Line "Reporte flow: $ReportDir\hrSourcePrivateFullFlow.md"

try {
  Get-Content -Raw $script:ReportPath | Set-Clipboard
  Add-Line "Reporte copiado al portapapeles."
} catch {
  Add-Line "No se pudo copiar al portapapeles."
}
