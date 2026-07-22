# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-22  
Estado: `CORTE_2A_STARTED_FRONTEND_DELTA_PENDING_CLAUDE`

## 1. Repositorio y baseline funcional

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Build funcional validado en DEV: `67c0943260f076f5686284ac509458ed5fd34dbd`.
- Corte 1 / M1: `FROZEN_WITH_DOCUMENTED_P1_P2`.
- Corte 2A: iniciado mediante contrato, gate compuesto y paquete frontend localizado; delta de Claude aún pendiente.

La candidata que produjo el build funcional M1 ya fue aplicada a la rama viva y validada visualmente. No existe un segundo empalme pendiente de M1. El PR permanece sin merge porque merge/producción pertenecen a Corte 8 y requieren autorización expresa.

## 2. Resultado técnico y visual congelado

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

## 3. Corte 2A — alcance autorizado

1. `app/modules/visitas.js`
   - facets canónicas en tabla, filtros, detalle, drilldowns y exportación;
   - no usar `v.estado` crudo como verdad única;
   - monto ausente distinto de cero confirmado.

2. `app/modules/postulaciones.js`
   - reasignación con conservar/cambiar/dejar pendiente fecha y franja;
   - Exportar para alcance filtrado y periodo activo;
   - eliminar `undefined` y claims falsos de sincronización.

3. `app/core/tya-phase-a-source-safe-preview.js`
   - solo si es indispensable: preservar `null` financiero sin alterar IDs, periodos, facets o sourceRevision.

Contrato y paquete:

- `backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json`.
- `app/docs/PAQUETE-CLAUDE-CORTE2A-CICLO-SHOPPER-OPERACION-CANONICA-20260722.md`.

## 4. Lock anti-regresión obligatorio

Toda candidata futura debe preservar:

- una sola revisión runtime para Admin, Cliente, Shopper y reportes;
- `fresh=1` fail-closed sin fallback silencioso;
- aplicación in-place sin `location.reload()`;
- proyecto y periodo separados;
- facets canónicas y estados ortogonales;
- ausencia de fuente distinta de cero confirmado;
- canary de asignación/cuestionario;
- comparación transversal de KPI por periodo y revisión;
- marketplace shopper coherente;
- cero pagos inferidos.

Gates mínimos:

- `tools/qa/tya-hr-header-variants-r20-gate.mjs`;
- `tools/qa/tya-live-hr-inplace-refresh-gate.mjs`;
- `tools/qa/tya-corte1-context-history-reports-gate.mjs`;
- `tools/qa/tya-corte1-report-frontend-runtime-gate.mjs`;
- `tools/qa/tya-project-period-kpi-history-gate-r20.mjs`;
- `tools/qa/tya-corte1-m1-regression-lock.mjs`;
- smoke remoto `fresh=1` y validación visual.

## 5. Claude/prototipo y Academia

Claude se requiere exclusivamente para el delta frontend localizado de Corte 2A. No debe reinterpretar HR, reconstruir M1, crear otra arquitectura ni cambiar módulos ajenos sin dependencia demostrada.

Academia incorpora fuente/revisión única, refresco in-place, estados ortogonales, ausencia vs cero, reasignación segura, exportación por alcance, canary y seguridad fail-closed.

## 6. Método de recepción de la siguiente candidata

`EXECUTION_LANE_READY → auditoría delta localizada → GO/P0_PROVEN → APPLY_DELTA_DIRECTLY sobre docs-tya-v6-v71-audit → commit/push atómico → manifest/build-lock/verificador → gates M1 + Corte2A → Hosting DEV autorizado → validación visual → freeze Corte 2A`.

P1/P2 no bloquean. Solo un `P0_PROVEN` reproducible y autorizado puede detener el empalme.

## 7. Pendientes transversales no bloqueantes

- calidad multiformato de Excel/PPT/PDF;
- logo, branding, gráficas, anchos y catálogo de columnas;
- definición/gate del KPI Efectividad;
- copy menor duplicado de países.

`Mis Reportes` shopper sin identidad continúa correctamente fail-closed.

## 8. Estado seguro

Sin merge, producción, importación real, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos reales.
