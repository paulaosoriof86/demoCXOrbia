# BLOQUE-POWERSHELL-VALIDACIONES-LOCALES.md

## Objetivo

Bloque único para ejecutar validaciones locales DEV desde PowerShell.

## Qué ejecuta

```text
1. Firestore rules emulator
2. Admin dry checks de seed ficticio y claims DEV
```

## Bloque

```powershell
$ErrorActionPreference = 'Stop'

$repo = Get-ChildItem -Path $env:USERPROFILE -Directory -Filter 'demoCXOrbia' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $repo) {
  throw 'No encontré la carpeta demoCXOrbia dentro de tu usuario. Descarga o clona el repo y vuelve a intentar.'
}

cd $repo.FullName
git fetch origin
git checkout feat/firebase-backend-dev-config-20260627
git pull origin feat/firebase-backend-dev-config-20260627

powershell -ExecutionPolicy Bypass -File .\run-local-dev-validations.ps1
```

## Resultado esperado

```text
P0 Firestore rules emulator tests passed
Seed valido para dry-run
Plan de claims DEV valido
Validaciones locales finalizadas
```

## Seguridad

```text
no publica reglas
no crea usuarios
no asigna claims
no escribe Firestore
no activa adapter
no toca producción
```
