# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-17 13:52 -06:00  
**Estado:** `UNIFIED_PLAN_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__TARGET_B_ADMIN_PASS__I3_1_PASS__I3_2_DEV_DEPLOY_PARITY_PASS_RUNTIME_FOCAL_FAIL__DIAGNOSTICS_SOURCE_PASS__I3_2B_GATE_NEXT__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`.

## Congelado/no reprocesar

I1/I2 PASS; Historical Shopper `31906391682` PASS/reset consumido/`passwordResets=0`; request08 consumido; TARGET_B Admin `32049054855` PASS; HR 15/660 no reimport; Finance V2/source-safe/historical no rebuild; canonical V2/exact identity preserved; legal materialization/deploy previos no rerun/autoaccept.

## I3.2 ejecución consumida

Request `i3-2-authority-compat-dev-deploy-20260817-01`; target source `245614e34bba033078342a43cecf489cbbaf7608`; request commit `ecafe08e48ab29b632e83f14fc51045a3977c3f9`; run `32058831910`; job `95475132736`; artifact `9297383869`; digest `sha256:621ed03757b029e48e803858e85895f1c8548618ff4353e44a85552aea80180c`.

PASS: source/preflight, Firebase Hosting DEV deploy `1`, root/direct remote parity, remote hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`, Staff credential selection without writes.

FAIL focal: `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK` after readiness already saw authenticated Staff, membership, protected HR authority, data projects/visits non-empty, current project/period and app visible/login hidden.

The old assertion grouped several possible blockers, so no exact cause was declared.

## Diagnostics source PASS

Harness `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e` now distinguishes empty shell/backend empty/no project/no period/source block/router/selectors/legal flags and stores last sanitized snapshot.

Source-only preflight run `32060010492`, job `95478920028`: PASS; provider calls/deploys/writes 0. Request consumed/disabled.

## Legal

Paula performed human V0.4 acceptance; durable receipt readback remains I3.7. Because `CX.app.enter()` can defer `router.mount()` while legal is pending and a double prompt was observed, legal is a strong hypothesis but not proven until granular runtime evidence. No autoaccept.

## Progreso

I1 `15/15`; I2 `20/20`; I3 formal `0/25`; I4 `0/25`; I5 `0/15` = **35%/65%**.

I3.1 PASS. I3.2 deploy/parity PASS, runtime open. I3 integral →60%, I4→85%, I5→100%.

## Acción siguiente exacta

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

One-shot previous request is consumed/STOP_RETRY. A new authenticated runtime/deploy execution requires a distinct explicit gate. After PASS continue I3.3→I3.11; no return to frozen work.
