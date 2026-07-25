# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-25  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_V179_AUDITED_P0_PROVEN_HOLD_V180_REQUIRED_NO_FREEZE_NO_PRODUCTION`

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
11. Auditorías V175–V178 como antecedentes de HOLD.
12. `app/docs/AUDITORIA-V179-CORTE3-P0-PROVEN-HOLD-20260725.md`.
13. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V179-P0-HOLD-20260725.md`.
14. `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V179-P0-HOLD-20260725.md`.
15. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V179-P0-HOLD-20260725.md`.
16. `app/docs/ACADEMIA-IMPACTO-V179-P0-HOLD-20260725.md`.
17. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-V179-P0-HOLD-20260725.md`.
18. `tools/qa/tya-corte3-p0-source-contract-r26-gate.mjs`.
19. `tools/qa/tya-corte3-v175-residual-p0-r27-gate.mjs`.
20. `tools/qa/tya-corte3-v176-semantic-residual-p0-r28-gate.mjs`.
21. `tools/qa/tya-corte3-v177-finance-truth-r29-gate.mjs`.
22. `tools/qa/tya-corte3-v178-residual-finance-truth-r30-gate.mjs`.
23. `tools/qa/tya-corte3-v179-operational-currency-r31-gate.mjs`.
24. Manifest/source lock más reciente, PR #7 y HEAD vivo.

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

- **V175:** R26/R27 HOLD; no aplicada.
- **V176:** R26/R27/R28 HOLD; no aplicada.
- **V177:** R26–R28 PASS, R29 HOLD; no aplicada.
- **V178:** R26–R29 PASS, R30 HOLD; no aplicada.
- **V179:** integridad, hashes, UTF-8 y `node --check` PASS; R26–R30 PASS; R31 HOLD 4/27; no aplicada.

Delta real V179:

- cambia únicamente `app/modules/finanzas.js`;
- `finanzas-core.js`, `beneficios.js`, `app.js` y `layout.css` son idénticos a V178.

P0 V179:

- presupuesto con identidades de periodo distintas;
- totales crudos anteriores al filtro de moneda;
- `pending_currency` en ingresos por tipo y superficies monetarias;
- formularios no reactivos ni fail-closed;
- edición CxP/CxC sin resolución de moneda;
- Abonar/Devolver/Pagar lote no bloqueados de forma coherente;
- financiamiento pendiente puede aparecer saldado;
- lote pendiente puede aparecer pagado y monetario;
- exportación y conteo no demostrados;
- markup residual;
- evidencia canónica/móvil/PDF/Excel incompleta.

## 6. Decisión

- Baseline funcional: V174.
- V175–V179 no aplicadas.
- Corte 3: HOLD.
- Freeze: prohibido.
- Corte 4: no iniciar.
- No producción, merge, pagos, imports ni writes.

## 7. Siguiente bloque exacto

`CLAUDE CORRIGE V179 Y ENTREGA V180 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 + R29 + R30 + R31 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN CANÓNICA/MÓVIL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.
