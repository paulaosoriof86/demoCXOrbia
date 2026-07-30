# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_SINGLE_LOGIN_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- No crear nuevo Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CORTE6-SINGLE-LOGIN-HOSTING-DEV-REMOTE-PASS-20260730.md`;
6. `CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`;
7. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
8. `evidence/CORTE6-CREDENTIAL-CONTINUITY-HOSTING-DEPLOY-LATEST.json`;
9. `app/core/backend-browser-auth.js`;
10. `app/core/backend-config-preview-dev.js`;
11. `app/core/backend-firebase.js`;
12. `CAMBIOS-BACKEND.md`;
13. `RESUMEN-PARA-CLAUDE.md`;
14. `PENDIENTES-PROTOTIPO.md`;
15. `ACADEMIA-IMPACTO-CORTE6-SINGLE-LOGIN-REMOTE-PASS-20260730.md`;
16. tracker Phase A;
17. PR #7 y HEAD vivo.

## 3. Baseline protegida — no reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado:616 visitas +572 controles liquidación +77 certificaciones + foundation/perfiles.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore/fallback=false PASS.
- Corte6 Auth import91/readback91/91 PASS; no repetir.

## 4. Fuente real vigente
- HR materializada hasta julio 2026:14 periodos/616 visitas.
- 77 certificaciones materializadas.
- 572 controles de liquidación.
- Agosto HN continúa HOLD por inconsistencia país/tab.

## 5. Corte6 single-login — remoto PASS
La corrección del doble login fue aplicada focalizadamente y publicada mediante un único redeploy autorizado al Hosting DEV existente.

`PASS_EXISTING_HOSTING_DEV_SINGLE_LOGIN_REMOTE_VERIFIED`

- versión `sites/cxorbia-backend-dev/versions/a4b90bd224b28329`;
- release `sites/cxorbia-backend-dev/releases/1785448336285000`;
- browserAuth/entrypoint/proof PASS;
- username/password namespaced PASS;
- `singleVisibleLogin=true`;
- `parallelAuthGate=false`;
- preservedLegacyAuthUsers91;
- Auth/Firestore/Rules/Storage/HR/legacy/payments/Functions/Make/Gemini writes adicionales0;
- nuevo Firebase/Hosting0;
- merge=false; producción=false.

## 6. Gate vivo único
`VALIDACIÓN VISUAL HUMANA DEL NUEVO BUILD DEV → SI APRUEBA: FREEZE CORTE6`.

Después:
`REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER tya-plataforma`.

## 7. Claude / Academia
- Claude: no nueva candidata ni cambios `app/modules/*` por este P0; fix ya aplicado y publicado.
- Academia: acceso único, provider interno, sesión/refresh/logout, recuperación, scopes, namespace y troubleshooting.

## 8. Estado seguro
Producción no tocada. PR #7 draft/open/no merge. Histórico/Auth91/Rules/CX.data preservados.
