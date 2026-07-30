# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_PROTOTYPE_AUTOENTRY_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- No crear nuevo Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTOTYPE-AUTOENTRY-20260730.md`;
6. `evidence/CORTE6-CREDENTIAL-CONTINUITY-HOSTING-DEPLOY-LATEST.json`;
7. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
8. `app/app.js`;
9. `app/core/backend-config-preview-dev.js`;
10. `app/core/backend-browser-auth.js`;
11. `app/core/backend-cxdata-readonly-corte4.js`;
12. `app/core/backend-preview-status.js`;
13. `app/data/tya-hr-source-safe-periods.js`;
14. `RESUMEN-PARA-CLAUDE.md`;
15. `PENDIENTES-PROTOTIPO.md`;
16. tracker Phase A;
17. Academia Corte6;
18. PR #7 y HEAD vivo.

## 3. Baseline protegida — no reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado:616 visitas +572 controles liquidación +77 certificaciones + foundation/perfiles.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas,currentPeriodId=`2026-07`,source=firestore,fallback=false PASS.
- Corte6 Auth import/readback91/91 PASS; no repetir/resetear.
- claims5/5 + Rules PASS.

## 4. P0 visual y corrección vigente
Se rechazaron dos builds: gate separado `Acceso seguro` y luego formulario `Usuario + Contraseña` inyectado al seleccionar perfil.

Contrato correcto del preview humano: perfil → entrada automática. El fix conserva HR source-safe read-only y mantiene Auth/RBAC/Rules como gates provider separados.

## 5. Evidencia técnica actual
Gate estático `29b7f9404a9c2f144145fe24d5cf048f753c1e75` PASS.

La primera ejecución autorizada falló antes de deploy por mismatch interno de decisión preflight/direct-deploy. Corregido en `b9f5190babcc339735cda59291417df5aea6988f`; el request seguía deploy0/consumed=false.

Reintento bajo la misma autorización:
`PASS_EXISTING_HOSTING_DEV_PROTOTYPE_AUTO_ENTRY_SOURCE_SAFE_REMOTE_VERIFIED`.

- versión `sites/cxorbia-backend-dev/versions/95a1e49e5064c456`;
- release `sites/cxorbia-backend-dev/releases/1785452689852000`;
- prototypeAutoEntry=true;
- humanCredentialPrompt=false;
- sourceSafeVisual=true;
- proyecto `cinepolis`;
- periodos14;
- visitas616;
- Hosting deploy executions1;
- preservedLegacyAuthUsers91;
- Auth/Firestore/Rules/Storage/HR/legacy/payments/Functions/Make/Gemini writes adicionales0;
- nuevo Firebase/Hosting0;
- merge=false; producción=false.

## 6. Gate vivo único
`VALIDACIÓN VISUAL HUMANA DEL NUEVO BUILD DEV → SI APRUEBA: FREEZE CORTE6`.

Después:
`REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER tya-plataforma`.

## 7. Estado seguro
Producción no tocada. PR #7 draft/open/no merge. Histórico/Auth91/Rules/CX.data preservados.
