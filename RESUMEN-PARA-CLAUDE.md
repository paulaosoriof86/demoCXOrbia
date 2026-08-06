# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_AUTH_PLAN_340_FREEZE_PASS__IDEMPOTENCY_PASS__SMOKE_MATRIX_PREPARED__SKIPPED_ACCESS_RISK_HOLD__PRODUCTION_PROMOTION_PASS__LIVE_HR_V4_UNRESOLVED__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINAL-PREPARATION-HOLD-20260806.md`;
4. `app/docs/evidence/C6-AUTH-SMOKE-FINAL-PREPARATION-LATEST.json`;
5. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
6. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
7. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
8. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
9. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
10. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y composición canónica;
- Login y contratos Auth/RBAC;
- universo Shopper 65/65;
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas;
- estrategia `PROMOTE_EXISTING_CLEAN_PROJECT`;
- ninguna nueva candidata, rama, PR o shell paralela.

## 3. Backend Auth preparado

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freeze=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
idempotency=PASS_PREWRITE_IDEMPOTENCY_CONTRACT
snapshot/rollback=PREPARED_NOT_EXECUTABLE
smoke=PREPARED_NOT_EXECUTED
```

No modificar `/app/modules/*`, `/app/core/*` ni `CX.data`.

## 4. HOLD SKIP13

```text
blockingFingerprint=7cc28c78de9bfda01d14
providerCandidates=2
enabled=2
emailVerified=2
unplannedEffectiveAccessProvenAbsent=false
```

No ocultar ni compensar este HOLD desde frontend. Auth no debe ejecutarse hasta una adjudicación read-only de memberships/claims acotada a SKIP13.

## 5. Smoke futuro

La matriz preparada cubre Admin/Operaciones, Shopper y Cliente. Exige tres recargas, nueva pestaña, aislamiento por rol, mismo `tenantId/projectId`, una sola `sourceRevision`, ausencia de duplicados y UTF-8. No ha sido ejecutada.

## 6. HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

## 7. Siguiente cadena real

```text
ADJUDICACIÓN READ-ONLY SKIP13
→ RECONCILIAR HR V4 Y CONFIRMAR HR VIVA
→ AUTORIZACIÓN SEPARADA SNAPSHOT + AUTH
→ READBACK + ROLLBACK
→ SMOKE MULTIROL
→ VALIDACIÓN HUMANA
→ AUTORIZACIÓN ESPECÍFICA DE CUTOVER
```

## 8. Seguridad

```text
providerReads=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
