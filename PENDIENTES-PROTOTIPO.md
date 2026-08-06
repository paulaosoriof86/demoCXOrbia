# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_PRODUCTION_FAST_TRACK_PREFLIGHT_GATE_HOLD__LIVE_HR_V4_UNRESOLVED__PROD_TARGET_UNMATERIALIZED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-PRODUCTION-FAST-TRACK-PREFLIGHT-20260806.md`;
4. `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`;
5. `app/docs/evidence/C6-PRODUCTION-FAST-TRACK-PREFLIGHT-LATEST.json`;
6. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
7. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
8. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- universo Shopper 65/65;
- SKIP13: `HOLD=0`, historia preservada;
- Login, Auth/RBAC source-only, Finanzas, Portales y Reservas;
- root fixes de HR viva;
- diagnóstico v2/v3 cancelado antes de steps;
- request v4 emitido una sola vez;
- segundo trigger prohibido y no ejecutado;
- configuración DEV auditada;
- gate source-only de target PROD creado y `node --check` PASS.

## 3. Estado del request v4

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
runId recuperado=false
jobId recuperado=false
steps recuperados=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

No se recuperó evidencia terminal para clasificar lectura cero o consumida.

## 4. Gate de producción

```text
tool=tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs
node --check=PASS
execution exitCode=2 esperado fail-closed
decision=HOLD_PRODUCTION_TARGET_UNMATERIALIZED
holdReason=PRODUCTION_CONFIGURATION_FILES_NOT_MATERIALIZED
```

Configuración actual:

```text
.firebaserc default/dev=cxorbia-backend-dev
firebase hosting target=cxorbia-dev
hosting site=cxorbia-backend-dev
Cloud Run service=cxorbia-live-hr-dev
.firebaserc.prod=false
firebase.prod.json=false
```

Desplegar el estado actual no equivale a sacar la plataforma a producción.

## 5. P0 actuales

1. Reconciliar evidencia terminal del request v4 exacto.
2. Confirmar HR viva `2026-08`, GT/HN, mutación histórica y `sourceRevision`.
3. Ejecutar Auth Shopper con gate separado.
4. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Definir un proyecto PROD nuevo y separado.
6. Materializar `.firebaserc.prod` y `firebase.prod.json`.
7. Obtener `PASS_PRODUCTION_TARGET_SOURCE_ONLY_CONTRACT`.
8. Completar validación humana, rollback y autorización específica.
9. Ejecutar un único cutover.

## 6. No hacer

- no emitir segundo trigger HR;
- no inferir ausencia de run desde ausencia de status;
- no desplegar DEV como si fuera PROD;
- no conectar ni copiar la base legacy;
- no reabrir SKIP13 ni 65/65;
- no pedir nueva candidata, rama o PR;
- no ejecutar Auth, deploy, merge o producción sin gate separado.

## 7. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes permanecen documentadas, pero no sustituyen los P0 operativos de HR, Auth, smoke y target PROD.

## 8. Seguridad

```text
request modificado después de emisión=false
segundo trigger=0
provider reads del preflight=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
