# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-READINESS-PROVIDER-SOURCE-READY-26`

## Validado/preservado
I4-A visible Shopper PASS/frozen. I4-B backend readiness queda source-ready sin activar writes. El command boundary y `misvisitas.js` ya tienen patrón ACK-aware para agenda, realizada, reprogramación y cancelación.

## Ajustes frontend exactos — no tocar desde backend
1. `app/modules/visita-detalle.js`: al confirmar postulación, usar command `application.create`; cerrar/modal/success solo tras provider ACK.
2. `app/modules/postulaciones.js`: aprobación/rechazo/standby/cancelación no deben mutar `x`/`v` directamente; usar `application.status.update`, `visit.assign`/`visit.cancel` y refrescar después del ACK.
3. `app/modules/cuestionario-shopper.js`: no escribir `visita.score`, `visita.submit` ni estado local antes del ACK; usar `data.submitQuestionnaire(...,{ackAware:true})` y refrescar.
4. `app/modules/revision-admin.js`: retirar localStorage/CX.data.revisiones como verdad canónica; usar command `visit.review.update` y mostrar éxito solo después del ACK.

No hay rediseño pedido ni P0 frontend nuevo demostrado. Preservar layout, textos y lógica visual aprobada.

## Academia
No cambiar todavía la enseñanza del ciclo operativo como “confirmado” hasta que pase el E2E write. Mantener I4-A visible ya validado.

Siguiente técnico: `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE__SYNTHETIC_VISIT_ONLY`.
