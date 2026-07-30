# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_PROVEN_DOUBLE_LOGIN_FORCED_AUTH_GATE__AUTH91_PRESERVED__NO_NEW_DEPLOY__NO_PRODUCTION`

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
5. `CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`;
6. `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`;
7. `CORTE6-CREDENTIAL-HANDOFF-SEGURO-PREPARADO-20260730.md`;
8. `evidence/CORTE6-CREDENTIAL-INVENTORY-SOURCE-SAFE-V3.json`;
9. `evidence/CORTE6-CREDENTIAL-HANDOFF-DRYRUN-LATEST.json`;
10. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
11. `evidence/CORTE6-CREDENTIAL-CONTINUITY-HOSTING-DEPLOY-LATEST.json`;
12. `app/core/backend-browser-auth.js`;
13. `app/core/backend-config-preview-dev.js`;
14. `app/core/backend-firebase.js`;
15. `app/app.js`;
16. `CAMBIOS-BACKEND.md`;
17. `RESUMEN-PARA-CLAUDE.md`;
18. `PENDIENTES-PROTOTIPO.md`;
19. tracker Phase A;
20. Academia Corte6;
21. PR #7 y HEAD vivo.

## 3. Baseline protegida — no reabrir
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado: 616 visitas,572 controles de liquidación,77 certificaciones y perfiles previstos.
- Corte 5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore, fallback=false PASS.
- Corte 6 Auth import:91/91 PASS; no repetir.
- No repetir materialización ni reabrir snapshots superados.

## 4. Fuente real vigente
- HR materializada hasta julio 2026:14 periodos/616 visitas/208 refs shopper.
- 208/208 refs listas →194 perfiles canónicos únicos.
- 77 certificaciones materializadas.
- 572 controles de liquidación.
- Agosto HN continúa HOLD por inconsistencia país/tab.

## 5. Credenciales/Auth — estado preservado
- namespaces `staff` / `shopper`;
- Firebase usa identidad interna determinística no visible;
- no password/token/UID persistido en UI;
- no identidad inferida por nombre.

Inventario source-safe:
- shopper source282;
- credential groups109;
- exact duplicates collapsed93;
- ambiguous groups18/77 HOLD;
- bundle cifrado113;
- PII/login/password/hash legibles repo0.

Auth import exacto `PASS_EXACT_AUTH_IMPORT_READBACK`:
- imported91;
- readback91/91;
- shopper88 + super1 + coordinador2;
- Auth users17→108;
- password resets0;
- deletes0;
- overwrite0.

## 6. Hosting DEV continuidad — PASS técnico preservado
`PASS_EXISTING_HOSTING_DEV_CREDENTIAL_CONTINUITY_REMOTE_VERIFIED`:
- mismo site `cxorbia-backend-dev`, target `cxorbia-dev`;
- redeploy adicional1 ya consumido;
- browserAuth/entrypoint/proof remoto PASS;
- preservedLegacyAuthUsers91;
- nuevo Firebase/Hosting0;
- Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

## 7. P0 actual — doble login
La validación visual humana de Paula **NO aprobó** el flujo.

Está demostrado que `app/core/backend-browser-auth.js` agrega una pantalla `Acceso seguro` separada, intercepta `CX.app.showLogin`, limpia `CX.session` al cargar y fuerza el overlay en preview. `backend-config-preview-dev.js` exige `interactive-session`, y `backend-firebase.js` llama a esa autenticación antes de cargar datos. El login normal del proyecto sigue existiendo en `app/app.js`.

Conclusión: el backend convirtió Auth en un segundo login visible. Esto contradice el diseño esperado de **Firebase detrás del adapter** y genera reproceso innecesario.

No pedir a Paula que repita la prueba actual ni que entregue password.

## 8. Gate vivo único
`P0 FOCAL SINGLE-LOGIN ROUTE → GATES → AUTORIZACIÓN ÚNICA DE REDEPLOY DEV SI PASS → SMOKE REMOTO → VALIDACIÓN VISUAL → FREEZE CORTE6`.

Después:
`REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER tya-plataforma`.

## 9. Claude / Academia
- Claude: no nueva candidata; no tocar módulos; únicamente corrección focalizada del P0 de login ya reproducible.
- Objetivo UX: un solo acceso visible; Firebase/Auth/claims detrás del producto.
- Academia: documentar acceso único, recuperación, scopes, namespaces internos y troubleshooting sin doble autenticación.

## 10. Estado seguro
R17N histórico cerrado; Auth91/91 preservado; desde el hallazgo P0 no se ejecutaron Auth writes, Firestore data writes, Rules, Hosting deploy, Storage/HR/legacy/payments/functions/Make/Gemini, merge ni producción.
