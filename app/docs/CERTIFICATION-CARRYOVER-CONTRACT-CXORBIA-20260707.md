# Certification carryover contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para preservar certificaciones ya presentadas.

Archivo creado:

- `tools/contracts/cxorbia-certification-carryover-contract.mjs`

## Objetivo

Evitar pedir nuevamente certificaciones que ya fueron presentadas y aceptadas, manteniendo control por tenant, proyecto, shopper y certificacion.

Este bloque es clave para Phase A porque conserva certificaciones historicas utiles sin copiar datos crudos ni activar import real.

## Estados permitidos

- `not_required`
- `required_pending`
- `in_progress`
- `passed`
- `failed`
- `expired`
- `manual_review`
- `carryover_accepted`

## Fuentes permitidas

- `platform`
- `historical_import`
- `manual_review`
- `external_source`

## Reglas clave

- `passed` requiere score.
- `carryover_accepted` requiere elegibilidad de carryover.
- Si la fuente es externa y no hay certeza suficiente, debe ir a revision manual.
- Si una certificacion nueva es obligatoria, debe quedar `required_pending`.
- El contrato usa fixtures sinteticos y no importa datos reales.

## Relacion con Phase A

Este contrato prepara:

- conservacion de certificaciones ya presentadas;
- no duplicar esfuerzo del shopper;
- decision separada entre certificacion nueva y certificacion historica aceptada;
- revision humana cuando la fuente no sea suficiente;
- Academia conectada a certificaciones por proyecto.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para cualquier cliente con certificaciones, cursos o acreditaciones por proyecto.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

No cambia UI, pero Claude debe mostrar estados claros de certificacion: pendiente, en progreso, aprobada, fallida, vencida, aceptada por historico o en revision.

### Academia

Impacto directo. Academia debe respetar certificaciones ya aceptadas y no pedir curso nuevamente salvo regla nueva, vencimiento o revision.

### Sin impacto Claude

No hay cambio visual directo.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin lectura de secrets y sin datos sensibles.
