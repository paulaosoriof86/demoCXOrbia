# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_PLAN_PREPARED__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Cloud Run DEV: `cxorbia-live-hr-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar sin gate de producción.

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
10. `backend/config/corte6-profile-full-firestore-write-plan-v2.json`;
11. `backend/config/corte6-profile-full-firestore-write-request-v2.json`;
12. `backend/config/corte6-profile-full-readonly-v2-request.json`;
13. `tools/local/cxorbia-corte6-profile-full-handoff-v2.html`;
14. `tools/qa/cxorbia-corte6-profile-full-handoff-dryrun-v2.mjs`;
15. `.github/workflows/cxorbia-corte6-profile-full-readonly-v2.yml`;
16. `app/core/backend-config-preview-dev.js`;
17. `app/core/backend-protected-dev-mode.js`;
18. `app/adapters/tya-live-source-refresh-watch.js`;
19. `app/core/backend-browser-auth.js`;
20. `app/core/backend-firebase.js`;
21. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 4. P0 visual
Corte6 sigue abierto porque la visual anterior usó `display_name_only` y el acceso Shopper terminó con `shopperId=null`. No usar `sh1`, selector anónimo ni match por nombre como solución final.

## 5. Full profile V2 read-only — PASS
Gate final `PASS_C6_PROFILE_FULL_V2_READONLY`.

- registros151;
- exactos `legacyShopperId`120;
- missing canonical31 HOLD;
- ambiguos0; badRecord0;
- docs existentes con cambio120;
- campos planificados329;
- password fuente149;
- perfiles fuente con datos personales sensibles27.

Plan por campo en los120 exactos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre, WhatsApp/teléfono, email, país y ciudad ya coinciden y no requieren write.

## 6. Corrección de transporte V2
El primer intento read-only falló antes del provider por checksum. Solo `part-007.txt` no coincidía con el blob exacto esperado; fue restaurado y el retry terminó PASS. La request seguía no consumida. Provider writes0 en el FAIL.

## 7. Perfil, identidad e histórico
- perfil export vigente = source-of-truth para campos actuales de perfil;
- password visible únicamente desde valor legacy real;
- Firebase Auth continúa siendo autoridad de login;
- identidad automática solo `legacyShopperId exact`;
- los31 missing canonical quedan HOLD y no se deduplican por nombre/teléfono/email;
- las616 visitas y77 certificaciones canónicas permanecen autoridad; no sustituir con contadores/arrays legacy.

## 8. Write gate preparado — NO autorizado
`corte6-profile-full-firestore-write-plan-v2.json` + request disabled.

Alcance futuro máximo:
-120 Firestore document writes sobre perfiles existentes exactos;
-329 valores de perfil;
- Auth/password reset0;
- Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0;
- producción=false; merge=false.

## 9. Gate vivo
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE DESDE BUNDLE CIFRADO + READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → HUMAN VISUAL ADMIN+SHOPPER → RESOLVER31 HOLD → FREEZE C6 → AGOSTO`.

## 10. Julio/agosto
HR live/auto-month permanece PASS. No iniciar delta agosto hasta cerrar P0 y congelar Corte6.

## 11. Estado seguro
Read-only PASS; producción no tocada; PR#7 draft/open/no merge. Firestore/Auth/HR/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0.
