# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-24  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_V175_AUDITED_P0_PROVEN_HOLD_V176_REQUIRED_NO_FREEZE_NO_PRODUCTION`

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
15. `app/docs/AUDITORIA-V175-CORTE3-P0-PROVEN-HOLD-20260724.md`.
16. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V175-P0-HOLD-20260724.md`.
17. `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V175-P0-HOLD-20260724.md`.
18. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V175-P0-HOLD-20260724.md`.
19. `app/docs/ACADEMIA-IMPACTO-V175-P0-HOLD-20260724.md`.
20. `tools/qa/tya-corte3-v175-residual-p0-r27-gate.mjs`.
21. Tracker, manifest/source lock más reciente, PR #7 y HEAD vivo.

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

Mayo 2026: 44 visitas HR, 42 exactas, 2 revisiones fail-closed, 32 GT y 10 HN exactas.

## 5. Candidata V175

- ZIP e integridad: PASS.
- Sintaxis: PASS.
- Correcciones parciales válidas: estados de honorario, eliminación del 85 %, copy determinístico y estructura parcial multimoneda/revisión/Shopper DEV.
- R26: HOLD.
- R27: HOLD.
- Decisión: `P0_PROVEN_HOLD_NO_APPLY`.

P0 residuales:

- selector Shopper DEV habilitado por sufijos Firebase genéricos;
- review queue no filtra contratos canónicos;
- periodo visible canónico con datos todavía locales;
- moneda del primer país aún usada en superficies principales;
- presupuesto con llave incoherente y duplicación potencial;
- exportación habilitada sin filas financieras reales.

## 6. Decisión

- V175 no aplicada.
- Corte 3: HOLD.
- Freeze: prohibido.
- Corte 4: no iniciar.
- No producción, merge, pagos, imports ni writes.

## 7. Siguiente bloque exacto

`CLAUDE CORRIGE V175 Y ENTREGA V176 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL → APROBADO → FREEZE CORTE 3`.
