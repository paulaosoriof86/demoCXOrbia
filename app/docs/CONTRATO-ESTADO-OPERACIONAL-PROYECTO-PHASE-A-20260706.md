# Contrato estado operacional proyecto Phase A - CXOrbia TyA

Fecha: 2026-07-06

## Objetivo

Preparar el contrato de estado operacional por tenant y proyecto antes de cualquier conexion backend real.

## Archivo creado

- `app/contracts/project-operational-state-phase-a.tya.contract.json`

## Que define

El contrato define el estado operacional por:

- `tenantId`
- `projectId`
- `projectCode`
- pais
- moneda

## Estados cubiertos

1. Estado de fuente HR.
2. Estado de fuente de cuestionario.
3. Estado de source lock.
4. Estado P0 frontend.
5. Estado readiness local.
6. Estado conexion backend.
7. Estado import.
8. Estado proveedores.
9. Readiness Phase A.

## Readiness Phase A

Incluye control para:

- historico como base de control;
- shoppers historicos mapeados;
- certificaciones conservadas;
- liquidaciones mapeadas;
- estado de pagos trazado;
- multi-proyecto habilitado.

## Llaves de sincronizacion

Mantiene llaves estables:

- `tenantId`
- `projectId`
- `visitId`
- `hrRowId`
- `shopperId`
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt`

## Politica de conflicto

Todo conflicto debe ir a revision. No se permite sobrescritura silenciosa.

## Seguridad

Contrato solamente. No conecta backend. No despliega. No fusiona ramas. No importa datos reales. No llama proveedores. No habilita source lock ni produccion.
