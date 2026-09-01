# DEV staging gates TyA

Fecha: 2026-07-04

## Proposito

Definir los gates obligatorios antes de preparar cualquier runner habilitado futuro.

## Gate 1 - Readiness

Requiere:

- readiness V5 en estado listo para revision DEV controlada.
- blockers en none.
- notas tecnicas aceptadas para shopper, comunicaciones y candidatos.

## Gate 2 - Target DEV

Requiere:

- confirmar proyecto Firebase DEV objetivo.
- confirmar que no es produccion.
- confirmar tenantId y projectId.

## Gate 3 - Reglas

Requiere:

- checklist de reglas revisado.
- rutas bajo tenant/project.
- bloqueo de rutas globales.

## Gate 4 - Rollback

Requiere:

- batchId unico.
- conteos esperados.
- rutas destino.
- mecanismo de reversion por batch.

## Gate 5 - Autorizacion explicita

Requiere autorizacion escrita de Paula para una corrida DEV controlada.

## Estado

- Documental.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin cambios frontend.
