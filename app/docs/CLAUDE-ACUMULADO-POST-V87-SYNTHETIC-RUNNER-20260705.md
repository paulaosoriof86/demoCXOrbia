# Claude acumulado post V87 + synthetic runner

Fecha: 2026-07-05

## Estado de Claude

Claude perdio capacidad. Se continua acumulando documentacion y backend seguro para retomarlo cuando vuelva.

## Candidato frontend vigente

V87 fue auditada y no trae delta real frente a V86. No se considera nueva baseline ni source lock.

## P0 que Claude debe corregir al volver

Prioridad minima para salida controlada:

1. Reemplazar mensajes de accion externa real por estados honestos de preparacion, revision, fallback o pendiente backend.
2. Cambiar los textos que hablan de sincronizacion externa o movimiento real de liquidaciones si el gate no esta activo.
3. Cambiar `cuestionario enviado` por `cuestionario realizado/completado pendiente revision` cuando aplique.
4. No ampliar Academia hasta cerrar estos P0.

Archivos frontend señalados:

- `app/modules/postulaciones.js`
- `app/modules/dashboard.js`
- `app/core/topbar.js`
- `app/modules/correo.js`
- `app/modules/academia.js`
- `app/core/automations.js`
- `app/core/manuales-data.js`
- `app/core/liquidacion.js`

## Backend acumulado nuevo

Se agrego bloque backend seguro:

- `tools/migration/tya-synthetic-input-pack-preview-local-runner.ps1`
- `app/contracts/synthetic-input-pack-readiness-map-phase-a.tya.contract.json`
- `tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs`
- `app/docs/SYNTHETIC-PACK-LOCAL-RUNNER-READINESS-MAP-TYA-20260705.md`

Este bloque permite correr el manifest sintetico y mapearlo a readiness preview sin activar produccion.

## Senales backend que Claude debe respetar despues del P0

- `availableFrom`
- `outboxStatus`
- `mailboxId`
- `formVersion`
- `externalFolderRef`
- `crmEntityId`

## Regla de retomada

Cuando Claude vuelva, no debe reiniciar ni proponer otro enfoque. Debe tomar este acumulado, corregir P0 de forma quirurgica y entregar candidata con delta real. Despues se audita otra vez antes de source lock.
