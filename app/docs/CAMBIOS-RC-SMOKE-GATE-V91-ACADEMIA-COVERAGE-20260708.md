# Cambios - RC Smoke Gate V91 Academia Coverage

Fecha: 2026-07-08  
Bloque: ampliar smoke gate con cobertura V91 Academia/Diagnostico/Administrabilidad  
Estado: documentado y seguro.

## Archivo actualizado

1. `tools/migration/tya-phase-a-rc-smoke-gate.mjs`
   - Se agregaron documentos V91 requeridos.
   - Se agrego validacion de scripts V91 en `app/index.html`.
   - Se agrego validacion de orden de scripts Academia.
   - Se agrego validacion de `academia-admin-actions.js`.
   - Se agrego validacion de `academia-create-ai-stable.js`.
   - Se agrego validacion de `diagnostico.js`.
   - Se agrego validacion de `administrabilidad.js`.
   - Se agrego validacion de Service Worker `cxorbia-v2`, purge y network-first.

## Archivos creados

1. `app/docs/RC-SMOKE-GATE-V91-ACADEMIA-COVERAGE-20260708.md`
   - Documento funcional del bloque.

2. `app/docs/CAMBIOS-RC-SMOKE-GATE-V91-ACADEMIA-COVERAGE-20260708.md`
   - Bitacora puntual.

## Decision tecnica

Se amplio el smoke gate existente en vez de crear un gate paralelo para mantener una unica puerta Phase A RC y evitar dispersion metodologica.

## Impacto Claude/prototipo

El smoke gate ahora protege que las mejoras locales de empalme V91 sigan presentes y cargadas. Claude debe asumir este gate como parte de la cobertura minima para futuras candidatas.

## Impacto Academia

El gate ahora cubre explicitamente Academia admin actions y Crear con IA estable, ademas de documentar que la profundizacion de contenido sigue pendiente.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
