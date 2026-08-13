# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 16:15 -06:00
**Estado:** `SHOPPER_P0_SOURCE_FIX_PASS__DEV_REDEPLOY_AND_HUMAN_RETEST_PENDING`

## P0 vigente

La causa source-level del bloqueo Shopper quedó corregida y protegida por gate. El portal ahora usa `CX.backendAuth.context()`, espera la autoridad HR y vuelve a renderizar después del handoff final. El diagnóstico DEV distingue el proyecto operativo de los periodos HR y marca Firestore como slice transitorio.

Evidencia PASS: `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json`.

Workflow `31749008509`: SUCCESS, `hardFails=0`, identidad exacta PASS y handoff Auth/HR PASS.

## Pendiente real inmediato

El fix todavía no está en el Hosting DEV que Paula está visualizando. Falta un nuevo deploy DEV autorizado del HEAD vigente y repetir la prueba humana con el mismo Shopper.

La aceptación debe exigir:
- identidad y país correctos;
- histórico real;
- visitas disponibles según semántica canónica;
- Reservas & Asignación;
- Mis Visitas;
- Academia/Certificación;
- Mis Beneficios según alcance real;
- panel DEV mostrando fuente final HR viva + overlay protegido, no el slice Firestore transitorio.

Después se ejecuta regresión humana dirigida Admin/Operaciones/Cliente/Academia sobre el mismo build.

## No reabrir

No rehacer 340 identidades, no deduplicar por nombre, no reimportar HR, no crear candidata, rama o PR nuevos y no rediseñar módulos sin nueva evidencia reproducible.
