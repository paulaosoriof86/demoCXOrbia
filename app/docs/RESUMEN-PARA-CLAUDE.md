# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 18:42 -06:00
**Estado:** `SHOPPER_P0_AUTH_HR_HANDOFF_DEPLOYED_DEV_PASS__HUMAN_ACCEPTANCE_PENDING`

La aceptación humana detectó un P0 Shopper post-login. La causa source-level quedó corregida sin rediseñar módulos ni rehacer identidades: `app/adapters/tya-canonical-shopper-portal-v2.js` usa el contexto Auth canónico `CX.backendAuth.context()`, espera la autoridad HR y re-renderiza después de `cx:protected-auth-hr-authority-ready`.

`app/core/backend-preview-status.js` distingue Proyecto operativo de Periodos HR y muestra Firestore como slice transitorio mientras espera HR viva.

Gate source: run `31749008509` SUCCESS, handoff Auth/HR PASS, identidad exacta PASS, hard fails 0.

Deploy DEV: workflow `CXOrbia C6 DEV Root Entrypoint Hosting`, run `31758046539`, job `94638091029`, SUCCESS. Se ejecutó exactamente un deploy Hosting a `cxorbia-backend-dev`, sin segundo deploy automático. Paridad remota PASS. Runtime Staff/Admin read-only PASS: 15 periodos, 660 visitas, agosto 2026 vigente, membership verificada, reloads y nueva pestaña estables. Artifact `9203525557`, digest `sha256:e17b2b6060e32a9d5d464ad42729421df1d43a44ef718f6a73faae52f3c2959a`.

Evidencias: `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json` y `app/docs/evidence/p0-shopper-auth-hr-dev-redeploy-pass-31758046539.json`.

Para Claude: no crear candidata, no rediseñar, no hardcodear Cinépolis, no unir identidades por nombre/correo y mantener Proyecto/Periodo separados. Academia y Certificación se revalidan por rol sobre este mismo build.

Pendiente real: aceptación humana Shopper post-deploy y regresión dirigida Admin/Operaciones, Cliente y Academia. Producción, merge y dominio oficial continúan bloqueados.