# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-FINANCE-VERIFIED-34`

I1/I2/I3/I4-A/I4-B PASS/frozen. I4-C source/readiness cerrado para Phase A; Make runtime diferido. Progreso formal canónico **60% completado / 40% pendiente**.

## Cerrado en esta iteración
`I4D_FINANCE_PHASE_A_JUNE_PAYMENT_STATE_SOURCE_READINESS` = `PASS_I4D_FINANCE_PHASE_A_SOURCE_READINESS`.

Hechos fijados: Mayo 44/44 pagadas; Junio 2 pagadas / 42 pendientes sobre 44; Q451 confirmados en junio; claves estables `visitId::hrRowId`; reconciliación 247/209/38 y 207/2; `liquidada != pagada`; sin payment writes ni ejecución bancaria.

## Pendiente activo único inmediato
`I4D_FINANCE_PHASE_A_CX_DATA_READ_WIRING`.

- Conectar el read model financiero al punto autorizado de `CX.data` conservando exactamente su interfaz.
- No tocar ni reescribir módulos UI desde backend.
- Reutilizar Finance V2/historical; no reconstruir.
- Mantener separación liquidación/pago y revisión humana de conflictos.
- Mantener scope por `tenantId + projectId`; Cinépolis no debe convertirse en lógica global.

Después: I4-E multi-proyecto/no-code → I4-F Academia → I5.

Make/Gemini runtime continúa diferido y no bloquea esta frontera.