# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4E-REUSE-PASS-I4F-ACTIVE-36`

I1/I2/I3/I4-A/I4-B PASS/frozen. I4-C source/readiness suficiente para Phase A inicial; runtime Make/HR diferido. I4-D e I4-E cerrados por reutilización y alineación de brechas reales. Progreso formal canónico **60% completado / 40% pendiente** hasta cerrar I4 completo.

## I4-D Finanzas — reutilizar, no reconstruir
El HEAD vivo ya contiene:
- `core/backend-cxdata-finance-read.js`
- `adapters/tya-financial-canonical-source-safe-adapter.js`
- `adapters/tya-canonical-finance-read-model-v2.js`
- carga existente en `index-backend-dev.html`.

No existe una tarea frontend pendiente de volver a conectar Finanzas. Lo nuevo de I4-D fue fijar la verdad de pagos Phase A: Mayo 44/44 pagadas; Junio 2/44 pagadas, 42 pendientes, Q451 confirmados. Mantener `liquidada != pagada`, no inventar `paidAt` y no inferir pago desde visita ejecutada.

## I4-E Multi-proyecto/no-code — reutilizar, no reconstruir
El prototipo ya tiene wizard/configuración de proyectos, certificación por proyecto, documentos por proyecto y reservas/agendamiento por proyecto. Backend ya tenía la máquina de estados multi-proyecto. Se alineó solamente el contrato backend `phase-a-tenant-project-config-from-platform-v1.json` para explicitar todos los dominios requeridos: país/moneda, HR/mapeo, cuestionario, documentos, reglas, certificación, agendamiento, reprogramación, cancelación, pagos e integraciones.

No tocar desde backend `modules/proyecto-wizard.js`, `modules/proyectos.js`, `modules/cert.js`, `modules/documentos.js` ni `modules/reservas.js` salvo P0 demostrado y autorización expresa.

Cinépolis continúa siendo un proyecto configurable por `tenantId + projectId`, nunca lógica global. Make/Gemini runtime continúa diferido.

## Academia
Frontera activa: `I4F_ACADEMIA_PHASE_A_ALIGNMENT_REUSE_AUDIT`. Revisar y reutilizar la Academia existente; corregir solo contenido/estado que haya quedado desalineado con Phase A actual. No reconstruir la Academia por defecto.

## Siguiente backend
Cerrar I4-F por reutilización/alineación y, si no aparece P0, cerrar I4 completo antes de entrar a I5.