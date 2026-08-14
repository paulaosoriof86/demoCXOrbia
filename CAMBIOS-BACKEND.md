# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-14 10:42 -06:00  
**Estado:** `ITERATION_1_SOURCE_ONLY_PASS__GO_LIVE_15__ITERATION_2_NEXT__NO_PRODUCTION`

## Bloque ejecutado

Se ejecutó `ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION` sobre la misma candidata canónica `docs-tya-v6-v71-audit` / PR #7. No se creó candidata, rama, PR ni workflow nuevo.

## Cambios fuente

- `app/adapters/tya-c6-shopper-auth-click-guard-v1.js`: dejó de ser un interceptor permanente. En ruta humana protegida delega a `core/backend-browser-auth.js`, neutraliza `pickShopperDev()` solo allí y no envuelve `authenticate`.
- `app/adapters/tya-canonical-finance-read-model-v2.js`: activación por contrato `CX_DEV_ENTRY_CANONICAL`, no hostname; root project reusable, sin hardcode global `cinepolis`.
- `app/adapters/cxorbia-command-adapter-v1.js`: nuevo boundary reusable fail-closed, tenant/project, RBAC, idempotencyKey, expectedVersion, audit y success únicamente con provider ACK.
- `app/adapters/cxorbia-shopper-admin-command-contract-v1.js`: contrato de alta/edición Shopper para Auth + claims + membership + profile/crosswalk, sin password/token/localStorage en navegador.
- `app/adapters/cxorbia-hr-write-adapter-contract-v1.js`: writer HR reusable gated/idempotente, conflictos a review y cero overwrite silencioso.
- `tools/qa/verify-root-cause-correction-iteration1.mjs`: gate source-only de durabilidad.
- `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`: se amplió el workflow existente para validar sintaxis y contrato de Iteración 1; no se creó otro workflow.
- `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`: se retiró la dependencia obsoleta del marcador histórico `31518927950`; ahora valida la autoridad forense vigente.

## Evidencia

Run `31820315435` del workflow existente: SUCCESS. Pasaron sintaxis, source preflight histórico preservado, `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY` y checkpoint operativo vigente.

## Corrección metodológica

M1–M10 permanecen como evidencia histórica, no como porcentaje de producción. Tracker vigente: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

**GO-LIVE: 15% completado / 85% pendiente.**

Pesos: I1=15, I2=20, I3=25, I4=25, I5=15. El porcentaje solo avanza al cerrar el gate de cada iteración.

## Reusable CXOrbia

Los contratos nuevos no dependen de TyA/Cinépolis como lógica global. `tenantId/projectId`, scope, idempotencia, versionado, provider ACK y conflicto/review forman la base reusable para nuevos proyectos TyA y futuros tenants/no-code.

## Exclusivo cliente

TyA/Cinépolis mantiene su configuración/datos operativos reales. No se incorporaron reglas de cliente como constantes globales en los contratos nuevos.

## Claude/prototipo

`app/modules/misvisitas.js` conserva un P0 reproducible: `find()` por estado y estados literales. No fue parchado desde backend. La corrección exacta sigue documentada para aplicarse quirúrgicamente sobre esta misma candidata en Iteración 2, consumiendo facets/listas canónicas y success solo tras ACK.

El P0 Auth no requirió reescribir `app.js`: se resolvió la integración desde el adapter de runtime protegido, preservando el frontend aprobado y el flujo DEV picker solo para lab/demo no protegido.

## Academia

Sin activación visible nueva todavía. Cuando Iteración 2/3 cierre, actualizar login real, Mis Visitas multi-registro, alta Shopper persistente, errores fail-closed y sync real/pending sin promesas falsas.

## Seguridad

Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; cambios/reset de credenciales=0; deploy=0; merge=false; producción=false.

## Siguiente acción exacta

`ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`.
