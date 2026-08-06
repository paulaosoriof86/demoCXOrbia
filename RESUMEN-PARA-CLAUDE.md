# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_V3_REQUEST_EMITTED__NO_CHECKPOINT_OBSERVED__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente vigente

Leer primero:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V3-REQUEST-NO-CHECKPOINT-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. No reabrir

- Frontend acumulativo y composición canónica.
- Login único y contratos Auth/RBAC.
- Universo Shopper 65/65.
- Disposición de 13 perfiles: `HOLD=0`, fuera de repair Auth, historia preservada.
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas.
- No crear nueva candidata, rama, PR o shell paralela.

## 3. Root fixes preservados

- metadata provider para descubrir tabs y periodos;
- periodo calendario dinámico;
- registry como cache/last-known-good;
- una sola revisión source-safe;
- cambio histórico que debe alterar `sourceRevision`;
- journal v3 con checkpoints previos a provider.

## 4. Request v3 emitido

```text
sourceCommit=18ea2e6ab9b15480c851c7ba34cae8e8fbcae026
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
authorizationId=chat-20260806-live-hr-authority-current-period-v3-02
controlPlaneContract=cxorbia.live-hr-control-plane-journal.v1
```

No se observó:

```text
WORKFLOW_STARTED_PROVIDER_READS_0
PROVIDER_READ_BOUNDARY_ENTERED_MAX1
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1
FINAL_<JOB_STATUS>_<CONSUMPTION>
```

Resultado:

```text
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
retryExecuted=false
STOP_RETRY=true
```

No declarar `2026-08`, GT/HN, mutación histórica ni paridad transversal como confirmados.

## 5. Regla obligatoria para frontend

Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper deben consumir la misma `sourceRevision`. No modificar `/app/modules/*` ni `/app/core/*` por este bloque. Los estados técnicos del journal no deben mostrarse al usuario final.

## 6. Siguiente bloque

```text
CONTROL-PLANE/ACTIONS READ-ONLY DIAGNOSIS
→ request d62dbae9
→ localizar run/check suite o probar ausencia antes de provider boundary
→ no tocar request ni HR
→ STOP_RETRY sin segundo intento
```

## 7. Seguridad

```text
request v3 emitido=1
segundo trigger=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
