# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-25  
**Estado:** `V174_ACTIVE_BASELINE_V179_AUDITED_P0_PROVEN_HOLD_V180_REQUIRED_NO_FREEZE_NO_PRODUCTION`

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

- **V175:** R26/R27 HOLD; no aplicada.
- **V176:** R26/R27/R28 HOLD; no aplicada.
- **V177:** R26/R27/R28 PASS; R29 HOLD; no aplicada.
- **V178:** R26–R29 PASS; R30 HOLD; no aplicada.

## 5. Candidata V179

### EXECUTION_LANE_READY

- ZIP: `Prototype development request CXOrbia V179.zip`.
- Candidata: `CANDIDATA_V179_CORTE3_20260725`.
- SHA-256 ZIP: `7cd49963c0dd16622d45de313fae9307a27b7af5507695d2c9d57e18b4a54fb4`.
- GitHub autenticado, rama y PR verificados en HEAD `9804c4c60955065a47b0f861f143072af7d9287c` antes de auditar.
- Manifest y cinco hashes: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- Sin secretos.

### Delta real V178 → V179

Cambia:

- `app/modules/finanzas.js`.

Idénticos a V178:

- `app/core/finanzas-core.js`;
- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

### Correcciones válidas

- movimiento sin moneda sale de `bump()`;
- bandeja visible `pendingCurrencyRows`;
- gráfica por moneda;
- presupuesto mensual sin primera moneda visible;
- lote usa `pending_currency` en vez de fallback;
- R26–R30 PASS;
- cero pagos y lotes.

## 6. V179 — P0 comprobados

1. presupuesto usa identidades distintas (`p.id`, `canonicalPeriodId`, `canonMonth`);
2. KPIs mantienen totales crudos antes del filtro de moneda;
3. ingresos por tipo agrega `pending_currency`;
4. tablas/drill pueden renderizar `pending_currency` como dinero;
5. formularios no actualizan moneda ni exigen país;
6. edición CxP/CxC no permite resolver moneda;
7. Abonar permanece habilitado sin moneda;
8. financiamiento activo sin moneda puede aparecer `saldado`;
9. Pagar lote no se bloquea por revisión de moneda;
10. lote sin moneda puede aparecer pagado y monetario;
11. export depende de `reviewSection` no demostrado y usa conteo incorrecto;
12. copy/markup de presupuesto contiene texto residual.

Evidencia:

- una captura demo de bandeja;
- no demuestra conteos TyA, mayo↔julio, formularios, acciones, móvil, host ni PDF/Excel.

## 7. Gates

- R26: PASS.
- R27: PASS.
- R28: PASS.
- R29: PASS.
- R30: PASS.
- R31 operacional: HOLD — 4/27 PASS, 23 fallos.
- Gate vigente:
  `tools/qa/tya-corte3-v179-operational-currency-r31-gate.mjs`.

## 8. Decisión

- V179: `P0_PROVEN_HOLD`.
- V179 no se aplicó parcial ni totalmente.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata: V180 incremental sobre V179.

## 9. Documentación vigente del bloque

- `app/docs/AUDITORIA-V179-CORTE3-P0-PROVEN-HOLD-20260725.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V179-P0-HOLD-20260725.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V179-P0-HOLD-20260725.md`.
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V179-P0-HOLD-20260725.md`.
- `app/docs/ACADEMIA-IMPACTO-V179-P0-HOLD-20260725.md`.
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-V179-P0-HOLD-20260725.md`.

## 10. Clasificación

- **Reusable CXOrbia:** periodo único, formularios fail-closed, acciones monetarias, lote y exportación.
- **Exclusivo cliente:** conteos TyA y dos revisiones GT.
- **Claude/prototipo:** V180 concentrada en Finanzas.
- **Academia:** moneda, presupuesto, revisión, acciones y exportación.
- **Sin impacto Claude:** auditoría, R31 y continuidad.

## 11. Siguiente bloque exacto

`CLAUDE CORRIGE V179 Y ENTREGA V180 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 + R29 + R30 + R31 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN CANÓNICA/MÓVIL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

## 12. Estado seguro

Hosting DEV permanece en la versión anterior; sin producción, merge, Cloud Run, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.
