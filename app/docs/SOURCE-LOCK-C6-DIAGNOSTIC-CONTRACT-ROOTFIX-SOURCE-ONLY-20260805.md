# SOURCE LOCK — C6 diagnostic-contract root fix source-only

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `2b81b7a4d308fbf596011f7776e219e7c142421f`

## Alcance autorizado

Aplicar únicamente un root fix source-only sobre:

- `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
- `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
- `backend/contracts/c6-shopper-deterministic-suffix-v1.json`.

## Contrato objetivo

```text
preConsensusIncompleteActiveProfiles
completedByConsensus
remainingIncompleteActiveProfiles
metric identity: pre = completed + remaining
HOLD diagnostic vectors: booleans/counts/bases only
multi-Auth vector: signals/score/margin only, no UID/email/PII
group fingerprint namespace: shopper-visible-login-group-v1
collision reconciliation: fingerprint sets, not rigid count equality
```

## Gates obligatorios

- Node syntax del planner, clasificador y patcher;
- self-test del planner;
- verificación estructural del contrato;
- ausencia de gate rígido `collisionGroups === 64`;
- ausencia del gate antiguo `initialIncomplete === 83`;
- preservación de plan de 340 filas y sufijo 4/6/8;
- provider reads `0`.

## Seguridad

Provider reads/writes, Auth/password/membership/Firestore/Rules/Storage/HR writes, Hosting/Cloud Run, Make, Gemini, pagos, merge y producción: `0/false`.

El bloque termina después de source/static. No autoriza provider read ni repair.
