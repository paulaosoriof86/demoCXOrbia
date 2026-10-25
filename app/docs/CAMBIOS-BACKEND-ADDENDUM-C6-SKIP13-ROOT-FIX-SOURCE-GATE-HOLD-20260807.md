# CAMBIOS BACKEND — C6 SKIP13 root-fix source-gate HOLD

Se materializaron source-only `backend/contracts/c6-skip13-auth-access-adjudication-v2.json` y `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs` con namespace de perfil `deterministic-suffix-plan-profile`, candidate namespace `shopper-auth-candidate-v1` y prohibición explícita de joins con `shopper-collision-member-v1`/`multi-auth-profile-v1`.

El source gate `runId=31190357507`, `jobId=92905316953` pasó checkout, Node y sintaxis, pero falló porque el `--self-test` del adjudicador también activó el self-test module-level de `cxorbia-c6-shopper-equivalent-universe.mjs`, contaminando la salida JSON con `PASS_C6_EQUIVALENT_UNIVERSE_SOURCE_STATIC`.

```text
classification=SOURCE_GATE_SELFTEST_OUTPUT_CONTAMINATION_FROM_IMPORTED_MODULE_ARGV
providerAttempt=false
providerReads=0
providerWrites=0
```

No se creó request v2. Workflow v2 retirado en `e269347c8305c6ff60ad182aa6190c9c94abfe62`. STOP_RETRY aplicado.
