# CAMBIOS BACKEND — C6 Shopper Identity Canonicalization Source/Static HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia + Exclusivo cliente TyA + Sin impacto visual Claude

## Alcance autorizado

Se inició el macrobloque C6 para fijar como contrato universal del tenant TyA:

- usuario visible `nombre.apellido`;
- contraseña `Nombre123*`;
- namespace `shopper`;
- acceso basado en Firebase Auth + claims + perfil exacto;
- cero memberships Shopper;
- principals Staff y Shopper de Paula separados técnicamente;
- censo read-only de los 340 perfiles antes de cualquier Auth write;
- un único repair Auth DEV y un único Hosting DEV solo después de gates PASS.

## Archivos creados

1. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`
   - contrato canónico universal de identidad Shopper TyA;
   - membership no requerido;
   - claims exactos y política de privacidad;
   - commit `4b81bd620cecb7227d3038972b510224fd280ed1`.

2. `tools/qa/cxorbia-c6-shopper-identity-canonical-plan.mjs`
   - planificador read-only para clasificar los 340 perfiles;
   - detecta actividad, histórico, elegibilidad, holds y colisiones;
   - calcula acciones Auth sin persistir PII;
   - commit `dd8f8c00858837e28a91ff4f248e82d665f648e5`.

## Archivo modificado

`tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`

- elimina membership de la condición de acceso Shopper;
- exige `nombre.apellido / Nombre123*` como contrato objetivo;
- reconoce Staff y Shopper de Paula como principals distintos;
- exige clasificación completa, conteos consistentes y cero colisiones antes del repair;
- blob nuevo `80622606ce3635f0d53997a41932b6ced5dc25d4`;
- commit `dd8f8c00858837e28a91ff4f248e82d665f648e5`.

## Gate source/static ejecutado

```text
run=31052425207
job=92462414462
artifact=8948908689
digest=sha256:fe1373b49c0aef22c03d8d476c1c2c6c9503d49607d7131d121d15bfbc8ab184
```

Resultado:

```text
HOLD_READONLY_POST_GATES
FAIL_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

Fallo exacto:

```text
V6_ADDITIONAL_CRITICAL_BLOB_MISMATCH
tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs
expected=8fe4b0c5050d9fe9ba6c3120ef81a75b00bb8535
actual=80622606ce3635f0d53997a41932b6ced5dc25d4
```

La causa es contractual: el manifiesto activo conserva el blob anterior del auditor. El source nuevo no fue rechazado por sintaxis ni por el laboratorio; quedó bloqueado por el pin desactualizado.

## STOP_RETRY aplicado

- request source/static consumido y deshabilitado;
- no se ejecutó el censo provider read-only;
- no se abrió la fase Auth;
- no hubo repair, cambio de contraseña ni creación de usuarios;
- no hubo deploy;
- no se intentó reconciliar ni repetir automáticamente el gate.

## Estado seguro

```text
PROVIDER_READS=0
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE_WRITES=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
HOSTING_DEPLOYS=0
CLOUD_RUN_DEPLOYS=0
MAKE_CALLS=0
GEMINI_CALLS=0
PAYMENT_WRITES=0
MERGE=false
PRODUCTION=false
```

## Siguiente bloque exacto

Reconciliar exclusivamente el blob pin activo del auditor canónico, ejecutar un nuevo source/static bajo autorización expresa y detenerse nuevamente antes de provider reads salvo PASS.
