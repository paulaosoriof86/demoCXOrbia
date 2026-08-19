# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-LIFECYCLE-PASS-25`

## I4-A cerrado PASS
Run `32282507320` / workflow `bbb9ccc8...`: PASS de page/Firebase/Shopper context/membership/app/HR authority, Documentos, disponibles/postulación, notificaciones y certificación. 4 documentos abribles con viewer, 8 visitas disponibles con detalle y Postularme habilitado, panel de notificaciones visible con fuente Firestore, certificación en pendiente de fuente sin fake approval. HR 15/660.

Safety: 1 provider verification read, 4 Firestore verification reads, 1 password update efímero, 1 login; Historical Shopper 0; otras identidades 0; Auth create/claims/delete 0; Firestore/postulación/certificación/reserva/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod 0/false.

Retry3 request queda consumido y workflow one-shot retirado. Evidencia durable `app/docs/evidence/I4A-VISIBLE-LIFECYCLE-PASS-LATEST.json`.

## Avance
Formal sigue 60/40 únicamente porque el Plan activo no asigna subpesos a I4-A..F. El avance técnico sí cambia: I4-A queda cerrado y el trabajo pasa a I4-B.

## Siguiente
`I4B_VISIT_LIFECYCLE_READINESS__NO_PROVIDER_WRITES`: consolidar source/runtime existente y diseñar un solo E2E write gate para todo el ciclo de visita si hace falta.

Clasificación: Reusable CXOrbia = visible lifecycle harness; Exclusivo TyA = HR 15/660/Cinépolis; Claude = sin P0; Academia = actualizar rutas Shopper con I4-A validado; Sin impacto Claude = gates/evidence.
