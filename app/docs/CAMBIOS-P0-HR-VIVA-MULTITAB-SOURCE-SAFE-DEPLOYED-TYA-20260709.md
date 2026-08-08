# Cambios P0 HR viva multihoja source-safe desplegada TyA

Fecha: 2026-07-09

## Archivos agregados

- `app/docs/P0-HR-VIVA-MULTITAB-SOURCE-SAFE-DEPLOYED-TYA-20260709.md`

## Archivos modificados

- `tools/hr-source/tya-hr-source-xlsx-lite.mjs`
- `tools/hr-source/tya-build-live-hr-source-safe-static.mjs`
- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`
- `tools/release/tya-rc-phase-a-drift-gate.mjs`

## Objetivo

Resolver el bloqueo P0 de HR viva multihoja: evitar datos demo/snapshot fijo y construir payload source-safe desde la HR viva de TyA.

## Resultado

El workflow `CXOrbia RC Phase A DEV Root Deploy` quedo en success en el run `29065928143` con build HR, deploy Hosting DEV y verificacion URL completados.

## Estado seguro

No produccion. No merge final. No Firestore writes. No Storage. No HR writeback. No Make. No Gemini. No pagos. No datos sensibles en repo.
