# Empalme controlado V78 TyA

Fecha: 2026-07-04

## Archivo creado

- `tools/migration/tya-v78-frontend-backend-merge-guard.mjs`

## Aclaracion

V78 queda como baseline visual actual. El backend no reemplaza archivos de modulos ni core desde este bloque.

## Carril frontend

Responsable de:

- PWA install-aware.
- Releases internos sin deploy.
- Ausencia o no carga de rutas simple.
- Correccion de Novedades.
- Version default correcta al crear tenants.

## Carril backend

Responsable de:

- readiness V5.
- Paquete DEV controlado.
- Runner disabled.
- Target validator.
- Future runner contract.
- Route count manifest.
- Prewrite validator.
- Preautorizacion DEV staging.

## Guard de empalme

El script verifica presencia del backend avanzado y deja documentado el estado esperado del frontend V78 sin escribir frontend.

## Estado

- Empalme controlado documentado.
- Sin escritura frontend desde backend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
