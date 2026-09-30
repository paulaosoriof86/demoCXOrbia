# CAMBIOS BACKEND — V159 EMPALME DIRECTO Y PLAN REVALIDADO

Fecha: 2026-07-17

## Qué se hizo

- Se ejecutó `APPLY_DELTA_DIRECTLY` sobre `docs-tya-v6-v71-audit`.
- Se aplicaron runtime, módulos y evidencias históricas de V159.
- Se preservó `app/modules/importador.js` con `CX.dataSource.sourceContract()`.
- Se generaron manifest, build-lock y verificador V159.
- Se revalidó el plan Phase A después del empalme.
- Se actualizó `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md` sin crear otro plan paralelo.
- Se actualizó el checkpoint y tracker V159 al estado post-empalme.

## Diagnóstico del plan

No corresponde empezar de cero. El plan anterior tenía el eje correcto, pero estaba desactualizado porque:

- seguía nombrando V79;
- mantenía como pendientes iniciales revisión admin, submitido, wizard, Auth readiness e import/sync validators;
- no distinguía piezas ya preparadas de activaciones todavía bloqueadas;
- no contemplaba que la URL DEV validada correspondía a V131/R18D y no a V159.

## Secuencia vigente

1. Cierre post-empalme V159 exacto.
2. Freeze `ACTIVE_BASELINE` después de smoke y validación visual.
3. Firebase nuevo y vacío.
4. `CX.data` read-only.
5. Materialización DEV controlada.
6. Auth/RBAC/rules.
7. Finanzas y certificaciones.
8. HR sync/evidencias.
9. GO/NO GO y producción.

## Preservación

- Backend, contratos, adapters, tools y overlays TyA.
- `CX.data` con tenant/proyecto/periodo separados.
- Finanzas con estados no inventados.
- Cinépolis como proyecto configurable.
- HR, histórico, shoppers, postulaciones, certificaciones y liquidaciones/pagos.
- ReviewQueue, rollback, auditoría y gates existentes.

## Clasificación

- Reusable CXOrbia: plan por activación progresiva, adapter portable y materialización gated.
- Exclusivo cliente: conteos, junio, GT/HN y overlays TyA/Cinépolis.
- Claude/prototipo: V159 aplicada; no pedir V160 por rutina.
- Academia: actualizar rutas por rol, proyecto/periodo, import, sync, pagos y estados de integración.
- Sin impacto Claude: Firebase limpio, provider, materialización, Auth/rules y producción.

## Estado

`EMPALMED_PENDING_POST_GATES`

Sin merge, producción, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
