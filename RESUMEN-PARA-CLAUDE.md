# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-FINANCE-VERIFIED-34`

I1/I2/I3/I4-A/I4-B PASS/frozen. I4-C source/readiness suficiente para Phase A inicial; runtime Make/HR diferido. Progreso formal canónico **60% completado / 40% pendiente**.

## I4-D Finanzas — source readiness PASS
`I4D_FINANCE_PHASE_A_JUNE_PAYMENT_STATE_SOURCE_READINESS` quedó cerrado con decisión `PASS_I4D_FINANCE_PHASE_A_SOURCE_READINESS`.

Verdad source-safe: Mayo 2026 44/44 pagadas; Junio 2026 2/44 pagadas y 42 pendientes; pagos confirmados de junio Q451 total. Claves exactas preservadas por `visitId::hrRowId`. Reconciliación: 247 filas, 209 enlaces exactos, 38 revisiones, 207 montos listos y 2 revisiones de monto.

Regla obligatoria para frontend: nunca traducir `liquidada` como `pagada`; no inventar `paidAt`, lote, referencia bancaria ni deducir pago por visita ejecutada. No deduplicar por nombre visual.

## Frontend / Claude
No se tocó UI. La siguiente integración debe ocurrir solo por el punto autorizado de `CX.data`, conservando exactamente su interfaz y reutilizando Finance V2/historical. `modules/finanzas.js` y superficies relacionadas deberán consumir el estado canónico cuando corresponda el handoff, sin lógica backend incrustada.

Cinépolis sigue siendo proyecto configurable, no lógica global. Make/Gemini runtime continúa diferido.

## Academia
Finanzas puede documentarse con separación explícita liquidación/pago y evidencia por claves estables. Make/Gemini no se enseñan como runtime activo todavía.

## Siguiente backend
`I4D_FINANCE_PHASE_A_CX_DATA_READ_WIRING`.