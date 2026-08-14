# GO-LIVE PROGRESS TRACKER — ROOT-CAUSE PLAN CXORBIA TyA

**Fecha:** 2026-08-14 11:20 -06:00  
**Estado:** `ITERATION_2_CANONICAL_PERSISTENCE_PASS__35_PERCENT__ITERATION_3_NEXT`

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

**35% completado / 65% pendiente para producción.**

### Iteración 1 — PASS (15/15)

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`.

Preservado: Auth owner protegido único efectivo, Finance v2 por runtime contract, command adapter, contrato Shopper Admin, HR writer y source gate I1. No se reprocesa.

### Iteración 2 — PASS (20/20)

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`.

Cierre: `SOURCE_READY_FOR_DEV_WRITE_GATES`.

Evidencia:

- source lock: `app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`;
- workflow existente `CXOrbia Phase A Live Execution Checkpoint`;
- run I2 `31823098359`: **SUCCESS**.

El gate confirmó:

- `CX.data` conserva nombres públicos y su mutación canónica pasa por command boundary;
- `localMutationFallback=false`;
- Shopper localStorage desactivado en runtime canónico;
- provider ACK obligatorio;
- tenant/project/role/shopper scope fail-closed;
- Mis Visitas usa listas completas/facets canónicas;
- controles legacy direct-write no convertidos quedan fail-closed, sin falso éxito;
- contrato multi-tenant/multi-proyecto source-safe;
- provider writes=0, deploy=0, producción=false.

## Iteración 3 — siguiente (25 puntos)

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE`

Requiere gate explícito de writes DEV.

Cierre requerido para llegar a **60%**:

- transporte provider real del command boundary limitado a Shopper/Admin/identidad;
- creación y edición de Shopper desde Admin con Auth + claims + membership + profile/crosswalk;
- Shopper histórico exacto, sin matching por similitud;
- Shopper nuevo puede iniciar sesión;
- persistencia real verificada por provider readback;
- reload/new-tab y segundo contexto;
- cero duplicados/colisiones silenciosas; ambigüedad a review.

## Estado seguro

Provider/Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0. Cambios/reset de credenciales=0. Deploy=0. Merge=false. Producción=false.
