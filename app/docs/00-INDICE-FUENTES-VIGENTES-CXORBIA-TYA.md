# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 17:49 -06:00  
**Estado vivo:** `C6_RUNTIME_09_STOP_RETRY_POST_AUTH_FRONTEND_HANDOFF__HOSTING_1_OF_1__SOURCE_REPAIR_APPLIED__PHASE_A_88__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia runtime 09: `app/docs/evidence/c6-live-user-admin-runtime-proof-31651410812.json`.
4. Run `31651410812`, job `94296350609`, artifact `9162751195`, digest `sha256:16970fb360a1fc54d3b94f7a6ff87138afa959ac6b6fa31f7299b78dfeee48d8`.
5. Reparación source-only posterior: membership/frontend handoff commit `a89ec134fe1b3b9cd0a8f014b39133d7a72ccd5a`; smoke commit `87bcddebeb74147dc0862ff3115186795978f058`; preflight v4 commit `84e736b064d66bf7f7bde3d54955d98fb0f0a9a9`.
6. C6 Staff Exact Write V2 y canonical readback PASS, cerrados/no repetibles.
7. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz.
8. Plan/tracker/Academia.
9. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Phase A: **88% certificado / 12% restante**.
- Runtime 09: STOP_RETRY después de Hosting y después de autenticación/contexto/autoridad HR, pero antes de entrada final visible al shell.
- Preflight Staff v3 PASS: `bash -n`, no heredoc anidado, keyboard submit y binding canónico.
- Google Cloud auth PASS y selector Staff dedicado PASS (`coordinador`).
- Firebase Hosting DEV deploy físico **PASS, 1/1 consumido**.
- Remote parity PASS exact=true, root 302 y canonical 200.
- Submit canónico ejecutado; contexto `coordinador/staff/tya/cinepolis` alcanzado.
- Autoridad HR viva aplicada: **15 periodos / 660 visitas / 211 shoppers**, `2025-06 → 2026-08`, duplicados=0.
- Artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.
- Causa raíz: `C6_POST_AUTH_HR_AUTHORITY_FRONTEND_ENTRY_HANDOFF_GAP__STALE_FIRESTORE_EMPTY_STATE`.
- Snapshot de fallo: `appOn=false`, `loginHidden=false`, `backendEmpty=true` pese a autoridad HR ya poblada.
- Source repair aplicado sin rerun: Staff revalida membership al evento de autoridad, reconcilia stale empty state y reutiliza `CX.app.enter()`; smoke/preflight v4 exigen el handoff completo.
- No se modificó `/app/modules` ni UI visual de producto.
- Nuevos writes=0; merge=false; producción=false.
- Verificación del workflow C6: `31651410812` sigue siendo el último run; no hubo segundo runtime tras STOP_RETRY.
- HEAD vivo al cierre documental previo a esta actualización: `9c6122c9d04d87d5dbf745d091ac0708e5565ef4`; este archivo es el commit documental final posterior.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado último runtime=+0%.**

## Siguiente acción exacta

No reabrir gates anteriores ni rerunear `31651410812`. Por STOP_RETRY se requiere nueva autorización explícita para un nuevo `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo reparado. El preflight v4 debe PASS antes del provider; solo entonces máximo un Hosting DEV Staff-only. Con PASS real: M7 → M8 → M9 → M10.
