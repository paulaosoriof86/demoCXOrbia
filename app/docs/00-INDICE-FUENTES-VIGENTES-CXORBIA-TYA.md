# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_AUTOENTRY_VISUAL_OBSERVED_PASS__PROTECTED_IDENTITY_READONLY_PASS__AUGUST_REFRESH_READONLY_NEXT__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar sin gate específico de producción.
- No crear nuevo Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTOTYPE-AUTOENTRY-20260730.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-IDENTITY-READONLY-PASS-20260730.md`;
7. `evidence/CORTE6-PROTECTED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
8. `evidence/CORTE6-CREDENTIAL-CONTINUITY-HOSTING-DEPLOY-LATEST.json`;
9. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
10. `evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`;
11. `app/app.js`;
12. `app/core/backend-config-preview-dev.js`;
13. `app/core/backend-browser-auth.js`;
14. `app/core/backend-firebase.js`;
15. `app/core/backend-cxdata-readonly-corte4.js`;
16. `app/core/backend-preview-status.js`;
17. `app/data/tya-hr-source-safe-periods.js`;
18. `RESUMEN-PARA-CLAUDE.md`;
19. `PENDIENTES-PROTOTIPO.md`;
20. tracker Phase A;
21. Academia Corte6;
22. PR #7 y HEAD vivo.

## 3. Baseline protegida — no reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado:616 visitas +572 controles liquidación +77 certificaciones + foundation/perfiles.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas,currentPeriodId=`2026-07`,source=firestore,fallback=false PASS.
- Corte6 Auth import/readback91/91 PASS; no repetir/resetear.
- claims5/5 + Rules PASS.

## 4. Visual Corte6 y significado de `Shopper protegido`
Los dos P0 de acceso están corregidos y la captura humana actual demuestra que el auto-entry del prototipo funciona. El preview humano sigue rotulado `Source-safe (preview)` y por diseño usa un snapshot público/read-only con PII enmascarada; por eso allí aparece `Shopper protegido`.

No convertir ese placeholder en identidad final ni insertar nombres reales en el JS público. La identidad real pertenece a Firestore protegido detrás de Auth/RBAC/Rules.

## 5. Gate protegido de identidad — PASS
`PASS_C6_PROTECTED_IDENTITY_READONLY_RUNTIME_READY`.

Read-only directo en `cxorbia-backend-dev`:
- shoppers protegidos340; con nombre real340; placeholder0; sin nombre0;
- visitas canónicas616; con nombre real616; placeholder0; sin nombre/shopperId0;
- shopperIds canónicos distintos referenciados194;
- perfiles referenciados existentes194/194;
- perfiles referenciados con nombre real194/194; placeholder/missing0;
- Rules shopper protegidas y deny-by-default PASS;
- adapter protegido carga shoppers y nombre real PASS;
- source-safe público permanece enmascarado PASS;
- Rules desplegadas verificadas/hash consistente PASS.

GitHub status: `PASS_C6_PROTECTED_IDENTITY_READONLY`.

## 6. Regla de release desde este punto
- Preview público/source-safe: puede y debe permanecer enmascarado.
- Preproducción/producción autenticada: Admin/Operativo debe leer Firestore protegido y ver identidad real; shopper solo su propio perfil; no puede renderizar `Shopper protegido` cuando existe perfil canónico real.
- La próxima validación de identidad real se hace en runtime protegido, no publicando PII en el preview source-safe.

## 7. Siguiente bloque exacto
`REFRESH HR READ-ONLY → RESOLVER/CLASIFICAR AGOSTO HN → VALIDAR AGOSTO → PREPARAR WRITE PLAN DELTA-ONLY`.

Solo después, y con autorización explícita para Firestore data writes:
`MATERIALIZAR SOLO DELTA AGOSTO → READBACK/SMOKE → PREPROD PROTEGIDA CON IDENTIDAD REAL → CUTOVER tya-plataforma`.

## 8. Estado seguro
Producción no tocada. PR #7 draft/open/no merge. Histórico/Auth91/Rules/CX.data preservados. Gate de identidad: provider reads únicamente; Auth/Firestore data/Rules/Hosting/Storage/HR/legacy/payments/Functions/Make/Gemini writes0; PII exportada0.