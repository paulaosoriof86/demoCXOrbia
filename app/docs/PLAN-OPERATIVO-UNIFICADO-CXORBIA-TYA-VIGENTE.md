# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-EXISTING-CLEAN-PROJECT-PROMOTION-RESTORED-42`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Score formal:** `85/100`

## Objetivo

Completar el 15% final hacia go-live sobre la misma build `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, sin reabrir I1–I4, sin nueva candidata/rama/PR y sin crear infraestructura redundante.

## I1–I4 — CERRADOS / FROZEN

I1 `15/15`, I2 `20/20`, I3 `25/25`, I4 `25/25`. Auth/Shopper/Finanzas/multi-proyecto/Academia no se reprocesan por defecto.

## I5 — PREPRODUCTION_AND_GO_LIVE

### I5.1 — TOPOLOGÍA PRODUCTIVA — RESTAURADA

Autoridad vigente:

- `backend/config/cxorbia-production-promotion-contract.json`;
- `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`.

Decisión ya autorizada:

`PROMOTE_EXISTING_CLEAN_PROJECT`

Destino:

- Firebase project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL actual aceptada como producción futura `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev`, región `us-central1`.

El sufijo técnico `dev` se conserva por decisión explícita; no obliga a crear otro proyecto.

### I5.2 — BUILD EXACTA EN HOSTING EXISTENTE — EVIDENCIA PRESERVADA

Run `32328316954`, artifact `9392151808`:

- build `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- `remoteExactByteParity=true`;
- Hosting deploys = 1;
- provider/data writes = 0.

Este PASS se reutiliza; no se ordena otro deploy para demostrar lo ya demostrado.

### I5.3 — PREPROD NUEVO — RUTA DESCARTADA

`cxorbia-preprod-20260819` nunca fue creado. El request I5 que lo introdujo fue posterior al contrato productivo y generó un desvío de topología.

Queda prohibido continuar por:

- creación de `cxorbia-preprod-20260819`;
- Project Creator para ese target;
- `USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`;
- nueva service account/key/Organization/Folder por esta causa.

### I5.4 — PRE-CUTOVER EVIDENCE RECONCILIATION — ACTIVO

Contrato de promoción: seis requisitos previos al cutover:

1. `LIVE_HR_CURRENT_PERIOD_AND_HISTORY_REVISION_PASS`;
2. `SHOPPER_AUTH_REPAIR_PASS`;
3. `ACCUMULATIVE_MULTIROLE_SMOKE_PASS`;
4. `HUMAN_VALIDATION_PASS`;
5. `ROLLBACK_READY`;
6. `EXPLICIT_CUTOVER_AUTHORIZATION`.

Regla de ejecución:

- mapear cada requisito a evidencia terminal vigente;
- reutilizar I1–I4 frozen donde sean equivalentes y suficientes;
- no volver a ejecutar Shopper/Auth/Finanzas/HR/runtime por nomenclatura histórica distinta;
- solo una ausencia de evidencia terminal real puede abrir un gate focalizado;
- producción/cutover permanece cerrado hasta autorización explícita.

Gate actual:

`I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`

### I5.5 — PRODUCTION GO/NO-GO

Permanece cerrado. Cuando la reconciliación confirme los gates técnicos/humanos previos, el único paso mutable final se somete al gate explícito de cutover. `tya-plataforma` se mantiene intacta hasta entonces y no se usa como backend nuevo.

## Ambientes preservados

- `cxorbia-backend-dev`: canonical backend / promotion target.
- `cxorbia-tya-dev-260729-c4`: sandbox Corte 4 únicamente.
- `tya-plataforma`: legacy activo hasta cutover explícito.

## Circuit breaker

- No nueva candidata/rama/PR/workflow.
- No nuevo proyecto Firebase para I5.
- No Project Creator.
- No reabrir I1–I4.
- No deploy adicional por defecto.
- No provider business writes, Make/Gemini/pagos, merge o producción sin gate/autorización.

## Verdad financiera congelada

Mayo 44/44 pagadas. Junio 2/44 pagadas + 42 pendientes + Q451. `liquidada != pagada`.
