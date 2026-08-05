# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `SHOPPER_IDENTITY_SOURCE_STATIC_PASS__340_PROFILE_CENSUS_COMPLETE__12_COLLISIONS__46_ACTIVE_HOLD__STOP_RETRY__NO_AUTH_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-CANONICAL-CENSUS-HOLD-LATEST.json`;
3. `backend/config/corte6-human-login-shopper-identity-audit.json`;
4. `.github/cxorbia-gate-requests/request.json`;
5. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
6. `tools/qa/cxorbia-c6-shopper-identity-canonical-plan.mjs`;
7. `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
8. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
9. `CAMBIOS-BACKEND-ADDENDUM-C6-SHOPPER-CANONICAL-CENSUS-HOLD-20260805.md`;
10. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-SHOPPER-CANONICAL-CENSUS-HOLD-20260805.md`;
11. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-SHOPPER-CANONICAL-CENSUS-HOLD-20260805.md`;
12. `ACADEMIA-IMPACTO-C6-SHOPPER-CANONICAL-CENSUS-HOLD-20260805.md`;
13. `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-SHOPPER-CANONICAL-CENSUS-HOLD-20260805.md`;
14. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-CANONICALIZATION-SOURCE-STATIC-HOLD-LATEST.json` — evidencia histórica del pin anterior;
15. `app/docs/evidence/CORTE6-HUMAN-LOGIN-SHOPPER-IDENTITY-AUDIT-LATEST.json` — baseline histórico anterior;
16. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
17. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
18. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
19. `AGENTS.md`;
20. PR #7 y HEAD vivo.

Ante conflicto, prevalecen este índice, el checkpoint vigente, la evidencia observable del censo y el lock de ejecución directa.

## 2. Contrato vigente

```text
Tenant: TyA
Shopper visible login: nombre.apellido
Shopper password: Nombre123*
Namespace: shopper
Membership required: false
Authority: Firebase Auth + exact claims + exact shopperId profile
Paula Staff/Shopper: separate technical principals
```

Las excepciones existentes son deuda de materialización, no formatos alternativos aceptados.

## 3. Source/static verificado

El pin del auditor se reconcilió exclusivamente:

```text
previous=8fe4b0c5050d9fe9ba6c3120ef81a75b00bb8535
current=80622606ce3635f0d53997a41932b6ced5dc25d4
commit=f224b3e4d5fa05323bfc3d619b257db8a0faaf06
```

```text
run=31054156634
job=92467888669
artifact=8949587605
digest=sha256:6d206129b723988c7d7d0cb8f628e907b30be3dcc18b113782e293a808fd7ed4
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 4. Censo vigente

```text
run=31054262787
job=92468210043
artifact=8949634992
digest=sha256:efdfc1b20007aabe54baac9d87212c54a6b1f376913be3e4279d9350c591f172
HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS
```

```text
TOTAL=340
ACTIVE_ELIGIBLE=105
HISTORICAL=189
ACTIVE_HOLD=46
COLLISIONS=12
AUTH_IDENTITY_COLLISIONS=1
CANONICAL_LOGIN_COLLISIONS=11
CANONICAL_NAME_INCOMPLETE=23
LOGIN_COLLISION_HOLD_PROFILES=23
```

Paula tiene 1 candidata Staff y 2 candidatas Shopper; la separación técnica Shopper todavía no está resuelta.

## 5. Estado seguro

```text
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE/Rules/Storage/HR_WRITES=0
HOSTING_DEPLOYS=0
CLOUD_RUN=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 6. Carril operativo vigente

```text
REVISIÓN SOURCE-SAFE FOCAL DE:
12 COLISIONES
+ 23 NOMBRES INCOMPLETOS
+ 23 PERFILES CON LOGIN COLISIONADO
+ 2 CANDIDATAS SHOPPER DE PAULA
+ DRIFT 21/30/28 vs 0/9/7
→ PLAN IDÉMPOTENTE NO SUPERPUESTO
→ STOP ANTES DE AUTH/PASSWORD WRITE
```

## 7. Prohibiciones vigentes

- crear o modificar Auth;
- cambiar o restablecer contraseñas;
- escribir memberships;
- deduplicar por nombre;
- desplegar Hosting DEV;
- crear nueva rama, PR o candidata;
- Firestore/Rules/Storage/HR writes;
- Cloud Run, Make, Gemini o pagos;
- merge o producción.
