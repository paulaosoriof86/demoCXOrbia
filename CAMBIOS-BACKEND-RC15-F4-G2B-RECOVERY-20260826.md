# CAMBIOS-BACKEND — RC15 F4 G2-B RECOVERY — 2026-08-26

**Bloque:** `F4_G2B_RECOVERY_ONE_SHOT`  
**Estado de entrada:** `AUTHORIZED_MECHANISM_P0_REPAIRED_PENDING_EXECUTION`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `76/100`

## Hallazgo de entrada y causa

Antes de consumir el lease se verificó que `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml` seguía `HISTORICAL_INERT_M3`, mientras el mismo workflow en el source-fix `1d2cfecba0a89b637398d747a628e549d9823c68` demuestra el ejecutor previamente operativo Cloud Build → Cloud Run → smoke → Hosting → post-readback. Esto impide que F4 consuma la nueva autoridad F3 y se clasifica `MECHANISM_P0`, no `PRODUCT_P0`.

## Reparación focal

- Se reutiliza el mismo workflow existente; no se crea otra ruta.
- Se elimina la autoridad histórica y se exige `PROVIDER_PROMOTION_MECHANISM_V1` blob `f1c265164b7bc697ecb5cd9b247c334afd76a5f2`.
- Release authorization: `F4-G2B-RECOVERY-20260826-01`, derivada de la instrucción vigente de Paula `continúa con el siguiente bloque`.
- Provider mutation lease: `F4-G2B-PROVIDER-LEASE-20260826-01`, single-use, emitido/no consumido.
- Source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; source-fix/release pin exacto: `1d2cfecba0a89b637398d747a628e549d9823c68`.
- Preflight provider es read-only y exige revisión inicial `cxorbia-live-hr-dev-00011-f2f`, identidad de proyecto/servicio y cero residuo sintético.
- El lease se consume en un commit canónico inmediatamente antes del primer Cloud Build; si el preflight falla, permanece sin consumir.
- El build usa el source-fix exacto; Cloud Run debe usar digest exacto; Hosting se despliega desde el mismo source-fix; post-readback exige cero datos/Auth sintéticos creados durante recovery.

## Budget y seguridad

Máximo: Cloud Build=1, Cloud Run update=1, Hosting deploy=1. Firestore/Auth/Storage/HR externa/datos reales/credenciales reales/pagos/Rules/Make/Gemini/merge=0. Retry automático=0. Rollback conocido `cxorbia-live-hr-dev-00011-f2f`, no automático sin autorización separada.

Hasta iniciar el run: provider reads=0, provider writes=0, deploys=0, lease consumed=false.

## Clasificación

- **Reusable CXOrbia:** lease single-use consumido en mutation boundary, source pin, exact digest, drift gate, fail-closed.
- **Exclusivo TyA:** proyecto `cxorbia-backend-dev`, G2-B y Cinépolis.
- **Claude/prototipo:** sin cambio funcional frontend.
- **Academia:** sin impacto funcional en reparación de carril.
- **Sin impacto Claude:** workflow/control-plane/evidence/docs.

## Siguiente exacto

`F4_G2B_ONE_SHOT_EXECUTION`. El porcentaje solo sube a 81 si el run y provider post-readback terminan `RECOVERY_PASS_FULL`.
