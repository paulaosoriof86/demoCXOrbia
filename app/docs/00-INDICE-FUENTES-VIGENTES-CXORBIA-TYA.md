# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 17:30 -06:00  
**Estado vivo:** `C6_RUNTIME_08_STOP_RETRY_POINTER_INTERCEPT__HOSTING_1_OF_1__SOURCE_REPAIR_APPLIED__PHASE_A_88__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia runtime 08: `app/docs/evidence/c6-live-user-admin-runtime-proof-31650715194.json`.
4. Run `31650715194`, job `94294235029`, artifact `9162485896`, digest `sha256:e30accedd8e8c571066319572267e84856752577b7cd4cd63e0cd1f3c7d20194`.
5. Reparación source-only posterior: smoke commit `ccf759c2a82a5baf82397cef02c3ca7851e13ce8`; preflight v3 commit `7cab212e5583ed7e2b4dc8b132b0d2b5bf953c19`.
6. C6 Staff Exact Write V2 y canonical readback PASS, cerrados/no repetibles.
7. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz.
8. Plan/tracker/Academia.
9. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Phase A: **88% certificado / 12% restante**.
- Runtime 08: STOP_RETRY después de Hosting y antes de submit de credenciales.
- Preflight Staff v2 PASS incluyendo `bash -n` del shell Hosting exacto y ausencia de heredoc anidado.
- Google Cloud auth PASS y selector Staff dedicado PASS (`coordinador`).
- Source parity PASS.
- Firebase Hosting DEV deploy físico **PASS, 1/1 consumido**.
- Remote parity `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`, exact=true, root 302 y canonical 200.
- Artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.
- Causa raíz: `QA_POINTER_INTERCEPTION_BY_BACKEND_PREVIEW_STATUS_OVERLAY`.
- `#cxBackendPreviewStatus` se superpuso a `#lgSubmit` e interceptó pointer events; el formulario canónico nunca llegó a submitirse.
- No hay fallo nuevo demostrado de Auth/claims/membership/Firestore/HR.
- Source repair ya aplicado sin rerun: el smoke usa Enter desde `#lgPass` para activar el mismo submit canónico y el preflight v3 bloquea la regresión al pointer click.
- No se modificó producto/UI, `/app/modules` ni `app/core/backend-preview-status.js`.
- Nuevos writes=0; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado último runtime=+0%.**

## Siguiente acción exacta

No reabrir gates anteriores ni rerunear `31650715194`. Por STOP_RETRY se requiere nueva autorización explícita para un nuevo `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo reparado, con `action: C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. El preflight v3 debe PASS antes del provider, incluyendo shell válido y submit canónico por teclado; solo entonces máximo un Hosting DEV Staff-only. Con PASS real: M7 → M8 → M9 → M10.
