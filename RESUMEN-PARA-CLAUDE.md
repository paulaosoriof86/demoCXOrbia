# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_PRODUCTION_FAST_TRACK_PREFLIGHT_GATE_HOLD__LIVE_HR_V4_UNRESOLVED__PROD_TARGET_UNMATERIALIZED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-PRODUCTION-FAST-TRACK-PREFLIGHT-20260806.md`;
4. `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`;
5. `app/docs/evidence/C6-PRODUCTION-FAST-TRACK-PREFLIGHT-LATEST.json`;
6. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
7. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
8. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y composición canónica;
- Login y contratos Auth/RBAC;
- universo Shopper 65/65;
- SKIP13 con `HOLD=0` e historia preservada;
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas;
- diagnóstico cerrado de runs v2/v3;
- ninguna nueva candidata, rama, PR o shell paralela.

## 3. Request HR v4

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

No declarar run ausente, provider reads cero o lectura consumida.

## 4. Gate de target PROD

```text
tool=tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs
node --check=PASS
decision=HOLD_PRODUCTION_TARGET_UNMATERIALIZED
holdReason=PRODUCTION_CONFIGURATION_FILES_NOT_MATERIALIZED
```

La configuración versionada sigue siendo exclusivamente DEV:

```text
project=cxorbia-backend-dev
hosting target=cxorbia-dev
Cloud Run service=cxorbia-live-hr-dev
.firebaserc.prod=false
firebase.prod.json=false
```

No modificar `/app/modules/*`, `/app/core/*` ni `CX.data`. No parchar frontend para simular un entorno de producción.

## 5. Siguiente cadena real

```text
RECONCILIAR EVIDENCIA V4
→ CONFIRMAR HR 2026-08 GT/HN + HISTORY + sourceRevision
→ AUTH CON GATE SEPARADO
→ SMOKE MULTIROL
→ MATERIALIZAR .firebaserc.prod + firebase.prod.json EN PROYECTO NUEVO
→ PASS GATE PROD
→ VALIDACIÓN HUMANA + ROLLBACK
→ AUTORIZACIÓN ESPECÍFICA DE CUTOVER
```

## 6. Seguridad

```text
segundo trigger=0
provider reads del preflight=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
