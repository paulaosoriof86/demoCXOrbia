# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_PROTOTYPE_AUTOENTRY_FIX_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

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
5. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTOTYPE-AUTOENTRY-20260730.md`;
6. `CORTE6-SINGLE-LOGIN-HOSTING-DEV-REMOTE-PASS-20260730.md` como evidencia histórica del build luego rechazado;
7. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
8. `app/app.js`;
9. `app/core/backend-browser-auth.js`;
10. `app/core/backend-config-preview-dev.js`;
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

## 4. P0 humano vigente
La visual del build publicado demuestra una regresión adicional: después de elegir `Administración / Coordinación`, el backend agrega `Usuario + Contraseña`. Ese paso no forma parte del prototipo aprobado y el formulario queda parcialmente fuera del viewport.

El contrato canónico comprobado de `app.js` es selección de perfil → `selectRole(...)` → `enter()` automático. No pedir a Paula credenciales ni otra prueba del build actual.

## 5. Fix aplicado en rama — sin deploy
- human visual DEV: auto-entry del prototipo restaurado;
- `humanCredentialPrompt=false`;
- backend Auth no intercepta el selector humano;
- HR source-safe explícita/read-only como fuente visual;
- baseline source-safe: `cinepolis`,14 periodos,616 visitas;
- no fallback demo;
- diagnóstico: `HR source-safe · validación visual` y Auth `validado por gate separado`;
- Firebase Auth/RBAC/Rules permanece como gate técnico separado y preservado.

Gate estático: `29b7f9404a9c2f144145fe24d5cf048f753c1e75` → `success · PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE`.

## 6. Gate vivo único
La autorización de Hosting anterior está consumida. El Hosting DEV público aún sirve el build rechazado.

`AUTORIZACIÓN FRESCA DE UN ÚNICO REDEPLOY DEL MISMO HOSTING DEV → PRECHECK → DEPLOY1 → REMOTE SMOKE AUTO-ENTRY/SOURCE-SAFE → VALIDACIÓN VISUAL → FREEZE CORTE6`.

Después:
`REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER tya-plataforma`.

## 7. Estado seguro
Desde el segundo P0: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false. Auth91/histórico/Corte5 preservados.
