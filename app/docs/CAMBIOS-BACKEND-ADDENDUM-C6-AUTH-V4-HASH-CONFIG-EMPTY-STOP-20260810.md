# CAMBIOS BACKEND — ADDENDUM C6 AUTH V4 HASH_CONFIG_EMPTY STOP_RETRY

**Fecha:** 2026-08-10  
**Estado:** `STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE`  
**Producción:** no  
**Merge:** no

## Archivos creados/tocados

1. `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v2.mjs`
   - wrapper source-only del ejecutor v1;
   - remueve exclusivamente `?mask=hashConfig` en runtime;
   - valida sintaxis y orden PREWRITE → write boundary → Auth writes;
   - no modifica identidad, plan ni frontend.

2. `.github/workflows/cxorbia-c6-auth-plan-v4-activation-dev-v2-once.yml`
   - creado para request único, PREWRITE y activación condicional;
   - consumido por el run terminal;
   - retirado en fail-close.

3. `.github/workflows/cxorbia-c6-auth-plan-v4-source-repair-gate.yml`
   - creado para producir evidencia observable del gate source-only;
   - PASS en run `31402335372`;
   - retirado al cerrar el bloque.

4. `backend/config/c6-auth-plan-v4-activation-dev-request-v2.json`
   - request nuevo y no superpuesto;
   - ejecutado una sola vez;
   - ahora `consumed=true`, `enabled=false`, `allowedExecutions=0`.

5. `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.md`
   - source lock terminal del bloque.

6. `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.json`
   - evidencia source-safe terminal.

7. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
   - actualizado al STOP `HASH_CONFIG_EMPTY`.

8. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
   - reconciliado para dar prevalencia al estado 2026-08-10.

## Resultado técnico

### PASS source-only

```text
sourceRepairHead=c6d4fdb83303a0293b1c6adce375b522d0c29db8
sourceRepairRunId=31402335372
decision=PASS_C6_HASH_CONFIG_SOURCE_REPAIR_STATIC_ZERO_WRITES
```

La causa anterior `HASH_CONFIG_HTTP_400` quedó resuelta al retirar el `mask` inválido del GET.

### PREWRITE terminal

```text
requestId=c6-auth-plan-v4-activation-dev-20260810-02
runId=31402395938
jobId=93500386091
artifactId=9068194459
artifactDigest=sha256:a469cf5d2d6607e8a205af52cbef78042a814886d7be5229480cfadce05013a9
decision=STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
errorCode=HASH_CONFIG_EMPTY
errorFingerprint=e9514406bb62df47b26382a9
providerAttempts=1
secondProviderAttempt=false
prewritePass=false
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
```

## Causa raíz nueva

El ejecutor v1 interpreta la respuesta de `projects.getConfig` buscando `body.hashConfig || body.hash_config`. El esquema oficial de Identity Platform ubica `hashConfig` dentro de `Config.signIn.hashConfig`.

Se registra además un gate independiente pendiente: confirmar read-only que el principal exacto usado por PREWRITE pueda recibir material de hash (`firebaseauth.configs.getHashConfig`). No se hizo una segunda lectura/provider attempt porque el mandato del bloque era STOP_RETRY ante cualquier fallo.

## Freeze preservado

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
passwordChanges=8
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

No se reabrió SKIP13, multi-Auth, lineage `ac93...` ni plan v3.

## Impacto Phase A

- Auth DEV sigue pendiente porque PREWRITE no pasó.
- No hubo Auth writes ni pérdida de datos.
- Smoke acumulativo no se ejecutó porque estaba condicionado a Auth PASS.
- Todos los módulos Phase A permanecen preservados.

## Clasificación

- **Reusable CXOrbia:** gate de request shape, parser de configuración conforme al esquema, fail-close, one-shot y separación prewrite/write boundary.
- **Exclusivo cliente:** freeze Shopper TyA 340 y sus conteos.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** documentar troubleshooting de Auth, lectura de configuración sensible y STOP_RETRY.
- **Sin impacto Claude:** no tocar módulos UI.

## Siguiente bloque

`C6 AUTH V4 HASH CONFIG RESPONSE PATH + PERMISSION READINESS SOURCE-ONLY → SINGLE PREWRITE RETRY`, solo con nueva autorización.
