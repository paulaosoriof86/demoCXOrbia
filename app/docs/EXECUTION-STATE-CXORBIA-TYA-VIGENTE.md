# EXECUTION STATE CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-EXISTING-CLEAN-PROJECT-PROMOTION-RESTORED-42`  
**OWNER_FRONTIER:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**SUBSTATE:** `I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`  
**PLAN_SCORE:** `85/100`  
**TARGET_AFTER_I5_GO_LIVE:** `100/100`

## Estado ejecutable actual

Repo `paulaosoriof86/demoCXOrbia`, rama `docs-tya-v6-v71-audit`, PR #7 existente/draft/open/no merge. I1–I4 permanecen `PASS/FROZEN` sobre el source funcional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

## Corrección de topología I5 — FUENTE AUTORITATIVA RECUPERADA

El contrato vigente `backend/config/cxorbia-production-promotion-contract.json`, autorizado el 2026-08-06, establece:

- `strategy=PROMOTE_EXISTING_CLEAN_PROJECT`;
- `productionProjectId=cxorbia-backend-dev`;
- `productionHostingTarget=cxorbia-dev`;
- `productionHostingSite=cxorbia-backend-dev`;
- `productionCloudRunService=cxorbia-live-hr-dev`;
- `acceptCurrentIdentifiersAndUrlAsProduction=true`;
- `requiresSeparateProdFiles=false`;
- `legacyProjectReuseForBackend=false`.

`app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md` registró además `PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT` y aceptó expresamente conservar los identificadores técnicos con sufijo `dev` y la URL vigente como producción futura.

## Ambientes canónicos

- **Proyecto limpio canónico / destino de promoción:** `cxorbia-backend-dev`.
- **Hosting ya existente:** `https://cxorbia-backend-dev.web.app`.
- **Sandbox Corte 4:** `cxorbia-tya-dev-260729-c4`; validación técnica únicamente, no destino Phase A.
- **Legacy a retirar tras cutover autorizado:** `tya-plataforma`; no se reutiliza como backend nuevo y permanece intacto hasta el gate final.

`app/core/backend-config.js` confirma `canonicalBackendProjectId=cxorbia-backend-dev`, `migrationTargetProjectId=cxorbia-backend-dev`, `validationSandboxProjectId=cxorbia-tya-dev-260729-c4` y `newCleanProjectRequired=false`.

## Hosting de la build congelada — YA MATERIALIZADO EN EL DESTINO EXISTENTE

`backend/config/i3-11-identity-link-runtime-bridge-rules-hosting-dev.json` registra:

- source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- proyecto/site `cxorbia-backend-dev`;
- target `cxorbia-dev`;
- URL `https://cxorbia-backend-dev.web.app`;
- run `32328316954`, artifact `9392151808`;
- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- `remoteExactByteParity=true`;
- exactamente 1 Hosting deploy;
- 0 writes de datos/HR/Auth/Storage/Make/Gemini/pagos.

## Ruta PREPROD errónea — RETIRADA

El request posterior `backend/config/i5-preprod-provision-hosting-uat-request-v1.json` introdujo `cxorbia-preprod-20260819`, pero ese target contradice el contrato de promoción ya autorizado y la topología canónica actual. El proyecto nunca fue creado (`projectCreatesSucceeded=0`).

Por instrucción actual de Paula y por reconciliación con la fuente autoritativa, **no crear `cxorbia-preprod-20260819`, no pedir Project Creator y no continuar el carril `USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`**. El request consumido queda como evidencia histórica de una ruta descartada, no como frontera ejecutable.

## Gate activo corregido

`I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`

Objetivo: reconciliar, sin reejecutar I1–I4, los seis requisitos del contrato de promoción contra la evidencia cerrada actual:

1. `LIVE_HR_CURRENT_PERIOD_AND_HISTORY_REVISION_PASS`;
2. `SHOPPER_AUTH_REPAIR_PASS`;
3. `ACCUMULATIVE_MULTIROLE_SMOKE_PASS`;
4. `HUMAN_VALIDATION_PASS`;
5. `ROLLBACK_READY`;
6. `EXPLICIT_CUTOVER_AUTHORIZATION`.

Solo los requisitos sin evidencia terminal vigente permanecen pendientes. No se reabre ningún gate frozen por defecto.

## Seguridad

Este bloque es de reconciliación/documentación. No autoriza deploy adicional, provider writes, HR/Firestore/Auth/Rules/Storage writes, Make/Gemini/pagos, merge ni producción. `tya-plataforma` permanece intacta hasta autorización explícita de cutover.
