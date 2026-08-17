# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Última sincronización:** 2026-08-17 13:41 -06:00  
**Estado:** `ACTIVO__UNIFICADO__NO_REPROCESO__MISMA_CANDIDATA__I1_PASS__I2_PASS__I3_EN_CURSO__I3_2_DEPLOY_PARITY_PASS_RUNTIME_FOCAL_OPEN__I4_I5_PENDIENTES`

## 1. Lock prevalente de secuencia

Para secuencia, siguiente acción, porcentaje formal y subgates, la fuente prevalente es:

`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Debe leerse junto con el source lock técnico más reciente que declare `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## 2. Cobertura histórica preservada

Los Cortes 0B→8 siguen obligatorios y mapeados a I1→I5. Los seis controles S1→S6 siguen dentro de esas iteraciones y no constituyen un plan paralelo.

## 3. Avance formal

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `0/25 EN CURSO` hasta cierre integral.
- I4 `0/25`.
- I5 `0/15`.

**GO-LIVE formal: 35% / 65%.**

Al cerrar I3: 60%; I4: 85%; I5: 100%.

## 4. No reprocesar

- Historical Shopper `31906391682` PASS; reset consumido; `passwordResets=0`.
- TARGET_B Admin `32049054855` PASS; no crear/rotar/reemplazar.
- request08 consumido.
- HR 15/660 no se reimporta.
- Finance V2/source-safe/historical payments no se reconstruyen.
- legal V0.4 materialization/deploy previos no se rerun.
- adapters canónicos V2 y exact identity contract no se sustituyen por versiones antiguas.

## 5. I3.2 — estado sincronizado

El deploy DEV exacto ya se ejecutó una vez y quedó consumido:

- run `32058831910`, job `95475132736`;
- Firebase Hosting deploy PASS;
- remote parity PASS;
- runtime Staff FAIL focal `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`.

El readiness anterior al fallo sí vio Auth/membership/HR authority/datos/current project+period/app visible. La antigua aserción agrupaba cinco causas.

El harness QA quedó granular source-only en commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`; source preflight run `32060010492` PASS, cero provider/deploy/writes.

No rerun del request consumido.

## 6. Definición de terminado

Un bloque solo queda congelado cuando existe:

`FUENTE/REGLA → ADAPTER/MAPPING → GATE SEMÁNTICO → BUILD EXACTO CUANDO APLIQUE → VALIDACIÓN REAL/VISUAL → CORRECCIÓN FOCAL → EVIDENCIA/HEAD → DOCUMENTACIÓN SINCRONIZADA → FREEZE`.

Sin build remoto del mismo SHA, source PASS no es runtime PASS. Sin ACK provider, mutación no es persistida. App visible/login oculto no equivale a router/shell funcional.

## 7. Siguiente acción exacta

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

Una nueva ejecución autenticada/deploy requiere gate distinto porque el one-shot anterior quedó consumido/STOP_RETRY. Después se continúa I3.3→I3.11, luego I4.1→I4.12 e I5.1→I5.8. No nueva candidata/rama/PR/workflow, no reauditoría general, no producción sin gate.
