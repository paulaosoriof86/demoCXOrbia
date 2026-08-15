# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-15 14:17 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST06_HISTORICAL_PASS_FROZEN__ADMIN_NEW_SHOPPER_STOP_RETRY_BEFORE_COMMAND__ADMIN_RESUME_SOURCE_GATE_PASS__GO_LIVE_35__NO_PRODUCTION`

## Request I3 `...-06`

Misma candidata `docs-tya-v6-v71-audit` / PR #7. Request commit `701fedc184ccc98e08e7444adc0f04cd54247fce`; run `31906391682`; job `95064802332`.

### Subgate histórico — PASS real

El gate llegó a provider y ejecutó exactamente lo autorizado:

- mismo Shopper histórico por identidad técnica exacta;
- un único credential reset sobre el mismo UID;
- Auth password update `1`;
- claims/profile/membership/crosswalk/history preservados;
- Firestore reconciliation histórica `0` writes;
- login real + protected HR authority + historia E2E PASS;
- other identities modified `0`;
- fuzzy matching `false`.

Evidencia congelada:
`app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

Este PASS queda cerrado y no se repite. Toda continuación futura usa solo el checkpoint source-safe y `passwordResets=0`.

### Gate legal / Academia

El Shopper histórico quedó en `legal-gate-pending`. Diálogo legal visible; `acceptanceAutomated=false`; Academia y Certificación diferidas. No hubo aceptación, firma, guardado ni simulación de consentimiento.

## Administración / Shopper nuevo — STOP_RETRY

Después del PASS histórico se inició el command provider y el E2E Admin. Falló esperando `#shNew` visible: el botón existía en DOM pero permanecía oculto.

Código de clasificación:
`I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`.

El fallo fue antes del click y antes de `shopper.create`:

- Shopper nuevo: `NO CREADO`;
- Auth writes nuevo Shopper: `0`;
- Firestore writes nuevo Shopper: `0`;
- update: `NO`;
- provider readback: `SKIPPED`;
- HR/Rules/Storage/Make/Gemini/pagos `0`;
- deploy `0`;
- merge=false;
- production=false.

Request06 consumido/parked. Commit `05ac40c6376671fac5176cd6ff0d9cce7cc0ac83`. No rerun ni segundo intento automático.

## Corrección source-only posterior

### `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`
Commit `e5b93412e6cf7716c3eed946dc7502215c9a6c1b`.

- espera `CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF.status='entered'`;
- exige membership verificada, HR authority aplicada, app visible y login oculto;
- navega a Shoppers solo después del handoff;
- espera `CX.session.view='shoppers'` antes de `#shNew`;
- evidencia `adminFrontendHandoffAwaited=true`.

### `tools/qa/cxorbia-i3-source-patcher.mjs`
Commit `8438609a0cfa423cc977ca1dc21e10e86bbde787`.

- prearma solo `admin_new_shopper_resume`;
- lineage exacta desde request06 + `I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`;
- no abre camino a repetir credential recovery.

### `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`
Commit `cc06a01570c568f839bc93e50bffd361de396887`.

- workflow existente reutilizado, no workflow nuevo;
- futuro gate limitado a Admin/new Shopper;
- verifica frozen historical checkpoint antes de provider credentials;
- `passwordResets=0`;
- Admin-only private selection;
- no acceso a credencial histórica;
- failure parking preserva histórico sin reabrirlo.

### `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`
Commit `5971413f13ca5d6fbdd878e5c1d379f2ab5a22c9`.

Gate source-only run `31906801917`, job `95065826139`: `SUCCESS` en I1, I2, frozen historical checkpoint, historical harness, Admin E2E/handoff, patcher, Admin-only lineage y checkpoint verifier. Cero provider writes/resets/deploy/merge/producción.

### Documentación

Nuevo lock prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-PASS-ADMIN-RESUME-SOURCE-GATE-PASS-20260815.md`.

Checkpoint, tracker, índice, RESUMEN-PARA-CLAUDE y PENDIENTES se reconcilian al mismo estado.

## Clasificación

- **Reusable CXOrbia:** readiness E2E debe esperar el frontend handoff canónico completo, no membership aislada; subgates certificados se congelan para evitar writes repetidos.
- **Exclusivo TyA:** el reset histórico único pertenece al Shopper exacto TyA/Cinépolis ya resuelto.
- **Claude/prototipo:** no se demostró defecto UI; no rediseñar Shoppers. El botón oculto fue una carrera del harness hasta nueva evidencia reproducible.
- **Academia:** gate NDA humano; Academia/Certificación diferidas, no PASS.
- **Sin impacto Claude:** workflow, source patcher, frozen checkpoint y QA.

## Porcentaje

**35% completado / 65% pendiente. I3 sigue 0/25 hasta PASS integral.**

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST07_ADMIN_NEW_SHOPPER_ONLY_AFTER_FROZEN_HISTORICAL_PASS`.

Request07, si Paula lo autoriza, debe ser Admin/new-Shopper-only, reutilizar el checkpoint histórico read-only y llevar `passwordResets=0`.