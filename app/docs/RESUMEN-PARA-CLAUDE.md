# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 16:16 -06:00
**Estado:** `SHOPPER_P0_AUTH_HR_HANDOFF_SOURCE_PASS__DEV_REDEPLOY_PENDING`

La aceptación humana detectó un P0 Shopper post-login. La causa source-level ya fue corregida sin rediseñar módulos ni rehacer identidades: `app/adapters/tya-canonical-shopper-portal-v2.js` usa ahora el contexto Auth canónico `CX.backendAuth.context()`, espera la autoridad HR y re-renderiza después de `cx:protected-auth-hr-authority-ready`.

`app/core/backend-preview-status.js` distingue Proyecto operativo de Periodos HR y muestra Firestore como slice transitorio mientras espera HR viva.

El gate existente quedó ampliado en `tools/qa/tya-phase-a-visual-smoke.mjs`. Run `31749008509`: SUCCESS, handoff Auth/HR PASS, identidad exacta PASS, hard fails 0, proveedores/writes/deploy 0.

Evidencia: `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json`.

Para Claude: no crear candidata, no rediseñar, no hardcodear Cinépolis, no unir identidades por nombre/correo y mantener Proyecto/Periodo separados. Academia y Certificación se revalidan por rol después del próximo deploy DEV.

Pendiente: publicar el HEAD vigente en Hosting DEV bajo gate específico y repetir aceptación humana antes de producción.
