# CAMBIOS BACKEND — Addendum Corte 1 / M1 freeze y lock anti-regresión

Fecha: 2026-07-22  
Estado: `CORTE_1_M1_FROZEN_WITH_DOCUMENTED_P1_P2`

## Cambios documentales

- Se registró la validación visual de Paula sobre Hosting DEV con HR viva.
- Se confirmó coherencia de julio 2026 entre Dashboard Admin, Panorama Cliente y reportes.
- Se congeló el build funcional `67c0943260f076f5686284ac509458ed5fd34dbd` como verdad funcional de Corte 1 / M1.
- Se creó `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.
- Se actualizó el checkpoint operativo vigente.
- Se actualizó el índice de fuentes vigentes.
- Se clasificaron los hallazgos restantes como P1/P2, sin P0 nuevo.

## Lock reutilizable agregado

- revisión única de fuente para todas las superficies;
- refresco in-place sin recarga completa;
- `fresh=1` fail-closed;
- facets canónicas y estados ortogonales;
- dato ausente distinto de cero;
- canary funcional asignación/cuestionario;
- comparación transversal de KPI por periodo y revisión;
- gates de headers, refresco, contexto/histórico/reportes y proyecto/periodo.

## Archivos funcionales

No se modificaron archivos de frontend, runtime, adapters, contratos ni workflows en este cierre. El build DEV validado permanece exactamente en `67c0943260f076f5686284ac509458ed5fd34dbd`.

## Pendientes derivados

1. `app/modules/visitas.js`: usar proyección canónica de estados y no estado crudo.
2. `app/core/tya-phase-a-source-safe-preview.js`: preservar `null` en datos financieros ausentes.
3. `app/modules/postulaciones.js`: reasignación con fecha/franja, Exportar funcional y fallback source-safe para teléfono.
4. Exportadores: diseño del tenant en Excel/PPT/PDF, logo, gráficas equivalentes y catálogo de columnas.
5. Gate compuesto anti-regresión para consolidar los validadores existentes.

## Clasificación

- **Reusable CXOrbia:** lock anti-regresión de fuente viva y coherencia transversal.
- **Exclusivo cliente:** mapping y variantes HR TyA/Cinépolis.
- **Claude/prototipo:** hallazgos localizados de Visitas, Postulaciones y Reportes.
- **Academia:** fuente viva, revisión, refresco, estados ortogonales, ausencia vs cero, reportes y fail-closed.
- **Sin impacto Claude:** evidencia de deploy/gates y source commit funcional.

## Estado seguro

Sin merge, producción, importación real, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos.
