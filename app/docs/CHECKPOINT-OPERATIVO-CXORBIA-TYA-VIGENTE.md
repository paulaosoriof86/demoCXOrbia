# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-PROVIDER-SECURITY-IAM-HOLD-01`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_PROVIDER_SECURITY_IAM_READ_CAPABILITY`  
**NEXT:** `F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_EXPLICIT_AUTHORIZATION_REQUIRED`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` permanece exacto: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`, Cloud Run `cxorbia-live-hr-dev-00013-rns`, image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`, Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`, Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

## F8 read-only — cierre causal actual

Evidencia: `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`.

Run `33117362096`, job `98675327470`, artifact `9665056200`, digest `sha256:7fb13d6565df3fa8af147e1121b39bf1dff5098947d8734fcc3fb1fdc0303517`.

PASS fresco:
- Shopper exacto otra vez confirmado: 6 visitas propias, 15 períodos, 660 visitas, 214 shoppers, cero duplicados;
- Cloud Run exacto en revision congelada;
- Cloud Run IAM leído;
- `plaintextSensitiveKeyCount=0`; los dos nombres `TOKEN_SHA256`/`TOKEN_EXPIRES_AT` son metadata derivada y no secreto crudo;
- Service Usage 4/4 `ENABLED`;
- quotas 4/4 PASS sin overrides.

HOLD único: Secret Manager está habilitado, pero la única credencial DEV disponible carece de `secretmanager.secrets.list`. Las dos rutas de credencial alterna históricas no están presentes en Actions. No se leyó ni exportó ningún payload de secreto.

Clasificación: `MECHANISM_P0_STOP_PROVIDER_IAM_READ_CAPABILITY`; `productP0Proven=false`.

## Estado seguro

Provider writes=0; Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini/data writes=0; deploy/rebuild/reimport/merge=0. El porcentaje permanece `95/100`.

## Siguiente exacto

`WAIT_FOR_EXPLICIT_F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_AUTHORIZATION`.

La autorización requerida es exclusivamente para un grant IAM temporal mínimo, metadata readback exacto y revocación posterior. Ninguna otra mutación F8 queda autorizada por ese permiso.
