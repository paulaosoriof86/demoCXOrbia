# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `SHOPPER_IDENTITY_RESOLUTION_SOURCE_STATIC_PASS__READONLY_REVIEW_COMPLETE__RESOLVER_OVERHOLD_PROVEN__STOP_RETRY__NO_AUTH_WRITES__NO_DEPLOY__NO_PRODUCTION`

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

Paula Staff y Paula Shopper son principals técnicos distintos. No se permite deduplicar por nombre visual.

## 3. Source preparado y gateado

Se agregaron:

- `tools/qa/cxorbia-c6-shopper-identity-resolution-review.mjs`;
- modo `source_safe_resolution_review` en `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
- pins activos exactos en el manifiesto acumulativo.

Source/static:

```text
workflowRunId=31055889684
workflowJobId=92473179280
artifactId=8950210279
artifactDigest=sha256:7d78d480b15b836ab98ded284a2bfca2b0ebe2517531c36825bc77159de915dd
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 4. Revisión source-safe ejecutada

```text
workflowRunId=31056005286
workflowJobId=92473531087
artifactId=8950260575
artifactDigest=sha256:28bcefd758c53efa4357d0d4766488662c3b0701ce2ccfce551816c92d7edb88
HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW
```

Cobertura:

```text
Perfiles=340
Credenciales legacy=109
Visitas=616
HR imports=1
Periodo más reciente=2026-07
```

## 5. Baseline reconciliado parcialmente

La revisión confirmó:

```text
Credenciales mapeadas=101
Credenciales sin mapear=8
Missing Auth total=21
  mapped missing Auth=13
  unmapped credentials=8
```

El `21` queda reconciliado exactamente como `13 + 8`.

Los conteos de excepción vigentes fueron:

```text
Login exceptions=16
  mapped mismatches=8
  unmapped=8
Password exceptions=18
  mapped mismatches=10
  unmapped=8
```

Los conteos históricos `30/28` provenían de una población donde 21 credenciales todavía estaban sin mapear. Trece de ellas ahora quedaron enlazadas por claves técnicas; por eso `30/28` y `16/18` no deben forzarse como totales inmutables. La reconciliación correcta es por pertenencia de conjuntos, no por igualdad de agregados.

## 6. Plan no superpuesto producido

Se generó una fila primaria por cada uno de los 340 perfiles:

| Operación primaria | Total |
|---|---:|
| CREATE_AUTH | 22 |
| UPDATE_AUTH | 8 |
| NO_OP | 73 |
| HOLD | 110 |
| PRESERVE_NO_AUTH | 127 |
| **Total** | **340** |

Subcambios dentro de `UPDATE_AUTH`:

```text
email=1
password=8
claims=1
```

Plan digest:

```text
901b43183721cb49218224d096b49612675d1c92f1bca9936da61c7eb09ac8c4
```

## 7. Causa raíz del HOLD actual

```text
CODE=RESOLVER_CANONICAL_NAME_BASIS_TOO_RESTRICTIVE
```

La identidad sí se enlazó mediante `shopperId`, legacy, HR y relaciones técnicas. Sin embargo, después del enlace, el resolver solo aceptó apellido explícito o apellido proveniente de una credencial ya enlazada. No utilizó los campos de nombre completo o login técnico del perfil exacto ya identificado.

Consecuencia:

```text
FALSE_CANONICAL_NAME_INCOMPLETE_HOLDS=109
UNRESOLVED_AUTH_COLLISION=1
UNRESOLVED_PROFILES=110
```

Este es un defecto del harness de resolución, no prueba de que 109 Shoppers carezcan realmente de apellido.

## 8. Paula

La revisión volvió a encontrar:

```text
Staff candidates=1
Shopper candidates=2
Paula resolution=UNRESOLVED
```

El siguiente resolver debe emitir para ambas candidatas Shopper una matriz técnica source-safe con estado, actividad, visitas, HR links, credencial exacta y Auth, sin nombres ni PII. No se seleccionará por coincidencia visual.

## 9. Rollback dry-run

```text
CREATE_AUTH: eliminar solo UID creado por el plan exacto y antes de writes dependientes.
UPDATE_AUTH: restaurar email, disabled y claims desde snapshot previo.
PASSWORD: la clave anterior no es recuperable; compensación = deshabilitar y reset controlado al contrato canónico.
MEMBERSHIP: no aplica; writes=0.
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
RAW_NAMES_EXPORTED=false
RAW_LOGINS_EXPORTED=false
RAW_PASSWORDS_EXPORTED=false
UIDS_EXPORTED=false
MERGE=false
PRODUCTION=false
```

## 11. Phase A preservada

Se preservaron frontend canónico, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 12. Siguiente bloque exacto

```text
CORREGIR SOURCE-ONLY EL RESOLVER PARA:
- usar nombre completo o login técnico del perfil exacto únicamente después de shopperId binding;
- emitir resumen técnico source-safe de las 2 candidatas Shopper de Paula;
- reconciliar baseline por conjuntos y no exigir 30/28 inmutables;
- recalcular colisiones reales de nombre.apellido;
- mantener una fila primaria por perfil;
→ REPINAR RESOLVER Y DISPATCHER
→ SOURCE/STATIC
→ UNA NUEVA REVISIÓN READ-ONLY
→ STOP ANTES DE AUTH/PASSWORD WRITE O DEPLOY
```

No existe autorización residual para retry, repair, deploy, merge o producción.
