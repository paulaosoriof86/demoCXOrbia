# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_V3_CONTROL_PLANE_DIAGNOSIS_INCONCLUSIVE__PROVIDER_BOUNDARY_NOT_PROVEN__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V3-CONTROL-PLANE-DIAGNOSIS-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y composición canónica;
- Login y contratos Auth/RBAC;
- universo Shopper 65/65;
- SKIP13 con `HOLD=0` e historia preservada;
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas;
- ninguna nueva candidata, rama, PR o shell paralela.

## 3. Diagnóstico del request v3

```text
request=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
run/check suite/job localizado=false
commit statuses=0
WORKFLOW_STARTED_PROVIDER_READS_0=NO OBSERVADO
PROVIDER_READ_BOUNDARY_ENTERED_MAX1=NO OBSERVADO
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

El listado disponible de runs solo cubre `pull_request`, mientras este workflow usa `push`. Por ello no afirmar que el run nunca existió. Sí está probado que no existe evidencia observable de frontera provider alcanzada.

## 4. Regla frontend

No modificar `/app/modules/*` ni `/app/core/*`. Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper deben consumir una misma `sourceRevision` viva cuando exista evidencia. Los checkpoints técnicos no se muestran al usuario final.

No declarar `2026-08`, GT/HN, mutación histórica o paridad transversal como confirmados.

## 5. Siguiente bloque

```text
GATE SOURCE-ONLY DE RECONOCIMIENTO/HABILITACIÓN DE GITHUB ACTIONS
→ no tocar request v3
→ no consultar HR ni emitir trigger provider
→ cerrar causa raíz del workflow no observable
→ cualquier nueva lectura requiere autorización fresca separada
```

## 6. Seguridad

```text
request modificado=false
nuevo trigger=0
provider reads por diagnóstico=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
