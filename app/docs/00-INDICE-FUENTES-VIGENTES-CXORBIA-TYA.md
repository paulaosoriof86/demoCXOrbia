# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-25  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_V177_AUDITED_P0_PROVEN_HOLD_V178_REQUIRED_NO_FREEZE_NO_PRODUCTION`

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
10. `app/docs/VALIDACION-VISUAL-CORTE3-HOLD-PAULA-20260724.md`.
11. `app/docs/AUDITORIA-V175-CORTE3-P0-PROVEN-HOLD-20260724.md`.
12. `app/docs/AUDITORIA-V176-CORTE3-P0-PROVEN-HOLD-20260725.md`.
13. `app/docs/AUDITORIA-V177-CORTE3-P0-PROVEN-HOLD-20260725.md`.
14. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V177-P0-HOLD-20260725.md`.
15. `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V177-P0-HOLD-20260725.md`.
16. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V177-P0-HOLD-20260725.md`.
17. `app/docs/ACADEMIA-IMPACTO-V177-P0-HOLD-20260725.md`.
18. `tools/qa/tya-corte3-p0-source-contract-r26-gate.mjs`.
19. `tools/qa/tya-corte3-v175-residual-p0-r27-gate.mjs`.
20. `tools/qa/tya-corte3-v176-semantic-residual-p0-r28-gate.mjs`.
21. `tools/qa/tya-corte3-v177-finance-truth-r29-gate.mjs`.
22. Manifest/source lock más reciente, PR #7 y HEAD vivo.

## 3. Baseline preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- HR source-safe, módulos V174, adapters y `CX.data`: preservados.
- 14 periodos y 616 visitas.
- No se reabren V174, Corte 1 o Corte 2A.

## 4. Verdad financiera canónica

- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos confirmados;
- 0 lotes.

Mayo 2026: 44 visitas HR, 42 exactas, 2 revisiones fail-closed, 32 exactas GT y 10 HN.

## 5. Estado de candidatas

### V175

- integridad/sintaxis: PASS;
- R26/R27: HOLD;
- no aplicada.

### V176

- integridad/sintaxis: PASS;
- R26/R27/R28: HOLD;
- no aplicada.

### V177

- ZIP SHA-256: `cb755c9d7ce02d11944cb9926d1362ef37062a6edb8a46f28544ed3c7b849aea`;
- manifest/hashes, UTF-8 y `node --check` 4/4: PASS;
- R26/R27/R28: PASS;
- delta real: tres archivos; `app.js` y `layout.css` son idénticos a V176;
- R29: HOLD, 11/12 checks fallidos;
- decisión: `P0_PROVEN_HOLD_NO_APPLY`.

P0 V177:

- presupuesto del Dashboard usa periodo local implícito;
- presupuesto vacío crea cifras ficticias;
- filas sin moneda heredan la primera moneda;
- financiamientos multipaís se rotulan con una sola moneda;
- presupuesto no asignado se presenta como gasto ejecutado;
- referencia obsoleta y moneda inventada en presupuesto;
- `porPais(data)` usa contexto global en vez del suministrado;
- evidencia canónica/móvil/PDF/Excel incompleta.

## 6. Decisión

- Baseline funcional: V174.
- V175, V176 y V177 no aplicadas.
- Corte 3: HOLD.
- Freeze: prohibido.
- Corte 4: no iniciar.
- No producción, merge, pagos, imports ni writes.

## 7. Siguiente bloque exacto

`CLAUDE CORRIGE V177 Y ENTREGA V178 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 + R29 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN CANÓNICA/MÓVIL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.
