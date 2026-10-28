# CXOrbia I3 — rectificación mecánica del conteo V187

**ID:** `CXORBIA-I3-V187-COUNT-CORRECTION-20261028`  
**Fecha:** 2026-10-28 America/Guatemala  
**Tipo:** `CONTROL_ONLY`, aditivo e inmutable; no producto, HR, Auth, Storage, Firestore, Hosting ni producción.  
**Documento relacionado:** `CXORBIA_I3_PRIORIDAD_TRANSVERSAL_GO_LIVE_FREEZE_2026-10-28.md`.

## BEFORE / AFTER

- **BEFORE:** la sección 2 del congelamiento refería 21 dominios, 4 `MATCH` y 17 no-MATCH, con base en una lectura resumida preliminar.
- **AFTER / autoridad:** el readback directo de `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261028-V187.json`, `modules[].classification`, en la rama `recovery/cxorbia-phase-a-20260831`, vinculado al product source `77fd283349ce46033a95235fd2fae632e856fe35`, cuenta **21 dominios, 5 `MATCH`, 16 no-MATCH**.

Los cinco módulos `MATCH` son: `historical`, `identity-membership-roll-forward`, `phase-a-supporting-core`, `reports-admin-shopper` y `tenant-admin-config-branding`.

El conjunto no-MATCH se descompone en:

- 2 `SOURCE_FIXED_DEV_MATERIALIZED_FOCAL_LIVE_E2E_PASS_PENDING_HUMAN`;
- 4 `SOURCE_FIXED_PENDING_QA_DEV_E2E_HUMAN`;
- 3 `SOURCE_FIXED_DEV_MATERIALIZED_PENDING_LIVE_E2E_HUMAN`;
- 3 `TRUE_FUNCTIONAL_DEFECT`;
- 1 `SOURCE_INSTRUMENTATION_DEV_MATERIALIZED_PENDING_ADMIN_LIVE_E2E`;
- 2 `COMPOSED_NOT_DEPLOYED`;
- 1 `SOURCE_FIXED_PENDING_CI_AND_DEV_FOCAL`.

**Causa:** error aritmético de una síntesis de revisión, no cambio funcional ni nuevo resultado de prueba. **Efecto:** sustituye exclusivamente el conteo 4/17 del documento relacionado por 5/16. Conserva íntegros el orden de prioridades, el trabajo transversal concurrente con escritor único, el estado `I3=HOLD`, Gate20/21 `HOLD`, `I4=NOT_AUTHORIZED` y producción `DO_NOT_TOUCH`. Ninguna obligación se cierra ni reabre por este recuento.

No reescribir el archivo congelado anterior; leer este correctivo junto a él. Toda nueva cifra debe derivarse mecánicamente de la matriz que señale el descriptor canónico vivo.
