# SOURCE LOCK — ITERATION 3 REQUEST07 ADMIN OVERLAY STOP_RETRY + OVERLAY-AWARE SOURCE GATE — 2026-08-15

**Estado:** `LOCKED__REQUEST07_ADMIN_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE__ZERO_NEW_PROVIDER_WRITES__HISTORICAL_PASS_FROZEN__OVERLAY_AWARE_SOURCE_GATE_PASS__REQUEST08_GATE_REQUIRED`

## Carril exacto

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata: `docs-tya-v6-v71-audit`
- PR: #7 draft/open/no merge
- Firebase DEV: `cxorbia-backend-dev`
- Request07 commit: `2ebc85af6c4becee15a93de8a8726cbc295464c3`
- Provider run: `31907732888`
- Provider job: `95068062981`
- Parking commit: `6fb758130378adef1c14b6a2f1a1b22a8db87ca4`
- Source-only gate posterior: run `31908665710`, job `95070327022`, resultado `SUCCESS`
- Source HEAD del gate: `1e313d6f4d689ac01623f4bce90da5828f25f717`

## 1. Histórico I3 preservado

Request07 no repitió ni accedió a la credencial histórica. El checkpoint congelado de run `31906391682` permanece autoridad read-only:

`app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`

Se preservan exact identity, UID, claims, profile, membership, crosswalk, historia, login real, HR authority e history E2E. `passwordResets=0` en request07 y en toda continuación futura.

## 2. Request07 — avance y STOP_RETRY exacto

El fix anterior funcionó: el Admin completó el handoff canónico y `#shNew` llegó a estar visible, enabled y stable. Por tanto queda cerrado el blocker previo `I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`.

El nuevo bloqueo reproducible ocurrió al intentar el click:

`I3_ADMIN_NEW_SHOPPER_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE`

Playwright registró que un `<div class="cx-ov">…</div>` interceptaba los pointer events durante el intento de `#shNew`.

El fallo ocurrió antes de completar el click y antes de `shopper.create`:

- Shopper nuevo creado: `NO`
- nuevos Auth writes: `0`
- nuevos Firestore writes: `0`
- update: `NO`
- provider readback: `SKIPPED`
- login/reload/new-tab/segundo contexto del nuevo Shopper: `NO EJECUTADO`
- password resets: `0`
- otras identidades: `0`
- HR/Rules/Storage/Make/Gemini/pagos writes: `0`
- deploy: `0`
- merge: `false`
- producción: `false`

Request07 quedó consumido y parked; no rerun ni segundo intento automático.

## 3. Causa y límites de evidencia

`.cx-ov` es infraestructura modal legítima. No se autoriza deshabilitar globalmente pointer events ni usar `force:true`.

La evidencia de request07 no permite afirmar qué modal concreto estaba visible porque ese run no congeló estructura source-safe del overlay. Por eso no se clasifica retrospectivamente como NDA ni como banner.

La fuente sí permite distinguir de forma segura:

1. gate legal/confidencialidad pendiente -> STOP fail-closed, sin aceptar/firmar/guardar/automatizar consentimiento;
2. recordatorio informativo no legal con contrato exacto `#bnOk` -> se puede reconocer mediante ese botón normal y continuar;
3. cualquier overlay desconocido -> STOP fail-closed.

## 4. Corrección source-only aplicada

- `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`: clasificador estructural de overlays antes de Alta; cero texto sensible; gate legal fail-closed; `#bnOk` como único banner informativo reconocible; overlay desconocido fail-closed; `forceClickUsed=false`.
- `tools/qa/cxorbia-i3-source-patcher.mjs`: lineage exacta desde request07 + `I3_ADMIN_NEW_SHOPPER_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE`.
- `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`: mismo workflow, Admin/new-Shopper-only, frozen checkpoint, `passwordResets=0`, no historical credential, overlay policy source-checked.
- `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`: gate independiente para overlay-aware harness/lineage/frozen history.

## 5. Gate independiente — PASS

Run `31908665710`, job `95070327022`: `SUCCESS` completo.

PASS: I1, I2, frozen historical checkpoint, historical legal-gate-aware harness, Admin canonical handoff, overlay-aware classifier, legal fail-closed, informational banner contract, no force-click, request07 lineage, `passwordResets=0` y checkpoint verifier.

Este gate fue source-only: cero provider credentials/writes/resets/deploy/merge/producción.

## 6. Preservar / no reprocesar

- I1 PASS 15/15.
- I2 PASS 20/20.
- Histórico I3 PASS congelado; no reset/reconcile/credential access.
- Misma candidata, rama y PR.
- NDA humano; no autoaceptación.
- No rediseñar UI por un overlay no clasificado.
- No `force:true` ni desactivar `.cx-ov` globalmente.

## 7. Avance

**GO-LIVE permanece 35% completado / 65% pendiente. I3 sigue 0/25 hasta cierre integral.**

Solo permanece vivo Admin/new Shopper dentro de I3. Al cerrar I3, el avance será 60% / 40%.

## 8. Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST08_OVERLAY_AWARE_ADMIN_NEW_SHOPPER_ONLY`

Request08 debe continuar exclusivamente desde request07, reutilizar read-only el checkpoint histórico, `passwordResets=0`, no acceder a credencial histórica y autorizar solo un Shopper nuevo. Antes del Alta: legal pending => STOP; únicamente `#bnOk` informativo puede reconocerse normalmente; overlay desconocido => STOP. Luego create/update por provider ACK, Auth/claims/membership/profile/crosswalk, readback, login/reload/new-tab/segundo contexto. Cero fuzzy, otras identidades, providers prohibidos, deploy, merge o producción; sin retry automático.
