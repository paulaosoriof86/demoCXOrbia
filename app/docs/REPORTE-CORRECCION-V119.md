# REPORTE DE CORRECCIÓN — V119 (avance OLA 1 sobre V118)

Baseline: `Prototype development request CXOrbia V118.zip`.

## OLA 1 — Contrato de Visita: PASS_COMPROBADO (parcial de OLA 1)

Se agregó `CX.data.visitContract(v)` — alias de solo lectura con los nombres
exactos del contrato de Visita (`05-CONTRATOS-REUTILIZABLES-A-REFLEJAR.md`):
`operationalState`, `questionnaireState`, `submissionState`,
`liquidationState`, `paymentState`, `assignmentSource`,
`assignmentSyncStatus`, `lastSyncedAt`, `reviewRequired`, `reviewReasons`.
Deriva TODO de `v.estado` y campos ya existentes (`v.submit`,
`v.paymentSourceRef`, `v.hrSynced`, `v.reviewRequired`) — no crea estado
nuevo ni cambia el significado de `v.estado` en ningún módulo. Probado en
runtime sobre una visita real: valores correctos y honestos (`no_aplica`
cuando no corresponde, `null` en vez de inventar).

## Resto de OLA1 (migración de módulos a los 3 helpers ya agregados:
`ctx()`, `sourceContract()`, `visitContract()`) y OLA2/OLA3 completos: sigue
NO_ATENDIDO.

## Gate técnico
- Sintaxis: PASS. Smoke 48×3: sin error. Manifest V119 regenerado, 0 diffs.
