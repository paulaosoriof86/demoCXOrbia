# GO-LIVE PROGRESS TRACKER — ROOT-CAUSE PLAN CXORBIA TyA

**Fecha:** 2026-08-14 10:45 -06:00  
**Estado:** `ITERATION_1_SOURCE_ONLY_PASS__15_PERCENT__ITERATION_2_NEXT`

## Regla de medición

Este tracker reemplaza cualquier uso de M1–M10 como porcentaje de readiness productivo. El trabajo técnico anterior se conserva como evidencia y no se pierde, pero no vuelve a sumar porcentaje hasta que forme parte de un gate productivo real del plan forense.

El porcentaje solo avanza cuando una iteración cierra su gate. No se otorgan porcentajes por diagnóstico, documentación aislada o pruebas sobre un build distinto al source lock.

## Pesos

- Iteración 1 — source-only root-cause consolidation: **15%**.
- Iteración 2 — canonical persistence + transversal regression: **20%**. Acumulado: **35%**.
- Iteración 3 — DEV Auth/Firestore Shopper persistence: **25%**. Acumulado: **60%**.
- Iteración 4 — HR bidirectional + Phase A E2E + Finance: **25%**. Acumulado: **85%**.
- Iteración 5 — exact build + preprod + go-live: **15%**. Acumulado: **100%**.

La ponderación da más peso a persistencia/provider real y operación E2E que a preparación estática, para evitar repetir el error de declarar readiness con contratos source-only.

## Estado actual

**15% completado / 85% pendiente para producción.**

### Iteración 1 — PASS

Evidencia fuente:

- Auth protegido consolidado sobre `core/backend-browser-auth.js` como owner efectivo; el adapter histórico `tya-c6-shopper-auth-click-guard-v1.js` dejó de capturar clicks/direct-auth y ahora solo delega al owner canónico.
- Shopper DEV picker queda inhabilitado únicamente en la ruta humana protegida; preview/lab explícito se preserva.
- Finance v2 activa por `CX_DEV_ENTRY_CANONICAL`/runtime contract, no por hostname; root project ya no queda hardcodeado a Cinépolis.
- `cxorbia-command-adapter-v1.js` creado fail-closed: tenant/project, RBAC, idempotencyKey, expectedVersion y success solo con provider ACK.
- `cxorbia-shopper-admin-command-contract-v1.js` creado para Auth + claims + membership + profile/crosswalk, sin password/token/localStorage en navegador.
- `cxorbia-hr-write-adapter-contract-v1.js` creado gated/idempotente, con conflictos a review y cero overwrite silencioso.
- `tools/qa/verify-root-cause-correction-iteration1.mjs` creado.
- Workflow existente `CXOrbia Phase A Live Execution Checkpoint`: run `31820315435` SUCCESS tras corregir el verificador histórico; run final de documentación/checkpoint `31820514862` SUCCESS. Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`.

## Iteración 2 — siguiente

`ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`

Cierre requerido: todas las mutaciones Phase A de `CX.data` deben delegar al command adapter, cero fallback local productivo/false-success, contratos de ACK/RBAC/scope/idempotencia/version/audit, regresión read-only y prueba multi-tenant/multi-proyecto source-safe.

## Estado seguro

Provider/Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0. Cambios/reset de credenciales=0. Deploy=0. Merge=false. Producción=false.
