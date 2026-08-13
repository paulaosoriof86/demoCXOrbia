# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 13:29 -06:00
**Estado vivo:** `HUMAN_SHOPPER_P0_OPEN__READONLY_DIAGNOSTIC_FAILED__STOP_RETRY__REAL_TYA_CUTOVER_NOT_EXECUTED`

## Fuentes vigentes

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
2. `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`
3. `app/docs/evidence/p0-human-shopper-readonly-run-failure-31735473752.json`
4. `app/docs/CAMBIOS-BACKEND.md`
5. `app/docs/PENDIENTES-PROTOTIPO.md`
6. `app/docs/RESUMEN-PARA-CLAUDE.md`
7. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
8. `app/docs/evidence/owner-visible-dev-validation-lab-20260813.json`
9. `app/docs/evidence/m10-final-phase-a-freeze-31721769360.json`
10. PR #7.

## Estado operativo prevalente

La aceptación humana del Shopper encontró un P0 reproducible: el login funciona, pero la sesión no resuelve al read model operacional esperado. El diagnóstico focal autorizado se ejecutó una vez y falló sin persistir causa raíz; el intento quedó cerrado con `STOP_RETRY` y el request neutralizado. No hubo segundo intento.

M1–M10 preservan el 100% de calificación técnica DEV, pero no certifican el flujo Shopper humano. La plataforma actual de TyA permanece sin reemplazar y el cutover real continúa bloqueado.
