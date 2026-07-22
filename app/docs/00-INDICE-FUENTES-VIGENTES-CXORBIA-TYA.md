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
8. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES-PROTOTIPO, tracker, PR #7 y HEAD de la rama viva.

## 2. Rama y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Producción: sin merge, sin deploy productivo y sin writes.
- Build funcional M1 validado en DEV: `67c0943260f076f5686284ac509458ed5fd34dbd`.
- Corte 1 / M1: `FROZEN_WITH_DOCUMENTED_P1_P2`.
- Corte 2: desbloqueado, aún no iniciado.

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

## 4. Pendientes no bloqueantes trasladados

- estado canónico en Visitas Admin;
- no convertir dato financiero ausente en cero;
- reasignación con decisión explícita de fecha/franja;
- Exportar Postulaciones;
- eliminar `undefined` visible;
- diseño, logo, gráficas y columnas de reportes multiformato;
- definición/gate de Efectividad;
- copy menor de países.

No existe P0 nuevo. Los detalles y archivos exactos están en el documento de validación vigente.

## 5. Lock anti-regresión

Antes de cualquier futuro deploy/freeze deben pasar conjuntamente:

- header variants R20;
- live HR in-place refresh;
- Corte 1 contexto/histórico/reportes;
- frontend report runtime;
- proyecto/periodo/KPI histórico;
- smoke remoto `fresh=1`;
- canary funcional de asignación/cuestionario;
- comparación transversal por `sourceRevision`.

No reabrir la lectura HR desde cero ni regresar a snapshot congelado, recarga completa, estado crudo o conteos hardcodeados.

## 6. Siguiente acción exacta

`CORTE 2A — CICLO SHOPPER Y OPERACIÓN CANÓNICA: Visitas Admin con facets canónicas + postulaciones/reasignación/fecha/exportación + canary de asignación/cuestionario, preservando el lock de Corte 1.`

Reportes multiformato continúan como P1 transversal sin bloquear Corte 2.

## 7. Mantenimiento

Al avanzar Corte 2, reemplazar este índice y el checkpoint canónico; actualizar CAMBIOS, Claude, PENDIENTES, Academia, tracker y PR #7 sin crear rutas paralelas.
