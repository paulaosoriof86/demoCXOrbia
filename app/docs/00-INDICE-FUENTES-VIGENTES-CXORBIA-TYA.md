# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_LIVE_HR_V3_REQUEST_EMITTED__NO_CHECKPOINT_OBSERVED__STOP_RETRY__IDENTITY_HOLD_0__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V3-REQUEST-NO-CHECKPOINT-20260806.md`;
3. `app/docs/evidence/LIVE-HR-V3-REQUEST-NO-CHECKPOINT-LATEST.json`;
4. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
5. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
6. `tools/qa/cxorbia-live-hr-control-plane-journal.mjs`;
7. `app/docs/SOURCE-LOCK-C6-LIVE-HR-CONTROL-PLANE-OBSERVABILITY-20260806.md`;
8. `app/docs/evidence/LIVE-HR-CONTROL-PLANE-OBSERVABILITY-ROOT-FIX-LATEST.json`;
9. `app/docs/SOURCE-LOCK-C6-LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-20260806.md` — antecedente v2;
10. `app/docs/evidence/LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-LATEST.json`;
11. herramientas HR viva y gates de revisión común;
12. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
13. `app/docs/evidence/CORTE6-SHOPPER-AUTH-SKIP13-SOURCE-ONLY-PASS-LATEST.json`;
14. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
16. `AGENTS.md`, PR #7 y HEAD vivo.

Los documentos que presentan el request v3 como pendiente de autorización quedan superados. El request fue emitido, pero no publicó checkpoints; por tanto se aplica `STOP_RETRY` y el consumo permanece desconocido.

## 2. Identidades Shopper

```text
profiles=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

Los 13 perfiles residuales permanecen fuera del repair Auth con historia preservada.

## 3. HR viva y observabilidad preservadas

- metadata provider para tabs y periodos;
- periodo calendario dinámico;
- registry como cache/last-known-good;
- una sola revisión source-safe;
- mutación histórica que debe alterar `sourceRevision`;
- journal v3 con frontera previa al provider.

## 4. Request v3 emitido

```text
sourceCommit=18ea2e6ab9b15480c851c7ba34cae8e8fbcae026
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
authorizationId=chat-20260806-live-hr-authority-current-period-v3-02
controlPlaneContract=cxorbia.live-hr-control-plane-journal.v1
```

Resultado observable:

```text
commit statuses=0
WORKFLOW_STARTED_PROVIDER_READS_0=NO OBSERVADO
provider boundary=NO OBSERVADA
provider sequence=NO OBSERVADA
final checkpoint=NO OBSERVADO
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
retryExecuted=false
STOP_RETRY=true
```

No se afirma provider read cero ni consumido. No se confirma `2026-08`, GT/HN, mutación histórica o paridad transversal.

## 5. Regla de datos prevalente

Toda operación e histórico debe derivarse de HR viva y una `sourceRevision` común. Firestore, snapshots y registries son materialización/cache, nunca autoridad permanente.

## 6. Estado seguro

```text
request v3 emitido=1
segundo trigger=0
provider writes=0
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 7. Siguiente bloque exacto

```text
CONTROL-PLANE/ACTIONS READ-ONLY DIAGNOSIS
→ request d62dbae9
→ localizar run/check suite o probar ausencia antes de provider boundary
→ no tocar request ni consultar HR
→ STOP_RETRY sin segundo intento
```
