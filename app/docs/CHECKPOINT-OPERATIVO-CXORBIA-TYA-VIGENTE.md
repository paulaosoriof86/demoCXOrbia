# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-25  
**Estado:** `V174_ACTIVE_BASELINE_V176_AUDITED_P0_PROVEN_HOLD_V177_REQUIRED_NO_FREEZE_NO_PRODUCTION`

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

## 4. Estado de V175

- Integridad y sintaxis: PASS.
- R26/R27: HOLD.
- V175: `P0_PROVEN_HOLD_NO_APPLY`.
- Correcciones válidas preservables: estados financieros honestos, eliminación del 85 %, estructura parcial multimoneda/revisión/Shopper DEV y responsive.

## 5. Candidata V176

### EXECUTION_LANE_READY

- ZIP: `Prototype development request CXOrbia V176.zip`.
- Candidata: `CANDIDATA_V176_CORTE3_20260724`.
- SHA-256 ZIP: `6b13adc994fa4fb64f69666c949144c8e93056741de9e090a9995f0802964edf`.
- Manifest y cinco hashes: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- CSS estructural: PASS.
- Tres capturas diferentes: PASS.
- No se detectaron secretos.

### Correcciones válidas

- allowlist DEV sin sufijos Firebase genéricos;
- review queue por contratos canónicos;
- eliminación de lectura directa `finStore.curPeriod()` en Finanzas;
- tabla principal de movimientos por moneda de fila;
- KPIs superiores de Beneficios por moneda;
- export guard mejorado;
- cero pagos y cero lotes preservados.

## 6. V176 — P0 comprobados

1. “Mes siguiente” todavía usa `CX.finStore.crearMesSiguiente()` y crea periodo local paralelo.
2. Drill de movimientos, ingresos por tipo y listado CxP siguen usando una moneda única.
3. El panel inferior de Beneficios conserva la primera moneda del proyecto y puede mostrar Q 0 a shopper HNL.
4. Presupuesto se lee con `data.project().id` sin periodo y se escribe con `data.period().id + periodo canónico`.
5. El presupuesto pendiente se adjunta y muestra completo en cada país, con moneda no confirmada.
6. No existe evidencia canónica/móvil completa de dos revisiones, mayo↔julio, host autorizado/no autorizado y PDF/Excel abiertos.

## 7. Gates

- R26 sobre V176: HOLD — 23/28 PASS.
- R27 sobre V176: HOLD — 7/13 PASS.
- R28 semántico: HOLD — 9 fallos funcionales.
- Gate nuevo: `tools/qa/tya-corte3-v176-semantic-residual-p0-r28-gate.mjs`.

## 8. Decisión

- V176: `P0_PROVEN_HOLD`.
- V176 no se aplicó parcial ni totalmente.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata requerida: V177 incremental sobre V176, preservando V174 y los fixes válidos.

## 9. Documentación vigente del bloque

- `app/docs/AUDITORIA-V176-CORTE3-P0-PROVEN-HOLD-20260725.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V176-P0-HOLD-20260725.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V176-P0-HOLD-20260725.md`.
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V176-P0-HOLD-20260725.md`.
- `app/docs/ACADEMIA-IMPACTO-V176-P0-HOLD-20260725.md`.

## 10. Clasificación

- **Reusable CXOrbia:** periodo único, moneda por superficie, presupuesto canónico y gate R28.
- **Exclusivo cliente:** cifras TyA y dos revisiones GT.
- **Claude/prototipo:** corrección V177 en cinco archivos.
- **Academia:** periodo, moneda, presupuesto, revisión y evidencia.
- **Sin impacto Claude:** auditoría, gates y continuidad documental.

## 11. Siguiente bloque exacto

`CLAUDE CORRIGE V176 Y ENTREGA V177 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

## 12. Estado seguro

Hosting DEV permanece en la versión anterior; sin producción, merge, Cloud Run deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.
