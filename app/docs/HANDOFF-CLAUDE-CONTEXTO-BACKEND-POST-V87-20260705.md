# Handoff Claude contexto backend post V87

Fecha: 2026-07-05

## Objetivo

Registrar el contexto backend acumulado que Claude debe respetar cuando vuelva a trabajar la candidata correctiva P0.

## Bloques backend acumulados

Ya existen bloques preview/documentales para Phase A:

1. Synthetic fixtures manifest Phase A.
2. Synthetic input pack preview runner.
3. Synthetic pack readiness map.
4. Bridge hacia release readiness snapshot.
5. Release readiness snapshot validator.
6. Release readiness sanitized report generator.
7. Controlled production matrix generator.

## Alcance de Claude

Claude debe concentrarse en el P0 frontend de honestidad operativa. No debe modificar contratos, herramientas de migracion, gates, integraciones ni documentacion backend si no se le pide.

## Senales backend post P0

Despues de corregir P0, quedan como P1:

- `availableFrom`
- `outboxStatus`
- `mailboxId`
- `formVersion`
- `externalFolderRef`
- `crmEntityId`

## Estado de salida

El backend preview no equivale a produccion lista. La salida sigue bloqueada hasta que exista candidata correctiva P0 con delta real y auditoria aprobada.
