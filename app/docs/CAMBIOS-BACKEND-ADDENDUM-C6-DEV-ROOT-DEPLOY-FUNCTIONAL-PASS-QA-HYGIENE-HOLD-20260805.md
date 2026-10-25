# CAMBIOS-BACKEND — C6 DEV root desplegado, funcional PASS y HOLD de higiene QA

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Backend/Hosting/QA · Sin cambio de producto

## Alcance ejecutado

- corrección exclusiva de dos terminadores heredoc en `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`;
- repin exclusivo del blob del workflow;
- source/static acumulativo;
- un único Hosting DEV sobre `cxorbia-backend-dev`;
- gates acumulativos desde `https://cxorbia-backend-dev.web.app/`.

No se modificaron módulos, diseño, Login, Auth ni lógica de negocio.

## Correctivo heredoc-only

```text
commit=e1f06f67e9021d430721328372b20a4bec631a47
previousBlob=a01f1f9be4891a9cc707707c58ce47abb706284b
currentBlob=bd25e9a843496f6962e6e8cc1b987c82620e0a36
changedLines=2
workflowLogicChanged=false
productFilesChanged=false
```

## Source/static PASS

```text
run=31037730522
job=92414066321
artifact=8943265325
digest=sha256:2b7a3619d45054ef0c296b396172df01001063d53f247852aef082373a313ff0
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY
```

## Hosting DEV y gates funcionales

El único deploy autorizado finalizó correctamente y publicó el redirect raíz:

```text
/ → /index-backend-dev.html
HTTP 302
```

```text
run=31037828442
job=92414393948
artifact=8943383623
digest=sha256:6c275fa95d9b729ffefa2e17c660b8a25c02df916a5c57740b538e902b00d3f5
HOSTING_DEPLOY_SUCCEEDED=true
PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY
PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY
PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC
```

Pasaron desde `/`: Staff, Shopper, Cliente, Portal Cliente, Portal Shopper, Finanzas y Reservas.

## HOLD final

El gate de limpieza detectó únicamente el archivo efímero no rastreado creado por `google-github-actions/auth` antes de su cleanup:

```text
gha-creds-*.json
trackedDelta=0
errorCode=REPOSITORY_CHANGED_BY_ROOT_RUNTIME_GATE
classification=QA_WORKFLOW_HYGIENE_ONLY
```

La acción eliminó el archivo durante el cleanup. No hubo exposición de credenciales, cambio de producto ni fallo remoto.

## STOP_RETRY

- request consumido y deshabilitado;
- `allowedExecutions=0`;
- deploys de este bloque: `1`;
- reintentos: `0`;
- segundo deploy: `0`;
- deploy adicional autorizado: `0`.

## Seguridad

```text
HOSTING_DEPLOYS_TOTAL=3
CLOUD_RUN=0
FIRESTORE/AUTH/RULES/STORAGE/HR_WRITES=0
MAKE/GEMINI/PAYMENTS=0
CREDENTIALS_EXPOSED=false
TOKENS_EXPOSED=false
MERGE=false
PRODUCTION=false
```

## Siguiente acción

Validación humana sobre la release DEV existente. La corrección futura del guard de higiene será source-only y no requiere redeploy.
