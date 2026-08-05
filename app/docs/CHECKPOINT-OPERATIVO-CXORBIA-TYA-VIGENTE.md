# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `SHOPPER_IDENTITY_CANONICAL_CONTRACT_SOURCE_PREPARED__SOURCE_STATIC_MANIFEST_PIN_HOLD__STOP_RETRY__NO_PROVIDER_READS__NO_AUTH_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado anterior: `3`;
- Hosting DEV de este bloque: `0`;
- deploy adicional ejecutado: `0`.

## 2. Contrato canónico Shopper TyA

Quedó fijado source-only como regla universal:

```text
Usuario visible: nombre.apellido
Contraseña: Nombre123*
Namespace: shopper
Membership requerido: no
```

El acceso se autoriza por Firebase Auth, claims exactos y `shopperId` canónico. Los principals Staff y Shopper de Paula son identidades técnicas separadas y válidas; no deben fusionarse ni tratarse como ambigüedad humana.

Contrato:

- `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
- commit `4b81bd620cecb7227d3038972b510224fd280ed1`.

## 3. Source preparado

Se creó:

- `tools/qa/cxorbia-c6-shopper-identity-canonical-plan.mjs`;
- clasificación prevista para los 340 perfiles;
- categorías activo elegible, activo hold, histórico, histórico preservado e inactivo;
- detección previa de colisiones;
- plan idempotente Auth DEV source-safe.

Se corrigió:

- `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
- membership eliminado de la condición de readiness;
- política universal `nombre.apellido / Nombre123*`;
- Paula Staff/Shopper separados por namespace;
- blob vigente `80622606ce3635f0d53997a41932b6ced5dc25d4`.

Commit source: `dd8f8c00858837e28a91ff4f248e82d665f648e5`.

## 4. Gate source/static — HOLD

```text
workflowRunId=31052425207
workflowJobId=92462414462
artifactId=8948908689
artifactDigest=sha256:fe1373b49c0aef22c03d8d476c1c2c6c9503d49607d7131d121d15bfbc8ab184
HOLD_READONLY_POST_GATES
FAIL_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

Fallo único:

```text
V6_ADDITIONAL_CRITICAL_BLOB_MISMATCH
path=tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs
expected=8fe4b0c5050d9fe9ba6c3120ef81a75b00bb8535
actual=80622606ce3635f0d53997a41932b6ced5dc25d4
```

Causa raíz: el manifiesto activo conserva el pin del auditor anterior. El laboratorio source-only pasó; el source no llegó al censo porque la composición contractual no estaba reconciliada.

## 5. STOP_RETRY aplicado

- request consumido y deshabilitado;
- no se corrigió el pin en el mismo bloque;
- no se reintentó el gate;
- censo provider read-only no ejecutado;
- Auth repair no iniciado;
- Hosting DEV no ejecutado.

## 6. Baseline heredado pendiente de validar con el nuevo censo

```text
Firestore Shopper profiles=340
credential Shopper records=109
existing Auth=88
missing Auth=21
login exceptions=30
password exceptions=28
```

Estos conteos siguen como baseline de entrada. No se reclasificó la población ni se realizó ninguna escritura.

## 7. Estado seguro

```text
PROVIDER_READS_THIS_BLOCK=0
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
PAYMENTS_WRITES=0
CREDENTIALS_EXPOSED=false
MERGE=false
PRODUCTION=false
```

## 8. Phase A preservada

Se preservaron frontend canónico, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 9. Siguiente bloque exacto

```text
RECONCILIAR EXCLUSIVAMENTE EL BLOB PIN ACTIVO DE
 tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs
→ EJECUTAR NUEVO SOURCE/STATIC EXPRESAMENTE AUTORIZADO
→ SOLO CON PASS HABILITAR EL CENSO READ-ONLY DE 340 PERFILES
→ DETENERSE NUEVAMENTE ANTES DE AUTH WRITES SI APARECE CUALQUIER HOLD O COLISIÓN
```

No hay autorización residual para retry, provider reads, Auth writes ni deploy.
