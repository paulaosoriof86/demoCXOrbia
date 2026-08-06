# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `DETERMINISTIC_SUFFIX_SOURCE_STATIC_PASS__PROVIDER_READONLY_HOLD_12_SURNAMES__1_MULTI_AUTH_TIE__65_GROUPS__142_IDENTITIES__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-READONLY-HOLD-LATEST.json`;
3. `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`;
4. `backend/contracts/c6-shopper-deterministic-suffix-v1.json`;
5. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
6. `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml`;
7. `SOURCE-LOCK-C6-DETERMINISTIC-SUFFIX-READONLY-20260805.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-DETERMINISTIC-SUFFIX-READONLY-HOLD-20260805.md`;
9. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-DETERMINISTIC-SUFFIX-READONLY-HOLD-20260805.md`;
10. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-DETERMINISTIC-SUFFIX-READONLY-HOLD-20260805.md`;
11. `ACADEMIA-IMPACTO-C6-DETERMINISTIC-SUFFIX-READONLY-HOLD-20260805.md`;
12. `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-DETERMINISTIC-SUFFIX-READONLY-HOLD-20260805.md`;
13. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
14. `app/docs/evidence/CORTE6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-LATEST.json` — evidencia anterior;
15. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
16. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
17. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
18. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
19. `AGENTS.md`;
20. PR #7 y HEAD vivo.

Ante conflicto, prevalecen este índice, el checkpoint vigente, la evidencia observable más reciente y el lock de ejecución directa.

## 2. Contrato vigente

```text
Tenant: TyA
Shopper visible login normal: nombre.apellido
Excepción demostrada: nombre.apellido.<sufijo técnico no PII>
Sufijo: sha256(tenantId + NUL + shopperId), 4/6/8
Shopper password: Nombre123*
Namespace: shopper
Membership required: false
Authority: Firebase Auth + exact claims + exact shopperId profile
```

La excepción determinística está aprobada como contrato y plan source-only. No fue materializada en Auth ni desplegada.

## 3. Source/static vigente

```text
PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
PASS_NODE_SYNTAX
PASS_DETERMINISTIC_SUFFIX_4
PASS_SUFFIX_EXPANSION_6_8
PASS_MULTI_SOURCE_SURNAME_CONSENSUS
PASS_NO_PII_SUFFIX_CONTRACT
PASS_ONE_PRIMARY_OPERATION_SCHEMA
```

## 4. Ejecución provider read-only vigente

```text
run=31064458045
job=92499147712
artifact=8953330337
digest=sha256:dc98e359ec09ee04cf0b9ba49acb4062a789707fe4e34cfadbf977dce10e2c39
HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY
```

```text
PROFILES=340
AUTH_USERS=110
PRIOR_ACTIVE_SURNAMES_INCOMPLETE=83
COMPLETED_BY_MULTI_SOURCE_CONSENSUS=71
REMAINING_ACTIVE_SURNAMES_INCOMPLETE=12
COLLISION_GROUPS=65
ACTIVE_IDENTITIES_IN_COLLISIONS=142
UNIQUE_UNSUFFIXED_KEEPER_GROUPS=52
ALL_SUFFIXED_GROUPS=13
SUFFIX_4=90
SUFFIX_6=0
SUFFIX_8=0
SUFFIX_COLLISIONS=0
TARGET_LOGIN_COLLISIONS=0
MULTI_AUTH_UNRESOLVED=1
```

El baseline 65/142 reemplaza el conteo provisional 64/141 porque completar apellidos reveló una colisión activa adicional.

## 5. Plan vigente, no ejecutable

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
TOTAL=340
planDigest=831c9602aa5686aea22694970aa1beb9557f4bb7b966d4233e028e63fb456d01
```

Los 13 HOLD corresponden a 12 apellidos activos pendientes y un empate multi-Auth.

## 6. Estado seguro

```text
PROVIDER_EXECUTIONS=1
PROVIDER_SECOND_ATTEMPT=0
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE/Rules/Storage/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 7. Carril operativo vigente

```text
SOURCE-ONLY ROOT FIX
→ diseñar evidencia técnica adicional para 12 apellidos activos
→ diseñar discriminadores técnicos para 1 empate multi-Auth
→ verificar estáticamente el plan completo de 340 filas
→ STOP sin provider reads
→ nueva autorización read-only solo después de source/static PASS
```

## 8. Prohibiciones vigentes

- ejecutar nuevamente provider con la autorización consumida;
- crear o modificar Auth;
- cambiar o restablecer contraseñas;
- escribir memberships;
- inferir apellido solo por posición visual;
- elegir un candidato Auth por orden o antigüedad sin discriminador suficiente;
- aplicar parcialmente las 327 filas sin HOLD;
- desplegar Hosting DEV o Cloud Run;
- crear nueva rama, PR o candidata;
- Firestore/Rules/Storage/HR writes;
- Make, Gemini, pagos, merge o producción.
