$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host '== CXOrbia admin dry checks =='
Write-Host 'No escribe Firebase. No usa credenciales. No toca produccion.'

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm no esta disponible. Instala Node.js antes de ejecutar este bloque.'
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host '== Validando seed ficticio =='
npm run validate:seed

Write-Host '== Validando plan de claims DEV =='
npm run plan:claims

Write-Host '== Dry checks finalizados =='
