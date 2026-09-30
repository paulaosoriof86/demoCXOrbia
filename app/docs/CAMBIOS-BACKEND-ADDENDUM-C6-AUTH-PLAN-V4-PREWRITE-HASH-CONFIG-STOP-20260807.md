# CAMBIOS BACKEND — ADDENDUM C6 AUTH PLAN V4 PREWRITE HASH-CONFIG STOP

**Fecha:** 2026-08-07

## Resultado

Se preparó y ejecutó una sola vez el PREWRITE autorizado sobre el freeze v4. La ejecución se detuvo antes del write boundary con:

```text
STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
HASH_CONFIG_HTTP_400
providerAttempts=1
secondProviderAttempt=false
AuthWrites=0
```

El plan v4 permanece intacto: 340 filas, 118 CREATE, 9 UPDATE, HOLD=0, digest `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`.

## Archivos creados/tocados

- `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json` — contrato v4;
- `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v1.mjs` — PREWRITE/activation tool v4; material hash/salt acotado a las 8 UPDATE con cambio password;
- `backend/config/c6-auth-plan-v4-activation-dev-request-v1.json` — request consumido/deshabilitado tras STOP;
- `.github/workflows/cxorbia-c6-auth-plan-v4-activation-dev-once.yml` — creado para el one-shot y retirado al cierre;
- `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.json`;
- `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.md`;
- documentación acumulativa de cierre del bloque.

## Gates y seguridad

Pasaron request-only gate, one-shot claim, self-test, circuit-breaker, artifact/digest gate y verifier estructural source-safe. El error ocurrió en la consulta administrativa de `hashConfig`; no se llegó a inspeccionar hash/salt, generar snapshot ni ejecutar Auth.

```text
writeBoundaryEntered=false
passwordMaterialInspectedRows=0
snapshotProduced=false
authCreates=0
authUpdates=0
duplicateDisables=0
providerWriteCalls=0
Firestore/HR/Rules/Storage writes=0
deploys=0
merge=false
production=false
```

## Causa raíz

El GET de configuración usó `?mask=hashConfig`. La referencia oficial de `projects.getConfig` define GET del recurso completo sin ese query; `updateMask` pertenece al PATCH. Se clasifica source-only `GET_CONFIG_QUERY_MASK_UNSUPPORTED_OR_MALFORMED_REQUEST_SHAPE`. No hubo provider re-test.

## Clasificación

- **Reusable CXOrbia:** one-shot claim, digest lock v4, structural PII verifier, password material scoping, fail-close prewrite.
- **Exclusivo cliente:** conteos TyA/Cinépolis, fingerprints y adjudicación duplicate disable-only.
- **Claude/prototipo:** sin cambios frontend; no tocar UI.
- **Academia:** documentar gate de rollback de Auth y lectura correcta de configuración administrativa.
- **Sin impacto Claude:** provider PREWRITE STOP y fail-close.
