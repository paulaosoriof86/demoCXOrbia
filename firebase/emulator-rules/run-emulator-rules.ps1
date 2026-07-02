$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host '== CXOrbia Firestore rules emulator =='
Write-Host 'Validacion local. No publica reglas. No toca produccion.'

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm no esta disponible. Instala Node.js antes de ejecutar este bloque.'
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host '== Instalando dependencias =='
npm install

Write-Host '== Ejecutando pruebas de reglas =='
npm run test:rules

Write-Host '== Validacion finalizada =='
