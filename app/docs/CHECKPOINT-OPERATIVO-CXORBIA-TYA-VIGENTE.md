# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-14 10:08 -06:00  
**Estado:** `FORENSIC_ROOT_CAUSE_LOCKED__DURABLE_GO_LIVE_PLAN_LOCKED__ITERATION_1_NEXT`

## Corte obligatorio

La auditoría forense integral de preproducción quedó cerrada y vigente en:

`app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`

El plan de corrección raíz/go-live/durabilidad quedó fijado en:

`app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`

No se autoriza volver a diagnóstico general ni crear otra candidata para estas correcciones salvo drift/P0 nuevo reproducible.

## Repo / rama / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva/candidata canónica: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`
- HEAD antes de fijar el plan: `cd02fcba934db84004c5b6e5d2f1855e1c4fadb4`
- Commit del addendum de plan: `9b143f184b48c276b832a7f2853449058d5d391f`
- Commit de activación en índice: `c87272846e6f64c23af3f86defaa31cd7d836973`

## Causas raíz bloqueantes

1. `P0_RELEASE_INTEGRITY`.
2. `P0_AUTH_CONTROL_PLANE_FRAGMENTATION`.
3. `P0_IDENTITY_CONTROL_PLANE`.
4. `P0_PERSISTENCE_SPLIT_BRAIN`.
5. `P0_ADMIN_SHOPPER_PERSISTENCE_AND_CREDENTIAL_MODEL`.
6. `P0_FALSE_SUCCESS_IN_READONLY_RUNTIME`.
7. `P0/P1_SHOPPER_WORKSPACE_DATA_CONSUMPTION`.
8. `P0/P1_FINANCE_RUNTIME_ACTIVATION`.
9. `P1_HR_READ_OK_WRITE_PENDING`.
10. `PROCESS_ROOT_CAUSE`.

## Auth — NO REPROCESO

Se preservan como trabajo válido existente:

- Firebase Auth bridge integrado al formulario visible;
- namespaces staff/shopper y validación role/tenant/project/shopper scope;
- principal Admin canónico/Exact Write V2 y membership/RBAC ya probados;
- `tya-c6-live-user-admin-membership-wiring-v1.js`;
- `cxorbia-exact-identity-contract-v1.js` y matching solo por anclas técnicas exactas;
- HR live authority + protected overlay;
- cumulative read model/portal Shopper canónico;
- source repair Shopper ya PASS pero aún no desplegado/E2E real.

No se reconstruye Auth. Se corrige únicamente su integración/owner único, crosswalk efectivo y paridad source-lock→build→deploy.

## Plan cerrado — 5 iteraciones base

1. `ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION`.
2. `ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`.
3. `ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` — requiere gate DEV write.
4. `ITERACION_4_HR_BIDIRECTIONAL_PHASE_A_E2E_FINANCE` — requiere gate HR/Make cuando aplique.
5. `ITERACION_5_EXACT_BUILD_PREPROD_AND_GO_LIVE` — requiere gates deploy/producción.

No se abre una sexta iteración por rutina. Solo P0 nuevo reproducible o bloqueo externo comprobado puede ampliarla; un gate fallido se corrige focalizadamente dentro de la misma iteración, sin reiniciar plan.

## Durabilidad/no-code

Toda corrección reusable debe ser multi-tenant/multi-proyecto. Cinépolis es configuración del primer proyecto TyA, no lógica global. `CX.data` conserva exactamente su interfaz; las mutaciones pasan detrás a command adapters con RBAC/scope/idempotencia/ACK. Cero localStorage como verdad productiva, cero false-success y providers detrás de adapters/gates.

## Siguiente bloque exacto

`ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION`

Incluye consolidación Auth/runtime sin reproceso, command adapter CX.data, Finance por runtime contract, writer HR gated preparado y tareas P0 frontend quirúrgicas documentadas sobre la MISMA candidata (`app.js` y `modules/misvisitas.js`).

## Gates

Source-only puede avanzar sobre la rama viva. Firestore/Auth/HR/Storage/Make/Gemini writes, cambios de credenciales, deploy, merge y producción requieren gate específico antes de ejecutarse.

## Estado seguro

Sin merge, producción, deploy, cambios de credenciales ni provider writes en este corte documental.
