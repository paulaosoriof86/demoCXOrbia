# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `SHOPPER_COLLISION_CLASSIFIER_SOURCE_STATIC_PASS__READONLY_HOLD_64_DISTINCT_ACTIVE_GROUPS__83_ACTIVE_SURNAMES_UNVERIFIED__1_MULTI_AUTH__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado anterior: `3`;
- Hosting DEV de este bloque: `0`.

## 2. Contrato canónico preservado

```text
Usuario Shopper TyA: nombre.apellido
Contraseña: Nombre123*
Namespace: shopper
Membership requerido: no
Autoridad: Firebase Auth + claims exactos + shopperId canónico
```

No se modificó el contrato ni se aplicó una regla de desambiguación.

## 3. Source preparado y pin exacto

- clasificador: `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
- blob: `ef95c59442728be6a326b8240c3f74ae9a3551af`;
- dispatcher: `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
- blob: `9633a1db7fa071cf21350f27e7bb7d0cf00b1591`.

No se tocaron módulos, diseño, Login, `CX.data` ni lógica de negocio.

## 4. Source/static — PASS

```text
workflowRunId=31061161498
workflowJobId=92489240097
artifactId=8952153534
artifactDigest=sha256:ec793ef97bc8c4fd57df6e5b412aa108324dec65a1aa0af3f0622f78d9cf2a64
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 5. Clasificación provider read-only — HOLD

```text
workflowRunId=31061262965
workflowJobId=92489532791
artifactId=8952193087
artifactDigest=sha256:4eaf9354e4ed15996237af74fcea05c5b99bc2ec97f1be063dc8d8e52f1dc95f
HOLD_C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION
```

Cobertura:

```text
profiles=340
authUsers=110
credentials=109
credentialsMapped=101
credentialsUnmapped=8
hrImportDocs=1
visits=616
certifications=77
liquidations=827
latestPeriod=2026-07
```

## 6. Clasificación de los 109 grupos

```text
CANDIDATE_GROUPS=109
CANDIDATE_PROFILES=238
39 grupos = un activo canónico + históricos preservados
64 grupos = identidades activas técnicamente distintas con el mismo nombre.apellido
141 identidades activas afectadas
6 grupos = apellido técnico no verificable o grupo candidato se divide
```

Distribución:

```text
94 grupos de 2
11 grupos de 3
3 grupos de 4
1 grupo de 5
```

## 7. Apellidos y Auth pendientes

```text
ACTIVE_PROFILES_WITHOUT_VERIFIED_TECHNICAL_SURNAME=83
HISTORICAL_PROFILES_WITHOUT_VERIFIED_TECHNICAL_SURNAME=125
MULTIPLE_AUTH_PROFILES=1
UNRESOLVED_MULTIPLE_AUTH_PROFILES=1
```

El perfil multi-Auth mantiene dos candidatos con igual puntuación técnica; no se eligió ninguno.

## 8. Alternativas mínimas identificadas, no aplicadas

Para los 64 grupos de personas activas distintas:

1. segundo apellido verificado;
2. sufijo técnico determinístico;
3. alias excepcional administrado por el tenant.

Cualquier opción requiere decisión expresa y una nueva validación. No cambia automáticamente el contrato vigente.

## 9. Plan no superpuesto, no ejecutable

| Operación primaria | Total |
|---|---:|
| CREATE_AUTH | 5 |
| UPDATE_AUTH | 3 |
| NO_OP | 45 |
| HOLD | 162 |
| PRESERVE_NO_AUTH | 125 |
| **Total** | **340** |

```text
email subchanges=1
password subchanges=3
claims subchanges=1
planDigest=bb82bbf6f7b2a1335668287dc631fa8de73ba39197f07f4e85e014ee9f41af57
```

## 10. STOP_RETRY y estado seguro

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
RAW_NAMES/LOGINS/PASSWORDS/UIDS_EXPORTED=false
MERGE=false
PRODUCTION=false
```

## 11. Phase A preservada

Se preservaron frontend canónico, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 12. Siguiente bloque exacto

```text
DECISIÓN DEL TENANT SOBRE LA REGLA MÍNIMA DE DESAMBIGUACIÓN PARA 64 GRUPOS
+ COMPLETAR SOURCE-SAFE 83 APELLIDOS TÉCNICOS ACTIVOS
+ RESOLVER 1 PERFIL MULTI-AUTH
→ REGENERAR PLAN DE 340 FILAS
→ GATE SOURCE/STATIC Y READ-ONLY
→ STOP ANTES DE AUTH/PASSWORD WRITE O DEPLOY
```

No existe autorización residual para retry, repair, deploy, merge o producción.
