# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-17 13:30 -06:00  
**Estado:** `UNIFIED_PLAN_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__TARGET_B_ADMIN_PASS__I3_1_SOURCE_PASS__I3_2_DEV_DEPLOY_PARITY_PASS_RUNTIME_FOCAL_FAIL__DIAGNOSTICS_SOURCE_PASS__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Plan prevalente:
`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Source lock técnico prevalente:
`SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`.

## No reprocesar

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- Historical Shopper run `31906391682` PASS; reset único consumido; continuación `passwordResets=0`; no credential access/reconcile/recovery.
- request08 consumido/no rerun.
- TARGET_B Admin Firebase sign-in PASS `32049054855`; Paula ingresó. No crear/rotar/reemplazar.
- HR viva no se reimporta.
- Finance V2/source-safe/historical payments no se reconstruyen.
- legal V0.4 materialization/deploy previos no se rerun.

## I3.1

`PASS source-only`: root-project/period scope compatibility + assignment HR separado de postulaciones persistidas.

## I3.2 — resultado actual

Una ejecución exacta fue autorizada y consumida:

- request `i3-2-authority-compat-dev-deploy-20260817-01`;
- target source `245614e34bba033078342a43cecf489cbbaf7608`;
- request commit `ecafe08e48ab29b632e83f14fc51045a3977c3f9`;
- run `32058831910`;
- job `95475132736`;
- artifact `9297383869`;
- digest `sha256:621ed03757b029e48e803858e85895f1c8548618ff4353e44a85552aea80180c`.

PASS:

1. source/request preflight;
2. Firebase Hosting DEV deploy `1`;
3. root/direct remote parity PASS;
4. remote hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`;
5. Staff credential selection canónica sin writes.

FAIL focal:

`staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK` después de que el readiness ya había observado Auth Staff, membership, protected HR authority, periods/visits dinámicos no vacíos, current project/period y app visible.

La antigua aserción agrupaba empty-shell/backend-empty/no-projects/no-periods/source-block; por tanto, no se declara una causa exacta todavía.

## Focal source-only ejecutado

`tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` se volvió granular sin tocar producto:

- cinco causas separadas;
- router/shell mounted;
- selectores Proyecto/Periodo;
- estado legal sanitizado;
- último snapshot en fallo.

Commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`.

Source-only preflight:
- run `32060010492`;
- job `95478920028`;
- PASS;
- provider calls/deploy/writes `0`.

El request source-only quedó consumido. El one-shot DEV anterior también está consumido y NO se rerun.

## Legal

Paula realizó aceptación V0.4. El receipt durable sigue pendiente I3.7. `CX.app.enter()` puede diferir `router.mount()` si `CX.confidencialidad.pending()` sigue true; la doble presentación convierte legal en hipótesis de bloqueo, no en causa probada. Nunca autoaceptar.

## I3 — estado por subgate

- I3.1 PASS.
- I3.2 deploy/paridad PASS; runtime focal FAIL → abierta.
- I3.3→I3.11 pendientes.

Admin existente y Shopper histórico permanecen congelados; I3.8/I3.9 siguen siendo el flujo distinto de crear/probar un Shopper nuevo.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** No se otorgan puntos formales por un subgate parcial. Al cerrar I3 integralmente, el avance salta a 60%; I4 PASS lleva a 85%; I5 PASS a 100%.

## Acción siguiente exacta

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

Requiere gate nuevo y explícito si se vuelve a ejecutar runtime autenticado/deploy, porque el request anterior quedó consumido/STOP_RETRY. Cero reproceso de Admin histórico, Shopper histórico, HR o Finance.
