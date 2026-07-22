# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-22  
Estado: ACTIVO Y OBLIGATORIO

## 1. Lectura obligatoria

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`.
3. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
4. Addenda vigentes de Academia, patrones reutilizables y antidesvío.
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.
8. `backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json`.
9. `app/docs/PAQUETE-CLAUDE-CORTE2A-CICLO-SHOPPER-OPERACION-CANONICA-20260722.md`.
10. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES-PROTOTIPO, tracker, PR #7 y HEAD de la rama viva.

## 2. Rama y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Producción: sin merge, sin deploy productivo y sin writes.
- Build funcional M1 validado en DEV: `67c0943260f076f5686284ac509458ed5fd34dbd`.
- Corte 1 / M1: `FROZEN_WITH_DOCUMENTED_P1_P2`.
- Corte 2A: `STARTED_FRONTEND_DELTA_PENDING_CLAUDE`.

## 3. Fuente HR viva congelada para M1

- 14 periodos.
- 616 visitas.
- `JULIO 26`: variante `tab_scoped_compact`.
- `JULIO 26 HN`: variante `full_identity`.
- Refresco en memoria sin `location.reload()`.
- Cambio de periodos correcto.
- KPI cambian ante asignación/cuestionario controlado.
- Portal shopper retira visitas asignadas en HR.
- Dashboard Admin, Panorama Cliente y reportes comparten los conteos de julio.

### Julio 2026

- 44 visitas.
- 41 asignadas.
- 3 sin asignar.
- 28 realizadas.
- 26 cuestionarios.
- 20 submitidas.
- 6 sin submitir.
- 2 cuestionarios pendientes.
- 0 pagos confirmados.

## 4. Corte 2A activo

Alcance localizado:

- Visitas Admin con facets canónicas en tabla, filtros, detalle y exportación;
- ausencia financiera distinta de cero confirmado;
- reasignación con decisión explícita de fecha/franja;
- Exportar Postulaciones;
- eliminar `undefined` visible;
- canary de asignación/cuestionario;
- preservación completa del lock M1.

Archivos de control:

- `backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json`;
- `tools/qa/tya-corte1-m1-regression-lock.mjs`;
- `app/docs/PAQUETE-CLAUDE-CORTE2A-CICLO-SHOPPER-OPERACION-CANONICA-20260722.md`.

Claude solo modifica el delta frontend localizado. No reinterpreta HR ni crea otra arquitectura/candidata por rutina.

## 5. Pendientes transversales no bloqueantes

- diseño, logo, gráficas y columnas de reportes multiformato;
- definición/gate de Efectividad;
- copy menor de países.

`Mis Reportes` shopper sin identidad permanece correctamente fail-closed.

## 6. Lock anti-regresión

Antes de cualquier futura candidata, deploy o freeze deben pasar conjuntamente:

- header variants R20;
- live HR in-place refresh;
- Corte 1 contexto/histórico/reportes;
- frontend report runtime;
- proyecto/periodo/KPI histórico;
- gate compuesto `tya-corte1-m1-regression-lock.mjs`;
- smoke remoto `fresh=1`;
- canary funcional de asignación/cuestionario;
- comparación transversal por `sourceRevision`.

No reabrir la lectura HR desde cero ni regresar a snapshot congelado, recarga completa, estado crudo, conteos hardcodeados o ausencia convertida en cero.

## 7. Siguiente acción exacta

`Claude entrega delta frontend localizado de Corte 2A → EXECUTION_LANE_READY → auditoría incremental → GO/P0_PROVEN → APPLY_DELTA_DIRECTLY en docs-tya-v6-v71-audit → manifest/build-lock/verificador → gates M1 + Corte2A → Hosting DEV autorizado → validación visual → freeze Corte 2A.`

No se requiere otro empalme de M1. Reportes multiformato continúan como P1 transversal sin bloquear Corte 2A.

## 8. Mantenimiento

Al avanzar Corte 2A, reemplazar este índice y el checkpoint canónico; actualizar CAMBIOS, Claude, PENDIENTES, Academia, tracker y PR #7 sin crear rutas paralelas.
