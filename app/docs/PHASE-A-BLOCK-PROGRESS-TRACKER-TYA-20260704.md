# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-05  
**Estado:** `DEV_ROOT_REDIRECT_DEPLOYED__FUNCTIONAL_ROOT_GATES_PASS__QA_HYGIENE_HOLD__STOP_RETRY__HUMAN_VALIDATION_PENDING__NO_SECOND_DEPLOY`

## Microbloques de salida

| Microbloque | Estado | Evidencia |
|---|---|---|
| 0 — Carril único | COMPLETADO | Rama viva y PR #7 preservados |
| 1 — Auditoría focalizada V7.2 | COMPLETADO | P0 selector reproducible |
| 2 — Empalme/composición acumulativa | COMPLETADO | V7.2-P0F1 empalmada |
| 3 — Root fix selector Login | COMPLETADO | `.lg2-card, .login-card` en dos archivos exactos |
| 4 — Reconciliación de pins Login | COMPLETADO | Dos pins actualizados |
| 5 — Source/static posterior Login | PASS | Composición y Lab PASS |
| 6 — Primer Hosting DEV | COMPLETADO HISTÓRICO | Descubrió P0 selector |
| 7 — Segundo Hosting DEV correctivo | COMPLETADO | Login y gates remotos PASS |
| 8A — Gates semánticos por entrypoint explícito | PASS | Staff, Shopper, Cliente, Finanzas y Reservas |
| 8B — P0 entrypoint raíz DEV | DEMOSTRADO | `/` servía demo y los gates usaban entrada explícita |
| 8C — Redirect raíz source-only | APLICADO | `/` → `/index-backend-dev.html`, HTTP 302 |
| 8D — Gates permanentes de paridad | AGREGADOS | Source, remoto y runtime raíz |
| 8E — Primer intento predeploy raíz | STOP_RETRY SIN DEPLOY | Heredoc indentado, Hosting `0` |
| 8F — Correctivo heredoc-only | COMPLETADO | Dos terminadores; lógica y producto intactos |
| 8G — Repin workflow-only | COMPLETADO | Blob `bd25e9a843496f6962e6e8cc1b987c82620e0a36` |
| 8H — Source/static correctivo | PASS | Run `31037730522`, fallos efectivos `0` |
| 8I — Único Hosting DEV raíz | COMPLETADO | Deploy publicado; total acumulado `3` |
| 8J — Paridad remota desde `/` | PASS | Redirect 302 y cuerpo exacto de entrada canónica |
| 8K — Staff desde `/` | PASS | Login, recargas y nueva pestaña |
| 8L — Shopper desde `/` | PASS | Identidad, histórico, certificación, 3 recargas y nueva pestaña |
| 8M — Cliente/Portal Cliente desde `/` | PASS | Autenticación, ruta y panorama |
| 8N — Portal Shopper/Finanzas/Reservas | PASS | Contratos canónicos preservados |
| 8O — Higiene final del harness | HOLD QA-ONLY | `gha-creds-*.json` efímero observado antes del cleanup |
| 8P — STOP_RETRY postdeploy | APLICADO | Request consumido, cero reintento y cero segundo deploy |
| 9 — Validación humana y freeze | LISTO / PENDIENTE HUMANO | Validar release DEV existente desde `/` |
| 10 — Cutover/producción | PENDIENTE | Requiere validación humana, freeze y autorización expresa |

## Source/static del correctivo heredoc

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

## Hosting y gates funcionales raíz

```text
workflowRunId=31037828442
workflowJobId=92414393948
artifactId=8943383623
artifactDigest=sha256:6c275fa95d9b729ffefa2e17c660b8a25c02df916a5c57740b538e902b00d3f5
HOSTING_DEPLOY_SUCCEEDED=true
PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY
PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY
PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC
```

## HOLD final clasificado

```text
FAIL_C6_DEV_ROOT_RUNTIME_ACCUMULATIVE
errorCode=REPOSITORY_CHANGED_BY_ROOT_RUNTIME_GATE
observedUntracked=gha-creds-*.json
trackedDelta=0
classification=QA_WORKFLOW_HYGIENE_ONLY
productRuntimeFailure=false
secondDeploy=0
```

El archivo efímero fue generado por la acción de autenticación y eliminado en su cleanup posterior. El contrato fail-closed activó HOLD; por instrucción expresa se aplicó STOP_RETRY sin repetir gates ni desplegar otra vez.

## Siguiente bloque exacto

`VALIDACIÓN HUMANA DE LA RELEASE DEV EXISTENTE DESDE / → DOCUMENTAR RESULTADO → FREEZE SI PASS → SIN REDEPLOY, MERGE O PRODUCCIÓN`.

## Estado seguro

Hosting DEV acumulado `3`; Hosting DEV de este bloque `1`; deploy adicional autorizado `0`. Cloud Run, Firestore/Auth/Rules/Storage/HR writes, Make, Gemini, pagos, merge y producción: `0/false`.
