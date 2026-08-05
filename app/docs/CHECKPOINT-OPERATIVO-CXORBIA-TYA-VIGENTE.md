# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `DEV_ROOT_ENTRYPOINT_SOURCE_FIX_APPLIED__SOURCE_STATIC_PASS__HOSTING_PREDEPLOY_HOLD_WORKFLOW_HEREDOC__STOP_RETRY__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado: `2`;
- Hosting DEV de este bloque: `0`;
- deploys adicionales autorizados: `0`.

## 2. P0 comprobado

La validación humana abrió `https://cxorbia-backend-dev.web.app/`, que servía `app/index.html`, mientras los gates técnicos abrían `/index-backend-dev.html`.

```text
P0_PROVEN=true
CODE=DEV_ROOT_ENTRYPOINT_CANONICAL_RUNTIME_MISMATCH
GATE_URL_NE_HUMAN_VALIDATION_URL=true
```

El shell raíz carecía de Firebase/Auth y adapters protegidos, por lo que podía presentar el bloqueo genérico de fuente conectada. No fue un error de credenciales ni de operación de Paula.

## 3. Corrección source-only aplicada

`firebase.json` contiene ahora un redirect temporal exacto:

```text
/ → /index-backend-dev.html
HTTP 302
```

Se preservaron el rewrite de HR viva y el fallback explícito de demo. No se modificaron módulos, diseño, Login, Auth ni lógica de negocio.

Se agregaron gates permanentes para:

- paridad source del entrypoint raíz;
- paridad remota `/` contra `/index-backend-dev.html`;
- runtime acumulativo desde `/` para Staff, Shopper, Cliente, Finanzas y Reservas.

## 4. Source/static — PASS

```text
workflowRunId=31035432458
workflowJobId=92406210890
artifactId=8942354869
artifactDigest=sha256:d0b75352b58f2723a57bafaae8e9e77b2aef016a2a7c7d5ecc48a45c779d979f
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY
```

Fallos efectivos: `0`. El gate no modificó el repositorio.

## 5. Hosting DEV — STOP_RETRY antes del deploy

La ejecución autorizada se detuvo al interpretar el step del workflow:

```text
workflowRunId=31035653127
workflowJobId=92406957537
artifactId=8942474073
artifactDigest=sha256:bf3014ddc059b86ae2dde18d397b266b8e5c9f5db92bcf7a3fee13246f30060f
failedStage=predeploy_workflow_shell_parse
errorCode=BASH_HEREDOC_TERMINATOR_INDENTATION_INVALID
```

Los terminadores `NODE` estaban indentados dentro del subshell Bash y no fueron reconocidos. El script falló antes del gate source predeploy y antes de ejecutar Firebase.

```text
deployAttempted=false
deploySucceeded=false
hostingDeploysThisBlock=0
rootRuntimeGatesExecuted=false
remoteRootCorrected=false
```

Se aplicó `STOP_RETRY`: los requests quedaron consumidos, deshabilitados y con cero ejecuciones disponibles. No hubo reintento.

## 6. Estado preservado

Permanecen preservados:

- V7.2-P0F1 y composición Phase A acumulativa;
- root fix anterior del Login;
- HR e histórico;
- shoppers, postulaciones y certificaciones;
- liquidaciones/pagos;
- multi-tenant y multi-proyecto;
- Finanzas, Portal Cliente, Portal Shopper y Reservas;
- sincronización HR/plataforma y Academia.

El root DEV todavía no está corregido remotamente. La validación humana y el freeze no pueden continuar hasta desplegar y validar el redirect.

## 7. Estado seguro

```text
HOSTING_DEPLOYS_TOTAL=2
HOSTING_DEPLOYS_THIS_BLOCK=0
HOSTING_DEPLOY_ATTEMPTS_THIS_BLOCK=0
ADDITIONAL_DEPLOYS_AUTHORIZED=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_WRITES_THIS_BLOCK=0
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
MAKE_CALLS=0
GEMINI_CALLS=0
PAYMENTS_WRITES=0
CREDENTIALS_EXPOSED=false
TOKENS_EXPOSED=false
MERGE=false
PRODUCTION=false
```

## 8. Siguiente bloque exacto

Requiere autorización expresa nueva:

`CORREGIR EXCLUSIVAMENTE LA INDENTACIÓN DE LOS TERMINADORES HEREDOC DEL WORKFLOW → REPINAR SOLO EL BLOB DEL WORKFLOW → SOURCE/STATIC → SOLO CON PASS, UNA ÚNICA EJECUCIÓN HOSTING DEV → PARIDAD Y GATES ACUMULATIVOS DESDE / → VALIDACIÓN HUMANA`.
