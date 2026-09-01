# SOURCE LOCK — ITERATION 3 HISTORICAL PASS + ADMIN RESUME SOURCE GATE — 2026-08-15

**Estado:** `LOCKED__REQUEST06_HISTORICAL_SUBGATE_PASS__ADMIN_NEW_SHOPPER_STOP_RETRY_BUTTON_HIDDEN_BEFORE_COMMAND__HISTORICAL_RESET_FROZEN_NO_REPEAT__ADMIN_RESUME_SOURCE_GATE_PASS__REQUEST07_GATE_REQUIRED`

## Carril exacto

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata única: `docs-tya-v6-v71-audit`
- PR: `#7` draft/open/no merge
- Firebase DEV: `cxorbia-backend-dev`
- Request consumido: `cxorbia-i3-shopper-persistence-20260814-06`
- Request commit: `701fedc184ccc98e08e7444adc0f04cd54247fce`
- Workflow provider: `31906391682`
- Job provider: `95064802332`
- Commit de parking fail-closed: `05ac40c6376671fac5176cd6ff0d9cce7cc0ac83`
- Source gate posterior: run `31906801917`, job `95065826139`, HEAD `5971413f13ca5d6fbdd878e5c1d379f2ab5a22c9`, `SUCCESS`.

## 1. Subgate histórico request06 — PASS y congelado

Request06 sí alcanzó provider y cerró el subgate histórico autorizado:

1. selección exacta del mismo Shopper histórico;
2. un único credential reset sobre el mismo UID exacto;
3. claims, profile, membership, crosswalk e historia exactos preservados;
4. reconciliación histórica sin writes Firestore requeridos;
5. login real Shopper + autoridad HR + historia E2E PASS;
6. checkpoint sanitizado creado antes de continuar con Administración.

Evidencia canónica:

- `app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`
- decisión: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`
- workflowRunId: `31906391682`
- exact identity: `true`
- UID preserved: `true`
- claims/profile/membership/crosswalk/history/historyE2E: `true`
- Auth password updates: `1`
- Firestore historical reconciliation writes: `0`
- other identities modified: `0`
- fuzzy matching: `false`
- credentials/tokens exposed: `false`

### Lock irreversible del subgate histórico

Este PASS queda congelado. Un fallo posterior de Administración **no autoriza repetir** el reset, reconstruir/reconciliar nuevamente la identidad histórica ni volver a requerir su credencial privada.

Toda continuación posterior de I3 debe reutilizar únicamente el checkpoint source-safe congelado y llevar `passwordResets=0`.

## 2. NDA / Academia / Certificación

El Shopper histórico llegó a `workspaceState=legal-gate-pending`.

- gate legal soportado: `true`;
- pendiente: `true`;
- diálogo visible: `true`;
- aceptación automatizada: `false`;
- Academia diferida por gate legal: `true`;
- Certificación diferida por gate legal: `true`.

No se aceptó, firmó, guardó ni simuló consentimiento. Academia y Certificación **no se declaran PASS** en este punto; quedan correctamente diferidas hasta consentimiento humano real.

## 3. Subgate Administración / Shopper nuevo — STOP_RETRY antes del comando

Después del PASS histórico, el workflow inició el command provider y entró al E2E de Administración.

El fallo exacto fue:

`I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`

Evidencia reproducible del run `31906391682`:

- Playwright esperó `#shNew` por 20 segundos;
- el botón existía siete veces en el polling, pero permanecía `hidden`;
- no se alcanzó el click de `#shNew`;
- no se emitió `shopper.create`;
- no se creó Shopper nuevo;
- no se ejecutó `shopper.update`;
- provider readback del nuevo Shopper quedó `SKIPPED`.

Por tanto, después del único reset histórico:

- nuevos Auth writes de Shopper nuevo: `0`;
- Firestore writes de Shopper nuevo: `0`;
- Auth delete: `0`;
- otras identidades modificadas: `0`;
- HR/Rules/Storage/Make/Gemini/pagos writes: `0`;
- deploy: `0`;
- merge: `false`;
- producción: `false`.

Request06 quedó consumido y parked. No rerun ni segundo intento automático.

## 4. Causa focal del botón oculto

La fuente canónica de Staff entra de forma asíncrona mediante `tya-c6-live-user-admin-membership-wiring-v1.js`:

`Auth/membership/HR authority -> finalizeStaffFrontend() -> CX.app.enter() -> membership republish -> app visible -> frontend handoff status=entered`.

El E2E de Administración esperaba solo `CX.session.user.membershipVerified===true` y navegaba inmediatamente a `shoppers`. Eso permitía una carrera: el router podía cambiar la vista antes de que el handoff canónico terminara de hacer visible la app. El botón `#shNew` existía en DOM, pero el contenedor seguía oculto.

No se demostró un defecto funcional del módulo Shoppers. La corrección es del mecanismo E2E/sincronización del harness, no un rediseño UI.

## 5. Corrección source-only posterior, sin provider retry

### `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`

Commit `e5b93412e6cf7716c3eed946dc7502215c9a6c1b`:

- espera `CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF.status='entered'`;
- exige membership verificada, HR authority aplicada, `#app.on` y `#login.hidden`;
- solo después activa command transport y navega a `shoppers`;
- espera `CX.session.view==='shoppers'` antes de exigir `#shNew` visible;
- publica `adminFrontendHandoffAwaited=true` en evidencia PASS.

### `tools/qa/cxorbia-i3-source-patcher.mjs`

Commit `8438609a0cfa423cc977ca1dc21e10e86bbde787`:

- prearma el modo futuro `admin_new_shopper_resume`;
- exige lineage exacta desde request06 + `I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`;
- no abre camino a reset histórico repetido.

### Workflow I3 existente

Commit `cc06a01570c568f839bc93e50bffd361de396887`:

- mismo workflow, no se creó uno nuevo;
- futuro gate permitido solo para Admin/new Shopper;
- verifica el checkpoint histórico congelado antes de provider credentials;
- `passwordResets=0`;
- selecciona únicamente Admin para el E2E restante;
- no vuelve a cargar credencial histórica;
- un fallo futuro vuelve a parkear sin reabrir el subgate histórico.

## 6. Gate source-only independiente — PASS

Workflow `CXOrbia Phase A Live Execution Checkpoint`:

- run: `31906801917`;
- job: `95065826139`;
- HEAD: `5971413f13ca5d6fbdd878e5c1d379f2ab5a22c9`;
- resultado: `SUCCESS`.

PASS en el mismo run:

- I1;
- I2;
- checkpoint histórico congelado;
- harness histórico legal-gate-aware;
- Admin E2E syntax;
- espera del canonical frontend handoff;
- source patcher;
- lineage Admin-only;
- `passwordResets=0` para futura continuación;
- checkpoint operativo.

Este gate fue source-only: cero provider credentials y cero Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes; cero reset; cero deploy; merge=false; producción=false.

## 7. Preservar / no reprocesar

- I1 PASS 15/15.
- I2 PASS 20/20.
- Auth owner / exact identity / Staff membership / protected HR authority.
- El único reset histórico de request06 y su PASS real.
- `ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json` como evidencia histórica final del subgate.
- NDA humano; no autoaceptación.
- Mis Visitas arrays/facets/ACK y command boundary de I2.
- Misma candidata, rama y PR.

## 8. Clasificación

- **Reusable CXOrbia:** E2E de roles debe esperar el handoff canónico completo de frontend, no inferir readiness solo por membership; subgates ya certificados se congelan y no se repiten.
- **Exclusivo TyA:** el único reset histórico ejecutado pertenece al Shopper exacto TyA/Cinépolis resuelto por llaves técnicas.
- **Claude/prototipo:** no hay evidencia suficiente para modificar UI; `#shNew` oculto se clasificó como carrera del harness. No crear nueva candidata ni rediseñar Shoppers.
- **Academia:** NDA sigue humano; Academia/Certificación diferidas, no PASS, hasta aceptación real.
- **Sin impacto Claude:** workflow, source patcher, frozen checkpoint y QA de continuación.

## 9. Avance

I3 todavía no cierra porque falta Administración/new Shopper completo. Según la medición durable, **GO-LIVE permanece 35% completado / 65% pendiente; I3 sigue 0/25 hasta PASS integral**.

El subgate histórico sí queda cerrado internamente y no se repite.

## 10. Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST07_ADMIN_NEW_SHOPPER_ONLY_AFTER_FROZEN_HISTORICAL_PASS`

Un eventual request07 debe:

- continuar exclusivamente desde request06;
- usar `continuationMode=admin_new_shopper_resume`;
- usar `priorStopRetryCode=I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`;
- reutilizar read-only el checkpoint histórico congelado;
- **passwordResets=0** y cero acceso a la credencial histórica;
- autorizar solo un Shopper nuevo: create + update por provider ACK, Auth/claims/membership/profile/crosswalk, provider readback, login, reload/new-tab y segundo contexto;
- conservar cero fuzzy matching, otras identidades, HR/Rules/Storage/Make/Gemini/pagos writes, deploy, merge y producción;
- fail-closed y sin segundo intento automático.

No existe autorización provider vigente después de request06.