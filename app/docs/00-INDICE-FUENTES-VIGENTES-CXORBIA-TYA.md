# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_SINGLE_LOGIN_FIX_APPLIED_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

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
5. `CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`;
6. `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`;
7. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
8. `app/core/backend-browser-auth.js`;
9. `app/core/backend-config-preview-dev.js`;
10. `app/core/backend-firebase.js`;
11. `CAMBIOS-BACKEND.md`;
12. `RESUMEN-PARA-CLAUDE.md`;
13. `PENDIENTES-PROTOTIPO.md`;
14. tracker Phase A;
15. Academia Corte6;
16. PR #7 y HEAD vivo.

## 3. Baseline protegida — no reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado:616 visitas +572 controles liquidación +77 certificaciones + foundation/perfiles.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore/fallback=false PASS.
- Corte6 Auth import:91/91 PASS; no repetir.

## 4. Fuente real vigente
- HR materializada hasta julio 2026:14 periodos/616 visitas.
- 77 certificaciones materializadas.
- 572 controles de liquidación.
- Agosto HN continúa HOLD por inconsistencia país/tab.

## 5. Credenciales/Auth preservado
- namespaces `staff` / `shopper`;
- identidad Firebase interna determinística no visible;
- no password/token/UID persistido en UI;
- no identidad inferida por nombre;
- imported91/readback91/91;
- shopper88 + super1 + coordinador2;
- Auth17→108;
- reset/delete/overwrite0;
- HOLD:21 shopper sin match exacto + demo1 + ambiguos18/77.

## 6. P0 doble login — estado actualizado
La visual humana rechazó correctamente el build Hosting DEV previo por mostrar `Acceso seguro` como segundo login.

La corrección ya está aplicada en la rama viva:
- eliminado el gate paralelo;
- login normal TyA/CXOrbia como único punto visible;
- credenciales reales integradas dentro de la misma tarjeta cuando se necesitan;
- sesión Firebase válida restaurada silenciosamente;
- logout real;
- config `product-login-session`;
- gates anti-regresión para impedir que reaparezcan `cxBackendAuthGate`, `cxBackendAuthNamespace`, `cxBackendAuthLogin` o `interactive-session`.

## 7. Evidencia del fix y gate
Commits:
- `e95e8a9662373183ec17186831cf81b89094515a` — auth bridge single-login.
- `32aee807d4c48760679267e1f8cd577d4681f4ea` — config.
- `f3aa90cc0f765beafdfa90e5b55d953239488746` — preflight.
- `e0b98140744135361f0d1d000ce31435b7ea59d2` — workflow/gates.
- `790d4d514b8e7b4630063ebf2aebba5997e3ec26` — revalidación estática solicitada sin provider writes.

Estado GitHub del gate: `success · PREPARED_C6_SINGLE_LOGIN_HOSTING_NO_EXECUTE`.

No hubo Hosting deploy ni provider writes en esta corrección. El Hosting DEV público continúa sirviendo el build anterior hasta nueva autorización.

## 8. Gate vivo único
`AUTORIZACIÓN ÚNICA DE REDEPLOY DEL MISMO HOSTING DEV → PRECHECK SINGLE-LOGIN → DEPLOY1 → SMOKE REMOTO → VALIDACIÓN VISUAL → FREEZE CORTE6`.

Después:
`REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER tya-plataforma`.

## 9. Claude / Academia
- Claude: no nueva candidata ni cambios de módulos por este P0; fix ya aplicado focalizadamente.
- Patrón reusable: un solo acceso visible; Firebase/Auth/claims detrás del producto.
- Academia: acceso único, recuperación, scopes, namespaces internos y troubleshooting sin doble autenticación.

## 10. Estado seguro
R17N histórico cerrado; Auth91/91 preservado; corrección P0: Auth writes0, Firestore data writes0, Rules0, Hosting deploy0, Storage/HR/legacy/payments/functions/Make/Gemini0, merge=false, producción=false.
