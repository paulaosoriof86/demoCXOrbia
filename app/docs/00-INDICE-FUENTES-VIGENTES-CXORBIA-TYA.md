# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_PROFILE_FULL_FIRESTORE_WRITE_READBACK_PASS__31_IDENTITY_HOLD_PROVEN__WAITING_SEPARATE_PROTECTED_DEV_REDEPLOY_AUTHORIZATION__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- Backend DEV `cxorbia-backend-dev`; Cloud Run DEV `cxorbia-live-hr-dev`; Hosting DEV site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-VISUAL-FAIL-SHOPPER-IDENTITY-PROFILE-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-PROFILE-AUTH-HISTORY-READONLY-PASS-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-PERFIL-COMPLETO-AUTORIZADO-V2-20260731.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-PERFIL-COMPLETO-V2-READONLY-PASS-20260731.md`;
9. `evidence/CORTE6-PROFILE-FULL-HANDOFF-READONLY-LATEST.json`;
10. `evidence/CORTE6-PROFILE-FULL-IDENTITY-BRIDGE-V3-READONLY-LATEST.json`;
11. `evidence/CORTE6-PROFILE-FULL-FIRESTORE-WRITE-LATEST.json`;
12. `backend/config/corte6-profile-full-firestore-write-plan-v2.json`;
13. `backend/config/corte6-profile-full-firestore-write-request-v2.json`;
14. `backend/config/corte6-profile-full-firestore-write-execute-v2.json`;
15. `tools/release/cxorbia-corte6-profile-full-firestore-write-v2.mjs`;
16. `.github/workflows/cxorbia-corte6-profile-full-firestore-write-v2.yml`;
17. `app/core/backend-config-preview-dev.js`;
18. `app/core/backend-protected-dev-mode.js`;
19. `app/adapters/tya-live-source-refresh-watch.js`;
20. `app/core/backend-browser-auth.js`;
21. `app/core/backend-firebase.js`;
22. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR#7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 4. Perfil completo Firestore — WRITE/READBACK PASS
AuthorizationId `chat-20260731-c6-profile-full-firestore-write-01` consumida.

Resultado:120 Firestore doc writes exactos;118 con cambios reales +2 marker-only;329 valores escritos; readback120 docs/329 campos; mismatches0. Auth/password reset0; deploys0; producción=false.

Los31 sin vínculo canónico exacto permanecen HOLD probado y no fueron creados ni emparejados por nombre/teléfono/email.

## 5. P0 visual Corte6
El write de perfil está cerrado, pero Corte6 sigue abierto hasta redeploy protegido DEV + validación humana Admin/Shopper. La autorización Firestore ya fue consumida y no cubre redeploy.

## 6. Fuente/precedencia
Export vigente manda para perfil actual; Firebase Auth sigue siendo autoridad de login;616 visitas y77 certificaciones canónicas mandan para histórico/certificación.

## 7. Gate vivo
`AUTORIZACIÓN SEPARADA REDEPLOY DEV PROTEGIDO → HUMAN VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6 → AGOSTO`.

## 8. Estado seguro
PR#7 draft/open/no merge; producción no tocada. Firestore gate consumido PASS; Auth/HR/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run/Storage/Make/Gemini/pagos0.
