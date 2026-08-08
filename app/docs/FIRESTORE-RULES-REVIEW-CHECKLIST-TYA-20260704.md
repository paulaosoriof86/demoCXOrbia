# Firestore rules review checklist TyA

Fecha: 2026-07-04

## Proposito

Definir la revision minima de reglas antes de cualquier escritura DEV futura.

Este documento no modifica reglas y no autoriza escritura.

## Reglas esperadas por arquitectura

- Todo dato operativo debe estar segmentado por `tenantId`.
- Todo dato de programa/proyecto debe estar segmentado por `projectId`.
- Ninguna ruta de prueba debe apuntar a produccion.
- Ningun dato sensible debe quedar en texto plano sin politica definida.
- Auth real no se activa desde migracion.
- Storage de evidencias no se activa desde este gate.

## Rutas a revisar antes de un runner activo

- tenants/{tenantId}
- tenants/{tenantId}/projects/{projectId}
- tenants/{tenantId}/projects/{projectId}/visits
- tenants/{tenantId}/migrationBatches/{batchId}
- tenants/{tenantId}/migrationBatches/{batchId}/previewEvents
- tenants/{tenantId}/migrationBatches/{batchId}/previewNotifications

## Criterios de aprobacion DEV futura

- Escribir solo bajo tenant/proyecto esperado.
- Permitir solo batch controlado y reversible.
- Bloquear rutas globales sin tenant.
- Bloquear produccion.
- No activar usuarios Auth reales.
- No activar notificaciones reales.
- Mantener evidencia/storage fuera de alcance hasta autorizacion separada.

## Estado

- Checklist documental.
- Sin cambio de reglas.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
