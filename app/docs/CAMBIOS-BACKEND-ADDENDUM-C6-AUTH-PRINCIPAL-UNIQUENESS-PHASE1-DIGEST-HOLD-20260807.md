# CAMBIOS BACKEND — C6 AUTH PRINCIPAL-UNIQUENESS PHASE 1 DIGEST HOLD

## Clasificación

- Reusable CXOrbia: invariant global de principal Auth único por profile y semántica rollback saltless exacta.
- Exclusivo cliente TyA: re-clasificación propuesta del profile fingerprint `ac93d90d9e41512acdcd` y preservación de su peer.
- Claude/prototipo: sin cambios frontend.
- Academia: sin cambio funcional; registrar continuidad.
- Sin impacto Claude: workflow/request de ejecución C6.

## Archivos creados

- `backend/config/c6-shopper-auth-final-freeze-v3.json`.
- `backend/contracts/c6-auth-activation-dev-v2.json`.
- `tools/qa/cxorbia-c6-auth-principal-uniqueness-rootfix-source-only.mjs`.
- `tools/qa/cxorbia-c6-auth-activation-dev-v2.mjs`.
- request one-shot consumido `backend/config/c6-auth-principal-uniqueness-rootfix-activation-dev-request-v1.json`.
- evidencia y source lock del STOP_RETRY.

## Ejecución

Run `31228513906`, job `93027465078`. Sintaxis, self-tests y static no-loop gate PASS. Materialización FASE 1 falló `NEW_DIGEST` por diferencia literal entre dos annotations source-safe. FASE 2 no inició; credencial provider no fue preparada; provider reads/writes y Auth writes = 0.

El workflow one-shot fue retirado antes de consumir el request. No existe autorización latente.

## Pendiente real

Canonicalizar una sola representación audit-only para el row re-clasificado, recalcular/congelar el digest desde esa representación y volver a ejecutar FASE 1 source-only. No volver a lineage, SKIP13, multi-Auth ni password target.
