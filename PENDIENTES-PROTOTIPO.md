# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_V3_REQUEST_EMITTED__NO_CHECKPOINT_OBSERVED__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V3-REQUEST-NO-CHECKPOINT-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- Frontend acumulativo, composición canónica y módulos Phase A.
- Universo Shopper equivalente 65/65.
- 13 perfiles omitidos de Auth: `HOLD=0`, historia preservada.
- Login único, contratos Auth/RBAC y plan Auth source-only.
- Finanzas, Liquidaciones, Portales y Reservas.
- Root fix HR viva source aplicado.
- Root fix de observabilidad control-plane aplicado.

## 3. Request v3 emitido

```text
sourceCommit=18ea2e6ab9b15480c851c7ba34cae8e8fbcae026
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
authorizationId=chat-20260806-live-hr-authority-current-period-v3-02
```

No se observó ningún checkpoint del journal:

```text
WORKFLOW_STARTED_PROVIDER_READS_0=NO
PROVIDER_READ_BOUNDARY_ENTERED_MAX1=NO
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1=NO
FINAL=NO
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

## 4. P0 único actual

Diagnosticar read-only por qué GitHub Actions no publicó siquiera el primer checkpoint del request v3.

## 5. Orden inmediato

1. Localizar run/check suite del request exacto.
2. Determinar si la ejecución quedó antes de provider boundary.
3. No modificar el request.
4. No consultar HR.
5. No emitir segundo trigger.
6. Solo con evidencia reproducible anterior a la frontera provider, solicitar autorización fresca.
7. Después confirmar `2026-08`, tabs GT/HN, mutación histórica y `sourceRevision` transversal.
8. Preparar repair Auth con SKIP13 y `HOLD=0`.

## 6. No hacer

- No reinterpretar v2 o v3 como providerReads=0.
- No hardcodear periodos o conteos.
- No tratar snapshots/Firestore como autoridad HR.
- No repetir import histórico por conteo.
- No reabrir los 13 perfiles.
- No ejecutar Auth, deploy, merge o producción sin gate separado.

## 7. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes continúan documentadas, pero no sustituyen el P0 de control-plane HR viva.

## 8. Seguridad

```text
request v3 emitido=1
segundo trigger=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
