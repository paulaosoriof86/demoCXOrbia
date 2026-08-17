# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 14:08 -06:00  
**Estado:** `I3_2B_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_SOURCE_FIX_PASS__I3_2C_GATE_NEXT__NO_REPROCESS`

## 2026-08-17 — I3.2B granular runtime + focal lifecycle correction

### Runtime ejecutado

Request `i3-2b-granular-authenticated-staff-runtime-recheck-20260817-01`; run `32062886562`; job `95488006557`; artifact `9298816339`.

El step de workflow termina job success por `continue-on-error`, pero el artifact sanitizado es autoridad y reporta runtime FAIL exacto:

`staff_first_NO_PERIODS_VISIBLE`.

Snapshot: Admin Staff, membership verified, 15 periods, 660 visits, current `cinepolis` / `cinepolis-2026-08`, authority/data ready, rail/view mounted, project selector present, period selector absent, no empty/backend/source block.

Legal estaba loaded/provider-backed/not pending, sin error/modal; no fue el blocker.

### Causa raíz exacta

`tya-c6-live-user-admin-membership-wiring-v1.js` verifica membership antes de `CX.app.enter()`. El wrapper Auth reconstruye `CX.session.user` dentro del enter y la república de membership ocurre después. Como router.mount corre sincrónicamente dentro de enter, existe una ventana en que el compat adapter no ve `membershipVerified` y cae al helper legacy que compara root project `cinepolis` con period ids `cinepolis-YYYY-MM`.

Esto produce exactamente project selector montado + `Sin periodos disponibles` con data 15/660 correcta.

### Fix producto-adapter focal

`app/adapters/tya-phase-a-authority-compat-v1.js`

Commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`.

Añadido fallback transitorio solo si C6 membership wiring ya está `verified` y backend Auth context coincide exactamente en tenant `tya`, namespace `staff`, role y projectIds. No raw scopeProjectId; no direct rail/router/UI; no `app/core`; no `app/modules`.

### QA source-only

`tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`

Commit `a3e130387ceb4148aac85053dd4a2af471202a95`.

Valida syntax, exact tenant/namespace/role/project scope, no raw scopeProjectId trust, no rail patch y las assertions runtime granular.

Request `i3-2b-no-periods-lifecycle-fix-source-preflight-20260817-01`; run `32063359036`; job `95489516680`; artifact `9298942951`; PASS.

Provider calls/deploys/Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes/Historical Shopper access = 0.

### Documentación

Nuevo source lock `SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`; índice/checkpoint/tracker/Claude/PENDIENTES/Academia/PR sincronizados.

### Progreso

Formal I1 15/15; I2 20/20; I3 0/25; I4 0/25; I5 0/15 = **35%/65%**. I3.1 PASS; I3.2B root cause exact + source fix PASS; runtime post-fix pending.

### Siguiente acción

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX` bajo nuevo gate. El deploy I3.2B quedó consumido y no se repite.

## Clasificación

- Reusable CXOrbia: verified membership lifecycle bridge during synchronous enter/router mount.
- Exclusivo cliente: TyA/Cinépolis 15/660.
- Claude/prototipo: no module/core changes.
- Academia: lifecycle/readiness pattern.
- Sin impacto Claude: tooling/gates except preserving decisions.

## Congelado

Historical Shopper `31906391682`, Admin `32049054855`, I1/I2, request08, HR 15/660, Finance V2/historical, canonical V2/exact identity, legal previous materialization/deploy. No reprocessing.
