# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-14 11:22 -06:00  
**Estado:** `FORENSIC_ROOT_CAUSE_LOCKED__ITERATION_2_CANONICAL_PERSISTENCE_PASS__SOURCE_READY_FOR_DEV_WRITE_GATES__GO_LIVE_35__ITERATION_3_NEXT`

## Autoridad vigente

Auditoría forense:

`app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`

Plan durable:

`app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`

Tracker porcentual productivo:

`app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`

Source lock I2:

`app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`

No volver a diagnóstico general ni crear otra candidata para estas correcciones salvo drift/P0 nuevo reproducible.

## Repo / rama / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva/candidata canónica: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`
- Todas las correcciones I1/I2 fueron aplicadas sobre esta misma rama/candidata.

## NO REPROCESO Auth

Se preservan Firebase Auth bridge, namespaces staff/shopper, role/tenant/project/shopper scope, principal Admin/Exact Write V2, membership/RBAC Staff, exact identity contract, HR live authority, protected overlay, cumulative read model, portal Shopper canónico y source repair previo.

No se reconstruyó Auth. `core/backend-browser-auth.js` continúa como owner efectivo de la autenticación humana protegida.

## ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION — PASS

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`.

Se preserva como cerrado: Auth owner único efectivo, Finance v2 por runtime contract, command adapter reusable, contrato Shopper Admin, HR writer reusable y source gate I1.

## ITERATION_2_CANONICAL_PERSISTENCE_PASS

Marker autoritativo: `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`.

Cierre: `SOURCE_READY_FOR_DEV_WRITE_GATES`.

Cambios fuente cerrados:

1. `app/adapters/cxorbia-cxdata-command-boundary-v1.js`: propietario final de mutaciones `CX.data` en runtime canónico. Conserva nombres públicos y deriva comandos tenant/project scoped con idempotencyKey, expectedVersion, actor/audit y provider ACK.
2. `app/adapters/cxorbia-command-adapter-v1.js`: fail-closed reforzado por tenant/project/role/shopper scope; provider authorization obligatoria; success solo con `status=committed` + `providerAck=true`.
3. `app/adapters/cxorbia-shopper-admin-command-contract-v1.js`: perfil operativo separado de datos protegidos; DPI/banco/cuenta requieren backend protegido, cifrado en reposo y cero persistencia browser/repo plana.
4. `app/core/shoppers-store.js`: `cx_shoppers`/`cx_shopper_patches` quedan exclusivamente para demo/lab explícito. Runtime canónico no hidrata ni persiste Shopper en localStorage.
5. `app/modules/misvisitas.js`: P0 `find()`/estados literales cerrado. Usa arrays completos + facets canónicas + identidad exacta y acciones ACK-aware. No muta estado local antes de ACK.
6. `app/adapters/cxorbia-canonical-write-firewall-v1.js`: los controles legacy que todavía intentaban mutar objetos/closure/localStorage quedan bloqueados antes de falsa persistencia; los casos simples de Postulaciones se enrutan al command boundary.
7. `app/index-backend-dev.html`: carga los contratos canónicos y fija `persistenceRequired` con owner `cx.data-command-boundary`, `localMutation=false`, `localStorageTruth=false`, `providerAck=true`.
8. `tools/qa/verify-root-cause-correction-iteration2.mjs`: regresión source/VM de write-gate cerrado, no mutación local, provider ACK, scope multi-tenant/multi-proyecto y Mis Visitas.
9. Workflow existente `CXOrbia Phase A Live Execution Checkpoint` extendido; no se creó workflow paralelo.

## Evidencia I2

Workflow existente `CXOrbia Phase A Live Execution Checkpoint`.

- Run source I2 `31823098359`: **SUCCESS**.
- Run final con checkpoint/tracker/documentación I2 `31823620461`: **SUCCESS**.

El run final confirmó simultáneamente:

- `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`;
- `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`;
- `PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT_FORENSIC_PLAN`;
- `goLiveCorrectionCompletedPct=35`;
- `goLiveCorrectionRemainingPct=65`;
- `iteration=2/5`;
- sameCandidate=true;
- noGeneralRediagnosis=true;
- noAuthRebuild=true;
- noNewBranchOrPr=true;
- Auth/Firestore/HR/Rules/Storage writes=false;
- deploy=false, merge=false, production=false.

## Alcance honesto de I2

I2 elimina el split-brain y la falsa persistencia como arquitectura canónica. **No activa todavía los writes reales.**

Los controles legacy complejos que aún no son ACK-aware quedan fail-closed en la candidata canónica en lugar de mutar memoria/localStorage y mostrar éxito. Incluyen, entre otros, edición/reasignación compleja de Postulaciones, submit de cuestionario y mutaciones de Reservas. Su funcionalidad real se activa/conecta dentro de I3/I4 con el provider correspondiente y ACK; no se crea otra arquitectura.

Mis Visitas sí quedó corregido en fuente para listas completas y consumo canónico; sus acciones de escritura permanecen honestamente bloqueadas mientras el gate de provider esté cerrado.

## Porcentaje productivo vigente

- Iteración 1: 15% — **PASS**.
- Iteración 2: 20% — **PASS**.
- Iteración 3: 25% — pendiente/gate DEV write.
- Iteración 4: 25% — pendiente.
- Iteración 5: 15% — pendiente.

**GO-LIVE: 35% completado / 65% pendiente.**

El trabajo técnico anterior se conserva como evidencia, pero no reemplaza los gates reales de este plan.

## Plan cerrado — 5 iteraciones base

1. `ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION` — PASS.
2. `ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION` — PASS.
3. `ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` — siguiente; requiere gate DEV write explícito.
4. `ITERACION_4_HR_BIDIRECTIONAL_PHASE_A_E2E_FINANCE` — gate HR/Make cuando aplique.
5. `ITERACION_5_EXACT_BUILD_PREPROD_AND_GO_LIVE` — gates deploy/producción.

No se abre una sexta iteración por rutina. Un gate fallido se corrige focalizadamente dentro de la misma iteración.

## Durabilidad/no-code

`CX.data` conserva su interfaz pública. La persistencia canónica queda detrás de command adapters reusables por `tenantId/projectId`, RBAC/scope, idempotencia, expectedVersion, audit y ACK. Cinépolis sigue siendo configuración del primer proyecto TyA, no lógica global.

## Siguiente acción exacta

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE`

I3 no reconstruye Auth. Debe activar mediante gate DEV específico el transporte real para:

- Admin crear/editar un Shopper;
- principal Firebase + claims + membership + profile/crosswalk exacto;
- validar Shopper histórico real sin matching por similitud;
- login del Shopper nuevo;
- persistencia provider + readback;
- reload/new-tab + segundo contexto;
- reparar únicamente casos exactos/review necesarios.

## Gate requerido para I3

Todavía no consumido. Se requiere autorización explícita de writes DEV Auth/Firestore limitada a este bloque antes de ejecutar cambios provider.

## Estado seguro

Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; cambios/reset de credenciales=0; deploy=0; merge=false; producción=false.
