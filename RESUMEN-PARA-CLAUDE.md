# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-LIFECYCLE-PASS-25`

## Validado
I4-A Shopper visible lifecycle **PASS** en DEV. Auth/membership/app/HR 15/660; Documentos con 4 recursos y viewer; 8 disponibles con detalle/Postularme habilitado; notificaciones visibles con bridge Firestore; certificación muestra correctamente pendiente de fuente y no inventa aprobación.

## Frontend / Claude
No hay P0 frontend demostrado en I4-A y no se requiere parche. Preservar `/app/modules` y `/app/core`. Si I4-B encuentra defecto reproducible se documentará por archivo/módulo.

## Academia
Ya puede incorporar la ruta Shopper validada para documentos/instrucciones, disponibles/postulación, notificaciones y estado de certificación pendiente. No enseñar score/aprobación ficticia cuando no hay banco publicado.

Siguiente técnico exacto: `I4B_VISIT_LIFECYCLE_READINESS__NO_PROVIDER_WRITES`.
