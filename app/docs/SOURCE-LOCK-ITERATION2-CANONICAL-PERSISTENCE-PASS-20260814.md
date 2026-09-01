# SOURCE LOCK — ITERATION 2 CANONICAL PERSISTENCE PASS — 2026-08-14

**Estado:** `LOCKED__PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE__SOURCE_READY_FOR_DEV_WRITE_GATES`

## Repo / candidata / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata canónica única: `docs-tya-v6-v71-audit`
- PR: `#7` draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`
- HEAD de inicio de Iteración 2: `7373ad9678b4244589cfdc4cce76842a046c4c28`
- Commit del gate I2 ejecutado: `3f4b1ae39bde4a57973f9cd8a8987dd5bc527c8e`
- Commit que actualiza el verificador operativo para reconocer I2: `3f0b9c7a81e76012bfcadf54d5b8f68f87680d2d`

Los commits documentales posteriores pueden mover el HEAD de la misma rama sin invalidar este lock. La línea fuente de I2 no puede sustituirse por otra candidata, rama o reconstrucción.

## Evidencia de gate

Workflow existente: `CXOrbia Phase A Live Execution Checkpoint`.

Run: `31823098359`.

Resultado: **SUCCESS**.

Markers PASS observados:

- `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`
- `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`
- `PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT_FORENSIC_PLAN`

La salida del gate I2 certificó:

- `sourceReadyForDevWriteGates=true`;
- nombres públicos de `CX.data` preservados;
- `localMutationFallback=false`;
- `shopperLocalStorageCanonical=false`;
- Mis Visitas con listas completas y facets canónicas;
- provider ACK obligatorio;
- legacy direct UI writes fail-closed;
- contrato multi-tenant/multi-project;
- provider writes=0;
- deploys=0;
- production=false.

## Archivos fuente I2

- `app/adapters/cxorbia-command-adapter-v1.js`
- `app/adapters/cxorbia-shopper-admin-command-contract-v1.js`
- `app/adapters/cxorbia-hr-write-adapter-contract-v1.js` (preservado de I1 y cargado por el entrypoint canónico)
- `app/adapters/cxorbia-cxdata-command-boundary-v1.js`
- `app/adapters/cxorbia-canonical-write-firewall-v1.js`
- `app/core/shoppers-store.js`
- `app/modules/misvisitas.js`
- `app/index-backend-dev.html`
- `tools/qa/verify-root-cause-correction-iteration1.mjs`
- `tools/qa/verify-root-cause-correction-iteration2.mjs`
- `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`
- `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`

## Contrato cerrado de persistencia

En runtime canónico:

`CX.data -> canonical command boundary -> RBAC/scope -> provider transport gated -> provider ACK -> refresh`

Con gate cerrado:

`blocked -> cero mutación local -> cero localStorage como verdad -> cero success UI`.

El antiguo patrón local-first de `backend-firebase.wrapDataMethods()` y los restores del guard read-only quedan históricamente preservados para compatibilidad/lectura, pero no son propietarios finales de mutación en el entrypoint canónico.

## Mis Visitas

El P0 forense de `find()` por estado quedó cerrado en fuente:

- shopperId exacto fail-closed;
- arrays completos;
- facets canónicas;
- histórico coherente con contrato de visita/pago;
- schedule/realizada/reprogramación/cancelación dependen de command adapter y ACK;
- check-in no muta la visita local; Storage sigue pendiente y explícito.

## Controles legacy aún no convertidos

No se declaran funcionales antes del provider write gate. En la candidata canónica, los flujos legacy que aún mutaban objetos/closure/localStorage directamente quedan fail-closed para impedir falsa persistencia. Entre ellos: edición/reasignación compleja de Postulaciones, submit de cuestionario y mutaciones de Reservas que todavía requieren su conversión/activación ACK-aware en I3/I4.

Esto es una medida de integridad, no un segundo backend ni una solución paralela.

## Seguridad

Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0. Cambios/reset de credenciales=0. Deploy=0. Merge=false. Producción=false.

## Siguiente bloque exacto

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE`.

I3 requiere autorización/gate explícito de writes DEV. No reconstruye Auth: activa y prueba el contrato existente para Shopper Admin + Auth/claims/membership/profile/crosswalk, Shopper histórico y Shopper nuevo, con reload/new-tab/segundo contexto y provider readback.
