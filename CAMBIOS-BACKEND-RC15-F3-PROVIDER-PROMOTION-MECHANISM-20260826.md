# CAMBIOS-BACKEND — RC15 F3 PROVIDER PROMOTION MECHANISM — 2026-08-26

**Bloque:** `M4_F3_PROVIDER_PROMOTION_MECHANISM_AND_G2B_RECOVERY_LANE_READONLY_CERTIFICATION`  
**Estado:** `CLOSED_PASS`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `76/100`

## Qué se hizo

- Se materializó el contrato canónico `PROVIDER_PROMOTION_MECHANISM_V1` desde el blob Git `f1c265164b7bc697ecb5cd9b247c334afd76a5f2`.
- Se agregó verificador determinista de F3 y evidencia `RC15-F3-PROVIDER-PROMOTION-MECHANISM-LATEST.json`.
- Se certificó en modo read-only `G2B_PROVIDER_PROMOTION_MECHANISM_PASS` + `G2B_RECOVERY_LANE_PASS`.
- Se sincronizaron continuity lock, índice, checkpoint, progress lock, Claude y Pendientes.

## Protecciones congeladas

Preflight `READ_ONLY` fail-closed; release/recovery authorization separada de `PROVIDER_MUTATION_LEASE`; lease single-use no emitido; `NO_OP_ALREADY_PROMOTED` sin consumir lease/retry; ambigüedad fail-closed sin autofix; rollback `cxorbia-live-hr-dev-00011-f2f`; retry futuro máximo 1 únicamente después de autorización explícita vigente.

## Seguridad

Provider writes=0; deploys=0; G2-B attempts=0; Firestore/Auth/Storage/HR/Rules/Make/Gemini/pagos=0; merge=0; frontend funcional=0. Source funcional preservado `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. PR #7 cerrado/no mergeado.

## Clasificación

- **Reusable CXOrbia:** contrato provider-promotion, lease single-use, fail-closed, idempotencia, rollback y taxonomía causal.
- **Exclusivo cliente:** G2-B, proyecto Firebase DEV TyA y revisión Cloud Run `cxorbia-live-hr-dev-00011-f2f`.
- **Claude/prototipo:** sin cambio UI.
- **Academia:** sin impacto funcional en F3.
- **Sin impacto Claude:** control-plane, gates, evidence y documentación.

## Siguiente exacto

`G2-B_WAITING_EXPLICIT_AUTHORIZATION`. No emitir lease ni ejecutar F4 hasta nueva autorización explícita.
