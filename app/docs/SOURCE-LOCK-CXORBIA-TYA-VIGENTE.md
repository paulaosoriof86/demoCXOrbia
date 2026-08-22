# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-21  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PHASE_A:** `98/100`

## Fuente funcional y producción

Source funcional validado/congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Source-fix G2-B aislado: `1d2cfecba0a89b637398d747a628e549d9823c68`.

Producción: project `cxorbia-backend-dev`; Hosting `cxorbia-dev` / site `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev` `us-central1`; URL `https://cxorbia-backend-dev.web.app`.

Última recuperación: `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; Cloud Run `cxorbia-live-hr-dev-00010-n78`; Hosting `sites/cxorbia-backend-dev/releases/1787196507030000`. Provider readiness posterior no autoriza ejecución.

## Lock de plan

Único plan operativo: `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`; SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`; Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

El PLAN_CHANGE_REQUEST de emergencia RC15 preservó esta identidad; no cambió source funcional ni release.

## Control-plane base — P0 V156 contenido

La rama base `release/cxorbia-tya-rc-20260630` permanece en `fc7ead694ccdb01bee79856d47a761d34c8d88b9` después de la inertización autorizada del workflow histórico V156. El único otro workflow de esa rama, `cxorbia-resolve-dev-service-account.yml`, quedó clasificado como CP107 read-only sin provider/repo mutation.

## F0 — progreso de exhaustividad

110 hallazgos clasificados; 25 HOLD/P0 descubiertos acumulativamente; CP093 contenido; 24 HOLD residuales.

Dos flags de exhaustividad están demostrados:
- `allWorkflowsClassified=true`;
- `allWorkflowDispatchClassified=true`.

La unión de workflows HEAD/base queda 105/105 clasificada. `.github/cxorbia-firebase-requests` queda 33/33 mapeado.

Permanecen abiertos:
- `allRequestsClassified=false`;
- `allProviderWriteEntrypointsClassified=false`.

Nuevo HOLD CP108: request VIS02B sigue expresando `enabled=true` + 1 Hosting DEV mientras su executor nominal está inerte/consumido. Es deriva de autoridad, no autorización vigente.

No se permite source/release/provider change mientras `currentMasterPhase=F0_SYSTEMIC_AUDIT`, salvo nuevo P0 demostrado y autorización específica conforme al plan.

## Próximo

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`: `backend/config`, `backend/requests`, execute markers, ledgers, aliases y provider-write entrypoints. F1 solo después de 4/4 flags true. G2-B no se toca.
