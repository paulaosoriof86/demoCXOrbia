# CAMBIOS BACKEND — R18D PREVIEW VISIBLE V131

Fecha: 2026-07-15

## Archivos backend/CI creados

- `tools/release/tya-visible-overlays-build-r18d.mjs`
  - genera únicamente en copia de build el adapter visible R18D;
  - aplica los resultados existentes R11D/R14C/certificaciones;
  - no modifica `app/modules`, `app/core` ni el runtime source lock V131.
- `tools/qa/tya-phase-a-visible-overlays-smoke-r18d.mjs`
  - valida conteos, estados, módulos y copy honesto en navegador;
  - aísla errores por módulo para evitar perder el resto de la evidencia.
- `.github/workflows/cxorbia-phase-a-r18d-visible-overlays-smoke.yml`
  - construye HR viva source-safe, aplica R18A/R18B, genera la copia visible y ejecuta smoke local;
  - no despliega.

## Corrección backend/CI realizada

La fuente R14C contiene 92 ítems aprobados de revisión, pero 4 registros de control no traían una `key` propia. Al deduplicar la cola visual se reducían a 89.

R18D ahora asigna en la copia de build claves determinísticas a los registros que no las tenían y conserva los 92 ítems únicos. No se modificó la fuente R14C, no se recalculó la conciliación y no se resolvió ningún conflicto automáticamente.

## Resultado

Los contratos de datos pasaron:

- 14 periodos;
- 616 visitas;
- 44 visitas activas JUL 2026;
- 216 shoppers;
- 196 controles financieros exactos pendientes de revisión;
- 92 casos financieros en reviewQueue;
- certificaciones en HOLD;
- 0 pagos, lotes o certificaciones confirmadas.

El smoke quedó en HOLD por un P0 frontend localizado en `app/core/finanzas-core.js`: el adapter parcial de `serieMensual()` no implementa `period()`, requerido por `CX.liq.forProject()`.

Backend no parcheó el frontend. Se creó un paquete exclusivo y focalizado para Claude.

## Clasificación

- **Reusable CXOrbia:** adapter de preview build-only, preservación completa de colas con IDs estables, smoke fail-closed por módulo.
- **Exclusivo cliente:** conteos TyA/Cinépolis y resultados R11D/R14C.
- **Claude/prototipo:** P0 único de compatibilidad `period()` en `app/core/finanzas-core.js`.
- **Academia:** distinguir control financiero, reviewQueue, pago confirmado y certificación carryover.
- **Sin impacto Claude:** normalización build-only de IDs y workflow R18D.

## Seguridad

Sin deploy, producción, Firestore/HR writes, imports, Auth/Storage, Make, Gemini ni pagos.