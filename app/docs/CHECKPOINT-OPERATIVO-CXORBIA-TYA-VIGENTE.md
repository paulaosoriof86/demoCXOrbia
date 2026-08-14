# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-14 10:42 -06:00  
**Estado:** `FORENSIC_ROOT_CAUSE_LOCKED__ITERATION_1_SOURCE_ONLY_PASS__GO_LIVE_15__ITERATION_2_NEXT`

## Autoridad vigente

Auditoría forense:

`app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`

Plan durable:

`app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`

Tracker porcentual productivo:

`app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`

No volver a diagnóstico general ni crear otra candidata para estas correcciones salvo drift/P0 nuevo reproducible.

## Repo / rama / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva/candidata canónica: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`
- Todas las correcciones de este bloque fueron aplicadas a esta misma rama/candidata.

## NO REPROCESO Auth

Se preservan Firebase Auth bridge, namespaces staff/shopper, role/tenant/project/shopper scope, principal Admin/Exact Write V2, membership/RBAC Staff, exact identity contract, HR live authority, protected overlay, cumulative read model, portal Shopper canónico y source repair previo.

La Iteración 1 no reconstruyó Auth. Consolidó el owner efectivo en `core/backend-browser-auth.js`: el adapter histórico `app/adapters/tya-c6-shopper-auth-click-guard-v1.js` ya no captura clicks ni envuelve `authenticate`; delega roles protegidos al owner canónico y neutraliza `pickShopperDev()` únicamente para la ruta humana protegida.

## ITERATION_1_SOURCE_ONLY_PASS

Marker autoritativo: `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`.

Cambios fuente cerrados:

1. Auth/control plane: owner protegido único efectivo, sin captura Shopper permanente ni client direct-auth wrapper.
2. Finance: `tya-canonical-finance-read-model-v2.js` activa por runtime contract `CX_DEV_ENTRY_CANONICAL`, no por hostname; root project no queda hardcodeado a Cinépolis.
3. Command boundary reusable: `app/adapters/cxorbia-command-adapter-v1.js`, fail-closed, tenant/project, idempotency, expectedVersion, audit y provider ACK obligatorio.
4. Shopper Admin reusable: `app/adapters/cxorbia-shopper-admin-command-contract-v1.js`, preparado para Auth + claims + membership + profile/crosswalk; browser password/token/localStorage prohibidos.
5. HR writer reusable: `app/adapters/cxorbia-hr-write-adapter-contract-v1.js`, gated/idempotente, conflictos a review, no overwrite silencioso.
6. Gate source-only: `tools/qa/verify-root-cause-correction-iteration1.mjs`.
7. Workflow existente extendido, sin crear workflow nuevo.
8. El verificador operativo obsoleto que exigía el marcador histórico `31518927950` fue corregido para validar la autoridad forense vigente y no reiniciar porcentajes M1–M10.

## Evidencia

Workflow existente `CXOrbia Phase A Live Execution Checkpoint`, run `31820315435`: SUCCESS.

PASS en:

- Exact Write V2 source syntax/preflight histórico preservado;
- sintaxis de los archivos corregidos de Iteración 1;
- `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`;
- checkpoint operativo forense vigente.

No provider write/deploy/producción fue ejecutado por este gate.

## Porcentaje productivo vigente

Modelo cerrado por el tracker forense:

- Iteración 1: 15% — **PASS**.
- Iteración 2: 20% — pendiente.
- Iteración 3: 25% — pendiente.
- Iteración 4: 25% — pendiente.
- Iteración 5: 15% — pendiente.

**GO-LIVE: 15% completado / 85% pendiente.**

El trabajo técnico anterior se conserva, pero no vuelve a contarse como readiness productivo hasta quedar probado dentro de los gates reales de este plan.

## P0 frontend/Claude todavía visible

`app/modules/misvisitas.js` conserva el P0 reproducible de `find()` por estado y estados literales. No fue ocultado ni parchado desde backend. Su corrección quirúrgica sobre esta misma candidata queda documentada en `app/docs/RESUMEN-PARA-CLAUDE.md` y debe integrarse con el command adapter durante la Iteración 2, sin nueva candidata ni rediseño.

## Plan cerrado — 5 iteraciones base

1. `ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION` — PASS.
2. `ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION` — siguiente.
3. `ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` — gate DEV write.
4. `ITERACION_4_HR_BIDIRECTIONAL_PHASE_A_E2E_FINANCE` — gate HR/Make cuando aplique.
5. `ITERACION_5_EXACT_BUILD_PREPROD_AND_GO_LIVE` — gates deploy/producción.

No se abre una sexta iteración por rutina. Un gate fallido se corrige focalizadamente dentro de la misma iteración.

## Durabilidad/no-code

`CX.data` conserva su interfaz pública. La persistencia se mueve detrás de command adapters reusables por `tenantId/projectId`, RBAC/scope, idempotencia, expectedVersion, audit y ACK. Cinépolis permanece como configuración del primer proyecto TyA, no lógica global.

## Siguiente acción exacta

`ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`

Objetivo: conectar las mutaciones Phase A existentes de `CX.data` al command adapter, eliminar fallback local/false-success, mantener writes cerrados y ejecutar regresión transversal + prueba source-safe multi-tenant/multi-proyecto antes de solicitar cualquier gate DEV write.

## Estado seguro

Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; cambios/reset de credenciales=0; deploy=0; merge=false; producción=false.
