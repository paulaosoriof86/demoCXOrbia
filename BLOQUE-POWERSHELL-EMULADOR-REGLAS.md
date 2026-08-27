# BLOQUE-POWERSHELL-EMULADOR-REGLAS.md

## Objetivo

Bloque único para que Paula ejecute el emulador localmente desde PowerShell si el repo está clonado.

## Bloque

```powershell
cd C:\ruta\a\demoCXOrbia

powershell -ExecutionPolicy Bypass -File .\firebase\emulator-rules\run-emulator-rules.ps1
```

## Resultado esperado si pasa

```text
P0 Firestore rules emulator tests passed
```

## Seguridad

```text
no publica reglas
no crea usuarios
no asigna claims
no carga seed
no activa adapter
no toca producción
```

## Nota

Sustituir `C:\ruta\a\demoCXOrbia` por la ruta local real del repositorio.
