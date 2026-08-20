# CAMBIOS BACKEND — ADDENDUM I5 IAM AUTH GRANTED / PROVIDER ROUTE BLOCKED

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-IAM-AUTH-GRANTED-ROUTE-BLOCKED-40`

## Cambio ejecutado

Se reconcilió la frontera I5 para eliminar el estado obsoleto `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` como bloqueo vigente.

La autorización administrativa mínima ya fue recibida. No existe evidencia terminal de un IAM write posterior, por lo que permanece disponible y no debe volver a solicitarse ni declararse consumida.

Nuevo bloqueo canónico:

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_GRANTED__PROVIDER_EXECUTION_ROUTE_UNAVAILABLE`

Clasificación: `PROVIDER_CONTROL_PLANE_EXECUTION_ROUTE_BLOCKED`.

## Archivos canónicos tocados en este bloque

- `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
- `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
- addenda I5 de CAMBIOS, Claude, Pendientes y Academia
- PR #7 se sincroniza al mismo epoch.

## Producto preservado

- source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- I1–I4 `PASS/FROZEN`;
- sin cambios frontend/backend runtime;
- sin reproceso Auth/Shopper/Finanzas/multi-proyecto/Academia;
- score formal permanece `85/100`.

## Evidencia y seguridad

Runs previos preservados: `32332125828`, `32332360361`, `32332788919`.

Este bloque ejecutó documentación/estado en GitHub, no provisioning provider. Resultado seguro: 0 nuevos proyectos PREPROD, 0 Hosting PREPROD deploys, 0 UAT, 0 IAM writes posteriores a la nueva autorización, 0 business-data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes, 0 merge, 0 producción.

## Siguiente bloque exacto

`PROVIDER_ADMIN_EXECUTION_ROUTE_READBACK` → capability mínima demostrada bajo autorización vigente → PREPROD limpio → único Hosting del source congelado → UAT read-only.

## Clasificación

- **Reusable CXOrbia:** separación autorización vs. ruta de ejecución provider.
- **Exclusivo TyA:** target `cxorbia-preprod-20260819`.
- **Claude/prototipo:** sin impacto funcional.
- **Academia:** solo continuidad documental.
- **Sin impacto Claude:** provisioning provider.