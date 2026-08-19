# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-PASS-I4C-FRONTIER-31`

## Validado/preservado
I1/I2/I3/I4-A/I4-B PASS/frozen. HR `15 periodos / 660 visitas`, Historical Shopper, TARGET_B Admin, Finance V2/historical y legal v0.4 no se reprocesan. Progreso formal: **60% completado / 40% pendiente**.

## I4-B — backend real validado
Retry2 run `32305790197` pasó el lifecycle provider-backed sintético completo. ACK, idempotencia, trazas receipt/audit, transiciones y conflicto de versión quedaron probados. Datos reales no cambiaron y el gate quedó consumido/cerrado.

## Frontend / Claude — handoff vivo
No parchear desde backend:
- `app/modules/visita-detalle.js`: postulación → `application.create`, éxito solo con ACK.
- `app/modules/postulaciones.js`: decisiones/cancelación vía command/ACK.
- `app/modules/cuestionario-shopper.js`: submit/score solo después de ACK.
- `app/modules/revision-admin.js`: `visit.review.update` + ACK como verdad.

El backend lifecycle ya está validado; esto no autoriza a inventar proveedor HR, Make ni estado de sincronización exitoso en UI.

## I4-C activo
`I4C_HR_BIDIRECTIONAL_SYNC_READINESS_SOURCE_IMPLEMENTATION`.

Reglas que Claude debe preservar cuando llegue el handoff funcional:
- proyecto configurable; Cinépolis no hard-codeado globalmente;
- Plataforma→HR registra origen plataforma y estado de sync pendiente hasta confirmación;
- HR→Plataforma no duplica asignaciones ya originadas en plataforma;
- matching por `tenantId + projectId + visitId/hrRowId + shopperId`, nunca solo por nombre;
- conflictos visibles/revisables, sin sobrescritura silenciosa.

## Academia
I4-B puede pasar de “pendiente” a “backend lifecycle validado”. I4-C sigue pendiente; no enseñar todavía que HR se sincroniza bidireccionalmente en producción.
