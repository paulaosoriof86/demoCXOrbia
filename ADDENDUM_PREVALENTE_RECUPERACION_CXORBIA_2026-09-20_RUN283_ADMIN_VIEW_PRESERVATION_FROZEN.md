# ADDENDUM PREVALENTE — I3 RUN 283 ADMIN VIEW PRESERVATION LOCK

**Fecha:** 2026-09-20  
**ID:** `CXORBIA-I3-RUN283-ADMIN-VIEW-PRESERVATION-20260920`  
**Estado:** `FROZEN`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

Run 283 (`35497011065`) mantuvo Step23 PASS, Gate20 PASS y artifact único. La suite viva quedó en `7/10`, con `cleanup=true`, `build=0`, `deploy=0`, `production=false`.

El causal físico final fue:
`VISUAL_DEFECT:ADMIN_ROWS_NOT_RERENDERED_AFTER_COMPOSITION`.

La evidencia mostró simultáneamente:
- los cuatro shoppers presentes en `CX.data.shoppers`;
- los cuatro incluidos por `CX.data.shoppersFor()`;
- `rowsVisible=false`;
- vista final cambiada de `shoppers` a `midia`;
- autoridad con reason `c6_nav_waiting_hr_authority`.

Root cause: `app/adapters/tya-c6-unified-human-runtime-v1.js::installHumanAuthorityGate.release` podía ejecutar `originalMount()` sin una vista pendiente local y dejar que el mount sustituyera la vista Admin válida por la primera vista del rail.

Corrección focal:
`const requested=pendingView||CX.session?.view||null;`

Nueva product source:
- `47c1aad1baf2d229ccb2e6753b6491a8f342c111`
- tree `f802966cb2e64d0ac6cac932463f1b34dde872c8`

No cambia Auth, HR, persistencia, mapping ni producción.

Siguiente acción: una sola recertificación canónica hasta Step23 → Gate20 → artifact único → live fixtures 10/10 → Gate21 PASS.