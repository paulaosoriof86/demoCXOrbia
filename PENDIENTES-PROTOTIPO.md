# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_PRODUCTION_PROMOTION_CONTRACT_PASS__EXISTING_CLEAN_PROJECT_ACCEPTED__LIVE_HR_V4_UNRESOLVED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
4. `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`;
5. `backend/config/cxorbia-production-promotion-contract.json`;
6. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
7. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
8. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- universo Shopper 65/65;
- SKIP13: `HOLD=0`, historia preservada;
- Login, Auth/RBAC source-only, Finanzas, Portales y Reservas;
- request HR v4 emitido una sola vez y sin segundo trigger;
- estrategia PROD autorizada: `PROMOTE_EXISTING_CLEAN_PROJECT`;
- contrato materializado;
- gate source-only `PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT`;
- proyecto limpio existente aceptado con sus identificadores técnicos actuales.

## 3. Estado HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
runId recuperado=false
jobId recuperado=false
steps recuperados=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

No se recuperó evidencia terminal para clasificar lectura cero o consumida.

## 4. Producción

```text
project=cxorbia-backend-dev
hostingTarget=cxorbia-dev
hostingSite=cxorbia-backend-dev
cloudRunService=cxorbia-live-hr-dev
strategy=PROMOTE_EXISTING_CLEAN_PROJECT
gate=PASS
```

No crear otro proyecto PROD ni configuración separada mientras esta estrategia permanezca vigente. El contrato no autoriza deploy, merge ni cutover.

## 5. P0 actuales

1. Reconciliar evidencia terminal del request v4 exacto.
2. Confirmar HR viva `2026-08`, GT/HN, mutación histórica y `sourceRevision`.
3. Ejecutar Auth Shopper con gate separado.
4. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Completar validación humana y rollback.
6. Obtener autorización específica de cutover.
7. Ejecutar un único deploy/cutover sobre el proyecto limpio promovido.

## 6. No hacer

- no emitir segundo trigger HR sin cierre terminal;
- no inferir ausencia de run desde ausencia de status;
- no crear otro proyecto PROD;
- no conectar ni copiar la base legacy;
- no reabrir SKIP13 ni 65/65;
- no pedir nueva candidata, rama o PR;
- no ejecutar Auth, deploy, merge o producción sin gate y autorización separados.

## 7. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes permanecen documentadas, pero no sustituyen los P0 operativos de HR, Auth, smoke y cutover.

## 8. Seguridad

```text
provider reads del bloque=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
