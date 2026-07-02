# BLOQUE-POWERSHELL-DRY-CHECKS-ADMIN.md

## Objetivo

Bloque único para validar seed ficticio y plan de claims sin escribir en Firebase.

## Bloque

```powershell
cd C:\ruta\a\demoCXOrbia

powershell -ExecutionPolicy Bypass -File .\firebase\admin-tools\run-admin-dry-checks.ps1
```

## Resultado esperado

```text
Seed valido para dry-run
Plan de claims DEV valido
Dry checks finalizados
```

## Seguridad

```text
no escribe Firestore
no crea usuarios
no asigna claims
no usa credenciales
no activa adapter
no toca producción
```

## Nota

Sustituir `C:\ruta\a\demoCXOrbia` por la ruta local real del repositorio.
