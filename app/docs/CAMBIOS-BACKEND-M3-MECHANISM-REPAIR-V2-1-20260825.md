# CAMBIOS-BACKEND — M3 MECHANISM REPAIR V2.1 — 2026-08-25

**Bloque:** `M3_MECHANISM_SOURCE_ONLY_GATE_CONTRACT_FIX`  
**Phase A:** `98/100`  
**Clasificación:** Reusable CXOrbia + Sin impacto Claude + Sin impacto Academia funcional.

Run `32909450529` demostró que el nuevo gate M3 sí quedó aislado: fue el único workflow push del HEAD, pasó sintaxis y frozen-plan gate, y no ejecutó provider. Falló después en `validate-cxorbia-canonical-authority.js` con `cert_pre_readback_state` porque ese validador aún esperaba literalmente el estado de certificación V1. Esto es un self-mismatch de contrato del gate, no un defecto de producto ni de proveedor.

Archivos tocados en V2.1:
- `tools/continuity/validate-cxorbia-canonical-authority.js`: acepta únicamente los dos estados explícitos y coherentes de certificación (`pending:false` o `MECHANISM_CERTIFIED_PASS:true`), sin bypass genérico.
- `app/docs/evidence/RC15-M3-MECHANISM-CERTIFICATION-LATEST.json`: registra la falla reproducible y su reparación.
- este addendum.

Preservado: master plan, source funcional, frontend, provider, datos, Auth, Firestore, Storage, HR, Rules, Make, Gemini, pagos, deploy y merge. Siguiente único: volver a ejecutar el gate source-only por materialización atómica del fix; no reabrir M1/M2 ni F0.
