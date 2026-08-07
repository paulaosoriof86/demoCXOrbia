# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_TARGET_LINEAGE_PASS_PROFILE_VISIT__AUTH_CANDIDATE_0__CROSS_ROW_PRINCIPAL_ALIAS_ROOT_CAUSE__NO_PASSWORD_READ__ZERO_WRITES__AUTH_PLAN_REQUIRES_SOURCE_ROOTFIX__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.json`;
4. `backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json` — provider block consumido; ahora congela root cause y siguiente source fix;
5. `backend/config/c6-auth-target-adaptive-lineage-password-snapshot-readonly-request-v2.json` — consumido/deshabilitado;
6. `app/docs/SOURCE-LOCK-C6-AUTH-TARGET-ANCHOR-LINEAGE-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.md` — lineage source-only anterior;
7. `backend/config/c6-shopper-auth-final-freeze-v2.json` — freeze anterior preservado, NO ejecutable hasta root fix;
8. `backend/contracts/c6-auth-activation-dev-v1.json` — contrato anterior preservado, requiere corrección source-only antes de reutilizar;
9. `tools/qa/cxorbia-c6-auth-activation-dev.mjs` — PREWRITE anterior con defecto cross-row y hard-stop salt no vacío;
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
AuthExecuted=false
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
TargetLineage=PASS profile+visit
TargetSpecificExistingAuthCandidateCount=0
CrossRowPrincipalAliasRootCause=true
OldAuthPlanExecutable=false
ProviderWrites=0
AuthWrites=0
```

## 3. Plan Auth anterior — preservado pero no ejecutable

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
passwordChanges=14
digest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
status=FROZEN_BUT_NOT_EXECUTABLE_PENDING_PRINCIPAL_UNIQUENESS_ROOT_FIX
```

No modificar sus counts manualmente. El siguiente root fix debe reconstruir y re-hashear el plan.

## 4. Hallazgo terminal del target

Target:

```text
profileFp=ac93d90d9e41512acdcd
baseLoginFp=493f2b26360648693c37
targetLoginFp=bd8d7019d612b4421366
suffixLength=4
collisionPeer=a8dd7db89a02ff180674
```

Ejecución terminal:

```text
runId=31227139583
jobId=93023626036
artifactId=9012489547
artifactDigest=sha256:82fc0f55becf62fbec5380652d5cd9f535d592da866fd921b51b0eeba9d32c05
lineagePass=true
corroboratingBases=profile,visit
candidateCount=0
hashConfigReads=0
passwordInspected=false
snapshotCreated=false
writes=0
```

## 5. Causa raíz

El PREWRITE antiguo construía candidatos de cada row combinando claim actual, credentials, `baseLogin` y `targetLogin`, pero no verificaba globalmente que un mismo Auth principal no fuera seleccionado por perfiles distintos.

Como target y peer comparten `baseLogin` y el peer conserva ese login no suffixado, el target podía heredar el principal Auth del peer como su único candidato. El resolver corregido reconstruyó el target exacto y, excluyendo el shared-base-login como selector, encontró cero principales target-specific.

Conclusión:

```text
CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE=true
```

El viejo blocker de password para `ac93...` es un síntoma downstream del plan y no debe seguir investigándose bajo `UPDATE_AUTH`.

## 6. Fail-close

```text
firstSourceRun=31226987446 providerReads=0 providerWrites=0
terminalProviderRun=31227139583 providerAttempts=1
secondProviderAttempt=false
requestV1Enabled=false requestV1Consumed=true
requestV2Enabled=false requestV2Consumed=true
oneShotWorkflowPresent=false
```

## 7. Siguiente acción exacta

Solo bajo autorización separada: **C6 AUTH PLAN PRINCIPAL-UNIQUENESS ROOT FIX + PREWRITE REBUILD source-only**.

Debe:

1. agregar invariant global de un existing Auth principal por profile row;
2. re-evaluar `ac93...` target-specific;
3. si candidateCount=0 y targetLogin continúa único, materializar su clasificación correcta sin provider;
4. preservar peer como su propio principal;
5. reconstruir exactamente 340 filas, counts, digest y población Auth esperada;
6. recalcular password update rows;
7. corregir rollback para distinguir salt vacío legítimo de salt no expuesto, sin relajar rollback exacto;
8. ejecutar self-tests y PREWRITE simulation source-only.

No volver a leer provider, SKIP13 o multi-Auth en ese bloque.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
