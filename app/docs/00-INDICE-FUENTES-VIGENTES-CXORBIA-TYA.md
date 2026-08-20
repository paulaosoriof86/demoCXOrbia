# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260820-I5-EXISTING-CLEAN-PROJECT-PROMOTION-RESTORED-42`  
**Estado:** `I4_FROZEN_PASS__I5_EXISTING_CLEAN_PROJECT_PROMOTION_TOPOLOGY_RESTORED__85_15`

## Orden obligatorio vigente

1. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
2. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
5. `backend/config/cxorbia-production-promotion-contract.json`
6. `SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`
7. addendum prevalente de empalme/carril file-aware y Plan Lock Phase A
8. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`, `CAMBIOS-BACKEND.md` + `CAMBIOS-BACKEND-ADDENDUM-I5-PRODUCTION-TOPOLOGY-RESTORED-20260820.md`, `RESUMEN-PARA-CLAUDE.md` + `RESUMEN-PARA-CLAUDE-ADDENDUM-I5-PRODUCTION-TOPOLOGY-RESTORED-20260820.md`, `PENDIENTES-PROTOTIPO.md` + `PENDIENTES-PROTOTIPO-ADDENDUM-I5-PRODUCTION-TOPOLOGY-RESTORED-20260820.md`
9. `ACADEMIA-ADDENDUM-I5-PRODUCTION-TOPOLOGY-RESTORED-20260820.md` y `ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`
10. PR #7 y HEAD de `docs-tya-v6-v71-audit`

Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## I1–I4 — CERRADOS / NO REPROCESAR

I1 `15/15`, I2 `20/20`, I3 `25/25`, I4 `25/25`: `PASS/FROZEN`. Producto funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No reabrir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas, certificaciones o Academia sin P0 nuevo reproducible.

**Score formal:** **85% / 15% pendiente**. El porcentaje no equivale a producción autorizada.

## I5 — TOPOLOGÍA PRODUCTIVA CANÓNICA RESTAURADA

La decisión autoritativa del 2026-08-06 es:

`PROMOTE_EXISTING_CLEAN_PROJECT`

sobre:

- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev`, región `us-central1`.

El contrato acepta expresamente los identificadores y la URL actuales como producción futura. No exige otro proyecto de producción.

## Separación obligatoria

- `cxorbia-backend-dev`: canonical backend / migration target / production promotion target.
- `cxorbia-tya-dev-260729-c4`: sandbox Corte 4 únicamente.
- `tya-plataforma`: legacy; no reutilizar como backend nuevo; permanece intacto hasta cutover explícito.
- `cxorbia-preprod-20260819`: nunca creado; ruta I5 retirada y no ejecutable.

## Hosting frozen ya probado

Run `32328316954`, artifact `9392151808`:

- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- source exacto `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- `remoteExactByteParity=true`;
- 1 Hosting deploy;
- 0 provider/data/HR/Auth/Storage/Make/Gemini/payment writes.

## Frontera viva

`I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`

Reconciliar contra evidencia terminal actual los seis requisitos del contrato productivo:

1. `LIVE_HR_CURRENT_PERIOD_AND_HISTORY_REVISION_PASS`;
2. `SHOPPER_AUTH_REPAIR_PASS`;
3. `ACCUMULATIVE_MULTIROLE_SMOKE_PASS`;
4. `HUMAN_VALIDATION_PASS`;
5. `ROLLBACK_READY`;
6. `EXPLICIT_CUTOVER_AUTHORIZATION`.

No rerun de I1–I4 por defecto. No crear proyecto PREPROD, no Project Creator, no nueva service account/key/Organization/Folder, no nuevo workflow/rama/PR.

## Seguridad

Estado seguro: 0 proyecto PREPROD nuevo, 0 deploy adicional desde esta corrección, 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes, 0 merge y 0 producción. Legacy intacto.
