# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_LIVE_HR_V3_CONTROL_PLANE_DIAGNOSIS_INCONCLUSIVE__PROVIDER_BOUNDARY_NOT_PROVEN__STOP_RETRY__IDENTITY_HOLD_0__NO_PROVIDER_READ_BY_DIAGNOSTIC__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V3-CONTROL-PLANE-DIAGNOSIS-20260806.md`;
3. `app/docs/evidence/LIVE-HR-V3-CONTROL-PLANE-DIAGNOSIS-LATEST.json`;
4. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V3-REQUEST-NO-CHECKPOINT-20260806.md`;
5. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
6. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
7. `tools/qa/cxorbia-live-hr-control-plane-journal.mjs`;
8. fuentes y addenda HR viva/observabilidad anteriores como antecedentes congelados;
9. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
10. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
11. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
12. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Identidades Shopper preservadas

```text
profiles=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

Los 13 perfiles residuales permanecen fuera del repair Auth con historia preservada.

## 3. Diagnóstico v3 cerrado

```text
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
run/check suite/job localizado=false
commit statuses=0
WORKFLOW_STARTED_PROVIDER_READS_0=NO OBSERVADO
PROVIDER_READ_BOUNDARY_ENTERED_MAX1=NO OBSERVADO
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
retryExecuted=false
STOP_RETRY=true
```

El listado de runs disponible está limitado a `pull_request`; no demuestra ausencia de un run `push`. El control positivo de status sí confirmó que la consulta de commit statuses recupera estados existentes.

## 4. Regla de interpretación

No afirmar que el run no existió, que `providerReads=0` o que la lectura fue consumida. Solo está probado que no existe evidencia observable de que alcanzara la frontera provider.

No se confirma `2026-08`, GT/HN, mutación histórica ni paridad transversal de `sourceRevision`.

## 5. Estado seguro

```text
request modificado=false
nuevo trigger=0
provider reads por diagnóstico=0
provider/HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

## 6. Siguiente bloque exacto

```text
GATE SOURCE-ONLY DE RECONOCIMIENTO/HABILITACIÓN DE GITHUB ACTIONS
→ comprobar que el workflow está registrado y habilitado
→ no tocar request v3 ni consultar HR
→ no emitir trigger provider
→ cualquier nuevo intento requiere autorización fresca separada
```
