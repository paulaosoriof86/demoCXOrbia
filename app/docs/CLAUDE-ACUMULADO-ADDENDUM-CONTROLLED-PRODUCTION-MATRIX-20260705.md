# Claude acumulado addendum - Controlled production matrix

Fecha: 2026-07-05

## Estado

Claude sigue sin capacidad. Se acumula la matriz de produccion controlada para que al volver no reinicie contexto ni priorice mal.

## Nuevo bloque acumulado

Se agrego:

- `app/contracts/controlled-production-matrix-phase-a.tya.contract.json`
- `tools/migration/tya-controlled-production-matrix-preview.mjs`
- `tools/migration/tya-controlled-production-matrix-local.ps1`
- `app/docs/MATRIZ-PRODUCCION-CONTROLADA-PHASE-A-TYA-20260705.md`

## Lo que Claude debe tomar como prioridad

Primero P0 frontend. No Academia profunda. No P1. No rediseño.

Corregir:

- mensajes que prometen envio real;
- mensajes que prometen sincronizacion real;
- textos de liquidacion movida automaticamente;
- textos de cuestionario enviado cuando corresponde realizado/completado pendiente revision.

## Lo que Claude no debe hacer

- No declarar source lock.
- No declarar produccion lista.
- No activar integraciones.
- No tocar backend.
- No tocar contratos ni tools.
- No ampliar Academia antes del P0.

## Como usar la matriz

La matriz separa P0, backend preview, ejecucion local pendiente, P1, Academia y source lock. Claude debe verla como una guia de prioridad: resolver P0 visible primero y entregar candidata con delta real para nueva auditoria.
