# SOURCE LOCK — PHASE A CANONICAL AUTHORITY REGRESSION · ROOT CAUSE · SOURCE PASS

**Fecha original:** 2026-08-17 12:48 -06:00  
**Última sincronización:** 2026-08-17 13:45 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `I3_1_SOURCE_PASS_FROZEN__SUPERSEDED_FOR_CURRENT_RUNTIME_STATE_BY_I3_2_LOCK`

## 1. Alcance preservado

Este lock conserva el PASS source-only I3.1. No se revierte:

- membership `projectIds=['cinepolis']` tratado como proyecto raíz/programa y compatible con filas de periodo `cinepolis-YYYY-MM`;
- asignación HR separada de postulación persistida;
- `app/adapters/tya-phase-a-authority-compat-v1.js` + wiring en `app/index-backend-dev.html`;
- HR 15 periodos / 660 visitas, no reimportar;
- exact identity, no fuzzy;
- Finance V2/source-safe/historical payments, no reconstruir.

## 2. Prevalencia actual

Para secuencia:
`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Para estado técnico runtime actual:
`SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`.

I3.2 ya ejecutó un DEV deploy exacto y remote parity PASS. El authenticated Staff runtime quedó en FAIL focal; el harness QA fue granularizado source-only y su preflight pasó. El one-shot está consumido y no se rerun.

## 3. No reprocesar

I1/I2 PASS; Historical Shopper PASS; TARGET_B Admin PASS; request08 consumido; HR no reimport; Finance no rebuild; legal materialization/deploy previos no rerun; consentimiento no autoaccept.

## 4. Avance

Formal I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15` = **35%/65%**. I3.1 PASS congelado. I3.2 deploy/paridad PASS, runtime abierto.

## 5. Siguiente acción

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

Una nueva ejecución autenticada/deploy requiere gate nuevo porque el request anterior fue consumido/STOP_RETRY. No nueva candidata/rama/PR/workflow y no reproceso.
