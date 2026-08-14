# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 19:20 -06:00
**Estado vivo:** `SHOPPER_P0_SOURCE_REPAIR_PASS__REAL_AUTH_E2E_PENDING__DEPLOYED_DEV_STILL_REJECTED__CUTOVER_BLOCKED`

## Fuentes vigentes

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
2. `app/docs/evidence/p0-exact-identity-contract-source-repair-pass-31761257145.json`
3. `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json`
4. `app/docs/ACADEMIA-ADDENDUM-P0-SHOPPER-IDENTITY-CONTRACT-SOURCE-READY-20260813.md`
5. `app/docs/CAMBIOS-BACKEND.md`
6. `app/docs/PENDIENTES-PROTOTIPO.md`
7. `app/docs/RESUMEN-PARA-CLAUDE.md`
8. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
9. `backend/config/corte6-dev-root-entrypoint-hosting-execute.json` — deploy previo consumido/deshabilitado; no autoriza segundo deploy.
10. `app/docs/evidence/p0-shopper-auth-hr-dev-redeploy-pass-31758046539.json` — deploy anterior técnicamente PASS pero aceptación humana posterior RECHAZADA.
11. `app/docs/evidence/m10-final-phase-a-freeze-31721769360.json`.
12. PR #7.

## Estado operativo prevalente

El P0 post-deploy quedó diagnosticado y la **reparación estructural source-only ya pasó**. El contrato reusable `app/adapters/cxorbia-exact-identity-contract-v1.js` define un único universo de 11 llaves técnicas exactas, equivalente al utilizado por la activación Auth, y prohíbe emparejar por nombre/correo/teléfono/usuario. El compositor y el portal Shopper consumen este contrato; una ambigüedad exacta queda fail-closed/revisión.

El entrypoint humano `app/index-backend-dev.html` ya no carga `data/tya-hr-source-safe-periods.js` ni `core/tya-phase-a-source-safe-preview.js`; esos archivos se preservan para laboratorio/preview source-safe, pero ya no siembran `CX.data` antes de Auth en la ruta humana. El watcher HR humano espera contexto Auth válido y se reactiva con `backend-auth-ready`.

Gate autoritativo source-only: workflow `CXOrbia Phase A Visual Smoke`, run `31761257145`, job `94647914674`, SUCCESS. Decisiones `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE` y `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`; smoke local `GO_WITH_WARNINGS_VISUAL_SMOKE_POST_V96`, hard fails 0, warning conocido `custom:custom_role_visible_nav_items:1`. Artifact `9204689215`, digest `sha256:0ec1c5fb23c894d89b6c80838303a2befb7f0e58c0fac9f774df407fc75d4402`.

**Importante:** `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE` certifica únicamente que el E2E real está bien instrumentado; no significa que se haya autenticado un Shopper contra Firebase. El build actualmente desplegado en DEV sigue siendo el anterior cuya aceptación Shopper fue rechazada; el source repair actual no ha sido desplegado.

Producción oficial, merge, dominio oficial y writes de Auth/Firestore/HR/Rules/Storage permanecen intactos.

## Siguiente acción exacta

Un único gate DEV read-only para revalidar el universo actual Auth/claims/perfiles/HR con el mismo contrato exacto y ejecutar un Shopper Firebase real → perfil protegido → HR → histórico, incluyendo Academia/Certificación en la misma identidad. Cero writes, cambios/reset de contraseña, deploy, Make, Gemini, pagos, merge o producción. Solo tras ese PASS corresponde gate separado de deploy DEV.
