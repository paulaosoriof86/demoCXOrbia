# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `SHOPPER_IDENTITY_SOURCE_STATIC_PASS__340_PROFILE_CENSUS_COMPLETE__12_COLLISIONS__46_ACTIVE_HOLD__STOP_RETRY__NO_AUTH_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado anterior: `3`;
- Hosting DEV de este bloque: `0`.

## 2. Contrato canónico Shopper TyA

```text
Usuario visible: nombre.apellido
Contraseña: Nombre123*
Namespace: shopper
Membership requerido: no
Autoridad: Firebase Auth + claims exactos + shopperId canónico
```

Paula Staff y Paula Shopper deben permanecer como principals técnicos distintos. No se permite deduplicar por nombre.

## 3. Reconciliación del pin — COMPLETADA

Se modificó exclusivamente el pin activo de:

```text
tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs
```

```text
anterior=8fe4b0c5050d9fe9ba6c3120ef81a75b00bb8535
vigente=80622606ce3635f0d53997a41932b6ced5dc25d4
commit=f224b3e4d5fa05323bfc3d619b257db8a0faaf06
```

No se modificó ningún otro pin, runtime, módulo, diseño ni `CX.data`.

## 4. Source/static — PASS

```text
workflowRunId=31054156634
workflowJobId=92467888669
artifactId=8949587605
artifactDigest=sha256:6d206129b723988c7d7d0cb8f628e907b30be3dcc18b113782e293a808fd7ed4
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 5. Censo read-only de 340 perfiles — COMPLETO CON HOLD

```text
workflowRunId=31054262787
workflowJobId=92468210043
artifactId=8949634992
artifactDigest=sha256:efdfc1b20007aabe54baac9d87212c54a6b1f376913be3e4279d9350c591f172
HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS
```

Clasificación completa:

| Categoría | Total |
|---|---:|
| ACTIVE_ELIGIBLE | 105 |
| HISTORICAL | 189 |
| ACTIVE_HOLD | 46 |
| **Total** | **340** |

## 6. Bloqueos comprobados

```text
COLLISIONS_TOTAL=12
AUTH_IDENTITY_COLLISIONS=1
CANONICAL_LOGIN_COLLISIONS=11
CANONICAL_NAME_INCOMPLETE=23
LOGIN_COLLISION_HOLD_PROFILES=23
```

Identidad Paula:

```text
STAFF_CANDIDATES=1
SHOPPER_CANDIDATES=2
STAFF_AUTH_PRESENT=1
SHOPPER_AUTH_PRESENT=0
SEPARATED=false
```

No corresponde crear o modificar Auth hasta resolver las dos candidatas Shopper por claves técnicas.

## 7. Drift de baseline

Baseline anterior:

```text
missingAuth=21
loginExceptions=30
passwordExceptions=28
```

Lectura del censo vigente sobre los 109 registros legacy mapeados:

```text
missingAuth=0
loginExceptions=9
passwordExceptions=7
```

Este drift no se interpreta como reparación: no hubo writes. Debe reconciliarse la diferencia entre población legacy, mapeo actual y usuarios Auth existentes.

## 8. Acciones calculadas, no autorizadas

```text
createAuth=25
updateEmail=1
updatePassword=8
updateClaims=80
noOp=0
```

Estas categorías se superponen; todavía no conforman una partición idempotente de una acción por identidad.

## 9. STOP_RETRY y estado seguro

El censo se detuvo ante colisiones y holds, conforme a la autorización.

```text
PROVIDER_READS=true
PROVIDER_WRITES=false
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE_WRITES=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
HOSTING_DEPLOYS_THIS_BLOCK=0
CLOUD_RUN_DEPLOYS=0
MAKE_CALLS=0
GEMINI_CALLS=0
PAYMENT_WRITES=0
CREDENTIALS_EXPOSED=false
RAW_NAMES_EXPORTED=false
RAW_LOGINS_EXPORTED=false
RAW_PASSWORDS_EXPORTED=false
MERGE=false
PRODUCTION=false
```

## 10. Phase A preservada

Se preservaron frontend canónico, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 11. Siguiente bloque exacto

```text
REVISIÓN SOURCE-SAFE FOCAL DE:
- 12 colisiones;
- 23 nombres canónicos incompletos;
- 23 perfiles retenidos por login colisionado;
- 2 candidatas Shopper de Paula;
- drift 21/30/28 vs 0/9/7;
→ PRODUCIR PLAN IDÉMPOTENTE NO SUPERPUESTO
→ DETENERSE ANTES DE CUALQUIER AUTH/PASSWORD WRITE O DEPLOY
```

No existe autorización residual para repair, retry, deploy, merge o producción.
