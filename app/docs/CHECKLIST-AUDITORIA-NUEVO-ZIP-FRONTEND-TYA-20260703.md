# Checklist auditoria nuevo ZIP frontend TyA

Fecha: 2026-07-03

## Objetivo

Auditar el siguiente ZIP visual como RC incremental.

## Revisar estructura

- app/index.html.
- app/core.
- app/modules.
- Modulo HR Source.
- Sin perdida de archivos backend.

## Revisar hooks

- hr-source:test.
- hr-source:preview.
- hr-source:sync-request.

## Revisar seguridad visual

- Fuente HR enmascarada.
- Sin datos privados expuestos.
- Sin acciones reales habilitadas.

## Revisar estados

- Preview.
- Warning.
- Bloqueado.
- Pendiente backend.
- No autorizado.

## Revisar gates

- DEV preview.
- DEV import.
- Staging.
- Produccion.

## Salida esperada

Documentar resueltos, pendientes y nuevos hallazgos.
