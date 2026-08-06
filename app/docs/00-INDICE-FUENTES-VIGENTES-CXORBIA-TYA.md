# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_LIVE_HR_RUN_REGISTRATION_PROVEN__V2_V3_CANCELLED_BEFORE_STEPS__PROVIDER_READS_0_PROVEN__DIAGNOSTIC_LOOP_CLOSED__NO_TRIGGER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V2-V3-RUNNER-CANCELLATION-20260806.md`;
3. `app/docs/evidence/LIVE-HR-V2-V3-RUNNER-CANCELLATION-ROOT-CAUSE-LATEST.json`;
4. `tools/qa/cxorbia-live-hr-run-consumption-classifier.mjs`;
5. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
6. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
7. `tools/qa/cxorbia-live-hr-control-plane-journal.mjs`;
8. documentos v2/v3 sin checkpoint como antecedentes superados por evidencia de runs reales;
9. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
10. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
11. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
12. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Corrección prevalente

Los diagnósticos que clasificaban el run v2 o v3 como no localizado o su consumo como desconocido quedan superados.

```text
v2 runId=31117638647 jobId=92671263961 cancelled steps=0
v3 runId=31123402722 jobId=92688738677 cancelled steps=0
v2 providerReadConsumption=PROVEN_ZERO_BEFORE_RUNNER_STEPS
v3 providerReadConsumption=PROVEN_ZERO_BEFORE_RUNNER_STEPS
```

La ausencia de commit status ocurrió porque el status inicial depende de un step y ambos jobs fueron cancelados antes de ejecutar cualquier step.

## 3. Workflow y trigger

Quedan comprobados por creación real de runs:

- workflow registrado y reconocido por GitHub;
- evento `push`;
- rama `docs-tya-v6-v71-audit`;
- filtro exacto del request;
- sintaxis aceptada.

No se modificó el workflow ni el request en este bloque.

## 4. Identidades Shopper

```text
profiles=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

SKIP13 e historia permanecen preservados.

## 5. Pendiente real

No está validado todavía:

- periodo `2026-08`;
- tabs GT/HN;
- conteos vivos;
- mutación histórica;
- paridad transversal de `sourceRevision`.

La siguiente acción requiere autorización fresca para una única lectura HR viva. No corresponde otra ronda de diagnóstico del reconocimiento de Actions.

## 6. Estado seguro

```text
request modificado=false
workflow modificado=false
nuevo trigger=0
provider reads del bloque=0
provider/HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```
