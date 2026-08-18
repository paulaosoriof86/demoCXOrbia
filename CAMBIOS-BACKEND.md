# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 17:26 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-INTEGRAL-PASS-15`  
**Estado:** `I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4_NOT_STARTED`

I3 integral PASS. Staff/Admin final run `32196648462`, job `95901931320`, artifact `9346121436`, digest `sha256:b3ccc4d9e45a6d42b6ab8a0dcb4cf8e9cfbe6b6ea8409c72524347c7df02189d`. `CX.data.__identityMap['shp-57d2e3769946'] === 'TYA_GT_0C0BA8856E'`; agosto canonical `2`; residual `0`; duplicados `0/0`; reload/nueva pestaña estables. Historical Shopper y todos los writes/deploys prohibidos `0`; merge/production false.

Transporte inicial `6fd1f256...` no ejecutó Staff; PR run `32195823892` dejó `staffReadonlyExecuted=false`. Causa: colisión de concurrencia push/PR. Fix reusable `84bd3bc571692074ce9e13fa50264ef17c6b55f2` separa grupos por `github.event_name`; sin cambio de producto/provider.

Request final consumido/disabled en `0ea4bb6d58ba547db2337bd367f10c32f2540e8b`. No repetir I3.

Avance: I1 `15/15`, I2 `20/20`, I3 `25/25`, I4 `0/25`, I5 `0/15` = **60% / 40%**.

Clasificación: Reusable CXOrbia — identityMap exacto + tooling; exclusivo TyA/Cinépolis — IDs/conteos; Claude/prototipo — sin parche UI; Academia — sin cambio funcional visible, sin cambios de manuales/cursos/rutas/notificaciones; Sin impacto Claude inmediato — gates/documentación.

Siguiente bloque exacto: `RECOVER_CANONICAL_I4_SCOPE_FROM_ACTIVE_PLAN_LOCK__NO_EXECUTION_YET`. No ejecutar I4 hasta recuperar su definición exacta del plan canónico vigente.
