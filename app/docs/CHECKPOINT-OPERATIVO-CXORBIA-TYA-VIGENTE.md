# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

## Addendum 2026-07-22 — V174 HOLD focalizado corregido / R20 fuente pendiente

Estado: `V174_HOLD_FIX_APPLIED_R20_SOURCE_IDENTITY_HOLD_NO_DEPLOY`.

- `HEAD_BEFORE`: `1703d36252cb957387fac6bcf348cf06ff22a5ef`.
- Commit funcional focalizado: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- Archivos modificados en el commit focalizado:
  - `app/core/tya-phase-a-source-safe-preview.js`;
  - `tools/qa/tya-corte1-report-frontend-runtime-gate.mjs`.
- El overlay source-safe ahora preserva `0` real y deja ausencia como `null` para `honorario`, `boleto` y `comboAmt`.
- El harness Node de reportes modela `XLSX.utils.encode_range` y la API mínima PPT usada por V174.

Gates post-corrección:

- PASS: `tya-hr-header-variants-r20-gate.mjs`.
- PASS: `tya-live-hr-inplace-refresh-gate.mjs`.
- PASS: `tya-corte1-context-history-reports-gate.mjs`.
- PASS: `tya-corte1-report-frontend-runtime-gate.mjs`.
- HOLD: `tya-project-period-kpi-history-gate-r20.mjs` por `source_not_live_verified:public_gviz_csv_cache_busted`; el runtime local observó 14 periodos, 616 visitas, GT/HN, Julio 2026 con 44 visitas y conteos coherentes, pero la identidad de fuente no es una de las aceptadas por el gate.
- PASS: `tya-corte2a-shopper-operation-canonical-gate.mjs`.
- HOLD: `tya-corte1-m1-regression-lock.mjs`, derivado únicamente del HOLD R20 anterior.

Causa raíz metodológica registrada: `PRE_GATE_NOT_RECONCILED_WITH_EXACT_HEAD_OVERLAY_COMPOSITE`.

Regla reusable: todo PASS pre-empalme debe registrar y verificar conjuntamente candidate SHA, HEAD SHA, SHA del overlay protegido, SHA del gate ejecutado, SHA/identidad del composite exacto y salida real del gate.

No se hizo deploy, merge, producción, imports, writes HR/Firestore/Auth/Storage, Make/Gemini ni pagos.

## Addendum 2026-07-22 — V174 empalme funcional aplicado / gates en HOLD

Estado: `V174_FUNCTIONAL_EMPALMED_GATE_HOLD_NO_DEPLOY`.

- `HEAD_BEFORE`: `0fd63faf2a873640e042421c40749714a4d12fd4`.
- ZIP aplicado: `CXOrbia-V174-VERIFICADA-e48452a4385e5dd.zip`.
- SHA-256 verificado: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Delta aplicado exclusivamente: `app/modules/cliente-extra.js`, `app/modules/operacion-extra.js`, `app/modules/visitas.js`, `app/modules/novedades.js`, `app/modules/postulaciones.js`, `app/modules/academia.js`.
- Cero archivos funcionales adicionales en el commit de empalme.
- Manifest/build-lock/verificador V174 generados sobre el HEAD empalmado.

Gates:

- PASS: `tya-hr-header-variants-r20-gate.mjs`.
- PASS: `tya-live-hr-inplace-refresh-gate.mjs`.
- PASS: `tya-corte1-context-history-reports-gate.mjs`.
- HOLD: `tya-corte1-report-frontend-runtime-gate.mjs` por dependencia de harness local (`XLSX.utils.encode_range` ausente en stub).
- HOLD: `tya-project-period-kpi-history-gate-r20.mjs` por dependencia local Playwright incompleta (`playwright-core` ausente).
- HOLD: `tya-corte2a-shopper-operation-canonical-gate.mjs` por overlay preservado `app/core/tya-phase-a-source-safe-preview.js` con colapso de ausencias financieras a cero (`v.honorario||0`, `v.boleto||0`, `v.comboAmt||0`).
- HOLD: `tya-corte1-m1-regression-lock.mjs` como consecuencia de gates anteriores.

No se hizo deploy, merge, produccion, imports, writes HR/Firestore/Auth/Storage, Make/Gemini ni pagos.

Fecha: 2026-07-22  
Estado: `CORTE_2A_V174_AUDITED_GO_APPLY_LANE_PENDING`

## 1. Repositorio y baseline funcional

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Build funcional M1 validado en DEV: `67c0943260f076f5686284ac509458ed5fd34dbd`.
- Corte 1 / M1: `FROZEN_WITH_DOCUMENTED_P1_P2`.
- Corte 2A: candidata V174 auditada GO; aplicación atómica pendiente.

La candidata que produjo M1 ya fue aplicada y validada. V174 es la siguiente candidata incremental/acumulada para Corte 2A; no reabre M1.

## 2. Resultado técnico y visual M1 congelado

- Cloud Run DEV y Hosting DEV: PASS.
- HR runtime viva y source-safe: PASS.
- Refresco in-place sin recarga evidente: PASS.
- Cambio de periodos: PASS.
- KPI ante asignación/cuestionario controlado: PASS.
- Portal shopper retira visitas asignadas desde HR: PASS.
- Coherencia Dashboard Admin / Panorama Cliente / reportes: PASS.

### Julio 2026 validado

- 44 visitas: GT 34, HN 10.
- 41 asignadas: GT 32, HN 9.
- 3 sin asignar: GT 2, HN 1.
- 28 realizadas: GT 21, HN 7.
- 26 con cuestionario: GT 20, HN 6.
- 20 submitidas: GT 16, HN 4.
- 6 sin submitir.
- 2 cuestionarios pendientes.
- 0 pagos confirmados.

## 3. Corrección metodológica aplicada

Causa raíz corregida: el checkout local estaba siendo tratado erróneamente como requisito previo de auditoría.

Desde ahora:

- `AUDIT_LANE_READY` requiere bytes/extracción, runtime local y lectura autoritativa de rama; no checkout local.
- `APPLY_LANE_READY` exige aplicación atómica autenticada con commit/push y HEAD verificables.
- una candidata GO sin carril de aplicación queda `AUDITED_GO_APPLY_LANE_PENDING`, sin pedir otra candidata ni reauditar.

Fuente prevalente:

- `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.

## 4. Auditoría V174 cerrada

- Archivo: `Prototype development request (16).zip`.
- Paquete: `CANDIDATA_V174_ACUMULADA_20260722`.
- SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- `HEAD_BEFORE` de auditoría: `91924ff34d377fff6601cebe6d59b269a2c00834`.
- Decisión: `AUDITED_GO_APPLY_LANE_PENDING`.
- P0: ninguno demostrado.

Evidencia:

- integridad de 20 archivos declarados: PASS;
- 68/68 JS/MJS pasan sintaxis Node;
- scripts locales faltantes: 0;
- secretos detectados: 0;
- UTF-8/BOM: PASS;
- Visitas y Postulaciones cumplen el gate estático de Corte 2A preservando overlays de rama;
- V174 incorpora Excel enriquecido, Efectividad, Academia canónica y Novedades.

Source lock:

- `app/docs/AUDITORIA-CANDIDATA-V174-CORTE2A-SOURCE-LOCK-20260722.md`.

## 5. P1/P2 no bloqueantes

1. Build-lock/verificador del paquete permanecen en V156 y deben regenerarse tras el empalme.
2. El logo gráfico real en PPT no está demostrado y continúa pendiente de validación/corrección focalizada.
3. `MANIFEST.sha256` está nombrado de forma imprecisa.
4. Mojibake histórico menor fuera del delta funcional.

## 6. Regla de aplicación

No reemplazar `app/` completa. La candidata excluye backend, adapters live, contratos, tools y overlays vivos.

Aplicar únicamente el delta auditado V165→V174, preservando:

- adapters de refresco/aplicación in-place;
- contratos y gates M1/Corte 2A;
- backend, tools y documentación vigente;
- sourceRevision y contexto proyecto/periodo;
- Academia/manuales acumulados no incluidos en la candidata.

## 7. Lock anti-regresión obligatorio

Toda aplicación/deploy debe preservar:

- una sola revisión runtime para Admin, Cliente, Shopper y reportes;
- `fresh=1` fail-closed;
- aplicación in-place sin `location.reload()`;
- proyecto y periodo separados;
- facets canónicas y estados ortogonales;
- ausencia de fuente distinta de cero confirmado;
- canary de asignación/cuestionario;
- comparación transversal de KPI;
- marketplace shopper coherente;
- cero pagos inferidos.

Gates mínimos:

- `tya-hr-header-variants-r20-gate.mjs`;
- `tya-live-hr-inplace-refresh-gate.mjs`;
- `tya-corte1-context-history-reports-gate.mjs`;
- `tya-corte1-report-frontend-runtime-gate.mjs`;
- `tya-project-period-kpi-history-gate-r20.mjs`;
- `tya-corte1-m1-regression-lock.mjs`;
- `tya-corte2a-shopper-operation-canonical-gate.mjs`;
- smoke remoto `fresh=1` y validación visual.

## 8. Siguiente acción exacta

`APPLY_LANE_READY → verificar SHA V174 y HEAD compatible → APPLY_DELTA_DIRECTLY sobre docs-tya-v6-v71-audit → commit/push atómico → manifest/build-lock/verificador nuevos → gates M1 + Corte2A → Hosting DEV autorizado → validación visual → freeze Corte 2A`.

No se solicita otra candidata ni se repite la auditoría V174.

## 9. Estado seguro

Sin empalme V174 todavía, sin merge, producción, importación real, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos reales.
