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

La rama base `release/cxorbia-tya-rc-20260630` avanzó exclusivamente para inertizar el workflow histórico V156:
- base anterior: `4a85e7e4d0eb31691d7b77e3551ed7cafabb5984`;
- base actual: `fc7ead694ccdb01bee79856d47a761d34c8d88b9`;
- archivo único: `.github/workflows/cxorbia-v156-atomic-promotion.yml`;
- blob inerte: `fe7691a6e53d51ff6a73a5df340541ba84d99594`;
- provider/data/deploy effects: 0.

Esta modificación es control-plane de seguridad, no source/release funcional.

## F0

106 hallazgos clasificados; 24 HOLD/P0 descubiertos acumulativamente; `CP-093` contenido; 23 HOLD residuales; cobertura aún no exhaustiva.

No se permite source/release/provider change mientras `currentMasterPhase=F0_SYSTEMIC_AUDIT`, salvo un nuevo P0 demostrado y autorización específica conforme al plan.

## Próximo

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`.
