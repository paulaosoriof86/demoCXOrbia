# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_LIVE_HR_CONTROL_PLANE_OBSERVABILITY_ROOT_FIX_PASS__PREVIOUS_V2_READ_UNKNOWN__NO_NEW_PROVIDER_READ__IDENTITY_HOLD_0__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-LIVE-HR-CONTROL-PLANE-OBSERVABILITY-20260806.md`;
3. `app/docs/evidence/LIVE-HR-CONTROL-PLANE-OBSERVABILITY-ROOT-FIX-LATEST.json`;
4. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
5. `tools/qa/cxorbia-live-hr-control-plane-journal.mjs`;
6. `app/docs/SOURCE-LOCK-C6-LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-20260806.md` — antecedente congelado del request v2;
7. `app/docs/evidence/LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-LATEST.json`;
8. `tools/hr-source/tya-live-provider-registry-identity-dev.mjs`;
9. `tools/hr-source/tya-enforce-live-tab-registry.mjs`;
10. `tools/qa/tya-live-hr-authority-contract.mjs`;
11. `tools/qa/tya-hr-country-tab-consistency-current.mjs`;
12. `tools/qa/cxorbia-august-delta-readonly-plan.mjs`;
13. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
14. `app/docs/evidence/CORTE6-SHOPPER-AUTH-SKIP13-SOURCE-ONLY-PASS-LATEST.json`;
15. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
16. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
17. `AGENTS.md`, PR #7 y HEAD vivo.

Los estados que presentan el diagnóstico de control-plane como pendiente quedan superados por el root fix de observabilidad. El consumo del request v2 anterior sigue desconocido y no debe reinterpretarse como cero.

## 2. Identidades Shopper

```text
profiles=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

Los 13 perfiles residuales permanecen fuera del repair Auth con historia preservada. No bloquean el avance.

## 3. Root fix HR viva source

Permanece aplicado:

- metadata provider para tabs y periodos;
- periodo calendario dinámico;
- registry como cache/last-known-good;
- una sola revisión para país/pestaña y módulos;
- mutación histórica que altera `sourceRevision`;
- timestamps volátiles excluidos de la revisión;
- planner sin conteos HR fijos.

## 4. Root fix de observabilidad control-plane

Commits fuente:

```text
dcbfe1ce4b5a98df9f2cc650dc344f983ed7118f  journal determinístico
c46e81bba4fd7424e6076e336bcaf86e82564c14  workflow con fronteras y artifact
```

Estados nuevos:

```text
WORKFLOW_STARTED_PROVIDER_READS_0
PROVIDER_READ_BOUNDARY_ENTERED_MAX1
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1
FINAL_<JOB_STATUS>_<CONSUMPTION>
```

El workflow exige request v3 y `controlPlaneContract=cxorbia.live-hr-control-plane-journal.v1`. El request v2 anterior queda fail-closed bajo el workflow corregido.

## 5. Antecedente v2 congelado

```text
requestCommit=4e404f2db48ff8b07430d7ac7505eff6c040458a
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
retryExecuted=false
```

Este bloque no consultó HR y no modificó el request.

## 6. Regla de datos prevalente

Toda operación e histórico debe derivarse de HR viva y una `sourceRevision` común. Firestore, snapshots, registries y archivos estáticos son materialización, cache o last-known-good; nunca autoridad permanente.

## 7. Estado seguro

```text
nuevo provider read=0
provider writes=0
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 8. Siguiente bloque exacto

```text
AUTORIZACIÓN FRESCA Y EXPLÍCITA PARA UN REQUEST V3
→ reconocer que el consumo v2 permanece desconocido
→ autorizar una única ejecución lógica provider read-only adicional
→ observar journal/status/artifact
→ confirmar 2026-08 GT/HN, cambio histórico y sourceRevision transversal
→ preparar precheck Auth con HOLD=0
```
