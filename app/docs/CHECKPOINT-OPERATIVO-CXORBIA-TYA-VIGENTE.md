# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-25  
**Estado:** `V174_ACTIVE_BASELINE_V178_AUDITED_P0_PROVEN_HOLD_V179_REQUIRED_NO_FREEZE_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- No nueva rama, PR, `main` ni force push.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. Baseline V174 preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Package SHA-256 V174: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- HR source-safe, adapters, módulos V174 y `CX.data`: preservados.

## 3. Verdad financiera canónica

- 14 periodos y 616 visitas HR;
- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos confirmados;
- 0 lotes.

Mayo 2026:

- 44 visitas HR;
- 42 filas exactas;
- 2 revisiones fail-closed;
- 32 exactas GT;
- 10 exactas HN.

## 4. Candidatas correctivas previas

- **V175:** integridad/sintaxis PASS; R26/R27 HOLD; no aplicada.
- **V176:** integridad/sintaxis PASS; R26/R27/R28 HOLD; no aplicada.
- **V177:** integridad/sintaxis PASS; R26/R27/R28 PASS; R29 HOLD; no aplicada.

## 5. Candidata V178

### EXECUTION_LANE_READY

- ZIP: `Prototype development request CXOrbia V178.zip`.
- Candidata: `CANDIDATA_V178_CORTE3_20260725`.
- SHA-256 ZIP: `ff77d4c6adda699327b4620207eb0be83689dbd3da55651c9a31d091b8217268`.
- GitHub autenticado, rama y PR verificados en HEAD `7c50bf79ff8105f7d00d82eac13a020000a44f7b` antes de auditar.
- Manifest y cinco hashes: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- Sin secretos.

### Delta real V177 → V178

Cambian:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`.

Idénticos a V177:

- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

### Correcciones válidas

- presupuesto del Dashboard con periodo explícito;
- defaults ficticios 4000/1200/800 eliminados;
- presupuesto pendiente no tratado como gasto real en Dashboard;
- base `currencyOf()` fail-closed;
- análisis de financiamientos por moneda;
- `porPais(data)` usa contexto recibido;
- R26/R27/R28/R29 PASS;
- cero pagos y lotes.

## 6. V178 — P0 comprobados

1. movimiento `pending_currency` todavía entra a `bump()`;
2. `pendingCurrencyRows` no se muestra ni cuenta;
3. export incluye moneda no resuelta;
4. gráfica exportada vuelve a sumar GTQ/HNL;
5. presupuesto mensual conserva primera moneda;
6. copy sigue mencionando `＋ Mes siguiente` eliminado;
7. financiamientos usan fallback `p.currency[f.pais] || cur`;
8. alta de financiamiento muestra monto con primera moneda antes de país;
9. CxP/CxC manuales y edición usan primera moneda;
10. lote sin moneda hereda primera moneda;
11. una lectura de presupuesto usa `CX.data.currentPeriodId` global.

Evidencia:

- una sola captura;
- no muestra la tarjeta de presupuesto indicada;
- no demuestra fuente TyA, móvil, host ni PDF/Excel.

## 7. Gates

- R26: PASS.
- R27: PASS.
- R28: PASS.
- R29: PASS.
- R30 residual: HOLD — 1/12 PASS.
- Gate vigente:
  `tools/qa/tya-corte3-v178-residual-finance-truth-r30-gate.mjs`.

## 8. Decisión

- V178: `P0_PROVEN_HOLD`.
- V178 no se aplicó parcial ni totalmente.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata: V179 incremental sobre V178.

## 9. Documentación vigente del bloque

- `app/docs/AUDITORIA-V178-CORTE3-P0-PROVEN-HOLD-20260725.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V178-P0-HOLD-20260725.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V178-P0-HOLD-20260725.md`.
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V178-P0-HOLD-20260725.md`.
- `app/docs/ACADEMIA-IMPACTO-V178-P0-HOLD-20260725.md`.

## 10. Clasificación

- **Reusable CXOrbia:** moneda pendiente, export por moneda, presupuesto, financiamientos, CxP/CxC y lotes.
- **Exclusivo cliente:** conteos TyA y dos revisiones GT.
- **Claude/prototipo:** V179 principalmente en Finanzas.
- **Academia:** moneda, presupuesto, revisión y exportación.
- **Sin impacto Claude:** auditoría, R30 y continuidad.

## 11. Siguiente bloque exacto

`CLAUDE CORRIGE V178 Y ENTREGA V179 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 + R29 + R30 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN CANÓNICA/MÓVIL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

## 12. Estado seguro

Hosting DEV permanece en la versión anterior; sin producción, merge, Cloud Run, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.
