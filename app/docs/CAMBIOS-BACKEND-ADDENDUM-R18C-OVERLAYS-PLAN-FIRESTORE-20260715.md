# CAMBIOS BACKEND — R18C OVERLAYS EXISTENTES EN PLAN FIRESTORE

Fecha: 2026-07-15

## Archivos creados

- `tools/migration/tya-phase-a-apply-existing-overlays-to-materialization-plan.mjs`
- `app/docs/PHASE-A-R18C-OVERLAYS-EXISTENTES-PLAN-FIRESTORE-RESULT-20260715.md`

## Archivos actualizados

- `tools/migration/tya-phase-a-firestore-materialization-plan-validate.mjs`
- `.github/workflows/cxorbia-phase-a-firestore-materialization-plan.yml`

## Resultado

- Se reutilizaron los outputs aprobados R11D/R14C/R18B; no se recalcularon shoppers ni finanzas.
- Se aplicaron 196 enlaces exactos a visitas y 196 a liquidaciones.
- Se preservaron 92 revisiones financieras y 1 revisión shopper.
- Pagos y certificaciones continúan fail-closed.
- Workflow `29424007188`: PASS completo.

## Clasificación

- Reusable CXOrbia: aplicación determinística de overlays ya aprobados a un plan de materialización.
- Exclusivo cliente: conteos TyA/Cinépolis y outputs R11D/R14C.
- Claude/prototipo: sin modificación requerida.
- Academia: registrar diferencia entre control financiero exacto y pago confirmado.
- Sin impacto Claude: workflow, hashes y lotes dry-run.

Sin runtime frontend, writes, import, deploy, producción, proveedores, pagos ni datos sensibles.
