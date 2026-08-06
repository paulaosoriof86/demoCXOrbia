# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_PRODUCTION_PROMOTION_CONTRACT_PASS__EXISTING_CLEAN_PROJECT_ACCEPTED__LIVE_HR_V4_UNRESOLVED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
4. `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`;
5. `backend/config/cxorbia-production-promotion-contract.json`;
6. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
7. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
8. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y composición canónica;
- Login y contratos Auth/RBAC;
- universo Shopper 65/65;
- SKIP13 con `HOLD=0` e historia preservada;
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas;
- estrategia de producción ya autorizada;
- ninguna nueva candidata, rama, PR o shell paralela.

## 3. Estrategia PROD vigente

```text
strategy=PROMOTE_EXISTING_CLEAN_PROJECT
project=cxorbia-backend-dev
hostingTarget=cxorbia-dev
hostingSite=cxorbia-backend-dev
cloudRunService=cxorbia-live-hr-dev
acceptCurrentIdentifiersAndUrlAsProduction=true
```

```text
contractCommit=3197aa5056375ddcffd3a67836ba5cf55a91eede
gateDecision=PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT
failedChecks=0
```

No modificar `/app/modules/*`, `/app/core/*` ni `CX.data`. No cambiar UI para ocultar o renombrar identificadores técnicos. El contrato no autoriza deploy ni cutover.

## 4. Request HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

No declarar run ausente, provider reads cero o lectura consumida.

## 5. Siguiente cadena real

```text
RECONCILIAR EVIDENCIA V4
→ CONFIRMAR HR 2026-08 GT/HN + HISTORY + sourceRevision
→ AUTH CON GATE SEPARADO
→ SMOKE MULTIROL
→ VALIDACIÓN HUMANA + ROLLBACK
→ AUTORIZACIÓN ESPECÍFICA DE CUTOVER
→ ÚNICO DEPLOY SOBRE cxorbia-backend-dev PROMOVIDO
```

## 6. Seguridad

```text
provider reads del bloque=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
