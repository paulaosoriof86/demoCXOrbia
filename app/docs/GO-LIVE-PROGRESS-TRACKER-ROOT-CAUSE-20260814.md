# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-17 13:20 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS. Los subgates parciales se registran y congelan, pero no inflan el porcentaje formal.

Plan prevalente de secuencia:
`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

| Iteración | Peso | Estado | Cobertura |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | base S1 + Corte 0B/1/4 |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | S2 base + Corte 4/5 |
| I3 — Auth/Shopper/legal/authority runtime | 25 | 0/25, EN CURSO | S1 regression + S3 + Corte 1/2/6 |
| I4 — Phase A operational flows | 25 | 0/25, NO INICIAR writes hasta I3 PASS | S2 operational + S4 + S5 + S6 + Cortes 2/3/7 |
| I5 — exact build/preprod/go-live | 15 | 0/15, NO INICIAR | S6 final + Corte 8 |

**35% completado / 65% pendiente.**

## Regla de unificación

Los Cortes 0B→8 y los seis bloques forenses S1→S6 no son planes adicionales. Se preservan como cobertura y controles dentro de I1→I5. Ningún paso se elimina por aparecer bajo otra numeración.

## Congelado — no repetir

- Historical Shopper run `31906391682` PASS; reset único consumido; `passwordResets=0` en continuaciones.
- request08 consumido/no rerun.
- TARGET_B Admin sign-in real PASS `32049054855`; no crear/rotar/reemplazar.
- I1/I2 PASS.
- HR no se reimporta.
- Finance V2/source-safe/historical payments no se reconstruyen.
- materialización/deploy legal V0.4 previos no se rerun.

## I3 — subgates explícitos

| Subgate | Estado | Regla |
|---|---|---|
| I3.1 authority/composition source fix | PASS source-only | scope root-project/period + assignment/postulation separation |
| I3.2 runtime validation + exact DEV deploy | PENDIENTE | mismo HEAD; deploy solo bajo gate |
| I3.3 proyecto/15 periodos/AGO/660 | PENDIENTE | no reimportar HR |
| I3.4 postulación persistida vs assignment HR | PENDIENTE | cero `hr-post-*` como postulaciones |
| I3.5 exact crosswalk agosto/reviewQueue | PENDIENTE | no fuzzy/no reset histórico |
| I3.6 Mi Perfil + histórico Shopper | PENDIENTE | reutilizar identidad exacta |
| I3.7 legal receipt durable readback | PENDIENTE | interacción humana ya hecha; no autoaccept |
| I3.8 Admin create/update 1 Shopper nuevo provider-backed | PENDIENTE | Auth→claims→membership→profile→crosswalk→ACK |
| I3.9 Shopper nuevo login/reload/new-tab/segundo contexto | PENDIENTE | persistencia provider-backed |
| I3.10 KPI derivados/state semantics | PENDIENTE | no reescribir Dashboard |
| I3.11 cierre integral same-build | PENDIENTE | recién aquí I3 = 25/25 |

Admin existente e histórico Shopper están cerrados y no deben confundirse con I3.8/I3.9, que validan **un Shopper nuevo creado administrativamente**.

## HR/KPI ya comprobados

HR viva: 15 periodos / 660 visitas. AGO 2026: 44 total; GT 34/HN 10; 32 asignadas; 12 sin asignar; 25 agendadas; 7 sin agendar; 18 realizadas; 26 pendientes de realizar.

Protected overlay observado = 616; diferencia 44. Resolver por composición/crosswalk exacto del periodo nuevo, no por reproceso.

## I4 — gates que NO se pueden omitir

1. documentos/instructivos + certificación e histórico conservado;
2. disponibles + postulación real;
3. asignación + agenda + reprogramación + cancelación;
4. realizada + cuestionario configurable + submit/revisión;
5. HR bidireccional + Make/Sheets gated + conflictos;
6. Finanzas/liquidaciones/pagos con fuente exacta;
7. multi-proyecto/configuración por proyecto;
8. roles/scopes Admin/Ops/Shopper histórico/Shopper nuevo/Cliente;
9. evidencias/Storage según flujo real;
10. Academia/manuales/rutas/notificaciones;
11. Gemini gated según necesidad operativa, siempre revisión humana;
12. S6 E2E integral del MISMO build, con persistencia reload/new-tab y negative scopes.

I4 = 25/25 únicamente cuando la matriz Phase A operacional completa pasa sobre el mismo build.

## I5 — gates finales

1. freeze sin P0;
2. SHA/manifest/build-lock/verificador;
3. preproducción remota exacta;
4. rollback verificable;
5. E2E final same-build;
6. autorización producción;
7. deploy/cutover/smoke;
8. `ACTIVE_BASELINE_PHASE_A_PRODUCTION` + documentación final.

## Legal

Paula ya realizó la interacción humana V0.4. Pendiente I3.7: provider ACK/readback durable y reload/new-tab. Doble presentación = P1 mientras no impida sesión/rutas.

## Acción actual

`I3.2_PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_AND_EXACT_DEV_DEPLOY_NO_REPROCESS`.

No nueva candidata, no reauditoría general, no rerun de gates consumidos, no merge/producción sin gate.