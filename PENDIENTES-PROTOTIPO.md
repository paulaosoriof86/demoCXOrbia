# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-FINANCE-PHASEA-ACTIVE-33`

I1/I2/I3/I4-A/I4-B PASS/frozen. I4-C source/readiness cerrado para Phase A; Make runtime diferido. Progreso formal **60% completado / 40% pendiente**.

## Pendiente activo único inmediato
`I4D_FINANCE_PHASE_A_JUNE_PAYMENT_STATE_SOURCE_READINESS`.

## Finanzas
- Preservar Finance V2/historical; no reconstruir.
- Mayo 2026: 44/44 pagos confirmados.
- Junio 2026: 2 pagos confirmados y 42 pendientes sobre 44 visitas.
- Validar/wirear el read model source-safe para que liquidaciones históricas y estado de pago sean operables en Phase A.
- Mantener `liquidada != pagada`; no inferir pago desde visita ejecutada/submitido.
- Resolver revisiones financieras por claves estables y revisión humana, sin PII/banco crudo.
- No ejecutar pagos; solo control/estado auditado en el alcance inicial.

Después: I4-E multi-proyecto/no-code → I4-F Academia → I5.

Make/Gemini runtime se revisan posteriormente; no pedir escenarios Make durante esta frontera.