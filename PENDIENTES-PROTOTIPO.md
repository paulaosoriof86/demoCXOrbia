# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 17:26 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-INTEGRAL-PASS-15`  
**Estado:** `NO_UI_WORKAROUND__I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4_SCOPE_RECOVERY_NEXT`

## I3 — cerrado / no pendiente

I3 quedó **25/25 PASS integral** y congelado.

Evidencia final Staff/Admin:
- run `32196648462`;
- job `95901931320`;
- artifact `9346121436`;
- digest `sha256:b3ccc4d9e45a6d42b6ab8a0dcb4cf8e9cfbe6b6ea8409c72524347c7df02189d`;
- event `push`, attempt `1`;
- `PASS_READONLY_POST_GATES`;
- `staffReadonlyExecuted=true`.

Acceptance cerrada:
- identityMap `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- reload/nueva pestaña estables;
- Historical Shopper access `0`;
- todos los writes/deploys prohibidos `0`;
- merge/production false.

Request I3 consumido/disabled en `0ea4bb6d58ba547db2337bd367f10c32f2540e8b`. No repetir.

## Hallazgo metodológico cerrado

El primer transporte final Staff (`6fd1f256...`) no ejecutó Staff porque `push` y `pull_request` compartían la misma clave de concurrencia. El duplicado PR run `32195823892` dejó `staffReadonlyExecuted=false` y seguridad completa en cero.

Fix reusable `84bd3bc571692074ce9e13fa50264ef17c6b55f2`: la clave de `concurrency` incluye `github.event_name`. No cambia producto/UI/provider.

## Pendiente vivo

- I4 `0/25`.
- I5 `0/15`.
- **40% restante**.

No existe pendiente vivo de identityMap, autenticación Staff, Historical Shopper, Rules o Hosting dentro de I3.

## Siguiente acción exacta

`RECOVER_CANONICAL_I4_SCOPE_FROM_ACTIVE_PLAN_LOCK__NO_EXECUTION_YET`.

Motivo: el source lock anterior indicaba únicamente “pasar a I4” si I3 cerraba PASS, pero no fija en ese documento el subgate I4 exacto. Debe recuperarse de la fuente canónica vigente antes de tocar código, provider o datos.

## No hacer

- No reabrir I3.
- No crear otro Admin ni Shopper.
- No password reset/recovery.
- No provider identity repair.
- No Rules redeploy.
- No otro Hosting identityMap deploy.
- No parche UI.
- No nueva candidata/rama/PR/metodología.
- No merge ni producción.

## Claude / Academia

No hay bug frontend derivado de I3 pendiente para Claude. Academia no requiere cambio funcional por este cierre; solo registrar que I3 ya está congelado. Cualquier tarea nueva depende del alcance real de I4.
