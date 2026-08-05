# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `LOGIN_ROOT_FIX_DEPLOYED__AUTH_MULTIROLE_PASS__CLIENT_ROUTE_PRODUCT_PASS__HARNESS_NAV_ASSUMPTION_PROVEN__NO_MORE_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado: `2`;
- deploys adicionales autorizados: `0`.

## 2. Estado preservado

- V7.2-P0F1 y composición Phase A acumulativa preservadas;
- root fix del Login aplicado en los dos bridges con `.lg2-card, .login-card`;
- dos blob pins reconciliados;
- source/static y contrato de Laboratorio: PASS;
- segundo Hosting DEV correctivo: release completa;
- paridad remota y HR viva: PASS;
- Staff, Shopper y Cliente Auth: PASS;
- Shopper con tres recargas, nueva pestaña y visita propia: PASS;
- Cliente con credencial existente, recarga y nueva pestaña: PASS.

## 3. Diagnóstico focal `client_route_wait`

Request consumido:

`c6-client-route-wait-focal-diagnostic-runtime-profile-20260805-04`

Ejecución:

```text
workflowRunId=31025221503
workflowJobId=92384251301
artifactId=8939818306
artifactDigest=sha256:5016033fe024f48f4f0b21dfae400a18dbc2a015a3bad70c49c2d5892a811ee4
PASS_READONLY_POST_GATES
PASS_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_CLASSIFIED
```

Observaciones separadas:

```text
sessionView=cli_dashboard
navElementExists=false
navActive=false
viewExists=true
pageHeaderExists=true
viewTextLength=690
renderException=null
```

## 4. Clasificación comprobada

```text
OWNER=HARNESS
CODE=HARNESS_NAV_ACTIVE_SUBCONDITION_MISMATCH
P0_PRODUCT_REGRESSION_PROVEN=false
```

El Portal Cliente aceptó `cli_dashboard`, conservó `session.view`, presentó el contenedor canónico `#view`, renderizó el encabezado `.ph` y produjo contenido no vacío. No hubo excepción de render.

El timeout anterior fue causado por una suposición inválida del gate: exigir que `#nav-cli_dashboard` exista y quede activo después de una navegación directa del router. La ausencia de ese nodo no impidió el render del Portal Cliente.

No corresponde tocar runtime, módulos, Login ni Hosting para este hallazgo.

## 5. Preflight de credencial Cliente

El selector canónico confirmó:

```text
PASS_C6_EXISTING_CLIENT_CREDENTIAL_SELECTION
canonicalDecision=PASS_C6_EXISTING_CANONICAL_CLIENT_CREDENTIAL_SELECTION
claimsValid=true
membershipValid=true
passwordSignIn=true
authWrites=0
passwordChanges=0
passwordResets=0
membershipWrites=0
```

Se preservó un alias de decisión compatible para el runner legado. No se cambió identidad, contraseña, claims ni membership.

## 6. Estado seguro

```text
HOSTING_DEPLOYS_TOTAL=2
HOSTING_DEPLOYS_THIS_BLOCK=0
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

## 7. Phase A preservada

Se preservan HR e histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

El P0 de Login permanece cerrado. `client_route_wait` deja de ser un bloqueo de producto y queda clasificado como deuda del harness.

## 8. Siguiente bloque exacto

Requiere autorización expresa nueva:

`CORREGIR SOLO EL PREDICADO DEL HARNESS REMOTO DE PORTAL CLIENTE → SUSTITUIR LA EXIGENCIA #nav-cli_dashboard.active POR session.view=cli_dashboard + #view + .ph + CONTENIDO NO VACÍO + SIN renderException → EJECUTAR SOLO EL GATE SEMÁNTICO READ-ONLY → SIN DEPLOY → DETENERSE PARA VALIDACIÓN HUMANA`.
