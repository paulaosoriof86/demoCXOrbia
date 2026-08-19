# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-REUSE-CLOSED-I4E-ACTIVE-35`

I1/I2/I3/I4-A/I4-B PASS/frozen. I4-C source/readiness cerrado para Phase A; Make runtime diferido. Progreso formal canónico **60% completado / 40% pendiente** hasta cerrar I4 completo.

## Cerrado — I4-D Finanzas
`PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.

No queda pendiente reconstruir ni volver a cablear Finanzas. El HEAD vivo ya contiene bridge `CX.data`, adapter financiero canónico, Finance read model v2 y su carga en `index-backend-dev.html`.

Verdad de pago preservada: Mayo 44/44 pagadas; Junio 2 pagadas / 42 pendientes sobre 44; Q451 confirmados. `liquidada != pagada`.

## Pendiente activo único inmediato
`I4E_MULTI_PROJECT_NO_CODE_REUSE_AUDIT`.

- Auditar primero lo ya existente de multi-proyecto/configuración por `tenantId + projectId`.
- Reutilizar contratos, wizard/configuración y adapters existentes; no reconstruir.
- Verificar que Cinépolis sea configuración de proyecto, no lógica global.
- Verificar país/moneda, HR/origen/mapeo, cuestionario/origen/link, reglas, certificación, agendamiento/reprogramación/cancelación, pagos e integraciones como configuración por proyecto o detectar exactamente lo que falte.
- No tocar módulos UI desde backend.

Después: I4-F Academia → I5. Make/Gemini runtime continúa diferido.