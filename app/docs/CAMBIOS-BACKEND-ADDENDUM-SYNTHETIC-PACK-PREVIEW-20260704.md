# Cambios backend addendum - Synthetic pack preview

Fecha: 2026-07-04

## Bloque completado

Contrato y runner local de synthetic pack para ejecutar validadores preview sin fuentes reales.

## Archivos creados

1. `app/contracts/synthetic-input-pack-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato seguro para pack sintetico de fixtures.

2. `tools/migration/tya-synthetic-input-pack-preview-runner.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega runner Node que valida estructura del pack y puede coordinar validadores locales con fixtures seguros.

3. `app/docs/SYNTHETIC-PACK-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documento breve del bloque por limitacion de tooling en la ruta descriptiva original.

4. `app/docs/ACADEMIA-IMPACT-SYNTHETIC-PACK-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: impacto Academia por rol.

## Nota de tooling

La herramienta bloqueo la creacion del documento largo con la ruta descriptiva original. Se creo una version segura y breve en `app/docs/SYNTHETIC-PACK-PHASE-A-TYA-20260704.md`.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin merge.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Storage writes.
- Sin Make real.
- Sin Gemini real.
- Sin email/WhatsApp real.
- Sin proveedores reales.
- Sin datos sensibles.

## Phase A que avanza

- Ya existe estructura para preparar fixtures sinteticos.
- Missing fixture queda separado de defecto backend.
- Los resultados futuros pueden alimentar release readiness snapshot.
- Se reduce trabajo manual antes de usar fuentes controladas.

## Pendientes backend derivados

1. Crear fixtures sinteticos minimos por validator.
2. Crear manifest local del synthetic pack.
3. Ejecutar runner local cuando exista pack seguro.
4. Mapear resultados a release readiness snapshot.

## Pendientes prototipo/Claude derivados

1. Readiness no debe mostrar fixtures sinteticos como fuente real.
2. Mostrar missing input vs defect vs gate off.
3. Academia debe explicar fixture sintetico y validator preview.

## Siguiente bloque recomendado

Crear fixtures sinteticos minimos y manifest de synthetic pack para iniciar ejecucion local segura de validators.
