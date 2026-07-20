# CHECKPOINT ADDENDUM — CORTE 1 CANDIDATA CLAUDE HOLD

Fecha: 2026-07-20
Estado: `CORTE_1_CLAUDE_CANDIDATE_HOLD_P0_PROVEN_CORRECTION_REQUIRED`

- Baseline activa: V161C/R21.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Candidata: `Prototype development request (11).zip`.
- SHA-256: `ccc216ccb6b1a666e8fb9ce423e0886c03d0687779a3cdbb985dd5a2e8523af0`.
- Decisión: `HOLD — P0_PROVEN — NO APLICAR`.

La candidata no consume la proyección real schema 1.1.0. Supone `periods[].branches`, `byPeriod`, score, NPS y región; el contrato real expone `rows`, `branchRows`, `catalog`, `filter()` y `report()`.

Prueba reproducible:

- 4 reportes deberían estar disponibles; solo 1 aparece disponible.
- 12 botones deberían estar habilitados; solo 3 quedan habilitados.
- El filtro país no aparece.
- Excel de tendencia genera 14 filas completamente vacías.

Evidencia completa: `AUDITORIA-CANDIDATA-CORTE1-REPORTES-CLAUDE-20260720-HOLD.md`.

Gate endurecido en commit `426c053ab0ca60bfbad6de139f571ed0cb608b17`.

Siguiente acción: corrección incremental de Claude sobre el mismo alcance; ChatGPT vuelve a auditar directamente. Codex no interviene hasta existir GO sin P0.

Estado seguro: candidata no aplicada, sin deploy, merge, producción ni escrituras reales.
