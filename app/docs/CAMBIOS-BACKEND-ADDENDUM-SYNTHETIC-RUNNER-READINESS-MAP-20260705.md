# Cambios backend addendum - Synthetic runner readiness map

Fecha: 2026-07-05

## Bloque completado

Se avanzo el siguiente bloque backend seguro despues de la auditoria V87, mientras Claude queda sin capacidad.

## Archivos creados

1. `tools/migration/tya-synthetic-input-pack-preview-local-runner.ps1`
   - Runner local PowerShell para ejecutar el synthetic input pack preview.
   - Por defecto valida estructura sin ejecutar validadores.
   - Con `-ExecuteValidators` ejecuta solo validadores locales preview.
   - Guarda salidas en `_diagnosticos/tya-synthetic-pack`.

2. `app/contracts/synthetic-input-pack-readiness-map-phase-a.tya.contract.json`
   - Contrato de mapeo readiness para el reporte del runner.
   - Define estados de preview, revision y bloqueo.
   - Mantiene todos los gates en false.

3. `tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs`
   - Mapper Node que lee el reporte JSON del runner y genera readiness preview.
   - No activa produccion ni proveedores.

4. `app/docs/SYNTHETIC-PACK-LOCAL-RUNNER-READINESS-MAP-TYA-20260705.md`
   - Documento operativo del bloque.
   - Explica ejecucion local, lectura de estados y limites.

## Estado seguro

- Sin cambios frontend.
- Sin deploy.
- Sin merge.
- Sin produccion.
- Sin import real.
- Sin escrituras Firestore.
- Sin escrituras Storage.
- Sin escrituras HR.
- Sin proveedores externos.
- Sin Gemini real.
- Sin pagos reales.
- Sin datos sensibles.

## Impacto Phase A

El bloque reduce dependencia manual futura porque deja una ruta unica para convertir el synthetic fixture manifest en un reporte local y un readiness map. Esto permite separar:

- estructura preview lista;
- revision requerida;
- falta de fixture/input;
- bloqueo por flags reales;
- bloqueo por campos sensibles o raw;
- error de runner.

## Pendientes backend

1. Ejecutar localmente el runner sin `-ExecuteValidators` cuando haya repo local disponible.
2. Revisar salida y, si procede, ejecutar con `-ExecuteValidators`.
3. Conservar el reporte en `_diagnosticos/` local sin subir payloads al repo si contiene trazas extensas.
4. Mapear resultados al release readiness snapshot preview.
5. Mantener bloqueada cualquier conclusion de produccion mientras V87/P0 frontend siga pendiente.

## Pendientes frontend/Claude acumulados

Siguen vivos los P0 de honestidad operativa detectados en auditoria V87. Claude debe entregar candidata correctiva minima antes de source lock.

## Proximo bloque recomendado

Preparar el puente entre readiness map y release readiness snapshot preview, sin ejecutar produccion y sin depender de Claude.
