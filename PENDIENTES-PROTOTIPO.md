# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_AUTH_PLAN_340_FREEZE_PASS__IDEMPOTENCY_PASS__SMOKE_MATRIX_PREPARED__SKIPPED_ACCESS_RISK_HOLD__PRODUCTION_PROMOTION_PASS__LIVE_HR_V4_UNRESOLVED__NO_PRODUCTION`

## 1. Fuente de verdad

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

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- universo Shopper 65/65;
- plan Auth de 340 filas congelado con `HOLD=0`;
- digest y lineage source-safe;
- SKIP13 e historia preservados;
- idempotencia pre-write PASS;
- manifest de snapshot/rollback preparado;
- matriz de smoke Admin/Operaciones, Shopper y Cliente preparada;
- estrategia PROD `PROMOTE_EXISTING_CLEAN_PROJECT` PASS;
- request HR v4 sin segundo trigger.

## 3. P0 Auth actual

```text
decision=HOLD_C6_AUTH_PREWRITE_SKIPPED_ACCESS_RISK_UNRESOLVED
blockingFingerprint=7cc28c78de9bfda01d14
providerCandidates=2
enabledCandidates=2
emailVerifiedCandidates=2
unplannedEffectiveAccessProvenAbsent=false
```

Siguiente bloque exacto: una adjudicación completamente read-only de Auth, memberships y claims limitada a los 13 fingerprints SKIP13. No autoriza creación, actualización, eliminación, contraseña o membership writes.

## 4. Plan Auth preservado

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

No ejecutar hasta cerrar el P0 de acceso omitido y obtener autorización separada para snapshot/writes.

## 5. HR v4 separado

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

No están confirmados `2026-08`, GT/HN, historia ni `sourceRevision`.

## 6. Orden hacia producción

1. adjudicar SKIP13 read-only;
2. reconciliar HR v4 y confirmar HR viva;
3. autorizar snapshot y repair Auth;
4. ejecutar idempotencia, readback y rollback;
5. ejecutar smoke acumulativo multirol;
6. validación humana;
7. autorización específica y único cutover.

## 7. No hacer

- no ejecutar Auth mientras SKIP13 permanezca HOLD;
- no emitir segundo trigger HR sin cierre terminal;
- no crear otro proyecto PROD;
- no conectar ni copiar la base legacy;
- no reabrir 65/65 ni regenerar el plan sin causa probada;
- no pedir nueva candidata, rama o PR;
- no desplegar, mergear o producir sin autorización específica.

## 8. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes permanecen documentadas, pero no sustituyen los P0 de identidad, HR, Auth, smoke y cutover.

## 9. Seguridad

```text
providerReads=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
