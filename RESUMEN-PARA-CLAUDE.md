# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_RUN_REGISTRATION_PROVEN__V2_V3_CANCELLED_BEFORE_STEPS__PROVIDER_READS_0_PROVEN__DIAGNOSTIC_LOOP_CLOSED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V2-V3-RUNNER-CANCELLATION-20260806.md`;
4. `app/docs/evidence/LIVE-HR-V2-V3-RUNNER-CANCELLATION-ROOT-CAUSE-LATEST.json`;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y composición canónica;
- Login y contratos Auth/RBAC;
- universo Shopper 65/65;
- SKIP13 con `HOLD=0` e historia preservada;
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas;
- ninguna nueva candidata, rama, PR o shell paralela.

## 3. Corrección del diagnóstico HR Actions

```text
v2 run=31117638647 job=92671263961 cancelled steps=0 providerReads=0 PROVEN
v3 run=31123402722 job=92688738677 cancelled steps=0 providerReads=0 PROVEN
```

El workflow sí fue registrado y activado por el `push` del path exacto. La ausencia de commit status ocurrió porque el job fue cancelado antes de ejecutar cualquier step; el status inicial estaba dentro del runner.

Usar `tools/qa/cxorbia-live-hr-run-consumption-classifier.mjs` antes de interpretar consumo provider. No volver a declarar “run ausente” solamente porque no exista status.

## 4. Regla frontend

No modificar `/app/modules/*` ni `/app/core/*`. Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper deben consumir una misma `sourceRevision` viva cuando exista evidencia. Los estados técnicos de Actions no se muestran al usuario final.

No declarar todavía `2026-08`, GT/HN, mutación histórica o paridad transversal como confirmados.

## 5. Siguiente bloque

```text
UNA ÚNICA LECTURA HR VIVA CON AUTORIZACIÓN FRESCA
→ observar run/job/steps y journal
→ confirmar 2026-08, GT/HN, cambio histórico y sourceRevision
→ no repetir diagnóstico de registro/trigger
```

## 6. Seguridad

```text
request modificado=false
workflow modificado=false
nuevo trigger=0
provider reads del bloque=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
