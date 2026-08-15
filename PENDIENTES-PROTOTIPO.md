# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-15 15:14 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST07_ADMIN_OVERLAY_STOP_RETRY_BEFORE_CREATE__OVERLAY_AWARE_SOURCE_GATE_PASS__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR. I1/I2 cerradas. I3 continúa únicamente por Admin/new Shopper.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Lock I3 actual: `app/docs/SOURCE-LOCK-ITERATION3-REQUEST07-ADMIN-OVERLAY-STOP-RETRY-OVERLAY-AWARE-SOURCE-GATE-PASS-20260815.md`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

Auth owner/exact identity/Staff membership, I1/I2, Mis Visitas, protected HR authority, histórico request06 congelado, credential reset histórico, harness legal-gate-aware. Toda continuación lleva `passwordResets=0` y no accede a credencial histórica.

## Request07 — resultado

Run `31907732888`, job `95068062981`.

El pendiente anterior `#shNew hidden` queda eliminado: el botón llegó visible/enabled/stable. El nuevo bloqueo fue un `.cx-ov` interceptando pointer events antes del click completo y antes de `shopper.create`:

`I3_ADMIN_NEW_SHOPPER_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE`.

Shopper nuevo `NO CREADO`; nuevos Auth/Firestore writes `0/0`; update/readback/login nuevo no ejecutados; password resets `0`; otros providers `0`.

## Corrección focal ya aplicada

1. No `force:true` ni deshabilitar `.cx-ov` globalmente.
2. Gate legal/confidencialidad Admin pendiente => STOP fail-closed sin consentimiento automático.
3. Solo el banner informativo de contrato exacto `#bnOk` puede reconocerse mediante click normal.
4. Overlay desconocido => STOP fail-closed.
5. Patcher/workflow prearman request07 lineage Admin-only con frozen historical checkpoint y `passwordResets=0`.
6. Gate source-only `31908665710` / `95070327022`: `SUCCESS` completo.

## Pendiente prototipo / Claude

No abrir rediseño UI por el `.cx-ov`: request07 no identificó qué modal concreto era. Clasificar primero por contrato fuente. Si la futura ejecución demuestra un defecto de producto después de resolver/descartar correctamente el overlay, registrar P0 focal por archivo/módulo, sin nueva candidata ni reauditoría.

## Pendiente I3 real

1. Request08 nuevo; no rerun request07.
2. Frozen histórico read-only, cero credencial histórica, `passwordResets=0`.
3. Overlay pre-Alta: legal => STOP; `#bnOk` informativo => reconocer; desconocido => STOP.
4. Admin create/update de un único Shopper nuevo por provider ACK.
5. Auth + claims + membership + profile/shopper + crosswalk.
6. Provider readback.
7. Login + reload/new-tab + segundo contexto.
8. Cero fuzzy, otras identidades, consentimiento automatizado y providers prohibidos.

## Academia / manuales / cursos

Histórico: NDA/confidencialidad pendiente y visible, `acceptanceAutomated=false`; Academia/Certificación diferidas, no PASS. Ningún QA/backend debe simular consentimiento humano.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST08_OVERLAY_AWARE_ADMIN_NEW_SHOPPER_ONLY`.
