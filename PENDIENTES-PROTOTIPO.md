# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-15 14:17 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST06_HISTORICAL_PASS_FROZEN__ADMIN_NEW_SHOPPER_STOP_RETRY_BEFORE_COMMAND__ADMIN_RESUME_SOURCE_GATE_PASS__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR. I1/I2 cerradas. I3 continúa en la misma candidata.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Lock I3 actual: `app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-PASS-ADMIN-RESUME-SOURCE-GATE-PASS-20260815.md`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

Auth owner/exact identity/Staff membership, I1, I2 provider ACK/fail-closed, Mis Visitas, protected HR authority, overlay DEV, harness legal-gate-aware y **subgate histórico request06 ya congelado**.

## Request `...-06` — cerrado parcialmente con evidencia real

Run `31906391682`, job `95064802332`.

### Histórico — PASS

- un reset del mismo UID histórico exacto;
- UID/claims/profile/membership/crosswalk/history preservados;
- login real + HR authority + history E2E PASS;
- Firestore historical reconciliation `0` writes;
- other identities `0`;
- fuzzy `false`.

Checkpoint canónico:
`app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

**Pendiente eliminado:** no volver a probar/resetear la identidad histórica. Todo request futuro usa el checkpoint read-only y `passwordResets=0`.

## NDA / Academia

NDA/confidencialidad está pendiente y visible; no se automatizó aceptación. Academia y Certificación quedaron diferidas por el gate legal y no se declaran PASS.

Pendiente humano real posterior: aceptación legal del Shopper en su flujo normal. No resolver mediante QA ni backend automático.

## Administración / Shopper nuevo — pendiente vivo

El botón `#shNew` existía pero permaneció oculto durante el E2E, antes del click y antes de emitir `shopper.create`.

Código:
`I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`.

Resultado:

- Shopper nuevo `NO CREADO`;
- Auth/Firestore writes del nuevo Shopper `0/0`;
- update `NO`;
- provider readback `SKIPPED`.

## Corrección focal ya aplicada

La causa demostrada fue una carrera del harness: membership Admin estaba lista antes de finalizar el handoff asíncrono del frontend.

Source-only fix:

1. E2E espera `frontend handoff=entered`, HR authority, app visible y login oculto.
2. Después navega a Shoppers y espera `session.view='shoppers'`.
3. Workflow futuro queda Admin/new-Shopper-only y `passwordResets=0`.
4. Frozen historical checkpoint se verifica antes de provider y no se repite.
5. Gate source-only `31906801917` / `95065826139`: `SUCCESS`.

## Pendiente prototipo / Claude

**No abrir una tarea de rediseño UI por `#shNew` todavía.** No se demostró que el botón esté funcionalmente oculto después del handoff canónico; el defecto reproducido corresponde al orden del harness.

Solo si una futura ejecución Admin-only, ya esperando `frontend handoff=entered` + `session.view='shoppers'`, vuelve a mostrar el botón oculto, registrar P0 frontend focal por archivo/módulo. No nueva candidata ni reauditoría general.

## Pendiente I3 real

1. Autorización expresa para request `...-07`; no rerun de request06.
2. Reutilizar checkpoint histórico read-only; cero credencial histórica y `passwordResets=0`.
3. Admin create/update de un único Shopper nuevo por provider ACK.
4. Auth + claims + membership + profile/shopper + crosswalk.
5. Provider readback.
6. Nuevo Shopper login + reload/new-tab + segundo contexto.
7. Cero fuzzy, otras identidades, consentimiento automatizado y providers prohibidos.

## Academia / manuales / cursos

- No modificar contenidos por una corrección de harness.
- Mantener documentado que Academia y Certificación están diferidas mientras el NDA esté pendiente.
- No simular completitud de rutas por rol.
- Cuando el consentimiento humano real ocurra en validación funcional posterior, reanudar las rutas sin perder el checkpoint Auth/history ya certificado.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST07_ADMIN_NEW_SHOPPER_ONLY_AFTER_FROZEN_HISTORICAL_PASS`.
