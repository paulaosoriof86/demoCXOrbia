# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-17 13:32 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS. Los subgates parciales se registran y congelan, pero no inflan el porcentaje formal.

Plan prevalente:
`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

| Iteración | Peso | Estado | Cobertura |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | base S1 + Corte 0B/1/4 |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | S2 base + Corte 4/5 |
| I3 — Auth/Shopper/legal/authority runtime | 25 | 0/25, EN CURSO | I3.1 PASS; I3.2 deploy/parity PASS + runtime focal FAIL |
| I4 — Phase A operational flows | 25 | 0/25 | se activa tras I3 PASS; S2 operational + S4/S5/S6 + Cortes 2/3/7 |
| I5 — exact build/preprod/go-live | 15 | 0/15 | S6 final + Corte 8 |

**GO-LIVE formal: 35% completado / 65% pendiente.**

Cuando I3 cierre integralmente: **60%**. Cuando I4 cierre: **85%**. I5 PASS: **100%**.

## Congelado — no repetir

- I1/I2 PASS.
- Historical Shopper `31906391682` PASS; reset único consumido; continuaciones `passwordResets=0`.
- request08 consumido/no rerun.
- TARGET_B Admin sign-in PASS `32049054855`; no crear/rotar/reemplazar.
- HR 15/660 no se reimporta.
- Finance V2/source-safe/historical payments no se reconstruyen.
- legal V0.4 materialization/deploy previos no se rerun.

## I3 — subgates explícitos

| Subgate | Estado | Evidencia/Regla |
|---|---|---|
| I3.1 authority/composition source fix | PASS | scope root-project/period + assignment/postulation separation |
| I3.2 exact DEV deploy + runtime | **PARCIAL** | deploy/parity PASS; runtime FAIL focal; one-shot consumido |
| I3.3 proyecto/15 periodos/AGO/660 | PENDIENTE RUNTIME | readiness vio datos no vacíos, pero shell final aún no certificado |
| I3.4 postulación persistida vs assignment HR | PENDIENTE RUNTIME | cero `hr-post-*` como postulaciones |
| I3.5 exact crosswalk agosto/reviewQueue | PENDIENTE | no fuzzy/no reset histórico |
| I3.6 Mi Perfil + histórico Shopper | PENDIENTE | reutilizar identidad exacta |
| I3.7 legal receipt durable readback | PENDIENTE | interacción humana hecha; no autoaccept |
| I3.8 Admin create/update 1 Shopper nuevo provider-backed | PENDIENTE | Auth→claims→membership→profile→crosswalk→ACK |
| I3.9 Shopper nuevo login/reload/new-tab/segundo contexto | PENDIENTE | persistencia provider-backed |
| I3.10 KPI derivados/state semantics | PENDIENTE | no reescribir Dashboard |
| I3.11 cierre integral same-build | PENDIENTE | recién aquí I3 = 25/25 |

## I3.2 — evidencia del avance

Run `32058831910`, job `95475132736`:

- source/request preflight PASS;
- Firebase Hosting DEV deploy exacto `1` PASS;
- remote parity `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`;
- hash remoto `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`;
- authenticated Staff runtime FAIL `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`.

Antes del FAIL, readiness ya había observado Auth Staff, membership, protected HR authority, proyectos/visitas dinámicos no vacíos, current project/period y app visible. La aserción antigua mezclaba cinco causas; no se parcheó producto por intuición.

Harness granular commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e` y source preflight run `32060010492`/job `95478920028`: PASS, cero provider/deploy/writes.

Source lock actual:
`SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`.

## I4 — gates completos

1. documentos/instructivos + certificación/histórico;
2. disponibles + postulación real;
3. asignación + agenda + reprogramación + cancelación;
4. realizada + cuestionario + submit/revisión;
5. HR bidireccional + Make/Sheets gated + conflictos;
6. Finanzas/liquidaciones/pagos con fuente exacta;
7. multi-proyecto/configuración;
8. roles/scopes Admin/Ops/Shopper histórico/Shopper nuevo/Cliente;
9. evidencias/Storage según flujo;
10. Academia/manuales/rutas/notificaciones;
11. Gemini gated/revisión humana;
12. S6 E2E integral del mismo build.

## I5

Freeze sin P0 → SHA/manifest/build-lock/verificador → preproducción exacta → rollback → E2E same-build → autorización producción → deploy/cutover/smoke → `ACTIVE_BASELINE_PHASE_A_PRODUCTION`.

## Acción actual

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

El one-shot I3.2 anterior quedó consumido y no se rerun. Una nueva ejecución autenticada/deploy requiere gate exacto nuevo. No nueva candidata, no reauditoría, no reproceso, no producción sin gate.
