# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-24  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_CORTE3_ROOT_CAUSE_DIAGNOSED_CORRECTION_PACKAGE_READY_P0_HOLD_NO_FREEZE_NO_PRODUCTION`

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
8. `app/docs/CORTE3-FINANCIAL-RECONCILIATION-R20-TECHNICAL-PASS-20260723.md`.
9. `app/docs/CORTE3-CANONICAL-FINANCE-SNAPSHOT-ADAPTER-R23-20260723.md`.
10. `app/docs/CORTE3-HOSTING-DEV-REMOTE-LIVE-SMOKE-R25-PASS-20260724.md` como evidencia técnica reemplazada por el HOLD visual.
11. `app/docs/VALIDACION-VISUAL-CORTE3-HOLD-PAULA-20260724.md`.
12. `app/docs/CORTE3-DIAGNOSTICO-CAUSA-RAIZ-Y-CORRECCION-FOCALIZADA-20260724.md`.
13. `app/docs/PAQUETE-CLAUDE-CORTE3-CORRECCION-FOCALIZADA-20260724.md`.
14. `tools/qa/tya-corte3-p0-source-contract-r26-gate.mjs`.
15. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE3-DIAGNOSTICO-Y-GATE-R26-20260724.md`.
16. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE3-VISUAL-HOLD-20260724.md`.
17. `app/docs/ACADEMIA-IMPACTO-CORTE3-VISUAL-HOLD-20260724.md`.
18. Tracker, manifest/source lock más reciente, PR #7 y HEAD vivo.

## 3. Baseline preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- HR source-safe, módulos V174, adapters y `CX.data`: preservados.
- 14 periodos y 616 visitas.
- No se reabren V174, Corte 1 o Corte 2A.

## 4. Corte 3 — verdad financiera canónica preservada

- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos confirmados;
- 0 lotes.

## 5. Estado del diagnóstico y corrección

- Hosting DEV y smoke R25: PASS técnico histórico.
- Validación móvil: siete P0 comprobados.
- Diagnóstico de causa raíz: cerrado.
- Paquete focalizado para Claude: creado.
- Gate fuente R26: creado y fail-closed.
- Plan Phase A y checkpoint: reconciliados.
- Módulos/core: no modificados por backend.

## 6. P0 que la candidata debe resolver

- suma inválida de GTQ y HNL;
- honorarios presentados como pagados con 0 pagos confirmados;
- conciliación de reembolsos inferida sin fuente;
- selector financiero desacoplado de los 14 periodos;
- PDF vacío/incorrecto y Excel no generado;
- dos revisiones no visibles ni localizables;
- Shopper Beneficios no validable desde el flujo visible DEV.

## 7. Decisión

- Corte 3: `HOLD`.
- Diagnóstico: cerrado.
- Freeze: prohibido.
- Corte 4: no iniciar.
- No producción, merge, pagos, imports ni writes.

## 8. Siguiente bloque exacto

`CLAUDE APLICA PAQUETE FOCALIZADO SOBRE V174 → ENTREGA CANDIDATA → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + GATES → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL → APROBADO → FREEZE CORTE 3`.
