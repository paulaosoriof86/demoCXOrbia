# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `SHOPPER_COLLISION_CLASSIFIER_SOURCE_STATIC_PASS__READONLY_HOLD_64_DISTINCT_ACTIVE_GROUPS__83_ACTIVE_SURNAMES_UNVERIFIED__1_MULTI_AUTH__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-LATEST.json`;
3. `backend/config/corte6-human-login-shopper-identity-audit.json`;
4. `.github/cxorbia-gate-requests/request.json`;
5. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
6. `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
7. `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
8. `tools/qa/cxorbia-c6-shopper-identity-resolution-review.mjs`;
9. `tools/qa/cxorbia-c6-shopper-identity-canonical-plan.mjs`;
10. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
11. `CAMBIOS-BACKEND-ADDENDUM-C6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-20260805.md`;
12. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-20260805.md`;
13. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-20260805.md`;
14. `ACADEMIA-IMPACTO-C6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-20260805.md`;
15. `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-20260805.md`;
16. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
17. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-FOCAL-RESOLUTION-HOLD-LATEST.json` — evidencia anterior;
18. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
20. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
21. `AGENTS.md`;
22. PR #7 y HEAD vivo.

Ante conflicto, prevalecen este índice, el checkpoint vigente, la evidencia observable más reciente y el lock de ejecución directa.

## 2. Contrato vigente

```text
Tenant: TyA
Shopper visible login: nombre.apellido
Shopper password: Nombre123*
Namespace: shopper
Membership required: false
Authority: Firebase Auth + exact claims + exact shopperId profile
```

No existe una regla de desambiguación aplicada. Las alternativas están documentadas, pero requieren decisión expresa del tenant.

## 3. Source/static vigente

```text
run=31061161498
job=92489240097
artifact=8952153534
digest=sha256:ec793ef97bc8c4fd57df6e5b412aa108324dec65a1aa0af3f0622f78d9cf2a64
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 4. Clasificación vigente

```text
run=31061262965
job=92489532791
artifact=8952193087
digest=sha256:4eaf9354e4ed15996237af74fcea05c5b99bc2ec97f1be063dc8d8e52f1dc95f
HOLD_C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION
```

```text
GROUPS=109
PROFILES_IN_GROUPS=238
RESOLVED_SINGLE_ACTIVE_GROUPS=39
DISTINCT_ACTIVE_COLLISION_GROUPS=64
DISTINCT_ACTIVE_IDENTITIES=141
UNRESOLVED_SURNAME_GROUPS=6
ACTIVE_TECHNICAL_SURNAME_INCOMPLETE=83
HISTORICAL_TECHNICAL_SURNAME_INCOMPLETE=125
UNRESOLVED_MULTI_AUTH_PROFILES=1
```

## 5. Plan vigente, no ejecutable

```text
CREATE_AUTH=5
UPDATE_AUTH=3
NO_OP=45
HOLD=162
PRESERVE_NO_AUTH=125
TOTAL=340
planDigest=bb82bbf6f7b2a1335668287dc631fa8de73ba39197f07f4e85e014ee9f41af57
```

## 6. Estado seguro

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

## 7. Carril operativo vigente

```text
DECISIÓN DEL TENANT PARA 64 GRUPOS DE PERSONAS ACTIVAS DISTINTAS
→ elegir entre segundo apellido verificado, sufijo técnico determinístico o alias excepcional administrado
→ completar 83 apellidos técnicos activos
→ resolver 1 perfil multi-Auth
→ regenerar plan de 340 filas
→ source/static + read-only
→ STOP antes de writes o deploy
```

## 8. Prohibiciones vigentes

- crear o modificar Auth;
- cambiar o restablecer contraseñas;
- escribir memberships;
- fusionar por nombre visual;
- aplicar sufijos o alias sin decisión expresa;
- desplegar Hosting DEV;
- crear nueva rama, PR o candidata;
- Firestore/Rules/Storage/HR writes;
- Cloud Run, Make, Gemini o pagos;
- merge o producción.
