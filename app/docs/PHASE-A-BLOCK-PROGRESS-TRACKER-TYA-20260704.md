# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-05  
**Estado:** `DEV_ROOT_ENTRYPOINT_SOURCE_FIX_APPLIED__SOURCE_STATIC_PASS__HOSTING_PREDEPLOY_HOLD__STOP_RETRY__NO_DEPLOY`

## Microbloques de salida

| Microbloque | Estado | Evidencia |
|---|---|---|
| 0 — Carril único | COMPLETADO | Rama viva y PR #7 preservados |
| 1 — Auditoría focalizada V7.2 | COMPLETADO | P0 selector reproducible |
| 2 — Empalme/composición acumulativa | COMPLETADO | V7.2-P0F1 empalmada |
| 3 — Root fix selector Login | COMPLETADO | Dos archivos exactos con `.lg2-card, .login-card` |
| 4 — Reconciliación de pins | COMPLETADO | Dos pins actualizados en overlay activo |
| 5 — Source/static posterior | PASS | Composición y Lab PASS |
| 6 — Primer Hosting DEV | COMPLETADO HISTÓRICO | Release y paridad PASS; descubrió P0 selector |
| 7 — Segundo Hosting DEV correctivo | COMPLETADO | Release completa; paridad remota PASS |
| 8A — Staff por entrypoint explícito | PASS | Login, reload y nueva pestaña |
| 8B — Shopper por entrypoint explícito | PASS | Login, tres recargas, nueva pestaña y visita propia |
| 8C — Cliente por entrypoint explícito | PASS | Credencial existente y Portal Cliente |
| 8D — Finanzas/Reservas por entrypoint explícito | PASS | Modelo delegado y Reservas fail-closed |
| 8E — Predicado semántico Cliente | PASS | `session-view-canonical-render-v1` |
| 8F — P0 raíz DEV | DEMOSTRADO | `/` servía demo; gates usaban `/index-backend-dev.html` |
| 8G — Corrección source-only raíz | APLICADA | Redirect `/` → `/index-backend-dev.html`, HTTP 302 |
| 8H — Gate permanente de paridad raíz | AGREGADO | Source y remoto |
| 8I — Source/static del P0 raíz | PASS | Run `31035432458`, fallos efectivos `0` |
| 8J — Hosting DEV del P0 raíz | HOLD PREDEPLOY | Bash no reconoció terminadores heredoc indentados; deploy `0` |
| 8K — Gates acumulativos desde `/` | NO EJECUTADOS | Bloqueados antes del deploy |
| 9 — Validación humana y freeze | BLOQUEADO | Root remoto todavía no corregido |
| 10 — Cutover/producción | PENDIENTE | Requiere root PASS, validación humana, freeze y autorización |

## Source/static del P0 raíz

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

## STOP_RETRY predeploy

```text
workflowRunId=31035653127
workflowJobId=92406957537
artifactId=8942474073
artifactDigest=sha256:bf3014ddc059b86ae2dde18d397b266b8e5c9f5db92bcf7a3fee13246f30060f
failedStage=predeploy_workflow_shell_parse
errorCode=BASH_HEREDOC_TERMINATOR_INDENTATION_INVALID
deployAttempted=false
hostingDeploysThisBlock=0
rootRuntimeGatesExecuted=false
```

La causa está aislada en la sintaxis del workflow, no en producto ni en Firebase. El request quedó consumido y no se reintentó.

## Siguiente bloque exacto

`FIX WORKFLOW HEREDOC-ONLY → REPIN WORKFLOW → SOURCE/STATIC → NUEVA AUTORIZACIÓN → UN HOSTING DEV → PARIDAD Y GATES DESDE / → VALIDACIÓN HUMANA`.

## Estado seguro

Hosting DEV acumulado `2`; Hosting DEV de este bloque `0`; intentos de deploy `0`; deploys adicionales autorizados `0`. Cloud Run, Firestore/Auth/Rules/Storage/HR writes, Make, Gemini, pagos, merge y producción: `0/false`.
