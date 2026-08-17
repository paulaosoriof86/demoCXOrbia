# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-17 13:47 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS. Subgates parciales se registran y congelan, sin inflar porcentaje.

Plan prevalente: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

| Iteración | Peso | Estado | Cobertura |
|---|---:|---|---|
| I1 | 15 | PASS 15/15 | Auth/authority/source base |
| I2 | 20 | PASS 20/20 | canonical persistence/transversal |
| I3 | 25 | 0/25, EN CURSO | I3.1 PASS; I3.2 deploy/parity PASS + runtime focal FAIL |
| I4 | 25 | 0/25 | Phase A operational + S4/S5/S6 |
| I5 | 15 | 0/15 | exact build/preprod/go-live |

**GO-LIVE formal: 35% completado / 65% pendiente.**

I3 PASS → **60%**. I4 PASS → **85%**. I5 PASS → **100%**.

## No reprocesar

Historical Shopper `31906391682` PASS; TARGET_B Admin `32049054855` PASS; I1/I2 PASS; request08 consumido; HR 15/660 no reimport; Finance V2/source-safe/historical no rebuild; legal materialization/deploy previos no rerun/autoaccept.

## I3

| Subgate | Estado |
|---|---|
| I3.1 authority/composition source fix | PASS |
| I3.2 exact DEV deploy + runtime | PARCIAL: deploy/parity PASS, runtime focal FAIL |
| I3.3 proyecto/15 periodos/AGO/660 | pendiente runtime |
| I3.4 postulación vs HR assignment | pendiente runtime |
| I3.5 exact crosswalk agosto/reviewQueue | pendiente |
| I3.6 Mi Perfil/history | pendiente |
| I3.7 legal receipt durable | pendiente |
| I3.8 Admin create/update 1 Shopper nuevo provider-backed | pendiente |
| I3.9 Shopper nuevo E2E | pendiente |
| I3.10 KPI semantics | pendiente |
| I3.11 integral same-build | pendiente |

## I3.2 evidencia

Run `32058831910`, job `95475132736`: Hosting DEV deploy exacto PASS + remote parity PASS, hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`; runtime FAIL `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`.

Readiness previo al FAIL sí confirmó Auth Staff, membership, protected HR authority, data non-empty, current project/period y app visible. El error agrupaba varias causas.

Harness granular commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`; source preflight run `32060010492`, job `95478920028`, PASS, cero provider/deploy/writes.

Source lock técnico: `SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`.

## I4 cobertura

Documentos/instructivos, certificación/histórico, disponibles/postulación, asignación/agenda/reprogramación/cancelación, realizada/cuestionario/submit/revisión, HR bidireccional/Make gated, Finance, multi-proyecto/configuración, roles/scopes, evidencias/Storage, Academia/manuales/rutas/notificaciones, Gemini gated/revisión humana, S6 E2E exact-build.

## I5

Freeze sin P0 → SHA/manifest/build-lock/verificador → preprod exacta → rollback → E2E same-build → autorización producción → deploy/cutover/smoke → `ACTIVE_BASELINE_PHASE_A_PRODUCTION`.

## Acción actual

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

El one-shot anterior quedó consumido/STOP_RETRY. Nueva ejecución autenticada/deploy = gate nuevo. No nueva candidata/rama/PR/workflow, no reproceso, no producción sin gate.
