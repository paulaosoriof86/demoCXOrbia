# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-22  
Estado: `CORTE_1_M1_FROZEN_WITH_DOCUMENTED_P1_P2`

## 1. Repositorio y fuente funcional

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Build funcional validado en DEV: `67c0943260f076f5686284ac509458ed5fd34dbd`.
- Commit documental de validación/lock: `c5ad3473932f00f7b72a04d5bd490c29af39a8c3`.
- Corte 1 / M1: congelado con pendientes P1/P2 documentados.
- Corte 2: desbloqueado para iniciar; todavía no ejecutado.

## 2. Resultado técnico y visual

- Cloud Run DEV y Hosting DEV: PASS.
- HR runtime viva y source-safe: PASS.
- Refresco in-place sin recarga evidente: PASS.
- Cambio de periodos: PASS.
- Actualización automática de KPI ante asignación/cuestionario controlado: PASS.
- Portal shopper retira visitas asignadas desde HR: PASS.
- Coherencia Dashboard Admin / Panorama Cliente / reportes: PASS.

### Julio 2026 validado

- 44 visitas: GT 34, HN 10.
- 41 asignadas: GT 32, HN 9.
- 3 sin asignar: GT 2, HN 1.
- 28 realizadas: GT 21, HN 7.
- 26 con cuestionario: GT 20, HN 6.
- 20 submitidas: GT 16, HN 4.
- 6 sin submitir.
- 2 cuestionarios pendientes.
- 0 pagos confirmados.

## 3. Decisión de freeze

No se demostró P0 que bloquee M1. Los hallazgos restantes se clasifican como P1/P2 y pasan al bloque siguiente sin reabrir la lectura HR:

1. Visitas Admin muestra estado crudo en tabla y no la proyección canónica.
2. Campos financieros ausentes aparecen como `Q 0` en vez de pendiente de fuente.
3. Reasignación no incluye decisión de conservar/cambiar fecha y franja.
4. Exportar Postulaciones no tiene implementación.
5. Tarjeta de Postulaciones muestra `undefined` cuando no existe teléfono autorizado.
6. Excel no conserva diseño/branding, no contiene gráficas y presenta columnas estrechas.
7. PowerPoint no incluye logo real y algunas gráficas tienen etiquetas ambiguas.
8. Catálogo de columnas requiere ampliación por tipo de reporte/fuente.
9. Fórmula de `Efectividad` requiere definición y gate visible.
10. Copy menor duplicado de países en Dashboard.

`Mis Reportes` del shopper sin identidad queda correctamente bloqueado por seguridad y no es bug.

## 4. Lock anti-regresión vigente

La lectura HR actual se preserva mediante:

- una sola revisión runtime para Admin, Cliente, Shopper y reportes;
- `fresh=1` fail-closed sin fallback silencioso;
- aplicación in-place sin `location.reload()`;
- facets canónicas y estados ortogonales;
- ausencia de fuente distinta de cero confirmado;
- canary de asignación/cuestionario;
- comparación transversal de KPI por periodo y revisión;
- gates existentes de headers, refresh, contexto/histórico/reportes y proyecto/periodo.

Fuente completa:

- `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.

## 5. Claude/prototipo y Academia

Claude debe trabajar únicamente sobre los archivos/módulos localizados en el documento de validación. No se solicita nueva candidata por rutina ni se reinterpreta HR.

Academia debe incorporar:

- lectura viva vs snapshot;
- revisión y refresco sin recarga;
- estados ortogonales;
- dato ausente vs cero;
- seguridad fail-closed del shopper;
- reportes multiformato y alcance por rol.

## 6. Siguiente bloque exacto

`CORTE 2A — CICLO SHOPPER Y OPERACIÓN CANÓNICA: Visitas Admin con facets canónicas + postulaciones/reasignación/fecha/exportación + canary de asignación/cuestionario, preservando el lock de Corte 1.`

Reportes multiformato continúan como P1 transversal y no bloquean el inicio de Corte 2.

## 7. Estado seguro

Sin merge, producción, importación real, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos reales.
