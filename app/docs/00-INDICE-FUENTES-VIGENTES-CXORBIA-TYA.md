# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_OPEN__FULL_PROFILE_SCOPE_AUTHORIZED__V2_HANDOFF_READY__WAITING_V2_ENCRYPTED_BUNDLE__NO_PROVIDER_WRITE__NO_DEPLOY__NO_PRODUCTION`

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
7. `CAMBIOS-BACKEND-ADDENDUM-C6-USERNAME-DELTA-READONLY-PASS-20260731.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-PASSWORD-PATTERN-READONLY-PASS-20260731.md`;
9. `CAMBIOS-BACKEND-ADDENDUM-C6-PROFILE-EXTRA-RECONCILIATION-PREPARED-20260731.md`;
10. `CAMBIOS-BACKEND-ADDENDUM-C6-PERFIL-COMPLETO-AUTORIZADO-V2-20260731.md`;
11. `ACADEMIA-IMPACTO-C6-PROFILE-EXTRA-EXPORT-HANDOFF-20260731.md`;
12. `evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`;
13. `evidence/CORTE6-USERNAME-DELTA-READONLY-LATEST.json`;
14. `evidence/CORTE6-INITIAL-PASSWORD-PATTERN-READONLY-LATEST.json`;
15. `backend/config/corte6-username-firestore-write-plan.json`;
16. `backend/config/corte6-profile-full-readonly-v2-request.json`;
17. `tools/local/cxorbia-corte6-profile-full-handoff-v2.html`;
18. `tools/qa/cxorbia-corte6-profile-full-handoff-dryrun-v2.mjs`;
19. `.github/workflows/cxorbia-corte6-profile-full-readonly-v2.yml`;
20. `app/core/backend-config-preview-dev.js`;
21. `app/core/backend-protected-dev-mode.js`;
22. `app/adapters/tya-live-source-refresh-watch.js`;
23. `app/core/backend-browser-auth.js`;
24. `app/core/backend-firebase.js`;
25. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 4. P0 visual
Corte6 sigue abierto porque la visual anterior usó `display_name_only` y el acceso Shopper terminó con `shopperId=null`.

No usar `sh1`, selector anónimo ni match por nombre como solución final.

## 5. Provider protected read-only — PASS
Firestore: shoppers340; phone123; email39; username0; documento0; banco/pago0.

Auth: users108; shopper claim con shopperId91; perfil existente91/91; missing0.

Histórico: visitas616; 616/616 con shopperId; 194 perfiles referenciados y existentes194/194; submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

## 6. Fix protegido preparado
Sin deploy:
- protected lane ya no es sobreescrito por `forceHumanVisualSourceSafe()`;
- watcher source-safe se desactiva cuando protected runtime posee CX.data;
- aliases de perfil usan datos reales;
- KPI/histórico reconocen el ciclo canónico, incluyendo `submitida`.

Gate estático previo: PASS. No deploy nuevo autorizado.

## 7. Username/Auth
Username desde handoff cifrado previo: records shopper109; match exacto88; Auth claim binding88/88; delta username88; conflictos0; 21 sin perfil exacto HOLD.

Auth91/91 permanece protegido y no se reabre.

## 8. Export perfil completo — alcance actualizado
File Library recuperó el export vigente ya entregado `tya-plataforma-default-rtdb-export (6).json`, fecha 2026-07-30. No pedirlo nuevamente.

Por decisión operativa vigente, el perfil autenticado de operación debe conservar la información completa disponible en esa plataforma, incluyendo datos personales, username y password legado visible. El endurecimiento de acceso se difiere y no bloquea este corte.

Nunca conectar RTDB legacy. La migración sigue siendo export/import.

## 9. Handoff V1 rechazado como fuente de write
El V1 recibido estaba cifrado pero reportó rawRows282, encryptedRecords151 y duplicateStableIds130; además excluía password. Por tanto no se usa para write: podría perder variantes y dejar el perfil incompleto.

## 10. Handoff/reconciliación V2
V2:
- agrupa por ID técnico estable y fusiona duplicados del mismo ID;
- prioriza llave RTDB exacta al ID y luego mayor completitud;
- conserva conflictos dentro del cifrado;
- incluye PII, username y password dentro del bundle cifrado;
- evidencia source-safe nunca contiene valores;
- runner descifra solo en memoria;
- match de identidad únicamente `legacyShopperId exact`;
- perfil export vigente = source-of-truth para campos de perfil;
- las 616 visitas y77 certificaciones canónicas permanecen autoridad y no son reemplazadas por contadores/arrays legacy.

## 11. Gate vivo
`GENERAR BUNDLE V2 COMPLETO DEL MISMO EXPORT → READ-ONLY V2 AUTOMÁTICO → WRITE PLAN EXACTO PERFIL COMPLETO + USERNAME → AUTORIZACIÓN FIRESTORE → READBACK → REDEPLOY DEV AUTORIZADO → HUMAN VISUAL PROTEGIDA → FREEZE C6`.

## 12. Julio/agosto
HR live/auto-month permanece PASS. No iniciar delta agosto hasta cerrar P0 y congelar Corte6.

## 13. Estado seguro
Producción no tocada; PR#7 draft/open/no merge. Provider writes0; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0.
