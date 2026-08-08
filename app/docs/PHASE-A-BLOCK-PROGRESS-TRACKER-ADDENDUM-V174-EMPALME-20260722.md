# Phase A tracker addendum — V174 empalme funcional

Fecha: 2026-07-22

Estado: `V174_FUNCTIONAL_EMPALMED_GATE_HOLD_NO_DEPLOY`.

## Addendum corrección focalizada

Estado: `V174_HOLD_FIX_APPLIED_R20_SOURCE_IDENTITY_HOLD_NO_DEPLOY`.

- `HEAD_BEFORE` de corrección: `1703d36252cb957387fac6bcf348cf06ff22a5ef`.
- Commit focalizado: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- `app/core/tya-phase-a-source-safe-preview.js`: `honorario`, `boleto` y `comboAmt` usan semántica nullish.
- `tools/qa/tya-corte1-report-frontend-runtime-gate.mjs`: stub XLSX/PPT actualizado para V174.
- PASS: headers R20, HR in-place, contexto/histórico/reportes, report frontend runtime y Corte 2A canonical.
- HOLD: R20 proyecto/periodo/KPI por identidad `sourceAccessMode=public_gviz_csv_cache_busted`.
- HOLD derivado: M1 regression lock.

Causa raíz: `PRE_GATE_NOT_RECONCILED_WITH_EXACT_HEAD_OVERLAY_COMPOSITE`.

Regla reusable: todo PASS pre-empalme debe capturar candidate SHA, HEAD SHA, SHA del overlay protegido, SHA del gate, SHA/identidad del composite exacto y salida real del gate.

## Ejecutado

- Repositorio: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR: `#7` draft/open/no merge.
- `HEAD_BEFORE`: `0fd63faf2a873640e042421c40749714a4d12fd4`.
- ZIP: `CXOrbia-V174-VERIFICADA-e48452a4385e5dd.zip`.
- SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional: `b21e494d127fb4b902de5576e3fab0292362b097`.

## Delta aplicado

- `app/modules/cliente-extra.js`.
- `app/modules/operacion-extra.js`.
- `app/modules/visitas.js`.
- `app/modules/novedades.js`.
- `app/modules/postulaciones.js`.
- `app/modules/academia.js`.

## Gates

- PASS: `tya-hr-header-variants-r20-gate.mjs`.
- PASS: `tya-live-hr-inplace-refresh-gate.mjs`.
- PASS: `tya-corte1-context-history-reports-gate.mjs`.
- HOLD: `tya-corte1-report-frontend-runtime-gate.mjs`.
- HOLD: `tya-project-period-kpi-history-gate-r20.mjs`.
- HOLD: `tya-corte1-m1-regression-lock.mjs`.
- HOLD: `tya-corte2a-shopper-operation-canonical-gate.mjs`.

## Pendiente exacto

1. Autorizar bloque focalizado para `app/core/tya-phase-a-source-safe-preview.js`: preservar ausencia financiera como ausencia, no cero.
2. Completar dependencia local Playwright para navegador R20.
3. Actualizar/ejecutar harness de reportes con `XLSX.utils.encode_range` disponible.
4. Reejecutar M1 + Corte 2A.
5. Solo después decidir si procede Hosting DEV.

## Estado seguro

Sin deploy, sin merge, sin producción, sin importaciones, sin writes reales, sin Make/Gemini y sin pagos.
