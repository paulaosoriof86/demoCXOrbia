# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-23  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_CORTE3_FINANCIAL_RECONCILIATION_R20_RUNNER_READY_PENDING_EXECUTION_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- `main`, nueva rama/PR y force push: prohibidos.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. Lectura obligatoria

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`.
3. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
4. Addenda vigentes de Academia, patrones reutilizables y antidesvío.
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. `app/docs/VALIDACION-VISUAL-V174-APROBADA-CON-PENDIENTES-P1-P2-20260723.md`.
8. `app/docs/PHASE-A-CORTE3-INICIO-FINANZAS-20260723.md`.
9. `app/docs/CORTE3-FINANCIAL-SOURCE-INVENTORY-GAP-MATRIX-20260723.md`.
10. `app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json`.
11. `backend/contracts/cxorbia-controlled-runners-v1.json`.
12. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia, tracker, PR #7 y HEAD vivo.

## 3. Lock prevalente

`FUENTE Y REGLA → MAPPING/ADAPTER → GATES → BUILD EXACTO → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

V174 fue aprobada visualmente. Los hallazgos P1/P2 no bloquean y no autorizan una nueva candidata ni cambios frontend dentro de Corte 3.

## 4. Baseline activa V174

- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Empalme funcional: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Source-lock final: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Aggregate: `ab11bc47dfd096cbe6a110db250c46e656c2dc9760ad832c07958b6c9a886818`.
- R20, HR in-place, histórico, reportes, proyecto/periodo/KPI, Corte 2A, M1 y verificador: PASS técnico.
- Validación visual: APROBADA.

## 5. Pendientes visuales no bloqueantes

- P1: responsive parcial en algunas tablas y fichas.
- P1: PDF sin gráficas.
- P2: Excel sin formato operativo suficiente.
- P2: telemetría `sourceAccessMode` conserva etiqueta anterior.

## 6. Hosting DEV vigente

- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1`.
- Run: `30027204176`.
- Artifact: `8571796399`.
- Hosting deploy: SUCCESS.
- Endpoint HR vivo: `runtimeRead=true`, `sourceSafe=true`, 14 periodos y 616 visitas.

## 7. Bloque activo: Corte 3 Finanzas

- Envelope actual: fuente financiera pendiente; pagos y lotes vacíos.
- Afirmación operativa: pagado hasta mayo pendiente de cruce por fuente; junio requiere match por ítem.
- Reconciliación R14C baseline: 247 filas financieras, 196 links exactos aceptados, 51 filas a revisión y 92 entradas en review queue.
- Junio: cero enlaces exactos aceptados en R14C; no marcar pago por inferencia.
- Inventario source-safe y matriz inicial de cobertura/gaps: completados.

## 8. Carril controlado preparado

El mismo `CXORBIA_READONLY_POST_GATES_RUNNER` incorpora el perfil autorizado `CORTE3_FINANCIAL_RECONCILIATION_R20`.

El perfil:

- regenera R14C en un checkout efímero contra la HR R20 vigente;
- compara `sourceRecordId`, llaves estables e identidad de enlace contra la baseline;
- verifica 14 periodos, 616 visitas, 247 filas financieras y 34 GT/10 HN por periodo;
- detiene cualquier enlace nuevo, perdido, cambiado o ambiguo para revisión humana;
- no importa, no paga, no despliega y no escribe datos ni repositorio.

## 9. Siguiente paso exacto

`ACTIVAR REQUEST LIGADO AL HEAD EXACTO → EJECUTAR PERFIL CORTE3 → LEER ARTIFACT Y DELTA → PASS ESTABLE O HOLD FOCALIZADO DE REVISIÓN HUMANA`.

## 10. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
