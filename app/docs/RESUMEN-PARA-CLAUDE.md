# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 13:48 -06:00  
**Estado:** `SAME_CANDIDATE__ADMIN_PASS_FROZEN__HISTORICAL_SHOPPER_PASS_FROZEN__I3_1_PASS__I3_2_DEPLOY_PARITY_PASS_RUNTIME_FOCAL_OPEN__NO_MODULE_REBUILD`

## Prevalencia

Secuencia: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Estado técnico: `SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`.

No nueva candidata/rama/PR/workflow. No reconstruir Auth, Shoppers, Finance, HR, KPI ni módulos ya resueltos. No tocar `app/modules` ni `app/core` para esconder el blocker actual.

## No reprocesar

Historical Shopper `31906391682` PASS/reset consumido/`passwordResets=0`; TARGET_B Admin `32049054855` PASS; request08 consumido; I1/I2 PASS; HR 15/660 no reimport; Finance V2/historical no rebuild; exact identity no fuzzy; legal no autoaccept.

## I3.1

PASS. Preservar `tya-phase-a-authority-compat-v1.js`: root-project/period scope + HR assignment distinto de postulación persistida.

## I3.2

Run `32058831910`, job `95475132736`:

- exact Firebase Hosting DEV deploy PASS;
- remote parity PASS;
- remote hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`;
- authenticated Staff runtime FAIL focal `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`.

Readiness ya había confirmado Auth, membership, HR authority, data projects/visits no vacíos, current project/period y app visible/login hidden. El error anterior agrupaba empty shell/backend empty/no project/no period/source block. No hay evidencia para cambiar un módulo UI.

Harness QA granular commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`; source preflight `32060010492` PASS, cero provider/deploy/writes.

## Legal

`CX.app.enter()` puede diferir `router.mount()` si legal sigue pending. Paula ya realizó la aceptación humana, pero I3.7 readback durable sigue pendiente y hubo doble presentación. Legal es hipótesis fuerte, NO causa probada hasta snapshot granular. No autoaccept ni eliminar modal.

## Claude — prohibiciones focales

No copiar módulos antiguos; no quitar fail-closed guards; no inventar proyecto/periodo; no transformar assignment HR en postulación; no alterar legal para hacer pasar E2E; no cherry-pick/rollback de módulos completos.

## Ruta restante

I3.2B granular runtime → I3.3 project/periods/660 → I3.4 postulations authority → I3.5 exact crosswalk → I3.6 Mi Perfil/history → I3.7 legal receipt → I3.8/I3.9 new Shopper provider flow/login → I3.10 KPI → I3.11 closure → I4 completa → I5 producción.

## Progreso

I1 15/15; I2 20/20; I3 0/25; I4 0/25; I5 0/15 = **35%/65%**. I3.2 deploy/parity PASS no se repite. I3 integral lleva a 60%, I4 a 85%, I5 a 100%.

## Siguiente frontera

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

El one-shot anterior está consumido. Nueva ejecución autenticada/deploy requiere gate nuevo.

## Clasificación

Reusable CXOrbia: parity+granular harness; Exclusivo cliente: TyA/legal; Claude/prototipo: preservar módulos; Academia: readiness efectivo; Sin impacto Claude: tooling/gates, salvo no revertir decisiones.
