# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `SHOPPER_FOCAL_RESOLVER_SOURCE_STATIC_PASS__READONLY_REVIEW_HOLD_109_VISIBLE_LOGIN_GROUPS__PAULA_RESOLVED__STOP_RETRY__NO_AUTH_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-FOCAL-RESOLUTION-HOLD-LATEST.json`;
3. `backend/config/corte6-human-login-shopper-identity-audit.json`;
4. `.github/cxorbia-gate-requests/request.json`;
5. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
6. `tools/qa/cxorbia-c6-shopper-identity-resolution-review.mjs`;
7. `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
8. `tools/qa/cxorbia-c6-shopper-identity-canonical-plan.mjs`;
9. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
10. `CAMBIOS-BACKEND-ADDENDUM-C6-SHOPPER-FOCAL-RESOLUTION-HOLD-20260805.md`;
11. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-SHOPPER-FOCAL-RESOLUTION-HOLD-20260805.md`;
12. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-SHOPPER-FOCAL-RESOLUTION-HOLD-20260805.md`;
13. `ACADEMIA-IMPACTO-C6-SHOPPER-FOCAL-RESOLUTION-HOLD-20260805.md`;
14. `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-SHOPPER-FOCAL-RESOLUTION-HOLD-20260805.md`;
15. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
16. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-SOURCE-SAFE-RESOLUTION-HOLD-LATEST.json` — revisión anterior;
17. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-CANONICAL-CENSUS-HOLD-LATEST.json` — censo anterior;
18. `app/docs/evidence/CORTE6-HUMAN-LOGIN-SHOPPER-IDENTITY-AUDIT-LATEST.json` — baseline histórico;
19. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
20. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
21. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
22. `AGENTS.md`;
23. PR #7 y HEAD vivo.

Ante conflicto, prevalecen este índice, el checkpoint vigente, la evidencia focal observable y el lock de ejecución directa.

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

## 3. Source/static vigente

```text
run=31059576130
job=92484349960
artifact=8951552902
digest=sha256:5ae40b1a338d9594ffc3368477673677f2462ddd14e0e2b2d313dbf0b6e5311a
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 4. Revisión focal vigente

```text
run=31059688423
job=92484697881
artifact=8951593943
digest=sha256:fcaba14c38c2fcc1014563ac0edadc33bd40370511189dd01d511f5ff6176326
HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW
```

```text
PROFILES=340
AUTH_USERS=110
CREDENTIALS=109
MAPPED=101
UNMAPPED=8
MISSING_AUTH=21
LOGIN_EXCEPTIONS_CURRENT=16
PASSWORD_EXCEPTIONS_CURRENT=18
PAULA_SHOPPER=RESOLVED_ACTIVE_VS_HISTORICAL
CANONICAL_LOGIN_GROUPS=109
PROFILES_IN_GROUPS=238
MULTIPLE_AUTH_PROFILE=1
INCOMPLETE_NAMES=3
UNRESOLVED_PROFILES=241
```

## 5. Diagnóstico vigente

```text
VISIBLE_LOGIN_CONTRACT_COLLISION_POPULATION_REQUIRES_TECHNICAL_GROUP_RESOLUTION
```

La corrección focal ya eliminó el falso hold de nombres incompletos. La derivación exacta reveló 109 grupos distintos con el mismo `nombre.apellido`. Ninguno presentó un ancla técnica compartida suficiente para fusión automática. Deben separarse alias históricos y personas activas distintas antes de cualquier write.

## 6. Plan vigente, no ejecutable

```text
CREATE_AUTH=6
UPDATE_AUTH=2
NO_OP=10
HOLD=241
PRESERVE_NO_AUTH=81
TOTAL=340
planDigest=ec16fb653bb8bf57a499b1ddc26ed8e64bd32ddb3d3debfac9eef6f2882efc40
```

## 7. Estado seguro

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

## 8. Carril operativo vigente

```text
CLASIFICAR SOURCE-SAFE 109 GRUPOS NOMBRE.APELLIDO
+ 1 PERFIL MULTI-AUTH
+ 3 NOMBRES INCOMPLETOS
→ usar shopperId, legacy, HR, visitas, credencial y Auth
→ resolver activo vs histórico
→ identificar personas activas distintas con el mismo login
→ detenerse para regla mínima de desambiguación si existen
→ cero write y cero deploy
```

## 9. Prohibiciones vigentes

- reintentar automáticamente el request consumido;
- crear o modificar Auth;
- cambiar o restablecer contraseñas;
- escribir memberships;
- fusionar por nombre visual;
- inventar sufijos o cambiar el contrato visible sin decisión expresa;
- desplegar Hosting DEV;
- crear nueva rama, PR o candidata;
- Firestore/Rules/Storage/HR writes;
- Cloud Run, Make, Gemini o pagos;
- merge o producción.
