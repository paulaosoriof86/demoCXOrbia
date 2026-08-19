# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-19 10:04 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-DEDICATED-TEST-SHOPPER-PASS-21`  
**Estado:** `I3_FROZEN__GO_LIVE_60__I4A_DEDICATED_TEST_SHOPPER_PASS__SOURCE_TRUTH_RECONCILED`

## Bloque ejecutado

Se consumió la autorización `NEW_AUTH_REQUIRED_I4A_CREATE_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER__PROTECTED_CONTRACT_NO_LOGIN`.

Se materializó una única identidad DEV dedicada sintética/no histórica mediante el contrato protegido `app/adapters/cxorbia-shopper-admin-command-contract-v1.js`. La verificación provider-backed read-only run `32273818536` / job `96136329240` / artifact `9373197946` probó claims, profile, membership, crosswalk, provider ACK y provenance explícita exactos.

## Seguridad

Login `0`; Historical Shopper `0`; otras identidades modificadas `0`; fuzzy matching `false`; HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción `0/false`; UID/email/credenciales crudos no exportados.

El conector no expuso directamente el artifact del push de creación. No se inventan contadores internos de ese run. Se conserva el límite autorizado: máximo una creación Auth, una escritura de claims, cuatro escrituras Firestore y un delete únicamente de rollback. El estado final exacto queda provider-verificado.

## Archivos de cierre

- evidencia durable `app/docs/evidence/I4A-DEDICATED-NONHISTORICAL-DEV-TEST-SHOPPER-PASS-LATEST.json`;
- requests de creación/verificación marcados consumidos;
- one-shot workflows retirados del HEAD para impedir reejecución accidental;
- verifier actualizado al `SYNC_EPOCH` y siguiente gate;
- Execution State, índice, source lock, checkpoint, Plan Unificado, Plan Lock, CAMBIOS, RESUMEN y PENDIENTES sincronizados atómicamente.

## Avance Phase A

**60% / 40%**. Este gate habilita la evidencia visible de I4-A pero no suma puntos formales por sí solo.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE` — requiere autorización nueva.

## Clasificación

- **Reusable CXOrbia:** patrón de identidad sintética dedicada + provider ACK + provenance explícita + cierre fail-closed.
- **Exclusivo TyA:** scope tenant/proyecto DEV de la identidad.
- **Claude/prototipo:** sin parche UI.
- **Academia:** pendiente de evidencia visible.
- **Sin impacto Claude:** cierre backend/source-truth.
