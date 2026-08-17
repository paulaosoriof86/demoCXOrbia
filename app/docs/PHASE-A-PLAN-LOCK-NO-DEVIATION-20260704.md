# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Última sincronización:** 2026-08-17 13:14 -06:00  
**Estado:** `ACTIVO__UNIFICADO__NO_REPROCESO__MISMA_CANDIDATA__I1_PASS__I2_PASS__I3_EN_CURSO__I4_I5_PENDIENTES`

## 1. Lock prevalente de secuencia

Este archivo ya no usa una cadena histórica aislada tipo `M7→M10` ni un porcentaje técnico anterior como guía vigente. Esa representación quedó superada por la auditoría forense y la continuidad actual.

Para **secuencia, siguiente acción, porcentaje formal y subgates**, la fuente prevalente es:

`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`

Debe leerse junto con:

- `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`;
- `SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md` o el source lock posterior que el índice declare vigente;
- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## 2. El plan histórico por Cortes se conserva

Los Cortes 0B→8 siguen siendo cobertura funcional obligatoria y **no se eliminan**. El addendum unificado los mapea a las cinco iteraciones I1→I5 para que ningún flujo quede fuera:

- Corte 0B/1 → I1/I2 + regresión runtime I3;
- Corte 2 → I3/I4;
- Corte 3 → I4;
- Corte 4 → I1/I2 PASS;
- Corte 5 → I2/I3 + writes gated I4;
- Corte 6 → I3;
- Corte 7 → I4;
- Corte 8 → I5.

## 3. Los seis bloques S1→S6 se preservan como controles intermedios

No son un plan nuevo ni una sexta iteración:

- S1 canonical runtime → I1/I2 + validación de regresión I3;
- S2 persistencia detrás de `CX.data` → I2 + E2E operacional I4;
- S3 Shopper/Auth administrativo → I3;
- S4 HR bidireccional → I4;
- S5 Finanzas → I4;
- S6 E2E mismo build → cierre I4 + I5.

Ninguno puede omitirse; ninguno autoriza reiniciar un subgate ya PASS.

## 4. Avance formal vigente

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `0/25 EN CURSO` hasta cierre integral.
- I4 `0/25`.
- I5 `0/15`.

**GO-LIVE formal: 35% completado / 65% pendiente.**

Este porcentaje no significa que los subgates de I3 cerrados se repitan. Admin e histórico Shopper permanecen congelados.

## 5. No reprocesar

- Historical Shopper run `31906391682` PASS; reset único consumido; `passwordResets=0` en continuaciones.
- TARGET_B Admin sign-in PASS `32049054855`; no crear/rotar/reemplazar.
- request08 consumido/no rerun.
- HR viva 15 periodos / 660 visitas hasta AGO 2026; no reimportar.
- Finance V2 y source-safe/historical payments; no reconstruir.
- cumulative read model V2, Shopper portal V2, protected HR authority V2, state semantics V2 y exact identity contract; no sustituir por módulos viejos.
- legal V0.4/materialización/deploy previos; no rerun.

## 6. Definición de terminado

Un bloque solo queda congelado cuando existe:

`FUENTE/REGLA → ADAPTER/MAPPING → GATE SEMÁNTICO → BUILD EXACTO CUANDO APLIQUE → VALIDACIÓN REAL/VISUAL → CORRECCIÓN FOCAL → EVIDENCIA/HEAD → DOCUMENTACIÓN SINCRONIZADA → FREEZE`.

Sin build remoto del mismo SHA, un source PASS no se declara runtime PASS. Sin ACK provider, una mutación no se declara persistida.

## 7. Siguiente acción exacta

`I3.2_PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_AND_EXACT_DEV_DEPLOY_NO_REPROCESS`.

Después se continúa I3.3→I3.11 del addendum unificado. No nueva candidata/rama/PR, no reauditoría general, no merge/producción sin gate.