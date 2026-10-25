# REPORTE DE CORRECCIÓN — V118 (avance OLA 1 sobre V117)

Baseline: `Prototype development request CXOrbia V117.zip`.

## OLA 1 — Contrato de Fuente unificado: PASS_COMPROBADO (parcial de OLA 1)

Se agregó `CX.dataSource.sourceContract()` — alias de solo lectura con los
nombres de campo exactos pedidos en `05-CONTRATOS-REUTILIZABLES-A-REFLEJAR.md`:
`sourceSnapshotAt`, `sourceReadMode`, `runtimeSyncActive`, `sourceRef`,
`warnings`, `blockers`. No duplica lógica — compone el estado ya resuelto por
`CX.dataSource.resolve()` (mode/status/sourceRef/warnings/blockers/updatedAt),
así que no hay dos fuentes de verdad. Probado en runtime en modo `demo` y
`source_safe_preview`: valores correctos en ambos, incluyendo
`runtimeSyncActive:false` en ambos (honesto — solo sería `true` con
`mode==='connected' && status==='ready'`, algo que este paquete no puede
activar sin un adapter backend real).

Migración de módulos individuales a consumir `sourceContract()`: NO_ATENDIDO
(aditivo, sin riesgo, pendiente para siguiente ronda).

## Resto de OLA 1 y OLA 2/OLA 3 completos: sigue NO_ATENDIDO.

## Gate técnico
- Sintaxis: PASS. Smoke pendiente de confirmar en este reporte (ver checklist).
