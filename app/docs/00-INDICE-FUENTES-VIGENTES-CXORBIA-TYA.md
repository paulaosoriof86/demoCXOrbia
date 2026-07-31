# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_OPEN__EXPORT_RECOVERED__PROFILE_HANDOFF_READY__USERNAME88_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

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
10. `evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`;
11. `evidence/CORTE6-USERNAME-DELTA-READONLY-LATEST.json`;
12. `evidence/CORTE6-INITIAL-PASSWORD-PATTERN-READONLY-LATEST.json`;
13. `backend/config/corte6-username-firestore-write-plan.json`;
14. `backend/config/corte6-profile-extra-readonly-request.json`;
15. `tools/qa/cxorbia-corte6-profile-extra-export-readonly.mjs`;
16. `tools/local/cxorbia-corte6-profile-extra-handoff.html`;
17. `tools/qa/cxorbia-corte6-profile-extra-handoff-dryrun.mjs`;
18. `.github/workflows/cxorbia-corte6-profile-extra-readonly.yml`;
19. `app/core/backend-config-preview-dev.js`;
20. `app/core/backend-protected-dev-mode.js`;
21. `app/adapters/tya-live-source-refresh-watch.js`;
22. `app/core/backend-browser-auth.js`;
23. `app/core/backend-firebase.js`;
24. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 4. P0 visual
Corte6 sigue abierto porque la visual anterior usó `display_name_only` y el acceso Shopper terminó con `shopperId=null`.

No usar `sh1`, selector anónimo ni match por nombre como solución final.

## 5. Provider protected read-only — PASS
Firestore:
- shoppers340;
- phone123;
- email39;
- username0;
- documento0;
- banco/pago0.

Auth:
- users108;
- shopper claim con shopperId91;
- perfil existente91/91;
- missing0.

Histórico:
- visitas616;
- 616/616 con shopperId;
- 194 perfiles referenciados y existentes194/194;
- estados: submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

## 6. Fix protegido preparado
Sin deploy:
- protected lane ya no es sobreescrito por `forceHumanVisualSourceSafe()`;
- watcher source-safe se desactiva cuando protected runtime posee CX.data;
- aliases de perfil usan solo valores reales;
- KPI/histórico protegidos reconocen todo el ciclo canónico, incluyendo `submitida`;
- password nunca se sintetiza.

Gate estático previo: PASS. No deploy nuevo autorizado.

## 7. Username y password
Username desde handoff cifrado:
- records shopper109;
- match exacto88;
- Auth claim binding88/88;
- delta username `fill-missing-only`88;
- conflictos0;
- 21 sin perfil exacto HOLD.

Password pattern read-only:
- exactos evaluables88;
- patrón `CapitalizedFirstName + 123*` verificado68;
- no coincide con patrón20.

`Nombre123*` no es universal. No persistir password en Firestore/JS/repo. Reset requiere gate Auth.

## 8. Export perfil extra — recuperado
File Library volvió a responder y se recuperó el export vigente ya entregado `tya-plataforma-default-rtdb-export (6).json`, fecha 2026-07-30. No pedirlo de nuevo.

Schema confirmado: username/user, teléfono/WhatsApp, email, país, ciudad, departamento y, según registro, DPI, dirección, fecha de nacimiento, certs/histCerts, términos y metadata de cuenta.

Nunca conectar RTDB legacy.

## 9. Reconciliación y seguridad
Reconciliador v2:
- ID técnico estable exacto → `legacyShopperId`;
- no nombre/teléfono/email como llave;
- fill-missing-only;
- no overwrite;
- pass/password y UID legacy excluidos.

Operativos candidatos: username, phone, email, country, city, department.

Sensibles HOLD: DPI/documento, dirección, fecha de nacimiento. Las Rules actuales permiten leer `/shoppers/{id}` a roles operador, por lo que esos campos no pueden agregarse ahí sin storage/RBAC protegido real.

Evidence-only: certs/histCerts, visitas, estado, términos, aprobación/origen y rating. Las 77 certificaciones y 616 visitas canónicas siguen siendo autoridad.

## 10. Handoff cifrado listo
File Library permite inspeccionar el export pero no entrega bytes/filesystem path al runner. Para superar esa frontera sin PII cruda:
- tool OFFLINE cifra el perfil y excluye password/UID;
- runner DEV descifra solo en memoria;
- workflow solo lee provider y persiste evidencia source-safe;
- request espera únicamente el bundle cifrado.

Todavía no se ejecutó este nuevo provider read porque el bundle no existe.

## 11. Gate vivo
`BUNDLE CIFRADO DEL EXPORT EXISTENTE → READ-ONLY RECONCILIATION AUTOMÁTICA → DELTA OPERATIVO COMBINADO CON USERNAME88 → AUTORIZACIÓN FIRESTORE EXACTA → READBACK → REDEPLOY DEV AUTORIZADO → HUMAN VISUAL PROTEGIDA → FREEZE C6`.

## 12. Julio/agosto
HR live/auto-month permanece PASS. No iniciar delta agosto hasta cerrar P0 y congelar Corte6.

## 13. Estado seguro
Producción no tocada; PR#7 draft/open/no merge. Provider writes0; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0.
