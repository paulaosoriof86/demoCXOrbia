# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 16:18 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-STAFF-PUSH-NAVIGATION-HOLD-07`  
**Estado:** `NO_FRONTEND_PATCH__HOSTING_PARITY_PASS__STAFF_NAVIGATION_HARNESS_HOLD__GO_LIVE_35`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**. I3 integral PASS → **60% / 40%**.

## Qué ya quedó cerrado

- R3-C Hosting DEV: `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`, run `32185940998`.
- Adapter corregido servido en DEV con byte parity y contrato `materialized + tenant_adjudication`, `fuzzyMatching:false`.
- Rules I3.11C ya verificadas y consumidas; no redeploy.
- Historical Shopper e I3.9/I3.10 siguen frozen.

## Staff post-Hosting — HOLD no adjudica frontend

La lectura Staff/Admin única autorizada sí se ejecutó: run `32188716203`, job `95878165921`, artifact `9343461375`.

El navegador no alcanzó login ni app state. Falló en la primera navegación al esperar `DOMContentLoaded` durante 60 s; artifact `lastState=null`.

Por eso no existe observación válida en este run sobre:
- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`;
- las dos visitas de agosto;
- postulación/legal del runtime actual.

Los FAIL derivados de I3.4/I3.5/I3.7 no son nuevas regresiones de producto: el runtime no llegó a montarse. I3.6 Historical Shopper reuse permaneció PASS.

## No hacer en frontend

- no tocar `/app/modules` ni `/app/core` para este bloqueo;
- no hardcodear `TYA_GT_0C0BA8856E`;
- no remapear identidad desde módulos;
- no esconder visitas residuales;
- no reconstruir identidad por nombre/email/teléfono;
- no crear Admin/Shopper alterno;
- no modificar UI para compensar un timeout del harness QA.

## Siguiente bloque backend/QA

`SOURCE_ONLY_STAFF_NAVIGATION_HARNESS_HARDENING_NO_PROVIDER`.

Solo se corregirá el harness reutilizable para desacoplar navegación HTTP de `DOMContentLoaded` y usar readiness visible/runtime como criterio, con mejor evidencia de transporte. Source/static only; sin Staff/provider, writes, deploy, merge o producción.

Después de source PASS será necesaria una sola nueva autorización Staff/Admin read-only para observar canonical + agosto. No se repiten R3-A/R3-B/R3-C ni Historical Shopper.

## Preservar

- interfaz exacta `CX.data`;
- identidad exacta/crosswalk, sin fuzzy;
- Staff/Admin existente;
- Historical Shopper frozen;
- multi-tenant `tenantId/projectId`;
- Cinépolis proyecto configurable, nunca global;
- Hosting DEV corregido ya materializado;
- Rules ya desplegadas y consumidas.

## Clasificación

- **Reusable CXOrbia:** hardening de harness de navegación/readiness.
- **Exclusivo TyA/Cinépolis:** IDs y target de las dos visitas de agosto.
- **Claude/prototipo:** sin cambio UI.
- **Academia:** sin cambio funcional inmediato.
- **Sin impacto Claude inmediato:** corrección del QA harness.
