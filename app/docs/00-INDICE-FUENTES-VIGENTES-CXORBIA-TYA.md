# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 16:17 -06:00
**Estado vivo:** `SHOPPER_P0_SOURCE_FIX_PASS__DEV_REDEPLOY_PENDING__CUTOVER_BLOCKED`

## Fuentes vigentes

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
2. `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json`
3. `app/docs/CAMBIOS-BACKEND.md`
4. `app/docs/PENDIENTES-PROTOTIPO.md`
5. `app/docs/RESUMEN-PARA-CLAUDE.md`
6. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
7. `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`
8. `app/docs/evidence/m10-final-phase-a-freeze-31721769360.json`
9. PR #7.

## Estado operativo prevalente

El P0 humano Shopper fue reproducido y su causa source-level quedó corregida. Run `31749008509` terminó SUCCESS con handoff Auth/HR PASS, identidad exacta PASS, hard fails 0 y cero provider/writes/deploy.

Cinépolis sigue siendo un proyecto operativo configurable. La fuente HR canónica certificada conserva 15 periodos / 660 visitas hasta agosto 2026. El antiguo `14 proyectos` era un error de rotulado del diagnóstico DEV sobre registros de periodo.

El nuevo fix todavía no está desplegado en Hosting DEV. La plataforma oficial TyA permanece sin reemplazar y el cutover real sigue bloqueado.

## Siguiente acción exacta

Deploy único autorizado del HEAD vigente a `cxorbia-backend-dev`, seguido de validación humana Shopper y regresión dirigida Admin/Operaciones/Cliente/Academia. No reabrir identidades ni HR sin nueva evidencia reproducible.
