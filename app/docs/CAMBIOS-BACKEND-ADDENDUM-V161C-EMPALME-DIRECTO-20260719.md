# CAMBIOS BACKEND - V161C EMPALME DIRECTO Y POST-GATES R21

Fecha: 2026-07-19

## Empalme V161C

- V161C fue aplicada por `APPLY_DELTA_DIRECTLY` sobre `docs-tya-v6-v71-audit`.
- Commit de empalme: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- Delta frontend restringido a `app/app.js`, `app/core/config.js`, `app/core/router.js`, `app/modules/visita-detalle.js`, `app/modules/visitas.js` y `app/REPORTE-DE-CAMBIOS.md`.
- `app/index-test-base.html` no existía en la rama.
- Manifest, build-lock y verificador V161C quedaron generados.

## Corrección de causa raíz post-gate

El HOLD navegador no era una regresión de V161C. Se comprobó que:

1. el workflow estaba construyendo el snapshot con `tya-build-live-hr-source-safe-static.mjs`, que no conserva la resolución contractual de shopper/asignación del mapper R20;
2. la HR viva ya contenía agosto de 2026, mientras el baseline contractual de Corte 0B termina en julio de 2026.

Cambios aplicados:

- `.github/workflows/cxorbia-phase-a-r18a-canonical-assets-integration.yml`
  - usa `tya-build-live-hr-source-safe-r20.mjs`;
  - ejecuta canonicalización R18A y reaplicación final R20/R21;
  - construye el adapter R21 en copia efímera;
  - ejecuta Playwright y el gate navegador sobre el build generado;
  - conserva reportes source-safe como artifact.
- `tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs`
  - nuevo filtro fail-closed contra `backend/contracts/tya-hr-tab-inventory-r20-v1.json`;
  - deja Corte 0B en 14 periodos, 28 pestañas y 616 visitas;
  - excluye agosto de 2026 solo del corte actual;
  - no contiene PII ni workbook crudo;
  - no escribe proveedores, no importa y no despliega.

## Evidencia final

- HEAD técnico que disparó el PASS: `7acc4e6c18355827df6ed649c3a537db07eec196`.
- Run: `29712762494` — SUCCESS.
- Artifact: `8449340543`.
- Digest: `sha256:a2e4861610a1928bbf77ce34b790bad1765ff5bda91302669f7d14ad1ee75864`.
- `PASS_R20_VERIFIED_INVENTORY_FILTER`.
- `PASS_R21_ELIGIBILITY_FINAL_CANONICAL_PASS`.
- `PASS_R21_POSTULATION_ELIGIBILITY`.
- `PASS_WITH_WARNING_R21_TYA_SOURCE_SEMANTICS`.
- Browser: 0 blockers, 0 page errors, 0 console errors.
- Julio: 44 visitas, 39 asignadas, 5 sin asignar, 4 disponibles, 1 bloqueada.
- Advertencia: `209/216` referencias shopper, sin inferir identidades.

## Preservación

- `app/core/data.js`, `app/core/store.js` e `app/index.html` fuente permanecen protegidos; el workflow modifica únicamente la copia de build durante la ejecución.
- Backend, adapters fuente, contratos, integraciones, overlays y la interfaz `CX.data` permanecen preservados.
- No se conectó ni copió la base legacy.

## Clasificación

- Reusable CXOrbia: inventario de corte, filtro source-safe fail-closed, build efímero y gate navegador reproducible.
- Exclusivo TyA: inventario GT/HN hasta julio de 2026 y reglas Cinépolis Q1/Q2/P1Q.
- Claude/prototipo: sin nuevo ajuste; V161C permanece como candidata final aplicada.
- Academia: sin cambio funcional adicional; manuales deben reflejar la versión visual que se publique en DEV.
- Sin impacto Claude: workflow, mapper, filtro, reports y gates.

## Estado

`TECHNICAL_PASS_PENDING_DEV_AUTHORIZATION`
