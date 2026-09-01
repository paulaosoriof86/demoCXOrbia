# Synthetic pack local runner + readiness map TyA

Fecha: 2026-07-05

## Objetivo del bloque

Continuar backend seguro mientras Claude no tiene capacidad, acumulando insumos para Phase A sin tocar frontend ni activar produccion.

Este bloque crea un camino local controlado para:

1. Ejecutar el runner del synthetic input pack contra el manifest Phase A.
2. Guardar un reporte local en `_diagnosticos/`.
3. Mapear ese reporte a estados de readiness preview.
4. Separar preview sintetico de readiness real de produccion.

## Archivos agregados

1. `tools/migration/tya-synthetic-input-pack-preview-local-runner.ps1`
   - Runner PowerShell local.
   - Por defecto valida estructura solamente.
   - Solo ejecuta validadores locales si se usa `-ExecuteValidators`.
   - Escribe reportes en `_diagnosticos/tya-synthetic-pack`.

2. `app/contracts/synthetic-input-pack-readiness-map-phase-a.tya.contract.json`
   - Contrato del mapper de readiness.
   - Mantiene gates apagados.
   - Define estados: `synthetic_preview_ready`, `preview_review_required`, `blocked_sensitive_or_raw_field_key`, `blocked_missing_input_or_fixture`, `blocked_real_action_flag`, `blocked_runner_error`.

3. `tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs`
   - Mapper Node.
   - Lee el JSON generado por el runner.
   - Produce un resumen de readiness preview.
   - No escribe proveedores ni datos operativos.

## Ejecucion local recomendada

Desde la raiz del repo:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-synthetic-input-pack-preview-local-runner.ps1
```

Esto valida estructura, manifest y rutas, sin ejecutar validadores individuales.

Cuando el reporte estructural este revisado:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-synthetic-input-pack-preview-local-runner.ps1 -ExecuteValidators
```

Ese segundo modo solo debe ejecutar validadores locales preview que no escriben ni llaman servicios externos.

## Lectura del readiness map

- `synthetic_preview_ready`: el pack sintetico esta estructuralmente listo para revision local. No significa salida a produccion.
- `preview_review_required`: hay advertencias o issues que requieren revision antes de avanzar.
- `blocked_sensitive_or_raw_field_key`: detenerse y revisar manifest/fixtures.
- `blocked_missing_input_or_fixture`: falta fixture, ruta o input.
- `blocked_real_action_flag`: algun flag intenta permitir accion real y debe corregirse.
- `blocked_runner_error`: el reporte origen no es valido o el runner fallo.

## Estado seguro

Este bloque mantiene apagado:

- produccion;
- deploy;
- merge;
- escrituras reales;
- import real;
- proveedores externos;
- pagos reales.

## Relacion con V87 y Claude

La auditoria V87 encontro que no hay cambios de contenido frente a V86 y que siguen vivos P0 de honestidad operativa. Este bloque no los corrige porque pertenecen a frontend/Claude, pero deja mas preparada la capa backend para cuando exista candidata correctiva.

## Siguiente paso backend

Ejecutar o registrar el reporte local del runner cuando haya acceso al repo local. Si no hay acceso local, continuar con contratos/readiness de Phase A y documentacion acumulada para Claude.
