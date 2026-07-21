# BLOQUE-POWERSHELL-PUBLICAR-REGLAS-DEV.md

## Objetivo

Bloque para publicar únicamente reglas Firestore en Firebase DEV, si Paula autoriza el gate.

## Bloque

```powershell
$ErrorActionPreference = 'Stop'

$repo = Get-ChildItem -Path $env:USERPROFILE -Directory -Filter 'demoCXOrbia' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $repo) {
  throw 'No encontré la carpeta demoCXOrbia dentro de tu usuario.'
}

cd $repo.FullName
git checkout feat/firebase-backend-dev-config-20260627
git pull --ff-only origin feat/firebase-backend-dev-config-20260627

firebase deploy --only firestore:rules --project cxorbia-backend-dev
```

## Seguridad

```text
no publica hosting
no publica storage
no crea usuarios
no asigna claims
no carga seed
no activa adapter
no toca producción
```

## Resultado esperado

```text
Deploy complete
```

Después de ejecutar, pegar salida completa en ChatGPT.
