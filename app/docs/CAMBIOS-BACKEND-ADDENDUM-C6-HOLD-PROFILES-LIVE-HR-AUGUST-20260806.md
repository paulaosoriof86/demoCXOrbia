# CAMBIOS BACKEND — Addendum C6 perfiles HOLD y HR viva agosto

**Fecha:** 2026-08-06

## Archivos creados o modificados

- `tools/qa/cxorbia-c6-hold-profile-live-hr-readonly.mjs`: probe focal read-only; no logró entregar artifact.
- `.github/workflows/cxorbia-c6-hold-profile-live-hr-readonly.yml`: runner de una sola ejecución; terminó `error` durante salida.
- `backend/config/corte6-hold-profile-live-hr-readonly-request.json`: request congelado, consumido y sin rerun.
- `app/docs/SOURCE-LOCK-C6-HOLD-PROFILES-LIVE-HR-AUGUST-20260806.md`: fuente prevalente del bloque.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`: reconciliado al estado actual.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`: reconciliado.
- `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`: retirado el estado obsoleto V7.2 como estado vivo.
- addenda de Claude, Pendientes, Academia y tracker del mismo bloque.
- PR #7: título/body y comentario de continuidad reconciliados.

## Resultado

- 13 perfiles HOLD identificados de forma exacta por fingerprints: 12 de apellido y 1 empate multi-Auth.
- Los nombres no se recuperaron; no se inventan ni se infieren.
- Se documentó la disposición segura `ARCHIVE_LEGACY_NO_AUTH`, sin borrar histórico.
- Se demostró que agosto fue detectado por el builder bruto pero rechazado por un registry desactualizado tras fallo del metadata provider.
- Se elevó la autoridad HR viva y mutable —incluido el histórico— a requisito P0 de producción.

## Impacto Phase A

Evita que la conciliación de 13 perfiles bloquee indefinidamente el cutover: Paula puede excluir perfiles antiguos del repair Auth sin eliminar su historia. En paralelo, producción permanece bloqueada hasta probar agosto y revisión histórica desde HR viva.

## Clasificación

- **Reusable CXOrbia:** fuente externa viva versionada, last-known-good no autoritativo y archivado sin Auth.
- **Exclusivo TyA:** pestañas mensuales `AGOSTO 26` y `AGOSTO 26 HN`, y los 13 casos HOLD.
- **Claude/prototipo:** indicadores visibles de fuente/revisión/actualización y ausencia de hardcode mensual.
- **Academia:** diferencia entre HR viva, materialización y fallback.
- **Sin impacto Claude:** fingerprints y manejo privado de identidad.

## Estado seguro

Cero writes de datos, Auth, HR, Rules o Storage; cero deploy; cero merge y producción intacta.
