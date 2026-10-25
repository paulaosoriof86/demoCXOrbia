# CAMBIOS-BACKEND — ADDENDUM C6 ONE-TARGET RESOLVER STOP_RETRY — 2026-08-07

## Resultado

Bloque read-only autorizado cerrado en `STOP_RETRY_C6_AUTH_ONE_TARGET_RESOLVER_PASSWORD_SNAPSHOT_READONLY_TECHNICAL` por `TARGET_CREDENTIAL_LOGIN_ANCHOR_MISSING`.

## Archivos creados/tocados

- `tools/qa/cxorbia-c6-auth-one-target-resolver-password-snapshot-readonly.mjs`: resolver/snapshot read-only focal; no writes.
- `.github/workflows/cxorbia-c6-auth-one-target-resolver-password-snapshot-readonly.yml`: workflow one-shot; retirado tras la ejecución terminal.
- `backend/config/c6-auth-one-target-resolver-password-snapshot-readonly-request-v1.json`: consumido tras falso positivo source-only del gate; cero provider reads.
- `backend/config/c6-auth-one-target-resolver-password-snapshot-readonly-request-v2.json`: consumido tras mismatch de schema antes de provider; cero provider reads.
- `backend/config/c6-auth-one-target-resolver-password-snapshot-readonly-request-v3.json`: request terminal consumido tras STOP_RETRY.
- `app/docs/evidence/C6-AUTH-ONE-TARGET-RESOLVER-PASSWORD-SNAPSHOT-READONLY-STOP-RETRY-20260807.json`.
- `app/docs/SOURCE-LOCK-C6-AUTH-ONE-TARGET-RESOLVER-PASSWORD-SNAPSHOT-READONLY-STOP-RETRY-20260807.md`.
- documentación de continuidad, Claude, pendientes, Academia, Phase A, índice, checkpoint y PR #7.

## Ejecución terminal

```text
runId=31221947755
jobId=93008217242
artifactId=9010690763
artifactDigest=sha256:9d875485492c403500e8345d73e3d6f864a4aaf458e2bc702da92404f47a40e1
shopperIndexQueries=1
shopperDocumentsRead=340
authDirectoryPages=0
hashConfigReads=0
HRReads=0
providerWrites=0
AuthWrites=0
```

El profile objetivo sí fue resuelto dentro de los 340 shoppers. El bloqueo ocurrió al intentar obtener el credential login técnico necesario para reproducir el candidate resolver del PREWRITE; por eso el flujo se detuvo antes de `Auth.listUsers` y antes de hash/salt/hashConfig.

## Incidencias source-only

1. `31221442188`: gate estático interpretó `Map.set()` como write provider. Se corrigió antes de provider; 0 reads/writes.
2. `31221635160`: request schema v2 no coincidía con el contrato v1 esperado por el tool. Se corrigió antes de provider; 0 reads/writes.

No se ocultan ni se cuentan como intentos provider porque no cruzaron ese boundary.

## Estado seguro

- Auth final: `340/340`, `HOLD=0`, no ejecutado.
- SKIP13: cerrado.
- adjudicación multi-Auth: cerrada.
- contrato PREWRITE: sin relajación.
- producción: intacta.
- no deploy, no merge, no writes.

## Clasificación

- Reusable CXOrbia: resolver read-only y fail-close.
- Exclusivo cliente: target fingerprint y TyA.
- Claude/prototipo: sin cambios.
- Academia: documentar identidad técnica y reversibilidad.
- Sin impacto Claude: backend/Auth pendiente.
