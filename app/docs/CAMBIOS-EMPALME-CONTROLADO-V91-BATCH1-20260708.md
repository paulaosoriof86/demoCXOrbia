# Cambios - Empalme controlado V91 Batch 1

Fecha: 2026-07-08  
Bloque: empalme controlado inicial de candidata V91  
Estado: completado parcial, seguro y documentado.

## Archivos creados

1. `app/modules/diagnostico.js`
   - Origen: candidata V91.
   - Tipo: nuevo modulo frontend Claude.
   - Estado: preview-only.
   - Proposito: mostrar synthetic runner, readiness, conflictos y gates sin ejecucion real.

2. `app/modules/administrabilidad.js`
   - Origen: candidata V91.
   - Tipo: nuevo modulo frontend Claude.
   - Estado: preview-only.
   - Proposito: mostrar dominios administrables, NDA versionado, planes versionados, reglas y gates.

3. `app/core/v91-modules.js`
   - Tipo: patch controlado de registro/navegacion.
   - Proposito: registrar los nuevos modulos sin reemplazar `app/core/config.js` completo.
   - Motivo: evitar empalme ciego de configuracion y preservar protecciones del PR actual.

4. `app/docs/EMPALME-CONTROLADO-V91-BATCH1-CXORBIA-20260708.md`
   - Tipo: documento funcional del bloque.

5. `app/docs/CAMBIOS-EMPALME-CONTROLADO-V91-BATCH1-20260708.md`
   - Tipo: bitacora puntual.

## Archivos actualizados

1. `app/index.html`
   - Se agrego `core/v91-modules.js` despues de `core/config.js`.
   - Se conservaron scripts core existentes.
   - Se conservo `core/production-copy-guard.js` despues de `core/ui.js`.
   - Se agregaron `modules/diagnostico.js` y `modules/administrabilidad.js`.

## Decision tecnica

No se reemplazo `app/core/config.js` completo porque el empalme ciego podia introducir regresiones o perder configuraciones vivas del PR. En su lugar se agrego `core/v91-modules.js` como registro controlado y auditable.

No se reemplazaron documentos vivos por documentos del ZIP V91 porque la auditoria detecto que los docs del ZIP estaban desactualizados frente al backend acumulado.

## Pendientes derivados

- Smoke visual de Diagnostico y Administrabilidad.
- Revisar gates del nuevo head.
- Decidir empalme controlado de `app/app.js` y `app/sw.js` de V91.
- Corregir copy P0 residual.
- Resolver Academia admin actions visibles.
- Verificar `Crear con IA` de Academia.

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
