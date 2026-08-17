# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Última sincronización:** 2026-08-17 13:53 -06:00  
**Estado:** `ACTIVO__UNIFICADO__NO_REPROCESO__MISMA_CANDIDATA__I1_PASS__I2_PASS__I3_EN_CURSO__I3_2_DEPLOY_PARITY_PASS_RUNTIME_FOCAL_OPEN__I3_2B_GATE_NEXT__I4_I5_PENDIENTES`

## Lock

Secuencia/porcentaje/subgates: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Estado técnico: source lock más reciente declarado en `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

Cortes 0B→8 y S1→S6 se preservan dentro de I1→I5; no son planes paralelos.

## Avance

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 EN CURSO`; I4 `0/25`; I5 `0/15`.

**35% / 65%.** I3 integral →60%; I4→85%; I5→100%.

## No reprocesar

Historical Shopper `31906391682` PASS/reset consumido; TARGET_B Admin `32049054855` PASS; request08 consumido; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal previous materialization/deploy no rerun/autoaccept.

## I3.2

Run `32058831910`/job `95475132736`: exact Firebase Hosting DEV deploy PASS + remote parity PASS; runtime Staff focal FAIL `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`. Readiness had already passed Auth/membership/HR/data/current context. Old assertion grouped causes.

Harness granular commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`; source preflight `32060010492` PASS, provider/deploy/writes 0.

One-shot consumed; no rerun.

## Definición de terminado

`FUENTE/REGLA → ADAPTER/MAPPING → GATE SEMÁNTICO → BUILD EXACTO → VALIDACIÓN REAL → CORRECCIÓN FOCAL → EVIDENCIA/HEAD → DOCUMENTACIÓN → FREEZE`.

App visible/login hidden no equivale a router/shell funcional. Sin ACK provider, mutación no es persistida.

## Siguiente acción

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

Nueva ejecución autenticada/deploy requiere gate distinto porque el one-shot anterior quedó consumed/STOP_RETRY. Luego I3.3→I3.11, I4.1→I4.12, I5.1→I5.8. No nueva candidata/rama/PR/workflow, no reauditoría, no producción sin gate.
