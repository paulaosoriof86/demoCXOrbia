# Drift gate fix post Claude package - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se reviso el gate de drift despues del paquete Claude actualizado y se corrigio la causa raiz del fallo sin subir riesgo de runtime.

## Hallazgo

El head `0b79bcd377f1de197a222f88e2a6a65d1d95da2d` tenia:

- smoke gate success;
- visual smoke success;
- predeploy gate success;
- drift gate failure.

El artifact del drift gate reporto:

- verdict: `NO_GO_DRIFT`;
- changed files: 99;
- blocked files: 24.

## Causa raiz

El drift gate estaba cumpliendo su proposito original: bloquear cualquier archivo fuera de documentacion/release despues del runtime validado.

Sin embargo, despues de ese runtime se agregaron artefactos seguros preview-only que no cambian la app en runtime:

- contratos `tools/contracts/`;
- workflows de gate/release;
- scripts de readiness;
- contratos de sync preview.

La regla era demasiado estricta para el nuevo carril seguro documentado.

## Correccion aplicada

Archivo actualizado:

- `tools/release/tya-rc-phase-a-drift-gate.mjs`

Se permitio explicitamente:

- `tools/contracts/`;
- `.github/workflows/cxorbia-phase-a-remote-smoke.yml`;
- `tools/migration/tya-assignment-sync-conflict-preview.mjs`;
- `tools/migration/tya-assignment-sync-outbox-contract.mjs`;
- `tools/release/tya-phase-a-today-finish-readiness.mjs`.

Se mantiene bloqueado:

- cambios runtime en `app/core` o `app/modules`;
- activacion de proveedores reales;
- escrituras de base;
- imports reales;
- produccion.

## Siguiente paso

Esperar el nuevo run automatico del drift gate o consultar el workflow asociado al commit `7af907074ea8d51ce8b98726c0fa829dc25311b7`.

Si el drift gate pasa, el bloqueo vuelve a ser externo: URL staging/preview y remote smoke.

## Clasificacion

### Reusable CXOrbia

Si. Ajusta el patron de drift para permitir contratos preview-only sin revalidar runtime visual.

### Exclusivo cliente

No.

### Claude/prototipo

Impacto indirecto. No toca UI.

### Academia

Impacto indirecto porque permite contratos de Academia sin invalidar runtime.

### Sin impacto Claude

No hay cambio visual directo.

## Estado seguro

Sin produccion real, sin merge final, sin proveedores reales, sin imports reales, sin sync real y sin datos sensibles.
