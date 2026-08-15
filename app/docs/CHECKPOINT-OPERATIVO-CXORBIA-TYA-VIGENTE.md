# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-15 14:17 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST06_HISTORICAL_SUBGATE_PASS_FROZEN__ADMIN_NEW_SHOPPER_STOP_RETRY_BUTTON_HIDDEN_BEFORE_COMMAND__ADMIN_RESUME_SOURCE_GATE_PASS__GO_LIVE_35__REQUEST07_GATE_REQUIRED`

## Autoridad

Auditoría forense + `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md` + I1/I2 PASS + **`SOURCE-LOCK-ITERATION3-HISTORICAL-PASS-ADMIN-RESUME-SOURCE-GATE-PASS-20260815.md`** + tracker vigente.

`NO REPROCESO`: no diagnóstico general, nueva candidata, rama/PR, Auth rebuild ni repetición del subgate histórico ya congelado.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

## I1/I2

I1 PASS 15/15. I2 PASS 20/20. No reprocesar.

## I3 request06 — subgate histórico PASS

Request `cxorbia-i3-shopper-persistence-20260814-06`, commit `701fedc184ccc98e08e7444adc0f04cd54247fce`, run `31906391682`, job `95064802332`.

PASS antes de Administración:

- mismo Shopper histórico exacto;
- un único credential reset sobre el mismo UID;
- UID/claims/profile/membership/crosswalk/historia preservados;
- login real + protected HR authority + history E2E PASS;
- Firestore reconciliation histórica: `0` writes;
- otras identidades: `0`;
- fuzzy matching: `false`.

Checkpoint congelado:
`app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

**Este subgate no se repite. Todo request futuro lleva passwordResets=0 y no accede a la credencial histórica.**

## Gate legal / Academia

El Shopper histórico quedó en `legal-gate-pending`: diálogo soportado, pendiente y visible; `acceptanceAutomated=false`.

Academia y Certificación quedaron diferidas por el gate legal. No se aceptó, firmó, guardó ni simuló consentimiento y esas rutas no se declaran PASS.

## I3 request06 — Administración/new Shopper STOP_RETRY

Después del PASS histórico se inició el command provider. El E2E de Administración falló esperando `#shNew`: el botón existía en DOM pero permaneció oculto durante 20 segundos.

Clasificación exacta:
`I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`.

El fallo ocurrió **antes del click y antes de cualquier comando `shopper.create`**. Por tanto:

- Shopper nuevo creado: `NO`;
- Auth writes de Shopper nuevo: `0`;
- Firestore writes de Shopper nuevo: `0`;
- update Shopper nuevo: `NO`;
- provider readback nuevo: `SKIPPED`;
- HR/Rules/Storage/Make/Gemini/pagos writes: `0`;
- deploy: `0`;
- merge=false;
- production=false.

Request06 quedó consumido/parked; no rerun ni segundo intento automático. Commit de parking: `05ac40c6376671fac5176cd6ff0d9cce7cc0ac83`.

## Causa focal y corrección source-only

La membership Admin podía quedar verificada antes de finalizar el handoff asíncrono `finalizeStaffFrontend() -> CX.app.enter() -> app visible -> frontend handoff=entered`. El E2E navegaba a Shoppers demasiado pronto.

Corrección:

1. `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs` espera el frontend handoff canónico `entered`, HR authority, `#app.on` y `#login.hidden`; después navega y espera `CX.session.view='shoppers'`.
2. `tools/qa/cxorbia-i3-source-patcher.mjs` prearma solo `admin_new_shopper_resume` desde request06.
3. El workflow I3 existente quedó limitado al subgate Admin/new Shopper y exige `passwordResets=0`; verifica el checkpoint histórico antes de provider credentials y no vuelve a cargar credencial histórica.
4. No se creó workflow, rama, PR ni candidata nuevos.

Gate source-only independiente: run `31906801917`, job `95065826139`, HEAD `5971413f13ca5d6fbdd878e5c1d379f2ab5a22c9`: `SUCCESS` completo, sin provider credentials/writes.

## Iteraciones siguientes

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` sigue abierta únicamente por Admin/new Shopper. Luego permanecen `ITERACION_4_HR_BIDIRECTIONAL_PHASE_A_E2E_FINANCE` y `ITERACION_5_EXACT_BUILD_PREPROD_AND_GO_LIVE`.

## Avance

**35% completado / 65% pendiente. I3 sigue 0/25 hasta PASS integral.**

El subgate histórico está cerrado y congelado aunque la iteración completa todavía no suma porcentaje.

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST07_ADMIN_NEW_SHOPPER_ONLY_AFTER_FROZEN_HISTORICAL_PASS`.

Request07 requiere autorización expresa nueva. Debe continuar solo Administración/new Shopper, reutilizar read-only el checkpoint histórico, `passwordResets=0`, crear/editar un único Shopper nuevo por provider ACK, readback y login/reload/new-tab/segundo contexto, con todas las prohibiciones previas y sin retry automático.
