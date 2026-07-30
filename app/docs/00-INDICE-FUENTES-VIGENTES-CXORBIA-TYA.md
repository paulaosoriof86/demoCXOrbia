# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REDEPLOY1_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- Sandbox C4: no destino.
- No crear nuevo Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`;
6. `CORTE6-CREDENTIAL-HANDOFF-SEGURO-PREPARADO-20260730.md`;
7. `evidence/CORTE6-CREDENTIAL-INVENTORY-SOURCE-SAFE-V3.json`;
8. `evidence/CORTE6-CREDENTIAL-HANDOFF-DRYRUN-LATEST.json`;
9. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
10. `evidence/CORTE6-CREDENTIAL-CONTINUITY-HOSTING-DEPLOY-LATEST.json`;
11. `backend/config/corte6-credential-import-request.json`;
12. `backend/config/corte6-credential-continuity-hosting-request.json`;
13. `tools/release/cxorbia-corte6-credential-import.mjs`;
14. `tools/release/cxorbia-corte6-credential-continuity-hosting-prepare.mjs`;
15. `app/core/backend-browser-auth.js`;
16. `CAMBIOS-BACKEND.md`;
17. `RESUMEN-PARA-CLAUDE.md`;
18. `PENDIENTES-PROTOTIPO.md`;
19. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
20. `ACADEMIA-IMPACTO-CORTE6-AUTH-RBAC-20260730.md`;
21. PR #7 y HEAD vivo.

## 3. Baseline protegida — no reabrir
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado: 616 visitas,572 controles de liquidación,77 certificaciones y perfiles previstos.
- Corte 5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore, fallback=false PASS.
- Corte 6 previo: claims5/5 + Rules PASS + Hosting DEV previo1/1 consumido.
- No repetir materialización ni reabrir snapshots superados.

## 4. Fuente real vigente
- HR materializada hasta julio 2026:14 periodos/616 visitas/208 refs shopper.
- 208/208 refs listas →194 perfiles canónicos únicos.
- 77 certificaciones materializadas.
- 572 controles de liquidación.
- Agosto HN continúa HOLD por inconsistencia país/tab.

## 5. Continuidad de credenciales — causa raíz cerrada
- TyA conserva `Tipo de acceso + Usuario + Contraseña`.
- namespaces `staff` / `shopper`.
- Firebase usa identidad interna determinística no visible.
- no password/token/UID persistido en UI.
- no identidad inferida por nombre.

Inventario source-safe:
- shopper source282;
- credential groups109;
- exact duplicates collapsed93;
- ambiguous groups18/77 HOLD;
- bundle cifrado113;
- PII/login/password/hash legibles repo0.

## 6. Auth import exacto — PASS ejecutado
`PASS_EXACT_AUTH_IMPORT_READBACK`.
- imported91;
- readback91/91;
- shopper88 + super1 + coordinador2;
- Auth users17→108;
- password resets0;
- deletes0;
- overwrite0;
- Firestore/Rules/Hosting writes durante import0.

El plan previo de12 está superseded y no debe ejecutarse.

## 7. Hosting DEV continuidad — PASS ejecutado
Ejecutado únicamente después del readback91/91.

`PASS_EXISTING_HOSTING_DEV_CREDENTIAL_CONTINUITY_REMOTE_VERIFIED`.
- mismo site `cxorbia-backend-dev`, target `cxorbia-dev`;
- redeploy adicional1;
- browserAuth PASS;
- entrypoint PASS;
- proof PASS;
- username/password namespaced PASS;
- preservedLegacyAuthUsers91;
- nuevo Firebase/Hosting0;
- Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

## 8. Evidencia exacta
- Auth authorization commit `38d0203e52d790b76b9bba667a23d447c6b063fe`.
- Auth evidence commit `bd3a479dd455459f0daa4757c8380b0e60aa0693`.
- Hosting authorization commit `67eb74a55e34e5c4b829716f0b8594af12778df0`.
- Hosting evidence commit `c3a2c8476e7a91734201600a68e7577b53902f9a`.
- Hosting version `sites/cxorbia-backend-dev/versions/b1bad07277f7e961`.
- Hosting release `sites/cxorbia-backend-dev/releases/1785442623153000`.

## 9. Gate vivo único
`VALIDACIÓN VISUAL CON CREDENCIALES TYA EXISTENTES → APROBADO → FREEZE CORTE6`.

Después:
`REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER tya-plataforma`.

No pedir passwords por chat ni credenciales técnicas DEV.

## 10. Claude / Academia
- Claude: no nueva candidata; no tocar `app/modules/*`; provider/email técnico no visible; solo corregir P0 visual reproducible.
- Academia: Auth detrás de adapter, namespaces, usuario ≠ email, recuperación, scopes, shopperId, dedupe estable, import/readback y troubleshooting.

## 11. Estado seguro
R17N histórico:1,406 Firestore data writes cerrados. Corte6 previo: claim writes5 + Rules release1 + Hosting DEV1/1. Continuidad: Auth imports91/readback91; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional1; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false; credenciales/PII crudas repo/artifacts0.
