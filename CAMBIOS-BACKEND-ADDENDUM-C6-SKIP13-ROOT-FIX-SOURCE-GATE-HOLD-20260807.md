# CAMBIOS BACKEND — C6 SKIP13 root-fix source-gate HOLD

Se materializaron contrato/adjudicador SKIP13 v2 con `deterministic-suffix-plan-profile` y separación explícita de namespaces. El source gate `31190357507` pasó sintaxis pero falló antes de provider por contaminación de salida del self-test causada por `--self-test` observado también por un módulo importado.

```text
providerAttempt=false
providerReads=0
providerWrites=0
workflowV2Removed=true
STOP_RETRY=true
```
