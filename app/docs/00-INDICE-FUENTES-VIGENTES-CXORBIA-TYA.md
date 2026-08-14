# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 18:42 -06:00
**Estado vivo:** `SHOPPER_P0_SOURCE_FIX_DEPLOYED_DEV_PASS__HUMAN_ACCEPTANCE_PENDING__CUTOVER_BLOCKED`

## Fuentes vigentes

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
2. `app/docs/evidence/p0-shopper-auth-hr-dev-redeploy-pass-31758046539.json`
3. `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json`
4. `app/docs/CAMBIOS-BACKEND.md`
5. `app/docs/PENDIENTES-PROTOTIPO.md`
6. `app/docs/RESUMEN-PARA-CLAUDE.md`
7. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
8. `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`
9. `app/docs/evidence/m10-final-phase-a-freeze-31721769360.json`
10. PR #7.

## Estado operativo prevalente

El P0 humano Shopper fue reproducido y su causa source-level quedó corregida. Run `31749008509` terminó SUCCESS con handoff Auth/HR PASS, identidad exacta PASS, hard fails 0 y cero provider/writes/deploy.

El fix Auth→HR ya fue desplegado exactamente una vez en Hosting DEV mediante `CXOrbia C6 DEV Root Entrypoint Hosting`, run `31758046539`, job `94638091029`. El deploy fue exclusivo a `cxorbia-backend-dev`; paridad remota PASS y runtime Staff/Admin read-only PASS con 15 periodos, 660 visitas y agosto 2026 vigente. Artifact `9203525557`, digest `sha256:e17b2b6060e32a9d5d464ad42729421df1d43a44ef718f6a73faae52f3c2959a`.

Cinépolis sigue siendo un proyecto operativo configurable. El antiguo `14 proyectos` era un error de rotulado del diagnóstico DEV sobre registros de periodo.

Producción oficial, merge, dominio oficial, Auth/Firestore/HR/Rules/Storage writes, Make, Gemini y pagos permanecen intactos/cero.

## Siguiente acción exacta

Aceptación humana post-deploy con Shopper real sobre `https://cxorbia-backend-dev.web.app`, verificando identidad, país, histórico, Visitas Disponibles, Reservas & Asignación, Mis Visitas, Academia/Certificación y beneficios. Después, regresión dirigida Admin/Operaciones, Cliente y Academia sobre el mismo build. No reabrir identidades ni HR sin nueva evidencia reproducible.