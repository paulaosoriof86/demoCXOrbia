# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `SHOPPER_FOCAL_RESOLVER_SOURCE_STATIC_PASS__READONLY_REVIEW_HOLD_109_VISIBLE_LOGIN_GROUPS__PAULA_RESOLVED__STOP_RETRY__NO_AUTH_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado anterior: `3`;
- Hosting DEV de este bloque: `0`.

## 2. Contrato canónico vigente

```text
Usuario Shopper TyA: nombre.apellido
Contraseña: Nombre123*
Namespace: shopper
Membership requerido: no
Autoridad: Firebase Auth + claims exactos + shopperId canónico
```

Paula Staff y Paula Shopper son principals técnicos distintos. No deduplicar por nombre visual.

## 3. Corrección focal source-only

Se corrigieron:

- `tools/qa/cxorbia-c6-shopper-identity-resolution-review.mjs`;
- `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`.

El resolver ahora usa apellido explícito, login técnico o nombre completo solo después del enlace exacto por `shopperId` o claves técnicas. También genera comparación source-safe de Paula y reconcilia baselines por conjuntos de fingerprints.

Pins vigentes:

```text
resolver=6ca283662a84bdf4b99eb19cfd8325d33a26dd7b
dispatcher=5cfbdcc5d3eea719eded3b31e06823a500c6109a
```

## 4. Source/static — PASS

```text
workflowRunId=31059576130
workflowJobId=92484349960
artifactId=8951552902
artifactDigest=sha256:5ae40b1a338d9594ffc3368477673677f2462ddd14e0e2b2d313dbf0b6e5311a
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 5. Única revisión focal read-only — HOLD

```text
workflowRunId=31059688423
workflowJobId=92484697881
artifactId=8951593943
artifactDigest=sha256:fcaba14c38c2fcc1014563ac0edadc33bd40370511189dd01d511f5ff6176326
HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW
```

Cobertura:

```text
profiles=340
authUsers=110
credentials=109
visits=616
hrImportDocs=1
```

## 6. Baseline reconciliado por conjuntos

```text
Historical reference: missingAuth=21, loginExceptions=30, passwordExceptions=28
Current: mapped=101, unmapped=8
Current missingAuth=21
Current loginExceptions=16
Current passwordExceptions=18
Credential partition complete=true
Fingerprint sets complete=true
```

Los totales históricos se preservan como referencia. La lectura vigente se prueba mediante pertenencia de fingerprints, no mediante igualdad rígida con `30/28`.

## 7. Paula Shopper — RESUELTA TÉCNICAMENTE

```text
staffCandidates=1
shopperCandidates=2
resolution=RESOLVED_ACTIVE_PROFILE_VS_HISTORICAL_BY_TECHNICAL_ACTIVITY
```

Candidata canónica:

```text
statusActive=true
credentialCount=1
authCount=0
canonicalNameComplete=true
score=220
```

Perfil preservado como histórico:

```text
statusActive=false
historicalVisits=6
credentialCount=0
authCount=0
canonicalNameComplete=true
score=30
```

No se creó Auth Shopper ni se modificó Staff.

## 8. HOLD real posterior a la corrección

La corrección eliminó el falso bloqueo anterior de 109 nombres incompletos. Al derivar los logins de los perfiles exactos se reveló:

```text
CANONICAL_LOGIN_COLLISION_GROUPS=109
PROFILES_IN_COLLISION_GROUPS=238
MULTIPLE_AUTH_CANDIDATE_PROFILES=1
CANONICAL_NAME_INCOMPLETE_PROFILES=3
UNRESOLVED_PROFILES=241
REMAINING_COLLISION_COUNT=110
```

Distribución:

```text
94 grupos de 2
11 grupos de 3
3 grupos de 4
1 grupo de 5
```

El resolver no encontró un ancla técnica compartida suficiente para fusionar automáticamente esos grupos. Deben clasificarse como alias históricos o personas activas distintas antes de cualquier Auth write.

## 9. Plan no superpuesto, no ejecutable

| Operación primaria | Total |
|---|---:|
| CREATE_AUTH | 6 |
| UPDATE_AUTH | 2 |
| NO_OP | 10 |
| HOLD | 241 |
| PRESERVE_NO_AUTH | 81 |
| **Total** | **340** |

```text
email subchanges=2
password subchanges=1
claims subchanges=1
planDigest=ec16fb653bb8bf57a499b1ddc26ed8e64bd32ddb3d3debfac9eef6f2882efc40
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

No existe autorización residual para retry, repair o deploy.

## 11. Phase A preservada

Se preservaron frontend canónico, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 12. Siguiente bloque exacto

```text
CLASIFICAR SOURCE-SAFE LOS 109 GRUPOS DE NOMBRE.APELLIDO
+ RESOLVER 1 PERFIL CON DOS AUTH
+ COMPLETAR 3 NOMBRES TÉCNICOS
→ USAR SHOPPERID, LEGACY, HR, VISITAS, CREDENCIAL Y AUTH
→ RESOLVER PRIMERO ACTIVO VS HISTÓRICO
→ IDENTIFICAR PERSONAS ACTIVAS DISTINTAS QUE COMPARTEN LOGIN
→ DETENERSE PARA LA REGLA MÍNIMA DE DESAMBIGUACIÓN SI EXISTEN
→ CERO WRITE Y CERO DEPLOY
```
