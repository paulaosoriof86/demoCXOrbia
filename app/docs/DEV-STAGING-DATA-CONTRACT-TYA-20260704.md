# DEV staging data contract TyA

Fecha: 2026-07-04

## Proposito

Definir el contrato de datos para la futura revision DEV staging de TyA.

Este documento no modifica backend real ni frontend.

## Principios

- SaaS multi-tenant.
- Todo dato bajo `tenantId`.
- Todo programa bajo `projectId`.
- Datos de migracion bajo `migrationPreview` o `migrationBatches`.
- Ningun registro de preview debe ser tratado como definitivo.

## Identificadores base

- tenantId propuesto: `tya`.
- projectId propuesto: `tya-migration-dev`.
- batchId: generado por corrida futura.

## Tipos de datos permitidos en preview

- visits sanitizadas.
- shoppers sanitizados provisionales.
- communicationsHistory inactivo.
- operativeCandidates no finales.
- migration batch metadata.

## Tipos de datos no permitidos en este contrato

- Usuarios Auth reales.
- Pagos definitivos.
- Estados financieros cerrados.
- Evidencias en Storage.
- Notificaciones activas.
- Datos sensibles sin politica aprobada.

## Estados tecnicos requeridos

- shopperLink: provisional o unlinked.
- communicationPolicy: history_only.
- operativeCandidatePolicy: candidate_only.
- sourceBatchId obligatorio.
- projectId obligatorio.
- tenantId obligatorio.

## Estado

- Contrato documental.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin cambios frontend.
