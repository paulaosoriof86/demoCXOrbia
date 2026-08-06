# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `DETERMINISTIC_SUFFIX_SOURCE_STATIC_PASS__PROVIDER_READONLY_HOLD_12_SURNAMES__1_MULTI_AUTH_TIE__65_GROUPS__142_IDENTITIES__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado anterior: `3`;
- Hosting DEV de este bloque: `0`;
- ejecuciones provider de este bloque: `1`;
- segundo intento provider: `0`.

## 2. Contrato canónico vigente

```text
Usuario Shopper normal: nombre.apellido
Excepción solo ante colisión activa demostrada: nombre.apellido.<sufijo>
Sufijo: sha256(tenantId + NUL + shopperId), 4/6/8, no PII
Contraseña: Nombre123*
Namespace: shopper
Membership requerido: no
Autoridad: Firebase Auth + claims exactos + shopperId canónico
```

La excepción fue aprobada y evaluada read-only. No fue materializada.

## 3. Source creado

- `backend/contracts/c6-shopper-deterministic-suffix-v1.json`;
- `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
- `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml`;
- `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`;
- `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-READONLY-HOLD-LATEST.json`.

No se tocaron módulos, diseño, Login, `CX.data` ni lógica operacional.

## 4. Source/static — PASS

```text
PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
PASS_NODE_SYNTAX
PASS_DETERMINISTIC_SUFFIX_4
PASS_SUFFIX_EXPANSION_6_8
PASS_MULTI_SOURCE_SURNAME_CONSENSUS
PASS_NO_PII_SUFFIX_CONTRACT
PASS_ONE_PRIMARY_OPERATION_SCHEMA
```

## 5. Provider read-only — HOLD contractual

```text
workflowRunId=31064458045
workflowJobId=92499147712
artifactId=8953330337
artifactDigest=sha256:dc98e359ec09ee04cf0b9ba49acb4062a789707fe4e34cfadbf977dce10e2c39
HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY
```

Checkout, autorización, sintaxis, source/static, credencial DEV, lectura provider y artifact terminaron correctamente. El job se marcó `failure` únicamente porque el gate contractual encontró residuos y aplicó STOP_RETRY.

## 6. Fuente revisada

```text
profiles=340
authUsers=110
memberships=1
credentials=109
credentialsMapped=88
credentialsUnmapped=21
hrImportDocs=1
visits=616
certifications=77
liquidations=827
latestPeriod=2026-07
recentFloor=2026-05
```

## 7. Completado de apellido

```text
baseline previo activo incompleto=83
completados por consenso multi-fuente=71
restantes activos incompletos=12
```

La nueva lectura no aceptó inferencia por una sola posición visual. Los 12 casos carecen de corroboración técnica suficiente o mantienen conflicto.

## 8. Desambiguación determinística

```text
collisionGroups=65
activeIdentities=142
groupsWithUniqueUnsuffixedKeeper=52
groupsAllSuffixed=13
suffix4=90
suffix6=0
suffix8=0
suffixAllocationHolds=0
targetCollisionHolds=0
```

El baseline provisional 64/141 queda reemplazado por 65/142. El completado source-safe reveló una colisión activa adicional; no la creó el sufijo.

## 9. Perfil multi-Auth

```text
profilesWithMultipleCandidates=1
resolved=0
unresolved=1
```

Se aplicaron claims exactos, shopperId, emails técnicos, credencial legacy, compatibilidad de contraseña, enabled, emailVerified y metadata de creación. Persistió el empate; no se eligió candidato.

## 10. Plan no superpuesto, no ejecutable

| Operación primaria | Total |
|---|---:|
| CREATE_AUTH | 81 |
| UPDATE_AUTH | 46 |
| NO_OP | 73 |
| HOLD | 13 |
| PRESERVE_NO_AUTH | 127 |
| **Total** | **340** |

```text
email subchanges=39
password subchanges=14
claims subchanges=38
planDigest=831c9602aa5686aea22694970aa1beb9557f4bb7b966d4233e028e63fb456d01
```

Los 13 HOLD son 12 apellidos pendientes más un empate multi-Auth. No se autoriza ejecución parcial.

## 11. STOP_RETRY y estado seguro

```text
REQUEST_CONSUMED=true
AUTOMATIC_RETRY=false
PROVIDER_SECOND_ATTEMPT=false
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
RAW_NAMES/LOGINS/EMAILS/PASSWORDS/UIDS_EXPORTED=false
MERGE=false
PRODUCTION=false
```

La evidencia de delta de runtime del runner quedó limpia: tracked `0`, untracked `0`.

## 12. Phase A preservada

Se preservaron frontend canónico, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 13. Siguiente bloque exacto

```text
SOURCE-ONLY ROOT FIX
→ diseñar evidencia técnica adicional para 12 apellidos activos
→ diseñar discriminadores técnicos para el empate multi-Auth
→ probar estáticamente unicidad y plan de 340 filas
→ STOP sin provider reads
→ pedir nueva autorización read-only solo con source/static PASS
```

No existe autorización residual para provider retry, Auth repair, contraseña, deploy, merge o producción.
