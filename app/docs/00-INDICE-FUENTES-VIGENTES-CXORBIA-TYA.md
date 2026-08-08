# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_ROOTFIX_DIGEST_CANONICALIZATION_PASS__PLAN_V3_340_HOLD0__PHASE2_PREWRITE_STOP_UPDATE_CANDIDATE_DRIFT__SYSTEMIC_SUFFIX_COLLISION_RISK_36__ZERO_AUTH_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-DIGEST-PASS-PHASE2-PREWRITE-SYSTEMIC-UPDATE-RISK-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-ACTIVATION-V2-PREWRITE-SYSTEMIC-SUFFIX-COLLISION-RISK-20260807.json`;
4. `backend/config/c6-shopper-auth-final-freeze-v3.json` — digest canónico v3 materializado source-only;
5. `backend/contracts/c6-auth-activation-dev-v2.json` — contrato corregido; phase2 consumido en PREWRITE STOP;
6. `tools/qa/cxorbia-c6-auth-principal-uniqueness-rootfix-source-only.mjs`;
7. `tools/qa/cxorbia-c6-auth-activation-dev-v2.mjs`;
8. `backend/config/c6-auth-rootfix-digest-canonicalization-source-only-request-v2.json` — consumido/PASS;
9. `backend/config/c6-auth-principal-uniqueness-activation-dev-phase2-request-v1.json` — consumido/STOP;
10. `app/docs/SOURCE-LOCK-C6-AUTH-PRINCIPAL-UNIQUENESS-PHASE1-DIGEST-STOP-RETRY-20260807.md` — histórico del mismatch previo;
11. `app/docs/SOURCE-LOCK-C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.md`;
12. `app/docs/evidence/C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.json`;
13. `backend/config/c6-shopper-auth-final-freeze-v2.json` — plan anterior preservado, obsoleto para ejecución;
14. `backend/contracts/c6-auth-activation-dev-v1.json` — obsoleto para ejecución;
15. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
16. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json`;
17. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
18. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
19. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
20. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
21. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
22. addenda vigentes y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthExecuted=false
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
TargetLineage=PASS profile+visit
CrossRowPrincipalAliasRootCause=true
DigestCanonicalizationPhase1=PASS
PlanV3Rows=340
PlanV3Hold=0
PlanV3Digest=7b92fa73946e74ec4058bcdcbcfca25fe90e0504db6b6b22e797fbad066bd749
Phase2Prewrite=STOP_RETRY_UPDATE_AUTH_CANDIDATE_DRIFT
WriteBoundaryEntered=false
AuthWrites=0
```

## 3. Plan v3 canónico source-only

```text
rows=340
uniqueRows=340
CREATE_AUTH=82
UPDATE_AUTH=45
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=38
passwordChanges=13
claimsChanges=37
expectedAuthUsersBefore=110
expectedAuthUsersAfter=192
digest=7b92fa73946e74ec4058bcdcbcfca25fe90e0504db6b6b22e797fbad066bd749
```

FASE 1 source-only PASS:

```text
runId=31234681163
jobId=93044913507
artifactId=9014970238
artifactDigest=sha256:3a91b60612b67198b1109eaae53deb66720d1614d673e361cc657822f9317395
providerReads=0
writes=0
```

## 4. FASE 2 terminal

```text
runId=31234830218
jobId=93045302944
artifactId=9015012896
artifactDigest=sha256:a282b089e7bbdd1760e1d426fe837b9992857e3951e3efa837719ab9917dd68f
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_V2_PREWRITE
blocker=UPDATE_AUTH_AUTH_CANDIDATE_DRIFT:19f2a621b1b350db911b:0
prewritePass=false
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
```

No hubo segundo provider attempt.

## 5. Hallazgo sistémico antibucles

La revisión source-only posterior identificó:

```text
old suffix-applied UPDATE rows with one unsuffixed shared-baseLogin peer=37
already reclassified ac93...=1
remaining current UPDATE rows in same structural risk class=36
peer NO_OP=32
peer UPDATE_AUTH=4
```

La fila que disparó el STOP (`19f2...`) pertenece a ese patrón. Esto no demuestra que las 36 carezcan de Auth propio; sí demuestra que el siguiente método debe ser batch sobre las 45 UPDATE actuales y no fila por fila.

## 6. Fail-close

Todos los requests del bloque están consumidos/deshabilitados; todos los workflows one-shot del bloque fueron retirados. No existe autorización latente ni carril ejecutable. Auth no fue modificado.

## 7. Siguiente acción exacta

Solo bajo nueva autorización: revalidación batch read-only de las 45 `UPDATE_AUTH` actuales con anclas target-specific y global principal uniqueness; clasificar candidateCount `0/1/>1` para todas antes de reconstruir una sola vez el plan completo de 340 filas. No Auth writes en esa revalidación. No reabrir SKIP13, multi-Auth ni lineage de `ac93...`.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
