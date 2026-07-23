# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-23  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_STABLE_VISIT_ID_R20_PASS_CORTE3_FINANCIAL_RECONCILIATION_REVIEWED_PASS_CANONICAL_FINANCE_ADAPTER_NEXT_NO_PRODUCTION`

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
10. `app/docs/CORTE3-FINANCIAL-RECONCILIATION-R20-TECHNICAL-PASS-20260723.md`.
11. `backend/contracts/tya-corte3-financial-r20-delta-review-v1.json`.
12. `backend/contracts/cxorbia-controlled-runners-v1.json`.
13. Manifest/source lock más reciente, CAMBIOS, Claude, PENDIENTES, Academia, tracker, PR #7 y HEAD vivo.

## 3. Baseline activa preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Empalme funcional: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Source lock de la baseline visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Hosting DEV vigente: 14 periodos, 616 visitas y 34 GT/10 HN por periodo.
- Lectura HR viva, módulos V174, adapters y `CX.data`: preservados.

## 4. Identidad estable de visita R20

Versión: `tya-stable-visit-id-r20-row-identity-v1`.

La identidad se deriva solo de:

`tenantId + projectId + periodKey + country + sourceRow`.

No participan cinemaId, shopping, quincena, franja, shopper, fechas ni montos. El filtro runtime, payload source-safe y perfiles V174/Corte 3 verifican esta regla de forma fail-closed.

## 5. Corte 3 — conciliación financiera PASS técnico

Resultado fresco y revisado:

- 616 visitas HR;
- 247 filas financieras;
- 209 enlaces exactos aceptados;
- 38 filas todavía en revisión;
- 79 entradas en review queue;
- 15 enlaces exactos nuevos revisados;
- 2 enlaces previos retirados y mantenidos sin vínculo por diferencia de monto/detalle;
- 1 cambio de estado mantenido sin vínculo por diferencia de referencia de shopper;
- 0 cambios de `hrRowId` canónico;
- 0 registros financieros nuevos o perdidos.

No se confirmó ni ejecutó ningún pago.

## 6. Evidencia

- Corte 3 reviewed-delta: run `30038407143`, job `89312040827`, artifact `8576206104`, digest `sha256:485463c0304f39e8c866514d373a5e365de54640cd0c826869c3b6f386cff91e`.
- Corte 3 con filtro runtime estable: run `30038739598`, request commit `9a3be4cdbca3c4e234bbcb3cb160b65607b96ceb`, PASS.
- Regresión V174/M1/Corte 2A: run `30039152686`, job `89314519400`, request commit `b2c49ba2c237451a93fa1444fdf2894333238ca1`, artifact `8576510415`, digest `sha256:d9b3ac061fd8d667939fb5caec66810acfaf1a007d78c17cd685a56ae6b84eeb`, PASS.

## 7. Pendientes no bloqueantes preservados

- P1: responsive parcial en algunas tablas y fichas.
- P1: PDF sin gráficas.
- P2: Excel sin formato operativo suficiente.
- P2: telemetría `sourceAccessMode` conserva etiqueta anterior.

## 8. Siguiente bloque exacto

`SNAPSHOT FINANCIERO CANÓNICO SOURCE-SAFE → ADAPTER ÚNICO → FINANZAS Y BENEFICIOS CONSUMEN LA MISMA VERDAD → GATES UI/EXPORTACIONES → HOSTING DEV Y VALIDACIÓN VISUAL`.

## 9. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
