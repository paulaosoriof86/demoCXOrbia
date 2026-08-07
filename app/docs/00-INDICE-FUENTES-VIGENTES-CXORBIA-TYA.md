# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_FINAL_PLAN_340_HOLD0__TARGET_ANCHOR_LINEAGE_SOURCE_ONLY_STOP_RETRY_EXACT_CONSENSUS_BASES_NOT_VERSIONED__PROVIDER_MINIMUM_CLASSIFIED__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-TARGET-ANCHOR-LINEAGE-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-TARGET-ANCHOR-LINEAGE-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.json`;
4. `backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json` — source-only, no autoriza provider;
5. `app/docs/SOURCE-LOCK-C6-AUTH-ONE-TARGET-RESOLVER-PASSWORD-SNAPSHOT-READONLY-STOP-RETRY-20260807.md`;
6. `app/docs/evidence/C6-AUTH-ONE-TARGET-RESOLVER-PASSWORD-SNAPSHOT-READONLY-STOP-RETRY-20260807.json`;
7. `backend/config/c6-shopper-auth-final-freeze-v2.json`;
8. `backend/contracts/c6-auth-activation-dev-v1.json` — preservado, no relajado;
9. `tools/qa/cxorbia-c6-auth-activation-dev.mjs`;
10. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
11. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json`;
12. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
13. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
14. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
15. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
16. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
17. addenda vigentes y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
FinalAuthPlanRows=340
UniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
FinalPlanDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
Production=false
```

SKIP13 permanece cerrado `13/13`. La adjudicación multi-Auth permanece cerrada:

```text
profile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
```

## 3. Target password rollback — lineage source-only

Target:

```text
profileFp=ac93d90d9e41512acdcd
baseLoginFp=493f2b26360648693c37
targetLoginFp=bd8d7019d612b4421366
sourceSafeSurnameBasis=multi_source_full_name_consensus
suffixLength=4
```

El source artifact congelado `31104541809 / 8968941587` demuestra la estructura de la lineage y que el target comparte `baseLoginFp` con un solo peer, `a8dd7db89a02ff180674`, que conserva el login base como `unique_technical_holder_preserves_unsuffixed_login`.

El planner exige para `multi_source_full_name_consensus` un único apellido corroborado por al menos dos bases distintas entre `profile`, `hr`, `visit`, `certification`, `liquidation`. Las evidencias versionadas no conservan el set exacto de bases del target: el row UPDATE_AUTH tiene `diagnostics=null`, la group matrix es agregada y member provenance fue delta-only mientras este grupo quedó unchanged. Los fingerprints son one-way.

Decisión actual:

```text
STOP_RETRY_C6_AUTH_TARGET_ANCHOR_LINEAGE_ROOT_FIX_SOURCE_ONLY_EXACT_CONSENSUS_BASES_NOT_VERSIONED
providerReadsThisBlock=0
AuthReadsThisBlock=0
FirestoreReadsThisBlock=0
HRReadsThisBlock=0
writes=0
deploys=0
merge=false
production=false
```

## 4. Mínimo provider futuro — no autorizado

`backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json` congela:

1. resolver target técnico;
2. leer adaptativamente solo registros target-linked de HR/visits/certifications/liquidations hasta corroborar exactamente un apellido por >=2 bases y reproducir `baseLoginFp` + `targetLoginFp`;
3. cero Auth reads antes de ese PASS;
4. luego máximo una página Auth, `candidateCount=1`, cero asociación a otro row;
5. solo después hash/salt/hashConfig y snapshot cifrado reversible.

No existe request ejecutable para ese provider block.

## 5. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

## 6. Siguiente acción exacta

Solo bajo nueva autorización: ejecutar el provider read-only focal/adaptativo definido en `c6-auth-target-anchor-lineage-provider-minimum-v1.json`. No reabrir SKIP13, multi-Auth ni plan final 340/HOLD0.
