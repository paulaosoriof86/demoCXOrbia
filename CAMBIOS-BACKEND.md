# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-FINANCE-VERIFIED-34`

**Avance formal canónico:** **60% completado / 40% pendiente**. Este porcentaje no cambia por sub-bloques de I4; el avance real de esta iteración es que `I4D_FINANCE_PHASE_A_JUNE_PAYMENT_STATE_SOURCE_READINESS` pasó a PASS y la frontera avanza a `I4D_FINANCE_PHASE_A_CX_DATA_READ_WIRING`.

## I4-D Finanzas — avance ejecutado
Se endureció `tools/verify-cxorbia-i4d-finance-phase-a-source.mjs` de 14 a 24 aserciones para cerrar la verdad financiera con evidencia explícita y no por inferencia.

Quedó validado: Mayo 2026 44/44 pagadas; Junio 2026 44 visitas, 2 pagos confirmados y 42 pendientes; los dos pagos de junio suman exactamente Q451 y quedan fijados por `visitId::hrRowId` estables. Reconciliación: 247 filas financieras, 209 enlaces exactos, 38 revisiones, 207 montos canónicos listos y 2 revisiones de monto.

Reglas verificadas: `liquidada != pagada`; no inferir pago desde ejecución de visita; pago requiere evidencia; no deduplicar por nombre visual; datos bancarios crudos prohibidos; ejecución de pagos y writes de payment state continúan bloqueados.

Evidencia actualizada: `app/docs/evidence/I4D-FINANCE-PHASE-A-SOURCE-READINESS.json` con decisión `PASS_I4D_FINANCE_PHASE_A_SOURCE_READINESS`. Se registró de forma transparente que la prueba fue un replay determinístico local de la proyección source-safe viva; no se afirma ejecución nativa del verifier dentro de GitHub Actions.

## Seguridad
0 payment execution, 0 payment-state writes, 0 Make/HR/Auth/Rules/Storage/Gemini calls/writes, 0 deploy/merge/producción. Datos bancarios crudos excluidos.

## Clasificación
- Reusable CXOrbia: reglas de estado financiero, claves estables, verifier source-safe.
- Exclusivo TyA: corte Mayo/Junio Cinépolis y cifras 44/44, 2/42, Q451.
- Claude/prototipo: posteriormente debe consumir esta verdad por el punto autorizado de `CX.data`; no parche backend de UI.
- Academia: Finanzas queda con estados reales y controles de evidencia.
- Sin impacto Claude: verifier/evidencia/backend interno.

## Siguiente bloque exacto
`I4D_FINANCE_PHASE_A_CX_DATA_READ_WIRING`: conectar la lectura financiera source-safe al contrato de datos autorizado, preservando exactamente la interfaz `CX.data` y sin tocar módulos UI.