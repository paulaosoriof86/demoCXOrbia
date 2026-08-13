# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 17:58 -06:00  
**Estado vivo:** `C6_RUNTIME_10_STOP_RETRY_CANONICAL_MEMBERSHIP_RECONCILE_BLOCKED__HOSTING_1_OF_1__PHASE_A_88__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia runtime 10: `app/docs/evidence/c6-live-user-admin-runtime-proof-31652523820.json`.
4. Run `31652523820`, job `94299776053`, artifact `9163167746`, digest `sha256:be83f65bf5484858fa42844ede9f56f0952bcef06a775fd4244524cc5880799f`.
5. Evidencia runtime 09 y reparación source-only membership/frontend handoff permanecen como antecedente inmediato, no como estado final.
6. C6 Staff Exact Write V2 y canonical readback PASS, cerrados/no repetibles.
7. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz.
8. Plan/tracker/Academia.
9. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit` (resolver siempre en vivo; no fijar un SHA autorreferencial dentro de este índice).

## Estado técnico vigente

- Phase A: **88% certificado / 12% restante**.
- Runtime 10: `STOP_RETRY` posterior al provider; no se permite segundo intento bajo esta autorización.
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT` **v4 PASS** antes de provider, incluyendo `bash -n`, ausencia de heredoc anidado, keyboard submit, membership→authority→frontend contract, stale-empty reconciliation contract, `CX.app.enter()` y ausencia de mutación directa UI.
- Google Cloud DEV auth PASS y selector Staff dedicado PASS (`coordinador`, Shopper/Cliente=false).
- Source parity PASS.
- Firebase Hosting DEV deploy físico **PASS, 1/1 consumido**.
- Remote parity `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`, exact=true, root 302 y canonical 200.
- Submit canónico ejecutado; contexto `coordinador/staff/tya/cinepolis` alcanzado.
- Autoridad HR viva aplicada: **15 periodos / 660 visitas / 211 shoppers**, `2025-06 → 2026-08`, duplicados de visitas/shoppers=0.
- Runtime final: `membershipVerified=false`, `frontendHandoffStatus=blocked`, `staleBackendEmpty=true`, `staleCorte4Empty=true`, `appOn=false`, `loginHidden=false`.
- Artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.
- Frontera causal demostrada: `C6_CANONICAL_MEMBERSHIP_RECONCILE_BLOCKED_POST_AUTHORITY__EXACT_SUBCODE_NOT_CAPTURED`.
- El artifact no captura el `error/code` exacto del handoff; no es válido inferir si fue self-read, membership missing/inactive, tenant/namespace/role/entitlement/project scope, claimsDigest, providerUidFingerprint o el post-check inmediato.
- No hay nuevo fallo demostrado de login, Firebase Auth principal, contexto claims, HR authority, Hosting o remote parity.
- No se modificó `/app/modules` ni UI visual del producto.
- Nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Exact Write=0; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 10=+0%.**

## Siguiente acción exacta

No rerunear `31652523820` ni crear otro Hosting bajo la autorización consumida. Antes de otro provider, cerrar source-only la causa raíz exacta del membership reconcile: instrumentar/certificar la captura sanitizada de `CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF.error`, `CX_C6_LIVE_USER_ADMIN_WIRING.status/code` y membershipVerified en contexto/sesión, sin writes/deploy. Solo con el subcódigo demostrado se corrige la causa exacta y se solicita/consume un nuevo provider one-shot. M8 → M9 → M10 siguen bloqueados por M7.
