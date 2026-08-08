# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_SKIP13_ADJUDICATION_REQUEST_EMITTED__20M_NO_TERMINAL_EVIDENCE__CONSUMPTION_UNKNOWN__STOP_RETRY__AUTH_PLAN_FROZEN__PRODUCTION_PROMOTION_PASS__LIVE_HR_V4_UNRESOLVED__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-ACCESS-ADJUDICATION-20M-NO-RUN-EVIDENCE-20260806.md`;
4. `app/docs/evidence/C6-SKIP13-AUTH-ACCESS-ADJUDICATION-20M-NO-RUN-EVIDENCE-LATEST.json`;
5. `backend/config/c6-skip13-auth-access-adjudication-request.json`;
6. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINAL-PREPARATION-HOLD-20260806.md`;
7. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
8. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
9. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
10. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
11. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
12. PR #7 y HEAD vivo.

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

## 3. P0 SKIP13 actual

La adjudicación read-only se preparó y solicitó una única vez:

```text
requestCommit=2eef8b70f2bd2d8570a7f3cc117e217851dd6964
targetHead=9e7b53f8b468970d8ee174e114693074bfc7a67a
skipProfiles=13
blockingFingerprint=7cc28c78de9bfda01d14
blockingCandidates=2
secondTrigger=0
```

Después de 1,227 segundos:

```text
workflowRunExistence=UNKNOWN_AFTER_20M_OBSERVATION
providerReadConsumption=UNKNOWN_NO_RUN_JOB_STATUS_OR_CHECKPOINT_EVIDENCE
adjudicationCompleted=false
unplannedEffectiveAccessDetermined=false
STOP_RETRY=true
```

No se recuperaron runId, jobId, steps, artifact ni status terminal. No declarar lectura cero o consumida y no emitir otro trigger.

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

No ejecutar hasta determinar el acceso efectivo de SKIP13 y obtener autorización separada para snapshot/writes.

## 5. HR v4 separado

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

No están confirmados `2026-08`, GT/HN, historia ni `sourceRevision`.

## 6. Orden hacia producción

1. reconciliar exclusivamente evidencia tardía de `2eef8b70...`;
2. determinar acceso efectivo residual SKIP13;
3. reconciliar HR v4 y confirmar HR viva;
4. autorizar snapshot y repair Auth;
5. ejecutar idempotencia, readback y rollback;
6. ejecutar smoke acumulativo multirol;
7. validación humana;
8. autorización específica y único cutover.

## 7. No hacer

- no ejecutar Auth mientras SKIP13 siga sin determinación;
- no emitir segundo trigger SKIP13 ni HR sin cierre terminal;
- no crear otro proyecto PROD;
- no conectar ni copiar la base legacy;
- no reabrir 65/65 ni regenerar el plan sin causa probada;
- no pedir nueva candidata, rama o PR;
- no desplegar, mergear o producir sin autorización específica.

## 8. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes permanecen documentadas, pero no sustituyen los P0 de identidad, HR, Auth, smoke y cutover.

## 9. Seguridad

```text
provider read consumption SKIP13=UNKNOWN
provider writes=0
HR reads del bloque=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
