# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_PROFILE_FULL_READONLY_PASS__31_IDENTITY_HOLD_PROVEN__WRITE_GATE_READY__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

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
10. `evidence/CORTE6-PROFILE-FULL-IDENTITY-BRIDGE-READONLY-LATEST.json`;
11. `evidence/CORTE6-PROFILE-FULL-IDENTITY-BRIDGE-V3-READONLY-LATEST.json`;
12. `backend/config/corte6-profile-full-firestore-write-plan-v2.json`;
13. `backend/config/corte6-profile-full-firestore-write-request-v2.json`;
14. `tools/release/cxorbia-corte6-profile-full-firestore-write-v2.mjs`;
15. `.github/workflows/cxorbia-corte6-profile-full-firestore-write-v2.yml`;
16. `tools/qa/cxorbia-corte6-profile-full-identity-bridge-readonly-v2.mjs`;
17. `.github/workflows/cxorbia-corte6-profile-full-identity-bridge-readonly-v2.yml`;
18. `backend/config/corte6-profile-full-identity-bridge-readonly-v2-request.json`;
19. `tools/qa/cxorbia-corte6-profile-full-identity-bridge-readonly-v3.mjs`;
20. `.github/workflows/cxorbia-corte6-profile-full-identity-bridge-readonly-v3.yml`;
21. `backend/config/corte6-profile-full-identity-bridge-readonly-v3-request.json`;
22. `backend/config/corte6-profile-full-readonly-v2-request.json`;
23. `tools/local/cxorbia-corte6-profile-full-handoff-v2.html`;
24. `tools/qa/cxorbia-corte6-profile-full-handoff-dryrun-v2.mjs`;
25. `.github/workflows/cxorbia-corte6-profile-full-readonly-v2.yml`;
26. `app/core/backend-config-preview-dev.js`;
27. `app/core/backend-protected-dev-mode.js`;
28. `app/adapters/tya-live-source-refresh-watch.js`;
29. `app/core/backend-browser-auth.js`;
30. `app/core/backend-firebase.js`;
31. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 4. P0 visual
Corte6 sigue abierto porque la visual anterior usó `display_name_only` y el acceso Shopper terminó con `shopperId=null`. No usar `sh1`, selector anónimo ni match por nombre como solución final.

## 5. Perfil completo read-only — PASS
151 source records;120 exactos `legacyShopperId`;31 sin canonical;0 ambiguos/invalid;329 valores de perfil. De los120 exactos,118 tienen cambio de campos y2 solo marker de procedencia.

Campos planificados: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre/WhatsApp/email/país/ciudad ya coinciden.

## 6. 31 identity HOLD — probado, no supuesto
Dos gates adicionales read-only intentaron reducirlos antes de pedir write:
- Auth bridge determinístico + custom claim:0 resueltos;2 sin username,10 username duplicado,19 sin Auth user;
- V3 technical-key exacto/único (`docId/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId`) y luego Auth:0 resueltos;0 candidatos técnicos.

Por tanto los31 carecen de vínculo canónico reproducible hoy. No usar nombre/teléfono/email como llave ni crearlos silenciosamente.

## 7. Fuente/precedencia
Export vigente manda para perfil actual; password visible solo desde valor legacy real; Firebase Auth sigue siendo autoridad de login. Las616 visitas y77 certificaciones canónicas mandan para histórico/certificación.

## 8. Write gate completo — listo pero NO autorizado
Plan/request disabled + executor + workflow listos. El executor fue alineado con V3:118 field-change docs +2 marker-only =120 docs máximos;329 valores. Antes de mutation valida autorización, destino, SHA,151/120/31,118+2 y desglose. Readback total obligatorio.

Auth/password reset0; Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0; producción=false; merge=false.

## 9. Gate vivo
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE+READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → HUMAN VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6 → AGOSTO`.

## 10. Julio/agosto
HR live/auto-month PASS. No iniciar delta agosto hasta cerrar P0 y congelar Corte6.

## 11. Estado seguro
Read-only gates PASS; producción no tocada; PR#7 draft/open/no merge. Firestore/Auth/HR/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0.
