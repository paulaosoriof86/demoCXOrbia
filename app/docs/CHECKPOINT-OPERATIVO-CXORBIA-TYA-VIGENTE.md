# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-25  
**Estado:** `V174_ACTIVE_BASELINE_V177_AUDITED_P0_PROVEN_HOLD_V178_REQUIRED_NO_FREEZE_NO_PRODUCTION`

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
- Módulos V174, HR source-safe, adapters y `CX.data`: preservados.

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

## 4. Candidatas anteriores

### V175

- integridad y sintaxis PASS;
- R26/R27 HOLD;
- no aplicada.

### V176

- integridad y sintaxis PASS;
- correcciones parciales válidas preservables;
- R26/R27/R28 HOLD;
- no aplicada.

## 5. Candidata V177

### EXECUTION_LANE_READY

- ZIP: `Prototype development request CXOrbia V177.zip`.
- Candidata: `CANDIDATA_V177_CORTE3_20260725`.
- SHA-256 ZIP: `cb755c9d7ce02d11944cb9926d1362ef37062a6edb8a46f28544ed3c7b849aea`.
- Manifest y cinco hashes: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- Dos capturas diferentes: PASS.
- GitHub autenticado, rama viva y PR #7 verificados.
- No secretos detectados.

### Delta real

Cambian V176→V177:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`.

Son idénticos a V176:

- `app/app.js`;
- `app/styles/layout.css`.

### Correcciones válidas

- elimina `crearMesSiguiente` de la UI;
- R26/R27/R28 pasan;
- completa varias superficies multimoneda;
- elimina moneda primaria del panel inferior de Beneficios;
- agrega `__unassignedBudget` único fuera del mapa por país;
- conserva allowlist DEV, review queue, export guard, cero pagos y cero lotes.

## 6. V177 — P0 comprobados

1. Dashboard usa `CX.finStore.pres(p.id)` sin periodo canónico explícito.
2. Dashboard siembra presupuestos ficticios 4000/1200/800 cuando no existe fuente.
3. Resolutores y agregadores con `|| cur` convierten moneda faltante en la primera moneda.
4. Financiamientos multipaís se suman y rotulan con `defCur0(p)`.
5. `__unassignedBudget.total` se usa como `fijReal`, semáforo y `Total ejecutado`.
6. Persiste `d.fijosPendienteAsignacion`, campo eliminado.
7. Presupuesto sin moneda asignada se muestra con la primera moneda.
8. `CX.fin.porPais(data)` toma el periodo desde `CX.data` global y no desde `data`.
9. Evidencia canónica/móvil/exportación incompleta.

## 7. Gates

- R26 sobre V177: PASS.
- R27 sobre V177: PASS.
- R28 sobre V177: PASS.
- R29 sobre V177: HOLD — 11/12 checks fallidos.
- Gate vigente agregado:
  `tools/qa/tya-corte3-v177-finance-truth-r29-gate.mjs`.

## 8. Decisión

- V177: `P0_PROVEN_HOLD`.
- V177 no se aplicó parcial ni totalmente.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata: V178 incremental sobre V177, preservando V174 y fixes válidos.

## 9. Documentación vigente

- `app/docs/AUDITORIA-V177-CORTE3-P0-PROVEN-HOLD-20260725.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V177-P0-HOLD-20260725.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V177-P0-HOLD-20260725.md`.
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V177-P0-HOLD-20260725.md`.
- `app/docs/ACADEMIA-IMPACTO-V177-P0-HOLD-20260725.md`.

## 10. Clasificación

- **Reusable CXOrbia:** periodo explícito, presupuesto sin fixtures, moneda faltante fail-closed, contexto suministrado y R29.
- **Exclusivo cliente:** cifras TyA y dos revisiones GT.
- **Claude/prototipo:** V178 sobre tres archivos de delta real.
- **Academia:** presupuesto planeado/ejecutado, moneda y contexto.
- **Sin impacto Claude:** auditoría, gate y continuidad.

## 11. Siguiente bloque exacto

`CLAUDE CORRIGE V177 Y ENTREGA V178 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 + R29 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN CANÓNICA/MÓVIL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

## 12. Estado seguro

Hosting DEV permanece en la versión anterior; sin producción, merge, Cloud Run deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.
