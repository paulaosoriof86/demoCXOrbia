# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-HUMAN-OWNER-ROUTE-OBSERVED-BRIDGE-HOLD-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_HUMAN_OWNER_ROUTE_OBSERVED_AUTOMATION_BRIDGE_HOLD`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_SECURE_OWNER_EXECUTION_BRIDGE_UNAVAILABLE`  
**NEXT:** `F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` schema `4.1.0`;
3. master plan V1.1 congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
4. release manifest inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. evidencia provider security `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`;
6. evidencia del intento IAM consumido `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json`;
7. evidencia de ruta humana Owner observada `app/docs/evidence/RC15-F8-HUMAN-OWNER-IAM-ROUTE-LATEST.json`;
8. evidencia F8 Shopper y evidencias terminales F7/F6/F5/F4/F3/M3 conservadas por referencia;
9. fuentes maestras vigentes de continuidad, ejecución directa/empalme, Academia, patrones reutilizables y antidesvío;
10. checkpoint, source lock, progress lock, CAMBIOS/addendum, Claude y Pendientes como mirrors;
11. PR #7 permanece mirror-only, cerrado y no mergeado;
12. resolver HEAD vivo de `docs-tya-v6-v71-audit` antes de escribir.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, deploy, reimport ni sustitución del release ocurrió en este bloque.

## F8 — estado causal actualizado

La ruta automatizada DEV usada por el intento single-use sigue sin `resourcemanager.projects.setIamPolicy`; el intento run `33118612042` quedó consumido, no mutó IAM, no leyó metadata Secret Manager y no puede reproducirse automáticamente.

Nueva evidencia aportada desde Google Cloud Console del proyecto exacto `cxorbia-backend-dev` demuestra que **sí existe una identidad humana con rol `Propietario` / `roles/owner`**. Esto cierra la hipótesis de ausencia total de administrador externo. Por seguridad, no se persiste en el repo el identificador de esa identidad.

El permiso efectivo `resourcemanager.projects.setIamPolicy` no se declara probado únicamente por la captura: una eventual deny policy debe evaluarse en una ejecución autenticada. La búsqueda focalizada de un puente ya existente en el mecanismo actual no encontró GitHub OIDC/Workload Identity Federation ni conector GCP/IAM disponible. Por tanto, el bloqueo ya no es “no existe ruta IAM”, sino **“existe Owner humano pero no existe un puente seguro automatizado para usar esa sesión desde este carril”**.

No se solicita acción manual de Paula en este corte. No crear credenciales, service accounts, WIF, IAM bindings, workflows o accesos como sustituto sin autorización específica.

## PASS preservados

Cloud Run exacto/revisión congelada PASS; Cloud Run IAM readback PASS; `plaintextSensitiveKeyCount=0`; Service Usage 4/4 ENABLED; cuotas 4/4 PASS sin overrides; Shopper runtime actual PASS con 6 visitas propias y HR viva 15 períodos / 30 hojas / 660 visitas / 214 shoppers.

## Estado seguro y siguiente exacto

`PRODUCTION_REAL_READINESS` permanece `95/100`. Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=0; deploy/rebuild/reimport/merge=0.

`F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`.

El master plan V1.1 permanece congelado y no se modifica: este avance ocurre dentro de F8, no cambia la secuencia F8→F9→F10.
