# Academia impact - Synthetic pack Phase A TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/synthetic-input-pack-preview-phase-a.tya.contract.json`
- `tools/migration/tya-synthetic-input-pack-preview-runner.mjs`
- `app/docs/SYNTHETIC-PACK-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Explicar a roles internos que un fixture sintetico permite probar validadores preview sin usar fuente real y que su resultado no equivale a migracion real ni a produccion.

## Rutas por rol

### Admin

Debe aprender a leer missing fixture, preview ready, manual review y blocker.

### Ops

Debe aprender que un flujo puede estar listo en contrato aunque falte fuente segura para probar datos.

### Finanzas

Debe aprender que fixtures de pagos o liquidaciones no prueban pagos reales.

### Superadmin

Debe aprender a gobernar validaciones locales antes de pedir activacion futura.

## Manuales requeridos

1. Manual synthetic fixtures.
2. Manual safe validator runs.
3. Manual missing input vs defect.
4. Manual preview validation.

## Checklist

- Fixture sintetico.
- Metadata source-safe.
- Sin fuente real.
- Validator correcto.
- Resultado documentado.
- Readiness actualizado.

## Estado seguro

Documento academico. No cambia frontend ni activa servicios reales.
