# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-REUSE-CLOSED-I4E-ACTIVE-35`

I1/I2/I3/I4-A/I4-B PASS/frozen. I4-C source/readiness suficiente para Phase A inicial; runtime Make/HR diferido. Progreso formal canónico **60% completado / 40% pendiente** hasta cerrar I4 completo.

## I4-D Finanzas — reutilizar, no reconstruir
La inspección del HEAD vivo confirmó que Finance ya tiene wiring `CX.data` y read models existentes en el carril backend DEV:
- `core/backend-cxdata-finance-read.js`
- `adapters/tya-financial-canonical-source-safe-adapter.js`
- `adapters/tya-canonical-finance-read-model-v2.js`
- carga existente en `index-backend-dev.html`.

Por tanto no existe una tarea frontend pendiente de “volver a conectar Finanzas”. No reescribir `modules/finanzas.js`, `/app/core` ni Finance V2/historical desde backend.

Lo nuevo de I4-D fue únicamente fijar la verdad de pagos Phase A: Mayo 44/44 pagadas; Junio 2/44 pagadas, 42 pendientes, Q451 confirmados. Mantener `liquidada != pagada`, no inventar `paidAt` y no inferir pago desde visita ejecutada.

## Claude/prototipo
Preservar el comportamiento financiero actual. Si una futura candidata presenta una discrepancia visible, documentarla por archivo/módulo; no convertirla en reconstrucción de Finanzas ni tocarla desde backend sin P0 demostrado.

Cinépolis continúa siendo proyecto configurable, no lógica global. Make/Gemini runtime continúa diferido.

## Academia
Mantener separación explícita liquidación/pago y evidencia por claves estables. Make/Gemini no se enseñan como runtime activo todavía.

## Siguiente backend
`I4E_MULTI_PROJECT_NO_CODE_REUSE_AUDIT`: revisar primero los contratos/configuración multi-proyecto ya existentes y crear solo lo realmente faltante.