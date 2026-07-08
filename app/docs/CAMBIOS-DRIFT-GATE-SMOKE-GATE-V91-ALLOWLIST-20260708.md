# Cambios - Drift Gate Smoke Gate V91 Allowlist

Fecha: 2026-07-08  
Bloque: permitir smoke gate V91 en drift seguro  
Estado: documentado y seguro.

## Archivo actualizado

1. `tools/release/tya-rc-phase-a-drift-gate.mjs`
   - Se agrego `tools/migration/tya-phase-a-rc-smoke-gate.mjs` a `allowedExact`.
   - Se agrego `smokeGateValidators: true` a `allowedPolicy`.
   - Se agrego linea explicita en el reporte Markdown: `Smoke gate validators: yes`.

## Archivos creados

1. `app/docs/DRIFT-GATE-SMOKE-GATE-V91-ALLOWLIST-20260708.md`
   - Documento funcional del cambio.

2. `app/docs/CAMBIOS-DRIFT-GATE-SMOKE-GATE-V91-ALLOWLIST-20260708.md`
   - Bitacora puntual.

## Causa raiz

El drift gate fallaba despues del smoke gate ampliado porque `tools/migration/tya-phase-a-rc-smoke-gate.mjs` no estaba permitido como cambio post runtime validado.

Ese archivo es un validador seguro y no un runtime app file.

## Decision

No se permitieron cambios generales en `/app`. No se desactivo drift. Solo se permitio el validador especifico del smoke gate.

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
