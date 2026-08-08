# Security hard stops DEV runner TyA

Fecha: 2026-07-04

## Proposito

Definir bloqueos no negociables para cualquier runner DEV futuro.

## Hard stops absolutos

Debe abortar si aparece cualquiera de estos casos:

- Ambiente distinto de DEV.
- Ruta sin `tenantId`.
- Ruta sin `projectId`.
- Batch ausente.
- Batch repetido.
- Conteos distintos al dry-run.
- Intento de escribir produccion.
- Intento de crear usuarios Auth reales.
- Intento de activar Make o notificaciones reales.
- Intento de escribir pagos finales.
- Intento de cerrar estados financieros.
- Intento de subir evidencias a Storage.
- Datos sensibles sin politica aprobada.
- Autorizacion explicita ausente.

## Regla de salida segura

Ante cualquier hard stop:

- no escribir;
- no reintentar automaticamente;
- generar reporte local;
- dejar trazabilidad en batch/log local;
- solicitar revision humana.

## Estado

- Documento de seguridad.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
