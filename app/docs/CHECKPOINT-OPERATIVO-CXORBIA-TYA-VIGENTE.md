# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-17 14:04 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_1_PASS__I3_2B_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_FIX_SOURCE_PASS__I3_2C_GATE_NEXT__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; DEV `cxorbia-backend-dev`.

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## No reprocesar

I1/I2 PASS; Historical Shopper `31906391682` PASS/reset consumido/`passwordResets=0`; TARGET_B Admin `32049054855` PASS; request08 consumido; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal previous materialization/deploy no rerun/autoaccept.

## I3.2B runtime

Run `32062886562`, job `95488006557`, artifact `9298816339`.

Blocker exacto: `staff_first_NO_PERIODS_VISIBLE`.

El snapshot sí confirmó: Admin Staff, membership verified, 15 periodos, 660 visitas, `cinepolis`, `cinepolis-2026-08`, authority/data ready, rail/view mounted, project selector presente, period selector ausente, sin empty shell/backend empty/source block.

Legal no fue el blocker: loaded=true, pending=false, providerAuthority=true, error=null, modal=false.

## Causa raíz

El membership wiring verifica scope antes de `CX.app.enter()`. El wrapper Auth reconstruye `CX.session.user` dentro del enter y la república de membership ocurre después. Como router.mount se ejecuta sincrónicamente dentro de enter, el compat adapter podía perder momentáneamente `membershipVerified` y caer al filtro legacy `p.id===scopeProjectId`; `cinepolis` no coincide con `cinepolis-YYYY-MM`.

## Fix focal

`app/adapters/tya-phase-a-authority-compat-v1.js` commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`: fallback transitorio solo desde membership C6 ya verificada y con tenant/namespace/role/projectIds exactos. No confianza en raw `scopeProjectId`; no UI/core/modules.

QA `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` commit `a3e130387ceb4148aac85053dd4a2af471202a95`.

Source-preflight `32063359036` / `95489516680`: PASS, provider/deploy/writes/Historical Shopper access 0.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15` = **35%/65%**.

I3 no suma formalmente hasta cierre integral. Avance interno real: I3.1 PASS; I3.2B causa exacta demostrada + fix source PASS.

## Acción siguiente

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX`.

Necesita gate nuevo porque I3.2B consumió su máximo de un deploy. Objetivo: period selector presente, 15/660/AGO preservados, legal no-pending, 3 reloads + new-tab estables. Si PASS, cerrar I3.2/I3.3 y seguir I3.4→I3.7 inmediatamente.
