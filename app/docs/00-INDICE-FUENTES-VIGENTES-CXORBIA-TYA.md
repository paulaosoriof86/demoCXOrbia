# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-22  
Estado: ACTIVO Y OBLIGATORIO

## Addendum 2026-07-22 — V174 empalmada con HOLD de gates

- Estado vivo: `V174_FUNCTIONAL_EMPALMED_GATE_HOLD_NO_DEPLOY`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Delta funcional autorizado aplicado: seis módulos V174, sin archivos funcionales extra.
- Source lock nuevo: `app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json`.
- Build-lock activo: `app/core/build-lock.js`.
- Verificador activo: `tools/release/tya-v174-corte2a-empalme-directo-verify.mjs`.
- Gate Corte 2A queda en HOLD por overlay preservado `app/core/tya-phase-a-source-safe-preview.js`; no se autorizó parche funcional fuera de los seis módulos V174.
- No hay deploy, merge, producción ni writes reales.

## 1. Lectura obligatoria

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`.
3. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
4. Addenda vigentes de Academia, patrones reutilizables y antidesvío.
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.
8. `app/docs/AUDITORIA-CANDIDATA-V174-CORTE2A-SOURCE-LOCK-20260722.md`.
9. `backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json`.
10. `app/docs/PAQUETE-CLAUDE-CORTE2A-CICLO-SHOPPER-OPERACION-CANONICA-20260722.md`.
11. `app/docs/PROMPT-EJECUCION-CLAUDE-CORTE2A-20260722.md`.
12. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES-PROTOTIPO, tracker, PR #7 y HEAD de la rama viva.

## 2. Rama y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Producción: sin merge, sin deploy productivo y sin writes.
- Build funcional M1 validado en DEV: `67c0943260f076f5686284ac509458ed5fd34dbd`.
- Corte 1 / M1: `FROZEN_WITH_DOCUMENTED_P1_P2`.
- Corte 2A: `AUDITED_GO_APPLY_LANE_PENDING`.
- Candidata auditada: `CANDIDATA_V174_ACUMULADA_20260722`.
- SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- `HEAD_BEFORE` de auditoría: `91924ff34d377fff6601cebe6d59b269a2c00834`.

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

## 4. Corrección metodológica vigente

Se separan dos carriles:

- `AUDIT_LANE_READY`: bytes extraídos + runtime local + lectura autoritativa de rama. No requiere checkout local.
- `APPLY_LANE_READY`: aplicación atómica autenticada con commit/push y HEAD verificables.

Una falla de `git clone`, DNS o ausencia de checkout local ya no detiene una auditoría posible. Cuando la candidata queda GO pero falta aplicación atómica, se conserva como `AUDITED_GO_APPLY_LANE_PENDING` y no se solicita otra candidata ni se reaudita.

Fuente prevalente:

- `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.

## 5. Auditoría V174

Resultado:

- integridad de los 20 archivos declarados: PASS;
- Node syntax: 68/68 PASS;
- scripts locales faltantes: 0;
- secretos detectados: 0;
- BOM: 0;
- Corte 2A estático: PASS preservando overlays de la rama;
- P0: ninguno demostrado;
- decisión: `AUDITED_GO_APPLY_LANE_PENDING`.

Pendientes P1/P2:

- build-lock/verificador incluidos siguen en V156 y deben regenerarse tras el empalme;
- logo gráfico real en PPT no está demostrado;
- `MANIFEST.sha256` tiene nombre impreciso;
- mojibake histórico no funcional.

No reemplazar `app/` completa. Aplicar únicamente el delta auditado y preservar backend, adapters live, contratos, tools, gates, overlays y documentos vivos.

## 6. Corte 2A auditado

Alcance localizado confirmado:

- Visitas Admin con facets canónicas en tabla, filtros, detalle y exportación;
- ausencia financiera distinta de cero confirmado;
- reasignación con decisión explícita de fecha/franja;
- Exportar Postulaciones;
- eliminación de `undefined` visible;
- sourceRevision en exportaciones;
- Excel enriquecido;
- fórmula de Efectividad;
- curso Academia `a_canon_ops`;
- Novedades v7.0.

## 7. Pendientes transversales no bloqueantes

- logo real y verificación visual final de reportes multiformato;
- regeneración de manifest/build-lock/verificador sobre el HEAD empalmado;
- copy/encoding histórico menor.

`Mis Reportes` shopper sin identidad permanece correctamente fail-closed.

## 8. Lock anti-regresión

Antes de cualquier deploy o freeze deben pasar conjuntamente:

- header variants R20;
- live HR in-place refresh;
- Corte 1 contexto/histórico/reportes;
- frontend report runtime;
- proyecto/periodo/KPI histórico;
- gate compuesto `tya-corte1-m1-regression-lock.mjs`;
- gate de aceptación `tya-corte2a-shopper-operation-canonical-gate.mjs`;
- smoke remoto `fresh=1`;
- canary funcional de asignación/cuestionario;
- comparación transversal por `sourceRevision`.

No reabrir la lectura HR desde cero ni regresar a snapshot congelado, recarga completa, estado crudo, conteos hardcodeados o ausencia convertida en cero.

## 9. Siguiente acción exacta

`APPLY_LANE_READY → verificar mismo SHA V174 y HEAD compatible → APPLY_DELTA_DIRECTLY en docs-tya-v6-v71-audit → commit/push atómico → manifest/build-lock/verificador nuevos → gates M1 + Corte2A → Hosting DEV autorizado → validación visual → freeze Corte 2A.`

No se requiere otra candidata ni otra auditoría de V174.

## 10. Mantenimiento

Al empalmar V174, reemplazar este índice y el checkpoint canónico; actualizar CAMBIOS, Claude, PENDIENTES, Academia, tracker y PR #7 sin crear rutas paralelas.
