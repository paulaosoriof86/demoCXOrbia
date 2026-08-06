# SOURCE LOCK — C6 diagnostic-contract root fix source-only

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `2b81b7a4d308fbf596011f7776e219e7c142421f`  
**Source commit:** `ceb5646400c61631eb2d8d469343360647c45f65`  
**Workflow freeze commit:** `6f34e8955dea6e51b3d9f3d12ebeda50e5bfb5d9`

## Alcance aplicado

- `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
- `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
- `backend/contracts/c6-shopper-deterministic-suffix-v1.json`.

## Contrato resultante

```text
preConsensusIncompleteActiveProfiles
completedByConsensus
remainingIncompleteActiveProfiles
metric identity: pre = completed + remaining
HOLD diagnostic vectors: booleans/counts/bases only
multi-Auth vector: ordinal/signals/score/margin only, no UID/email/PII
group fingerprint namespace: shopper-visible-login-group-v1
collision reconciliation: fingerprint sets, not rigid count equality
```

## Ejecución final

```text
run=31068501624
job=92511329808
requestCommit=1de9606ef6d78fec7802913c96ee50bb1deba441
decision=PASS_C6_SHOPPER_DIAGNOSTIC_CONTRACT_ROOTFIX_SOURCE_STATIC
plannerSha256=46bb0a58a936c9793dd9f405b08d6856ffa498432dc64f9c123e436159e387a6
classifierSha256=777b15405acdb526f00f7717cc1c756f0fe69146111be94123c1ec4afb5bd248
contractSha256=917b220a67c54740cf5ac1c0e3970561e72d6288f18b45d75e7c3cf45b7e803c
```

## Incidencias transitorias

- run `31068251278`: patcher no parseó; provider reads `0`, sin commit ni consumo;
- run `31068415510`: source/static PASS, parser de delta falló; provider reads `0`, sin commit ni consumo;
- run `31068501624`: PASS completo.

## Gates PASS

- sintaxis planner/clasificador/patcher;
- self-test;
- métricas separadas e identidad;
- vectores HOLD y multi-Auth sin PII;
- namespace estable;
- reconciliación por sets;
- eliminación de gates rígidos 64 y 83;
- plan 340 y sufijo 4/6/8 preservados;
- provider reads `0`.

## Estado seguro

Provider reads/writes, Auth/password/membership/Firestore/Rules/Storage/HR writes, Hosting/Cloud Run, Make, Gemini, pagos, merge y producción: `0/false`.

El request quedó consumido y el trigger source-only congelado. No existe autorización residual para provider read ni repair.
