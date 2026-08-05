# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `DEV_ROOT_REDIRECT_DEPLOYED__REMOTE_PARITY_PASS__MULTIROLE_FUNCTIONAL_PASS__POSTDEPLOY_REPOSITORY_HYGIENE_HOLD__STOP_RETRY__NO_SECOND_DEPLOY__NO_PRODUCTION`

## Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado: `3`;
- Hosting DEV de este bloque: `1`;
- deploy adicional autorizado: `0`.

## Corrección predeploy

Se corrigieron exclusivamente los dos terminadores heredoc del step `Execute one Hosting deploy and root-only accumulated gates`.

```text
commit=e1f06f67e9021d430721328372b20a4bec631a47
workflowBlob=bd25e9a843496f6962e6e8cc1b987c82620e0a36
productFilesChanged=0
```

El manifest activo se repinó únicamente al nuevo blob del workflow.

## Source/static — PASS

```text
workflowRunId=31037730522
workflowJobId=92414066321
artifactId=8943265325
artifactDigest=sha256:2b7a3619d45054ef0c296b396172df01001063d53f247852aef082373a313ff0
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY
```

## Único Hosting DEV — ejecutado

```text
workflowRunId=31037828442
workflowJobId=92414393948
artifactId=8943383623
artifactDigest=sha256:6c275fa95d9b729ffefa2e17c660b8a25c02df916a5c57740b538e902b00d3f5
hostingDeploysThisBlock=1
hostingSite=cxorbia-backend-dev
```

El dominio raíz quedó publicado con redirect `302` hacia `/index-backend-dev.html`.

## Gates funcionales desde `/`

Pasaron antes del hold final:

- paridad remota exacta entre `/` y `/index-backend-dev.html`;
- Staff autenticado, recargas y nueva pestaña;
- Shopper autenticado, identidad exacta, histórico, certificación, recargas y nueva pestaña;
- Portal Cliente autenticado, ruta y vista semántica;
- Portal Shopper;
- Finanzas con modelo delegado, regalías `0` y sin valores inventados;
- Reservas con fuente protegida y mutaciones deshabilitadas.

```text
PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY
PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY
PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC
```

## HOLD final y STOP_RETRY

El wrapper final devolvió:

```text
FAIL_C6_DEV_ROOT_RUNTIME_ACCUMULATIVE
errorCode=REPOSITORY_CHANGED_BY_ROOT_RUNTIME_GATE
```

La única diferencia detectada fue el archivo efímero no rastreado generado por `google-github-actions/auth`:

```text
gha-creds-035f622bd48bcf7e.json
```

No hubo delta rastreado ni cambio de producto. El archivo fue eliminado por el cleanup de la acción. Aun así, el contrato exigía repositorio limpio durante la aserción y activó HOLD.

Se aplicó `STOP_RETRY`: request consumido, `allowedExecutions=0`, cero reintentos y cero segundo deploy.

## Estado seguro

```text
HOSTING_DEPLOYS_TOTAL=3
HOSTING_DEPLOYS_THIS_BLOCK=1
ADDITIONAL_DEPLOYS_AUTHORIZED=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_WRITES=0
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

## Impacto Phase A y Academia

Phase A, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, portales, Reservas y Academia permanecen preservados. No hubo cambio funcional de Academia, manuales, cursos, rutas por rol o notificaciones.

## Siguiente bloque exacto

La URL raíz ya puede ser validada humanamente. El hold técnico restante pertenece exclusivamente a higiene del harness y no autoriza otro deploy.

`VALIDACIÓN HUMANA DEL DOMINIO RAÍZ DEV → DOCUMENTAR RESULTADO → CORREGIR SOLO EL HARNESS DE HIGIENE EN UN BLOQUE POSTERIOR SIN DEPLOY, SI SE AUTORIZA`.
