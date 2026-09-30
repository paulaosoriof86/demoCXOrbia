# PHASE A — R11C LINEAGE DEL BUILDER SHOPPER

Fecha: 2026-07-12

## Decisión

`SOURCE_SNAPSHOT_DRIFT_NOT_BUILDER_DRIFT`

## Evidencia R5

- commit: `fa3214505f8875d543319293b969a9556016b5cb`;
- fecha: 2026-07-11T14:53:26-06:00;
- planId: `phasea_e2f248c15355824a`;
- source SHA-256: `e2f248c15355824a5ddd8fda1ee25f9cec8618de9cc9182ccd2cc5611335aa0a`;
- shoppers: 213;
- visitas: 616.

## Lineage

- hrBuilder: same=true; R5 blob=`b22d4c42b49395cf5f36de678b343c8eaab6f9ae`; current blob=`b22d4c42b49395cf5f36de678b343c8eaab6f9ae`
- xlsxHelper: same=true; R5 blob=`190bdab3c15db114ca446656bf046aa652ce88bb`; current blob=`190bdab3c15db114ca446656bf046aa652ce88bb`
- materializationPlanBuilder: same=false; R5 blob=`null`; current blob=`036f85a831015b58926021574c4c0f7da4d62d18`

## Interpretación

R5 and current HR parser lineage are identical; the 213→210 difference must be reconciled as source snapshot/reference drift, not frontend or builder regression.

No se reabre frontend, Claude, Level 0/1 ni el builder. La materialización shopper permanece HOLD hasta recuperar el set histórico aprobado o resolver las tres referencias mediante evidencia source-safe estable.
