$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host '== CXOrbia DEV local validations =='
Write-Host 'No publica reglas. No crea usuarios. No escribe Firestore. No toca produccion.'

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm no esta disponible. Instala Node.js antes de ejecutar este bloque.'
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

Write-Host '== Validacion 1/2: Firestore rules emulator =='
& powershell -ExecutionPolicy Bypass -File .\firebase\emulator-rules\run-emulator-rules.ps1

Set-Location $repoRoot
Write-Host '== Validacion 2/2: Admin dry checks =='
& powershell -ExecutionPolicy Bypass -File .\firebase\admin-tools\run-admin-dry-checks.ps1

Set-Location $repoRoot
Write-Host '== Validaciones locales finalizadas =='
