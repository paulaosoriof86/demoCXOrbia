# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 21:11 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-PROVIDER-HOLD-SYNC-20`  
**Estado:** `I3_FROZEN__GO_LIVE_60__I4A_PROVIDER_HOLD_CONSUMED__SOURCE_TRUTH_RECONCILED__NO_PRODUCTION`

## Bloque correctivo de continuidad

Se reconciliaron las fuentes canónicas con la evidencia real posterior al checkpoint de 19:58. El gate `NEW_AUTH_REQUIRED_I4A_EXISTING_SHOPPER_IDENTITY_CLASSIFICATION_DEV_READONLY_NO_LOGIN` sí fue ejecutado.

Run `32208829234`; job `95937257924`; artifact `9350022534`; decisión `HOLD_I4A_TEST_SHOPPER_IDENTITY_NOT_PROVEN__PROVIDER_READONLY_NO_LOGIN`; `providerReadCalls=1`; `232` principals Auth; `211` Shopper; `0` candidatos seguros; `selected=null`.

La clasificación y artifact upload fueron SUCCESS. El workflow quedó failure únicamente por `GraphQL: Resource not accessible by integration (addComment)`. Se registra como `PIPELINE_MECHANISM_FAILURE__PR_COMMENT_PERMISSION`. La operación provider quedó consumida y no puede reejecutarse para reparar publicación.

## Corrección durable

- Evidencia sanitizada persistida en `app/docs/evidence/I4A-EXISTING-SHOPPER-AUTH-METADATA-READONLY-HOLD-LATEST.json`.
- Request I4-A marcado consumido/deshabilitado.
- Workflow I4-A retirado de acceso provider: queda solo como verificador de estado consumido cuando cambia el request.
- `tools/verify-cxorbia-source-truth-sync.mjs` actualizado al estado I4-A actual y a verificación de los documentos canónicos, evidencia, request consumido y ausencia de archivos temporales.
- Execution State, índice, source lock, checkpoint, Plan Unificado, Plan Lock, CAMBIOS, RESUMEN y PENDIENTES sincronizados al mismo `SYNC_EPOCH`.

## Incidencia metodológica durante este bloque

El conector Contents API produjo commits preparatorios no atómicos antes de activar el carril Git Tree correcto. Se clasifica `PIPELINE_MECHANISM_FAILURE__NONATOMIC_CONTENTS_API_PREP`. Los archivos temporales `TEMP-NOOP*.txt` y `app/docs/CXORBIA-EXECUTION-STATE.next.json` quedan eliminados en la reconciliación final. No tocaron producto/runtime, proveedor, datos, frontend, HR, deploy, merge ni producción. En adelante la sincronización multiarchivo usa un único tree/commit y se verifica antes de avanzar.

## Avance Phase A

I1 `15/15`; I2 `20/20`; I3 `25/25`; I4 `0/25` en curso/no puntuado; I5 `0/15` = **60% / 40%**.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I4A_CREATE_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER__PROTECTED_CONTRACT_NO_LOGIN`.

Luego, solo tras PASS: `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`.

## Clasificación

- **Reusable CXOrbia:** source-truth atómico, desacople resultado provider/publicación, request consumido fail-closed.
- **Exclusivo TyA:** identidad DEV dedicada para el futuro smoke.
- **Claude/prototipo:** sin parche frontend.
- **Academia:** sin cambio visible todavía.
- **Sin impacto Claude:** reconciliación documental/gate safety.
