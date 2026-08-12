# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 17:16 -06:00  
**Estado vivo:** `C6_RUNTIME_07_STOP_RETRY_NESTED_HEREDOC_PRE_HOSTING__PHASE_A_88__SOURCE_REPAIR_APPLIED__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia runtime 07: `app/docs/evidence/c6-live-user-admin-runtime-proof-31649967019.json`.
4. Run `31649967019`, job `94291913408`, artifact `9162195599`, digest `sha256:91af7648302218477177f7e2785b4b32bea517e2cdebe0b41cc60d082136891e`.
5. Reparación source-only posterior: workflow commit `66cffe4a0f236097264d2e0b2f361115464c8e34`; preflight commit `b024fd97cd7360a90a32041eb57bd0b003a029a2`.
6. C6 Staff Exact Write V2 y canonical readback PASS, cerrados/no repetibles.
7. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz.
8. Plan/tracker/Academia.
9. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Phase A: **88% certificado / 12% restante**.
- Runtime 07: STOP_RETRY antes de Hosting/runtime.
- Preflight Staff PASS, Google Cloud auth PASS y selector Staff dedicado PASS.
- Artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.
- Hosting intentado=false; Hosting=0; runtime=null.
- Causa raíz: `PREFLIGHT_SHELL_SYNTAX_COVERAGE_GAP__NESTED_HEREDOC_INDENTATION`.
- El error era shell del workflow, no producto/Auth/Firestore/membership/HR demostrado.
- Source repair ya aplicado sin rerun: heredocs anidados eliminados y preflight ampliado para compilar el script Hosting exacto con `bash -n` antes de provider.
- Nuevos writes=0; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado último runtime=+0%.**

## Siguiente acción exacta

No reabrir gates anteriores ni rerunear `31649967019`. Por STOP_RETRY se requiere nueva autorización explícita para un nuevo `HOSTING_RUNTIME_ONCE` bound al HEAD vivo reparado, con `action: C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. El preflight actualizado debe PASS antes del provider; solo entonces máximo un Hosting DEV Staff-only. Con PASS real: M7 → M8 → M9 → M10.
