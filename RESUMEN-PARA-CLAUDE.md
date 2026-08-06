# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_V4_REQUEST_EMITTED__30M_NO_RUN_JOB_CHECKPOINT_EVIDENCE__CONSUMPTION_UNKNOWN__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
4. `app/docs/evidence/LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-LATEST.json`;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y composición canónica;
- Login y contratos Auth/RBAC;
- universo Shopper 65/65;
- SKIP13 con `HOLD=0` e historia preservada;
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas;
- diagnóstico cerrado de runs v2/v3 cancelados antes de steps;
- ninguna nueva candidata, rama, PR o shell paralela.

## 3. Request v4

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
authorizationId=chat-20260806-live-hr-authority-current-period-v4-03
ventana observada=1820 segundos
```

No se recuperaron runId, jobId, steps, journal, artifact ni checkpoints.

```text
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

No declarar run ausente, provider reads cero o lectura consumida.

## 4. Regla frontend

No modificar `/app/modules/*` ni `/app/core/*`. Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper deben consumir una misma `sourceRevision` viva cuando exista evidencia. Los estados técnicos de Actions no se muestran al usuario final.

No declarar `2026-08`, GT/HN, mutación histórica o paridad transversal como confirmados.

## 5. Siguiente decisión

```text
RECONCILIAR EVIDENCIA TARDÍA DEL REQUEST ac2032ec
→ no emitir otro request mientras v4 no tenga evidencia terminal
→ no reabrir sintaxis/registro/trigger/rama/path
→ después continuar por la ruta Phase A única
```

## 6. Seguridad

```text
request modificado después de emisión=false
segundo trigger=0
provider reads ejecutados por observador=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
